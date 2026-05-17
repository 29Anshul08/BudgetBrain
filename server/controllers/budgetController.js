const Budget = require('../models/Budget');
const { validationResult } = require('express-validator');

// @desc    Get budgets for current month/year
// @route   GET /api/budgets
exports.getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const queryMonth = parseInt(month) || now.getMonth() + 1;
    const queryYear = parseInt(year) || now.getFullYear();

    const budgets = await Budget.find({
      user: req.user.id,
      month: queryMonth,
      year: queryYear,
    }).sort('category');

    res.json({ success: true, data: budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budgets
exports.createBudget = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { category, limit, month, year, color, icon, alertThreshold } = req.body;
    const now = new Date();
    const budgetMonth = month || now.getMonth() + 1;
    const budgetYear = year || now.getFullYear();

    // Check for duplicate
    const existing = await Budget.findOne({
      user: req.user.id,
      category,
      month: budgetMonth,
      year: budgetYear,
    });

    if (existing) {
      return res.status(400).json({ error: `Budget for ${category} already exists this month` });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      limit,
      month: budgetMonth,
      year: budgetYear,
      color: color || '#6366f1',
      icon: icon || '💰',
      alertThreshold: alertThreshold || 80,
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
exports.updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedBudget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget alerts (budgets over threshold)
// @route   GET /api/budgets/alerts
exports.getBudgetAlerts = async (req, res, next) => {
  try {
    const now = new Date();
    const budgets = await Budget.find({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    const alerts = budgets
      .filter((b) => b.percentSpent >= b.alertThreshold)
      .map((b) => ({
        id: b._id,
        category: b.category,
        limit: b.limit,
        spent: b.spent,
        percentSpent: b.percentSpent,
        status: b.status,
        icon: b.icon,
      }));

    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

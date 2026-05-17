const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { validationResult } = require('express-validator');

// @desc    Get all transactions
// @route   GET /api/transactions
exports.getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      startDate,
      endDate,
      search,
      sort = '-date',
    } = req.query;

    const query = { user: req.user.id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
exports.createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const transactionData = { ...req.body, user: req.user.id };
    const transaction = await Transaction.create(transactionData);

    // Update budget spent amount if it's an expense
    if (transaction.type === 'expense') {
      const date = new Date(transaction.date);
      await Budget.findOneAndUpdate(
        {
          user: req.user.id,
          category: transaction.category,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
        { $inc: { spent: transaction.amount } }
      );
    }

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
exports.updateTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const oldAmount = transaction.amount;
    const oldType = transaction.type;
    const oldCategory = transaction.category;
    const oldDate = new Date(transaction.date);

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update budget if expense amount or category changed
    if (oldType === 'expense') {
      await Budget.findOneAndUpdate(
        {
          user: req.user.id,
          category: oldCategory,
          month: oldDate.getMonth() + 1,
          year: oldDate.getFullYear(),
        },
        { $inc: { spent: -oldAmount } }
      );
    }

    if (transaction.type === 'expense') {
      const newDate = new Date(transaction.date);
      await Budget.findOneAndUpdate(
        {
          user: req.user.id,
          category: transaction.category,
          month: newDate.getMonth() + 1,
          year: newDate.getFullYear(),
        },
        { $inc: { spent: transaction.amount } }
      );
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update budget if it was an expense
    if (transaction.type === 'expense') {
      const date = new Date(transaction.date);
      await Budget.findOneAndUpdate(
        {
          user: req.user.id,
          category: transaction.category,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
        { $inc: { spent: -transaction.amount } }
      );
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction categories
// @route   GET /api/transactions/categories/list
exports.getCategories = async (req, res, next) => {
  try {
    const incomeCategories = [
      'Salary', 'Freelance', 'Investments', 'Rental Income', 'Business', 'Dividends', 'Gifts', 'Other Income',
    ];
    const expenseCategories = [
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities',
      'Healthcare', 'Education', 'Travel', 'Groceries', 'Rent', 'Insurance', 'Personal Care',
      'Fitness', 'Subscriptions', 'Gifts & Donations', 'Home', 'Pets', 'Other',
    ];

    res.json({
      success: true,
      data: { income: incomeCategories, expense: expenseCategories },
    });
  } catch (error) {
    next(error);
  }
};

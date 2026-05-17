const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { analyzeSpending, generateBudgetPlan, getFinancialAdvice, chatWithAI, generateMonthlyReport, predictSpending, detectAnomalies } = require('../services/geminiService');

// @desc    Get AI spending insights
// @route   GET /api/ai/insights
exports.getInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort('-date');

    if (transactions.length === 0) {
      return res.json({
        success: true,
        data: {
          insights: ['Add some transactions to get AI-powered insights!'],
          suggestions: ['Start tracking your expenses to unlock personalized financial advice.'],
        },
      });
    }

    const insights = await analyzeSpending(transactions, req.user.currency);
    res.json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI budget plan
// @route   GET /api/ai/budget-plan
exports.getBudgetPlan = async (req, res, next) => {
  try {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const transactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: threeMonthsAgo },
    }).sort('-date');

    const budgets = await Budget.find({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    const plan = await generateBudgetPlan(transactions, budgets, req.user);
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Chat
// @route   POST /api/ai/chat
exports.chat = async (req, res, next) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user's recent financial data for context
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const recentTransactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: startOfMonth },
    }).sort('-date').limit(20);

    const budgets = await Budget.find({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    const response = await chatWithAI(message, recentTransactions, budgets, req.user, context);
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly AI report
// @route   GET /api/ai/monthly-report
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const reportMonth = parseInt(month) || now.getMonth() + 1;
    const reportYear = parseInt(year) || now.getFullYear();

    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate },
    }).sort('-date');

    const budgets = await Budget.find({
      user: req.user.id,
      month: reportMonth,
      year: reportYear,
    });

    const report = await generateMonthlyReport(transactions, budgets, req.user, reportMonth, reportYear);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// @desc    Predict future spending
// @route   GET /api/ai/predict
exports.predictSpendingPatterns = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: sixMonthsAgo },
    }).sort('-date');

    const predictions = await predictSpending(transactions, req.user.currency);
    res.json({ success: true, data: predictions });
  } catch (error) {
    next(error);
  }
};

// @desc    Detect unusual expenses
// @route   GET /api/ai/anomalies
exports.detectUnusualExpenses = async (req, res, next) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      date: { $gte: threeMonthsAgo },
    }).sort('-date');

    const anomalies = await detectAnomalies(transactions, req.user.currency);
    res.json({ success: true, data: anomalies });
  } catch (error) {
    next(error);
  }
};

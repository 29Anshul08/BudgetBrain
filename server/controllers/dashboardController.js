const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get dashboard data
// @route   GET /api/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const userId = req.user.id;

    // Current month income & expense
    const monthlyTotals = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const income = monthlyTotals.find((t) => t._id === 'income')?.total || 0;
    const expenses = monthlyTotals.find((t) => t._id === 'expense')?.total || 0;
    const incomeCount = monthlyTotals.find((t) => t._id === 'income')?.count || 0;
    const expenseCount = monthlyTotals.find((t) => t._id === 'expense')?.count || 0;

    // All-time balance
    const allTimeTotals = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    const totalIncome = allTimeTotals.find((t) => t._id === 'income')?.total || 0;
    const totalExpenses = allTimeTotals.find((t) => t._id === 'expense')?.total || 0;
    const balance = totalIncome - totalExpenses;

    // Category breakdown for current month
    const categoryBreakdown = await Transaction.getCategoryTotals(
      userId, 'expense', startOfMonth, endOfMonth
    );

    // Monthly trends (last 6 months)
    const monthlyTrends = await Transaction.getMonthlyTotals(userId, 6);

    // Process monthly trends into chart format
    const trendMap = {};
    monthlyTrends.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!trendMap[key]) {
        trendMap[key] = { month: key, income: 0, expense: 0 };
      }
      trendMap[key][item._id.type] = item.total;
    });
    const trends = Object.values(trendMap).sort((a, b) => a.month.localeCompare(b.month));

    // Recent transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort('-date')
      .limit(5);

    // Budget overview
    const budgets = await Budget.find({
      user: userId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
    const totalBudgetSpent = budgets.reduce((acc, b) => acc + b.spent, 0);

    // Financial health score (0-100)
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    const budgetAdherence = totalBudgetLimit > 0 
      ? Math.max(0, 100 - ((totalBudgetSpent / totalBudgetLimit) * 100 - 100)) 
      : 100;
    const healthScore = Math.round(
      (Math.min(100, Math.max(0, savingsRate)) * 0.4) +
      (Math.min(100, budgetAdherence) * 0.3) +
      (income > 0 ? 30 : 0)
    );

    res.json({
      success: true,
      data: {
        balance,
        monthlyIncome: income,
        monthlyExpenses: expenses,
        monthlySavings: income - expenses,
        incomeCount,
        expenseCount,
        totalIncome,
        totalExpenses,
        categoryBreakdown: categoryBreakdown.map((c) => ({
          name: c._id,
          value: c.total,
          count: c.count,
        })),
        trends,
        recentTransactions,
        budgetOverview: {
          total: budgets.length,
          totalLimit: totalBudgetLimit,
          totalSpent: totalBudgetSpent,
          budgets: budgets.map((b) => ({
            id: b._id,
            category: b.category,
            limit: b.limit,
            spent: b.spent,
            percentSpent: b.percentSpent,
            status: b.status,
            icon: b.icon,
            color: b.color,
          })),
        },
        healthScore,
        savingsRate: Math.round(savingsRate),
      },
    });
  } catch (error) {
    next(error);
  }
};

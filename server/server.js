const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: '../.env.example' });
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../.env' });
}
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Auto-seed demo data for in-memory DB
const autoSeed = async () => {
  const User = require('./models/User');
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('🌱 No users found — seeding demo data...');

    // Create demo user
    const user = await User.create({
      name: 'Alex Johnson',
      email: 'demo@budgetbrain.com',
      password: 'demo123456',
      currency: 'INR',
      monthlyIncome: 85000,
      theme: 'dark',
    });

    const Transaction = require('./models/Transaction');
    const Budget = require('./models/Budget');
    const now = new Date();
    const transactions = [];

    const expenseCats = [
      { category: 'Food & Dining', range: [200, 1500], freq: 12 },
      { category: 'Transportation', range: [100, 800], freq: 8 },
      { category: 'Shopping', range: [500, 5000], freq: 4 },
      { category: 'Entertainment', range: [200, 2000], freq: 3 },
      { category: 'Bills & Utilities', range: [500, 3000], freq: 3 },
      { category: 'Healthcare', range: [200, 2000], freq: 2 },
      { category: 'Groceries', range: [500, 3000], freq: 6 },
      { category: 'Rent', range: [15000, 15000], freq: 1 },
      { category: 'Subscriptions', range: [100, 500], freq: 3 },
      { category: 'Personal Care', range: [200, 1000], freq: 2 },
      { category: 'Fitness', range: [500, 2000], freq: 1 },
    ];

    const descs = {
      'Food & Dining': ['Zomato order', 'Swiggy delivery', 'Restaurant lunch', 'Coffee shop', 'Dinner out'],
      'Transportation': ['Uber ride', 'Metro recharge', 'Ola cab', 'Fuel', 'Auto rickshaw'],
      'Shopping': ['Amazon purchase', 'Myntra order', 'Flipkart deal', 'Electronics'],
      'Entertainment': ['Netflix', 'Movie tickets', 'Gaming', 'Concert'],
      'Bills & Utilities': ['Electricity bill', 'Internet bill', 'Phone recharge', 'Water bill'],
      'Healthcare': ['Doctor visit', 'Medicines', 'Lab tests'],
      'Groceries': ['BigBasket order', 'Supermarket', 'Weekly groceries', 'Blinkit'],
      'Rent': ['Monthly rent'],
      'Subscriptions': ['Netflix', 'YouTube Premium', 'Spotify'],
      'Personal Care': ['Haircut', 'Skincare', 'Salon'],
      'Fitness': ['Gym membership', 'Yoga class'],
    };
    const methods = ['cash', 'credit_card', 'debit_card', 'upi', 'bank_transfer', 'wallet'];

    for (let mo = 5; mo >= 0; mo--) {
      const mDate = new Date(now.getFullYear(), now.getMonth() - mo, 1);
      const dim = new Date(mDate.getFullYear(), mDate.getMonth() + 1, 0).getDate();

      // Salary
      transactions.push({
        user: user._id, type: 'income',
        amount: 80000 + Math.floor(Math.random() * 10000),
        category: 'Salary', description: 'Monthly salary',
        date: new Date(mDate.getFullYear(), mDate.getMonth(), 1),
        paymentMethod: 'bank_transfer',
      });

      // Freelance (60%)
      if (Math.random() > 0.4) {
        transactions.push({
          user: user._id, type: 'income',
          amount: 5000 + Math.floor(Math.random() * 20000),
          category: 'Freelance', description: 'Freelance project',
          date: new Date(mDate.getFullYear(), mDate.getMonth(), 10 + Math.floor(Math.random() * 15)),
          paymentMethod: 'bank_transfer',
        });
      }

      for (const cat of expenseCats) {
        const n = Math.max(1, Math.floor(cat.freq * (0.7 + Math.random() * 0.6)));
        for (let i = 0; i < n; i++) {
          const day = Math.min(dim, 1 + Math.floor(Math.random() * dim));
          const amt = cat.range[0] + Math.floor(Math.random() * (cat.range[1] - cat.range[0]));
          const dl = descs[cat.category] || ['Expense'];
          transactions.push({
            user: user._id, type: 'expense', amount: amt,
            category: cat.category,
            description: dl[Math.floor(Math.random() * dl.length)],
            date: new Date(mDate.getFullYear(), mDate.getMonth(), day),
            paymentMethod: methods[Math.floor(Math.random() * methods.length)],
          });
        }
      }
    }

    await Transaction.insertMany(transactions);

    // Calculate spending for current month budgets
    const catSpend = {};
    transactions.forEach((t) => {
      if (t.type === 'expense') {
        const d = new Date(t.date);
        if (d.getMonth() + 1 === now.getMonth() + 1 && d.getFullYear() === now.getFullYear()) {
          catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
        }
      }
    });

    const budgetConfigs = [
      { category: 'Food & Dining', limit: 12000, icon: '🍕', color: '#f97316' },
      { category: 'Transportation', limit: 5000, icon: '🚗', color: '#3b82f6' },
      { category: 'Shopping', limit: 8000, icon: '🛍️', color: '#ec4899' },
      { category: 'Entertainment', limit: 5000, icon: '🎬', color: '#8b5cf6' },
      { category: 'Bills & Utilities', limit: 6000, icon: '💡', color: '#eab308' },
      { category: 'Groceries', limit: 10000, icon: '🛒', color: '#22c55e' },
      { category: 'Rent', limit: 15000, icon: '🏠', color: '#6366f1' },
    ];

    await Budget.insertMany(budgetConfigs.map((c) => ({
      user: user._id, category: c.category, limit: c.limit,
      spent: catSpend[c.category] || 0,
      month: now.getMonth() + 1, year: now.getFullYear(),
      icon: c.icon, color: c.color, alertThreshold: 80,
    })));

    console.log(`✅ Demo data seeded: ${transactions.length} transactions, ${budgetConfigs.length} budgets`);
    console.log('📧 Login: demo@budgetbrain.com / demo123456');
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  await autoSeed();

  app.listen(PORT, () => {
    console.log(`🧠 BudgetBrain server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

module.exports = app;

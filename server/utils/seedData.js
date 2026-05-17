const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });
dotenv.config({ path: '../.env.example' });
dotenv.config();

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/budgetbrain');
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const user = await User.create({
      name: 'Alex Johnson',
      email: 'demo@budgetbrain.com',
      password: 'demo123456',
      currency: 'INR',
      monthlyIncome: 85000,
      theme: 'dark',
    });
    console.log('👤 Demo user created: demo@budgetbrain.com / demo123456');

    // Generate transactions for the last 6 months
    const now = new Date();
    const transactions = [];

    const incomeCategories = [
      { category: 'Salary', range: [75000, 85000], frequency: 'monthly' },
      { category: 'Freelance', range: [5000, 25000], frequency: 'random' },
      { category: 'Investments', range: [1000, 5000], frequency: 'random' },
      { category: 'Dividends', range: [500, 3000], frequency: 'random' },
    ];

    const expenseCategories = [
      { category: 'Food & Dining', range: [200, 1500], frequency: 15 },
      { category: 'Transportation', range: [100, 800], frequency: 10 },
      { category: 'Shopping', range: [500, 5000], frequency: 5 },
      { category: 'Entertainment', range: [200, 2000], frequency: 4 },
      { category: 'Bills & Utilities', range: [500, 3000], frequency: 3 },
      { category: 'Healthcare', range: [200, 2000], frequency: 2 },
      { category: 'Education', range: [1000, 5000], frequency: 1 },
      { category: 'Groceries', range: [500, 3000], frequency: 8 },
      { category: 'Rent', range: [15000, 15000], frequency: 1 },
      { category: 'Subscriptions', range: [100, 500], frequency: 3 },
      { category: 'Personal Care', range: [200, 1000], frequency: 3 },
      { category: 'Fitness', range: [500, 2000], frequency: 2 },
      { category: 'Travel', range: [2000, 15000], frequency: 1 },
    ];

    const descriptions = {
      'Food & Dining': ['Lunch at restaurant', 'Coffee shop', 'Dinner with friends', 'Zomato order', 'Swiggy delivery', 'Street food', 'Business lunch'],
      'Transportation': ['Uber ride', 'Metro card recharge', 'Fuel', 'Ola cab', 'Auto rickshaw', 'Rapido bike'],
      'Shopping': ['Amazon purchase', 'Myntra order', 'Flipkart deal', 'Electronics', 'Clothes shopping', 'Home decor'],
      'Entertainment': ['Netflix subscription', 'Movie tickets', 'Concert tickets', 'Gaming', 'BookMyShow', 'Spotify premium'],
      'Bills & Utilities': ['Electricity bill', 'Internet bill', 'Phone recharge', 'Water bill', 'Gas bill', 'DTH recharge'],
      'Healthcare': ['Doctor consultation', 'Medicines', 'Lab tests', 'Insurance premium', 'Dental checkup'],
      'Education': ['Online course', 'Books', 'Udemy course', 'Certification exam', 'Workshop fee'],
      'Groceries': ['Big Basket order', 'Supermarket', 'Weekly groceries', 'Blinkit order', 'Zepto delivery'],
      'Rent': ['Monthly rent'],
      'Subscriptions': ['Netflix', 'YouTube Premium', 'Notion', 'Cloud storage', 'Gym membership'],
      'Personal Care': ['Haircut', 'Skincare products', 'Salon visit', 'Grooming kit'],
      'Fitness': ['Gym membership', 'Yoga class', 'Sports equipment', 'Protein supplements'],
      'Travel': ['Flight tickets', 'Hotel booking', 'Travel expenses', 'Vacation trip'],
      'Salary': ['Monthly salary'],
      'Freelance': ['Freelance project payment', 'Client payment', 'Consulting fee'],
      'Investments': ['Stock dividend', 'Mutual fund return', 'FD interest'],
      'Dividends': ['Quarterly dividend', 'Stock dividend payout'],
    };

    const paymentMethods = ['cash', 'credit_card', 'debit_card', 'upi', 'bank_transfer', 'wallet'];

    // Generate 6 months of data
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

      // Add salary (income)
      transactions.push({
        user: user._id,
        type: 'income',
        amount: 80000 + Math.floor(Math.random() * 10000),
        category: 'Salary',
        description: 'Monthly salary',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
        paymentMethod: 'bank_transfer',
      });

      // Random freelance income (60% chance)
      if (Math.random() > 0.4) {
        transactions.push({
          user: user._id,
          type: 'income',
          amount: 5000 + Math.floor(Math.random() * 20000),
          category: 'Freelance',
          description: descriptions['Freelance'][Math.floor(Math.random() * descriptions['Freelance'].length)],
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 10 + Math.floor(Math.random() * 15)),
          paymentMethod: 'bank_transfer',
        });
      }

      // Investment income (40% chance)
      if (Math.random() > 0.6) {
        transactions.push({
          user: user._id,
          type: 'income',
          amount: 1000 + Math.floor(Math.random() * 4000),
          category: 'Investments',
          description: descriptions['Investments'][Math.floor(Math.random() * descriptions['Investments'].length)],
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15 + Math.floor(Math.random() * 10)),
          paymentMethod: 'bank_transfer',
        });
      }

      // Generate expenses
      for (const cat of expenseCategories) {
        const numTransactions = Math.max(1, Math.floor(cat.frequency * (0.7 + Math.random() * 0.6)));
        for (let i = 0; i < numTransactions; i++) {
          const day = Math.min(daysInMonth, 1 + Math.floor(Math.random() * daysInMonth));
          const amount = cat.range[0] + Math.floor(Math.random() * (cat.range[1] - cat.range[0]));
          const descList = descriptions[cat.category] || ['Expense'];

          transactions.push({
            user: user._id,
            type: 'expense',
            amount,
            category: cat.category,
            description: descList[Math.floor(Math.random() * descList.length)],
            date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            tags: Math.random() > 0.7 ? ['essential'] : Math.random() > 0.5 ? ['discretionary'] : [],
          });
        }
      }
    }

    await Transaction.insertMany(transactions);
    console.log(`💰 Created ${transactions.length} transactions`);

    // Create budgets for current month
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Calculate actual spending per category for budget spent values
    const categorySpending = {};
    transactions.forEach((t) => {
      if (t.type === 'expense') {
        const tDate = new Date(t.date);
        if (tDate.getMonth() + 1 === currentMonth && tDate.getFullYear() === currentYear) {
          categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
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
      { category: 'Healthcare', limit: 3000, icon: '🏥', color: '#ef4444' },
      { category: 'Rent', limit: 15000, icon: '🏠', color: '#6366f1' },
      { category: 'Subscriptions', limit: 2000, icon: '📱', color: '#14b8a6' },
    ];

    const budgets = budgetConfigs.map((config) => ({
      user: user._id,
      category: config.category,
      limit: config.limit,
      spent: categorySpending[config.category] || 0,
      month: currentMonth,
      year: currentYear,
      icon: config.icon,
      color: config.color,
      alertThreshold: 80,
    }));

    await Budget.insertMany(budgets);
    console.log(`📊 Created ${budgets.length} budgets`);

    console.log('\n✅ Seed data created successfully!');
    console.log('📧 Login: demo@budgetbrain.com');
    console.log('🔑 Password: demo123456\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();

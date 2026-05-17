const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: [true, 'Please specify transaction type'],
    enum: ['income', 'expense'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0.01, 'Amount must be positive'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: '',
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', null],
    default: null,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: '',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'upi', 'bank_transfer', 'wallet', 'other'],
    default: 'other',
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });

// Static method to get category totals
transactionSchema.statics.getCategoryTotals = async function (userId, type, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

// Static method to get monthly totals
transactionSchema.statics.getMonthlyTotals = async function (userId, months = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);

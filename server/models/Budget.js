const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
  },
  limit: {
    type: Number,
    required: [true, 'Please provide a budget limit'],
    min: [1, 'Budget limit must be at least 1'],
  },
  spent: {
    type: Number,
    default: 0,
    min: 0,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: '#6366f1',
  },
  icon: {
    type: String,
    default: '💰',
  },
  alertThreshold: {
    type: Number,
    default: 80, // Alert when 80% spent
    min: 0,
    max: 100,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Compound index
budgetSchema.index({ user: 1, month: 1, year: 1 });
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

// Virtual for percentage spent
budgetSchema.virtual('percentSpent').get(function () {
  return this.limit > 0 ? Math.round((this.spent / this.limit) * 100) : 0;
});

// Virtual for remaining
budgetSchema.virtual('remaining').get(function () {
  return Math.max(0, this.limit - this.spent);
});

// Virtual for status
budgetSchema.virtual('status').get(function () {
  const percent = this.percentSpent;
  if (percent >= 100) return 'exceeded';
  if (percent >= this.alertThreshold) return 'warning';
  if (percent >= 50) return 'moderate';
  return 'good';
});

// Ensure virtuals are included in JSON
budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);

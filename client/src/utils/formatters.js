/**
 * Format currency amount
 */
export const formatCurrency = (amount, currency = 'INR') => {
  const locales = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    AUD: 'en-AU',
    CAD: 'en-CA',
  };

  return new Intl.NumberFormat(locales[currency] || 'en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  if (format === 'short') {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (format === 'relative') {
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  return d.toLocaleDateString();
};

/**
 * Format large numbers with abbreviations
 */
export const formatNumber = (num) => {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * Category icons
 */
export const categoryIcons = {
  'Food & Dining': '🍕',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Bills & Utilities': '💡',
  'Healthcare': '🏥',
  'Education': '📚',
  'Travel': '✈️',
  'Groceries': '🛒',
  'Rent': '🏠',
  'Insurance': '🛡️',
  'Personal Care': '💄',
  'Fitness': '💪',
  'Subscriptions': '📱',
  'Gifts & Donations': '🎁',
  'Home': '🏡',
  'Pets': '🐾',
  'Other': '📦',
  'Salary': '💰',
  'Freelance': '💻',
  'Investments': '📈',
  'Rental Income': '🏢',
  'Business': '🏪',
  'Dividends': '💵',
  'Gifts': '🎀',
  'Other Income': '💎',
};

/**
 * Category colors
 */
export const categoryColors = {
  'Food & Dining': '#f97316',
  'Transportation': '#3b82f6',
  'Shopping': '#ec4899',
  'Entertainment': '#8b5cf6',
  'Bills & Utilities': '#eab308',
  'Healthcare': '#ef4444',
  'Education': '#6366f1',
  'Travel': '#0ea5e9',
  'Groceries': '#22c55e',
  'Rent': '#7c3aed',
  'Insurance': '#14b8a6',
  'Personal Care': '#f472b6',
  'Fitness': '#10b981',
  'Subscriptions': '#06b6d4',
  'Gifts & Donations': '#a855f7',
  'Home': '#84cc16',
  'Pets': '#f59e0b',
  'Other': '#64748b',
  'Salary': '#10b981',
  'Freelance': '#6366f1',
  'Investments': '#0ea5e9',
  'Rental Income': '#7c3aed',
  'Business': '#f97316',
  'Dividends': '#22c55e',
  'Gifts': '#ec4899',
  'Other Income': '#8b5cf6',
};

/**
 * Generate month labels
 */
export const getMonthName = (month) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || '';
};

/**
 * Get health score color
 */
export const getHealthColor = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
};

/**
 * Download data as CSV
 */
export const exportToCSV = (data, filename = 'transactions') => {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h]?.toString() || '';
        return val.includes(',') ? `"${val}"` : val;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

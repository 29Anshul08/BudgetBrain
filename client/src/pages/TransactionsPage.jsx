import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency, formatDate, categoryIcons, exportToCSV } from '../utils/formatters';
import GlassCard from '../components/ui/GlassCard';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlineSearch, HiOutlineFilter,
  HiOutlineX, HiOutlinePencil, HiOutlineTrash, HiOutlineDownload,
  HiOutlineTrendingUp, HiOutlineTrendingDown,
} from 'react-icons/hi';

const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities',
  'Healthcare', 'Education', 'Travel', 'Groceries', 'Rent', 'Insurance',
  'Personal Care', 'Fitness', 'Subscriptions', 'Gifts & Donations', 'Home', 'Other',
];
const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Rental Income', 'Business', 'Dividends', 'Gifts', 'Other Income',
];
const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'other', label: 'Other' },
];

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'upi',
  });

  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 15, sort: '-date' };
      if (search) params.search = search;
      if (filterType) params.type = filterType;
      if (filterCategory) params.category = filterCategory;
      const res = await api.get('/transactions', { params });
      setTransactions(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterCategory]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchTransactions(), 300);
    return () => clearTimeout(debounce);
  }, [fetchTransactions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTx) {
        await api.put(`/transactions/${editingTx._id}`, formData);
        toast.success('Transaction updated!');
      } else {
        await api.post('/transactions', formData);
        toast.success('Transaction added!');
      }
      setShowModal(false);
      setEditingTx(null);
      resetForm();
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (tx) => {
    setEditingTx(tx);
    setFormData({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description || '',
      date: new Date(tx.date).toISOString().split('T')[0],
      paymentMethod: tx.paymentMethod || 'other',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'upi',
    });
  };

  const handleExport = () => {
    const csvData = transactions.map((tx) => ({
      Date: formatDate(tx.date, 'long'),
      Type: tx.type,
      Category: tx.category,
      Description: tx.description,
      Amount: tx.amount,
      PaymentMethod: tx.paymentMethod,
    }));
    exportToCSV(csvData, 'transactions');
    toast.success('Exported to CSV!');
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Transactions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{pagination.total} total transactions</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={handleExport}>
            <HiOutlineDownload size={18} /> Export
          </button>
          <button className="btn-primary" onClick={() => { resetForm(); setEditingTx(null); setShowModal(true); }}>
            <HiOutlinePlus size={18} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <GlassCard style={{ marginBottom: 20, padding: 16 }} hover={false}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <HiOutlineSearch size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 42 }}
              placeholder="Search transactions..."
              id="tx-search"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
            style={{ flex: '0 1 160px', cursor: 'pointer' }}
            id="tx-filter-type"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field"
            style={{ flex: '0 1 200px', cursor: 'pointer' }}
            id="tx-filter-category"
          >
            <option value="">All Categories</option>
            {[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {(search || filterType || filterCategory) && (
            <button
              className="btn-secondary"
              onClick={() => { setSearch(''); setFilterType(''); setFilterCategory(''); }}
              style={{ padding: '10px 14px' }}
            >
              <HiOutlineX size={16} /> Clear
            </button>
          )}
        </div>
      </GlassCard>

      {/* Transactions List */}
      {loading ? (
        <GlassCard hover={false} style={{ padding: 16 }}>
          <LoadingSkeleton type="row" count={6} />
        </GlassCard>
      ) : transactions.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            title="No transactions found"
            description={search ? 'Try adjusting your search or filters.' : 'Add your first transaction to start tracking your finances.'}
            action={!search ? () => { resetForm(); setShowModal(true); } : undefined}
            actionLabel="Add Transaction"
          />
        </GlassCard>
      ) : (
        <GlassCard hover={false} style={{ padding: 0, overflow: 'hidden' }}>
          {transactions.map((tx, i) => (
            <motion.div
              key={tx._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-color)',
                transition: 'background 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: tx.type === 'income' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>
                {categoryIcons[tx.category] || '📦'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                  {tx.description || tx.category}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {tx.category} • {formatDate(tx.date)} • {tx.paymentMethod?.replace('_', ' ')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                {tx.type === 'income' ? <HiOutlineTrendingUp size={14} style={{ color: '#10b981' }} /> : <HiOutlineTrendingDown size={14} style={{ color: '#f43f5e' }} />}
                <span style={{
                  fontSize: 15, fontWeight: 700,
                  color: tx.type === 'income' ? '#10b981' : '#f43f5e',
                }}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, user?.currency)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => handleEdit(tx)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: 6, borderRadius: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.color = '#7c3aed'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <HiOutlinePencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(tx._id)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: 6, borderRadius: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; e.currentTarget.style.color = '#f43f5e'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <HiOutlineTrash size={16} />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16 }}>
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchTransactions(i + 1)}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    border: pagination.page === i + 1 ? 'none' : '1px solid var(--border-color)',
                    background: pagination.page === i + 1 ? 'var(--gradient-primary)' : 'transparent',
                    color: pagination.page === i + 1 ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600, fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.2s',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowModal(false); setEditingTx(null); }}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                zIndex: 100, backdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%', maxWidth: 480,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 20,
                padding: 28,
                zIndex: 101,
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                  {editingTx ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); setEditingTx(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                >
                  <HiOutlineX size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Type Toggle */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {['expense', 'income'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t, category: '' })}
                      style={{
                        flex: 1, padding: '12px', borderRadius: 12,
                        border: formData.type === t ? 'none' : '1px solid var(--border-color)',
                        background: formData.type === t
                          ? (t === 'income' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f43f5e, #e11d48)')
                          : 'transparent',
                        color: formData.type === t ? '#fff' : 'var(--text-secondary)',
                        fontWeight: 600, fontSize: 14, cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        textTransform: 'capitalize',
                        transition: 'all 0.2s',
                      }}
                    >
                      {t === 'income' ? '↗ ' : '↘ '}{t}
                    </button>
                  ))}
                </div>

                {/* Amount */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                    required
                    id="tx-amount"
                  />
                </div>

                {/* Category */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                    id="tx-category"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c} style={{ background: 'var(--bg-secondary)' }}>
                        {categoryIcons[c] || '📦'} {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    placeholder="What was this for?"
                    id="tx-description"
                  />
                </div>

                {/* Date & Payment Method */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input-field"
                      required
                      id="tx-date"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Payment</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="input-field"
                      id="tx-payment"
                      style={{ cursor: 'pointer' }}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value} style={{ background: 'var(--bg-secondary)' }}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} id="tx-submit">
                  {editingTx ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Button (Mobile) */}
      <button
        className="mobile-fab"
        onClick={() => { resetForm(); setEditingTx(null); setShowModal(true); }}
        style={{
          position: 'fixed',
          bottom: 24, right: 24,
          width: 56, height: 56,
          borderRadius: '50%',
          background: 'var(--gradient-primary)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(124, 58, 237, 0.4)',
          zIndex: 30,
          fontSize: 24,
        }}
      >
        <HiOutlinePlus size={24} />
      </button>

      <style>{`
        @media (max-width: 768px) {
          .mobile-fab { display: flex !important; }
        }
      `}</style>
    </motion.div>
  );
}

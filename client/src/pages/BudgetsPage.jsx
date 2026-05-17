import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import GlassCard from '../components/ui/GlassCard';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineX, HiOutlinePencil, HiOutlineTrash, HiOutlineExclamation } from 'react-icons/hi';

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities',
  'Healthcare', 'Education', 'Travel', 'Groceries', 'Rent', 'Insurance',
  'Personal Care', 'Fitness', 'Subscriptions', 'Gifts & Donations', 'Home', 'Other',
];
const ICONS = ['💰', '🍕', '🚗', '🛍️', '🎬', '💡', '🏥', '📚', '✈️', '🛒', '🏠', '💄', '💪', '📱', '🎁'];
const COLORS = ['#7c3aed', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];

export default function BudgetsPage() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({ category: '', limit: '', icon: '💰', color: '#7c3aed', alertThreshold: 80 });

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const [budgetRes, alertRes] = await Promise.allSettled([
        api.get('/budgets'),
        api.get('/budgets/alerts'),
      ]);
      if (budgetRes.status === 'fulfilled') setBudgets(budgetRes.value.data.data);
      if (alertRes.status === 'fulfilled') setAlerts(alertRes.value.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await api.put(`/budgets/${editingBudget._id}`, formData);
        toast.success('Budget updated!');
      } else {
        await api.post('/budgets', formData);
        toast.success('Budget created!');
      }
      setShowModal(false);
      setEditingBudget(null);
      setFormData({ category: '', limit: '', icon: '💰', color: '#7c3aed', alertThreshold: 80 });
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      toast.success('Budget deleted');
      fetchBudgets();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (b) => {
    setEditingBudget(b);
    setFormData({ category: b.category, limit: b.limit, icon: b.icon, color: b.color, alertThreshold: b.alertThreshold });
    setShowModal(true);
  };

  const totalLimit = budgets.reduce((a, b) => a + b.limit, 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Budgets</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingBudget(null); setFormData({ category: '', limit: '', icon: '💰', color: '#7c3aed', alertThreshold: 80 }); setShowModal(true); }}>
          <HiOutlinePlus size={18} /> Add Budget
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <GlassCard style={{ marginBottom: 20, padding: 16, borderLeft: '4px solid #f59e0b' }} hover={false}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <HiOutlineExclamation size={20} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>Budget Alerts</span>
          </div>
          {alerts.map((a) => (
            <p key={a.id} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              {a.icon} <strong>{a.category}</strong> is at {a.percentSpent}% ({formatCurrency(a.spent, user?.currency)} / {formatCurrency(a.limit, user?.currency)})
              {a.status === 'exceeded' ? ' — Over budget! 🚨' : ' — Approaching limit ⚠️'}
            </p>
          ))}
        </GlassCard>
      )}

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <GlassCard gradient="violet">
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Budget</p>
            <p style={{ fontSize: 22, fontWeight: 800 }}>{formatCurrency(totalLimit, user?.currency)}</p>
          </GlassCard>
          <GlassCard gradient="rose">
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Spent</p>
            <p style={{ fontSize: 22, fontWeight: 800 }}>{formatCurrency(totalSpent, user?.currency)}</p>
          </GlassCard>
          <GlassCard gradient="emerald">
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Remaining</p>
            <p style={{ fontSize: 22, fontWeight: 800 }}>{formatCurrency(Math.max(0, totalLimit - totalSpent), user?.currency)}</p>
          </GlassCard>
        </div>
      )}

      {/* Budget Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <LoadingSkeleton type="card" count={4} />
        </div>
      ) : budgets.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<span style={{ fontSize: 36 }}>📊</span>}
            title="No budgets set"
            description="Create your first budget to start tracking spending by category."
            action={() => setShowModal(true)}
            actionLabel="Create Budget"
          />
        </GlassCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {budgets.map((b, i) => {
            const pct = b.percentSpent || 0;
            const status = b.status || 'good';
            const barColor = status === 'exceeded' ? '#f43f5e' : status === 'warning' ? '#f59e0b' : b.color || '#7c3aed';

            return (
              <GlassCard key={b._id} delay={i * 0.05}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: `${barColor}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20,
                    }}>
                      {b.icon}
                    </span>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700 }}>{b.category}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {status === 'exceeded' ? '🚨 Over budget' : status === 'warning' ? '⚠️ Near limit' : '✅ On track'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => handleEdit(b)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                      <HiOutlinePencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(b._id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                      <HiOutlineTrash size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800 }}>{formatCurrency(b.spent, user?.currency)}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>of {formatCurrency(b.limit, user?.currency)}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--border-color)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, pct)}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      style={{ height: '100%', borderRadius: 4, background: barColor }}
                    />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>
                    {pct}% used • {formatCurrency(Math.max(0, b.limit - b.spent), user?.currency)} remaining
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Budget Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowModal(false); setEditingBudget(null); }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '100%', maxWidth: 440, background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)', borderRadius: 20, padding: 28, zIndex: 101,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>{editingBudget ? 'Edit Budget' : 'Create Budget'}</h2>
                <button onClick={() => { setShowModal(false); setEditingBudget(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <HiOutlineX size={22} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field" required disabled={!!editingBudget} style={{ cursor: 'pointer' }}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c} style={{ background: 'var(--bg-secondary)' }}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Monthly Limit ({user?.currency})</label>
                  <input type="number" min="1" value={formData.limit} onChange={(e) => setFormData({ ...formData, limit: e.target.value })} className="input-field" placeholder="10000" required />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Icon</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ICONS.map((icon) => (
                      <button key={icon} type="button" onClick={() => setFormData({ ...formData, icon })}
                        style={{
                          width: 38, height: 38, borderRadius: 10, border: formData.icon === icon ? '2px solid var(--accent-violet)' : '1px solid var(--border-color)',
                          background: formData.icon === icon ? 'rgba(124,58,237,0.1)' : 'transparent',
                          cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Color</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })}
                        style={{
                          width: 32, height: 32, borderRadius: 8, background: c, border: formData.color === c ? '3px solid #fff' : 'none',
                          cursor: 'pointer', boxShadow: formData.color === c ? `0 0 10px ${c}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Alert Threshold: {formData.alertThreshold}%</label>
                  <input type="range" min="50" max="100" value={formData.alertThreshold} onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--accent-violet)' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

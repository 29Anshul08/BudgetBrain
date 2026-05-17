import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency, formatDate, categoryIcons, categoryColors, getHealthColor } from '../utils/formatters';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import {
  HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineCash,
  HiOutlineChartBar, HiOutlineSparkles, HiOutlineLightningBolt,
} from 'react-icons/hi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, insightRes] = await Promise.allSettled([
          api.get('/dashboard'),
          api.get('/ai/insights'),
        ]);
        if (dashRes.status === 'fulfilled') setData(dashRes.value.data.data);
        if (insightRes.status === 'fulfilled') setInsights(insightRes.value.data.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 32 }}>
          <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 300, height: 16 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 24 }}>
          <LoadingSkeleton type="stat" count={4} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <LoadingSkeleton type="chart" count={2} />
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Balance',
      value: formatCurrency(data?.balance || 0, user?.currency),
      icon: <HiOutlineCash size={22} />,
      gradient: 'violet',
      iconBg: 'linear-gradient(135deg, #7c3aed, #6366f1)',
      change: null,
    },
    {
      label: 'Monthly Income',
      value: formatCurrency(data?.monthlyIncome || 0, user?.currency),
      icon: <HiOutlineTrendingUp size={22} />,
      gradient: 'emerald',
      iconBg: 'linear-gradient(135deg, #10b981, #059669)',
      change: `${data?.incomeCount || 0} transactions`,
    },
    {
      label: 'Monthly Expenses',
      value: formatCurrency(data?.monthlyExpenses || 0, user?.currency),
      icon: <HiOutlineTrendingDown size={22} />,
      gradient: 'rose',
      iconBg: 'linear-gradient(135deg, #f43f5e, #e11d48)',
      change: `${data?.expenseCount || 0} transactions`,
    },
    {
      label: 'Monthly Savings',
      value: formatCurrency(data?.monthlySavings || 0, user?.currency),
      icon: <HiOutlineChartBar size={22} />,
      gradient: 'sky',
      iconBg: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
      change: `${data?.savingsRate || 0}% savings rate`,
    },
  ];

  const PIE_COLORS = ['#7c3aed', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#14b8a6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
            {p.name}: {formatCurrency(p.value, user?.currency)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Here's your financial overview for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeUp} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        marginBottom: 24,
      }}>
        {stats.map((stat, i) => (
          <GlassCard key={stat.label} gradient={stat.gradient} delay={i * 0.05}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: stat.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
              }}>
                {stat.icon}
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{stat.label}</p>
            <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>{stat.value}</p>
            {stat.change && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{stat.change}</p>
            )}
          </GlassCard>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={fadeUp} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 20,
        marginBottom: 24,
      }}>
        {/* Trends Chart */}
        <GlassCard delay={0.2}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.trends || []}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#expenseGrad)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Category Pie Chart */}
        <GlassCard delay={0.25}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Spending by Category</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie
                  data={data?.categoryBreakdown?.slice(0, 6) || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(data?.categoryBreakdown || []).slice(0, 6).map((entry, index) => (
                    <Cell key={index} fill={categoryColors[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {(data?.categoryBreakdown || []).slice(0, 5).map((cat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: categoryColors[cat.name] || PIE_COLORS[i], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatCurrency(cat.value, user?.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Bottom Row */}
      <motion.div variants={fadeUp} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 20,
        marginBottom: 24,
      }}>
        {/* Financial Health Score */}
        <GlassCard delay={0.3}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <HiOutlineLightningBolt size={20} style={{ color: 'var(--accent-amber)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Financial Health</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative', width: 100, height: 100 }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={getHealthColor(data?.healthScore || 0)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - (data?.healthScore || 0) / 100) }}
                  transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
              }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: getHealthColor(data?.healthScore || 0) }}>
                  {data?.healthScore || 0}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {data?.healthScore >= 80 ? 'Excellent! 🌟' :
                  data?.healthScore >= 60 ? 'Good Shape 👍' :
                  data?.healthScore >= 40 ? 'Needs Work 📊' : 'Critical ⚠️'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Savings rate: {data?.savingsRate || 0}%
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Budget Overview */}
        <GlassCard delay={0.35}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Budget Overview</h3>
          {(data?.budgetOverview?.budgets || []).slice(0, 4).map((budget) => (
            <div key={budget.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {budget.icon} {budget.category}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {formatCurrency(budget.spent, user?.currency)} / {formatCurrency(budget.limit, user?.currency)}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--border-color)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, budget.percentSpent)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{
                    height: '100%',
                    borderRadius: 3,
                    background: budget.status === 'exceeded' ? '#f43f5e' :
                      budget.status === 'warning' ? '#f59e0b' : budget.color || '#7c3aed',
                  }}
                />
              </div>
            </div>
          ))}
          {(!data?.budgetOverview?.budgets?.length) && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
              No budgets set yet. Create one to start tracking!
            </p>
          )}
        </GlassCard>

        {/* Recent Transactions */}
        <GlassCard delay={0.4}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Transactions</h3>
          {(data?.recentTransactions || []).map((tx) => (
            <div key={tx._id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: tx.type === 'income' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {categoryIcons[tx.category] || '📦'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tx.description || tx.category}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(tx.date)}</p>
              </div>
              <p style={{
                fontSize: 14, fontWeight: 700,
                color: tx.type === 'income' ? '#10b981' : '#f43f5e',
                whiteSpace: 'nowrap',
              }}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, user?.currency)}
              </p>
            </div>
          ))}
          {(!data?.recentTransactions?.length) && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
              No transactions yet. Add your first one!
            </p>
          )}
        </GlassCard>

        {/* AI Insights */}
        <GlassCard delay={0.45} gradient="violet">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <HiOutlineSparkles size={20} style={{ color: '#7c3aed' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>AI Insights</h3>
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: 'var(--gradient-primary)',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 6,
            }}>
              GEMINI
            </span>
          </div>
          {insights?.insights ? (
            <div>
              {(Array.isArray(insights.insights) ? insights.insights : [insights.insights]).slice(0, 3).map((insight, i) => (
                <div key={i} style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(124, 58, 237, 0.06)',
                  marginBottom: 8,
                  borderLeft: '3px solid #7c3aed',
                }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {insight}
                  </p>
                </div>
              ))}
              {insights.healthTip && (
                <div style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderLeft: '3px solid #10b981',
                }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#10b981', marginBottom: 2 }}>💡 Health Tip</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{insights.healthTip}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Add transactions to unlock AI-powered spending insights and personalized financial advice.
              </p>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

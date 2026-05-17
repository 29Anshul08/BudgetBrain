import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency, categoryColors } from '../utils/formatters';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LineChart, Line,
} from 'recharts';

const COLORS = ['#7c3aed', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, predRes, anomRes] = await Promise.allSettled([
          api.get('/dashboard'),
          api.get('/ai/predict'),
          api.get('/ai/anomalies'),
        ]);
        if (dashRes.status === 'fulfilled') setData(dashRes.value.data.data);
        if (predRes.status === 'fulfilled') setPredictions(predRes.value.data.data);
        if (anomRes.status === 'fulfilled') setAnomalies(anomRes.value.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color || p.fill }}>
            {p.name}: {formatCurrency(p.value, user?.currency)}
          </p>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'categories', label: '📂 Categories' },
    { id: 'predictions', label: '🔮 AI Predictions' },
    { id: 'anomalies', label: '🔍 Anomalies' },
  ];

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <LoadingSkeleton type="chart" count={4} />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Analytics</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px', borderRadius: 12, border: 'none',
              background: activeTab === tab.id ? 'var(--gradient-primary)' : 'var(--bg-card)',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)', transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
          {/* Monthly Trends */}
          <GlassCard>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Income vs Expenses Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.trends || []}>
                <defs>
                  <linearGradient id="incomeG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeG)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#expenseG)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Savings Trend */}
          <GlassCard>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Savings Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(data?.trends || []).map(t => ({ ...t, savings: (t.income || 0) - (t.expense || 0) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="savings" name="Savings" radius={[6, 6, 0, 0]}>
                  {(data?.trends || []).map((entry, i) => {
                    const savings = (entry.income || 0) - (entry.expense || 0);
                    return <Cell key={i} fill={savings >= 0 ? '#10b981' : '#f43f5e'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
          <GlassCard>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Expense Distribution</h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={data?.categoryBreakdown || []} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {(data?.categoryBreakdown || []).map((entry, i) => (
                    <Cell key={i} fill={categoryColors[entry.name] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data?.categoryBreakdown?.slice(0, 8) || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Amount" radius={[0, 6, 6, 0]}>
                  {(data?.categoryBreakdown || []).slice(0, 8).map((entry, i) => (
                    <Cell key={i} fill={categoryColors[entry.name] || COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <GlassCard gradient="violet">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>🔮</span>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>AI Spending Predictions</h3>
            </div>
            {predictions?.nextMonthPrediction ? (
              <div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Expected next month: <strong style={{ color: 'var(--text-primary)', fontSize: 18 }}>{formatCurrency(predictions.nextMonthPrediction.totalExpected, user?.currency)}</strong>
                </p>
                {(predictions.nextMonthPrediction.categoryPredictions || []).slice(0, 5).map((cat, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: 13 }}>{cat.category}</span>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(cat.predicted, user?.currency)}</span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: cat.confidence === 'high' ? 'rgba(16,185,129,0.15)' : cat.confidence === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)', color: cat.confidence === 'high' ? '#10b981' : cat.confidence === 'medium' ? '#f59e0b' : '#f43f5e' }}>{cat.confidence}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add more data for AI predictions.</p>
            )}
          </GlassCard>

          <GlassCard>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📈 Trends</h3>
            {(predictions?.trends || ['Add more data for trend analysis.']).map((trend, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-card)', marginBottom: 8, borderLeft: '3px solid #6366f1' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{trend}</p>
              </div>
            ))}
          </GlassCard>

          <GlassCard>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>💡 Opportunities</h3>
            {(predictions?.opportunities || ['Track expenses consistently for better insights.']).map((opp, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.06)', marginBottom: 8, borderLeft: '3px solid #10b981' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{opp}</p>
              </div>
            ))}
          </GlassCard>

          <GlassCard>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>⚠️ Risks</h3>
            {(predictions?.risks || ['No financial risks detected.']).map((risk, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(244,63,94,0.06)', marginBottom: 8, borderLeft: '3px solid #f43f5e' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{risk}</p>
              </div>
            ))}
          </GlassCard>
        </div>
      )}

      {/* Anomalies Tab */}
      {activeTab === 'anomalies' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          <GlassCard gradient="rose">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>🔍</span>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Unusual Expenses</h3>
            </div>
            {(anomalies?.anomalies || []).length > 0 ? (
              anomalies.anomalies.map((a, i) => (
                <div key={i} style={{ padding: '14px', borderRadius: 12, background: 'var(--bg-card)', marginBottom: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{a.description || a.category}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600, background: a.severity === 'high' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)', color: a.severity === 'high' ? '#f43f5e' : '#f59e0b' }}>{a.severity}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{a.explanation}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#f43f5e' }}>{formatCurrency(a.amount, user?.currency)}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No unusual expenses detected. Great job! 🎉</p>
            )}
          </GlassCard>

          <GlassCard>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📋 Recommendations</h3>
            {(anomalies?.recommendations || ['Keep tracking your expenses for better analysis.']).map((rec, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', marginBottom: 8, borderLeft: '3px solid #6366f1' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec}</p>
              </div>
            ))}
          </GlassCard>
        </div>
      )}
    </motion.div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GlassCard from '../components/ui/GlassCard';
import { HiOutlineUser, HiOutlineCurrencyDollar, HiOutlineMoon, HiOutlineSun, HiOutlineBell } from 'react-icons/hi';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthlyIncome || '');
  const [notifications, setNotifications] = useState(user?.notifications || { budgetAlerts: true, weeklyReport: true, aiInsights: true });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ name, currency, monthlyIncome: Number(monthlyIncome), notifications });
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Settings</h1>

      {/* Profile */}
      <GlassCard style={{ marginBottom: 20 }} hover={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <HiOutlineUser size={20} style={{ color: 'var(--accent-violet)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Profile</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: '#fff',
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700 }}>{user?.name}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Monthly Income</label>
          <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} className="input-field" placeholder="Your monthly income" />
        </div>
      </GlassCard>

      {/* Preferences */}
      <GlassCard style={{ marginBottom: 20 }} hover={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <HiOutlineCurrencyDollar size={20} style={{ color: 'var(--accent-emerald)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Preferences</h3>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
            {CURRENCIES.map((c) => <option key={c} value={c} style={{ background: 'var(--bg-secondary)' }}>{c}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {theme === 'dark' ? <HiOutlineMoon size={18} /> : <HiOutlineSun size={18} />}
            <span style={{ fontSize: 14, fontWeight: 500 }}>Dark Mode</span>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              width: 48, height: 26, borderRadius: 13, border: 'none',
              background: theme === 'dark' ? 'var(--gradient-primary)' : 'var(--border-color)',
              cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3,
              left: theme === 'dark' ? 25 : 3,
              transition: 'left 0.3s ease',
            }} />
          </button>
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard style={{ marginBottom: 20 }} hover={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <HiOutlineBell size={20} style={{ color: 'var(--accent-amber)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Notifications</h3>
        </div>

        {[
          { key: 'budgetAlerts', label: 'Budget Alerts', desc: 'Get notified when approaching budget limits' },
          { key: 'weeklyReport', label: 'Weekly Reports', desc: 'Receive weekly financial summaries' },
          { key: 'aiInsights', label: 'AI Insights', desc: 'Get personalized AI-powered financial tips' },
        ].map((item) => (
          <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</p>
            </div>
            <button
              onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
              style={{
                width: 48, height: 26, borderRadius: 13, border: 'none',
                background: notifications[item.key] ? 'var(--gradient-primary)' : 'var(--border-color)',
                cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: notifications[item.key] ? 25 : 3,
                transition: 'left 0.3s ease',
              }} />
            </button>
          </div>
        ))}
      </GlassCard>

      {/* Save */}
      <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '14px', opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </motion.div>
  );
}

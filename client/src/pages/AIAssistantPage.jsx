import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import { HiOutlinePaperAirplane, HiOutlineSparkles, HiOutlineLightBulb } from 'react-icons/hi';

const SUGGESTED_QUESTIONS = [
  'How can I save more money this month?',
  'What are my biggest spending categories?',
  'Am I on track with my budgets?',
  'Give me a financial health checkup',
  'What expenses should I cut down?',
  'Suggest a savings plan for me',
  'How do I start investing as a beginner?',
  'What is the 50/30/20 budgeting rule?',
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm BudgetBrain AI 🧠 — your personal financial advisor. I can analyze your spending, suggest budgets, give investment tips, and help you save money. What would you like to know?",
      suggestions: SUGGESTED_QUESTIONS.slice(0, 4),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [report, setReport] = useState(null);
  const [budgetPlan, setBudgetPlan] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (msg) => {
    const text = msg || input.trim();
    if (!text) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const context = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await api.post('/ai/chat', { message: text, context });
      const data = res.data.data;

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.reply || data.raw || 'Sorry, I couldn\'t process that.',
        suggestions: data.suggestions || [],
        actionItems: data.actionItems || [],
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again!',
        suggestions: ['How can I save more?', 'What are my expenses?'],
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const fetchReport = async () => {
    setLoadingReport(true);
    try {
      const res = await api.get('/ai/monthly-report');
      setReport(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchBudgetPlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await api.get('/ai/budget-plan');
      setBudgetPlan(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlan(false);
    }
  };

  const tabs = [
    { id: 'chat', label: '💬 Chat', icon: '💬' },
    { id: 'report', label: '📊 Monthly Report', icon: '📊' },
    { id: 'planner', label: '📋 Budget Planner', icon: '📋' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          🧠
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>AI Financial Assistant</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Powered by Google Gemini</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'report' && !report) fetchReport();
              if (tab.id === 'planner' && !budgetPlan) fetchBudgetPlan();
            }}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: activeTab === tab.id ? 'var(--gradient-primary)' : 'var(--bg-card)',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              fontFamily: 'var(--font-sans)', transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <GlassCard hover={false} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }} className="no-scrollbar">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ maxWidth: '80%' }}>
                    {msg.role === 'assistant' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 14 }}>🧠</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>BudgetBrain AI</span>
                      </div>
                    )}
                    <div style={{
                      padding: '14px 18px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--bg-card)',
                      color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}>
                      {msg.content}
                    </div>

                    {/* Action Items */}
                    {msg.actionItems?.length > 0 && (
                      <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.06)', borderLeft: '3px solid #10b981' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>Action Items</p>
                        {msg.actionItems.map((item, j) => (
                          <p key={j} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>• {item}</p>
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    {msg.suggestions?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                        {msg.suggestions.map((sug, j) => (
                          <button
                            key={j}
                            onClick={() => sendMessage(sug)}
                            style={{
                              padding: '6px 12px', borderRadius: 8,
                              border: '1px solid var(--border-color)',
                              background: 'transparent',
                              color: 'var(--text-secondary)',
                              fontSize: 12, cursor: 'pointer',
                              fontFamily: 'var(--font-sans)',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-violet)'; e.currentTarget.style.color = 'var(--accent-violet)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 6, padding: '12px 18px', borderRadius: 16, background: 'var(--bg-card)', width: 'fit-content', border: '1px solid var(--border-color)' }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-violet)' }}
                    />
                  ))}
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="input-field"
                  placeholder="Ask me anything about your finances..."
                  disabled={isTyping}
                  id="ai-chat-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={isTyping || !input.trim()}
                  style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: input.trim() ? 'var(--gradient-primary)' : 'var(--bg-card)',
                    border: 'none', color: '#fff', cursor: input.trim() ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  id="ai-chat-send"
                >
                  <HiOutlinePaperAirplane size={18} style={{ transform: 'rotate(90deg)' }} />
                </button>
              </form>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Report Tab */}
      {activeTab === 'report' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingReport ? (
            <GlassCard hover={false}>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ fontSize: 40, display: 'inline-block', marginBottom: 16 }}>
                  🧠
                </motion.div>
                <p style={{ color: 'var(--text-muted)' }}>Generating AI report...</p>
              </div>
            </GlassCard>
          ) : report ? (
            <div style={{ display: 'grid', gap: 16 }}>
              <GlassCard gradient="violet" hover={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Monthly Financial Report</h3>
                  {report.grade && (
                    <span style={{ fontSize: 24, fontWeight: 900, padding: '4px 16px', borderRadius: 12, background: report.grade === 'A' ? 'rgba(16,185,129,0.15)' : report.grade === 'B' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)', color: report.grade === 'A' ? '#10b981' : report.grade === 'B' ? '#6366f1' : '#f59e0b' }}>
                      {report.grade}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{report.summary}</p>
                {report.gradeExplanation && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{report.gradeExplanation}</p>}
              </GlassCard>

              {report.highlights?.length > 0 && (
                <GlassCard hover={false}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#10b981' }}>✅ Highlights</h4>
                  {report.highlights.map((h, i) => (
                    <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, paddingLeft: 16, borderLeft: '2px solid #10b981' }}>{h}</p>
                  ))}
                </GlassCard>
              )}

              {report.concerns?.length > 0 && (
                <GlassCard hover={false}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#f43f5e' }}>⚠️ Concerns</h4>
                  {report.concerns.map((c, i) => (
                    <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, paddingLeft: 16, borderLeft: '2px solid #f43f5e' }}>{c}</p>
                  ))}
                </GlassCard>
              )}

              {report.recommendations?.length > 0 && (
                <GlassCard hover={false}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#6366f1' }}>💡 Recommendations</h4>
                  {report.recommendations.map((r, i) => (
                    <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, paddingLeft: 16, borderLeft: '2px solid #6366f1' }}>{r}</p>
                  ))}
                </GlassCard>
              )}
            </div>
          ) : (
            <GlassCard hover={false}>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                Failed to generate report. Please try again.
              </p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Budget Planner Tab */}
      {activeTab === 'planner' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingPlan ? (
            <GlassCard hover={false}>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ fontSize: 40, display: 'inline-block', marginBottom: 16 }}>
                  📊
                </motion.div>
                <p style={{ color: 'var(--text-muted)' }}>AI is creating your budget plan...</p>
              </div>
            </GlassCard>
          ) : budgetPlan ? (
            <div style={{ display: 'grid', gap: 16 }}>
              {budgetPlan.monthlyPlan && (
                <GlassCard gradient="emerald" hover={false}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📋 Recommended Budget Split</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Ratio: <strong>{budgetPlan.monthlyPlan.ratio}</strong>
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Needs', value: budgetPlan.monthlyPlan.needs, color: '#0ea5e9' },
                      { label: 'Wants', value: budgetPlan.monthlyPlan.wants, color: '#f59e0b' },
                      { label: 'Savings', value: budgetPlan.monthlyPlan.savings, color: '#10b981' },
                    ].map((item) => (
                      <div key={item.label} style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'var(--bg-card)' }}>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{typeof item.value === 'number' ? `₹${item.value.toLocaleString()}` : item.value}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {budgetPlan.recommendedBudgets?.length > 0 && (
                <GlassCard hover={false}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Recommended Category Budgets</h3>
                  {budgetPlan.recommendedBudgets.map((b, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{b.category}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.reason}</p>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-violet)' }}>
                        {typeof b.suggestedLimit === 'number' ? `₹${b.suggestedLimit.toLocaleString()}` : b.suggestedLimit}
                      </span>
                    </div>
                  ))}
                </GlassCard>
              )}

              {budgetPlan.optimizations?.length > 0 && (
                <GlassCard hover={false}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>🚀 Optimizations</h3>
                  {budgetPlan.optimizations.map((opt, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', marginBottom: 8, borderLeft: '3px solid #6366f1' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{opt}</p>
                    </div>
                  ))}
                </GlassCard>
              )}
            </div>
          ) : (
            <GlassCard hover={false}>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                Failed to generate budget plan. Please try again.
              </p>
            </GlassCard>
          )}
        </div>
      )}
    </motion.div>
  );
}

import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HiOutlineViewGrid,
  HiOutlineCreditCard,
  HiOutlineChartPie,
  HiOutlineCurrencyDollar,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineSparkles,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineMoon,
  HiOutlineSun,
} from 'react-icons/hi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { path: '/transactions', label: 'Transactions', icon: HiOutlineCreditCard },
  { path: '/budgets', label: 'Budgets', icon: HiOutlineCurrencyDollar },
  { path: '/analytics', label: 'Analytics', icon: HiOutlineChartPie },
  { path: '/ai-assistant', label: 'AI Assistant', icon: HiOutlineSparkles },
  { path: '/settings', label: 'Settings', icon: HiOutlineCog },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const SidebarContent = ({ isMobile = false }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: collapsed && !isMobile ? '20px 12px' : '20px 16px',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
        padding: '4px 8px',
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}>
          🧠
        </div>
        {(!collapsed || isMobile) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 style={{
              fontSize: 20,
              fontWeight: 800,
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}>
              BudgetBrain
            </h1>
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed && !isMobile ? '12px' : '12px 16px',
                borderRadius: 12,
                textDecoration: 'none',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'var(--gradient-primary)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                transition: 'all 0.2s ease',
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
              {isActive && item.path === '/ai-assistant' && (
                <span style={{
                  position: 'absolute',
                  right: collapsed && !isMobile ? 4 : 12,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed && !isMobile ? '12px' : '12px 16px',
            borderRadius: 12,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s ease',
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            width: '100%',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {theme === 'dark' ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
          {(!collapsed || isMobile) && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User Profile */}
        {(!collapsed || isMobile) && user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 12,
            background: 'var(--bg-card)',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed && !isMobile ? '12px' : '12px 16px',
            borderRadius: 12,
            border: 'none',
            background: 'transparent',
            color: '#f43f5e',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s ease',
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            width: '100%',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <HiOutlineLogout size={20} />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          zIndex: 40,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'none',
        }}
        className="sidebar-desktop"
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            top: 28,
            right: -14,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            zIndex: 50,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-violet)';
            e.currentTarget.style.color = 'var(--accent-violet)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </motion.aside>

      {/* Mobile Header */}
      <div className="mobile-header" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 40,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🧠</span>
          <span style={{ fontWeight: 800, fontSize: 18, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BudgetBrain</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          {mobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 45,
              }}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                width: 280,
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)',
                zIndex: 50,
                overflowY: 'auto',
              }}
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 769px) {
          .sidebar-desktop { display: block !important; }
          .mobile-header { display: none !important; }
        }
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </>
  );
}

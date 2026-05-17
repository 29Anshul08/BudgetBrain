import { motion } from 'framer-motion';
import { HiOutlineInbox } from 'react-icons/hi';

export default function EmptyState({
  icon,
  title = 'No data yet',
  description = 'Get started by adding your first item.',
  action,
  actionLabel = 'Get Started',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'var(--gradient-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        {icon || <HiOutlineInbox size={36} style={{ color: 'var(--text-muted)' }} />}
      </motion.div>

      <h3 style={{
        fontSize: 18,
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: 8,
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: 14,
        color: 'var(--text-muted)',
        maxWidth: 320,
        lineHeight: 1.6,
        marginBottom: action ? 24 : 0,
      }}>
        {description}
      </p>

      {action && (
        <button className="btn-primary" onClick={action}>
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}

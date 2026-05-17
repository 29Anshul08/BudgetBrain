export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const skeletons = {
    card: () => (
      <div className="glass-card" style={{ padding: 24 }}>
        <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '60%', height: 28, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: '80%', height: 12 }} />
      </div>
    ),
    stat: () => (
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
          <div className="skeleton" style={{ width: '50%', height: 14 }} />
        </div>
        <div className="skeleton" style={{ width: '70%', height: 32, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '40%', height: 12 }} />
      </div>
    ),
    row: () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 0',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '40%', height: 12 }} />
        </div>
        <div className="skeleton" style={{ width: 80, height: 20 }} />
      </div>
    ),
    chart: () => (
      <div className="glass-card" style={{ padding: 24 }}>
        <div className="skeleton" style={{ width: '30%', height: 18, marginBottom: 24 }} />
        <div className="skeleton" style={{ width: '100%', height: 200 }} />
      </div>
    ),
    text: () => (
      <div>
        <div className="skeleton" style={{ width: '100%', height: 14, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: '85%', height: 14, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: '60%', height: 14 }} />
      </div>
    ),
  };

  const SkeletonComponent = skeletons[type] || skeletons.card;

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </>
  );
}

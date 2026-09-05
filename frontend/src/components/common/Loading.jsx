import { Loader2 } from 'lucide-react';

export function Loading({ message, label = 'Loading...', fullScreen = false }) {
  const displayText = message || label;

  if (fullScreen) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)' }}>
        <Loader2 size={32} color="var(--primary)" className="animate-spin" />
        <p style={{ marginTop: '0.75rem', color: 'var(--text-sub)', fontSize: '0.875rem' }}>{displayText}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem', color: 'var(--text-sub)', fontSize: '0.875rem' }}>
      <Loader2 size={20} color="var(--primary)" className="animate-spin" />
      <span>{displayText}</span>
    </div>
  );
}

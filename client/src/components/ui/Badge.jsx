import { clsx } from 'clsx';

const variants = {
  priority: {
    high: 'bg-accent-red/15 text-accent-red border border-accent-red/30',
    medium: 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30',
    low: 'bg-surface-3 text-text-secondary border border-border',
  },
  severity: {
    high: 'bg-accent-red/15 text-accent-red border border-accent-red/30 font-semibold',
    med: 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30',
    medium: 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30',
    low: 'bg-surface-3 text-text-secondary border border-border',
  },
  status: {
    pending: 'bg-surface-3 text-text-secondary border border-border',
    approved: 'bg-[#00FFAC]/15 text-[#00FFAC] border border-[#00FFAC]/30 font-semibold',
    synced: 'bg-accent-blue/15 text-[#5BBEEF] border border-accent-blue/30 font-semibold',
    rejected: 'bg-accent-red/15 text-accent-red border border-accent-red/30',
  },
  type: {
    deadline_change: 'bg-accent-amber/10 text-accent-amber border border-accent-amber/25',
    owner_change: 'bg-accent-blue/15 text-[#5BBEEF] border border-accent-blue/25',
    decision_reversal: 'bg-accent-red/15 text-accent-red border border-accent-red/30 font-semibold',
    scope: 'bg-surface-3 text-text-secondary border border-border',
  },
};

export default function Badge({ kind = 'status', value, className }) {
  const map = variants[kind] || variants.status;
  const color = map[value] || 'bg-surface-3 text-text-secondary border border-border';
  const label = (value || '').replace(/_/g, ' ');
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider whitespace-nowrap', color, className)}>
      {label}
    </span>
  );
}

import { clsx } from 'clsx';

const base = 'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs cursor-pointer select-none';

const styles = {
  primary: 'bg-gradient-to-r from-[#5BBEEF] to-[#0063F7] text-white font-semibold hover:shadow-[0_4px_20px_rgba(0,99,247,0.45)] hover:scale-[1.01] active:scale-[0.98]',
  brand:   'bg-accent-blue text-white hover:bg-accent-blue/90 shadow-[0_2px_10px_rgba(0,99,247,0.3)]',
  danger:  'bg-accent-red/90 text-white hover:bg-accent-red hover:shadow-[0_2px_12px_rgba(255,59,92,0.35)]',
  ghost:   'bg-transparent text-text-secondary hover:bg-surface-3 hover:text-text-primary',
  success: 'bg-[#00FFAC] text-[#050505] font-semibold hover:bg-[#00FFAC]/90 hover:shadow-[0_2px_12px_rgba(0,255,172,0.35)]',
  outline: 'border border-border bg-surface-1/80 text-text-secondary hover:bg-surface-2 hover:text-text-primary hover:border-slate-600',
};

const sizes = {
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-8 px-3.5',
  lg: 'h-10 px-5 text-sm',
};

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }) {
  return (
    <button className={clsx(base, styles[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

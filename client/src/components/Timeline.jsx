import { useStore } from '@/store';
import Badge from '@/components/ui/Badge';
import { AlertTriangle, ArrowRight, MessageSquare, History } from 'lucide-react';

export default function Timeline() {
  const { state } = useStore();
  const timeline = state.timeline;

  const decisions = timeline?.decisions || [];
  const conflicts = timeline?.conflicts || [];

  if (decisions.length === 0 && conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs gap-2 p-6 text-center">
        <History size={28} strokeWidth={1.5} className="opacity-40 text-[#5BBEEF]" />
        <span>No cross-meeting history yet.<br />Run an analysis to build memory.</span>
      </div>
    );
  }

  // Group items chronologically
  const entries = [
    ...decisions.map(d => ({ ...d, _kind: 'decision' })),
    ...conflicts.map(c => ({ ...c, _kind: 'conflict' })),
  ].sort((a, b) => (a.meeting_date || '').localeCompare(b.meeting_date || ''));

  return (
    <div className="p-3.5 space-y-3">
      {entries.map((e, i) => (
        <div
          key={e.id || i}
          className={`rounded-xl border p-3.5 text-xs transition-all ${
            e._kind === 'conflict'
              ? 'border-accent-red/40 bg-accent-red/[0.06] shadow-[0_0_15px_rgba(255,59,92,0.1)]'
              : 'border-border bg-[#050505]/60 hover:border-slate-700'
          }`}
        >
          {/* Header row: Date and Meeting tag */}
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/40">
            <span className="font-mono text-[11px] text-[#5BBEEF] font-semibold">{e.meeting_date}</span>
            <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{e.meeting_title}</span>
          </div>

          {e._kind === 'decision' ? (
            <div className="flex items-start gap-2.5">
              <MessageSquare size={13} className="text-[#5BBEEF] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-white leading-relaxed font-medium">{e.text}</p>
                {e.evidence_quote && (
                  <p className="mt-1 text-[11px] text-slate-400 font-mono italic">
                    "{e.evidence_quote}"
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold text-accent-red uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Memory Contradiction
                </span>
                <Badge kind="severity" value={e.severity} />
              </div>

              <p className="text-white text-[11px] font-medium leading-snug">
                {e.description}
              </p>

              {/* Side-by-side diff */}
              <div className="flex items-center gap-1.5 pt-1 text-[11px] bg-[#001C45]/70 p-2 rounded-lg border border-[#0063F7]/30">
                <span className="text-slate-400 line-through truncate max-w-[90px]">{e.previous_value}</span>
                <ArrowRight size={10} className="text-slate-500 shrink-0" />
                <span className="text-[#00FFAC] font-semibold truncate max-w-[110px]">{e.new_value}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

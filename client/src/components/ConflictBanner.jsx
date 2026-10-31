import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, Check, ShieldAlert } from 'lucide-react';
import { useStore } from '@/store';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function ConflictBanner() {
  const { state, dispatch } = useStore();
  const conflicts = state.analysis?.conflicts || [];
  if (conflicts.length === 0) return null;

  const unacknowledged = conflicts.filter(c => !state.acknowledgedConflicts.has(c.id));

  return (
    <div className="space-y-2.5 mb-4 select-none">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-red">
          <ShieldAlert size={15} />
          <span>Cross-Meeting Conflicts Detected ({conflicts.length})</span>
        </div>
        {unacknowledged.length === 0 ? (
          <span className="text-[11px] text-[#00FFAC] font-semibold flex items-center gap-1">
            <Check size={12} /> All Conflicts Acknowledged
          </span>
        ) : (
          <span className="text-[11px] text-accent-amber font-medium">
            {unacknowledged.length} require acknowledgment
          </span>
        )}
      </div>

      <AnimatePresence>
        {conflicts.map((c, i) => {
          const acked = state.acknowledgedConflicts.has(c.id);
          return (
            <motion.div
              key={c.id || i}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border p-3.5 transition-all ${
                acked
                  ? 'border-border bg-[#0B1120]/40 opacity-50'
                  : 'border-accent-red/40 bg-gradient-to-r from-accent-red/[0.08] to-transparent shadow-[0_0_20px_rgba(255,59,92,0.12)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge kind="severity" value={c.severity} />
                    <Badge kind="type" value={c.type} />
                  </div>

                  <p className="text-xs text-white font-medium leading-relaxed">
                    {c.description}
                  </p>

                  {/* Side-by-side diff */}
                  <div className="flex items-center gap-2 text-xs pt-0.5">
                    <div className="px-2.5 py-1 rounded bg-[#0F172A] border border-border text-slate-400 line-through text-[11px] font-mono truncate max-w-[170px]">
                      {c.previous_value}
                    </div>
                    <ArrowRight size={12} className="text-slate-500 shrink-0" />
                    <div className="px-2.5 py-1 rounded bg-[#001C45] border border-[#0063F7]/50 text-[#5BBEEF] font-mono font-semibold text-[11px] truncate max-w-[190px]">
                      {c.new_value}
                    </div>
                  </div>

                  {c.evidence_quote && (
                    <p className="text-[11px] text-slate-400 font-mono italic truncate pt-1">
                      "{c.evidence_quote}"
                    </p>
                  )}
                </div>

                {!acked && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs border-accent-red/40 hover:bg-accent-red/10 text-accent-red"
                    onClick={() => dispatch({ type: 'ACKNOWLEDGE_CONFLICT', payload: c.id })}
                  >
                    <Check size={13} />
                    <span>Acknowledge</span>
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

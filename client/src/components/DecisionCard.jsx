import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useStore } from '@/store';

export default function DecisionCard({ decision, index }) {
  const { dispatch } = useStore();

  const highlight = useCallback(() => {
    if (decision.evidence_line_start != null) {
      dispatch({
        type: 'HIGHLIGHT_LINES',
        payload: {
          start: decision.evidence_line_start,
          end: decision.evidence_line_end ?? decision.evidence_line_start
        }
      });
    }
  }, [decision, dispatch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={highlight}
      className="rounded-xl border border-border bg-[#0B1120]/80 p-3.5 card-hover cursor-pointer hover:border-[#0063F7]/50"
    >
      <div className="flex items-start gap-2.5">
        <MessageSquare size={14} className="text-[#5BBEEF] mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-white font-medium leading-relaxed">{decision.text}</p>
          {decision.evidence_quote && (
            <p className="mt-1.5 text-[11px] text-slate-400 font-mono italic truncate">
              "{decision.evidence_quote}"
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

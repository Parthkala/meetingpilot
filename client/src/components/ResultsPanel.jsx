import { useStore } from '@/store';
import ConflictBanner from '@/components/ConflictBanner';
import ActionCard from '@/components/ActionCard';
import DecisionCard from '@/components/DecisionCard';
import Skeleton from '@/components/ui/Skeleton';
import { ListChecks, Lightbulb, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

export default function ResultsPanel() {
  const { state } = useStore();
  const isAnalyzing = !['idle', 'done', 'error'].includes(state.analysisStage);

  if (state.analysisStage === 'idle' && !state.analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12 select-none bg-[#050505]">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5BBEEF]/20 to-[#0063F7]/30 border border-[#0063F7]/40 flex items-center justify-center text-[#5BBEEF] mb-4 shadow-[0_0_20px_rgba(0,99,247,0.3)]">
          <Sparkles size={22} />
        </div>
        <h3 className="font-display text-xl text-white mb-2 tracking-wide">
          Intelligence & Execution Board
        </h3>
        <p className="text-xs text-text-secondary max-w-sm leading-relaxed mb-6">
          Ingest raw meeting dialogue to extract verified commitments, resolve ambiguities, and cross-reference organizational memory.
        </p>

        <div className="grid grid-cols-1 gap-2.5 w-full max-w-md text-left">
          <div className="p-3.5 rounded-xl border border-border bg-[#0B1120]/70 flex items-start gap-3 hover:border-slate-700 transition-colors">
            <ShieldAlert size={16} className="text-accent-red mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-white">Cross-Meeting Conflict Engine</div>
              <div className="text-[11px] text-text-secondary">Detects silent deadline slips and unannounced ownership handoffs.</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-[#0B1120]/70 flex items-start gap-3 hover:border-slate-700 transition-colors">
            <ListChecks size={16} className="text-[#00FFAC] mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-white">Structured Action Item Extraction</div>
              <div className="text-[11px] text-text-secondary">Resolves relative dates and flags vague requests for inline clarification.</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-[#0B1120]/70 flex items-start gap-3 hover:border-slate-700 transition-colors">
            <Lightbulb size={16} className="text-[#5BBEEF] mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-white">Two-Way Evidence Grounding</div>
              <div className="text-[11px] text-text-secondary">Every extracted item links directly back to verbatim transcript lines.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="p-6 space-y-5 bg-[#050505]">
        <div className="p-4 rounded-xl border border-border bg-[#0B1120] animate-pulse space-y-2">
          <div className="h-4 bg-surface-3 rounded w-1/3" />
          <div className="h-3 bg-surface-3 rounded w-2/3" />
        </div>
        <Skeleton lines={3} />
        <Skeleton lines={4} />
      </div>
    );
  }

  if (state.analysisStage === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-accent-red text-xs p-6 text-center bg-[#050505]">
        <p className="font-semibold mb-1">Analysis Failed</p>
        <p className="text-text-secondary">{state.analysisError || 'Unknown processing error'}</p>
      </div>
    );
  }

  const { decisions = [], action_items = [], conflicts = [] } = state.analysis || {};

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-[#050505]">
      {/* Conflicts Banner */}
      <ConflictBanner />

      {/* Decisions Section */}
      {decisions.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Lightbulb size={14} className="text-[#5BBEEF]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Agreed Decisions ({decisions.length})
            </h3>
          </div>
          <div className="space-y-2">
            {decisions.map((d, i) => (
              <DecisionCard key={d.id || i} decision={d} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Action Items Section */}
      {action_items.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2 px-1">
            <ListChecks size={14} className="text-[#00FFAC]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Extracted Action Items ({action_items.length})
            </h3>
          </div>
          <div className="space-y-2">
            {action_items.map((a, i) => (
              <ActionCard key={a.id || i} item={a} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

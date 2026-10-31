import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { api } from '@/api';
import TranscriptPanel from '@/components/TranscriptPanel';
import ResultsPanel from '@/components/ResultsPanel';
import MemoryPanel from '@/components/MemoryPanel';
import SyncBar from '@/components/SyncBar';
import DigestModal from '@/components/DigestModal';
import ToastContainer from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import { Compass, Mail, Sparkles, Activity } from 'lucide-react';

export default function App() {
  const { state, dispatch } = useStore();
  const [digestOpen, setDigestOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  // Initialize data and health
  useEffect(() => {
    async function init() {
      try {
        const health = await api.health();
        setHealthStatus(health);

        const [meetingsRes, kanbanRes, timelineRes] = await Promise.all([
          api.meetings().catch(() => ({ meetings: [] })),
          api.kanban().catch(() => null),
          api.timeline().catch(() => null),
        ]);

        if (meetingsRes.meetings) dispatch({ type: 'SET_MEETINGS', payload: meetingsRes.meetings });
        if (kanbanRes) dispatch({ type: 'SET_KANBAN', payload: kanbanRes });
        if (timelineRes) dispatch({ type: 'SET_TIMELINE', payload: timelineRes });
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, [dispatch]);

  const allActionItems = state.analysis?.action_items || [];
  const allDecisions = state.analysis?.decisions || [];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-surface-0 font-body select-none">
      {/* Top Header */}
      <header className="h-12 border-b border-border bg-[#050505]/95 backdrop-blur-md px-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5BBEEF] to-[#0063F7] p-[1px] shadow-[0_0_15px_rgba(0,99,247,0.4)]">
              <div className="w-full h-full bg-[#050505] rounded-[7px] flex items-center justify-center text-[#5BBEEF]">
                <Sparkles size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="font-display font-medium tracking-wide text-base text-white">
                MeetingPilot
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#00FFAC] bg-[#00FFAC]/10 px-1.5 py-0.5 rounded border border-[#00FFAC]/20">
                Agentic AI
              </span>
            </div>
          </div>
          <span className="hidden md:inline-block text-[11px] text-text-tertiary border-l border-border pl-3">
            Cross-Meeting Memory & Execution Control
          </span>
        </div>

        <div className="flex items-center gap-3">
          {healthStatus && (
            <div className="flex items-center gap-2 text-xs text-text-secondary bg-[#0B1120] px-3 py-1 rounded-full border border-border">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00FFAC] shadow-[0_0_8px_#00FFAC] animate-pulse" />
              <span className="font-medium text-text-primary">{healthStatus.tracker?.type || 'LocalKanban'}</span>
              <span className="text-text-tertiary">|</span>
              <span className="text-[11px] text-[#5BBEEF]">
                {healthStatus.demo_mode ? 'Verified Cache' : 'Gemini 2.5'}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDigestOpen(true)}
            className="hover:border-[#5BBEEF]/40 hover:text-[#5BBEEF]"
          >
            <Mail size={13} className="text-[#5BBEEF]" />
            <span>Weekly Digest</span>
          </Button>
        </div>
      </header>

      {/* Main 3-Zone Mission Control Layout */}
      <main className="flex-1 grid grid-cols-12 min-h-0 divide-x divide-border">
        {/* Zone 1: Transcript Panel (Left, 4 cols) */}
        <section className="col-span-4 h-full bg-[#050505] overflow-hidden flex flex-col">
          <TranscriptPanel />
        </section>

        {/* Zone 2: Extracted Results & Action Items (Center, 5 cols) */}
        <section className="col-span-5 h-full bg-[#050505] overflow-hidden flex flex-col">
          <ResultsPanel />
        </section>

        {/* Zone 3: Memory Timeline & Execution Tracker (Right, 3 cols) */}
        <section className="col-span-3 h-full bg-[#0B1120] overflow-hidden flex flex-col">
          <MemoryPanel />
        </section>
      </main>

      {/* Bottom Sticky Sync Bar */}
      <SyncBar />

      {/* Overlays */}
      <ToastContainer />
      <DigestModal
        isOpen={digestOpen}
        onClose={() => setDigestOpen(false)}
        actionItems={allActionItems}
        decisions={allDecisions}
      />
    </div>
  );
}

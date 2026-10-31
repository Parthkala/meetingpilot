import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Play, Loader2, Sparkles, RotateCcw, AlertCircle } from 'lucide-react';
import { useStore } from '@/store';
import { api } from '@/api';
import Button from '@/components/ui/Button';

const SEED_MEETING_1 = {
  title: 'Monday Sprint Planning',
  date: '2025-01-06',
  transcript: `Sarah: Let's go through the sprint items. Rahul, you're taking the payment API integration, right?
Rahul: Yes, I'll have the payment API integration done by Friday. I've already started on the Stripe webhook handlers.
Priya: I'm working on the onboarding flow redesign. I should have the new screens ready by next Wednesday.
Sarah: Sounds good. Let's also confirm — we're targeting the 15th for the public launch. Everyone aligned?
Rahul: Works for me. The payment flow will be tested by then.
Priya: Yes, the 15th works. I'll have onboarding done well before that.
Sarah: Great. Let's lock that in. Launch date is the 15th.`
};

const SEED_MEETING_2 = {
  title: 'Thursday Standup',
  date: '2025-01-09',
  transcript: `Sarah: Quick sync. Aman, you mentioned you could take over the payment API work?
Aman: Yeah, Rahul briefed me. I'll pick up the payment API integration. I think I can get it done by next Monday — need a bit more time to understand the existing code.
Sarah: That works. We also need to push the launch date. The 15th is too aggressive — let's move it to the 22nd.
Priya: That gives me more breathing room for onboarding too. I'll still aim for Wednesday.
Sarah: Also, someone should look into the analytics bug that keeps coming up in staging.
Aman: I can flag it but I'm not sure who owns that.
Sarah: Let's figure it out. Moving on...`
};

const STAGES = ['reading', 'extracting', 'memory', 'conflicts'];
const STAGE_LABELS = {
  reading: 'Scanning transcript text…',
  extracting: 'Extracting decisions & action items…',
  memory: 'Comparing cross-meeting historical memory…',
  conflicts: 'Detecting contradictions & deadline slips…'
};

export default function TranscriptPanel() {
  const { state, dispatch } = useStore();
  const [transcript, setTranscript] = useState(SEED_MEETING_1.transcript);
  const [title, setTitle] = useState(SEED_MEETING_1.title);
  const [date, setDate] = useState(SEED_MEETING_1.date);
  const [activePreset, setActivePreset] = useState('meeting_1');
  const [demoMode, setDemoMode] = useState(true);
  const linesRef = useRef(null);

  const lines = useMemo(() => transcript.split('\n'), [transcript]);

  const loadPreset = useCallback((presetKey) => {
    setActivePreset(presetKey);
    const data = presetKey === 'meeting_1' ? SEED_MEETING_1 : SEED_MEETING_2;
    setTitle(data.title);
    setDate(data.date);
    setTranscript(data.transcript);
    dispatch({ type: 'CLEAR_HIGHLIGHT' });
  }, [dispatch]);

  const handleReset = useCallback(async () => {
    try {
      await api.resetDemo();
      dispatch({ type: 'RESET' });
      loadPreset('meeting_1');
      const [kanban, timeline] = await Promise.all([api.kanban(), api.timeline()]);
      dispatch({ type: 'SET_KANBAN', payload: kanban });
      dispatch({ type: 'SET_TIMELINE', payload: timeline });
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Demo environment reset to fresh baseline' } });
    } catch (err) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: err.message } });
    }
  }, [dispatch, loadPreset]);

  const handleAnalyze = useCallback(async () => {
    if (!transcript.trim()) return;
    dispatch({ type: 'SET_STAGE', payload: 'loading' });

    for (const stage of STAGES) {
      dispatch({ type: 'SET_STAGE', payload: stage });
      await new Promise(r => setTimeout(r, 400));
    }

    try {
      const result = await api.analyze({
        title: title || 'Untitled Meeting',
        date: date || new Date().toISOString().slice(0, 10),
        transcript
      });
      dispatch({ type: 'SET_ANALYSIS', payload: result });

      const [kanban, timeline] = await Promise.all([api.kanban(), api.timeline()]);
      dispatch({ type: 'SET_KANBAN', payload: kanban });
      dispatch({ type: 'SET_TIMELINE', payload: timeline });

      const conflictCount = result.conflicts?.length || 0;
      if (conflictCount > 0) {
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            type: 'error',
            message: `Identified ${conflictCount} cross-meeting contradiction${conflictCount > 1 ? 's' : ''}!`
          }
        });
      } else {
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            type: 'success',
            message: `Successfully extracted ${result.action_items?.length || 0} action items & ${result.decisions?.length || 0} decisions`
          }
        });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: err.message } });
    }
  }, [transcript, title, date, dispatch]);

  useEffect(() => {
    if (!state.highlightedLines || !linesRef.current) return;
    const targetLine = state.highlightedLines.start;
    const el = linesRef.current.querySelector(`[data-line="${targetLine}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [state.highlightedLines]);

  const isAnalyzing = !['idle', 'done', 'error'].includes(state.analysisStage);

  return (
    <div className="flex flex-col h-full bg-[#050505] border-r border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0 bg-[#0B1120]/60">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-[#5BBEEF]" />
          <h2 className="font-display text-lg text-white tracking-wide">Transcript Ingestion</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            title="Reset DB to fresh demo state"
            className="flex items-center gap-1 text-[11px] text-text-tertiary hover:text-white px-2 py-1 rounded hover:bg-surface-3 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
          <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none border-l border-border pl-2.5">
            <span className="text-[11px]">Demo Mode</span>
            <button
              onClick={() => setDemoMode(d => !d)}
              className={`relative w-7 h-4 rounded-full transition-colors ${demoMode ? 'bg-[#0063F7]' : 'bg-surface-3'}`}
            >
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${demoMode ? 'left-[14px]' : 'left-0.5'}`} />
            </button>
          </label>
        </div>
      </div>

      {/* Preset Pickers */}
      <div className="px-4 py-2.5 border-b border-border bg-[#0B1120]/30 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Demo Scenarios</span>
          <span className="text-[10px] text-[#5BBEEF] font-mono">{date}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => loadPreset('meeting_1')}
            className={`px-3 py-2 text-left rounded-lg border transition-all text-xs flex flex-col gap-0.5 cursor-pointer ${
              activePreset === 'meeting_1'
                ? 'border-[#0063F7] bg-[#001C45]/80 text-white shadow-[0_0_15px_rgba(0,99,247,0.25)]'
                : 'border-border bg-surface-2/40 text-text-secondary hover:text-white hover:bg-surface-2'
            }`}
          >
            <span className="font-semibold text-white">1. Sprint Planning</span>
            <span className="text-[10px] text-text-tertiary truncate">Clean baseline commitments</span>
          </button>
          <button
            onClick={() => loadPreset('meeting_2')}
            className={`px-3 py-2 text-left rounded-lg border transition-all text-xs flex flex-col gap-0.5 relative cursor-pointer ${
              activePreset === 'meeting_2'
                ? 'border-accent-red/60 bg-accent-red/10 text-white shadow-[0_0_15px_rgba(255,59,92,0.2)]'
                : 'border-border bg-surface-2/40 text-text-secondary hover:text-white hover:bg-surface-2'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">2. Thu Standup</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-accent-red/20 text-accent-red uppercase font-bold tracking-wide">Conflicts</span>
            </div>
            <span className="text-[10px] text-text-tertiary truncate">3 memory contradictions</span>
          </button>
        </div>

        {!demoMode && (
          <div className="mt-2.5 flex gap-2">
            <input
              placeholder="Meeting title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="flex-1 text-xs"
            />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-32 text-xs"
            />
          </div>
        )}
      </div>

      {/* Editor / Line-Numbered Viewer */}
      <div className="flex-1 overflow-y-auto min-h-0 relative select-text" ref={linesRef}>
        <div className="font-mono text-[12px] leading-6 py-2">
          {lines.map((line, i) => {
            const hl = state.highlightedLines;
            const isHighlighted = hl && i >= hl.start && i <= hl.end;
            return (
              <div
                key={i}
                data-line={i}
                className={`flex px-3 transition-colors ${
                  isHighlighted ? 'line-highlight bg-[#0063F7]/20 text-white font-medium' : 'hover:bg-surface-1/60 text-slate-300'
                }`}
              >
                <span className="w-8 shrink-0 text-right pr-3 text-slate-600 select-none text-[11px] leading-6">
                  {i + 1}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-words">{line || '\u00A0'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="p-3.5 border-t border-border bg-[#0B1120]/80 shrink-0">
        {isAnalyzing ? (
          <div className="flex items-center justify-center gap-3 py-2 px-3 rounded-md bg-[#001C45]/80 border border-[#0063F7]/40">
            <Loader2 size={16} className="animate-spin text-[#5BBEEF]" />
            <span className="text-xs text-[#5BBEEF] font-medium">
              {STAGE_LABELS[state.analysisStage] || 'Processing transcript…'}
            </span>
          </div>
        ) : (
          <Button
            onClick={handleAnalyze}
            disabled={!transcript.trim()}
            variant="primary"
            className="w-full h-10 tracking-wide uppercase flex items-center justify-center gap-2 font-semibold shadow-[0_4px_20px_rgba(0,99,247,0.35)]"
          >
            <Play size={14} fill="currentColor" />
            <span>Analyze Meeting & Detect Memory</span>
          </Button>
        )}
      </div>
    </div>
  );
}

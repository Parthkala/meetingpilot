import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '@/store';
import { api } from '@/api';
import Button from '@/components/ui/Button';

export default function SyncBar() {
  const { state, dispatch } = useStore();
  const [syncedCount, setSyncedCount] = useState(0);

  const actionItems = state.analysis?.action_items || [];
  const approvedItems = actionItems.filter(a => a.status === 'approved');
  const pendingItems = actionItems.filter(a => a.status === 'pending');
  const conflicts = state.analysis?.conflicts || [];
  const unacknowledgedConflicts = conflicts.filter(c => !state.acknowledgedConflicts.has(c.id));

  const hasConflictsBlocking = unacknowledgedConflicts.length > 0;
  const canSync = approvedItems.length > 0 && !hasConflictsBlocking && !state.syncing;

  const handleSync = useCallback(async () => {
    if (!canSync) return;
    dispatch({ type: 'SET_SYNCING', payload: true });

    try {
      const itemIds = approvedItems.map(a => a.id);
      const res = await api.sync(itemIds);
      const successful = res.results.filter(r => r.success).length;
      setSyncedCount(successful);
      dispatch({ type: 'SET_SYNC_RESULTS', payload: res });

      for (const item of approvedItems) {
        dispatch({
          type: 'UPDATE_ACTION_ITEM',
          payload: { id: item.id, updates: { status: 'synced' } }
        });
      }

      const kanban = await api.kanban();
      dispatch({ type: 'SET_KANBAN', payload: kanban });

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          type: 'success',
          message: `Synced ${successful} confirmed item${successful > 1 ? 's' : ''} to Tracker Board`
        }
      });
    } catch (err) {
      dispatch({ type: 'SET_SYNCING', payload: false });
      dispatch({
        type: 'ADD_TOAST',
        payload: { type: 'error', message: err.message || 'Synchronization failed' }
      });
    }
  }, [canSync, approvedItems, dispatch]);

  return (
    <footer className="h-13 border-t border-border bg-[#0B1120]/95 backdrop-blur-md px-6 py-2.5 flex items-center justify-between shrink-0 shadow-lg select-none z-10">
      <div className="flex items-center gap-4 text-xs">
        {actionItems.length === 0 ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles size={14} className="text-[#5BBEEF]" />
            <span>Select a meeting scenario and click <strong className="text-white">Analyze Meeting</strong> to start.</span>
          </div>
        ) : (
          <>
            <span className="text-slate-300">
              <strong className="text-[#00FFAC] font-semibold">{approvedItems.length}</strong> of {actionItems.length} approved for sync
            </span>

            {pendingItems.length > 0 && (
              <span className="text-slate-500 font-mono text-[11px]">
                ({pendingItems.length} awaiting review)
              </span>
            )}

            {hasConflictsBlocking ? (
              <span className="flex items-center gap-1.5 text-accent-red font-semibold bg-accent-red/10 px-2.5 py-1 rounded-md border border-accent-red/30 shadow-[0_0_10px_rgba(255,59,92,0.15)]">
                <AlertTriangle size={13} />
                <span>{unacknowledgedConflicts.length} conflict{unacknowledgedConflicts.length > 1 ? 's' : ''} blocking execution</span>
              </span>
            ) : approvedItems.length > 0 ? (
              <span className="text-[#00FFAC] font-semibold flex items-center gap-1.5 text-xs bg-[#00FFAC]/10 px-2.5 py-1 rounded-md border border-[#00FFAC]/30">
                <CheckCircle2 size={13} />
                <span>Ready to synchronize</span>
              </span>
            ) : null}
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSync}
          disabled={!canSync}
          variant={canSync ? 'primary' : 'outline'}
          size="md"
          className="min-w-[180px] text-xs font-bold uppercase tracking-wider"
        >
          {state.syncing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Pushing to Tracker…</span>
            </>
          ) : (
            <>
              <Send size={13} />
              <span>Confirm & Sync ({approvedItems.length})</span>
            </>
          )}
        </Button>
      </div>
    </footer>
  );
}

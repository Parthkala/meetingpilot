import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, AlertCircle, Check, X, Edit3 } from 'lucide-react';
import { useStore } from '@/store';
import { api } from '@/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function ActionCard({ item, index }) {
  const { dispatch } = useStore();
  const [editing, setEditing] = useState(false);
  const [editOwner, setEditOwner] = useState(item.owner || '');
  const [editDeadline, setEditDeadline] = useState(item.deadline_iso || '');

  const highlightEvidence = useCallback(() => {
    if (item.evidence_line_start != null) {
      dispatch({
        type: 'HIGHLIGHT_LINES',
        payload: {
          start: item.evidence_line_start,
          end: item.evidence_line_end ?? item.evidence_line_start
        }
      });
    }
  }, [item, dispatch]);

  const setStatus = useCallback(async (status) => {
    try {
      await api.updateAction(item.id, { status });
      dispatch({ type: 'UPDATE_ACTION_ITEM', payload: { id: item.id, updates: { status } } });
      const kanban = await api.kanban();
      dispatch({ type: 'SET_KANBAN', payload: kanban });
    } catch (err) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: err.message } });
    }
  }, [item.id, dispatch]);

  const saveEdit = useCallback(async () => {
    try {
      const updates = {
        owner: editOwner || null,
        deadline_iso: editDeadline || null,
        needs_clarification: false,
        clarification_reason: null
      };
      await api.updateAction(item.id, updates);
      dispatch({ type: 'UPDATE_ACTION_ITEM', payload: { id: item.id, updates } });
      const kanban = await api.kanban();
      dispatch({ type: 'SET_KANBAN', payload: kanban });
      setEditing(false);
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Clarification resolved and updated' } });
    } catch (err) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: err.message } });
    }
  }, [item.id, editOwner, editDeadline, dispatch]);

  const needsClarification = item.needs_clarification;
  const isSynced = item.status === 'synced';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      onClick={highlightEvidence}
      className={`rounded-xl border p-3.5 card-hover cursor-pointer transition-all ${
        needsClarification
          ? 'border-accent-amber/40 bg-accent-amber/[0.04] shadow-[0_0_15px_rgba(255,184,0,0.1)]'
          : isSynced
          ? 'border-[#00FFAC]/30 bg-[#00FFAC]/[0.03]'
          : 'border-border bg-[#0B1120]/80 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-xs font-medium text-white leading-snug flex-1">
          {item.title}
        </h4>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge kind="priority" value={item.priority} />
          <Badge kind="status" value={item.status} />
        </div>
      </div>

      {/* Owner & Deadline row */}
      {!editing ? (
        <div className="flex items-center gap-4 text-xs text-slate-300 mb-2.5">
          <span className="flex items-center gap-1.5">
            <User size={12} className="text-slate-500" />
            <span className={!item.owner ? 'text-accent-amber italic font-medium' : 'text-slate-200'}>
              {item.owner || 'Unassigned'}
            </span>
          </span>

          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-slate-500" />
            <span className={!item.deadline_iso ? 'text-accent-amber italic font-medium' : 'text-slate-200 font-mono'}>
              {item.deadline_iso || item.deadline_raw || 'No deadline'}
            </span>
            {item.deadline_raw && item.deadline_iso && (
              <span className="text-[10px] text-slate-500">({item.deadline_raw})</span>
            )}
          </span>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-[#0F172A] border border-border mb-3 space-y-2" onClick={e => e.stopPropagation()}>
          <div className="text-[11px] font-semibold text-accent-amber flex items-center gap-1">
            <Edit3 size={11} />
            <span>Resolve Clarification Details</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              placeholder="Assignee Name"
              value={editOwner}
              onChange={e => setEditOwner(e.target.value)}
              className="flex-1 text-xs"
            />
            <input
              type="date"
              value={editDeadline}
              onChange={e => setEditDeadline(e.target.value)}
              className="w-36 text-xs"
            />
            <Button variant="primary" size="sm" onClick={saveEdit}>
              <Check size={12} />
              <span>Save</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              <X size={12} />
            </Button>
          </div>
        </div>
      )}

      {/* Confidence meter */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[10px] text-slate-500 w-16 shrink-0">Extraction</span>
        <div className="flex-1 h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(item.confidence || 0) * 100}%`,
              backgroundColor: (item.confidence || 0) > 0.8 ? '#00FFAC' : '#FFB800'
            }}
          />
        </div>
        <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
          {Math.round((item.confidence || 0) * 100)}%
        </span>
      </div>

      {/* Needs Clarification Prompt */}
      {needsClarification && !editing && (
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-accent-amber/10 border border-accent-amber/30 text-accent-amber text-xs mb-2.5">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <AlertCircle size={13} className="shrink-0" />
            <span className="text-[11px] truncate">
              {item.clarification_reason || 'Missing owner or clear timeline'}
            </span>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              setEditing(true);
            }}
            className="px-2 py-0.5 rounded bg-accent-amber/20 hover:bg-accent-amber/30 text-accent-amber text-[10px] font-semibold tracking-wide uppercase transition-colors shrink-0 cursor-pointer"
          >
            Fix Now
          </button>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40">
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          {item.status === 'pending' ? (
            <>
              <Button variant="success" size="sm" onClick={() => setStatus('approved')}>
                <Check size={12} />
                <span>Approve</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStatus('rejected')}>
                <X size={12} />
                <span>Reject</span>
              </Button>
            </>
          ) : item.status === 'approved' ? (
            <span className="text-[11px] text-[#00FFAC] font-semibold flex items-center gap-1">
              <Check size={12} /> Ready for Sync
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 capitalize">
              {item.status}
            </span>
          )}
        </div>

        {item.evidence_quote && (
          <span className="text-[10px] text-slate-500 italic font-mono truncate max-w-[200px]" title={item.evidence_quote}>
            "{item.evidence_quote}"
          </span>
        )}
      </div>

      {item.tracker_url && (
        <div className="mt-2 text-[10px] text-[#00FFAC] font-mono truncate flex items-center gap-1">
          <span>Synced to tracker:</span>
          <span className="underline">{item.tracker_url}</span>
        </div>
      )}
    </motion.div>
  );
}

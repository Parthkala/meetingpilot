import { useState } from 'react';
import { useStore } from '@/store';
import Badge from '@/components/ui/Badge';
import { User, Calendar, CheckCircle2, Clock, Inbox } from 'lucide-react';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'synced', label: 'Synced' },
  { key: 'rejected', label: 'Rejected' },
];

export default function KanbanView() {
  const { state } = useStore();
  const [filter, setFilter] = useState('all');
  const kanban = state.kanban;

  if (!kanban || kanban.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs gap-2 p-6 text-center">
        <Inbox size={28} strokeWidth={1.5} className="opacity-40 text-[#00FFAC]" />
        <span>No tasks pushed to tracker yet.<br />Approve and sync items to populate board.</span>
      </div>
    );
  }

  const columns = kanban.columns || {};
  const allItems = [
    ...(columns.pending || []),
    ...(columns.approved || []),
    ...(columns.synced || []),
    ...(columns.rejected || []),
  ];

  const displayedItems = filter === 'all' ? allItems : (columns[filter] || []);

  return (
    <div className="p-3.5 space-y-3">
      {/* Segmented Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {FILTER_TABS.map(tab => {
          const count = tab.key === 'all' ? allItems.length : (columns[tab.key]?.length || 0);
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-[#5BBEEF] to-[#0063F7] text-white font-semibold shadow-[0_2px_10px_rgba(0,99,247,0.35)]'
                  : 'bg-[#050505] text-slate-400 hover:text-white border border-border'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-80 font-mono">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Task Cards List */}
      <div className="space-y-2">
        {displayedItems.map((item, idx) => (
          <div
            key={item.id || idx}
            className={`rounded-xl border p-3.5 text-xs bg-[#050505]/70 transition-all hover:border-slate-600 ${
              item.status === 'synced' ? 'border-[#00FFAC]/30' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-semibold text-white leading-snug flex-1">
                {item.title}
              </span>
              <Badge kind="status" value={item.status} />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1.5 border-t border-border/40">
              <span className="flex items-center gap-1">
                <User size={11} className="text-slate-500" />
                <span>{item.owner || <span className="text-accent-amber italic font-medium">Unassigned</span>}</span>
              </span>

              <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                <Calendar size={11} />
                <span>{item.deadline_iso || item.deadline_raw || 'No date'}</span>
              </span>
            </div>

            {item.meeting_title && (
              <div className="mt-1.5 text-[10px] text-slate-500 truncate">
                Source: {item.meeting_title}
              </div>
            )}
          </div>
        ))}

        {displayedItems.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-500">
            No items in {filter} status.
          </div>
        )}
      </div>
    </div>
  );
}

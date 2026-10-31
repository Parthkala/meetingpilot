import { useState } from 'react';
import { useStore } from '@/store';
import KanbanView from '@/components/KanbanView';
import Timeline from '@/components/Timeline';
import { Columns3, Clock } from 'lucide-react';

export default function MemoryPanel() {
  const { state } = useStore();
  const [activeTab, setActiveTab] = useState('timeline');

  const totalDecisions = state.timeline?.decisions?.length || 0;
  const totalConflicts = state.timeline?.conflicts?.length || 0;
  const totalTasks = state.kanban?.total || 0;

  return (
    <div className="h-full flex flex-col bg-[#0B1120] border-l border-border overflow-hidden">
      {/* Tab Switcher Header */}
      <div className="p-3 border-b border-border bg-[#050505]/60 shrink-0">
        <div className="grid grid-cols-2 p-1 bg-[#050505] border border-border rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-[#001C45] border border-[#0063F7]/50 text-white shadow-[0_0_12px_rgba(0,99,247,0.3)] font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={13} className={activeTab === 'timeline' ? 'text-[#5BBEEF]' : ''} />
            <span>Memory Timeline</span>
            {(totalDecisions > 0 || totalConflicts > 0) && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1E293B] text-slate-300 font-mono">
                {totalDecisions + totalConflicts}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'kanban'
                ? 'bg-[#001C45] border border-[#0063F7]/50 text-white shadow-[0_0_12px_rgba(0,99,247,0.3)] font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns3 size={13} className={activeTab === 'kanban' ? 'text-[#00FFAC]' : ''} />
            <span>Tracker Board</span>
            {totalTasks > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#00FFAC]/15 text-[#00FFAC] font-mono">
                {totalTasks}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'timeline' ? <Timeline /> : <KanbanView />}
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DigestModal({ isOpen, onClose, actionItems = [], decisions = [] }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#0B1120] border border-[#0063F7]/40 rounded-2xl shadow-[0_0_40px_rgba(0,99,247,0.25)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-[#001C45] to-[#0B1120]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#5BBEEF] to-[#0063F7] text-white rounded-xl shadow-[0_0_15px_rgba(0,99,247,0.4)]">
                <Mail size={18} />
              </div>
              <div>
                <h3 className="font-display text-lg text-white font-medium">Weekly Execution Digest</h3>
                <p className="text-xs text-[#5BBEEF]">Autonomous briefing generated from cross-meeting memory</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Email Body preview */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm bg-[#050505]">
            <div className="border border-border rounded-xl p-4 bg-[#0B1120]/80 font-mono text-xs text-slate-400 space-y-1.5">
              <div><strong className="text-white">To:</strong> executive-sync@productspace.ai</div>
              <div><strong className="text-white">Subject:</strong> [MeetingPilot] Sprint Execution Brief & Memory Trace</div>
              <div><strong className="text-white">Timestamp:</strong> {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            {/* Decisions Recap */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5BBEEF] mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#00FFAC]" />
                Key Decisions Reached
              </h4>
              {decisions.length > 0 ? (
                <ul className="space-y-2">
                  {decisions.map((d, i) => (
                    <li key={i} className="bg-[#0B1120] border border-border rounded-lg p-3 text-xs text-white">
                      {d.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No recorded decisions for this cycle.</p>
              )}
            </div>

            {/* Action Items Overview */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#00FFAC] mb-3 flex items-center gap-1.5">
                <Clock size={14} className="text-[#00FFAC]" />
                Tracked Commitments & Owners
              </h4>
              {actionItems.length > 0 ? (
                <div className="space-y-2">
                  {actionItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#0B1120] border border-border rounded-lg p-3 text-xs">
                      <span className="font-semibold text-white">{item.title}</span>
                      <div className="flex items-center gap-3 text-slate-300">
                        <span className="text-[#5BBEEF] font-medium">{item.owner || 'Unassigned'}</span>
                        <span className="text-slate-500 font-mono text-[11px]">{item.deadline_iso || item.deadline_raw || 'No date'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No active commitments.</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-border bg-[#0B1120] flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Dismiss
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

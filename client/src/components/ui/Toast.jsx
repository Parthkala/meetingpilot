import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '@/store';

export default function ToastContainer() {
  const { state, dispatch } = useStore();

  return (
    <div className="fixed bottom-16 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {state.toasts.map(t => (
          <Toast key={t.id} toast={t} onDismiss={() => dispatch({ type: 'REMOVE_TOAST', payload: t.id })} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isSuccess = toast.type === 'success';
  const Icon = isSuccess ? CheckCircle : AlertCircle;
  const border = isSuccess ? 'border-[#00FFAC]/50 shadow-[0_0_20px_rgba(0,255,172,0.2)]' : 'border-accent-red/50 shadow-[0_0_20px_rgba(255,59,92,0.2)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`pointer-events-auto flex items-center gap-3 bg-[#0B1120] border ${border} rounded-xl px-4 py-3 shadow-2xl max-w-sm`}
    >
      <Icon size={16} className={isSuccess ? 'text-[#00FFAC] shrink-0' : 'text-accent-red shrink-0'} />
      <span className="text-xs font-medium text-white flex-1">{toast.message}</span>
      <button onClick={onDismiss} className="text-slate-500 hover:text-white cursor-pointer">
        <X size={14} />
      </button>
    </motion.div>
  );
}

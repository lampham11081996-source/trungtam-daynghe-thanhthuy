import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { toast, ToastMessage } from '../utils/toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts((prev) => [...prev, newToast]);
    });
    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div 
      className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full"
      id="toast-notification-container"
    >
      <AnimatePresence>
        {toasts.map((item) => (
          <ToastItem key={item.id} item={item} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  key?: string;
  item: ToastMessage;
  onRemove: (id: string) => void;
}

function ToastItem({ item, onRemove }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(item.id);
    }, item.duration || 4000);
    return () => clearTimeout(timer);
  }, [item, onRemove]);

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      accent: 'bg-emerald-500'
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      accent: 'bg-rose-500'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
      accent: 'bg-blue-500'
    }
  };

  const style = config[item.type] || config.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.15 } }}
      layout
      className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl border shadow-xl ${style.bg} font-sans`}
    >
      <div className="flex items-center gap-3">
        {style.icon}
        <span className="text-xs font-bold leading-relaxed">{item.message}</span>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="ml-4 shrink-0 p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

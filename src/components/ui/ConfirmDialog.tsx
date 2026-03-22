import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  message = "Apakah Anda yakin?",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = 'danger'
}: ConfirmDialogProps) => {
  if (!open) return null;

  const colors = {
    danger: { bg: 'bg-destructive/10', border: 'border-destructive/20', text: 'text-destructive', icon: 'bg-destructive/20 text-destructive', btn: 'bg-destructive text-white hover:bg-destructive/90' },
    warning: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', icon: 'bg-warning/20 text-warning', btn: 'bg-warning text-white hover:bg-warning/90' },
    info: { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', icon: 'bg-primary/20 text-primary', btn: 'bg-primary text-primary-foreground hover:opacity-90' },
  };

  const c = colors[variant];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center mb-4`}>
              {variant === 'danger' ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-display font-bold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{message}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-secondary/80 text-sm font-bold hover:bg-secondary transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${c.btn}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export { ConfirmDialog };
export type { ConfirmDialogProps };

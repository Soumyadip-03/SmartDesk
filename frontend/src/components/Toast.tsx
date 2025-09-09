import { useEffect, useCallback } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast = ({ message, onClose }: ToastProps) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(handleClose, 2000);
    return () => clearTimeout(timer);
  }, [handleClose]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl border border-green-400/30 flex items-center gap-3 animate-in slide-in-from-top-2">
      <CheckCircle className="w-5 h-5" />
      <span className="font-medium">{message}</span>
    </div>
  );
};
import { useUIStore } from '@/stores/ui';
import type { ToastType } from '@/types';

export const useToast = () => {
  const addToast = useUIStore((s) => s.addToast);

  return {
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
    warning: (message: string) => addToast('warning', message),
    show: (type: ToastType, message: string) => addToast(type, message),
  };
};

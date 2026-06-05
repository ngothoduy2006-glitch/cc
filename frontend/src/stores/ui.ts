import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Toast, ToastType } from '@/types';

interface UIState {
  darkMode: boolean;
  toasts: Toast[];
  sidebarCollapsed: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  toggleSidebar: () => void;
}

let toastCounter = 0;

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      toasts: [],
      sidebarCollapsed: false,

      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          if (next) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: next };
        }),

      setDarkMode: (dark) => {
        if (dark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ darkMode: dark });
      },

      addToast: (type, message, duration = 3500) => {
        const id = `toast-${++toastCounter}`;
        set((state) => ({
          toasts: [...state.toasts, { id, type, message, duration }],
        }));
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, duration);
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);

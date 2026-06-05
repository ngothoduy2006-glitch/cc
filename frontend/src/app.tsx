import React, { useEffect } from 'react';
import { useUIStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import Toast from '@/components/Toast';

// Umi 4: rootContainer wraps the entire application
export function rootContainer(container: React.ReactNode) {
  return <AppWrapper>{container}</AppWrapper>;
}

function AppWrapper({ children }: { children: React.ReactNode }) {
  const { darkMode } = useUIStore();
  const { token } = useAuthStore();

  // Sync dark mode on mount & changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist token to localStorage for axios interceptor
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  return (
    <>
      {children}
      <Toast />
    </>
  );
}

import React from 'react';
import { useUIStore } from '@/stores/ui';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useUIStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
      style={{
        background: darkMode ? 'rgba(79,140,255,0.15)' : 'rgba(0,0,0,0.05)',
        border: '1.5px solid var(--border)',
        color: darkMode ? '#4F8CFF' : '#F59E0B',
      }}
      title={darkMode ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
    >
      <motion.div
        key={darkMode ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {darkMode ? <MoonOutlined style={{ fontSize: 16 }} /> : <SunOutlined style={{ fontSize: 16 }} />}
      </motion.div>
    </button>
  );
}

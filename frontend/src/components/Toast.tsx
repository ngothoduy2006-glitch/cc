import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleFilled,
  WarningFilled,
  CloseOutlined,
} from '@ant-design/icons';
import { useUIStore } from '@/stores/ui';

const icons = {
  success: <CheckCircleFilled style={{ fontSize: 18 }} />,
  error:   <CloseCircleFilled style={{ fontSize: 18 }} />,
  info:    <InfoCircleFilled  style={{ fontSize: 18 }} />,
  warning: <WarningFilled     style={{ fontSize: 18 }} />,
};

const colors = {
  success: 'rgba(34,197,94,0.92)',
  error:   'rgba(239,68,68,0.92)',
  info:    'rgba(79,140,255,0.92)',
  warning: 'rgba(245,158,11,0.92)',
};

export default function Toast() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className="toast-item"
            style={{ background: colors[toast.type] }}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <span className="flex-shrink-0">{icons[toast.type]}</span>
            <span className="flex-1 text-sm">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <CloseOutlined style={{ fontSize: 12 }} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

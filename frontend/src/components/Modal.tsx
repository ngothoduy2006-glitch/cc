import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseOutlined } from '@ant-design/icons';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  footer?: React.ReactNode;
}

export default function Modal({ open, onClose, title, children, maxWidth = '560px', footer }: Props) {
  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal-content"
            style={{ maxWidth, position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Header */}
            {title && (
              <div
                className="flex items-center justify-between mb-5 pb-4 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>{title}</h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)';
                    (e.currentTarget as HTMLElement).style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                  }}
                >
                  <CloseOutlined />
                </button>
              </div>
            )}

            {/* Body */}
            <div>{children}</div>

            {/* Footer */}
            {footer && (
              <div className="mt-5 pt-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border)' }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { VoteType } from '@/types';

interface Props {
  count: number;
  userVote?: VoteType | null;
  onVote: (type: VoteType) => void;
  disabled?: boolean;
  vertical?: boolean;
}

export default function VoteButton({ count, userVote, onVote, disabled, vertical = true }: Props) {
  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-1`}>
      {/* Up vote */}
      <motion.button
        onClick={() => !disabled && onVote('up')}
        className={`vote-btn ${userVote === 'up' ? 'active-up' : ''}`}
        disabled={disabled}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.15 }}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        title="Hữu ích"
      >
        <ArrowUpOutlined style={{ fontSize: 18 }} />
      </motion.button>

      {/* Count */}
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          className="font-bold text-base min-w-[2rem] text-center"
          style={{
            color: userVote === 'up'
              ? '#4F8CFF'
              : userVote === 'down'
              ? '#ef4444'
              : 'var(--text-muted)',
          }}
          initial={{ opacity: 0, y: userVote === 'up' ? -6 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {count}
        </motion.span>
      </AnimatePresence>

      {/* Down vote */}
      <motion.button
        onClick={() => !disabled && onVote('down')}
        className={`vote-btn ${userVote === 'down' ? 'active-down' : ''}`}
        disabled={disabled}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.15 }}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        title="Không hữu ích"
      >
        <ArrowDownOutlined style={{ fontSize: 18 }} />
      </motion.button>
    </div>
  );
}

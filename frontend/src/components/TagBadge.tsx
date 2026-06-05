import React from 'react';
import type { Tag } from '@/types';

interface Props {
  tag: Tag;
  onClick?: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}

export default function TagBadge({ tag, onClick, size = 'sm' }: Props) {
  const bg = tag.color ? `${tag.color}20` : 'rgba(79,140,255,0.12)';
  const border = tag.color ? `${tag.color}40` : 'rgba(79,140,255,0.25)';
  const text = tag.color || '#4F8CFF';

  return (
    <span
      onClick={onClick}
      className="tag-badge transition-all duration-200"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color: text,
        fontSize: size === 'sm' ? '0.7rem' : '0.8rem',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        cursor: onClick ? 'pointer' : 'default',
      }}
      title={tag.description}
    >
      #{tag.name}
    </span>
  );
}

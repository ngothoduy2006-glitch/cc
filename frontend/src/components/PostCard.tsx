import React from 'react';
import { history } from '@umijs/max';
import { motion } from 'framer-motion';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MessageOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { Post } from '@/types';
import TagBadge from './TagBadge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Props {
  post: Post;
  index?: number;
}

const roleMap: Record<string, { label: string; color: string }> = {
  student:  { label: 'Sinh viên', color: '#4F8CFF' },
  lecturer: { label: 'Giảng viên', color: '#7B61FF' },
  admin:    { label: 'Admin',     color: '#FF6B6B' },
};

export default function PostCard({ post, index = 0 }: Props) {
  const role = post.author?.role ? roleMap[post.author.role] : roleMap.student;

  return (
    <motion.div
      className="glass-card p-5 cursor-pointer group"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
      }}
      onClick={() => history.push(`/post/${post.id}`)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -3, boxShadow: '0 16px 48px var(--shadow)' }}
    >
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags?.map((tag) => (
          <TagBadge key={tag.id} tag={tag} onClick={(e) => {
            e.stopPropagation();
            history.push(`/forum?tag=${tag.id}`);
          }} />
        ))}
      </div>

      {/* Title */}
      <h3
        className="font-bold text-base leading-snug mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-primary-500"
        style={{ color: 'var(--text)' }}
      >
        {post.title}
      </h3>

      {/* Content preview */}
      <p
        className="text-sm leading-relaxed mb-4 line-clamp-2"
        style={{ color: 'var(--text-muted)' }}
        dangerouslySetInnerHTML={{
          __html: post.content.replace(/<[^>]+>/g, '').slice(0, 160),
        }}
      />

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Author info */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${role.color}, ${role.color}99)` }}
          >
            {post.author?.name?.charAt(0) || <UserOutlined />}
          </div>
          <div>
            <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
              {post.author?.name || 'Ẩn danh'}
            </span>
            <span
              className="ml-1.5 text-xs px-1.5 py-0.5 rounded font-semibold text-white"
              style={{ background: role.color, fontSize: '0.65rem' }}
            >
              {role.label}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          {/* Votes */}
          <span className="flex items-center gap-1">
            <ArrowUpOutlined
              style={{
                color: post.votes > 0 ? '#4F8CFF' : post.votes < 0 ? '#ef4444' : 'var(--text-light)',
              }}
            />
            <span
              style={{ color: post.votes > 0 ? '#4F8CFF' : post.votes < 0 ? '#ef4444' : 'var(--text-muted)' }}
              className="font-semibold"
            >
              {post.votes}
            </span>
          </span>

          {/* Answers */}
          <span className="flex items-center gap-1">
            <MessageOutlined />
            <span className="font-medium">{post.answersCount}</span>
          </span>

          {/* Views */}
          <span className="flex items-center gap-1">
            <EyeOutlined />
            <span>{post.views}</span>
          </span>

          {/* Time */}
          <span className="flex items-center gap-1">
            <ClockCircleOutlined />
            <span>{dayjs(post.createdAt).fromNow()}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

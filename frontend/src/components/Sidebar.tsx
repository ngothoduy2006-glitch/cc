import React from 'react';
import { history } from '@umijs/max';
import { motion } from 'framer-motion';
import { FireFilled, TagOutlined, BookOutlined, UserOutlined } from '@ant-design/icons';
import type { Tag, Post, User } from '@/types';
import TagBadge from './TagBadge';

interface Props {
  tags?: Tag[];
  hotPosts?: Post[];
  topUsers?: User[];
  selectedTagId?: string;
  onTagSelect?: (tagId: string) => void;
}

export default function Sidebar({ tags = [], hotPosts = [], topUsers = [], selectedTagId, onTagSelect }: Props) {
  return (
    <aside className="space-y-4">
      {/* Tags */}
      <div
        className="rounded-2xl p-5 border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TagOutlined style={{ color: '#4F8CFF' }} />
          <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>Chủ đề & Tags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 15).map((tag) => (
            <motion.div key={tag.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <TagBadge
                tag={tag}
                onClick={() => onTagSelect?.(tag.id)}
                size={selectedTagId === tag.id ? 'md' : 'sm'}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hot posts */}
      {hotPosts.length > 0 && (
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FireFilled style={{ color: '#FF6B35' }} />
            <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>Bài hot</h3>
          </div>
          <div className="space-y-3">
            {hotPosts.slice(0, 5).map((post, i) => (
              <motion.button
                key={post.id}
                onClick={() => history.push(`/post/${post.id}`)}
                className="w-full text-left group"
                whileHover={{ x: 3 }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="text-xs font-bold w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: i < 3 ? 'linear-gradient(135deg, #4F8CFF, #7B61FF)' : 'var(--bg)',
                      color: i < 3 ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <p
                    className="text-xs leading-snug line-clamp-2 transition-colors duration-150 group-hover:text-primary-500"
                    style={{ color: 'var(--text)' }}
                  >
                    {post.title}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Top users */}
      {topUsers.length > 0 && (
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <UserOutlined style={{ color: '#7B61FF' }} />
            <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>Thành viên nổi bật</h3>
          </div>
          <div className="space-y-3">
            {topUsers.slice(0, 5).map((user) => (
              <button
                key={user.id}
                onClick={() => history.push(`/profile/${user.id}`)}
                className="w-full flex items-center gap-2.5 group"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
                >
                  {user.name?.charAt(0)}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-medium truncate group-hover:text-primary-500 transition-colors" style={{ color: 'var(--text)' }}>
                    {user.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {user.role === 'lecturer' ? 'Giảng viên' : 'Sinh viên'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

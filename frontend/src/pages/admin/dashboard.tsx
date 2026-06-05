import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserOutlined, FileTextOutlined, MessageOutlined,
  TagOutlined, RiseOutlined, TeamOutlined,
} from '@ant-design/icons';
import { adminStatsAPI, adminPostsAPI, adminUsersAPI } from '@/services/api';
import type { AdminStats, Post, User } from '@/types';
import { history } from '@umijs/max';
import { StatCardSkeleton } from '@/components/LoadingSkeleton';
import dayjs from 'dayjs';

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminStatsAPI.getStats(),
      adminPostsAPI.getPosts({ limit: 5 }),
      adminUsersAPI.getUsers({ limit: 5 }),
    ])
      .then(([statsRes, postsRes, usersRes]) => {
        setStats((statsRes.data as any) || null);
        setRecentPosts((postsRes.data as any)?.data || []);
        setRecentUsers((usersRes.data as any)?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards: StatCard[] = stats
    ? [
        { label: 'Tổng bài viết', value: stats.totalPosts, icon: <FileTextOutlined />, color: '#4F8CFF', sub: `+${stats.postsToday || 0} hôm nay` },
        { label: 'Người dùng', value: stats.totalUsers, icon: <TeamOutlined />, color: '#7B61FF', sub: `${stats.activeUsers || 0} đang hoạt động` },
        { label: 'Bình luận', value: stats.totalComments, icon: <MessageOutlined />, color: '#4DE2E2', sub: undefined },
        { label: 'Tags', value: stats.totalTags, icon: <TagOutlined />, color: '#FF6B35', sub: undefined },
      ]
    : [];

  const roleMap: Record<string, { label: string; color: string }> = {
    student:  { label: 'SV', color: '#4F8CFF' },
    lecturer: { label: 'GV', color: '#7B61FF' },
    admin:    { label: 'Admin', color: '#FF6B6B' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Dashboard</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tổng quan hệ thống</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card, i) => (
            <motion.div
              key={card.label}
              className="rounded-2xl p-6 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3, boxShadow: '0 12px 40px var(--shadow)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white text-xl"
                style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}99)` }}
              >
                {card.icon}
              </div>
              <p className="text-3xl font-black mb-1" style={{ color: 'var(--text)' }}>
                {card.value.toLocaleString()}
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
              {card.sub && (
                <p className="text-xs mt-1" style={{ color: card.color }}>{card.sub}</p>
              )}
            </motion.div>
          ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent posts */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold" style={{ color: 'var(--text)' }}>Bài viết gần đây</h2>
            <button
              onClick={() => history.push('/admin/posts')}
              className="text-xs font-medium"
              style={{ color: '#4F8CFF' }}
            >
              Xem tất cả →
            </button>
          </div>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                onClick={() => history.push(`/post/${post.id}`)}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(79,140,255,0.12)' }}
                >
                  <FileTextOutlined style={{ color: '#4F8CFF', fontSize: 14 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{post.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {dayjs(post.createdAt).format('DD/MM/YYYY')} · {post.votes} votes
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                  style={{
                    background: post.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    color: post.status === 'active' ? '#22c55e' : '#ef4444',
                  }}
                >
                  {post.status === 'active' ? 'Hiển thị' : 'Ẩn'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold" style={{ color: 'var(--text)' }}>Người dùng mới</h2>
            <button
              onClick={() => history.push('/admin/users')}
              className="text-xs font-medium"
              style={{ color: '#4F8CFF' }}
            >
              Xem tất cả →
            </button>
          </div>
          <div className="space-y-3">
            {recentUsers.map((u) => {
              const r = roleMap[u.role] || roleMap.student;
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}88)` }}
                  >
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{u.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
                      style={{ background: r.color }}
                    >
                      {r.label}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: u.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: u.status === 'active' ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {u.status === 'active' ? 'Hoạt động' : 'Khóa'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

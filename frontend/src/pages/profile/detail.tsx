import React, { useEffect, useState } from 'react';
import { useParams } from '@umijs/max';
import { motion } from 'framer-motion';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { adminUsersAPI, postsAPI } from '@/services/api';
import type { User, Post } from '@/types';
import PostCard from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/LoadingSkeleton';
import dayjs from 'dayjs';

const roleMap: Record<string, { label: string; color: string }> = {
  student:  { label: 'Sinh viên', color: '#4F8CFF' },
  lecturer: { label: 'Giảng viên', color: '#7B61FF' },
  admin:    { label: 'Admin',     color: '#FF6B6B' },
};

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      adminUsersAPI.getUserById(id).then((r) => r.data),
      postsAPI.getPosts({ limit: 20 }).then((r) => (r.data as any)?.data || []),
    ])
      .then(([userData, postsData]) => {
        setUser(userData as User);
        setPosts((postsData as Post[]).filter((p) => p.authorId === id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div className="skeleton h-40 w-full rounded-3xl" />
        {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!user) return (
    <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>Không tìm thấy người dùng</div>
  );

  const role = roleMap[user.role] || roleMap.student;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile header */}
      <motion.div
        className="rounded-3xl p-8 border mb-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${role.color}, ${role.color}88)` }}
          >
            {user.name.charAt(0)}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>{user.name}</h1>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: role.color }}
              >
                {role.label}
              </span>
              {user.code && (
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.code}</span>
              )}
            </div>

            {user.bio && (
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              {user.faculty && <span>🏫 {user.faculty}</span>}
              {user.department && <span>📚 {user.department}</span>}
              {user.class && <span>🎓 {user.class}</span>}
              <span className="flex items-center gap-1">
                <CalendarOutlined /> Tham gia {dayjs(user.createdAt).format('MM/YYYY')}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            {[
              { label: 'Bài đăng', value: posts.length },
              { label: 'Votes', value: posts.reduce((sum, p) => sum + p.votes, 0) },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-gradient">{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Posts */}
      <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--text)' }}>
        Câu hỏi đã đăng ({posts.length})
      </h2>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p style={{ color: 'var(--text-muted)' }}>Chưa có câu hỏi nào</p>
          </div>
        ) : posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookmarkFilled, LoadingOutlined } from '@ant-design/icons';
import { postsAPI } from '@/services/api';
import type { Post } from '@/types';
import PostCard from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/LoadingSkeleton';
import { useAuthStore } from '@/stores/auth';
import { history } from '@umijs/max';

export default function SavedPostsPage() {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/auth/login');
      return;
    }
    postsAPI.getSavedPosts()
      .then((r) => setPosts((r.data as any) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
          >
            <BookmarkFilled style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Bài đã lưu</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{posts.length} câu hỏi</p>
          </div>
        </div>

        <div className="space-y-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
            : posts.length === 0
            ? (
              <div className="text-center py-16 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="text-5xl mb-4">🔖</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>Chưa lưu bài nào</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Lưu các câu hỏi hay để xem lại sau</p>
                <button
                  onClick={() => history.push('/forum')}
                  className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
                >
                  Khám phá diễn đàn
                </button>
              </div>
            )
            : posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)
          }
        </div>
      </motion.div>
    </div>
  );
}

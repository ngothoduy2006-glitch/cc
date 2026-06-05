import React, { useEffect, useState, useCallback } from 'react';
import { history } from '@umijs/max';
import { motion } from 'framer-motion';
import {
  SearchOutlined, PlusOutlined, FireFilled,
  ClockCircleOutlined, MessageOutlined, FilterOutlined,
} from '@ant-design/icons';
import { postsAPI, tagsAPI } from '@/services/api';
import type { Post, Tag } from '@/types';
import PostCard from '@/components/PostCard';
import Sidebar from '@/components/Sidebar';
import TagBadge from '@/components/TagBadge';
import { PostCardSkeleton } from '@/components/LoadingSkeleton';
import { useAuthStore } from '@/stores/auth';

type SortKey = 'newest' | 'hot' | 'unanswered';

const SORT_OPTIONS: { key: SortKey; label: string; icon: React.ReactNode }[] = [
  { key: 'newest', label: 'Mới nhất',   icon: <ClockCircleOutlined /> },
  { key: 'hot',    label: 'Hot nhất',   icon: <FireFilled /> },
  { key: 'unanswered', label: 'Chưa trả lời', icon: <MessageOutlined /> },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await postsAPI.getPosts({
        search: search || undefined,
        tagId: selectedTag || undefined,
        sort,
        page,
        limit: 10,
      });
      const d = res.data as any;
      setPosts(d.data || []);
      setTotal(d.pagination?.total || 0);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedTag, sort, page]);

  useEffect(() => { tagsAPI.getTags().then((r) => setTags(r.data as any || [])).catch(() => {}); }, []);
  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-bg py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
              style={{ background: 'rgba(79,140,255,0.12)', border: '1px solid rgba(79,140,255,0.25)', color: '#4F8CFF' }}>
              🎓 Cộng đồng học tập HUST
            </div>

            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight" style={{ color: 'var(--text)' }}>
              Diễn Đàn{' '}
              <span className="text-gradient">Hỏi Đáp</span>
              <br />Sinh Viên
            </h1>

            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Nơi sinh viên và giảng viên cùng đặt câu hỏi, chia sẻ kiến thức và học hỏi lẫn nhau.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isAuthenticated ? (
                <motion.button
                  onClick={() => history.push('/post/create')}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base btn-ripple"
                  style={{
                    background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)',
                    boxShadow: '0 8px 32px rgba(79,140,255,0.4)',
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <PlusOutlined />
                  Đặt câu hỏi ngay
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={() => history.push('/auth/register')}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base"
                    style={{
                      background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)',
                      boxShadow: '0 8px 32px rgba(79,140,255,0.4)',
                    }}
                    whileHover={{ scale: 1.03 }}
                  >
                    Tham gia ngay miễn phí
                  </motion.button>
                  <motion.button
                    onClick={() => history.push('/auth/login')}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    whileHover={{ scale: 1.02 }}
                  >
                    Đăng nhập
                  </motion.button>
                </>
              )}
            </div>

            {/* Stats bar */}
            <div className="flex justify-center gap-8 mt-10">
              {[
                { label: 'Câu hỏi', value: total.toString() || '0' },
                { label: 'Sinh viên', value: '100+' },
                { label: 'Giảng viên', value: '10+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-black text-gradient">{stat.value}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column — Posts */}
          <div className="flex-1 min-w-0">
            {/* Search + Filter bar */}
            <div
              className="rounded-2xl p-4 mb-5 border flex flex-col sm:flex-row gap-3"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <SearchOutlined
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)', fontSize: 14 }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm câu hỏi..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                    style={{
                      background: 'var(--bg)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--text)',
                      outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                  />
                </div>
              </form>

              <div className="flex gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setSort(opt.key); setPage(1); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: sort === opt.key ? 'linear-gradient(135deg, #4F8CFF, #7B61FF)' : 'var(--bg)',
                      color: sort === opt.key ? '#fff' : 'var(--text-muted)',
                      border: sort === opt.key ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {opt.icon}
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tag filter pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => { setSelectedTag(''); setPage(1); }}
                  className="tag-badge"
                  style={{
                    background: !selectedTag ? 'rgba(79,140,255,0.15)' : 'transparent',
                    border: `1px solid ${!selectedTag ? 'rgba(79,140,255,0.4)' : 'var(--border)'}`,
                    color: !selectedTag ? '#4F8CFF' : 'var(--text-muted)',
                    padding: '4px 12px',
                  }}
                >
                  Tất cả
                </button>
                {tags.slice(0, 10).map((tag) => (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    size="sm"
                    onClick={() => { setSelectedTag(selectedTag === tag.id ? '' : tag.id); setPage(1); }}
                  />
                ))}
              </div>
            )}

            {/* Post count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {total > 0 ? `${total} câu hỏi` : 'Không có câu hỏi'}
              </p>
              {isAuthenticated && (
                <button
                  onClick={() => history.push('/post/create')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
                >
                  <PlusOutlined /> Đặt câu hỏi
                </button>
              )}
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)
                : posts.length === 0
                ? (
                  <div className="text-center py-16 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>Không tìm thấy câu hỏi</h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Hãy là người đầu tiên đặt câu hỏi này!</p>
                    {isAuthenticated && (
                      <button
                        onClick={() => history.push('/post/create')}
                        className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm"
                        style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
                      >
                        Đặt câu hỏi ngay
                      </button>
                    )}
                  </div>
                )
                : posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
              }
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    borderColor: 'var(--border)', color: 'var(--text-muted)',
                    opacity: page === 1 ? 0.4 : 1,
                  }}
                >
                  ← Trước
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-10 h-10 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: page === p ? 'linear-gradient(135deg, #4F8CFF, #7B61FF)' : 'var(--surface)',
                        color: page === p ? '#fff' : 'var(--text-muted)',
                        border: page === p ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    borderColor: 'var(--border)', color: 'var(--text-muted)',
                    opacity: page === totalPages ? 0.4 : 1,
                  }}
                >
                  Sau →
                </button>
              </div>
            )}
          </div>

          {/* Right column — Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-20">
              <Sidebar
                tags={tags}
                hotPosts={posts.filter((p) => p.votes > 0).sort((a, b) => b.votes - a.votes)}
                selectedTagId={selectedTag}
                onTagSelect={(id) => { setSelectedTag(selectedTag === id ? '' : id); setPage(1); }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

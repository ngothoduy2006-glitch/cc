import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { postsAPI, tagsAPI } from '@/services/api';
import type { Post, Tag } from '@/types';
import PostCard from '@/components/PostCard';
import TagBadge from '@/components/TagBadge';
import { PostCardSkeleton } from '@/components/LoadingSkeleton';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const tagFilter = searchParams.get('tag') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(query);

  const fetchResults = useCallback(async () => {
    if (!query && !tagFilter) return;
    setLoading(true);
    try {
      const res = await postsAPI.getPosts({ search: query || undefined, tagId: tagFilter || undefined, limit: 20 });
      const d = res.data as any;
      setPosts(d.data || []);
      setTotal(d.pagination?.total || 0);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [query, tagFilter]);

  useEffect(() => {
    tagsAPI.getTags().then((r) => setTags((r.data as any) || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchResults();
    setSearch(query);
  }, [fetchResults, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (search.trim()) p.set('q', search.trim());
    setSearchParams(p);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-black mb-6" style={{ color: 'var(--text)' }}>
          🔍 Tìm kiếm
        </h1>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl">
            <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)', fontSize: 18 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm câu hỏi, chủ đề..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-base"
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                color: 'var(--text)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </form>

        {/* Tag filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSearchParams(query ? new URLSearchParams({ q: query }) : new URLSearchParams())}
            className="tag-badge"
            style={{
              background: !tagFilter ? 'rgba(79,140,255,0.12)' : 'transparent',
              border: `1px solid ${!tagFilter ? 'rgba(79,140,255,0.4)' : 'var(--border)'}`,
              color: !tagFilter ? '#4F8CFF' : 'var(--text-muted)',
              padding: '4px 12px',
            }}
          >
            Tất cả tags
          </button>
          {tags.slice(0, 12).map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onClick={() => {
                const p = new URLSearchParams();
                if (query) p.set('q', query);
                if (tagFilter !== tag.id) p.set('tag', tag.id);
                setSearchParams(p);
              }}
            />
          ))}
        </div>

        {/* Results header */}
        {(query || tagFilter) && (
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Đang tìm kiếm...' : `${total} kết quả cho "${query || tags.find((t) => t.id === tagFilter)?.name || ''}"`}
          </p>
        )}

        {/* Results */}
        <div className="space-y-4">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)
            : !query && !tagFilter
            ? (
              <div className="text-center py-16 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="text-5xl mb-4">🔍</div>
                <p style={{ color: 'var(--text-muted)' }}>Nhập từ khóa để tìm kiếm</p>
              </div>
            )
            : posts.length === 0
            ? (
              <div className="text-center py-16 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="text-5xl mb-4">😢</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>Không tìm thấy kết quả</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Thử từ khóa khác hoặc xem tất cả câu hỏi</p>
              </div>
            )
            : posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
          }
        </div>
      </motion.div>
    </div>
  );
}

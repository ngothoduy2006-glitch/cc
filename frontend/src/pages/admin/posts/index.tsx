import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  EyeOutlined, DeleteOutlined, SearchOutlined,
  FileTextOutlined, LoadingOutlined,
} from '@ant-design/icons';
import { adminPostsAPI } from '@/services/api';
import type { Post } from '@/types';
import Modal from '@/components/Modal';
import TagBadge from '@/components/TagBadge';
import { useToast } from '@/hooks/useToast';
import { history } from '@umijs/max';
import dayjs from 'dayjs';

export default function AdminPostsPage() {
  const toast = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminPostsAPI.getPosts({ search: search || undefined, status: statusFilter || undefined, page, limit: 10 });
      const d = res.data as any;
      setPosts(d.data || []);
      setTotal(d.pagination?.total || 0);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleViewDetail = async (id: string) => {
    try {
      const res = await adminPostsAPI.getPostById(id);
      setViewPost(res.data as any);
    } catch {
      toast.error('Không thể tải bài viết');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminPostsAPI.deletePost(id);
      setPosts((p) => p.filter((x) => x.id !== id));
      setTotal((t) => t - 1);
      toast.success('Đã xóa bài viết');
    } catch {
      toast.error('Không thể xóa bài viết');
    } finally {
      setConfirmDelete(null);
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Quản lý bài đăng</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{total} bài viết</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="relative flex-1">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tiêu đề bài viết..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm"
            style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)', outline: 'none' }}
            onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm"
          style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)', outline: 'none' }}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hiển thị</option>
          <option value="hidden">Ẩn</option>
          <option value="deleted">Đã xóa</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                {['Bài viết', 'Tác giả', 'Tags', 'Votes', 'Views', 'Ngày', 'Hành động'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
                : posts.map((post) => (
                  <motion.tr key={post.id} style={{ borderBottom: '1px solid var(--border)' }}
                    whileHover={{ background: 'rgba(79,140,255,0.03)' }}>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: 'rgba(79,140,255,0.1)' }}>
                          <FileTextOutlined style={{ color: '#4F8CFF', fontSize: 12 }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-2" style={{ color: 'var(--text)' }}>{post.title}</p>
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium mt-1 inline-block"
                            style={{
                              background: post.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              color: post.status === 'active' ? '#22c55e' : '#ef4444',
                            }}>
                            {post.status === 'active' ? 'Hiển thị' : post.status === 'hidden' ? 'Ẩn' : 'Xóa'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {post.author?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {post.tags?.slice(0, 2).map((t) => <TagBadge key={t.id} tag={t} />)}
                        {(post.tags?.length || 0) > 2 && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{(post.tags?.length || 0) - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: post.votes > 0 ? '#4F8CFF' : 'var(--text-muted)' }}>
                      {post.votes}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{post.views}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {dayjs(post.createdAt).format('DD/MM/YY')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleViewDetail(post.id)}
                          className="p-1.5 rounded-lg transition-all" style={{ color: '#4F8CFF' }} title="Xem chi tiết">
                          <EyeOutlined />
                        </button>
                        <button onClick={() => setConfirmDelete(post.id)}
                          className="p-1.5 rounded-lg transition-all" style={{ color: '#ef4444' }} title="Xóa">
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {!loading && posts.length === 0 && (
          <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>
            <FileTextOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <p>Không tìm thấy bài viết</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', opacity: page === 1 ? 0.4 : 1 }}>← Trước</button>
          <span className="px-4 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>Trang {page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', opacity: page === totalPages ? 0.4 : 1 }}>Sau →</button>
        </div>
      )}

      {/* View detail modal */}
      <Modal open={!!viewPost} onClose={() => setViewPost(null)} title="Chi tiết bài viết" maxWidth="700px"
        footer={
          <button onClick={() => setViewPost(null)} className="px-5 py-2.5 rounded-xl text-sm border font-medium"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Đóng</button>
        }>
        {viewPost && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {viewPost.tags?.map((t) => <TagBadge key={t.id} tag={t} size="md" />)}
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{viewPost.title}</h2>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>👤 {viewPost.author?.name}</span>
              <span>👍 {viewPost.votes} votes</span>
              <span>👁 {viewPost.views} views</span>
              <span>💬 {viewPost.answersCount} trả lời</span>
            </div>
            <div className="p-4 rounded-xl border post-content text-sm"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              dangerouslySetInnerHTML={{ __html: viewPost.content }} />
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setViewPost(null); history.push(`/post/${viewPost.id}`); }}
                className="px-4 py-2 rounded-xl text-sm font-medium border"
                style={{ borderColor: 'rgba(79,140,255,0.3)', color: '#4F8CFF', background: 'rgba(79,140,255,0.05)' }}>
                Xem trang public →
              </button>
              <button onClick={() => { setConfirmDelete(viewPost.id); setViewPost(null); }}
                className="px-4 py-2 rounded-xl text-sm font-medium border"
                style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444', background: 'rgba(239,68,68,0.05)' }}>
                Xóa bài
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm delete */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Xác nhận xóa"
        footer={
          <>
            <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 rounded-xl text-sm border font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Hủy</button>
            <button onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#ef4444' }}>Xóa</button>
          </>
        }>
        <p style={{ color: 'var(--text-muted)' }}>Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
}

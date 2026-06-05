import React, { useEffect, useState } from 'react';
import { history } from '@umijs/max';
import { motion } from 'framer-motion';
import { ArrowLeftOutlined, SendOutlined, LoadingOutlined, EyeOutlined } from '@ant-design/icons';
import { postsAPI, tagsAPI } from '@/services/api';
import type { Tag } from '@/types';
import TagBadge from '@/components/TagBadge';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/hooks/useToast';

const CATEGORIES = [
  { key: 'tech',    label: '💻 Kỹ thuật / Lập trình' },
  { key: 'admin',   label: '📋 Học tập / Quy chế' },
  { key: 'career',  label: '💼 Thực tập / Việc làm' },
  { key: 'general', label: '💬 Chung' },
];

export default function CreatePostPage() {
  const { isAuthenticated } = useAuthStore();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt câu hỏi');
      history.push('/auth/login');
      return;
    }
    tagsAPI.getTags().then((r) => setTags((r.data as any) || [])).catch(() => {});
  }, [isAuthenticated]);

  const validate = () => {
    const e: typeof errors = {};
    if (!title.trim()) e.title = 'Tiêu đề không được để trống';
    else if (title.trim().length < 10) e.title = 'Tiêu đề ít nhất 10 ký tự';
    if (!content.trim()) e.content = 'Nội dung không được để trống';
    else if (content.trim().length < 20) e.content = 'Nội dung ít nhất 20 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const selectedTags = selectedTagIds
        .map((id) => tags.find((t) => t.id === id)?.name)
        .filter((name): name is string => !!name);

      const res = await postsAPI.createPost({
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        category,
      });
      const created = res.data as any;
      toast.success('Đã đăng câu hỏi thành công!');
      history.push(`/post/${created.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể đăng bài');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <motion.button
        onClick={() => history.back()}
        className="flex items-center gap-2 mb-6 text-sm font-medium"
        style={{ color: 'var(--text-muted)' }}
        whileHover={{ x: -3 }}
      >
        <ArrowLeftOutlined /> Quay lại
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text)' }}>
            ✍️ Đặt câu hỏi
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Mô tả câu hỏi của bạn chi tiết để nhận được câu trả lời tốt nhất.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <label className="block font-semibold text-sm mb-2" style={{ color: 'var(--text)' }}>
              Tiêu đề <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })); }}
              placeholder="Câu hỏi của bạn là gì? Ví dụ: Làm thế nào để..."
              className="w-full text-base rounded-xl p-3"
              style={{
                background: 'var(--bg)',
                border: `1.5px solid ${errors.title ? '#ef4444' : 'var(--border)'}`,
                color: 'var(--text)',
                outline: 'none',
                fontFamily: 'inherit',
                fontWeight: 500,
              }}
              onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.title ? '#ef4444' : 'var(--border)'; }}
            />
            {errors.title && <p className="mt-1.5 text-xs" style={{ color: '#ef4444' }}>{errors.title}</p>}
            <p className="mt-1.5 text-xs" style={{ color: 'var(--text-light)' }}>
              {title.length} ký tự (tối thiểu 10)
            </p>
          </div>

          {/* Content */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                Nội dung chi tiết <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{
                  borderColor: 'var(--border)',
                  color: preview ? '#4F8CFF' : 'var(--text-muted)',
                  background: preview ? 'rgba(79,140,255,0.08)' : 'transparent',
                }}
              >
                <EyeOutlined />
                {preview ? 'Chỉnh sửa' : 'Xem trước'}
              </button>
            </div>

            {preview ? (
              <div
                className="min-h-[200px] rounded-xl p-4 border post-content text-sm"
                style={{
                  background: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
                dangerouslySetInnerHTML={{ __html: content || '<em style="color: var(--text-muted)">Chưa có nội dung...</em>' }}
              />
            ) : (
              <textarea
                value={content}
                onChange={(e) => { setContent(e.target.value); setErrors((p) => ({ ...p, content: undefined })); }}
                placeholder="Mô tả chi tiết vấn đề của bạn. Hỗ trợ HTML: <p>, <code>, <pre>, <strong>..."
                rows={10}
                className="w-full text-sm rounded-xl p-4 resize-y"
                style={{
                  background: 'var(--bg)',
                  border: `1.5px solid ${errors.content ? '#ef4444' : 'var(--border)'}`,
                  color: 'var(--text)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  lineHeight: 1.7,
                  minHeight: 200,
                }}
                onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; }}
                onBlur={(e) => { e.target.style.borderColor = errors.content ? '#ef4444' : 'var(--border)'; }}
              />
            )}
            {errors.content && <p className="mt-1.5 text-xs" style={{ color: '#ef4444' }}>{errors.content}</p>}
          </div>

          {/* Category */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <label className="block font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>
              Danh mục
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all text-left"
                  style={{
                    background: category === cat.key ? 'rgba(79,140,255,0.12)' : 'var(--bg)',
                    border: `1.5px solid ${category === cat.key ? 'rgba(79,140,255,0.4)' : 'var(--border)'}`,
                    color: category === cat.key ? '#4F8CFF' : 'var(--text-muted)',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div
              className="rounded-2xl p-6 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <label className="block font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>
                Tags <span className="font-normal text-xs" style={{ color: 'var(--text-muted)' }}>
                  (chọn tối đa 5)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id);
                  return (
                    <motion.button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!selected && selectedTagIds.length >= 5}
                      style={{ opacity: (!selected && selectedTagIds.length >= 5) ? 0.4 : 1 }}
                    >
                      <TagBadge
                        tag={tag}
                        size={selected ? 'md' : 'sm'}
                      />
                    </motion.button>
                  );
                })}
              </div>
              {selectedTagIds.length > 0 && (
                <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Đã chọn: {selectedTagIds.length}/5
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => history.back()}
              className="px-6 py-3 rounded-xl font-medium text-sm border transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              Hủy
            </button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white text-sm"
              style={{
                background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)',
                boxShadow: '0 8px 24px rgba(79,140,255,0.4)',
                opacity: loading ? 0.8 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? <LoadingOutlined /> : <SendOutlined />}
              {loading ? 'Đang đăng...' : 'Đăng câu hỏi'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagOutlined, LoadingOutlined } from '@ant-design/icons';
import { adminTagsAPI } from '@/services/api';
import type { Tag, AdminTagForm } from '@/types';
import Modal from '@/components/Modal';
import { useToast } from '@/hooks/useToast';

const PRESET_COLORS = [
  '#4F8CFF', '#7B61FF', '#4DE2E2', '#FF6B6B', '#22c55e',
  '#f59e0b', '#eb2f96', '#52c41a', '#3776ab', '#f05032',
];

const emptyForm: AdminTagForm = { name: '', color: '#4F8CFF', description: '' };

export default function AdminTagsPage() {
  const toast = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [form, setForm] = useState<AdminTagForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    adminTagsAPI.getTags()
      .then((r) => setTags((r.data as any) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setEditTag(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (tag: Tag) => {
    setEditTag(tag);
    setForm({ name: tag.name, color: tag.color, description: tag.description || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Tên tag không được để trống'); return; }
    setSaving(true);
    try {
      if (editTag) {
        const res = await adminTagsAPI.updateTag(editTag.id, form);
        setTags((t) => t.map((x) => x.id === editTag.id ? (res.data as any) : x));
        toast.success('Đã cập nhật tag');
      } else {
        const res = await adminTagsAPI.createTag(form);
        setTags((t) => [(res.data as any), ...t]);
        toast.success('Đã thêm tag mới');
      }
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminTagsAPI.deleteTag(id);
      setTags((t) => t.filter((x) => x.id !== id));
      toast.success('Đã xóa tag');
    } catch {
      toast.error('Không thể xóa tag');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Quản lý Tags</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{tags.length} tags</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}>
          <PlusOutlined /> Thêm tag
        </button>
      </div>

      {/* Tag grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag, i) => (
            <motion.div
              key={tag.id}
              className="rounded-2xl p-5 border flex items-start justify-between group"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3, boxShadow: '0 12px 40px var(--shadow)' }}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${tag.color}20`, border: `1.5px solid ${tag.color}40` }}
                >
                  <TagOutlined style={{ color: tag.color, fontSize: 16 }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40` }}
                    >
                      #{tag.name}
                    </span>
                  </div>
                  {tag.description && (
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{tag.description}</p>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
                    Sử dụng: {tag.usageCount} lần
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(tag)} className="p-1.5 rounded-lg" style={{ color: '#4F8CFF' }}><EditOutlined /></button>
                <button onClick={() => setConfirmDelete(tag.id)} className="p-1.5 rounded-lg" style={{ color: '#ef4444' }}><DeleteOutlined /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && tags.length === 0 && (
        <div className="text-center py-16 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <TagOutlined style={{ fontSize: 40, color: 'var(--text-light)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-muted)' }}>Chưa có tag nào. Thêm tag đầu tiên!</p>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTag ? 'Chỉnh sửa tag' : 'Thêm tag mới'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm border font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Hủy</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)', opacity: saving ? 0.7 : 1 }}>
              {saving && <LoadingOutlined />}
              {editTag ? 'Lưu' : 'Tạo tag'}
            </button>
          </>
        }>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Tên tag *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ví dụ: JavaScript"
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}
              onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              Màu sắc
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="w-8 h-8 rounded-lg transition-all"
                  style={{
                    background: c,
                    border: form.color === c ? '3px solid var(--text)' : '2px solid transparent',
                    transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="w-10 h-10 rounded-lg cursor-pointer"
                style={{ border: '1.5px solid var(--border)', padding: 2 }}
              />
              <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{form.color}</span>
              <div
                className="flex-1 h-8 rounded-lg"
                style={{ background: `${form.color}30`, border: `1.5px solid ${form.color}50` }}
              >
                <span className="flex h-full items-center px-3 text-xs font-semibold" style={{ color: form.color }}>
                  #{form.name || 'preview'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Mô tả
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả ngắn về tag này..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
              style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}
              onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>
        </div>
      </Modal>

      {/* Confirm delete */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Xóa tag"
        footer={
          <>
            <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 rounded-xl text-sm border font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Hủy</button>
            <button onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#ef4444' }}>Xóa</button>
          </>
        }>
        <p style={{ color: 'var(--text-muted)' }}>Xóa tag này sẽ không ảnh hưởng đến bài viết đã dùng tag đó.</p>
      </Modal>
    </div>
  );
}

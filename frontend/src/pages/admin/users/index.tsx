import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  LockOutlined, UnlockOutlined, ReloadOutlined,
  SearchOutlined, LoadingOutlined, UserOutlined,
} from '@ant-design/icons';
import { adminUsersAPI } from '@/services/api';
import type { User, AdminUserForm, UserRole } from '@/types';
import Modal from '@/components/Modal';
import { useToast } from '@/hooks/useToast';
import dayjs from 'dayjs';

const ROLES: { key: UserRole; label: string; color: string }[] = [
  { key: 'student',  label: 'Sinh viên', color: '#4F8CFF' },
  { key: 'lecturer', label: 'Giảng viên', color: '#7B61FF' },
  { key: 'admin',    label: 'Admin',     color: '#FF6B6B' },
];

const emptyForm: AdminUserForm = {
  name: '', code: '', email: '', password: '',
  role: 'student', faculty: '', department: '', class: '', bio: '',
};

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<AdminUserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUsersAPI.getUsers({ search: search || undefined, role: roleFilter || undefined, page, limit: 10 });
      const d = res.data as any;
      setUsers(d.data || []);
      setTotal(d.pagination?.total || 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd = () => { setEditUser(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, code: u.code || '', email: u.email, password: '', role: u.role, faculty: u.faculty || '', department: u.department || '', class: u.class || '', bio: u.bio || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
    setSaving(true);
    try {
      if (editUser) {
        const updated = await adminUsersAPI.updateUser(editUser.id, form);
        setUsers((u) => u.map((x) => x.id === editUser.id ? (updated.data as any) : x));
        toast.success('Cập nhật người dùng thành công');
      } else {
        if (!form.password) { toast.error('Vui lòng nhập mật khẩu'); setSaving(false); return; }
        const created = await adminUsersAPI.createUser(form);
        setUsers((u) => [created.data as any, ...u]);
        toast.success('Thêm người dùng thành công');
      }
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLock = async (u: User) => {
    try {
      const newStatus = u.status === 'active' ? 'locked' : 'active';
      await adminUsersAPI.updateUserStatus(u.id, newStatus);
      setUsers((arr) => arr.map((x) => x.id === u.id ? { ...x, status: newStatus } : x));
      toast.success(newStatus === 'locked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
    } catch {
      toast.error('Không thể thay đổi trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminUsersAPI.deleteUser(id);
      setUsers((u) => u.filter((x) => x.id !== id));
      toast.success('Đã xóa người dùng');
    } catch {
      toast.error('Không thể xóa người dùng');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleResetPassword = async (id: string) => {
    try {
      await adminUsersAPI.resetPassword(id);
      toast.success('Đã gửi email đặt lại mật khẩu');
    } catch {
      toast.error('Không thể reset mật khẩu');
    }
  };

  const uf = (field: keyof AdminUserForm, val: string) => setForm((f) => ({ ...f, [field]: val }));
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Quản lý người dùng</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{total} người dùng</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)', boxShadow: '0 4px 16px rgba(79,140,255,0.3)' }}
        >
          <PlusOutlined /> Thêm người dùng
        </button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="relative flex-1">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm"
            style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)', outline: 'none' }}
            onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm"
          style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)', outline: 'none' }}
        >
          <option value="">Tất cả vai trò</option>
          {ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                {['Người dùng', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Hành động'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-4 rounded" style={{ width: `${60 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.map((u) => {
                const r = ROLES.find((x) => x.key === u.role) || ROLES[0];
                return (
                  <motion.tr
                    key={u.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    whileHover={{ background: 'rgba(79,140,255,0.03)' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}88)` }}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{u.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-1 rounded-full font-semibold text-white"
                        style={{ background: r.color }}
                      >
                        {r.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{
                          background: u.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          color: u.status === 'active' ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {u.status === 'active' ? '✓ Hoạt động' : '✗ Đã khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {dayjs(u.createdAt).format('DD/MM/YYYY')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg transition-all" style={{ color: '#4F8CFF' }}
                          title="Chỉnh sửa">
                          <EditOutlined />
                        </button>
                        <button onClick={() => handleToggleLock(u)} className="p-1.5 rounded-lg transition-all"
                          style={{ color: u.status === 'active' ? '#f59e0b' : '#22c55e' }}
                          title={u.status === 'active' ? 'Khóa' : 'Mở khóa'}>
                          {u.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
                        </button>
                        <button onClick={() => handleResetPassword(u.id)} className="p-1.5 rounded-lg transition-all"
                          style={{ color: '#7B61FF' }} title="Reset mật khẩu">
                          <ReloadOutlined />
                        </button>
                        <button onClick={() => setConfirmDelete(u.id)} className="p-1.5 rounded-lg transition-all"
                          style={{ color: '#ef4444' }} title="Xóa">
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && users.length === 0 && (
          <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>
            <UserOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <p>Không tìm thấy người dùng</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', opacity: page === 1 ? 0.4 : 1 }}>
            ← Trước
          </button>
          <span className="px-4 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Trang {page} / {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', opacity: page === totalPages ? 0.4 : 1 }}>
            Sau →
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm border font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Hủy
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)', opacity: saving ? 0.7 : 1 }}>
              {saving && <LoadingOutlined />}
              {editUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {[
            { label: 'Họ và tên *', field: 'name' as const, placeholder: 'Nguyễn Văn A' },
            { label: 'Mã số', field: 'code' as const, placeholder: 'SV20210001' },
            { label: 'Email *', field: 'email' as const, placeholder: 'email@hust.edu.vn', type: 'email' },
            { label: editUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *', field: 'password' as const, placeholder: '••••••••', type: 'password' },
            { label: 'Khoa', field: 'faculty' as const, placeholder: 'Công nghệ Thông tin' },
            { label: 'Lớp', field: 'class' as const, placeholder: 'IT-01 K66' },
          ].map((f) => (
            <div key={f.field}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
              <input
                type={f.type || 'text'}
                value={(form as any)[f.field]}
                onChange={(e) => uf(f.field, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}
                onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Vai trò</label>
            <div className="flex gap-2">
              {ROLES.filter((r) => r.key !== 'admin').map((r) => (
                <button key={r.key} type="button" onClick={() => uf('role', r.key)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: form.role === r.key ? `${r.color}20` : 'var(--bg)',
                    border: `1.5px solid ${form.role === r.key ? r.color : 'var(--border)'}`,
                    color: form.role === r.key ? r.color : 'var(--text-muted)',
                  }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm delete modal */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Xác nhận xóa"
        footer={
          <>
            <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 rounded-xl text-sm border font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Hủy
            </button>
            <button onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#ef4444' }}>
              Xóa
            </button>
          </>
        }>
        <p style={{ color: 'var(--text-muted)' }}>
          Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
}

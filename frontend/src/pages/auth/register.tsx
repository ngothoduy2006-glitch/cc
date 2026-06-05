import React, { useState } from 'react';
import { history } from '@umijs/max';
import { motion } from 'framer-motion';
import {
  UserOutlined, MailOutlined, LockOutlined, IdcardOutlined,
  TeamOutlined, EyeOutlined, EyeInvisibleOutlined, LoadingOutlined,
} from '@ant-design/icons';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/hooks/useToast';
import type { UserRole } from '@/types';

const ROLES = [
  {
    key: 'student' as const,
    label: 'Sinh viên',
    icon: '🎓',
    color: '#4F8CFF',
    desc: 'Tôi là sinh viên',
  },
  {
    key: 'lecturer' as const,
    label: 'Giảng viên',
    icon: '👨‍🏫',
    color: '#7B61FF',
    desc: 'Tôi là giảng viên',
  },
];

type Role = 'student' | 'lecturer';

export default function RegisterPage() {
  const { login } = useAuthStore();
  const toast = useToast();
  const [role, setRole] = useState<Role>('student');
  const [form, setForm] = useState({
    name: '',
    code: '',
    email: '',
    password: '',
    faculty: '',
    department: '',
    class: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Họ tên không được để trống';
    if (!form.email.trim()) e.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.password) e.password = 'Mật khẩu không được để trống';
    else if (form.password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        email: form.email.trim(),
        password: form.password,
        role,
        faculty: form.faculty.trim() || undefined,
        department: form.department.trim() || undefined,
        class: form.class.trim() || undefined,
      });
      const { token, user } = res.data as any;
      login(user, token);
      toast.success(`Chào mừng ${user.name}! Đăng ký thành công!`);
      history.push('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: 12,
    color: '#fff',
    outline: 'none',
    width: '100%',
    padding: '11px 16px 11px 44px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  };

  const Field = ({
    label, icon, type = 'text', field, placeholder, required = false,
  }: {
    label: string; icon: React.ReactNode; type?: string; field: string;
    placeholder?: string; required?: boolean;
  }) => (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
        {label} {required && <span style={{ color: '#ff8080' }}>*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
          {icon}
        </span>
        {type === 'password' ? (
          <>
            <input
              type={showPassword ? 'text' : 'password'}
              value={(form as any)[field]}
              onChange={(e) => update(field, e.target.value)}
              placeholder={placeholder}
              style={{ ...inputStyle, paddingRight: 44, borderColor: errors[field] ? '#ff6b6b' : undefined }}
              onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; }}
              onBlur={(e) => { e.target.style.borderColor = errors[field] ? '#ff6b6b' : 'rgba(255,255,255,0.15)'; }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          </>
        ) : (
          <input
            type={type}
            value={(form as any)[field]}
            onChange={(e) => update(field, e.target.value)}
            placeholder={placeholder}
            style={{ ...inputStyle, borderColor: errors[field] ? '#ff6b6b' : undefined }}
            onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; }}
            onBlur={(e) => { e.target.style.borderColor = errors[field] ? '#ff6b6b' : 'rgba(255,255,255,0.15)'; }}
          />
        )}
      </div>
      {errors[field] && (
        <p className="mt-1 text-xs" style={{ color: '#ff8080' }}>{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div
      className="rounded-3xl p-8"
      style={{
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Tạo tài khoản</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Tham gia cộng đồng học tập ngay hôm nay!
        </p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {ROLES.map((r) => (
          <motion.button
            key={r.key}
            type="button"
            onClick={() => setRole(r.key)}
            className="py-3 px-4 rounded-xl text-center transition-all duration-200"
            style={{
              background: role === r.key ? `${r.color}25` : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${role === r.key ? r.color : 'rgba(255,255,255,0.1)'}`,
              boxShadow: role === r.key ? `0 4px 16px ${r.color}30` : 'none',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-xl mb-1">{r.icon}</div>
            <p className="text-xs font-bold" style={{ color: role === r.key ? r.color : 'rgba(255,255,255,0.6)' }}>
              {r.label}
            </p>
          </motion.button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Họ và tên" icon={<UserOutlined />} field="name" placeholder="Nguyễn Văn A" required />
        <Field label="Mã số (SV/GV)" icon={<IdcardOutlined />} field="code"
          placeholder={role === 'student' ? 'SV20210001' : 'GV001'} />
        <Field label="Email" icon={<MailOutlined />} type="email" field="email"
          placeholder="email@hust.edu.vn" required />
        <Field label="Mật khẩu" icon={<LockOutlined />} type="password" field="password"
          placeholder="Ít nhất 6 ký tự" required />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Khoa" icon={<TeamOutlined />} field="faculty" placeholder="CNTT" />
          {role === 'student' ? (
            <Field label="Lớp" icon={<TeamOutlined />} field="class" placeholder="IT-01 K66" />
          ) : (
            <Field label="Bộ môn" icon={<TeamOutlined />} field="department" placeholder="Phần mềm" />
          )}
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-white mt-2"
          style={{
            background: 'linear-gradient(135deg, #4F8CFF 0%, #7B61FF 100%)',
            boxShadow: '0 8px 32px rgba(79,140,255,0.4)',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.85 : 1,
          }}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? <span className="flex items-center justify-center gap-2"><LoadingOutlined /> Đang đăng ký...</span> : 'Đăng ký'}
        </motion.button>
      </form>

      <p className="text-center text-sm mt-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
        Đã có tài khoản?{' '}
        <button
          onClick={() => history.push('/auth/login')}
          style={{ color: '#4F8CFF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Đăng nhập
        </button>
      </p>
    </div>
  );
}

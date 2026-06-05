import React, { useState } from 'react';
import { history } from '@umijs/max';
import { motion, AnimatePresence } from 'framer-motion';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined, LoadingOutlined } from '@ant-design/icons';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/hooks/useToast';

export default function LoginPage() {
  const { login } = useAuthStore();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email không hợp lệ';
    if (!password) e.password = 'Mật khẩu không được để trống';
    else if (password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data as any;
      login(user, token);
      toast.success(`Chào mừng trở lại, ${user.name}!`);

      // Redirect by role
      if (user.role === 'admin') {
        history.push('/admin/dashboard');
      } else {
        history.push('/');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Email hoặc mật khẩu không đúng';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: 12,
    color: '#fff',
    outline: 'none',
    width: '100%',
    padding: '12px 16px 12px 44px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  };

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
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">Đăng nhập</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Chào mừng trở lại! 👋
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Email
          </label>
          <div className="relative">
            <UserOutlined
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              placeholder="your@email.com"
              style={{
                ...inputBase,
                borderColor: errors.email ? '#ff6b6b' : undefined,
              }}
              onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.2)'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.email ? '#ff6b6b' : 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs" style={{ color: '#ff8080' }}>{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Mật khẩu
          </label>
          <div className="relative">
            <LockOutlined
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              placeholder="••••••••"
              style={{
                ...inputBase,
                paddingRight: 44,
                borderColor: errors.password ? '#ff6b6b' : undefined,
              }}
              onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.2)'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.password ? '#ff6b6b' : 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs" style={{ color: '#ff8080' }}>{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-white relative overflow-hidden"
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
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingOutlined spin /> Đang đăng nhập...
            </span>
          ) : (
            'Đăng nhập'
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>hoặc</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* Register link */}
      <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Chưa có tài khoản?{' '}
        <button
          onClick={() => history.push('/auth/register')}
          className="font-semibold transition-colors"
          style={{ color: '#4F8CFF', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Đăng ký ngay
        </button>
      </p>

      {/* Demo accounts */}
      <div
        className="mt-5 p-3 rounded-xl text-xs"
        style={{ background: 'rgba(79,140,255,0.1)', border: '1px solid rgba(79,140,255,0.2)' }}
      >
        <p className="font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Tài khoản demo:</p>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Admin: admin@hust.edu.vn</p>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>GV: nva@hust.edu.vn | SV: lvc@students.hust.edu.vn</p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Outlet, history } from '@umijs/max';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  TagOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { authAPI } from '@/services/api';

const menuItems = [
  { key: '/admin/dashboard', label: 'Dashboard',         icon: <DashboardOutlined /> },
  { key: '/admin/users',     label: 'Người dùng',        icon: <UserOutlined /> },
  { key: '/admin/posts',     label: 'Bài đăng',          icon: <FileTextOutlined /> },
  { key: '/admin/tags',      label: 'Tags',              icon: <TagOutlined /> },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { addToast } = useUIStore();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    logout();
    history.push('/auth/login');
    addToast('success', 'Đã đăng xuất thành công');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-shrink-0 flex flex-col border-r overflow-hidden"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
          >
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Diễn Đàn</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Admin Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentPath === item.key;
            return (
              <button
                key={item.key}
                onClick={() => history.push(item.key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left"
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(79,140,255,0.15), rgba(123,97,255,0.15))' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 400,
                  border: isActive ? '1px solid rgba(79,140,255,0.2)' : '1px solid transparent',
                }}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      className="text-sm whitespace-nowrap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
            >
              {user?.name?.charAt(0) || 'A'}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{user?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Admin</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200"
            style={{ color: '#ef4444' }}
          >
            <LogoutOutlined className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span className="text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Đăng xuất
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
          >
            {collapsed ? <MenuUnfoldOutlined className="text-xl" /> : <MenuFoldOutlined className="text-xl" />}
          </button>

          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-xl transition-all duration-200"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => history.push('/')}
            >
              <span className="text-sm font-medium">← Về trang chủ</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPath}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { history } from '@umijs/max';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SearchOutlined,
  PlusOutlined,
  UserOutlined,
  BellOutlined,
  BookOutlined,
  LogoutOutlined,
  HomeOutlined,
  MessageOutlined,
  MenuOutlined,
  CloseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { authAPI } from '@/services/api';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { addToast } = useUIStore();
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      history.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    logout();
    history.push('/auth/login');
    addToast('success', 'Đã đăng xuất thành công');
    setDropdownOpen(false);
  };

  const getRoleBadge = () => {
    if (!user) return null;
    const map = {
      admin: { label: 'Admin', color: '#FF6B6B' },
      lecturer: { label: 'GV', color: '#7B61FF' },
      student: { label: 'SV', color: '#4F8CFF' },
    };
    const badge = map[user.role];
    return (
      <span
        className="text-xs px-1.5 py-0.5 rounded-md font-semibold text-white"
        style={{ background: badge.color }}
      >
        {badge.label}
      </span>
    );
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}
        style={{
          background: scrolled
            ? 'rgba(var(--bg-rgb, 240,244,255), 0.95)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-16">
            {/* Logo */}
            <button
              onClick={() => history.push('/')}
              className="flex items-center gap-2.5 flex-shrink-0"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #4F8CFF 0%, #7B61FF 100%)',
                  boxShadow: '0 4px 16px rgba(79,140,255,0.35)',
                }}
              >
                <span className="text-white font-bold text-base">Q</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-base text-gradient">Diễn Đàn</span>
                <span className="text-sm font-medium ml-1" style={{ color: 'var(--text-muted)' }}>Hỏi Đáp</span>
              </div>
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1 ml-2">
              {[
                { label: 'Trang chủ', path: '/', icon: <HomeOutlined /> },
                { label: 'Diễn đàn', path: '/forum', icon: <MessageOutlined /> },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => history.push(item.path)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(79,140,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-3">
              <div className="relative w-full">
                <SearchOutlined
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)', fontSize: 14 }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm câu hỏi, chủ đề..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border transition-all duration-200"
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    color: 'var(--text)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4F8CFF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </form>

            <div className="flex items-center gap-2 ml-auto">
              <DarkModeToggle />

              {/* Ask button */}
              {isAuthenticated && (
                <button
                  onClick={() => history.push('/post/create')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white btn-ripple"
                  style={{
                    background: 'linear-gradient(135deg, #4F8CFF 0%, #7B61FF 100%)',
                    boxShadow: '0 4px 16px rgba(79,140,255,0.3)',
                  }}
                >
                  <PlusOutlined />
                  Đặt câu hỏi
                </button>
              )}

              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl transition-all duration-200"
                    style={{ border: '1.5px solid var(--border)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
                    >
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    {getRoleBadge()}
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden shadow-lg border"
                        style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--border)',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                        }}
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{user?.name}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                        </div>

                        {/* Menu items */}
                        {[
                          { label: 'Trang cá nhân', icon: <UserOutlined />, path: `/profile/${user?.id}` },
                          { label: 'Thông báo', icon: <BellOutlined />, path: '/notifications' },
                          { label: 'Bài đã lưu', icon: <BookOutlined />, path: '/saved-posts' },
                          ...(isAdmin ? [{ label: 'Admin Panel', icon: <SettingOutlined />, path: '/admin/dashboard' }] : []),
                        ].map((item) => (
                          <button
                            key={item.path}
                            onClick={() => { history.push(item.path); setDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = 'rgba(79,140,255,0.08)';
                              (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                            }}
                          >
                            {item.icon}
                            {item.label}
                          </button>
                        ))}

                        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150"
                            style={{ color: '#ef4444' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                          >
                            <LogoutOutlined />
                            Đăng xuất
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => history.push('/auth/login')}
                    className="px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => history.push('/auth/register')}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
                  >
                    Đăng ký
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl"
                style={{ color: 'var(--text-muted)' }}
              >
                {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden border-t"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="px-4 py-3 space-y-2">
                <form onSubmit={handleSearch} className="relative">
                  <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl"
                    style={{
                      background: 'var(--bg)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--text)',
                      outline: 'none',
                    }}
                  />
                </form>
                {[
                  { label: 'Trang chủ', path: '/' },
                  { label: 'Diễn đàn', path: '/forum' },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { history.push(item.path); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{ color: 'var(--text)' }}
                  >
                    {item.label}
                  </button>
                ))}
                {!isAuthenticated && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => { history.push('/auth/login'); setMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => { history.push('/auth/register'); setMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
                    >
                      Đăng ký
                    </button>
                  </div>
                )}
                {isAuthenticated && (
                  <button
                    onClick={() => { history.push('/post/create'); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
                  >
                    + Đặt câu hỏi
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Navbar spacer */}
      <div className="h-16" />
    </>
  );
}

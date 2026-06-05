import React, { useEffect, useState } from 'react';
import { history } from '@umijs/max';
import { motion, AnimatePresence } from 'framer-motion';
import { BellOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { notificationsAPI } from '@/services/api';
import type { Notification } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/hooks/useToast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { history.push('/auth/login'); return; }
    notificationsAPI.getNotifications()
      .then((r) => setNotifications((r.data as any) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const markAll = async () => {
    setMarkingAll(true);
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((n) => n.map((x) => ({ ...x, read: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch {
      toast.error('Không thể đánh dấu');
    } finally {
      setMarkingAll(false);
    }
  };

  const markOne = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((n) => n.map((x) => x.id === id ? { ...x, read: true } : x));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative"
              style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
            >
              <BellOutlined style={{ color: '#fff', fontSize: 18 }} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                  style={{ background: '#ef4444' }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Thông báo</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Tất cả đã đọc'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAll}
              disabled={markingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              {markingAll ? <LoadingOutlined /> : <CheckOutlined />}
              Đọc tất cả
            </button>
          )}
        </div>

        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {loading ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
              <LoadingOutlined style={{ fontSize: 24 }} className="mb-3" />
              <p>Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>Không có thông báo</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Bạn sẽ nhận thông báo khi có hoạt động mới</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  className="flex items-start gap-4 p-4 border-b cursor-pointer transition-all duration-150"
                  style={{
                    borderColor: 'var(--border)',
                    background: notif.read ? 'transparent' : 'rgba(79,140,255,0.04)',
                  }}
                  onClick={() => {
                    markOne(notif.id);
                    if (notif.targetId) history.push(`/post/${notif.targetId}`);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ background: 'rgba(79,140,255,0.06)' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: notif.read ? 'var(--bg)' : 'linear-gradient(135deg, #4F8CFF, #7B61FF)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <BellOutlined style={{ color: notif.read ? 'var(--text-muted)' : '#fff', fontSize: 14 }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--text)', fontWeight: notif.read ? 400 : 600 }}
                    >
                      {notif.message}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
                      {dayjs(notif.createdAt).fromNow()}
                    </p>
                  </div>

                  {!notif.read && (
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                      style={{ background: '#4F8CFF' }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}

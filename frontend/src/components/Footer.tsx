import React from 'react';
import { history } from '@umijs/max';

export default function Footer() {
  return (
    <footer
      className="border-t mt-auto"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)' }}
              >
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="font-bold text-gradient">Diễn Đàn Hỏi Đáp</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Nền tảng Q&A học thuật dành cho sinh viên và giảng viên. Chia sẻ kiến thức, học hỏi cùng nhau.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Điều hướng</h4>
            <ul className="space-y-2">
              {[
                { label: 'Trang chủ', path: '/' },
                { label: 'Diễn đàn', path: '/forum' },
                { label: 'Đặt câu hỏi', path: '/post/create' },
              ].map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => history.push(item.path)}
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--primary)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Thông tin</h4>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Dự án học tập<br />
              Môn: Lập trình Web<br />
              Đại học CNTT & TT
            </p>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-light)' }}>
            © 2024 Diễn Đàn Hỏi Đáp Sinh Viên. Built with React & TypeScript.
          </p>
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{ background: 'rgba(79,140,255,0.1)', color: '#4F8CFF' }}
            >
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

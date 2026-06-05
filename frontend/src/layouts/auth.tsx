import React from 'react';
import { Outlet } from '@umijs/max';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 gradient-bg"
        style={{
          backgroundImage: 'linear-gradient(135deg, #0D1117 0%, #1a1f3c 40%, #0f1f3d 70%, #1a1f3c 100%)',
        }}
      />

      {/* Decorative blobs */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #4F8CFF 0%, transparent 70%)',
          top: '-10%',
          left: '-10%',
        }}
      />
      <div
        className="absolute w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #7B61FF 0%, transparent 70%)',
          bottom: '-10%',
          right: '-10%',
        }}
      />
      <div
        className="absolute w-64 h-64 rounded-full opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #4DE2E2 0%, transparent 70%)',
          top: '40%',
          right: '20%',
        }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full opacity-40"
          style={{
            background: ['#4F8CFF','#7B61FF','#4DE2E2'][i % 3],
            top:  `${15 + i * 14}%`,
            left: `${10 + i * 15}%`,
            animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #4F8CFF 0%, #7B61FF 100%)',
              boxShadow: '0 8px 32px rgba(79,140,255,0.4)',
            }}
          >
            <span className="text-white text-2xl font-bold">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Diễn Đàn Hỏi Đáp</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Cộng đồng học tập sinh viên
          </p>
        </div>

        <Outlet />
      </motion.div>
    </div>
  );
}

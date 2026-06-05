import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  layout: false,
  history: { type: 'browser' },
  proxy: {
    '/api': {
      target: 'http://localhost:4002',
      changeOrigin: true,
    },
  },
  routes: [
    // Auth routes (dùng auth layout)
    {
      path: '/auth',
      component: '@/layouts/auth',
      routes: [
        { path: '/auth/login', component: '@/pages/auth/login' },
        { path: '/auth/register', component: '@/pages/auth/register' },
      ],
    },
    // Admin routes (dùng admin layout)
    {
      path: '/admin',
      component: '@/layouts/admin',
      routes: [
        { path: '/admin', redirect: '/admin/dashboard' },
        { path: '/admin/dashboard', component: '@/pages/admin/dashboard' },
        { path: '/admin/users', component: '@/pages/admin/users/index' },
        { path: '/admin/posts', component: '@/pages/admin/posts/index' },
        { path: '/admin/tags', component: '@/pages/admin/tags/index' },
      ],
    },
    // Main routes (dùng main layout)
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { path: '/', component: '@/pages/index' },
        { path: '/forum', component: '@/pages/forum/index' },
        { path: '/post/create', component: '@/pages/post/create' },
        { path: '/post/:id', component: '@/pages/post/detail' },
        { path: '/search', component: '@/pages/search' },
        { path: '/profile/:id', component: '@/pages/profile/detail' },
        { path: '/saved-posts', component: '@/pages/saved-posts' },
        { path: '/notifications', component: '@/pages/notifications' },
      ],
    },
  ],
  npmClient: 'npm',
  tailwindcss: {},
});

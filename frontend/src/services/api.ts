import axios from 'axios';
import type {
  User,
  Post,
  Comment,
  Tag,
  Notification,
  AdminStats,
  LoginForm,
  RegisterForm,
  CreatePostForm,
  AdminUserForm,
  AdminTagForm,
  PostFilters,
  PaginatedResponse,
  VoteType,
} from '@/types';

// ============================================================
// Axios Instance
// ============================================================

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: tự động đính JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: xử lý 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

// ============================================================
// Auth APIs
// ============================================================

export const authAPI = {
  login: (data: LoginForm) =>
    api.post<{ token: string; user: User }>('/auth/login', data),

  register: (data: RegisterForm) =>
    api.post<{ token: string; user: User }>('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<User>('/auth/me'),
};

// ============================================================
// Forum — Posts APIs
// ============================================================

export const postsAPI = {
  getPosts: (filters?: PostFilters) =>
    api.get<PaginatedResponse<Post>>('/forum/posts', { params: filters }),

  getPostById: (id: string) =>
    api.get<Post>(`/forum/posts/${id}`),

  createPost: (data: CreatePostForm) =>
    api.post<Post>('/forum/posts', data),

  updatePost: (id: string, data: CreatePostForm) =>
    api.put<Post>(`/forum/posts/${id}`, data),

  deletePost: (id: string) =>
    api.delete(`/forum/posts/${id}`),

  votePost: (id: string, voteType: VoteType) =>
    api.post(`/forum/posts/${id}/vote`, { voteType }),

  getUserVote: (postId: string) =>
    api.get<{ voteType: VoteType | null }>(`/forum/posts/${postId}/my-vote`),

  savePost: (id: string) =>
    api.post(`/forum/posts/${id}/save`),

  getSavedPosts: () =>
    api.get<Post[]>('/forum/saved-posts'),
};

// ============================================================
// Forum — Comments APIs
// ============================================================

export const commentsAPI = {
  getComments: (postId: string) =>
    api.get<Comment[]>(`/forum/posts/${postId}/comments`),

  createComment: (postId: string, content: string) =>
    api.post<Comment>(`/forum/posts/${postId}/comments`, { content }),

  replyComment: (postId: string, parentCommentId: string, content: string) =>
    api.post<Comment>(`/forum/posts/${postId}/comments/${parentCommentId}/reply`, { content }),

  deleteComment: (id: string) =>
    api.delete(`/forum/comments/${id}`),

  voteComment: (id: string, voteType: VoteType) =>
    api.post(`/forum/comments/${id}/vote`, { voteType }),
};

// ============================================================
// Tags APIs
// ============================================================

export const tagsAPI = {
  getTags: () => api.get<Tag[]>('/forum/tags'),
};

// ============================================================
// Notifications APIs
// ============================================================

export const notificationsAPI = {
  getNotifications: () => api.get<Notification[]>('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// ============================================================
// Admin — Stats
// ============================================================

export const adminStatsAPI = {
  getStats: () => api.get<AdminStats>('/admin/stats'),
};

// ============================================================
// Admin — Users
// ============================================================

export const adminUsersAPI = {
  getUsers: (params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<User>>('/admin/users', { params }),

  getUserById: (id: string) =>
    api.get<User>(`/admin/users/${id}`),

  createUser: (data: AdminUserForm) =>
    api.post<User>('/admin/users', data),

  updateUser: (id: string, data: Partial<AdminUserForm>) =>
    api.put<User>(`/admin/users/${id}`, data),

  updateUserStatus: (id: string, status: 'active' | 'locked') =>
    api.patch(`/admin/users/${id}/status`, { status }),

  lockUser: (id: string) =>
    api.patch(`/admin/users/${id}/lock`),

  resetPassword: (id: string) =>
    api.post(`/admin/users/${id}/reset-password`),

  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),
};

// ============================================================
// Admin — Posts
// ============================================================

export const adminPostsAPI = {
  getPosts: (params?: { status?: string; page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<Post>>('/admin/posts', { params }),

  getPostById: (id: string) =>
    api.get<Post>(`/admin/posts/${id}`),

  updatePostStatus: (id: string, status: string) =>
    api.patch(`/admin/posts/${id}/status`, { status }),

  deletePost: (id: string) =>
    api.delete(`/admin/posts/${id}`),
};

// ============================================================
// Admin — Tags
// ============================================================

export const adminTagsAPI = {
  getTags: () => api.get<Tag[]>('/admin/tags'),

  createTag: (data: AdminTagForm) =>
    api.post<Tag>('/admin/tags', data),

  updateTag: (id: string, data: Partial<AdminTagForm>) =>
    api.put<Tag>(`/admin/tags/${id}`, data),

  deleteTag: (id: string) =>
    api.delete(`/admin/tags/${id}`),
};

export default api;

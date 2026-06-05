import { create } from 'zustand';
import type { Post, Tag, PostFilters } from '@/types';

interface ForumState {
  posts: Post[];
  totalPosts: number;
  currentPost: Post | null;
  tags: Tag[];
  filters: PostFilters;
  isLoading: boolean;

  setPosts: (posts: Post[], total: number) => void;
  setCurrentPost: (post: Post | null) => void;
  setTags: (tags: Tag[]) => void;
  setFilters: (filters: Partial<PostFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
}

const defaultFilters: PostFilters = {
  search: '',
  sort: 'newest',
  page: 1,
  limit: 10,
};

export const useForumStore = create<ForumState>((set) => ({
  posts: [],
  totalPosts: 0,
  currentPost: null,
  tags: [],
  filters: defaultFilters,
  isLoading: false,

  setPosts: (posts, total) => set({ posts, totalPosts: total }),
  setCurrentPost: (post) => set({ currentPost: post }),
  setTags: (tags) => set({ tags }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters, page: 1 } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

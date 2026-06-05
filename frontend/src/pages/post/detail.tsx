import React, { useEffect, useState, useCallback } from 'react';
import { useParams, history } from '@umijs/max';
import { motion } from 'framer-motion';
import {
  EyeOutlined, ClockCircleOutlined, UserOutlined,
  BookOutlined, BookFilled, DeleteOutlined, ArrowLeftOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { postsAPI, commentsAPI } from '@/services/api';
import type { Post, Comment, VoteType } from '@/types';
import TagBadge from '@/components/TagBadge';
import VoteButton from '@/components/VoteButton';
import CommentSection from '@/components/CommentSection';
import { PostCardSkeleton, CommentSkeleton } from '@/components/LoadingSkeleton';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/hooks/useToast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const roleMap: Record<string, { label: string; color: string }> = {
  student:  { label: 'Sinh viên', color: '#4F8CFF' },
  lecturer: { label: 'Giảng viên', color: '#7B61FF' },
  admin:    { label: 'Admin',     color: '#FF6B6B' },
};

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [savingPost, setSavingPost] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    postsAPI.getPostById(id)
      .then((res) => {
        const p = res.data as any;
        setPost(p);
        setVoteCount(p.votes || 0);
        setIsSaved(p.isSaved || false);
      })
      .catch(() => { toast.error('Không tìm thấy bài viết'); history.push('/'); })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setCommentsLoading(true);
    commentsAPI.getComments(id)
      .then((res) => setComments((res.data as any) || []))
      .catch(() => {})
      .finally(() => setCommentsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !isAuthenticated) return;
    postsAPI.getUserVote(id)
      .then((res) => setUserVote((res.data as any)?.voteType || null))
      .catch(() => {});
  }, [id, isAuthenticated]);

  const handleVote = async (type: VoteType) => {
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để vote'); return; }
    const prev = userVote;
    const newVote = userVote === type ? null : type;
    setUserVote(newVote);
    setVoteCount((c) => {
      if (prev === type) return c - 1;
      if (prev !== null) return type === 'up' ? c + 2 : c - 2;
      return type === 'up' ? c + 1 : c - 1;
    });
    try {
      await postsAPI.votePost(id!, type);
    } catch (err: any) {
      setUserVote(prev);
      setVoteCount(post?.votes || 0);
      toast.error(err?.response?.data?.message || 'Không thể vote');
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để lưu bài'); return; }
    setSavingPost(true);
    try {
      await postsAPI.savePost(id!);
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Đã bỏ lưu bài viết' : 'Đã lưu bài viết');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể lưu bài');
    } finally {
      setSavingPost(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        {Array.from({ length: 3 }).map((_, i) => <CommentSkeleton key={i} />)}
      </div>
    );
  }

  if (!post) return null;

  const role = post.author?.role ? roleMap[post.author.role] : roleMap.student;
  const isAuthor = user?.id === post.authorId;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <motion.button
        onClick={() => history.back()}
        className="flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-muted)' }}
        whileHover={{ x: -3 }}
      >
        <ArrowLeftOutlined /> Quay lại
      </motion.button>

      {/* Post card */}
      <motion.div
        className="rounded-3xl p-6 sm:p-8 border mb-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header: Vote + Content */}
        <div className="flex gap-6">
          {/* Vote */}
          <div className="flex-shrink-0 pt-1">
            <VoteButton
              count={voteCount}
              userVote={userVote}
              onVote={handleVote}
              disabled={!isAuthenticated}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags?.map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  size="md"
                  onClick={() => history.push(`/?tag=${tag.id}`)}
                />
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-4" style={{ color: 'var(--text)' }}>
              {post.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
              {/* Author */}
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${role.color}, ${role.color}88)` }}
                >
                  {post.author?.name?.charAt(0) || <UserOutlined />}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {post.author?.name || 'Ẩn danh'}
                  </p>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-semibold text-white"
                    style={{ background: role.color }}
                  >
                    {role.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1">
                  <ClockCircleOutlined />
                  {dayjs(post.createdAt).fromNow()}
                </span>
                <span className="flex items-center gap-1">
                  <EyeOutlined />
                  {post.views} lượt xem
                </span>
              </div>
            </div>

            {/* Content */}
            <div
              className="post-content text-base leading-relaxed mb-6"
              style={{ color: 'var(--text)' }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleSave}
                disabled={savingPost}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                style={{
                  borderColor: isSaved ? 'rgba(79,140,255,0.4)' : 'var(--border)',
                  color: isSaved ? '#4F8CFF' : 'var(--text-muted)',
                  background: isSaved ? 'rgba(79,140,255,0.08)' : 'transparent',
                }}
              >
                {savingPost ? <LoadingOutlined /> : isSaved ? <BookFilled /> : <BookOutlined />}
                {isSaved ? 'Đã lưu' : 'Lưu bài'}
              </button>

              {isAuthor && (
                <button
                  onClick={async () => {
                    if (confirm('Bạn có chắc muốn xóa bài này?')) {
                      try {
                        await postsAPI.deletePost(post.id);
                        toast.success('Đã xóa bài viết');
                        history.push('/');
                      } catch {
                        toast.error('Không thể xóa bài');
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444', background: 'rgba(239,68,68,0.05)' }}
                >
                  <DeleteOutlined />
                  Xóa bài
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comments section */}
      <div
        className="rounded-3xl p-6 sm:p-8 border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {commentsLoading
          ? Array.from({ length: 3 }).map((_, i) => <CommentSkeleton key={i} />)
          : (
            <CommentSection
              postId={post.id}
              comments={comments}
              onCommentsChange={setComments}
            />
          )
        }
      </div>
    </div>
  );
}

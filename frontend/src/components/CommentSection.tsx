import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import type { Comment } from '@/types';
import CommentItem from './CommentItem';
import { commentsAPI } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/hooks/useToast';

interface Props {
  postId: string;
  comments: Comment[];
  onCommentsChange?: (comments: Comment[]) => void;
}

export default function CommentSection({ postId, comments, onCommentsChange }: Props) {
  const { isAuthenticated } = useAuthStore();
  const toast = useToast();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }

    setSubmitting(true);
    try {
      const res = await commentsAPI.createComment(postId, newComment.trim());
      const created = res.data;
      if (onCommentsChange) {
        onCommentsChange([created, ...comments]);
      }
      setNewComment('');
      toast.success('Đã thêm bình luận');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể thêm bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    const res = await commentsAPI.replyComment(postId, parentId, content);
    const reply = res.data;
    if (onCommentsChange) {
      const updated = comments.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c,
      );
      onCommentsChange(updated);
    }
    return reply;
  };

  const handleVoteComment = async (commentId: string, voteType: 'up' | 'down') => {
    try {
      await commentsAPI.voteComment(commentId, voteType);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể vote');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>
        Bình luận ({comments.length})
      </h3>

      {/* New comment form */}
      {isAuthenticated ? (
        <div
          className="rounded-2xl p-4 border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Chia sẻ suy nghĩ của bạn... (hỗ trợ HTML cơ bản)"
            rows={3}
            className="w-full text-sm resize-none rounded-xl p-3 transition-all duration-200"
            style={{
              background: 'var(--bg)',
              border: '1.5px solid var(--border)',
              color: 'var(--text)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4F8CFF';
              e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleSubmitComment();
            }}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Ctrl+Enter để gửi
            </span>
            <button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)',
                opacity: (!newComment.trim() || submitting) ? 0.6 : 1,
                cursor: (!newComment.trim() || submitting) ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? <LoadingOutlined /> : <SendOutlined />}
              Bình luận
            </button>
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl p-4 text-center border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <a href="/auth/login" style={{ color: 'var(--primary)' }}>Đăng nhập</a>
            {' '}để tham gia bình luận
          </p>
        </div>
      )}

      {/* Comment list */}
      <AnimatePresence>
        {comments.length === 0 ? (
          <motion.div
            className="text-center py-12 rounded-2xl border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-4xl mb-3">💬</div>
            <p style={{ color: 'var(--text-muted)' }}>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, i) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <CommentItem
                  comment={comment}
                  onReply={handleReply}
                  onVote={handleVoteComment}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

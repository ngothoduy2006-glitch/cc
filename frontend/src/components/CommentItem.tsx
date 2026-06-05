import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendOutlined, ArrowUpOutlined, ArrowDownOutlined, UserOutlined } from '@ant-design/icons';
import type { Comment, VoteType } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/hooks/useToast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Props {
  comment: Comment;
  onReply: (parentId: string, content: string) => Promise<Comment>;
  onVote: (commentId: string, voteType: VoteType) => Promise<void>;
  depth?: number;
}

const roleMap: Record<string, { label: string; color: string }> = {
  student:  { label: 'SV', color: '#4F8CFF' },
  lecturer: { label: 'GV', color: '#7B61FF' },
  admin:    { label: 'Admin', color: '#FF6B6B' },
};

export default function CommentItem({ comment, onReply, onVote, depth = 0 }: Props) {
  const { isAuthenticated } = useAuthStore();
  const toast = useToast();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [localVote, setLocalVote] = useState<VoteType | null>(comment.userVote || null);
  const [localCount, setLocalCount] = useState(comment.votes);
  const [showReplies, setShowReplies] = useState(true);

  const role = comment.author?.role ? roleMap[comment.author.role] : roleMap.student;

  const handleVote = async (type: VoteType) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để vote');
      return;
    }
    const prev = localVote;
    const newVote = localVote === type ? null : type;
    setLocalVote(newVote);
    setLocalCount((c) => {
      if (prev === type) return c - 1;
      if (prev !== null) return type === 'up' ? c + 2 : c - 2;
      return type === 'up' ? c + 1 : c - 1;
    });
    try {
      await onVote(comment.id, type);
    } catch {
      setLocalVote(prev);
      setLocalCount(comment.votes);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText('');
      setReplyOpen(false);
      toast.success('Đã gửi trả lời');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể gửi trả lời');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl p-4 border transition-all duration-200"
        style={{
          background: depth > 0 ? 'var(--bg)' : 'var(--surface)',
          borderColor: 'var(--border)',
          marginLeft: depth > 0 ? `${depth * 20}px` : 0,
        }}
      >
        {/* Author */}
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
            style={{ background: `linear-gradient(135deg, ${role.color}, ${role.color}99)` }}
          >
            {comment.author?.name?.charAt(0) || <UserOutlined />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                {comment.author?.name || 'Ẩn danh'}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded font-semibold text-white"
                style={{ background: role.color }}
              >
                {role.label}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                {dayjs(comment.createdAt).fromNow()}
              </span>
            </div>

            {/* Content */}
            <div
              className="text-sm leading-relaxed post-content"
              style={{ color: 'var(--text)' }}
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />

            {/* Actions */}
            <div className="flex items-center gap-3 mt-3">
              {/* Vote */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleVote('up')}
                  className="p-1.5 rounded-lg transition-all duration-150"
                  style={{
                    color: localVote === 'up' ? '#4F8CFF' : 'var(--text-muted)',
                    background: localVote === 'up' ? 'rgba(79,140,255,0.1)' : 'transparent',
                  }}
                >
                  <ArrowUpOutlined style={{ fontSize: 13 }} />
                </button>
                <span
                  className="text-xs font-semibold min-w-[1.5rem] text-center"
                  style={{ color: localVote === 'up' ? '#4F8CFF' : localVote === 'down' ? '#ef4444' : 'var(--text-muted)' }}
                >
                  {localCount}
                </span>
                <button
                  onClick={() => handleVote('down')}
                  className="p-1.5 rounded-lg transition-all duration-150"
                  style={{
                    color: localVote === 'down' ? '#ef4444' : 'var(--text-muted)',
                    background: localVote === 'down' ? 'rgba(239,68,68,0.1)' : 'transparent',
                  }}
                >
                  <ArrowDownOutlined style={{ fontSize: 13 }} />
                </button>
              </div>

              {/* Reply */}
              {isAuthenticated && depth === 0 && (
                <button
                  onClick={() => setReplyOpen(!replyOpen)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150"
                  style={{
                    color: replyOpen ? 'var(--primary)' : 'var(--text-muted)',
                    background: replyOpen ? 'rgba(79,140,255,0.08)' : 'transparent',
                  }}
                >
                  Trả lời
                </button>
              )}
            </div>

            {/* Reply form */}
            <AnimatePresence>
              {replyOpen && (
                <motion.div
                  className="mt-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex gap-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Viết trả lời..."
                      rows={2}
                      className="flex-1 text-sm rounded-xl p-3 resize-none"
                      style={{
                        background: 'var(--bg)',
                        border: '1.5px solid var(--border)',
                        color: 'var(--text)',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#4F8CFF'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                    />
                    <button
                      onClick={handleSubmitReply}
                      disabled={submittingReply || !replyText.trim()}
                      className="px-3 py-2 rounded-xl text-white font-semibold text-sm self-end"
                      style={{
                        background: 'linear-gradient(135deg, #4F8CFF, #7B61FF)',
                        opacity: (!replyText.trim() || submittingReply) ? 0.6 : 1,
                      }}
                    >
                      <SendOutlined />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs font-medium mb-2 ml-12"
            style={{ color: 'var(--primary)' }}
          >
            {showReplies ? '▾ Ẩn' : '▸ Xem'} {comment.replies.length} trả lời
          </button>
          <AnimatePresence>
            {showReplies && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onReply={onReply}
                    onVote={onVote}
                    depth={depth + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

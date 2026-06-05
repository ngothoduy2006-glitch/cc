const { Comment, Post, User, CommentVote } = require('../models');
const { notifyUser } = require('../utils/notificationService');

function buildCommentTree(comments) {
  const map = new Map();
  const roots = [];

  comments.forEach((comment) => {
    const plain = comment.get ? comment.get({ plain: true }) : comment;
    map.set(plain.id, { ...plain, replies: [] });
  });

  map.forEach((comment) => {
    if (comment.parentCommentId && map.has(comment.parentCommentId)) {
      map.get(comment.parentCommentId).replies.push(comment);
    } else {
      roots.push(comment);
    }
  });

  return roots;
}

async function getComments(req, res, next) {
  try {
    // postId có thể nằm ở :id (route cũ) hoặc :postId (route mới)
    const postId = req.params.postId || req.params.id;

    const comments = await Comment.findAll({
      where: { postId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'role', 'avatar'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.json(buildCommentTree(comments));
  } catch (error) {
    next(error);
  }
}

async function createComment(req, res, next) {
  try {
    const postId = req.params.postId || req.params.id;
    const { content, parentCommentId } = req.body;

    const post = await Post.findByPk(postId, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // ✅ Kiểm tra bài không bị ẩn/xóa
    if (post.status !== 'active') {
      return res.status(403).json({ message: 'Bài viết không còn tồn tại.' });
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findByPk(parentCommentId, {
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
      });
      if (!parentComment || String(parentComment.postId) !== String(postId)) {
        return res.status(400).json({ message: 'Bình luận cha không hợp lệ' });
      }
    }

    const comment = await Comment.create({
      postId,
      authorId: req.user.id,
      content,
      parentCommentId: parentCommentId || null,
    });

    // Tăng answersCount chỉ với comment gốc (không phải reply)
    if (!parentCommentId) {
      await Post.increment('answersCount', { where: { id: postId } });
    }

    // ✅ Thông báo tác giả bài viết có comment mới (không tự thông báo cho mình)
    if (post.authorId !== req.user.id) {
      await notifyUser(
        post.authorId,
        'new_comment',
        postId,
        `Bài viết "${post.title}" của bạn vừa có phản hồi mới.`,
      );
    }

    // ✅ Thông báo tác giả comment cha có người reply (tránh trùng với trên)
    if (
      parentComment &&
      parentComment.authorId !== req.user.id &&
      parentComment.authorId !== post.authorId
    ) {
      await notifyUser(
        parentComment.authorId,
        'reply_comment',
        postId,
        `Bình luận của bạn trong "${post.title}" vừa có người trả lời.`,
      );
    }

    // Trả về comment kèm thông tin author
    await comment.reload({
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email', 'role', 'avatar'] },
      ],
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
}

async function replyComment(req, res, next) {
  // Route: POST /posts/:postId/comments/:parentCommentId/reply
  // Gán parentCommentId từ params rồi gọi lại createComment
  req.body.parentCommentId = req.params.parentCommentId;
  return createComment(req, res, next);
}

module.exports = { getComments, createComment, replyComment };
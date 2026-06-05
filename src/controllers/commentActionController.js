const { Comment, Post, CommentVote } = require('../models');

async function updateComment(req, res, next) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (req.user.role !== 'admin' && comment.authorId !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: Chỉ admin hoặc tác giả mới sửa được',
      });
    }

    await comment.update({ content });
    res.json(comment);
  } catch (error) {
    next(error);
  }
}

async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (req.user.role !== 'admin' && comment.authorId !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: Chỉ admin hoặc tác giả mới xóa được',
      });
    }

    const post = await Post.findByPk(comment.postId);
    if (post && !comment.parentCommentId && post.answersCount > 0) {
      await post.decrement('answersCount');
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function voteComment(req, res, next) {
  try {
    const { id } = req.params;
    const { direction } = req.body;

    if (!['up', 'down'].includes(direction)) {
      return res.status(400).json({ message: 'direction phải là up hoặc down' });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const existingVote = await CommentVote.findOne({
      where: { commentId: id, userId: req.user.id },
    });

    const delta = direction === 'up' ? 1 : -1;
    if (existingVote) {
      if (existingVote.voteType === direction) {
        await existingVote.destroy();
        comment.votes -= delta;
      } else {
        const oldDelta = existingVote.voteType === 'up' ? 1 : -1;
        comment.votes = comment.votes - oldDelta + delta;
        existingVote.voteType = direction;
        await existingVote.save();
      }
    } else {
      await CommentVote.create({
        commentId: id,
        userId: req.user.id,
        voteType: direction,
      });
      comment.votes += delta;
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateComment,
  deleteComment,
  voteComment,
};

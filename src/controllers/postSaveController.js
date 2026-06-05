const { SavedPost, Post, User, Tag, PostVote } = require('../models');

async function getUserVote(req, res, next) {
  try {
    const { postId } = req.params;

    const vote = await PostVote.findOne({
      where: { postId, userId: req.user.id },
    });

    if (!vote) return res.json({ voted: false, voteType: null });

    res.json({ voted: true, voteType: vote.voteType });
  } catch (error) {
    next(error);
  }
}

async function savePost(req, res, next) {
  try {
    const { id } = req.params;

    // ✅ Kiểm tra bài tồn tại và active
    const post = await Post.findByPk(id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({ message: 'Bài viết không tồn tại.' });
    }

    const existing = await SavedPost.findOne({
      where: { userId: req.user.id, postId: id },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ saved: false });
    }

    await SavedPost.create({ userId: req.user.id, postId: id });
    res.json({ saved: true });
  } catch (error) {
    next(error);
  }
}

async function getSavedPosts(req, res, next) {
  try {
    const page     = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(req.query.pageSize, 10) || 10, 1);
    const offset   = (page - 1) * pageSize;

    const { count, rows } = await SavedPost.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Post,
          as: 'post',
          // ✅ Kèm author + tags thay vì trả post rỗng
          include: [
            { model: User, as: 'author', attributes: ['id', 'name', 'avatar', 'role'] },
            { model: Tag,  as: 'tags',   attributes: ['id', 'name', 'color'], through: { attributes: [] } },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
      distinct: true,
    });

    res.json({
      data: rows.map((r) => r.post),
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getUserVote, savePost, getSavedPosts };
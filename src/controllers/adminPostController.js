const { Post, User, Tag, Comment } = require('../models');

// Danh sách bài viết (admin thấy tất cả kể cả hidden/deleted)
async function getPosts(req, res, next) {
  try {
    const page     = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(req.query.pageSize, 10) || 20, 1);
    const offset   = (page - 1) * pageSize;
    const status   = req.query.status || null; // filter theo status nếu có

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email', 'role'] },
        { model: Tag,  as: 'tags',   attributes: ['id', 'name', 'color'], through: { attributes: [] } },
      ],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
      distinct: true,
    });

    res.json({
      data: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    next(error);
  }
}

// ✅ THÊM: Xem chi tiết bài viết (tiêu đề, nội dung, tag, bình luận)
async function getPostById(req, res, next) {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email', 'role', 'avatar'] },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] },
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            { model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatar'] },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post);
  } catch (error) {
    next(error);
  }
}

// Đổi trạng thái bài (active / hidden / deleted)
async function updatePostStatus(req, res, next) {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const { status } = req.body;
    const allowed = ['active', 'hidden', 'deleted'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: `status phải là: ${allowed.join(', ')}` });
    }

    await post.update({ status });
    res.json(post);
  } catch (error) {
    next(error);
  }
}

// Xóa cứng bài viết
async function deletePost(req, res, next) {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await post.destroy();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getPosts, getPostById, updatePostStatus, deletePost };
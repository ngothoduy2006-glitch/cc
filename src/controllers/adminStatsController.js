const { User, Post, Comment, Tag, sequelize } = require('../models');
const { Op } = require('sequelize');

async function getStats(req, res, next) {
  try {
    const totalUsers    = await User.count();
    const totalPosts    = await Post.count({ where: { status: 'active' } }); // ✅ chỉ đếm active
    const totalComments = await Comment.count();
    const totalTags     = await Tag.count();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const postsToday = await Post.count({
      where: {
        createdAt: {
          [Op.gte]: startOfToday,
        },
        status: 'active',
      },
    });

    const activeUsers = await User.count({
      where: { status: 'active' },
    });

    // Thống kê bài theo trạng thái
    const postsByStatus = await Post.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    // Thống kê user theo role
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['role'],
      raw: true,
    });

    // Top 5 tag phổ biến
    const popularTags = await Tag.findAll({
      attributes: [
        'id', 'name', 'color',
        [sequelize.fn('COUNT', sequelize.col('posts.id')), 'count'],
      ],
      include: [{ model: Post, as: 'posts', attributes: [], through: { attributes: [] } }],
      group: ['Tag.id', 'Tag.name', 'Tag.color'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 5,
      subQuery: false,
    });

    res.json({
      totalUsers,
      totalPosts,
      totalComments,
      totalTags,
      postsToday,
      activeUsers,
      postsByStatus: postsByStatus.reduce((acc, r) => {
        acc[r.status] = Number(r.count);
        return acc;
      }, {}),
      usersByRole: usersByRole.reduce((acc, r) => {
        acc[r.role] = Number(r.count);
        return acc;
      }, {}),
      popularTags: popularTags.map((tag) => ({
        id:    tag.id,
        name:  tag.name,
        color: tag.color,
        count: Number(tag.get('count')),
      })),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getStats };
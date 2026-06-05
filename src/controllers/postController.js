const { Op } = require('sequelize');
const { Post, Tag, User, PostVote, SavedPost } = require('../models');

function getOrder(sort = 'newest') {
  switch (sort) {
    case 'oldest':  return [['createdAt', 'ASC']];
    case 'views':   return [['views',     'DESC']];
    case 'votes':   return [['votes',     'DESC']];
    case 'answers': return [['answersCount', 'DESC']];
    default:        return [['createdAt', 'DESC']];
  }
}

async function fetchPosts(req, res, next) {
  try {
    const {
      q = '',
      keyword = '',
      tag = '',
      tags = '',       // hỗ trợ filter nhiều tag: ?tags=1,2,3
      category = '',
      page = 1,
      limit = 10,
      pageSize,
      sort = 'newest',
    } = req.query;

    const searchText   = String(q || keyword || '').trim();
    const pageNumber   = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber  = Math.max(parseInt(pageSize || limit, 10) || 10, 1);
    const offset       = (pageNumber - 1) * limitNumber;

    // ✅ Public chỉ thấy bài active
    const where = { status: 'active' };

    if (searchText) {
      where[Op.or] = [
        { title:   { [Op.like]: `%${searchText}%` } },
        { content: { [Op.like]: `%${searchText}%` } },
      ];
    }

    if (category) {
      where.category = category;
    }

    // Tag filter — hỗ trợ cả tên đơn (?tag=) lẫn nhiều id (?tags=)
    const tagIds = tags
      ? String(tags).split(',').map(Number).filter(Boolean)
      : [];

    const tagInclude = {
      model: Tag,
      as: 'tags',
      attributes: ['id', 'name', 'color', 'usageCount'],
      through: { attributes: [] },
      required: !!(tag || tagIds.length),
    };

    if (tag) {
      tagInclude.where = { name: tag };
    } else if (tagIds.length) {
      tagInclude.where = { id: { [Op.in]: tagIds } };
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email', 'role', 'avatar'] },
        tagInclude,
      ],
      distinct: true,
      subQuery: false,
      order: getOrder(sort),
      offset,
      limit: limitNumber,
    });

    res.json({
      data: rows,
      total: count,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(count / limitNumber),
    });
  } catch (error) {
    next(error);
  }
}

async function getPosts(req, res, next) {
  return fetchPosts(req, res, next);
}

async function searchPosts(req, res, next) {
  return fetchPosts(req, res, next);
}

async function getPostById(req, res, next) {
  try {
    const { id } = req.params;

    const postRecord = await Post.findByPk(id);
    if (!postRecord) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // ✅ Không cho xem bài đã ẩn/xóa (public)
    if (postRecord.status !== 'active') {
      return res.status(404).json({ message: 'Bài viết không còn tồn tại.' });
    }

    await postRecord.increment('views');
    await postRecord.reload({
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email', 'role', 'avatar'] },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color', 'usageCount'],
          through: { attributes: [] },
        },
      ],
    });

    res.json(postRecord);
  } catch (error) {
    next(error);
  }
}

module.exports = { getPosts, getPostById, searchPosts };
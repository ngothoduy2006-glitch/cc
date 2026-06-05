const { Post, Tag, User, PostVote } = require('../models');
const { notifyUser } = require('../utils/notificationService');

async function createPost(req, res, next) {
  try {
    const { title, content, tags, category } = req.body;

    const post = await Post.create({
      title,
      content,
      authorId: req.user.id,
      category: category || null,
      status: 'active',
    });

    // Gắn tags
    const tagRecords = [];
    if (Array.isArray(tags) && tags.length > 0) {
      for (const rawTag of tags) {
        const name =
          typeof rawTag === 'string'
            ? rawTag.trim()
            : String(rawTag?.name || '').trim();

        if (!name) continue;

        const [tag, created] = await Tag.findOrCreate({
          where: { name },
          defaults: { name, description: '', color: '#7B61FF', usageCount: 0 },
        });

        if (created) {
          await tag.update({ usageCount: 1 });
        } else {
          await tag.increment('usageCount');
        }

        tagRecords.push(tag);
      }

      if (tagRecords.length > 0) {
        await post.setTags(tagRecords);
      }
    }

    // ✅ Thông báo cho chính tác giả (xác nhận đăng thành công)
    await notifyUser(
      req.user.id,
      'post_created',
      post.id,
      `Bài viết "${title}" đã được đăng thành công.`,
    );

    // ✅ Gửi email thông báo bài đăng mới đến tất cả giảng viên
    // (hoặc có thể gửi cho followers sau này — hiện tại gửi cho giảng viên cùng khoa)
    try {
      const { User: UserModel } = require('../models');
      const { sendEmail } = require('../utils/notificationService');
      const author = await UserModel.findByPk(req.user.id, {
        attributes: ['name', 'faculty'],
      });

      const lecturers = await UserModel.findAll({
        where: {
          role: 'lecturer',
          status: 'active',
          notifications: true,
          ...(author?.faculty ? { faculty: author.faculty } : {}),
        },
        attributes: ['email'],
      });

      for (const lecturer of lecturers) {
        await sendEmail(
          lecturer.email,
          '[Diễn đàn] Có bài đăng mới',
          `Bài viết mới: "${title}" vừa được đăng bởi ${author?.name || 'sinh viên'}.`,
        );
      }
    } catch (emailErr) {
      // Không block response nếu email lỗi
      console.warn('Email notify lecturers failed:', emailErr.message);
    }

    await post.reload({
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email', 'role', 'avatar'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'color'], through: { attributes: [] } },
      ],
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
}

async function updatePost(req, res, next) {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;

    const post = await Post.findByPk(id, {
      include: [{ model: Tag, as: 'tags' }],
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (req.user.role !== 'admin' && post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: Chỉ admin hoặc tác giả mới sửa được' });
    }

    const oldTags = post.tags || [];
    const oldTagNames = new Set(oldTags.map((t) => t.name));

    await post.update({
      ...(typeof title === 'string' ? { title } : {}),
      ...(typeof content === 'string' ? { content } : {}),
      ...(typeof category === 'string' ? { category } : {}),
    });

    if (Array.isArray(tags)) {
      const newTagRecords = [];

      for (const rawTag of tags) {
        const name =
          typeof rawTag === 'string'
            ? rawTag.trim()
            : String(rawTag?.name || '').trim();

        if (!name) continue;

        const [tag, created] = await Tag.findOrCreate({
          where: { name },
          defaults: { name, description: '', color: '#7B61FF', usageCount: 0 },
        });

        if (created) {
          await tag.update({ usageCount: 1 });
        } else if (!oldTagNames.has(name)) {
          await tag.increment('usageCount');
        }

        newTagRecords.push(tag);
      }

      const newTagNames = new Set(newTagRecords.map((t) => t.name));
      for (const oldTag of oldTags) {
        if (!newTagNames.has(oldTag.name) && oldTag.usageCount > 0) {
          await oldTag.decrement('usageCount');
        }
      }

      await post.setTags(newTagRecords);
    }

    await post.reload({
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email', 'role', 'avatar'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'color', 'usageCount'], through: { attributes: [] } },
      ],
    });

    res.json(post);
  } catch (error) {
    next(error);
  }
}

async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (req.user.role !== 'admin' && post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: Chỉ admin hoặc tác giả mới xóa được' });
    }

    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function votePost(req, res, next) {
  try {
    const { id } = req.params;
    const { direction } = req.body;

    if (!['up', 'down'].includes(direction)) {
      return res.status(400).json({ message: 'direction phải là up hoặc down' });
    }

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingVote = await PostVote.findOne({
      where: { postId: id, userId: req.user.id },
    });

    const delta = direction === 'up' ? 1 : -1;

    if (existingVote) {
      if (existingVote.voteType === direction) {
        // Bỏ vote
        await existingVote.destroy();
        post.votes -= delta;
      } else {
        // Đổi chiều vote
        const oldDelta = existingVote.voteType === 'up' ? 1 : -1;
        post.votes = post.votes - oldDelta + delta;
        existingVote.voteType = direction;
        await existingVote.save();
      }
    } else {
      await PostVote.create({ postId: id, userId: req.user.id, voteType: direction });
      post.votes += delta;
    }

    await post.save();
    res.json({ votes: post.votes, userVote: direction });
  } catch (error) {
    next(error);
  }
}

module.exports = { createPost, updatePost, deletePost, votePost };
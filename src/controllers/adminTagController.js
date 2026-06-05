const { Op } = require('sequelize');
const { Tag } = require('../models');

async function getTags(req, res, next) {
  try {
    const tags = await Tag.findAll({
      order: [
        ['usageCount', 'DESC'],
        ['name', 'ASC'],
      ],
    });
    res.json(tags);
  } catch (error) {
    next(error);
  }
}

async function createTag(req, res, next) {
  try {
    const { name, color } = req.body;

    const existing = await Tag.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'Tag đã tồn tại.' });
    }

    const tag = await Tag.create({
      name,
      color: color || '#7B61FF',
      usageCount: 0,
    });

    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
}

async function updateTag(req, res, next) {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    const { name, color } = req.body;

    if (name) {
      const duplicated = await Tag.findOne({
        where: {
          name,
          id: { [Op.ne]: req.params.id },
        },
      });
      if (duplicated) {
        return res.status(400).json({ message: 'Tag đã tồn tại.' });
      }
    }

    await tag.update({
      ...(name ? { name } : {}),
      ...(color ? { color } : {}),
    });

    res.json(tag);
  } catch (error) {
    next(error);
  }
}

async function deleteTag(req, res, next) {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    await tag.destroy();
    res.json({ message: 'Tag deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTags,
  createTag,
  updateTag,
  deleteTag,
};

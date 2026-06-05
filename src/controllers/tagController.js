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

module.exports = {
  getTags,
};

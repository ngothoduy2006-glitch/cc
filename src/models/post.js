const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // ✅ THÊM: để admin ẩn/xóa mềm bài viết
  status: {
    type: DataTypes.ENUM('active', 'hidden', 'deleted'),
    defaultValue: 'active',
  },
  votes:        { type: DataTypes.INTEGER, defaultValue: 0 },
  views:        { type: DataTypes.INTEGER, defaultValue: 0 },
  answersCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  category:     { type: DataTypes.STRING },
}, {
  tableName: 'Posts',
  timestamps: true,
});

module.exports = Post;
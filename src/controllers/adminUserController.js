const { Op } = require('sequelize');
const { randomBytes } = require('crypto');
const { User } = require('../models');
const { hashPassword } = require('../utils/password');
const { sendPasswordResetEmail } = require('../utils/notificationService');

function sanitizeUser(user) {
  const plain = user.get ? user.get({ plain: true }) : user;
  delete plain.passwordHash;
  return plain;
}

async function getUsers(req, res, next) {
  try {
    const page     = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(req.query.pageSize, 10) || 20, 1);
    const offset   = (page - 1) * pageSize;
    const search   = req.query.q ? req.query.q.trim() : null;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name:  { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { code:  { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    res.json({ data: rows, total: count, page, pageSize, totalPages: Math.ceil(count / pageSize) });
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const {
      name,
      code = null,       // ✅ nhận mã sinh viên
      email,
      password,
      role = 'student',
      status = 'active',
      department = null,
      faculty = null,
      class: className = null,
      avatar = null,
    } = req.body;

    // Kiểm tra trùng email
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email đã tồn tại.' });
    }

    // ✅ Kiểm tra trùng code nếu có
    if (code) {
      const existingCode = await User.findOne({ where: { code } });
      if (existingCode) {
        return res.status(400).json({ message: 'Mã sinh viên đã tồn tại.' });
      }
    }

    const user = await User.create({
      name,
      code,
      email,
      passwordHash: hashPassword(password || '123456'),
      role,
      status,
      department,
      faculty,
      class: className,
      avatar,
    });

    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updateData = { ...req.body };

    // Kiểm tra trùng email
    if (updateData.email) {
      const dup = await User.findOne({
        where: { email: updateData.email, id: { [Op.ne]: req.params.id } },
      });
      if (dup) return res.status(400).json({ message: 'Email đã tồn tại.' });
    }

    // ✅ Kiểm tra trùng code
    if (updateData.code) {
      const dup = await User.findOne({
        where: { code: updateData.code, id: { [Op.ne]: req.params.id } },
      });
      if (dup) return res.status(400).json({ message: 'Mã sinh viên đã tồn tại.' });
    }

    if (updateData.password) {
      updateData.passwordHash = hashPassword(updateData.password);
      delete updateData.password;
    }

    // Không cho phép cập nhật passwordHash trực tiếp
    delete updateData.passwordHash;

    await user.update(updateData);

    const updated = await User.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { status } = req.body;
    if (!['active', 'locked'].includes(status)) {
      return res.status(400).json({ message: 'status phải là active hoặc locked.' });
    }

    await user.update({ status });

    const updated = await User.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
}

async function lockUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ status: 'locked' });
    res.json({ message: 'Tài khoản đã bị khóa', user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newPassword = randomBytes(6).toString('hex');
    await user.update({ passwordHash: hashPassword(newPassword) });

    try {
      await sendPasswordResetEmail(user.email, newPassword);
    } catch (emailError) {
      console.warn('Email sending failed but password reset succeeded:', emailError.message);
    }

    res.json({ message: 'Mật khẩu đã được đặt lại', newPassword });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  lockUser,
  resetPassword,
};
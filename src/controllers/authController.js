const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');
const { hashPassword, comparePassword } = require('../utils/password');

function sanitizeUser(user) {
  const plain = user.get ? user.get({ plain: true }) : user;
  delete plain.passwordHash;
  return plain;
}

async function register(req, res, next) {
  try {
    const {
      name,
      email,
      code,
      studentId,
      username,
      password,
      role,
      department,
      faculty,
      class: className,
      avatar,
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Họ tên phải có ít nhất 2 ký tự.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    // ✅ Lấy code từ nhiều tên field frontend có thể gửi lên
    const finalCode = code || studentId || username || null;

    if (!email && !finalCode) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email hoặc mã sinh viên.' });
    }

    if (role && !['student', 'lecturer'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò đăng ký chỉ được là student hoặc lecturer.' });
    }

    // ✅ Kiểm tra trùng code nếu có
    if (finalCode) {
      const existingCode = await User.findOne({ where: { code: finalCode } });
      if (existingCode) {
        return res.status(400).json({ message: 'Mã sinh viên đã được sử dụng.' });
      }
    }

    // ✅ Kiểm tra trùng email nếu có
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email đã được sử dụng.' });
      }
    }

    // Tạo email fallback nếu không có
    const finalEmail = email || `${finalCode}@student.forum`;

    const user = await User.create({
      id: uuidv4(),
      name: name.trim(),
      code: finalCode,       // ✅ Lưu mã sinh viên
      email: finalEmail,
      passwordHash: hashPassword(password),
      role: role || 'student',
      department: department || null,
      faculty: faculty || null,
      class: className || null,
      avatar: avatar || null,
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, studentId, username, code, password } = req.body;

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const identifier = code || studentId || username || null;
    if (!email && !identifier) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email hoặc mã sinh viên.' });
    }

    let user = null;

    // ✅ Tìm theo email trước
    if (email) {
      user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    }

    // ✅ Tìm theo code (cột riêng, không cần hack email)
    if (!user && identifier) {
      user = await User.findOne({ where: { code: identifier.trim() } });
    }

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });
    }

    // ✅ Kiểm tra tài khoản bị khóa
    if (user.status === 'locked') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.' });
    }

    if (!comparePassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn },
    );

    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.json({ message: 'Logged out' });
}

async function profile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
}

// Reset mật khẩu tự phục vụ (chưa dùng, giữ stub)
async function resetPassword(req, res) {
  res.status(501).json({ message: 'Chức năng chưa được triển khai.' });
}

module.exports = { register, login, logout, profile, resetPassword };
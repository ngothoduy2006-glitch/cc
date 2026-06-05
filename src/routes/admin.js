const express = require('express');
const adminUserController = require('../controllers/adminUserController');
const adminPostController = require('../controllers/adminPostController');
const adminTagController  = require('../controllers/adminTagController');
const adminStatsController = require('../controllers/adminStatsController');
const { authenticate }    = require('../middlewares/authMiddleware');
const { authorize }       = require('../middlewares/roleMiddleware');
const { ADMIN_ONLY }      = require('../config/roles');
const {
  validateUserCreate,
  validateUserUpdate,
  validateTagCreate,
  validateTagUpdate,
  handleValidationErrors,
} = require('../middlewares/validation');

const router = express.Router();

// Tất cả route admin yêu cầu đăng nhập + quyền admin
router.use(authenticate);
router.use(authorize(ADMIN_ONLY));

// ── Users ────────────────────────────────────────────────
router.get('/users',                adminUserController.getUsers);
router.get('/users/:id',            adminUserController.getUserById);
router.post('/users',               validateUserCreate, handleValidationErrors, adminUserController.createUser);
router.put('/users/:id',            validateUserUpdate, handleValidationErrors, adminUserController.updateUser);
router.patch('/users/:id/status',   adminUserController.updateUserStatus);
router.patch('/users/:id/lock',     adminUserController.lockUser);
router.post('/users/:id/reset-password', adminUserController.resetPassword);
router.delete('/users/:id',         adminUserController.deleteUser);

// ── Posts ─────────────────────────────────────────────────
router.get('/posts',                adminPostController.getPosts);
router.get('/posts/:id',            adminPostController.getPostById);      // ✅ THÊM: xem chi tiết
router.patch('/posts/:id/status',   adminPostController.updatePostStatus);
router.delete('/posts/:id',         adminPostController.deletePost);

// ── Tags ──────────────────────────────────────────────────
router.get('/tags',                 adminTagController.getTags);
router.post('/tags',                validateTagCreate, handleValidationErrors, adminTagController.createTag);
router.put('/tags/:id',             validateTagUpdate, handleValidationErrors, adminTagController.updateTag);
router.delete('/tags/:id',          adminTagController.deleteTag);

// ── Stats ─────────────────────────────────────────────────
router.get('/stats',                adminStatsController.getStats);

module.exports = router;
// ✨ CẬP NHẬT FILE: backend/routes/forum.js
const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');
const postActionController = require('../controllers/postActionController');
const postSaveController = require('../controllers/postSaveController');
const commentController = require('../controllers/commentController');
const commentActionController = require('../controllers/commentActionController');
const tagController = require('../controllers/tagController');
const forumValidator = require('../validators/forumValidator');

const router = express.Router();

// Public routes
router.get(
  '/posts',
  forumValidator.search,
  forumValidator.validate,
  postController.getPosts,
);

router.get('/posts/:id', postController.getPostById);

router.get('/posts/:postId/comments', commentController.getComments);

router.get('/tags', tagController.getTags);

// Authenticated routes
router.post('/posts',
  authenticate,
  forumValidator.createPost,
  forumValidator.validate,
  postActionController.createPost,
);

router.put('/posts/:id',
  authenticate,
  forumValidator.createPost,
  forumValidator.validate,
  postActionController.updatePost,
);

router.delete('/posts/:id',
  authenticate,
  postActionController.deletePost,
);

router.post('/posts/:id/vote',
  authenticate,
  forumValidator.vote,
  forumValidator.validate,
  postActionController.votePost,
);

router.get('/posts/:postId/my-vote',
  authenticate,
  postSaveController.getUserVote,
);

router.post('/posts/:id/save',
  authenticate,
  postSaveController.savePost,
);

router.get('/saved-posts',
  authenticate,
  postSaveController.getSavedPosts,
);

router.post('/posts/:postId/comments',
  authenticate,
  forumValidator.createComment,
  forumValidator.validate,
  commentController.createComment,
);

router.post('/posts/:postId/comments/:parentCommentId/reply',
  authenticate,
  forumValidator.createComment,
  forumValidator.validate,
  commentController.replyComment,
);

router.delete('/comments/:id',
  authenticate,
  commentActionController.deleteComment,
);

router.post('/comments/:id/vote',
  authenticate,
  forumValidator.vote,
  forumValidator.validate,
  commentActionController.voteComment,
);

module.exports = router;
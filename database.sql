SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `CommentVotes`;
DROP TABLE IF EXISTS `PostVotes`;
DROP TABLE IF EXISTS `SavedPosts`;
DROP TABLE IF EXISTS `Notifications`;
DROP TABLE IF EXISTS `PostTags`;
DROP TABLE IF EXISTS `Comments`;
DROP TABLE IF EXISTS `Posts`;
DROP TABLE IF EXISTS `Tags`;
DROP TABLE IF EXISTS `Users`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE DATABASE IF NOT EXISTS `forum_app`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `forum_app`;

CREATE TABLE `Users` (
  `id`           CHAR(36)     NOT NULL PRIMARY KEY,
  `name`         VARCHAR(255) NOT NULL,
  `code`         VARCHAR(50)  UNIQUE,
  `email`        VARCHAR(255) NOT NULL UNIQUE,
  `passwordHash` VARCHAR(255) NOT NULL,
  `role`         ENUM('student', 'lecturer', 'admin') NOT NULL DEFAULT 'student',
  `status`       ENUM('active', 'locked') NOT NULL DEFAULT 'active',
  `department`   VARCHAR(255),
  `faculty`      VARCHAR(255),
  `class`        VARCHAR(255),
  `avatar`       VARCHAR(255),
  `darkMode`     BOOLEAN      NOT NULL DEFAULT FALSE,
  `notifications` BOOLEAN     NOT NULL DEFAULT TRUE,
  `bio`          TEXT,
  `createdAt`    DATETIME     NOT NULL,
  `updatedAt`    DATETIME     NOT NULL,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_code`  (`code`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Posts` (
  `id`           CHAR(36)     NOT NULL PRIMARY KEY,
  `title`        VARCHAR(255) NOT NULL,
  `content`      TEXT         NOT NULL,
  `authorId`     CHAR(36)     NOT NULL,
  `status`       ENUM('active', 'hidden', 'deleted') NOT NULL DEFAULT 'active',
  `votes`        INT          NOT NULL DEFAULT 0,
  `views`        INT          NOT NULL DEFAULT 0,
  `answersCount` INT          NOT NULL DEFAULT 0,
  `category`     VARCHAR(255),
  `createdAt`    DATETIME     NOT NULL,
  `updatedAt`    DATETIME     NOT NULL,
  INDEX `idx_posts_authorId`  (`authorId`),
  INDEX `idx_posts_title`     (`title`),
  INDEX `idx_posts_status`    (`status`),
  INDEX `idx_posts_createdAt` (`createdAt`),
  INDEX `idx_posts_votes`     (`votes`),
  INDEX `idx_posts_views`     (`views`),
  CONSTRAINT `Posts_author_fk`
    FOREIGN KEY (`authorId`)
    REFERENCES `Users`(`id`)
    ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Comments` (
  `id`              CHAR(36) NOT NULL PRIMARY KEY,
  `postId`          CHAR(36) NOT NULL,
  `authorId`        CHAR(36) NOT NULL,
  `parentCommentId` CHAR(36),
  `content`         TEXT     NOT NULL,
  `votes`           INT      NOT NULL DEFAULT 0,
  `createdAt`       DATETIME NOT NULL,
  `updatedAt`       DATETIME NOT NULL,
  INDEX `idx_comments_postId`          (`postId`),
  INDEX `idx_comments_authorId`        (`authorId`),
  INDEX `idx_comments_parentCommentId` (`parentCommentId`),
  INDEX `idx_comments_createdAt`       (`createdAt`),
  CONSTRAINT `Comments_post_fk`
    FOREIGN KEY (`postId`)
    REFERENCES `Posts`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `Comments_author_fk`
    FOREIGN KEY (`authorId`)
    REFERENCES `Users`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `Comments_parent_fk`
    FOREIGN KEY (`parentCommentId`)
    REFERENCES `Comments`(`id`)
    ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Tags` (
  `id`          CHAR(36)     NOT NULL PRIMARY KEY,
  `name`        VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `color`       VARCHAR(50)  DEFAULT '#7B61FF',
  `usageCount`  INT          DEFAULT 0,
  `createdAt`   DATETIME     NOT NULL,
  `updatedAt`   DATETIME     NOT NULL,
  INDEX `idx_tags_name` (`name`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `PostTags` (
  `id`        CHAR(36) NOT NULL PRIMARY KEY,
  `postId`    CHAR(36) NOT NULL,
  `tagId`     CHAR(36) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE KEY `unique_post_tag` (`postId`, `tagId`),
  INDEX `idx_posttags_postId` (`postId`),
  INDEX `idx_posttags_tagId`  (`tagId`),
  CONSTRAINT `PostTags_post_fk`
    FOREIGN KEY (`postId`)
    REFERENCES `Posts`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `PostTags_tag_fk`
    FOREIGN KEY (`tagId`)
    REFERENCES `Tags`(`id`)
    ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Notifications` (
  `id`          CHAR(36)     NOT NULL PRIMARY KEY,
  `recipientId` CHAR(36)     NOT NULL,
  `type`        VARCHAR(50)  NOT NULL,
  `targetId`    CHAR(36),
  `message`     VARCHAR(500) NOT NULL,
  `read`        TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`   DATETIME     NOT NULL,
  `updatedAt`   DATETIME     NOT NULL,
  INDEX `idx_notifications_recipientId` (`recipientId`),
  INDEX `idx_notifications_read`        (`read`),
  CONSTRAINT `Notifications_recipient_fk`
    FOREIGN KEY (`recipientId`)
    REFERENCES `Users`(`id`)
    ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `PostVotes` (
  `id`        CHAR(36)              NOT NULL PRIMARY KEY,
  `postId`    CHAR(36)              NOT NULL,
  `userId`    CHAR(36)              NOT NULL,
  `voteType`  ENUM('up', 'down')    NOT NULL,
  `createdAt` DATETIME              NOT NULL,
  `updatedAt` DATETIME              NOT NULL,
  UNIQUE KEY `unique_post_vote` (`postId`, `userId`),
  INDEX `idx_postvotes_postId` (`postId`),
  INDEX `idx_postvotes_userId` (`userId`),
  CONSTRAINT `PostVotes_post_fk`
    FOREIGN KEY (`postId`)
    REFERENCES `Posts`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `PostVotes_user_fk`
    FOREIGN KEY (`userId`)
    REFERENCES `Users`(`id`)
    ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `CommentVotes` (
  `id`          CHAR(36)              NOT NULL PRIMARY KEY,
  `commentId`   CHAR(36)              NOT NULL,
  `userId`      CHAR(36)              NOT NULL,
  `voteType`    ENUM('up', 'down')    NOT NULL,
  `createdAt`   DATETIME              NOT NULL,
  `updatedAt`   DATETIME              NOT NULL,
  UNIQUE KEY `unique_comment_vote` (`commentId`, `userId`),
  INDEX `idx_commentvotes_commentId` (`commentId`),
  INDEX `idx_commentvotes_userId`    (`userId`),
  CONSTRAINT `CommentVotes_comment_fk`
    FOREIGN KEY (`commentId`)
    REFERENCES `Comments`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `CommentVotes_user_fk`
    FOREIGN KEY (`userId`)
    REFERENCES `Users`(`id`)
    ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `SavedPosts` (
  `id`        CHAR(36) NOT NULL PRIMARY KEY,
  `userId`    CHAR(36) NOT NULL,
  `postId`    CHAR(36) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE KEY `unique_saved_post` (`userId`, `postId`),
  INDEX `idx_savedposts_userId` (`userId`),
  INDEX `idx_savedposts_postId` (`postId`),
  CONSTRAINT `SavedPosts_user_fk`
    FOREIGN KEY (`userId`)
    REFERENCES `Users`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `SavedPosts_post_fk`
    FOREIGN KEY (`postId`)
    REFERENCES `Posts`(`id`)
    ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
USE `forum_app`;

-- ── Users ────────────────────────────────────────────────────
INSERT INTO `Users` (`id`, `name`, `code`, `email`, `passwordHash`, `role`, `status`, `faculty`, `department`, `class`, `bio`, `createdAt`, `updatedAt`) VALUES
('u-admin-001', 'Admin Hệ thống',   NULL,       'admin@hust.edu.vn',    '$2b$10$PLACEHOLDER_HASH_ADMIN',    'admin',    'active', NULL,                    NULL,             NULL,      'Quản trị viên hệ thống', NOW(), NOW()),
('u-lect-001',  'TS. Nguyễn Văn A', 'GV001',    'nva@hust.edu.vn',      '$2b$10$PLACEHOLDER_HASH_LEC1',     'lecturer', 'active', 'Công nghệ Thông tin',   'Kỹ thuật phần mềm', NULL,   'Giảng viên môn Lập trình Web và Mobile', NOW(), NOW()),
('u-lect-002',  'PGS. Trần Thị B',  'GV002',    'ttb@hust.edu.vn',      '$2b$10$PLACEHOLDER_HASH_LEC2',     'lecturer', 'active', 'Công nghệ Thông tin',   'Hệ thống thông tin', NULL,  'Chuyên ngành Cơ sở dữ liệu và AI', NOW(), NOW()),
('u-stud-001',  'Lê Văn C',         'SV20210001','lvc@students.hust.edu.vn','$2b$10$PLACEHOLDER_HASH_SV1',  'student',  'active', 'Công nghệ Thông tin',   NULL,             'IT-01 K66', NULL, NOW(), NOW()),
('u-stud-002',  'Phạm Thị D',       'SV20210002','ptd@students.hust.edu.vn','$2b$10$PLACEHOLDER_HASH_SV2',  'student',  'active', 'Công nghệ Thông tin',   NULL,             'IT-02 K66', NULL, NOW(), NOW()),
('u-stud-003',  'Hoàng Minh E',     'SV20210003','hme@students.hust.edu.vn','$2b$10$PLACEHOLDER_HASH_SV3',  'student',  'active', 'Điện tử Viễn thông',    NULL,             'ET-01 K66', NULL, NOW(), NOW()),
('u-stud-004',  'Đỗ Quốc F',        'SV20200010','dqf@students.hust.edu.vn','$2b$10$PLACEHOLDER_HASH_SV4',  'student',  'locked', 'Công nghệ Thông tin',   NULL,             'IT-03 K65', NULL, NOW(), NOW());

-- ── Tags ─────────────────────────────────────────────────────
INSERT INTO `Tags` (`id`, `name`, `color`, `description`, `createdAt`, `updatedAt`) VALUES
('tag-001', 'JavaScript',  '#f7df1e', 'Ngôn ngữ lập trình web phía client', NOW(), NOW()),
('tag-002', 'ReactJS',     '#61dafb', 'Thư viện UI của Facebook',           NOW(), NOW()),
('tag-003', 'NodeJS',      '#3c873a', 'Runtime JavaScript phía server',      NOW(), NOW()),
('tag-004', 'MySQL',       '#4479a1', 'Hệ quản trị cơ sở dữ liệu',         NOW(), NOW()),
('tag-005', 'Python',      '#3776ab', 'Ngôn ngữ đa mục đích',               NOW(), NOW()),
('tag-006', 'Học thuật',   '#fa8c16', 'Câu hỏi liên quan đến học tập',      NOW(), NOW()),
('tag-007', 'Thực tập',    '#eb2f96', 'Tìm kiếm và kinh nghiệm thực tập',   NOW(), NOW()),
('tag-008', 'Quy chế',     '#52c41a', 'Quy định, thủ tục nhà trường',       NOW(), NOW()),
('tag-009', 'Docker',      '#2496ed', 'Container và DevOps',                 NOW(), NOW()),
('tag-010', 'Git',         '#f05032', 'Quản lý phiên bản mã nguồn',          NOW(), NOW());

-- ── Posts ─────────────────────────────────────────────────────
INSERT INTO `Posts` (`id`, `title`, `content`, `authorId`, `status`, `votes`, `views`, `answersCount`, `category`, `createdAt`, `updatedAt`) VALUES
('post-001', 'Làm thế nào để học ReactJS hiệu quả từ đầu?',
  '<p>Mình đang học năm 3 ngành CNTT và muốn bắt đầu học ReactJS. Các bạn có kinh nghiệm gì chia sẻ không? Mình nên bắt đầu từ đâu, có cần học JavaScript nâng cao trước không?</p>',
  'u-stud-001', 'active', 15, 234, 3, 'tech', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),

('post-002', 'Điều kiện xét học bổng khuyến khích học tập học kỳ này là gì?',
  '<p>Mình nghe nói học kỳ này có thay đổi về tiêu chí xét học bổng, ai biết thông tin cụ thể không? Điểm GPA tối thiểu là bao nhiêu?</p>',
  'u-stud-002', 'active', 28, 512, 5, 'admin', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),

('post-003', 'Tìm hiểu về cơ hội thực tập tại các công ty công nghệ lớn',
  '<p>Các bạn đã thực tập ở đâu chưa? Kinh nghiệm thực tập tại các công ty như VNG, FPT, hay startup như thế nào? Chia sẻ để mọi người cùng biết nhé!</p>',
  'u-stud-003', 'active', 42, 890, 8, 'career', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),

('post-004', 'Lỗi CORS khi gọi API từ React sang Node.js backend',
  '<p>Mình đang làm đồ án môn Web và gặp lỗi <code>Access-Control-Allow-Origin</code> khi gọi API. Backend dùng Express, frontend dùng React + Axios. Làm thế nào để fix?</p><pre><code>Error: CORS policy blocked request from origin http://localhost:3000</code></pre>',
  'u-stud-001', 'active', 19, 345, 4, 'tech', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

('post-005', 'Hướng dẫn đăng ký môn học cho sinh viên năm 3',
  '<p>Có bạn nào biết cách đăng ký môn học online cho học kỳ tới không? Mình vào portal nhưng không thấy nút đăng ký, không biết có lỗi gì không?</p>',
  'u-stud-002', 'active', 7, 156, 2, 'admin', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ── PostTags ──────────────────────────────────────────────────
INSERT INTO `PostTags` (`postId`, `tagId`) VALUES
('post-001', 'tag-001'), ('post-001', 'tag-002'), ('post-001', 'tag-006'),
('post-002', 'tag-006'), ('post-002', 'tag-008'),
('post-003', 'tag-007'), ('post-003', 'tag-006'),
('post-004', 'tag-001'), ('post-004', 'tag-002'), ('post-004', 'tag-003'),
('post-005', 'tag-008'), ('post-005', 'tag-006');

-- ── Comments ──────────────────────────────────────────────────
INSERT INTO `Comments` (`id`, `postId`, `authorId`, `parentCommentId`, `content`, `votes`, `createdAt`, `updatedAt`) VALUES
('cmt-001', 'post-001', 'u-lect-001', NULL,
  '<p>Bạn nên học JavaScript ES6+ vững trước, rồi mới học React. Bắt đầu bằng official docs tại <a href="https://react.dev">react.dev</a> là tốt nhất!</p>',
  8, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),

('cmt-002', 'post-001', 'u-stud-003', NULL,
  '<p>Mình học qua Udemy của Maximilian rất tốt, khoảng 4 tuần là dùng được React cơ bản.</p>',
  5, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),

('cmt-003', 'post-001', 'u-stud-002', 'cmt-001',
  '<p>Cảm ơn thầy! Vậy có cần học TypeScript không thầy ơi?</p>',
  2, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),

('cmt-004', 'post-002', 'u-lect-002', NULL,
  '<p>Theo quy chế mới, GPA tối thiểu là 3.2/4.0 cho học bổng loại khá. Các bạn xem thêm trên portal nhà trường.</p>',
  12, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),

('cmt-005', 'post-004', 'u-lect-001', NULL,
  '<p>Thêm middleware cors vào Express: <code>app.use(cors({ origin: "http://localhost:3000" }))</code> là xong!</p>',
  15, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ── SavedPosts ────────────────────────────────────────────────
INSERT INTO `SavedPosts` (`userId`, `postId`, `createdAt`) VALUES
('u-stud-001', 'post-002', NOW()),
('u-stud-001', 'post-003', NOW()),
('u-stud-002', 'post-001', NOW()),
('u-stud-003', 'post-004', NOW());

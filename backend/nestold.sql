/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50744 (5.7.44-log)
 Source Host           : localhost:3306
 Source Schema         : nestold

 Target Server Type    : MySQL
 Target Server Version : 50744 (5.7.44-log)
 File Encoding         : 65001

 Date: 03/07/2024 20:12:47
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for content_categories
-- ----------------------------
DROP TABLE IF EXISTS `content_categories`;
CREATE TABLE `content_categories`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '分类名称',
  `customOrder` int(11) NOT NULL DEFAULT 0 COMMENT '分类排序',
  `mpath` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT '',
  `parentId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `deletedAt` datetime(6) NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_a03aea27707893300382b6f18ae`(`parentId`) USING BTREE,
  CONSTRAINT `FK_a03aea27707893300382b6f18ae` FOREIGN KEY (`parentId`) REFERENCES `content_categories` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of content_categories
-- ----------------------------
INSERT INTO `content_categories` VALUES ('3680d378-7190-4f56-bd5a-d59cfc378c69', 'nextjs', 0, '3680d378-7190-4f56-bd5a-d59cfc378c69.', NULL, NULL);
INSERT INTO `content_categories` VALUES ('442d90c4-45c7-4dcf-be0a-567a2b0da130', 'nestjs', 0, '442d90c4-45c7-4dcf-be0a-567a2b0da130.', NULL, NULL);
INSERT INTO `content_categories` VALUES ('5a92b5f2-8943-4820-ab87-b25b9135d568', 'java', 0, '5a92b5f2-8943-4820-ab87-b25b9135d568.', NULL, NULL);
INSERT INTO `content_categories` VALUES ('8d6473bf-7637-4486-a521-1c4f61e78b2b', 'react', 0, '8d6473bf-7637-4486-a521-1c4f61e78b2b.', NULL, NULL);

-- ----------------------------
-- Table structure for content_comments
-- ----------------------------
DROP TABLE IF EXISTS `content_comments`;
CREATE TABLE `content_comments`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `body` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '评论内容',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `mpath` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT '',
  `postId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `parentId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_5e1c3747a0031f305e94493361f`(`postId`) USING BTREE,
  INDEX `FK_982a849f676860e5d6beb607f20`(`parentId`) USING BTREE,
  CONSTRAINT `FK_5e1c3747a0031f305e94493361f` FOREIGN KEY (`postId`) REFERENCES `content_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_982a849f676860e5d6beb607f20` FOREIGN KEY (`parentId`) REFERENCES `content_comments` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of content_comments
-- ----------------------------

-- ----------------------------
-- Table structure for content_posts
-- ----------------------------
DROP TABLE IF EXISTS `content_posts`;
CREATE TABLE `content_posts`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '文章标题',
  `body` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '文章内容',
  `summary` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '文章描述',
  `keywords` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL COMMENT '关键字',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `type` enum('html','markdown') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'markdown',
  `publishedAt` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '发布时间',
  `customOrder` int(11) NOT NULL DEFAULT 0 COMMENT '分类排序',
  `authorId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_8fcc2d81ced7b8ade2bbd151b1a`(`authorId`) USING BTREE,
  CONSTRAINT `FK_8fcc2d81ced7b8ade2bbd151b1a` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of content_posts
-- ----------------------------

-- ----------------------------
-- Table structure for content_posts_categories_content_categories
-- ----------------------------
DROP TABLE IF EXISTS `content_posts_categories_content_categories`;
CREATE TABLE `content_posts_categories_content_categories`  (
  `contentPostsId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `contentCategoriesId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`contentPostsId`, `contentCategoriesId`) USING BTREE,
  INDEX `IDX_9172320639056856745c6bc21a`(`contentPostsId`) USING BTREE,
  INDEX `IDX_82926fe45def38f6a53838347a`(`contentCategoriesId`) USING BTREE,
  CONSTRAINT `FK_82926fe45def38f6a53838347a2` FOREIGN KEY (`contentCategoriesId`) REFERENCES `content_categories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_9172320639056856745c6bc21aa` FOREIGN KEY (`contentPostsId`) REFERENCES `content_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of content_posts_categories_content_categories
-- ----------------------------

-- ----------------------------
-- Table structure for user_access_tokens
-- ----------------------------
DROP TABLE IF EXISTS `user_access_tokens`;
CREATE TABLE `user_access_tokens`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `value` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expired_at` datetime NOT NULL COMMENT '令牌过期时间',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '令牌创建时间',
  `userId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_71a030e491d5c8547fc1e38ef82`(`userId`) USING BTREE,
  CONSTRAINT `FK_71a030e491d5c8547fc1e38ef82` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_access_tokens
-- ----------------------------

-- ----------------------------
-- Table structure for user_refresh_tokens
-- ----------------------------
DROP TABLE IF EXISTS `user_refresh_tokens`;
CREATE TABLE `user_refresh_tokens`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `value` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expired_at` datetime NOT NULL COMMENT '令牌过期时间',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '令牌创建时间',
  `accessTokenId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `REL_1dfd080c2abf42198691b60ae3`(`accessTokenId`) USING BTREE,
  CONSTRAINT `FK_1dfd080c2abf42198691b60ae39` FOREIGN KEY (`accessTokenId`) REFERENCES `user_access_tokens` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_refresh_tokens
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '姓名',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '用户名',
  `password` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '密码',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '邮箱',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '用户创建时间',
  `deletedAt` datetime(6) NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `IDX_fe0bb3f6520ee0469504521e71`(`username`) USING BTREE,
  UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be`(`email`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;

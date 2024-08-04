/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80300 (8.3.0)
 Source Host           : localhost:3306
 Source Schema         : nestold

 Target Server Type    : MySQL
 Target Server Version : 80300 (8.3.0)
 File Encoding         : 65001

 Date: 05/08/2024 00:09:56
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for content_posts
-- ----------------------------
DROP TABLE IF EXISTS `content_posts`;
CREATE TABLE `content_posts` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '文章标题',
  `body` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '文章内容',
  `summary` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '文章描述',
  `keywords` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin COMMENT '关键字',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `type` enum('html','markdown') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'markdown',
  `publishedAt` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '发布时间',
  `customOrder` int NOT NULL DEFAULT '0' COMMENT '分类排序',
  `authorId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `deletedAt` datetime(6) DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_8fcc2d81ced7b8ade2bbd151b1a` (`authorId`) USING BTREE,
  CONSTRAINT `FK_8fcc2d81ced7b8ade2bbd151b1a` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of content_posts
-- ----------------------------
BEGIN;
INSERT INTO `content_posts` (`id`, `title`, `body`, `summary`, `keywords`, `createdAt`, `updatedAt`, `type`, `publishedAt`, `customOrder`, `authorId`, `deletedAt`) VALUES ('43dfdfb7-9372-4d27-aede-bd7346775a9e', '这是文章一', '这是文章一的内容Body', NULL, NULL, '2024-08-04 22:27:26.873461', '2024-08-04 22:27:26.873461', 'markdown', NULL, 0, '61e7869a-6c1f-4188-8529-0c842e231f4e', NULL);
INSERT INTO `content_posts` (`id`, `title`, `body`, `summary`, `keywords`, `createdAt`, `updatedAt`, `type`, `publishedAt`, `customOrder`, `authorId`, `deletedAt`) VALUES ('aa8b94f1-47f1-4f73-ab53-e86b90c0c386', '这是文章二', '这是文章二的内容Body', NULL, NULL, '2024-08-04 23:12:39.793501', '2024-08-04 23:12:39.793501', 'markdown', NULL, 0, '61e7869a-6c1f-4188-8529-0c842e231f4e', NULL);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;

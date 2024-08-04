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

 Date: 05/08/2024 00:09:22
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for content_categories
-- ----------------------------
DROP TABLE IF EXISTS `content_categories`;
CREATE TABLE `content_categories` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '分类名称',
  `customOrder` int NOT NULL DEFAULT '0' COMMENT '分类排序',
  `mpath` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '',
  `parentId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `deletedAt` datetime(6) DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_a03aea27707893300382b6f18ae` (`parentId`) USING BTREE,
  CONSTRAINT `FK_a03aea27707893300382b6f18ae` FOREIGN KEY (`parentId`) REFERENCES `content_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of content_categories
-- ----------------------------
BEGIN;
INSERT INTO `content_categories` (`id`, `name`, `customOrder`, `mpath`, `parentId`, `deletedAt`) VALUES ('3680d378-7190-4f56-bd5a-d59cfc378c69', 'nextjs', 0, '3680d378-7190-4f56-bd5a-d59cfc378c69.', NULL, NULL);
INSERT INTO `content_categories` (`id`, `name`, `customOrder`, `mpath`, `parentId`, `deletedAt`) VALUES ('442d90c4-45c7-4dcf-be0a-567a2b0da130', 'nestjs', 0, '442d90c4-45c7-4dcf-be0a-567a2b0da130.', NULL, NULL);
INSERT INTO `content_categories` (`id`, `name`, `customOrder`, `mpath`, `parentId`, `deletedAt`) VALUES ('5a92b5f2-8943-4820-ab87-b25b9135d568', 'java', 0, '5a92b5f2-8943-4820-ab87-b25b9135d568.', NULL, NULL);
INSERT INTO `content_categories` (`id`, `name`, `customOrder`, `mpath`, `parentId`, `deletedAt`) VALUES ('8d6473bf-7637-4486-a521-1c4f61e78b2b', 'react', 0, '8d6473bf-7637-4486-a521-1c4f61e78b2b.', NULL, NULL);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;

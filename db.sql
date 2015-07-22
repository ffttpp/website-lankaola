/*
 Navicat Premium Data Transfer

 Target Server Type    : MySQL
 Target Server Version : 50617
 File Encoding         : utf-8

 Date: 07/22/2015 10:44:29 AM
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `admin_logs`
-- ----------------------------
DROP TABLE IF EXISTS `admin_logs`;
CREATE TABLE `admin_logs` (
  `logs_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '日志id',
  `logs_time` int(11) NOT NULL COMMENT '日志时间',
  `user_id` int(11) NOT NULL COMMENT '该日志所记录的操作者id,同admin_user的user_id',
  `log_info` varchar(45) NOT NULL COMMENT '操作内容',
  `ip_address` varchar(15) NOT NULL COMMENT '登录者登录IP',
  PRIMARY KEY (`logs_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `article`
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `article_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '文章id',
  `cat_id` smallint(5) NOT NULL COMMENT '文章分类id',
  PRIMARY KEY (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `brand_apply`
-- ----------------------------
DROP TABLE IF EXISTS `brand_apply`;
CREATE TABLE `brand_apply` (
  `brand_apply_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '商户申请品牌id',
  `brand_name` varchar(64) NOT NULL COMMENT '品牌名称',
  `provider_id` smallint(5) NOT NULL COMMENT '商户id',
  `apply_time` int(11) NOT NULL COMMENT '申请时间',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态，0：申请，1：通过，2：拒绝',
  PRIMARY KEY (`brand_apply_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `card_batch`
-- ----------------------------
DROP TABLE IF EXISTS `card_batch`;
CREATE TABLE `card_batch` (
  `batch_id` int(5) NOT NULL AUTO_INCREMENT COMMENT '批次id',
  `par_value` smallint(4) NOT NULL COMMENT '面值',
  `count` int(11) NOT NULL DEFAULT '0' COMMENT '数量',
  `create_time` int(11) NOT NULL COMMENT '创建时间',
  `create_user` smallint(5) NOT NULL COMMENT '创建人id',
  `start_time` int(11) DEFAULT '0' COMMENT '有效期开始时间',
  `end_time` int(11) DEFAULT '0' COMMENT '有效期结束时间',
  `type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1：非实名制，有有效期，2：实名制，无有效期',
  PRIMARY KEY (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10053 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `card_info`
-- ----------------------------
DROP TABLE IF EXISTS `card_info`;
CREATE TABLE `card_info` (
  `card_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `batch_id` int(5) NOT NULL COMMENT '批次id',
  `serial_num` varchar(15) NOT NULL COMMENT '序列号',
  `password` varchar(16) NOT NULL COMMENT '密码',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0：未使用，1：使用',
  `user_id` int(5) DEFAULT NULL COMMENT '使用用户id',
  `user_name` varchar(45) DEFAULT NULL COMMENT '收卡客户姓名',
  `user_phone` varchar(11) DEFAULT NULL COMMENT '收卡客户手机号',
  `user_address` varchar(140) DEFAULT NULL COMMENT '收卡客户地址',
  `user_id_card` varchar(18) DEFAULT NULL COMMENT '收卡客户身份证号',
  `user_company` varchar(64) DEFAULT NULL COMMENT '收卡客户公司',
  `is_allowed` tinyint(1) DEFAULT '1' COMMENT '是否允许使用 ，0：不允许，1：允许',
  PRIMARY KEY (`card_id`),
  UNIQUE KEY `password_UNIQUE` (`password`),
  UNIQUE KEY `serial_num_UNIQUE` (`serial_num`)
) ENGINE=InnoDB AUTO_INCREMENT=64279 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `cart`
-- ----------------------------
DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
  `cart_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '购物车状态',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `sku_id` int(11) NOT NULL COMMENT '商品skuid',
  `count` int(3) DEFAULT '0' COMMENT '数量',
  PRIMARY KEY (`cart_id`),
  KEY `user_id` (`user_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `cash_charge_record`
-- ----------------------------
DROP TABLE IF EXISTS `cash_charge_record`;
CREATE TABLE `cash_charge_record` (
  `charge_id` varchar(15) NOT NULL COMMENT '自增id',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `charge_type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '充值方式，1：线下充值，2：线上充值，3：充值卡充值，4：退货返还金钱, 5：取消订单返还金钱',
  `charge_cash` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '充值金额',
  `cash_type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '金额类型，1：实际充值金额（可退金额），2：赠送金额（不可退金额）',
  `charge_info` varchar(45) DEFAULT NULL COMMENT '充值用户信息，线上充值为上家（支付宝）买家信息，线下充值为后台操作人id，充值卡充值为空',
  `charge_order_id` varchar(45) DEFAULT NULL COMMENT '为实际充值金额且是在线支付，字段为上家订单号；为实际充值金额且是线下支付，字段为空；为赠送金额，字段为充值赠送来源id，充值卡充值，字段为充值卡卡号；为退货返还金钱时，为订单号',
  `charge_time` int(11) DEFAULT NULL COMMENT '充值时间（充值订单建立时间）',
  `pay_time` int(11) DEFAULT NULL COMMENT '实际支付时间',
  `bank_code` varchar(10) DEFAULT NULL COMMENT '网银银行代码',
  `status` tinyint(1) DEFAULT '1' COMMENT '充值订单状态，0：无效，1：有效',
  PRIMARY KEY (`charge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `cash_consume_record`
-- ----------------------------
DROP TABLE IF EXISTS `cash_consume_record`;
CREATE TABLE `cash_consume_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `order_id` int(11) NOT NULL COMMENT '订单号',
  `cash` decimal(10,2) NOT NULL COMMENT '金额',
  `cash_type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '金额类型，1：实际充值金额，2：赠送金额',
  `consume_time` int(11) NOT NULL COMMENT '消费时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `follow_goods`
-- ----------------------------
DROP TABLE IF EXISTS `follow_goods`;
CREATE TABLE `follow_goods` (
  `follow_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  PRIMARY KEY (`follow_id`),
  KEY `user_id` (`user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `follow_sku`
-- ----------------------------
DROP TABLE IF EXISTS `follow_sku`;
CREATE TABLE `follow_sku` (
  `follow_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `sku_id` int(11) NOT NULL,
  PRIMARY KEY (`follow_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `goods`
-- ----------------------------
DROP TABLE IF EXISTS `goods`;
CREATE TABLE `goods` (
  `goods_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '商品id',
  `goods_name` varchar(90) NOT NULL COMMENT '商品名称',
  `goods_sn` varchar(64) DEFAULT NULL COMMENT '商品货号',
  `cat_id` smallint(5) NOT NULL COMMENT '商品分类id,来自商品分类表。',
  `goods_brief` varchar(90) DEFAULT NULL COMMENT '商品的广告词',
  `goods_desc` text NOT NULL COMMENT '商品的详细描述',
  `market_price` decimal(10,2) NOT NULL COMMENT '市场价',
  `provider_price` decimal(10,2) NOT NULL COMMENT '进货价',
  `is_on_sale` tinyint(1) NOT NULL COMMENT '该商品是否开放销售，1，是；0，否；注意在添加商品时此字段是不上架状态---废弃',
  `on_sale_time` int(11) NOT NULL COMMENT '上架时间---废弃',
  `auto_on_sale` int(11) DEFAULT NULL COMMENT '自动上架时间---废弃',
  `auto_off_sale` int(11) DEFAULT NULL COMMENT '自动下架时间---废弃',
  `brand_id` smallint(3) NOT NULL COMMENT '品牌id. -1代表蓝考拉',
  `goods_number` int(11) NOT NULL COMMENT '总库存量，sku编码总和',
  `services` text NOT NULL COMMENT '服务条款',
  `provider_id` int(11) NOT NULL COMMENT '供货商id，-1：代表蓝考拉自营商品。',
  `pack_list` varchar(255) NOT NULL COMMENT '包装清单',
  `keywords` varchar(255) NOT NULL COMMENT '关键词',
  `last_update` int(11) NOT NULL,
  `is_delete` smallint(1) NOT NULL COMMENT '0  未删除  1  删除',
  PRIMARY KEY (`goods_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11308 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `goods_attr`
-- ----------------------------
DROP TABLE IF EXISTS `goods_attr`;
CREATE TABLE `goods_attr` (
  `goods_attr_id` int(11) NOT NULL AUTO_INCREMENT,
  `goods_id` int(11) NOT NULL COMMENT '商品id',
  `attr_id` int(11) NOT NULL COMMENT '属性id',
  `attr_value` text NOT NULL COMMENT '该具体属性的值',
  `attr_price` varchar(255) DEFAULT NULL COMMENT '该属性对应在商品原价格上要加的价格',
  PRIMARY KEY (`goods_attr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `goods_attribute`
-- ----------------------------
DROP TABLE IF EXISTS `goods_attribute`;
CREATE TABLE `goods_attribute` (
  `goods_attr_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '商品属性',
  `spu_op_id` int(11) NOT NULL COMMENT 'spu属性选项id',
  `goods_id` int(11) NOT NULL COMMENT 'spu商品id',
  PRIMARY KEY (`goods_attr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7079 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `goods_brand`
-- ----------------------------
DROP TABLE IF EXISTS `goods_brand`;
CREATE TABLE `goods_brand` (
  `brand_id` smallint(3) NOT NULL AUTO_INCREMENT,
  `brand_name` varchar(16) NOT NULL COMMENT '品牌名称',
  `is_delete` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0：未删除，1：已删除',
  PRIMARY KEY (`brand_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `goods_brand_cat`
-- ----------------------------
DROP TABLE IF EXISTS `goods_brand_cat`;
CREATE TABLE `goods_brand_cat` (
  `cat_id` smallint(3) NOT NULL,
  `brand_id` smallint(3) NOT NULL,
  `id` smallint(5) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `goods_category`
-- ----------------------------
DROP TABLE IF EXISTS `goods_category`;
CREATE TABLE `goods_category` (
  `cat_id` smallint(3) unsigned NOT NULL AUTO_INCREMENT COMMENT '分类id',
  `cat_name` varchar(16) CHARACTER SET utf8 NOT NULL COMMENT '商品分类名称',
  `parent_id` smallint(3) NOT NULL COMMENT '二级分类',
  `fid` smallint(3) NOT NULL COMMENT '一级分类',
  PRIMARY KEY (`cat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
--  Table structure for `goods_clicks`
-- ----------------------------
DROP TABLE IF EXISTS `goods_clicks`;
CREATE TABLE `goods_clicks` (
  `clicks_id` int(11) NOT NULL AUTO_INCREMENT,
  `goods_id` int(11) NOT NULL COMMENT '商品id',
  `addtime` int(11) NOT NULL COMMENT '点击时间',
  PRIMARY KEY (`clicks_id`),
  KEY `goods_id` (`goods_id`),
  KEY `addtime` (`addtime`),
  KEY `id_addtime` (`addtime`,`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `goods_gallery`
-- ----------------------------
DROP TABLE IF EXISTS `goods_gallery`;
CREATE TABLE `goods_gallery` (
  `img_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '相册id',
  `goods_id` int(11) NOT NULL COMMENT '商品id',
  `img_url` varchar(255) NOT NULL COMMENT '实际图片url',
  `thumb_url` varchar(255) NOT NULL COMMENT '微缩图片url',
  `img_original` varchar(255) NOT NULL COMMENT '图片文件的最原始的文件',
  PRIMARY KEY (`img_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `goods_images`
-- ----------------------------
DROP TABLE IF EXISTS `goods_images`;
CREATE TABLE `goods_images` (
  `img_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '图片id',
  `img_25` varchar(255) NOT NULL COMMENT '25*25',
  `img_50` varchar(255) NOT NULL COMMENT '50*50',
  `img_100` varchar(225) NOT NULL COMMENT '100*100',
  `img_130` varchar(255) NOT NULL COMMENT '130*130',
  `img_160` varchar(255) NOT NULL COMMENT '160*160',
  `img_220` varchar(255) NOT NULL COMMENT '220*220',
  `img_240` varchar(255) NOT NULL COMMENT '240*240',
  `img_280` varchar(255) NOT NULL COMMENT '280*280',
  `img_350` varchar(255) NOT NULL COMMENT '350*350',
  `img_800` varchar(255) NOT NULL COMMENT '800*800',
  `provider_id` int(11) NOT NULL COMMENT '供货商id， -1代表匠心阁',
  PRIMARY KEY (`img_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6534 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `goods_pay`
-- ----------------------------
DROP TABLE IF EXISTS `goods_pay`;
CREATE TABLE `goods_pay` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '商品支持的支付方式',
  `goods_id` int(11) NOT NULL COMMENT '商品id',
  `pay_id` smallint(3) NOT NULL COMMENT '支付id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6803 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `goods_provider`
-- ----------------------------
DROP TABLE IF EXISTS `goods_provider`;
CREATE TABLE `goods_provider` (
  `provider_id` smallint(5) NOT NULL AUTO_INCREMENT COMMENT '供货商表',
  `provider_name` varchar(255) NOT NULL COMMENT '供货商名称',
  `address` varchar(255) NOT NULL COMMENT '供货商地址',
  `phone` varchar(32) NOT NULL COMMENT '供货商电话',
  `rate` decimal(10,2) NOT NULL COMMENT '服务费率',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `contacts` varchar(16) NOT NULL COMMENT '供货商联系人',
  `is_delete` tinyint(1) NOT NULL COMMENT '0 未删除  1已删除',
  PRIMARY KEY (`provider_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `goods_sku`
-- ----------------------------
DROP TABLE IF EXISTS `goods_sku`;
CREATE TABLE `goods_sku` (
  `sku_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'sku产品主键',
  `goods_id` int(11) NOT NULL COMMENT '商品id',
  `sku_sn` varchar(32) NOT NULL COMMENT 'sky编码，由商品id+6未随机数',
  `price` decimal(10,2) NOT NULL COMMENT 'sku产品价格',
  `number` int(11) NOT NULL COMMENT '库存',
  `sort` tinyint(3) NOT NULL DEFAULT '0' COMMENT '排序，前端获取数据按照倒序提取，商户的产品不可提交此参数。',
  `status` tinyint(1) DEFAULT '1' COMMENT 'sku状态1：正常，0：删除',
  `is_on_sale` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否开放销售，0：未上架，1：上架，2：下架（不允许再上架）',
  `on_sale_time` int(11) NOT NULL DEFAULT '0' COMMENT '上架时间',
  `auto_on_sale` int(11) DEFAULT NULL COMMENT '自动上架时间',
  `auto_off_sale` int(11) DEFAULT NULL COMMENT '自动下架时间',
  PRIMARY KEY (`sku_id`)
) ENGINE=InnoDB AUTO_INCREMENT=101651 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `goods_sku_attr`
-- ----------------------------
DROP TABLE IF EXISTS `goods_sku_attr`;
CREATE TABLE `goods_sku_attr` (
  `sku_attr_id` int(11) NOT NULL AUTO_INCREMENT,
  `sku_id` int(11) NOT NULL,
  `op_id` int(11) NOT NULL,
  PRIMARY KEY (`sku_attr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1541 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `invoice_content`
-- ----------------------------
DROP TABLE IF EXISTS `invoice_content`;
CREATE TABLE `invoice_content` (
  `content_id` tinyint(1) NOT NULL AUTO_INCREMENT,
  `content` varchar(32) NOT NULL COMMENT '发票内容',
  PRIMARY KEY (`content_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `invoice_type`
-- ----------------------------
DROP TABLE IF EXISTS `invoice_type`;
CREATE TABLE `invoice_type` (
  `invoice_type_id` tinyint(1) NOT NULL AUTO_INCREMENT COMMENT '发票信息id',
  `invoice_type_name` varchar(32) NOT NULL COMMENT '发票类型名称',
  PRIMARY KEY (`invoice_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `lkl_admin_group`
-- ----------------------------
DROP TABLE IF EXISTS `lkl_admin_group`;
CREATE TABLE `lkl_admin_group` (
  `group_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_name` varchar(32) NOT NULL COMMENT '组名称',
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `lkl_admin_group_level`
-- ----------------------------
DROP TABLE IF EXISTS `lkl_admin_group_level`;
CREATE TABLE `lkl_admin_group_level` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `m_id` int(11) NOT NULL COMMENT '模块id',
  `group_id` int(11) NOT NULL COMMENT '组id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `lkl_admin_level`
-- ----------------------------
DROP TABLE IF EXISTS `lkl_admin_level`;
CREATE TABLE `lkl_admin_level` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `lkl_admin_modules`
-- ----------------------------
DROP TABLE IF EXISTS `lkl_admin_modules`;
CREATE TABLE `lkl_admin_modules` (
  `m_id` int(11) NOT NULL AUTO_INCREMENT,
  `m_name` varchar(32) NOT NULL COMMENT '模块名称',
  `m_url` varchar(255) DEFAULT NULL COMMENT '模块地址',
  `m_parent` int(11) NOT NULL COMMENT '级联关系',
  `m_sort` int(11) NOT NULL COMMENT '排序字段',
  `m_key` varchar(16) NOT NULL COMMENT '此模块key',
  `is_show` int(1) NOT NULL DEFAULT '0' COMMENT '是否显示在菜单里面，1：显示，0 不显示，default 0',
  PRIMARY KEY (`m_id`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `lkl_admin_role`
-- ----------------------------
DROP TABLE IF EXISTS `lkl_admin_role`;
CREATE TABLE `lkl_admin_role` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '角色id',
  `role_name` varchar(32) NOT NULL COMMENT '角色名称',
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `lkl_admin_role_level`
-- ----------------------------
DROP TABLE IF EXISTS `lkl_admin_role_level`;
CREATE TABLE `lkl_admin_role_level` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `m_id` int(11) NOT NULL COMMENT '模块id',
  `role_id` int(11) NOT NULL COMMENT '角色id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `lkl_admin_user`
-- ----------------------------
DROP TABLE IF EXISTS `lkl_admin_user`;
CREATE TABLE `lkl_admin_user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(32) NOT NULL COMMENT '用户真实姓名',
  `fullname` varchar(32) NOT NULL,
  `passwd` varchar(32) NOT NULL COMMENT '用户登录密码md5(md5(passwd)+salt)',
  `salt` int(11) NOT NULL COMMENT '随机数，用户计算用户密码',
  `group_id` int(11) NOT NULL COMMENT '用户所属组',
  `email` varchar(32) NOT NULL COMMENT '用户邮箱',
  `datetime` int(11) NOT NULL COMMENT 'timestamp 用户注册时间',
  `is_activate` int(11) DEFAULT '1' COMMENT '是否激活，默认是激活状态，1：激活，0：未激活',
  `provider` smallint(5) NOT NULL DEFAULT '-100' COMMENT '当用户是供货商组时此值记录的是供货商id',
  PRIMARY KEY (`user_id`),
  KEY `group_id_idx` (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `lkl_admin_user_level`
-- ----------------------------
DROP TABLE IF EXISTS `lkl_admin_user_level`;
CREATE TABLE `lkl_admin_user_level` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `m_id` int(11) NOT NULL COMMENT '模块id',
  `user_id` int(11) DEFAULT NULL COMMENT '用户id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `lkl_admin_user_role`
-- ----------------------------
DROP TABLE IF EXISTS `lkl_admin_user_role`;
CREATE TABLE `lkl_admin_user_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `role_id` int(11) NOT NULL COMMENT '角色id',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  PRIMARY KEY (`id`),
  KEY `userId_idx` (`user_id`),
  KEY `roleId_idx` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `messages`
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `content` text,
  `time` int(11) DEFAULT NULL,
  PRIMARY KEY (`message_id`),
  KEY `user_id` (`user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `order`
-- ----------------------------
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '订单号',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `order_time` int(11) NOT NULL COMMENT '下单时间',
  `order_status` tinyint(1) NOT NULL COMMENT '订单状态',
  `amount` decimal(10,2) NOT NULL COMMENT '订单金额',
  `pay_type` smallint(3) NOT NULL COMMENT '支付类型',
  `pay_time` int(11) NOT NULL COMMENT '支付时间',
  `address_id` int(11) NOT NULL COMMENT '收货地址',
  `invoice_id` int(11) NOT NULL COMMENT '发票信息',
  `pay_order_id` varchar(128) NOT NULL COMMENT '支付通道号',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `buy_info` varchar(64) DEFAULT NULL COMMENT '买家信息',
  `leaves` int(11) DEFAULT '0' COMMENT '使用的桉树叶',
  `pay_amount` decimal(10,2) DEFAULT NULL COMMENT '订单支付金额,包括运费！',
  `freight` decimal(10,2) DEFAULT '0.00',
  `cancel` tinyint(1) DEFAULT '0' COMMENT '订单是否申请取消0：未申请，1：申请，2：通过，3：拒绝',
  `bank_code` varchar(32) DEFAULT NULL COMMENT '银行代码',
  `p_order_id` int(11) NOT NULL DEFAULT '0' COMMENT '父订单id',
  `fid` smallint(3) NOT NULL DEFAULT '0' COMMENT '商品分类id',
  `provider` smallint(5) NOT NULL DEFAULT '0' COMMENT '商户id',
  `cash` decimal(10,2) DEFAULT '0.00' COMMENT '账户余额支出',
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100083 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `order_address`
-- ----------------------------
DROP TABLE IF EXISTS `order_address`;
CREATE TABLE `order_address` (
  `address_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '收货信息id',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `name` varchar(32) NOT NULL COMMENT '收货人姓名',
  `phone` varchar(11) NOT NULL COMMENT '收货人手机号',
  `address` varchar(140) NOT NULL COMMENT '收货地址',
  `city` int(4) NOT NULL COMMENT '地址所属城市',
  `status` int(1) DEFAULT '1' COMMENT '状态0：删除，1：正常',
  `alias` varchar(45) DEFAULT NULL COMMENT '地址别名',
  `province` int(4) DEFAULT NULL COMMENT '省份',
  `county` int(4) DEFAULT NULL COMMENT '县级',
  PRIMARY KEY (`address_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `order_cancel`
-- ----------------------------
DROP TABLE IF EXISTS `order_cancel`;
CREATE TABLE `order_cancel` (
  `order_id` int(11) NOT NULL COMMENT '订单号',
  `cancel_id` int(3) NOT NULL COMMENT '取消原因id',
  `cancel_time` int(11) DEFAULT NULL COMMENT '申请时间',
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `order_cancel_reason`
-- ----------------------------
DROP TABLE IF EXISTS `order_cancel_reason`;
CREATE TABLE `order_cancel_reason` (
  `cancel_id` int(3) NOT NULL AUTO_INCREMENT COMMENT '取消订单原因id',
  `cancel` varchar(32) DEFAULT NULL COMMENT '取消原因',
  PRIMARY KEY (`cancel_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `order_city`
-- ----------------------------
DROP TABLE IF EXISTS `order_city`;
CREATE TABLE `order_city` (
  `city_id` int(4) NOT NULL AUTO_INCREMENT,
  `city_name` varchar(64) DEFAULT NULL,
  `lvl` int(1) DEFAULT '1' COMMENT '级别',
  `parent_id` int(4) DEFAULT '0' COMMENT '父id',
  `status` int(1) DEFAULT '1' COMMENT '状态0：删除，1：正常',
  PRIMARY KEY (`city_id`)
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `order_goods_sku`
-- ----------------------------
DROP TABLE IF EXISTS `order_goods_sku`;
CREATE TABLE `order_goods_sku` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL COMMENT '订单号',
  `sku_id` int(11) NOT NULL COMMENT '商品id',
  `price` decimal(10,2) NOT NULL COMMENT '单价',
  `quantity` int(11) NOT NULL DEFAULT '1' COMMENT '数量',
  `status` tinyint(1) DEFAULT '1' COMMENT '订单内物品状态1、正常，2：退货，3、换货',
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`) USING BTREE,
  KEY `goods_id` (`sku_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `order_invoice`
-- ----------------------------
DROP TABLE IF EXISTS `order_invoice`;
CREATE TABLE `order_invoice` (
  `invoice_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '发票信息id',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `title` varchar(64) NOT NULL COMMENT '发票抬头',
  `invoice_type_id` tinyint(1) NOT NULL COMMENT '发票类型',
  `invoice_content` tinyint(1) NOT NULL COMMENT '发票内容id',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态信息：0：删除，1：正常',
  PRIMARY KEY (`invoice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `order_returns`
-- ----------------------------
DROP TABLE IF EXISTS `order_returns`;
CREATE TABLE `order_returns` (
  `return_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '退换货id',
  `order_id` int(8) NOT NULL COMMENT '订单号',
  `return_time` int(11) DEFAULT NULL COMMENT '申请时间',
  `return_reason` text NOT NULL COMMENT '退换货原因',
  `return_img` varchar(255) DEFAULT NULL COMMENT '图片',
  `return_name` varchar(32) NOT NULL COMMENT '申请人姓名',
  `return_phone` varchar(11) NOT NULL COMMENT '申请人手机',
  `return_address` varchar(255) NOT NULL COMMENT '申请人地址',
  `type` int(1) NOT NULL DEFAULT '1' COMMENT '1:退货，2：换货',
  `quantity` int(11) DEFAULT NULL COMMENT '数量',
  `price` decimal(10,0) DEFAULT NULL,
  `status` tinyint(4) DEFAULT NULL COMMENT '状态0：申请，1：受理，2：取消，3：完成',
  `sku_id` int(11) DEFAULT NULL COMMENT 'sku产品id',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  PRIMARY KEY (`return_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `order_returns_detail`
-- ----------------------------
DROP TABLE IF EXISTS `order_returns_detail`;
CREATE TABLE `order_returns_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `return_id` int(11) NOT NULL COMMENT '退换货id',
  `quantity` int(11) NOT NULL COMMENT '数量',
  `price` decimal(10,3) NOT NULL COMMENT '价格',
  `status` tinyint(1) NOT NULL COMMENT '状态0：申请，1：受理，2：取消，3：完成',
  `sku_id` int(11) NOT NULL COMMENT 'sku产品id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `order_status`
-- ----------------------------
DROP TABLE IF EXISTS `order_status`;
CREATE TABLE `order_status` (
  `order_status` tinyint(1) NOT NULL AUTO_INCREMENT COMMENT '状态id',
  `order_name` varchar(32) NOT NULL COMMENT '状态名称',
  PRIMARY KEY (`order_status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `order_update`
-- ----------------------------
DROP TABLE IF EXISTS `order_update`;
CREATE TABLE `order_update` (
  `order_id` int(8) NOT NULL COMMENT '订单号',
  `old_status` int(11) NOT NULL COMMENT '订单原始状态',
  `new_status` int(11) NOT NULL COMMENT '订单修改状态',
  `update_time` int(11) NOT NULL COMMENT '修改时间',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) DEFAULT '-1' COMMENT '操作用户id（-1：系统）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `pay_type`
-- ----------------------------
DROP TABLE IF EXISTS `pay_type`;
CREATE TABLE `pay_type` (
  `pay_id` smallint(3) NOT NULL AUTO_INCREMENT COMMENT '支付方式id',
  `pay_name` varchar(16) NOT NULL COMMENT '支付名称',
  `rate` decimal(10,2) NOT NULL COMMENT '通道服务费率',
  `remark` varchar(255) NOT NULL COMMENT '支付方式说明',
  PRIMARY KEY (`pay_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `provider_brand`
-- ----------------------------
DROP TABLE IF EXISTS `provider_brand`;
CREATE TABLE `provider_brand` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) NOT NULL COMMENT '供应商id',
  `brand_id` int(11) NOT NULL COMMENT '品牌id',
  `is_delete` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0：未删除，1：已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
--  Table structure for `provider_category`
-- ----------------------------
DROP TABLE IF EXISTS `provider_category`;
CREATE TABLE `provider_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `cat_id` smallint(5) NOT NULL COMMENT '商品分类id',
  `provider_id` int(11) NOT NULL COMMENT '供货商id',
  `is_delete` tinyint(1) NOT NULL COMMENT '0 未删除  1已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `provider_pay`
-- ----------------------------
DROP TABLE IF EXISTS `provider_pay`;
CREATE TABLE `provider_pay` (
  `provider_pay_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '供货商支付id',
  `pay_id` smallint(3) NOT NULL COMMENT '支付id',
  `provider_id` int(11) NOT NULL COMMENT '供货商id',
  `is_delete` tinyint(1) NOT NULL COMMENT '0 未删除  1已删除',
  PRIMARY KEY (`provider_pay_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `sku_attr`
-- ----------------------------
DROP TABLE IF EXISTS `sku_attr`;
CREATE TABLE `sku_attr` (
  `attr_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'sku属性id',
  `cat_id` smallint(5) NOT NULL COMMENT '产品分类id',
  `attr_name` varchar(32) NOT NULL COMMENT '属性名字',
  `remark` varchar(255) DEFAULT NULL COMMENT '属性描述',
  PRIMARY KEY (`attr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `sku_attr_options`
-- ----------------------------
DROP TABLE IF EXISTS `sku_attr_options`;
CREATE TABLE `sku_attr_options` (
  `op_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'sku选项列表id',
  `attr_id` int(11) NOT NULL COMMENT 'sku属性id',
  `options_name` varchar(64) NOT NULL COMMENT '选项名称',
  `sort` tinyint(1) NOT NULL COMMENT '排序',
  `provider_id` int(11) NOT NULL COMMENT '供货商id，-1代表蓝考拉',
  PRIMARY KEY (`op_id`)
) ENGINE=InnoDB AUTO_INCREMENT=454 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `sku_category`
-- ----------------------------
DROP TABLE IF EXISTS `sku_category`;
CREATE TABLE `sku_category` (
  `sku_img_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'sku产品图片id',
  `img_id` int(11) NOT NULL COMMENT '商品图片库',
  `sku_id` int(11) NOT NULL COMMENT 'sku产品id',
  `sort` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`sku_img_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12264 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `spu_attr_options`
-- ----------------------------
DROP TABLE IF EXISTS `spu_attr_options`;
CREATE TABLE `spu_attr_options` (
  `spu_op_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `spu_attr_id` int(11) NOT NULL,
  `spu_op_name` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`spu_op_id`)
) ENGINE=InnoDB AUTO_INCREMENT=872 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
--  Table structure for `spu_attribute`
-- ----------------------------
DROP TABLE IF EXISTS `spu_attribute`;
CREATE TABLE `spu_attribute` (
  `spu_attr_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '商品分类属性表',
  `cat_id` smallint(3) NOT NULL COMMENT '商品分类id，关联goods_category表cat_id',
  `spu_attr_name` varchar(32) NOT NULL COMMENT '属性名称',
  `spu_attr_type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '属性是多选/下拉; 0下拉; 1多选 ',
  `sort` tinyint(3) NOT NULL,
  PRIMARY KEY (`spu_attr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=202 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `sys_setting`
-- ----------------------------
DROP TABLE IF EXISTS `sys_setting`;
CREATE TABLE `sys_setting` (
  `set_id` smallint(5) NOT NULL AUTO_INCREMENT,
  `set_name` varchar(45) NOT NULL,
  `set_rate` decimal(10,3) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL COMMENT '描述',
  PRIMARY KEY (`set_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `user_cash`
-- ----------------------------
DROP TABLE IF EXISTS `user_cash`;
CREATE TABLE `user_cash` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `charge_cash` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '充值金额',
  `gift_cash` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '赠送金额',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `user_leaves`
-- ----------------------------
DROP TABLE IF EXISTS `user_leaves`;
CREATE TABLE `user_leaves` (
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `count` int(11) NOT NULL COMMENT '桉树叶数量',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `user_leaves_record`
-- ----------------------------
DROP TABLE IF EXISTS `user_leaves_record`;
CREATE TABLE `user_leaves_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `action` tinyint(1) NOT NULL COMMENT '桉树叶增减1：增加，2：减少',
  `count` int(11) NOT NULL COMMENT '数量',
  `order_id` int(11) NOT NULL COMMENT '订单id',
  `time` int(11) NOT NULL COMMENT '时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `users`
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `username` varchar(64) DEFAULT NULL COMMENT '用户名',
  `truename` varchar(64) DEFAULT NULL COMMENT '用户真实姓名',
  `phone` varchar(11) DEFAULT NULL COMMENT '绑定手机号',
  `email` varchar(64) DEFAULT NULL COMMENT '绑定邮箱',
  `password` varchar(32) DEFAULT NULL COMMENT '密码',
  `random_code` int(3) DEFAULT NULL COMMENT '密码随机码',
  `verification_code` int(6) DEFAULT NULL COMMENT '手机验证码',
  `verification_time` int(11) DEFAULT NULL COMMENT '验证码发送时间',
  `register_time` int(11) DEFAULT NULL COMMENT '注册时间',
  `status` int(1) DEFAULT '0' COMMENT '状态0：未验证，1：已验证，2：异常',
  `role` int(1) DEFAULT NULL COMMENT '用户角色1：普通用户，2：vip',
  `is_delete` int(1) DEFAULT NULL COMMENT '0 未删除  1已删除',
  `monthly` int(1) DEFAULT '0' COMMENT '是否支持月结0：不支持，1：支持',
  `pay_pwd` varchar(32) DEFAULT NULL COMMENT '支付密码',
  `pay_salt` int(11) DEFAULT NULL COMMENT '支付密码salt',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `users_type`
-- ----------------------------
DROP TABLE IF EXISTS `users_type`;
CREATE TABLE `users_type` (
  `t_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户类型id',
  `t_name` varchar(16) NOT NULL COMMENT '用户类型名称',
  `remark` varchar(45) NOT NULL,
  PRIMARY KEY (`t_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;

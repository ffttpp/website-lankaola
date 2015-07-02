/**
 * 商品Model
 * User: chenlingguang
 * Date: 14/11/18
 * Time: 下午6:45
 */
module.exports = Model(function () {
  return {
    /**
     * 获取分类
     * @param cat_id
     * @returns {*}
     */
    getCatName: function (cat_id) {
      return D('goods_category').cache(true).where({cat_id: cat_id}).find();
    },
    /**
     * 三级分类获取一级分类
     * @param tcid
     * @returns {*}
     */
    getCatFid: function (tcid) {
      return D('goods_category').cache(true).field('fid').where({cat_id: tcid}).find();
    },
    /**
     * 二级分类获取一级分类
     * @param scid
     * @returns {*}
     */
    getCatPid: function (scid) {
      return D('goods_category').cache(true).field('parent_id').where({cat_id: scid}).find();
    },
    /**
     * 一级分类获取所有子分类
     * @param fid
     * @returns {*}
     */
    getCatList: function (fid) {
      return D('goods_category').cache(true).where({
        parent_id: fid,
        fid: fid,
        _logic: 'OR'
      }).select();
    },
    /**
     * 二级分类获取三级分类
     * @param parent_id
     * @returns {*}
     */
    getCatBypid: function (parent_id) {
      return D('goods_category').cache(true).field('cat_id').where({'parent_id': ['IN', parent_id]}).select();
    },
    /**
     * 根据一级分类获取三级分类
     * @param fid
     */
    getCatByfid: function (fid) {
      return D('goods_category').cache(true).field('cat_id').where({fid: ['IN', fid]}).select();
    },
    /**
     * 获取分类商品
     * @param cat_id    分类id || 分类id数组
     * @returns {*}
     */
    goodsList: function (cat_id) {
      return D('goods')
        .cache(skuCache)
        .field('g.*,b.brand_name')
        .alias('g')
        .join('goods_brand b on g.brand_id = b.brand_id')
        .where({
        'g.cat_id': ['IN', cat_id],
        'g.is_delete': 0
      }).select();
    },
    /**
     * sku列表
     * @param goodsArr       商品id
     * @param sort           排序
     * @param page           页码
     * @returns {promise}
     */
    skuListByGoods: function (goodsArr, sort, page, listRows) {
      return D('goods_sku')
        .cache(skuCache)
        .alias('sku')
        .field('sku.*')
        .where({
          goods_id: ['IN', goodsArr],
          is_on_sale: 1,
          status: 1
        })
        .page(page, listRows)
        .order(sort)
        .countSelect();
    },
    /**
     * 根据分类获取sku
     * @param cat_id
     * @returns {type[]|*}
     */
    skuListByCat: function (cat_id) {
      return D('goods_sku')
        .cache(skuCache)
        .field('goods.goods_name, sku.sku_id, sku.sku_sn')
        .alias('sku')
        .join('goods on goods.goods_id = sku.goods_id')
        .where({
          'goods.cat_id': cat_id,
          'sku.status': 1,
          'goods.is_delete': 0,
          'sku.is_on_sale': 1
        })
        .select();
    },
    /**
     * sku属性值
     * @param skuArr
     */
    skuOptions: function (skuArr) {
      return D('goods_sku')
        .cache(skuCache)
        .alias('sku')
        .field('sku.sku_id, img.img_220, GROUP_CONCAT(sku_attr_options.options_name SEPARATOR " ") skuName')
        .join('sku_category cat on sku.sku_id = cat.sku_id')
        .join('goods_images img on cat.img_id = img.img_id')
        .join('goods_sku_attr on goods_sku_attr.sku_id = sku.sku_id')
        .join('sku_attr_options on goods_sku_attr.op_id = sku_attr_options.op_id')
        .where({
          'sku.sku_id': ['IN', skuArr]
        })
        .group('sku.sku_id')
        .select();
    },
    /**
     * sku属性
     * @param skuArr
     * @returns {*}
     */
    skuAttr: function (skuArr) {
      return D('goods_sku_attr')
        .cache(skuCache)
        .field('goods_sku_attr.sku_id,sku_attr_options.op_id,sku_attr_options.options_name,sku_attr.attr_id, sku_attr.attr_name')
        .join('sku_attr_options ON goods_sku_attr.op_id = sku_attr_options.op_id')
        .join('sku_attr ON sku_attr_options.attr_id = sku_attr.attr_id')
        .where({'goods_sku_attr.sku_id': ['IN', skuArr]}).select();
    },
    /**
     * sku商品列表
     * @param sku_id
     */
    skuListBySku: function (sku_id) {
      return D('goods_sku')
        //.cache(skuCache)
        .alias('sku')
        .field([
          'sku.sku_id',
          'sku.goods_id',
          'sku.sku_sn',
          'sku.price',
          'sku.number',
          'goods.goods_name',
          'brand.brand_name',
          'GROUP_CONCAT(sku_attr_options.options_name SEPARATOR " ") skuName'
        ])
        .join('goods on goods.goods_id = sku.goods_id')
        .join('goods_brand brand on brand.brand_id = goods.brand_id')
        .join('goods_sku_attr on goods_sku_attr.sku_id = sku.sku_id')
        .join('sku_attr_options on goods_sku_attr.op_id = sku_attr_options.op_id')
        .where({
          'sku.sku_id': ['IN', sku_id],
          'sku.status': 1,
          'goods.is_delete': 0
        })
        .group('sku.sku_id')
        .select();
    },
    /**
     * sku商品
     * @param sku_id
     * @returns {*}
     */
    skuItem: function (sku_id, is_on_sale, cacheTime) {
      var where = {
        'sku.sku_id': sku_id,
        'sku.status': 1,
        'goods.is_delete': 0
      };
      if (is_on_sale) {
        where['sku.is_on_sale'] = 1;
      }
      return D('goods_sku')
        .cache(cacheTime)
        .alias('sku')
        .field([
          'sku.sku_id',
          'sku.goods_id',
          'sku.sku_sn',
          'sku.price',
          'sku.number',
          'goods.goods_name',
          'goods.goods_brief',
          'goods.goods_desc',
          'goods.services',
          'goods.pack_list',
          'brand.brand_name',
          'cat.cat_id tc',
          'cat.cat_name tn',
          'cat_2.cat_id sc',
          'cat_2.cat_name sn',
          'cat_3.cat_id fc',
          'cat_3.cat_name fn'
        ])
        .join('goods on goods.goods_id = sku.goods_id')
        .join('goods_brand brand on brand.brand_id = goods.brand_id')
        .join('goods_category cat on cat.cat_id = goods.cat_id')
        .join('goods_category cat_2 on cat_2.cat_id = cat.parent_id')
        .join('goods_category cat_3 on cat_3.cat_id = cat_2.parent_id')
        .where(where).find();
    },
    /**
     * sku图片
     * @param sku_id
     * @returns {*}
     */
    skuImg: function (sku_id) {
      return D('sku_category')
        .cache(skuCache)
        .join('goods_images on sku_category.img_id = goods_images.img_id')
        .where({
          sku_id: ['IN', sku_id]
        }).select();
    },
    /**
     * spu属性
     * @param goods_id
     */
    spuAttr: function (goods_id) {
      return D('goods_attribute')
        .cache(skuCache)
        .alias('attr')
        .join('spu_attr_options op on op.spu_op_id = attr.spu_op_id')
        .join('spu_attribute spu_attr on spu_attr.spu_attr_id = op.spu_attr_id')
        .where({
          'attr.goods_id': goods_id
        }).select();
    },
    goodsSku: function (goods_id) {
      var self = this;
      return D('goods_sku')
        .cache(skuCache)
        .field('sku_id')
        .where({
          goods_id: goods_id,
          status: 1
        })
        .select()
        .then(function (data) {
        return self.skuAttr(_.pluck(data, 'sku_id'));
      })
    },
    /**
     * 获取sku的一级分类
     * @param sku_id
     * @returns {*}
     */
    skuCategory: function (sku_id) {
      return D('goods_sku')
        .alias('sku')
        .field('goods.cat_id cat_id, cat.cat_name, fid')
        .join('goods on goods.goods_id = sku.goods_id')
        .join('goods_category cat on cat.cat_id = goods.cat_id')
        .where({
          'sku.sku_id': sku_id
        })
        .find();
    },
    /**
     * 购物车商品数量
     * @param user_id
     */
    cartCount: function (user_id) {
      return D('cart').where({
        user_id: user_id,
        count: ['>', 0]
      }).count(1);
    },
    /**
     * 购物车列表
     * @param user_id
     */
    cartList: function (user_id) {
      return D('cart')
        .field([
          'cart.cart_id',
          'cart.count',
          'goods.provider_id',
          'cat.fid',
          'cat.cat_name',
          'sku.sku_id',
          'sku.goods_id',
          'sku.sku_sn',
          'sku.price',
          'sku.number',
          'goods.goods_name',
          'brand.brand_name',
          'GROUP_CONCAT(sku_attr_options.options_name SEPARATOR " ") skuName'
        ])
        .join('goods_sku sku on cart.sku_id = sku.sku_id')
        .join('goods on goods.goods_id = sku.goods_id')
        .join('goods_brand brand on brand.brand_id = goods.brand_id')
        .join('goods_sku_attr on goods_sku_attr.sku_id = sku.sku_id')
        .join('sku_attr_options on goods_sku_attr.op_id = sku_attr_options.op_id')
        .join('goods_category cat on cat.cat_id = goods.cat_id')
        .where({
          'cart.user_id': user_id,
          'cart.count': ['>', 0],
          'sku.status': 1,
          'goods.is_delete': 0,
          'sku.is_on_sale': 1
        })
        .group('sku.sku_id')
        .select();
    },
    /**
     * 购物车中商品数量
     * @param user_id
     * @param sku_id
     */
    countCart: function (user_id, sku_id) {
      return D('cart').where({
        user_id: user_id,
        sku_id: sku_id
      }).find();
    },
    /**
     * 加入购物车
     * @param user_id
     * @param sku_id
     * @param count     数量
     */
    addCart: function (user_id, sku_id, count) {
      return D('cart').add({
        user_id: user_id,
        sku_id: sku_id,
        count: count
      });
    },
    /**
     * 加入购物车（购物车已有）
     * @param user_id
     * @param cart_id
     * @param count
     * @returns {*}
     */
    addCartCount: function (user_id, cart_id, count) {
      return D('cart').where({
        user_id: user_id,
        cart_id: cart_id
      }).updateInc('count', count);
    },
    /**
     * 更改数量
     * @param user_id
     * @param cart_id
     * @param count
     * @returns {*}
     */
    changeCartNum: function (user_id, cart_id, count) {
      if (count > 0) {
        return D('cart').where({
          user_id: user_id,
          cart_id: cart_id
        }).update({count: count});
      } else {
        return D('cart').where({
          user_id: user_id,
          cart_id: cart_id
        }).delete();
      }
    },
    /**
     * 清空购物车
     * @param user_id
     * @param cart_id
     * @returns {*}
     */
    cleanCart: function (user_id, cart_id) {
      return D('cart').where({
        user_id: user_id,
        cart_id: ['IN', cart_id]
      }).delete();
    },
    payType: function (goods_id) {
      return D('goods_pay')
        .cache(true)
        .field('goods_pay.goods_id, pay_type.pay_id, pay_type.pay_name')
        .join('pay_type on pay_type.pay_id = goods_pay.pay_id')
        .where({
          'goods_pay.goods_id': ['IN', goods_id]
        }).select();
    }
  }
})
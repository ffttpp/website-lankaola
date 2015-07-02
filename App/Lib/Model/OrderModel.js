/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/21
 * Time: 上午10:37
 * To change this template use File | Settings | File Templates.
 */

module.exports = Model(function () {
  return {
    /**
     * 验证用户订单
     * @param user_id
     * @param order_id
     */
    checkOrder: function (user_id, order_id) {
      return D('order').where({
        order_id: order_id,
        user_id: user_id
      }).count(1);
    },
    /**
     * 检查收货地址
     * @param user_id           用户id
     * @param address_id        收货地址id
     * @returns {*|number|number}
     */
    checkAddress: function (user_id, address_id) {
      return D('order_address').where({
        user_id: user_id,
        address_id: address_id,
        status: 1
      }).count('1');
    },
    /**
     * 检查发票信息
     * @param user_id
     * @param invoice_id      发票信息id
     * @returns {*|number|number}
     */
    checkInvoice: function (user_id, invoice_id) {
      return D('order_invoice').where({
        user_id: user_id,
        invoice_id: invoice_id
      }).count('1');
    },
    /**
     * 提交订单数据
     * @param user_id
     * @param amount              订单总金额
     * @param pay_type            支付方式
     * @param leaves              使用的桉树叶
     * @param pay_amount          实际支付金额
     * @param address_id          收货信息id
     * @param invoice_id          发票信息id
     * @param freight             运费
     * @param skuList             订单商品列表
     * @param bank                银行支付代码
     * @returns {*}
     */
    addOrder: function (user_id, amount, pay_type, leaves, pay_amount, address_id, invoice_id, freight, skuList, bank, fidList, providerList, cash) {
      //console.log(amount);
      var order_status = 2;
      if ((pay_type == 2 || pay_type == 3) && pay_amount === 0) {
        order_status = 3;
      }
      return D('order').add({
        user_id: user_id,
        order_time: moment().unix(),
        order_status: order_status,
        amount: amount,
        pay_type: pay_type,
        address_id: address_id,
        invoice_id: invoice_id,
        freight: freight,
        leaves: leaves,
        pay_amount: pay_amount,
        bank_code: bank,
        fid: fidList.length == 1 ? fidList[0] : 0,
        provider: providerList.length == 1 ? providerList[0] : 0,
        cash: cash
      }).then(function (order_id) {
        if (order_id) {
          if (skuList.length > 1) {
            _.each(skuList, function (sku, index) {
              var subAmount = 0;
              _.each(sku, function (ele) {
                subAmount += parseInt(ele.quantity) * parseFloat(ele.price);
              });
              process.nextTick(function () {
                return D('order').add({
                  user_id: user_id,
                  order_time: moment().unix(),
                  order_status: order_status,
                  amount: subAmount,
                  pay_type: pay_type,
                  address_id: address_id,
                  invoice_id: invoice_id,
                  freight: 0,
                  leaves: 0,
                  pay_amount: 0,
                  bank_code: bank,
                  p_order_id: order_id,
                  fid: fidList[index],
                  provider: providerList[index]
                }).then(function (subOrderId) {
                  _.each(skuList[index], function (sku) {
                    sku.order_id = subOrderId;
                    sku.status = 1;
                  });
                  return D('order_goods_sku').addAll(skuList[index]);
                })
              });
            });
          } else {
            _.each(skuList[0], function (sku) {
              sku.order_id = order_id;
              sku.status = 1;
            });
            return D('order_goods_sku').addAll(skuList[0]).then(function () {
              return Promise.resolve(order_id);
            });
          }
          return Promise.resolve(order_id);
        } else {
          return Promise.reject();
        }
      }).then(function (order_id) {
        if (parseInt(leaves) > 0) {
          return D('user_leaves').where({user_id: user_id}).updateDec('count', parseInt(leaves)).then(function (data) {
            if (data) {
              return D('user_leaves_record').add({
                user_id: user_id,
                action: 2,
                count: leaves,
                order_id: order_id,
                time: moment().unix()
              })
            } else {
              return Promise.reject();
            }
          }).then(function (data) {
            if (data) {
              return Promise.resolve(order_id);
            } else {
              return Promise.reject();
            }
          });
        } else {
          return Promise.resolve(order_id);
        }
      })
    },
    /**
     * 获取主订单
     * @param order_id
     * @returns {*}
     */
    getParentOrder: function (order_id) {
      return D('order').where({
        'order_id': order_id
      }).find();
    },
    /**
     * 获取子订单
     * @param p_order_id
     * @returns {*}
     */
    getChildOrder: function (p_order_id) {
      return D('order').where({
        'p_order_id': p_order_id,
        'cancel': 0
      }).select();
    },
    /**
     * 订单列表
     * @param user_id
     * @param order_id
     * @param page           页码
     * @param rows           每页数量
     * @param startTime      开始时间
     * @param endTime        结束时间
     * @param orderStatus    订单状态
     * @param cancel         取消订单状态
     * @returns {promise}
     */
    orderList: function (user_id, order_id, p_order_id, page, rows, startTime, endTime, orderStatus, cancel) {
      var where = {
        'o.user_id': user_id,
        'o.order_time': {
          '>=': parseInt(startTime),
          '<': parseInt(endTime)
        },
        'o.cancel': ['IN', cancel]
      };
      if (order_id) {
        where['o.order_id'] = order_id;
      }
      if (orderStatus == -1) {
        where['o.order_status'] = ['!=', 1];
      } else {
        where['o.order_status'] = ['IN', orderStatus];
      }
      if (p_order_id == 1) {
        where['o.p_order_id'] = 0;
      } else if (p_order_id == 2) {
        where['o.fid'] = ['!=', 0];
      }
      return D('`order`')
        .alias('o')
        .field('o.*, pay_type.pay_name, order_status.order_name, address.name')
        .join('order_address address on address.address_id = o.address_id')
        .join('order_status on order_status.order_status = o.order_status')
        .join('pay_type on pay_type.pay_id = o.pay_type')
        .page(page, rows)
        .where(where)
        .order('o.order_id DESC')
        .countSelect();
    },
    getSubOrderList: function (user_id, p_order_id) {
      return D('`order`')
        .alias('o')
        .field('o.*, order_status.order_name, address.name')
        .join('order_address address on address.address_id = o.address_id')
        .join('order_status on order_status.order_status = o.order_status')
        .where({
          'o.user_id': user_id,
          'o.p_order_id': ['IN', p_order_id]
        })
        .select();
    },
    /**
     * 订单商品列表
     * @param order_id       订单id列表
     * @returns {*}
     */
    orderSkuList: function (order_id) {
      return D('order_goods_sku')
        .cache(true)
        .field('order_goods_sku.order_id, order_goods_sku.sku_id, order_goods_sku.price, order_goods_sku.quantity, brand.brand_name, goods.goods_name, GROUP_CONCAT(sku_attr_options.options_name SEPARATOR " ") skuName, goods_category.cat_name, goods_category.fid')
        .join('goods_sku sku on sku.sku_id = order_goods_sku.sku_id')
        .join('goods on goods.goods_id = sku.goods_id')
        .join('goods_brand brand on brand.brand_id = goods.brand_id')
        .join('goods_sku_attr on goods_sku_attr.sku_id = sku.sku_id')
        .join('sku_attr_options on goods_sku_attr.op_id = sku_attr_options.op_id')
        .join('goods_category on goods.cat_id = goods_category.cat_id')
        .where({
          'order_goods_sku.order_id': ['IN', order_id]
        })
        .group('sku.sku_id, order_goods_sku.order_id')
        .select();
    },
    /**
     * 订单商品图片
     * @param sku_id
     * @returns {*}
     */
    skuImg: function (sku_id) {
      return D('goods_sku')
        .cache(skuCache)
        .alias('sku')
        .field('sku.sku_id, img.img_50')
        .join('sku_category sku_cat on sku.sku_id = sku_cat.sku_id')
        .join('goods_images img on sku_cat.img_id = img.img_id')
        .where({
          'sku.sku_id': ['IN', sku_id]
        })
        .group('sku.sku_id')
        .select();
    },
    /**
     * 订单sku列表，关联退换货
     * @param order_id
     * @returns {*}
     */
    orderSkuListJoinReturns: function (order_id) {
      return D('order_goods_sku')
        .field('order_goods_sku.order_id, order_goods_sku.sku_id, order_goods_sku.price, order_goods_sku.quantity, brand.brand_name, goods.goods_name, GROUP_CONCAT(sku_attr_options.options_name SEPARATOR " ") skuName, order_returns.`status`')
        .join('goods_sku sku on sku.sku_id = order_goods_sku.sku_id')
        .join('goods on goods.goods_id = sku.goods_id')
        .join('goods_brand brand on brand.brand_id = goods.brand_id')
        .join('goods_sku_attr on goods_sku_attr.sku_id = sku.sku_id')
        .join('sku_attr_options on goods_sku_attr.op_id = sku_attr_options.op_id')
        .join('order_returns ON (order_returns.order_id = order_goods_sku.order_id and order_returns.sku_id = order_goods_sku.sku_id)')
        .where({
          'order_goods_sku.order_id': ['IN', order_id]
        })
        .group('sku.sku_id, order_goods_sku.order_id')
        .select();
    },
    /**
     * 退换货--订单下单个sku商品
     * @param order_id
     * @param sku_id
     * @returns {*}
     */
    orderSkuOnReturns: function (order_id, sku_id) {
      return D('order_goods_sku')
        .cache(true)
        .field('order_goods_sku.order_id, order_goods_sku.sku_id, order_goods_sku.price, order_goods_sku.quantity, brand.brand_name, goods.goods_name, GROUP_CONCAT(sku_attr_options.options_name SEPARATOR " ") skuName, order_returns.`status`')
        .join('goods_sku sku on sku.sku_id = order_goods_sku.sku_id')
        .join('goods on goods.goods_id = sku.goods_id')
        .join('goods_brand brand on brand.brand_id = goods.brand_id')
        .join('goods_sku_attr on goods_sku_attr.sku_id = sku.sku_id')
        .join('sku_attr_options on goods_sku_attr.op_id = sku_attr_options.op_id')
        .join('order_returns on order_returns.order_id = order_goods_sku.order_id')
        .where({
          'order_goods_sku.order_id': order_id,
          'order_goods_sku.sku_id': sku_id
        })
        .group('sku.sku_id')
        .find();
    },
    /**
     * 订单内容（在线支付）
     * @param user_id
     * @param order_id
     * @returns {*}
     */
    orderAmount: function (user_id, order_id) {
      return D('`order`')
        .alias('o')
        .field('o.*, pay_type.pay_name')
        .join('pay_type on o.pay_type = pay_type.pay_id')
        .where({
          'o.user_id': user_id,
          'o.order_id': order_id,
          'o.order_status': ['IN', [2, 3]],
          'o.cancel': 0
        }).find();
    },
    /**
     * 订单详情
     * @param user_id
     * @param order_id      订单号
     */
    orderItem: function (user_id, order_id) {
      return D('`order`')
        .field('o.*, invoice.*, invoice_type.invoice_type_name, invoice_content.content invoice_content, pay_type.pay_name, order_status.order_name, address.name, address.phone, address.address, province.city_id province_id, province.city_name province_name, city.city_id, city.city_name, county.city_id county_id, county.city_name county_name')
        .alias('o')
        .join('pay_type on pay_type.pay_id = o.pay_type')
        .join('order_address address on address.address_id = o.address_id')
        .join('order_status on order_status.order_status = o.order_status')
        .join('order_city province on province.city_id = address.province')
        .join('order_city city on city.city_id = address.city')
        .join('order_city county on county.city_id = address.county')
        .join('order_invoice invoice on invoice.invoice_id = o.invoice_id')
        .join('invoice_type on invoice_type.invoice_type_id = invoice.invoice_type_id')
        .join('invoice_content on invoice_content.content_id = invoice.invoice_content')
        .where({
          'o.user_id': user_id,
          'o.order_id': order_id
        }).find();
    },
    subOrderList: function (user_id, p_order_id) {
      //invoice.*,
      return D('`order`')
        .field('o.*, invoice_type.invoice_type_name, invoice_content.content invoice_content, pay_type.pay_name, order_status.order_name, address.name, address.phone, address.address, province.city_id province_id, province.city_name province_name, city.city_id, city.city_name, county.city_id county_id, county.city_name county_name')
        .alias('o')
        .join('pay_type on pay_type.pay_id = o.pay_type')
        .join('order_address address on address.address_id = o.address_id')
        .join('order_status on order_status.order_status = o.order_status')
        .join('order_city province on province.city_id = address.province')
        .join('order_city city on city.city_id = address.city')
        .join('order_city county on county.city_id = address.county')
        .join('order_invoice invoice on invoice.invoice_id = o.invoice_id')
        .join('invoice_type on invoice_type.invoice_type_id = invoice.invoice_type_id')
        .join('invoice_content on invoice_content.content_id = invoice.invoice_content')
        .where({
          'o.user_id': user_id,
          _complex: {
            'o.order_id': p_order_id,
            'o.p_order_id': p_order_id,
            _logic: 'or'
          }
        })
        .select();
    },
    /**
     * 申请取消订单
     * @param user_id
     * @param order_id
     * @param cancel_id
     * @returns {*}
     */
    cancelOrder: function (user_id, order_id, cancel_id) {
      return D('order').where({
        user_id: user_id,
        order_id: order_id,
        order_status: 2
      }).update({
        cancel: 2
      }).then(function (data) {
        if (data) {
          return D('order_cancel').thenAdd({
            cancel_id: cancel_id,
            order_id: order_id,
            cancel_time: moment().unix()
          }, {order_id: order_id}, true);
        } else {
          return Promise.reject();
        }
      })
    },
    /**
     *
     * @param orderId
     *
     */
    getOrderById: function (orderId) {
      //console.log(orderId);
      return D('order')
        .field('user_id, order_status, pay_amount, freight')
        .where({
          order_status: 2,
          _complex: {
            order_id: orderId,
            p_order_id: orderId,
            _logic: 'or'
          }
        })
        .select();
    },
    /**
     *
     * @param orderId
     *
     */
    orderById: function (orderId) {
      //console.log(orderId);
      return D('order')
        .field('user_id, order_status, pay_amount, amount, freight')
        .where({
          order_id: orderId,
          order_status: 2
        })
        .find();
    },
    /**
     * 根据订单编号获取订单信息,用于支付完成获得赠送用户桉树
     *
     *
     * @param orderId
     */
    getOrderInfoByOrderId: function (orderId) {
      return D('order')
        .field('user_id, order_status, pay_amount, leaves, amount, freight, fid')
        .where({
          order_status: 2,
          _complex: {
            order_id: orderId,
            p_order_id: orderId,
            _logic: 'or'
          }
        })
        .select();
    },
    /**
     * 修改订单状态
     *
     * @param orderInfo
     *
     */
    modifyOrderStatus: function (orderInfo) {
      return D('order')
        .where({order_id: orderInfo.order_id, p_order_id: orderInfo.order_id, _logic: 'OR'})
        .update(_.omit(orderInfo, 'order_id'));
    },
    /**
     * 取消订单原因
     * @returns {*}
     */
    cancelReason: function () {
      return D('order_cancel_reason').cache(true).select();
    },
    /**
     * 取消订单列表
     * @param user_id
     * @param page
     * @returns {promise}
     */
    cancelOrderList: function (user_id, page) {
      return D('`order`')
        .alias('o')
        .field('o.*, reason.cancel reason')
        .join('order_cancel cancel on cancel.order_id = o.order_id')
        .join('order_cancel_reason reason on cancel.cancel_id = reason.cancel_id')
        .page(page, orderListRows)
        .where({
          'o.user_id': user_id,
          'o.cancel': ['IN', [1, 2, 3]],
          'o.fid': 0
        })
        .order('cancel.cancel_time desc')
        .countSelect()
    },
    /**
     * 取消订单列表获取子订单
     * @param user_id
     * @param p_order_id
     * @returns {*}
     */
    cancelSubOrder: function (user_id, p_order_id) {
      return D('order').where({
        user_id: user_id,
        p_order_id: ['IN', p_order_id]
      }).select();
    },
    /**
     * 增加退换货记录
     * @param user_id
     * @param order_id               订单id
     * @param return_reason          退换货原因
     * @param return_img             图片
     * @param return_name            收货人姓名
     * @param return_phone           电话
     * @param return_address         地址
     * @param type                   1：退货，2：换货
     * @param quantity               数量
     * @param price                  价格
     * @param sku_id
     * @returns {type[]}
     */
    addRefund: function (user_id, order_id, return_reason, return_img, return_name, return_phone, return_address, type, quantity, price, sku_id) {
      var data = {
        user_id: user_id,
        order_id: order_id,
        return_time: moment().unix(),
        return_reason: return_reason,
        return_img: return_img,
        return_name: return_name,
        return_phone: return_phone,
        return_address: return_address,
        type: type,
        quantity: quantity,
        price: price,
        status: 0,
        sku_id: sku_id
      };
      var where = {
        order_id: order_id,
        sku_id: sku_id
      };
      return D('order_returns').thenAdd(data, where, true);
    },
    refundList: function (user_id) {
      return D('order_returns')
        .alias('ret')
        .field('ret.*, FROM_UNIXTIME(ret.return_time, "%Y-%m-%d %H:%i:%s") timestamp, brand.brand_name, goods.goods_name, GROUP_CONCAT(sku_attr_options.options_name SEPARATOR " ") skuName')
        .join('goods_sku sku on sku.sku_id = ret.sku_id')
        .join('goods on goods.goods_id = sku.goods_id')
        .join('goods_brand brand on brand.brand_id = goods.brand_id')
        .join('goods_sku_attr on goods_sku_attr.sku_id = sku.sku_id')
        .join('sku_attr_options on goods_sku_attr.op_id = sku_attr_options.op_id')
        .group('ret.return_id, sku.sku_id, ret.order_id')
        .where({
          'ret.user_id': user_id
        })
        .order()
        .select();
    }
  }
});

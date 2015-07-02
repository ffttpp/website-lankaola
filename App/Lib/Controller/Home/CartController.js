/**
 * 购物车Controller
 * User: chenlingguang
 * Date: 14/11/19
 * Time: 下午9:50
 */

module.exports = Controller('Home/BaseController', function () {
  return {
    init: function (http) {
      var self = this;
      return self.super('init', http).then(function () {
        return self.checkLoginAction()
      }).then(function (userInfo) {
          self.userInfo = userInfo;
          self.assign('userInfo', userInfo);
          return Promise.resolve();
        });
    },
    /**
     * 购物车列表
     * @returns {*}
     */
    indexAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      return self.session('orderInfo', {}).then(function () {
        return D('goods').cartList(user_id);
      }).then(function (cartList) {
          if (isEmpty(cartList)) {
            return Promise.reject();
          } else {
            var skuArr = [-1];
            _.each(cartList, function (sku) {
              skuArr.push(sku.sku_id);
            });
            return D('goods').skuImg(skuArr).then(function (imgList){
              var skuImg = {};
              imgList = _.groupBy(imgList, 'sku_id');
              _.each(imgList, function (img, sku_id) {
                if (isObject(img[0])) {
                  skuImg[sku_id] = img[0].img_50;
                }
              });
              _.each(cartList, function (cart) {
                cart.img_50 = skuImg[cart.sku_id];
              });
              var count = 0;
              var sum = 0;
              var orderInfo = {};
              _.each(cartList, function (element) {
                count += element.count;
                sum += element.count * element.price;
                if (_.indexOf([78, 94], element.fid) >= 0) {
                  element.goods_name = [element.cat_name, element.goods_name].join(' ');
                }
                orderInfo[element.cart_id] = {
                  goods_id: element.goods_id,
                  sku_id: element.sku_id,
                  count: element.count,
                  price: element.price,
                  img: element.img_50,
                  fid: element.fid,
                  provider: element.provider_id,
                  skuName: [element.brand_name, element.goods_name, element.skuName].join(' ')
                }
              });
              self.session('orderInfo', orderInfo);
              self.assign('cart', {
                count: count,
                sum: sum,
                list: cartList
              });
              self.display();
            })
          }
        }).catch(function () {
            self.assign('cart', {
              count: 0,
              sum: 0,
              list: []
            });
            self.display();
        })
    },
    /**
     * 加入购物车
     * GET
     * pid：      商品sku_id
     * pcount:    数量
     * @returns {*}
     */
    addAction: function () {
      var self = this;
      var sku_id = parseInt(self.get('pid'));
      var pcount = parseInt(self.get('pcount')) || 1;
      var user_id = self.userInfo.user_id;
      if (sku_id) {
        self.assign('sku_id', sku_id);
        return D('goods').countCart(user_id, sku_id).then(function (cart) {
          if (!isEmpty(cart)) {
            return D('goods').addCartCount(user_id, cart.cart_id, pcount);
          } else {
            return D('goods').addCart(user_id, sku_id, pcount);
          }
        }).then(function (ret) {
            if (ret) {
              self.assign('msg', {code: 1, info: '商品已成功加入购物车！'});
            } else {
              self.assign('msg', {code: 0, info: '商品加入购物车失败，请重试！'});
            }
            self.display();
          })
      } else {
        self.redirect('/')
      }
    },
    /**
     * 更改购物车商品数量
     * POST
     * cid         购物车id    :cid|:cid|:cid 删除 || :cid 修改
     * pcount      数量（为0时删除）
     * @returns {*}
     */
    changeNumAction: function () {
      var self = this;
      if (self.isPost()) {
        var postData = self.post();
        var user_id = self.userInfo.user_id;
        var cart_id = postData.cid || '';
        cart_id = cart_id.split('|');
        var pcount = postData.pcount || 0;
        if (cart_id.length > 1) {
          return D('goods').cleanCart(user_id, cart_id).then(function () {
            return self.omitCart(cart_id);
          }).then(function () {
              self.json({
                code: 1,
                info: '修改成功',
                data: {}
              })

            }, function () {
              self.json({
                code: 500,
                info: '服务器繁忙，请稍后再试',
                data: {}
              })
            })
        } else if (cart_id.length == 1) {
          return D('goods').changeCartNum(user_id, cart_id[0], pcount).then(function (data) {
            if (pcount == 0) {
              return self.omitCart(cart_id[0]).then(function () {
                return Promise.resolve(data);
              })
            } else {
              return self.session('orderInfo').then(function (orderInfo) {
                if (isObject(orderInfo[cart_id[0]])) {
                  orderInfo[cart_id[0]].count = parseInt(pcount);
                }
                return self.session('orderInfo', orderInfo).then(function () {
                  return Promise.resolve(data);
                })
              })
            }
          }).then(function (data) {
            if (data) {
              self.json({
                code: 1,
                info: '修改成功',
                data: {}
              })
            } else {
              self.json({
                code: 500,
                info: '服务器繁忙，请稍后再试',
                data: {}
              })
            }
          });
        } else {
          self.json({
            code: 50,
            info: '参数错误',
            data: {}
          })
        }
      } else {
        self.json({
          code: 50,
          info: '参数错误',
          data: {}
        })
      }
    },
    /**
     * 忽略购物车商品
     * @returns {*}
     */
    omitCartAction: function () {
      var self = this;
      var cart_id = self.get('cid') || '';
      cart_id = cart_id.split('|');
      return self.omitCart(cart_id).then(function () {
        self.json({
          code: 1,
          info: '',
          data: {}
        }, function () {
          self.json({
            code: -1,
            info: '',
            data: {}
          })
        })
      })
    },
    /**
     * 从session中删除商品      忽略||删除
     * @param cart_id
     * @returns {*}
     */
    omitCart: function (cart_id) {
      var self = this;
      return self.session('orderInfo').then(function (orderInfo) {
        if (isArray(cart_id)) {
          _.each(cart_id, function (ele) {
            orderInfo = _.omit(orderInfo, ele);
          })
        } else {
          orderInfo = _.omit(orderInfo, cart_id);
        }
        //console.log(orderInfo);

        return self.session('orderInfo', orderInfo);
      });
    }
  }
})
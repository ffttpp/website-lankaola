/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/25
 * Time: 上午10:37
 * To change this template use File | Settings | File Templates.
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
          self.assign({
            bread_nav_1: '客户服务',
            bread_url_1: '/oder/cancelOrderList',
            user_nav_index: 'refund_index',
            bread_nav_2: '退换货'
          });
          return Promise.resolve();
        });
    },
    indexAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var order_id = self.get('orderid') || 0;
      var page = self.get('page') || 1;
      return D('order').orderList(user_id, order_id, 2, page, 5, order_id, moment().unix(), [3, 4, 5, 6], [0, 3]).then(function (orderList) {
        if (isEmpty(orderList)) {
          self.assign('pagerData', orderList);
          self.display();
        } else {
          var orderIdList = [-1];
          _.each(orderList.data, function (ele) {
            orderIdList.push(ele.order_id);
            ele.order_time = moment.unix(ele.order_time).format('YYYY-M-DD HH:mm:ss');
          })
          return D('order').orderSkuListJoinReturns(orderIdList).then(function (skuList) {
            var skuArr = [-1];
            _.each(skuList, function (sku) {
              if (_.indexOf([78, 94], sku.fid) >= 0) {
                sku.goods_name = [sku.cat_name, sku.goods_name].join(' ');
              }
              skuArr.push(sku.sku_id);
            })
            var skuImg = [];
            return D('order').skuImg(skuArr).then(function (imgList) {
              _.each(imgList, function (img) {
                skuImg[img.sku_id] = img.img_50;
              })
              _.each(skuList, function (sku) {
                sku.img_50 = skuImg[sku.sku_id];
              })
              skuList = _.groupBy(skuList, 'order_id');
              _.each(orderList.data, function (order) {
                order.sku = [];
                _.each(skuList, function (ele, index) {
                  if (order.order_id == index) {
                    order.sku = ele;
                  }
                })
              });
              orderList.url = '/refund?page=${page}';
              self.assign('pagerData', orderList);
              self.display();
            })
          })
        }
      }).catch(function (e) {
          self.redirect('/')
        })

    },
    /**
     * 申请退换货
     * @returns {*}
     */
    applyAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      if (self.isPost()) {
        var orderSku = self.decrypt(self.post('orderSku'));
        orderSku = orderSku.split('|');
        if (orderSku.length != 4) {
          self.json({
            code: 50,
            info: '参数错误',
            data: {}
          })
        } else {
          var order_id = orderSku[0];
          var sku_id = orderSku[1];
          var price = orderSku[2];
          var quantity = orderSku[3];
          var return_reason = self.post('reason');
          var return_img = self.post('img') || '';
          var return_name = self.post('name');
          var return_phone = self.post('phone');
          var return_address = self.post('address');
          var type = self.post('type');
          return_img = return_img.split('|');
          var imgList = [];
          _.each(return_img, function (img) {
            if (img.indexOf('http://img.lankaola.com') == 0) {
              imgList.push(img);
            }
          });
          return D('order').checkOrder(user_id, order_id).then(function (count) {
            if (count == 0) {
              return Promise.reject();
            } else {
              return D('order').addRefund(user_id, order_id, return_reason, imgList.slice(0, 3).join('|'), return_name, return_phone, return_address, type, quantity, price, sku_id);
            }
          }).then(function (ret) {
              if (ret.type == 'add') {
                self.json({
                  code: 1,
                  info: '提交申请成功',
                  data: {}
                })
              } else {
                self.json({
                  code: -1,
                  info: '已经提交申请',
                  data: {}
                })
              }
            }).catch(function () {
              self.json({
                code: 500,
                info: '服务器繁忙，请稍后再试',
                data: {}
              })
            })
        }

      } else {
        var order_id = self.get('orderid');
        var sku_id = self.get('sku');
        if (!order_id || !sku_id) {
          self.redirect('/')
        }
        return D('order').orderItem(user_id, order_id).then(function (order) {
          if (isEmpty(order)) {
            return Promise.reject();
          } else {
            self.assign('order', order);
            return Promise.resolve(order);
          }
        }).then(function (order) {
            return D('user').getProvince().then(function (province) {
              self.assign('province', province);
              return Promise.resolve(order);
            })
          }).then(function (order) {
            return D('user').getCity(order.province_id).then(function (city) {
              self.assign('city', city);
              return Promise.resolve(order);
            })
          }).then(function (order) {
            return D('user').getCounty(order.city_id).then(function (county) {
              self.assign('county', county);
              return Promise.resolve();
            })
          }).then(function () {
            return D('order').orderSkuOnReturns(order_id, sku_id);
          }).then(function (sku) {
            if (isEmpty(sku)) {
              return Promise.reject();
            } else {
              self.assign('orderSku', self.encrypt([order_id, sku_id, sku.price, sku.quantity].join('|')));
              return D('order').skuImg(sku.sku_id).then(function (imgList) {
                if (isEmpty(imgList)) {
                  sku.img_50 = '';
                } else {
                  sku.img_50 = imgList[0].img_50;
                }
                return Promise.resolve(sku);
              })
            }
          }).then(function (sku) {
            self.assign('sku', sku);
            self.display();
          }).catch(function (e) {
            //console.log(e);
            self.redirect('/');
          })
      }
    },
    listAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      return D('order').refundList(user_id).then(function (returnList) {
        var skuArr = [-1];
        _.each(returnList, function (returnSku) {
          skuArr.push(returnSku.sku_id);
        })
        return D('order').skuImg(skuArr).then(function (imgList) {
          _.each(returnList, function (returnSku) {
            _.each(imgList, function (img) {
              if (returnSku.sku_id == img.sku_id) {
                returnSku.img_50 = img.img_50;
              }
            })
          })
          returnList = _.values(_.groupBy(returnList, 'order_id'));
          self.assign('returnList', returnList);
          self.display();
        })
      })
    },
    uploadAction: function () {
      var self = this;
      var fileData = self.file();
      var file = fileData.Filedata.path;
    }
  }
})
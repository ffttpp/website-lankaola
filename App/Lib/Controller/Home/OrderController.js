/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/20
 * Time: 下午5:08
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
        return Promise.resolve();
      });
    },
    /**
     * 订单列表
     * GET
     * d：           时间
     * page：        页码
     * orderstatus： 订单状态
     * @returns {*}
     */
    indexAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var orderTime = parseInt(self.get('d')) || 1;
      var page = parseInt(self.get('page')) || 1;
      var orderStatus = self.get('s') || -1;
      var startTime = 0;
      var endTime = 0;
      var timeList = [
        {
          value: 1,
          text: '最近三个月'
        },
        {
          value: 2,
          text: '今年内'
        },
        {
          value: 3,
          text: moment().subtract(1, 'year').format('YYYY') + '年'
        },
        {
          value: 4,
          text: moment().subtract(2, 'year').format('YYYY') + '年'
        },
        {
          value: 5,
          text: moment().subtract(3, 'year').format('YYYY') + '年'
        },
        {
          value: 6,
          text: moment().subtract(3, 'year').format('YYYY') + '年前'
        }
      ];
      self.assign({
        timeList: timeList,
        orderTime: orderTime,
        bread_nav_1: '交易管理',
        bread_url_1: '/order',
        user_nav_index: 'order_index',
        bread_nav_2: '订单列表'
      });
      switch (orderTime) {
        default :
        case 1:
          startTime = moment().subtract(3, 'month').format('X');
          endTime = moment().unix();
          self.assign('orderTimeText', timeList[0].text);
          break;
        case 2:
          startTime = moment([moment().format('YYYY'), 0, 1]).format('X');
          endTime = moment().unix();
          self.assign('orderTimeText', timeList[1].text);
          break;
        case 3:
          startTime = moment([moment().subtract(1, 'year').format('YYYY'), 0, 1]).format('X');
          endTime = moment([moment().format('YYYY'), 0, 1]).format('X');
          self.assign('orderTimeText', timeList[2].text);
          break;
        case 4:
          startTime = moment([moment().subtract(2, 'year').format('YYYY'), 0, 1]).format('X');
          endTime = moment([moment().subtract('year', 1).format('YYYY'), 0, 1]).format('X');
          self.assign('orderTimeText', timeList[3].text);
          break;
        case 5:
          startTime = moment([moment().subtract(3, 'year').format('YYYY'), 0, 1]).format('X');
          endTime = moment([moment().subtract('year', 2).format('YYYY'), 0, 1]).format('X');
          self.assign('orderTimeText', timeList[4].text);
          break;
        case 6:
          startTime = 0;
          endTime = moment([moment().subtract(3, 'year').format('YYYY'), 0, 1]).format('X');
          self.assign('orderTimeText', timeList[5].text);
          break;

      }
      return D('order').orderList(user_id, 0, 1, page, orderListRows, startTime, endTime, orderStatus, [0, 1, 2, 3]).then(function (orderList) {
        var order_id = [-1];
        _.each(orderList.data, function (ele) {
          order_id.push(ele.order_id);
        });
        return D('order').getSubOrderList(user_id, order_id).then(function (subOrder) {
          orderList.data = _.union(orderList.data, subOrder);
          var order_id = [-1];
          _.each(orderList.data, function (ele) {
            order_id.push(ele.order_id);
            ele.order_time = moment.unix(ele.order_time).format('YYYY-M-D HH:mm:ss');
          });
          return D('order').orderSkuList(order_id).then(function (skuList) {
            var skuIdArr = [-1];
            _.each(skuList, function (sku) {
              skuIdArr.push(sku.sku_id);
            });
            return D('order').skuImg(skuIdArr).then(function (imgList) {
              _.each(skuList, function (sku) {
                if (_.indexOf([78, 94], sku.fid) >= 0) {
                  sku.goods_name = [sku.cat_name, sku.goods_name].join(' ');
                }
                _.each(imgList, function (img) {
                  if (sku.sku_id == img.sku_id) {
                    sku.img_50 = img.img_50;
                  }
                })
              });
              skuList = _.groupBy(skuList, 'order_id');
              _.each(orderList.data, function (order) {
                order.sku = [];
                _.each(skuList, function (sku, index) {
                  if (index == order.order_id) {
                    order.sku = sku;
                  }
                })
              });
              return Promise.resolve(orderList);
            })

          })
        });
      }).then(function (orderList) {
        var orderDetail = _.groupBy(orderList.data, 'p_order_id');
        var pOrderList = orderDetail['0'];
        _.each(pOrderList, function (pOrder) {
          _.each(orderDetail, function (order, index) {
            if (pOrder.order_id == index) {
              pOrder.subOrder = order;
            }
          })
        });
        orderList.data = pOrderList;
        orderList.url = '/order?page=${page}&s=' + orderStatus + '&d=' + orderTime;
        self.assign('pagerData', orderList);
        self.display();
      }).catch(function (err) {
        self.redirect('/');
      })
    },
    /**
     * 订单内容
     * @constructor
     */
    itemAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var order_id = self.get('orderid');
      if (!order_id) {
        self.redirect('/')
      } else {
        return D('order').getParentOrder(order_id).then(function (p_order) {
          if (isEmpty(p_order)) {
            return Promise.reject();
          } else {
            if (p_order.p_order_id) {
              order_id = p_order.p_order_id;
            }
            return D('order').subOrderList(user_id, order_id).then(function (order) {
              if (isEmpty(order)) {
                return Promise.reject();
              } else {
                var orderIdList = [];
                _.each(order, function (ele) {
                  orderIdList.push(ele.order_id);
                });
                return D('order').orderSkuList(orderIdList).then(function (skuList) {
                  var skuIdArr = [-1];
                  _.each(skuList, function (ele) {
                    skuIdArr.push(ele.sku_id);
                  });
                  return D('order').skuImg(skuIdArr).then(function (imgList) {
                    _.each(skuList, function (sku) {
                      _.each(imgList, function (img) {
                        if (sku.sku_id == img.sku_id) {
                          sku.img_50 = img.img_50;
                        }
                      })
                    });
                    _.each(skuList, function (sku) {
                      if (_.indexOf([78, 94], sku.fid) >= 0) {
                        sku.skuName = [sku.brand_name, sku.cat_name, sku.goods_name, sku.skuName].join(' ');
                      } else {
                        sku.skuName = [sku.brand_name, sku.goods_name, sku.skuName].join(' ');
                      }
                    });
                    _.each(order, function (ele) {
                      ele.skuList = [];
                      _.each(skuList, function (sku) {
                        if (ele.order_id == sku.order_id) {
                          ele.skuList.push(sku);
                        }
                      });
                    });
                    order = _.values(_.groupBy(order, 'p_order_id'));
                    var newOrder = {};
                    newOrder.pOrder = order[0][0];
                    if (order.length == 2) {
                      newOrder.subOrder = order[1];
                    } else {
                      newOrder.subOrder = [];
                    }
                    return Promise.resolve(newOrder);
                  });
                })
              }
            })
          }
        }).then(function (order) {
          self.assign({
            order: order.pOrder,
            subOrder: order.subOrder,
            hasSub: !isEmpty(order.subOrder),
            bread_nav_1: '交易管理',
            bread_url_1: '/order'
          });
          self.display();
        }).catch(function (err) {
          self.redirect('/');
        });
      }
    },
    /**
     * 确认订单信息
     * GET
     * @returns {*}
     */
    orderInfoAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var oaid = self.cookie('oaid');                  //地址使用记录
      var opid = self.cookie('opid') || 3;             //支付方式使用记录
      var bank = self.cookie('bank') || 'CMB-DEBIT';   //网银支付银行选择记录
      var bankName = '';
      _.each(alipayBankList, function (bankItem) {
        if (bankItem.code == bank) {
          bankName = bankItem.name;
        }
      });
      self.assign('alipayBankList', alipayBankList);
      //收货地址列表
      return D('user').getAddressList(user_id).then(function (address) {
        if (address.length > 0) {
          var addressIdList = [];
          var addressDefault = {};
          _.each(address, function (ele) {
            addressIdList.push(ele.address_id);
            addressDefault[ele.address_id] = ele;
          });
          if (_.indexOf(addressIdList, oaid) >= 0) {
            self.assign({
              oaid: oaid,
              oaItem: addressDefault[oaid]
            })
          } else {
            self.assign({
              oaid: address[0].address_id,
              oaItem: address[0]
            })
          }
        } else {
          self.assign({
            oaid: '',
            oaItem: {}
          })
        }
        self.assign('address', address);
        //发票信息列表
        return D('user').invoiceList(user_id);
      }).then(function (invoice) {
        self.assign('invoice', invoice);
        return D('user').invoiceType().then(function (invoiceType) {
          self.assign('invoiceType', invoiceType);
          return Promise.resolve();
        }).then(function () {
          return D('user').invoiceContent().then(function (invoiceContent) {
            self.assign('invoiceContent', invoiceContent);
            return Promise.resolve()
          })
        }).then(function () {
          //订单内容
          return self.session('orderInfo');
        })
      }).then(function (orderInfo) {
        if (isEmpty(orderInfo)) {
          return self.redirect('/cart')
        } else {
          var goodsArr = [-1];
          _.each(orderInfo, function (ele) {
            goodsArr.push(ele.goods_id);
          });
          //订单商品支持的付款方式，从中选出都支持的支付方式
          return D('goods').payType(goodsArr).then(function (payType) {
            var newPayType = [];
            payType = _.groupBy(payType, 'pay_id');
            var length = 0;
            _.each(payType, function (ele) {
              if (length < ele.length) {
                length = ele.length;
              }
            });
            if (length > 0) {
              _.each(payType, function (ele) {
                if (ele.length == length) {
                  newPayType.push(ele[0]);
                }
              });
            }
            var defaultPayTypeIndex = 0;
            _.each(newPayType, function (pt, index) {
              if (opid == pt.pay_id) {
                defaultPayTypeIndex = index;
              }
            });
            self.assign({
              opid: opid,
              opItem: newPayType[defaultPayTypeIndex],
              payType: newPayType,
              bankCode: bank,
              bankName: bankName
            });
            return Promise.resolve(orderInfo);
          })
        }
      }).then(function (orderInfo) {
        //获取账户桉树叶、余额信息
        return Promise.all([D('user').getleaves(user_id), D('cash').cashCount(user_id)]).then(function (data) {
          self.assign({
            leaves: data[0].count,
            leavesRatio: leavesRatio,
            cash: (data[1].charge_cash + data[1].gift_cash)
          });
          return Promise.resolve(orderInfo);
        });
      }).then(function (orderInfo) {
        var order = [];
        var count = 0;
        var sum = 0;
        var freight = 0;
        var orderInfoByCat = _.groupBy(orderInfo, 'fid');
        var sumByCat = 0;
        //计算商品总数量、总价钱
        _.each(orderInfo, function (ele, index) {
          order.push(_.extend(ele, {cart_id: index}));
          count += parseInt(ele.count);
          sum += parseInt(ele.count) * parseFloat(ele.price);
        });
        //计算办公用品总价，
        _.each(orderInfoByCat, function (ele, index) {
          if (index == 1) {
            _.each(ele, function (eleSku) {
              sumByCat += parseInt(eleSku.count) * parseFloat((eleSku.price));
            });
          }
        });
        //计算运费
        if (sumByCat < lowestAmount) {
          freight = globalFreight;
        }
        self.assign('order', {
          count: count,
          sum: sum,
          freight: freight,
          allowedLeaves: Math.floor(sumByCat * leavesUseRatio * leavesRatio),
          list: order
        });
        self.assign({
          bread_nav_1: '交易管理',
          bread_url_1: '/order'
        });
        self.display();
      })
    },
    /**
     * 检查是否设置了支付密码
     * @returns {*}
     */
    checkPwdAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      return D('user').getUserByUserid(user_id).then(function (data) {
        var payPwd = 0;
        if (data.pay_pwd) {
          payPwd = 1;
        }
        self.json({
          code: 1,
          info: '',
          data: {
            payPwd: payPwd
          }
        })
      }).catch(function () {
        self.json({
          code: 500,
          info: '连接超时，请稍后再试'
        })
      })
    },
    /**
     * 提交订单信息
     * POST
     * address_id:        收货地址id
     * payType:           支付方式
     * invoice_id:        发票信息
     * leaves:            使用的桉树叶
     * @returns {*}
     */
    submitOrderAction: function () {
      var self = this;
      var retJSON = {
        code: 50,
        info: '参数错误',
        data: {}
      };
      if (self.isPost()) {
        var user_id = self.userInfo.user_id;
        var postData = self.post();
        var address_id = postData['address_id'];
        var payType = postData['payType'];
        var invoice_id = postData['invoice_id'];
        var leaves = postData['leaves'] || 0;
        var cash = postData['cash'] || 0;
        var payPwd = postData['pay_pwd'];
        var bank = postData['bank'] || '';
        var bank_id = 0;
        //判断银行代码是否合法
        if (bank) {
          bank = bank.toUpperCase();
          bank_id = _.indexOf(pay.alipayBankCode, bank);
          if (bank_id < 0) {
            bank = pay.alipayBankCode[0];
          }
        }
        if (!address_id || !payType || !invoice_id) {
          return self.json(retJSON);
        }
        return getPromise().then(function () {
          //当使用了桉树叶或者余额，检查支付密码
          if (cash > 0 || leaves > 0) {
            return D('user').getUserByUserid(user_id).then(function (data) {
              if (data.pay_pwd) {
                if (data.pay_pwd == md5(md5(payPwd) + data.pay_salt)) {
                  return Promise.resolve(true);
                } else {
                  return Promise.reject({
                    code: 'WRONG_PAY_PASSWORD',
                    info: '支付密码错误'
                  });
                }
              } else {
                return Promise.reject({
                  code: 'NEED_PAY_PASSWORD',
                  info: '请先设置支付密码'
                })
              }
            })
          } else {
            return Promise.resolve(true);
          }
        }).then(function () {
          //获取订单信息
          return self.session('orderInfo').then(function (orderInfo) {
            if (isEmpty(orderInfo)) {
              return Promise.reject({
                code: 1000,
                info: '',
                data: {}
              })
            } else {
              //验证收货地址时候合法
              return D('order').checkAddress(user_id, address_id).then(function (data) {
                if (data > 0) {
                  self.cookie('oaid', address_id, {maxAge: 30 * 86400});
                  return Promise.resolve(orderInfo);
                } else {
                  return Promise.reject();
                }
              })
            }
          }).then(function (orderInfo) {
            //验证支票信息是否合法
            if (invoice_id != 0) {
              return D('order').checkInvoice(user_id, invoice_id).then(function (data) {
                if (data > 0) {
                  return Promise.resolve(orderInfo);
                } else {
                  return Promise.reject();
                }
              })
            } else {
              return Promise.resolve(orderInfo);
            }
          }).then(function (orderInfo) {
            var goodsArr = [-1];
            _.each(orderInfo, function (ele) {
              goodsArr.push(ele.goods_id);
            });
            //获取订单商品详情
            return D('goods').payType(goodsArr).then(function (payTypeList) {
              var newPayType = [];
              payTypeList = _.groupBy(payTypeList, 'pay_id');
              var length = 0;
              _.each(payTypeList, function (ele) {
                if (length < ele.length) {
                  length = ele.length;
                }
              });
              if (length > 0) {
                _.each(payTypeList, function (ele) {
                  if (ele.length == length) {
                    newPayType.push(ele[0]);
                  }
                });
              }
              //验证支付方式是否合法
              for (var i = 0; i < newPayType.length; i++) {
                if (newPayType[i].pay_id == payType) {
                  self.cookie('opid', payType, {maxAge: 30 * 86400});
                  self.cookie('bank', bank, {maxAge: 30 * 86400});
                  return Promise.resolve(orderInfo);
                }
              }
              return Promise.reject();
            })
          }).then(function (orderInfo) {
            //验证桉树叶和余额使用是否合法
            return Promise.all([D('user').getleaves(user_id), D('cash').cashCount(user_id)]).then(function (data) {
              if (data[0] >= leaves && (data[1].charge_cash + data[1].gift_cash) >= cash) {
                return Promise.resolve(orderInfo);
              } else {
                return Promise.reject();
              }
            });
          }).then(function (orderInfo) {
            var amount = 0;    //总价
            var freight = 0;   //运费
            //根据商品分类拆分订单
            var orderInfoByCat = _.groupBy(orderInfo, 'fid');
            var amountByCat = 0; //办公用品总价
            //计算商品总价
            _.each(orderInfo, function (ele) {
              amount += parseInt(ele.count) * parseFloat(ele.price);
            });
            //把分类为1（办公用品）的价格单独拿出来，用于桉树叶使用计算
            _.each(orderInfoByCat, function (ele, index) {
              if (index == 1) {
                _.each(ele, function (skuEle) {
                  amountByCat += parseInt(skuEle.count) * parseFloat(skuEle.price);
                })
              }
            });
            //计算桉树叶使用数量是否合法
            if (leaves / leavesRatio > amountByCat * leavesUseRatio) {
              leaves = amountByCat * leavesUseRatio * leavesRatio;
            }
            //计算运费
            if (amountByCat < lowestAmount) {
              freight = globalFreight;
            }
            //计算桉树叶总价值和余额使用是否超出总价，如果超出，缩减桉树叶使用量
            if (leaves / leavesRatio > amount + freight - cash) {
              leaves = (amount - cash) * leavesRatio;
            }
            //计算实际支付价格
            var payAmount = amount - leaves / leavesRatio + freight - cash;
            //再根据商户id拆分订单
            _.each(orderInfoByCat, function (ele, index) {
              orderInfoByCat[index] = _.groupBy(ele, 'provider');
            });
            //重组订单数据结构
            var subOrderList = [];
            _.each(orderInfoByCat, function (ele, fid) {
              _.each(ele, function (subEle, provider) {
                subEle.fid = fid;
                subEle.provider = provider;
                subOrderList.push(subEle);
              });
            });
            var skuList = [];
            var cartList = [];
            var fidList = [];
            var providerList = [];

            //获取此次订单中购物车id，把此订单提交的商品从购物车中删除
            _.each(orderInfo, function (ele, index) {
              cartList.push(index);
            });
            //子订单数据补全（订单商品、数量、价格、分类、商户id）
            _.each(subOrderList, function (subOrder, index) {
              skuList[index] = [];
              _.each(subOrder, function (ele) {
                skuList[index].push({
                  sku_id: ele.sku_id,
                  price: ele.price,
                  quantity: ele.count
                });
              });
              fidList.push(subOrder.fid);
              providerList.push(subOrder.provider);
            });
            //新增订单
            return D('order').addOrder(user_id, amount, payType, leaves, payAmount, address_id, invoice_id, freight, skuList, bank, fidList, providerList, cash).then(function (order_id) {
              return Promise.resolve({
                order_id: order_id,
                cartList: cartList
              });
            });
          })
        }).then(function (data) {
          //删除session中此次订单数据
          return self.session('orderInfo', {}).then(function () {
            //删除购物车中此次订单商品
            return D('goods').cleanCart(user_id, data.cartList).then(function () {
              return Promise.resolve(data.order_id);
            });
          })
        }).then(function (order_id) {
          //记录余额使用
          process.nextTick(function () {
            return self.addCashConsume(user_id, cash, order_id);
          });
          self.json({
            code: 1,
            info: '提交成功',
            data: {
              order: order_id
            }
          })
        }).catch(function (err) {
          if (isObject(err) && err.code) {
            self.json(err)
          } else {
            self.json(retJSON);
          }
        });
      } else {
        self.json(retJSON);
      }
    },
    /**
     * 订单使用余额记录
     */
    addCashConsume: function (user_id, cash, order_id) {
      var self = this;
      var charge_cash = cash;
      var gift_cash = 0;
      var insertData = [];
      //获取账户余额总数
      return D('cash').cashCount(user_id).then(function (data) {
        //判断余额使用类型，优先使用实际充值余额
        if (data.charge_cash < cash) {
          charge_cash = data.charge_cash;
        }
        gift_cash = cash - charge_cash;
        var consume_time = moment().unix();
        var consumenInfo = {
          user_id: user_id,
          order_id: order_id,
          consume_time: moment().unix()
        };
        if (charge_cash > 0) {
          insertData.push({
            user_id: user_id,
            order_id: order_id,
            consume_time: consume_time,
            cash: charge_cash,
            cash_type: 1
          });
        }
        if (gift_cash > 0) {
          insertData.push({
            user_id: user_id,
            order_id: order_id,
            consume_time: consume_time,
            cash: gift_cash,
            cash_type: 2
          });
        }
        //日志记录消费明细
        process.nextTick(function () {
          log.write('consume_record', ['consume record: ', JSON.stringify({
            user_id: user_id,
            order_id: order_id,
            charge_cash: charge_cash,
            gift_cash: gift_cash
          })].join(''));
        });
        if (!isEmpty(insertData)) {
          return D('cash').addConsume(insertData).then(function (insertId) {
            var promise = [];
            //消费记录数据插入成功后再扣除余额
            if (charge_cash > 0) {
              promise.push(D('cash').updateDecCash(user_id, 'charge_cash', charge_cash));
              process.nextTick(function () {
                log.write('cash_record', 'cash record: charge_cash consume:\n', JSON.stringify({
                  user_id: user_id,
                  order_id: order_id,
                  cash: charge_cash
                }));
              });
            }
            if (gift_cash > 0) {
              promise.push(D('cash').updateDecCash(user_id, 'gift_cash', gift_cash));
              process.nextTick(function () {
                log.write('cash_record', 'cash record: gift_cash consume:\n', JSON.stringify({
                  user_id: user_id,
                  order_id: order_id,
                  cash: charge_cash
                }));
              });
            }
            return Promise.resolve(promise);
          })
        } else {
          return Promise.resolve();
        }
      }).then(function (data) {
        self.end();
      }).catch(function (e) {
        process.nextTick(function () {
          log.write('consume_record', ['add consume failed:  ', JSON.stringify(e)].join(''));
        });
        self.end();
      })
    },
    /**
     * 下单成功
     * @returns {*}
     */
    successAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var order_id = self.get('order_id');
      var urlCode = 'order';
      if (!order_id) {
        if (self.isAjax()) {
          self.json({
            code: 50,
            info: '参数错误',
            data: {}
          })
        } else {
          self.redirect('/')
        }
      } else {
        //获取订单信息
        return D('order').orderAmount(user_id, order_id).then(function (order) {
          if (isEmpty(order)) {
            return Promise.reject();
          } else {
            //判断是否是子订单，如果是查询主订单信息
            if (order.p_order_id) {
              return D('order').orderAmount(user_id, order.p_order_id).then(function (p_order) {
                if (isEmpty(p_order)) {
                  return Promise.reject();
                } else {
                  return Promise.resolve(p_order);
                }
              })
            } else {
              return Promise.resolve(order);
            }
          }
        }).then(function (order) {
          //判断是否需要继续支付
          if (order.pay_amount == 0) {
            self.assign({
              data: {
                order_id: order.order_id,
                payType: 0,
                payName: order.pay_name,
                bankImg: '',
                url: '',
                pay_amount: order.pay_amount,
                amount: order.amount,
                leaves: order.leaves,
                cash: order.cash,
                freight: order.freight
              }
            });
            return self.display();
          }
          //查询是否有子订单，如果有，商品名称从子订单中取
          return D('order').getChildOrder(order.order_id).then(function (childOrder) {
            if (childOrder.length > 0) {
              order.subOrder = childOrder[0].order_id;
            } else {
              order.subOrder = order.order_id;
            }
            return Promise.resolve(order);
          }).then(function (order) {
            //获取订单中一个商品，用于支付宝支付
            return D('order').orderSkuList(order.subOrder).then(function (skuList) {
              if (skuList.length == 0) {
                return Promise.reject();
              } else {
                var skuIdArr = [-1];
                _.each(skuList, function (sku) {
                  skuIdArr.push(sku.sku_id);
                });
                return D('order').skuImg(skuIdArr).then(function (imgList) {
                  _.each(skuList, function (sku) {
                    _.each(imgList, function (img) {
                      if (sku.sku_id == img.sku_id) {
                        sku.img_50 = img.img_50;
                      }
                    })
                  });
                  order.productName = [skuList[0].brand_name, skuList[0].goods_name, skuList[0].skuName].join(' ');
                  return Promise.resolve(order);
                })
              }
            })
          });
        }).then(function (order) {
          //判断支付类型
          var pay_type = order.pay_type;
          if (pay_type == 2) {
            var bank = order.bank_code;
            var bankImg = '';
            _.each(alipayBankList, function (ele) {
              if (ele.code == bank) {
                bankImg = ele.icon;
              }
            });
            var bank_id = _.indexOf(pay.alipayBankCode, bank);
            return pay.alipayBank(order.order_id, order.pay_amount, order.productName, bank_id, urlCode).then(function (url) {
              return Promise.resolve({
                order_id: order.order_id,
                payType: 2,
                payName: order.pay_name,
                bankImg: bankImg,
                url: url,
                pay_amount: order.pay_amount,
                amount: order.amount,
                leaves: order.leaves,
                cash: order.cash,
                freight: order.freight
              })
            });
          } else if (pay_type == 3) {
            return pay.alipay(order.order_id, order.pay_amount, order.productName, urlCode).then(function (url) {
              return Promise.resolve({
                order_id: order.order_id,
                payType: 3,
                payName: order.pay_name,
                bankImg: '',
                url: url,
                pay_amount: order.pay_amount,
                amount: order.amount,
                leaves: order.leaves,
                cash: order.cash,
                freight: order.freight
              });
            })
          } else {
            return Promise.resolve({
              order_id: order.order_id,
              payType: order.pay_type,
              payName: order.pay_name,
              bankImg: '',
              url: '',
              pay_amount: order.pay_amount,
              amount: order.amount,
              leaves: order.leaves,
              cash: order.cash,
              freight: order.freight
            });
          }
        }).then(function (data) {
          if (self.isAjax()) {
            self.json({
              code: 1,
              info: '',
              data: data
            })
          } else {
            self.assign('data', data);
            self.display();
          }
        }).catch(function () {
          if (self.isAjax()) {
            self.json({
              code: 500,
              info: '服务器繁忙，请稍后再试',
              data: {}
            })
          } else {
            self.redirect('/')
          }
        })
      }
    },
    /**
     * 取消原因
     * @returns {*}
     */
    cancelReasonAction: function () {
      var self = this;
      return D('order').cancelReason().then(function (reason) {
        self.json({
          code: 1,
          info: '',
          data: reason
        })
      }).catch(function (e) {
        self.json({
          code: 500,
          info: '服务器繁忙，请稍后再试',
          data: {}
        })
      })
    },
    /**
     * 取消订单
     * @returns {*}
     */
    cancelOrderAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var order_id = self.get('orderid');
      var cancel_id = self.get('cancelid');
      if (!order_id || !cancel_id) {
        self.json({
          code: 50,
          info: '参数错误',
          data: {}
        })
      } else {
        return D('order').getParentOrder(order_id).then(function (p_order) {
          if (isEmpty(p_order)) {
            return Promise.reject();
          } else {
            if (p_order.p_order_id) {
              order_id = p_order.p_order_id;
            }
            return D('order').cancelOrder(user_id, order_id, cancel_id).then(function (data) {
              if (data) {
                //返还桉树叶
                if (p_order.leaves > 0) {
                  process.nextTick(function () {
                    var leavesData = {
                      user_id: user_id,
                      action: 1,
                      count: p_order.leaves,
                      order_id: order_id,
                      time: moment().unix(),
                      type: 2
                    };
                    return Promise.all([D('user').addUserLeavesRecord(leavesData), D('user').addUserLeavesCount(leavesData)]).then(function () {
                      self.end();
                    })
                  })
                }
                if (p_order.cash > 0) {
                  process.nextTick(function () {
                    return D('cash').getCashConsumeRecordByOrderId(user_id, order_id).then(function (consume) {
                      if (!isEmpty(consume)) {
                        _.each(consume, function (record) {
                          var charge_id = generateChargeId();
                          var charge_time = moment().unix();
                          var field = 'gift_cash';
                          if (record.cash_type == 1) {
                            field = 'charge_cash';
                          }
                          process.nextTick(function () {
                            log.write('chargeOrderInfo', ['cancel order ', order_id, ' return ', field, '\n', JSON.stringify(p_order)].join(''));
                            log.write('cash_record', [field, '\n', JSON.stringify({user_id: user_id, charge_id: charge_id, cash: record.cash})].join(''));
                          });
                          return Promise.all([D('cash').charge(charge_id, user_id, 5, record.cash, record.cash_type, '', order_id, charge_time, charge_time, '', 1), D('cash').updateIncCash(user_id, field, record.cash)]).then(function () {
                            self.end();
                          });
                        })
                      } else {
                        self.end();
                      }
                    })
                  })
                }
              }
              self.json({
                code: 1,
                info: '已提交订单取消信息，请等待系统处理',
                data: {
                  order_id: order_id
                }
              })
            })
          }
        }).catch(function (e) {
          if (isObject(e) && e.code) {
            self.json(e);
          } else {
            self.json({
              code: 50,
              info: '参数错误',
              data: {}
            })
          }
        })
      }
    },
    /**
     * 取消订单列表
     * @returns {*}
     */
    cancelOrderListAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var page = self.get('page') || 1;
      self.assign({
        bread_nav_1: '客户服务',
        bread_url_1: '/order/cancelOrderList',
        user_nav_index: 'order_cancelOrderList',
        bread_nav_2: '取消订单记录'
      });
      return D('order').cancelOrderList(user_id, page).then(function (list) {
        var order_id = [];
        _.each(list.data, function (ele) {
          order_id.push(ele.order_id);
        });
        if (order_id.length == 0) {
          return Promise.resolve(list);
        } else {
          return D('order').cancelSubOrder(user_id, order_id).then(function (subOrderList) {
            _.each(subOrderList, function (subOrder) {
              order_id.push(subOrder.order_id);
            });
            _.each(list.data, function (ele) {
              ele.subOrder = [];
              _.each(subOrderList, function (subOrder) {
                if (subOrder.p_order_id == ele.order_id) {
                  ele.subOrder.push(subOrder.order_id);
                }
              });
            });
            return D('order').orderSkuList(order_id).then(function (skuList) {
              var skuIdArr = [-1];
              _.each(skuList, function (sku) {
                skuIdArr.push(sku.sku_id);
              });
              return D('order').skuImg(skuIdArr).then(function (imgList) {
                _.each(skuList, function (sku) {
                  _.each(imgList, function (img) {
                    if (sku.sku_id == img.sku_id) {
                      sku.img_50 = img.img_50;
                    }
                  })
                });
                skuList = _.groupBy(skuList, 'order_id');
                _.each(list.data, function (ele) {
                  ele.sku = [];
                  _.each(skuList, function (sku, index) {
                    if (index == ele.order_id || _.indexOf(ele.subOrder, parseInt(index)) >= 0) {
                      ele.sku = _.union(ele.sku, sku);
                    }
                  })
                });
                return Promise.resolve(list);
              })
            })
          });
        }
      }).then(function (list) {
        list.url = '/order/cancelOrderList?page=${page}';
        self.assign('pagerData', list);
        self.display();
      })
    }
  }
});
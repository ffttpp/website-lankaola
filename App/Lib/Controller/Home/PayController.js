/**
 * Created with JetBrains WebStorm.
 *
 * 用于接收支付宝及网银支付通知 Controller
 *
 * User: hanqingnan
 * Date: 14/11/5
 * Time: 下午2:23
 * To change this template use File | Settings | File Templates.
 */

module.exports = Controller('Home/BaseController', function () {
  return {
    init: function (http) {
      var self = this;
      return self.super('init', http);
    },
    /**
     * 用户接收支付宝服务器端通知
     */
    alipayNotifyAction: function () {
      var _self = this;

      //支付状态 fail：失败，success：成功
      var result = pay.alipayConfig.notify_fail;
      var urlCode = 'order';

      //只接受get请求
      if (!_self.isPost()) {
        _self.end(result);
        return;
      }

      //获得到所有post参数
      //如：{name: "welefen", "email": "welefen@gmail.com"}
      var reqData = _self.post();

      //打印前台通知报文日志
      process.nextTick(function () {
        log.write(pay.alipayConfig.log_file_name[urlCode],
          ['Asynchronous notify data : \n', JSON.stringify(reqData)].join('')
        );
      });

      //验证签名
      return pay.verifySign(reqData, urlCode)//Promise.resolve(true)//
        .then(function (isSign) {
          //验证签名结果
          if (isSign) {//签名验证成功
            //商户订单号
            var orderId = reqData.out_trade_no;
            //交易状态
            var tradeStatus = reqData.trade_status;
            //支付宝交易号
            var tradeNo = reqData.trade_no;

            if (tradeStatus === pay.alipayConfig.alipay_finished_string || tradeStatus === pay.alipayConfig.alipay_success_string) {
              //返回支付宝接收消息成功通知
              result = pay.alipayConfig.notify_ok;

              //验证订单状态是否是已经完成交易，避免执行后续操作。
              //修改订单状态，记录支付宝交易号,桉树叶计算，将在下一次事件循环中执行
              process.nextTick(function () {
                return D('Order')
                  .getOrderInfoByOrderId(orderId)
                  .then(function (orderInfo) {
                    //console.log(orderInfo);
                    //打印日志
                    process.nextTick(function () {
                      log.write('orderInfo',
                        [orderId, ' before update status : \n', JSON.stringify(orderInfo)].join('')
                      );
                    });

                    if (_.isEmpty(orderInfo)) {//假如订单不存在 或者不符合要求的订单
                      _self.end(result);
                      return;
                    }
                    //修改订单状态，付款时间，支付宝交易号，卖家信息
                    var sData = {
                      "order_id": orderId,
                      "pay_time": moment(reqData.notify_time, "YYYY-MM-DD HH:mm").format('X'),
                      "pay_order_id": tradeNo,
                      "buy_info": reqData.buyer_email,
                      "order_status": 3
                    };
                    D('Order')
                      .modifyOrderStatus(sData)
                      .then(function (udi) {
                        //打印日志
                        process.nextTick(function () {
                          log.write('orderInfo',
                            [orderId, '\nupdate status :', udi].join('')
                          );
                        });
                        //处理用户桉树叶赠送部分
                        /**
                         var leavesAmount = 0;
                         _.each(orderInfo, function (order) {
                                                    if (order.fid == 1) {
                                                        leavesAmount += order.amount;
                                                    }
                                                });
                         /*
                         //################目前未按照商品分类进行处理（实际只限办公用品）
                         //订单金额  包括运费
                         var payAmount = orderInfo.pay_amount;
                         //运费
                         var freight = orderInfo.freight;
                         freight = _.isNull(freight) ? 0 : freight;//验证是否是null

                         //处理订单金额
                         payAmount -= freight;
                         */
                        //只有办公用品涉及桉树叶使用及赠送，此处处理的是桉树叶的赠送
                        //需要排除使用桉树叶的金额，桉树叶比例100:1
                        var payAmount = 0;//订单金额 备用
                        var leaves = 0;//桉树叶使用数量 备用
                        var user_id = 0;//用户id
                        //计算订单总金额
                        _.each(orderInfo, function (element) {
                          if (element.fid == 1) {
                            payAmount += parseFloat(element.amount);
                            leaves += parseInt(element.leaves);
                          }
                          user_id = element.user_id;
                        });
                        //console.log(payAmount);
                        //console.log(leaves/leavesRatio);
                        payAmount = payAmount - parseInt(leaves / leavesRatio);
                        //console.log(payAmount);
                        //计算赠送桉树叶
                        if (payAmount >= leavesGive) {
                          //计算得出此笔订单获得桉树叶数量
                          var leaves = parseInt(payAmount * leavesGiveRatio);
                          //写入用户桉树数据
                          var leavesDataDetail = {
                            "user_id": user_id,
                            "action": 1,
                            "count": leaves,
                            "order_id": orderId,
                            "time": moment().format('X')
                          };
                          D('User')
                            .addUserLeavesRecord(leavesDataDetail)
                            .then(function (insertInfo) {
                              //写入用户桉树叶总表
                              D('User')
                                .addUserLeavesCount(_.pick(leavesDataDetail, 'user_id', 'count'));
                            });

                        }
                      })
                  })
                  .catch(function (r) {
                    log.write('error',
                      ['alipayNotifyAction update order status :', r].join('')
                    );
                  });
              });
              //第一时间将接受通知状态返回给支付宝
              _self.end(result);
            } else {
              _self.end(result);
            }
          } else {
            _self.end(result);
          }
        })
        .catch(function (r) {
          log.write('error',
            ['alipayNotifyAction verifySign :', r].join('')
          );
        });
    },
    /**
     * 用户接收支付宝网银服务器端通知
     */
    alipayBankNotifyAction: function () {

    },
    /**
     * 用于接收支付宝前台通知
     */
    alipayBackUrlAction: function () {
      var self = this;

      //支付状态 0：失败，1：成功
      var result = 0;
      var msg = '支付失败！';
      var urlCode = 'order';

      //self.assign('status', 1);
      //self.assign('orderId', '000');
      //self.assign('msg', '支付成功！我们将尽快为您发货！');
      //self.display();
      //return ;
      //只接受get请求
      if (!self.isGet()) {
        self.assign('status', result);
        self.assign('msg', msg);
        self.display();
        return;
      }

      //获得到所有get参数
      //如：{name: "welefen", "email": "welefen@gmail.com"}
      var reqData = self.get();

      //打印前台通知报文日志
      process.nextTick(function () {
        log.write(pay.alipayConfig.log_file_name[urlCode],
          ['Synchronous notify data : \n', JSON.stringify(reqData)].join('')
        );
      });
      //验证签名
      return pay.verifySign(reqData, urlCode)
        .then(function (isSign) {
          //商户订单号
          var orderId = reqData.out_trade_no;
          //交易状态
          var tradeStatus = reqData.trade_status;

          //验证签名结果
          if (isSign) {//签名验证成功
            if (tradeStatus === pay.alipayConfig.alipay_finished_string || tradeStatus === pay.alipayConfig.alipay_success_string) {
              result = 1;
              msg = '支付成功！我们将尽快为您发货！';
            }
          }
          self.assign('orderId', orderId);
          self.assign('status', result);
          self.assign('msg', msg);
          self.display();
        });
    },
    /**
     * 用于接收支付宝网银前台通知
     */
    alipayBankBackUrlAction: function () {
      this.display('home:pay:alipayBankBackUrl');
    },

    /**
     * 充值订单用于接收支付宝服务器通知
     */
    alipayChargeNotifyAction: function () {
      var self = this;

      //支付状态 fail：失败，success：成功
      var result = pay.alipayConfig.notify_fail;
      var urlCode = 'charge';

      //只接受post请求
      if (!self.isPost()) {
        self.end(result);
        return;
      }

      //获取post数据
      var reqData = self.post();

      //打印前台通知报文日志
      process.nextTick(function () {
        log.write(pay.alipayConfig.log_file_name[urlCode],
          ['Asynchronous notify data : \n', JSON.stringify(reqData)].join('')
        );
      });

      //验证签名
      return pay.verifySign(reqData, urlCode)//Promise.resolve(true)//
        .then(function (isSign) {
          if (isSign) {
            //商户订单号
            var charge_id = reqData.out_trade_no;
            //交易状态
            var tradeStatus = reqData.trade_status;
            //支付宝交易号
            var tradeNo = reqData.trade_no;

            if (tradeStatus === pay.alipayConfig.alipay_finished_string || tradeStatus === pay.alipayConfig.alipay_success_string) {
              //返回支付宝接收消息成功通知
              result = pay.alipayConfig.notify_ok;

              //业务处理
              process.nextTick(function () {
                return D('cash').getChargeOrder(charge_id).then(function (chargeOrder) {
                  process.nextTick(function () {
                    log.write('chargeOrderInfo',
                      [charge_id, ' before update status : \n', JSON.stringify(chargeOrder)].join('')
                    );
                  });
                  if (isEmpty(chargeOrder) || chargeOrder.status !== 0) {
                    self.end(result);
                    return;
                  }

                  //修改订单状态，付款时间，支付宝交易号，卖家信息
                  var sData = {
                    "pay_time": moment(reqData.notify_time, "YYYY-MM-DD HH:mm").format('X'),
                    "charge_order_id": tradeNo,
                    "charge_info": reqData.buyer_email,
                    "status": 1
                  };
                  return D('cash').updateChargeOrder(charge_id, sData).then(function (udi) {
                    //打印日志
                    process.nextTick(function () {
                      log.write('chargeOrderInfo',
                        [charge_id, '\nupdate status :', udi].join('')
                      );
                      log.write('cash_record', ['charge:\n', JSON.stringify({user_id: chargeOrder.user_id, charge_id: charge_id, cash: chargeOrder.charge_cash})].join(''));
                    });
                    return D('cash').updateIncCash(chargeOrder.user_id, 'charge_cash', chargeOrder.charge_cash);
                  }).then(function () {
                    //处理是否赠送
                    if (chargeOrder.charge_cash >= charge_gift_cash) {
                      var gift_charge_id = generateChargeId();
                      var gift_cash = parseFloat(chargeOrder.charge_cash) * charge_gift_rate;
                      var gift_time = moment().unix();
                      var gift_data = {
                        resource: charge_id,
                        charge_id: gift_charge_id,
                        charge_time: gift_time
                      };
                      process.nextTick(function () {
                        log.write('chargeOrderInfo', ['add gift charge order ', gift_charge_id, ' : \n', JSON.stringify(gift_data)].join(''));
                      });
                      return D('cash').charge(gift_charge_id, chargeOrder.user_id, chargeOrder.charge_type, gift_cash, 2, reqData.buyer_email, charge_id, gift_time, gift_time, '', 1).then(function () {
                        process.nextTick(function () {
                          log.write('chargeOrderInfo', ['gift charge order ', gift_charge_id, ' add success']);
                          log.write('cash_record', ['gift charge:\n', JSON.stringify({user_id: chargeOrder.user_id, charge_id: charge_id, cash: gift_cash})].join(''));
                        });
                        return D('cash').updateIncCash(chargeOrder.user_id, 'gift_cash', gift_cash);
                      })
                    } else {
                      return Promise.resolve();
                    }
                  })
                }).then(function () {
                  self.end(result);
                }).catch(function (e) {
                  log.write('error',
                    ['alipayChargeNotifyAction update order status :', e].join('')
                  );
                })
              });

              //
              self.end(result);
            } else {
              self.end(result);
            }

          } else {
            self.end(result);
          }
        })

    },
    /**
     * 充值订单用户接收网银服务器通知
     */
    alipayChargeBankNotifyAction: function () {

    },
    /**
     * 充值订单支付宝前台回调地址
     */
    alipayChargeBackUrlAction: function () {
      var self = this;

      //支付状态 0：失败，1：成功
      var result = 0;
      var msg = '支付失败！';
      var urlCode = 'charge';

      //只接受get请求
      if (!self.isGet()) {
        self.assign('status', result);
        self.assign('msg', msg);
        self.display();
        return;
      }

      //获得到所有get参数
      //如：{name: "welefen", "email": "welefen@gmail.com"}
      var reqData = self.get();

      //打印前台通知报文日志
      process.nextTick(function () {
        log.write(pay.alipayConfig.log_file_name[urlCode],
          ['Synchronous notify data : \n', JSON.stringify(reqData)].join('')
        );
      });
      //验证签名
      return pay.verifySign(reqData, urlCode)//Promise.resolve(true)//
        .then(function (isSign) {
          //商户订单号
          var charge_id = reqData.out_trade_no;
          //交易状态
          var tradeStatus = reqData.trade_status;

          //验证签名结果
          if (isSign) {//签名验证成功
            if (tradeStatus === pay.alipayConfig.alipay_finished_string || tradeStatus === pay.alipayConfig.alipay_success_string) {
              result = 1;
              msg = '充值成功！';
            }
          }
          self.assign('chargeId', charge_id);
          self.assign('status', result);
          self.assign('msg', msg);
          self.display();
        });

    },
    /**
     * 充值订单网银前台回调地址
     */
    alipayChargeBankBackUrlAction: function () {

    }
  }
})
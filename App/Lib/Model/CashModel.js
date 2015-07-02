/**
 * 虚拟账户Mode
 * USER: chenlingguang
 * TIME: 15/1/27 下午6:12
 */

module.exports = Model(function () {
  return {
    /**
     * 账户余额
     * @param user_id
     * @returns {*|返回一个promise}
     */
    cashCount: function (user_id) {
      return D('user_cash')
        .where({user_id: user_id})
        .find();
    },
    /**
     * 充值记录
     * @param user_id
     * @returns {type[]|返回一个promise|void|*}
     */
    cashCharge: function (user_id, page, listRows) {
      return D('cash_charge_record')
        .field('*, FROM_UNIXTIME(charge_time, "%Y-%m-%d %H:%i:%s") date')
        .page(page, listRows)
        .where({
          user_id: user_id,
          status: 1
        })
        .order('charge_time desc')
        .countSelect();
    },
    /**
     * 消费记录
     * @param user_id
     * @returns {type[]|返回一个promise|void|*}
     */
    cashConsume: function (user_id, page, listRows) {
      return D('cash_consume_record')
        .field('*, FROM_UNIXTIME(consume_time, "%Y-%m-%d %H:%i:%s") date')
        .page(page, listRows)
        .where({user_id: user_id})
        .order('consume_time desc')
        .countSelect();
    },
    /**
     * 根据订单号获取消费记录
     * @param user_id
     * @param order_id
     * @returns {type[]|返回一个promise|void|*}
     */
    getCashConsumeRecordByOrderId: function (user_id, order_id) {
      return D('cash_consume_record')
        .where({
          user_id: user_id,
          order_id: order_id
        })
        .select();
    },
    /**
     * 获取卡信息
     * @param serial     序列号
     * @returns {*|返回一个promise}
     */
    getCardBySerial: function (serial) {
      return D('card_info')
        .join('card_batch on card_info.batch_id = card_batch.batch_id')
        .where({
          serial_num: serial
        })
        .find()
    },
    /**
     * 卡充值
     * @param user_id
     * @param serial
     */
    cardCharge: function (user_id, serial) {
      return D('card_info')
        .where({
          serial_num: serial,
          status: 0,
          is_allowed: 1
        })
        .update({
          status: 1,
          user_id: user_id
        });
    },
    /**
     * 充值
     * @param charge_id              充值订单号
     * @param user_id
     * @param charge_type            充值方式，1：线下充值，2：线上充值，3：充值卡充值，4：退货返还金钱
     * @param charge_cash            充值金额
     * @param cash_type              金额类型，1：实际充值金额（可退金额），2：赠送金额（不可退金额）
     * @param charge_info            充值用户信息，线上充值为上家（支付宝）买家信息，线下充值为后台操作人id，充值卡充值为空
     * @param charge_order_id        为实际充值金额且是在线支付，字段为上家订单号；为实际充值金额且是线下支付，字段为空；为赠送金额，字段为充值赠送来源id，充值卡充值，字段为充值卡卡号；为退货返还金钱时，为订单号
     * @param charge_time            充值时间（充值订单建立时间）
     * @param pay_time               实际支付时间
     * @param bank_code              网银银行代码
     * @param status                 充值订单状态（默认为1，当充值为在线充值时为0）
     */
    charge: function (charge_id, user_id, charge_type, charge_cash, cash_type, charge_info, charge_order_id, charge_time, pay_time, bank_code, status) {
      return D('cash_charge_record')
        .add({
          charge_id: charge_id,
          user_id: user_id,
          charge_type: charge_type,
          charge_cash: charge_cash,
          cash_type: cash_type,
          charge_info: charge_info,
          charge_order_id: charge_order_id,
          charge_time: charge_time,
          pay_time: pay_time,
          bank_code: bank_code,
          status: status
        })
    },
    /**
     * 余额增加(充值)
     * @param user_id
     * @param field              金额类型（charge_cash | gift_cash）
     * @param charge_cash
     * @returns {type[]|*}
     */
    updateIncCash: function (user_id, field, charge_cash) {
      return D('user_cash').execute(['UPDATE `user_cash` SET `', field, '`=`', field, '`+', charge_cash, ' WHERE `user_id` = ', user_id].join(''));
    },
    /**
     * 余额减少（消费）
     * @param user_id
     * @param field
     * @param consume_cash
     * @returns {type[]|*}
     */
    updateDecCash: function (user_id, field, consume_cash) {
      return D('user_cash').execute(['UPDATE `user_cash` SET `', field, '`=`', field, '`-', consume_cash, ' WHERE `user_id` = ', user_id].join(''));
    },
    /**
     * 获取单个充值订单
     * @param charge_id
     * @returns {*|返回一个promise}
     */
    getChargeOrder: function (charge_id) {
      return D('cash_charge_record')
        .where({charge_id: charge_id})
        .find();
    },
    /**
     * 更新充值订单状态
     * @param charge_id
     * @param data
     * @returns {Progress|type[]|*}
     */
    updateChargeOrder: function (charge_id, data) {
      return D('cash_charge_record')
        .where({charge_id: charge_id})
        .update(data);
    },
    /**
     * 插入消费记录
     * @param data
     * @returns {*}
     */
    addConsume: function (data) {
      return D('cash_consume_record').addAll(data);
    }
  }
});
/**
 *
 * USER: chenlingguang
 * TIME: 15/1/22 下午4:17
 * 账户余额Controller
 */

module.exports = Controller('Home/BaseController', function () {
  return {
    init: function (http) {
      var self = this;
      return self.super('init', http).then(function () {
        return self.checkLoginAction()
      }).then(function (userInfo) {
        self.userInfo = userInfo;
        self.assign({
          bread_nav_1: '我的账户',
          bread_url_1: '/user',
          userInfo: userInfo
        });
        return Promise.resolve();
      });
    },
    /**
     * 充值明细
     * @returns {*}
     */
    indexAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      self.assign({
        user_nav_index: 'cash_index',
        bread_nav_2: '账户余额'
      });
      var page = self.get('page') || 1;
      var listRows = 20;
      return Promise.all([D('cash').cashCount(user_id), D('cash').cashCharge(user_id, page, listRows)]).then(function (data) {
        data[1].url = '/cash?page=${page}';
        self.assign({
          data: data[0],
          pagerData: data[1]
        });
        self.display();
      }).catch(function () {
        self.redirect('/');
      });

    },
    /**
     * 消费明细
     */
    consumeAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      self.assign({
        user_nav_index: 'cash_index',
        bread_nav_2: '账户余额'
      });
      var page = self.get('page') || 1;
      var listRows = 20;
      return Promise.all([D('cash').cashCount(user_id), D('cash').cashConsume(user_id, page, listRows)]).then(function (data) {
        data[1].url = '/cash/consume?page=${page}';
        self.assign({
          data: data[0],
          pagerData: data[1]
        });
        self.display();
      }).catch(function () {
        self.redirect('/');
      });
    },
    /**
     * 充值
     */
    chargeAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var bankCode = self.cookie('bank') || 'CMB-DEBIT';
      var urlCode = 'charge';
      if (self.isPost()) {
        var charge_type = self.post('ctype');
        //充值卡充值
        if (charge_type == 3) {
          var serial = self.post('serial');
          var password = self.post('password').toUpperCase();
          var curTime = moment().unix();
          var info = '';
          var check = [];
          return D('cash').getCardBySerial(serial).then(function (card) {
            if (card.is_allowed != 1) {
              info = '卡已被禁止使用';
              check.push(false);
            }
            if (card.status !== 0) {
              info = '卡已被使用';
              check.push(false);
            }
            if (card.start_time > curTime || card.endTime < curTime) {
              info = '当前时间不在卡有效期内';
              check.push(false);
            }
            if (card.password != password) {
              info = '序列号或者密码错误';
              check.push(false);
            }
            if (check.length == 0) {
              var cardCharge = D('cash').cardCharge(user_id, serial);
              var charge_id = generateChargeId();
              var charge = D('cash').charge(charge_id, user_id, charge_type, card.par_value, 2, '', serial, curTime, curTime, '', 1);
              //记录日志
              process.nextTick(function () {
                log.write('charge_record', ['card charge:\n', JSON.stringify({charge_id: charge_id, user_id: user_id, value: card.par_val, serial: serial})].join(''))
              });
              return Promise.all([cardCharge, charge]).then(function (ret) {
                if (!!ret[0]) {
                  process.nextTick(function () {
                    log.write('cash_record', ['card charge:\n', JSON.stringify({user_id: user_id, charge_id: charge_id, cash: card.par_value})].join(''));
                  });
                  return D('cash').updateIncCash(user_id, 'gift_cash', card.par_value);
                } else {
                  return Promise.reject();
                }
              }).then(function (ret) {
                if (ret) {
                  self.json({
                    code: 1,
                    info: '充值成功'
                  })
                } else {
                  return Promise.reject();
                }
              });
            } else {
              self.json({
                code: -1,
                info: info
              })
            }
          }).catch(function () {
            self.json({
              code: -1,
              info: '服务器繁忙，请稍后再试'
            })
          });
        } else if (charge_type == 2) {
          //在线充值
          var pay_type = self.post('ptype');
          var charge_cash = parseFloat(self.post('cash')) || 0;
          var bank = self.post('bank') || '';
          var bank_id = 0;
          if (!isNumber(charge_cash) || charge_cash <= 0) {
            self.json({
              code: -1,
              info: '请输入正确的充值金额'
            })
          }
          if (bank) {
            bank = bank.toUpperCase();
            bank_id = _.indexOf(pay.alipayBankCode, bank);
            if (bank_id < 0) {
              bank = pay.alipayBankCode[0];
            }
          }
          var charge_id = generateChargeId();
          var productName = '蓝考拉办公服务';
          process.nextTick(function () {
            log.write('charge_record', ['card charge:\n', JSON.stringify({charge_id: charge_id, user_id: user_id, value: charge_cash, serial: serial})].join(''))
          });
          return D('cash').charge(charge_id, user_id, charge_type, charge_cash, 1, '', '', moment().unix(), '', bank, 0).then(function () {
            self.cookie('bank', bank, {maxAge: 30 * 86400});
            if (pay_type == 2) {
              return pay.alipayBank(charge_id, charge_cash, productName, bank_id, urlCode);
            } else {
              return pay.alipay(charge_id, charge_cash, productName, urlCode)
            }
          }).then(function (url) {
            self.json({
              code: 1,
              info: '提交成功',
              data: {
                url: url
              }
            })
          }).catch(function () {
            self.json({
              code: -1,
              info: '服务器繁忙，请稍后再试'
            })
          })
        } else {
          self.json({
            code: -1,
            info: '参数错误'
          })
        }

      } else {
        self.assign({
          user_nav_index: 'cash_charge',
          bread_nav_2: '充值',
          alipayBankList: alipayBankList,
          bankCode: bankCode
        });
        self.display();
      }
    }
  }
});

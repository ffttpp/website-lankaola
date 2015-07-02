/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/12/5
 * Time: 下午3:51
 * To change this template use File | Settings | File Templates.
 */

module.exports = Controller("Home/BaseController", function(){
  "use strict";
  return {
    init: function (http) {
      var self = this;
      return self.super('init', http);
    },
    /**
     * 购物流程
     */
    shoppingAction: function () {
      var self = this;
      self.assign({
        bread_nav_1: '购物指南',
        bread_url_1: '/help/shopping',
        bread_nav_2: '购物流程',
        helpnavIndex: 'shopping'
      })
      self.display();
    },
    /**
     * 桉树叶规则
     */
    leavesAction: function () {
      var self = this;
      self.assign({
        bread_nav_1: '购物指南',
        bread_url_1: '/help/leaves',
        bread_nav_2: '桉树叶规则',
        helpnavIndex: 'leaves'
      })
      self.display();
    },
    /**
     * 会员
     */
    memberAction: function () {
      var self = this;
      self.assign({
        bread_nav_1: '购物指南',
        bread_url_1: '/help/member',
        bread_nav_2: '会员规则',
        helpnavIndex: 'member'
      })
      self.display();
    },
    /**
     * 支付方式
     */
    payAction: function () {
      var self = this;
      self.assign({
        bread_nav_1: '购物指南',
        bread_url_1: '/help/pay',
        bread_nav_2: '支付方式',
        helpnavIndex: 'pay',
        pay: alipayBankList
      })
      self.display();
    },
    /**
     * 发票
     */
    invoiceAction: function () {
      var self = this;
      self.redirect('/');
      self.assign({
        bread_nav_1: '售后服务',
        bread_url_1: '/help/invoice',
        bread_nav_2: '发票说明',
        helpnavIndex: 'invoice'
      })
      self.display();
    },
    /**
     * 退换货
     */
    refundAction: function () {
      var self = this;
      self.assign({
        bread_nav_1: '售后服务',
        bread_url_1: '/help/refund',
        bread_nav_2: '购物流程',
        helpnavIndex: 'refund'
      })
      self.display();
    }
  }
})
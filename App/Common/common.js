//这里定义一些全局通用的函数，该文件会被自动加载

global.baseUrl = 'http://www.lankaola.com'
global.moment = require('moment');
global._ = require('underscore');
global.crypto = require('crypto');
global.util = require('util');
global.key = 'lankaolaglobalKey';
global.goodsListRows = 60;
global.orderListRows = 20;
global.skuCache = 600;
//桉树叶兑换比例
global.leavesRatio = 100;
//桉树叶使用比例
global.leavesUseRatio = 0.25;
//桉树叶赠送基准值 单位元  大于等于leavesGive
global.leavesGive = 50;
//桉树叶赠送比例
global.leavesGiveRatio = 0.1;
/** 短信 */
global.sms = require('./sms');
global.smsTemplate = {
    /** 短信验证码模板 */
    "verifyCode":"【蓝考拉】%d 蓝考拉用户验证码，请勿泄露，如非本人操作，请忽略。"
}
global.productImgUrl = 'http://img.lankaola.com/goods';
//运费
global.lowestAmount = 100;
global.globalFreight = 10;
/** 日志*/
global.log = require('./log');
var logPath = [RUNTIME_PATH,'/Log'].join('');//正式环境将会把日志记录到其他目录
//var logPath = '/data/logs/pay/';//正式环境
log.init(logPath);
/** 支付模块*/
global.pay = require('./pay');

/** 银行*/
global.alipayBankList = [
  {
    code: 'CMB-DEBIT',
    name: '招商银行',
    icon: 'bank/cmb-debit.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=211576',
    tel: '95555'
  },
  {
    code: 'CCB-DEBIT',
    name: '建设银行',
    icon: 'bank/ccb-debit.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=211567',
    tel: '95533'
  },
  {
    code: 'ICBC-DEBIT',
    name: '工商银行',
    icon: 'bank/icbc-debit.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=211546',
    tel: '95588'
  },
  {
    code: 'COMM-DEBIT',
    name: '交通银行',
    icon: 'bank/comm-debit.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=250254',
    tel: '95559'
  },
  {
    code: 'GDB-DEBIT',
    name: '广发银行',
    icon: 'bank/gdb-debit.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=211636',
    tel: '400-830-8003'
  },
  {
    code: 'BOC-DEBIT',
    name: '中国银行',
    icon: 'bank/boc-debit.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=211562',
    tel: '95566'
  },
  {
    code: 'CEB-DEBIT',
    name: '光大银行',
    icon: 'bank/ceb-debit.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=211618',
    tel: '95595'
  },
  {
    code: 'SPDB-DEBIT',
    name: '上海浦东发展银行',
    icon: 'bank/spdb-debit.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=211623',
    tel: '95528'
  },
  {
    code: 'PSBC-DEBIT',
    name: '中国邮政储蓄银行',
    icon: 'bank/psbc-debit.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=488665',
    tel: '95580'
  },
  {
    code: 'BJBANK',
    name: '北京银行',
    icon: 'bank/bjbank.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=241072',
    tel: '95526'
  },
  {
    code: 'CMBC',
    name: '中国民生银行',
    icon: 'bank/cmbc.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=211604',
    tel: '95568'
  },
  {
    code: 'BJRCB',
    name: '北京农村商业银行',
    icon: 'bank/bjrcb.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=239033',
    tel: '96198'
  },
  {
    code: 'SPA-DEBIT',
    name: '平安银行',
    icon: 'bank/spa-debit.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=215714',
    tel: '95511'
  },
  {
    code: 'ABC',
    name: '中国农业银行',
    icon: 'bank/abc.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=211552',
    tel: '95599'
  },
  {
    code: 'CIB',
    name: '兴业银行',
    icon: 'bank/cib.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=211645',
    tel: '95561'
  },
  {
    code: 'CITIC',
    name: '中信银行',
    icon: 'bank/citic.png',
    url: 'https://cshall.alipay.com/lab/help_detail.htm?help_id=211616',
    tel: '95558'
  }
];

//后台预览允许访问ip
global.previewAllowedIp = ['117.114.140.69', '127.0.0.1', '58.135.102.69'];

//最低充值赠送金额
global.charge_gift_cash = 10000;
global.charge_gift_rate = 0.1;


/**
 * 生成充值订单号
 * @returns {string}
 */
global.generateChargeId = function () {
  var charge_id = 'C' + moment().unix();
  var rdmString = '';
  for (; rdmString.length < 4; rdmString += Math.random().toString().substr(2));
  return charge_id + rdmString.substr(0, 4);
};
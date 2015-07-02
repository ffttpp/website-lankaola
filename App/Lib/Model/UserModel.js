/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/10/29
 * Time: 下午3:50
 * To change this template use File | Settings | File Templates.
 */

module.exports = Model(function () {
  return {
    /**
     * 通过user_id获取用户信息
     * @param user_id
     * @returns {*}
     */
    getUserByUserid: function (user_id) {
      return D('users').where({user_id: user_id}).find();
    },
    /**
     * 更新用户信息（user_id）
     * @param user_id
     * @param data
     * @returns {*}
     */
    updateUserByUserid: function (user_id, data) {
      return D('users').where({
        user_id: user_id
      }).update(data);
    },
    /**
     * 通过手机号或者用户名获取用户信息
     * @param username
     * @returns {*}
     */
    getUserByUorP: function (username) {
      return D('users').where({
        _complex: {
          username: username,
          phone: username,
          _logic: 'or'
        }
      }).find();
    },
    /**
     * 通过用户名获取用户信息
     * @param username
     * @returns {*}
     */
    getUserByUsername: function (username) {
      return D('users').where({username: username}).find();
    },
    /**
     * 通过手机号获取用户信息
     * @param phone
     * @returns {*}
     */
    getUserByPhone: function (phone) {
      return D('users').where({phone: phone}).find();
    },
    /**
     * 注册时添加验证码
     * @param phone
     * @param code
     * @returns {*}
     */
    addVerificationOnReg: function (phone, code) {
      return D('users').add({
        phone: phone,
        verification_code: code,
        verification_time: moment().unix(),
        status: 0
      });
    },
    /**
     * 注册时更新验证码
     * @param phone
     * @param code
     * @returns {*}
     */
    updateVerificationOnReg: function (phone, code) {
      return D('users').where({
        phone: phone,
        status: 0
      }).update({
          verification_code: code,
          verification_time: moment().unix()
        });
    },
    /**
     * 用户名查重
     * @param username
     * @param phone
     * @returns {*|number|number}
     */
    checkUsername: function (username, phone) {
      return D('users').where({username: username, phone: ['!=', phone]}).count('username');
    },
    /**
     * 注册时验证验证码
     * @param phone
     * @returns {*}
     */
    ckeckVerificationOnReg: function (phone) {
      return D('users').field('verification_code, verification_time, status').where({
        phone: phone
      }).find();
    },
    /**
     * 注册更新用户信息
     * @param phone
     * @param username
     * @param password
     * @param randomCode
     * @returns {*}
     */
    updateUserinfoOnReg: function (phone, username, password, randomCode) {
      return D('users').where({
        phone: phone,
        status: 0
      }).update({
          username: username,
          password: password,
          random_code: randomCode,
          status: 1,
          register_time: moment().unix(),
          role: 1,
          is_delete: 0,
          monthly: 0
        });
    },
    /**
     * 注册成功后初始化账号信息
     * @param user_id
     * @returns {*}
     */
    initAccount: function (user_id) {
      var initLeaves =  D('user_leaves').add({
        'user_id': user_id,
        '`count`': 0
      });
      var initVirtual = D('user_cash').add({
        'user_id': user_id,
        'charge_cash': 0,
        'gift_cash': 0
      });
      return Promise.all([initLeaves, initVirtual]);
    },
    /**
     * 找回密码||修改密码时  验证码
     * @param user_id
     * @param verificatioin
     * @returns {*}
     */
    updateVerificationOnReset: function (user_id, verificatioin) {
      return D('users').where({
        user_id: user_id
      }).update({
          verification_code: verificatioin,
          verification_time: moment().unix()
        });
    },
    /**
     * 验证验证码
     * @param user_id
     * @returns {*}
     */
    checkVerificationOnReset: function (user_id) {
      return D('users').field('verification_code, verification_time').where({
        user_id: user_id
      }).find();
    },
    /**
     * 修改密码
     * @param user_id
     * @param password
     * @param randomCode
     * @returns {*}
     */
    updatePwdOnReset: function (user_id, password, randomCode) {
      return D('users').where({
        user_id: user_id
      }).update({
          password: password,
          random_code: randomCode
        });
    },
    /**
     * 修改支付密码
     * @param user_id
     * @param pay_pwd
     * @param salt
     * @returns {Progress|type[]|*}
     */
    updatePayPwd: function (user_id, pay_pwd, salt) {
      return D('users')
        .where({
          user_id: user_id
        }).update({
          pay_pwd: pay_pwd,
          pay_salt: salt
        });
    },
    /**
     * 收货地址数量
     * @param user_id
     * @returns {*|number|number}
     */
    countAddress: function (user_id) {
      return D('order_address').where({
        user_id: user_id,
        status: 1
      }).count('address_id');
    },
    /**
     * 收货地址列表
     * @param user_id
     * @returns {*}
     */
    getAddressList: function (user_id) {
      return D('order_address').alias('a').field([
          'a.*',
          'c_1.city_name province_name',
          'c_2.city_name city_name',
          'c_3.city_name county_name'
        ])
        .join('order_city c_1 ON a.province = c_1.city_id')
        .join('order_city c_2 ON a.city = c_2.city_id')
        .join('order_city c_3 ON a.county = c_3.city_id')
        .where({
          'a.status': 1,
          user_id: user_id
        }).order('a.address_id DESC').select();
    },
    /**
     * 获取单个收货地址
     * @param user_id
     * @param address_id
     * @returns {*}
     */
    getAddress: function (user_id, address_id) {
      return D('order_address').where({
        user_id: user_id,
        address_id: address_id,
        status: 1
      }).find();
    },
    /**
     * 增加收货地址
     * @param data
     * @returns {*}
     */
    addAddress: function (data) {
      return D('order_address').add(data);
    },
    /**
     * 更新收货地址
     * @param user_id
     * @param address_id
     * @param data
     * @returns {*}
     */
    updateAddress: function (user_id, address_id, data) {
      return D('order_address').where({
        user_id: user_id,
        address_id: address_id,
      }).update(data);
    },
    /**
     * 获取省份列表
     * @returns {*}
     */
    getProvince: function () {
      return D('order_city').cache(24 * 3600).field('city_id, city_name').where({
        lvl: 1,
        status: 1
      }).select();
    },
    /**
     * 获取城市列表
     * @param province
     * @returns {*}
     */
    getCity: function (province) {
      return D('order_city').cache(24 * 3600).field('city_id, city_name').where({
        lvl: 2,
        status: 1,
        parent_id: province
      }).select();
    },
    /**
     * 获取地区列表
     * @param city
     * @returns {*}
     */
    getCounty: function (city) {
      return D('order_city').cache(24 * 3600).field('city_id, city_name').where({
        lvl: 3,
        status: 1,
        parent_id: city
      }).select();
    },
    /**
     * 获取省份/城市/地区名称
     * @param province
     * @param city
     * @param county
     * @returns {*}
     */
    getAddressName: function (province, city, county) {
      return D('order_city').field('city_name').where({city_id: ['in', [province, city, county]]}).select();
    },
    /**
     * 发票信息列表
     * @param user_id
     * @returns {*}
     */
    invoiceList: function (user_id) {
      return D('order_invoice')
        .alias('invoice')
        .join('invoice_type on invoice_type.invoice_type_id = invoice.invoice_type_id')
        .join('invoice_content on invoice_content.content_id = invoice.invoice_content')
        .where({
          'invoice.user_id': user_id,
          'invoice.status': 1
        }).order('invoice_id DESC').select();
    },
    /**
     * 发票开具方式
     * @returns {*}
     */
    invoiceType: function () {
      return D('invoice_type').select();
    },
    /**
     * 发票内容
     * @returns {*}
     */
    invoiceContent: function () {
      return D('invoice_content').select();
    },
    /**
     * 新增发票信息
     * @param data
     * @returns {*}
     */
    addInvoice: function (data) {
      return D('order_invoice').add(data)
    },
    /**
     * 删除发票信息
     * @param user_id
     * @param invoice_id
     * @returns {*}
     */
    delInvoice: function (user_id, invoice_id) {
      return D('order_invoice').where({
        user_id: user_id,
        invoice_id: invoice_id
      }).update({
          status: 0
        })
    },
    /**
     * 获取桉树叶信息
     * @param user_id
     * @returns {*}
     */
    getleaves: function (user_id) {
      return D('user_leaves').field('count').where({user_id: user_id}).find();
    },
    /**
     *
     * 短信验证码入库
     *
     * @param phone            电话号码
     * @param verifyCode       6位验证码
     */
    verifyCode: function (phone, verifyCode) {
      var data = {
        "verification_code": verifyCode,
        "phone": phone,
        "verification_time": moment().format('X')
      };
      var where = {
        "phone": phone
      }
      return D('users').thenAdd(data, where, true)
        .then(function (returnDetail) {
          if (returnDetail.type === 'exist') {//更新数据库表verification_code字段
            return D('users').where(where).update({"verification_code": verifyCode, "verification_time": moment().format('X')});
          }
        });
    },
    /**
     * 记录用户桉树叶明细
     *
     * @param leavesData
     */
    addUserLeavesRecord: function (leavesData) {
      return D('user_leaves_record').add(leavesData);
    },
    /**
     * 记录用户桉树叶总数
     * @param leavesData
     */
    addUserLeavesCount: function (leavesData) {
      //console.log(leavesData);
      return D('user_leaves')
        .thenAdd(leavesData, {"user_id": leavesData.user_id}, true)
        .then(function (data) {
          if (data.type === 'exist') { //更新数据count+=
            return D('user_leaves')
              .where({"user_id": leavesData.user_id})
              .updateInc('count', leavesData.count);
          }
        })
    },
    /**
     * 桉树叶总数
     * @param user_id
     * @returns {*}
     */
    leavesCount: function (user_id) {
      return D('user_leaves')
        .field('count')
        .where({
          user_id: user_id
        }).find();
    },
    /**
     * 桉树叶明细
     * @param user_id
     * @param page
     * @param action
     * @returns {promise}
     */
    leavesRecord: function (user_id, page, action) {
      return D('user_leaves_record')
        .field('action, count, order_id, time, type')
        .page(page, orderListRows)
        .where({
          user_id: user_id,
          action: ['IN', action]
        })
        .order('id DESC')
        .countSelect();
    }
  }
});
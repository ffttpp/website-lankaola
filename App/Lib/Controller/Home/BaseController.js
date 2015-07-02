/**
 * Controller基类
 */
module.exports = Controller(function () {
  'use strict';
  return {
    init: function (http) {
      var self = this;
      self.super("init", http);
      self.assign({
        jsPath: 'http://js.lankaola.com/js/??',
        cssPath: 'http://js.lankaola.com/css/??',
        imgPath: 'http://img.lankaola.com/images/',
        productImgPath: productImgUrl,
        globalFid: 0
      });
      return self.session('userInfo').then(function (userInfo) {
        if (isEmpty(userInfo)) {
          self.assign({
            loginStatus: 0,
            userInfo: {}
          })
        } else {
          self.assign({
            loginStatus: 1,
            userInfo: userInfo
          })
        }
        return Promise.resolve();
      })
    },
    /**
     * 检查登陆状态
     * @returns {*}
     */
    checkLoginAction: function () {
      var self = this;
      return self.session('userInfo').then(function (userInfo) {
        if (isEmpty(userInfo)) {
          if (self.isAjax()) {
            return self.json({
              code: 1,
              data: {
                url: '/login'
              },
              info: ''
            })
          }
          return self.redirect("/login?ReturnUrl=" + escape(baseUrl + self.http.req.url));
        } else {
          self.assign({
            loginStatus: true,
            userInfo: userInfo
          });
          return Promise.resolve(userInfo);
        }
      })
    },
    /**
     * 获取已登录用户信息
     * @returns {*}
     */
    getUserInfoAction: function () {
      var self = this;
      return self.session('userInfo');
    },
    /**
     * aes-128加密
     * @param text
     * @returns {*|Progress|Progress}
     */
    encrypt: function (text) {
      var cipher = crypto.createCipher('aes-128-cbc', key);
      var crypted = cipher.update(text, 'utf8', 'hex');
      crypted += cipher.final('hex');
      return crypted;
    },
    /**
     * 解密
     * @param crypted
     * @returns {*|Progress|Progress}
     */
    decrypt: function (crypted) {
      try{
        var decipher = crypto.createDecipher('aes-128-cbc', key);
        var dec = decipher.update(crypted, 'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec;
      }
      catch (e)
      {
        return '';
      }
    },
    /**
     * 检查k值
     * @param k
     * @returns {*}
     */
    checkKey: function (k) {
      var self = this;
      if (isEmpty(k) || !isString(k)) {
        return {
          valid: false,
          user_id: ''
        };
      } else {
        var dec = self.decrypt(k);
        var data = dec.split('|');
        if (data.length != 2) {
          return {
            valid: false,
            user_id: ''
          }
        } else {
          var user_id = data[0],
            timestamp = data[1];
          /*关闭时间验证*/
          //timestamp = moment().unix();
          /*****/
          if (moment().unix() - timestamp > 3600) {
            return {
              valid: false,
              user_id: ''
            }
          } else {
            return {
              valid: true,
              user_id: user_id
            }
          }
        }
      }
    },
    /**
     * 检查密码
     * @param pwd
     */
    pwdLvl: function (pwd) {
      var pattern_1 = /^.*([\W_])+.*$/i;
      var pattern_2 = /^.*([a-zA-Z])+.*$/i;
      var pattern_3 = /^.*([0-9])+.*$/i;
      var level = 0;
      if (pwd.length > 10) {
        level++;
      }
      if (pattern_1.test(pwd)) {
        level++;
      }
      if (pattern_2.test(pwd)) {
        level++;
      }
      if (pattern_3.test(pwd)) {
        level++;
      }
      if (level > 3) {
        level = 3;
      }
      return level;
    }
  }
})
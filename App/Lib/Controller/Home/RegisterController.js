/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/10/30
 * Time: 下午5:17
 * To change this template use File | Settings | File Templates.
 */

module.exports = Controller('Home/BaseController', function () {
  return {
    init: function (http) {
      return this.super('init', http);
    },
    /**
     * 注册
     *  GET：注册页面
     *  POST：提交注册
     * @returns {*}
     */
    indexAction: function () {
      var self = this;
      var returnUrl = self.get('ReturnUrl');
      if (returnUrl.indexOf(baseUrl) != 0) {
        returnUrl = baseUrl;
      }
      if (self.isPost()) {
        var requestData = self.post();
        var username = requestData.username;
        var password = requestData.password;
        var passwordConfirm = requestData.password_confirm;
        var phone = requestData.phone;
        var verification = requestData.verification;
        var errMsg = self.valid([
          {
            name: 'username',
            value: username,
            valid: ['length', 'regexp'],
            length_args: [4, 20],
            regexp_args: [/^[a-z0-9_\\-]+$/i],
            msg: {
              length: '用户名长度只能为4-20位',
              regexp: ['用户名只能由英文、数字及"-"、"_"组成']
            }
          },
          {
            name: 'password',
            value: password,
            valid: ['length'],
            length_args: [6, 20],
            msg: {
              length: '密码长度只能为6-20位之间'
            }
          },
          {
            name: 'password_confirm',
            value: passwordConfirm,
            valid: ['confirm'],
            confirm_args: password,
            msg: {
              confirm: '两次密码不一致'
            }
          },
          {
            name: 'phone',
            value: phone,
            valid: ['mobile'],
            msg: {
              mobile: '手机号格式不正确'
            }
          },
          {
            name: 'verification',
            value: verification,
            valid: ['length', 'regexp'],
            length_args: [6, 6],
            regexp_args: [/^[0-9]+$/],
            msg: {
              length: '验证码错误',
              regexp: '验证码错误'
            }
          }
        ]);
        if (/^[0-9]+$/.test(username) && !errMsg.username) {
          errMsg.username = '用户名不能为纯数字'
        }
        if (isEmpty(errMsg)) {
          return D('user').getUserByPhone(phone).then(function (data) {
            if (!isEmpty(data) && data.status > 0) {
              return Promise.reject({
                code: -1,
                info: '手机号已被注册',
                data: {}
              });
            } else {
              return D('user').checkUsername(username, phone);
            }
          }).then(function (data) {
              if (data <= 0) {
                return D('user').ckeckVerificationOnReg(phone);
              } else {
                return Promise.reject({
                  code: -2,
                  info: '用户名已被使用',
                  data: {}
                });
              }
            }).then(function (data) {
              if (isEmpty(data)) {
                return Promise.reject({
                  code: -3,
                  info: '验证码错误',
                  data: {}
                });
              } else {
                data.verification_time = moment().unix();
                if (data.verification_code == verification && data.verification_time >= moment().unix() - 600) {
                  return Promise.resolve();
                }  else if (data.verification_time < moment().unix() - 600) {
                  return Promise.reject({
                    code: -4,
                    info: '验证码失效，请重新发送',
                    data: {}
                  });
                } else {
                  return Promise.reject({
                    code: -3,
                    info: '验证码错误',
                    data: {}
                  });
                }
              }

            }).then(function () {
              var randomCode = parseInt(Math.random() * 1000);
              randomCode >= 1000 ? 999 : randomCode;
              var md5Password = md5(md5(password) + randomCode);
              return D('user').updateUserinfoOnReg(phone, username, md5Password, randomCode);
            }).then(function () {
              return D('user').getUserByPhone(phone);
            }).then(function (data) {
              return D('user').initAccount(data.user_id).then(function (data) {
                //console.log(data);
                self.session('userInfo', {
                  user_id: data.user_id,
                  username: data.username,
                  phone: data.phone,
                  role: data.role,
                  monthly: data.monthly
                });
              })
            }).then(function(){
              self.json({
                code: 1,
                info: '注册成功',
                data: {
                  returnUrl: returnUrl
                }
              });
            }, function (err) {
              if (isObject(err)) {
                self.json(err);
              } else {
                self.json({
                  code: 500,
                  info: '服务器繁忙，请稍后再试',
                  data: {}
                });
              }
            })
        } else {
          self.json({
            code: -1,
            info: '参数错误',
            data: errMsg
          })
        }
      } else {
        self.assign('returnUrl', returnUrl);
        self.display();
      }
    },
    /**
     * 获取验证码
     * @returns {*}
     */
    verifyAction: function () {
      var self = this;
      var phone = self.post('phone');
      var isValid = self.valid(phone, "mobile")
      if (!isValid) {
        self.json({
          code: -1,
          info: '手机号格式不正确',
          data: {}
        });
      } else {
        var verification = parseInt(Math.random() * (999999 - 100000) + 100000);
        return D('user').getUserByPhone(phone).then(function (data) {
          if (isEmpty(data)) {
            return D('user').addVerificationOnReg(phone, verification);
          } else if (data.status > 0) {
            return Promise.reject({
              code: -2,
              info: '手机号已被注册',
              data: ''
            });
          } else if (data.verification_time >= (moment().unix() - 60)) {
            return Promise.reject({
              code: -3,
              info: '验证码发送频繁',
              data: {time: 60 - (moment().unix() - data.verification_time)}
            });
          } else {
            return D('user').updateVerificationOnReg(phone, verification);
          }
        }).then(function (data) {
            var content = util.format(smsTemplate.verifyCode, verification);
            process.nextTick(function () {
              sms.sendSms(phone, content);
            })
            self.json({
              code: 1,
              info: '验证码已发送',
              data: {}
            });
          }, function (err) {
            if (isObject(err)) {
              self.json(err);
            } else {
              self.json({
                code: 500,
                info: '服务器繁忙，请稍后再试',
                data: {}
              });
            }
          });
      }
    }
  }
})
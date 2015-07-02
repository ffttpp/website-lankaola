/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
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
     * 登录
     * @returns {*}
     */
    indexAction: function () {
      var self = this;
      var returnUrl = unescape(self.get('ReturnUrl'));// || self.referer();
      if (returnUrl.indexOf(baseUrl) != 0 || returnUrl.indexOf('/findPwd/success.action') >= 0) {
        returnUrl = baseUrl;
      }
      returnUrl = escape(returnUrl);
      if (self.isPost()) {
        var requestData = self.post();
        var username = requestData.username;
        var password = requestData.password;
        return D('user').getUserByUsername(username).then(function (data) {
          if (isEmpty(data)) {
            return Promise.reject({
              code: -1,
              info: '用户不存在',
              data: {}
            })
          } else {
            var md5password = md5(md5(password) + data.random_code);
            if (md5password == data.password) {
              return Promise.resolve(data);
            } else {
              return Promise.reject({
                code: -2,
                info: '用户名或者密码错误',
                data: {}
              });
            }
          }
        }).then(function (data) {
            self.session('userInfo', {
              user_id: data.user_id,
              username: data.username,
              phone: data.phone,
              role: data.role,
              monthly: data.monthly
            });
            self.json({
              code: 1,
              info: '登陆成功',
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
                info: '系统繁忙，请稍后再试',
                data: {}
              })
            }
          });
      } else {
        self.assign('returnUrl', returnUrl);
        self.display();
      }
    },
    /**
     * 登出
     * @returns {*}
     */
    logoutAction: function () {
      var self = this;
      return self.session('userInfo', {}).then(function () {
        if (self.isAjax()) {
          self.json({
            code: 1,
            info: '登出成功',
            data: {}
          })
        } else {
          self.redirect('/');
        }
      });
    },
    /**
     * 获取登陆状态
     */
    logstatusAction: function () {
      var self = this;
      self.session('userInfo').then(function (data) {
        if (isEmpty(data)) {
          self.json({
            code: -1,
            info: '未登录',
            data: {}
          })
        } else {
          self.json({
            code: 1,
            info: '已登录',
            data: data
          })
        }
      })
    },
    /**
     * 忘记密码
     * step
     *  index:
     *  findPwd: 基本信息 | 验证验证码
     *  resetPwd： 重设密码
     *  succes: 修改成功
     *  verify： 获取验证码
     * @returns {*}
     */
    findPwdAction: function () {
      var self = this;
      var pathname = self.http.pathname;
      var step = 'index';
      if (pathname.indexOf('/') >= 0) {
        pathname = pathname.split('/');
        step = pathname[1].split('.')[0];
      }
      switch (step) {
        default :
        case 'index' :
          if (self.isPost()) {
            var username = self.post('username');
            if (isEmpty(username)) {
              self.json({
                code: -1,
                info: '请输入账户名',
                data: {}
              })
            } else {
              return D('user').getUserByUorP(username).then(function (data) {
                if (isEmpty(data)) {
                  self.json({
                    code: -1,
                    info: '账户不存在',
                    data: {}
                  })
                } else {
                  if (data.status == 0) {
                    self.json({
                      code: -1,
                      info: '账户不存在',
                      data: {}
                    })
                  } else if (data.status == 2) {
                    self.json({
                      code: -2,
                      info: '账户异常，请联系客服',
                      data: {}
                    })
                  } else {
                    var text = [data.user_id, moment().unix()].join('|');
                    var crypted = self.encrypt(text);
                    self.json({
                      code: 1,
                      info: '',
                      data: {
                        url: '/findPwd/findPwd.action?k=' + crypted
                      }
                    });
                  }
                }
              }, function (err) {
                self.json({
                  code: 500,
                  info: '服务器繁忙',
                  data: {}
                })
              })
            }

          } else {
            self.assign({
              step: 1,
              crypted: ''
            });
            self.display();
          }
          break;
        case 'findPwd':
          var k = self.get('k');
          var userData = self.checkKey(k);
          if (self.isPost()) {
            if (userData.valid) {
              var user_id = userData.user_id;
              var verification = self.post('verification');
              return D('user').checkVerificationOnReset(user_id).then(function (data) {
                if (isEmpty(data)) {
                  self.json({
                    code: 100,
                    info: '操作已超时，请重新验证',
                    data: {}
                  })
                } else {
                  //关闭失效验证
                  //data.verification_time = moment().unix();

                  if (verification == data.verification_code && data.verification_time >= moment().unix() - 600) {
                    var text = [user_id, moment().unix()].join('|');
                    var crypted = self.encrypt(text);
                    self.json({
                      code: 1,
                      info: '',
                      data: {
                        url: '/findPwd/resetPwd.action?k=' + crypted
                      }
                    });
                  } else if (data.verification_time < moment().unix() - 600) {
                    self.json({
                      code: -3,
                      info: '验证码失效，请重新发送',
                      data: {}
                    })
                  } else {
                    self.json({
                      code: -2,
                      info: '验证码错误',
                      data: {}
                    })
                  }

                }
              })
            } else {
              self.json({
                code: 100,
                info: '操作已超时，请重新验证',
                data: {}
              })
            }
          } else {
            if (userData.valid) {
              var user_id = userData.user_id;
              return D('user').getUserByUserid(user_id).then(function (data) {
                if (isEmpty(data)) {
                  self.redirect('/findPwd');
                } else {
                  if (data.status == 0 || data.status.code == 2) {
                    self.redirect('/findPwd');
                  } else {
                    var username = data.username;
                    var phone = data.phone;
                    var replaceUsername = '';
                    for (var i = 0; i < username.length - 4; i++) {
                      replaceUsername += '*';
                    }
                    username = username.replace(username.substr(2, (username.length - 4)), replaceUsername);
                    phone = phone.replace(phone.substr(3, 5), '*****');
                    var text = [user_id, moment().unix()].join('|');
                    var crypted = self.encrypt(text);
                    self.assign({
                      step: 2,
                      username: username,
                      phone: phone,
                      crypted: crypted
                    });
                    self.assign('step', 2);
                    self.display();
                  }
                }
              })
            } else {
              self.redirect('/findPwd');
            }
          }
          break;
        case 'resetPwd':
          var k = self.get('k');
          var userData = self.checkKey(k);
          if (self.isPost()) {
            if (userData.valid) {
              var password = self.post('password'),
                passwordConfirm = self.post('password_confirm');
              var errMsg = self.valid([
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
                }
              ]);
              if (isEmpty(errMsg)) {
                var randomCode = parseInt(Math.random() * 1000);
                var md5Password = md5(md5(password) + randomCode);
                return D('user').updatePwdOnReset(userData.user_id, md5Password, randomCode).then(function (data) {
                  if (data) {
                    var text = [userData.user_id, moment().unix()].join('|');
                    var crypted = self.encrypt(text);
                    self.json({
                      code: 1,
                      info: '修改密码成功',
                      data: {
                        url: '/findPwd/success.action?k=' + crypted
                      }
                    })
                  } else {
                    self.json({
                      code: 500,
                      info: '服务器繁忙，请稍后再试',
                      data: {}
                    })
                  }
                })
              } else {
                self.json({
                  code: -1,
                  info: '密码不符合规则，请重新设置',
                  data: {}
                })
              }
            } else {
              self.json({
                code: 100,
                info: '操作已超时，请重新验证',
                data: {}
              })
            }
          } else {
            if (userData.valid) {
              var text = [userData.user_id, moment().unix()].join('|');
              var crypted = self.encrypt(text);
              self.assign({
                step: 3,
                crypted: crypted
              });
              self.display();
            } else {
              self.redirect('/findPwd');
            }
          }
          break;
        case 'success':
          var k = self.get('k');
          var data = self.checkKey(k);
          if (data.valid) {
            self.assign({
              step: 4,
              crypted: ''
            });
            self.display();
          } else {
            self.redirect('/findPwd');
          }
          break;
        case 'verify':
          var k = self.get('k');
          var data = self.checkKey(k);
          if (data.valid) {
            var verification = parseInt(Math.random() * (999999 - 100000) + 100000);
            return D('user').getUserByUserid(data.user_id).then(function (data) {
              if (isEmpty(data)) {
                self.json({
                  code: -1,
                  info: '账户不存在',
                  data: {}
                })
              } else {
                if (data.status == 0) {
                  self.json({
                    code: -1,
                    info: '账户不存在',
                    data: {}
                  })
                } else if (data.status == 2) {
                  self.json({
                    code: -2,
                    info: '账户异常，请联系客服',
                    data: {}
                  })
                } else if (data.verification_time > (moment().unix() - 60)) {
                  self.json({
                    code: -3,
                    info: '验证码发送过于频繁',
                    data: {
                      time: 60 - (moment().unix() - data.verification_time)
                    }
                  })
                } else {
                  var content = util.format(smsTemplate.verifyCode, verification);
                  process.nextTick(function () {
                    sms.sendSms(data.phone, content);
                  })
                  return D('user').updateVerificationOnReset(data.user_id, verification);
                }
              }
            }).then(function () {
                var text = [data.user_id, moment().unix()].join('|');
                var crypted = self.encrypt(text);
                self.json({
                  code: 1,
                  info: '验证码已发送',
                  data: {
                    url: '/findPwd/findPwd.action?k=' + crypted
                  }
                });
              }, function () {
                self.json({
                  code: 500,
                  info: '服务器繁忙，请稍后再试',
                  data: {}
                })
              })
          } else {
            self.json({
              code: 100,
              info: '操作已超时，请重新验证',
              data: {}
            })
          }
      }
    }
  }
})
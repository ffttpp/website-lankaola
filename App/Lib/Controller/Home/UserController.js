/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/10/30
 * Time: 下午4:55
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
        self.assign({
          bread_nav_1: '我的账户',
          bread_url_1: '/user',
          userInfo: userInfo
        });
        return Promise.resolve();
      });
    },
    /**
     * 个人资料
     *  GET：
     *  POST：修改
     * @returns {*}
     */
    indexAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      self.assign({
        user_nav_index: 'user_index',
        bread_nav_2: '个人资料'
      });
      if (self.isPost()) {
        var truename = self.post('truename');
        return D('user').updateUserByUserid(user_id, {truename: truename}).then(function (data) {
          if (data) {
            return Promise.resolve()
          } else {
            return Promise.reject()
          }
        }).then(function () {
          self.json({
            code: 1,
            info: '修改成功',
            data: {}
          })
        }, function () {
          self.json({
            code: 500,
            info: '服务器繁忙，请稍后再试',
            data: {}
          })
        })
      } else {
        return D('user').getUserByUserid(user_id).then(function (data) {
          if (isEmpty(data)) {
            self.redirect('/login?ReturnURL=' + escape(baseUrl + self.http.req.url))
          } else {
            data.phone = data.phone.replace(data.phone.substr(3, 5), '*****');
            self.assign('data', data);
            self.display();
          }
        })
      }
    },
    /**
     * 账户安全
     */
    safetyAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      return D('user').getUserByUserid(user_id).then(function (data) {
          if (isEmpty(data)) {
            self.redirect('/login?ReturnURL=' + escape(baseUrl + self.http.req.url))
          } else {
            var pay_pwd = data.pay_pwd ? 1 : 0;
            self.assign({
              pay_pwd: pay_pwd,
              user_nav_index: 'user_safety',
              bread_nav_2: '账户安全'
            });
            self.display();
          }
      })
    },
    /**
     * 账户安全--登录密码
     * step
     *  index:
     *  verify: 获取验证码
     *  reset: 修改密码
     *  success: 修改成功
     * @returns {*}
     */
    pwdAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      self.assign({
        user_nav_index: 'user_safety',
        bread_nav_2: '账户安全'
      });
      var step = self.get('s') || 'index';
      switch (step) {
        default :
        case 'index':
          if (self.isPost()) {
            var verification = self.post('code');
            if (!/^[0-9]+$/.test(verification) || verification.length != 6) {
              self.json({
                code: -1,
                info: '验证码错误',
                data: {}
              })
            } else {
              return D('user').getUserByUserid(user_id).then(function (data) {
                if (isEmpty(data)) {
                  self.json({
                    code: 100,
                    info: '操作已超时，请重新验证',
                    data: {}
                  })
                } else {
                  //关闭失效验证
                  data.verification_time = moment().unix();

                  if (verification == data.verification_code && data.verification_time >= moment().unix() - 600) {
                    var text = [user_id, moment().unix()].join('|');
                    var crypted = self.encrypt(text);
                    self.json({
                      code: 1,
                      info: '',
                      data: {
                        url: '/user/pwd?s=reset&k=' + crypted
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
            }
          } else {
            return self.session('userInfo').then(function (data) {
              if (!isEmpty(data)) {
                return D('user').getUserByUserid(user_id);
              } else {
                return Promise.resolve(data);
              }
            }).then(function (data) {
              if (isEmpty(data)) {
                self.redirect('/login');
              } else {
                self.assign({
                  step: 1,
                  phone: data.phone.replace(data.phone.substr(3, 5), '*****')
                });
                self.display();
              }
            })
          }
          break;
        case 'reset':
          var k = self.get('k');
          var userData = self.checkKey(k);
          if (self.isPost()) {
            if (userData.valid) {
              var password = self.post('password'),
                passwordConfirm = self.post('password_confirm');
              var reg = new RegExp("^.*([\u4E00-\u9FA5])+.*$", "g");
              if (reg.test(password)) {
                self.json({
                  code: -1,
                  info: '密码不符合规则，请重新设置'
                })
              } else if (self.pwdLvl(password) <= 1) {
                self.json({
                  code: -1,
                  info: '密码过于简单，请重新设置'
                })
              } else {
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
                          url: '/user/pwd?s=success&k=' + crypted
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
                step: 2,
                crypted: crypted
              });
              return self.display();
            } else {
              return self.redirect('/login');
            }
          }
          break;
        case 'success':
          var k = self.get('k');
          var data = self.checkKey(k);
          if (data.valid) {
            self.assign({
              step: 3,
              crypted: ''
            });
            return self.display();
          } else {
            return self.redirect('/login');
          }
          break;
      }
    },
    /**
     * 支付密码
     */
    payPwdAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      self.assign({
        user_nav_index: 'user_safety',
        bread_nav_2: '账户安全'
      });
      var step = self.get('s') || 'index';
      switch (step) {
        default :
        case 'index':
          if (self.isPost()) {
            var verification = self.post('code');
            if (!/^[0-9]+$/.test(verification) || verification.length != 6) {
              self.json({
                code: -1,
                info: '验证码错误',
                data: {}
              })
            } else {
              return D('user').getUserByUserid(user_id).then(function (data) {
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
                        url: '/user/payPwd?s=reset&k=' + crypted
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
            }
          } else {
            return self.session('userInfo').then(function (data) {
              if (!isEmpty(data)) {
                return D('user').getUserByUserid(user_id);
              } else {
                return Promise.resolve(data);
              }
            }).then(function (data) {
              if (isEmpty(data)) {
                self.redirect('/login');
              } else {
                self.assign({
                  step: 1,
                  phone: data.phone.replace(data.phone.substr(3, 5), '*****')
                });
                self.display();
              }
            })
          }
          break;
        case 'reset':
          var k = self.get('k');
          var userData = self.checkKey(k);
          if (self.isPost()) {
            if (userData.valid) {
              var password = self.post('password'),
                passwordConfirm = self.post('password_confirm');
              var reg = new RegExp("^.*([\u4E00-\u9FA5])+.*$", "g");
              if (reg.test(password)) {
                self.json({
                  code: -1,
                  info: '密码不符合规则，请重新设置'
                })
              } else if (self.pwdLvl(password) <= 1) {
                self.json({
                  code: -1,
                  info: '密码过于简单，请重新设置'
                })
              } else {
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
                  return D('user').getUserByUserid(user_id).then(function (data) {
                    if (md5(md5(password) + data.random_code) == data.password) {
                      self.json({
                        code: -1,
                        info: '支付密码不能和登录密码相同'
                      })
                    } else {
                      var salt = moment().unix();
                      var md5Password = md5(md5(password) + salt);
                      return D('user').updatePayPwd(userData.user_id, md5Password, salt).then(function (data) {
                        if (data) {
                          var text = [userData.user_id, moment().unix()].join('|');
                          var crypted = self.encrypt(text);
                          self.json({
                            code: 1,
                            info: '修改密码成功',
                            data: {
                              url: '/user/payPwd?s=success&k=' + crypted
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
                    }
                  });
                } else {
                  self.json({
                    code: -1,
                    info: '密码不符合规则，请重新设置',
                    data: {}
                  })
                }
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
                step: 2,
                crypted: crypted
              });
              return self.display();
            } else {
              return self.redirect('/login');
            }
          }
          break;
        case 'success':
          var k = self.get('k');
          var data = self.checkKey(k);
          if (data.valid) {
            self.assign({
              step: 3,
              crypted: ''
            });
            return self.display();
          } else {
            return self.redirect('/login');
          }
          break;
      }
    },
    /**
     * 获取短信验证码
     * @returns {*}
     */
    verifyAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var verification = parseInt(Math.random() * (999999 - 100000) + 100000);
      return D('user').getUserByUserid(user_id).then(function (data) {
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
            });
            return D('user').updateVerificationOnReset(data.user_id, verification);
          }
        }
      }).then(function () {
        var text = [user_id, moment().unix()].join('|');
        var crypted = self.encrypt(text);
        //发送短信验证码
        self.json({
          code: 1,
          info: '验证码已发送',
          data: {}
        });
      }, function () {
        self.json({
          code: 500,
          info: '服务器繁忙，请稍后再试',
          data: {}
        })
      });
    },
    /**
     * 收货信息
     *
     * @returns {*}
     */
    easybuyAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      self.assign({
        user_nav_index: 'user_easybuy',
        bread_nav_2: '收货信息'
      });
      return D('user').getAddressList(user_id).then(function (data) {
        var result = {
          count: data.length,
          data: data
        };
        self.assign('address', result);
        self.display();
      })
    },
    /**
     * 获取单个收货地址
     * @returns {*}
     */
    addressAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var address_id = self.get('address_id');
      return D('user').getAddress(user_id, address_id).then(function (data) {
        if (isEmpty(data)) {
          return Promise.reject({
            code: -1,
            info: '该收货地址不存在',
            data: {}
          })
        } else {
          return Promise.resolve({address: data});
        }
      }).then(function (data) {
        //获取省份列表
        var province = D('user').getProvince();
        //获取所选省份城市
        var city = D('user').getCity(data.address.province);
        var county = D('user').getCounty(data.address.city);
        return Promise.all([province, city, county]).then(function (list) {
          data.province = list[0];
          data.city = list[1];
          data.county = list[2];
          return Promise.resolve(data);
        });
      }).then(function (data) {
        self.assign('data', data);
        return self.fetch();
      }).then(function (content) {
        if (content) {
          return Promise.resolve(content);
        } else {
          return Promise.reject()
        }
      }).then(function (content) {
        self.json({
          code: 1,
          info: '',
          data: {
            content: content
          }
        })
      }).catch(function (e) {
        if (isObject(err)) {
          self.json(err);
        } else {
          self.json({
            code: 500,
            info: '服务器繁忙，请稍后再试',
            data: {}
          })
        }
      })
    },
    /**
     * 增加收货地址
     * @returns {*}
     */
    addAddressAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var postData = self.post();
      var name = postData.name;
      var province = postData.province;
      var city = postData.city;
      var county = postData.county;
      var address = postData.address;
      var phone = postData.phone;
      var alias = postData.alias;
      var errMsg = self.checkPostData(name, province, city, county, address, phone);
      if (isEmpty(errMsg)) {
        return D('user').countAddress(user_id).then(function (data) {
          if (data >= 20) {
            return Promise.reject({
              code: -2,
              info: '地址已到上限',
              data: {}
            });
          } else {
            return Promise.resolve();
          }
        }).then(function () {
          return D('user').addAddress({
            user_id: user_id,
            name: name,
            phone: phone,
            province: province,
            city: city,
            county: county,
            address: address,
            alias: alias,
            status: 1
          });
        }).then(function (data) {
          if (data) {
            return Promise.resolve(data);
          } else {
            return Promise.reject({
              code: 500,
              info: '增加失败',
              data: {}
            });
          }
        }).then(function (address_id) {
          return D('user').getAddressName(province, city, county).then(function (data) {
            return Promise.resolve({data: data, address_id: address_id});
          });
        }).then(function (data) {
          var area = '';
          for (var i = 0; i < data.data.length; i++) {
            area += data.data[i].city_name;
          }
          self.json({
            code: 1,
            info: '增加地址成功',
            data: {
              address_id: data.address_id,
              name: name,
              phone: phone,
              address: address,
              alias: alias,
              area: area
            }
          })
        }, function (err) {
          if (isObject(err)) {
            self.json(err)
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
          info: '参数不正确',
          data: errMsg
        })
      }
    },
    /**
     * 编辑收货地址
     * @returns {*}
     */
    editAddressAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var postData = self.post();
      var address_id = postData.address_id;
      var name = postData.name;
      var province = postData.province;
      var city = postData.city;
      var county = postData.county;
      var address = postData.address;
      var phone = postData.phone;
      var alias = postData.alias;
      var errMsg = self.checkPostData(name, province, city, county, address, phone);
      if (isEmpty(errMsg) && address_id) {
        return D('user').updateAddress(user_id, address_id, {
          name: name,
          phone: phone,
          province: province,
          city: city,
          county: county,
          address: address,
          alias: alias
        }).then(function (data) {
          if (data) {
            return Promise.resolve(data);
          } else {
            return Promise.reject({
              code: -2,
              info: '编辑失败',
              data: {}
            })
          }
        }).then(function (data) {
          self.json({
            code: 1,
            info: '编辑成功',
            data: {}
          }, function (err) {
            if (isObject(err)) {
              self.json(err);
            } else {
              self.json({
                code: 500,
                info: '服务器繁忙，请稍后再试'
              })
            }
          })
        });
      } else {
        self.json({
          code: -1,
          info: '参数不正确',
          data: errMsg
        })
      }
    },
    /**
     * 删除地址
     * @returns {*}
     */
    delAddressAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var address_id = self.post('address_id');
      if (address_id) {
        return D('user').updateAddress(user_id, address_id, {status: 0}).then(function (data) {
          if (data) {
            return Promise.resolve(data);
          } else {
            return Promise.reject({
              code: 500,
              info: '系统繁忙，请稍后再试',
              data: {}
            });
          }
        }).then(function (data) {
          self.json({
            code: 1,
            info: '删除成功',
            data: {}
          })
        }, function (err) {
          if (isObject) {
            self.json(err);
          } else {
            self.json({
              code: 500,
              info: '系统繁忙，请稍后再试',
              data: {}
            })
          }
        })
      } else {
        self.json({
          code: -1,
          info: '参数错误',
          data: {}
        });
      }
    },
    /**
     * 检查表单数据
     * @param name            收货人姓名
     * @param province        省份id
     * @param city            城市id
     * @param county          地区id
     * @param address         详细地址
     * @param phone           收货人手机
     * @returns {*|boolean}
     */
    checkPostData: function (name, province, city, county, address, phone) {
      var self = this;
      var errMsg = self.valid([
        {
          name: 'name',
          value: name,
          valid: ['required'],
          msg: '收货人不能为空'
        },
        {
          name: 'province',
          value: province,
          valid: 'required',
          msg: '省份不能为空'
        },
        {
          name: 'city',
          value: city,
          valid: 'required',
          msg: '城市不能为空'
        },
        {
          name: 'county',
          value: county,
          valid: 'required',
          msg: '地区不能为空'
        },
        {
          name: 'address',
          value: address,
          valid: 'required',
          msg: '地址不能为空'
        },
        {
          name: 'phone',
          value: phone,
          valid: 'mobile',
          msg: '手机号码格式不正确'
        }
      ]);
      return errMsg;
    },
    /**
     * 获取省份列表
     * @returns {*}
     */
    getProvinceAction: function () {
      var self = this;
      return D('user').getProvince().then(function (data) {
        self.json({
          code: 1,
          info: '',
          data: data
        });
      })
    },
    /**
     * 获取城市列表
     * @returns {*}
     */
    getCityAction: function () {
      var self = this;
      var province = self.post('province');
      if (province) {
        return D('user').getCity(province).then(function (data) {
          self.json({
            code: 1,
            info: '',
            data: data
          });
        })
      } else {
        self.json({
          code: -1,
          info: '参数错误',
          data: {}
        })
      }
    },
    /**
     * 获取地区列表
     * @returns {*}
     */
    getCountyAction: function () {
      var self = this;
      var city = self.post('city');
      if (city) {
        return D('user').getCounty(city).then(function (data) {
          self.json({
            code: 1,
            info: '',
            data: data
          });
        })
      } else {
        self.json({
          code: -1,
          info: '参数错误',
          data: {}
        })
      }
    },
    /**
     * 新增发票信息
     * @returns {*}
     */
    addInvoiceAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var invoice_type_id = self.post('itid');
      var invoice_content = self.post('ic');
      var title = self.post('title') || '个人';
      if (!invoice_type_id || !invoice_content) {
        self.json({
          code: 50,
          info: '参数错误',
          data: {}
        })
      } else {
        return D('user').addInvoice({
          user_id: user_id,
          status: 1,
          title: title,
          invoice_type_id: invoice_type_id,
          invoice_content: invoice_content
        }).then(function (data) {
          if (data) {
            self.json({
              code: 1,
              info: '',
              data: {
                iid: data
              }
            })
          } else {
            return Promise.reject();
          }
        }).catch(function () {
          self.json({
            code: 500,
            info: '服务器繁忙，请稍后再试',
            data: {}
          })
        })
      }
    },
    /**
     * 删除发票信息
     * @returns {*}
     */
    delInvoiceAction: function () {
      var self = this;
      var user_id = self.userInfo.user_id;
      var invoice_id = self.get('iid');
      return D('user').delInvoice(user_id, invoice_id).then(function () {
        self.json({
          code: 1,
          info: '',
          data: {}
        })
      }).catch(function () {
        self.json({
          code: 500,
          info: '服务器繁忙，请稍后再试',
          data: {}
        })
      })
    }
  };
})
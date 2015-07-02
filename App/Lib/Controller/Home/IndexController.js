/**
 * controller
 * @return 
 */
module.exports = Controller("Home/BaseController", function(){
  "use strict";
  return {
    init: function (http) {
      var self = this;
      return self.super('init', http);
    },
    indexAction: function(){
      var self = this;
      self.display();
    },
    _404Action:function(){
      //console.log(this.http);
      this.redirect('/');
    },
    newPageAction: function() {
      this.display();
    },
    userInitAction: function () {
      var self = this;
      return self.getUserInfoAction().then(function (userInfo) {
        if (isEmpty(userInfo)) {
          return Promise.reject();
        } else {
          return D('goods').cartCount(userInfo.user_id).then(function (cartCount) {
            userInfo.cartCount = cartCount;
            return Promise.resolve(userInfo);
          })
        }
      }).then(function (userInfo) {
          self.json({
            code: 1,
            info: '',
            data: {
              cartCount: userInfo.cartCount,
              username: userInfo.username
            }
          })
        }).catch(function () {
          self.json({
            code: 0,
            info: '未登录',
            data: {}
          })
        })
    },
    /**
     * 关于我们
     */
    aboutUsAction: function () {
      this.display()
    }
  };
});
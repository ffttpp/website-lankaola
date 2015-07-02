/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/24
 * Time: 下午8:22
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
          self.assign('userInfo', userInfo);
          self.assign({
            bread_nav_1: '我的账户',
            bread_url_1: '/user',
            user_nav_index: 'leaves_list',
            bread_nav_2: '我的桉树叶'
          });
          return Promise.resolve();
        });
    },
    indexAction: function () {
      var self = this;
      self.assign({
        item: 1
      })
      return self.list([1, 2]);
    },
    incomeListAction: function () {
      var self = this;
      self.assign({
        item: 2
      })
      return self.list([1]);
    },
    payListAction: function () {
      var self = this;
      self.assign({
        item: 3
      });
      return self.list([2]);
    },
    list: function (action) {
      var self = this;
      var user_id = self.userInfo.user_id;
      var page = self.get('page') || 1;
      return D('user').leavesCount(user_id).then(function (leaves) {
        return D('user').leavesRecord(user_id, page, action).then(function (record) {
          record.leaves = leaves.count;
          _.each(record.data, function (ele) {
            ele.time = moment.unix(ele.time).format('YYYY-M-DD HH:mm:ss');
          })
          return Promise.resolve(record)
        })
      }).then(function (list) {
          list.url = '/leaves/list?page=${page}';
          self.assign({
            pagerData: list
          })
          self.display('home:leaves:index');
        }).catch(function (e) {
          self.redirect('/');
        })
    }
  }
})
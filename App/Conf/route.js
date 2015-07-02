/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/10/30
 * Time: 下午2:20
 * To change this template use File | Settings | File Templates.
 */
module.exports = [
  ['logout', 'login/logout'],
  ['logstatus', 'login/logstatus'],
  ['findPwd', 'login/findPwd'],
  ['user/address/:address_id', 'user/address'],
  ['aboutus', 'index/aboutUs'],
  ['service/view/:skuid', 'goods/serviceView'],
  ['service', 'goods/service'],
  ['decoration/view/:skuid', 'goods/decorationView'],
  ['decoration', 'goods/decoration'],
  ['plant/view/:skuid', 'goods/plantView'],
  ['plant', 'goods/plant'],
  ['supply', 'goods/supply'],
  ['furniture/view/:skuid', 'goods/furnitureView'],
  ['furniture', 'goods/furniture']
  /*[/^list-([0-9]+)-([0-9]+)-([0-9]+)/, 'list/index?fc=:1&sc=:2&tc=:3' ]*/
];
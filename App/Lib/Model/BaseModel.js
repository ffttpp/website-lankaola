/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/28
 * Time: 下午2:35
 * To change this template use File | Settings | File Templates.
 */

module.exports = Model(function () {
  'use strict';
  return {
    /**
     * 一级分类
     * @returns {*}
     */
    categoryF: function () {
      return D('goods_category').cache(true).where({parent_id: 0}).select();
    },
    /**
     * 二级分类
     * @param fid
     * @returns {*}
     */
    categoryS: function (fid) {
      return D('goods_category').cache(true).where({
        parent_id: ['IN', fid]
      }).select();
    },
    /**
     * 三级分类
     * @param fid
     * @returns {*}
     */
    categoryT: function (fid) {
      return D('goods_category').cache(true).where({
        fid: ['IN', fid]
      }).select();
    }
 }
})
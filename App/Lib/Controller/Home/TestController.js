/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 14/11/21
 * Time: 下午2:23
 * To change this template use File | Settings | File Templates.
 */
module.exports = Controller('Home/BaseController', function () {
    return {
        init: function (http) {
            var self = this;
            self.super('init', http);
        },
        /**
         * 测试支付
         *
         */
        tAction : function(){
            var _self = this;
            //return pay.alipay(11,0.01,'蓝考拉')
            return pay.alipayBank(12,0.01,'蓝考拉',3)
                .then(function(v){
                    console.log('======'+v);
                    _self.end('ok');
                });

        }
    }
})
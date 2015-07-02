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
         * 发送短信验证码
         *
         */
        sendSmsVerifyCodeAction : function(){
            var _self = this;

            //只接受post请求
            if(!_self.isPost()){
                _self.end('ok');
                return;
            }

            //提交至接口手机号码
            var phone = _self.post('p');

            //验证手机号码
            if(!this.valid(phone, 'mobile')){
                _self.end('ok');
                return;
            }

            var code = _.random(100000, 999999);
            var content = util.format(smsTemplate.verifyCode, code);

            return D('User')
                .verifyCode(phone,code)
                .then(function(resolve){
                    //在一个事件循环执行
                    process.nextTick(function() {
                        sms.sendSms(phone, content);
                    });

                    _self.end('ok');
                })
                .catch(function(reject){
                    _self.end('ok');
                });
        }
    }
})
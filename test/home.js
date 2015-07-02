/**    supertest modules*/
var request = require('supertest');
var pay = require('../App/Common/pay');
var _ = require('underscore') ;

var url=[
    'http://127.0.0.1:8360/',
    'http://101.251.107.171:8080/'
];

request = request(url[0]);

/**
 * https://mapi.alipay.com/gateway.do?_input_charset=utf-8&notify_url=http://101.251.107.171:8080/home/pay/alipayNotify&out_trade_no=1&partner=2088611845830017&payment_type=1&return_url=http://101.251.107.171:8080/home/pay/alipayBackUrl&seller_email=zhifubao@mimujiang.com&service=create_direct_pay_by_user&sign=eb0637f96de6fb78d5a89cafa4905630&sign_type=MD5&subject=蓝考拉&total_fee=10
 */
describe('lankaola website api', function(){
    describe('website api', function(){
        /**
         * 用户登陆
         */
        it.skip('post:下发短信验证码接口',function(done){
            request.post('/home/sms/sendSmsVerifyCode')
                .send({"p":"13810708420"})
                .end(function (err, res) {
                    console.dir('服务端返回数据：'+res.text);
                    done();
                });
        });

        /**
         * 模拟下单
         */
        it.skip('post:模拟下单',function(done){
            request.post('/home/test/t')
                .end(function (err, res) {
                    console.dir('服务端返回数据：'+res.text);
                    done();
                });
        });
        /**
         {
            "buyer_email": "hanqingnan831103@gmail.com",
             "buyer_id": "2088012328596727",
             "exterface": "create_direct_pay_by_user",
             "is_success": "T",
             "notify_id": "RqPnCoPT3K9%2Fvwbh3InQ8DThYfcwCwmqUiKoEVb%2FcvI0VgouIz7f93b%2BL4u%2BOq3TmdLp",
             "notify_time": "2014-11-23 11:32:57",
             "notify_type": "trade_status_sync",
             "out_trade_no": "2",
             "payment_type": "1",
             "seller_email": "zhifubao@mimujiang.com",
             "seller_id": "2088611845830017",
             "subject": "蓝考拉",
             "total_fee": "0.01",
             "trade_no": "2014112311750672",
             "trade_status": "TRADE_SUCCESS",
             "sign": "a257251477d7f63aefda0fc1c3971494",
             "sign_type ":"MD5 "
         }
         */
        it('post:模拟支付宝后台通知',function(done){
            var reqData =
            {
                "buyer_email": "hanqingnan831103@gmail.com",
                "buyer_id": "2088012328596727",
                "exterface": "create_direct_pay_by_user",
                "is_success": "T",
                "notify_id": "RqPnCoPT3K9%2Fvwbh3InQ8DThYfcwCwmqUiKoEVb%2FcvI0VgouIz7f93b%2BL4u%2BOq3TmdLp",
                "notify_time": "2014-11-23 11:32:57",
                "notify_type": "trade_status_sync",
                "out_trade_no": "10",
                "payment_type": "1",
                "seller_email": "zhifubao@mimujiang.com",
                "seller_id": "2088611845830017",
                "subject": "蓝考拉",
                "total_fee": "0.01",
                "trade_no": "2014112311750672",
                "trade_status": "TRADE_SUCCESS",
                "sign": "a257251477d7f63aefda0fc1c3971494",
                "sign_type":"MD5 "
            };

            reqData = pay.paraFilter(reqData);//过滤掉空数据项
            var preStr = pay.createLinkString(reqData, true, false); //生成加密串

            var sign  = pay.hashWithMD5([preStr, pay.commonConfig.securityKey ].join(''));

            //生成要请求给支付宝的参数
            reqData = _.extend(reqData, {"sign":sign, "sign_type":pay.commonConfig.signType});

            request.post('/home/pay/alipayNotify')
                .send(reqData)
                .end(function (err, res) {
                    console.dir('服务端返回数据：'+res.text);
                    done();
                });
        });

        /**
         * 模拟搜索
         */
        it.skip('get:模拟搜索',function(done){
            request.get('/search?qs=类')
                .end(function (err, res) {
                    console.dir('服务端返回数据：'+res.text);
                    done();
                });
        });

    })
})

var moment = require('moment');
var _ = require('underscore') ;
var request = require('superagent');
var querystring = require('querystring');
var libxmljs = require("libxmljs");
var crypto = require('crypto');
/**
 * 支付工具
 *
 * 目前仅支持支付宝，网银支付
 *
 * @type {{}}
 */
module.exports = {
    /**
     * 支付通用参数
     */
    commonConfig : {
        "seller_email"          : "",
        "partner"               : "",
        "securityKey"           : "",                                                   //支付宝签名key
        "signType"              : "MD5",                                                 //签名验证加密方式
        "input_charset"         : "utf-8",
        "payment_type"          : 1,
        "alipaygate"            : "https://mapi.alipay.com/gateway.do?",
        "http_verify_url"      : "http://notify.alipay.com/trade/notify_query.do?"    //HTTP形式消息验证地址
    },
    /**
     * 支付宝请求参数
     *
     */
    alipayConfig : {
        "notify_url"            : {
            "order"             : "/pay/alipayNotify",
            "charge"            : "/pay/alipayChargeNotify"
        },
        "back_url"              : {
            "order"             : "/pay/alipayBackUrl",
            "charge"            : "/pay/alipayChargeBackUrl"
        },
        "notify_ok"             : "success",
        "notify_fail"           : "fail",
        "alipay_success_string" : "TRADE_SUCCESS",
        "alipay_finished_string": "TRADE_FINISHED",
        "log_file_name"         : {
            "order"             : "alipay",
            "charge"            : "alipay_charge"
        }
    },
    /**
     * 支付宝网银支付参数
     */
    alipayBankConfig :{
        "notify_url"            : {
            "order"             : "/pay/alipayNotify",
            "charge"            : "/pay/alipayChargeNotify"
        },
        "back_url"              : {
            "order"             : "/pay/alipayBackUrl",
            "charge"            : "/pay/alipayChargeBackUrl"
        },
        "paymethod"             : "bankPay",
        "log_file_name"         : {
            "order"             : "alipayBank",
            "charge"            : "alipayBank_charge"
        }
    },
    /**
     * 支付宝网银支付银行编码
     * 借记卡
     */
    alipayBankCode : [
        'CMB-DEBIT',//纯借记卡   招商银行
        'CCB-DEBIT',//纯借记卡   中国建设银行
        'ICBC-DEBIT',//纯借记卡   中国工商银行
        'COMM-DEBIT',//纯借记卡   交通银行
        'GDB-DEBIT',//纯借记卡   广发银行
        'BOC-DEBIT',//纯借记卡   中国银行
        'CEB-DEBIT',//纯借记卡   光大银行
        'SPDB-DEBIT',//纯借记卡   上海浦东发展银行
        'PSBC-DEBIT',//纯借记卡   中国邮政储蓄银行
        'BJBANK',//纯借记卡   北京银行
        'CMBC',//纯借记卡   中国民生银行
        'BJRCB',//纯借记卡   中国农村商业银行
        'SPA-DEBIT',//纯借记卡   平安银行
        'ABC',//混合  中国农业银行
        'CIB',//混合  兴业银行
        'CITIC'//混合  中信银行
    ],
    /**
     * 过滤json数据中得空值
     * @param jsonData
     */
    paraFilter:function(jsonData){
        var data = _.clone(jsonData);
        //需要过滤的key名称
        var filterKeyArray = new Array();
        filterKeyArray.push('signature');
        filterKeyArray.push('signMethod');
        filterKeyArray.push('sign');
        filterKeyArray.push('sign_type');
        //将JSON数据的key和values分别转换为数组
        var keys = _.keys(data);
        var values = _.values(data);

        for(var i in values){
            if(!values[i]){
                filterKeyArray.push(keys[i]);
            }
        }

        data = _.omit(data, filterKeyArray);

        return data;
    },
    /**
     * 把请求要素按照“参数=参数值”的模式用“&”字符拼接成字符串
     * @param jsonData
     * @param sort         是否需要根据key值作升序排列
     * @param $encode      是否需要URL编码
     */
    createLinkString:function(jsonData, sort, $encode){
        var data = _.clone(jsonData);
        var keys = _.keys(data);
        if(sort=== true){
            keys = this.sortByKey(keys,'asc');
        }
        data = _.pick(data, keys);

        keys = _.keys(data);
        var values = _.values(data);
        var newData = new Array();
        for(var i in keys){
            var value = values[i];
            if($encode=== true){
                //value = encodeURIComponent(value);
                value = _.escape(value);
            }
            newData.push([keys[i],'=',value].join(''));
            if(i < (keys.length-1)){
                newData.push('&');
            }
        }

        return  newData.join('');
    },
    /**
     * 数组排序
     * @param data    数组
     * @param flag    desc or asc
     */
    sortByKey:function(data, flag){
        return data.sort(function(a,b){
            if(flag==='desc'){
                return a<b?1:-1; //从大到小排序
            }else if(flag==='asc'){
                return a>b?1:-1; // 从小到大排序
            }

        });
    },
    /**
     * post 请求数据并返回数据  ，不支持https
     * @param _url
     * @param postData
     * @param contentType
     *
     * @return promise
     */
    post : function(_url, postData, contentType){
        var deferred = getDefer();

        request.post(_url)
            .set('Content-Type', contentType)
            .send(postData)
            .end(function(err, res){
                if(err){
                    deferred.reject(err);
                }else{
                    //成功读取到内容
                    deferred.resolve(res.text);
                }
            });

        return deferred.promise;
    },
    /**
     * get 请求接口     ,不支持https
     * @param _url
     * @return promise
     */
    get :function(_url){
        var deferred = getDefer();

        request.get(_url)
            .end(function(err, res){
                if(err){
                    deferred.reject(err);
                }else{
                    //成功读取到内容
                    deferred.resolve(res.text);
                }
            });

        return deferred.promise;
    },
    /**
     * md5
     * @param data         string
     * @returns {*}
     */
    hashWithMD5 : function (data){
        var buffData = new Buffer(data, 'utf8');
        var hash = crypto.createHash('md5');
        hash.update(buffData);
        var strHashed = hash.digest('hex');
        hash = null;
        return strHashed;
    },
    /**
     * 支付宝
     * @param orderId          订单编号
     * @param amount           支付金额  单位元
     * @param productName      商品名称
     * @return Promise
     *
     */
    alipay : function(orderId, amount, productName, urlCode){
        var _self = this;

        //构造要请求的参数数组
        var parameter = {
            "service"            : "create_direct_pay_by_user",
            "partner"            : _self.commonConfig.partner,
            "payment_type"	     : _self.commonConfig.payment_type,
            "notify_url"	     : [baseUrl, _self.alipayConfig.notify_url[urlCode]].join(''),
            "return_url"	     : [baseUrl,_self.alipayConfig.back_url[urlCode]].join(''),
            "seller_email"	     : _self.commonConfig.seller_email,
            "out_trade_no"	     : orderId,
            "subject"	         : productName,
            "total_fee"	         : amount,
            "_input_charset"	 : _self.commonConfig.input_charset
        };

        /**格式化请求参数*/
        parameter = _self.paraFilter(parameter);//过滤掉空数据项
        var preStr = _self.createLinkString(parameter, true, false); //生成加密串

        var sign  = _self.hashWithMD5([preStr, _self.commonConfig.securityKey ].join(''));

        //生成要请求给支付宝的参数
        parameter = _.extend(parameter, {"sign":sign, "sign_type":_self.commonConfig.signType});

        //打印请求token授权报文日志
        process.nextTick(function(){
            log.write(_self.alipayConfig.log_file_name[urlCode],
                ['orderId:',orderId,'\nalipay Request data:',JSON.stringify(parameter)].join('')
            );
        });

        var deferred = getDefer();

        var url = [
            _self.commonConfig.alipaygate,
            _self.createLinkString(parameter, true, false)
        ].join('');

        deferred.resolve(url);

        return deferred.promise;
    },
    /**
     * 支付宝网银
     * @param orderId             订单号
     * @param amount              订单金额
     * @param productName         商品名称
     * @param defaultbank         银行默认网关    0-15
     */
    alipayBank : function(orderId, amount, productName, defaultbank, urlCode){
        var _self = this;

        //构造要请求的参数数组
        var parameter = {
            "service"           : "create_direct_pay_by_user",
            "partner"           : _self.commonConfig.partner,
            "payment_type"	    : _self.commonConfig.payment_type,
            "notify_url"	    : [baseUrl, _self.alipayBankConfig.notify_url[urlCode]].join(''),
            "return_url"	    : [baseUrl, _self.alipayBankConfig.back_url[urlCode]].join(''),
            "seller_email"	    : _self.commonConfig.seller_email,
            "out_trade_no"	    : orderId,
            "subject"	        : productName,
            "total_fee"	        : amount,
            "paymethod"	        : _self.alipayBankConfig.paymethod,
            "defaultbank"	    : _self.alipayBankCode[defaultbank],
            "_input_charset"	: _self.commonConfig.input_charset
        };
        /**格式化请求参数*/
        parameter = _self.paraFilter(parameter);//过滤掉空数据项
        var preStr = _self.createLinkString(parameter, true, false); //生成加密串

        var sign  = _self.hashWithMD5([preStr, _self.commonConfig.securityKey ].join(''));

        //生成要请求给支付宝的参数
        parameter = _.extend(parameter, {"sign":sign, "sign_type":_self.commonConfig.signType});

        //打印请求token授权报文日志
        process.nextTick(function(){
            log.write(_self.alipayBankConfig.log_file_name[urlCode],
                ['orderId:',orderId,'\nalipayBank Request data:',JSON.stringify(parameter)].join('')
            );
        });

        var deferred = getDefer();

        var url = [
            _self.commonConfig.alipaygate,
            _self.createLinkString(parameter, true, false)
        ].join('');

        deferred.resolve(url);

        return deferred.promise;
    },
    /**
     * 支付宝前台通知验证签名
     *
     * @param data          get请求参数集
     *
     * @return promise
     */
    verifySign : function(data, urlCode){

        var _self = this;
        var deferred = getDefer();

        if(_.isEmpty(data)){//无数据,
            deferred.resolve(false);
        }else{
            //支付宝发送签名
            var alipaySign = data.sign;

            var parameter = _self.paraFilter(data);//过滤掉空数据项
            var preStr = _self.createLinkString(parameter, true, false); //生成加密串

            var sign  = _self.hashWithMD5([preStr, _self.commonConfig.securityKey ].join(''));

            if(alipaySign === sign){
                //签名一致 ，验证notify_id
                var notify_id = data.notify_id;

                var veryfy_url = [_self.commonConfig.http_verify_url, "partner=", _self.commonConfig.partner, "&notify_id=", notify_id].join('');
                _self.get(veryfy_url)
                    .then(function(response){

                        //打印前台通知报文日志
                        process.nextTick(function(){
                            log.write(pay.alipayConfig.log_file_name[urlCode],
                                ['notify_id verify response : \n',response].join('')
                            );
                        });

                        //验证notifyid和isSign
                        var reg = new RegExp("true",'i') ;
                        var reqMatch = response.match(reg);

                        if (!_.isNull(reqMatch)) {
                            deferred.resolve(true);
                        } else {
                            deferred.resolve(false);
                            //deferred.resolve(true);//临时测试
                        }
                    });
            }else{
                deferred.resolve(false);
            }
        }
        return deferred.promise;
    }

}

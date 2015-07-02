/**    supertest modules*/
var request = require('superagent');
var querystring = require('querystring');

/**
 * 短信服务工具
 * @type {{}}
 *
 *
 * 注意调用部分需要自行验证手机号格式
 *
 * 另外需要使用：
 *
    process.nextTick(function() {
        sms.sendSms(mobile, content);
    });
 */
module.exports = {
    /**
     *  短信接口url
     */
    host  : "http://mobile.lankaola.com",
    path  : "/sm.php",
    /**
     * 发送短信
     *
     * @param mobile        手机号码
     * @param content       发送验证码
     */
    sendSms : function(mobile, content){
        var requestData = {
            "m":mobile,
            "c":content
        };
        //request = request(this.host);
        request.post([this.host,this.path].join(''))
            .send(querystring.stringify(requestData))
            .end(function (err, res) {
                if(err){
                    console.error(err)
                }

                //console.log(res)
            });
    }
}
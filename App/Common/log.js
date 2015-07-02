var fs = require('fs');
var util = require('util');
var os = require('os');
var moment = require('moment');
/**
 * 自定义日志模块
 *
 * @type {{}}
 */
module.exports = {
    /**
     * 初始化
     * @return {[type]} [description]
     */
    init : function(logPath){
        //日志存放路径
        this.logPath = logPath;

        //创建日志存放目录
        //console.log(fs.existsSync(this.logPath));
        if(!fs.existsSync(this.logPath)){
            fs.mkdirSync(this.logPath)
        }
    },
    /**
     * 写入日志
     * @param fileName
     * @param msgs
     */
    write: function(fileName, msgs){
        //获得文件名
        var date = moment().format('YYYY-MM-DD');
        var file = [this.logPath, '/', date, '-',fileName , '.log'].join('');

        var dateTime = moment().format('YYYY-MM-DD HH:mm:ss SSS');
        var message = ['[', dateTime, '] : ', msgs, '\n'].join('');
        fs.appendFile(file, message);
    }
}
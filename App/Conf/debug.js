module.exports = {
  //配置项: 配置值
  port: 8360, //监听的端口
  db_type: 'mysql', // 数据库类型
  db_host: '127.0.0.1', // 服务器地址
  db_port: '3307', // 端口
  db_name: 'lkl_db', // 数据库名
  db_user: 'username', // 用户名
  db_pwd: 'password', // 密码
  db_prefix: '', // 数据库表前缀
  url_params_bind: true,
  //页面静态化配置
  html_cache_on: true, //HTML静态缓存
  html_cache_timeout: 3600, //缓存时间，单位为秒
  html_cache_rules: {
    //"home:goods:item": ["item-{sku_id}", 300]
  }, //缓存详细的规则
  html_cache_path: CACHE_PATH + "/html", //缓存目录
  html_cache_file_callback: undefined, //由缓存key生成具体的缓存文件的回调函数
  html_cache_file_suffix: ".html", //缓存文件后缀名,
  session_path: CACHE_PATH + "/session",
  session_timeout: 7200,//session失效时间，单位：秒
  //数据库查询缓存配置
  db_cache_on: true, //是否启用查询缓存，如果关闭那么cache方法则无效
  db_cache_type: "File", //缓存类型，默认为内存缓存
  db_cache_path: CACHE_PATH + "/db", //缓存路径，File类型下有效
  db_cache_timeout: 3600, //缓存时间，默认为1个小时
  nothing:''
};
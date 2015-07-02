/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/12
 * Time: 上午9:58
 * To change this template use File | Settings | File Templates.
 */
$(function () {
  var k = $('#k').val();
  $('#submit1').bind('click', function (e) {
    e.preventDefault();
    var username = $('#username').val();
    if (!username) {
      if ($('#username').parents('.entry').siblings('.tips').length <= 0) {
        $('<p class="tips" style="display: block">请输入用户名或者已验证手机</p>').insertAfter($('#username').parents('.entry'));
      }
    } else {
      $('#username').parents('entry').siblings('.tips').remove();

      $.post('/findPwd/index.action', {username: username}, function (data) {
        if (data.code == 1) {
          window.location.href = data.data.url;
        } else {
          if ($('#username').parents('.entry').siblings('.tips').length <= 0) {
            $('<p class="tips" style="display: block">' + data.info + '</p>').insertAfter($('#username').parents('.entry'));
          }
        }
      }, 'JSON')
    }

  })

  $('#sendCode').bind('click', function (e) {
    e.preventDefault();
    verifyAction($(this), k);
  })

  $('#submit2').bind('click', function (e) {
    e.preventDefault();
    var verification = $('#verification').val();
    if (!/^[0-9]+$/.test(verification) || verification.length != 6) {
      if ($('#verification').siblings('.tips').length <= 0) {
        $('<p class="tips" style="display: block; clear: both;">验证码错误</p>').insertAfter($('#verification'));
      }
    } else {
      $.post('/findPwd/findPwd.action?k=' + k, {verification: verification}, function (data) {
        if (data.code == 1) {
          window.location.href = data.data.url;
        } else {
          if ($('#verification').siblings('.tips').length <= 0) {
            $('<p class="tips" style="display: block; clear: both;">' + data.info + '</p>').insertAfter($('#verification'));
          }
        }
      }, 'JSON')
    }
  })

  $('#submit3').bind('click', function (e) {
    e.preventDefault();
    var password = $('#password').val(),
     password_confirm = $('#password_confirm').val();
    if (password.length < 6 || password.length > 20) {
      $('#password').siblings('.tip').remove();
      $('<p class="tip"><i></i>密码长度只能在6-20位之间</p>').insertAfter($('#password'));
    } else if (!check_pwd_level(password)) {
      $('#password').siblings('.tip').remove();
      $('<p class="tip"><i></i>密码过于简单</p>').insertAfter($('#password'));
    } else if (password != password_confirm) {
      $('#password_confirm').siblings('.tip').remove();
      $('<p class="tip"><i></i>两次密码输入不一致</p>').insertAfter($('#password_confirm'));
    } else {
      $.post('/findPwd/resetPwd.action?k=' + k, {password: password, password_confirm: password_confirm}, function (data) {
        if (data.code == 1) {
          window.location.href = data.data.url;
        } else {
          $('#resetTip').html(data.info).show();
        }
      }, 'JSON');
    }

  })

})

function check_pwd_level(value) {
  var weakPwdArray = ["123456", "123456789", "111111", "5201314", "12345678", "123123", "password", "1314520", "123321", "7758521", "1234567", "5211314", "666666", "520520", "woaini", "520131", "11111111", "888888", "hotmail.com", "112233", "123654", "654321", "1234567890", "a123456", "88888888", "163.com", "000000", "yahoo.com.cn", "sohu.com", "yahoo.cn", "111222tianya", "163.COM", "tom.com", "139.com", "wangyut2", "pp.com", "yahoo.com", "147258369", "123123123", "147258", "987654321", "100200", "zxcvbnm", "123456a", "521521", "7758258", "111222", "110110", "1314521", "11111111", "12345678", "a321654", "111111", "123123", "5201314", "00000000", "q123456", "123123123", "aaaaaa", "a123456789", "qq123456", "11112222", "woaini1314", "a123123", "a111111", "123321", "a5201314", "z123456", "liuchang", "a000000", "1314520", "asd123", "88888888", "1234567890", "7758521", "1234567", "woaini520", "147258369", "123456789a", "woaini123", "q1q1q1q1", "a12345678", "qwe123", "123456q", "121212", "asdasd", "999999", "1111111", "123698745", "137900", "159357", "iloveyou", "222222", "31415926", "123456", "111111", "123456789", "123123", "9958123", "woaini521", "5201314", "18n28n24a5", "abc123", "password", "123qwe", "123456789", "12345678", "11111111", "dearbook", "00000000", "123123123", "1234567890", "88888888", "111111111", "147258369", "987654321", "aaaaaaaa", "1111111111", "66666666", "a123456789", "11223344", "1qaz2wsx", "xiazhili", "789456123", "password", "87654321", "qqqqqqqq", "000000000", "qwertyuiop", "qq123456", "iloveyou", "31415926", "12344321", "0000000000", "asdfghjkl", "1q2w3e4r", "123456abc", "0123456789", "123654789", "12121212", "qazwsxedc", "abcd1234", "12341234", "110110110", "asdasdasd", "123456", "22222222", "123321123", "abc123456", "a12345678", "123456123", "a1234567", "1234qwer", "qwertyui", "123456789a", "qq.com", "369369", "163.com", "ohwe1zvq", "xiekai1121", "19860210", "1984130", "81251310", "502058", "162534", "690929", "601445", "1814325", "as1230", "zz123456", "280213676", "198773", "4861111", "328658", "19890608", "198428", "880126", "6516415", "111213", "195561", "780525", "6586123", "caonima99", "168816", "123654987", "qq776491", "hahabaobao", "198541", "540707", "leqing123", "5403693", "123456", "123456789", "111111", "5201314", "123123", "12345678", "1314520", "123321", "7758521", "1234567", "5211314", "520520", "woaini", "520131", "666666", "RAND#a#8", "hotmail.com", "112233", "123654", "888888", "654321", "1234567890", "a123456"];
  for (var i = 0; i < weakPwdArray.length; i++) {
    if (weakPwdArray[i] == value) {
      return false;
    }
  }
  return true;
}

function verifyAction($send, k) {
  var total = 60;
  $send.unbind('click');
  var count = setInterval(function () {
    total--;
    if (total <= 0) {
      $send.html('重新获取短信验证码')
      clearInterval(count);
      $send.bind('click', function (e) {
        e.preventDefault();
        verifyAction($send, k);
      })
      return;
    }
    $send.html(total + '秒后重新获取');
  }, 1000)
  $.get('/findPwd/verify.action?k=' + k, function (data) {
    if (data.code == 1) {
      //$('#sendCode').html(total + '秒后重新发送');
    } else if (data.code == -3) {
      total = data.data.time;
      $send.html(total + '秒后重新获取');
    } else {
      clearInterval(count);
      $send.html('重新获取短信验证码');
      $send.bind('click', function (e) {
        e.preventDefault();
        verifyAction($send, k);
      })
    }
  }, 'JSON');
}
/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/10/31
 * Time: 下午3:06
 * To change this template use File | Settings | File Templates.
 */

$(function () {
  $('#submit').bind('click', function (e) {
    e.preventDefault();
    $('#register').submit();
  })


  $('#sendCode').bind('click', function (e) {
    e.preventDefault();
    verificationAction($('#phone'), $(this));
  })

  $('input').bind('focus', function () {
    $(this).siblings('.tips').remove();
    $(this).css({border: '1px solid #ccc'});
  })

  $('#username').bind('blur', function (){
    var username = $(this).val();
    if (username.length == 0) {
      addTip($(this), '用户名不能为空')
    }
    else if (username.length < 4 || username.length > 20) {
      addTip($(this), '用户名长度为4-20位之间')
    } else if (/^[0-9]+$/i.test(username)) {
      addTip($(this), '用户名不能是纯数字');
    } else if (!/^[a-z0-9_\-]+$/i.test(username)) {
      addTip($(this), '用户名只能由英文、数字及"-"、"_"');
    }
  })

  $('#password').bind('blur', function () {
    var password = $(this).val();
    if (password.length == 0) {
      addTip($(this), '密码不能为空');
    } else if (password.length < 6 || password.length > 20) {
      addTip($(this), '密码长度只能在6-20位字符之间')
    } else if (!check_pwd_level(password)) {
      addTip($(this), '密码过于简单');
    }
  })

  $('#password_confirm').bind('blur', function () {
    if ($(this).val() != $('#password').val()) {
      addTip($(this), '请确认密码');
    }
  })

  $('#phone').bind('blur', function () {
    if (!/^(13|15|18|14|17)\d{9}$/.test($(this).val())) {
      addTip($(this), '手机号格式有误，请输入正确手机号')
    }
  })
  $('#verification').bind('blur', function () {
    var verification = $(this).val();
    if (verification.length !=6 || !/^[0-9]+$/.test(verification)) {
      addTip($(this), '验证码错误');
    }
  })

  var validator = new FormValidator($('#register').get(0), [
    {
      name: 'username',
      rules: 'required|min_length[4]|max_length[20]|callback_check_numeric_username|alpha_dash',
      messages: '用户用不能为空|用户名不能少于4位|用户名不能超过20位|用户名不能是纯数字|用户名只能由英文、数字及"-"、"_"'
    },
    {
      name: 'password',
      rules: 'required|min_length[6]|max_length[20]|callback_check_pwd_level',
      messages: '密码不能为空|密码长度只能在6-20位字符之间|密码长度只能在6-20位字符之间|密码过于简单'
    },
    {
      name: 'password_confirm',
      rules: 'required|matches[password]',
      messages: '请确认密码|请确认密码'
    },
    {
      name: 'phone',
      rules: 'required|valid_phone',
      messages: '请输入验证手机号|手机号格式有误，请输入正确手机号'
    },
    {
      name: 'verification',
      rules: 'required|min_length[6]|max_length[6]',
      messages: '请输入短信验证码|短信验证码已过期或者不正确|短信验证码已过期或者不正确'
    },
    {
      name: 'protocol',
      rules: 'required',
      messages: '请接受用户协议'
    }
  ], function (errors, e) {
    if (errors.length > 0) {
      for (var i = 0; i < errors.length; i++) {
        var error = errors[i];
        $(error.element).css({border: '1px solid red'});
        $(error.element).siblings('.tips').remove();
        $('<span class="tips">' + error.message + '</span>').insertAfter($(error.element));
      }
    } else {
      e.preventDefault();
      $.post('/register?ReturnUrl=' + $('#return_url').val(), {
        username: $('#username').val(),
        phone: $('#phone').val(),
        verification: $('#verification').val(),
        password: $('#password').val(),
        password_confirm: $('#password_confirm').val()
      }, function (data) {
        if (data.code == 1) {
          var retData = data.data;
          var returnUrl = retData.returnUrl;
          window.location.href = returnUrl;
        } else if (data.code == -1) {
          addTip($('#phone'), data.info);
        } else if (data.code == -2) {
          addTip($('#username'), data.info);
        } else if (data.code == -3){
          addTip($('#verification'), data.info);
        } else {
          addTip($('#verification'), data.info);
        }
      })
    }
  });

  validator.registerCallback('check_numeric_username', function (value) {
    var numericRegex = /^[0-9]+$/;
    return !numericRegex.test(value);
  })

  validator.registerCallback('check_password', function (value) {
    var reg = /^[0-9a-z_!@#$%^&*()~+|]{6,20}$/i;
    return reg.test(value);
  });

  validator.registerCallback('check_pwd_level', function (value) {
    return check_pwd_level(value);
  })

  $('#protocol a').bind('click', function (e) {
    e.preventDefault();
    $('.thickbox').show()
    $('.thickdiv').show()
  })

  $('.thickclose').bind('click', function (e) {
    e.preventDefault();
    $('.thickbox').hide()
    $('.thickdiv').hide()
  })
})

function check_pwd_level(value){
  var weakPwdArray = ["123456", "123456789", "111111", "5201314", "12345678", "123123", "password", "1314520", "123321", "7758521", "1234567", "5211314", "666666", "520520", "woaini", "520131", "11111111", "888888", "hotmail.com", "112233", "123654", "654321", "1234567890", "a123456", "88888888", "163.com", "000000", "yahoo.com.cn", "sohu.com", "yahoo.cn", "111222tianya", "163.COM", "tom.com", "139.com", "wangyut2", "pp.com", "yahoo.com", "147258369", "123123123", "147258", "987654321", "100200", "zxcvbnm", "123456a", "521521", "7758258", "111222", "110110", "1314521", "11111111", "12345678", "a321654", "111111", "123123", "5201314", "00000000", "q123456", "123123123", "aaaaaa", "a123456789", "qq123456", "11112222", "woaini1314", "a123123", "a111111", "123321", "a5201314", "z123456", "liuchang", "a000000", "1314520", "asd123", "88888888", "1234567890", "7758521", "1234567", "woaini520", "147258369", "123456789a", "woaini123", "q1q1q1q1", "a12345678", "qwe123", "123456q", "121212", "asdasd", "999999", "1111111", "123698745", "137900", "159357", "iloveyou", "222222", "31415926", "123456", "111111", "123456789", "123123", "9958123", "woaini521", "5201314", "18n28n24a5", "abc123", "password", "123qwe", "123456789", "12345678", "11111111", "dearbook", "00000000", "123123123", "1234567890", "88888888", "111111111", "147258369", "987654321", "aaaaaaaa", "1111111111", "66666666", "a123456789", "11223344", "1qaz2wsx", "xiazhili", "789456123", "password", "87654321", "qqqqqqqq", "000000000", "qwertyuiop", "qq123456", "iloveyou", "31415926", "12344321", "0000000000", "asdfghjkl", "1q2w3e4r", "123456abc", "0123456789", "123654789", "12121212", "qazwsxedc", "abcd1234", "12341234", "110110110", "asdasdasd", "123456", "22222222", "123321123", "abc123456", "a12345678", "123456123", "a1234567", "1234qwer", "qwertyui", "123456789a", "qq.com", "369369", "163.com", "ohwe1zvq", "xiekai1121", "19860210", "1984130", "81251310", "502058", "162534", "690929", "601445", "1814325", "as1230", "zz123456", "280213676", "198773", "4861111", "328658", "19890608", "198428", "880126", "6516415", "111213", "195561", "780525", "6586123", "caonima99", "168816", "123654987", "qq776491", "hahabaobao", "198541", "540707", "leqing123", "5403693", "123456", "123456789", "111111", "5201314", "123123", "12345678", "1314520", "123321", "7758521", "1234567", "5211314", "520520", "woaini", "520131", "666666", "RAND#a#8", "hotmail.com", "112233", "123654", "888888", "654321", "1234567890", "a123456"];
  for (var i = 0; i < weakPwdArray.length; i++) {
    if (weakPwdArray[i] == value) {
      return false;
    }
  }
  return true;
}

function pwdLevel(value) {
  var pattern_1 = /^.*([\W_])+.*$/i;
  var pattern_2 = /^.*([a-zA-Z])+.*$/i;
  var pattern_3 = /^.*([0-9])+.*$/i;
  var level = 0;
  if (value.length > 10) {
    level++;
  }
  if (pattern_1.test(value)) {
    level++;
  }
  if (pattern_2.test(value)) {
    level++;
  }
  if (pattern_3.test(value)) {
    level++;
  }
  if (level > 3) {
    level = 3;
  }
  return level;
}

function addTip($ele, message){
  $ele.css({border: '1px solid red'});
  $ele.siblings('.tips').remove();
  $('<span class="tips">' + message + '</span>').insertAfter($ele);
}

function verificationAction($phone, $send){
  var phone = $('#phone').val();
  var total = 60;
  if (!/^(13|15|18|14|17)\d{9}$/.test(phone)) {
    $('#phone').css({border: '1px solid red'}).siblings('.tips').remove();
    $('<span class="tips">请输入正确的手机号码</span>').insertAfter($('#phone'));
  } else {
    $send.unbind('click');
    var count = setInterval(function () {
      total--;
      if (total <= 0) {
        $send.html('重新发送')
        clearInterval(count);
        $send.bind('click', function (e) {
          e.preventDefault();
          verificationAction($phone, $send);
        });
        return;
      }
      $send.html(total + '秒后重新获取');
    }, 1000)
    $.post('/register/verify', {phone: phone}, function (data) {
      if (data.code == 1) {
        //$('#sendCode').html(total + '秒后重新发送');
      } else if (data.code == -3) {
        total = data.data.time;
        $send.html(total + '秒后重新获取');
        $phone.css({border: '1px solid red'}).siblings('.tips').remove();
        $('<span class="tips">' + data.info + '</span>').insertAfter($phone);
      } else {
        clearInterval(count);
        $send.html('获取验证码');
        $send.bind('click', function (e) {
          e.preventDefault();
          verificationAction($phone, $send);
        })
        $phone.css({border: '1px solid red'}).siblings('.tips').remove();
        $('<span class="tips">' + data.info + '</span>').insertAfter($phone);
      }
    }, 'JSON');
  }



}
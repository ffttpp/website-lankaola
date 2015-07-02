/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/17
 * Time: 下午1:32
 * To change this template use File | Settings | File Templates.
 */

$(function () {
  $('#send_code').bind('click', function (e) {
    e.preventDefault();
    sendCode();
  })

  $('input').bind('focus', function () {
    $(this).next('.tip').hide();
  })

  $('#code').bind('blur', function (e) {
    var code = $(this).val();
    if (!/^[0-9]+$/.test(code) || code.length != 6) {
      $('#code').next('.tip').css('display', 'inline-block');
    } else {
      $('#code').next('.tip').hide();
    }
  })

  $('#submit1').bind('click', function (e) {
    e.preventDefault();
    var code = $('#code').val();
    if (!/^[0-9]+$/.test(code) || code.length != 6) {
      $('#code').next('.tip').css('display', 'inline-block');
    } else {
      $.post('/user/safety', {code: code}, function (data) {
        if (data.code == 1) {
          window.location.href = data.data.url;
        } else {
          $('#code').next('.tip').html(data.info).css('display', 'inline-block');
        }
      }, 'JSON')
    }
  })

  $('#password').bind('blur', function (e) {
    var password = $(this).val();
    if (password.length == 0) {
      $('#password').next('.tip').css('display', 'inline-block')
    }
    else if (password.length < 6 || password.length > 20) {
      $('#password').next('.tip').html('密码长度只能在6-20位之间').css('display', 'inline-block');
    }
    else if (!check_pwd_lvl(password)) {
      $('#password').next('.tip').html('密码过于简单').css('display', 'inline-block');
    } else {
      $('#password').next('.tip').hide();
    }
  })

  $('#password_confirm').bind('blur', function (e) {
    if ($(this).val() != $('#password').val()) {
      $('#password_confirm').next('.tip').html('密码不一致').css('display', 'inline-block');
    } else {
      $('#password_confirm').next('.tip').hide();
    }
  })

  $('#submit2').bind('click', function (e) {
    e.preventDefault();
    var password = $('#password').val();
    var password_confirm = $('#password_confirm').val();
    if (password.length == 0) {
      $('#password').next('.tip').css('display', 'inline-block')
    } else if (!check_pwd_lvl(password)) {
      $('#password').next('.tip').html('密码过于简单').css('display', 'inline-block');
    } else if (password != password_confirm) {
      $('#password_confirm').next('.tip').html('密码不一致').css('display', 'inline-block');
    } else {
      $.post('/user/safety?s=reset&k=' + $('#hash').val(), {
        password: password,
        password_confirm: password_confirm
      }, function (data) {
        if (data.code == 1) {
          window.location.href = data.data.url;
        } else {
          $('#password').next('.tip').html(data.info).css('display', 'inline-block');
        }
      })
    }
  })

})

function sendCode() {
  $('#send_code').unbind('click');
  $.post('/user/safety?s=verify', {}, function (data) {
    var time = 60;
    if (data.code == 1) {
      $('#code_tip').html('验证码已发出，请注意查收短信，如果没有收到，你可以在<b class="icson_red">' + time + '</b>秒后要求系统重新发送').show();
      sendInterVal(time);
    } else if (data.code == -3) {
      $('#code_tip').html('验证码已发出，请注意查收短信，如果没有收到，你可以在<b class="icson_red">' + data.data.time + '</b>秒后要求系统重新发送').show();
      sendInterVal(data.data.time);
    } else {
      $('#code_tip').html(data.info);
    }
  }, 'JSON')
}

function sendInterVal(time) {
  clearTimeout();
  var interVal = setTimeout(function () {
    $('#code_tip').html('验证码已发出，请注意查收短信，如果没有收到，你可以在<b class="icson_red">' + time + '</b>秒后要求系统重新发送').show();
    time--;
    if (time < 0) {
      clearTimeout(interVal);
      $('#send_code').unbind('click').bind('click', function (e) {
        e.preventDefault();
        sendCode();
      })
    } else {
      sendInterVal(time);
    }
  }, 1000)
}
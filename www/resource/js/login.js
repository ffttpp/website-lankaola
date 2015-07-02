/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/5
 * Time: 下午2:54
 * To change this template use File | Settings | File Templates.
 */

$(function(){
  $('#submit').bind('click', function(e) {
    e.preventDefault();
    $('#login').submit();
  })
  $('input').bind('focus', function(){
    $(this).css({border: '1px solid #ccc'});
    $(this).siblings('span').remove()
  })

  $(window).keypress(function (e) {
    if (e.keyCode == 13) {
      $('#submit').trigger('click');
    }
  });

  var validator = new FormValidator($('#login').get(0), [
    {
      name: 'username',
      rules: 'required|min_length[4]|max_length[20]|callback_check_numeric_username|alpha_dash',
      messages: '请输入用户名|用户名错误|用户名错误|用户名错误|用户名错误'
    },
    {
      name: 'password',
      rules: 'required|min_length[6]|max_length[20]',
      messages: '请输入密码|密码错误|密码错误'
    }
  ], function(errors, e){
    if(errors.length > 0) {
      $('.tips').show();
    } else {
      e.preventDefault();
      $.post('/login?ReturnUrl='+$('#returnUrl').val(), {
        username: $('#username').val(),
        password: $('#password').val()
      }, function(data){
        if (data.code == 1) {
          window.location.href = unescape(data.data.returnUrl);
        } else {
          $('.tips').show();
        }
      }, 'JSON')
    }
  });
  validator.registerCallback('check_numeric_username', function(value) {
    var numericRegex = /^[0-9]+$/;
    return !numericRegex.test(value);
  })
})
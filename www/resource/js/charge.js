/**
 *
 * USER: chenlingguang
 * TIME: 15/1/26 下午3:33
 */
$(function () {
  $('input[name=pay_type]').bind('change', function () {
    if ($(this).val() == 2) {
      $('#alipayBankList').show();
    } else {
      $('#alipayBankList').hide();
    }
  });

  //在线充值
  $('#charge_submit1').bind('click', function (e) {
    e.preventDefault();
    var pay_type, bank;
    var cash = $('#cash').val();
    if (!cash || !/((^0)|(^[1-9](\d)*))((\.\d)\d?)?$/.test(cash) || cash < 0.01) {
      showTips('充值金额数值必须为整数或小数，小数点后不超过2位。');
      return;
    }
    $('input[name=pay_type]').each(function () {
      if ($(this).is(':checked')) {
        pay_type = $(this).val();
      }
    });
    $('input[name=alipayBank]').each(function () {
      if ($(this).is(':checked')) {
        bank = $(this).val();
      }
    });
    $.post('/cash/charge', {
      ctype: 2,
      ptype: pay_type,
      bank: bank,
      cash: cash
    }, function (data) {
      if (data.code == 1) {
        window.location.href = data.data.url;
      } else {
        showTips(data.info);
      }
    }, 'JSON')
  });

  //卡充值
  $('#charge_submit2').bind('click', function (e) {
    e.preventDefault();
    var serial = $('#serial').val();
    var password = $('#password').val();
    if (serial.length != 15 || password.length != 16) {
      showTips('卡号或者密码错误');
      return;
    }
    $.post('/cash/charge', {
      ctype: 3,
      serial: serial,
      password: password
    }, function (data) {
      showTips(data.info)
      if (data.code == 1) {
        $('#serial, #password').val('');
      }
    }, 'JSON')
  });
});
/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/24
 * Time: 下午5:20
 * To change this template use File | Settings | File Templates.
 */
$(function () {
  eventInit();
})

function eventInit() {
  $.getJSON('/order/cancelReason', function (data) {
    if (data.code == 1) {
      var html = '';
      for (var i = 0; i < data.data.length; i++) {
        html += '<li><input onclick="changeReason('+data.data[i].cancel_id+', \''+data.data[i].cancel+'\')" class="radio" type="radio" name="cancelReason" value="'+data.data[i].cancel_id+'">'+data.data[i].cancel+'</li>'
      }
    }
    $('#reasonList').html(html);
  })

  $('.quxk-inner').bind('click', function (e) {
    e.preventDefault();
    $('.yylist').show();
  })

  $('.closeBtn, #cancelCancel').bind('click', function (e) {
    e.preventDefault();
    $('.modal-backdrop, .rl-modal').hide();
  })

  $('#submitCancel').bind('click', function (e) {
    e.preventDefault();
    var order_id = $('#cancelOrderid').val();
    var cancel_id = $('#cancelReason').val();
    if (!order_id){
      $('.modal-backdrop, .rl-modal').hide();
    } else if (!cancel_id || cancel_id == 0) {
      alert('请选择取消原因');
    } else {
      $.getJSON('/order/cancelOrder?orderid=' + order_id + '&cancelid=' + cancel_id, function (data) {
        $('.modal-backdrop, .rl-modal').hide();
        showTips(data.info, function () {
          window.location.reload();
        });
      })
    }
  })

  $('#timeList').bind('click', function (e) {
    var $ul = $(this).find('ul')
    var isShow = $ul.is(':visible');
    if (isShow) {
      $ul.hide();
    } else {
      $ul.show();
    }
  })
}

function changeReason(cancel_id, cancel) {
  $('.yylist').hide();
  $('.ctnarea').html(cancel);
  $('#cancelReason').val(cancel_id);
}

function cancelOrder(order_id) {
  $('.cancelOrder, .modal-backdrop').show();
  $('#cancelOrderid').val(order_id);
  $('#cancelReason').val(0);
}
/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/12/1
 * Time: 下午2:36
 * To change this template use File | Settings | File Templates.
 */
$(function () {
  $('#cartCheckAll').bind('click', function (e) {
    var checked = $(this).attr('checked');
    if (checked) {
      $('.cartItem').attr('checked', 'checked');
    } else {
      $('.cartItem').attr('checked', false);
    }
    recount2();
  })
  $('.cartItem').each(function (index) {
    $(this).bind('click', function () {
      var checked = $(this).attr('checked');
      if (checked) {
        if ($('.cartItem').length == $('.cartItem:checked').length) {
          $('#cartCheckAll').attr('checked', 'checked');
        }
      } else {
        $('#cartCheckAll').attr('checked', false);
      }
      recount2();
    })
  })

  $('.btn-reduce').bind('click', function (e) {
    e.preventDefault();
    var $input = $(this).siblings('.input').find('input');
    var pcount = parseInt($input.val());
    var $tr = $(this).parents('tr');
    var id = $tr.attr('id');
    var cid = $tr.find('.cartItem').val();
    if (pcount > 1) {
      $input.val(--pcount);
      changeCartNum(cid, pcount);
    } else {
      showConfirm('确定从购物车删除此商品？', 'delCartItem(' + cid + ', \'' + id + '\')', 'hideConfirm()')
    }
  });
  $('.btn-add').bind('click', function (e) {
    e.preventDefault();
    var $input = $(this).siblings('.input').find('input');
    var pcount = parseInt($input.val());
    $input.val(++pcount);
    changeCartNum($(this).parents('tr').find('.cartItem').val(), pcount);
  })
  $('.cartInput').keypress(function (e) {
    if (e.keyCode < 47 || e.keyCode > 57) {
      e.preventDefault();
    }
  }).keyup(function () {
      var pcount = $(this).val() || 1;
      $(this).val(pcount);
      changeCartNum($(this).parents('tr').find('.cartItem').val(), pcount);
    }).blur(function () {
      var pcount = $(this).val() || 1;
      $(this).val(pcount);
      changeCartNum($(this).parents('tr').find('.cartItem').val(), pcount);
    });

  $('.del').bind('click', function (e) {
    e.preventDefault();
    var $tr = $(this).parents('tr');
    var id = $tr.attr('id');
    var cid = $tr.find('.cartItem').val();
    showConfirm('确定从购物车删除此商品？', 'delCartItem(' + cid + ', \'#' + id + '\')', 'hideConfirm()')
  })

  $('#remove-batch').bind('click', function (e) {
    e.preventDefault();
    showConfirm('确认清空购物车？', 'cleanCart()', 'hideConfirm()');
  })

  $('#submitCart').bind('click', function (e) {
    e.preventDefault();
    var cid = [], omitCid = [-1];
    $('.cartItem').each(function () {
      if ($(this).attr('checked')) {
        cid.push($(this).val());
      } else {
        omitCid.push($(this).val())
      }
    })
    if (cid.length == 0) {
      showTips('请至少选择一样商品');
    } else {
      $.getJSON('/cart/omitCart', {cid: omitCid.join('|')}, function (data) {
        if (data.code == 1) {
          window.location.href = '/order/orderInfo';
        } else {
          showTips('系统繁忙，请重新提交');
        }
      })
    }
  })

})

function cleanCart() {
  var cid = [];
  $('.cartItem').each(function () {
    cid.push($(this).val());
    recount($(this).val(), 0);
  })
  cid = cid.join('|');
  delCartItem(cid, '.cart-tr');
}

function delCartItem(cid, id) {
  recount(cid, 0);
  $.post('/cart/changeNum', {cid: cid}, function (data) {
    hideConfirm();
    if (data.code == 1) {
      window.location.reload();
    } else {
      showTips(data.info, function () {
        window.location.reload();
      })
    }
  }, 'JSON')
}

function changeCartNum(cid, pcount) {
  pcount = pcount || 1;
  recount(cid, pcount);
  $.post('/cart/changeNum', {cid: cid, pcount: pcount}, function (data) {
  }, 'JSON')
}

function recount(cid, pcount) {
  cart[cid].count = parseInt(pcount) || 0;
  var total = 0;
  var count = 0;
  for (var i in cart) {
    count += cart[i].count;
    total += cart[i].count * cart[i].price;
  }
  $('#selectedCount').text(count);
  $('#totalSkuPrice, #finalPrice').text('￥' + total.toFixed(2));
}

function recount2() {
  var cid = [];
  $('.cartItem:checked').each(function () {
    cid.push($(this).val());
  })
  var count = 0;
  var total = 0;
  for (var i in cart) {
    if (cid.indexOf(i) >= 0) {
      count += cart[i].count;
      total += cart[i].count * cart[i].price;
    }
  }
  $('#selectedCount').text(count);
  $('#totalSkuPrice, #finalPrice').text('￥' + total.toFixed(2));
}

function hideConfirm() {
  $('#pop').remove();
  $('#popBg').remove();
}
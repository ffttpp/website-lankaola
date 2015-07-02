/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/29
 * Time: 下午3:51
 * To change this template use File | Settings | File Templates.
 */
$(function(){
  var liHeight = 106;
  var $spec = $('#spec-items-list')
  $('#spec-forward').bind('click', function (e) {
    e.preventDefault();
    var marginTop = -parseInt($spec.css('marginTop')) || 0;
    var curIndex = Math.round(marginTop/liHeight);
    if (curIndex > 0) {
      $spec.stop().animate({marginTop: liHeight - marginTop}, 300);
    }
  })
  $('#spec-backward').bind('click', function (e) {
    e.preventDefault();
    var marginTop = -parseInt($spec.css('marginTop')) || 0;
    var curIndex = Math.round(marginTop/liHeight);
    if (curIndex < $spec.find('li').length - 3) {
      $spec.stop().animate({marginTop: -marginTop - liHeight}, 300);
    }
  })
  $spec.find('li').hover(function() {
    $(this).addClass('cur').siblings().removeClass('cur');
    $('#spec-n1').html('<img src="'+$(this).children('img').attr('data-url')+'" jqimg="'+$(this).children('img').attr('data-jqimg')+'">');
  })

  $("#spec-n1").jqueryzoom({
    xzoom: 400,
    yzoom: 400,
    xOffset: 10,
    yOffset: 0
  });

  var $addCart = $('#addCart');

  $('#btn-reduce').bind('click', function (e) {
    e.preventDefault();
    var pcount = parseInt($('#buy-num').val());
    if (pcount > 1) {
      $('#buy-num').val(--pcount);
      changePcount($addCart, pcount);
    }
  })
  $('#btn-add').bind('click', function (e) {
    e.preventDefault();
    var pcount = parseInt($('#buy-num').val());
    $('#buy-num').val(++pcount);
    changePcount($addCart, pcount);
  })
  $('#buy-num').keypress(function (e) {
    if (e.keyCode < 47 || e.keyCode > 57) {
      e.preventDefault();
    }
  }).keyup(function () {
      var pcount = $(this).val() || 1;
      $(this).val(pcount);
      changePcount($addCart, pcount);
    }).blur(function () {
      var pcount = $(this).val() || 1;
      $(this).val(pcount);
      changePcount($addCart, pcount);
    });

  $('.sku_attr a').bind('click', function (e) {
    e.preventDefault();
    $(this).parents('.sku_attr').find('a').removeClass('cur');
    $(this).addClass('cur');
    var checked = [];
    $('.sku_attr').each(function (index) {
      checked[index] = $(this).find('a.cur').attr('attr_id');
    })
    var key = checked.join('_');
    window.location.href = '/item-' + sku[key] + '.html';
    //        window.open('/item-' + sku[key] + '.html');
  })

  if ($(window).scrollTop() > 360) {
    $('#gotoTop').show()
  }

  $(window).scroll(function () {
    if($(this).scrollTop() > 360){
      $('#gotoTop').show()
    }else{
      $('#gotoTop').hide()
    }
  })

  $('#gotoTop').bind('click', function (e) {
    e.preventDefault();
    $('body, html').animate({scrollTop: 0}, 500)
  })
})

function changePcount($btn, pcount){
  var url = $btn.attr('href');
  var newUrl = setUrlParam('pcount', parseInt(pcount) || 1, url);
  $btn.attr('href', newUrl);

}
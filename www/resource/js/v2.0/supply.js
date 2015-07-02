/**
 * Created by chenlingguang on 15/1/4.
 */

$(function () {
  pageInit();
  eventInit();
});

function pageInit() {
  $('.lazy').lazyload();
  $('#section1').slide({
    mainCell: '.bd ul',
    effect: 'leftLoop',
    autoPlay: true,
    autoPage: true,
    vis: 5,
    prevCell: '#prev',
    nextCell: '#next',
    interTime: 5000
  })
}

function eventInit() {

//搜索
  $("#search input").keypress(function (e) {
    if (e.which == 13) {
      //查询关键字
      var queryString = $(this).val();
      if (queryString)
        goSearch(queryString);
      return false;
    }
  });
  $("#search a").click(function () {
    //查询关键字
    var queryString = $("#search input").val();
    if (queryString)
      goSearch(queryString);

    return false;
  });

  $('#tab_area ul a').bind('click', function (e) {
    e.preventDefault();
    var fid = $(this).attr('fid') || 0;
    $(this).parent('li').addClass('sel').siblings('li').removeClass('sel');
    $('#more').attr('href', ['/list-1-', fid, '-0.html'].join(''));
    $.get('/supply?sid=' + fid, function (data) {
      if (data.code === 0) {
        showTips('系统繁忙，请稍后再试');
      } else {
        if (!!data.smallItem) {
          var html = '';
          for (var i = 0; i < data.smallItem.length; i++) {
            var small = data.smallItem[i];
            var title = [small.brand_name, small.goods_name, small.skuName].join(' ');
            html += '<li>\
            <div class="item">\
            <a class="item_cover" target="_blank" href="/item-' + small.sku_id + '.html"><img width="160" height="160" src="' + (small.img.img_160 ? ('http://img.lankaola.com/goods' + small.img.img_160) : 'http://img.lankaola.com/images/lazyload.png') + '"  alt="' + title + '" title="' + title + '" /> </a>\
            <div class="item_info">\
            <p class="item_price">￥' + parseFloat(small.price).toFixed(2) + '</p>\
            <p class="item_name"><a target="_blank" href="/item-' + small.sku_id + '.html"> ' + title + '</a></p>\
            </div>\
            <a class="addCart" target="_blank" href="/cart/add?pid=' + small.sku_id + '&pcount=1"></a>\
            </div>\
            <div class="item_hover_border"></div>\
            </li>';
            if (i == 2 || i == 10) {
              var j = parseInt(i / 6);
              var title2 = [data.bigItem[j].brand_name, data.bigItem[j].goods_name, data.bigItem[j].skuName].join(' ');
              html += '<li class="big_item' + (j ? '' : ' right') + '">\
                            <div class="item">\
                            <a class="item_cover" target="_blank" href="/item-' + data.bigItem[j].sku_id + '.html"><img width="350" height="350" src="' + (data.bigItem[j].img.img_350 ? ('http://img.lankaola.com/goods' + data.bigItem[j].img.img_350) : 'http://img.lankaola.com/images/lazyload.png') + '" alt="' + title2 + '" title="' + title2 + '" /> </a>\
                            <div class="item_info">\
                            <p class="item_price">￥' + parseFloat(data.bigItem[j].price).toFixed(2) + '</p>\
                            <p class="item_name"><a target="_blank" href="/item-' + data.bigItem[j].sku_id + '.html">' + title2 + '</a></p>\
                           </div>\
                           <a class="addCart" target="_blank" href="/cart/add?pid=' + data.bigItem[j].sku_id + '&pcount=1"></a>\
                           </div>\
                           <div class="item_hover_border"></div>\
                           </li>';
            }
          }
          $('#product_list').html(html);
        } else {
          var html = '';
          for(var i = 0; i < data.data.length; i++) {
            var item = data.data[i];
            var title = [item.brand_name, item.goods_name, item.skuName].join(' ');
            var className = '';
            var img = '<img width="160" height="160" src="' + (item.img_220 ? ('http://img.lankaola.com/goods' + item.img_220.replace('/n4/', '/n5/')) : 'http://img.lankaola.com/images/lazyload.png') + '"  alt="' + title + '" title="' + title + '" />';
            if (i == 3) className = 'big_item right';
            if (i == 12) className = 'big_item';
            if (i == 3 || i == 12) {
              img = '<img width="350" height="350" src="' + (item.img_220 ? ('http://img.lankaola.com/goods' + item.img_220.replace('/n4/', '/n1/')) : 'http://img.lankaola.com/images/lazyload.png') + '"  alt="' + title + '" title="' + title + '" />'
            }
            html += '<li' + (className ? [' class="', className, '"'].join('') : '') + '>\
            <div class="item">\
            <a class="item_cover" target="_blank" href="/item-' + item.sku_id + '.html">' + img + ' </a>\
            <div class="item_info">\
            <p class="item_price">￥' + parseFloat(item.price).toFixed(2) + '</p>\
            <p class="item_name"><a target="_blank" href="/item-' + item.sku_id + '.html"> ' + title + '</a></p>\
            </div>\
            <a class="addCart" target="_blank" href="/cart/add?pid=' + item.sku_id + '&pcount=1"></a>\
            </div>\
            <div class="item_hover_border"></div>\
            </li>';
          }
          $('#product_list').html(html);
        }
      }
    }, 'JSON')
  });

  function goSearch(queryString) {
    location.href = ['/search?qs=', queryString].join('');
  }
}
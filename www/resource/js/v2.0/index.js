/**
 * Created by chenlingguang on 14/12/23.
 */

var ratio = 1;
var clientWidth = document.documentElement.clientWidth;
clientWidth = clientWidth > 1200 ? clientWidth : 1200;
var clientHeight = document.documentElement.clientHeight;
var supplyInfo = [{
    width: 418,
    height: 203,
    left1: 334,
    top1: -203,
    left2: 334,
    top2: 0
  },
  {
    width: 299,
    height: 167,
    left1: 840,
    top1: -167,
    left2: 850,
    top2: 0
  },
  {
    width: 253,
    height: 235,
    left1: 430,
    top1: 588,
    left2: 446,
    top2: 353
  },
  {
    width: 396,
    height: 178,
    left1: 1127,
    top1: 588,
    left2: 1091,
    top2: 410
  },
  {
    width: 271,
    height: 322,
    left1: 1728,
    top1: 588,
    left2: 1455,
    top2: 180
  },
  {
    width: 514,
    height: 300,
    left1: 1422,
    top1: -300,
    left2: 1242,
    top2: 0
  }
];

$(function () {
  pageInit();
  eventInit();
});


function pageInit() {
  resizeProduct();
  $('#product').show();
  supplyInit();
  supplyScroll();
  icScroll();
}

function eventInit() {

  $('.service-item-icon').hover(function () {
    $(this).find('img').stop(true, true).animate({top: '-110px'}, 200);
  }, function () {
    $(this).find('img').stop(true, true).animate({top: '0'}, 200);
  });
  $('#ic-btn').hover(function () {
    $(this).children('.ic-btn-text').animate({left: '-15px'}, 200);
    $(this).children('.ic-btn-arrow').animate({opacity: 1, right: '25px'}, 200);
  }, function () {
    $(this).children('.ic-btn-text').animate({left: '0'}, 200);
    $(this).children('.ic-btn-arrow').animate({opacity: 0, right: '45px'}, 200);
  });
  $('.product-small').hover(function () {
    var height = $(this).height();
    var $that = $(this);
    var $span = $('.product-intro-text');
    $span.css('marginTop', height);
    $that.find('.product-intro-small').stop(true, true).animate({height: height}, 300, function () {
      $span.stop(true, true).animate({marginTop: 0}, 500)
    });
    $that.find('.product-intro-title').stop(true, true).animate({lineHeight: 80 * ratio + 'px', height: 80 * ratio}, 300);
    $that.find('.product-toggle').css('backgroundPosition', '-204px -13px');
  }, function () {
    $(this).find('.product-intro-small').stop(true, true).animate({height: 55 * ratio}, 300);
    $(this).find('.product-intro-title').stop(true, true).animate({lineHeight: 55 * ratio + 'px', height: 55 * ratio}, 300);
    $(this).find('.product-toggle').css('backgroundPosition', '-161px -13px');
  });
  $('.product-btn').hover(function () {
    $(this).find('.product-btn-text').stop(true, true).animate({left: -(15 * ratio) + 'px'}, 200);
    $(this).find('.product-btn-arrow').stop(true, true).animate({right: 15 * ratio, opacity: 1}, 200)
  }, function () {
    $(this).find('.product-btn-text').stop(true, true).animate({left: 0}, 200);
    $(this).find('.product-btn-arrow').stop(true, true).animate({right: 35 * ratio, opacity: 0}, 200)
  });

  $(window).resize(function () {
    clientWidth = document.documentElement.clientWidth;
    clientHeight = document.documentElement.clientHeight;
    clientWidth = clientWidth > 1200 ? clientWidth : 1200;
    resizeProduct();
  });
  $(window).scroll(function () {
    supplyScroll();
    icScroll();
  });
}

function resizeProduct() {
  window.ratio = window.clientWidth / 1920;
  var ratio = window.ratio;
  var minLineHeight = 18;
  var minFontSize = 12;
  var lineHeight24 = (30 * ratio > minLineHeight ? 30 * ratio : minLineHeight) + 'px';
  var fontSize14 = (14 * ratio > minFontSize ? 14 * ratio : minFontSize) + 'px';
  var fontSize16 = (16 * ratio > 14 ? 16 * ratio : 14) + 'px';
  var itemWidth = clientWidth / 4;
  var itemHeight = 370 * ratio;
  $('#product').css({width: clientWidth, height: itemHeight * 2});
  $('.product-big').css({width: itemWidth * 3, height: itemHeight});
  $('.product-small').css({width: itemWidth, height: itemHeight});
  $('.product-img-big').css({width: itemWidth * 2, height: itemHeight});
  $('.product-intro-big').css({width: itemWidth, height: itemHeight});
  $('.product-intro-big h3').css({lineHeight: 70 * ratio + 'px', fontSize: 28 * ratio + 'px', paddingTop: 20 * ratio});
  $('.product-intro-big p').css({lineHeight: lineHeight24, fontSize: fontSize14});
  $('.product-intro-big p:first-letter').css({fontSize: 24 * ratio + 'px'});
  $('.product-btn-area').css({marginTop: 90 * ratio});
  $('.product-btn').css({width: 130 * ratio, height: 38 * ratio, lineHeight: 38 * ratio + 'px', fontSize: fontSize14});
  $('.product-btn-arrow').css({width: 19 * ratio, height: 38 * ratio, lineHeight: 38 * ratio + 'px', right: 35 * ratio});
  $('.product-arrow').css({width: 13 * ratio, height: 26 * ratio, marginTop: -(13 * ratio)});

  $('.product-img-small').css({width: itemWidth, height: itemHeight});
  $('.product-intro-small').css({width: itemWidth, height: 55 * ratio});
  $('.product-intro-title').css({height: 55 * ratio, lineHeight: 55 * ratio + 'px', fontSize: fontSize16});
  $('.product-intro-text').css({lineHeight: lineHeight24, fontSize: fontSize14});
  $('.product-btn2').css({fontSize: fontSize14, lineHeight: 50 * ratio + 'px'});
  $('.product-toggle').css({'-webkit-transform': 'scale(' + ratio + ')'});

  $('#line3').css({left: itemWidth - 1});
  $('#line4').css({left: 2 * itemWidth - 1});
  $('#line5').css({left: 3 * itemWidth + 1});
}

function supplyInit() {
  $('.supply-item').each(function (index) {
    $(this).css({
      width: supplyInfo[index].width,
      height: supplyInfo[index].height,
      left: supplyInfo[index].left1,
      top: supplyInfo[index].top1
    });
  });
  $('#supply-item').show();
}

function supplyScroll() {
  var supplyTop = $('#supply-item').offset().top;
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  if (scrollTop >= supplyTop - clientHeight) {
    $('.supply-item').each(function (index) {
      var scrollRatio = (scrollTop - supplyTop + clientHeight - 100) / 588;
      scrollRatio = scrollRatio > 1 ? 1 : scrollRatio;
      $(this).css({
        left: (supplyInfo[index].left2 - supplyInfo[index].left1) * scrollRatio + supplyInfo[index].left1,
        top: (supplyInfo[index].top2 - supplyInfo[index].top1) * scrollRatio + supplyInfo[index].top1
      })
    });
    var scrollTitleRatio = (scrollTop - supplyTop + clientHeight - 200) / 200;
    scrollTitleRatio = scrollTitleRatio > 1 ? 1 : scrollTitleRatio;
    if (parseInt($('#supply-title').css('marginTop')) < 0) {
      $('#supply-title').css({
        marginTop: 300 * (scrollTitleRatio - 1),
        opacity: scrollTitleRatio
      });
    }
    var scrollTextRatio = (scrollTop - supplyTop + clientHeight - 300) / 400;
    scrollTextRatio = scrollTextRatio > 1 ? 1 : scrollTextRatio;
    if (parseInt($('#supply-text').css('marginTop')) > 0) {
      $('#supply-text').css({
        marginTop: 400 * (1 - scrollTextRatio),
        opacity: scrollTextRatio
      });
    }
  }
/*
  $('#supply-text p').each(function (pIndex) {
    var scrollTextRatio = (scrollTop - supplyTop + clientHeight - 300) / (400 * (1 + pIndex/10));
    scrollTextRatio = scrollTextRatio > 1 ? 1 : scrollTextRatio;
    $(this).css({
      top: 400 * (scrollTextRatio - 1)
    });
  })
  */
}

function icScroll() {
  var icTop = $('#ic-left').offset().top;
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  if (scrollTop + clientHeight - $('#ic-left').height() / 1.5 > icTop) {
    $('#ic-logo').fadeIn(300);
    $('#ic-animate1').animate({
      width: 126,
      height: 126,
      left: 167,
      top: 167
    },504, 'linear');
    $('#ic-animate2').animate({
      width: 152,
      height: 152,
      left: 154,
      top: 154
    },608, 'linear');
    $('#ic-animate3').animate({
      width: 178,
      height: 178,
      left: 141,
      top: 141
    },712, 'linear');
    $('#ic-animate5').animate({
      width: 258,
      height: 258,
      left: 101,
      top: 101
    },1032, 'linear');
    $('#ic-animate4').delay(1032).animate({
      width: 278,
      height: 278,
      left: 91,
      top: 91
    }, 200, 'linear');
    $('#ic-animate6').delay(1232).fadeIn(300);
  }
}

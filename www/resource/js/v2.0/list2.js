/**
 * Created by chenlingguang on 14/12/29.
 */
var mcs = {top: 0};
$(function () {
  pageInit();
  eventInit();
});

function pageInit() {
  $('.block_group').each(function (index) {
    if (index % 2 == 0) {
      $(this).find('.left').css('overflow', 'hidden');
    } else {
      $(this).find('.right').css('overflow', 'hidden');
    }
  });

  reset_blocks();
  check_blocks_overview();
}

function eventInit() {
  $(window).scroll(function () {
    mcs.top = $(this).scrollTop();
    check_blocks_overview();
  });
  $('.view_block').hover(function () {
    $(this).find('.view_text').clearQueue().stop().animate({
      left: '-15px'
    }, 200);
    $(this).find('.view_more').clearQueue().stop().animate({
      opacity: 1,
      right: 20
    }, 200);
  }, function () {
    $(this).find('.view_text').clearQueue().stop().animate({
      left: 0
    }, 200);
    $(this).find('.view_more').clearQueue().stop().animate({
      opacity: 0,
      right: 35
    }, 200);
  })
}

function reset_blocks() {
  $('.block_group .left .separator').css('margin-right', 540 + ($(window).width() - 1200) / 2);
  $('.block_group .right .separator').css('margin-left', 540 + ($(window).width() - 1200) / 2);
  //$(".block_group h2, .block_group .block_intro, .block_group .view_block").css("opacity", "0");
  $(".block_group .double_separator").css({
    width: 0
  })
}

function check_blocks_overview() {
  $('.block_group').each(function (block_id) {
    var $that = $(this);
    if (mcs.top + $(window).height() - $that.height() / 1.5 > $that.position().top) {
      $that.addClass('visible');
      $that.find('.pic img').addClass('show');
      if ($that.find('.separator').parents().hasClass('left')) {
        $that.find('.separator').clearQueue().stop().delay(100).animate({
          marginRight: '-45px'
        }, 800, "easeOutExpo");
      } else {
        $that.find('.separator').clearQueue().stop().delay(100).animate({
          marginLeft: '-45px'
        }, 800, "easeOutExpo");
      }
      $that.find('.title').clearQueue().stop().delay(100).fadeTo(600, 1, "easeOutQuart");
      $that.find('.block_intro').clearQueue().stop().delay(500).animate({
        opacity: 1
      }, 600, 'easeOutExpo');
      $that.find('.view_block').addClass('rotated');
      $that.find('.double_separator').clearQueue().stop().delay(820).animate({
        width: 365
      }, 800, 'easeInOutExpo');
    }
  })
}
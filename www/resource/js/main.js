jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};


$(function() {
	/*
	$(window).bind("mousewheel", function(e, delta) {
		var mousewheelX = parseInt($(window).height()/3);
		mousewheelX = (mousewheelX<200 || mousewheelX>350)?200:mousewheelX;
		//mousewheelX = 250;
		if(delta > 0) {
			mousewheelX = -mousewheelX;
		}
		$('html,body').stop().animate({scrollTop: $(window).scrollTop()+mousewheelX}, 700);
		return false;
	});
*/
  var focusBar = $(window).width() > 1200 ? $(window).width() : 1200
  $('#focusBar').css({width: $(window).width() > 1200 ? $(window).width() : 1200})
  $('#focusBar ul').css({width: focusBar})
  $('#focusBar li').css({width: focusBar})

  $('#focusBar').slide({
    mainCell: '.bd ul',
    effect: 'leftLoop',
    autoPlay: true,
    interTime: 5000,
    delayTime: 500
  })

  $(window).resize(function () {
    var focusBar = $(window).width() > 1200 ? $(window).width() : 1200
    $('#focusBar').css({width: focusBar})
  })

  $('.cnav-item').each(function (index) {
    $(this).bind('mouseover', function () {
      $(this).addClass('cnav-item-selected').siblings('.cnav-item').removeClass('cnav-item-selected').find('.arrow').hide();
      $(this).find('.arrow').css({display: 'inline-block'});
      $('.clist ul').hide().eq(index).show();
    })
  })


  /*------focus-------*/
  $("#focusBar").hover(
    function () {
      $("#focusBar .arrL").stop(false,true);
      $("#focusBar .arrR").stop(false,true);
      $("#focusBar .arrL").animate({ left: 0}, { duration: 500 });
      $("#focusBar .arrR").animate({ right: 0}, { duration: 500 });
    }, function () {
      $("#focusBar .arrL").stop(false,true);
      $("#focusBar .arrR").stop(false,true);
      $("#focusBar .arrL").animate({ left: -60}, { duration: 500 });
      $("#focusBar .arrR").animate({ right: -60}, { duration: 500 });
    }
  );
	/**
	$("#focusIndex1").show();
	$("#focusBar li").css("width",$(window).width());
	$("a.arrL").mouseover(function(){stopFocusAm();}).mouseout(function(){starFocustAm();});
	$("a.arrR").mouseover(function(){stopFocusAm();}).mouseout(function(){starFocustAm();});
	$("#focusBar li").mouseover(function(){stopFocusAm();}).mouseout(function(){starFocustAm();});
	starFocustAm();
   **/
  if ($(window).scrollTop() > 160) {
    $(".nav").addClass("fixednav");
  }
	$(window).scroll(function(){
		if($(this).scrollTop() > 160){
			$(".nav").addClass("fixednav");
		}else{
			$(".nav").removeClass("fixednav");
		}
	});
});


var timerFID;

function nextPage() {
	changeFocus(true);
}
function prePage() {
	changeFocus(false);
}

var currentFocusI=1;
var changeingFocus = false;
function changeFocus(dir) {
	if($("#focusBar li").length <= 1) return;
	if(changeingFocus) return;
	changeingFocus = true;
	
	$("#focusIndex"+nextI).stop(false,true);
	$("#focusIndex"+nextI+" .focusL").stop(false,true);
	$("#focusIndex"+nextI+" .focusR").stop(false,true);
	
	var nextI = dir?currentFocusI+1:currentFocusI-1;
	nextI = nextI>$("#focusBar li").length?1:(nextI<1?$("#focusBar li").length:nextI);
	//var focusWidth = $(window).width()>1000?1000:$(window).width();
	$("#focusIndex"+currentFocusI).css("width",$(window).width());
	$("#focusIndex"+nextI).css("width",$(window).width());
	if(dir) {
		$("#focusIndex"+nextI).css("left",$(window).width());
		$("#focusIndex"+nextI+" .focusL").css("left",$(window).width()/2);
		$("#focusIndex"+nextI+" .focusR").css("left",$(window).width()/2);
		$("#focusIndex"+currentFocusI).show();
		$("#focusIndex"+nextI).show();
		
		$("#focusIndex"+currentFocusI+" .focusL").animate({left: -($(window).width()/2+1000)},300,'easeInExpo');
		$("#focusIndex"+currentFocusI+" .focusR").animate({left: -($(window).width()/2+1000)},500,'easeInExpo',function(){
				$("#focusIndex"+nextI+" .focusL").animate({left: -500},1000,'easeInOutCirc');
				$("#focusIndex"+nextI+" .focusR").animate({left: -500},1200,'easeInOutCirc');
				
				$("#focusIndex"+currentFocusI).animate({left: -$(window).width()},1000,'easeOutExpo');
				$("#focusIndex"+nextI).animate({left: 0},1000,'easeOutExpo',function(){
						$("#focusIndex"+currentFocusI).hide();
						currentFocusI = nextI;
						changeingFocus = false;
				});
		});
	} else {
		$("#focusIndex"+nextI).css("left",-$(window).width());
		$("#focusIndex"+nextI+" .focusL").css("left",-($(window).width()/2+1000));
		$("#focusIndex"+nextI+" .focusR").css("left",-($(window).width()/2+1000));
		$("#focusIndex"+currentFocusI).show();
		$("#focusIndex"+nextI).show();
		
		$("#focusIndex"+currentFocusI+" .focusR").animate({left: $(window).width()/2},300,'easeInExpo');
		$("#focusIndex"+currentFocusI+" .focusL").animate({left: $(window).width()/2},500,'easeInExpo',function(){
				$("#focusIndex"+nextI+" .focusL").animate({left: -500},1200,'easeInOutCirc');
				$("#focusIndex"+nextI+" .focusR").animate({left: -500},1000,'easeInOutCirc');
				
				$("#focusIndex"+currentFocusI).animate({left: $(window).width()},1000,'easeOutExpo');
				$("#focusIndex"+nextI).animate({left: 0},1000,'easeOutExpo',function(){
						$("#focusIndex"+currentFocusI).hide();
						currentFocusI = nextI;
						changeingFocus = false;
				});
		});
	}
}
function starFocustAm(){
	timerFID = setInterval("timer_tickF()",12000);
}
function stopFocusAm(){
	clearInterval(timerFID);
}
function timer_tickF() {
	changeFocus(true);
}



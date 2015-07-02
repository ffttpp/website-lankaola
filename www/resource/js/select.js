$('.select-box').bind('click', function (e) {
    var $this = $(this);
    var isReadonly = $this.hasClass('select-box-readonly');
    if (isReadonly){
        return false;
    }
    $('.select-box').css('zIndex', '2200');
    $this.css('zIndex', '2300');
    var mdClass = $this.attr('class').match(/select-md\d{2}/);
    var $thisSub = $this.find('ul');
    if ($thisSub.is(':visible')) {
        $thisSub.hide();
        $this.removeClass(mdClass + '-cur');
    } else {
        $('.select-box ul').hide();
        $thisSub.show();
        $this.addClass(mdClass + '-cur');
    }
    return false;
});

$('.select-box ul li').bind('click', function() {
   
	var text = $(this).html();
	var rText = $.trim( $(this).text() );
	var selectconf = $(this).children();
	var val = $(this).attr('val');
	$(this).parent().siblings('span').html(text).attr('title', rText);
	$(this).parent().siblings('.searchVal').val(val);
	var classN = $(this).closest('.select-box').attr('class');
	var re = /\s*select-md\d{2}-cur/g;
	var newClass = classN.replace(re, "");
	$(this).closest('.select-box').attr('class', newClass);
	if (selectconf.hasClass('select-confcolor')) {
		var textcolor = $(this).find('.colorconfkey').text();
		$(this).parent().siblings('span').html(text).attr('title', textcolor)
	}
});
$(document).click(function() {
	$('.select-box>ul').hide();
	var obj = $('.select-box');
	var len = obj.length;
	var classN;
	var newClass;
	var re = /\s*select-md\d{2}-cur/g;
	for (var i = 0; i < len; i++) {
		classN = obj.eq(i).attr('class');
		newClass = classN.replace(re, "");
		obj.eq(i).attr('class', newClass)
	}
});// JavaScript Document
/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/12
 * Time: 下午7:34
 * To change this template use File | Settings | File Templates.
 */
function showTips(message) {
  $('#pop').remove();
  var pop = '<div id="pop" class="rl-modal dialog sureDialog" style="display:block;">\
      <div class="bg"></div>\
      <div class="inner">\
      <div class="rtitle"><h3 class="dlgT">提示</h3><a href="javascript:;" class="closeBtn"></a></div>\
        <div class="m">\
          <p class="">' + message + '</p>\
          <div class="mt20 btncenter"><a class="btn btn_small btn_blue">确定</a></div>\
        </div>\
      </div>\
    </div>';
  $('body').append(pop);
  if ($('#popBg').length <= 0) {
    $('body').append('<div class="modal-backdrop" id="popBg" style="display:block;"></div>');
  }

  var action = '';
  if (arguments.length > 1 && typeof arguments[1] == 'function') {
    action = arguments[1];
  }

  $('#pop .btn').unbind('click').bind('click', function () {
    $('#pop').hide();
    $('#popBg').hide()
    if (action) {
      action();
    }
  })
  $('#pop .closeBtn').bind('click', function () {
    $('#pop').hide();
    $('#popBg').hide()
  })
  $('#pop').show();
  $('#popBg').show();
}

function showConfirm(message, confirm, cancel) {
  $('#pop').remove();
  var pop = '<div id="pop" class="rl-modal dialog gdsDel" style="display:block;">\
  <div class="bg"></div>\
  <div class="inner">\
    <div class="rtitle"><h3 class="dlgT">提示</h3><a href="javascript:;" class="closeBtn" onclick="' + cancel + '"></a></div>\
    <div class="m">\
      <p class="dlgtip ml40"><i></i>' + message + '</p>\
      <div class="mt10 btncenter"><a class="btn btn_small btn_blue mr15" onclick="' + confirm + '">确定</a><a class="btn btn_small btn_gray" onclick="' + cancel + '">取消</a></div>\
    </div>\
  </div>\
</div>'
  $('body').append(pop);
  if ($('#popBg').length <= 0) {
    $('body').append('<div class="modal-backdrop" id="popBg" style="display:block;"></div>');
  }
  $('#pop').show();
  $('#popBg').show();
}

function toPayment(order_id) {
  $.getJSON('/order/success?order_id=' + order_id, function (data) {
    if (data.code == 1) {
      window.location.href = data.data.url;
    } else {
      showTips(data.data.info);
    }
  })
}

function isEmpty(a) {
  return null == a || "" == a || "undefined" == a || void 0 == a || "null" == a ? !0 : (a = (a + "").replace(/\s/g, ""), "" == a ? !0 : !1)
}
function is_forbid(a) {
  a = a.replace(/(^\s*)|(\s*$)/g, ""), a = a.replace("*", "@"), a = a.replace("--", "@"), a = a.replace("/", "@"), a = a.replace("+", "@"), a = a.replace("'", "@"), a = a.replace("\\", "@"), a = a.replace("$", "@"), a = a.replace("^", "@"), a = a.replace(".", "@"), a = a.replace(";", "@"), a = a.replace("<", "@"), a = a.replace(">", "@"), a = a.replace('"', "@"), a = a.replace("=", "@"), a = a.replace("{", "@"), a = a.replace("}", "@");
  var b = new String("@,%,~,&"), c = new Array;
  for (c = b.split(","), i = 0; i < c.length; i++)if (-1 != a.search(new RegExp(c[i])))return !1;
  return !0
}

function check_pwd_lvl(value) {
  var weakPwdArray = ["123456", "123456789", "111111", "5201314", "12345678", "123123", "password", "1314520", "123321", "7758521", "1234567", "5211314", "666666", "520520", "woaini", "520131", "11111111", "888888", "hotmail.com", "112233", "123654", "654321", "1234567890", "a123456", "88888888", "163.com", "000000", "yahoo.com.cn", "sohu.com", "yahoo.cn", "111222tianya", "163.COM", "tom.com", "139.com", "wangyut2", "pp.com", "yahoo.com", "147258369", "123123123", "147258", "987654321", "100200", "zxcvbnm", "123456a", "521521", "7758258", "111222", "110110", "1314521", "11111111", "12345678", "a321654", "111111", "123123", "5201314", "00000000", "q123456", "123123123", "aaaaaa", "a123456789", "qq123456", "11112222", "woaini1314", "a123123", "a111111", "123321", "a5201314", "z123456", "liuchang", "a000000", "1314520", "asd123", "88888888", "1234567890", "7758521", "1234567", "woaini520", "147258369", "123456789a", "woaini123", "q1q1q1q1", "a12345678", "qwe123", "123456q", "121212", "asdasd", "999999", "1111111", "123698745", "137900", "159357", "iloveyou", "222222", "31415926", "123456", "111111", "123456789", "123123", "9958123", "woaini521", "5201314", "18n28n24a5", "abc123", "password", "123qwe", "123456789", "12345678", "11111111", "dearbook", "00000000", "123123123", "1234567890", "88888888", "111111111", "147258369", "987654321", "aaaaaaaa", "1111111111", "66666666", "a123456789", "11223344", "1qaz2wsx", "xiazhili", "789456123", "password", "87654321", "qqqqqqqq", "000000000", "qwertyuiop", "qq123456", "iloveyou", "31415926", "12344321", "0000000000", "asdfghjkl", "1q2w3e4r", "123456abc", "0123456789", "123654789", "12121212", "qazwsxedc", "abcd1234", "12341234", "110110110", "asdasdasd", "123456", "22222222", "123321123", "abc123456", "a12345678", "123456123", "a1234567", "1234qwer", "qwertyui", "123456789a", "qq.com", "369369", "163.com", "ohwe1zvq", "xiekai1121", "19860210", "1984130", "81251310", "502058", "162534", "690929", "601445", "1814325", "as1230", "zz123456", "280213676", "198773", "4861111", "328658", "19890608", "198428", "880126", "6516415", "111213", "195561", "780525", "6586123", "caonima99", "168816", "123654987", "qq776491", "hahabaobao", "198541", "540707", "leqing123", "5403693", "123456", "123456789", "111111", "5201314", "123123", "12345678", "1314520", "123321", "7758521", "1234567", "5211314", "520520", "woaini", "520131", "666666", "RAND#a#8", "hotmail.com", "112233", "123654", "888888", "654321", "1234567890", "a123456"];
  for (var i = 0; i < weakPwdArray.length; i++) {
    if (weakPwdArray[i] == value) {
      return false;
    }
  }
  return true;
}

function pwdLevel(value) {
  var pattern_1 = /^.*([\W_])+.*$/i;
  var pattern_2 = /^.*([a-zA-Z])+.*$/i;
  var pattern_3 = /^.*([0-9])+.*$/i;
  var level = 0;
  if (value.length > 10) {
    level++;
  }
  if (pattern_1.test(value)) {
    level++;
  }
  if (pattern_2.test(value)) {
    level++;
  }
  if (pattern_3.test(value)) {
    level++;
  }
  if (level > 3) {
    level = 3;
  }
  return level;
}

if (!Array.indexOf) {
  Array.prototype.indexOf = function (obj) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == obj) {
        return i;
      }
    }
    return -1;
  }
}

function setUrlParam(para_name, para_value, url) {
  var strNewUrl = '';
  var strUrl = url;
  if (strUrl.indexOf("?") != -1) {
    strUrl = strUrl.substr(strUrl.indexOf('?') + 1);
    if (strUrl.toLowerCase().indexOf(para_name.toLowerCase()) == -1) {
      strNewUrl = url + '&' + para_name + '=' + para_value;
    } else {
      var aParam = strUrl.split('&');
      for (var i = 0; i < aParam.length; i++) {
        if (aParam[i].substr(0, aParam[i].indexOf('=')).toLowerCase() == para_name.toLowerCase()) {
          aParam[i] = aParam[i].substr(0, aParam[i].indexOf('=')) + '=' + para_value;
        }
      }

      strNewUrl = url.substr(0, url.indexOf('?') + 1) + aParam.join('&');
    }
    return strNewUrl;
  } else {
    strUrl += '?' + para_name + '=' + para_value;
    return strUrl
  }
}

$(function () {
  if ($(window).scrollTop() > 160) {
    $(".nav").addClass("fixednav");
  }
  $(window).scroll(function () {
    if ($(this).scrollTop() > 160) {
      $(".nav").addClass("fixednav");
    } else {
      $(".nav").removeClass("fixednav");
    }
  });

  $('#username').hover(function () {
    $(this).css('cursor', 'pointer');
    $(this).find('ul').stop().slideDown();
  }, function () {
    $(this).find('ul').stop().slideUp();
  });

  var navA = $("#nav-ul a");
  var navcurA = $("#nav-ul a.cur");
  var hdCur = $(".nav-cur");
  var choose;
  var timer = null;
  navA.bind('mouseover',
    function () {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (hdCur.is(":hidden")) {
        hdCur.show();
      }
      choose = $(this);
      changeJD(choose, navA, hdCur);
    });
  navA.bind('mouseout',
    function (event) {
      choose = $(this);
      if (!choose.hasClass('cur')) {
        if (navcurA.length > 0) {
          timer = setTimeout(function () {
              changeJD(navcurA, navA, hdCur);
              timer = null;
            },
            500);
        } else {
          timer = setTimeout(function () {
              hdCur.css({
                width: 0,
                left: 0
              });
              hdCur.hide();
              timer = null;
            },
            500);
        }
      }
      event.stopPropagation();
    });
  if (navcurA.length > 0) {
    changeJD(navcurA, navA, hdCur, true);
  }

  $.getJSON('/index/userInit', function (data) {
    if (data.code == 1) {
      data.data.cartCount > 0 && $('#goto-cart .red-dot').show();
    }
  });



//搜索
  $(".search-input").keypress(function (e) {
    if (e.which == 13) {
      //查询关键字
      var queryString = $(this).val();
      if (queryString)
        goSearch(queryString);
      return false;
    }
  });
  $("#search").click(function () {
    //查询关键字
    var queryString = $(".search-input").val();
    if (queryString)
      goSearch(queryString);

    return false;
  });
});

function changeJD(choose, navA, hdbz, isFirst) {
  var curW = choose.width();
  var index = navA.index(choose);
  var left = 0;
  for (var i = 0; i < index; i++) {
    left += navA.eq(i).parents('li').outerWidth(true);
  }
  left += 15;
  hdbz.css('width', curW);
  isFirst ? hdbz.css('left', left + "px") : miaovStartMove(hdbz.get(0), {
      left: left
    },
    MIAOV_MOVE_TYPE.BUFFER);
}

function goSearch(queryString) {
  location.href = ['/search?qs=', queryString].join('');
}

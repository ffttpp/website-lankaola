/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/13
 * Time: 上午10:06
 * To change this template use File | Settings | File Templates.
 */


var addAddressHtml = '<div class="thickdiv"></div>\
  <div class="thickbox">\
  <div class="thickwrap">\
    <div class="thicktitle"><span>添加收货地址</span></div>\
    <div class="thickcon">\
    <div id="addressDiagDiv">\
        <div class="m" id="edit-cont">\
          <div class="mc">\
            <div class="form">\
              <div class="item">\
                <span class="label"><em>*</em>收货人：</span>\
                <div class="fl">\
                  <input id="consigneeName" type="text" class="text" onblur="checkConsigneeName()">\
                    <span id="consigneeNameNote" class="error-msg hide"></span>\
                  </div>\
                  <div class="clr"></div>\
                </div>\
                <div class="item">\
                  <span class="label"><em>*</em>所在地区：</span>\
                  <div class="fl">\
                    <select id="provinceDiv" class="sele" onchange="loadCity()"><option value="0">请选择</option></select>\
                    <select id="cityDiv" class="sele" onchange="loadCounty()"><option value="0">请选择</option></select>\
                    <select id="countyDiv" class="sele" onchange="loadTown()"><option value="0">请选择</option></select>\
                    <span class="error-msg hide" id="areaNote">请您填写完整的地区信息</span>\
                  </div>\
                  <div class="clr"></div>\
                </div>\
                <div class="item">\
                  <span class="label"><em>*</em>详细地址：</span>\
                  <div class="fl">\
                    <span style="float: left;margin-right: 5px;line-height:32px;" id="areaName"></span>\
                    <input id="consigneeAddress" type="text" class="text text1" onblur="checkConsigneeAddress()">\
                    </div>\
                    <span class="error-msg hide" id="consigneeAddressNote"></span>\
                    <div class="clr"></div>\
                  </div>\
                  <div class="item">\
                    <div class="fl">\
                      <span class="label"><em>*</em>手机号码：</span>\
                      <input id="consigneeMobile" type="text" maxlength="11" class="text" onblur="checkMobile()">\
                      <span class="error-msg hide" id="consigneeMobileNote">请您填写收货人手机号码</span>\
                      </div>\
                        <div class="clr"></div>\
                      <div class="item">\
                        <div class="item">\
                          <span class="label"><em></em>地址别名：</span>\
                          <div class="fl">\
                            <input id="consigneeAlias" type="text" class="text">\
                              <span class="ftx-03">设置一个易记的名称，如：“送到家里”、“送到公司”</span>\
                              <span class="error-msg hide" id="consigneeAliasNote"></span>\
                            </div>\
                            <div class="clr"></div>\
                          </div>\
                          <div class="btns">\
                            <a href="javascript:;" onclick="addAddress();" class="e-btn btn-9 save-btn">保存收货地址</a>\
                            <span class="error-msg hide" id="submitNote"></span>\
                          </div>\
                        </div>\
                      </div>\
                    </div>\
                  </div>\
    </div>\
  </div>\
  <a href="#" class="thickclose" id="">×</a>\
  </div>';

$(function () {
  //openDialog();
  $('.addEasy a').bind('click', function (e) {
    e.preventDefault();
    alertAddAddressDialog()
  })
})

/*

 */
function alertAddAddressDialog() {
  $('.thickdiv, .thickbox').remove();
  loadProvince();
  $('body').append(addAddressHtml);
  $('.thickclose').bind('click', function (e) {
    e.preventDefault();
    $('.thickdiv, .thickbox').remove();
  })
}
//增加地址
function addAddress() {
  var data = checkForm();
  if (data) {
    $.post('/user/addAddress', data, function (data) {
      if (data.code == 1) {
        window.location.reload();
      } else {
        $('#submitNote').html(data.info).show();
      }
    }, 'JSON')
  }
}

function alertDelAddressDiag(id) {
  showConfirm('您确定要删除该地址吗？', 'delAddress(' + id + ')', 'cancelDel()');
}

function cancelDel() {
  $('.modal-backdrop, .dialog').remove();
}

function delAddress(id) {
  $.post('/user/delAddress', {address_id: id}, function (data) {
    cancelDel();
    if (data.code == 1) {
      window.location.reload();
    }
  }, 'JSON')
}

function alertEditAddressDiag(id) {
  $('.thickdiv, .thickbox').remove();
  $('body').append('<div class="thickdiv"></div>\
  <div class="thickbox">\
  <div class="thickwrap">\
    <div class="thicktitle"><span>编辑收货地址</span></div>\
    <div class="thickcon">\
    <div id="addressDiagDiv">\
   <div class="m" id="edit-cont"></div> \
  </div>\
    <a href="#" class="thickclose" id="">×</a>\
  </div>')
  $('.thickclose').bind('click', function (e) {
    e.preventDefault();
    $('.thickdiv, .thickbox').remove();
  })
  $.post('/user/address/' + id, function (data) {
    if (data.code == 1) {
      $('#edit-cont').html(data.data.content);
    }
  }, 'JSON')
}

function editAddress(id){
  var data = checkForm();
  if (data) {
    data.address_id = id;
    $.post('/user/editAddress', data, function (data) {
      $('.thickdiv, .thickbox').remove();
      if (data.code == 1) {
        window.location.reload();
      }
    }, 'JSON')
  }
}

//验证表单
function checkForm() {
  if (!(checkConsigneeName() || checkArea() || checkConsigneeAddress() || checkMobile())) {
    var name = $("#consigneeName").val(),
      address = $("#consigneeAddress").val(),
      phone = $("#consigneeMobile").val(),
      province = $("#provinceDiv option:selected").val(),
      city = $("#cityDiv option:selected").val(),
      county = $("#countyDiv option:selected").val(),
      alias = $("#consigneeAlias").val();
    var data = {
      name: name,
      province: province,
      city: city,
      county: county,
      address: address,
      phone: phone,
      alias: alias
    };
    return data;
  } else {
    return false;
  }

}


function loadProvince() {
  $.get('/user/getProvince', function (data) {
    if (data.code == 1) {
      var data = data.data;
      var html = '<option value="0">请选择</option>';
      for (var i = 0; i < data.length; i++) {
        html += '<option value="' + data[i].city_id + '">' + data[i].city_name + '</option> ';
      }
      $('#provinceDiv').html(html);
    }
  }, 'JSON')
}

function loadCity() {
  var a = $('#provinceDiv option:selected'),
    b = a.val(),
    c = a.text();
  if (b > 0) {
    $('#areaName').text(c);
    $.post('/user/getCity', {province: b}, function (data) {
      if (data.code == 1) {
        var data = data.data;
        var html = '<option value="0">请选择</option>';
        for (var i = 0; i < data.length; i++) {
          html += '<option value="' + data[i].city_id + '">' + data[i].city_name + '</option> ';
        }
        $('#cityDiv').html(html);
      }
    }, 'JSON')
  } else {
    $('#areaName').text('');
    $('#cityDiv').html('<option value="0">请选择</option>');
    $('#countyDiv').html('<option value="0">请选择</option>');
  }
}

function loadCounty() {
  var a = $('#cityDiv option:selected'),
    b = a.val(),
    c = a.text();
  if (b > 0) {
    $('#areaName').text($('#provinceDiv option:selected').text() + c);
    $.post('/user/getCounty', {city: b}, function (data) {
      if (data.code == 1) {
        var data = data.data;
        var html = '<option value="0">请选择</option>';
        for (var i = 0; i < data.length; i++) {
          html += '<option value="' + data[i].city_id + '">' + data[i].city_name + '</option> ';
        }
        $('#countyDiv').html(html);
      }
    })
  } else {
    $('#countyDiv').html('<option value="0">请选择</option>');
    $('#areaName').text($('#provinceDiv option:selected').text())
  }

}

function loadTown() {
  var a = $('#countyDiv option:selected'),
    b = a.val(),
    c = a.text();
  if (b > 0) {
    $('#areaName').text($('#provinceDiv option:selected').text() + $('#cityDiv option:selected').text() + c);
  } else {
    $('#areaName').text($('#provinceDiv option:selected').text() + $('#cityDiv option:selected').text())
  }
}

function checkConsigneeName() {
  var a = !1, b = "", c = $("#consigneeName").val();
  isEmpty(c) ? (a = !0, b = "\u8bf7\u60a8\u586b\u5199\u6536\u8d27\u4eba\u59d3\u540d") : (c.length > 25 && (a = !0, b = "\u6536\u8d27\u4eba\u59d3\u540d\u4e0d\u80fd\u5927\u4e8e25\u4f4d"), is_forbid(c) || (a = !0, b = "\u6536\u8d27\u4eba\u59d3\u540d\u4e2d\u542b\u6709\u975e\u6cd5\u5b57\u7b26"));
  var d = $("#consigneeNameNote");
  return a ? (d.text(b), d.show()) : d.hide(), a
}

function checkConsigneeAddress() {
  var a = !1, b = "", c = $("#consigneeAddress").val();
  isEmpty(c) && (a = !0, b = "\u8bf7\u60a8\u586b\u5199\u6536\u8d27\u4eba\u8be6\u7ec6\u5730\u5740"), is_forbid(c) || (a = !0, b = "\u6536\u8d27\u4eba\u8be6\u7ec6\u5730\u5740\u4e2d\u542b\u6709\u975e\u6cd5\u5b57\u7b26"), c.length > 50 && (a = !0, b = "\u6536\u8d27\u4eba\u8be6\u7ec6\u5730\u5740\u8fc7\u957f");
  var d = $("#consigneeAddressNote");
  return a ? (d.text(b), d.show()) : d.hide(), a
}

function checkMobile() {
  var a = !1, b = "", c = $("#consigneeMobile").val();
  if (isEmpty(c))a = !0, b = "\u8bf7\u60a8\u586b\u5199\u6536\u8d27\u4eba\u624b\u673a\u53f7\u7801"; else {
    var d = /^\d{11}$/, e = new RegExp(d);
    e.test(c) || (a = !0, b = "\u624b\u673a\u53f7\u7801\u683c\u5f0f\u4e0d\u6b63\u786e")
  }
  if (!a && (c = $("#consigneePhone").val(), !isEmpty(c))) {
    is_forbid(c) || (a = !0, b = "\u56fa\u5b9a\u7535\u8bdd\u53f7\u7801\u4e2d\u542b\u6709\u975e\u6cd5\u5b57\u7b26"), c.length > 20 && (a = !0, b = "\u56fa\u5b9a\u7535\u8bdd\u53f7\u7801\u8fc7\u957f");
    for (var f = "(0123456789-)", g = c.length, h = 0; g > h; h++) {
      var i = c.substring(h, h + 1);
      if (f.indexOf(i) < 0) {
        a = !0, b = "\u56fa\u5b9a\u7535\u8bdd\u53f7\u7801\u683c\u5f0f\u4e0d\u6b63\u786e";
        break
      }
    }
  }
  var j = $("#consigneeMobileNote");
  return a ? (j.text(b), j.show()) : j.hide(), a
}

function checkArea() {
  var a = !1, b = "", c = $("#provinceDiv option:selected").val(), d = $("#cityDiv option:selected").val(), e = $("#countyDiv option:selected").val();
  (isEmpty(c) || isEmpty(d) || isEmpty(e) || 0 == c || 0 == d || 0 == e) && (a = !0, b = "\u8bf7\u60a8\u586b\u5199\u5b8c\u6574\u7684\u5730\u533a\u4fe1\u606f");
  var g = $("#areaNote");
  return a ? (g.text(b), g.show()) : g.hide(), a
}

/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/12/2
 * Time: 下午9:24
 * To change this template use File | Settings | File Templates.
 */

var addAddressHtml = '<div class="addressItem">\
                <div class="addressLabel"><em>*</em>收货人：</div>\
                <div class="addressInput">\
                  <input id="consigneeName" type="text" class="text" onblur="checkConsigneeName()">\
                    <span id="consigneeNameNote" class="tips hide"></span>\
                  </div>\
                </div>\
                <div class="addressItem">\
                  <div class="addressLabel"><em>*</em>所在地区：</div>\
                  <div class="addressInput">\
                    <select id="provinceDiv" class="sele" onchange="loadCity()"><option value="0">请选择</option></select>\
                    <select id="cityDiv" class="sele" onchange="loadCounty()"><option value="0">请选择</option></select>\
                    <select id="countyDiv" class="sele" onchange="loadTown()"><option value="0">请选择</option></select>\
                    <span class="tips hide" id="areaNote">请您填写完整的地区信息</span>\
                  </div>\
                </div>\
                <div class="addressItem">\
                  <div class="addressLabel"><em>*</em>详细地址：</div>\
                  <div class="addressInput">\
                    <span style="float: left;margin-right: 5px;line-height:32px;" id="areaName"></span>\
                    <input id="consigneeAddress" type="text" class="text text1" onblur="checkConsigneeAddress()">\
                    </div>\
                    <span class="tips hide" id="consigneeAddressNote"></span>\
                </div>\
                <div class="addressItem">\
                  <div class="addressLabel"><em>*</em>手机号码：</div>\
                  <div class="addressInput">\
                    <input id="consigneeMobile" type="text" maxlength="11" class="text" onblur="checkMobile()">\
                    <span class="tips hide" id="consigneeMobileNote">请您填写收货人手机号码</span>\
                  </div>\
                </div>';
var leaves = 0;
var cash = 0;
var isNeedPayPwd = false;
$(function () {
  if ($('#addressList li').length <= 1) {
    $('#addressList li input').attr('checked', true);
    $('#editAddress').html(addAddressHtml).show();
    loadProvince();
  }
  $('#orderAddressEditBtn').bind('click', function (e) {
    e.preventDefault();
    $('#addressResult').hide();

    $('#addressList').show();
  });

  $('.address').bind('click', function () {
    if ($(this).val() == 0) {
      $('#editAddress').html(addAddressHtml).show();
      loadProvince();
    } else {
      $('#editAddress').html('').hide();
    }
  });

  $('#orderPayEditBtn').bind('click', function (e) {
    e.preventDefault();
    $('#payResult').hide();
    $('#payList').show();
  });
  $('.payType').bind('click', function (e) {
    if ($(this).val() == 2) {
      $('#alipayBankList').show()
    } else {
      $('#alipayBankList').hide()
    }
  });

  $('#orderInvoiceEditBtn').bind('click', function (e) {
    e.preventDefault();
    $('#invoiceResult').hide();
    $('#invoiceList').show();
  });

  $('.invoice').bind('click', function () {
    if ($(this).val() == 0) {
      $('#invoiceAddNew').show();
    } else {
      $('#invoiceAddNew').hide();
    }
  });

  $('.invoiceTitle').bind('click', function () {
    if ($(this).val() == 2) {
      $('#invoiceTitleValue').show()
    } else {
      $('#invoiceTitleValue').hide()
    }
  })

  $('.delAddress').bind('click', function (e) {
    e.preventDefault();
    var address_id = $(this).siblings('input').val();
    var id = $(this).parents('li').attr('id');
    showConfirm('确认删除收货信息?', 'delAddress(' + address_id + ', \'' + ('#' + id) + '\')', 'hideConfirm()')
  });

  $('.delInvoice').bind('click', function (e) {
    e.preventDefault();
    var invoice_id = $(this).siblings('input').val();
    var id = $(this).parents('li').attr('id');
    showConfirm('确认删除发票信息?', 'delInvoice(' + invoice_id + ', \'' + ('#' + id) + '\')', 'hideConfirm()')
  });

  $('.toggle-title').bind('click', function (e) {
    e.preventDefault();
    resetAllowed();
    if ($(this).hasClass('leavesHide')) {
      $(this).removeClass('leavesHide').addClass('leavesShow');
      $(this).siblings('.toggle-use').show();
      $(this).siblings('.toggle-result').hide();
    } else {
      $(this).removeClass('leavesShow').addClass('leavesHide');
      $(this).siblings('.toggle-use').hide();
    }
  });
  $('.toggle-input a').bind('click', function (e) {
    e.preventDefault();
    $(this).parents('.toggle-use').hide().siblings('.toggle-title').removeClass('leavesShow').addClass('leavesHide');
  });
  $('#leavesResult a').bind('click', function (e) {
    e.preventDefault();
    $('#useLeaves').removeClass('leavesHide').addClass('leavesShow');
    $('#leavesD').show();
    $('#leavesUseAmount').hide();
    $('#leavesResult').hide();
    $('#orderLeavesUse').val(0);
    leaves = 0;
    $('#leavesInput input').val('');
    calculatePrice();
  });
  $('#cashResult a').bind('click', function (e) {
    e.preventDefault();
    $('#useCash').removeClass('leavesHide').addClass('leavesShow');
    $('#cashD').show();
    $('#cashUseAmount').hide();
    $('#cashResult').hide();
    $('#orderCashUse').val(0);
    cash = 0;
    $('#cashInput input').val('');
    calculatePrice();
  });

  $('#leavesInput input').keypress(function (e) {
    if (e.keyCode < 47 || e.keyCode > 57) {
      e.preventDefault();
    }
  }).keyup(function (e) {
    if ((e.keyCode < 47 || e.keyCode > 57) && e.keyCode != 8) {
      e.preventDefault();
    } else {
      var midLeaves = parseInt($(this).val()) || 0;
      var priceAllowedLeaves = (totalSkuPrice + freight - cash) * leavesRatio;
      var allowed = allowedLeaves > priceAllowedLeaves ? priceAllowedLeaves : allowedLeaves;
      if (midLeaves > allowed) {
        $('#leavesInput a').addClass('disable').unbind('click');
        $('#leavesAllowdTip').show();
        $('#leavesUseAmount').hide().html('，使用<b class="black">0</b>片， 折合人民币<b class="red">￥0.00</b>元');
      } else {
        leaves = midLeaves;
        resetAllowed();
        var leavesValue = parseFloat(leaves / leavesRatio).toFixed(2);
        var leavesHtml = '使用<b class="black">' + leaves + '</b>片， 折合人民币<b class="red">￥' + leavesValue + '</b>元';
        $('#leavesUseAmount').show().html('，' + leavesHtml);
        $('#leavesAllowdTip').hide();
        $('#orderLeavesUse').val(leaves);
        $('#leavesInput a').unbind('click').removeClass('disable').bind('click', function (e) {
          e.preventDefault();
          $('#useLeaves').removeClass('leavesShow').addClass('leavesHide');
          $('#leavesD').hide();
          $('#leavesResult').show();
          $('#leavesResult span').html(leavesHtml);
          calculatePrice();
        })
      }
    }

  });

  $('#cashInput input').keypress(function (e) {
    var cashInputVale = $(this).val();
    if (cashInputVale.indexOf('.') >= 0 && e.keyCode == 46) {
      e.preventDefault();
    }
    if (e.keyCode < 46 || e.keyCode > 57) {
      e.preventDefault();
    }
  }).keyup(function (e) {
    if ((e.keyCode < 46 || e.keyCode > 57) && e.keyCode != 8) {
      e.preventDefault();
    } else {
      var midCash = parseFloat($(this).val()) || 0;
      var priceAllowedCash = totalSkuPrice + freight - leaves / leavesRatio;
      var allowed = allowedCash > priceAllowedCash ? priceAllowedCash : allowedCash;
      if (midCash > allowed) {
        $('#cashInput a').addClass('disable').unbind('click');
        $('#cashAllowdTip').show();
        $('#cashUseAmount').hide().html('，使用余额￥<b class="black">0.00</b>元');
      } else {
        cash = midCash;
        resetAllowed();
        var cashHtml = '使用余额￥<b class="red">' + cash.toFixed(2) + '</b>元';
        $('#cashUseAmount').show().html('，' + cashHtml);
        $('#cashAllowdTip').hide();
        $('#orderCashUse').val(leaves);
        $('#cashInput a').unbind('click').removeClass('disable').bind('click', function (e) {
          e.preventDefault();
          $('#useCash').removeClass('leavesShow').addClass('leavesHide');
          $('#cashD').hide();
          $('#cashResult').show();
          $('#cashResult span').html(cashHtml);
          calculatePrice();
        })
      }
    }

  });

  function calculatePrice() {
    var leavesValue = parseFloat(leaves / leavesRatio).toFixed(2);
    var total = (totalSkuPrice - leavesValue - cash + freight).toFixed(2);
    $('#totalRePrice em').html(leavesValue);
    $('#totalCash em').html(parseFloat(cash).toFixed(2));
    $('#finalPrice em').html(total);
    $('#submitOrderBar b').html('￥' + total);
    checkPwd();
  }
  function resetAllowed() {
    var priceAllowedLeaves = (totalSkuPrice + freight - cash) * leavesRatio;
    var totalLeavesAllowed = allowedLeaves > priceAllowedLeaves ? priceAllowedLeaves : allowedLeaves;
    $('#leavesAllowdTip').html('您本次最多可使用'+parseInt(totalLeavesAllowed)+'片桉树叶');
    $('#leavesAllowed').html(parseInt(totalLeavesAllowed));

    var priceAllowedCash = totalSkuPrice + freight - leaves / leavesRatio;
    var totalCashAllowed = allowedCash > priceAllowedCash ? priceAllowedCash : allowedCash;
    $('#cashAllowdTip').html('您本次最多可使用余额￥'+totalCashAllowed.toFixed(2));
    $('#cashAllowed').html(totalCashAllowed.toFixed(2));
  }

  function checkPwd() {
    if (cash > 0 || leaves > 0) {
      isNeedPayPwd = true;
      $.getJSON('/order/checkPwd', function (data) {
        if (data.code == 1) {
          if (data.data.payPwd) {
            $('#has_pay_pwd').show();
            $('#pay_pwd').focus();
            $('#has_not_pay_pwd').hide();
          } else {
            $('#has_pay_pwd').hide();
            $('#has_not_pay_pwd').show();
          }
        } else {
          showTips(data.info);
        }
      })
    } else {
      isNeedPayPwd = false;
      $('#has_pay_pwd').hide();
      $('#has_not_pay_pwd').hide();
    }
  }

  $('#submitOrderBtn').bind('click', function (e) {
    e.preventDefault();
    var address_id = $('#selectedAddress').val();
    var payType = $('#selectedPay').val();
    var bank = $('#selectedBank').val();
    var invoice_id = $('#selectInvoice').val();
    var pay_pwd = $('#pay_pwd').val();
    if (!address_id) {
      showTips('请选择收货地址');
      $('#orderAddressEditBtn').trigger('click');
      return;
    }
    if (!payType) {
      showTips('请选择支付方式');
      $('#orderPayEditBtn').trigger('click');
      return;
    }
    if ((cash > 0 || leaves > 0) && !pay_pwd) {
      showTips('请输入支付密码', function () {
        checkPwd();
      });
      return;
    }
    $.post('/order/submitOrder', {
      address_id: address_id,
      payType: payType,
      bank: bank,
      invoice_id: invoice_id,
      leaves: leaves,
      cash: cash,
      pay_pwd: pay_pwd
    }, function (data) {
      console.log(data);
      if (data.code == 1) {
        window.location.href = '/order/success?order_id=' + data.data.order;
      } else if (data.code == 1000) {
        showTips('获取购物车物品失败', function () {
          window.location.href = '/cart'
        })
      } else {
        showTips(data.info);
      }
    }, 'JSON')
  })
})

//保存地址
function saveAddress() {
  var address_id = $('#addressList li input:checked').val();
  if (address_id == 0) {
    var data = checkForm();
    if (data) {
      $.post('/user/addAddress', data, function (data) {
        if (data.code == 1) {
          $('#addressList').hide();
          $('<li>\
            <input type="radio" checked class="address" name="address" value="' + data.data.address_id + '" />\
          <span class="addressNameSpan">' + data.data.name + '</span>&nbsp;<span class="addressAreaSpan">' + data.data.area + '</span><span class="addressAddressSpan">' + data.data.address + '</span>&nbsp;<span class="addressPhoneSpan">' + data.data.phone + '</span>\
            </li>').insertBefore($('#addressList li').last())
          $('#editAddress').html('').hide();
          editAddressResult();
        } else {
          showTips(data.info);
        }
      }, 'JSON')
    }
  } else {
    $('#addressList').hide();
    editAddressResult();
  }
}

function delAddress(aid, id) {
  $.post('/user/delAddress', {address_id: aid}, function (data) {
    if (data.code == 1) {
      $(id).remove();
      hideConfirm();
    } else {
      showTips(data.info);
    }
  }, 'JSON')
}

function editAddressResult() {
  var $address = $('#addressList input:checked');
  $('#addressResult').html('<input type="hidden" id="selectedAddress" value="' + $address.val() + '">\
            <p>' + $address.siblings('.addressNameSpan').text() + '&nbsp;&nbsp;&nbsp;' + $address.siblings('.addressPhoneSpan').text() + '</p>\
            <p>' + $address.siblings('.addressAreaSpan').text() + '&nbsp;&nbsp;&nbsp;' + $address.siblings('.addressAddressSpan').text() + '</p>').show();
}

//保存支付方式
function savePayType() {
  var payId = $('.payType:checked').val();
  var payName = $('.payType:checked').siblings('span').text();
  if (payId == 2) {
    var bankId = $('.alipayBank:checked').val();
    var bankName = $('.alipayBank:checked').siblings('img').attr('alt');
    if (!bankId) {
      showTips('请选择支付银行');
    } else {
      $('#payResult').html(payName + '&nbsp;&nbsp;' + bankName + '<input type="hidden" id="selectedPay" value="' + payId + '" /><input type="hidden" id="selectedBank" value="' + bankId + '">').show();
      $('#payList').hide();
    }
  } else {
    $('#payResult').html(payName + '<input type="hidden" id="selectedPay" value="' + payId + '" />').show();
    $('#payList').hide();
  }
}

//保存发票信息
function saveInvoice() {
  var invoice_id = $('.invoice:checked').val();
  if (invoice_id == 0) {
    var invoiceType = $('input[name=invoiceType]:checked').val();
    var invoiceTitle = $('.invoiceTitle:checked').val();
    var invoiceTitleValue = $('#invoiceTitleValue').val();
    var invoiceContent = $('input[name=invoiceContent]:checked').val();
    if (!invoice_id || !invoiceTitle || !invoiceContent || (invoiceTitle == 2 && !invoiceTitleValue)) {
      showTips('请完善发票信息');
    } else {
      $.post('/user/addInvoice', {
        itid: invoiceType,
        ic: invoiceContent,
        title: invoiceTitleValue
      }, function (data) {
        if (data.code == 1) {
          $('<li><input type="radio" checked class="invoice" name="invoice" value="' + data.data.iid + '"/><span>' + $('input[name=invoiceType]:checked').parents('.invoiceTypeRadio').text() + '&nbsp;' + (invoiceTitle == 2 ? invoiceTitleValue : '个人') + '&nbsp;' + $('input[name=invoiceContent]:checked').parents('.invoiceContentRadio').text() + '</span>').insertBefore($('#invoiceList li').last())
          editInvoiceResult();
        } else {
          showTips(data.info);
        }
      }, 'JSON')
    }
  } else {
    editInvoiceResult();
  }
}

function editInvoiceResult() {
  var invoice_id = $('.invoice:checked').val();
  var invoice_name = $('.invoice:checked').siblings('span').text();
  $('#invoiceResult').html('<p>' + invoice_name + '<input type="hidden" id="selectInvoice" value="' + invoice_id + '"></p><p class="invoiceTip">温馨提示：发票的开票金额不包括桉树叶支付部分</p>').show();
  $('#invoiceList').hide();
}

function delInvoice(iid, id) {
  $.getJSON('/user/delInvoice?iid=' + iid, function (data) {
    if (data.code == 1) {
      $(id).remove();
      hideConfirm();
    } else {
      showTips(data.info);
    }
  })
}

function hideConfirm() {
  $('#pop').remove();
  $('#popBg').remove();
}

//验证表单
function checkForm() {
  if (!(checkConsigneeName() || checkArea() || checkConsigneeAddress() || checkMobile())) {
    var name = $("#consigneeName").val(),
      address = $("#consigneeAddress").val(),
      phone = $("#consigneeMobile").val(),
      province = $("#provinceDiv option:selected").val(),
      city = $("#cityDiv option:selected").val(),
      county = $("#countyDiv option:selected").val();
    var data = {
      name: name,
      province: province,
      city: city,
      county: county,
      address: address,
      phone: phone
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


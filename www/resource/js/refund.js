/**
 * Created with JetBrains WebStorm.
 * User: chenlingguang
 * Date: 14/11/26
 * Time: 下午5:04
 * To change this template use File | Settings | File Templates.
 */
$(function () {
  $('#province').bind('change', function () {
    var province = $(this).val();
    $('#city').html('<option value="-1">请选择城市</option>');
    $('#county').html('<option value="-1">请选择地区</option>');
    if (province == -1) return;
    $.post('/user/getCity', {province: province}, function (data) {
      if (data.code == 1) {
        var html = '<option value="-1">请选择城市</option>';
        for (var i = 0; i < data.data.length; i++) {
          var item = data.data[i];
          html += '<option value="'+item.city_id+'">'+item.city_name+'</option>'
        }
        $('#city').html(html);
      }
    }, 'JSON')
  })

  $('#city').bind('change', function () {
    var city = $(this).val();
    $('#county').html('<option value="-1">请选择地区</option>');
    if (city == -1) return;
    $.post('/user/getCounty', {city: city}, function (data) {
      if (data.code == 1) {
        var html = '<option value="-1">请选择地区</option>';
        for (var i = 0; i < data.data.length; i++) {
          var item = data.data[i];
          html += '<option value="'+item.city_id+'">'+item.city_name+'</option>'
        }
        $('#county').html(html);
      }
    }, 'JSON')
  })

  $('#uploadify').uploadify({
    'preventCaching': false,
    'fileSizeLimit': '1024KB',  //上传大小限制
    'fileTypeExts': '*.jpg; *.jpeg; *.png', //格式限制
    'queueSizeLimit': 3, //数量限制
    'swf': '/resource/swf/uploadify.swf',
    'uploader': 'http://img.lankaola.com/upload/uploadimg',
    'onSelectError': function () {
      this.queueData.errorMsg = '最多可上传3张图片';
    },
    'onUploadStart': function () {
      if ($('#imgList li').length >= 3) {
        showTips('您已经上传3张图片');
        $('#uploadify').uploadify('cancel')
        $('#uploadify-queue').hide();
        return false;
      }
    },
    'onUploadSuccess': function (file, data, response) { //成功回调
      if (response) {
        data = JSON.parse(data);
        $('#imgList').append('<li><img width="50" height="50" src="'+data.url+'"><a class="del" onclick="removeImg(this)"></a></li>')
      }
    },
    'onUploadError': function (file, errorCode, errorMsg, errorString) {  //失败回调

    }
  });

  var validator = new FormValidator($('#apply').get(0), [
    {
      name: 'type',
      rules: 'required',
      messages: '请选择处理方式'
    },
    {
      name: 'reason',
      rules: 'required',
      messages: '请输入问题描述'
    },
    {
      name: 'address',
      rules: 'required',
      messages: '请输入地址'
    },
    {
      name: 'name',
      rules: 'required',
      messages: '请输入联系人姓名'
    },
    {
      name: 'phone',
      rules: 'required|valid_phone',
      messages: '请输入手机号码|请输入正确的手机号码'
    }
  ], function(errors, e){
    var province = $('#province').val();
    var city = $('#city').val();
    var county = $('#county').val();
    if (!province || province == -1 || !city || city == -1 || !county || county == -1) {
      $('#county').siblings('.tip').remove();
      $('<span class="tip fl"><i></i>请输入正确地址</span>').insertAfter($('#county')).css('display', 'inline-block');
    }
    if (errors.length > 0) {
      for (var i = 0; i < errors.length; i++) {
        var error = errors[i];
        $(error.element).focus().siblings('.tip').remove();
        $('<span class="tip fl"><i></i>' + error.message + '</span>').insertAfter($(error.element)).css('display', 'inline-block');
      }
    } else {
      e.preventDefault();
      var orderSku = $('#orderSku').val();
      var type = 2;
      $('input[name=type]').each(function () {
        if (this.checked) type = $(this).val();
      });
      var reason = $('#reason').val();
      var address = [$('#province option:selected').text(), $('#city option:selected').text(), $('#county option:selected').text(), $('#address').val()].join('');
      var name = $('#name').val();
      var phone = $('#phone').val();
      var img = [];
      $('#imgList img').each(function () {
        var imgurl = $(this).attr('src') || '';
        if (imgurl.indexOf('http://img.lankaola.com') == 0) {
          img.push(imgurl)
        }
      })
      $.post('/refund/apply', {
        orderSku: orderSku,
        type: type,
        reason: reason,
        img: img.slice(0,3).join('|'),
        address: address,
        name: name,
        phone: phone
      }, function (data) {
        if (data.code == 1) {
          showTips('提交申请成功', function () {
            window.location.href = '/refund/list'
          });
        } else if (data.code == -1) {
          showTips('已经提交申请，请等待系统处理', function () {
            window.location.href = '/refund/list'
          })
        } else {
          showTips(data.info);
        }
      }, 'JSON');
    }
  });

})

function removeImg(obj){
  $(obj).parents('li').remove();
}
/**
 * Created by plus on 2016/12/13.
 * daydao云文件预览插件
 * @options Object
 * @options.uuid String 文件的uuid 必填
 * @options.title String 弹窗的标题 非必填
 * @options.isPopDialog 是否弹窗 非必填，默认是true, previewAjaxPromise 为空，否则 previewAjaxPromise 为 预览请求 ajax 的 Promise 对象
 * @options.isPic 是否图片 非必填，默认是false, 不是图片,当值为true时,表示文件是图片
 * @options.isWap 是否移动端 非必填，默认是false, 不是图片,当值为true时,表示是移动端

 */
define(function(require,exports,module){
    var Ajax = require("commonStaticDirectory/plugins/ajax.js");
    require("commonStaticDirectory/plugins/layer/layer");
    require("commonStaticDirectory/plugins/jquery.loading");
    require('commonStaticDirectory/plugins/piczoom/pinchzoom.js');
    var imgzoom = require('commonStaticDirectory/plugins/piczoom/imgzoom.js');

    var w;
    // var basePath = gMain.basePath;

    var basePath = '//www.daydao.com/';

    var os = function() {
        var ua = navigator.userAgent,
            isWindowsPhone = /(?:Windows Phone)/.test(ua),
            isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
            isAndroid = /(?:Android)/.test(ua),
            isFireFox = /(?:Firefox)/.test(ua),
            isChrome = /(?:Chrome|CriOS)/.test(ua),
            isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
            isPhone = /(?:iPhone)/.test(ua) && !isTablet,
            isPc = !isPhone && !isAndroid && !isSymbian;
        return {
            isTablet: isTablet,
            isPhone: isPhone,
            isAndroid : isAndroid,
            isPc : isPc
        };
    }();

    if(os.isPc){
        // basePath = gMain.DayHRDomains.sCloudDomain;
        //
        // // 兼容本地开发
        // if(location.host === 'www.daydao.com' || location.hostname === 'localhost'){
        //     basePath = gMain.apiPath || '/';
        // }
    }else{
        w = require('commonStaticDirectory/plugins/piczoom/callAppHandler.js');
        // 移动端获取app版本号
        w.callAppHandler("h5_get_version", "");
    }

    var Preview = function () {
        this.init.apply(this,arguments);
    };

    $.extend(Preview.prototype,{
        options:{
            isPopDialog:true,//默认弹窗
            title:"文件预览",
            isPic:false, //默认不是图片
            isWap:false //默认不是移动端
        }
        ,init:function (options) {
            var t =this;
            t.options = $.extend({},t.options,options);
            t.url = basePath + "apiCloud/cpCloudCommon/preview.do";//预览接口
            t.downUrl = basePath + "apiCloud/cpCloudCommon/download.do";//web图片下载预览接口
            t.streamsUrl = basePath + "apiCloud/cpCloudCommon/getfileStreams.do";//移动图片预览接口

            if(t.options.isPopDialog === true){
                t.show();
            }else{
                t.previewAjaxPromise = t.ajax();
            }
        }
        ,previewAjaxPromise:null
        ,show:function () {
            var t = this;
            if(t.options.isPic===false) {//不是图片
                t.ajax({
                    url: t.url,
                    data: JSON.stringify({uuid: t.options.uuid}),
                    beforeSend: function () {
                        $("body").loading({zIndex: 9999});
                    },
                    complete: function () {
                        $("body").loading({state: false});
                    },
                    success: function (data) {
                        if(t.options.isWap===false) {//不是移动端
                            layer.open({
                                type: 2,
                                title: t.options.title,
                                shadeClose: false,
                                shade: 0.8,
                                maxmin: true,
                                area: ['80%', '80%'],
                                content: data.data
                            });
                        }else{
                            location.href= data.data + '&fname=' + t.options.title;//移动端直接重定向文件链接
                        }
                    }
                });
            }else{//文件是图片
                // if (t.options.isWap === false){
                    t.ajax({
                        url: t.downUrl,
                        data: JSON.stringify({uuid: t.options.uuid}),
                        beforeSend: function () {
                            $("body").loading({zIndex: 9999});
                        },
                        complete: function () {
                            $("body").loading({state: false});
                        },
                        success: function (data) {
                            if (t.options.isWap === false) {
                                // layer.open({
                                //     type: 1,
                                //     title: t.options.title,
                                //     shadeClose: false,
                                //     shade: 0.8,
                                //     maxmin: true,
                                //     area: ['80%', '80%'],
                                //     content: "<img src='" + data.data + "' style='margin: 20px auto; display: block;' />"
                                // });
                                new imgzoom({
                                    src: data.data,
                                    autoShow: true   //自动打开
                                });
                            }else{
                                t.mobilePreviw(data.data);
                           }
                        }
                    });
               //  }else{
                     // location.href= t.streamsUrl+"?fileId="+t.options.uuid;//移动端直接重定向图片链接
                // }
            }
        }
        ,ajax:function(options){
            var t = this;
            var sUrl = t.options.isPic === true ? t.downUrl:t.url;
            var defaultOptions = {
                url:sUrl,
                data:JSON.stringify({uuid:t.options.uuid})
            };
            options = $.extend(true,defaultOptions,options);
            return Ajax.ajax(options);
        }
        , mobilePreviw: function(url){
            if(w.appVersion && w.appVersion < 4.3){
                var $div = $('<div></div>');
                var $win = $(window);
                var wW = $win.width(), wH = $win.height();

                $div.css({
                    width: wW,
                    height: wH,
                    position: 'absolute',
                    top: $win.scrollTop(),
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999999,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)'
                });

                var $img = $('<img src="'+ url +'" >');

                $div
                    .append($img)
                    .appendTo('body');

                $img.on('load', function(){
                    var imgW = $img.width(), imgH = $img.height(), ratio, newH;
                    if(imgW > wW){
                        $img.width(wW);
                        ratio = wW / imgW;
                        newH = imgH * ratio;
                        $img.height(newH);

                        if(newH < wH){
                            $img.css('margin-top', (wH - newH)/2);
                        }
                    }else{
                        $img.css('margin-left', (wW-imgW)/2);
                        if(imgH < wH){
                            $img.css('margin-top', (wH - imgH)/2);
                        }
                    }
                });


                new RTP.PinchZoom($div.find('img'), {
                    click: function(){
                        $div.remove();
                    }
                });

                window.onhashchange = function(){
                    $div.remove();
                }
            }else{
                var param = {
                    pictures: [url]  //pictures数组长度最大为9
                    ,imgIdx: 0   //当前预览图片序号（0~8）
                };
                w.callAppHandler("h5_pictures_preview", param);
            }
        }
    });

    window.gMain.preview = Preview; //供全局使用，方便调试

    module.exports = Preview;
});



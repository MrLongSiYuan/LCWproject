/**
 * 公共ajax
 * */

export default {
    /**
     * 基础工具---组合URL参数
     * @param params
     * @returns {string}
     */
    getParamsStr: function (params) {
        var paramStr = "";
        if (params) {
            for (var k in params) {
                if (k && params[k] != null) {
                    var sParaVal = "";
                    if (typeof params[k] == "string" || typeof params[k] == "number") {
                        sParaVal = params[k];
                    } else if (typeof params[k] == "object") {
                        sParaVal = JSON.stringify(params[k]);
                    }
                    paramStr += '&' + k + '=' + sParaVal;
                }
            }
        }
        if (paramStr) {
            paramStr = "?" + paramStr.substring(1);
        }
        return paramStr;
    },
    /**
     * 获取安全字符串
     * */
    getSafeStr:function (str) {
        str = str.replace(/<script[^>]*>|<\/script>|<iframe[^>]*>|<\/a>|<div[^>]*>|<\/div>|<body[^>]*>|<layer[^>]*>|<\/layer>|<a[^>]*>|<svg[^>]*>|eval\([^\)]*\)|<object[^>]*>|<input[^>]*>|<style[^>]*>|<form[^>]*>|<plaintext[^>]*>|<embet[^>]*>|onclick\s*=|onerror\s*=|onabort\s*=|onblur\s*=|onchange\s*=|ondblclick\s*=|onfocus\s*=|onkeydown\s*=|onkeypress\s*=|onkeyup\s*=|onload\s*=|onmousedown\s*=|onmousemove\s*=|onmouseout\s*=|onmouseover\s*=|onmouseup\s*=|onreset\s*=|onresize\s*=|onselect\s*=|onsubmit\s*=|onunload\s*=|javascript:|alert\([^\)]*\)/igm,"");  //去掉不安全字符串
        return str;
    },
    /**
     * 格式化ajax数据
     * */
    getAjaxFormatData:function (obj) {
        var t = this;
        var newData = "";
        var sType = typeof obj;
        if (sType === "string") {
            newData = obj;
        } else {
            newData = JSON.stringify(obj);
        }

        newData = t.getSafeStr(newData);  //去掉特殊字符

        if (sType === "string") {
            obj = newData;
        } else {
            obj = JSON.parse(newData);
        }
        return obj;
    },
    /**
     * 基础ajax提交参数封装
     * @options Object ajax参数
     * @options.isPassFalse  Boolean 是否允许通过data.result == 'false'的情况
     * */
    ajax: function (option) {
        var t = this;
        var def = $.Deferred();

        //请求数据防xss攻击处理
        if (typeof option.contentType !== 'boolean' && option.data) {
            option.data = t.getAjaxFormatData(option.data);
        }

        //导出下载文件的统一处理
        if(option.type == "download"){
            return t.handleDownload(option); //执行下载方法
        }

        //默认参数
        var data = {
            type: "post",
            dataType: "json",
            contentType: "application/json;charset=UTF-8",
            //跨域请求带cookie
            xhrFields: {
                withCredentials: true
            },
            headers:{
                ddh:gMain.sDdh  //添加请求头拦截日志用
                ,corpId:gMain.corpId
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (XMLHttpRequest.readyState == 4) {
                    t.showErrorMsg("请求出错，请重试"); //给个错误提示
                }
            }
        };
        $.extend(data, option);
        //重写success，如果传回的data.result值为true,才产生回调，供模块使用
        data.success = function (obj, textStatus, jqXHR) {
            //返回数据防xss攻击处理
            if (obj) {
                obj = t.getAjaxFormatData(obj);
            }
            if (data.dataType == "html") {
                obj = JSON.parse(obj);
            }

            //如果会话超时
            if (obj.retCode == 104) {
                t.sessionTimeOut(data,obj.data);
                return false;
            }

            //如果后端返回的错误统一拦截提示
            if (obj.result == "false" && !option.isPassFalse) {
                if (obj.statusCode == "1000") {

                    seajs.use(["commonStaticDirectory/plugins/amy-layer/amy-layer.css","commonStaticDirectory/plugins/amy-layer/amy-layer.js"],function () {
                        amyLayer.confirm(obj.resultDesc, {
                            yesName: '确定',
                            noName: '取消',
                            shadeBgColor: "rgba(0,0,0,0.7)"
                        }, function (index1) {
                            //满足条件再次删除
                            data.beforeSend = function () {
                                $("body").loading({zIndex: 999999999});
                            }
                            data.complete = function () {
                                $("body").loading({state: false});
                            }
                            data.data = JSON.parse(data.data);
                            data.data.customParam = option.data.customParam || {};
                            data.data.customParam.enforce = 1;
                            data.data = JSON.stringify(data.data);
                            return $.ajax(data);
                            amyLayer.close(index1);
                        }, function (index1) {
                            //满足条件再次删除
                            data.beforeSend = function () {
                                $("body").loading({zIndex: 999999999});
                            }
                            data.complete = function () {
                                $("body").loading({state: false});
                            }
                            data.data = JSON.parse(data.data);
                            data.data.customParam = option.data.customParam || {};
                            data.data.customParam.enforce = 1;
                            data.data = JSON.stringify(data.data);
                            return $.ajax(data);
                            amyLayer.close(index1);
                        });
                    });

                } else {
                    var currentHref = window.location.href;
                    currentHref = encodeURIComponent(currentHref);
                    var statusCode = obj.statusCode;
                    if (statusCode && statusCode.indexOf("skeleton-price-2") > -1) {
                        var productName = $.cookie("Product-Name");
                        if(productName){
                            window.location.href=gMain.DayHRDomains.sOpenDomain + "views/skeleton/#!/buy?productname="+productName+"&oldurl="+currentHref;
                            return false;
                        }
                    }
                    obj.resultDesc && t.showErrorMsg(obj.resultDesc); //给个错误提示
                }
            }
            typeof option.success == "function" && option.success(obj, textStatus, jqXHR);
            def.resolve(obj, textStatus, jqXHR);
        }

        //调用ajax前先保存路由
        t.currentPath = location.pathname + location.hash;

        $.ajax(data);
        return def;
    },
    /**
     * 下载请求处理
     */
    handleDownload:function(option){
        var t = this;
        var url = option.url + t.getParamsStr(option.data);
        window.location.href = encodeURI(url);
    },
    /**
     * 提示错误信息
     * */
    showErrorMsg:function (str) {
        var t = this;

        //移动端的amyLayer
        seajs.use(["commonStaticDirectory/plugins/amy-layer/amy-layer.css","commonStaticDirectory/plugins/amy-layer/amy-layer.js"],function () {
            amyLayer.alert(str); //给个错误提示
        });
    },
    //是否是低版本
    isLowerVersion:function(nowVer,minVer){
        nowVer = nowVer || '0.0.0';
        minVer = minVer || '0.0.0';

        if(nowVer == minVer) return false;
        var nowVerArr = nowVer.split(".");
        var minVerArr = minVer.split(".");
        var len = Math.max(nowVerArr.length, minVerArr.length);
        for(var i=0;i<len;i++){
            var nowVal = ~~nowVerArr[i]; //移位运算
            var minVal = ~~minVerArr[i];
            //console.log('nowVal:'+nowVal+"   minVal:"+minVal);
            if(nowVal < minVal){
                return true;
            }else if(nowVal > minVal){
                return false;
            }
        }
        return false;
    },
    /**
     * 过期处理
     * */
    sessionTimeOut: function (data,url) {
        var t = this;
        seajs.use("commonStaticDirectory/plugins/callAppHandler.js", function (w) {
            w.callAppHandler("h5_get_version","");
            var interval = setInterval(function(){
                //获取到version就取消查询
                if(gMain.appVersion){
                    clearInterval(interval);
                    if(!t.isLowerVersion(gMain.appVersion, "4.5")){ //不低于4.5版本
                        //app更新seesion信息，虚拟登录，重新请求当前接口
                        w.callAppHandler("h5_refresh_session",{});
                    }else{ //低于4.5版本,和PC端一样处理
                        url = url + "&source=" + (gMain.projectSource || "");
                        var $iframe = $('<iframe/>', {
                            src: url
                        });
                        $iframe.css({position:"absolute",bottom:0,left:0,width:"100px",height:"100px",visibility:"hidden"});
                        $iframe.appendTo('body');

                        $iframe[0].onload = function(){
                            var isSessionOut = false; //是否session过期了
                            var handleMessage = function(e) {
                                isSessionOut = true;
                                //如果登陆页面传回了url信息
                                if(e.data.iFrameHref){
                                    //跳转到登录页面，并带上service参数，使之能够正常的跳转回来，去掉setTimeout延迟，加快重新激活session速度，但是就是显示超时的提示看不到了
                                    var sUrl = location.protocol + "//" + location.host + location.pathname + location.search;
                                    var sHash = location.hash.substr(1); //去掉 #!后面的路由路径
                                    var sHref = gMain.DayHRDomains.baseStaticDomain + "static/common/html/go.html?router=" + encodeURIComponent(sHash) + "&url=" + encodeURIComponent(sUrl);
                                    window.location.href = gMain.DayHRDomains.passportDomain + "login?source="+(gMain.projectSource || "")+"&service=" + encodeURIComponent(sHref);
                                }
                            }
                            if(window.addEventListener){
                                window.addEventListener('message',handleMessage,false);
                            }else {
                                window.attachEvent('onmessage',handleMessage)
                            }
                            //如果没过期
                            setTimeout(function () {
                                if(!isSessionOut){
                                    $.ajax(data);
                                }
                            },100);
                            $iframe.remove();//移除iframe
                        }
                    }
                }
            }, 300);
        })
    },
    /**
     * 是否是移动端浏览器环境
     */
    isMobileBrowser:function () {
        var t = this;
        var flag = false;

        var sUserAgent = navigator.userAgent.toLowerCase();
        var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
        var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
        var bIsMidp = sUserAgent.match(/midp/i) == "midp";
        var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
        var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
        var bIsAndroid = sUserAgent.match(/android/i) == "android";
        var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
        var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";

        //如果是移动端就跳转到app下载页面
        if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
            flag = true;
        } else {
            flag = false;
        }
        return flag;
    },
    /**
     * 最后一个属性分割线---无实际意义----------------------------------------
     * */
    lastPrototype: undefined
};

/**
 * Created by save on 2017/7/19.
 */
define(function(require, exports, module) {
    var w = {};

    w.callAppHandler = function(handlerName,param){ //调用APP接口

        //发两次消息确保消息能够100%发送成功
        connectWebViewJavascriptBridge(function(bridge) {
            window.WebViewJavascriptBridge.callHandler(handlerName, param);
        });
            if(handlerName != "h5_address_list_picker_new") {
                setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler(handlerName, param);
                });
            }

    };


    //注册消息，用于APP调用
    function registerAppHandler(bridge){
        //点击右上角按钮回传按钮action

        bridge.registerHandler("h5_right_btn_callback", function(data, responseCallback) {

            var btnAction = data;

            switch (btnAction) {

                case "recruit_more":
                        $(".recruitDetail-more").slideToggle(300);
                    break;
                case "recruit_resume":
                        document.location="#!/resumePreview/"+gMain.resumeId;
                    break;
                default:

            }


            var responseData = "Javascript Says Right back aka!";

            responseCallback(responseData);
        })

        bridge.registerHandler("h5_address_list_callback_new", function(data, responseCallback) {

            var oData = data.replace(/\\/g, "");
            //接收数据后更新视图
            var oUserInfo = JSON.parse(oData.toString())["UserInfo"][0];
            if(oUserInfo["UserImg"]==""){
                var sHtml = '<ul><li data-id="'+oUserInfo["UserId"]+'" data-name="'+oUserInfo["UserName"]+'"><img src="'+gMain.baseStaticHrPath+'recruit/images/default_headImg.png" /><p>'+oUserInfo["UserName"]+'</p></li></ul>';
            }else{
                var sHtml = '<ul><li data-id="'+oUserInfo["UserId"]+'" data-name="'+oUserInfo["UserName"]+'"><img src="'+gMain.imgPath+oUserInfo["UserImg"]+'" /><p>'+oUserInfo["UserName"]+'</p></li></ul>';
            }
            $("#recruitDetail").find(".person").find(".float-right").html(sHtml);

            var responseData = "Javascript Says Right back aka!";

            responseCallback(responseData);

        });

    }

    function connectWebViewJavascriptBridge(callback) {
        if (window.WebViewJavascriptBridge) {
            callback(WebViewJavascriptBridge)
        } else {
            document.addEventListener(
                'WebViewJavascriptBridgeReady'
                , function() {
                    callback(WebViewJavascriptBridge)
                },
                false
            );
        }
    }
    connectWebViewJavascriptBridge(function(bridge) {
        bridge.init(function(message, responseCallback) {
            console.log('JS got a message', message);
            var data = {
                'Javascript Responds': 'Wee!'
        };
            console.log('JS responding with', data);
            responseCallback(data);
        });

        registerAppHandler(bridge);

    });


    function setupWebViewJavascriptBridge(callback) {
        if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
        if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }

        window.WVJBCallbacks = [callback];
        var WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
    }

    setupWebViewJavascriptBridge(function(bridge) {
        registerAppHandler(bridge);
    });


    module.exports = w;
});
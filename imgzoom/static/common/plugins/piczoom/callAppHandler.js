/**
 * 图片预览移动端h5跟app交互
 */
define(function(require, exports, module) {
    var w = {};

    w.callAppHandler = function(handlerName, param){ //调用APP接口
        setupWebViewJavascriptBridge(function(bridge) {
            bridge.callHandler(handlerName, param);
        });
    };

    //注册消息，用于APP调用
    function registerAppHandler(bridge){
        bridge.registerHandler("h5_get_version_callback", function(responseData, responseCallback) {
            if(responseData){
                var version = parseFloat(responseData);
                w.appVersion = version;
            }
            responseCallback("Javascript Says Right back aka!");
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
        try {
            bridge.init(function (message, responseCallback) {
                var data = {
                    'Javascript Responds': 'Wee!'
                };
                responseCallback(data);
            });
            registerAppHandler(bridge);
        } catch (e) {
            // 屏蔽初始化失败
        }
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
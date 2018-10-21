/**
 * Created by qiu_zheng on 2016/6/4.
 */
define(function(require, exports, module) {

    var w = {};

    w.callAppHandler = function(handlerName,param){ //调用APP接口

        //发两次消息确保消息能够100%发送成功
        connectWebViewJavascriptBridge(function(bridge) {
            window.WebViewJavascriptBridge.callHandler(handlerName, param);
        });

        //调用通讯录和查看人员信息不能发两次消息
        if((handlerName != "h5_address_list_picker_new") && (handlerName != "h5_open_daypan") && (handlerName != "h5_person_info") && (handlerName != "share_wechat") && (handlerName != "h5_photos_picker_new") && (handlerName != "h5_open_work_report") && (handlerName != "h5_address_list_picker")){

            setupWebViewJavascriptBridge(function(bridge) {
                bridge.callHandler(handlerName, param);
            });
        }

    };

    //注册消息，用于APP调用
    function registerAppHandler(bridge){
        //接收APP返回的版本号（4.2版本以后可用）
        bridge.registerHandler("h5_get_version_callback", function(data, responseCallback){
            if(data){
                gMain.appH5Version = data;
            }
            var responseData = "Javascript Says Right back aka!";
            responseCallback(responseData);
        });
        //右上角按钮回传数据
        bridge.registerHandler("h5_right_btn_callback", function(data, responseCallback) {
            console.log(data);
            //点击右上角按钮回传按钮action
            //var btnAction = data;
            switch(data){
                case "add-report":
                    var urls = location.href;
                    // location.href=gMain.basePath + "views/common/go.jsp?sPath="+encodeURIComponent('/views/report_mobile/')+"&sRouter="+encodeURIComponent('/chooseTemp');//选择汇报模板
                    window.location.href = "#!/chooseTemp";
                    break;
                case "search-report":
                    $(".report_header_tap").hide();
                    $(".fade_in_out").hide();
                    $("#report_app_received").css({"padding-top":"0"})
                    location.href = "#!/received/reportSearch";
                    break;
            }
            var responseData = "Javascript Says Right back aka!";
            responseCallback(responseData);
        });
        //左上角的按钮
        bridge.registerHandler("h5_left_btn_callback",function (data, responseCallback){
            switch (data){
                case "draft-save":
                    // $("#single_report_handle").find(".draft_cover_wrap").show();
                    if(localStorage.getItem("previewStyle")){
                        window.localStorage.removeItem("previewStyle");
                        window.localStorage.removeItem("previewReceiver");
                        window.localStorage.removeItem("previewForward");
                        window.localStorage.removeItem("previewTitle");
                    }
                    location.replace("#!/");
                    break;
                case "back_index":
                    window.location.href = "#!/";
                    break;
            }
            var responseData = "Javascript Says Right back aka!";
            responseCallback(responseData);
        });
        //选完通讯录回传数据 新接口
        bridge.registerHandler("h5_address_list_callback_new", function(data, responseCallback) {
            //data = "{\"OrganizeInfo\":[],\"PersonInfo\":[{\"PersonId\":\"100538429\",\"PersonName\":\"hello\"}]}";
            data = data.replace(/\\/g, "");
            data = JSON.parse(data);
            var personIds='',personNames='',organIds='',organNames='',personImg='';
            if(data){
                gMain.h5PersonInfo = data;
                // alert(JSON.stringify(data));
            }
            //投票发送对象
            if($("input[name=sendPeople]").length){
                var _val='';
                if(organNames && personNames){
                    _val = organNames +','+personNames;
                }else if(!organNames){
                    _val = personNames;
                }else if(!personNames){
                    _val = organNames;
                }

                $("input[name=sendPeople]").attr("data-pid",personIds).attr("data-oid",organIds).val(_val);
            }

            //分享投票给朋友
            if($(".vote_info_share_friend").length){
                $(".vote_info_share_friend").attr("data-pid",personIds).attr("data-oid",organIds);
            }
            var responseData = "Javascript Says Right back aka!";
            responseCallback(responseData);
        });
        //选完通讯录回传数据  老接口
        bridge.registerHandler("h5_address_list_callback", function(data, responseCallback) {
            //data = "{\"OrganizeInfo\":[],\"PersonInfo\":[{\"PersonId\":\"100538429\",\"PersonName\":\"hello\"}]}";
            //console.log("h5_address_list_callback data:", data);
            data = data.replace(/\\/g, "");
            data = JSON.parse(data);
            var personIds='',personNames='',organIds='',organNames='';

            if(data){
                gMain.h5PersonInfo = data;
                // alert(JSON.stringify(data));
            }

            //投票发送对象
            if($("input[name=sendPeople]").length){
                var _val='';
                if(organNames && personNames){
                    _val = organNames +','+personNames;
                }else if(!organNames){
                    _val = personNames;
                }else if(!personNames){
                    _val = organNames;
                }

                $("input[name=sendPeople]").attr("data-pid",personIds).attr("data-oid",organIds).val(_val);
            }

            //分享投票给朋友
            if($(".vote_info_share_friend").length){
                $(".vote_info_share_friend").attr("data-pid",personIds).attr("data-oid",organIds);
            }
            var responseData = "Javascript Says Right back aka!";
            responseCallback(responseData);
        });

        //选完日历回传数据
        bridge.registerHandler("h5_date_picker", function(data, responseCallback) {

            var year = data.split('-')[0];
            var month = parseInt(data.split('-')[1],10);

            var date = year + '年' + month + '月';
            $(".salary_bill_header_date").text(date);
            var responseData = "Javascript Says Right back aka!";
            responseCallback(responseData);
        });

        //更新token回传数据
        bridge.registerHandler("h5_get_token", function(data, responseCallback) {
            gMain.token = data;
            //console.log("h5_get_token data:", data);
            var responseData = "Javascript Says Right back aka!";
            responseCallback(responseData);
        });

        //本地选完照片返回数据
        bridge.registerHandler("h5_get_photos_new", function(data, responseCallback){
            if(typeof data == "string"){
                data = JSON.parse(data);
            }
            if(data){
                gMain.h5ImgList = [];
                for(var i =0 ;i<data.length; i++){
                    var imgList = {
                        name: data[i].name,
                        size:data[i].size,
                        src:data[i].src
                    }
                    gMain.h5ImgList.push(imgList);
                }
                gMain.getPhoteosNew = true;
            }
            var responseData = "Javascript Says Right back aka!";
            responseCallback(responseData);
        });

        //day盘选完附件返回数据
        bridge.registerHandler("h5_open_daypan_callback", function(data, responseCallback){
            if(typeof data == "string"){
                data = JSON.parse(data);
            }
            if(data){
                gMain.h5FileDayoa = [];
                for(var i =0 ;i<data.length; i++){
                    var fileList = {
                        dfsId: data[i].dfsId,
                        fileSort:data[i].fileSort,
                        fileName:data[i].fileName,
                        fileSize:data[i].fileSize
                    }
                    gMain.h5FileDayoa.push(fileList);
                }
            }
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
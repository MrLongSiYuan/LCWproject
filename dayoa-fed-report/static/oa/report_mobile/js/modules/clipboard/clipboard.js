/**
 * Created by THINK on 2017/7/17.
 */
define(function (require,exports,module) {
    require("js/modules/clipboard/clipboard.css");
    var sTpl = require("js/modules/clipboard/clipboard.html");
    var w = require("js/plugins/callAppHandler.js");
    var GetPersonInfor = require("js/plugins/getPersonInfor.js")
    var _ver = require("js/plugins/versionHeader.js");  //判断是否4.5版本以上

    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框

    var VueComponent = Vue.extend({
        template: sTpl
        ,data:function(){
            return {
                gMain:gMain
                ,showFlag:false
                ,centerBoxShow:false  //显示
                ,noteInterval:"" //定时器
                ,noteContent:"" //便签内容
                ,noteNumber:0 //便签字数
                ,manualSaveTime:""
                ,autoSavaTime:""
                ,personId:""
                ,firstOpen:false  //是否为第一次打开
                ,autoFlag:false //显示自动保存
                ,manualFlag:false //显示手动保存时间
                ,winTop:0
                ,isTouchmove:false  //触发touchmove
            }
        }
        ,attached:function () {
            var t = this;
            t.showFlag = true;
            // t.initPageHeader();
            if(gMain.personInforReport && gMain.personInforReport.personId){
                t.personId = gMain.personInforReport.personId;
            }else{
                GetPersonInfor();
                t.personId = gMain.personInforReport.personId;
            }
            if(localStorage.getItem(t.personId+"-note") && localStorage.getItem(t.personId+"-note") != "null"){   //有缓存数据则使用缓存数据
                var getAutoData = JSON.parse(localStorage.getItem(t.personId+"-note"));
                var  nowDate = new Date();
                var  manualDate = new Date(getAutoData.manualSaveTime);
                if(nowDate.getMonth() == manualDate.getMonth()){  //当月
                    if(nowDate.getDate() == manualDate.getDate()){  //当天
                        t.manualSaveTime = "今天"+getAutoData.manualSaveTime.slice(5);
                    }else if(nowDate.getDate()-1 == manualDate.getDate()){ //昨天
                        t.manualSaveTime = "昨天"+getAutoData.manualSaveTime.slice(5);
                    }else{
                        t.manualSaveTime = getAutoData.manualSaveTime;
                    }
                }else{
                    t.manualSaveTime = getAutoData.manualSaveTime;
                }
                t.noteContent = getAutoData.noteContent;
                t.autoSavaTime = getAutoData.autoSavaTime;
                t.noteNumber = t.noteContent.length;
                if(getAutoData.manualSaveTime){ //缓存中有手动保存的时间则先显示手动保存时间
                    t.manualFlag = true;
                    setTimeout(function () {
                        t.manualFlag = false;
                        t.autoFlag = true;
                    },60000)
                }else{
                    t.autoFlag = true;
                }
            }
            if(localStorage.getItem(t.personId+"firstNote") && localStorage.getItem(t.personId+"firstNote") == "note"){  //判断是否是第一次打开这个
                t.firstOpen = false;
            }else {
                localStorage.setItem(t.personId+"firstNote","note");
                t.firstOpen = true;
                setTimeout(function () {
                    t.firstOpen = false;
                },60000)
            }
            clearInterval(t.noteInterval);
            t.noteInterval = setInterval(function () {    //定时保存
                var  nowDate = new Date();
                var  month = (nowDate.getMonth() + 1) < 10 ? '0'+(nowDate.getMonth() + 1):(nowDate.getMonth() + 1);
                var day = nowDate.getDate()<10 ? '0'+nowDate.getDate():nowDate.getDate();
                var hours = nowDate.getHours()<10 ? '0'+nowDate.getHours():nowDate.getHours();
                var minute = nowDate.getMinutes()<10 ? '0'+nowDate.getMinutes():nowDate.getMinutes();
                t.autoSavaTime = month+"/"+day+" "+hours+":"+minute;
                var autoData = {
                    manualSaveTime:t.manualSaveTime,
                    autoSavaTime:t.autoSavaTime,
                    noteContent:t.noteContent
                }
                localStorage.setItem(t.personId+"-note",JSON.stringify(autoData));
            },1000);
            $("#clipboard_wrap").bind("touchmove",function (e) {
                t.winTop = $("body").scrollTop();
                t.isTouchmove = true;
                if(t.judgeMobileType() == "1"){
                    $("body").css({position:"fixed"});
                }
                $("body").css({position:"fixed"});
                $("#clipboard_wrap").unbind("touchmove");
            })
        },
        beforeDestroy:function () {
            var t = this;
            clearInterval(t.noteInterval);
        }
        , route: {
            canDeactivate: function(data){
                var t = this;
                t.showFlag = false;
                setTimeout(function(){
                    data.next();
                }, 400)
            }
        }
        ,methods:{
            /*
             * 头部
             * */
            initPageHeader:function (){
                var headerColor;
                if(_ver.versionHeader()){
                    headerColor = "";
                }else{
                    headerColor = "473f3a";
                }
                var data = {
                    leftBtn: "back", //左边按钮，””表示无左边按钮
                    headerColor: headerColor, //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title","便签");
            },
            /*
            * 删除内容
            * */
            deleteContent:function (str) {
                var t = this;
                if(str == '0'){
                    $("#clipboard_wrap .draft_cover_wrap").hide();
                }else{
                    $("#clipboard_wrap .draft_cover_wrap").hide();
                    if(t.noteContent.length != 0){
                        amyLayer.alert("操作成功");
                        $(".shade_alert").css({"z-index":"999999"});
                    }
                    t.noteContent = "";
                    t.manualSaveTime = "";
                    t.manualFlag = false;
                    t.autoFlag = true;
                    localStorage.removeItem(t.personId+"-note");
                }
            },
            judgeMobileType:function () {
                var u = navigator.userAgent, app = navigator.appVersion;
                if(/AppleWebKit.*Mobile/i.test(navigator.userAgent) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))){
                    if(window.location.href.indexOf("?mobile")<0){
                        try{
                            if(/iPhone|mac|iPod|iPad/i.test(navigator.userAgent)){
                                return '0';
                            }else{
                                return '1';
                            }
                        }catch(e){}
                    }
                }else if( u.indexOf('iPad') > -1){
                    return '2';
                }else{
                    return '3';
                }
            },
            /*
            *清空
            * */
            delteAllBtn:function () {
                var t = this;
                if(t.noteContent.length != 0){
                    $("#clipboard_wrap .draft_cover_wrap").show();
                }
            },
            /*
            * 保存/复制全部
            * */
            saveContentBtn:function () {
                var t = this;
                t.manualSaveTime = t.autoSavaTime;
                var autoData = {
                    manualSaveTime:t.manualSaveTime,
                    autoSavaTime:t.autoSavaTime,
                    noteContent:t.noteContent
                }
                // localStorage.setItem(t.personId+"-note",JSON.stringify(autoData));
                if(t.noteContent.length != 0){
                    if(t.judgeMobileType() == "1"){
                        amyLayer.alert("已复制到粘贴板");
                        $(".shade_alert").css({"z-index":"999999"});
                    }
                    w.callAppHandler("dayhr_eval_copy",t.noteContent);
                }else{
                    amyLayer.alert("便签内容为空！");
                    $(".shade_alert").css({"z-index":"999999"});
                }
            },
            /*
            * 关闭
            * */
            closeClipboard:function () {
                var t = this;
                $("#clipboard_wrap .draft_cover_wrap").hide();
                if(t.isTouchmove){
                    if(t.judgeMobileType() == "1"){
                        $("body").css({position:""});
                    }
                    $("body").css({position:""});
                    $("body").scrollTop(t.winTop);
                }
                t.centerBoxShow = false;
                history.back();
            }
        }
        ,transitions:{
            "in_fade":{
                enter:function () {
                    var t = this;
                    t.centerBoxShow = true;
                }
            },
            "in_right":{
                leave:function () {
                    var t = this;
                    t.showFlag = false;
                    // log("in_rihgt");
                }
            }
        }
    });

    module.exports = VueComponent;
});
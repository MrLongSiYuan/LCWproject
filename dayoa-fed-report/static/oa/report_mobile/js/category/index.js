/**
 * 首页
 */

define(function (require,exports,module) {
    require("css/index.css");
    var sTpl = require("templates/index.html");
    var Ajax = require("js/ajax");
    var w = require("js/plugins/callAppHandler.js");
    var v = require("commonStaticDirectory/plugins/isSupported.js");
    var _ver = require("js/plugins/versionHeader.js");  //判断是否4.5版本以上

    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框
    require("../modules/reportsListClassify/reportsListClassify.js");

    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function(){
            return {
                gMain:gMain,
                coverShow:false,
                firstGetRportList:true,
                requestFlag:false,
                tempId:null,
                delDraftuuid:null, //删除草稿汇报id
                delDraftnum:0,  //删除草稿的个数
                reportTotal:0,
                sParams:"",  //路由参数默认值
                moreDataList:true,
                typeListShow:false,
                searchInit:false,
                reportTypeList:[],      //汇报类型
                loadData:{           //加载数据
                   onePageNum:5,    //一页显示的数据
                   pageNumber:0,     //当前页码
                },
                reportListInfo:{     //汇报列表信息
                    reportList:[],
                    reportSource:"sendOut"
                },
            }
        }
        /**
         * 监控路由改变
         * */
        ,route: {
            data: function (transition) {
                return {
                    sParams: transition.to.fullPath
                }
            }
        }
        ,watch:{
            'sParams': function (val) {
                var t = this;
                if(val == '/' && gMain.reportAvailableVersion && gMain.reportAvailableVersion == "available"){
                    t.initPageHeader();
                    t.winInitSrollEvent();
                    t.inputNoteBtnMove();
                }
            }
        }
        ,attached:function () {
            var t = this;
            // alert(location.href);
            if(!v.isSupported()){ //旧版 APP 不支持，弹出升级提示，并不再渲染页面
                $("#report_app_index").hide();
                t.lowVersionInitPageHeader();
                return false;
            }else{
                gMain.reportAvailableVersion = "available";   //用来判断详情是由哪里进入，由应用进入且版本可用则有此全局变量
                t.initPageHeader();
            }
            if(JSON.parse(window.localStorage.getItem("previewStyle"))){  //有，清除
                window.localStorage.removeItem("previewStyle");
                window.localStorage.removeItem("previewReceiver");
                window.localStorage.removeItem("previewForward");
                window.localStorage.removeItem("previewTitle");
            }
            $("#report_app_index").find(".dropload-refresh").hide();
            $("#report_app_index").find(".dropload-load").hide();
            $("#report_app_index").find(".dropload-noData").hide();
            // t.getReportType();
            if(sessionStorage.getItem("listInfor")){
                var listInforData = JSON.parse(sessionStorage.getItem("listInfor"));
                sessionStorage.removeItem("listInfor");
                t.reportListInfo = listInforData.reportListInfo;
                t.reportTotal = listInforData.reportTotal;
                t.loadData = listInforData.loadData;
                t.tempId = listInforData.tempId;
                t.personName = listInforData.personName;
                t.endTime = listInforData.endTime;
                t.startTime = listInforData.startTime;
                t.firstGetRportList = false;
                if(t.tempId){
                    $(".report_type_btn").find(" span").text(listInforData.tempName);
                }
                if(t.reportListInfo.reportList.length < t.reportTotal){
                    $("#report_app_index").find(".dropload-load").show();
                }
                setTimeout(function () {
                    $(window).scrollTop(listInforData.winTop);
                },50)
            }else{
                t.getReportListData("first");
            }
            t.winInitSrollEvent();
            try{
                $("#report_app_index_test").remove();
            }catch(e){}
            try{
                $("#loading_wrap_detail").remove();
            }catch(e){}
        }
        ,compiled:function () {
        }
        ,methods:{
            //获取页面顶部被卷起来的高度
            scrollTop:function () {
                return Math.max(
                    //chrome
                    document.body.scrollTop,
                    //firefox/IE
                    document.documentElement.scrollTop
                );
            },
            winInitSrollEvent:function () {
                var t = this;
                $(window).bind('scroll',function(){
                    if ($(document).scrollTop() + $(window).height() + 20 > $(document).outerHeight() && (t.reportListInfo.reportList.length < t.reportTotal) && !t.requestFlag) {
                        $("#report_app_index").find(".dropload-refresh").hide();
                        $("#report_app_index").find(".dropload-load").show();
                        $("#report_app_index").find(".dropload-noData").hide();
                        if(t.tempId){
                            t.searchTemplateForType("load");
                        }else {
                            t.getReportListData();
                        }
                    }else if($(document).scrollTop() + $(window).height() + 20 > $(document).outerHeight() && t.reportListInfo.reportList.length!=0 && !(t.reportListInfo.reportList.length < t.reportTotal)){
                        $("#report_app_index").find(".dropload-refresh").hide();
                        $("#report_app_index").find(".dropload-load").hide();
                        $("#report_app_index").find(".dropload-noData").show();
                    }
                });
            },
            //获取页面文档的总高度
            documentHeight:function () {
                //现代浏览器（IE9+和其他浏览器）和IE8的document.body.scrollHeight和document.documentElement.scrollHeight都可以
                return Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);
            },
            //获取页面浏览器视口的高度
            windowHeight:function () {
                return (document.compatMode == "CSS1Compat") ? document.documentElement.clientHeight : document.body.clientHeight;
            },
            initPageHeader: function () {
                var t = this,headerColor,btnUrl;
                if(_ver.versionHeader()){
                    headerColor = "";
                    btnUrl = gMain.baseStaticPath + "oa/report_mobile/images/title_icon_add_def.png";
                }else{
                    headerColor = "473f3a";
                    btnUrl = gMain.baseStaticPath + "oa/report_mobile/images/nav_icon_add_def3x.png";
                }
                var data = {
                    leftBtn: "close", //左边按钮，””表示无左边按钮
                    headerColor: headerColor, //导航条背景颜色，””表示默认颜色
                    rightBtn: [
                        {
                            btnAction: "add-report",
                            btnUrl:btnUrl,
                            btnName: "",
                            btnParam: {}
                        },
                    ]
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title","工作汇报");
            },
            /*
            * 进入便签按钮拖拽
            * */
            inputNoteBtnMove:function () {
                var t = this;
                $("#report_clipboard_inputBtn").on("touchstart",function (e) {
                    var $this = $(this);
                    var starX,starY,elleft,eltop,disX,disY,endX,endY;
                    starX = e.originalEvent.changedTouches[0].pageX;
                    starY = e.originalEvent.changedTouches[0].pageY;

                    elleft = $this.offset().left;
                    eltop = $this.offset().top - $(window).scrollTop();
                    /*点击位置距离元素左侧上侧的距离*/
                    disX = starX - elleft;
                    disY = starY - eltop;

                    $this.off("touchmove").on("touchmove", function (e) {
                        endX = e.originalEvent.changedTouches[0].pageX - disX;
                        endY = e.originalEvent.changedTouches[0].pageY - disY;
                        if(endX > $(window).width()-45){
                            endX = $(window).width()-45;
                        }
                        if(endX < 0){
                            endX = 0;
                        }
                        if(endY > $(window).height()-33){
                            endY = $(window).height()-33;
                        }
                        if(endY < 33){
                            endY = 33;
                        }
                        $this.css({"top":endY+"px"});

                        e.preventDefault();
                        e.stopPropagation();
                    })
                });
            },
            /*
            * 低版本的头部
            * */
            lowVersionInitPageHeader:function (){
                var data = {
                    leftBtn: "close", //左边按钮，””表示无左边按钮
                    headerColor: "473f3a", //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title","工作汇报");
            },

            /*
            * 覆盖层
            * */
            showCover:function () {
                var t = this;
                var tempActive = function () {
                    if(t.tempId){
                        $("#report_app_index").find(".reportType_list_wrap .report_type_list_btn").each(function () {
                            if($(this).attr("temp-id") == t.tempId){
                                $(this).attr("class","report_type_list_btn active");
                                $(this).siblings("li").attr("class","report_type_list_btn")
                                $(this).parent().siblings(".all_reportType_btn").attr({class:"all_reportType_btn"});
                            }
                        })
                    }
                }
                if(t.reportTypeList.length != 0){
                    $("body").css({position:"fixed"});
                    t.coverShow = true;
                    tempActive();
                }else{
                    $.when(t.getReportType()).done(function () {
                        $("body").css({position:"fixed"});
                        t.coverShow = true;
                        setTimeout(tempActive,50);
                    })
                }
            },
            hideCover:function () {
                var t = this;
                $("body").css({position:""});
                t.typeListShow = false;
            },
            /*
            *切换到我收到的
            * */
            jumpReceived:function () {
                window.location.href = "#!/received";
            },
            /*
            * 跳转到便签页
            * */
            jumpClipboard:function () {
                var  t = this;
                if($("#clipboard_wrap").length && $("#clipboard_wrap").length != 0){
                    return false;
                }else{
                    location.href = "#!/clipboard"
                }
            },
            /*
            * 进入删除汇报界面
            * */
            inDeleteDraft:function (uuid) {
                var t = this;
                t.delDraftuuid = uuid;
                $("#report_app_index").find(".draft_cover_wrap").show();
            },
            /*
             * 退出删除汇报界面
             * */
            outDeleteDraft:function () {
                var t = this;
                t.delDraftuuid = null;
                $("#report_app_index").find(".draft_cover_wrap").hide();
            },
            /*
             * 删除草稿
             * */
            deleteDraftReport:function (str) {
                var t = this;
                if(str == "0"){    //不删除此汇报
                    t.outDeleteDraft();
                }else if(str == "1"){   //确定删除
                    Ajax.ajax({
                        url:gMain.apiBasePath + "wrReportData/deleteReportData.do",
                        data:JSON.stringify({
                            reportId:t.delDraftuuid+""
                        }),
                        beforeSend:function () {
                            $("#loading_wrap").show();
                        },
                        complete:function () {
                            $("#loading_wrap").hide();
                        },
                        success:function(data) {
                            if (data.result == "true") {
                                for(var i = 0;i<t.reportListInfo.reportList.length;i++){  //删除dom
                                    if(t.reportListInfo.reportList[i].uuid == t.delDraftuuid){
                                        t.reportListInfo.reportList.splice(i,1);
                                        t.reportTotal -= 1;
                                        t.delDraftnum += 1;
                                        t.outDeleteDraft();
                                    }
                                }
                                amyLayer.alert("删除成功"); //成功提示弹层
                            }
                        }
                    });
                }
            },
            /*
            * 获取汇报 类型( 发起/收到)
            * */
            getReportType:function () {
                var t = this,postUrl;
                var df = $.Deferred();
                postUrl = gMain.apiBasePath + "wrReportTemp/getReportTemplates.do";
                Ajax.ajax({
                    url:postUrl,
                    data:JSON.stringify({

                    }),
                    beforeSend:function () {
                    },
                    complete:function () {
                    },
                    success:function(data) {
                        if(data.result == "true"&&data.data.list){
                            t.reportTypeList = data.data.list.slice(0);
                            df.resolve();
                        }
                    }
                });
                return df;
            },
            /*
            * 跳转APP低版本汇报首页
            * */
            goHistoryReport:function () {
                w.callAppHandler("h5_open_work_report");
            },
            /*
            * 获取汇报列表
            * */
            getReportListData:function (firstStr) {
                var t = this,postUrl;
                postUrl = gMain.apiBasePath + "wrReportData/appListReportDataByStatus.do";
                Ajax.ajax({
                    url:postUrl,
                    data:JSON.stringify({
                        limit:t.loadData.onePageNum.toString(),
                        offset:(t.loadData.pageNumber*t.loadData.onePageNum - t.delDraftnum).toString(),                    //起始值
                    }),
                    beforeSend:function () {
                        t.requestFlag = true;
                        if(t.firstGetRportList){
                            $("#loading_wrap").show();
                        }
                    },
                    complete:function () {
                        t.requestFlag = false;
                    },
                    success:function(data) {
                        if(t.firstGetRportList){
                            $("#loading_wrap").hide();
                        }
                        if(data.result == "true"&&data.data.list){
                            t.reportTotal = data.data.recordCount;
                            t.loadData.pageNumber += 1;
                            for(var i = 0;i<data.data.list.length;i++){
                                data.data.list[i].dateParam = t.getDateParam(data.data.list[i].modifyTime);
                                data.data.list[i].nodeData = JSON.parse(data.data.list[i].nodeData);  //转数组
                                data.data.list[i].nodeData = t.deleteOverduePicUrl(data.data.list[i].nodeData); //去掉后台传回的过期图片地址
                                data.data.list[i].createTime = data.data.list[i].modifyTime.slice(0,-3);
                            }
                            t.reportListInfo.reportList = t.reportListInfo.reportList.concat(data.data.list.slice(0));
                            if(t.firstGetRportList && t.reportListInfo.reportList.length<4){
                                $("#report_app_index").find(".dropload-refresh").hide();
                                $("#report_app_index").find(".dropload-load").hide();
                                $("#report_app_index").find(".dropload-noData").hide();
                            }else{
                                $("#report_app_index").find(".dropload-refresh").show();
                                $("#report_app_index").find(".dropload-load").hide();
                                $("#report_app_index").find(".dropload-noData").hide();
                            }
                            t.firstGetRportList = false;
                        }else {
                            $("#report_app_index").find(".dropload-refresh").hide();
                            $("#report_app_index").find(".dropload-load").hide();
                            $("#report_app_index").find(".dropload-noData").hide();
                            if(firstStr && firstStr == "first"){
                                $(".report_content_list_wrap").find(".no-data-page").show();
                            }
                        }
                    }
                });
            },
            /*
             * 去掉后台传回的过期图片地址
             * */
            deleteOverduePicUrl:function (arr) {
                for(var i = 0;i<arr.length;i++){
                    if(arr[i].field_type == "pic" && arr[i].valueUrls){
                        arr[i].valueUrls = [];
                    }
                }
                return arr;
            },
            /*
            * 汇报搜索事件
            * */
            searchTempEvent:function (e,tempId) {
                var t = this;
                t.tempId = tempId+"";
                t.loadData.pageNumber = 0;
                t.delDraftnum = 0;
                var $dom = $(e.target);
                var domName = e.target.localName;
                if(domName == "div"){
                    $dom.attr({class:"all_reportType_btn active"});
                    $dom.siblings("ul").find("li").attr({class:"report_type_list_btn"});
                    var text = $dom.context.innerHTML;
                    $("#report_app_index").find(".report_type_btn span").text(text);
                }else if(domName == "li"){
                    $dom.attr({class:"report_type_list_btn active"});
                    $dom.siblings("li").attr({class:"report_type_list_btn"});
                    $dom.parent().siblings(".all_reportType_btn").attr({class:"all_reportType_btn"});
                    var text = $dom.context.innerHTML;
                    $("#report_app_index").find(".report_type_btn span").text(text);
                }
                t.reportListInfo.reportList = [];
                t.searchTemplateForType();
            },
            /*
             * 根据(类型)(分页信息)搜索汇报(发起/收到)（已阅/未阅）
             * */
            searchTemplateForType:function (str) {
                var t = this,postUrl,postData;
                postUrl = gMain.apiBasePath + "wrReportData/appListReportDataByStatus.do";
                postData = {
                    tempId:t.tempId+"",
                    limit:t.loadData.onePageNum.toString(),
                    offset:(t.loadData.pageNumber*t.loadData.onePageNum - t.delDraftnum).toString(),
                }
                Ajax.ajax({
                    url:postUrl,
                    data:JSON.stringify(postData),
                    beforeSend:function () {
                        t.hideCover();
                        t.requestFlag = true;
                        if(str != "load"){
                            $("#loading_wrap").show();
                        }
                    },
                    complete:function () {
                        t.requestFlag = false;
                        if(str != "load"){
                            $("#loading_wrap").hide();
                        }
                    },
                    success:function(data) {
                        if (data.result == "true" && data.data.list) {
                            t.reportTotal = data.data.recordCount;
                            t.loadData.pageNumber += 1;
                            for(var i = 0;i<data.data.list.length;i++){
                                data.data.list[i].dateParam = t.getDateParam(data.data.list[i].modifyTime);
                                data.data.list[i].nodeData = JSON.parse(data.data.list[i].nodeData);  //转数组
                                data.data.list[i].nodeData = t.deleteOverduePicUrl(data.data.list[i].nodeData); //去掉后台传回的过期图片地址
                                data.data.list[i].createTime = data.data.list[i].modifyTime.slice(0,-3);
                            }
                            t.reportListInfo.reportList = t.reportListInfo.reportList.concat(data.data.list.slice(0));
                            if(t.reportListInfo.reportList.length<4){
                                $("#report_app_index").find(".dropload-refresh").hide();
                                $("#report_app_index").find(".dropload-load").hide();
                                $("#report_app_index").find(".dropload-noData").hide();
                            }else{
                                $("#report_app_index").find(".dropload-refresh").show();
                                $("#report_app_index").find(".dropload-load").hide();
                                $("#report_app_index").find(".dropload-noData").hide();
                            }
                        }else {
                            t.reportListInfo.reportList = [];
                            $("#report_app_index").find(".dropload-refresh").hide();
                            $("#report_app_index").find(".dropload-load").hide();
                            $("#report_app_index").find(".dropload-noData").hide();
                        }
                    }
                });
            },
            /*
             * 当月的第几周
             * */
            getDateParam:function (date) {
                var nowDate =new Date(date.slice(0,10));//截取日期字符串转换问日期变量
                var theWeek = nowDate.getDay(); //当天为周几
                var daysOfMonth = nowDate.getDate(); //这个月的第几天
                var monthOfYear = nowDate.getMonth()+1; //今年的几月份
                var theYear = nowDate.getFullYear(); //年
                var weekOfMonth = "";   //这个月的第几周
                var arr = ["日","一","二","三","四","五","六"];
                if(theWeek == 0){     //这天刚好是周日
                    weekOfMonth = Math.ceil(daysOfMonth/7);
                }else {
                    weekOfMonth = Math.ceil((daysOfMonth + 7 - theWeek)/7);
                }
                var theWeekStr = theWeek+"";
                theWeekStr ="周" + theWeekStr.replace(new RegExp(theWeekStr, "g"),arr[theWeek]);
                var dateParameter = {
                    "theWeekStr":theWeekStr,        //周几
                    "monthOfYear":monthOfYear<10 ? "0"+monthOfYear : monthOfYear,
                    "weekOfMonth":weekOfMonth+"",
                    "theYear":theYear+"",
                    "daysOfMonth":daysOfMonth<10 ? "0"+daysOfMonth : daysOfMonth,
                    "createDate":date.slice(0,10),
                }
                return dateParameter;
            }
        }
        ,transitions:{
            "fade_cover":{
                enter:function () {
                    var t = this;
                    t.typeListShow = true;
                }
            },
            "type_rise":{
                leave:function () {
                    var t = this;
                    t.coverShow = false;
                }
            }
        }

    });
    module.exports = VueComponent;
});


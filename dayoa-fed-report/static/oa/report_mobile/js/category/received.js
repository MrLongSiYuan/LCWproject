/**
 * 首页
 */

define(function (require,exports,module) {
    require("css/received.css");
    var sTpl = require("templates/received.html");
    var Ajax = require("js/ajax");
    var w = require("js/plugins/callAppHandler.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var v = require("commonStaticDirectory/plugins/isSupported.js");
    var _ver = require("js/plugins/versionHeader.js");  //判断是否4.5版本以上


    require("../modules/reportsListClassify/reportsListClassify.js");
    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框
    require("../modules/reportSearch/reportSearch.js");

    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function(){
            return {
                gMain:gMain,
                coverShow:false,
                firstGetRportList:true,
                tempId:null,
                personName:"",
                startTime:"",
                endTime:"",
                reportTotal:0,
                childChooseTemp:false,//是否是子路由在选择模板
                sParams:"",  //路由参数默认值
                requestFlag:false,
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
                    reportSource:"received"
                }
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
                if(val == '/received'){
                    $(".report_header_tap").show();
                    $(".fade_in_out").show();
                    $("#report_app_received").css({"padding-top":""})
                    t.initPageHeader();
                    t.initScrollEvent();
                    t.inputNoteBtnMove();
                }
            }
        }
        ,attached:function () {
            var t = this;
            // if(!v.isSupported()){ //旧版 APP 不支持，弹出升级提示，并不再渲染页面
            //     return false;
            // }
            t.getReportType();
            $("#report_app_received").find(".dropload-refresh").hide();
            $("#report_app_received").find(".dropload-load").hide();
            $("#report_app_received").find(".dropload-noData").hide();
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
                if(t.tempId){
                    $(".report_type_btn").find(" span").text(listInforData.tempName);
                }
                $.each(t.reportListInfo.reportList,function (num,val) {
                    if(val.uuid == listInforData.reportId){
                        t.reportListInfo.reportList[num].readInfo.isRead = 1;
                    }
                })
                t.firstGetRportList = false;
                if(t.reportListInfo.reportList.length < t.reportTotal){
                    $("#report_app_index").find(".dropload-load").show();
                }
                setTimeout(function () {
                    $(window).scrollTop(listInforData.winTop);
                },50)
            }else{
                t.getReportListData("first");
            }
            t.initPageHeader();
            t.initScrollEvent();
        }
        ,compiled:function () {

        }
        ,methods:{
            initPageHeader: function () {
                var headerColor;
                if(_ver.versionHeader()){
                    headerColor = "";
                }else{
                    headerColor = "473f3a";
                }
                var data = {
                    leftBtn: "back_index", //左边按钮，””表示无左边按钮
                    headerColor: headerColor, //导航条背景颜色，””表示默认颜色
                    rightBtn: [
                        {
                            btnAction: "search-report",
                            btnUrl:gMain.baseStaticPath + "oa/report_mobile/images/nav_icon_filter_def3x.png",
                            btnName: "筛选",
                            btnParam: {}
                        },
                        {
                            btnAction: "add-report",
                            btnUrl:gMain.baseStaticPath + "oa/report_mobile/images/nav_icon_add_def3x.png",
                            btnName: "新增",
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
             * 滚动事件
             * */
            initScrollEvent:function () {
                var t = this;
                $(window).bind('scroll',function(){
                    if ($(document).scrollTop() + $(window).height() + 20 > $(document).outerHeight() && (t.reportListInfo.reportList.length < t.reportTotal) && !t.requestFlag) {

                        $("#report_app_received").find(".dropload-refresh").hide();
                        $("#report_app_received").find(".dropload-load").show();
                        $("#report_app_received").find(".dropload-noData").hide();
                        if(t.tempId || t.personName || (t.startTime && t.endTime)){    //有搜索汇报名、人名、时间则继续在此条件下加载
                            t.searchTemplateForType("load");
                        }else {
                            t.getReportListData();
                        }
                    }else if($(document).scrollTop() + $(window).height() + 20 > $(document).outerHeight() && t.reportListInfo.reportList.length!=0 && !(t.reportListInfo.reportList.length < t.reportTotal)){
                        $("#report_app_received").find(".dropload-refresh").hide();
                        $("#report_app_received").find(".dropload-load").hide();
                        $("#report_app_received").find(".dropload-noData").show();
                    }
                });
            },
            /*
             * 覆盖层
             * */
            showCover:function (str) {
                var t = this;
                t.coverShow = true;
                $("body").css({position:"fixed"});
                if(t.tempId){
                    $("#report_app_received").find(".reportType_list_wrap .report_type_list_btn").each(function () {
                        if($(this).attr("temp-id") == t.tempId){
                            $(this).attr("class","report_type_list_btn active");
                            $(this).siblings("li").attr("class","report_type_list_btn")
                            $(this).parent().siblings(".all_reportType_btn").attr({class:"all_reportType_btn"});
                        }
                    })
                }
                str == "childRouter" ? t.childChooseTemp = true : t.childChooseTemp = false;
            },
            hideCover:function () {
                var t = this;
                $("body").css({position:""});
                t.typeListShow = false;
            },
            /*
             * 跳转到便签页
             * */
            jumpClipboard:function () {
                var  t = this;
                if($("#clipboard_wrap").length && $("#clipboard_wrap").length != 0){
                    return false;
                }else{
                    location.href = "#!/received/clipboard";
                }
            },
            /*
             * 跳转APP低版本汇报首页
             * */
            goHistoryReport:function () {
                w.callAppHandler("h5_open_work_report");
            },
            /*
             * 搜索汇报
             * */
            searchReport:function () {
                var t = this;
                $(".report_header_tap").hide();
                $(".fade_in_out").hide();
                $("#report_app_received").css({"padding-top":"0"})
                location.href = "#!/received/reportSearch";
            },
            /*
             *切换到我发出的
             * */
            jumpSendOut:function () {
                window.location.href = "#!/";
            },
            /*
             * 获取汇报 类型( 发起/收到)
             * */
            getReportType:function () {
                var t = this,postUrl;
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
                        }
                    }
                });
            },
            /*
             * 汇报搜索事件
             * */
            searchTempEvent:function (e,tempId,tempName) {
                var t = this;
                t.tempId = tempId;
                t.loadData.pageNumber = 0;
                t.personName = "";
                t.endTime = "";
                t.startTime = "";     //只保留tempId
                var $dom = $(e.target);
                var domName = e.target.localName;
                if(domName == "div"){
                    $dom.attr({class:"all_reportType_btn active"});
                    $dom.siblings("ul").find("li").attr({class:"report_type_list_btn"});
                    var text = $dom.context.innerHTML;
                    $("#report_app_received").find(".report_type_btn span").text(text);
                }else if(domName == "li"){
                    $dom.attr({class:"report_type_list_btn active"});
                    $dom.siblings("li").attr({class:"report_type_list_btn"});
                    $dom.parent().siblings(".all_reportType_btn").attr({class:"all_reportType_btn"});
                    var text = $dom.context.innerHTML;
                    $("#report_app_received").find(".report_type_btn span").text(text);
                }
                t.reportListInfo.reportList = [];
                if(t.childChooseTemp){
                    if(tempName){
                        $("#report_app_received").find(".report_template_wrap input").val(tempName);
                    }else{
                        $("#report_app_received").find(".report_template_wrap input").val("全部");
                    }

                    $("#report_app_received").find(".report_template_wrap input").attr({"temp-id":tempId});
                    t.hideCover();
                }else {
                    t.searchTemplateForType("search");
                }
            },
            /*
             * 根据(类型)(分页信息)搜索汇报(发起/收到)（已阅/未阅）
             * */
            searchTemplateForType:function (str,postSearchData) {
                var t = this,postUrl,postData;
                postUrl = gMain.apiBasePath + "wrReportReceiveData/appListReportReceiveData.do";
                if(str == "search"){   //如果是搜索则需清空当前的汇报列表
                    t.reportListInfo.reportList = [];
                }
                if(postSearchData){
                    postData = postSearchData;
                    t.loadData.pageNumber = 0;
                    t.tempId = postSearchData.tempId;
                    t.personName = postSearchData.personName;
                    t.endTime = postSearchData.endTime;
                    t.startTime = postSearchData.startTime;
                }else {
                    postData = {
                        tempId:t.tempId+"",
                        limit:t.loadData.onePageNum.toString(),
                        offset:(t.loadData.pageNumber*t.loadData.onePageNum).toString(),                    //起始值
                        personName:t.personName,
                        endTime:t.endTime,
                        startTime:t.startTime,
                    }
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
                                $("#report_app_received").find(".dropload-refresh").hide();
                                $("#report_app_received").find(".dropload-load").hide();
                                $("#report_app_received").find(".dropload-noData").hide();
                            }else{
                                $("#report_app_received").find(".dropload-refresh").show();
                                $("#report_app_received").find(".dropload-load").hide();
                                $("#report_app_received").find(".dropload-noData").hide();
                            }
                        }else{
                            t.reportListInfo.reportList = [];
                            $("#report_app_received").find(".dropload-refresh").hide();
                            $("#report_app_received").find(".dropload-load").hide();
                            $("#report_app_received").find(".dropload-noData").hide();
                        }
                    }
                });

            },
            /*
             * 获取汇报列表
             * */
            getReportListData:function (firstStr) {
                var t = this,postUrl;
                postUrl = gMain.apiBasePath + "wrReportReceiveData/appListReportReceiveData.do";
                Ajax.ajax({
                    url:postUrl,
                    data:JSON.stringify({
                        limit:t.loadData.onePageNum.toString(),
                        offset:(t.loadData.pageNumber*t.loadData.onePageNum).toString(),                    //起始值
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
                                $("#report_app_received").find(".dropload-refresh").hide();
                                $("#report_app_received").find(".dropload-load").hide();
                                $("#report_app_received").find(".dropload-noData").hide();
                            }else{
                                $("#report_app_received").find(".dropload-refresh").show();
                                $("#report_app_received").find(".dropload-load").hide();
                                $("#report_app_received").find(".dropload-noData").hide();
                            }
                            t.firstGetRportList = false;
                        }else{
                            $("#report_app_received").find(".dropload-refresh").hide();
                            $("#report_app_received").find(".dropload-load").hide();
                            $("#report_app_received").find(".dropload-noData").hide();
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


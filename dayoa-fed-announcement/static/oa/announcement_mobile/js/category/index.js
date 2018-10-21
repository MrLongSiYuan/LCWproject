/**
 * 首页
 */

define(function (require,exports,module) {
    require("css/index.css");
    var sTpl = require("templates/index.html");
    var Ajax = require("js/ajax");
    var w = require("js/plugins/callAppHandler.js");
    var v = require("commonStaticDirectory/plugins/isSupported.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框
    require("../modules/annsListClassify/annsListClassify.js");
    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function(){
            return {
                gMain:gMain,
                coverShow:false,
                firstAnnGet:true,
                requestFlag:false,  //是否正在请求列表
                tempId:null,
                annoucementType:"received",
                announcementTotal:0,
                moreDataList:true,
                routePath:"", //url参数
                typeListShow:false,
                searchInit:false,
                annClassigyList:[],      //类型
                loadData:{           //加载数据
                   onePageNum:8,    //一页显示的数据
                   pageNumber:1,     //当前页码
                },
                annoucementListInfo:{     //汇报列表信息
                    annoucementList:[],
                    annoucementSource:""
                },
                searchInfor:{
                    annoucementTitle:"",          //搜索公告标题
                    startTime:"",
                    endTime:"",
                    AnnTypeId:"" //分类ID
                },
            }
        }
        /**
         * 监控路由改变
         * */
        ,route: {
            data: function (transition) {
                return {
                    routePath:transition.to.path
                }
            }
        }
        ,watch:{
            "routePath":function (val) {
                var t = this;
                if(t.$route.fullPath == '/' && gMain.annAvailableVersion && gMain.annAvailableVersion == "available"){
                    if(t.$route.query.type && t.$route.query.type == "nopublish"){
                        t.initPageHeader("未发布的");
                        t.annoucementType = "notPublish";
                    }else{
                        t.initPageHeader("公告");
                        t.annoucementType = "received";
                    }
                    t.loadData = {           //加载数据
                        onePageNum:8,    //一页显示的数据
                        pageNumber:1,     //当前页码
                    };
                    t.annoucementListInfo.annoucementList = [];
                    t.winInitSrollEvent();
                    t.getAnnoucementList();
                }
            }
        }
        ,attached:function () {
            var t = this;
            w.callAppHandler("h5_refresh_token", "");
            // t.getJurisdiction();
            if(!v.isSupported()){ //旧版 APP 不支持，弹出升级提示，并不再渲染页面
                $("#announcement_app_index").hide();
                t.lowVersionInitPageHeader();
                return false;
            }else{
                gMain.annAvailableVersion = "available";   //用来判断详情是由哪里进入，由应用进入且版本可用则有此全局变量
                t.initPageHeader("公告");
            }
            t.bottomLoadingfun("1");
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
            /*
            * 底部显示
            * */
            bottomLoadingfun:function (str) {
                switch (str){
                    case "1":     //不显示
                        $("#announcement_app_index").find(".dropload-refresh").hide();
                        $("#announcement_app_index").find(".dropload-load").hide();
                        $("#announcement_app_index").find(".dropload-noData").hide();
                        break;
                    case "2":     //显示上拉加载
                        $("#announcement_app_index").find(".dropload-refresh").show();
                        $("#announcement_app_index").find(".dropload-load").hide();
                        $("#announcement_app_index").find(".dropload-noData").hide();
                        break;
                    case "3":     //正在加载
                        $("#announcement_app_index").find(".dropload-refresh").hide();
                        $("#announcement_app_index").find(".dropload-load").show();
                        $("#announcement_app_index").find(".dropload-noData").hide();
                        break;
                    case "4":     //没有数据
                        $("#announcement_app_index").find(".dropload-refresh").hide();
                        $("#announcement_app_index").find(".dropload-load").hide();
                        $("#announcement_app_index").find(".dropload-noData").show();
                        break;
                }
            },
            winInitSrollEvent:function () {
                var t = this;
                $(window).bind('scroll',function(){
                    if ($(document).scrollTop() + $(window).height() + 20 > $(document).outerHeight() && (t.annoucementListInfo.annoucementList.length < t.announcementTotal) && !t.requestFlag) {
                        t.bottomLoadingfun("3");
                        t.getAnnoucementList();
                    }else if($(document).scrollTop() + $(window).height() + 20 > $(document).outerHeight() && t.annoucementListInfo.annoucementList.length != 0 && !(t.annoucementListInfo.annoucementList.length < t.announcementTotal)){
                        t.bottomLoadingfun("4")
                    }
                });
            },
            /**
             * 验证用户权限
             */
            getJurisdiction:function(){
                var t=this;
                Ajax.ajax({
                    url:gMain.apiBasePath+"common/validateUser.do"
                    ,data:""
                    ,async:false
                    ,beforeSend:function () {

                    }
                    ,complete:function () {

                    }
                    ,success:function(data){
                        if(data.result=="true") {
                            if(data.data=="true"){
                                gMain.adminIsAnnouncement = true;
                            }else{
                                gMain.adminIsAnnouncement = false;
                            }
                        }
                    }
                });
            },
            initPageHeader: function (name) {
                var rightBtn
                if(gMain.adminIsAnnouncement){
                    rightBtn = [
                        {
                            btnAction: "add-announcement",
                            btnName: "发布公告",
                            btnUrl:"",
                            btnParam: {}
                        },
                        {
                            btnAction: "no-publish",
                            btnName: "未发布的",
                            btnUrl:"",
                            btnParam: {}
                        },
                        {
                            btnAction: "history-announcement",
                            btnName: "历史公告",
                            btnUrl:"",
                            btnParam: {}
                        },
                    ]
                }else{
                    rightBtn = [
                        {
                            btnAction: "history-announcement",
                            btnName: "历史公告",
                            btnUrl:"",
                            btnParam: {}
                        },
                    ]
                }
                var data = {
                    leftBtn: "close", //左边按钮，””表示无左边按钮
                    headerColor: "", //导航条背景颜色，””表示默认颜色
                    rightBtn: rightBtn,
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title",name);
            },
            /*
            * 查询分类
            * */
            searchTempEvent:function (e,AnnTypeId) {
                var t = this;
                var $dom = e.target.localName == "div" ? $(e.target):$(e.target).parent();
                t.loadData = {           //加载数据
                    onePageNum:8,    //一页显示的数据
                    pageNumber:1,     //当前页码
                };
                t.searchInfor.AnnTypeId = AnnTypeId;
                if($dom.parents(".all_type_btn").length != 0){
                    $dom.attr({class:"all_reportType_btn active"});
                    $dom.parents(".all_type_btn").siblings("ul").find(".report_type_list_btn").attr({class:"report_type_list_btn"});
                    var text = $dom.text();
                    $("#announcement_app_index").find(".announcement_header_tap .annoucement_classify_name").text(text);
                }else if($dom.parents(".li_type_btn") != 0){
                    $dom.attr({class:"report_type_list_btn active"});
                    $dom.siblings("li .report_type_list_btn").attr({class:"report_type_list_btn"});
                    $dom.parents("ul").siblings(".all_type_btn").find(".all_reportType_btn").attr({class:"all_reportType_btn"});
                    var text = $dom.text();
                    $("#announcement_app_index").find(".announcement_header_tap .annoucement_classify_name").text(text);
                }
                t.annoucementListInfo.annoucementList = [];
                t.getAnnoucementList();
                t.hideCover();
            },
            /*
             * 查询公告列表
             * */
            getAnnoucementList:function () {
                var t = this;
                var postOption = {
                    "pageType":t.annoucementType,
                    "title":t.searchInfor.annoucementTitle,
                    "startTime":t.searchInfor.startTime,
                    "endTime":t.searchInfor.endTime,
                    "announcementType":t.searchInfor.AnnTypeId,
                    "myType":"",
                    "pageNo":t.loadData.pageNumber + "",
                    "pageSize":t.loadData.onePageNum + ""
                }
                Ajax.ajax({
                    url:gMain.apiBasePath + "mobile/listAnnouncement.do",
                    data:JSON.stringify(postOption),
                    beforeSend:function () {
                        t.requestFlag = true;
                        try{
                            $("#announcement_app_index_inp").remove();
                        }catch(e){}
                        if(t.firstAnnGet){
                            $("body").loading({zIndex:999}); //开启提交遮罩
                        }
                    },
                    complete:function () {
                        t.requestFlag = false;
                        if(t.firstAnnGet){
                            t.firstAnnGet = false;
                            $("body").loading({state:false}); //关闭提交遮罩
                        }
                    },
                    success:function(data) {
                        if(data.result == "true"){
                            t.loadData.pageNumber += 1;
                            t.annoucementListInfo.annoucementList = t.annoucementListInfo.annoucementList.concat(data.data.list);
                            t.announcementTotal = data.data.recordCount;
                            if(t.annoucementListInfo.annoucementList.length == t.announcementTotal && t.announcementTotal > 0){
                                t.bottomLoadingfun("4");
                            }else if(t.annoucementListInfo.annoucementList.length < t.announcementTotal){
                                t.bottomLoadingfun("2");
                            }else if(t.announcementTotal == 0){
                                t.bottomLoadingfun("1");
                                $(".announcement_content_list_wrap").find(".no-data-page").show();
                            }
                        }
                    }
                });
            },
            /*
            * 低版本的头部
            * */
            lowVersionInitPageHeader:function (){
                var data = {
                    leftBtn: "close", //左边按钮，””表示无左边按钮
                    headerColor: "", //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title","公告");
            },

            /*
            * 覆盖层
            * */
            showCover:function () {
                var t = this;
                if(t.annClassigyList.length != 0){
                    $("body").css({position:"fixed"});
                    t.coverShow = true;
                }else{
                    $.when(t.getAnnClassigyList()).done(function () {
                        $("body").css({position:"fixed"});
                        t.coverShow = true;
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
            * 进入删除汇报界面
            * */
            inDeleteDraft:function (uuid) {
                var t = this;
                t.delDraftuuid = uuid;
                $("#announcement_app_index").find(".draft_cover_wrap").show();
            },
            /*
             * 退出删除汇报界面
             * */
            outDeleteDraft:function () {
                var t = this;
                t.delDraftuuid = null;
                $("#announcement_app_index").find(".draft_cover_wrap").hide();
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
                            $("body").loading({zIndex:999}); //开启提交遮罩
                        },
                        complete:function () {
                            $("body").loading({state:false}); //关闭提交遮罩
                        },
                        success:function(data) {
                            if (data.result == "true") {
                                for(var i = 0;i<t.annoucementListInfo.annoucementList.length;i++){  //删除dom
                                    if(t.annoucementListInfo.annoucementList[i].uuid == t.delDraftuuid){
                                        t.annoucementListInfo.annoucementList.splice(i,1);
                                        t.announcementTotal -= 1;
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
            /**
             *获取公告类型列表
             **/
            getAnnClassigyList:function(){
                var t=this;
                var df = $.Deferred();
                Ajax.ajax({
                    url:gMain.apiBasePath+"route/am_type_list/getAll.do"
                    ,data:JSON.stringify({
                        "infoSetId":"am_type_list",
                        "searchConditionList":[],
                        "pageBean":{
                            "pageNo":"1",
                            "pageSize":20
                        },
                    })
                    ,beforeSend:function () {

                    }
                    ,complete:function () {
                    }
                    ,success:function(data){
                        if(data.result=="true"){
                            df.resolve();
                            t.annClassigyList = data.maps.slice(0);
                        }
                    }
                });
                return df;
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


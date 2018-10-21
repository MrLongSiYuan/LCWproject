/**
 * Created by THINK on 2017/2/15.
 */
define(function (require,exports,module) {
    // /*引入bootstrap 插件*/
    // require("commonStaticDirectory/plugins/bootstrap/bootstrap.min.css");
    require("css/sponsor.css");
    var sTpl = require("templates/sponsorAll.html");
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css"); //artDialog弹窗
    var tools = require("commonStaticDirectory/plugins/tools"); //工具函数集
    var HighSearch = require("commonStaticDirectory/plugins/highSearch/highSearch.js"); //高级搜索模块
    require("commonStaticDirectory/plugins/jquery.loading.js");

    var Ajax = require("js/ajax");

    require("commonStaticDirectory/plugins/dayhrPaginator/jquery.dayhrPaginator.css");//引入翻页插件的css
    var pager=require("commonStaticDirectory/plugins/dayhrPaginator/jquery.dayhrPaginator.js");//翻页插件

    var dayhrDropSelect=require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect.js");//下拉插件
    require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect.css");//下拉插件的css
    require("../modules/reportsListClassify/reportsListClassify.js");

    var VueComponent = Vue.extend({
        template: sTpl
        ,data:function(){
            return {
                msg:"测试页面"
                ,options:{
                    infoSetId:"test"
                },
                gMain:gMain,
                queryData:"",
                sParams:"",    //路由参数 sendOut（我发起的） received（我收到的）
                reportList:{
                    sendAready:"2",    //组件列表是显示已发送/阅读（1）未发送/阅读（2）
                    reportListsArr:[],      //汇报列表数据
                    reporterInfor:{},     //会发起人信息
                    reportsSource:"",   //sendOut（我发起的） received（我收到的）
                    sponsorAll:this,
                },
                ReadAllCounts:0, //未阅所有数量
                reportTotal:0,         //
                reportTypeList:[],      //汇报类型
                reportTypeListAno:[],   //被 隐藏的汇报类型
                openWhether:false,      //是否展开所有汇报类型
                seniorSearchShow:false,  //显示高级搜索
                searchInfor:{
                    tempId:"",           //当前显示汇报类型
                    personName:"",          //搜索关键字
                    startTime:"",
                    endTime:""
                },
                pageChangeInfor:{
                    pageNo:"1",          //当前页
                    onePageNum:"12",      //一页显示汇报数量
                    onePageNumArr:[12,24,72,108]
                },
                searchInforNow:null,     //当前搜索的参数(分页使用)
                reportSearchShow:false //汇报搜索切换
            }
        }
        ,watch:{
            "reportList.reportListsArr":function(){
            },
            "sParams":function () {
                var t = this;
                t.reportList.reportsSource = t.sParams;
            }
        }
        /**
         * 监控路由改变
         * */
        ,route:{
            data:function (transition) {
                return {
                    sParams:transition.to.params.sParams,
                }
            },
        }
        ,attached:function(){
            var t =this;
            t.reportList.reportsSource = t.sParams;
            t.getHaveSentDataOrNot();
            t.getRoportType();//获取类型
            t.getPersonInfo();
            t.initEventAss();//初始化事件集
        }
        ,methods:{
            /*
            * 页码改变
            * */
            changePageNo:function (state) {
                var t = this;
                t.pageChangeInfor.pageNo = state;
                var tempId = t.searchInforNow?t.searchInforNow.tempId:"";
                t.searchTemplateForType(tempId);
            },
            getPersonInfo:function () {
                var t = this;
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrOrgPerson/getPersonBaseInfo.do"
                    ,beforeSend:function () {
                    }
                    ,complete:function () {
                    }
                    ,success:function (data) {
                        if(data.result == "true"){
                            gMain.personInforReport = data.data;
                            t.reportList.reporterInfor = {
                                personName:data.data.personName,
                                orgName:gMain.oUser.beans[0].userInfo.orgName
                            }
                        }
                    }
                });
            },
            /*
            * 一页显示的数量
            * */
            changeOneDataNum:function (state) {
                var t = this;
                t.pageChangeInfor.onePageNum = state;
                var tempId = t.searchInforNow?t.searchInforNow.tempId:"";
                t.searchTemplateForType(tempId);
            },
            /*
             * 获取汇报 类型( 发起/收到)
             * */
            getRoportType:function () {
                var t = this,postUrl;
                if(t.sParams == "received" && t.reportList.sendAready == "2"){
                    postUrl = gMain.apiBasePath + "wrReportTemp/getNoReadReportTemplates.do";
                }else{
                    postUrl = gMain.apiBasePath + "wrReportTemp/getReportTemplates.do";
                }
                Ajax.ajax({
                    url:postUrl,
                    data:JSON.stringify({
                        status:t.reportList.sendAready,
                        personName:t.searchInfor.personName,
                        startTime:t.searchInfor.startTime,
                        endTime:t.searchInfor.endTime,
                    }),
                    beforeSend:function () {
                        $(".reportContent").loading({zIndex:999999999}); //开启提交遮罩
                    },
                    complete:function () {

                    },
                    success:function(data) {
                        if(t.sParams == "received" && t.reportList.sendAready == "2"){
                            if(data.result == "true"&&data.data.data.list){
                                t.ReadAllCounts = data.data.data.allCounts;
                                t.reportTypeList = data.data.data.list.slice(0);
                                //汇报类型数组长度大于4则隐藏剩下的
                                if(t.reportTypeList.length > 4){
                                    t.reportTypeListAno = t.reportTypeList.slice(0);
                                    t.reportTypeListAno.splice(0,4);
                                };
                            }
                        }else{
                            if (data.result == "true"&&data.data.list) {
                                t.ReadAllCounts = data.data.ReadAllCounts;
                                t.reportTypeList = data.data.list.slice(0);
                                //汇报类型数组长度大于4则隐藏剩下的
                                if(t.reportTypeList.length > 4){
                                    t.reportTypeListAno = t.reportTypeList.slice(0);
                                    t.reportTypeListAno.splice(0,4);
                                };
                            }
                        }
                    }
                });
            },
            /*
            * 获取已发/收到全部汇报(获取已阅/未阅送汇报)
            * */
            getHaveSentDataOrNot:function () {
                //获取数据
                $("#reportSummary_wrap").find(".typeReport_wrap .tabClick li").eq(0).attr({class:"active"});
                $("#reportSummary_wrap").find(".typeReport_wrap .tabClick li").eq(0).siblings("li").attr({class:""});
                var t = this,postUrl;
                if(t.sParams == "sendOut"){
                    postUrl = gMain.apiBasePath + "wrReportData/listReportDataByStatus.do";
                }else if(t.sParams == "received"){
                    postUrl = gMain.apiBasePath + "wrReportReceiveData/listReportReceiveData.do";
                }
                Ajax.ajax({
                    url:postUrl,
                    data:JSON.stringify({
                        status:t.reportList.sendAready,
                        limit:t.pageChangeInfor.onePageNum+"", //一页显示数量
                        offset:((t.pageChangeInfor.pageNo - 1)*t.pageChangeInfor.onePageNum)+""   //页码-1 * 一页的数量
                    }),
                    beforeSend:function () {
                        $(".reportContent").loading({zIndex:999999999}); //开启提交遮罩
                    },
                    complete:function () {
                        $(".reportContent").loading({state:false}); //关闭提交遮罩
                    },
                    success:function(data) {
                        if (data.result == "true" && data.data.list) {
                               t.reportTotal = data.data.recordCount; //总数据大小
                                for(var i = 0;i<data.data.list.length;i++){
                                    data.data.list[i].dateParam = t.getDateParam(data.data.list[i].modifyTime);
                                    data.data.list[i].nodeData = JSON.parse(data.data.list[i].nodeData);  //转数组
                                    data.data.list[i].nodeData = t.deleteOverduePicUrl(data.data.list[i].nodeData); //去掉后台传回的过期图片地址
                                }
                                t.reportList.reportListsArr = data.data.list.slice(0);
                        }else{  //如果没有数据则清空
                            t.reportList.reportListsArr = [];
                            t.reportTotal = 0;
                        }
                    }
                });
            },
            /*
             * 根据姓名时间参数搜索汇报
             * */
            searchReportByName:function ($event,type) {
                var t = this;
                if(type == "keyup"){
                    if($event.keyCode != "13"){
                        return false;
                    }
                }
                if(!t.searchInfor.personName && !t.searchInfor.startTime && !t.searchInfor.endTime){
                    return false;
                }
                t.pageChangeInfor.pageNo = "1";
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrReportReceiveData/listReportReceiveData.do",
                    data:JSON.stringify({
                        status:t.reportList.sendAready,
                        personName:t.searchInfor.personName,
                        startTime:t.searchInfor.startTime,
                        endTime:t.searchInfor.endTime,
                        tempId:t.searchInfor.tempId,
                        offset:"0",
                        limit:t.pageChangeInfor.onePageNum,
                    }),
                    beforeSend:function () {
                        $(".reportContent").loading({zIndex:999999999}); //开启提交遮罩
                    },
                    complete:function () {
                        $(".reportContent").loading({state:false}); //关闭提交遮罩
                    },
                    success:function(data) {
                        if (data.result == "true" && data.data.list) {
                            t.reportTotal = data.data.recordCount; //总数据大小
                            t.searchInforNow = t.searchInfor;
                            for(var i = 0;i<data.data.list.length;i++){
                                data.data.list[i].dateParam = t.getDateParam(data.data.list[i].modifyTime);
                                data.data.list[i].nodeData = JSON.parse(data.data.list[i].nodeData);  //转数组
                                data.data.list[i].nodeData = t.deleteOverduePicUrl(data.data.list[i].nodeData); //去掉后台传回的过期图片地址
                            }
                            t.reportList.reportListsArr = data.data.list.slice(0);
                        }else{
                            t.reportTotal = 0;
                            t.reportList.reportListsArr = [];
                        }
                    }
                });
            },
            /*
             * 根据(类型)(分页信息)搜索汇报(发起/收到)（已阅/未阅）
             * */
            searchTemplateForType:function (tempId) {
                var t = this,postUrl,postData;
                if(t.sParams == "sendOut"){
                    postUrl = gMain.apiBasePath + "wrReportData/listReportDataByStatus.do";
                    postData = {
                        status:t.reportList.sendAready,
                        tempId:tempId,
                        limit:t.pageChangeInfor.onePageNum+"", //一页显示数量
                        offset:((t.pageChangeInfor.pageNo - 1)*t.pageChangeInfor.onePageNum)+""   //页码-1 * 一页的数量
                    }
                }else if(t.sParams == "received"){
                    postUrl = gMain.apiBasePath + "wrReportReceiveData/listReportReceiveData.do";
                    postData = {
                        status:t.reportList.sendAready,
                        tempId:tempId,
                        limit:t.pageChangeInfor.onePageNum+"", //一页显示数量
                        offset:((t.pageChangeInfor.pageNo - 1)*t.pageChangeInfor.onePageNum)+"",  //页码-1 * 一页的数量
                        personName:t.searchInforNow?t.searchInforNow.personName:"",
                        endTime:t.searchInforNow?t.searchInforNow.endTime:"",
                        startTime:t.searchInforNow?t.searchInforNow.startTime:""
                    }
                }
                Ajax.ajax({
                    url:postUrl,
                    data:JSON.stringify(postData),
                    beforeSend:function () {
                        $(".reportContent").loading({zIndex:999999999}); //开启提交遮罩
                    },
                    complete:function () {
                        $(".reportContent").loading({state:false}); //关闭提交遮罩
                    },
                    success:function(data) {
                        if (data.result == "true" && data.data.list) {
                            t.reportTotal = data.data.recordCount; //总数据大小
                            for(var i = 0;i<data.data.list.length;i++){
                                data.data.list[i].dateParam = t.getDateParam(data.data.list[i].modifyTime);
                                data.data.list[i].nodeData = JSON.parse(data.data.list[i].nodeData);  //转数组
                                data.data.list[i].nodeData = t.deleteOverduePicUrl(data.data.list[i].nodeData); //去掉后台传回的过期图片地址
                            }
                            t.reportList.reportListsArr = data.data.list.slice(0);
                        }else{
                            t.reportTotal = 0;
                            t.reportList.reportListsArr = [];
                        }
                    }
                });
            },
            /*
            * 去掉后台传回的过期图片地址
            * */
            deleteOverduePicUrl:function (arr) {
                for(var i = 0;i<arr.length;i++){
                    if(arr[i].field_type == "pic"){
                        arr[i].valueUrls = [];
                    }
                }
                return arr;
            },
            /*--写汇报--*/
            add:function(){
                var t=this;
                $("body").loading({zIndex:9999}); //启用loading
                var interval = setInterval(function () {
                    if(gMain.personInforReport){
                        clearInterval(interval);
                        require.async("js/modules/addReport/addReport.js",function (addReport) {
                            $("body").loading({state:false}); //取消loading
                            new addReport({
                                sponsorAll:t
                            });
                        });
                    }
                },200);
            },
            /*
            * 初始化事件集合
            * */
            initEventAss:function () {
                var t = this;
                //切换已发未发(已阅/未阅)
                $("#report_headerWrap").off("click.title_alreadySend_notSend").on("click.title_alreadySend_notSend",".tabSendBtn",function (e) {
                    var num = $(this).index();
                    $(this).find("a").attr({"class":"active"});
                    $(this).siblings(".tabSendBtn").find("a").attr({"class":""});
                    t.pageChangeInfor.pageNo = "1";
                    t.searchInforNow = null;
                    if(num == 0){
                        $(this).siblings(".moveBar").animate({
                            left:"0"
                        },500);
                        // if(t.sParams == "received"){        //我收到的未阅
                        //     t.reportList.sendAready = "2";
                        //     t.getRoportType();
                        // }else{
                        //     t.reportList.sendAready = "1";
                        // }
                        t.sParams = "received"
                        t.reportList.sendAready = "2";
                        $(".title_alreadySend_notSend").css({width: "91%"});
                        t.getHaveSentDataOrNot();
                        t.getRoportType();//获取类型
                    }else if(num == 1){
                        $(this).siblings(".moveBar").animate({
                            left:"140px"
                        },500);
                        // if(t.sParams == "received"){
                        //     t.reportList.sendAready = "1";
                        // }else{
                        //     t.reportList.sendAready = "2";
                        // }
                        t.sParams = "received"
                        t.reportList.sendAready = "1";
                        $(".title_alreadySend_notSend").css({width: "91%"});
                        t.getHaveSentDataOrNot();
                    }else if(num == 2){
                        $(this).siblings(".moveBar").animate({
                            left:"280px"
                        },500);
                        t.sParams = "sendOut"
                        t.reportList.sendAready = "1";
                        $(".title_alreadySend_notSend").css({width: "100%"});
                        t.getHaveSentDataOrNot();
                    }
                });
                //按汇报类型显示
                $("#report_sponsorWrap").off("click.typeReport").on("click.typeReport",".typeReport .tabClick li",function (e) {
                    var tempId = $(this).attr("data-tempid");
                    t.searchInforNow = null;
                    if(tempId){
                        t.pageChangeInfor.pageNo = "1";
                        t.searchInforNow = $.extend(t.searchInforNow,{tempId:tempId});
                        t.searchTemplateForType(tempId);
                        $(this).attr({class:"active"}).siblings().attr({class:""});
                        if($(this).parent().parent().attr("class") == "typeReport_show"){
                            $("#report_sponsorWrap .typeReport_hide li").attr({class:""});
                        }else{
                            $("#report_sponsorWrap .typeReport_show li").attr({class:""});
                        }
                    }else{                  //没有tempId就是全部
                        t.getHaveSentDataOrNot();
                        $(this).attr({class:"active"}).siblings().attr({class:""});
                        $("#report_sponsorWrap .typeReport_hide li").attr({class:""});
                    }
                    t.openWhether = false;
                    $("#report_sponsorWrap #typeReport_anotherBtn").find("span").text("展开");
                    $("#report_sponsorWrap #typeReport_anotherBtn").find("i").css({transform:"rotate(0deg)",top:"1px"});
                    e.stopPropagation();
                });
                //展开/收起汇报类型
                $("#report_sponsorWrap").off("click.typeReport_anotherBtn").on("click.typeReport_anotherBtn","#typeReport_anotherBtn",function (e) {
                    t.openWhether = !t.openWhether;
                    if(t.openWhether){ //展开
                        $(this).find("span").text("收起");
                        $(this).find("i").css({transform:"rotate(180deg)",top:"-1px"});
                    }else{
                        $(this).find("span").text("展开");
                        $(this).find("i").css({transform:"rotate(0deg)",top:"1px"});
                    }
                    e.stopPropagation();
                });
                //点击下拉图标展开/收起高级搜索
                $("#report_headerWrap").off("click.senior_search_show").on("click.senior_search_show",".senior_search_show",function (e) {
                    t.seniorSearchShow = !t.seniorSearchShow;
                    if(t.seniorSearchShow){
                        $(this).css({transform:"rotate(180deg)"});
                    }else{
                        $(this).css({transform:"rotate(0deg)"});
                    }
                    e.stopPropagation();
                });
                //显示搜索输入
                $("#report_headerWrap").off("click.report_search_logo").on("click.report_search_logo",".report_search_logo",function (e) {
                    $(this).hide();
                    $("#report_headerWrap").find(".report_search_wrap").fadeIn();
                    $("#report_headerWrap").find(".title_alreadySend_notSend").css({width: $("#reportSummary_wrap").width() - (30+298) + "px"});
                    e.stopPropagation();
                    t.reportSearchShow = true;
                })
                //普通搜索获取焦点
                $("#report_headerWrap").off("focus.normal_search").on("focus.normal_search",".normal_search input",function (e) {
                    t.seniorSearchShow = false;
                    $("#report_headerWrap .senior_search_show").css({transform:"rotate(0deg)"});
                })
                //点击隐藏
                $("body").off("click.hide_drop_down").on("click.hide_drop_down",function () {
                    t.seniorSearchShow = false;
                    $("#report_headerWrap .senior_search_show").css({transform:"rotate(0deg)"});
                    t.openWhether = false;
                    $("#report_sponsorWrap #typeReport_anotherBtn").find("span").text("展开");
                    $("#report_sponsorWrap #typeReport_anotherBtn").find("i").css({transform:"rotate(0deg)",top:"1px"});
                    if(t.reportSearchShow){
                        $("#report_headerWrap").find(".report_search_wrap").hide();
                        $("#report_headerWrap").find(".title_alreadySend_notSend").css({width: "91%"});
                        $("#report_headerWrap").find(".report_search_logo").fadeIn();
                        t.reportSearchShow = false;
                    }
                })
                //阻止冒泡
                $("#report_headerWrap").on("click",".report_search_wrap",function (e) {
                    e.stopPropagation();
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
                    "monthOfYear":monthOfYear+"",
                    "weekOfMonth":weekOfMonth+"",
                    "theYear":theYear+"",
                    "createDate":date.slice(0,10),
                }
                return dateParameter;
            }
        }
    });

    module.exports = VueComponent;
});
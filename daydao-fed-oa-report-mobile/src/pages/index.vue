<template>
    <div id="report_app_index">
        <div id="loading_wrap" :style="{ position: 'fixed',
        width: '100%',
        height: 'calc(100% - 43px)',
        left: '0',
        top: '43px',
        display: 'none',
        background: 'url('+gMain.baseStaticPath+'oa/report_mobile/images/loading-1.gif) no-repeat center center',
        'z-index':'99999' }"></div>
        <div class="report_header_tap">
            <ul class="clearfix">
                <li class="active"><span>我发出的</span></li>
                <li @click="jumpReceived"><span>我收到的</span></li>
            </ul>
        </div>
        <div class="fade_in_out">
            <div class="history_type_report_wrap">
                <div class="report_type_btn" @click="showCover"><span>全部</span><i class="iconfont_daydao_common">&#xe6a9;</i></div>
                <div class="report_history_btn" @click="goHistoryReport">历史汇报</div>
            </div>
            <reports-list-classify v-bind:report-list-info="reportListInfo"></reports-list-classify>
            <div class="dropload-refresh" style="display:none">↑&nbsp;上拉加载更多</div>
            <div class="dropload-load" style="display:none"><span class="loading"></span>加载中...</div>
            <div class="dropload-noData" style="display:none">没有更多了~</div>
        </div>
        <transition name="fade_cover" @enter="enter">
            <div class="report_type_cover" v-show="coverShow" @click="hideCover">
                <transition name="type_rise" @leave="leave">
                    <div class="reportType_list_wrap" @click.stop="" v-show="typeListShow">
                        <div class="all_reportType_btn active" @click="searchTempEvent($event,'')">全部</div>
                        <ul>
                            <li class="report_type_list_btn" v-for="item in reportTypeList" :temp-id="item.tempId" @click="searchTempEvent($event,item.tempId)">{{item.tempName}}</li>
                        </ul>
                    </div>
                </transition>
            </div>
        </transition>
    </div>
</template>
<script type="text/javascript">
    import reportListClassify from "../components/reportListClassify.vue"
    import w from "../plugins/callAppHandler.js"

    export default{
        data: function () {
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
        },
        mounted: function () {
            var t = this;
            t.initPageHeader();
            if(JSON.parse(window.localStorage.getItem("previewStyle"))){  //有，清除
                window.localStorage.removeItem("previewStyle");
                window.localStorage.removeItem("previewReceiver");
                window.localStorage.removeItem("previewForward");
                window.localStorage.removeItem("previewTitle");
            }
            // t.getReportType();
            t.getReportListData("first");
            $("#report_app_index").find(".dropload-refresh").hide();
            $("#report_app_index").find(".dropload-load").hide();
            $("#report_app_index").find(".dropload-noData").hide();
            t.winInitSrollEvent();
        },
        methods:{
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
            jumpReceived:function () {
                var t = this;
                t.$router.push("/received");
            },
            initPageHeader: function () {
                var data = {
                    leftBtn: "close", //左边按钮，””表示无左边按钮
                    headerColor: "473f3a", //导航条背景颜色，””表示默认颜色
                    rightBtn: [
                        {
                            btnAction: "add-report",
                            btnUrl:gMain.baseStaticPath + "oa/report_mobile/images/nav_icon_add_def3x.png",
                            //btnUrl: location.protocol +"//"+ location.host+"/static/workflow/workflow_mobile/images/ContactAdd@2x.png",
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
                if(t.reportTypeList.length != 0){
                    $("body").css({position:"fixed"});
                    t.coverShow = true;
                }else{
                    $.when(t.getReportType()).done(function () {
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
                    t.$daydao.$ajax({
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
                t.$daydao.$ajax({
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
                t.$daydao.$ajax({
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
                t.$daydao.$ajax({
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
            },
            enter:function () {
                var t = this;
                t.typeListShow = true;
            },
            leave:function () {
                var t = this;
                t.coverShow = false;
            }
        },
        components:{
            "reports-list-classify":reportListClassify
        },
    }
</script>
<style lang="scss" rel="stylesheet/scss">
    html{
        width: 100%;
        height: 100%;
        background: #f2f2f2;
        body{
            min-width:0;
            width: 100%;
        }
    }
    /*顶部Tap切换开始*/
    #report_app_index{
        width: 100%;
        background: #f2f2f2;
        padding-top: 44px;
    }
    #report_app_index .report_header_tap{
        width: 100%;
        height: 44px;
        position: fixed;
        top:0rem;
        border-bottom: 1px solid #D2D2D2;
        background: #FBFBFB;
        z-index: 99;
    }
    #report_app_index .report_header_tap ul{
        display: block;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding:0rem  0.7rem;
    }
    #report_app_index .report_header_tap ul li{
        display: block;
        float: left;
        width: 1.8rem;
        height: 100%;
        background: #fbfbfb;
    }
    #report_app_index .report_header_tap ul li:nth-child(2){
        float: right;
    }
    #report_app_index .report_header_tap ul li span{
        width: 100%;
        height: 100%;
        display: block;
        text-align: center;
        padding-top: 9px;
        color: #222222;
        font-size: 16px;
        box-sizing: border-box;
    }
    #report_app_index .report_header_tap ul li.active span{
        color: #FF7123;
        border-bottom: 2px solid #FF7123;
    }
    /*顶部Tap切换end*/
    /*汇报类型和历史汇报*/
    #report_app_index .history_type_report_wrap{
        width: 100%;
        height: 54px;
        box-sizing: border-box;
        padding: 15px 0.3rem;
        background: #f2f2f2;
    }
    #report_app_index .report_type_btn,#report_app_index .report_history_btn{
        color: #666666;
        line-height: 22px;
        font-size: 12px;
        border: 1px solid #aaa;
        border-radius: 0.06rem;
        text-align: center;
    }
    #report_app_index .report_type_btn{
        width: auto;
        padding: 0 0.16rem;
        height:24px;
        line-height: 22px;
        float: left;
    }
    #report_app_index .report_type_btn span{
        display: inline-block;
        max-width: 1.7rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        float: left;
    }
    #report_app_index .report_type_btn i{
        line-height: 26px;
        margin-left: 0.09rem;
        float: left;
        font-size: 14px;
    }
    #report_app_index .report_history_btn{
        height: 22px;
        float: right;
        border: none;
        overflow: hidden;
        line-height: 24px;
        font-size: 12px;
        padding-left: 19px;
        background: url(../assets/images/tab_icon_time_def@3x.png) no-repeat left center;
        background-size: 14px 14px;
    }
    /*汇报类型和历史汇报end*/
    /*覆盖层start*/
    #report_app_index .report_type_cover,#report_app_index .fade_cover-transition{
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.4);
        position: fixed;
        top:0;
        transition: all .2s ease 0.1s;
        z-index: 99;
    }
    #report_app_index .fade_cover-enter,#report_app_index .fade_cover-leave{
        background: rgba(0,0,0,0);
    }
    #report_app_index .report_type_cover .reportType_list_wrap,#report_app_index .report_type_cover .type_rise-transition{
        width: 100%;
        position: absolute;
        bottom: 0;
        background: #fff;
        box-sizing: border-box;
        transition: all .4s ease;
        max-height: 70%;
        min-height: 125px;
        overflow-y: auto;
    }
    /*-----*/
    #report_app_index .report_type_cover .reportType_list_wrap::-webkit-scrollbar-track-piece {
        background-color: rgba(0, 0, 0, 0);
        border-left: 1px solid rgba(0, 0, 0, 0);
    }
    #report_app_index .report_type_cover .reportType_list_wrap::-webkit-scrollbar {
        width: 5px;
        height: 13px;
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
    }
    #report_app_index .report_type_cover .reportType_list_wrap::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.5);
        background-clip: padding-box;
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
        min-height: 28px;
    }
    #report_app_index .report_type_cover .reportType_list_wrap::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.5);
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
    }
    /*----*/
    #report_app_index .report_type_cover .type_rise-enter,#report_app_index .report_type_cover .type_rise-leave{
        bottom: -50%;
    }
    #report_app_index .reportType_list_wrap .all_reportType_btn{
        width: 100%;
        height: 44px;
        text-align: center;
        line-height: 44px;
        font-size: 15px;
        color: #222;
        background: #F2F2F2;
    }
    #report_app_index .reportType_list_wrap .report_type_list_btn{
        display: block;
        width: 100%;
        height: 44px;
        line-height: 44px;
        font-size: 15px;
        color: #222;
        background: #F2F2F2;
        text-align: center;
        box-sizing: content-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        border-top: 1px solid #e6e6e6;
    }
    #report_app_index .reportType_list_wrap .active{
        color: #FF7123;
    }
    /*覆盖层end*/
    /*加载*/
    #report_app_index .dropload-up,.dropload-down{
        position: relative;
        height: 0;
        overflow: hidden;
        font-size: 12px;
        /* 开启硬件加速 */
        -webkit-transform:translateZ(0);
        transform:translateZ(0);
    }
    #report_app_index .dropload-down{
        height: 50px;
    }
    #report_app_index .dropload-refresh,.dropload-update,.dropload-load,.dropload-noData{
        height: 50px;
        line-height: 50px;
        text-align: center;
        font-size: 14px;
        color: #404040;
        background: #f2f2f2;
        border-top: 1px solid #f3f3f3;
        display: none;
    }
    #report_app_index .dropload-load .loading{
        display: inline-block;
        height: 15px;
        width: 15px;
        border-radius: 100%;
        margin: 6px;
        border: 2px solid #666;
        border-bottom-color: transparent;
        vertical-align: middle;
        -webkit-animation: rotate 0.75s linear infinite;
        animation: rotate 0.75s linear infinite;
    }
    @-webkit-keyframes rotate {
        0% {
            -webkit-transform: rotate(0deg);
        }
        50% {
            -webkit-transform: rotate(180deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
        }
    }
    @keyframes rotate {
        0% {
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(180deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
    /*加载*/
    /*是否删除开始*/
    #report_app_index .draft_cover_wrap{
        position: fixed;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        top:0;
        display: none;
        z-index: 99999;
    }
    #report_app_index .draft_cover_wrap .draft_cover{
        width: 5.4rem;
        height: 127px;
        background: #fff;
        border-radius: 0.2rem;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
    }
    #report_app_index .draft_cover_wrap .draft_cover .cover_content{
        width: 100%;
        height: 83px;
        text-align: center;
        line-height: 83px;
        font-size: 17px;
        color: #222;
        border-bottom: 1px solid #D2D2D2;
    }
    #report_app_index .draft_cover_wrap .draft_cover .cover_btn_box{
        width: 100%;
        height: 44px;
    }
    #report_app_index .draft_cover_wrap .draft_cover .cover_btn_box div{
        width: 50%;
        height: 100%;
        text-align: center;
        line-height: 44px;
        box-sizing: border-box;
        font-size: 17px;
        float: left;
        color: #EF6518;
    }
    #report_app_index .draft_cover_wrap .draft_cover .cover_btn_box .btn_left{
        border-right: 1px solid #D2D2D2;
        color: #666;
    }
    /*是否删除稿结束*/
</style>

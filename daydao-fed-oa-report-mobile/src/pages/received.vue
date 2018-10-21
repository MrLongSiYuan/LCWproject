<template>
    <div id="report_app_received">
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
                <li @click="jumpIndex"><span>我发出的</span></li>
                <li class="active"><span>我收到的</span></li>
            </ul>
        </div>
        <div class="fade_in_out">
            <div class="history_type_report_wrap">
                <div class="report_type_btn" @click="showCover('parentRouter')"><span>全部</span><i class="iconfont_daydao_common">&#xe6a9;</i></div>
                <div class="report_history_btn" @click="goHistoryReport">历史汇报</div>
                <!--<div class="report_history_btn" @click="searchReport">历史汇报</div>-->
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
        },
        mounted: function () {
            var t = this;
            t.getReportType();
            t.getReportListData("first");
            t.initPageHeader();
            $("#report_app_received").find(".dropload-refresh").hide();
            $("#report_app_received").find(".dropload-load").hide();
            $("#report_app_received").find(".dropload-noData").hide();
            t.initScrollEvent();
        },
        methods:{
            initPageHeader: function () {
                var data = {
                    leftBtn: "back", //左边按钮，””表示无左边按钮
                    headerColor: "473f3a", //导航条背景颜色，””表示默认颜色
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
            jumpIndex:function () {
                var t = this;
                t.$router.push("/index");
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
                t.$daydao.$ajax({
                    url:postUrl,
                    data:JSON.stringify({

                    }),
                    beforeSend:function () {
                        $("#loading_wrap").show();
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
               t.$daydao.$ajax({
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
    #report_app_received{
        width: 100%;
        background: #f2f2f2;
        padding-top: 44px;
    }
    #report_app_received .report_header_tap{
        width: 100%;
        height: 44px;
        position: fixed;
        top:0rem;
        border-bottom: 1px solid #D2D2D2;
        background: #FBFBFB;
        z-index: 99;
    }
    #report_app_received .report_header_tap ul{
        display: block;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding:0rem  0.7rem;
    }
    #report_app_received .report_header_tap ul li{
        display: block;
        float: left;
        width: 1.8rem;
        height: 100%;
        background: #fbfbfb;
    }
    #report_app_received .report_header_tap ul li:nth-child(2){
        float: right;
    }
    #report_app_received .report_header_tap ul li span{
        width: 100%;
        height: 100%;
        display: block;
        text-align: center;
        padding-top: 9px;
        color: #222222;
        font-size: 16px;
        box-sizing: border-box;
    }
    #report_app_received .report_header_tap ul li.active span{
        color: #FF7123;
        border-bottom: 2px solid #FF7123;
    }
    /*顶部Tap切换end*/
    /*汇报类型和历史汇报*/
    #report_app_received .history_type_report_wrap{
        width: 100%;
        height: 54px;
        box-sizing: border-box;
        padding: 15px 0.3rem;
        background: #f2f2f2;
    }
    #report_app_received .report_type_btn,#report_app_received .report_history_btn{
        color: #666666;
        line-height: 22px;
        font-size: 12px;
        border: 1px solid #aaa;
        border-radius: 0.06rem;
        text-align: center;
    }
    #report_app_received .report_type_btn{
        width: auto;
        padding: 0 0.16rem;
        height:24px;
        line-height: 22px;
        float: left;
    }
    #report_app_received .report_type_btn span{
        display: inline-block;
        max-width: 1.7rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        float: left;
    }
    #report_app_received .report_type_btn i{
        line-height: 26px;
        margin-left: 0.09rem;
        float: left;
        font-size: 14px;
    }
    #report_app_received .report_history_btn{
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
    #report_app_received .report_type_cover,#report_app_received .fade_cover-transition{
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.4);
        position: fixed;
        top:0;
        transition: all .2s ease 0.1s;
        z-index: 99;
    }
    #report_app_received .fade_cover-enter,#report_app_received .fade_cover-leave{
        background: rgba(0,0,0,0);
    }
    #report_app_received .report_type_cover .reportType_list_wrap,#report_app_received .report_type_cover .type_rise-transition{
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
    #report_app_received .report_type_cover .reportType_list_wrap::-webkit-scrollbar-track-piece {
        background-color: rgba(0, 0, 0, 0);
        border-left: 1px solid rgba(0, 0, 0, 0);
    }
    #report_app_received .report_type_cover .reportType_list_wrap::-webkit-scrollbar {
        width: 5px;
        height: 13px;
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
    }
    #report_app_received .report_type_cover .reportType_list_wrap::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.5);
        background-clip: padding-box;
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
        min-height: 28px;
    }
    #report_app_received .report_type_cover .reportType_list_wrap::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.5);
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
    }
    /*----*/
    #report_app_received .report_type_cover .type_rise-enter,#report_app_received .report_type_cover .type_rise-leave{
        bottom: -50%;
    }
    #report_app_received .reportType_list_wrap .all_reportType_btn{
        width: 100%;
        height: 44px;
        text-align: center;
        line-height: 44px;
        font-size: 15px;
        color: #222;
        background: #F2F2F2;
    }
    #report_app_received .reportType_list_wrap .report_type_list_btn{
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
    #report_app_received .reportType_list_wrap .active{
        color: #FF7123;
    }
    /*覆盖层end*/
    /*搜索汇报开始*/
    .search_wrap,.fadein_right-transition{
        width: 100%;
        min-height: 100%;
        background: #fff;
        position: absolute;
        right: -100%;
        top:0;
        padding-top: 44px;
        display: none;
    }
    .fadein_right-enter,.fadein_right-leave{
        right: -100%;
    }
    .fade_in_out,.fadein_in_out-transition{
        width: 100%;
        position: absolute;
        left: 0;
        top:0;
        padding-top: 44px;
    }
    .fadein_in_out-enter,.fadein_in_out-leave{
        opacity: 0;
    }
    /*搜索汇报结束*/
    /*加载*/
    #report_app_received .dropload-up,.dropload-down{
        position: relative;
        height: 0;
        overflow: hidden;
        font-size: 12px;
        /* 开启硬件加速 */
        -webkit-transform:translateZ(0);
        transform:translateZ(0);
    }
    #report_app_received .dropload-down{
        height: 50px;
    }
    #report_app_received .dropload-refresh,.dropload-update,.dropload-load,.dropload-noData{
        height: 50px;
        line-height: 50px;
        text-align: center;
        font-size: 14px;
        color: #404040;
        background: #f2f2f2;
        border-top: 1px solid #f3f3f3;
        display: none;
    }
    #report_app_received .dropload-load .loading{
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
</style>

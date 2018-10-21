/**
 * Created by THINK on 2017/4/21.
 */
/**
 * Created by THINK on 2017/4/6.
 */
/**
 * 单个汇报详情
 */

define(function (require,exports,module) {
    require("css/singleAnnDetail.css");
    var sTpl = require("templates/singleAnnDetail.html");
    var Ajax = require("js/ajax");
    var w = require("js/plugins/callAppHandler.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var v = require("commonStaticDirectory/plugins/isSupported.js");
    var filePreview =  require("commonStaticDirectory/plugins/preview.js"); //文件预览插件
    /*评论*/
    var daydaoFedComment = require("commonStaticDirectory/plugins/daydaoFedComment/daydaoFedCommentH5.js");
    var commentApi = require("commonStaticDirectory/plugins/daydaoFedComment/daydaoFedCommentApi.js");
    /*点赞*/
    var ApiPraises = require("commonStaticDirectory/plugins/daydaoFedComment/daydaoFedLikeApi.js"); //点赞组件
    /*阅读*/
    var readerApi = require("commonStaticDirectory/plugins/daydaoFedComment/daydaoFedReadApi.js");


    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框
    require("commonStaticDirectory/plugins/jquery.loading.js");
    //表单数据展示插件
    require("commonStaticDirectory/plugins/headImgLoad/headImgLoad.js");

    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function(){
            return {
                gMain:gMain,
                reportId:null,
                readCounts:"0",
                readList:[],
                readTatol:0, //阅读总数
                tempName:null,
                shareList:[],
                oFileList:[], //附件图片列表
                personName:"",
                personId:"",
                praiseOperationflag:true,
                canGetComment:true, //不能在请求期间请求
                announcementId:"",
                announcementData:null,
                sParams:"",  //路由参数默认值
                dateParam:{},
                publishRange:[],
                praiseInfo:{
                    count:null,
                    isPraise:null,
                    praiseId:null,
                    reportId:null,
                },
                commentInfo:{
                    count:null,
                    isComment:null,
                    commentId:null,
                    reportId:null,
                },
                postCommentOption:{   //评论参数
                    content:"",
                    infoId:null,    //汇报ID
                    replyTo:null,   //	回复人personId
                    reviewer:null,  //评论人personId
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
                if(val == '/singleAnnDetail/:announcement_id'){
                    $("#single_ann_detail").show();
                    if(window.localStorage.getItem("available")){    //点击了图片或者附件
                        if(window.localStorage.getItem("available") == "IMAvailable"){
                            t.initPageHeader("close");
                            window.localStorage.removeItem("available");
                        }else if(window.localStorage.getItem("available") == "H5Available"){
                            gMain.annAvailableVersion ="available";
                            t.initPageHeader("back");
                            window.localStorage.removeItem("available");
                        }
                    }else{
                        if(gMain.annAvailableVersion && gMain.annAvailableVersion == "available"){
                            t.initPageHeader("back");
                        }else{
                            t.initPageHeader("close");
                        }
                    }
                }
            }
        }
        ,attached:function () {
            var t = this;
            w.callAppHandler("h5_get_version", ""); //版本4.2以上获取版本号
            t.announcementId = t.$route.params.announcement_id;
            t.releaseRange(t.announcementId);
            t.getAnnFileImg(t.announcementId);
            t.addReadStatus();
            t.versionControl();
            try{
                $("#announcement_app_index_inp").remove();
            }catch(e){}
            $.when(t.getPersonInfo(),t.getAnnouncementById()).done(function () {
                setTimeout(function () {
                    if(t.announcementData.is_watermark == 1){
                        $("#single_ann_detail").css({background:"transparent"});
                        $("#single_ann_detail .ann_single_content").css({background:"transparent"});
                        t.addAnnWatermark(t.personName);
                    }
                    if(t.announcementData.is_comment){
                        var params =  {
                            infoId:t.announcementId,
                            "ifSendMsg":1,
                            "messageType":30,
                            "extParam":{
                                "uuid":t.announcementId,
                                "is_need_st":"1",
                                "projectName":"公告"
                            },
                            "receivePersonId":t.announcementData.person_id,
                            "projectName":"公告"
                        }
                        /*初始化评论组件*/
                        t.commentComponent = $('#comment_assembly').daydaoFedComment({
                            params: params
                            ,count: function(count){
                                t.commentInfo.count = count;
                            }
                            ,commentBtn:false
                        });
                    }
                },50)
            });
            t.$nextTick(function () {
            });
        }
        ,methods:{
            initPageHeader: function (leftBtnName) {
                var data = {
                    leftBtn: leftBtnName, //左边按钮，””表示无左边按钮
                    headerColor: "", //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title","公告详情");
            },
            commentPageHeader: function (name) {
                var data = {
                    leftBtn: "back", //左边按钮，””表示无左边按钮
                    headerColor: "", //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title",name);
            },
            /*
             *  版本控制
             * */
            versionControl:function () {
                var t = this;
                if(window.localStorage.getItem("available")){    //点击了图片或者附件
                    if(window.localStorage.getItem("available") == "IMAvailable"){
                        t.initPageHeader("close");
                        window.localStorage.removeItem("available");
                    }else if(window.localStorage.getItem("available") == "H5Available"){
                        gMain.annAvailableVersion ="available";
                        t.initPageHeader("back");
                        window.localStorage.removeItem("available");
                    }
                }else{
                    if(gMain.annAvailableVersion && gMain.annAvailableVersion == "available"){
                        t.initPageHeader("back");
                    }else{
                        t.initPageHeader("close");
                        var minVer = '4.3.4'; //当前最低版本号
                        var interval = setInterval(function(){
                            if(gMain.appH5Version && gMain.appH5Version != ""){
                                clearInterval(interval);
                                var version = gMain.appH5Version;
                                if(!v.isSupported(version,minVer)){ //旧版 APP 不支持，弹出升级提示，并不再渲染页面
                                    clearTimeout(timeOut);
                                    gMain.appH5Version = "";
                                    $("#single_ann_detail").hide();
                                    return false;
                                }else{
                                    $("#single_ann_detail").show();
                                }
                            }

                        }, 50);
                        //超过600ms没有获到版本号,传入当前最低版本号,当前版本号为空(移动端直接返回不需要网络请求所以耗时很小)
                        var timeOut = setTimeout(function(){
                            if(gMain.appH5Version == undefined || gMain.appH5Version == ""){
                                clearInterval(interval);
                                var version = "";
                                if(!v.isSupported(version,minVer)){ //旧版 APP 不支持，弹出升级提示，并不再渲染页面
                                    $("#single_ann_detail").hide();
                                    gMain.appH5Version = "";
                                    return false;
                                }else{
                                    $("#single_ann_detail").show();
                                }
                            }
                        }, 600);
                    }
                }
            },
            /*
            * 新增评论
            * */
            commonAddComment:function () {
                var t = this;
                t.commentComponent.addComment();
            },
            /*
            *  个人信息获取
            * */
            getPersonInfo:function () {
                var t = this;
                var df = $.Deferred();
                Ajax.ajax({
                    url:gMain.apiBasePath+"common/getUser.do"
                    ,data:JSON.stringify({})
                    ,success:function(data){
                        if(data.result=="true"){
                            t.personName = data.data.personName;
                            t.personId = data.data.personId;
                            df.resolve();
                        }
                    }
                })
                return df;
            },
            /*
             * 添加水印
             * */
            addAnnWatermark:function (container, options) {
                var t = this;
                var tpl = '<canvas id = "watermark" width = "110px"  height = "60px" style="display:none;"></canvas>' + '<canvas id = "repeat-watermark" style="float: left"></canvas>';
                $("#single_ann_detail .watermark_wrap").append(tpl);
                t.wmarkOption = {
                    docWidth: $(document).width(),
                    docHeight: $("#single_ann_detail .ann_single_content").height(),
                    fontStyle: "16px 黑体", //水印字体设置
                    rotateAngle: -20 * Math.PI / 180, //水印字体倾斜角度设置
                    fontColor: "rgba(100, 100, 100, 0.2)", //水印字体颜色设置
                    firstLinePositionX: 0, //canvas第一行文字起始X坐标
                    firstLinePositionY: 50, //Y
                    SecondLinePositionX: 0, //canvas第二行文字起始X坐标
                    SecondLinePositionY: 70,//Y
                    watermark:container
                };
                $.extend(t.wmarkOption, options);
                t.draw(t.wmarkOption.docWidth,t.wmarkOption.docHeight);
            },
            /*
             * 画画布
             * */
            draw:function (docWidth, docHeight) {
                var t = this;
                var cw = $('#single_ann_detail #watermark')[0];
                var crw = $('#single_ann_detail #repeat-watermark')[0];
                crw.width = docWidth;
                crw.height = docHeight;
                var ctx = cw.getContext("2d");
                //清除小画布
                ctx.clearRect(0, 0, 160, 100);
                ctx.font = t.wmarkOption.fontStyle;
                //文字倾斜角度
                ctx.rotate(t.wmarkOption.rotateAngle);
                ctx.fillStyle = t.wmarkOption.fontColor;
                //第一行文字
                ctx.fillText(t.wmarkOption.watermark, t.wmarkOption.firstLinePositionX, t.wmarkOption.firstLinePositionY);
                //第二行文字
                //ctx.fillText(window.watermark.mobile, t.wmarkOption.SecondLinePositionX, t.wmarkOption.SecondLinePositionY);
                //坐标系还原
                ctx.rotate(-t.wmarkOption.rotateAngle);
                var ctxr = crw.getContext("2d");
                //清除整个画布
                ctxr.clearRect(0, 0, crw.width, crw.height);
                //平铺--重复小块的canvas
                var pat = ctxr.createPattern(cw, "repeat");
                ctxr.fillStyle = pat;
                ctxr.fillRect(0, 0, crw.width, crw.height);
            },
            /*
            * 滚动
            * */
            winScrollEvent:function () {
                var t = this;
                $(window).bind('scroll',function(){
                    if ($(document).scrollTop() + $(window).height() + 20 > $(document).outerHeight() && t.commentTotal > 15 && t.commentInforList.length < t.commentTotal && t.canGetComment){
                        $("#single_ann_detail").find(".dropload-refresh").hide();
                        $("#single_ann_detail").find(".dropload-load").show();
                        $("#single_ann_detail").find(".dropload-noData").hide();
                        t.getAllCommentData(t.commentPageNo,"15");
                    }
                });
            },
            previewFile:function (uuid,fileSort) {
                var t = this;
                if(gMain.annAvailableVersion && gMain.annAvailableVersion == "available"){
                    window.localStorage.setItem("available","H5Available");
                }else{
                    window.localStorage.setItem("available","IMAvailable");
                }
                try{
                    clearInterval(gMain.intervalAdd);
                }catch(e){};
                t.initPageHeader("back");
                if(fileSort == 1){
                    new filePreview({
                        uuid:uuid,
                        title:"",
                        isPopDialog:true,
                        isWap:true
                    });//移动端文件预览
                }
                if(fileSort == 2){
                    new filePreview({
                        uuid:uuid,
                        title:'',
                        isPopDialog:true,
                        isPic:true,
                        isWap:true
                    });
                }
            },
            //移动端图片预览
            previewPic:function ($event,uuid) {
                var t = this;
                if(gMain.annAvailableVersion && gMain.annAvailableVersion == "available"){
                    window.localStorage.setItem("available","H5Available");
                }else{
                    window.localStorage.setItem("available","IMAvailable");
                }
                try{
                    clearInterval(gMain.intervalAdd);
                }catch(e){};
                new filePreview({
                    uuid:uuid,
                    title:'',
                    isPopDialog:true,
                    isPic:true,
                    isWap:true
                });
            },
            /*
             * 选择汇报对象
             * */
            chooseReceiver:function () {
                var t = this;
                var param = {
                    selectSelf:true //是否可以选自己
                    ,selectFriends:false //是否可以选好友
                    ,singleSelect:false // 是否限制为单选 （ true:单选，只能选一个人，不能选组织）
                    ,cached:false  //是否使用缓存   cache为true时，selectedUserInfo和selectedOrgInfo为[]
                    ,selectedUserInfo:[] //默认选择的用户列表
                    ,selectedOrgInfo:[]  //默认选择的组织列表
                };
                w.callAppHandler("h5_address_list_picker_new", param); //用于4.2版本及以上
                // w.callAppHandler("h5_address_list_picker","noCached");
                var interval = setInterval(function(){
                    //获取到人员属性
                    if(gMain.h5PersonInfo && (gMain.h5PersonInfo.UserInfo || gMain.h5PersonInfo.OrganizeInfo)){
                        clearInterval(interval);
                        if(gMain.h5PersonInfo.UserInfo.length != 0){
                            $.each(gMain.h5PersonInfo.UserInfo,function (num,val) {
                                if(_.findIndex(t.shareList,{personId:val.EmpId+""}) == -1){
                                    var obj = {
                                        personId:val.EmpId+"",
                                        personName:val.EmpName,
                                        headImg:val.UserImg
                                    }
                                    if(obj.headImg != undefined && obj.headImg != ""){
                                        obj.headImg = "group" + obj.headImg.split("group")[1];
                                    }
                                    t.shareList.push(obj);
                                }
                            });
                            if(gMain.h5PersonInfo.OrganizeInfo.length == 0 && t.canShareflag){   //没有选组织直接转发
                                t.canShareflag = false;
                                t.reportShareIM();
                            }
                        }
                        if(gMain.h5PersonInfo.OrganizeInfo.length != 0){
                            $.each(gMain.h5PersonInfo.OrganizeInfo,function (num,val) {
                                var obj = {
                                    OrganizeId:val.OrganizeId+"",
                                    OrganizeName:val.OrganizeName,
                                }
                                t.orgPersonListSelect(obj.OrganizeId,gMain.h5PersonInfo.OrganizeInfo.length,num);
                            });
                            gMain.h5PersonInfo = {};
                        }else{
                            gMain.h5PersonInfo = {};
                        }
                    }
                }, 300);
            },
            /**
             * 根据orgId获取职位/人员列表
             * */
            orgPersonListSelect:function (OrgId,OrgLength,num) {
                var t = this;
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrOrgPerson/getPersonListByOrgId.do"
                    ,data:JSON.stringify({
                        orgId:OrgId
                        ,isInclude:true //是否包含下级
                    })
                    ,beforeSend:function () {

                    }
                    ,complete:function () {

                    }
                    ,success:function (data) {
                        if(data.result == "true" && data.data.list){
                            $.each(data.data.list,function (num,val) {
                                if(_.findIndex(t.shareList,{personId:val.personId+""}) == -1){
                                    var obj = {
                                        personId:val.personId+"",
                                        personName:val.personName,
                                        headImg:val.headImg
                                    }
                                    if(obj.headImg != undefined && obj.headImg != ""){
                                        obj.headImg = "group" + obj.headImg.split("group")[1];
                                    }
                                    t.shareList.push(obj);
                                }
                            });
                            if((OrgLength - 1) == num){  //获取最后一个组织人员后 发IM消息
                                t.reportShareIM();
                            }
                        }
                    }
                });
            },
            /*
            * 获取单个公告数据
            * */
            getAnnouncementById:function () {
                var t = this;
                var df = $.Deferred();
                Ajax.ajax({
                    url:gMain.apiBasePath + "mobile/getAnnouncement.do",
                    data:JSON.stringify({
                        amUuid:t.announcementId+"",
                    }),
                    beforeSend:function () {
                        $("body").loading({zIndex:999}); //开启提交遮罩
                    },
                    complete:function () {
                        $("body").loading({state:false}); //关闭提交遮罩
                    },
                    success:function(data) {
                        if (data.result == "true" && data.data){
                            t.announcementData = data.data;
                            df.resolve();
                        }else if(data.result == "remind"){
                            $("#single_ann_detail .ann_detail_wrap").hide();
                            $("#single_ann_detail .data_not_find_box").show();
                            if(data.resultDesc == "delete"){
                                $("#single_ann_detail .data_not_find_box .data_not_find").text("公告已经被删除啦！");
                            }else if(data.resultDesc == "cancel"){
                                $("#single_ann_detail .data_not_find_box .data_not_find").text("公告已经被撤回啦！");
                            }else if(data.resultDesc == "notExist"){
                                $("#single_ann_detail .data_not_find_box .data_not_find").text("公告已删除！");
                            }
                        }

                    }
                });
                return df;
            },
            /*
             * 获取公告附件图片
             * */
            getAnnFileImg:function (uuid) {
                var t = this;
                var df = $.Deferred();
                Ajax.ajax({
                    url:gMain.apiBasePath+"amFile/getFiles.do"
                    ,data:JSON.stringify({"amUuid":uuid})
                    ,success: function (data) {
                        if(data.result=="true" && data.data.list){
                            df.resolve();
                            t.oFileList = data.data.list.slice(0);
                            t.getPicTrueUrl(t.oFileList,function (arr) {
                                t.oFileList = JSON.parse(JSON.stringify(arr)); //表单数据
                            })
                        }
                    }
                });
                return df;
            },
            /*
            * 发布范围全显示切换
            * */
            releaseRangeAllshow:function (e) {
                var t = this;
                var $dom = $(e.target).attr("class") == "more_btn" ? $(e.target):$(e.target).parents(".more_btn");
                if($("#single_ann_detail").find(".ann_single_range .content").attr("data-release") == "0"){
                    $("#single_ann_detail").find(".ann_single_range .content").attr("data-release","1")
                    $dom.find("i").css({
                        "-ms-transform":"rotate(180deg)",
                        "-moz-transform":"rotate(180deg)",
                        "-webkit-transform":"rotate(180deg)",
                        "-o-transform":"rotate(180deg)",
                        "transform":"rotate(180deg)",
                    });
                    $("#single_ann_detail").find(".ann_single_range .content").css({height:"auto"});
                }else{
                    $("#single_ann_detail").find(".ann_single_range .content").attr("data-release","0")
                    $dom.find("i").css({
                        "-ms-transform":"",
                        "-moz-transform":"",
                        "-webkit-transform":"",
                        "-o-transform":"",
                        "transform":"",
                    });
                    $("#single_ann_detail").find(".ann_single_range .content").css({height:""});
                }
            },
            /*
             * 发布范围
             * */
            releaseRange:function (uuid) {
                var t = this;
                var df = $.Deferred();
                Ajax.ajax({
                    url:gMain.apiBasePath+"receiver/getReceiver.do"
                    ,data:JSON.stringify({
                        "amUuid":uuid,
                    })
                    ,beforeSend:function () {
                    }
                    ,complete:function () {
                    }
                    ,success:function(data){
                        if(data.result == "true"){
                            df.resolve();
                            t.publishRange = data.data.list.slice(0);
                        }
                    }
                })
                return df;
            },
            /*
             * 点赞/取消赞
             * */
            praiseOperation:function (e) {
                var t = this;
                var parameter = {
                    infoId:t.announcementData.uuid,
                    "ifSendMsg":1,
                    "messageType":31,
                    "extParam":{
                        "uuid":t.announcementData.uuid,
                        "is_need_st":"1",
                        "projectName":"公告"
                    },
                    "receivePersonId":t.announcementData.person_id,
                    "projectName":"公告"
                }
                if(t.announcementData.isPraise == 0 && t.praiseOperationflag){
                    t.praiseOperationflag = false;
                    ApiPraises.addLike(parameter, function(data){
                        t.praiseOperationflag = true;
                        t.announcementData.isPraise = 1;
                        t.announcementData.praiseCount +=1;
                    });
                }else if(t.announcementData.isPraise == 1 && t.praiseOperationflag){
                    t.praiseOperationflag = false;
                    ApiPraises.cancelLike({infoId:t.announcementData.uuid}, function(data){
                        t.praiseOperationflag = true;
                        t.announcementData.isPraise = 0;
                        t.announcementData.praiseCount -=1;
                    });
                }

                e.stopPropagation();
            },
            /*
            * 增添已阅状态
            * */
            addReadStatus:function () {
                var t = this;
                Ajax.ajax({
                    url:gMain.apiBasePath+"announcement/readAm.do"
                    ,data:JSON.stringify({
                        "amUuid":t.announcementId,
                    })
                    ,beforeSend:function () {
                    }
                    ,complete:function () {
                    }
                    ,success:function(data){
                        if(data.result == "true"){
                        }
                    }
                });
                readerApi.addRead({"infoId":t.announcementId},function(data){
                });
            },
            /*
             * 查看阅读人列表
             * */
            goReaderList:function () {
                var t = this;
                readerApi.getReadUserInfo({"infoId":t.announcementId,"pageNo":1,"pageSize":15},function(count, data){
                    t.readList = data.slice(0);
                    t.readTatol = count;
                    location.href = "#!/singleAnnDetail/" + t.announcementId + "/readerList";
                });
            },
            /**
             * 获取图片真实路径
             * @arr 获取的字段集
             * @callback 获取真实图片后的回调
             * */
            getPicTrueUrl:function (aFormStyle ,callback) {
                var t = this;
                //更新图片的url
                var setData = function (arr) {
                    for(var i = 0;i<arr.length;i++){
                        if(arr[i].fileType == 2){
                            Ajax.ajax({
                                url:gMain.basePath + "apiCloud/cpCloudCommon/download.do"
                                ,data:JSON.stringify({uuid:arr[i].resourceUrl})
                                ,async:false //同步加载
                                ,success:function (data) {
                                    if(data.result = "true"){
                                        arr[i].realUrl = data.data;
                                    }
                                }
                            });
                        }
                    }
                    return  arr;
                };
                aFormStyle = setData(aFormStyle);
                typeof callback == "function" && callback(aFormStyle);
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
        }
        ,transitions:{

        }
        ,directives: {
            'add-ann-time':function(data){
                if (!$.isEmptyObject(data)) {
                    var showtime,date;
                    date = new Date(data.operation_time);
                    var year,month,day,hour,minute,second;
                    year = date.getFullYear();
                    month = date.getMonth()+1 < 10 ? "0"+(date.getMonth()+1):date.getMonth()+1;
                    day = date < 10 ? "0"+date.getDate():date.getDate();
                    hour = date.getHours() < 10 ? "0"+date.getHours():date.getHours()
                    minute = date.getMinutes() < 10 ? "0"+date.getMinutes():date.getMinutes();
                    showtime = year+"/"+month+"/"+day+" "+hour+":"+minute;
                    $(this.el).text(showtime);
                }
            },
            'ann-content-handle':function (data) {
                if(!$.isEmptyObject(data)){
                    if(data.content){
                        var conent = data.content.replace(/[\n]/g,'<br/>');
                        conent = conent.replace(/[\s]/g,'&nbsp;');
                    }
                    $(this.el).html(conent);
                }
            }
        }

    });
    module.exports = VueComponent;
});


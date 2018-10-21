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
    require("css/singleReportDetail.css");
    var sTpl = require("templates/singleReportDetail.html");
    var Ajax = require("js/ajax");
    var w = require("js/plugins/callAppHandler.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var v = require("commonStaticDirectory/plugins/isSupported.js");
    var _ver = require("js/plugins/versionHeader.js");  //判断是否4.5版本以上

    var GetPersonInfor = require("js/plugins/getPersonInfor.js")

    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框
    require("commonStaticDirectory/plugins/Validform_v5.3.2.js");  //表单验证插件
    require("commonStaticDirectory/plugins/jquery.loading.js");
    require("js/modules/formPreview/formPreview.js");
    //表单数据展示插件
    require("js/modules/formDataShow/formDataShow.js");
    require("commonStaticDirectory/plugins/headImgLoad/headImgLoad.js");

    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function(){
            return {
                gMain:gMain,
                reportId:null,
                readCounts:"0",
                readList:[],
                tempName:null,
                shareList:[],
                personInfor:null,
                reportLost:false,  //汇报丢失
                sponsorInfor:{
                    "headImg": "",
                    "orgName": "",
                    "personName": "",
                    "personId": "",
                }, //发起者信息
                commentInforList:[],
                commentContent:null,
                commentType:null,
                commentPageNo:1,
                commentTotal:0,
                canShareflag:true, //可以转发标识
                canGetComment:true, //不能在请求期间请求
                canPraiseFlag:true,   //可以执行点赞操作
                placeholderTextarea:null,
                singleReportData:{
                    wrData:{}
                },    //单个汇报数据
                sParams:"",  //路由参数默认值
                dateParam:{},
                nodeData:[],
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
                    extParam:{},
                    messageType:37,
                    ifSendMsg:1,
                    projectName:"汇报",
                    receivePersonId:""
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
                if(val == '/singleReportDetail/:report_id'){
                    $("#single_report_detail").show();
                    if(window.localStorage.getItem("available")){    //点击了图片或者附件
                        if(window.localStorage.getItem("available") == "IMAvailable"){
                            t.initPageHeader("close");
                            window.localStorage.removeItem("available");
                        }else if(window.localStorage.getItem("available") == "H5Available"){
                            gMain.reportAvailableVersion ="available";
                            t.initPageHeader("back");
                            window.localStorage.removeItem("available");
                        }
                    }else {
                        if (gMain.reportAvailableVersion && gMain.reportAvailableVersion == "available") {
                            t.initPageHeader("back");
                        } else {
                            t.initPageHeader("close");
                        }
                    }
                    t.winScrollEvent();
                    t.inputNoteBtnMove();
                }
            }
        }
        ,attached:function () {
            var t = this;
            w.callAppHandler("h5_get_version", ""); //版本4.2以上获取版本号
            t.versionControl();
            t.reportId = t.$route.params.report_id;
            $.when(t.readeReportStatus()).done(function () {
                t.getReportById();
            });
            if(gMain.personInforReport && gMain.personInforReport.personId){
                t.personInfor = gMain.personInforReport;
            }else{
                GetPersonInfor();
                t.personInfor = gMain.personInforReport;
            }
            t.getAllCommentData(t.commentPageNo,"15");
            try{
                $("#report_app_index_test").remove();
            }catch(e){}
            try{
                $("#loading_wrap_detail").remove();
            }catch(e){}
        }
        ,methods:{
            initPageHeader: function (leftBtnName) {
                var headerColor;
                if(_ver.versionHeader()){
                    headerColor = "";
                }else{
                    headerColor = "473f3a";
                }
                var data = {
                    leftBtn: leftBtnName, //左边按钮，””表示无左边按钮
                    headerColor: headerColor, //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title","汇报详情");
            },
            commentPageHeader: function (name) {
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
                        gMain.reportAvailableVersion ="available";
                        t.initPageHeader("back");
                        window.localStorage.removeItem("available");
                    }
                }else{
                    if(gMain.reportAvailableVersion && gMain.reportAvailableVersion == "available"){
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
                                    $("#single_report_detail").hide();
                                    gMain.appH5Version = "";
                                    return false;
                                }else{
                                    if(!t.reportLost){
                                        $("#single_report_detail").show();
                                    }
                                }
                            }

                        }, 50);
                        //超过600ms没有获到版本号,传入当前最低版本号,当前版本号为空(移动端直接返回不需要网络请求所以耗时很小)
                        var timeOut = setTimeout(function(){
                            if(gMain.appH5Version == undefined || gMain.appH5Version == ""){
                                clearInterval(interval);
                                var version = "";
                                if(!v.isSupported(version,minVer)){ //旧版 APP 不支持，弹出升级提示，并不再渲染页面
                                    $("#single_report_detail").hide();
                                    gMain.appH5Version = "";
                                    return false;
                                }else{
                                    if(!t.reportLost){
                                        $("#single_report_detail").show();
                                    }
                                }
                            }
                        }, 600);
                    }
                }
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
            * 滚动
            * */
            winScrollEvent:function () {
                var t = this;
                $(window).bind('scroll',function(){
                    if ($(document).scrollTop() + $(window).height() + 20 > $(document).outerHeight() && t.commentTotal > 15 && t.commentInforList.length < t.commentTotal && t.canGetComment){
                        $("#single_report_detail").find(".dropload-refresh").hide();
                        $("#single_report_detail").find(".dropload-load").show();
                        $("#single_report_detail").find(".dropload-noData").hide();
                        t.getAllCommentData(t.commentPageNo,"15");
                    }
                });
            },
            /*
             * 跳转到便签页
             * */
            jumpClipboard:function () {
                var  t = this;
                if($("#clipboard_wrap").length && $("#clipboard_wrap").length != 0){
                    return false;
                }else{
                    location.href =  "#!/singleReportDetail/" + t.reportId + "/clipboard";
                }
            },
            /*
             * 获取当前汇报所有评论
             * */
            getAllCommentData:function (pageNo,onePageNum) {
                var t = this,postUrl;
                postUrl = gMain.amBasePath + "cmComments/getCommentsInfo.do";
                if(t.canGetComment){
                    Ajax.ajax({
                        url:postUrl,
                        data:JSON.stringify({
                            infoId:parseInt(t.reportId),
                            pageNo:parseInt(pageNo),
                            pageSize:parseInt(onePageNum),
                        }),
                        beforeSend:function () {
                            t.canGetComment = false;
                        },
                        complete:function () {
                            t.canGetComment = true;
                        },
                        success:function(data) {
                            if (data.result == "true" && data.data.list){
                                t.commentInforList = t.commentInforList.concat(data.data.list.slice(0));
                                t.commentTotal = data.data.recordCount;
                                if(t.commentTotal > 15 && t.commentInforList.length == t.commentTotal){   //没有数据了
                                    $("#single_report_detail").find(".dropload-refresh").hide();
                                    $("#single_report_detail").find(".dropload-load").hide();
                                    $("#single_report_detail").find(".dropload-noData").show();
                                }else if(t.commentTotal > 15 && t.commentInforList.length < t.commentTotal){
                                    t.commentPageNo += 1;
                                    $("#single_report_detail").find(".dropload-refresh").show();
                                    $("#single_report_detail").find(".dropload-load").hide();
                                    $("#single_report_detail").find(".dropload-noData").hide();
                                }
                            }
                        }
                    });
                }
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
             * 转发IM
             * */
            reportShareIM:function () {
                var t = this;
                var imBody = "";
                var imbodyFun = function (obj) {
                    if(obj.label){
                        imBody = imBody+obj.label+"<br/>";
                    }
                    if(obj.field_type == "pic"){

                    }else if(obj.field_type == "file"){  //文件另做处理
                        if(obj.value){
                            $.each(obj.value,function (num,val) {
                                imBody = imBody+val.fileName+"<br/>";
                            })
                        }
                    }else if(obj.field_type != "default_field"){
                        if(obj.value){
                            imBody = imBody+obj.value+"<br/>";
                        }
                    }
                }
                if(t.nodeData.length>3){
                    for(var i = 0;i<3;i++){
                        if(t.nodeData[i].field_type == "twoColumns" || t.nodeData[i].field_type == "threeColumns"){
                            $.each(t.nodeData[i].firstCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            $.each(t.nodeData[i].secondCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            if(t.nodeData[i].thirdCol){
                                $.each(t.nodeData[i].thirdCol.fields,function (num,val){
                                    imbodyFun(val);
                                })
                            }
                        }else{
                            imbodyFun(t.nodeData[i]);
                        }
                    }
                }else {
                    for(var i = 0;i<t.nodeData.length;i++){
                        if(t.nodeData[i].field_type == "twoColumns" || t.nodeData[i].field_type == "threeColumns"){
                            $.each(t.nodeData[i].firstCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            $.each(t.nodeData[i].secondCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            if(t.nodeData[i].thirdCol){
                                $.each(t.nodeData[i].thirdCol.fields,function (num,val){
                                    imbodyFun(val);
                                })
                            }
                        }else{
                            imbodyFun(t.nodeData[i]);
                        }
                    }
                }
                var sharePersonIdList = [];
                for(var i = 0;i<t.shareList.length;i++){
                    sharePersonIdList.push(t.shareList[i].personId);
                }
                // alert(JSON.stringify({
                //     personList:sharePersonIdList,
                //     reportId:t.reportId+"",
                //     imTitle:t.tempName,
                //     imBody:imBody,
                // }));
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrReportReceiveData/transpondReport.do",
                    data:JSON.stringify({
                        personList:sharePersonIdList,
                        reportId:t.reportId+"",
                        imTitle:t.tempName,
                        imBody:imBody,
                    }),
                    beforeSend:function () {
                        $("body").loading({zIndex:999}); //开启提交遮罩
                    },
                    complete:function () {
                        t.canShareflag = true;
                        $("body").loading({state:false}); //关闭提交遮罩
                    },
                    success:function(data) {
                        if (data.result == "true"){
                            amyLayer.alert("转发成功！");
                            t.shareList = [];
                        }
                    }
                });
            },
            /*
            * 获取单个汇报数据
            * */
            getReportById:function () {
                var t = this;
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrReportData/getReportDataById.do",
                    data:JSON.stringify({
                        reportId:t.reportId+"",
                    }),
                    beforeSend:function () {
                        $("body").loading({zIndex:999}); //开启提交遮罩
                    },
                    complete:function () {
                        $("body").loading({state:false}); //关闭提交遮罩
                    },
                    success:function(data) {
                        if (data.result == "true"){
                            t.singleReportData = JSON.parse(JSON.stringify(data.data.data));
                            t.tempName = t.singleReportData.wrData.tempName;
                            t.readCounts = t.singleReportData.wrData.readCounts;
                            t.dateParam = t.getDateParam(t.singleReportData.wrData.modifyTime);
                            t.singleReportData.wrData.createTime = t.singleReportData.wrData.modifyTime.slice(0,-3);
                            t.nodeData = JSON.parse(t.singleReportData.wrData.nodeData);
                            t.praiseInfo = t.singleReportData.wrData.praiseInfo;
                            t.commentInfo = t.singleReportData.wrData.commentInfo;
                            var nodeDataInfor = JSON.parse(t.singleReportData.wrData.nodeData);
                            var fixedInfor;
                            try{
                                $.each(nodeDataInfor,function (num,val) {
                                    if(val.field_type == "default_field" && val.field_name == "personInfor"){
                                        fixedInfor = $.extend({},fixedInfor,val.value);
                                    }
                                })
                            }catch(e){};
                            if(fixedInfor && fixedInfor.orgName != "undefined"){
                                t.sponsorInfor.headImg = fixedInfor.headImg;
                                t.sponsorInfor.orgName = fixedInfor.orgName;
                                t.sponsorInfor.personName = fixedInfor.personName;
                                t.sponsorInfor.personId = fixedInfor.personId;
                            }else{
                                t.sponsorInfor.headImg = t.singleReportData.wrData.headImg;
                                t.sponsorInfor.orgName = t.singleReportData.wrData.orgName;
                                t.sponsorInfor.personName = t.singleReportData.wrData.personName;
                                t.sponsorInfor.personId = t.singleReportData.wrData.personId;
                            }
                            t.sponsorInfor = JSON.parse(JSON.stringify(t.sponsorInfor));
                            t.getPicTrueUrl(t.nodeData,function (arr) {
                                // arr = t.removeUselessFields(arr);  //去掉垃圾字段
                                t.nodeData = JSON.parse(JSON.stringify(arr)); //表单数据
                            });
                            if(t.singleReportData.wrData.forwardType == 1){
                                $("#single_report_detail").find(".single_report_footer .operation_item").css({width:"50%"});
                            }
                        }else if(data.result == "remind" && data.resultDesc == "report_not_found"){
                            $("#single_report_detail").hide();
                            $("#report_clipboard_inputBtn").hide();
                            $(".report_not_find_box").show();
                        }
                    }
                });
            },
            /*
            * 阅读
            * */
            readeReportStatus:function () {
                var t = this;
                var df = $.Deferred();
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrReportRead/readReportData.do",
                    data:JSON.stringify({
                        reportId:t.reportId+""
                    }),
                    beforeSend:function () {
                        $("body").loading({zIndex:999}); //开启提交遮罩
                    },
                    complete:function () {
                        df.resolve();
                    },
                    success:function(data) {
                        if (data.result == "true") {
                        }
                    }
                });
                return df;
            },
            /*
             * 获取阅读人列表
             * */
            getAllReadData:function () {
                var t = this;
                var df = $.Deferred();
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrReportRead/appListByReprotId.do",
                    data:JSON.stringify({
                        corpId:t.singleReportData.wrData.corpId+"",
                        reportId:t.reportId+"",
                    }),
                    beforeSend:function () {
                    },
                    complete:function () {
                        df.resolve();
                    },
                    success:function(data) {
                        if (data.result == "true" && data.data.list){
                            t.readList = JSON.parse(JSON.stringify(data.data.list)).slice(0);
                        }
                    }
                });
                return df;
            },
            /*
            * 点赞
            * */
            reportPraise:function () {
                var t = this,postUrl,praiseId;
                if(!t.canPraiseFlag){  //请求未完成不能再次请求
                    return;
                }
                if(t.praiseInfo.isPraise == 0){
                    postUrl = gMain.amBasePath + "cmPraise/addPraise.do";
                }else if(t.praiseInfo.isPraise == 1){
                    postUrl = gMain.amBasePath + "cmPraise/delPraise.do";
                    praiseId = t.praiseInfo.praiseId;
                }
                Ajax.ajax({
                    url:postUrl,
                    data:JSON.stringify({
                        infoId:parseInt(t.reportId),
                        "ifSendMsg":1,
                        "messageType":38,
                        "extParam":{
                            "uuid":parseInt(t.reportId),
                            "is_need_st":"1",
                            "projectName":"汇报"
                        },
                        "receivePersonId":t.singleReportData.wrData.personId,
                        "projectName":"汇报"
                    }),
                    beforeSend:function () {
                        t.canPraiseFlag = false;
                    },
                    complete:function () {
                        t.canPraiseFlag = true;
                    },
                    success:function(data) {
                        if (data.result == "true"){
                            if(t.praiseInfo.isPraise == 0){
                                t.praiseInfo.isPraise = 1;
                                t.praiseInfo.count += 1;
                                t.praiseInfo.praiseId = data.data;
                                t.praiseRemind();
                            }else if(t.praiseInfo.isPraise == 1){
                                t.praiseInfo.isPraise = 0;
                                t.praiseInfo.count -= 1;
                            }
                        }
                    }
                });
            },
            /*
             * 点赞发消息
             * */
            praiseRemind:function () {
                var t = this;
                if(!t.personInfor){
                    t.getPersonInfo();
                }
                var userInfor = {
                    "personName":""+t.personInfor.personName
                }
                var postData = {
                    imTitle:t.tempName+"",
                    imBody:"赞："+userInfor.personName+"觉得很赞",
                    personId:t.singleReportData.wrData.personId+"",   //汇报发起人的id
                    reportId:t.reportId+"",
                }
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrCmcPraise/sendPraiseImIfFirst.do",
                    data:JSON.stringify(postData),
                    beforeSend:function () {

                    },
                    complete:function () {

                    },
                    success:function(data) {
                        if (data.result == "true"){

                        }
                    }
                });
            },
            /*
            * 查看汇报对象列表
            * */
            goReceiverList:function () {
                var t = this;
                window.location.href = "#!/singleReportDetail/" + t.reportId + "/receiverList";
            },
            /*
             * 点击评论列表
             * */
            commentListEvent:function (e,reviewerId,reviewerName) {
                var t = this;
                var $dom = e.target.className == "comment_list" ? $(e.target) : $(e.target).parents(".comment_list");
                if(t.personInfor.personId == reviewerId && ($dom.find(".box i").css("display") == "none")){  //当前登录人的id等于评论人的id则可删除
                    // $dom.find(".box i").show();
                    // $dom.find(".box i").animate({
                    //     opacity:"1"
                    // },800,function () {
                    //     setTimeout(function () {
                    //         $dom.find(".box i").animate({
                    //             opacity:"0"
                    //         },800,function () {
                    //             $dom.find(".box i").hide();
                    //         });
                    //     },2000);
                    // });
                }else if(t.personInfor.personId != reviewerId){
                    t.postCommentOption.replyTo = parseInt(reviewerId);
                    t.goCommentReport("reply",reviewerName);
                }
            },
            /*
             * 评论
             * */
            reportComment:function () {
                var t = this,postUrl;
                if(t.commentType == "comment"){
                    t.postCommentOption.replyTo = null;
                }
                postUrl = gMain.amBasePath + "cmComments/addComment.do";
                if(!t.commentContent){
                    return false;
                }
                t.postCommentOption.content = t.commentContent;
                t.postCommentOption.infoId = parseInt(t.reportId);
                t.postCommentOption.reviewer = t.personInfor.personId;
                t.postCommentOption.receivePersonId = t.singleReportData.wrData.personId;
                t.postCommentOption.extParam = {
                    "uuid":parseInt(t.reportId),
                    "is_need_st":"1",
                    "projectName":"汇报",
                },
                Ajax.ajax({
                    url:postUrl,
                    data:JSON.stringify(t.postCommentOption),
                    beforeSend:function () {

                    },
                    complete:function () {
                    },
                    success:function(data) {
                        if (data.result == "true"){
                            $("#single_report_detail").find(".dropload-refresh").hide();
                            $("#single_report_detail").find(".dropload-load").hide();
                            $("#single_report_detail").find(".dropload-noData").hide();
                            t.commentPageNo = 1;
                            t.commentInforList = [];
                            t.getAllCommentData(t.commentPageNo,"15");
                            t.commentRemind();
                        }
                    }
                });
            },
            /*
             * 评论发消息
             * */
            commentRemind:function () {
                var t = this,postData;
                if(!t.personInfor){
                    return false;
                }
                var userInfor = {
                    "personName":""+t.personInfor.personName
                }
                if(t.commentType == "comment"){
                    postData = {
                        imTitle:t.tempName+"",
                        // imBody:userInfor.personName+"："+t.commentContent,
                        imBody:t.commentContent,
                        personId:t.singleReportData.wrData.personId+"",   //汇报发起人的id
                        reportId:t.reportId+"",
                    }
                }else if(t.commentType == "reply"){
                    postData = {
                        imTitle:t.tempName+"",
                        // imBody:userInfor.personName+"回复你："+t.commentContent,
                        imBody:t.commentContent,
                        personId:t.singleReportData.wrData.personId+"",   //汇报发起人的id
                        reportId:t.reportId+"",
                        replyTo:t.postCommentOption.replyTo+"",
                    }
                }
                t.commentContent = "";
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrCmcPraise/sendCmcPariseImMsg.do",
                    data:JSON.stringify(postData),
                    beforeSend:function () {

                    },
                    complete:function () {

                    },
                    success:function(data) {
                        if (data.result == "true"){

                        }
                    }
                });
            },
            /*
             * 删除评论
             * */
            deletecomment:function (uuid) {
                var t = this,postUrl;
                postUrl = gMain.amBasePath + "cmComments/delComment.do";
                Ajax.ajax({
                    url:postUrl,
                    data:JSON.stringify({
                        infoId:parseInt(t.reportId),
                        uuid:parseInt(uuid),
                    }),
                    beforeSend:function () {

                    },
                    complete:function () {

                    },
                    success:function(data) {
                        if (data.result == "true"){
                            /*for(var i = 0;i<t.commentInforList.length;i++){
                                if(t.commentInforList[i].uuid == uuid){
                                    t.commentInforList.splice(i,1);
                                }
                            }*/
                            $("#single_report_detail").find(".dropload-refresh").hide();
                            $("#single_report_detail").find(".dropload-load").hide();
                            $("#single_report_detail").find(".dropload-noData").hide();
                            t.commentPageNo = 1;
                            t.commentInforList = [];
                            t.getAllCommentData(t.commentPageNo,"15");
                        }
                    }
                });
            },
            /*
             * 跳转评论
             * */
            goCommentReport:function (str,reviewerName) {
                var t = this;
                t.commentType = str;
                $("#single_report_detail").hide();
                if(str == "comment"){
                    t.commentPageHeader("评论");
                    t.placeholderTextarea = "所有工作的进步都离不开细心的点评与指导";
                }else if(str == "reply"){
                    t.commentPageHeader("回复");
                    t.placeholderTextarea = "回复@"+reviewerName+"：对TA说点什么吧...";
                }
                location.href = "#!/singleReportDetail/" + t.reportId + "/addComment";
            },
            /*
             * 退出评论
             * */
            leaveCommentReport:function () {
                var t = this;
                t.initPageHeader();
                $("#single_report_detail").find(".report_single_content").show();
                $("#single_report_detail").find(".report_single_content").animate({
                    left:"0",
                    opacity:"1",
                },400);
                $("#single_report_detail").find(".comment_report").animate({
                    right:"-100%",
                    opacity:"0",
                },400,function () {
                    $("#single_report_detail").find(".comment_report").hide();
                });
            },
            /*
             * 查看阅读人列表
             * */
            goReaderList:function () {
                var t = this;
                $.when(t.getAllReadData()).done(function () {
                    window.location.href = "#!/singleReportDetail/" + t.reportId + "/readerList";
                })
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
                    for(var i=0;i<arr.length;i++){
                        //如果是图片类型
                        if(arr[i].field_type == "pic"){
                            arr[i].valueUrls = []; //专门存图片的真实url
                            if($.isArray(arr[i].value)){
                                for(var j=0;j<arr[i].value.length;j++){
                                    //获取图片路径
                                    if(arr[i].value[j]){
                                        Ajax.ajax({
                                            url:gMain.basePath + "apiCloud/cpCloudCommon/download.do"
                                            ,data:JSON.stringify({uuid:arr[i].value[j]})
                                            ,async:false //同步加载
                                            ,success:function (data) {
                                                if(data.result = "true"){
                                                    arr[i].valueUrls.push({uuid:arr[i].value[j],url:data.data});
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                        }

                        //内嵌字段的处理
                        switch (arr[i].field_type){
                            case "group":
                                arr[i].group.fields = setData(arr[i].group.fields);
                                break;
                            case "twoColumns":
                                arr[i].firstCol.fields = setData(arr[i].firstCol.fields);
                                arr[i].secondCol.fields = setData(arr[i].secondCol.fields);
                                break;
                            case "threeColumns":
                                arr[i].firstCol.fields = setData(arr[i].firstCol.fields);
                                arr[i].secondCol.fields = setData(arr[i].secondCol.fields);
                                arr[i].thirdCol.fields = setData(arr[i].thirdCol.fields);
                                break;
                            default:
                            //

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
            'app-head-img':function(data){
                if(!$.isEmptyObject(data)) {

                    $(this.el).headImgLoad({
                        userId: data.personId //dd号
                        , userName: data.personName
                        , userImg: gMain.DayHRDomains.baseStaticDomain + data.headImg
                    });
                }
            },
            'receiver-head-img':function(data){
                if(!$.isEmptyObject(data)) {
                    $(this.el).headImgLoad({
                        userId: data.receiverId //dd号
                        , userName: data.receiverName
                        , userImg: gMain.DayHRDomains.baseStaticDomain + data.headImg
                    });
                }
            },
            'comment-head-img':function(data){
                if(!$.isEmptyObject(data)) {
                    $(this.el).headImgLoad({
                        userId: data.reviewer //dd号
                        , userName: data.reviewerName
                        , userImg: gMain.DayHRDomains.baseStaticDomain + data.reviewerHeadImg
                    });
                }
            },
            "start-time-handle":function (data) {
                if (!$.isEmptyObject(data)){
                    var nowDate =new Date(data.startTime.slice(0,10));//截取日期字符串转换问日期变量
                    var theWeek = nowDate.getDay(); //当天为周几
                    var daysOfMonth = nowDate.getDate(); //这个月的第几天
                    var monthOfYear = nowDate.getMonth()+1; //今年的几月份
                    var theYear = nowDate.getFullYear(); //年
                    var weekOfMonth = "";   //这个月的第几周
                    var arr = ["日","一","二","三","四","五","六"];
                    if(theWeek == 0){     //这天刚好是周日
                        weekOfMonth = Math.floor(daysOfMonth/7);
                    }else {
                        weekOfMonth = Math.floor((daysOfMonth + 7 - theWeek)/7);
                    }
                    var theWeekStr = theWeek+"";
                    theWeekStr ="周" + theWeekStr.replace(new RegExp(theWeekStr, "g"),arr[theWeek]);
                    if(data.tempName == "周报"){
                        var monday
                        if(theWeek == 0){     //这天刚好是周日
                            monday = new Date(nowDate.getTime() - 6*24*60*60*1000);
                            theYear = monday.getFullYear(); //年
                            monthOfYear = monday.getMonth()+1; //今年的几月份
                            daysOfMonth = monday.getDate(); //这个月的第几天
                            theWeek = monday.getDay(); //当天为周几
                        }else {
                            monday = new Date(nowDate.getTime() - (theWeek - 1)*24*60*60*1000);
                            theYear = monday.getFullYear(); //年
                            monthOfYear = monday.getMonth()+1; //今年的几月份
                            daysOfMonth = monday.getDate(); //这个月的第几天
                            theWeek = monday.getDay(); //当天为周几
                        }
                        weekOfMonth = Math.floor((daysOfMonth + 7 - theWeek)/7);
                        $(this.el).html(data.tempName+"&nbsp;（"+theYear+"年"+monthOfYear+"月"+"第"+weekOfMonth+"周）");
                    }else if(data.tempName == "月报"){
                        $(this.el).html(data.tempName+"&nbsp;（"+theYear+"年"+monthOfYear+"月）");
                    }else{
                        $(this.el).html(data.tempName+"&nbsp;（"+monthOfYear+"-"+daysOfMonth+"&nbsp;"+theWeekStr+"）");
                    }
                }
            }
        }

    });
    module.exports = VueComponent;
});


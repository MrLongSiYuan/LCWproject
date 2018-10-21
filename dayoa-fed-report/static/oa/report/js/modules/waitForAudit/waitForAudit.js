/**
 * 待审
 * @options
 * @options.item
 * @options.oMetadata
 * @options.read_state 所属页面 1：待审批的,3：抄送我的，4：我发起的
 */
define(function(require, exports, module) {
    require("js/modules/waitForAudit/waitForAudit.css");
    var sTpl = require("js/modules/waitForAudit/waitForAudit.html");
    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");
    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");
    require("js/modules/formPreview/formPreview.js");
    //表单数据展示插件
    require("js/modules/formDataShow/formDataShow.js");
    var AuditSelect = require("js/modules/auditSelect/auditSelect.js"); //添加审批人组件

    var waitForAudit = function () {
        this.init.apply(this, arguments);
    };

    $.extend(waitForAudit.prototype,{
        //默认参数
        options:{

        }
        ,init:function (options) {
            var t = this;
            t.options = $.extend({}, t.options, options);
            t.initDialog();
        }
        ,initDialog:function () {
            var t = this;
            var sTitle = "汇报查看",reportsSource,aButton;
            if(t.options.reportsListClassify){  //存在则说明是从汇报列表预览不存在则说明是从汇报发起预览
                reportsSource =  t.options.reportsListClassify.reportList.reportsSource;
            }
            if(t.options.previewType == "submitPre" || (reportsSource && reportsSource == "sendOut" && t.options.previewType == "singleDraftPre")){  //发起 提交/我发起的草稿提交预览
                if(t.options.previewType == "submitPre"){
                    sTitle = "汇报预览";
                }
                aButton = [
                    {
                        value: '放心提交',
                        callback: function () {
                            if(t.vueObj.canSaveReportflag){  //做开关控制
                                t.vueObj.canSaveReportflag = false;
                                t.vueObj.saveReport(t.options.oPostData);
                            }
                            return false;
                        },
                        autofocus: true
                    },
                    {
                        value: '返回修改',
                        callback: function () {
                        }
                    }
                ];
            }else if(reportsSource &&  reportsSource == "sendOut" && t.options.previewType == "singlePre"){  //我发起的已发查看
                aButton = [
                    // {
                    //     value: '确定',
                    //     callback: function () {
                    //     },
                    //     autofocus: true
                ];
            }else if(reportsSource && reportsSource == "received"){  //我收到的
                aButton = [];
            }
            var d = dialog({
                title:sTitle
                ,button:aButton
                ,content:sTpl
                ,padding:"20px 0px 20px 0px"
                ,onshow: function () {
                    // $(window.top.document.body).css('cssText', 'padding-top: 65px!important')
                }
                ,onclose: function () {
                    if(t.options.previewType == "submitPre"){ //提交预览
                        t.options.previewAudit.canOpenPreview = true;
                    }
                    if(t.options.previewType == "singlePre"){//单个汇报预览
                        t.options.reportsListClassify.canOpenPreview = true;
                    }
                    if(t.options.reportsListClassify && t.options.reportsListClassify.reportList.reportsSource == "received" && t.options.reportsListClassify.reportList.sendAready == "2"){ //未阅变为已阅
                        t.options.reportsListClassify.reportList.sponsorAll.getHaveSentDataOrNot();
                        t.options.reportsListClassify.reportList.sponsorAll.getRoportType(); //请求已发或未发的全部汇报类型
                    };
                },
            });
            t.initVue();
            t.d = d;
            setTimeout(function () {
                t.d.showModal();
            },50);
        }
        ,initVue:function () {
            var that = this;
            //待审流程核心组件
            that.vueObj = new Vue({
                el:"#workflow_waitForAudit_wrap"
                ,data:{
                    gMain:gMain
                    ,aAuditList:that.options.recipientList  //接收人列表
                    ,aFormStyle:[] //表单数据
                    ,auditName:''
                    ,canSaveReportflag:true //可以提交汇报
                    ,canPraiseFlag:true   //可以执行点赞操作
                    ,theAllReportsLength:null
                    ,uuid:that.options.singleReportData?that.options.singleReportData.wrData.uuid:""   //当前查看的汇报id
                    ,audit_opinion:""
                    ,forwardType:that.options.forwardType  //0:可以转发 1:禁止转发
                    ,currentPersonId:gMain.tools.Cache.getCache("oHeaderData","session").userInfo.personId  //当前登录用户的personId
                    ,reporters:that.options.reporterInfor   //汇报信息
                    ,previewType:that.options.previewType   //来源单个汇报查看（singlePre）提交预览（submitPre）
                    ,reportsSource:""  //sendOut（我发起的） received（我收到的）
                    ,sendAready:"" //组件列表是显示已发送/阅读（1）未发送/未阅读（2）
                    ,uuidList:[]   //未阅读变为已阅读列表
                    ,reportData:that.options.singleReportData?that.options.singleReportData:""
                    ,canComment:false //打开评论
                    ,openReadImg:false //打开阅读头像
                    ,openPraiseImg:false  //打开点赞头像
                    ,showPraiseHeadImgList:[] //当前显示点赞头像
                    ,readHeadImgList:[]  //所有阅读头像列表
                    ,showReadHeadImgList:[] //当前显示阅读头像
                    ,showCommentInforList:[]  //当前显示的评论
                    ,commentContent:""
                    ,personInforCheck:""  //检测提交时登录人是否切换
                    ,replyContent:""
                    ,postCommentOption:{   //评论参数
                        content:"",
                        infoId:null,
                        replyTo:null,
                        reviewer:null,
                        extParam:{},
                        messageType:37,
                        ifSendMsg:1,
                        projectName:"汇报",
                        receivePersonId:""
                    }
                    ,replyInfor:{       //回复对象
                        replyHeadImg:null,
                        replyTo:null,
                        replyToName:null,
                    }
                    ,commentPlaceholder:""
                    ,userInfo:{} //登录人信息
                    ,pageInforComment:{
                        total:0,
                        pageNo:1,          //当前页
                        onePageNum:10,      //一页显示评论数量
                        onePageNumArr:[10,20,50,100]
                    }
                    ,pageInforPraise:{
                        total:0,
                        pageNo:1,          //当前页
                        onePageNum:12,      //一页显示汇报数量
                        onePageNumArr:[10,20,50,100]
                    }
                    ,pageInforRead:{
                        total:0,
                        pageNo:1,          //当前页
                        onePageNum:12,      //一页显示汇报数量
                        onePageNumArr:[10,20,50,100]
                    }
                }
                ,attached:function () {
                    var t = this;
                    var oUser = tools.Cache.getCache("oHeaderData","session");
                    t.userInfo = oUser.userInfo;
                    if(that.options.reportsListClassify){  //存在则说明是从汇报列表预览 不存在则说明是从汇报发起预览
                        t.theAllReportsLength = that.options.reportsListClassify.reportList.reportListsArr.length;
                        t.reportsSource =  that.options.reportsListClassify.reportList.reportsSource;
                        t.sendAready =  that.options.reportsListClassify.reportList.sendAready;
                        if(!(t.sendAready == '2' && t.reportsSource == "sendOut")){  //不是草稿获取评论总数
                            t.getAllCommentData(t.pageInforComment.pageNo,t.pageInforComment.onePageNum);
                        }
                    };
                    if(that.options.comment){   //列表直接点评论
                        t.canComment = true;
                    }
                    if(that.options.previewType == "submitPre" || that.options.previewType == "singleDraftPre"){   //发起汇报将要提交
                        t.getFormData();
                    }else if(that.options.previewType == "singlePre"){
                        t.getSingleFormData(that.options.nodeData);
                    }
                    if(t.reportsSource == "received"){
                        t.reportReadStatus();
                        if(t.sendAready == "2"){
                            t.reportData.wrData.readCounts += 1;
                        }
                    }
                    t.initDomEvent();
                }
                ,ready:function () {
                    var t = this;
                    if(that.options.previewType != "submitPre"){
                        setTimeout(function () {
                            t.prevNextBtnStyle();
                        },200);
                    }
                }
                ,methods:{
                    /*
                     * 分享
                     * */
                    reportShare:function (e) {
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
                        if(t.aFormStyle.length>3){
                            for(var i = 0;i<3;i++){
                                if(t.aFormStyle[i].field_type == "twoColumns" || t.aFormStyle[i].field_type == "threeColumns"){
                                    $.each(t.aFormStyle[i].firstCol.fields,function (num,val){
                                        imbodyFun(val);
                                    })
                                    $.each(t.aFormStyle[i].secondCol.fields,function (num,val){
                                        imbodyFun(val);
                                    })
                                    if(t.aFormStyle[i].thirdCol){
                                        $.each(t.aFormStyle[i].thirdCol.fields,function (num,val){
                                            imbodyFun(val);
                                        })
                                    }
                                }else{
                                    imbodyFun(t.aFormStyle[i]);
                                }
                            }
                        }else {
                            for(var i = 0;i<t.aFormStyle.length;i++){
                                if(t.aFormStyle[i].field_type == "twoColumns" || t.aFormStyle[i].field_type == "threeColumns"){
                                    $.each(t.aFormStyle[i].firstCol.fields,function (num,val){
                                        imbodyFun(val);
                                    })
                                    $.each(t.aFormStyle[i].secondCol.fields,function (num,val){
                                        imbodyFun(val);
                                    })
                                    if(t.aFormStyle[i].thirdCol){
                                        $.each(t.aFormStyle[i].thirdCol.fields,function (num,val){
                                            imbodyFun(val);
                                        })
                                    }
                                }else{
                                    imbodyFun(t.aFormStyle[i]);
                                }
                            }
                        }
                        new AuditSelect({
                            addType:"multiple",
                            title:"添加转发接收人",
                            origin:"reportShare",
                            isSelectPos:false,
                            reportId:t.uuid,
                            imTitle:t.reportData.wrData.tempName,
                            imBody:imBody,
                            afterSelect:function (data,obj) {
                                var isHasSame = false;
                                t.shareReciverList = [];
                                //过滤重复的
                                _.each(data,function (obj) {
                                    if(_.findIndex(t.shareReciverList,{person_id:obj.audit_person_id}) == -1){
                                        t.shareReciverList.push({
                                            "person_id" : obj.audit_person_id,
                                            "person_name" : obj.audit_person_name,
                                            "person_img":obj.audit_person_img
                                        });
                                    }else{
                                        isHasSame = true;
                                    }
                                });
                                if(isHasSame){
                                    tools.showMsg.ok("已经去除重复选择的抄送人");
                                }
                                obj.remove();
                            }
                        });
                    },
                    /**
                     * 初始化dom事件
                     * */
                    initDomEvent:function () {
                        var  t = this;
                        $("#workflow_waitForAudit").off("mouseenter.imglist").on("mouseenter.imglist",".imglist li",function () {
                            $(this).find(".preview_download_upload").css({display:"block"});
                        });
                        $("#workflow_waitForAudit").off("mouseleave.imglist").on("mouseleave.imglist",".imglist li",function () {
                            $(this).find(".preview_download_upload").css({display:"none"});
                        });
                        $("#workflow_waitForAudit").off("mouseenter.addFilePreview").on("mouseenter.addFilePreview",".addFilePreview li",function () {
                            $(this).find(".preview_download_upload").css({display:"block"});
                        });
                        $("#workflow_waitForAudit").off("mouseleave.addFilePreview").on("mouseleave.addFilePreview",".addFilePreview li",function () {
                            $(this).find(".preview_download_upload").css({display:"none"});
                        });
                        $("#workflow_waitForAudit_wrap").on("click",function (e) {
                            if(e.target.className != "preview_remind_box"){
                                $("#workflow_waitForAudit_wrap .preview_remind_box").css({"opacity":"","transform":""});
                            }
                        })
                    }
                    /*
                     * 评论页码改变
                     * */
                    ,changePageNo:function (state) {
                        var t = this;
                        t.pageInforComment.pageNo = state;
                        t.showCommentInforList = t.getAllCommentData(t.pageInforComment.pageNo,t.pageInforComment.onePageNum);
                    }
                    /*
                     * 一页显示的数量
                     * */
                    ,changeOneDataNum:function (state) {
                        var t = this;
                        t.pageInforComment.onePageNum = state;
                        t.pageInforComment.pageNo = 1;
                        t.showCommentInforList = t.getAllCommentData(t.pageInforComment.pageNo,t.pageInforComment.onePageNum);
                    }
                    /*
                     * 点赞头像页码改变
                     * */
                    ,changePraisePageNo:function (state) {
                        var t = this;
                        t.pageInforPraise.pageNo = state;
                        t.showPraiseHeadImgList =  t.getAllPraiseData(t.pageInforPraise.pageNo,t.pageInforPraise.onePageNum);
                    }
                    /*
                     * 阅读头像页码改变
                     * */
                    ,changeReadPageNo:function (state) {
                        var t = this;
                        t.pageInforRead.pageNo = state;
                        t.showReadHeadImgList = t.pagingData(t.pageInforRead.pageNo,t.pageInforRead.onePageNum,t.readHeadImgList);
                    }
                    /*
                     * 数据分页
                     * */
                    ,pagingData:function (pageNo,onePageNum,allArr) {
                        var start,end,t = this;
                        start = (pageNo - 1) * onePageNum;
                        end = pageNo * onePageNum;
                        return allArr.slice(start,end);
                    }
                    /*
                    * 附加项（点赞头像、阅读头像、评论）展开/收起
                    * */
                    ,openAdditionalContent:function (str) {
                        var t = this;
                        if(str == "comment"){
                            t.canComment = !t.canComment;
                            t.openReadImg = false;
                            t.openPraiseImg = false;
                        }else if(str == "read"){
                            t.canComment = false;
                            t.openReadImg = !t.openReadImg;
                            t.openPraiseImg = false;
                            if(t.openReadImg){
                                t.getAllReadData();
                            }
                        }else if(str == "praise"){
                            t.canComment = false;
                            t.openReadImg = false;
                            t.openPraiseImg = !t.openPraiseImg;
                            if(t.openPraiseImg){
                                t.getAllPraiseData(t.pageInforPraise.pageNo,t.pageInforPraise.onePageNum);
                            }
                        }
                        if(t.canComment){
                            t.wrapScrollTopBottom();
                        }
                    }
                    /*
                    * 显示评论  阅读头像 点赞头像后滚动底部
                    * */
                    ,wrapScrollTopBottom:function () {
                        setTimeout(function () {
                            var innerHeight = $("#workflow_waitForAudit_wrap .all_waitForAudit_box").height();
                            if(innerHeight > 660){
                                $("#workflow_waitForAudit_wrap").scrollTop(innerHeight - 660);
                            }
                        },200)
                    }
                     /*
                     * 评论
                     * */
                    ,reportComment:function (str,e) {
                        var t = this,postUrl;
                        postUrl = gMain.amBasePath + "cmComments/addComment.do";
                        if(str == "reply"){
                            if(!t.replyContent){
                                return false;
                            }
                            t.postCommentOption.replyTo = t.replyInfor.replyTo;
                            t.postCommentOption.content = t.replyContent;
                        }else if(str == "comment"){
                            if(!t.commentContent){
                                return false;
                            }
                            t.postCommentOption.replyTo = null;
                            t.postCommentOption.content = t.commentContent;
                        }
                        t.postCommentOption.infoId = t.uuid;
                        t.postCommentOption.reviewer = t.userInfo.personId;
                        t.postCommentOption.receivePersonId = t.reportData.wrData.personId;
                        t.postCommentOption.extParam = {
                            "uuid":t.uuid,
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
                                    if(str == "reply"){
                                        $(e.target).parents(".reply_comment_box").css("display","none");
                                        t.commentRemind("reply",t.replyContent);
                                        t.replyContent = "";
                                    }else{
                                        t.commentRemind("comment",t.commentContent);
                                        t.commentContent = "";
                                    };
                                    var reportListsArr = that.options.reportsListClassify.reportList.reportListsArr;
                                    t.reportData.wrData.commentInfo.isComment = 1;
                                    for(var i = 0;i<reportListsArr.length;i++){
                                        if(reportListsArr[i].uuid == (t.uuid+"")){
                                            reportListsArr[i].commentInfo.isComment = 1;
                                            reportListsArr[i].commentInfo.count += 1;
                                        }
                                    }
                                    t.pageInforComment = {
                                            total:"",
                                            pageNo:1,          //当前页
                                            onePageNum:10,      //一页显示评论数量
                                            onePageNumArr:[10,20,50,100]
                                    }
                                    t.pageInforComment.pageNo = 1;
                                    t.getAllCommentData(t.pageInforComment.pageNo,t.pageInforComment.onePageNum);
                                }
                            }
                        });
                    }
                    /*
                     * 评论发消息
                     * */
                    ,commentRemind:function (type,content) {
                        var t = this,postData;
                        var oUser = tools.Cache.getCache("oHeaderData","session");
                        var userInfor = {
                            "orgName":""+oUser.userInfo.orgName,
                            "personName":""+oUser.userInfo.userName
                        }
                        if(type == "comment"){
                            postData = {
                                imTitle:t.reportData.wrData.tempName+"",
                                // imBody:gMain.personInforReport.personName+"："+content,
                                imBody:content,
                                personId:t.reportData.wrData.personId+"",   //汇报发起人的id
                                reportId:t.uuid+"",
                            }
                        }else if(type == "reply"){
                            postData = {
                                imTitle:t.reportData.wrData.tempName+"",
                                // imBody:gMain.personInforReport.personName+"回复你："+content,
                                imBody:content,
                                personId:t.reportData.wrData.personId+"",   //汇报发起人的id
                                reportId:t.uuid+"",
                                replyTo:t.replyInfor.replyTo+"",
                            }
                        }
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
                    }
                    /*
                     * 获取当前汇报所有评论
                     * */
                    ,getAllCommentData:function (pageNo,onePageNum) {
                        var t = this,postUrl;
                        postUrl = gMain.amBasePath + "cmComments/getCommentsInfo.do";
                        Ajax.ajax({
                            url:postUrl,
                            data:JSON.stringify({
                                infoId:parseInt(t.uuid),
                                pageNo:parseInt(pageNo),
                                pageSize:parseInt(onePageNum),
                            }),
                            beforeSend:function () {

                            },
                            complete:function () {

                            },
                            success:function(data) {
                                if (data.result == "true" && data.data.list){
                                    t.pageInforComment.total = data.data.recordCount;
                                    t.showCommentInforList = data.data.list.slice(0);
                                }
                            }
                        });
                    }
                    /*
                     * 删除评论
                     * */
                    ,deletecomment:function (uuid) {
                        var t = this,postUrl;
                        postUrl = gMain.amBasePath + "cmComments/delComment.do";
                        Ajax.ajax({
                            url:postUrl,
                            data:JSON.stringify({
                                infoId:parseInt(t.uuid),
                                uuid:parseInt(uuid),
                            }),
                            beforeSend:function () {

                            },
                            complete:function () {

                            },
                            success:function(data) {
                                if (data.result == "true"){
                                    for(var i = 0;i<t.showCommentInforList.length;i++){
                                        if(t.showCommentInforList[i].uuid == uuid){
                                            t.showCommentInforList.splice(i,1);
                                        }
                                    }
                                    var reportListsArr = that.options.reportsListClassify.reportList.reportListsArr;
                                    // for(var i = 0;i<reportListsArr.length;i++){
                                    //     if(reportListsArr[i].uuid == (t.uuid+"")){
                                    //         if(_.findIndex(t.commentInforList,{reviewer:t.userInfo.personId}) == -1){
                                    //             t.reportData.wrData.commentInfo.isComment = 0;
                                    //             reportListsArr[i].commentInfo.isComment = 0;
                                    //         }
                                    //         reportListsArr[i].commentInfo.count -= 1;
                                    //     }
                                    // }
                                   t.pageInforComment.total -= 1;
                                }
                            }
                        });
                    }
                    /*
                     * 回复评论
                     * */
                    ,replycomment:function (commentUuid,replyName,replyId,repltHeadImg,e) {
                        var t = this;
                        if($(e.target).parents(".person_comment_personInfo").siblings(".reply_comment_box").css("display") == "none"){
                            $(e.target).parents(".person_comment_personInfo").siblings(".reply_comment_box").css("display","block");
                            t.commentPlaceholder = "回复@"+replyName+"：对他说点什么吧...";
                        }else{
                            $(e.target).parents(".person_comment_personInfo").siblings(".reply_comment_box").css("display","none");
                            t.replyContent = null;
                        }

                    }
                    /*
                     * 回复评论输入框获取焦点
                     * */
                    ,replyOnfocus:function (commentUuid,replyName,replyId,repltHeadImg) {
                        var t = this;
                        t.replyInfor = {
                            replyHeadImg:null,
                            replyTo:null,
                            replyToName:null,
                        }
                        t.replyInfor.replyTo = replyId;
                        t.replyInfor.replyName = replyName;
                        t.replyInfor.repltHeadImg = repltHeadImg;
                    }
                    /*
                     * 评论输入框获取焦点
                     * */
                    ,commentOnfocus:function () {
                        var t = this;
                        t.replyInfor = {
                            replyHeadImg:null,
                            replyTo:null,
                            replyToName:null,
                        }
                    }
                    /*
                    * 点赞
                    * */
                    ,reportPraise:function (isPraise,e) {
                        var t = this,postUrl,praiseId;
                        if(!t.canPraiseFlag){  //请求未完成不能再次请求
                            return;
                        }
                        if(isPraise == '0'){
                            postUrl = gMain.amBasePath + "cmPraise/addPraise.do";
                        }else if(isPraise == '1'){
                            postUrl = gMain.amBasePath + "cmPraise/delPraise.do";
                        }
                        praiseId = parseInt($(e.target).attr("praise-id"));
                        Ajax.ajax({
                            url:postUrl,
                            data:JSON.stringify({
                                infoId:t.uuid,
                                "ifSendMsg":1,
                                "messageType":38,
                                "extParam":{
                                    "uuid":t.uuid,
                                    "is_need_st":"1",
                                    "projectName":"汇报"
                                },
                                "receivePersonId":t.reportData.wrData.personId,
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
                                    var reportListsArr = that.options.reportsListClassify.reportList.reportListsArr;
                                    for(var i = 0;i<reportListsArr.length;i++){
                                        if(reportListsArr[i].uuid == (t.uuid+"")){
                                            if(isPraise == '0'){
                                                reportListsArr[i].praiseInfo.isPraise = 1;
                                                reportListsArr[i].praiseInfo.praiseId = data.data;
                                                reportListsArr[i].praiseInfo.count += 1;

                                                t.reportData.wrData.praiseInfo.isPraise = 1;
                                                t.reportData.wrData.praiseInfo.praiseId = data.data;
                                                t.reportData.wrData.praiseInfo.count += 1;
                                                t.praiseRemind();
                                            }else if(isPraise == '1'){
                                                reportListsArr[i].praiseInfo.isPraise = 0;
                                                reportListsArr[i].praiseInfo.praiseId = null;
                                                reportListsArr[i].praiseInfo.count -= 1;

                                                t.reportData.wrData.praiseInfo.isPraise = 0;
                                                t.reportData.wrData.praiseInfo.praiseId = null;
                                                t.reportData.wrData.praiseInfo.count -= 1;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                    /*
                     * 点赞发消息
                     * */
                    ,praiseRemind:function () {
                        var t = this;
                        var oUser = tools.Cache.getCache("oHeaderData","session");
                        var userInfor = {
                            "orgName":""+oUser.userInfo.orgName,
                            "personName":""+oUser.userInfo.userName
                        }
                        var postData = {
                            imTitle:t.reportData.wrData.tempName+"",
                            imBody:"赞："+gMain.personInforReport.personName+"觉得很赞",
                            personId:t.reportData.wrData.personId+"",   //汇报发起人的id
                            reportId:t.uuid+"",
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
                    }
                    /*
                    * 获取点赞人列表
                    * */
                    ,getAllPraiseData:function (pageNo,onePageNum) {
                        var t = this;
                        Ajax.ajax({
                            url:gMain.amBasePath + "cmPraise/getPraiseInfo.do",
                            data:JSON.stringify({
                                infoId:parseInt(t.uuid),
                                pageNo:parseInt(pageNo),
                                pageSize:parseInt(onePageNum),
                            }),
                            beforeSend:function () {
                                $(".ui-popup").loading({zIndex:999999999}); //开启提交遮罩
                            },
                            complete:function () {
                                $(".ui-popup").loading({state:false}); //关闭提交遮罩
                            },
                            success:function(data) {
                                if (data.result == "true" && data.data.list){
                                    t.pageInforPraise.total = data.data.recordCount;
                                    t.showPraiseHeadImgList = data.data.list.slice(0);
                                    t.wrapScrollTopBottom();
                                }
                            }
                        });
                    }
                    /*
                     * 获取阅读人列表
                     * */
                    ,getAllReadData:function () {
                        var t = this;
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrReportRead/listByReprotId.do",
                            data:JSON.stringify({
                                corpId:that.options.singleReportData.wrData.corpId+"",
                                reportId:t.uuid+"",
                            }),
                            beforeSend:function () {
                                $(".ui-popup").loading({zIndex:999999999}); //开启提交遮罩
                            },
                            complete:function () {
                                $(".ui-popup").loading({state:false}); //关闭提交遮罩
                            },
                            success:function(data) {
                                if (data.result == "true" && data.data.list){
                                    t.readHeadImgList = data.data.list.slice(0);
                                    t.pageInforRead.total = data.data.list.length;
                                    t.showReadHeadImgList = t.pagingData(t.pageInforRead.pageNo,t.pageInforRead.onePageNum,t.readHeadImgList);
                                    t.wrapScrollTopBottom();
                                }
                            }
                        });
                    }
                    /**
                     * 获取表单数据 提交表单前
                     * */
                    ,getFormData:function () {
                        var t = this;
                        //获取图片字段的真实地址
                        t.getPicTrueUrl(JSON.parse(that.options.oMetadata.customParam.node_data),function (arr) {
                            arr = t.removeUselessFields(arr);  //去掉垃圾字段
                            t.aFormStyle = JSON.parse(JSON.stringify(arr));
                            $(t.$el).loading({state:false});
                        });
                        // t.queryFieldsPermission(oWaitAudit); //查询字段编辑权限
                        setTimeout(function () {
                            // tools.showMsg.ok("细节决定成败，再检查一遍吧");
                            $("#workflow_waitForAudit_wrap .preview_remind_box").css({"opacity":"1","transform":"scale(1)"});
                            setTimeout(function () {
                                $("#workflow_waitForAudit_wrap .preview_remind_box").css({"opacity":"","transform":""});
                            },2500);
                            that.d.reset();
                        },100);
                    }
                    /**
                     * 上一篇
                     * */
                    ,getPrevReport:function (e) {
                        var t = this;
                        var thePageAllReports = that.options.reportsListClassify.reportList.reportListsArr.slice(0); //当前页的所有汇报
                        if(thePageAllReports.length > 1){
                            for(var i = 0;i<thePageAllReports.length;i++){
                                if(t.uuid == thePageAllReports[i].uuid && i!= 0){   //不是当页第一个
                                    var  orgName = thePageAllReports[i-1].orgName;
                                    Ajax.ajax({
                                        url:gMain.apiBasePath + "wrReportData/getOrgNameByReportId.do",   //只获取组织名
                                        data:JSON.stringify({
                                            reportId:thePageAllReports[i-1].uuid+""
                                        }),
                                        async:false,
                                        beforeSend:function () {
                                        },
                                        complete:function () {
                                        },
                                        success:function(data) {
                                            if (data.result == "true" && data.data) {
                                                orgName = data.data;
                                            }
                                        }
                                    });
                                    var options = {
                                        personName:thePageAllReports[i-1].personName,
                                        orgName:orgName,
                                        createTime:thePageAllReports[i-1].createTime,
                                        modifyTime:thePageAllReports[i-1].modifyTime,
                                        forwardType:thePageAllReports[i-1].forwardType,
                                        nodeData:JSON.stringify(thePageAllReports[i-1].nodeData),
                                        uuid:thePageAllReports[i-1].uuid,
                                    }
                                    t.pageInforComment.pageNo = 1;
                                    t.getAllCommentData(t.pageInforComment.pageNo,t.pageInforComment.onePageNum);
                                    t.reportData.wrData.readCounts = thePageAllReports[i-1].readCounts; //评论数
                                    t.reportData.wrData.praiseInfo.isPraise = thePageAllReports[i-1].praiseInfo.isPraise;
                                    t.reportData.wrData.praiseInfo.count = thePageAllReports[i-1].praiseInfo.count;
                                    t.reportData.wrData.commentInfo.isComment = thePageAllReports[i-1].commentInfo.isComment;
                                    t.reportData.wrData.tempName = thePageAllReports[i-1].tempName;
                                    t.reportData.wrData.personId = thePageAllReports[i-1].personId;
                                    t.canComment = false;
                                    t.openReadImg = false;
                                    t.openPraiseImg = false;
                                    Ajax.ajax({
                                        url:gMain.apiBasePath + "wrReportData/getNodeDataById.do",
                                        data:JSON.stringify({
                                            dataId:thePageAllReports[i-1].dataId+""
                                        }),
                                        beforeSend:function () {
                                        },
                                        complete:function () {
                                        },
                                        success:function(data) {
                                            if (data.result == "true" && data.data) {
                                                options.nodeData = data.data;
                                                t.uuid = options.uuid;
                                                t.prevNextBtnStyle();
                                                t.changeReporter(options);
                                                if(t.reportsSource == "received"){
                                                    t.reportReadStatus();
                                                }
                                            }
                                        }
                                    });
                                    t.getRecieverById(options.uuid);
                                    $(e.target).siblings().css({background:"",cursor:""});
                                    break;
                                }
                            }
                        }
                    }
                    /**
                     * 下一篇
                     * */
                    ,getNextReport:function (e) {
                        var t = this;
                        var thePageAllReports = that.options.reportsListClassify.reportList.reportListsArr.slice(0); //当前页的所有汇报
                        if(thePageAllReports.length > 1){
                            for(var i = 0;i<thePageAllReports.length;i++){
                                if(t.uuid == thePageAllReports[i].uuid && (i!=(thePageAllReports.length-1))){   //不是当页最后一个
                                    var  orgName = thePageAllReports[i+1].orgName;
                                    Ajax.ajax({
                                        url:gMain.apiBasePath + "wrReportData/getOrgNameByReportId.do",   //只获取组织名
                                        data:JSON.stringify({
                                            reportId:thePageAllReports[i+1].uuid+""
                                        }),
                                        async:false,
                                        beforeSend:function () {
                                        },
                                        complete:function () {
                                        },
                                        success:function(data) {
                                            if (data.result == "true" && data.data) {
                                                orgName = data.data;
                                            }
                                        }
                                    });
                                    var options = {
                                        personName:thePageAllReports[i+1].personName,
                                        orgName:orgName,
                                        createTime:thePageAllReports[i+1].createTime,
                                        modifyTime:thePageAllReports[i+1].modifyTime,
                                        forwardType:thePageAllReports[i+1].forwardType,
                                        nodeData:JSON.stringify(thePageAllReports[i+1].nodeData),
                                        uuid:thePageAllReports[i+1].uuid,
                                    }
                                    t.pageInforComment.pageNo = 1;
                                    t.getAllCommentData(t.pageInforComment.pageNo,t.pageInforComment.onePageNum);
                                    t.reportData.wrData.readCounts = thePageAllReports[i+1].readCounts; //评论数
                                    t.reportData.wrData.praiseInfo.isPraise = thePageAllReports[i+1].praiseInfo.isPraise;
                                    t.reportData.wrData.praiseInfo.count = thePageAllReports[i+1].praiseInfo.count;
                                    t.reportData.wrData.commentInfo.isComment = thePageAllReports[i+1].commentInfo.isComment;
                                    t.reportData.wrData.tempName = thePageAllReports[i+1].tempName;
                                    t.reportData.wrData.personId = thePageAllReports[i+1].personId;
                                    t.canComment = false;
                                    t.openReadImg = false;
                                    t.openPraiseImg = false;
                                    Ajax.ajax({
                                        url:gMain.apiBasePath + "wrReportData/getNodeDataById.do",   //只获取汇报的表单数据
                                        data:JSON.stringify({
                                            dataId:thePageAllReports[i+1].dataId+""
                                        }),
                                        beforeSend:function () {
                                        },
                                        complete:function () {
                                        },
                                        success:function(data) {
                                            if (data.result == "true" && data.data) {
                                                options.nodeData = data.data;
                                                t.uuid = options.uuid;
                                                t.prevNextBtnStyle();
                                                t.changeReporter(options);
                                                if(t.reportsSource == "received"){
                                                    t.reportReadStatus();
                                                }
                                            }
                                        }
                                    });
                                    t.getRecieverById(options.uuid);
                                    $(e.target).siblings().css({background:"",cursor:""});
                                    break;
                                }
                            }
                        }
                    }
                    /**
                     * 根据uuid获取汇报接收人
                     * */
                    ,getRecieverById:function (uuid) {
                        var t = this;
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrReportData/getReceivesDataById.do"
                            ,data:JSON.stringify({reportId:uuid+""})
                            ,beforeSend:function () {
                                $("#workflow_waitForAudit_wrap").loading({zIndex:999999999}); //开启提交遮罩
                            }
                            ,complete:function () {
                                $("#workflow_waitForAudit_wrap").loading({state:false}); //关闭提交遮罩
                            }
                            ,success:function (data) {
                                if(data.result = "true" && data.data.list){
                                    t.aAuditList = JSON.parse(JSON.stringify(data.data.list));
                                }
                            }
                        });
                    }
                    /**
                     * 上一篇下一篇按钮判断
                     * */
                    ,prevNextBtnStyle:function () {
                        var t = this;
                        var thePageAllReports = that.options.reportsListClassify.reportList.reportListsArr.slice(0); //当前页的所有汇报
                        if(thePageAllReports.length>1){
                            for(var i = 0;i<thePageAllReports.length;i++){
                                if(t.uuid == thePageAllReports[i].uuid){   //不是当页最后一个
                                    if(i == 0){
                                        $("#workflow_waitForAudit").find(".report_prevBtn").css({background:"#bfbfbf",cursor:"default"});
                                    }
                                    if(i == (thePageAllReports.length-1)){
                                        $("#workflow_waitForAudit").find(".report_nextBtn").css({background:"#bfbfbf",cursor:"default"});
                                    }
                                }
                            }
                        }else{
                            $("#workflow_waitForAudit").find(".report_prevBtn").css({background:"#bfbfbf",cursor:"default"});
                            $("#workflow_waitForAudit").find(".report_nextBtn").css({background:"#bfbfbf",cursor:"default"});
                        };
                    }
                    /**
                     * 汇报阅读
                     * */
                    ,reportReadStatus:function () {
                        var t = this;
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrReportRead/readReportData.do",
                            data:JSON.stringify({
                                reportId:t.uuid+""
                            }),
                            beforeSend:function () {
                            },
                            complete:function () {
                            },
                            success:function(data) {
                                if (data.result == "true") {
                                    if(t.uuidList.indexOf(t.uuid) == -1){
                                        t.uuidList.push(t.uuid);
                                    }
                                }
                            }
                        });
                    }
                    /**
                     * 修改汇报发起信息
                     * */
                    ,changeReporter:function (opts) {
                        var t = this;
                        var personName,orgName,fixedInfor;
                        var nodeDataInfor = JSON.parse(opts.nodeData);
                        try{
                            $.each(nodeDataInfor,function (num,val) {
                                if(val.field_type == "default_field" && val.field_name == "personInfor"){
                                    fixedInfor = $.extend({},fixedInfor,val.value);
                                }
                            })
                        }catch(e){};
                        if(fixedInfor && fixedInfor.orgName != "undefined"){
                            personName = fixedInfor.personName;
                            orgName = fixedInfor.orgName;
                        }else{
                            personName = opts.personName;
                            orgName = opts.orgName;
                        }
                        t.reporters = [            //发起人信息
                            {
                                inforTitle:"部门"
                                ,inforContent:orgName
                            },
                            {
                                inforTitle:"提交人"
                                ,inforContent:opts.personName
                            },
                            {
                                inforTitle:"提交时间"
                                ,inforContent:opts.modifyTime
                            },
                        ];
                        t.uuid = opts.uuid;
                        t.forwardType = opts.forwardType;
                        t.getSingleFormData(opts.nodeData);
                    }
                    /**
                     * 获取单个预览表单数据
                     * */
                    ,getSingleFormData:function (nodeData) {
                        var t = this;
                        //获取图片字段的真实地址
                        t.getPicTrueUrl(JSON.parse(nodeData),function (arr) {
                            arr = t.removeUselessFields(arr);  //去掉垃圾字段
                            t.aFormStyle = JSON.parse(JSON.stringify(arr));
                            $(t.$el).loading({state:false});
                        });
                    }
                    /*获取登录人信息*/
                    ,getPersonInfo:function () {
                        var t = this;
                        var df = $.Deferred();
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrOrgPerson/getPersonBaseInfo.do"
                            ,beforeSend:function () {
                                $(t.$el).loading();//启用loading
                            }
                            ,complete:function () {
                                $(t.$el).loading({state:false});//取消loading
                            }
                            ,success:function (data) {
                                if(data.result == "true"){
                                    t.personInforCheck = data.data;
                                    df.resolve();
                                }
                            }
                        });
                        return df;
                    }
                    /**
                     * 发起汇报
                     * */
                    ,saveReport:function(oPostData){
                        var t = this,postUrl;
                        $.when(t.getPersonInfo()).done(function () {
                            if(t.personInforCheck.personName == oPostData.personName){
                                if(that.options.previewType && that.options.previewType == "singleDraftPre"){
                                    postUrl = gMain.apiBasePath + "wrReportData/updateReportData.do";
                                }else{
                                    postUrl = gMain.apiBasePath + "wrReportData/addReportData.do";
                                }
                                if(oPostData.receiver.length > 0){   //汇报接收人不能为空
                                    //保存数据
                                    Ajax.ajax({
                                        url:postUrl,
                                        data:JSON.stringify(oPostData),
                                        beforeSend:function () {
                                            $("body").loading({zIndex:999999999}); //开启提交遮罩
                                        },
                                        complete:function () {
                                            t.canSaveReportflag = true;
                                            $("body").loading({state:false}); //关闭提交遮罩
                                        },
                                        success:function(data) {
                                            if (data.result == "true") {
                                                tools.showMsg.ok("发送成功"); //成功提示弹层
                                                if(localStorage.getItem(that.options.oPostData.tempId+"-"+t.userInfo.personId)){
                                                    localStorage.removeItem(that.options.oPostData.tempId+"-"+t.userInfo.personId);
                                                }
                                                that.d.close().remove();  //关闭并取消弹窗
                                                that.options.dialog.close().remove();
                                                if(that.options.addReportDialog){
                                                    that.options.addReportDialog.close("addReportFinish").remove(); //关闭并取消选择模板弹窗
                                                }
                                                if(that.options.previewType == "singleDraftPre"){
                                                    that.options.dataPre.reportsListClassify.deleteDraftReport(that.options.oPostData.uuid,"sunmitDraft");
                                                }
                                            }
                                        }
                                    });
                                }else{
                                    tools.showMsg.error("接收人不能为空"); //错误提示弹层
                                }
                            }else{  //当前账号已经切换
                                dialog({
                                    title: '提示',
                                    content: '<div><p>当前账号已经切换到：'+t.personInforCheck.personName+'，</p><p>请刷新页面后重新填写汇报</p></div>',
                                    okValue: '确定',
                                    ok: function () {
                                    },
                                    onclose:function () {

                                    }
                                }).showModal();
                            }
                        });


                    }
                    /**
                     * 查询字段编辑权限
                     * */
                    ,queryFieldsPermission:function (oWaitAudit) {
                        var t = this;
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wfFormSet/getStyleForMongo.do"
                            ,data:JSON.stringify({id:String(oWaitAudit.nodeDataId) ,ident:"audit"})
                            ,beforeSend:function () {
                                $(t.$el).loading();
                            }
                            ,complete:function () {
                                $(t.$el).loading({state:false});
                            }
                            ,success:function (data) {
                                if(data.result == "true" && data.style){
                                    var oStyle = JSON.parse(data.style);
                                    var aFieldsPermission = oStyle.auditDataList[_.findIndex(oStyle.auditDataList,{audit_person_id:oWaitAudit.auditPersonId})].field_permissions; //发起人的字段权限（第一个审批节点的字段权限）

                                    //设置字段权限
                                    var setPermission = function (arr) {
                                        for(var i=0;i<arr.length;i++){
                                            arr[i].isShow = true; //默认可见
                                            arr[i].isEdit = false; //默认不可编辑

                                            //扩充权限属性
                                            for(var j=0;j<aFieldsPermission.length;j++){
                                                if(arr[i].field_name == aFieldsPermission[j].field_name){
                                                    arr[i].isShow = aFieldsPermission[j].isShow; //是否可显示
                                                    arr[i].isEdit = aFieldsPermission[j].isEdit; //是否可编辑
                                                }
                                            }

                                            //内嵌字段的处理
                                            switch (arr[i].field_type){
                                                case "group":
                                                    arr[i].group.fields = setPermission(arr[i].group.fields);
                                                    break;
                                                case "twoColumns":
                                                    arr[i].firstCol.fields = setPermission(arr[i].firstCol.fields);
                                                    arr[i].secondCol.fields = setPermission(arr[i].secondCol.fields);
                                                    break;
                                                case "threeColumns":
                                                    arr[i].firstCol.fields = setPermission(arr[i].firstCol.fields);
                                                    arr[i].secondCol.fields = setPermission(arr[i].secondCol.fields);
                                                    arr[i].thirdCol.fields = setPermission(arr[i].thirdCol.fields);
                                                    break;
                                                default:
                                                //

                                            }
                                        }
                                        return  arr;
                                    };
                                    t.aFormStyle = setPermission(t.aFormStyle);
                                    t.aFormStyle = JSON.parse(JSON.stringify(t.aFormStyle));
                                }
                            }
                        });
                    }
                    /**
                     * 获取图片真实路径
                     * @arr 获取的字段集
                     * @callback 获取真实图片后的回调
                     * */
                    ,getPicTrueUrl:function (aFormStyle ,callback) {
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
                    }
                    /**
                     * 审批流程
                     * */
                    ,doAudit:function (type) {
                        var t = this;
                        if(!$.trim(t.audit_opinion) && type != "agree"){
                            tools.formTipMsg({
                                $input:$(t.$el).find("textarea[name='audit_opinion']")
                                ,msg:"请输入审批理由"
                            });
                            return false;
                        }

                        //去掉垃圾字段
                        t.aFormStyle = t.removeUselessFields(t.aFormStyle);

                        var oSend = {
                            customParam:{
                                node_data:JSON.stringify(t.aFormStyle)
                            }
                            ,dataList:[
                                {key:"node_state",value:"3"},
                                {key:"audit_timed",value:tools.dateFormat(new Date(),'yyyy-MM-dd hh:mm:ss')},
                                {key:"audit_opinion",value:t.audit_opinion},
                                {key:"process_instanc_id",value:String(that.options.item.process_instanc_id)}
                            ]
                            ,infoSetId:"wf_process_audit_list"
                            ,uuid:""
                        };

                        //精确定位待审批的人
                        var currentPersonInfo = t.aAuditList[_.findIndex(t.aAuditList,{auditPersonId:t.currentPersonId})]; //当前待审批的节点审批人
                        var oWaitAudit =  t.aAuditList[_.findIndex(t.aAuditList,{nodeState:"1"})]; //当前待审的人
                        if(oWaitAudit){
                            currentPersonInfo = oWaitAudit;
                        }
                        oSend.dataList.push({key:"node_number",value:String(currentPersonInfo.nodeNumber)});
                        oSend.uuid = currentPersonInfo.uuid;

                        if(type == "agree"){
                            oSend.dataList[0].value = "3";
                        }else if(type == "back"){
                            oSend.dataList[0].value = "4";
                        }else if(type == "turn"){
                            t.turnAuditToAnotherPerson(oSend);
                            return;
                        }

                        Ajax.ajax({
                            url:gMain.apiBasePath + "route/wf_process_audit_list/update.do"
                            ,data:JSON.stringify(oSend)
                            ,beforeSend:function () {
                                $(t.$el).loading();
                            }
                            ,complete:function () {
                                $(t.$el).loading({state:false});
                            }
                            ,success:function (data) {
                                if(data.result=="true"){
                                    tools.showMsg.ok("审批成功");
                                    that.d.close().remove();
                                    that.options.oMetadata.mmg.load(); //刷新待审批列表
                                }
                            }
                        });
                    }
                    /**
                     * 初次加载数据和保存数据的时候去掉垃圾字段
                     * @arrJson 待处理的数据
                     * */
                    ,removeUselessFields:function (arrJson) {
                        var t = this;
                        var setData = function (arr) {
                            for(var i=0;i<arr.length;i++){
                                delete arr[i].isDoEdit;

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
                        return setData(arrJson);
                    }
                    //转办流程
                    ,turnAuditToAnotherPerson:function (oSend) {
                        var t = this;
                        new AuditSelect({
                            addType:"single",
                            title:"选择审批人",
                            isSelectPos:false,
                            afterSelect:function (data) {
                                var oSelect = data[0];
                                oSend.dataList[0].value = "6";
                                oSend.customParam.turn_to_personId = oSelect.audit_person_id;
                                oSend.customParam.turn_to_personName = oSelect.audit_person_name;
                                Ajax.ajax({
                                    url:gMain.apiBasePath + "route/wf_process_audit_list/update.do"
                                    ,data:JSON.stringify(oSend)
                                    ,beforeSend:function () {
                                        $(t.$el).loading();
                                    }
                                    ,complete:function () {
                                        $(t.$el).loading({state:false});
                                    }
                                    ,success:function (data) {
                                        if(data.result=="true"){
                                            tools.showMsg.ok("转办成功");
                                            that.d.close().remove();
                                            that.options.oMetadata.mmg.load(); //刷新待审批列表
                                        }
                                    }
                                });
                            }
                        });
                    }
                    //删除流程
                    ,deleteAudit:function () {
                        var t = this;
                        layer.confirm('删除后不可恢复，确认删除？', {icon: 3, title:'提示'}, function(index){
                            Ajax.ajax({
                                url:gMain.apiBasePath + "wfProcess/delProcess.do"
                                ,data:JSON.stringify({
                                    process_instanc_id:String(that.options.item.process_instanc_id)
                                })
                                ,beforeSend:function () {
                                    $("body").loading();
                                }
                                ,complete:function () {
                                    $("body").loading({state:false});
                                }
                                ,success: function (data) {
                                    if(data.result == "true"){
                                        tools.showMsg.ok("删除成功");
                                        that.options.oMetadata.mmg.load(); //刷新待审批列表
                                    }
                                }
                            });
                            that.d.close().remove();
                            layer.close(index);
                        });
                    }
                    //重定位流程
                    ,redirectAuditPerson:function () {
                        var t = this;
                        that.dialogSelectAuditPerson = dialog({
                            title:"流程节点重定于"
                            ,content:"<div id='workflow_waitForAudit_node'>" +
                            "   <select name='node'>" +
                            "       <option v-for='item in aAuditList' value='{{item.auditPersonId}}' data-nodeNumber='{{item.nodeNumber}}' data-processInstancId='{{item.processInstancId}}'>{{item.auditPersonName}}</option>" +
                            "   </select>" +
                            "</div>"
                            ,ok:function () {
                                var $select = $(that.vueSelectAuditPerson.$el).find("select[name='node']");
                                Ajax.ajax({
                                    url:gMain.apiBasePath + "wfProcess/redirectAuditPerson.do"
                                    ,data:JSON.stringify({
                                        node_number:$select.find("option:selected").attr("data-nodeNumber")
                                        ,process_instanc_id:$select.find("option:selected").attr("data-processInstancId")
                                    })
                                    ,beforeSend:function () {
                                        $(that.vueObj.$el).loading();
                                        that.dialogSelectAuditPerson.close().remove(); //关闭重定位窗口
                                    }
                                    ,complete:function () {
                                        $(that.vueObj.$el).loading({state:false});
                                    }
                                    ,success:function (data) {
                                        if(data.result == "true"){
                                            tools.showMsg.ok("流程重定位成功");
                                            t.getFormData(); //重新获取流程数据
                                        }
                                    }
                                });
                                return false;
                            }
                        });
                        that.dialogSelectAuditPerson.showModal(); //显示弹窗
                        that.vueSelectAuditPerson = new Vue({
                            el:"#workflow_waitForAudit_node"
                            ,data:{
                                aAuditList:[]
                            }
                            ,attached:function () {
                                var t = this;
                                t.aAuditList = that.vueObj.aAuditList;
                            }
                        });
                    }
                    /**
                     * 修改字段数据
                     * */
                    ,changeFieldData:function ($event,item) {
                        var t = this;
                        //如果是处在编辑模式
                        if(item.isDoEdit){
                            item.isDoEdit = false;

                            //确定按钮设置值
                            switch (item.field_type){
                                case "text":
                                case "paragraph":
                                case "date":
                                case "number":
                                    item.value = $.trim($($event.target).parent().find(".field_value").val());
                                    break;
                                case "radio":
                                    item.value = $($event.target).parent().find("input[type='radio']:checked").val();
                                    break;
                                case "checkboxes":
                                    var aValue = [];
                                    $($event.target).parent().find("input[type='checkbox']:checked").each(function () {
                                        aValue.push($(this).val());
                                    });
                                    item.value = aValue;
                                    break;
                                case "datearea":
                                    item.startValue = $($event.target).parent().find("input.startDate").val();
                                    item.endValue = $($event.target).parent().find("input.endDate").val();
                                    break;
                                case "pic":
                                    var aValue = [];
                                    var aValueUrl = [];
                                    $($event.target).parent().find(".imgPreviewPic").each(function () {
                                        aValue.push($(this).attr("data-uuid"));
                                        aValueUrl.push({uuid:$(this).attr("data-uuid") , url:$(this).attr("src")});
                                    });
                                    item.value = aValue;
                                    item.valueUrls = aValueUrl;
                                    break;
                                case "file":
                                    var aValue = [];
                                    $($event.target).parent().find(".filePreviewList li").each(function () {
                                        aValue.push({
                                            uuid:$(this).attr("data-uuid")
                                            ,fileName:$(this).find(".filename").text()
                                            ,size:$(this).find(".size").text()
                                        });
                                    });
                                    item.value = aValue;
                                    break;

                            }
                        }else{
                            item.isDoEdit = true;
                        }
                        t.aFormStyle = JSON.parse(JSON.stringify(t.aFormStyle));  //更新视图
                        t.$nextTick(function () {
                            //日历插件
                            $(t.$el).find("input[type='text'].Wdate").each(function () {
                                var that = this;
                                var sDateFmt = "yyyy-MM-dd"; //默认是日期型的
                                $(that).off("click").on("click",function(){
                                    WdatePicker({dateFmt:sDateFmt});
                                });
                            });
                        });
                    }

                }
            });
        }

    });

    module.exports = waitForAudit;
});
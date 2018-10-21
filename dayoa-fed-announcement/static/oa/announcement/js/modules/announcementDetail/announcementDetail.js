/**
 * Created by dyl on 2017/4/5.
 */
define(function (require, exports, module) {
    require("js/modules/announcementDetail/announcementDetail.css")
    var sTpl = require("js/modules/announcementDetail/announcementDetail.html")
    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");
    var filePreview =  require("commonStaticDirectory/plugins/preview.js"); //文件预览插件
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var comment = require("commonStaticDirectory/plugins/daydaoFedComment/daydaoFedCommentJq.js");
    var read = require("commonStaticDirectory/plugins/daydaoFedComment/daydaoFedReadJq.js");
    var praise = require("commonStaticDirectory/plugins/daydaoFedComment/daydaoFedLikeJq.js");

    var announcementDetail = function () {
        this.init.apply(this,arguments);
    };
    $.extend(announcementDetail.prototype,{
        constructor: announcementDetail
        , options: {
        }
        , init: function (options) {
            var t = this;
            t.options = $.extend({}, t.options, options);
            t.createDialog(); //弹窗
        }
        , createDialog: function () {
            var t = this;
            var button;
            if(t.options.announcementClassify.annoucementType == "received"){
                button = [
                    {
                        value:"关闭",
                        callback:function(){
                        }
                    }
                ]
            }else if(t.options.announcementClassify.annoucementType == "publish"){
                button = [
                    {
                        value:"撤回",
                        callback:function () {
                            dialog({
                                title: '撤回公告',
                                content: '<div>确定要撤回公告吗？</div>',
                                okValue: '确定',
                                ok: function () {
                                    t.vueObj.annWithdraw("4");
                                },
                                cancelValue: '取消',
                                cancel: function () {}
                            }).showModal();
                            return false;
                        }
                    },
                    {
                        value:"关闭",
                        callback:function(){

                        }
                    }
                ]
            }else if(t.options.announcementClassify.annoucementType == "notPublish"){
                button = [
                    {
                        value:"发布",
                        callback:function () {
                            dialog({
                                title: '发布公告',
                                content: '<div>确定要发布公告吗？</div>',
                                okValue: '确定',
                                ok: function () {
                                    t.vueObj.addAnnouncementUnit();
                                },
                                cancelValue: '取消',
                                cancel: function () {}
                            }).showModal();
                            return false
                        },
                        autofocus: true
                    },
                    {
                        value:"编辑",
                        callback:function () {
                            t.vueObj.editAnnouncement();
                            return false;
                        }
                    },
                    {
                        value:"删除",
                        callback:function(){
                            dialog({
                                title: '删除公告',
                                content: '<div>确定要删除公告吗？</div>',
                                okValue: '确定',
                                ok: function () {
                                    t.vueObj.annWithdraw("5");
                                },
                                cancelValue: '取消',
                                cancel: function () {}
                            }).showModal();
                            return false;
                        }
                    }
                ];
                if(t.options.announcementData.status == "定时发布"){
                    button = [
                        {
                            value:"立即发布",
                            callback:function () {
                                dialog({
                                    title: '立即发布',
                                    content: '<div><p>公告原计划：'+t.options.announcementData.job_time+'定时发布</p><p style="text-align: center">确定改为立即发布吗？</p></div>',
                                    okValue: '确定',
                                    ok: function () {
                                        t.vueObj.addAnnouncementUnit();
                                    },
                                    cancelValue: '取消',
                                    cancel: function () {}
                                }).showModal();
                                return false
                            },
                            autofocus: true
                        },
                        {
                            value:"编辑",
                            callback:function () {
                                t.vueObj.editAnnouncement();
                                return false;
                            }
                        },
                        {
                            value:"删除",
                            callback:function(){
                                dialog({
                                    title: '删除公告',
                                    content: '<div>确定要删除公告吗？</div>',
                                    okValue: '确定',
                                    ok: function () {
                                        t.vueObj.annWithdraw("5");
                                    },
                                    cancelValue: '取消',
                                    cancel: function () {}
                                }).showModal();
                                return false;
                            }
                        }
                    ];
                }
            }
            t.dialog = dialog({
                title: "公告详情"
                ,button:button
                ,content: sTpl
                ,onclose:function () {
                    t.options.announcementClassify.canAnnDetail = true;
                }
            });
            t.dialog.showModal();
            t.initVue();
        }
        ,initVue: function () {
            var that = this;
            that.vueObj = new Vue({
                el:"#announcement_detail"
                ,data:{
                    sTitle:""//公告标题
                    ,gMain:gMain
                    ,sClassify:""//公告分类
                    ,sClassifyId:"" //id
                    ,releaser:""//发布人
                    ,sTime:""//发布时间
                    ,personName:""
                    ,personId:""
                    ,sContent:""//公告内容
                    ,sReceiver:[]//发布范围
                    ,oFileList:[]//附件图片列表
                    ,isShow:true//接收人数组是否显示
                    ,praiseOperationflag:true
                    ,annoucementType:""
                    ,announcementData:{}
                    ,wmarkOption:{}
                    ,uuid:""
                    ,canEditAnnflag:true //可以打开编辑公告
                    ,showComment:false
                    ,showRead:false
                    ,showPraise:false
                },
                attached:function(){
                    var t = this;
                    t.sTitle = that.options.announcementData.title;
                    t.sClassify = that.options.announcementData.type_name;
                    t.sClassifyId = that.options.announcementData.announcement_type;
                    t.sTime = that.options.announcementData.operation_time;
                    t.sContent = that.options.announcementData.content;
                    t.releaser = that.options.announcementData.person_name;
                    t.uuid = that.options.announcementData.uuid;
                    t.annoucementType = that.options.announcementClassify.annoucementType;
                    t.announcementData = $.extend({}, t.announcementData, that.options.announcementData);
                    if(t.announcementData.isRead == 0){
                        t.announcementData.isRead = 1;
                    }
                    $.when(t.getWorkersRealName()).done(function () {
                        if(that.options.announcementData.is_watermark == 1){
                            t.addAnnWatermark(t.personName);
                        }
                    });
                    t.initDomEvent();
                    t.getAnnFileImg(t.uuid);
                    t.releaseRange(t.uuid);
                    t.$nextTick(function(){
                        if(t.annoucementType != 'notPublish'){
                            /*阅读*/
                            t.read = new read({
                                id: 'read_plugin',
                                uuid: t.uuid
                                ,count: function(count){
                                    t.announcementData.readCount = count;
                                }
                            });
                            /*阅读新增接口*/
                            Ajax.ajax({
                                url:gMain.apiBasePath+"announcement/readAm.do"
                                ,data:JSON.stringify({
                                    "amUuid":t.uuid,
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
                            t.read.addRead(t.uuid, function(){
                                // 添加成功
                            });
                            /*点赞*/
                            t.praise = new praise({
                                id: 'praise_plugin',
                                uuid: t.uuid
                                ,count: function(count){
                                    t.announcementData.praiseCount = count;
                                }
                            });
                            /*评论*/
                            var params =  {
                                infoId:t.uuid,
                                "ifSendMsg":1,
                                "messageType":30,
                                "extParam":{
                                    "uuid":t.uuid,
                                    "is_need_st":"1",
                                    "projectName":"公告"
                                },
                                "receivePersonId":t.announcementData.person_id,
                                "projectName":"公告"
                            }
                            t.comment = new comment({
                                id: 'comment_plugin',
                                params: params
                                ,count: function(count){
                                    t.announcementData.commentscount = count;
                                }
                            });
                        }
                    });
                }
                ,methods:{
                    getNowDate:function () {
                        var that=this;
                        var date = new Date();
                        var seperator1 = "-";
                        var seperator2 = ":";
                        var month = date.getMonth() + 1;
                        var strDate = date.getDate();
                        if (month >= 1 && month <= 9) {
                            month = "0" + month;
                        }
                        if (strDate >= 0 && strDate <= 9) {
                            strDate = "0" + strDate;
                        }
                        var currentDate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                            + " " + date.getHours() + seperator2 + date.getMinutes()
                            + seperator2 + date.getSeconds();
                        that.sTime=currentDate+"";
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
                                    t.announcementData.oFileList = $.extend({}, t.announcementData.oFileList, t.oFileList);
                                }
                            }
                        });
                        return df;
                    },
                    /*
                     * 立即发布
                     * */
                    addAnnouncementUnit:function () { //status：公告类型：1-发布；2-定时发布；3-草稿；4-撤回；5-删除
                        var t = this;
                        var files = [];   //图片附件
                        if(!(t.sTitle && t.sReceiver.length != 0 && t.sClassifyId && t.sContent && t.sClassify)){ //判断，草稿不需要
                            if(!t.sTitle){
                                tools.showMsg.error("标题不能为空");
                            }
                            if(t.sReceiver.length == 0){
                                tools.showMsg.error("发布范围不能为空");
                            }
                            if(!t.sClassifyId || !t.sClassify){
                                tools.showMsg.error("请选择公告分类");
                            }
                            if(!t.sContent){
                                tools.showMsg.error("公告内容不能为空");
                            }
                            return false;
                        }else if(t.sTitle.match(/\s/g) && (t.sTitle.match(/\s/g).length == t.sTitle.length)){
                            tools.showMsg.error("标题不能全为空白符");
                            return false;
                        }else if(t.sContent.match(/\s/g) && (t.sContent.match(/\s/g).length == t.sContent.length)){
                            tools.showMsg.error("公告内容不能全为空白符");
                            return false;
                        }
                        if(t.oFileList.length != 0){
                            $.each(t.oFileList,function (num,val) {
                                var obj = {
                                    "fileName": val.fileName,
                                    "fileSize": val.fileSize,
                                    "fileSort": val.fileSort,
                                    "fileType": val.fileType,
                                    "resourceUrl": val.resourceUrl
                                }
                                files.push(obj);
                            })
                        }
                        var chooseOrgList = []; //发布范围
                        $.each(t.sReceiver,function (num,val) {
                            var obj = {
                                "receiverId": val.receiver_id,
                                "receiverType": 2,
                                "receiverName":val.receiver_name
                            }
                            chooseOrgList.push(obj);
                        });
                        var postOptions = {
                            "customParam": {
                                "files": files,
                                "receivers": chooseOrgList,   //发布范围
                                "job": {
                                    "jobTime":""  //定时时间
                                }
                            },
                            "dataList": [{
                                "key": "announcement_type",
                                "value": t.sClassifyId   //分类ID
                            },
                                {
                                    "key": "title",
                                    "value": t.sTitle
                                },
                                {
                                    "key": "content",
                                    "value": t.sContent
                                },
                                {
                                    "key": "is_watermark",
                                    "value": that.options.announcementData.is_watermark
                                },
                                {
                                    "key": "is_comment",
                                    "value": that.options.announcementData.is_comment?1:0
                                },
                                {
                                    "key": "status",
                                    "value":1
                                }],
                            "infoSetId": "am_announce_list",
                            "uuid":that.options.announcementData.uuid
                        }
                        var postUrl
                        if(that.options.announcementData.status == "撤回"){
                            postUrl = gMain.apiBasePath + "route/am_announce_list/insert.do";
                        }else{
                            postUrl = gMain.apiBasePath + "route/am_announce_list/update.do";
                        }
                        Ajax.ajax({
                            url:postUrl,
                            data:JSON.stringify(postOptions),
                            beforeSend:function () {
                                $("body").loading({zIndex:999}); //开启提交遮罩
                            },
                            complete:function () {
                                $("body").loading({state:false}); //关闭提交遮罩
                            },
                            success:function(data) {
                                if (data.result == "true"){
                                    tools.showMsg.ok("发布成功"); //成功提示弹层
                                    that.options.announcementClassify.$parent.noMoreData = false;
                                    that.options.announcementClassify.$parent.pageChangeInfor = {
                                        pageNo:"1",          //当前页
                                        onePageNum:"10",      //一页显示汇报数量
                                        onePageNumArr:[10,20,50,100]
                                    };
                                    that.options.announcementClassify.$parent.annoucementList = [];
                                    that.options.announcementClassify.$parent.getAnnoucementList();
                                    that.dialog.close().remove();  //关闭并取消弹窗
                                }

                            }
                        });
                    },
                    /*
                     * 获取职工姓名
                     * */
                    getWorkersRealName:function () {
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
                    * 显示评论、点赞、阅读
                    * */
                    showOperation:function (e,str) {
                        var t = this;
                        if(str == "read"){
                            t.showRead = !t.showRead;
                            t.showComment = false;
                            t.showPraise = false;
                        }else if(str == "comment"){
                            t.showRead = false;
                            t.showComment = !t.showComment;
                            t.showPraise = false;
                        }else if(str == "praise"){
                            t.showRead = false;
                            t.showComment = false;
                            t.showPraise = !t.showPraise;
                        }
                    },
                    /**
                     * 获取图片真实路径
                     * @arr 获取的字段集
                     * @callback 获取真实图片后的回调
                     * */
                    /*
                     * 点赞/取消赞
                     * */
                    praiseOperation:function (e) {
                        var t = this;

                        if(t.announcementData.isPraise == 0 && t.praiseOperationflag){
                            t.praiseOperationflag = false;
                            var parameter = {
                                infoId:t.uuid,
                                "ifSendMsg":1,
                                "messageType":31,
                                "extParam":{
                                    "uuid":t.uuid,
                                    "is_need_st":"1",
                                    "projectName":"公告"
                                },
                                "receivePersonId":t.announcementData.person_id,
                                "projectName":"公告"
                            }
                            t.praise.addLike(parameter, function(){
                                t.praiseOperationflag = true;
                                t.announcementData.isPraise = 1;
                                t.announcementData.praiseCount += 1;
                            });
                        }else if(t.announcementData.isPraise == 1 && t.praiseOperationflag){
                            t.praiseOperationflag = false;
                            t.praise.cancelLike(t.uuid, function(){
                                // 取消成功
                                t.praiseOperationflag = true;
                                t.announcementData.isPraise = 0;
                                t.announcementData.praiseCount -= 1;
                            });
                        }
                        e.stopPropagation();
                    },
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
                                    t.sReceiver = data.data.list.slice(0);
                                    t.sReceiver = JSON.parse(JSON.stringify(t.sReceiver));
                                    t.announcementData.receiver = $.extend({}, t.announcementData.receiver, t.sReceiver);
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
                        var tpl = '<canvas id = "watermark" width = "160px"  height = "70px" style="display:none;"></canvas>' + '<canvas id = "repeat-watermark"></canvas>';
                        $("#announcement_detail .watermark_wrap").append(tpl);
                        t.wmarkOption = {
                            docWidth: $("#announcement_detail .announcement_detail_box").width(),
                            docHeight: $("#announcement_detail .announcement_detail_box").height(),
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
                        var cw = $('#announcement_detail #watermark')[0];
                        var crw = $('#announcement_detail #repeat-watermark')[0];
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
                    /**
                     * 初始化dom事件
                     * */
                    initDomEvent:function () {
                        var  t = this;
                        $("#announcement_detail").off("mouseenter.imglist").on("mouseenter.imglist",".imglist li",function () {
                            $(this).find(".preview_download_upload").css({display:"block"});
                        });
                        $("#announcement_detail").off("mouseleave.imglist").on("mouseleave.imglist",".imglist li",function () {
                            $(this).find(".preview_download_upload").css({display:"none"});
                        });
                        $("#announcement_detail").off("mouseenter.addFilePreview").on("mouseenter.addFilePreview",".addFilePreview li",function () {
                            $(this).find(".preview_download_upload").css({display:"block"});
                        });
                        $("#announcement_detail").off("mouseleave.addFilePreview").on("mouseleave.addFilePreview",".addFilePreview li",function () {
                            $(this).find(".preview_download_upload").css({display:"none"});
                        });
                    },
                    /*预览文件*/
                    previewFile:function (e,uuid,fileSort) {
                        var t = this;
                        if(fileSort == 1){   //文件
                            new filePreview({
                                uuid:uuid+""
                                ,title:"文件预览"
                            });
                        }else if(fileSort == 2){  //图片
                            Ajax.ajax({
                                url:gMain.basePath + "apiCloud/cpCloudCommon/download.do"
                                ,data:JSON.stringify({
                                    uuid:uuid+""
                                })
                                ,async:false //同步加载
                                ,success:function (data) {
                                    if(data.result = "true"){
                                        t.previewPic(e,data.data);
                                    }
                                }
                            });
                        }
                    },
                    /*
                     *  图片预览
                     * */
                    previewPic:function ($event,imgSrc) {
                        var t = this;
                        var docWid = $(document).width();
                        var winWid = $(window).width()-60;
                        if(imgSrc){
                            dialog({
                                title:"图片预览"
                                ,content:'<div style="min-width: 600px;max-width:'+winWid+'px;overflow-x: auto;text-align: center;"><img src="'+imgSrc+'" style="margin-bottom: 20px;"></div>'
                            }).showModal();
                        }else{
                            dialog({
                                title:"图片预览"
                                ,content:'<div style="min-width: 600px;max-width:'+winWid+'px;overflow-x: auto;text-align: center;"><img src="'+$($event.target).attr("src")+'" style="margin-bottom: 20px;"></div>'
                            }).showModal();
                        }
                    },
                    /*
                     * 下载文件
                     * */
                    downloadFile:function (uuid) {
                        Ajax.ajax({
                            url:gMain.basePath + "apiCloud/cpCloudCommon/download.do"
                            ,data:JSON.stringify({uuid:uuid})
                            ,beforeSend:function () {
                            }
                            ,complete:function () {
                            }
                            ,success:function (data) {
                                if(data.result = "true"){
                                     location.href = data.data;
                                }
                            }
                        });
                    },
                    /*
                    * 撤回/删除公告
                    * */
                    annWithdraw:function (status) {
                        var t = this;
                        var postOption = {
                            "dataList": [
                                {
                                    "key": "status",
                                    "value": status
                                }
                            ],
                            "infoSetId": "am_announce_list",
                            "uuid": t.uuid
                        }
                        var df = $.Deferred();
                        Ajax.ajax({
                            url:gMain.apiBasePath+"route/am_announce_list/update.do"
                            ,data:JSON.stringify(postOption)
                            ,beforeSend:function () {
                            }
                            ,complete:function () {
                            }
                            ,success:function(data){
                                if(data.result == "true"){
                                    df.resolve();
                                    that.options.announcementClassify.$parent.noMoreData = false;
                                    that.options.announcementClassify.$parent.pageChangeInfor = {
                                        pageNo:"1",          //当前页
                                        onePageNum:"10",      //一页显示汇报数量
                                        onePageNumArr:[10,20,50,100]
                                    };
                                    that.options.announcementClassify.$parent.annoucementList = [];
                                    that.options.announcementClassify.$parent.getAnnoucementList();
                                    that.dialog.close().remove();  //关闭并取消弹窗
                                    tools.showMsg.ok("操作成功"); //成功提示弹层
                                }
                            }
                        })
                        return df;
                    },
                    unfold: function (e) {
                        var t=this;
                        t.isShow=!t.isShow;
                        if(t.isShow){
                            $("#announcement_detail .preview_publish").css({height:""});
                        }else {
                            $("#announcement_detail .preview_publish").css({height:"auto"});
                        }
                        var w = $("#announcement_detail .announcement_detail_box").width();
                        var h = $("#announcement_detail .announcement_detail_box").height();
                        if(that.options.announcementData.is_watermark == 1){
                            t.draw(w, h);
                        }
                    },
                    /*
                     * 编辑公告
                     * */
                    editAnnouncement:function () {
                        var t = this;
                        if(t.canEditAnnflag && t.announcementData.receiver && t.announcementData.oFileList){
                            t.canEditAnnflag = false;
                            require.async("js/modules/addAnnouncement/addAnnouncement.js",function (addAnnouncement) {
                                new addAnnouncement({
                                    announcementDetail:t,
                                    detailDialog:that.dialog,
                                    announcementClassify:that.options.announcementClassify
                                });
                            });
                        }
                    },
                }
                ,directives: {
                    'add-ann-time':function(data){
                        if (!$.isEmptyObject(data)) {
                            var showtime,date;
                            date = new Date(data.operation_time);
                            if(data.status == "定时发布"){
                                date = new Date(data.job_time);
                            }
                            var year,month,day,hour,minute,second;
                            year = date.getFullYear();
                            month = date.getMonth()+1 < 10 ? "0"+(date.getMonth()+1):date.getMonth()+1;
                            day = date < 10 ? "0"+date.getDate():date.getDate();
                            hour = date.getHours() < 10 ? "0"+date.getHours():date.getHours()
                            minute = date.getMinutes() < 10 ? "0"+date.getMinutes():date.getMinutes();
                            showtime = year+"/"+month+"/"+day+" "+hour+":"+minute;
                            if(data.status == "定时发布"){
                                $(this.el).text("将于 "+showtime+" 发布");
                            }else if(data.status == "撤回" || data.status == "草稿"){
                                $(this.el).text("最后编辑于 "+showtime);
                            }else{
                                $(this.el).text("发布时间："+showtime);
                            }
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
            })
        }
    })

    module.exports = announcementDetail;
});
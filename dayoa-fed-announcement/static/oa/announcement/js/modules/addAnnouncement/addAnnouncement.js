/**
 * Created by dyl on 2017/4/1.
 */
define(function (require, exports, module) {
    require("js/modules/addAnnouncement/addAnnouncement.css")
    var sTpl = require("js/modules/addAnnouncement/addAnnouncement.html")
    /*引入bootstrap-switch 插件*/
    require("commonStaticDirectory/plugins/bootstrap-switch/bootstrap-switch.css");
    require("commonStaticDirectory/plugins/bootstrap-switch/bootstrap-switch.js");
    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");
    //引入腾讯云上传
    var updateFile = require("commonStaticDirectory/plugins/updateFile-qcloud/updateFile-qcloud.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");
    //下拉单选
    require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect.css");
    var dayhrDropSelect = require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect");
    //下拉多选
    require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropMultipleSelect.css");
    var dayhrDropMulSelect = require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropMultipleSelect.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");
    var filePreview =  require("commonStaticDirectory/plugins/preview.js"); //文件预览插件

    var addAnnouncement = function () {
        this.init.apply(this,arguments);
    };
    $.extend(addAnnouncement.prototype,{
        constructor: addAnnouncement
        , options: {
        }
        , init: function (options) {
            var t = this;
            t.options = $.extend({}, t.options, options);
            t.createDialog(); //弹窗
        }
        , createDialog: function () {
            var t = this;
            var sTitle = "公告编辑";
            var aButton = [
                {
                    value: "预览",
                    callback: function () {
                        t.vueObj.previewAnnouncement();
                        return false;
                    }
                },
                {
                    value: "定时发布",
                    callback: function () {
                        t.vueObj.setTimeAddAnnounce();
                        return false;
                    }
                },
                {
                    value: "存草稿",
                    callback: function () {
                        t.vueObj.addAnnouncementUnit(3,"");
                        return false;
                    }
                },
                {
                    value: "发布",
                    callback: function () {
                        dialog({
                            title: '发布公告',
                            content: '<div>确定要发布公告吗？</div>',
                            okValue: '确定',
                            ok: function () {
                                t.vueObj.addAnnouncementUnit(1,"");
                            },
                            cancelValue: '取消',
                            cancel: function () {}
                        }).showModal();
                        return false
                    }
                    , autofocus: true
                }
            ];
            t.d = dialog({
                title: sTitle,
                button: aButton,
                content: sTpl,
                onclose:function () {
                    if(t.options.announcementIndex){
                        t.options.announcementIndex.canAddAnnflag = true;
                    }
                    if(t.options.announcementDetail){
                        t.options.announcementDetail.canEditAnnflag = true;
                    }
                }
            })
            t.d.showModal();
            t.initVue();
        }
        ,initVue: function () {
            var that = this;
            that.vueObj = new Vue({
                el:"#annSend"
                ,data:{
                    maxLen:100//输入框最大字数
                    ,gMain:gMain
                    ,currLen:0//输入框当前字数
                    ,dropClassify:"" //分类下拉选择插件
                    ,dropPerson:"" //组织树下拉选择插件
                    ,annTitle:""//公告标题
                    ,oFileList:{}  //各个表单待上传的文件列表
                    ,aData:[]//获取部门列表
                    ,chooseOrgList:[] //选中的部门列表
                    ,annContent:""//公告内容
                    ,aSortList:[]//公告分类列表
                    ,chooseClassId:"" //选中公告分类id
                    ,chooseClassName:"" //
                    ,canComment:"1" //0-不允许；1-允许
                    ,canWatermark:"0"
                    ,canPreviewFlag:true  //可以预览
                    ,canOpenSetTimeflag:true //可以打开定时
                    ,personName:""
                },
                attached:function() {
                    var t = this;
                    t.getAnnList();  //公告分类列表树
                    //t.dropClass();
                    t.dropPersonTree();  //组织树
                    t.getWorkersRealName();
                    if(that.options.announcementDetail){
                        t.annTitle = that.options.announcementDetail.sTitle;
                        t.annContent = that.options.announcementDetail.sContent;
                        t.annTitle = that.options.announcementDetail.sTitle;
                        t.canWatermark = that.options.announcementDetail.announcementData.is_watermark + "";
                        t.canComment = that.options.announcementDetail.announcementData.is_comment ? "1":"0";
                        t.oFileList['imgList'] = [];
                        t.oFileList['fileList'] = [];
                        $.each(that.options.announcementDetail.oFileList,function (num,val) {
                            var oFileInfo = {
                                uuid:""
                                ,tempId:"id-" + name + "-" + num + "-" + (new Date()).getTime()
                                ,fileSort:""
                                ,size:""
                                ,sizeWithUnit:""
                                ,lastModified:""
                                ,fileName:""
                                ,uploadStatus:"success"
                                ,url:""
                            };
                            if(val.fileType == 2){
                                oFileInfo.uuid = val.resourceUrl;
                                oFileInfo.fileSort = val.fileSort;
                                oFileInfo.sizeWithUnit = val.fileSize;
                                oFileInfo.fileName = val.fileName;
                                oFileInfo.url = val.realUrl;
                                t.oFileList['imgList'].push(oFileInfo);
                            }else if(val.fileType == 1){
                                oFileInfo.uuid = val.resourceUrl;
                                oFileInfo.fileSort = val.fileSort;
                                oFileInfo.sizeWithUnit = val.fileSize;
                                oFileInfo.fileName = val.fileName;
                                t.oFileList['fileList'].push(oFileInfo);
                            }
                        });
                        t.oFileList = JSON.parse(JSON.stringify(t.oFileList));

                    };
                    t.initSwitchPlugins();
                }
               ,methods: {
                    setTimeAddAnnounce: function () {
                        var t = this;
                        if(t.annTitle && t.chooseOrgList.length != 0 && t.chooseClassId && t.annContent){
                            if(t.annTitle.match(/\s/g) && (t.annTitle.match(/\s/g).length == t.annTitle.length)){
                                tools.showMsg.error("标题不能全为空白符");
                                return false;
                            }else if(t.annContent.match(/\s/g) && (t.annContent.match(/\s/g).length == t.annContent.length)){
                                tools.showMsg.error("公告内容不能全为空白符");
                                return false;
                            }
                            if(t.canOpenSetTimeflag){
                                t.canOpenSetTimeflag = false;
                                require.async("js/modules/setTimeIssue/setTimeIssue.js",function (setTimeIssue) {
                                    new setTimeIssue({
                                        addAnnouncement:t
                                    });
                                });
                            }
                        }else{
                            if(!t.annTitle){
                                tools.showMsg.error("标题不能为空");
                            }
                            if(t.chooseOrgList.length == 0){
                                tools.showMsg.error("发布范围不能为空");
                            }
                            if(!t.chooseClassId){
                                tools.showMsg.error("请选择公告分类");
                            }
                            if(!t.annContent){
                                tools.showMsg.error("公告内容不能为空");
                            }
                        }
                    },
                    /*
                    * 获取职工姓名
                    * */
                    getWorkersRealName:function () {
                        var t = this;
                        Ajax.ajax({
                            url:gMain.apiBasePath+"common/getUser.do"
                            ,data:JSON.stringify({})
                            ,success:function(data){
                                if(data.result=="true"){
                                    t.personName = data.data.personName;
                                }
                            }
                        })
                    },
                    /*
                     * 初始化switch插件
                     * */
                    initSwitchPlugins:function () {
                        var t = this;
                        $("#cancomment").bootstrapSwitch({  //是否可以评论
                            onText:"是",
                            offText:"否",
                            onColor:"primary",
                            offColor:"default",
                            size:"small",
                            state:t.canComment == "1"?true:false,
                            onSwitchChange:function(event,state){
                                if(state == true){
                                    t.canComment = "1";
                                }else{
                                    t.canComment = "0";
                                }
                            }
                        });
                        $("#canwatermark").bootstrapSwitch({  //是否可以添加水印
                            onText:"是",
                            offText:"否",
                            onColor:"primary",
                            offColor:"default",
                            size:"small",
                            state:t.canWatermark == "1"?true:false,
                            onSwitchChange:function(event,state){
                                if(state == true){
                                    t.canWatermark = "1";
                                }else{
                                    t.canWatermark = "0";
                                }
                            }
                        });
                    },
                    /*预览公告*/
                    previewAnnouncement: function () {
                        var t=this;
                        if(t.annTitle && t.chooseOrgList.length != 0 && t.chooseClassId && t.annContent){
                            if(t.annTitle.match(/\s/g) && (t.annTitle.match(/\s/g).length == t.annTitle.length)){
                                tools.showMsg.error("标题不能全为空白符");
                                return false;
                            }else if(t.annContent.match(/\s/g) && (t.annContent.match(/\s/g).length == t.annContent.length)){
                                tools.showMsg.error("公告内容不能全为空白符");
                                return false;
                            }
                            if(t.canPreviewFlag){
                                t.canPreviewFlag = false;
                                require.async("js/modules/preview/preview.js", function (preview) {
                                    new preview({
                                        addAnnouncement:t
                                    })
                                })
                            }
                        }else{
                            if(!t.annTitle){
                                tools.showMsg.error("标题不能为空");
                            }
                            if(t.chooseOrgList.length == 0){
                                tools.showMsg.error("发布范围不能为空");
                            }
                            if(!t.chooseClassId){
                                tools.showMsg.error("请选择公告分类");
                            }
                            if(!t.annContent){
                                tools.showMsg.error("公告内容不能为空");
                            }
                        }
                    },
                    /*
                    * 公告新增、定时发布、存草稿
                    * */
                    addAnnouncementUnit:function (status,jobTime) { //status：公告类型：1-发布；2-定时发布；3-草稿；4-撤回；5-删除
                        var t = this;
                        var files = [];   //图片附件
                        if(!(t.annTitle && t.chooseOrgList.length != 0 && t.chooseClassId && t.annContent) && status != 3){ //判断，草稿不需要
                            if(!t.annTitle){
                                tools.showMsg.error("标题不能为空");
                            }
                            if(t.chooseOrgList.length == 0){
                                tools.showMsg.error("发布范围不能为空");
                            }
                            if(!t.chooseClassId){
                                tools.showMsg.error("请选择公告分类");
                            }
                            if(!t.annContent){
                                tools.showMsg.error("公告内容不能为空");
                            }
                            return false;
                        }else if(t.annTitle.match(/\s/g) && (t.annTitle.match(/\s/g).length == t.annTitle.length)){
                            tools.showMsg.error("标题不能全为空白符");
                            return false;
                        }else if(t.annContent.match(/\s/g) && (t.annContent.match(/\s/g).length == t.annContent.length)){
                            tools.showMsg.error("公告内容不能全为空白符");
                            return false;
                        }
                        if(t.oFileList.imgList){
                           $.each(t.oFileList.imgList,function (num,val) {
                               var obj = {
                                   "fileName": val.fileName,
                                   "fileSize": val.sizeWithUnit,
                                   "fileSort": val.fileSort,
                                   "fileType": 2,
                                   "resourceUrl": val.uuid
                               }
                               files.push(obj);
                           })
                        }
                        if(t.oFileList.fileList){
                            $.each(t.oFileList.fileList,function (num,val) {
                                var obj = {
                                    "fileName": val.fileName,
                                    "fileSize": val.sizeWithUnit,
                                    "fileSort": val.fileSort,
                                    "fileType": 1,
                                    "resourceUrl": val.uuid
                                }
                                files.push(obj);
                            })
                        }
                        var postOptions = {
                            "customParam": {
                                "files": files,
                                "receivers": t.chooseOrgList,   //发布范围
                                "job": {
                                    "jobTime":jobTime?jobTime:""  //定时时间
                                }
                            },
                            "dataList": [{
                                    "key": "announcement_type",
                                    "value": t.chooseClassId   //分类ID
                                },
                                {
                                    "key": "title",
                                    "value": t.annTitle
                                },
                                {
                                    "key": "content",
                                    "value": t.annContent
                                },
                                {
                                    "key": "is_watermark",
                                    "value": t.canWatermark
                                },
                                {
                                    "key": "is_comment",
                                    "value": t.canComment
                                },
                                {
                                    "key": "status",
                                    "value":status
                                }],
                            "infoSetId": "am_announce_list"
                        }
                        var postUrl
                        if(that.options.announcementDetail){
                            postOptions.uuid = that.options.announcementDetail.uuid;
                            postUrl = gMain.apiBasePath + "route/am_announce_list/update.do";
                            if(that.options.announcementDetail.announcementData.status == "撤回"){
                                postUrl = gMain.apiBasePath + "route/am_announce_list/insert.do";
                            }
                        }else{
                            postUrl = gMain.apiBasePath + "route/am_announce_list/insert.do";
                        }
                        Ajax.ajax({
                            url:postUrl,
                            data:JSON.stringify(postOptions),
                            beforeSend:function () {
                                $("body").loading({zIndex:999999999}); //开启提交遮罩
                            },
                            complete:function () {
                                $("body").loading({state:false}); //关闭提交遮罩
                            },
                            success:function(data) {
                                if (data.result == "true"){
                                    if(status == 1){
                                        tools.showMsg.ok("发布成功"); //成功提示弹层
                                    }else if(status == 2){
                                        tools.showMsg.ok("操作成功"); //成功提示弹层
                                    }else if(status == 3){
                                        tools.showMsg.ok("保存成功"); //成功提示弹层
                                    }
                                    that.d.close().remove();  //关闭并取消弹窗
                                    if(that.options.announcementIndex){
                                        that.options.announcementIndex.noMoreData = false;
                                        that.options.announcementIndex.pageChangeInfor = {
                                            pageNo:"1",          //当前页
                                            onePageNum:"10",      //一页显示汇报数量
                                            onePageNumArr:[10,20,50,100]
                                        };
                                        that.options.announcementIndex.annoucementList = [];
                                        that.options.announcementIndex.getAnnoucementList();
                                    }
                                    if(that.options.detailDialog){  //详情里面编辑的
                                        that.options.detailDialog.close().remove();  //关闭并取消弹窗
                                        that.options.announcementClassify.$parent.noMoreData = false;
                                        that.options.announcementClassify.$parent.pageChangeInfor = {
                                            pageNo:"1",          //当前页
                                            onePageNum:"10",      //一页显示汇报数量
                                            onePageNumArr:[10,20,50,100]
                                        };
                                        that.options.announcementClassify.$parent.annoucementList = [];
                                        that.options.announcementClassify.$parent.getAnnoucementList();
                                    }
                                }

                            }
                        });
                    },
                    /*获取公告分类列表*/
                    getAnnList:function(){
                        var t = this;
                        Ajax.ajax({
                            url:gMain.apiBasePath+"route/am_type_list/getAll.do"
                            ,data:JSON.stringify({"infoSetId":"am_type_list","searchConditionList":[],"pageBean":{"pageNo":"1","pageSize":20},"sort":{"sortName":"","sortStatus":"asc"}})
                            ,success:function(data){
                                if(data.result=="true"){
                                    t.aSortList=data.maps;
                                    t.aSortList=JSON.parse(JSON.stringify(t.aSortList));
                                    var data = [];
                                    if(t.aSortList.length != 0) {
                                        for (var i = 0; i < t.aSortList.length; i++) {
                                            data.push({id:t.aSortList[i].uuid, name:t.aSortList[i].type_name})
                                        };
                                    };
                                    var dropClassify = new dayhrDropSelect({
                                        id: "dropSelect_classify",
                                        width: 260,
                                        maxHeight: 250,
                                        data: data,
                                        name: "modelId",
                                        onSelected: function (oSelect, type) {
                                            t.chooseClassId = oSelect.node.id;
                                            t.chooseClassName = oSelect.node.fullName;
                                        }
                                    });
                                    if(that.options.announcementDetail){
                                        dropClassify.setValue(that.options.announcementDetail.sClassify);
                                    }else if(t.aSortList.length != 0){
                                        // dropClassify.setValue(t.aSortList[0].type_name);
                                    }
                                    t.dropClassify = dropClassify;
                                }
                            }
                        })
                    },
                    /*打开添加公告分类界面*/
                    addClassifys: function () {
                        var t = this;
                        require.async("js/modules/addAnnClassify/addAnnClassify.js", function (addAnnClassify) {
                            new addAnnClassify({
                                addAnnouncement:t
                            })
                        });
                    },
                    /*获取组织树*/
                    dropPersonTree: function () {
                        var t = this;
                        Ajax.ajax({
                            url: gMain.apiBasePath + "receiver/getOrgTree.do"
                            ,data: ""
                            ,success: function (data) {
                                if (data.result == "true") {
                                    t.aData = data.val;
                                    var dropPerson = new dayhrDropMulSelect({
                                        id: "dropSelect_person",
                                        width: 260,
                                        maxHeight: 250,
                                        data:t.aData,
                                        name: "modelId1",
                                        size:"small",
                                        onSelected: function (oSelect, type) {
                                            var orgList = [];
                                            $.each(oSelect.nodes,function (num,val) {
                                                var obj = {
                                                    "receiverId":val.id,
                                                    "receiverType": 2,
                                                    "receiverName":val.name
                                                }
                                                orgList.push(obj);
                                            })
                                            t.chooseOrgList = orgList;
                                        }
                                    });
                                    if(that.options.announcementDetail){
                                        var names = "";
                                        $.each(that.options.announcementDetail.announcementData.receiver,function (num,val) {
                                            if(names){
                                                names +=(","+val.receiver_name);
                                            }else{
                                                names = val.receiver_name;
                                            }
                                        })
                                        dropPerson.setValue(names)
                                    }else{
                                        // dropPerson.setValue(t.aData[0].name);
                                    };
                                    t.dropPerson = dropPerson;
                                }
                            }

                        });
                    },
                    //上传文件
                    uploadFile:function ($event,fileType) {
                        var t = this;
                        var userAgent = navigator.userAgent.toLowerCase();
                        uaMatch = userAgent.match(/trident\/([\w.]+)/);

                        //排除IE11的这个错误提示，因为IE11会执行两次uploadFile方法，第二次这里为空了，导致提示请选择文件的误报
                        if(!$($event.target).val() && uaMatch[1] != "7.0"){
                            tools.showMsg.error("请先选择文件");
                            return false;
                        }

                        var name = $($event.target).attr("name");
                        t.oFileList[name] = t.oFileList[name] || [];

                        //循环添加
                        for(var i=0;i<$event.target.files.length;i++){
                            var oFile = $event.target.files[i];
                            var fileSort;
                            if(oFile.type.substr(0,5) == "image"){
                                fileSort = 2;
                            }else{
                                fileSort = 1;
                            }
                            var oFileInfo = {
                                uuid:""
                                ,tempId:"id-" + name + "-" + i + "-" + (new Date()).getTime()
                                ,fileSort:fileSort
                                ,size:oFile.size
                                ,sizeWithUnit:tools.formatSize(oFile.size)
                                ,lastModified:oFile.lastModified
                                ,fileName:oFile.name
                                ,uploadStatus:"uploading" //上传中
                                ,url:""
                            };

                            // t.oFileList[name].push(oFileInfo);

                            if(fileType == "file"){
                                if(t.oFileList[name].length == 9){
                                    tools.showMsg.error("最多9个附件");
                                    break;
                                }else if(oFileInfo.size > parseInt($($event.target).attr("data-fileSize")) * 1024 * 1024){
                                    oFileInfo.uploadStatus = "faild";//上传失败
                                    tools.showMsg.error("文件过大");
                                    continue;// 改文件不继续上传了
                                }else{
                                    t.oFileList[name].push(oFileInfo);
                                }
                            }else if(fileType == "img"){
                                if(t.oFileList[name].length == 9){
                                    tools.showMsg.error("最多9张图片");
                                    break;
                                }else if(oFileInfo.size > 10 * 1024 * 1024){
                                    oFileInfo.uploadStatus = "faild";//上传失败
                                    tools.showMsg.error("文件过大");
                                    continue;// 改文件不继续上传了
                                }else{
                                    t.oFileList[name].push(oFileInfo);
                                }
                            }

                            if(fileType == "img"){
                                t.getFileUrl(oFile,oFileInfo.tempId,function (tempId,url) {
                                    for(var j=0;j<t.oFileList[name].length;j++){
                                        if(t.oFileList[name][j].tempId == tempId){
                                            t.oFileList[name][j].url = url;
                                        }
                                    }
                                    t.oFileList = tools.parseJson(t.oFileList);
                                });
                            }

                            new updateFile({
                                oFile:oFile //上传的文件
                                ,tempId:oFileInfo.tempId
                                ,bucketName:"cloudp"//腾讯云的bucketName
                                ,appid:"10061427"//为项目的 APPID；
                                ,successUpload:function (data) {
                                    $($event.target).val("");
                                    for(var j=0;j<t.oFileList[name].length;j++){
                                        if(t.oFileList[name][j].tempId == data.tempId){
                                            t.oFileList[name][j].uuid = data.uuid + "";
                                            t.oFileList[name][j].uploadStatus = "success"; //上传成功
                                        }
                                    }
                                    t.oFileList = tools.parseJson(t.oFileList);
                                }
                                ,errorUpload:function (data) {
                                    $($event.target).val("");
                                    for(var j=0;j<t.oFileList[name].length;j++){
                                        if(t.oFileList[name][j].tempId == data.tempId){
                                            t.oFileList[name][j].uploadStatus = "faild"; //上传失败
                                        }
                                    }
                                    t.oFileList = tools.parseJson(t.oFileList);
                                }
                            });

                        }

                        t.oFileList = tools.parseJson(t.oFileList);
                    },
                    //删除图片、文件
                    delFilePreview:function (fieldName,$index) {
                        var t = this;
                        t.oFileList[fieldName].splice($index,1);
                    },
                    //获取图片真实地址
                    getFileUrl:function (oFile,tempId,callback) {
                        var that = this;
                        var reader = new FileReader();
                        reader.readAsDataURL(oFile);
                        reader.onload = function (e) {
                            var url = e.target.result;
                            typeof callback == "function" && callback(tempId,url);
                        }
                    },
                    /*
                     *  图片预览
                     * */
                    previewPic:function ($event,imgSrc) {
                        var t = this;
                    },
                    previewFile:function (e,uuid,fileSort) {
                        var t = this;
                    },
                }
            })

        }

    })
    module.exports = addAnnouncement;
});
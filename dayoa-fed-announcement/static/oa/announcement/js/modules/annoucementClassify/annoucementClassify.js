/**
 * Created by THINK on 2017/6/23.
 * 公告列表
 */
define(function(require, exports, module) {
    require("js/modules/annoucementClassify/annoucementClassify.css");
    var sTpl = require("js/modules/annoucementClassify/annoucementClassify.html");

    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");
    var filePreview =  require("commonStaticDirectory/plugins/preview.js"); //文件预览插件
    var ApiPraises = require("commonStaticDirectory/plugins/daydaoFedComment/daydaoFedLikeApi.js"); //点赞组件

    var AuditSelect = require("js/modules/auditSelect/auditSelect.js"); //添加接收人组件


    Vue.component('annoucement-classify', Vue.extend({
        props: ['annoucementList','annoucementType','switchTapOver']
        ,template: sTpl
        ,data:function(){
            return {
                gMain:gMain,
                wmarkOption:null,
                personName:"",
                canAnnDetail:true,  //可以打开公告详情
                praiseOperationflag:true //可以进行点赞操作
            };
        }
        ,watch:{
            'annoucementList':function () {
                var t = this;
                t.$nextTick(function () {
                   /* $("li.annoucement_list").each(function(i){
                        var divH = $(this).find(".annoucement_content_wrap .annoucement_content").height();
                        var $p = $(this).find(".annoucement_content_wrap .annoucement_content p");
                        while ($p.outerHeight() > divH) {
                            $p.html($p.html().replace(/(\s)*([a-zA-Z0-9]|(\<br\>)|\W)(\.\.\.)?$/, "..."));
                        };
                    });*/
                });
            },
        }
        ,attached:function () {
            var t =this;
            t.initDomEvent();
        }
        ,methods: {
            /*
             * 随机色
             * */
            randomColor: function (uuid) {
                var t = this;
                var aColors = ["background:#07a9ea", "background:#82c1a7", "background:#ab97c2", "background:#ffb500", "background:#59ccce"]; //蓝，绿，紫，黄，浅蓝
                var i = parseInt(uuid) % 5;
                return aColors[i];
            },
            /**
             * 初始化dom事件
             * */
            initDomEvent:function () {
                var  t = this;
                $("#annouce_list_wrap").off("mouseenter.imglist").on("mouseenter.imglist",".imglist li",function () {
                    $(this).find(".preview_download_upload").css({display:"block"});
                });
                $("#annouce_list_wrap").off("mouseleave.imglist").on("mouseleave.imglist",".imglist li",function () {
                    $(this).find(".preview_download_upload").css({display:"none"});
                });
                $("#annouce_list_wrap").off("mouseenter.addFilePreview").on("mouseenter.addFilePreview",".addFilePreview li",function () {
                    $(this).find(".preview_download_upload").css({display:"block"});
                });
                $("#annouce_list_wrap").off("mouseleave.addFilePreview").on("mouseleave.addFilePreview",".addFilePreview li",function () {
                    $(this).find(".preview_download_upload").css({display:"none"});
                });
            },
            /*预览文件*/
            previewFile:function (e,uuid,fileSort) {
                var t = this;
                if(fileSort == 1){   //文件
                    new filePreview({
                        uuid:uuid
                        ,title:"文件预览"
                    });
                }else if(fileSort == 2){  //图片
                    Ajax.ajax({
                        url:gMain.basePath + "apiCloud/cpCloudCommon/download.do"
                        ,data:JSON.stringify({
                            uuid:uuid
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
                if(imgSrc){
                    dialog({
                        title:"图片预览"
                        ,content:'<img src="'+imgSrc+'" width="600" style="margin-bottom: 20px;">'
                    }).showModal();
                }else{
                    dialog({
                        title:"图片预览"
                        ,content:'<img src="'+$($event.target).attr("src")+'" width="600" style="margin-bottom: 20px;">'
                    }).showModal();
                }
            },
            /*
            * 点赞/取消赞
            * */
            praiseOperation:function (e,index) {
                var t = this;
                var parameter = {
                    infoId:t.annoucementList[index].uuid,
                    "ifSendMsg":1,
                    "messageType":31,
                    "extParam":{
                        "uuid":t.annoucementList[index].uuid,
                        "is_need_st":"1",
                        "projectName":"公告"
                    },
                    "receivePersonId":t.annoucementList[index].person_id,
                    "projectName":"公告"
                }
                if(t.annoucementList[index].isPraise == 0 && t.praiseOperationflag){
                    t.praiseOperationflag = false;
                    ApiPraises.addLike(parameter, function(data){
                        t.praiseOperationflag = true;
                        t.annoucementList[index].isPraise = 1;
                        t.annoucementList[index].praiseCount +=1;
                    });
                }else if(t.annoucementList[index].isPraise == 1 && t.praiseOperationflag){
                    t.praiseOperationflag = false;
                    ApiPraises.cancelLike({infoId:t.annoucementList[index].uuid}, function(data){
                        t.praiseOperationflag = true;
                        t.annoucementList[index].isPraise = 0;
                        t.annoucementList[index].praiseCount -=1;
                    });
                }
                e.stopPropagation();
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
                            // window.location.href = data.data;
                            window.open(data.data);
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
                if(!t.personName){
                    Ajax.ajax({
                        url:gMain.apiBasePath+"common/getUser.do"
                        ,data:JSON.stringify({})
                        ,success:function(data){
                            if(data.result=="true"){
                                t.personName = data.data.personName;
                                df.resolve();
                            }
                        }
                    })
                }
                return df;
            },
            /*
            * 打开公告详情
            * */
            openAnnDetail:function (e,uuid,index) {
                var t = this;
                if(t.canAnnDetail){
                    t.canAnnDetail = false;
                    require.async("js/modules/announcementDetail/announcementDetail.js", function (announcementDetail) {
                        new announcementDetail({
                            announcementData:t.annoucementList[index],
                            announcementClassify:t,
                            annIndex:index
                        })
                    })
                }
            },
            /*
            * 展开和收起
            * */
            openFoldContent:function (e,uuid,index) {
                var t = this;
                if(!t.annoucementList[index].foldFlag){
                    t.annoucementList[index].foldFlag = true;
                    t.annoucementList = JSON.parse(JSON.stringify(t.annoucementList));
                }else{
                    t.annoucementList[index].foldFlag = false;
                }
            },
            /*
            * 展示更多的部门
            * */
            showMoreDepartments:function (e,uuid,index) {
                var t = this;
                if(!t.annoucementList[index].moreDepartments){
                    t.annoucementList[index].moreDepartments = true;
                    $(e.target).closest(".release_range").css({"height":"auto","overflow":"visible"});
                    $(e.target).css({
                        "-ms-transform":"rotate(-180deg)",
                        "-moz-transform":"rotate(-180deg)",
                        "-webkit-transform":"rotate(-180deg)",
                        "-o-transform":"rotate(-180deg)",
                        "transform":"rotate(-180deg)",
                    });
                }else{
                    t.annoucementList[index].moreDepartments = false;
                    $(e.target).closest(".release_range").css({"height":"","overflow":""});
                    $(e.target).css({
                        "-ms-transform":"",
                        "-moz-transform":"",
                        "-webkit-transform":"",
                        "-o-transform":"",
                        "transform":"",
                    });
                }
            },
            /**
             * 获取图片真实路径
             * @arr 获取的字段集
             * @callback 获取真实图片后的回调
             * */
            getPictrueUrl:function (aFormStyle ,callback) {
                var t = this;
                var setData = function (arr) {
                    for(var i=0;i<arr.length;i++){
                        if(arr[i].resourceUrl){
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
            'add-ann-time-status':function(data){
                if (!$.isEmptyObject(data) && (data.status == "定时发布" || data.status == "撤回" || data.status == "草稿")) {
                    var showtime,date;
                    if(data.status == "定时发布"){
                        date = new Date(data.job_time);
                    }else if(data.status == "撤回" || data.status == "草稿"){
                        date = new Date(data.operation_time);
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
    }));


});

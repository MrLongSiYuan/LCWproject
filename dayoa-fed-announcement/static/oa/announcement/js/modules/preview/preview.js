/**
 * Created by dyl on 2017/4/5.
 */
define(function (require, exports, module) {
    require("js/modules/preview/preview.css")
    var sTpl = require("js/modules/preview/preview.html")
    var Ajax = require("js/ajax.js");
    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");
    var filePreview =  require("commonStaticDirectory/plugins/preview.js"); //文件预览插件

    var preview = function () {
        this.init.apply(this,arguments);
    };
    $.extend(preview.prototype,{
        constructor: preview
        , options: {
        }
        , init: function (options) {
            var t = this;
            t.options = $.extend({}, t.options, options);
            t.createDialog(); //弹窗
        }
        , createDialog: function () {
            var t = this;
            t.dialog = dialog({
                title: "公告预览"
                ,button: [
                    {
                        value:"关闭",
                        callback:function(){
                        }
                    }
                ]
                ,content: sTpl
                ,onclose:function () {
                    t.options.addAnnouncement.canPreviewFlag = true;
                }
            });
            t.dialog.showModal();
            t.initVue();
        }
        ,initVue: function () {
            var that = this;
            that.vueObj = new Vue({
                el:"#preview"
                ,data:{
                    sTitle:""//公告标题
                    ,gMain:gMain
                    ,sClassify:""//公告分类
                    ,releaser:""//发布人
                    ,sTime:""//发布时间
                    ,sContent:""//公告内容
                    ,sReceiver:[]//发布范围
                    ,oFileList:[]//附件图片列表
                    ,sImgUrl:""//大图的url
                    ,isShow:true//接收人数组是否显示
                    ,wmarkOption:{}
                },
                attached:function(){
                    var t = this;
                    var date = new Date();
                    t.sTitle = that.options.addAnnouncement.annTitle;
                    t.sClassify = that.options.addAnnouncement.chooseClassName;
                    t.sTime = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
                    t.sContent = that.options.addAnnouncement.annContent;
                    t.sReceiver = that.options.addAnnouncement.dropPerson.selectedVals;
                    t.oFileList = that.options.addAnnouncement.oFileList;
                    t.releaser = that.options.addAnnouncement.personName;
                    t.initDomEvent();
                    if(that.options.addAnnouncement.canWatermark == "1"){
                        setTimeout(function () {
                            t.addAnnWatermark(t.releaser);
                        },100)
                    }
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
                    * 添加水印
                    * */
                    addAnnWatermark:function (container, options) {
                        var t = this;
                        var tpl = '<canvas id = "watermark" width = "160px"  height = "70px" style="display:none;"></canvas>' + '<canvas id = "repeat-watermark"></canvas>';
                        $("#preview .watermark_wrap").append(tpl);
                        t.wmarkOption = {
                            docWidth: $("#preview").width(),
                            docHeight: $("#preview").height(),
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
                        var cw = $('#preview #watermark')[0];
                        var crw = $('#preview #repeat-watermark')[0];
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
                        $("#preview").off("mouseenter.imglist").on("mouseenter.imglist",".imglist li",function () {
                            $(this).find(".preview_download_upload").css({display:"block"});
                        });
                        $("#preview").off("mouseleave.imglist").on("mouseleave.imglist",".imglist li",function () {
                            $(this).find(".preview_download_upload").css({display:"none"});
                        });
                        $("#preview").off("mouseenter.addFilePreview").on("mouseenter.addFilePreview",".addFilePreview li",function () {
                            $(this).find(".preview_download_upload").css({display:"block"});
                        });
                        $("#preview").off("mouseleave.addFilePreview").on("mouseleave.addFilePreview",".addFilePreview li",function () {
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
                    imgSure: function (){
                        var that=this;
                        if(!!that.oFileList.img){
                            that.sImgUrl=that.oFileList.img[0].url;
                            $("#preview .preview_imgLi").eq(0).addClass("preview_imgSure");
                        }
                    },
                    changePic:function(e){
                        var that=this;
                        that.sImgUrl=$(e.target).attr("src");
                        $("#preview .preview_imgLi").removeClass("preview_imgSure");
                        $(e.target).addClass("preview_imgSure");
                    },
                    unfold: function (e) {
                        var t=this;
                        t.isShow=!t.isShow;
                        if(t.isShow){
                            $("#preview .preview_publish").css({height:""});
                        }else {
                            $("#preview .preview_publish").css({height:"auto"});
                        }
                        var w = $("#preview").width();
                        var h = $("#preview").height();
                        t.draw(w, h);
                    }
                }
                ,directives: {
                    'ann-content-handle':function (data) {
                        if(!$.isEmptyObject(data)){
                            if(data){
                                var conent = data.replace(/[\n]/g,'<br/>');
                                conent = conent.replace(/[\s]/g,'&nbsp;');
                            }
                            $(this.el).html(conent);
                        }
                    }
                }
            })
        }
    })

    module.exports = preview;
});
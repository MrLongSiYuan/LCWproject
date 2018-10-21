/**
 * Created by Save on 2017/6/26.
 * 招聘app简历预览
 */


define(function(require, exports, module){
    require("css/resumePreview.css");
    var sTpl = require("templates/resumePreview.html");
    var Ajax = require("js/ajax");
    var tools = require("commonStaticDirectory/plugins/tools.js");//工具
    require("commonStaticDirectory/plugins/layer_mobile/need/layer.css"); //移动弹窗
    require("commonStaticDirectory/plugins/layer_mobile/layer"); //移动弹窗
    var w = require("js/plugins/callAppHandler.js");//与H5通信

    var VueComponent = Vue.extend({
        template: sTpl
        ,data:function(){
            return {
                gMain:gMain
                ,options:{}
                ,sParams:""  //路由参数默认值
                ,infoId:""
                ,infoData:""//所有简历信息
                ,salaryData:[{id:"1",name:"2k以下"},{id:"2",name:"2k-5k"},{id:"3",name:"5k-10k"},{id:"4",name:"10k-15k"},{id:"5",name:"15k-25k"},{id:"6",name:"25k-50k"},{id:"7",name:"50k以上"}]
                ,posType:[{id:"1",name:"全职"},{id:"2",name:"兼职"},{id:"3",name:"实习"}]//期望职位状态
            }
        }
        ,attached:function () {
            var t = this;
            t.init();

        }
        , watch: {
            /**
             * 把参数格式转换成：infoSetId:app_corp_menu&leftNav:initConfig 来方便获取
             * 获取参数方式如：
             * 获取infoSetId: t.options.infoSetId
             * 获取leftNav: t.options.leftNav
             * */
        }
        ,methods: {
            init: function(options) {
                var t = this;
                this.options = $.extend({}, t.options, options);
                document.title = "简历预览";
                $("body").animate({scrollTop:0}, "normal");
                console.log(t.$route.params.infoId);
                var $resumePreview =  $("#resumePreview");
                $resumePreview.height($(window).height());
                $resumePreview.css("background","#F0F0F0");
                t.initPageHeader();
                t.getResumeInfo();
            },
            initPageHeader:function(){
                var data = {
                    leftBtn:"back", //左边按钮，””表示无左边按钮
                    headerColor:"FC856B", //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                }
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
            },
            getResumeInfo:function () {
                var t = this;
                Ajax.ApiTools().getResumeAllInfoApp({
                    data: {"resumeId":t.$route.params.infoId},
                    success: function (data) {
                        if(data.result=="true") {
                            t.infoData = data.data;
                            if(t.infoData&&t.infoData["hopeWorkList"][0]){
                                t.infoData.hopeSalaryName = t.salaryData[t.infoData["hopeWorkList"][0].payRange-1].name;
                                t.infoData.hopePosType = t.posType[t.infoData["hopeWorkList"][0].posProperty-1].name;
                                t.infoData.hopePosName = t.infoData["hopeWorkList"][0].posName;
                                t.infoData.hopeWorkSpaceName = t.infoData["hopeWorkList"][0].workSpaceName;
                            }
                        }
                    }
                });
            }
        }
    });

    module.exports = VueComponent;

});


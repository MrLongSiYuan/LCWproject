/**
 * Created by Save on 2017/6/26.
 * 招聘app应聘记录页
 */


define(function(require, exports, module){
    require("css/recruitRecord.css");
    var sTpl = require("templates/recruitRecord.html");
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
                ,recordData:""/*记录*/
                ,infoData:""/*基本信息*/
                ,ctData:""/*码表数据*/

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
                document.title = "应聘记录";
                $("body").animate({scrollTop:0}, "normal");
                gMain.resumeId = t.$route.params.resumeId;
                var $recruitRecord =  $("#recruitRecord");
                $recruitRecord.height($(window).height());
                $recruitRecord.css("background","#F0F0F0");
                t.initPageHeader();
                t.getCtData();/*获取码表数据*/
                t.getRecord();/*获取简历记录*/
            },
            initPageHeader:function(){
                var data = {
                    leftBtn:"back", //左边按钮，””表示无左边按钮
                    headerColor:"FC856B", //导航条背景颜色，””表示默认颜色
                    rightBtn: [{btnAction:"recruit_resume",
                        btnUrl:gMain.baseStaticHrPath+"recruit/images/recruit-more.png",
                        btnName:"查看简历",
                        btnParam:{}
                    }]
                }
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
            },
            getRecord:function(){
                var t = this;
                Ajax.ApiTools().getResumeRecordApp({
                    data: {"resumeId":t.$route.params.resumeId},
                    success: function (data) {
                        if(data.result=="true") {
                            t.recordData = data.data
                        }
                    }
                });
            },
            getCtData:function(){
                var t = this;
                Ajax.ApiTools().getCtDataApp({
                    type:"GET",
                    data:{"ctNames":"ct_re_10"},
                    success: function (data) {
                        if(data.result=="true") {
                            t.ctData = data.data.ct_re_10;
                            t.getInfo();/*获取简历基本信息*/
                        }
                    }
                });
            },
            getInfo:function(){
                var t = this;
                Ajax.ApiTools().getResumeBaseInfoApp({
                    data: {"resumeId":t.$route.params.resumeId},
                    success: function (data) {
                        if(data.result=="true") {
                            t.infoData = data.data;
                            if(t.infoData.educationId!=0) {
                                t.infoData.educationName = t.ctData[t.infoData.educationId];
                            }else{
                                t.infoData.educationName = "";
                            }
                        }
                    }
                });
            }
        }
    });

    module.exports = VueComponent;

});


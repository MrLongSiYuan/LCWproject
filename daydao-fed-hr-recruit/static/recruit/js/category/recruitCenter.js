/**
 * ------------------------------------------------------------------
 *  招聘app端首页
 * ------------------------------------------------------------------
 */


define(function(require, exports, module){
    require("css/recruitCenter.css");
    var sTpl = require("templates/recruitCenter.html");
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
                ,isShow:""
                ,data1 :[]/*未处理数据*/
                ,data2 :[]/*已处理数据*/
                ,pageIndex1 : 1
                ,pageSize1 : 8
                ,loading1 : false
                ,finish1 : false
                ,complete1 : false
                ,pageIndex2 : 1
                ,pageSize2 : 8
                ,loading2 : false
                ,finish2 : false
                ,complete2 : false

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
            'isShow': function (val, oldVal) {
                var t = this;
                if (val == false) {
                    $("body").animate({scrollTop:0}, "normal",function () {
                        t.getScrollData2();
                    });
                }else{
                    $("body").animate({scrollTop:0}, "normal",function () {
                        t.getScrollData1();
                    });
                }
            },

        }
        ,methods: {
            init: function(options) {
                var t = this;
                this.options = $.extend({}, t.options, options);
                document.title = "面试官";
                t.isShow = true;
                var $recruitCenter =  $("#recruitCenter");
                $recruitCenter.height($(window).height());
                $recruitCenter.css("background","#F0F0F0");
                t.initPageHeader();
                t.getFalseData();/*获取未处理的数据*/
                t.getTrueData();/*获取已处理的数据*/
            },
            initPageHeader:function(){
                var t = this;
                var data = {
                    leftBtn:"close", //左边按钮，””表示无左边按钮
                    headerColor:"403934", //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                }
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
            },
            /*切换*/
            tabFun:function (param) {
                var t = this;
                $(window).unbind('scroll');
                t.isShow = param;
            },
            getFalseData:function(){
                var t = this;
                    if(!t.loading1 && !t.finish1) {
                        t.loading1 = true;
                        Ajax.ApiTools().getPersonInterviewsApp({
                            data: {"pageBean":{"pageNo":t.pageIndex1,"pageSize":t.pageSize1},isDone:0},
                            success: function (data) {
                                if(data.maps!==null) {
                                    if (data.maps.length < t.pageSize1||data.pb.pageNo*data.pb.pageSize==data.pb.pageDataCount) {
                                        t.finish1= true;
                                    }
                                    t.loading1 = false;
                                    t.pageIndex1++;
                                    t.data1 = t.data1.concat(data.maps);
                                }
                            }
                        });
                    }


            },
            getScrollData1:function(){
                var t = this;
                $(window).bind('scroll', function () {
                    if ($(document).scrollTop() + $(window).height() + 20 > $(document).outerHeight()) {
                        if (t.isShow == true) {
                            if (t.finish1 == false) {
                                t.getFalseData();
                            } else {
                                if (t.complete1 == false) {
                                    layer.open({
                                        content: '加载完毕！'
                                        , skin: 'msg'
                                        , shadeClose: false
                                        , time: 2 //2秒后自动关闭
                                    });
                                    t.complete1 = true;
                                }
                            }
                        }
                    }

                });



            },
            getTrueData:function(){
                var t = this;
                if(!t.loading2 && !t.finish2) {
                    t.loading2 = true;
                    Ajax.ApiTools().getPersonInterviewsApp({
                        data: {"pageBean":{"pageNo":t.pageIndex2,"pageSize":t.pageSize2},isDone:1},
                        success: function (data) {
                            if(data.maps!==null) {
                                if (data.maps.length < t.pageSize2||data.pb.pageNo*data.pb.pageSize==data.pb.pageDataCount) {
                                    t.finish2 = true;
                                }
                                t.loading2 = false;
                                t.pageIndex2++;
                                t.data2 = t.data2.concat(data.maps);

                            }
                        }
                    });
                }
            },
            getScrollData2:function(){
                var t = this;
                $(window).bind('scroll', function () {
                    if ($(document).scrollTop() + $(window).height() + 20 > $(document).outerHeight()) {
                        if (t.isShow == false) {
                            if (t.finish2 == false) {
                                t.getTrueData();
                            } else {
                                if (t.complete2 == false) {
                                    layer.open({
                                        content: '加载完毕！'
                                        , skin: 'msg'
                                        , shadeClose: false
                                        , time: 2 //2秒后自动关闭
                                    });
                                    t.complete2 = true;
                                }
                            }
                        }
                    }
                });
            }
        }
    });

    module.exports = VueComponent;

});


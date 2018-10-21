/**
 * Created by tangguoping on 2017/1/10.
 * 招聘效分析图
 */
define(function(require, exports, module) {
    require("css/recruitAnalysis.css");
    var sTpl = require("templates/recruitAnalysis.html");
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗
    //单选下拉框
    require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect.css");
    var dayhrDropSelect = require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect");
    var VueComponent = Vue.extend({
        template: sTpl
        ,data:function(){
            return {
                options:{}
                ,sParams:""  //路由参数默认值
            }
        }
        ,attached:function () {
            var t = this;

        }
        /**
         * 监控路由改变
         * */
        ,route: {
            data: function (transition) {
                return {
                    sParams: transition.to.params.sParams
                }
            }
        }
        /**
         * 监控数据改变
         * */
        ,watch:{
            /**
             * 把参数格式转换成：infoSetId:app_corp_menu&leftNav:initConfig 来方便获取
             * 获取参数方式如：
             * 获取infoSetId: t.options.infoSetId
             * 获取leftNav: t.options.leftNav
             * */
            'sParams': function (val, oldVal) {
                var t = this;
                var oPara = {}; //附加其他参数
                if(val && val.indexOf(':') > -1) {
                    val.replace(/(\w+)\s*:\s*([\w-]+)/g, function(a, b, c) {
                        b && (oPara[b] = c);
                    });
                }
                t.init(oPara);
            }
        }
        ,methods:{
            /**
             * 初始化函数
             * */
            init:function(options){
                var t = this;
                this.options = options;
                t.initMainMenu(); //初始化导航
                t.getAnalysisDropSelect();
            }
            /**
             * 初始化导航
             * */
            ,initMainMenu:function(){
                var t = this;
                $("#main_menu").html("招聘效果分析");
                document.title = "效果分析";
            }
            /**
             * 招聘分析统计下拉菜单
             * */
            ,getAnalysisDropSelect:function () {
                var t = this;
                var _keyValueBean = {infoSetId:"ct_re_14",isDateFilter:false,keyId:"code_id",valueId:"code_name"};
                Ajax.ApiTools().getKeyValueData({
                    data:_keyValueBean,
                    success:function(data){
                        $("#recruit_analysis").show();
                        for(var i=0; i<data.beans.length; i++){ //下拉菜单添加对应的图片数据
                            switch (data.beans[i].id){
                                case "1":
                                case "2":
                                case "3":
                                    data.beans[i].imgUrl = "analysis01.png";
                                    break;
                                case "4":
                                    data.beans[i].imgUrl = "analysis02.png";
                                    break;
                                case "5":
                                    data.beans[i].imgUrl = "analysis03.png";
                                    break;
                                default:;
                            }
                        }
                        var oDropSelect = new dayhrDropSelect({
                            id:"recruit_analysisDrop",
                            name:"recruit_analysisDrop",
                            width:180,
                            maxHeight:250,
                            data:data.beans,
                            onSelected:function(oSelect){
                                $("#recruit_analysisImg img").attr('src',gMain.baseStaticHrPath+"/recruit/images/"+oSelect.node.imgUrl);
                            }
                        });
                        oDropSelect.setValue(data.beans[0].id);
                    }
                });
            }
        }
    });

    module.exports = VueComponent;
});

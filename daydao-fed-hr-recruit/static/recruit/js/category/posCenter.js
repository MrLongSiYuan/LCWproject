/**
 * ------------------------------------------------------------------
 *  招聘职位详细信息页
 * ------------------------------------------------------------------
 */


define(function(require, exports, module){
    require("css/posCenter.css");
    var sTpl = require("templates/posCenter.html");
    var Ajax = require("js/ajax");
    var tools = require("commonStaticDirectory/plugins/tools.js");//工具

    var VueComponent = Vue.extend({
        template: sTpl
        ,data:function(){
            return {
                gMain:gMain
                ,options:{}
                ,tabData:[{name:"候选人",infoSetId:"recruit_resume_deal_list"},{name:"职位",infoSetId:"recruit_resume_position_list"},{name:"看板",infoSetId:"recruit_resume_kanban_list"}]
                ,posInfo:[]

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
                $("#main_menu").html("简历处理");
                console.log(t.$route.params.posId);
                t.getDetailInfo();
            },
            getDetailInfo:function () {
                var t = this;
                Ajax.ApiTools().getActivityPosInfo({
                    data: {posId:t.$route.params.posId},
                    success: function (data) {
                        if (data.result == "true") {
                            t.posInfo = data.data;
                        }
                    }
                });
            }
        }
    });

    module.exports = VueComponent;

});


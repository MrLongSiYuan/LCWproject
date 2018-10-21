/**
 * Created by THINK on 2017/4/22.
 * 汇报搜索
 */
define(function(require, exports, module) {
    require("js/modules/addComment/addComment.css");
    var sTpl = require("js/modules/addComment/addComment.html");


    // 日期选择控件
    require("js/plugins/jquery.mobiscroll/mobiscroll.android-ics-2.5.2.css");
    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框
    require("js/plugins/jquery.mobiscroll/mobiscroll.core-2.5.2.css");
    require("js/plugins/jquery.mobiscroll/mobiscroll.datetime-2.5.1.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.datetime-2.5.1-zh.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.android-ics-2.5.2.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");

    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function(){
            return {
                gMain:gMain,
                placeholderTextarea:null,
                commentContent:null,
            }
        }
        ,watch:{
            "commentContent":function () {
                var t = this;
                t.$parent.commentContent = t.commentContent;
            }
        }
        ,attached:function () {
            var t = this;
            t.placeholderTextarea = t.$parent.placeholderTextarea;

        }
        ,compiled:function () {

        }
        ,methods:{
            addComment:function () {
                var t = this;
                t.$parent.reportComment();
                window.history.go(-1);
            }
        }
        ,transitions:{

        }

    });
    module.exports = VueComponent;

});

/**
 * Created by THINK on 2017/4/22.
 * 汇报搜索
 */
define(function(require, exports, module) {
    require("js/modules/chooseCover/chooseCover.css");
    var sTpl = require("js/modules/chooseCover/chooseCover.html");

    // 日期选择控件
    require("js/plugins/jquery.mobiscroll/mobiscroll.android-ics-2.5.2.css");
    require("js/plugins/jquery.mobiscroll/mobiscroll.core-2.5.2.css");
    require("js/plugins/jquery.mobiscroll/mobiscroll.datetime-2.5.1.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.datetime-2.5.1-zh.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.android-ics-2.5.2.js");
    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");

    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function(){
            return {
                gMain:gMain,
                chooseInfor:{},
                chooseResult:[],
            }
        }
        ,watch:{

        }
        ,attached:function () {
            var t = this;
            t.chooseInfor = JSON.parse(window.localStorage.getItem("chooseInfor"));
            if(t.chooseInfor.value){
                t.chooseResult = t.chooseInfor.value.split(",").slice(0);
            }
            console.log(t.chooseInfor);
        }
        ,compiled:function () {

        }
        ,methods:{
            /*
             * 选择选项
             * */
            coverChooseOption:function (e) {
                var t = this;
                var $dom = e.target.localName == "li" ? $(e.target):$(e.target).parent();
                var className = $dom.attr("class");
                var value = $dom.find("span").text();
                if(className == 'active'){
                    $dom.attr({class:""});
                    t.chooseResult.splice(t.chooseResult.indexOf(value),1);
                }else{
                    $dom.attr({class:"active"});
                    t.chooseResult.push(value);
                }
            },
            /*
             * 确定或者取消选择
             * */
            chooseSureOrCancel:function (e,type) {
                var t = this;
                var chooseResultStr = t.chooseResult.toString();
                $("#single_report_handle").show();
                t.$parent.checkBoxPushValue(t.chooseInfor.fieldName,chooseResultStr);
                window.history.go(-1);
            },
        }
        ,transitions:{

        }

    });
    module.exports = VueComponent;

});

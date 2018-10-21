/**
 * Created by Administrator on 2017/10/12.
 */
define(function (require, exports, module) {
    require("js/modules/reportRemind/reportRemind.css");
    var sTpl = require("js/modules/reportRemind/reportRemind.html");

    var tools = require("commonStaticDirectory/plugins/tools"); //工具函数集
    var Ajax = require("js/ajax");

    /*引入bootstrap-switch 插件*/
    require("commonStaticDirectory/plugins/bootstrap-switch/bootstrap-switch.css");
    require("commonStaticDirectory/plugins/bootstrap-switch/bootstrap-switch.js");

    var modulesClass = function () {
        this.init.apply(this, arguments);
    };
    $.extend(modulesClass.prototype, {
        options: {}
        , init: function (options) {
            var t = this;
            t.options = $.extend({}, t.options, options);

            t.initDialog();
        }
        ,initDialog:function () {
            var t = this;
            var aButton = [
                {
                    value: '确定',
                    callback: function () {
                        if((t.vueObj.modelChoose == "每周" && t.vueObj.modelWeek.length == 0) || (t.vueObj.modelChoose == "每月" && t.vueObj.modelDay.length == 0)){
                            tools.showMsg.error("请至少选择1天!");
                            return false;
                        }
                        t.options.formSet.remindInfor.modelChoose = t.vueObj.modelChoose;
                        t.options.formSet.remindInfor.modelWeek = t.vueObj.modelWeek.slice(0);
                        t.options.formSet.remindInfor.modelDay = t.vueObj.modelDay.slice(0);
                        t.options.formSet.remindInfor.modelHour = t.vueObj.modelHour;
                        t.options.formSet.remindInfor.modelMinute = t.vueObj.modelMinute;
                        t.options.formSet.remindInfor.weekShowContent = t.vueObj.weekShowContent;
                        t.options.formSet.remindInfor.dayShowContent = t.vueObj.dayShowContent;
                        t.options.formSet.remindInfor.remindSwitch = t.vueObj.remindSwitch;
                        t.options.formSet.remindInfor.imContent = $("#show_content_value").find("textarea").val();
                        t.options.formSet.remindInfor = JSON.parse(JSON.stringify(t.options.formSet.remindInfor));
                    },
                    autofocus: true
                },
                {
                    value: '取消',
                    callback: function () {

                    }
                }
            ];
            t.d = dialog({
                title:"汇报提醒设置"
                ,content:sTpl
                ,button:aButton
            }).showModal();
            t.initVue();
            t.d.reset();
        }
        ,initVue:function () {
            var that = this;
            that.vueObj = new Vue({
                el:"#set_report_remind"
                ,data:function () {
                    return {
                        chooseOption:{
                            cycle:["每天","每周","每月"],
                            hours:["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"],
                            minutes:["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59"],
                            monthdays:["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"],
                            weeks:["一","二","三","四","五","六","日"],
                        },
                        modelChoose:"每天",
                        modelWeek:[],
                        modelDay:[],
                        modelHour:new Date().getHours()<10 ? "0" + new Date().getHours():new Date().getHours() + "",
                        modelMinute:new Date().getMinutes()<10 ? "0" + new Date().getMinutes():new Date().getMinutes() + "",
                        weekShowContent:"",
                        dayShowContent:"",
                        remindSwitch:true,
                    };
                }
                ,computed:{
                    showValue:function () {
                        var t = this;
                        if(that.options.formSet.remindInfor.imContent){
                            return that.options.formSet.remindInfor.imContent;
                        }else{
                            return "温馨提示：请您于今日"+t.modelHour+':'+t.modelMinute+"前提交工作汇报，谢谢。"
                        }
                    }
                }
                ,attached:function () {
                    var t = this;
                    if(that.options.formSet.remindInfor.modelChoose){
                        t.modelChoose = that.options.formSet.remindInfor.modelChoose;
                    }
                    if(that.options.formSet.remindInfor.modelWeek.length != 0){
                        t.modelWeek = that.options.formSet.remindInfor.modelWeek;
                    }
                    if(that.options.formSet.remindInfor.modelDay.length != 0){
                        t.modelDay = that.options.formSet.remindInfor.modelDay;
                    }
                    if(that.options.formSet.remindInfor.modelHour){
                        t.modelHour = that.options.formSet.remindInfor.modelHour;
                    }
                    if(that.options.formSet.remindInfor.modelMinute){
                        t.modelMinute = that.options.formSet.remindInfor.modelMinute;
                    }
                    if(that.options.formSet.remindInfor.weekShowContent){
                        t.weekShowContent = that.options.formSet.remindInfor.weekShowContent;
                    }
                    if(that.options.formSet.remindInfor.dayShowContent){
                        t.dayShowContent = that.options.formSet.remindInfor.dayShowContent;
                    }
                    t.remindSwitch = that.options.formSet.remindInfor.remindSwitch;
                    $("#switch_report_remind").bootstrapSwitch({
                        onText:"开",
                        offText:"关",
                        onColor:"primary",
                        offColor:"default",
                        size:"small",
                        state:t.remindSwitch,
                        onSwitchChange:function(event,state){
                            if(state){
                                t.remindSwitch = true;
                            }else{
                                t.remindSwitch = false;
                            }
                        }
                    });
                }
                ,methods:{
                    /*
                    * 选择星期改变
                    * */
                    changeWeek:function (data) {
                        var t = this;
                        t.weekShowContent = "";
                        if(data.length > 0){
                            $(".show_content_remind_week").show();
                        }else{
                            $(".show_content_remind_week").hide();
                        }
                        var hanzi = ["一","二","三","四","五","六","日"];
                        var timeArr = data.slice(0);
                        var resultArr = [];
                        var finalArr = [];
                        $.each(timeArr,function (num,val) { //汉字转换为数字
                            resultArr.push(hanzi.indexOf(val));
                        });
                        resultArr = resultArr.sort(function (a,b) {   //排序
                            return a - b;
                        });
                        $.each(resultArr,function (num,val) { //数字转换为汉字
                            finalArr.push(hanzi[val]);
                        });
                        $.each(finalArr,function (num,val) {
                            if(num != finalArr.length -1){
                                t.weekShowContent += val+",";
                            }else if(num == finalArr.length -1){
                                t.weekShowContent += val;
                            }
                        });
                    },
                    /*
                     * 选择日改变
                     * */
                    changeMonthDay:function (data) {
                        var t = this;
                        t.dayShowContent = "";
                        if(data.length > 0){
                            $(".show_content_remind_day").show();
                        }else{
                            $(".show_content_remind_day").hide();
                        }
                        var timeArr = data.slice(0);
                        timeArr = timeArr.sort(function (a,b) {
                            return a - b;
                        })
                        $.each(timeArr,function (num,val) {
                            if(num != timeArr.length -1){
                                t.dayShowContent += val+","
                            }else if(num == timeArr.length -1){
                                t.dayShowContent += val
                            }
                        })
                    },
                    /*
                     * 定时方式
                     * */
                    changeChoose:function (data) {
                        var t = this;
                        if(data == "每周"){
                            $(".weeks_wrap").show();
                            $(".monthday_wrap").hide();
                            t.dayShowContent = "";
                            t.modelDay = [];
                        }else if(data == "每月"){
                            $(".weeks_wrap").hide();
                            $(".monthday_wrap").show();
                            t.modelWeek = [];
                            t.weekShowContent = "";
                        }else{
                            $(".weeks_wrap").hide();
                            $(".monthday_wrap").hide();
                            t.modelDay = [];
                            t.modelWeek = [];
                            t.dayShowContent = "";
                            t.weekShowContent = "";
                        }
                    }
                }
            });

        }

    });

    module.exports = modulesClass;
});
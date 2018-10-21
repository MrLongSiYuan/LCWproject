/**
 * Created by dyl on 2017/4/5.
 */
define(function (require, exports, module) {
    require("js/modules/setTimeIssue/setTimeIssue.css")
    var sTpl = require("js/modules/setTimeIssue/setTimeIssue.html")
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集

    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");
    //下拉单选
    require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect.css");
    var dayhrDropSelect = require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect");
    //日历控件
    require("commonStaticDirectory/plugins/My97DatePicker/WdatePicker.js");

    var setTimeIssue = function () {
        this.init.apply(this,arguments);
    };
    $.extend(setTimeIssue.prototype,{
        constructor: setTimeIssue
        , options: {
        }
        , init: function (options) {
            var t = this;
            t.options = $.extend({}, t.options, options);
            t.createDialog(); //弹窗
            t.getRecList=t.options.getRecList;
        },
        createDialog: function () {
            var t=this;
            var sTitle="定时发布";
            var aButton=[
                {
                    value:"确定",
                    callback:function(){
                        if(t.vueObj.setTime){
                            var chooseTime = new Date(t.vueObj.setTime);
                            if(chooseTime.getTime() < new Date().getTime()){
                                tools.showMsg.error("定时时间不能小于当前时间");
                                return false;
                            }
                            t.options.addAnnouncement.addAnnouncementUnit(2,t.vueObj.setTime);
                        }else{
                            tools.showMsg.error("定时时间不能为空");
                            return false;
                        }
                    }
                    ,autofocus:true
                },
                {
                    value:"取消",
                    callback:function(){

                    }
                }
            ];
            t.d=dialog({
                title:sTitle,
                button:aButton,
                content:sTpl,
                onclose:function () {
                    t.options.addAnnouncement.canOpenSetTimeflag = true;
                }
            });
            t.d.showModal();
            t.initVue();
        }
        ,initVue: function () {
            var that = this;
            that.vueObj = new Vue({
                el:"#timeIssue"
                ,data:{
                    setStartTime:""  //开始时间
                    ,setTime:"" //设置时间
                },
                attached: function () {
                    var t = this;
                    t.getServerDate();
                    $("#timeIssue").find(".ivu-date-picker-editor").on("click",function () {
                        setTimeout(function () {
                            $(".ivu-select-dropdown .ivu-picker-confirm").find(".ivu-btn").eq(0).hide();
                        },100)
                    })
                },
                beforeDestroy:function () {
                    var t = this;
                }
                ,computed:{
                    optionsMinTime:function () {
                        var t = this;
                        return{
                            disabledDate:function (date) {
                                return date && date.valueOf() < Date.now() - 86400000;
                            }
                        }
                    }
                }
                ,methods:{
                    initDatePlugin:function () {
                        var t = this;
                        var startCompleteDate = t.setStartYear+"-"+t.setStartMonth+"-"+t.setStartDay
                        var startCompleteTime = t.setStartHour+":"+t.setStartMinute+":00";
                        var setformat = function (idName,dateFmt,setStartTime) {
                            $("#"+idName).off("focus").on("focus",function (e) {
                                WdatePicker({
                                    el:idName,
                                    dateFmt:dateFmt,
                                    minDate:setStartTime,
                                    errDealMode:1, //0 提示(默认) 1 自动纠错 2 标记 -1 禁用自动纠错
                                    isShowClear:false,
                                    isShowToday:true,
                                    isShowOthers:true,
                                    isShowOK:true,
                                    autoPickDate:true,
                                    readOnly:true,
                                    autoUpdateOnChanged:true,
                                });
                                return false;
                            });
                        }
                        setformat("set_year_input","yyyy",startCompleteDate);
                        setformat("set_month_input","MM",startCompleteDate);
                        setformat("set_day_input","dd","");
                        setformat("set_hour_input","HH",startCompleteTime);
                        setformat("set_minute_input","mm",startCompleteTime);
                    }
                    ,getServerDate:function () {
                        var t = this;
                        Ajax.ajax({
                            url:gMain.apiBasePath + "common/getTime.do",
                            data:"",
                            beforeSend:function () {
                            },
                            complete:function () {
                            },
                            success:function(data) {
                                if (data.result == "true"){
                                    var curDate = new Date(new Date(data.data.replace(/-/g,"/")).getTime() + 5*60*1000);
                                    var theData = {
                                        curDate:curDate,
                                        year:curDate.getFullYear(),
                                        month:curDate.getMonth()+1 < 10 ? "0"+(curDate.getMonth()+1):curDate.getMonth()+1,
                                        monthDay:curDate < 10 ? "0"+curDate.getDate():curDate.getDate(),
                                        hour:curDate.getHours() < 10 ? "0"+curDate.getHours():curDate.getHours(),
                                        minute:curDate.getMinutes() < 10 ? "0"+curDate.getMinutes():curDate.getMinutes(),
                                        seconds:curDate.getSeconds(),
                                    }
                                    t.setTime = t.setStartTime = theData.year +"-"+theData.month +"-"+theData.monthDay +" "+theData.hour +":"+theData.minute;
                                }

                            }
                        });
                    }
                    /*
                    * 时间控件改变
                    * */
                    ,datePluginChange:function (date) {
                        var t = this;
                        var chooseTime = new Date(date);
                        if(chooseTime.getTime() < new Date().getTime()){
                            tools.showMsg.error("不能小于当前时间");
                            t.setTime = "";
                        }else{
                            t.setTime = date;
                        }
                    }
                    /*
                     * 时间控件清空
                     * */
                    ,datePluginClear:function () {
                        var t = this;
                        t.setTime = t.setStartTime;
                    }
                    ,currTime: function () {
                        var that=this;
                        that.sCurrTime=new Date();
                    },
                }
            })
        }
    })
    module.exports = setTimeIssue;
});
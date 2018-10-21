/**
 * Created by THINK on 2017/4/22.
 * 汇报搜索
 */
define(function(require, exports, module) {
    require("js/modules/reportSearch/reportSearch.css");
    var sTpl = require("js/modules/reportSearch/reportSearch.html");

    // 日期选择控件
    require("js/plugins/jquery.mobiscroll/mobiscroll.android-ics-2.5.2.css");
    require("js/plugins/jquery.mobiscroll/mobiscroll.core-2.5.2.css");
    require("js/plugins/jquery.mobiscroll/mobiscroll.datetime-2.5.1.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.datetime-2.5.1-zh.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.android-ics-2.5.2.js");
    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框

    var VueComponent = Vue.extend({
        props: []
        ,template: sTpl
        ,data:function(){
            return {
                gMain:gMain,
                searchName:"",
                startTime:"",
                endTime:"",
                chooseTimeSelf:false,
            };
        }
        ,watch:{

        }
        ,attached:function () {
            var t = this;
            // if(!v.isSupported()){ //旧版 APP 不支持，弹出升级提示，并不再渲染页面
            //     return false;
            // }
            t.initJqueryPlugins();
        }
        ,methods:{
            //初始化插件
            initJqueryPlugins:function () {
                var t =this;
                //日历插件
                var that = this;
                var myDate=new Date();
                myDate.setDate(myDate.getDate());//默认截止时间为明天
                t.initDateTimeSelectControl(myDate);
            }
            //初始化时间选择控件
            ,initDateTimeSelectControl:function(myDate){
                var currYear = (new Date()).getFullYear();

                var options = {
                    theme: 'android-ics light', //皮肤样式
                    display: 'modal', //显示方式
                    mode: 'scroller', //日期选择模式
                    lang:'zh',
                    startYear:currYear-10, //开始年份
                    endYear:currYear + 10, //结束年份
                    setText:'完成',
                    cancelText:'取消',
                    preset : 'date',
                    custom:'',      // ampm hm
                    onSelect:function(data){
                        //$that.attr("data-val",data);
                    }
                }
                // $(".workflow_formPreview").find(".Wdate").mobiscrollDT(options).date(options).mobiscrollDT('setDate', myDate, true);
                $("#report_search_wrap").find(".Wdate").mobiscrollDT(options).date(options);
            },
            /*
            * 选择模板
            * */
            chooseTemplate:function (e) {
                var t = this;
                if(e.target.localName == "input"){
                    $(e.target).blur();
                }
                t.$parent.showCover("childRouter");
            },
            /*
            * 提交查询
            * */
            submitSearch:function () {
                var t = this;
                var tempId = $("#report_app_received").find(".report_template_wrap input").attr("temp-id");
                var tempName = $("#report_app_received").find(".report_template_wrap input").val();
                if(tempName){
                    $("#report_app_received").find(".report_type_btn span").text(tempName);
                }else{
                    $("#report_app_received").find(".report_type_btn span").text("全部");
                }
                var reg = new RegExp(/^[\u4e00-\u9fa5_ a-zA-Z,.?%^*&$;'+={}0-9，#。@ !`/|、——+【】{}（）“”？&、\[\]\-\"！……@#￥%：]+$/);
                if(t.searchName){
                    if(!reg.test(t.searchName)){
                        amyLayer.alert("非法字符");
                        return false;
                    }
                }
                var postData = {
                    tempId:tempId,
                    limit:"10",
                    offset:"0",                    //起始值
                    personName:t.searchName,
                    endTime:t.endTime,
                    startTime:t.startTime
                }
                if(t.chooseTimeSelf){
                    postData.startTime = $("#report_search_wrap").find(".data_choose_wrap .start_time_input input").val();
                    postData.endTime = $("#report_search_wrap").find(".data_choose_wrap .end_time_input input").val();
                }
                t.$parent.searchTemplateForType("search",postData);
                location.href = "#!/received";
            },
            /*
             * 取消提交查询
             * */
            outSearch:function () {
                var t = this;
                $("#report_app_received .fade_in_out").show();
                $("#report_app_received .search_wrap").animate({
                    right:"-100%",
                },400,function () {
                    $("#report_app_received .search_wrap").hide();
                });
                $("#report_app_received .fade_in_out").animate({
                    left:"0",
                },400);
            },
            /*
            * 选择时间
            * */
            chooseSearchTime:function (e) {
                var t = this,indexNum;
                var $dom = e.target.localName == "li" ? $(e.target):$(e.target).parent();
                indexNum = $dom.index();
                var now = new Date();                    //当前日期
                var nowDayOfWeek = now.getDay();         //今天本周的第几天
                if(nowDayOfWeek == 0){
                    nowDayOfWeek = 7;
                }
                var nowDay = now.getDate();              //当前日
                var nowMonth = now.getMonth();           //当前月
                var nowYear = now.getFullYear();             //当前年
                switch (indexNum){
                    case 0:    //今天
                        $("#report_search_wrap").find(".data_choose_wrap").hide();
                        t.chooseTimeSelf = false;
                        t.startTime = t.formatDate(new Date(nowYear, nowMonth, nowDay)); //今天到明天
                        t.endTime = t.formatDate(new Date(nowYear, nowMonth, nowDay + 1));
                        break;
                    case 1:    //本周
                        $("#report_search_wrap").find(".data_choose_wrap").hide();
                        t.chooseTimeSelf = false;
                        t.startTime = t.formatDate(new Date(nowYear, nowMonth, nowDay - (nowDayOfWeek - 1))); //本周一到下周一
                        t.endTime = t.formatDate(new Date(nowYear, nowMonth, nowDay + (7 - nowDayOfWeek) + 1));
                        break;
                    case 2:    //上周
                        $("#report_search_wrap").find(".data_choose_wrap").hide();
                        t.chooseTimeSelf = false;
                        t.startTime = t.formatDate(new Date(nowYear, nowMonth, nowDay - (nowDayOfWeek - 1) - 7));
                        t.endTime = t.formatDate(new Date(nowYear, nowMonth, nowDay + ((7 - nowDayOfWeek) + 1) - 7));
                        break;
                    case 3:    //本月
                        $("#report_search_wrap").find(".data_choose_wrap").hide();
                        t.chooseTimeSelf = false;
                        t.startTime = t.formatDate(new Date(nowYear, nowMonth, "1"));
                        t.endTime = t.formatDate(new Date(nowYear, nowMonth + 1, "1"));
                        break;
                    case 4:    //上月
                        $("#report_search_wrap").find(".data_choose_wrap").hide();
                        t.startTime = t.formatDate(new Date(nowYear, nowMonth - 1, "1"));
                        t.endTime = t.formatDate(new Date(nowYear, nowMonth, "1"));
                        t.chooseTimeSelf = false;
                        break;
                    case 5:    //自定义
                        $("#report_search_wrap").find(".data_choose_wrap").show();
                        t.chooseTimeSelf = true;
                        break;
                }
                $dom.attr({class:"active"}).siblings().attr({class:""});
            },
            /*
             * 当月的第几周
             * */
            //格式化日期：yyyy-MM-dd
            formatDate:function(date) {
                var myyear = date.getFullYear();
                var mymonth = date.getMonth()+1;
                var myweekday = date.getDate();

                if(mymonth < 10){
                    mymonth = "0" + mymonth;
                }
                if(myweekday < 10){
                    myweekday = "0" + myweekday;
                }
                return (myyear+"-"+mymonth + "-" + myweekday);
            }

        }
    });
    module.exports = VueComponent;

});
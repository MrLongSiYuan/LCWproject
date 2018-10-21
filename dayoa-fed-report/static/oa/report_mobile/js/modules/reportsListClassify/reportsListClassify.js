/**
 * Created by THINK on 2017/3/13.
 * 汇报列表显示
 */
define(function(require, exports, module) {
    require("js/modules/reportsListClassify/reportsListClassify.css");
    var sTpl = require("js/modules/reportsListClassify/reports-list-classify.html");

    require("commonStaticDirectory/plugins/headImgLoad/headImgLoad.js");

    //表单数据展示插件
    require("js/modules/formDataShow/formDataShow.js");

    Vue.component('reports-list-classify', Vue.extend({
        props: ['reportListInfo']
        ,template: sTpl
        ,data:function(){
            return {
                gMain:gMain,
                reportList:[],
                reportSource:this.reportListInfo.reportSource,      //sendOut（我发起的） received（我收到的）
            };
        }
        ,watch:{
            "reportListInfo.reportList":function () {
                var t = this;
                t.reportList = t.reportListInfo.reportList;
                if(t.reportList.length == 0){
                    $(".report_content_list_wrap").find(".no-data-page").show();
                }
            }
        }
        ,attached:function () {
            var t = this;
        }
        ,methods:{
            /*
            * 预览单个汇报
            * */
            previewSingleReport:function (reportId,tempName,status) {
                var t = this;
                var winTop = $(window).scrollTop();
                var tempName = $(".report_type_btn").find(" span").text();
                var beforeInDetail = {
                    reportListInfo:t.reportListInfo,
                    winTop:winTop,
                    reportTotal:t.$parent.reportTotal,
                    loadData:t.$parent.loadData,
                    tempId:t.$parent.tempId,
                    personName:t.$parent.personName,
                    endTime:t.$parent.endTime,
                    startTime:t.$parent.startTime,
                    reportId:reportId,
                    tempName:t.$parent.tempId?tempName:""
                }
                sessionStorage.setItem("listInfor",JSON.stringify(beforeInDetail));
                if(status == "1"){
                    window.location.href = "#!/singleReportDetail/"+reportId;
                }else if(status == "2"){    //草稿
                    window.location.href = "#!/draftEdit/"+reportId+"/edit";
                }
            },
            /*
            * 删除草稿汇报
            * */
            deleteDraft:function (uuid) {
                var t = this;
                t.$parent.inDeleteDraft(uuid);
            },
        }
        ,directives: {
            'app-head-img':function(data){
                if (!$.isEmptyObject(data)) {
                    $(this.el).headImgLoad({
                        userId: data.personId //dd号
                        , userName: data.personName
                        , userImg: gMain.DayHRDomains.baseStaticDomain + data.headImg
                    });
                }
            },
            "start-time-handle":function (data) {
                if (!$.isEmptyObject(data)){
                    var nowDate =new Date(data.startTime.slice(0,10));//截取日期字符串转换问日期变量
                    var theWeek = nowDate.getDay(); //当天为周几
                    var daysOfMonth = nowDate.getDate(); //这个月的第几天
                    var monthOfYear = nowDate.getMonth()+1; //今年的几月份
                    var theYear = nowDate.getFullYear(); //年
                    var weekOfMonth = "";   //这个月的第几周
                    var arr = ["日","一","二","三","四","五","六"];
                    if(theWeek == 0){     //这天刚好是周日
                        weekOfMonth = Math.floor(daysOfMonth/7);
                    }else {
                        weekOfMonth = Math.floor((daysOfMonth + 7 - theWeek)/7);
                    }
                    var theWeekStr = theWeek+"";
                    theWeekStr ="周" + theWeekStr.replace(new RegExp(theWeekStr, "g"),arr[theWeek]);
                    if(data.tempName == "周报"){
                        var monday
                        if(theWeek == 0){     //这天刚好是周日
                            monday = new Date(nowDate.getTime() - 6*24*60*60*1000);
                            theYear = monday.getFullYear(); //年
                            monthOfYear = monday.getMonth()+1; //今年的几月份
                            daysOfMonth = monday.getDate(); //这个月的第几天
                            theWeek = monday.getDay(); //当天为周几
                        }else {
                            monday = new Date(nowDate.getTime() - (theWeek - 1)*24*60*60*1000);
                            theYear = monday.getFullYear(); //年
                            monthOfYear = monday.getMonth()+1; //今年的几月份
                            daysOfMonth = monday.getDate(); //这个月的第几天
                            theWeek = monday.getDay(); //当天为周几
                        }
                        weekOfMonth = Math.floor((daysOfMonth + 7 - theWeek)/7);
                        $(this.el).html(data.tempName+"&nbsp;（"+theYear+"年"+monthOfYear+"月"+"第"+weekOfMonth+"周）");
                    }else if(data.tempName == "月报"){
                        $(this.el).html(data.tempName+"&nbsp;（"+theYear+"年"+monthOfYear+"月）");
                    }else{
                        $(this.el).html(data.tempName+"&nbsp;（"+monthOfYear+"-"+daysOfMonth+"&nbsp;"+theWeekStr+"）");
                    }
                }
            }
        }
    }));


});
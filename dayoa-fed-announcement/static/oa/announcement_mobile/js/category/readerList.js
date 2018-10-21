/**
 * Created by THINK on 2017/4/24.
 * 阅读人列表
 */
define(function (require,exports,module) {
    require("css/readerList.css")
    var sTpl = require("templates/readerList.html");
    var Ajax = require("js/ajax");
    var w = require("js/plugins/callAppHandler.js");
    /*阅读*/
    var readerApi = require("commonStaticDirectory/plugins/daydaoFedComment/daydaoFedReadApi.js");

    require("commonStaticDirectory/plugins/headImgLoad/headImgLoad.js");

    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function () {
            return {
                gMain:gMain,
                reportId:null,
                readerHeadImgList:[],
                readTatol:0,
                announcementId:"",
                pageNo:2,
                requestFlag:false,
            }
        }
        ,compiled:function () {
            $("html").css({background:"#fff"});
        }
        ,attached:function () {
            var t = this;
            $("#single_ann_detail").hide();
            t.readerHeadImgList = t.$parent.readList;
            t.readTatol = t.$parent.readTatol;
            t.announcementId = t.$parent.announcementId;
            if(t.readerHeadImgList.length < t.readTatol){
                t.bottomLoadingfun("2");
            }
            t.initPageHeader();
            t.winInitSrollEvent();
        }
        ,beforeDestroy:function () {
            $("html").css({background:"#f2f2f2"});
            $(window).unbind("scroll");
        }
        ,methods:{
            initPageHeader: function () {
                var data = {
                    leftBtn: "back", //左边按钮，””表示无左边按钮
                    headerColor: "", //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title", "已阅");
            },
            /*
             * 底部显示
             * */
            bottomLoadingfun:function (str) {
                switch (str){
                    case "1":     //不显示
                        $("#reader_list_wrap").find(".dropload-refresh").hide();
                        $("#reader_list_wrap").find(".dropload-load").hide();
                        $("#reader_list_wrap").find(".dropload-noData").hide();
                        break;
                    case "2":     //显示上拉加载
                        $("#reader_list_wrap").find(".dropload-refresh").show();
                        $("#reader_list_wrap").find(".dropload-load").hide();
                        $("#reader_list_wrap").find(".dropload-noData").hide();
                        break;
                    case "3":     //正在加载
                        $("#reader_list_wrap").find(".dropload-refresh").hide();
                        $("#reader_list_wrap").find(".dropload-load").show();
                        $("#reader_list_wrap").find(".dropload-noData").hide();
                        break;
                    case "4":     //没有数据
                        $("#reader_list_wrap").find(".dropload-refresh").hide();
                        $("#reader_list_wrap").find(".dropload-load").hide();
                        $("#reader_list_wrap").find(".dropload-noData").show();
                        break;
                }
            },
            winInitSrollEvent:function () {
                var t = this;
                $(window).bind('scroll',function(){
                    if ($(document).scrollTop() + $(window).height() + 20 > $(document).outerHeight() && (t.readerHeadImgList.length < t.readTatol) && !t.requestFlag) {
                        t.bottomLoadingfun("3");
                        t.getMoreReader();
                    }else if($(document).scrollTop() + $(window).height() + 20 > $(document).outerHeight() && t.readerHeadImgList.length != 0 && !(t.readerHeadImgList.length < t.readTatol)){
                        t.bottomLoadingfun("4")
                    }
                });
            },
            getMoreReader:function () {
                var t = this;
                t.requestFlag = true;
                readerApi.getReadUserInfo({"infoId":t.announcementId,"pageNo":t.pageNo,"pageSize":15},function(count, data){
                    t.requestFlag = false;
                    t.readerHeadImgList = t.readerHeadImgList.concat(data.slice(0));
                    t.pageNo += 1;
                    t.readTatol = count;
                    if(t.readerHeadImgList.length < t.readTatol){
                        t.bottomLoadingfun("2");
                    }else{
                        t.bottomLoadingfun("4");
                    }
                    location.href = "#!/singleAnnDetail/" + t.announcementId + "/readerList";
                });
            }
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
            'read-ann-time':function(data){
                if (!$.isEmptyObject(data)) {
                    var showtime,date;
                    data = data.replace(/-/g, "/");
                    date = new Date(data);
                    var year,month,day,hour,minute,second;
                    year = date.getFullYear();
                    month = date.getMonth()+1 < 10 ? "0"+(date.getMonth()+1):date.getMonth()+1;
                    day = date < 10 ? "0"+date.getDate():date.getDate();
                    hour = date.getHours() < 10 ? "0"+date.getHours():date.getHours()
                    minute = date.getMinutes() < 10 ? "0"+date.getMinutes():date.getMinutes();
                    showtime = month+"/"+day+" "+hour+":"+minute;
                    $(this.el).text(showtime);
                }
            },
        }
    });
    module.exports = VueComponent;
})

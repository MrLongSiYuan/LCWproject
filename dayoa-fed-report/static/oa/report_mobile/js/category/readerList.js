/**
 * Created by THINK on 2017/4/24.
 * 阅读人列表
 */
define(function (require,exports,module) {
    require("css/readerList.css")
    var sTpl = require("templates/readerList.html");
    var Ajax = require("js/ajax");
    var w = require("js/plugins/callAppHandler.js");
    var _ver = require("js/plugins/versionHeader.js");  //判断是否4.5版本以上

    require("commonStaticDirectory/plugins/headImgLoad/headImgLoad.js");

    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function () {
            return {
                gMain:gMain,
                reportId:null,
                readerHeadImgList:[]
            }
        }
        ,compiled:function () {
            $("html").css({background:"#fff"});
        }
        ,attached:function () {
            var t = this;
            $("#single_report_detail").hide();
            t.readerHeadImgList = t.$parent.readList;
            t.initPageHeader();
        }
        ,beforeDestroy:function () {
            $("html").css({background:"#f2f2f2"});
        }
        ,methods:{
            initPageHeader: function () {
                var headerColor;
                if(_ver.versionHeader()){
                    headerColor = "";
                }else{
                    headerColor = "473f3a";
                }
                var data = {
                    leftBtn: "back", //左边按钮，””表示无左边按钮
                    headerColor: headerColor, //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title", "已阅");
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
            }
        }
    });
    module.exports = VueComponent;
})

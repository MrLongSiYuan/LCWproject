/**
 * Created by THINK on 2017/4/22.
 * 汇报搜索
 */
define(function(require, exports, module) {
    require("js/modules/previewReceiver/previewReceiver.css");
    var sTpl = require("js/modules/previewReceiver/previewReceiver.html");
    var _ver = require("js/plugins/versionHeader.js");  //判断是否4.5版本以上

    var Ajax = require("js/ajax");
    var w = require("js/plugins/callAppHandler.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框

    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/Validform_v5.3.2.js");  //表单验证插件
    require("commonStaticDirectory/plugins/jquery.loading.js");
    require("js/modules/formPreview/formPreview.js");
    //表单数据展示插件
    require("js/modules/formDataShow/formDataShow.js");
    require("commonStaticDirectory/plugins/headImgLoad/headImgLoad.js");

    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function(){
            return {
                gMain:gMain,
                receiverList:[],//接收人列表数据
            }
        }
        ,watch:{
        }
        ,compiled:function () {
            $("html").css({background:"#fff"});
        }
        ,attached:function () {
            var t = this;
            $("#preview_report_wrap").hide();
            t.receiverList = t.$parent.receiverList;
            t.initHeader();
        }
        ,beforeDestroy:function () {
            $("html").css({background:"#f2f2f2"});
        }
        ,methods:{
            initHeader:function () {
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
                w.callAppHandler("h5_set_page_title", "汇报对象预览");
            }
        }
        ,transitions:{

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

});

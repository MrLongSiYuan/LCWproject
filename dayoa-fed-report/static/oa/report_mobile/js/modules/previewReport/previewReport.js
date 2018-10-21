/**
 * Created by THINK on 2017/4/22.
 * 汇报预览
 */
define(function(require, exports, module) {
    require("js/modules/previewReport/previewReport.css");
    var sTpl = require("js/modules/previewReport/previewReport.html");
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
                nodeData:[],
                receiverList:[],//接收人列表数据
                forwardType:"0",  //0:可以转发 1:禁止转发
                sParams:"",  //路由参数默认值
                tempName:null,
                isDraft:false,  //是否是草稿 预览
            }
        }
        /**
         * 监控路由改变
         * */
        ,route: {
            data: function (transition) {
                return {
                    sParams: transition.to.fullPath
                }
            }
        }
        ,watch:{
            'sParams': function (val) {
                var t = this;
                if(val == '/addReport/:temp_id/:form_id/:handle/previewReport'){
                    $("#preview_report_wrap").show();
                    t.isDraft = false;
                    t.initHeader();
                }else if(val == '/draftEdit/:report_id/:handle/previewReport'){
                    $("#preview_report_wrap").show();
                    t.isDraft = true;
                    t.initHeader();
                }
            }
        }
        ,attached:function () {
            var t = this;
            $("#single_report_handle").hide();
            if(t.$parent.nodeData.length > 0){
                t.nodeData = t.$parent.nodeData;
                t.receiverList = t.$parent.receiverList;
                t.forwardType = t.$parent.forwardType;
                t.tempName = t.$parent.tempName;
                window.localStorage.setItem("previewStyle",JSON.stringify(t.nodeData));
                window.localStorage.setItem("previewReceiver",JSON.stringify(t.receiverList));
                window.localStorage.setItem("previewForward",JSON.stringify(t.forwardType));
                window.localStorage.setItem("previewTitle",JSON.stringify(t.tempName));
            }else{
                t.initHeader();
                t.nodeData = JSON.parse(window.localStorage.getItem("previewStyle"));
                t.receiverList = JSON.parse(window.localStorage.getItem("previewReceiver"));
            }
            try{
                $("#report_app_index_test").remove();
            }catch(e){}
            try{
                $("#loading_wrap_detail").remove();
            }catch(e){}
        }
        ,compiled:function () {

        }
        ,methods:{
            saveReport:function () {
                var t = this;
                if(t.receiverList.length > 0){
                    t.$parent.saveReport();
                }else{
                    amyLayer.alert("接收人不可以为空");
                }
            },
            saveDraft:function () {
                var t = this;
                $("#preview_report_wrap .draft_cover_wrap").hide();
            },
            jumpPreviewReceiver:function () {
                var t = this;
                if(t.isDraft){
                    location.href = "#!/draftEdit/"+t.$parent.reportId+"/"+t.$parent.handle+"/previewReport/previewReceiver";
                }else{
                    window.location.href = "#!/addReport/"+t.$parent.tempId+"/"+t.$parent.formId+"/"+t.$parent.handle+"/previewReport/previewReceiver";
                }
            },
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
                w.callAppHandler("h5_set_page_title", "预览");
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

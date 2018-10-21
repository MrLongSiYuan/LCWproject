/**
 * Created by THINK on 2017/4/6.
 */
/**
 * 选择模板
 */

define(function (require,exports,module) {
    require("css/chooseTemp.css");
    var sTpl = require("templates/chooseTemp.html");
    var Ajax = require("js/ajax");
    var w = require("js/plugins/callAppHandler.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var v = require("commonStaticDirectory/plugins/isSupported.js");
    var _ver = require("js/plugins/versionHeader.js");  //判断是否4.5版本以上

    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function(){
            return {
                gMain:gMain,
                tempTypeList:[],
            }
        }
        ,attached:function () {
            var t = this;
            // if(!v.isSupported()){ //旧版 APP 不支持，弹出升级提示，并不再渲染页面
            //     return false;
            // }
            t.getReportType();
            t.initPageHeader();

        }
        ,compiled:function () {

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
                w.callAppHandler("h5_set_page_title", "选择模板");
            },
            /*
             * 获取表单模板类型
             * */
            getReportType:function () {
                var t = this,postUrl;
                postUrl = gMain.apiBasePath + "wrReportTemp/getFormTemplates.do";
                Ajax.ajax({
                    url:postUrl,
                    data:JSON.stringify({

                    }),
                    beforeSend:function () {
                        $("body").loading({zIndex:999999999}); //开启提交遮罩
                    },
                    complete:function () {
                        $("body").loading({state:false}); //关闭提交遮罩
                    },
                    success:function(data) {
                        if(data.result == "true" && data.data.list){
                            if($.isArray(data.data.list)){
                                t.tempTypeList = data.data.list.slice(0);//设置模板
                            }
                        }
                    }
                });
            },
            /*
            * 跳转写汇报
            * */
            jumpWriteReport:function (tempId,formId,tempName) {
                window.location.href = "#!/addReport/"+tempId+"/"+formId+"/edit";
            },
            /*
             * 跳转引导页
             * */
            jumpGuide:function () {
                window.location.href = "#!/guidePage";
            }
        }
        ,transitions:{

        }

    });
    module.exports = VueComponent;
});


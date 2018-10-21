/**
 * 首页aa
 */

define(function (require,exports,module) {
    var sTpl = require("templates/test.html");
    require("css/test.css");
    require("commonStaticDirectory/plugins/imageTouch/imageTouch");
    require("commonStaticDirectory/plugins/imageTouch/imageTouch.css");
    var w = require("js/plugins/callAppHandler.js");
    var VueComponent = Vue.extend({
        template: sTpl
        ,data:function(){
            return {
                msg:"测试页面"
                ,options:{
                    infoSetId:"test"
                }
                ,gMain:gMain
                ,text:false
            }
        }
        ,attached:function () {
            var t = this;
            alert(444);
            w.callAppHandler("h5_get_version","");
            t.text = true;
        }
        ,created:function () {
           // alert(123)

            var data = {
                leftBtn: "back", //左边按钮，””表示无左边按钮
                headerColor: "aaa", //导航条背景颜色，””表示默认颜色
                rightBtn: []
            };
            w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
            w.callAppHandler("h5_set_page_title","汇报txt");
        }
        ,methods:{
            click1:function () {
                require.async("js/modules/orgSelect/orgSelect.js",function (orgSelect) {
                    orgSelect.init({
                        title:"适用范围选择"
                        ,callback:function (data) {

                        }
                    });
                });
            }
        }
    });

    module.exports = VueComponent;
});


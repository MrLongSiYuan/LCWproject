/**
 * 首页aa
 */

define(function (require,exports,module) {
    var sTpl = require("templates/test.html");
    require("css/test.css");
    require("commonStaticDirectory/plugins/imageTouch/imageTouch");
    require("commonStaticDirectory/plugins/imageTouch/imageTouch.css");
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

        }
        ,methods:{
        }
    });

    module.exports = VueComponent;
});


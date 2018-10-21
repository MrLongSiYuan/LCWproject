/**
 * 首页aa
 */

define(function (require,exports,module) {
    var sTpl = require("templates/test.html");
    var AuditerSelect = require("js/modules/auditSelect/auditSelect.js");

    var VueComponent = Vue.extend({
        template: sTpl
        ,data:function(){
            return {
                msg:"测试页面"
                ,options:{
                    infoSetId:"test"
                }
            }
        }
        ,attached:function () {
            var t = this;


            /*new AuditerSelect({
                afterSelect:function (data) {
                    console.log(data);
                }
            });*/

            /*require.async("js/modules/workflowSetting/workflowSetting.js",function (WorkflowSetting) {
                new WorkflowSetting({oMetadata:t,editType:"edit",oFormEditData:undefined});
            });*/

            /*require.async("js/modules/orgSelect/orgSelect.js",function (orgSelect) {
                orgSelect.init({
                    title:"适用范围选择"
                    ,callback:function (data) {
                        console.log(data);
                    }
                });
            });*/


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


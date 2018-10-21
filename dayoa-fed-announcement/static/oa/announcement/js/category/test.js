/**
 * 首页aa
 */

define(function (require,exports,module) {
    var sTpl = require("templates/test.html");
    var AuditerSelect = require("js/modules/auditSelect/auditSelect.js");
   // var AnnSend=require("js/modules/annSend/annSend.js");
    require("commonStaticDirectory/plugins/iview1.x/iview.css");
    require("commonStaticDirectory/plugins/iview1.x/iview.min.js");
    var auditStart = require("js/modules/auditStart/auditStart.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Demo=require("js/modules/demo/demo.js");
    require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect.css");
    var dayhrDropSelect = require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect");
    //下拉多选
    require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropMultipleSelect.css");
    var dayhrDropMulSelect = require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropMultipleSelect.js");
    var daydaoFedComment=require("commonStaticDirectory/plugins/daydaoFedComment/daydaoFedComment.js")
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
            var drop = new dayhrDropMulSelect({
                id: "dropSelect",
                width: 180,
                maxHeight: 250,
                data: [{id:"id1111", name:"选项一"},{id:"id2", name:"选项二"}],
                name: "modelId",
                onSelected:function(oSelect, type){}
            });
            var comment=new daydaoFedComment({
                id:"comment",
                commNum:1,
                personId:3642

            });
            t.page();



        }
        ,methods:{
            click1:function () {

            },
           demo: function () {
              // alert(1);
               var t=this;
               require.async("js/modules/demo.js", function () {
                   new Demo({

                   })
               })
           },
            page:function(){
                $("#page").html('<Page :total="100" show-total></Page>');
            }

        }
    });

    module.exports = VueComponent;
});


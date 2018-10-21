/**
 * Created by Administrator on 2017/9/14.
 */
define(function (require,exports,module) {
    require("css/addAnnouncement.css");
    var sTpl = require("templates/addAnnouncement.html");
    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function(){
            return {
                gMain:gMain,

            }
        }
        /**
         * 监控路由改变
         * */
        ,route: {
            data: function (transition) {
                return {
                    routePath:transition.to.path
                }
            }
        }
        ,watch:{
            "routePath":function (val) {

            }
        }
        ,attached:function () {

        }
        ,compiled:function () {
        }
        ,methods:{
            switchClick:function (e) {
                var t = this;
                var $dom = $(e.target).attr("class") == "switch_wrap" ? $(e.target): $(e.target).parent();
                if($dom.attr("data-status") == "off"){
                    $dom.find(".circle").animate({
                        left:"22px"
                    },200);
                    $dom.css({background:"#FF7123"})
                    $dom.attr({"data-status":"on"});
                    t.forwardType = "1";
                }else{
                    $dom.find(".circle").animate({
                        left:"1px"
                    },200);
                    $dom.css({background:"#ccc"})
                    $dom.attr({"data-status":"off"});
                    t.forwardType = "0";
                }
            },
        }
        ,transitions:{

        }

    });
    module.exports = VueComponent;
})
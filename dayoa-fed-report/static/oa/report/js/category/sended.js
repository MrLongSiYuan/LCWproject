/**
 * Created by THINK on 2017/2/15.
 */
define(function (require,exports,module) {
    /*引入bootstrap 插件*/
    require("commonStaticDirectory/plugins/bootstrap/bootstrap.min.css");
    require("css/sended.css");
    var sTpl = require("templates/sended.html");
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css"); //artDialog弹窗
    var tools = require("commonStaticDirectory/plugins/tools"); //工具函数集
    var detailPage=require("js/category/sponsorAll.js");

    require("commonStaticDirectory/plugins/dayhrPaginator/jquery.dayhrPaginator.css");//引入分页插件的css
    var pager=require("commonStaticDirectory/plugins/dayhrPaginator/jquery.dayhrPaginator.js");//分页插件



    var VueComponent = Vue.extend({
        template: sTpl
        ,data:function(){
           isSponsor:false
        }
        ,methods:{
            /*--初始化函数--*/
            init:function(options){
                var t = this;
                this.options = options;
                t.isSponsor=true;


            },
            click:function(){
                console.log("jjj")
            }


        }
    });

    module.exports = VueComponent;
});

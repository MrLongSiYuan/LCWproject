/**
 * Created by tangguoping on 2017/1/9.
 * 发布招聘活动
 */
define(function(require, exports, module) {
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗
    //下拉菜单组件
    var ClassName = function(){
        this.init.apply(this,arguments);
    }
    ClassName.prototype = {
        constructor : ClassName
        ,options:{
            mmg:undefined
        }
        /**
         *初始化函数
         */
        ,init : function(options){
            var t = this;
            //初始化类要做的事情
            this.options = $.extend({},this.options,options);
            var aItem = this.options.aItem;
            t.validatorFields = {};
            if(aItem.length != 1){
                tools.showMsg.error("请选择需要发布的数据");
                return;
            }
            layer.confirm('请确定是要发布选中的招聘活动到招聘网站吗？', {icon: 3, title:'提示'}, function(index){
                Ajax.ApiTools().publishActive({
                    data:{activityId:t.options.aItem[0].activity_id}
                    ,success:function (data) {
                        tools.showMsg.ok("发布成功！");
                        t.options.oMetaData.mmg.load();
                        layer.close(index);
                    }
                });
            });
        }

        /**
         * 继续扩展方法
         */
        ,otherFunction : function(){

        }

    };
    module.exports = ClassName;
});


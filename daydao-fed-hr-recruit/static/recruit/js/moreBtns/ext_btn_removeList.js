/**
 * Created by tangguoping on 2017/1/4.
 * 解除黑名单
 */
define(function(require, exports, module) {
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗
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
            if(aItem.length < 1){
                tools.showMsg.error("请选择需要解除黑名单的数据");
                return;
            }
            for (var i=0; i<aItem.length;i++){
                if(aItem[i].resume_status_id == "回收站"){
                    tools.showMsg.error("回收站状态的简历不能解除黑名单");
                    return;
                };
            };
            layer.confirm('请确定是要解除选中简历的黑名单状态吗？', {icon: 3, title:'提示'}, function(index){
                var _aItem = [];
                for (var i=0; i<t.options.aItem.length;i++){
                    _aItem.push(t.options.aItem[i].id);
                }
                Ajax.ajax({
                    type:"GET",
                    url:gMain.apiBasePath +"resumeRecycle/removeList.do",
                    data:{resumeIds:_aItem.toString()},
                    success:function (data) {
                        if(data.result=="true"){
                            tools.showMsg.ok("解除黑名单成功！");
                            t.options.oMetaData.mmg.load();
                            layer.close(index);
                        }else {
                            tools.showMsg.error(data.resultDesc);
                        }
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


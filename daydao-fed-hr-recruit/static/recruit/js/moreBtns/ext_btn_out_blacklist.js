/**
 * Created by plus on 2017/7/4.
 * 解除黑名单
 */
define(function(require, exports, module) {
    //"use strict";
    var Ajax = require("js/ajax");
    var tools = require("commonStaticDirectory/plugins/tools");
    /*require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗*/
    require("commonStaticDirectory/plugins/layer/layer"); //弹窗
    //表单控件
    require("commonStaticDirectory/plugins/autoForm/autoForm.css");
    require("commonStaticDirectory/plugins/jquery.loading");
    var ClassName = function(){
        this.init.apply(this,arguments);
    }
    ClassName.prototype = {
        constructor : ClassName,
        options:{
            oPayOrgDate:undefined,
            mmg:undefined
        },
        /**
         *初始化函数
         */
        init : function(options){
            var t = this;
            //初始化类要做的事情
            this.options = $.extend({},this.options,options);
            var aItem = this.options.aItem;
            if(aItem.length < 1){
                tools.showMsg.error("请选择需要解除黑名单的数据");
                return;
            }
            layer.confirm('请确定是要解除该简历的黑名单状态吗？', {
                icon: 3,
                title: '提示',
                btn: ['确定','取消'] //按钮
            }, function(){
                var aItem = []
                for (var i=0; i<t.options.aItem.length;i++){
                    aItem.push(t.options.aItem[i].resumeId);
                }
                var oSubmitData = {
                    resumeIds:aItem
                };
                $("body").loading({zIndex:999}) //启用loading遮罩
                Ajax.ApiTools().relieveBlacklist({
                    data:oSubmitData
                    ,success:function (data) {
                        if(data.result=="true"){
                            tools.showMsg.ok("保存成功！");
                            $("body").loading({state:false});
                            t.options.oMetaData.mmg.load();
                        }else {
                            tools.showMsg.error(data.resultDesc);
                        }
                    }
                });
            }, function(){
            });
        },
        /**
         * 继续扩展方法
         */
        otherFunction : function(){

        }

    };
    module.exports = ClassName;
});
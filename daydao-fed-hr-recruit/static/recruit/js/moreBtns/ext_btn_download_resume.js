/**
 * Created by tangguoping on 2017/1/9.
 * 下载简历
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
            if(aItem.length != 1){
                tools.showMsg.error("请选择一条需要下载的数据");
                return;
            }
            //表单验证通过
            for (var i=0; i<t.options.aItem.length;i++){
                var sUrl = gMain.apiBasePath +"resumeLib/downloadResume.do?resumeIds="+t.options.aItem[i].resumeId;
                location.href = encodeURI(sUrl);
            }
        }

        /**
         * 继续扩展方法
         */
        ,otherFunction : function(){

        }

    };
    module.exports = ClassName;
});


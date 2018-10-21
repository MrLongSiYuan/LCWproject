/**
 * Created by zhangqi on 2015/8/11.
 * 流程设置的启用禁用
 * @options Object
 * @options.aItem array<Object> 选中的行
 * @options.aRowIndex array 选中的行的索引
 * @options.oMetaData Object元数据模块的类对象
 */
define(function(require,exports,module){
    var Ajax = require("js/ajax");
    var tools = require("commonStaticDirectory/plugins/tools.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");
    var ext_btn_enable = require("js/moreBtns/ext_btn_enable.js")

    var ExtBtnClass = function(){
        this.init.apply(this,arguments);
    };
    ExtBtnClass.prototype = {
        constructor:ExtBtnClass,
        options:{
        },
        init:function(options){
            var t = this;
            t.options = $.extend({},this.options,options);
            t.options.operateType = "disable";
            new ext_btn_enable(t.options);
        }

    }

    module.exports = ExtBtnClass;
});

/**
 * Created by zhangqi on 2015/8/11.
 * 组织调整模块
 * @options Object
 * @options.aItem array<Object> 选中的行
 * @options.aRowIndex array 选中的行的索引
 * @options.oMetaData Object元数据模块的类对象
 */
define(function(require,exports,module){
    var Ajax = require("js/ajax");

    var ExtBtnClass = function(){
        this.init.apply(this,arguments);
    };
    ExtBtnClass.prototype = {
        constructor:ExtBtnClass,
        options:{
        },
        init:function(options){
            var t = this;
            this.options = $.extend({},this.options,options);

            layer.confirm("是否确认要这么做？", {icon: 3, title:'提示'}, function(index){
                Ajax.ajax({
                    url:gMain.apiBasePath+"advancedConfig/resetConfig.do"
                    ,data:JSON.stringify({
                        infoSetId:t.options.oMetaData.options.infoSetId
                    })
                    ,success:function (data) {
                        if(data.result == "true"){
                            layer.msg("操作成功", {offset: 0});
                            t.options.oMetaData.mmg.load();
                        }
                    }
                });
                layer.close(index);
            });
        }

    }

    module.exports = ExtBtnClass;
});

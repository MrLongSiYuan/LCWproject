/**
 * Created by THINK on 2017/4/6.
 */
define(function (require,exports,module) {
    //引入依赖项
    var Ajax = require("js/ajax");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集

    var getIndexDo = function () {
        this.init.apply(this,arguments);
    };
    $.extend(getIndexDo.prototype,{
        options:{}
        ,init:function(options){
            var that = this;
            that.options = $.extend({},that.options,options);
            $.when(that.getSessionData()).done(function () {
                that.options.callback();
            });
        },
        getSessionData:function () {
            var df = $.Deferred();
            setTimeout(function () {
                Ajax.ajax({
                    url:gMain.apiBasePath + "home/homeIndex/index.do"
                    ,beforeSend:function () {
                    }
                    ,complete:function () {
                    }
                    ,success:function (data) {
                        if(data.result == "true"){
                            gMain.userInfo = JSON.parse(JSON.stringify(data.beans));
                            df.resolve();
                        }else {
                            if(data.resultDesc!=""){
                                // tools.showMsg.ok(data.resultDesc);
                            }
                        }
                    }
                });

            },100);
            return df;
        },
    });
    module.exports = getIndexDo;
});

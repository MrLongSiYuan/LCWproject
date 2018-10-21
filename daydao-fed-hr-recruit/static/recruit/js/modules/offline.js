/**
 * Created by plus on 2017/7/14.
 * 职位下线
 */

define(function (require, exports, module) {
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/layer/layer"); //弹窗
    require("commonStaticDirectory/plugins/jquery.loading");

    var ClassName = function () {
        this.init.apply(this, arguments);
    }
    ClassName.prototype = {
        constructor: ClassName
        , options: {}
        /**
         *初始化函数
         */
        , init: function (options) {
            var t = this;
            //初始化类要做的事情
            this.options = $.extend({}, this.options, options);
            var arr = t.options.opts.selectedRows();
            if(arr.length == 1) {
                t.offLineFun(arr[0].pos_id);
            }else{
                tools.showMsg.error("请选择一条需要下线的数据！");
            }
        },
        offLineFun:function (param) {
            var t = this;
            layer.confirm('您确定下线此职位么？', {
                icon:3,
                title: '下线操作',
                btn: ['确定', '取消'] //按钮
            }, function () {
                Ajax.ApiTools().posOffline({
                    data:{posId:param}
                    ,success:function (data) {
                        if(data.result == "true") {
                            t.options.opts.load();
                            tools.showMsg.ok('下线成功');
                        }
                    }
                });

            }, function () {
            });
        }

    };
    module.exports = ClassName;
});



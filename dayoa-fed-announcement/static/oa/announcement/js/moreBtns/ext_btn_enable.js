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

    var ExtBtnClass = function(){
        this.init.apply(this,arguments);
    };
    ExtBtnClass.prototype = {
        constructor:ExtBtnClass,
        options:{
            operateType:"enable"
        },
        init:function(options){
            var t = this;
            t.options = $.extend({},this.options,options);

            if(t.options.aItem.length == 1){
                if(t.options.operateType == "enable"){
                    //判断是否具有启用的权限
                    $.when(t.checkIsHasAuditList(),t.checkIsHasFormList()).done(function () {
                        t.enableOrDiaableAudit();
                    }).fail(function (type) {
                        if(type == "audit"){
                            tools.showMsg.error("没有审批节点，不满足启用的条件");
                        }else{
                            tools.showMsg.error("没有创建表单数据，不满足启用的条件");
                        }
                    });
                }else{
                    t.enableOrDiaableAudit();
                }
            }else{
                tools.showMsg.error("请只选择一条数据");
            }
        }
        /**
         * 判断是否有流程节点
         * */
        ,checkIsHasAuditList:function () {
            var t = this;
            var df = $.Deferred();
            Ajax.ajax({
                url:gMain.apiBasePath + "wfFormSet/getStyleForMongo.do"
                ,data:JSON.stringify({id:String(t.options.aItem[0].form_id) ,ident:"audit"})
                ,beforeSend:function () {
                    $("body").loading({zIndex:999}); //开启提交遮罩
                }
                ,complete:function () {
                    $("body").loading({state:false}); //关闭提交遮罩
                }
                ,success:function (data) {
                    if(data.result == "true"){
                        if(data.style && JSON.parse(data.style).auditDataList.length){
                            df.resolve();
                        }else{
                            df.reject("audit");
                        }
                    }
                }
            });
            return df;
        }
        /**
         * 判断是否有表单字段
         * */
        ,checkIsHasFormList:function () {
            var t = this;
            var df = $.Deferred();
            Ajax.ajax({
                url:gMain.apiBasePath + "wfFormSet/getStyleForMongo.do"
                ,data:JSON.stringify({id:String(t.options.aItem[0].form_id) ,ident:"form"})
                ,beforeSend:function () {
                    $("body").loading({zIndex:999}); //开启提交遮罩
                }
                ,complete:function () {
                    $("body").loading({state:false}); //关闭提交遮罩
                }
                ,success:function (data) {
                    if(data.result == "true"){
                        if(data.style && JSON.parse(data.style).fields.length){
                            df.resolve();
                        }else{
                            df.reject("form");
                        }
                    }
                }
            });
            return df;
        }
        /**
         * 启用或者禁用流程
         * */
        ,enableOrDiaableAudit:function () {
            var t = this;
            Ajax.ajax({
                url:gMain.apiBasePath + (t.options.operateType == "enable"?"wfFormSet/enable.do":"wfFormSet/disable.do")
                ,data:JSON.stringify({
                    formState:t.options.operateType == "enable"?"1":"2"
                    ,uuid:t.options.aItem[0].uuid
                })
                ,beforeSend:function () {
                    $("body").loading({zIndex:999});
                }
                ,complete:function () {
                    $("body").loading({state:false});
                }
                ,success:function (data) {
                    if(data.result == "true"){
                        tools.showMsg.ok("操作成功");
                        t.options.oMetaData.mmg.load();
                    }
                }
            });
        }

    }

    module.exports = ExtBtnClass;
});

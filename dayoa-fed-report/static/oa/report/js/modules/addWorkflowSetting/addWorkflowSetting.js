/**
 * Created by Zackey on 2017/1/5.
 * 新增流程设置
 */
define(function(require, exports, module) {
    require("js/modules/addWorkflowSetting/addWorkflowSetting.css");
    var sTpl = require("js/modules/addWorkflowSetting/addWorkflowSetting.html");

    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");
    var orgSelect = require("js/modules/orgSelect/orgSelect.js")
    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");
    require("js/modules/formPreview/formPreview.js"); //表单预览插件

    var modulesClass = function () {
        this.init.apply(this,arguments);
    };

    $.extend(modulesClass.prototype,{
        options:{}
        ,init:function (options) {
            var t = this;
            t.options = $.extend({},t.options,options);
            t.initDialog();
        }
        ,initDialog:function () {
            var t = this;
            t.d = dialog({
                title:"新建表单"
                ,content:sTpl
                ,button:[
                    {
                        value:"取消"
                        ,callback:function () {

                        }
                    }
                ]
            });
            t.d.showModal();
            t.initVue();
        }
        ,initVue:function () {
            var that = this;
            that.vueDialog = new Vue({
                el:"#workflow_addWorkflowSetting"
                ,data:{
                    //表单模板
                    templateList:[]
                }
                ,attached:function () {//在此写接口
                    var t = this;
                    //获取流程设置的基础模板
                    Ajax.ajax({
                        url:gMain.apiBasePath + "wfFormSet/getDefaultWfFormSetList.do"
                        ,beforeSend:function () {
                            $(t.$el).loading();
                        }
                        ,complete:function () {
                            $(t.$el).loading({state:false});
                        }
                        ,success:function (data) {
                            if(data.result == "true"){
                                if($.isArray(data.val)){
                                    t.templateList = data.val;
                                }
                            }
                            setTimeout(function () {
                                that.d.reset();
                            },50);
                        }
                    });
                }
                ,methods:{//时间在methods内写
                    //选择模板
                    selectTemplate:function ($event,$index,item) {
                        var t = this;
                        $("body").loading({zIndex:9999}); //启用loading
                        require.async("js/modules/formBuild/formBuild.js",function (FormBuild) {
                            new FormBuild({
                                oMetadata:that.options.oMetadata
                                ,editType:"add"
                                ,oFormEditData:{
                                    form_id:String(item.formId), //自定义模式没有formId
                                }
                            });
                        });
                    }

                    //创建自定义表单，新增按钮
                    ,createCustomForm:function () {
                        var t = this;
                        $("body").loading({zIndex:9999}); //启用loading
                        require.async("js/modules/formBuild/formBuild.js",function (FormBuild) {
                            new FormBuild({
                                oMetadata:that.options.oMetadata
                                ,editType:"add"
                                ,oFormEditData:{
                                    form_id:"", //自定义模式没有formId
                                }
                            });
                        });
                    }

                    //预览模板
                    ,previewTemplate:function ($event,$index,item) {
                        var t = this;
                        that.previewFormDialog = dialog({
                            title:"表单预览"
                            ,ok:function () {

                            }
                            ,content:'' +
                            '<div id="builderViewPreview" style="width:880px;max-height: '+($(window).height() - 200) +'px;overflow-y: auto;padding-right: 30px;" class="clearfix">' +
                            '   <form-preview v-bind:afields="aFormJson"></form-preview>' +
                            '</div>'
                        });
                        that.previewFormDialog.showModal();
                        new Vue({
                            el:"#builderViewPreview"
                            ,data:{
                                aFormJson:[]
                            }
                            ,attached:function () {
                                var v = this;
                                Ajax.ajax({
                                    url:gMain.apiBasePath + "wrReportTemp/getFormStyleForMongo.do"
                                    ,data:JSON.stringify({
                                        id:item.formId + ""
                                        ,mongoSymbol:"formStyle_table"
                                    })
                                    ,beforeSend:function () {
                                        $(v.$el).loading();
                                    }
                                    ,complete:function () {
                                        $(v.$el).loading({state:false});
                                    }
                                    ,success:function (data) {
                                        if(data.result == "true"){
                                            if(data.data){
                                                var aFields = JSON.parse(data.data).fields;
                                                v.aFormJson = aFields;
                                                v.$nextTick(function () {
                                                    that.previewFormDialog.reset();
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });

    module.exports = modulesClass;
});

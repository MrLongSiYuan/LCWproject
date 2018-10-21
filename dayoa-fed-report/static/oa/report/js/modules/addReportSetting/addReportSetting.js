/**
 * Created by Zackey on 2017/1/5.
 * 新增流程设置
 */
define(function(require, exports, module) {
    require("js/modules/addReportSetting/addReportSetting.css");
    var sTpl = require("js/modules/addReportSetting/addReportSetting.html");

    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");
    var orgSelect = require("js/modules/orgSelect/orgSelect.js")
    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");
    require("js/modules/formPreview/formPreview.js"); //表单预览插件
    var FormBuild = require("workflowStaticDirectory/js/modules/formBuild/formBuild.js");

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
                title:"新增汇报模板"
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
                    templateList:[],//系统默认模板
                    NewtemplateList:[],//用户自定义模板
                    isShow:false//控制新增模板的显示与隐藏
                }
                ,attached:function () {//在此写接口
                    var t = this;
                    //获取汇报的基础模板
                    Ajax.ajax({
                        url:gMain.apiBasePath + "wrReportTemp/getAdminFormTemplates.do"
                        ,beforeSend:function () {
                            $(t.$el).loading();
                        }
                        ,complete:function () {
                            $(t.$el).loading({state:false});
                        }
                        ,success:function (data) {
                            if(data.result == "true"){
                                if($.isArray(data.data.data.sysTemplates)){
                                    t.templateList = data.data.data.sysTemplates;//系统设置模板
                                }
                                if($.isArray(data.data.data.userTemplates)){
                                    if(data.data.data.userTemplates.length==0){
                                        t.isShow=false;
                                    }else{
                                        t.isShow=true;
                                        t.NewtemplateList = data.data.data.userTemplates;//自定义设置模板
                                    }
                                }
                            }
                            setTimeout(function () {
                                that.d.reset();
                            },50);
                        }
                    });

                }
                ,methods:{//时间在methods内写
                    //选择模板,应用模板，自主添加组件
                    selectTemplate:function ($event,$index,item) {
                        var t = this;
                        $("body").loading({zIndex:9999}); //启用loading
                        var oFormEditData = that.options.oFormEditData;
                        oFormEditData.form_name = oFormEditData.name;
                        delete oFormEditData.name;
                        oFormEditData.form_base_id = String(item.formId);  //来自模板的id
                        new FormBuild({
                            oMetadata:that.options.oMetadata
                            ,editType:"add"
                            ,oFormEditData:oFormEditData
                            ,saveUrl:gMain.apiBasePath + "wrReportTemp/getFormStyleForMongo.do"
                            ,savePostData:{id:String(oFormEditData.form_base_id) ,mongoSymbol:"formStyle_table"}
                            ,projectSource:"report"
                        });
                        that.d.close().remove();
                    }

                    //创建自定义表单，自主添加组件
                    ,createCustomForm:function () {
                        var t = this;
                        $("body").loading({zIndex:9999}); //启用loading
                        var oFormEditData = that.options.oFormEditData;
                        oFormEditData.form_name = oFormEditData.name;
                        delete oFormEditData.name;
                        new FormBuild({
                            oMetadata:that.options.oMetadata
                            ,editType:"add"
                            ,oFormEditData:oFormEditData
                            ,saveUrl:gMain.apiBasePath + "wrReportTemp/getFormStyleForMongo.do"
                            ,savePostData:{id:String(oFormEditData.form_id) ,mongoSymbol:"formStyle_table"}
                            ,projectSource:"report"
                        });
                        that.d.close().remove();
                    }

                    //预览模板，填写表单信息
                    ,previewTemplate:function ($event,$index,item) {
                        var t = this;
                        that.previewFormDialog = dialog({
                            title:"模板预览"
                            ,ok:function () {}
                            ,content:'' +
                            '<div id="builderViewPreview" style="width:880px;max-height: '+($(window).height() - 200) +'px;overflow-y: auto;padding-right: 30px;" class="clearfix">' +
                            '   <form-preview v-bind:afields="aFormJson"></form-preview>' +
                            '   <div class="shade" style="position: absolute;left:0;top:0;width:100%;height:100%;background: rgba(255,255,255,0);opacity: 0;"></div>' +
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
                                            if(data.style){
                                                var aFields = JSON.parse(data.style).fields;
                                                v.aFormJson = aFields;
                                                v.$nextTick(function () {
                                                    that.previewFormDialog.reset();
                                                    $(v.$el).find(".shade").css({height:$(v.$el).find(".workflow_formPreview").height()+"px"});
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



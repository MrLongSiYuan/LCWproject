/**
 * Created by Zackey on 2016/12/22.
 * 打印流程
 */
define(function (require) {
    require("js/modules/printAudit/printAudit.css");
    var sTpl = require("js/modules/printAudit/printAudit.html");
    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");
    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");
    require("js/modules/formPreview/formPreview.js");
    var filePreview =  require("commonStaticDirectory/plugins/preview.js"); //文件预览插件
    //表单数据展示插件
    require("js/modules/formDataShow/formDataShow.js");
    require("js/plugins/jquery.print.js");  //打印插件

    var printAudit = function () {
        this.init.apply(this,arguments);
    };
    $.extend(printAudit.prototype,{
        options:{}
        ,init:function (options) {
            var t = this;
            t.options = $.extend({},t.options,options);
            if(t.options.item.instanc_state == "已通过"){
                t.initDialog();
            }else{
                tools.showMsg.error("未审批通过的流程不能打印");
                return false;
            }
        }
        ,initDialog:function () {
            var t = this;
            t.d = dialog({
                title:"待打印预览"
                ,button:[
                    {
                        value: '开始打印',
                        callback: function () {
                            $("#workflow_printAudit").print();
                            return false;
                        },
                        autofocus: true
                    },
                    {
                        value: '取消',
                        callback: function () {

                        }
                    }
                ]
                ,content:sTpl
            });
            t.d.showModal();
            t.initVue();

        }
        ,initVue:function () {
            var that = this;
            that.vueObj = new Vue({
                el:"#workflow_printAudit"
                ,data:{
                    gMain:gMain
                    ,aAuditList:[]  //审批人列表
                    ,aFormStyle:[] //表单数据
                    ,auditName:that.options.item.form_name  //流程名称
                    ,posName:gMain.tools.Cache.getCache("oHeaderData","session")?gMain.tools.Cache.getCache("oHeaderData","session").userInfo.posName:""  //当前用户的部门名称
                    ,userName:that.options.item.app_person_name //申请人
                    ,applyDate:that.options.item.app_time //申请时间
                    ,printTime:tools.dateFormat(new Date(),'yyyy-MM-dd hh:mm')
                }
                ,attached:function () {
                    var t = this;
                    t.getFormData();
                }
                ,methods:{
                    /**
                     * 获取表单数据
                     * */
                    getFormData:function () {
                        var t = this;
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wfProcess/getAuditData.do"
                            ,data:JSON.stringify({process_instanc_id:String(that.options.item.process_instanc_id)})
                            ,success:function (data) {
                                if(data.result == "true"){
                                    if($.isArray(data.customVal)){
                                        t.aAuditList = data.customVal; //审批节点数据
                                        var oCurrentAudit = data.customVal[_.findIndex(data.customVal,{auditPersonId:t.currentPersonId})]; //当前待审批的节点审批人
                                        var oWaitAudit =  data.customVal[_.findIndex(data.customVal,{nodeState:"1"})]; //当前待审的人

                                        //如果还有待审批的人
                                        if(oWaitAudit){
                                            //查询当前审批节点对应的表单数据
                                            Ajax.ajax({
                                                url:gMain.apiBasePath + "wfFormSet/getStyleForMongo.do"
                                                ,data:JSON.stringify({id:String(oWaitAudit.nodeDataId), ident:"nodedata"})
                                                ,success:function (data) {
                                                    if(data.result == "true" && data.style){
                                                        t.aFormStyle = JSON.parse(data.style);
                                                        setTimeout(function () {
                                                            that.d.reset();
                                                        },100);
                                                    }
                                                }
                                            });
                                        }else{  //所有人都审批通过
                                            //查询最后一个审批人的表单数据
                                            Ajax.ajax({
                                                url:gMain.apiBasePath + "wfFormSet/getStyleForMongo.do"
                                                ,data:JSON.stringify({id:String(data.customVal[data.customVal.length-1].nodeDataId), ident:"nodedata"})
                                                ,success:function (data) {
                                                    if(data.result == "true" && data.style){
                                                        t.aFormStyle = JSON.parse(data.style);
                                                        setTimeout(function () {
                                                            that.d.reset();
                                                        },100);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });
    return printAudit;
});

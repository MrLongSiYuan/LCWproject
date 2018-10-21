/**
 * Created by Zackey on 2017/4/1.
 * oMetadata
 * editType
 * oFormEditData
 */
define(function (require, exports, module) {
    require("js/modules/formSet/formSet.css");
    var sTpl = require("js/modules/formSet/formSet.html");

    require("commonStaticDirectory/plugins/Sortable.js");
    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");

    var template = require("commonStaticDirectory/plugins/template.js");
    var tools = require("commonStaticDirectory/plugins/tools"); //工具函数集
    var Ajax = require("js/ajax");
    var orgSelect = require("js/modules/orgSelect/orgSelect.js")
    require("js/modules/formPreview/formPreview.js"); //表单预览插件
    require("commonStaticDirectory/plugins/underscore.min.js");
    var addReportSetting = require("js/modules/addReportSetting/addReportSetting.js"); //从模板添加流程设置
    var reportRemind = require("js/modules/reportRemind/reportRemind.js"); //汇报提醒

    var modulesClass = function () {
        this.init.apply(this, arguments);
    };
    $.extend(modulesClass.prototype, {
        options: {}
        , init: function (options) {
            var t = this;
            t.options = $.extend({}, t.options, options);
            
            t.initDialog();
        }
        ,initDialog:function () {
            var t = this;
            var sActionStr = t.options.editType=="add"?"新增":"修改";
            var aButton = [
                {
                    value: '取消',
                    callback: function () {

                    }
                }
            ];

            if(t.options.editType == "add"){
                aButton.unshift({
                    value: '下一步',
                    callback: function () {

                        if(!t.vueObj.checkform()){
                            return false;
                        }
                        var remindType,remindDay;
                        switch(t.vueObj.remindInfor.modelChoose){
                            case "每天":
                                remindType = "1";
                                break;
                            case "每周":
                                remindType = "2";
                                break;
                            case "每月":
                                remindType = "3";
                                break;
                        }
                        switch(remindType){
                            case "1":
                                remindDay = "";
                                break;
                            case "2":
                                remindDay = ""
                                $.each(t.vueObj.remindInfor.modelWeek,function (num,val){
                                    var weekDay = ["一","二","三","四","五","六","日"]
                                    val = weekDay.indexOf(val)+1;
                                    if(num != t.vueObj.remindInfor.modelWeek.length -1){
                                        remindDay  += val+",";
                                    }else if(num == t.vueObj.remindInfor.modelWeek.length -1){
                                        remindDay  += val;
                                    }
                                })
                                break;
                            case "3":
                                remindDay = ""
                                $.each(t.vueObj.remindInfor.modelDay,function (num,val) {
                                    if(num != t.vueObj.remindInfor.modelDay.length -1){
                                        remindDay  += val+",";
                                    }else if(num == t.vueObj.remindInfor.modelDay.length -1){
                                        remindDay  += val;
                                    }
                                })
                                break;
                        }
                        var remindContent = "",
                            remindTime = "";
                        if(t.vueObj.remindInfor.remindSwitch){
                            remindContent = JSON.stringify(t.vueObj.remindInfor);
                            remindTime = t.vueObj.remindInfor.modelHour+":"+t.vueObj.remindInfor.modelMinute;
                        }
                        //否则从模板创建一个
                        new addReportSetting({
                            oMetadata:t.options.oMetadata
                            //新增要保存的数据
                            ,oFormEditData:{
                                name:t.vueObj.name
                                ,org_ids:t.vueObj.org_ids
                                ,org_names:t.vueObj.org_names
                                ,remark:t.vueObj.remark
                                ,status:"2" //发布状态
                                ,remindSwitch:t.vueObj.remindInfor.remindSwitch ? "1":"0"
                                ,remindType:remindType
                                ,remindTime:remindTime
                                ,remindContent:JSON.stringify(t.vueObj.remindInfor)
                                ,imContent:t.vueObj.remindInfor.imContent
                                ,remindDay:remindDay
                            }
                        });
                    },
                    autofocus: true
                });
            }else{
                aButton.unshift({
                    value: '确定',
                    callback: function () {
                        t.vueObj.saveData();
                        return false;
                    },
                    autofocus: true
                });
            }

            t.d = dialog({
                title:sActionStr + "汇报模板"
                ,content:sTpl
                ,button:aButton
            }).showModal();

            t.initVue();
            t.d.reset();
        }
        ,initVue:function () {
            var that = this;
            that.vueObj = new Vue({
                el:"#workflow_form_set"
                ,data:function () {
                    return {
                        form_id: '',
                        name: '',
                        form_state: '',
                        org_ids: '',
                        org_names: "全部",
                        remark: "",
                        uuid: "",
                        remindInfor:{
                            modelChoose:"每天",
                            modelWeek:[],
                            modelDay:[],
                            modelHour:"",
                            modelMinute:"",
                            weekShowContent:"",
                            dayShowContent:"",
                            remindSwitch:false,
                            imContent:"",
                        }
                    };
                }
                ,computed:{
                    showValueInput:function () {
                        var t = this;
                        return t.remindInfor.modelChoose ? t.remindInfor.modelChoose + t.remindInfor.weekShowContent+(t.remindInfor.dayShowContent ? t.remindInfor.dayShowContent + '日':'') + t.remindInfor.modelHour+':'+ t.remindInfor.modelMinute +"提醒" : "";
                    },
                    showValueInputBrief:function () {
                        var t = this;
                        var weekShowContentBrief = t.remindInfor.weekShowContent,
                            dayShowContentBrief = t.remindInfor.dayShowContent;
                        if(t.remindInfor.modelWeek.length > 3){
                            weekShowContentBrief = "";
                            for(var i = 0;i<3;i++){
                                if(i < 2){
                                    weekShowContentBrief += t.remindInfor.modelWeek[i] + ",";
                                }else{
                                    weekShowContentBrief += t.remindInfor.modelWeek[i] + "...";
                                }
                            }
                        }
                        if(t.remindInfor.modelDay.length > 3){
                            dayShowContentBrief = "";
                            for(var i = 0;i<3;i++){
                                if(i < 2){
                                    dayShowContentBrief += t.remindInfor.modelDay[i] + ",";
                                }else{
                                    dayShowContentBrief += t.remindInfor.modelDay[i] + "...";
                                }
                            }
                        }
                        return t.remindInfor.modelChoose ? t.remindInfor.modelChoose + weekShowContentBrief+(t.remindInfor.dayShowContent ? dayShowContentBrief + '日':'') + t.remindInfor.modelHour+':'+ t.remindInfor.modelMinute +"提醒" : "";
                    }
                }
                ,watch:{
                    "remindInfor":function () {
                        var t = this;
                    }
                }
                ,attached:function () {
                    var t = this;
                    //如果是编辑模式
                    if(that.options.editType == "edit"){
                        t.form_id = that.options.oFormEditData.form_id;
                        t.name = that.options.oFormEditData.name;
                        if(that.options.oFormEditData.form_state){
                            t.form_state = that.options.oFormEditData.form_state;
                        }
                        t.org_ids = that.options.oFormEditData.org_ids || "";
                        t.org_names = that.options.oFormEditData.org_names || "";
                        t.remark = that.options.oFormEditData.remark;
                        t.uuid = that.options.oFormEditData.uuid;
                        if(that.options.oFormEditData.reportRemind){ //汇报提醒参数
                            var remindInforData = JSON.parse(that.options.oFormEditData.reportRemind);
                            t.remindInfor = JSON.parse(remindInforData.remindContent);
                        }
                    }
                }
                ,methods:{
                    /**
                     * 选择组织列表
                     * */
                    selectOrgList:function () {
                        var t = this;
                        new orgSelect({
                            title:"适用范围选择"
                            ,data:t.org_ids.split(",")
                            ,callback:function (data) {
                                var arr = [];
                                var arrIds = [];
                                if(data.length){
                                    for(var i=0;i<data.length;i++){
                                        arr.push(data[i].name);
                                        arrIds.push(data[i].id);
                                    }
                                    t.org_names = arr.join("，");
                                    t.org_ids = arrIds.join(",");
                                }else{
                                    t.org_names = "全部";
                                    t.org_ids = "";
                                }
                            }
                        });
                    }
                    /**
                     * 验证表单数据
                     * */
                    ,checkform:function () {
                        var t =this;
                        if(!t.name){
                            tools.showMsg.error("请先填写表单名称");
                            $(t.$el).find("input[name='name']").focus();
                            return false;
                        }else{
                            return true;
                        }
                    }
                    /*
                    * 设置汇报提醒
                    * */
                    ,setReportRemind:function () {
                        var t = this;
                        new reportRemind({
                            formSet:t
                        });
                    }
                    /**
                     * 保存数据
                     * */
                    ,saveData:function () {
                        var t = this;
                        var sActionStr = that.options.editType=="add"?"新增":"修改";
                        var remindType,remindDay;
                        switch(t.remindInfor.modelChoose){
                            case "每天":
                                remindType = "1";
                                break;
                            case "每周":
                                remindType = "2";
                                break;
                            case "每月":
                                remindType = "3";
                                break;
                        }
                        switch(remindType){
                            case "1":
                                remindDay = "";
                                break;
                            case "2":
                                remindDay = ""
                                $.each(t.remindInfor.modelWeek,function (num,val){
                                    var weekDay = ["一","二","三","四","五","六","日"]
                                    val = weekDay.indexOf(val)+1;
                                    if(num != t.remindInfor.modelWeek.length -1){
                                        remindDay  += val+",";
                                    }else if(num == t.remindInfor.modelWeek.length -1){
                                        remindDay  += val;
                                    }
                                })
                                break;
                            case "3":
                                remindDay = ""
                                $.each(t.remindInfor.modelDay,function (num,val) {
                                    if(num != t.remindInfor.modelDay.length -1){
                                        remindDay  += val+",";
                                    }else if(num == t.remindInfor.modelDay.length -1){
                                        remindDay  += val;
                                    }
                                })
                                break;
                        }
                        var remindContent = "",
                            remindTime = "";
                        if(t.remindInfor.remindSwitch){
                            remindContent = JSON.stringify(t.remindInfor);
                            remindTime = t.remindInfor.modelHour+":"+t.remindInfor.modelMinute;
                        }
                        //拼接表单数据
                        var oPostData = {
                            infoSetId:that.options.oMetadata.options.infoSetId
                            ,dataList:[
                                {
                                    key:"name"
                                    ,value:t.name  //流程表单名称
                                }
                                ,{
                                    key:"org_ids"
                                    ,value:t.org_ids  //应用范围ID
                                }
                                ,{
                                    key:"org_names"
                                    ,value:t.org_names  //应用范围名称
                                }
                                ,{
                                    key:"remark"
                                    ,value:t.remark  //流程类型
                                }
                                ,{
                                    key:"remindSwitch"
                                    ,value:t.remindInfor.remindSwitch ? "1":"0"
                                }
                                ,{
                                    key:"remindType"
                                    ,value:remindType
                                }
                                ,{
                                    key:"remindTime"
                                    ,value:remindTime
                                }
                                ,{
                                    key:"remindContent"
                                    ,value:JSON.stringify(t.remindInfor)
                                }
                                ,{
                                    key:"imContent"
                                    ,value:t.remindInfor.imContent
                                }
                                ,{
                                    key:"remindDay"
                                    ,value:remindDay
                                }
                            ]
                        };

                        if(!t.checkform()){
                            return false;
                        }

                        if(that.options.editType == "edit"){
                            oPostData.uuid = t.uuid + "";
                            oPostData.dataList.push({
                                key:"form_id"
                                ,value:t.form_id + "" //表单ID
                            });
                        }

                        //保存数据
                        Ajax.ajax({
                            url:gMain.apiBasePath+(that.options.editType=="add"?"route/"+ oPostData.infoSetId+"/insert.do":"route/"+ oPostData.infoSetId +"/update.do"),
                            data:JSON.stringify(oPostData),
                            dataType:"json",
                            beforeSend:function () {
                                $("body").loading({zIndex:999999999}); //开启提交遮罩
                            },
                            complete:function () {
                                $("body").loading({state:false}); //关闭提交遮罩
                            },
                            success:function(data) {
                                if (data.result == "true") {
                                    tools.showMsg.ok(sActionStr + "成功"); //成功提示弹层
                                    that.d.close().remove();  //关闭并取消弹窗
                                    that.options.oMetadata.mmg.load();//重载表格数据
                                }
                            }
                        });
                    }
                    ,lastMethod:undefined // ++++++++++++++++++++++++++++++++++++++++ 最后一个方法 +++++++++++++++++++++++++++++++++++


                }
            });

        }

    });

    module.exports = modulesClass;
});
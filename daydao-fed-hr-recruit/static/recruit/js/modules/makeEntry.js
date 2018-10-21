/**
 * Created by plus on 2017/7/29.
 * 新增或编辑入职弹窗
 */

define(function (require,exports,module) {
    require("css/recruitEntry.css");

    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗
    require("commonStaticDirectory/plugins/layer/layer"); //弹窗
    require("commonStaticDirectory/plugins/jquery.loading");
    require("commonStaticDirectory/plugins/My97DatePicker/WdatePicker.js"); //日历组件
    //单选下拉框
    require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect.css");
    var dayhrDropSelect = require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect");
    //表单验证
    require("commonStaticDirectory/plugins/jquery.validator/jquery.validator.css");
    require("commonStaticDirectory/plugins/jquery.validator/jquery.validator");
    require("commonStaticDirectory/plugins/jquery.validator/local/zh_CN.js");

    var showDialog = function () {
        this.init.apply(this,arguments);
    };
    showDialog.prototype={
        constructor: showDialog
        ,options:{}
        ,init:function (options) {
            var t = this;
            t.status = true;
            $.extend(t.options,options);
            switch (t.options.type){
                case "work":
                    t.initDialogWork();/*工作经历*/
                    break;
                case "edu":
                    t.initDialogEdu();/*教育经历*/
                    break;
                case "language":
                    t.initDialogLan();/*语言能力*/
                    break;
                case "pro":
                    t.initDialogPro();/*专业技术资格*/
                    break;
                case "pos":
                    t.initDialogPos();/*职业*/
                    break;
                case "res":
                    t.initDialogRes();/*社会关系*/
                    break;
                default:
            }
        },
        /*公共执行部分*/
        commonFn:function () {
            var t = this;
            t.validatorFields = {};
            for (var i =0;i<t.aFormData.length;i++){
                var item = t.aFormData[i];
                //如果是必填字段
                if(item.isMust){
                    t.validatorFields[item.name] = {
                        rule: 'required;',
                        msg: {
                            required:"不能为空"
                        }
                    };
                }
            }
            if(t.options.Item != "") {
                t.d = dialog({
                    width: '400px'
                    , title: "编辑"
                    , content: '<div id="makeEntryMain"><form id="makeEntry"></form></div>'
                    , okValue: '保存'
                    , ok: function () {
                        $('#makeEntryMain').find("form:first").trigger("validate"); //触发表单验证
                        return false;
                    }
                    , cancelValue: '取消'
                    , cancel: function () {
                    }
                });
            }else{
                t.d = dialog({
                    width: '400px'
                    , title: "新增"
                    , content: '<div id="makeEntryMain"><form id="makeEntry"></form></div>'
                    ,button:[
                        {
                            value: '保存并继续新增',
                            callback: function () {
                                t.status = false;
                                $('#makeEntryMain').find("form:first").trigger("validate"); //触发表单验证
                                return false;
                            }
                        },
                        {
                            value: '保存',
                            callback: function () {
                                t.status = true;
                                $('#makeEntryMain').find("form:first").trigger("validate"); //触发表单验证
                                return false;
                            },
                            autofocus: true
                        },
                        {
                            value: '取消'
                        }
                    ]
                });

            }

        },
        initDialogWork:function () {
            var t = this;
            t.aFormData = [
                {name:"date_from",label:"开始日期",type:"date",value:t.options.Item.date_from,isMust:true}
                ,{name:"date_to",label: "结束日期",type:"date",value:t.options.Item.date_to,isMust:true}
                ,{name:"company",label: "公司名称",type:"text",value:t.options.Item.company,isMust:true}
                ,{name:"job",label: "任职情况",type:"text",value:t.options.Item.job,isMust:true}
                ,{name:"desc",label: "工作职责",type:"text",value:t.options.Item.desc,isMust:true}

            ];
            t.commonFn();
            t.saveData();

        },
        initDialogEdu:function () {
            var t = this;
            t.aFormData = [
                {name:"begin_date",label:"开始日期",type:"date",value:t.options.Item.begin_date,isMust:true}
                ,{name:"end_date",label: "结束日期",type:"date",value:t.options.Item.end_date,isMust:true}
                ,{name:"school",label: "学校",type:"treeSelect",value:t.options.Item.school,isMust:true,keyValueBean:{infoSetId:"ct_324",isDateFilter:false,keyId:"code_id",valueId:"code_name",parentId:"parent_id"}}
                ,{name:"major",label: "专业",type:"treeSelect",value:t.options.Item.major,isMust:true,keyValueBean:{infoSetId:"ct_322",isDateFilter:false,keyId:"code_id",valueId:"code_name",parentId:"parent_id"}}
                ,{name:"educational_level",label: "学历",type:"treeSelect",value:t.options.Item.educational_level,isMust:true,keyValueBean:{infoSetId:"ct_321",isDateFilter:false,keyId:"code_id",valueId:"code_name"}}
                ,{name:"degree",label: "学位",type:"treeSelect",value:t.options.Item.degree,isMust:true,keyValueBean:{infoSetId:"ct_320",isDateFilter:false,keyId:"code_id",valueId:"code_name",parentId:"parent_id"}}
                ,{name:"education_type",label: "教育类型",type:"treeSelect",value:t.options.Item.education_type,isMust:true,keyValueBean:{infoSetId:"ct_325",isDateFilter:false,keyId:"code_id",valueId:"code_name"}}

            ];
            t.commonFn();
            t.getDropSelectData();
        },
        initDialogLan:function () {
            var t = this;
            t.aFormData = [
                {name:"language_id",label: "语言",type:"text",value:t.options.Item.language_id,isMust:true}
                ,{name:"language_level",label: "等级",type:"text",value:t.options.Item.language_level,isMust:true}
            ];
            t.commonFn();
            t.saveData();
        },
        initDialogPro:function(){
            var t = this;
            t.aFormData = [
                {name:"tech_name",label: "资格名称",type:"treeSelect",value:t.options.Item.tech_name,isMust:true,keyValueBean:{infoSetId:"ct_331",isDateFilter:false,keyId:"code_id",valueId:"code_name",parentId:"parent_id"}}
                ,{name:"tech_level",label: "资格等级",type:"text",value:t.options.Item.tech_level,isMust:true}
                ,{name:"tech_number",label: "资格编号",type:"text",value:t.options.Item.tech_number,isMust:true}
                ,{name:"acqure_date",label: "获得日期",type:"date",value:t.options.Item.acqure_date,isMust:true}
                ,{name:"regist_unit",label: "注册单位",type:"text",value:t.options.Item.regist_unit,isMust:true}
            ];
            t.commonFn();
            t.getDropSelectData();
        },
        initDialogPos:function () {
            var t = this;
            t.aFormData = [
                {name:"acqure_date",label: "获得日期",type:"date",value:t.options.Item.acqure_date,isMust:true}
                ,{name:"register_unit",label: "注册单位",type:"text",value:t.options.Item.register_unit,isMust:true}
                ,{name:"award_unit",label: "颁发单位",type:"text",value:t.options.Item.award_unit,isMust:true}
                ,{name:"license_id",label: "证书名称",type:"treeSelect",value:t.options.Item.license_id,isMust:true,keyValueBean:{infoSetId:"ct_333",isDateFilter:false,keyId:"code_id",valueId:"code_name"}}
                ,{name:"license_number",label: "证书编号",type:"text",value:t.options.Item.license_number,isMust:true}
                ,{name:"desc",label: "描述说明",type:"text",value:t.options.Item.desc,isMust:true}

            ];
            t.commonFn();
            t.getDropSelectData();
        },
        initDialogRes:function () {
            var t = this;
            t.aFormData = [
                 {name:"name",label: "关系人姓名",type:"text",value:t.options.Item.name,isMust:true}
                ,{name:"relation_id",label: "与本人关系",type:"treeSelect",value:t.options.Item.relation_id,isMust:true,keyValueBean:{infoSetId:"ct_309",isDateFilter:false,keyId:"code_id",valueId:"code_name",parentId:"parent_id"}}
                ,{name:"phone",label: "联系电话",type:"text",value:t.options.Item.phone,isMust:true}
                ,{name:"address",label: "联系地址",type:"text",value:t.options.Item.address,isMust:true}
                ,{name:"company",label: "工作单位",type:"text",value:t.options.Item.company,isMust:true}
                ,{name:"job",label: "职务",type:"text",value:t.options.Item.job,isMust:true}

            ];
            t.commonFn();
            t.getDropSelectData();
        },
        saveData:function () {
            var t = this;
            var $form = $("#makeEntry");

            require.async("commonStaticDirectory/plugins/autoForm/autoForm",function(AutoForm){
                var form1 = new AutoForm({
                    id:"makeEntry",
                    data:t.aFormData,
                    minHeight:50,
                    showRow:1,
                    //加载完成
                    formComplete:function($form){
                        t.$form = $form;
                        t.d.showModal();
                        $("#recruitEntry").loading({state:false}); //关闭遮罩
                    }
                });
                $form.validator({
                    theme: "yellow_right",
                    timely:0, // 保存的时候验证
                    focusCleanup:true,
                    stopOnError:true,
                    //待验证字段集合
                    fields: t.validatorFields,
                    valid:function(form) {
                        //表单验证通
                        $("body").loading({zIndex:999}) //启用loading遮罩
                        switch (t.options.type){
                            case "work":
                                t.saveWork();/*工作经历*/
                                break;
                            case "edu":
                                t.saveEdu();/*教育经历*/
                                break;
                            case "language":
                                t.saveLan();/*语言能力*/
                                break;
                            case "pro":
                                t.savePro();/*专业技术资格*/
                                break;
                            case "pos":
                                t.savePos();/*职业*/
                                break;
                            case "res":
                                t.saveRes();/*社会关系*/
                                break;
                            default:
                        }
                    }
                });
            });
        },
        saveWork:function(){
            var t = this;
            var $form = $("#makeEntry");
            if(t.options.Item == ""){
                var oData = {
                    person_id:t.options.entryId,
                    date_from:$form.find("input[name=date_from]").val(),
                    date_to:$form.find("input[name=date_to]").val(),
                    company:$form.find("input[name=company]").val(),
                    job:$form.find("input[name=job]").val(),
                    desc:$form.find("input[name=desc]").val(),
                }
            }else{
                var oData = {
                    uuid:t.options.Item.uuid,
                    date_from:$form.find("input[name=date_from]").val(),
                    date_to:$form.find("input[name=date_to]").val(),
                    company:$form.find("input[name=company]").val(),
                    job:$form.find("input[name=job]").val(),
                    desc:$form.find("input[name=desc]").val(),
                }
            }
            Ajax.ApiTools().orgPersonWork({
                data: oData,
                success: function (data) {
                    if (data.result == "true") {
                        if(t.options.Item == "") {
                            t.options.$that.workListData.push({
                                uuid:data.data.uuid,
                                date_from:$form.find("input[name=date_from]").val(),
                                date_to:$form.find("input[name=date_to]").val(),
                                company:$form.find("input[name=company]").val(),
                                job:$form.find("input[name=job]").val(),
                                desc:$form.find("input[name=desc]").val()
                            });
                        }else{
                            var arr = [];
                            for(var i = 0;i<t.options.$that.workListData.length;i++){
                                var oArr = $.extend({},t.options.$that.workListData[i]);
                                   if(t.options.Item.uuid == t.options.$that.workListData[i].uuid){
                                       oArr = {
                                           uuid:t.options.Item.uuid,
                                           date_from:$form.find("input[name=date_from]").val(),
                                           date_to:$form.find("input[name=date_to]").val(),
                                           company:$form.find("input[name=company]").val(),
                                           job:$form.find("input[name=job]").val(),
                                           desc:$form.find("input[name=desc]").val(),
                                       }
                                   }
                                arr.push(oArr);
                            }
                            t.options.$that.workListData = arr;
                        }
                        t.d.remove();
                        $("body").loading({state:false}); //关闭遮罩
                        t.reDialog();
                        tools.showMsg.ok("保存成功!");
                    }
                }
            });
        },
        saveEdu:function () {
            var t = this;
            var $form = $("#makeEntry");
            if(t.options.Item == ""){
                var oData = {
                    person_id:t.options.entryId,
                    begin_date:$form.find("input[name=begin_date]").val(),
                    end_date:$form.find("input[name=end_date]").val(),
                    school:$form.find("input[name=school]").val()==""?'':$form.find("input[name=school]").prev().attr("title"),
                    major:$form.find("input[name=major]").val()==""?'':$form.find("input[name=major]").prev().attr("title"),
                    educational_level:$form.find("input[name=educational_level]").val(),
                    degree:$form.find("input[name=degree]").val(),
                    education_type:$form.find("input[name=education_type]").val()
                }
            }else{
                var oData = {
                    uuid:t.options.Item.uuid,
                    begin_date:$form.find("input[name=begin_date]").val(),
                    end_date:$form.find("input[name=end_date]").val(),
                    school:$form.find("input[name=school]").val()==""?'':$form.find("input[name=school]").prev().attr("title"),
                    major:$form.find("input[name=major]").val()==""?'':$form.find("input[name=major]").prev().attr("title"),
                    educational_level:$form.find("input[name=educational_level]").val(),
                    degree:$form.find("input[name=degree]").val(),
                    education_type:$form.find("input[name=education_type]").val()
                }
            }
            Ajax.ApiTools().orgPersonEdu({
                data: oData,
                success: function (data) {
                    if (data.result == "true") {
                        if(t.options.Item == "") {
                            t.options.$that.eduListData.push({
                                uuid:data.data.uuid,
                                begin_date:$form.find("input[name=begin_date]").val(),
                                end_date:$form.find("input[name=end_date]").val(),
                                school:$form.find("input[name=school]").val()==""?'':$form.find("input[name=school]").prev().attr("title"),
                                major:$form.find("input[name=major]").val()==""?'':$form.find("input[name=major]").prev().attr("title"),
                                educational_level:$form.find("input[name=educational_level]").val(),
                                educational_level_name:$form.find("input[name=educational_level]").val()==""?'':$form.find("input[name=educational_level]").prev().attr("title"),
                                degree:$form.find("input[name=degree]").val(),
                                degree_name:$form.find("input[name=degree]").val()==""?'':$form.find("input[name=degree]").prev().attr("title"),
                                education_type:$form.find("input[name=education_type]").val(),
                                education_type_name:$form.find("input[name=education_type]").val()==""?'':$form.find("input[name=education_type]").prev().attr("title")
                            });
                        }else{
                            var arr = [];
                            for(var i = 0;i<t.options.$that.eduListData.length;i++){
                                var oArr = $.extend({},t.options.$that.eduListData[i]);
                                if(t.options.Item.uuid == t.options.$that.eduListData[i].uuid){
                                    oArr = {
                                        uuid:t.options.Item.uuid,
                                        begin_date:$form.find("input[name=begin_date]").val(),
                                        end_date:$form.find("input[name=end_date]").val(),
                                        school:$form.find("input[name=school]").val()==""?'':$form.find("input[name=school]").prev().attr("title"),
                                        major:$form.find("input[name=major]").val()==""?'':$form.find("input[name=major]").prev().attr("title"),
                                        educational_level:$form.find("input[name=educational_level]").val(),
                                        educational_level_name:$form.find("input[name=educational_level]").val()==""?'':$form.find("input[name=educational_level]").prev().attr("title"),
                                        degree:$form.find("input[name=degree]").val(),
                                        degree_name:$form.find("input[name=degree]").val()==""?'':$form.find("input[name=degree]").prev().attr("title"),
                                        education_type:$form.find("input[name=education_type]").val(),
                                        education_type_name:$form.find("input[name=education_type]").val()==""?'':$form.find("input[name=education_type]").prev().attr("title")
                                    }
                                }
                                arr.push(oArr);
                            }
                            t.options.$that.eduListData = arr;
                        }
                        t.d.remove();
                        $("body").loading({state:false}); //关闭遮罩
                        t.reDialog();
                        tools.showMsg.ok("保存成功!");
                    }
                }
            });
        },
        saveLan:function () {
            var t = this;
            var $form = $("#makeEntry");
            if(t.options.Item == ""){
                var oData = {
                    person_id:t.options.entryId,
                    language_id:$form.find("input[name=language_id]").val(),
                    language_level:$form.find("input[name=language_level]").val()
                }
            }else{
                var oData = {
                    uuid:t.options.Item.uuid,
                    language_id:$form.find("input[name=language_id]").val(),
                    language_level:$form.find("input[name=language_level]").val()
                }
            }
            Ajax.ApiTools().orgPersonLanguage({
                data: oData,
                success: function (data) {
                    if (data.result == "true") {
                        if(t.options.Item == "") {
                            t.options.$that.lanListData.push({
                                uuid:data.data.uuid,
                                language_id:$form.find("input[name=language_id]").val(),
                                language_level:$form.find("input[name=language_level]").val()
                            });
                        }else{
                            var arr = [];
                            for(var i = 0;i<t.options.$that.lanListData.length;i++){
                                var oArr = $.extend({},t.options.$that.lanListData[i]);
                                if(t.options.Item.uuid == t.options.$that.lanListData[i].uuid){
                                    oArr = {
                                        uuid:t.options.Item.uuid,
                                        language_id:$form.find("input[name=language_id]").val(),
                                        language_level:$form.find("input[name=language_level]").val()
                                    }
                                }
                                arr.push(oArr);
                            }
                            t.options.$that.lanListData = arr;
                        }
                        t.d.remove();
                        $("body").loading({state:false}); //关闭遮罩
                        t.reDialog();
                        tools.showMsg.ok("保存成功!");
                    }
                }
            });
        },
        savePro:function () {
            var t = this;
            var $form = $("#makeEntry");
            if(t.options.Item == ""){
                var oData = {
                    person_id:t.options.entryId,
                    tech_name:$form.find("input[name=tech_name]").val(),
                    tech_level:$form.find("input[name=tech_level]").val(),
                    tech_number:$form.find("input[name=tech_number]").val(),
                    acqure_date:$form.find("input[name=acqure_date]").val(),
                    regist_unit:$form.find("input[name=regist_unit]").val(),
                }
            }else{
                var oData = {
                    uuid:t.options.Item.uuid,
                    tech_name:$form.find("input[name=tech_name]").val(),
                    tech_level:$form.find("input[name=tech_level]").val(),
                    tech_number:$form.find("input[name=tech_number]").val(),
                    acqure_date:$form.find("input[name=acqure_date]").val(),
                    regist_unit:$form.find("input[name=regist_unit]").val(),
                }
            }
            Ajax.ApiTools().orgPersonExpertise({
                data: oData,
                success: function (data) {
                    if (data.result == "true") {
                        if(t.options.Item == "") {
                            t.options.$that.proListData.push({
                                uuid:data.data.uuid,
                                tech_name:$form.find("input[name=tech_name]").val(),
                                tech_name_name:$form.find("input[name=tech_name]").val()==""?'':$form.find("input[name=tech_name]").prev().attr("title"),
                                tech_level:$form.find("input[name=tech_level]").val(),
                                tech_number:$form.find("input[name=tech_number]").val(),
                                acqure_date:$form.find("input[name=acqure_date]").val(),
                                regist_unit:$form.find("input[name=regist_unit]").val()
                            });
                        }else{
                            var arr = [];
                            for(var i = 0;i<t.options.$that.proListData.length;i++){
                                var oArr = $.extend({},t.options.$that.proListData[i]);
                                if(t.options.Item.uuid == t.options.$that.proListData[i].uuid){
                                    oArr = {
                                        uuid:t.options.Item.uuid,
                                        tech_name:$form.find("input[name=tech_name]").val(),
                                        tech_name_name:$form.find("input[name=tech_name]").val()==""?'':$form.find("input[name=tech_name]").prev().attr("title"),
                                        tech_level:$form.find("input[name=tech_level]").val(),
                                        tech_number:$form.find("input[name=tech_number]").val(),
                                        acqure_date:$form.find("input[name=acqure_date]").val(),
                                        regist_unit:$form.find("input[name=regist_unit]").val()
                                    }
                                }
                                arr.push(oArr);
                            }
                            t.options.$that.proListData = arr;
                        }
                        t.d.remove();
                        $("body").loading({state:false}); //关闭遮罩
                        t.reDialog();
                        tools.showMsg.ok("保存成功!");
                    }
                }
            });
        },
        savePos:function () {
            var t = this;
            var $form = $("#makeEntry");
            if(t.options.Item == ""){
                var oData = {
                    person_id:t.options.entryId,
                    acqure_date:$form.find("input[name=acqure_date]").val(),
                    register_unit:$form.find("input[name=register_unit]").val(),
                    award_unit:$form.find("input[name=award_unit]").val(),
                    license_id:$form.find("input[name=license_id]").val(),
                    license_number:$form.find("input[name=license_number]").val(),
                    desc:$form.find("input[name=desc]").val()
                }
            }else{
                var oData = {
                    uuid:t.options.Item.uuid,
                    acqure_date:$form.find("input[name=acqure_date]").val(),
                    register_unit:$form.find("input[name=register_unit]").val(),
                    award_unit:$form.find("input[name=award_unit]").val(),
                    license_id:$form.find("input[name=license_id]").val(),
                    license_number:$form.find("input[name=license_number]").val(),
                    desc:$form.find("input[name=desc]").val()
                }
            }
            Ajax.ApiTools().orgPersonLicensing({
                data: oData,
                success: function (data) {
                    if (data.result == "true") {
                        if(t.options.Item == "") {
                            t.options.$that.posListData.push({
                                uuid:data.data.uuid,
                                acqure_date:$form.find("input[name=acqure_date]").val(),
                                register_unit:$form.find("input[name=register_unit]").val(),
                                award_unit:$form.find("input[name=award_unit]").val(),
                                license_id:$form.find("input[name=license_id]").val(),
                                license_number:$form.find("input[name=license_number]").val(),
                                desc:$form.find("input[name=desc]").val(),
                                license_id_name:$form.find("input[name=license_id]").val()==""?'':$form.find("input[name=license_id]").prev().attr("title")
                            });
                        }else{
                            var arr = [];
                            for(var i = 0;i<t.options.$that.posListData.length;i++){
                                var oArr = $.extend({},t.options.$that.posListData[i]);
                                if(t.options.Item.uuid == t.options.$that.posListData[i].uuid){
                                    oArr = {
                                        uuid:t.options.Item.uuid,
                                        acqure_date:$form.find("input[name=acqure_date]").val(),
                                        register_unit:$form.find("input[name=register_unit]").val(),
                                        award_unit:$form.find("input[name=award_unit]").val(),
                                        license_id:$form.find("input[name=license_id]").val(),
                                        license_number:$form.find("input[name=license_number]").val(),
                                        desc:$form.find("input[name=desc]").val(),
                                        license_id_name:$form.find("input[name=license_id]").val()==""?'':$form.find("input[name=license_id]").prev().attr("title")
                                    }
                                }
                                arr.push(oArr);
                            }
                            t.options.$that.posListData = arr;
                        }
                        t.d.remove();
                        $("body").loading({state:false}); //关闭遮罩
                        t.reDialog();
                        tools.showMsg.ok("保存成功!");
                    }
                }
            });
        },
        saveRes:function () {
            var t = this;
            var $form = $("#makeEntry");
            if(t.options.Item == ""){
                var oData = {
                    person_id:t.options.entryId,
                    name:$form.find("input[name=name]").val(),
                    relation_id:$form.find("input[name=relation_id]").val(),
                    phone:$form.find("input[name=phone]").val(),
                    address:$form.find("input[name=address]").val(),
                    company:$form.find("input[name=company]").val(),
                    job:$form.find("input[name=job]").val()
                }
            }else{
                var oData = {
                    uuid:t.options.Item.uuid,
                    name:$form.find("input[name=name]").val(),
                    relation_id:$form.find("input[name=relation_id]").val(),
                    phone:$form.find("input[name=phone]").val(),
                    address:$form.find("input[name=address]").val(),
                    company:$form.find("input[name=company]").val(),
                    job:$form.find("input[name=job]").val()
                }
            }
            Ajax.ApiTools().orgPersonRelation({
                data: oData,
                success: function (data) {
                    if (data.result == "true") {
                        if(t.options.Item == "") {
                            t.options.$that.resListData.push({
                                uuid:data.data.uuid,
                                name:$form.find("input[name=name]").val(),
                                relation_id:$form.find("input[name=relation_id]").val(),
                                phone:$form.find("input[name=phone]").val(),
                                address:$form.find("input[name=address]").val(),
                                company:$form.find("input[name=company]").val(),
                                job:$form.find("input[name=job]").val(),
                                relation_id_name:$form.find("input[name=relation_id]").val()==""?'':$form.find("input[name=relation_id]").prev().attr("title")
                            });
                        }else{
                            var arr = [];
                            for(var i = 0;i<t.options.$that.resListData.length;i++){
                                var oArr = $.extend({},t.options.$that.resListData[i]);
                                if(t.options.Item.uuid == t.options.$that.resListData[i].uuid){
                                    oArr = {
                                        uuid:t.options.Item.uuid,
                                        name:$form.find("input[name=name]").val(),
                                        relation_id:$form.find("input[name=relation_id]").val(),
                                        phone:$form.find("input[name=phone]").val(),
                                        address:$form.find("input[name=address]").val(),
                                        company:$form.find("input[name=company]").val(),
                                        job:$form.find("input[name=job]").val(),
                                        license_id_name:$form.find("input[name=relation_id]").val()==""?'':$form.find("input[name=relation_id]").prev().attr("title")
                                    }
                                }
                                arr.push(oArr);
                            }
                            t.options.$that.resListData = arr;
                        }
                        t.d.remove();
                        $("body").loading({state:false}); //关闭遮罩
                        t.reDialog();
                        tools.showMsg.ok("保存成功!");
                    }
                }
            });
        },
        reDialog:function () {
            var t = this;
            if(t.status == false) {
                switch (t.options.type){
                    case "work":
                        t.initDialogWork();/*工作经历*/
                        break;
                    case "edu":
                        t.initDialogEdu();/*教育经历*/
                        break;
                    case "language":
                        t.initDialogLan();/*语言能力*/
                        break;
                    case "pro":
                        t.initDialogPro();/*专业技术资格*/
                        break;
                    case "pos":
                        t.initDialogPos();/*职业*/
                        break;
                    case "res":
                        t.initDialogRes();/*社会关系*/
                        break;
                    default:
                }
            }
        },
        getDropSelectData:function () {
            var t = this;
            var aFormObj = t.aFormData;
            var iIndex = 0; //开始处理的表单的索引
            function setFormPlugins() {
                //处理特殊表单项完毕，开始初始化表单了
                if(iIndex == aFormObj.length){
                    $("#recruitEntry").loading({state:false}); //关闭遮罩
                    t.saveData();
                    return;
                }
                //如果有特殊表单项要处理
                if(aFormObj.length){
                    if(aFormObj[iIndex].type == "treeSelect"){
                        Ajax.ApiTools().getKeyValueData({
                            data:aFormObj[iIndex].keyValueBean,
                            success:function(data){
                                //如果是tree
                                if(data.beans && data.beans.length){
                                    aFormObj[iIndex].type = "treeSelect"; //控件的类型
                                    aFormObj[iIndex].treeJsonArr = data.beans; //控件的备选值
                                    var _valueOrKey = aFormObj[iIndex].value; //key或value都匹配
                                    //修改的时候选中下拉框的值
                                    var setEditDefVal = function(arr){
                                        for(var i=0;i<arr.length;i++){
                                            if(arr[i].id == _valueOrKey || arr[i].name == _valueOrKey){
                                                aFormObj[iIndex].value = arr[i].id;
                                            }
                                            if(arr[i].children && arr[i].children.length){
                                                setEditDefVal(arr[i].children);
                                            }
                                        }
                                    };

                                    setEditDefVal(data.beans);
                                }

                                //成功才继续处理
                                iIndex++;
                                setFormPlugins();
                            }
                        });
                    }else{
                        //不是特殊表单项就跳过直接继续处理
                        iIndex++;
                        setFormPlugins();
                    }
                }
            }
            $("#recruitEntry").loading({zIndex:999}) //启用loading遮罩
            //特殊插件的表单项处理
            setFormPlugins();
        },

    };

    module.exports = showDialog;
});

/**
 * 流程编辑弹窗
 * @options.el  String 必填
 * @options.oMetadata
 * @options.editType
 * @options.oFormEditData
 */

define(function(require, exports, module) {
    require("js/modules/workflowSetting/workflowSetting.css");
    var sTpl = require("js/modules/workflowSetting/workflowSetting.html");

    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");

    var tools = require("commonStaticDirectory/plugins/tools"); //工具函数集
    var Ajax = require("js/ajax");
    var AuditSelect = require("js/modules/auditSelect/auditSelect.js"); //添加审批人组件
    require("commonStaticDirectory/plugins/underscore.min.js");

    var dayhrDropSelect = require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");
    require("commonStaticDirectory/plugins/underscore.min.js");
    var tools = require("commonStaticDirectory/plugins/tools.js");
    require("commonStaticDirectory/plugins/bootstrap-switch/bootstrap-switch.css");
    require("commonStaticDirectory/plugins/bootstrap-switch/bootstrap-switch");

    var previewAudit = function () {
        this.init.apply(this,arguments);
    };
    $.extend(previewAudit.prototype,{
        options:{
            type:"preview"  //类型：preview（预览）/start（发起）
        }
        ,init:function (options) {
            var t = this;
            t.options = $.extend({}, t.options, options);
            console.log(t.options.data)
            t.initDialog();
        }
        ,initDialog:function () {
            var t = this;
            var d = dialog({
                title:"汇报发起（"+t.options.data.name+"）"
                ,button:t.options.type=="start"?[
                        {
                            value:"提交"
                            ,callback:function () {
                            $('#report_previewAudit').trigger("validate"); //触发表单验证
                            t.oFormValidForm.submitForm(false);
                            return false;
                        }
                            ,autofocus:true
                        }
                        ,{
                            value:"存草稿"
                            ,callback:function () {
                                $('#report_previewAudit').trigger("validate"); //触发表单验证
                                t.oFormValidForm.saveDraft(false);
                                return false;

                            }
                        }
                        ,{
                            value:"取消"
                            ,callback:function () {

                            }

                        }
                    ]:[
                        {
                            value:"确定"
                            ,callback:function () {

                        }
                            ,autofocus:true
                        }
                    ]
                ,content:sTpl
            });
            t.d = d;
            d.showModal();
            t.initVue();
        }
        ,initVue:function () {
            var that = this;
            that.vuePreviewAudit = new Vue({
                el:"report_setting_wrap"
                ,data:{
                    gMain:gMain
                    ,aFields:[]  //表单项
                    ,auditPersonList:[]  //审批人列表数据
                    ,processCc:[] //抄送人列表数据
                    ,isShowMoreProcessCc:false
                    ,isShowAuditPerson:true  //是否显示审批人和抄送人
                    ,reportFirst:false
                    ,reporters:[
                        {
                            inforTitle:"部门"
                            ,inforContent:"研发部"
                        }
                        ,
                        {
                            inforTitle:"提交人"
                            ,inforContent:"张三"
                        }
                        ,
                        {
                            inforTitle:"提交时间"
                            ,inforContent:"2016-10-1"
                        }
                        ,
                    ]
                    ,auditInfo:{

                    }
                    ,loop_typename:{"1":"上级循环","2":"直属上级","3":"自由节点"}
                    ,is_auto_audit:false  //是否自动审批
                    ,is_auto_audit_readonly:false //是否自动审批按钮的只读属性
                    //审批人节点列表
                    ,auditDataList: [
                        {
                            node_number : "1",
                            dataType:"pos",
                            audit_pos_id : "111",
                            audit_pos_name : "发起人",
                            audit_person_id : "",
                            audit_person_name : "", //审批人名称
                            audit_person_img : "", //头像
                            audit_loop : {
                                "loop_type" : "",
                                "not_contain" : [],
                                "cut_off" : ""
                            },
                            field_permissions : [],  //发起人、审批人的字段权限：json格式数据
                            process_cc : [],  //抄送人
                            /*抄送人的值的格式
                             *{
                             "person_id" : "001",
                             "person_name" : "张三",
                             "person_img":""
                             }, {
                             "person_id" : "002",
                             "person_name" : "李四",
                             "person_img":""
                             }, {
                             "person_id" : "003",
                             "person_name" : "王五",
                             "person_img":""
                             }
                             * */
                            is_auto_audit:false,
                            process_cc_field_permissions : []// 抄送人字段权限：json格式数据
                        }
                    ]
                }
                ,beforeCompile:function () {
                    var t = this;
                    t.auditInfo = t.auditDataList[0];
                }
                ,watch:{
                    "aFields":function () {
                        var t = this;
                        //改变了表单项目，重新验证
                        t.validateForm();
                    }
                    ,'is_auto_audit': function (val, oldVal) {
                        var t = this;
                        t.auditInfo.is_auto_audit = val;
                        $("#is_auto_audit").bootstrapSwitch("state",val);
                        t.updateAuditDataList();
                    }
                }
                /**
                 * 模板编译完成要执行的
                 * */
                ,attached:function () {
                    var t = this;
                    $("#report_previewAudit").loading(); //开启查询遮罩
                    //发起
                    if(that.options.type == "start"){
                        //获取表单json,审批人信息,审批节点json
                        $.when(t.getStyleForMongo()).done(function () {
                            $("#report_previewAudit").loading({state:false}); //关闭查询遮罩
                            t.validateForm();
                        });
                    }else{ //预览
                        //获取表单json
                        $.when(t.getStyleForMongo()).done(function () {
                            $("#report_previewAudit").loading({state:false}); //关闭查询遮罩
                        });
                    }
                }
                ,methods:{
                    /**
                     * 获取表单json
                     * */
                    getStyleForMongo:function () {
                        var t = this;
                        var df = $.Deferred();
                        //获取表单json
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrReportTemp/getFormStyleForMongo.do"
                            ,data:JSON.stringify({id:that.options.data.formId.toString() ,mongoSymbol:"formStyle_table"})
                            ,complete:function () {
                                df.resolve();
                            }
                            ,error:function (err) {

                            }
                            ,success:function (data) {
                                if(data.result == "true" && data.data){

                                    var aFields = JSON.parse(data.data).fields;
                                    t.aFields = aFields;
                                    setTimeout(function () {
                                        that.d.reset();
                                    },100);
                                }
                            }
                        });
                        return df;
                    }
                    /**
                     * 获取流程json
                     * */
                    ,getAuditPerson:function () {
                        var t = this;
                        var df = $.Deferred();
                        //查询审批人
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrOrgPerson/getPersonListByOrgId.do"
                            ,data:JSON.stringify({orgId:String(that.options.data.orgIds)})
                            ,complete:function () {
                                df.resolve();
                            }
                            ,success:function (data) {
                                if(data.result == "true"){
                                    if($.isArray(data.auditPersonList)){
                                        t.auditPersonList = data.auditPersonList;
                                    }
                                    if($.isArray(data.processCc)){
                                        t.processCc = data.processCc;
                                    }
                                }
                            }
                        });
                        return df;
                    }
                    /**
                     * 获取流程节点json,主要是用来做字段权限用
                     * */
                    ,getAuditJsonFromMongo:function () {
                        var t = this;
                        var df = $.Deferred();
                        //获取表单json
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrReportTemp/getFormStyleForMongo.do"
                            ,data:JSON.stringify({id:String(that.options.data.formId) ,mongoSymbol:"formStyle_table"})
                            ,complete:function () {
                                df.resolve();
                            }
                            ,success:function (data) {
                                if(data.result == "true" && data.data){

                                }
                            }
                        });
                        return df;
                    }
                    /**
                     * 表单验证
                     * */
                    ,validateForm:function () {
                        var t = this;
                        var aRules = [];
                        var setValidate = function(arr) {
                            if(!$.isArray(arr) || !arr.length){
                                return;
                            }
                            for(var i=0;i<arr.length;i++){
                                var item = arr[i];
                                if(item.required == "true" || item.field_type == "group" || item.field_type == "twoColumns" || item.field_type == "threeColumns"){
                                    switch (item.field_type){
                                        case "file":
                                            aRules.push({
                                                ele:"[name='"+item.field_name+"']",
                                                datatype:"isEmplyFile",
                                                nullmsg:item.label + "不能为空",
                                                errormsg:item.label + "格式有误"
                                            });
                                            break;
                                        case "pic":
                                            aRules.push({
                                                ele:"[name='"+item.field_name+"']",
                                                datatype:"isEmplyPic",
                                                nullmsg:item.label + "不能为空",
                                                errormsg:item.label + "格式有误"
                                            });
                                            break;
                                        case "text":
                                        case "paragraph":
                                        case "date":
                                        case "number":
                                            aRules.push({
                                                ele:"[name='"+item.field_name+"']",
                                                datatype:"*",
                                                nullmsg:item.label + "不能为空",
                                                errormsg:item.label + "格式有误"
                                            });
                                            break;
                                        case "datearea":
                                            aRules.push({
                                                ele:"[name='"+item.field_name+"']",
                                                datatype:"isEmplyDatearea",
                                                nullmsg:"开始、结束时间不能为空",
                                                errormsg:"开始、结束时间格式有误"
                                            });
                                            break;
                                        case "checkboxes":
                                        case "radio":
                                            aRules.push({
                                                ele:"[name='"+item.field_name+"']",
                                                datatype:"isEmplyCheckboxRadio",
                                                nullmsg:item.label + "不能为空",
                                                errormsg:item.label + "不能为空"
                                            });
                                            break;
                                        case "twoColumns":
                                            setValidate(item.firstCol.fields);
                                            setValidate(item.secondCol.fields);
                                            break;
                                        case "threeColumns":
                                            setValidate(item.firstCol.fields);
                                            setValidate(item.secondCol.fields);
                                            setValidate(item.thirdCol.fields);
                                            break;
                                        case "group":
                                            setValidate(item.group.fields);
                                            break;
                                        default:
                                        //

                                    }
                                }else{
                                    /*switch (item.field_type){
                                     case "datearea":
                                     aRules.push({
                                     ele:"[name='"+item.field_name+"']",
                                     datatype:"isRightDatearea",
                                     nullmsg:"开始、结束时间不能为空",
                                     errormsg:"开始、结束时间格式有误"
                                     });
                                     break;
                                     default:
                                     //
                                     }*/
                                }
                            }
                        }
                        setValidate(t.aFields);

                        setTimeout(function () {
                            //表单验证
                            that.oFormValidForm = $('#report_previewAudit').Validform({
                                tiptype:function(msg,o,cssctl){
                                    //msg：提示信息;
                                    //o:{obj:*,type:*,curform:*}, obj指向的是当前验证的表单元素（或表单对象），type指示提示的状态，值为1、2、3、4， 1：正在检测/提交数据，2：通过验证，3：验证失败，4：提示ignore状态, curform为当前form对象;
                                    //cssctl:内置的提示信息样式控制函数，该函数需传入两个参数：显示提示信息的对象 和 当前提示的状态（既形参o中的type）;
                                    var $tip=$("#report_previewAudit_formSubmitError > span.tipmsg:first");
                                    cssctl($tip,o.type);
                                    if(o.type == 3){
                                        $tip.text(msg).parent().show();
                                    }else{
                                        $tip.text("").parent().hide();
                                    }
                                },
                                showAllError:false,
                                datatype:{
                                    //验证文件上传
                                    "isEmplyFile":function(gets,obj,curform,regxp){
                                        return $(obj).parent().parent().find("ul.filePreviewList").find("li").length?true:false;
                                    },
                                    //验证图片上传
                                    "isEmplyPic":function(gets,obj,curform,regxp){
                                        return $(obj).parent().parent().find(".imgPreview").length?true:false;
                                    },
                                    //验证日期区间
                                    "isEmplyDatearea":function(gets,obj,curform,regxp){
                                        var isEmply = false;
                                        $(obj).parent().parent().find("input.Wdate").each(function () {
                                            if(!$.trim($(this).val())){
                                                isEmply = true;
                                            }
                                        });
                                        return isEmply?false:true;
                                    },
                                    /*//验证日期区间格式
                                     "isRightDatearea":function(gets,obj,curform,regxp){
                                     var $date = $(obj).parent().parent().find("input.Wdate");
                                     if($date.eq(1).val()){

                                     }
                                     },*/
                                    //验证复选，单选框
                                    "isEmplyCheckboxRadio":function(gets,obj,curform,regxp){
                                        var isHasValue = false;
                                        $(obj).parent().parent().find("input[type='checkbox'],input[type='radio']").each(function () {
                                            if($(this).prop("checked")){
                                                isHasValue = true;
                                            }
                                        });
                                        return isHasValue?true:false;
                                    }
                                },
                                beforeSubmit:function(curform){
                                    //在验证成功后，表单提交前执行的函数，curform参数是当前表单对象。
                                    //这里明确return false的话表单将不会提交;
                                    t.saveData();
                                    return false;
                                }
                            });
                            that.oFormValidForm.addRule(aRules);

                        },100);
                    }
                    /**
                     * 保存，发起流程
                     * */
                    ,saveData:function () {
                        var t = this;
                        var $el = $(t.$el);

                        //去掉审批人的垃圾字段，只保留这三个字段
                        for(var i=0;i<t.auditPersonList.length;i++){
                            if(!t.auditPersonList[i].audit_person_id){
                                tools.showMsg.error("请先为自由节点设置审批人");
                                return false;
                                break;
                            }
                            var obj = {
                                "node_number": t.auditPersonList[i].node_number,
                                "audit_person_id": t.auditPersonList[i].audit_person_id,
                                "audit_person_name": t.auditPersonList[i].audit_person_name
                            };
                            if(t.auditPersonList[i].audit_opinion){
                                obj.audit_opinion = t.auditPersonList[i].audit_opinion || "";
                            }
                            t.auditPersonList[i] = obj;
                        }

                        var oSend = {
                            customParam:{
                                ccAndAuditPerson:JSON.stringify({
                                    auditPersonList:tools.parseJson(t.auditPersonList)
                                    ,processCc:tools.parseJson(t.processCc)
                                })
                                ,form_id:String(that.options.data.formId)
                                ,node_data:JSON.stringify(t.setValue(t.aFields))  //表单填写完毕的json数据
                            }
                            ,dataList:[
                                {key:"instanc_state",value:"2"}, //审批发起状态：1：暂存，2：发起
                            ]
                            ,infoSetId:"wf_process_list"
                        };

                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrReportData/addReportData.do"
                            ,data:JSON.stringify(oSend)
                            ,beforeSend:function () {
                                $("body").loading({zIndex:99999999});
                            }
                            ,complete:function () {
                                $("body").loading({state:false});
                            }
                            ,success:function (data) {
                                console.log("huibaofaqi",data)
                                if(data.result == "true"){
                                    tools.showMsg.ok("操作成功！");
                                    that.d.close().remove();
                                }
                            }
                        });
                        return false;
                    }
                    /**
                     * 拼接表单填写的值
                     * */
                    ,setValue:function (arr) {
                        var t = this;
                        var $el = $(t.$el);
                        for(var i=0;i<arr.length;i++){
                            var item = arr[i];
                            switch (item.field_type){
                                case "text":
                                    item.value =$el.find("input[name='"+item.field_name+"']").val();
                                    break;
                                case "twoColumns":
                                    if(item.firstCol.fields.length){
                                        t.setValue(item.firstCol.fields);
                                    }
                                    if(item.secondCol.fields.length){
                                        t.setValue(item.secondCol.fields);
                                    }
                                    break;
                                case "threeColumns":
                                    if(item.firstCol.fields.length){
                                        t.setValue(item.firstCol.fields);
                                    }
                                    if(item.secondCol.fields.length){
                                        t.setValue(item.secondCol.fields);
                                    }
                                    if(item.thirdCol.fields.length){
                                        t.setValue(item.thirdCol.fields);
                                    }
                                    break;
                                case "group":
                                    if(item.group.fields.length){
                                        t.setValue(item.group.fields);
                                    }
                                    break;
                                case "datearea":
                                    item.startValue =$el.find("input[name='"+item.field_name+"']").eq(0).val();
                                    item.endValue =$el.find("input[name='"+item.field_name+"']").eq(1).val();
                                    break;
                                case "paragraph":
                                    item.value =$el.find("textarea[name='"+item.field_name+"']").val();
                                    break;
                                case "date":
                                    item.value =$el.find("input[name='"+item.field_name+"']").val();
                                    break;
                                case "number":
                                    item.value =$el.find("input[name='"+item.field_name+"']").val();
                                    break;
                                case "radio":
                                    var value = "";
                                    $el.find("input[name='"+item.field_name+"']:checked").each(function () {
                                        value = $(this).val();
                                    });
                                    item.value = value;
                                    break;
                                case "checkboxes":
                                    var value = [];
                                    $el.find("input[name='"+item.field_name+"']:checked").each(function () {
                                        value.push($(this).val());
                                    });
                                    item.value = value;
                                    break;
                                case "pic":
                                    var value = [];
                                    $el.find(".addPicPreview[data-name='"+item.field_name+"']").find(".imgPreview").each(function () {
                                        value.push($(this).attr("data-uuid"));
                                    });
                                    item.value = value;
                                    break;
                                case "file":
                                    var value = [];
                                    $el.find(".addFilePreview[data-name='"+item.field_name+"']").find("li").each(function () {
                                        value.push({
                                            uuid:$(this).attr("data-uuid")
                                            ,fileName:$(this).find(".filename").text()
                                            ,size:$(this).find(".size").text()
                                        });
                                    });
                                    item.value = value;
                                    break;
                                default:
                                //

                            }
                        }
                        return arr;
                    }
                    /**
                     * 设置自由节点选择人员
                     * */
                    ,selectPerson:function ($event,item,$index) {
                        var t =this;
                        //如果满足自由节点的条件
                        if(item.auditPersonId == -1){
                            new AuditSelect({
                                addType:"single",
                                isSelectPos:false,
                                afterSelect:function (data) {
                                    var obj = data[0];
                                    t.auditPersonList[$index].audit_person_id = obj.audit_person_id;
                                    t.auditPersonList[$index].audit_person_name = obj.audit_person_name;
                                    t.auditPersonList[$index].node_number = t.auditPersonList[$index].nodeNumber;
                                    t.auditPersonList[$index].audit_opinion = t.auditPersonList[$index].auditOpinion;  //自动审批节点 关键词

                                    t.auditPersonList = tools.parseJson(t.auditPersonList);
                                }
                            });
                        }
                    }
                    /**
                     * 添加抄送人
                     * */
                    ,addProcessCc:function () {
                        var t = this;
                        new AuditSelect({
                            addType:"multiple",
                            title:"添加接收人",
                            isSelectPos:false,
                            afterSelect:function (data) {
                                var isHasSame = false;
                                //过滤重复的
                                _.each(data,function (obj) {
                                    if(_.findIndex(t.auditInfo.process_cc,{person_id:obj.audit_person_id}) == -1){
                                        t.auditInfo.process_cc.push({
                                            "person_id" : obj.audit_person_id,
                                            "person_name" : obj.audit_person_name,
                                            "person_img":obj.audit_person_img
                                        });
                                    }else{
                                        isHasSame = true;
                                    }
                                });
                                if(isHasSame){
                                    tools.showMsg.ok("已经去除重复选择的抄送人");
                                }
                                t.updateAuditDataList();
                            }
                        });
                    }
                    /**
                     * 移除抄送人
                     * */
                    ,removeProcessCc:function ($index) {
                        var t = this;
                        t.auditInfo.process_cc.splice($index,1);
                        t.updateAuditDataList();
                    }
                    ,addProcessCcMouseenter:function (e) {
                        $(e.target).parent().find(".close").css({visibility:"hidden"})
                    }
                    ,addProcessCcMouseleave:function (e) {
                        $(e.target).parent().find(".close").css({visibility:"visible"})
                    }
                    /**
                     * 添加不包含人员
                     * */
                    ,addHasNoAudit:function () {
                        var t = this;
                        new AuditSelect({
                            addType:"single",
                            title:"添加不包含人员",
                            isSelectPos:false,
                            afterSelect:function (data) {
                                var oSelect = data[0];
                                if(_.findIndex(t.auditInfo.audit_loop.not_contain,{person_id: oSelect.audit_person_id}) == -1){
                                    if(!t.auditInfo.audit_loop.not_contain){
                                        t.auditInfo.audit_loop.not_contain = [];
                                    }
                                    t.auditInfo.audit_loop.not_contain.push({
                                        person_id:oSelect.audit_person_id,
                                        person_name:oSelect.audit_person_name,
                                        person_img:oSelect.audit_person_img
                                    });
                                    t.updateAuditDataList();
                                }else{
                                    tools.showMsg.error("不能重复添加");
                                }
                            }
                        });
                    }
                    /**
                     * 移除不包含人
                     * */
                    ,removeHasNoAudit:function (person_id) {
                        var t = this;
                        for(var i=0;i<t.auditInfo.audit_loop.not_contain.length;i++){
                            if(t.auditInfo.audit_loop.not_contain[i].person_id == person_id){
                                t.auditInfo.audit_loop.not_contain.splice(i,1);
                            }
                        }
                        t.updateAuditDataList();
                    }
                    /**
                     * 更新选中的审批节点
                     * */
                    ,updateAuditDataList:function () {
                        var t = this;
                        t.auditInfo.isSelected = true;  //让当前选中的节点保持选中
                        for(var i=0;i<t.auditDataList.length;i++){
                            if(t.auditDataList[i].isSelected){
                                t.auditDataList[i] = t.auditInfo;
                            }
                        }

                        t.auditInfo = JSON.parse(JSON.stringify(t.auditInfo));
                        t.auditDataList = JSON.parse(JSON.stringify(t.auditDataList));
                    }
                    /**
                     * 设置审批节点的字段权限
                     * */
                    ,setFieldsPermission:function () {
                        var t = this;
                        that.dialogFieldsPermission = dialog({
                            title:"字段权限"
                            ,cancel:function () {

                            }
                            ,ok:function () {
                                var aResult = [];
                                $("#dialogFieldsPermissionWrap").find("tr.values").each(function () {
                                    aResult.push({
                                        field_name:$(this).find("input[type='checkbox']:first").attr("name")
                                        ,isShow:$(this).find(".isShow").prop("checked")?true:false
                                        ,isEdit:$(this).find(".isEdit").prop("checked")?true:false
                                    });
                                });
                                if(t.auditInfo.node_number == "1"){
                                    t.auditInfo.field_permissions = [];
                                    t.auditInfo.process_cc_field_permissions = aResult;
                                }else{
                                    t.auditInfo.field_permissions = aResult;
                                    t.auditInfo.process_cc_field_permissions = [];
                                }

                                t.auditInfo = JSON.parse(JSON.stringify(t.auditInfo));
                                t.updateAuditDataList(); //更新当前选择节点数据模型
                            }
                            ,content:'<div id="dialogFieldsPermissionWrap">'+
                            '			<table>'+
                            '				<tr>'+
                            '					<td class="td1">字段名称</td>'+
                            '					<td class="td2">字段可见</td>'+
                            '					<td class="td3">字段可编辑</td>'+
                            '				</tr>'+
                            '			</table>'+
                            '		</div>'
                        });
                        that.dialogFieldsPermission.showModal();
                        t.getFieldsDataFromMongo();
                    }
                    /**
                     * 获取表单json，如果是编辑状态就获取服务器中的json
                     * */
                    ,getFieldsDataFromMongo:function () {
                        var t = this;
                        //获取表单json，如果是编辑状态就获取服务器中的json
                        if(that.options.editType == "edit"){
                            Ajax.ajax({
                                url:gMain.apiBasePath + "wfFormSet/getStyleForMongo.do"
                                ,data:JSON.stringify({id:String(that.options.oFormEditData.form_id) ,ident:"form"})
                                ,beforeSend:function () {
                                    $("#dialogFieldsPermissionWrap").loading(); //开启提交遮罩
                                }
                                ,complete:function () {
                                    $("#dialogFieldsPermissionWrap").loading({state:false}); //关闭提交遮罩
                                }
                                ,success:function (data) {
                                    if(data.result == "true" && data.style){
                                        var aFields = JSON.parse(data.style).fields;
                                        t.updateFieldsList(aFields);
                                    }
                                }
                            });
                        }else{   //否则获取上一步中表单设计器中的json
                            t.updateFieldsList(that.options.aFormStyle.fields);
                        }
                    }
                    /**
                     * 更新字段权限显示列表
                     * */
                    ,updateFieldsList:function (aFields) {
                        var t = this;
                        var setAFields = function (arr) {
                            for(var i=0;i<arr.length;i++){
                                //如果节点是1标示获取发起人的字段权限，否则获取审批人的字段权限
                                var aField_permissions = t.auditInfo.node_number == "1"?t.auditInfo.process_cc_field_permissions:t.auditInfo.field_permissions;
                                arr[i].isShow = true; //字段可见性  默认值

                                //发起人默认都可编辑，审批人默认都不可编辑
                                if(t.auditInfo.node_number == "1"){
                                    arr[i].isEdit = true; //字段可编辑性 默认值
                                }else{
                                    arr[i].isEdit = false; //字段可编辑性 默认值
                                }

                                //覆盖之前有的字段权限的设置
                                for(var j=0;j<aField_permissions.length;j++){
                                    if(aField_permissions[j].field_name == arr[i].field_name){
                                        arr[i].isShow = aField_permissions[j].isShow; //字段可见性
                                        arr[i].isEdit = aField_permissions[j].isEdit; //字段可编辑性
                                    }
                                }

                                switch (arr[i].field_type){
                                    case "group":
                                        setAFields(arr[i].group.fields);
                                        break;
                                    case "twoColumns":
                                        setAFields(arr[i].firstCol.fields);
                                        setAFields(arr[i].secondCol.fields);
                                        break;
                                    case "threeColumns":
                                        setAFields(arr[i].firstCol.fields);
                                        setAFields(arr[i].secondCol.fields);
                                        setAFields(arr[i].thirdCol.fields);
                                        break;
                                    default:
                                    //
                                }

                            }
                        };
                        setAFields(aFields); //设置字段权限
                        t.setFieldsDataDom(aFields,function () {
                            that.dialogFieldsPermission.reset();
                        });
                    }
                    /**
                     * 拼接字段权限的dom结构
                     * */
                    ,setFieldsDataDom:function (aFields,callback) {
                        var t = this;
                        var sHtml = '';
                        var setHtml = function (arr) {
                            if(arr.length){
                                for(var i = 0;i<arr.length;i++){
                                    var item = arr[i];
                                    if(item.field_type != "group" && item.field_type != "twoColumns" && item.field_type != "threeColumns"){
                                        sHtml = sHtml + '<tr class="values">'+
                                            '					<td class="td1">'+item.label+'</td>'+
                                            '					<td class="td2"><div class="beautifulCheckbox"><input type="checkbox" class="isShow" name="'+item.field_name+'" id="checkbox-'+item.field_name+ i +'-isShow" '+(item.isShow?"checked":"")+'><label for="checkbox-'+item.field_name+ i +'-isShow"> </label></div></td>'+
                                            '					<td class="td3"><div class="beautifulCheckbox"><input type="checkbox" class="isEdit" name="'+ item.field_name +'" id="checkbox-'+item.field_name+ i +'-isEdit" '+(item.isEdit?"checked":"")+'><label for="checkbox-'+item.field_name+i+'-isEdit"> </label></div></td>'+
                                            '				</tr>';
                                    }

                                    switch (item.field_type){
                                        case "group":
                                            setHtml(item.group.fields);
                                            break;
                                        case "twoColumns":
                                            setHtml(item.firstCol.fields);
                                            setHtml(item.secondCol.fields);
                                            break;
                                        case "threeColumns":
                                            setHtml(item.firstCol.fields);
                                            setHtml(item.secondCol.fields);
                                            setHtml(item.thirdCol.fields);
                                            break;
                                        default:
                                        //
                                    }
                                }
                            }
                        };
                        setHtml(aFields);
                        $("#dialogFieldsPermissionWrap > table").append(sHtml);
                        typeof callback == "function" && callback();
                    }
                    /**
                     * 修改审批节点的人员
                     * */
                    ,editAuditPerson:function () {
                        var t = this;
                        new AuditSelect({
                            addType:"single",
                            afterSelect:function (data) {
                                var obj = data[0];
                                var oAudit = {
                                    dataType:obj.dataType,
                                    audit_pos_id : obj.audit_pos_id,
                                    audit_pos_name : obj.audit_pos_name,
                                    audit_person_id : obj.audit_person_id,
                                    audit_person_name : obj.audit_person_name,
                                    audit_person_img : obj.audit_person_img,
                                    audit_loop : {
                                        "loop_type" : "",
                                        "not_contain" : [],
                                        "cut_off" : ""
                                    },
                                    field_permissions : [],  //发起人、审批人的字段权限：json格式数据
                                    process_cc : [],
                                    is_auto_audit:false,
                                    process_cc_field_permissions : [], // 抄送人字段权限：json格式数据
                                    isSelected:true
                                };
                                $.extend(t.auditInfo,oAudit);
                                t.updateAuditDataList(); //更新当前选择节点数据模型
                            }
                        });
                    }
                    /**
                     * 保存数据
                     * */
                    ,saveData:function () {
                        var t =this;
                        var aStyle = JSON.parse(JSON.stringify(that.vueWorkflowSettingApp.auditDataList));
                        if($.isArray(aStyle)){
                            for(var i=0;i<aStyle.length;i++){
                                delete aStyle[i].isSelected; //去掉是否选中的属性

                                //所有的自由节点不具备自动审批的功能
                                if(aStyle[i].audit_loop && aStyle[i].audit_loop.loop_type == "3"){
                                    aStyle[i].is_auto_audit = false;
                                }
                            }
                        }
                        //拼接表单数据
                        var oPostData = {
                            infoSetId:that.options.oMetadata.options.infoSetId
                            ,customParam:{
                                auditStyle:JSON.stringify({auditDataList:aStyle}) //流程设计json
                            }
                            ,dataList:[

                            ]
                        };
                        //编辑状态
                        if(that.options.editType == "edit"){
                            oPostData.uuid = that.options.oFormEditData.uuid;
                            oPostData.dataList.push({
                                key:"form_id"
                                ,value:String(that.options.oFormEditData.form_id) //表单ID
                            });
                        }else if(that.options.editType == "add"){ //新增状态是来自新增模式的一步一步的向导带过来的数据
                            oPostData.customParam.formStyle = JSON.stringify(that.options.aFormStyle);
                            oPostData.dataList = that.options.dataList; //表单基本信息
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
                                    tools.showMsg.ok("保存成功"); //成功提示弹层
                                    that.dialogFlowEdit.remove();  //关闭并取消弹窗
                                    if(that.options.editType == "add"){
                                        that.options.oFormBuild.dialog.close().remove(); //关闭表单设计器
                                    }
                                    that.options.oMetadata.mmg.load();//重载表格数据
                                }
                            }
                        });
                    }

                }
            });
        }
    });
    module.exports = previewAudit;
});
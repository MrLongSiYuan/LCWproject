/**
 * 流程发起
 * @options.data 流程数据对象
 * @options.type String 操作类型 preview：预览，start：发起
 */

define(function(require, exports, module) {
    /*引入bootstrap-switch 插件*/
    require("commonStaticDirectory/plugins/bootstrap-switch/bootstrap-switch.css");
    require("commonStaticDirectory/plugins/bootstrap-switch/bootstrap-switch.js");
    require("js/modules/previewAudit/previewAudit.css");
    var sTpl = require("js/modules/previewAudit/previewAudit.html");

    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");

    //日历控件
    require("commonStaticDirectory/plugins/My97DatePicker/WdatePicker.js");

    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");
    require("commonStaticDirectory/plugins/Validform_v5.3.2.js");  //表单验证插件

    require("js/modules/formPreview/formPreview.js");
    var AuditSelect = require("js/modules/auditSelect/auditSelect.js"); //添加接收人组件


    var previewAudit = function () {
        this.init.apply(this,arguments);
    };
    $.extend(previewAudit.prototype,{
        options:{
            type:"preview"  //类型：preview（预览）/start（发起）
            ,submitType:"1" //1（提交）2（存草稿）
            ,intervalAdd:null //定时器
        }
        ,init:function (options) {
            var t = this;
            t.options = $.extend({}, t.options, options);
            console.log(t.options)
            t.initDialog();
        }
        ,initDialog:function () {
            var t = this;
            var sTitle,button;
            if(t.options.previewType && t.options.previewType == "singleDraftPre"){ //单个草稿
                sTitle = "汇报编辑";
            }else {
                sTitle = "汇报发起（"+t.options.data.name+"）";
            }
            if(t.options.previewType && t.options.previewType == "singleDraftPre"){ //单个草稿的底部按钮
                button = [
                    {
                        value:"提交"
                        ,callback:function () {
                        $('#report_previewAudit').trigger("validate"); //触发表单验证
                        t.options.submitType = "1";
                        t.oFormValidForm.submitForm(false);
                        return false;
                    }
                        ,autofocus:true
                    }
                    ,{
                        value:"存草稿"
                        ,callback:function () {
                            // $('#report_previewAudit').trigger("validate"); //触发表单验证
                            t.options.submitType = "2";
                            t.vuePreviewAudit.saveDraft();
                            return false;

                        }
                    }
                    ,{
                        value:"取消"
                        ,callback:function () {

                        }

                    }
                ];
            }else {
                button = t.options.type=="start"?[
                        {
                            value:"提交"
                            ,callback:function () {
                            $('#report_previewAudit').trigger("validate"); //触发表单验证
                            t.options.submitType = "1";
                            t.oFormValidForm.submitForm(false);
                            return false;
                        }
                            ,autofocus:true
                        }
                        /*,{
                            value:"存草稿"
                            ,callback:function () {
                                // $('#report_previewAudit').trigger("validate"); //触发表单验证
                                t.options.submitType = "2";
                                t.vuePreviewAudit.saveDraft();
                                return false;

                            }
                        }*/
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
            }
            var d = dialog({
                title:sTitle
                ,button:button
                ,content:sTpl
                ,padding:"20px 0px 20px 0px"
                ,onclose: function () {
                    clearInterval(t.options.intervalAdd);
                }
            });
            t.d = d;
            d.showModal();
            t.initVue();
        }
        ,initVue:function () {
            var that = this;
            that.vuePreviewAudit = new Vue({
                el:"#report_previewAudit"
                ,data:{
                    gMain:gMain
                    ,firstChangeLastaFields:true
                    ,aFields:[]  //表单项
                    ,tempId:null
                    ,tempName:""
                    ,nowYear:new Date().getFullYear()
                    ,nowMonth:(new Date().getMonth()+1)<10 ? "0"+(new Date().getMonth()+1):(new Date().getMonth()+1)
                    ,nowDay:new Date().getDate()<10 ? "0"+new Date().getDate():new Date().getDate()
                    ,personId:null
                    ,modleChooseTime:""
                    ,modleChooseTimeList:[]
                    ,lastaFields:[] //上一次汇报的表单项
                    ,emptyaFields:[] //可以引用上一次汇报  存原始表单
                    ,auditPersonList:[]  //审批人列表数据
                    ,processCc:[] //抄送人列表数据
                    ,quoteClick:"0" //是否点击了引用
                    ,isShowMoreProcessCc:false
                    ,isShowAuditPerson:true  //是否显示审批人和抄送人
                    ,quoteReport:{
                        reportNotFirst:false,//不是第一次发起同类型汇报
                        canQuoteFlag:false,  //不是第一次发起但是汇报模板已调整，不可引用上次汇报内容
                        quoteReportAready:false,  //决定显示空的表单还是上一次汇报的表单 false(显示空的表单)
                        lastReceiver:[],    //上一次的接收人
                    }
                    ,canOpenPreview:true   //打开预览详情的控制开关
                    ,forwardType:"0"   //0:可以转发 1:禁止转发
                    ,reporters:[            //发起人信息
                        {
                            inforTitle:"部门"
                            ,inforContent:that.options.reporterInfor.orgName
                        }
                        ,
                        {
                            inforTitle:"提交人"
                            ,inforContent:that.options.reporterInfor.personName
                        }
                        ,
                    ]
                    ,auditInfo:{
                        process_cc:[], //接收人
                    }
                    ,loop_typename:{"1":"上级循环","2":"直属上级","3":"自由节点"}
                    ,is_auto_audit:false  //是否自动审批
                    ,is_auto_audit_readonly:false //是否自动审批按钮的只读属性
                    //选择人
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
                            process_cc : [],  //接收人
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
                    },
                    "lastaFields":function () {
                        var t = this;
                        if(t.firstChangeLastaFields){
                            t.getPicTrueUrl(t.lastaFields,function (arr) {
                                arr = t.removeUselessFields(arr);  //去掉垃圾字段
                                t.lastaFields = JSON.parse(JSON.stringify(arr)); //表单数据
                                t.firstChangeLastaFields = false;
                            });
                        }
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
                    t.getBeforeWeek();
                    t.initJqueryPlugins();
                    t.tempId = that.options.data.uuid;
                    t.tempName = that.options.tempName;
                    t.personId = gMain.oUser.beans[0].userInfo.personId;
                    if(that.options.previewType && that.options.previewType == "singleDraftPre"){  //进入草稿预览编辑
                        if(t.reporters.length == 2){
                            t.reporters.push({
                                inforTitle:"提交时间"
                                ,inforContent:that.options.reporterInfor.createTime
                            })
                        }else{
                            t.reporters[2].inforContent = that.options.reporterInfor.createTime;
                        }
                        t.getPicTrueUrl(JSON.parse(that.options.nodeData),function (arr) {
                            arr = t.removeUselessFields(arr);  //去掉垃圾字段
                            t.aFields = JSON.parse(JSON.stringify(arr)); //表单数据
                        });
                        // t.aFields = JSON.parse(that.options.nodeData);
                        t.forwardType = that.options.forwardType; //是否禁止转发
                        var receiverArr = []; //接收人数据处理暂存数组、
                        for(var i = 0;i<that.options.recipientList.length;i++){
                            var receiverObj = {"person_id" : "","person_name" : "","person_img":""};//单个接收人对象
                            receiverObj.person_id = that.options.recipientList[i].receiverId;
                            receiverObj.person_name = that.options.recipientList[i].receiverName;
                            receiverObj.person_img = that.options.recipientList[i].headImg;
                            receiverArr.push(receiverObj);
                        };
                        t.auditInfo.process_cc = receiverArr.slice(0);
                    }else{          //提交汇报预览
                        //发起
                        $("#report_previewAudit").loading(); //开启查询遮罩
                        if(that.options.type == "start"){
                            t.quoteLastReport()  //是否可以引用上一次汇报
                            //获取表单json,审批人信息,审批节点json
                            $.when(t.getStyleForMongo()).done(function () {
                                clearInterval(that.options.intervalAdd);
                                that.options.intervalAdd = setInterval(function () {
                                    var afilds = $.extend(true,[],t.aFields);
                                    var nodeDatalocal = t.setValue(afilds);//把发起人的信息拼接到表单信息//表单填写完毕的json数据
                                    var nodeDatalocalClear = []; // 去掉个人信息
                                    $.each(nodeDatalocal,function (num,val) {
                                        if(nodeDatalocal[num].field_type != "default_field"){
                                            nodeDatalocalClear.push(nodeDatalocal[num]);
                                        }
                                    })
                                    localStorage.setItem(t.tempId+"-"+t.personId,JSON.stringify(nodeDatalocalClear));
                                },1000);
                                t.validateForm();
                            });
                        }else{ //预览
                            t.quoteLastReport()  //是否可以引用上一次汇报
                            //获取表单json
                            $.when(t.getStyleForMongo()).done(function () {
                                // $("#report_previewAudit").loading({state:false}); //关闭查询遮罩
                            });
                        }
                    };
                    var state; //禁用插件默认值
                    if(t.forwardType == "0"){ //默认选中
                        state = true;
                    }else{
                        state = false;
                    }
                    $("#notification1").bootstrapSwitch({  //禁止转发插件
                        onText:"是",
                        offText:"否",
                        onColor:"primary",
                        offColor:"default",
                        size:"small",
                        state:state,
                        onSwitchChange:function(event,state){
                            if(state==true){
                                t._data.forwardType = "0";
                            }else{
                                t._data.forwardType = "1";
                            }
                        }
                    });
                    var oUser = tools.Cache.getCache("oHeaderData","session");//用户信息
                },
                beforeDestroy:function () {
                    var t = this;
                }
                ,methods:{
                    /*
                    * 获取当前周和前5周
                    * */
                    getBeforeWeek:function () {
                        var t = this;
                        function twoDigit (num) {
                            return num < 10 ? "0"+num : num;
                        }
                        var nowDate = new Date();
                        var weekDay = nowDate.getDay() == 0 ? 7:nowDate.getDay();
                        var monday,sunday,firstDay,lastDay;
                        monday = new Date(nowDate.getTime() - (weekDay - 1)*24*60*60*1000);
                        sunday = new Date(nowDate.getTime() + (7 - weekDay)*24*60*60*1000);
                        firstDay = monday.getFullYear() + "/" + twoDigit(monday.getMonth()+1) + "/" + twoDigit(monday.getDate());
                        lastDay = sunday.getFullYear() + "/" + twoDigit(sunday.getMonth()+1) + "/" + twoDigit(sunday.getDate())
                        t.modleChooseTime = firstDay +" - "+lastDay;
                        t.modleChooseTimeList.push(firstDay +" - "+lastDay);
                        for(var i = 0;i<5;i++){
                            monday = new Date(monday.getTime() - 7*24*60*60*1000);
                            sunday = new Date(sunday.getTime() - 7*24*60*60*1000);
                            firstDay = monday.getFullYear() + "/" + twoDigit(monday.getMonth()+1) + "/" + twoDigit(monday.getDate());
                            lastDay = sunday.getFullYear() + "/" + twoDigit(sunday.getMonth()+1) + "/" + twoDigit(sunday.getDate())
                            t.modleChooseTimeList.push(firstDay +" - "+lastDay);
                        }
                    },
                    //初始化插件
                    initJqueryPlugins:function () {
                        var t =this;
                        //日历插件
                        $(t.$el).off("focus.Wdate").on("focus.Wdate","input.Wdate",function () {
                            var that = this;
                            var sDateFmt,maxDate;
                            if($(this).attr("data-type") == "1"){
                                sDateFmt = "yyyy-MM-dd HH:mm"; //年月日时分
                            }else if($(this).attr("data-type") == "2"){
                                sDateFmt = "yyyy-MM-dd"; //年月日
                                maxDate = new Date().getFullYear() + "-" + (new Date().getMonth()+1) + "-" + new Date().getDate();
                            }else if($(this).attr("data-type") == "3"){
                                sDateFmt = "yyyy-MM"; //年月
                                maxDate = new Date().getFullYear() + "-" + (new Date().getMonth()+1);
                            }
                            $(that).off("click").on("click",function(){
                                WdatePicker({
                                    dateFmt:sDateFmt,
                                    isShowClear:false,
                                    maxDate:maxDate,
                                });
                            });
                        });
                    },
                    /**
                     * 获取表单json
                     * */
                    getStyleForMongo:function () {
                        var t = this;
                        var df = $.Deferred();
                        //获取表单json
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrReportTemp/getFormStyleForMongo.do"
                            ,data:JSON.stringify({
                                id:that.options.data.formId.toString(),
                                mongoSymbol:"formStyle_table"
                            })
                            ,beforeSend:function () {
                            }
                            ,complete:function () {
                            }
                            ,error:function (err) {

                            }
                            ,success:function (data) {
                                if(data.result == "true" && data.data){
                                    df.resolve();
                                    var aFields = JSON.parse(data.data).fields;
                                    t.aFields = aFields;
                                    t.emptyaFields = t.aFields.slice(0);
                                    //如果后台获取的表单项条数和本地不符合  则说明模板改变
                                    if(localStorage.getItem(t.tempId+"-"+t.personId) && (JSON.parse(localStorage.getItem(t.tempId+"-"+t.personId)).length == t.aFields.length)){
                                        t.aFields = JSON.parse(localStorage.getItem(t.tempId+"-"+t.personId));
                                        t.aFields  = t.deleteOverduePicUrl(t.aFields );
                                        t.getPicTrueUrl(t.aFields,function (arr) {
                                            arr = t.removeUselessFields(arr);  //去掉垃圾字段
                                            t.aFields = JSON.parse(JSON.stringify(arr)); //表单数据
                                            // alert(JSON.stringify(t.aFields));
                                        });
                                    }
                                    setTimeout(function () {
                                        that.d.reset();
                                    },100);
                                }
                            }
                        });
                        return df;
                    }
                    /**
                     * 获取是否可以引用上一次汇报
                     * */
                    ,quoteLastReport:function () {
                        var t = this;
                        var df = $.Deferred();
                        //获取表单json
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrReportData/quoteReportData.do"
                            ,data:JSON.stringify({
                                formId:that.options.data.formId.toString(),
                                tempId:that.options.data.uuid.toString()
                            })
                            ,complete:function () {
                                $("#report_previewAudit").loading({state:false}); //关闭查询遮罩
                                df.resolve();
                            }
                            ,error:function (err) {

                            }
                            ,success:function (data) {
                                if(data.result == "true" && data.data){
                                    if(data.data != "remind" && data.data.mydoc.node_data){     //可以引用
                                        t.lastaFields = JSON.parse(data.data.mydoc.node_data);
                                        if(data.data.workTemp && data.data.workTemp == "true"){
                                           t.lastaFields[0].value = t.lastaFields[1].value;
                                           t.lastaFields[1].value = "";
                                        }
                                        t.quoteReport.reportNotFirst = true;
                                        t.quoteReport.canQuoteFlag = true;
                                        if(data.data.receiverList){
                                            for(var i = 0;i<data.data.receiverList.length;i++){
                                                var obj = {
                                                    "person_id" : data.data.receiverList[i].receiverId,
                                                    "person_name" : data.data.receiverList[i].receiverName,
                                                    "person_img":data.data.receiverList[i].headImg
                                                }
                                                t.quoteReport.lastReceiver.push(obj);
                                            }
                                            t.auditInfo.process_cc = t.quoteReport.lastReceiver.slice(0);
                                        }
                                    }
                                }else if(data.result == "false"){
                                    t.quoteReport.reportNotFirst = true;
                                    t.quoteReport.canQuoteFlag = false;
                                }
                            }
                        });
                        return df;
                    }
                    /**
                     * 引用上一次汇报/清除填充的数据
                     * */
                    ,quoteLastReportOrNot:function (e) {
                        var t = this;
                        if(t.quoteReport.reportNotFirst){  //不是第一次使用此汇报才能调用
                            if(t.quoteReport.canQuoteFlag){  //可以引用
                                t.quoteReport.quoteReportAready = !t.quoteReport.quoteReportAready;
                                if(t.quoteReport.quoteReportAready){
                                    t.aFields = t.lastaFields.slice(0);
                                    t.quoteClick = "1";
                                    $(e.target).text("清除内容")
                                }else{
                                    t.aFields = t.emptyaFields.slice(0);
                                    t.quoteClick = "0";
                                    $(e.target).text("引用上一次汇报")
                                }
                            }else{    //不是第一次使用但是模板修改不能调用
                                tools.showMsg.ok("汇报模板已调整，不可引用上次汇报内容");
                            }
                        }
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
                                tipSweep:true, //提交表单时候才提示验证结果
                                tiptype:function(msg,o,cssctl){
                                    //msg：提示信息;
                                    //o:{obj:*,type:*,curform:*}, obj指向的是当前验证的表单元素（或表单对象），type指示提示的状态，值为1、2、3、4， 1：正在检测/提交数据，2：通过验证，3：验证失败，4：提示ignore状态, curform为当前form对象;
                                    //cssctl:内置的提示信息样式控制函数，该函数需传入两个参数：显示提示信息的对象 和 当前提示的状态（既形参o中的type）;
                                    var $tip=$("#report_previewAudit_formSubmitError > span.tipmsg:first");
                                    cssctl($tip,o.type);
                                    if(o.type == 3){
                                        $tip.text(msg).parent().show();
                                        setTimeout(function () {
                                            $tip.text(msg).parent().animate({
                                                opacity:0,
                                            },500,function () {
                                                $tip.text("").parent().hide();
                                                $tip.text("").parent().css({opacity:1,});
                                            })
                                        },2000)
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
                                    /*if(that.options.previewType == "singleDraftPre"){
                                        if(that.options.submitType == "1"){  //提交
                                            t.openPreview();
                                        }else{
                                            t.saveDraft();
                                        }
                                    }else {
                                        if(that.options.submitType == "1"){  //提交
                                            t.openPreview();
                                        }else{
                                            t.saveDraft();
                                        }
                                    }*/
                                    if(that.options.submitType == "1" && t.canOpenPreview){  //提交
                                        t.canOpenPreview = false;
                                        t.openPreview();
                                    }
                                    return false;
                                }
                            });
                            that.oFormValidForm.addRule(aRules);

                        },100);
                    }
                    /**
                     * 打开预览
                     * */
                    ,openPreview:function () {
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
                        var nodeData = t.setValue(t.aFields).slice(0);//把发起人的信息拼接到表单信息//表单填写完毕的json数据
                        /*给后台截取一份简短的表单*/
                        var smsNodeData = [];
                        if(nodeData.length > 3){
                            smsNodeData = nodeData.slice(0,3);
                        }else{
                            smsNodeData = nodeData.slice(0);
                        }
                        var addPersonInfor = {
                            headImg:gMain.personInforReport.headImg+"",
                            orgId:gMain.personInforReport.orgId+"",
                            orgName:gMain.personInforReport.orgName+"",
                            personId:gMain.personInforReport.personId+"",
                            personName:gMain.personInforReport.personName+"",
                            posName:gMain.personInforReport.posName+""
                        };//表单信息添加上个人信息
                        var havePerInfor = true; // 是否要添加
                        for(var i = 0;i<nodeData.length;i++){
                            if(nodeData[i].field_type == "default_field"){
                                nodeData[i].value = addPersonInfor;
                                havePerInfor = false;
                            }
                        }
                        if(addPersonInfor){
                            nodeData.push(
                                {
                                    "field_type": "default_field",
                                    "field_name": "personInfor",
                                    "value":addPersonInfor
                                }
                            )
                        }
                        var oSend = {
                            customParam:{
                                ccAndAuditPerson:JSON.stringify({
                                    auditPersonList:tools.parseJson(t.auditPersonList)
                                    ,processCc:tools.parseJson(t.processCc)
                                })
                                ,form_id:String(that.options.data.formId)
                                ,node_data:JSON.stringify(nodeData)  //表单填写完毕的json数据
                            }
                            ,dataList:[
                                {key:"instanc_state",value:"2"}, //审批发起状态：1：暂存，2：发起
                            ]
                            ,infoSetId:"wf_process_list"
                        };
                        var imBody = "";
                        var nodeDataList = JSON.parse(oSend.customParam.node_data);
                        var imbodyFun = function (obj) {
                            if(obj.label){
                                imBody = imBody+obj.label+"<br/>";
                            }
                            if(obj.field_type == "pic"){

                            }else if(obj.field_type == "file"){  //文件另做处理
                                if(obj.value){
                                    $.each(obj.value,function (num,val) {
                                        imBody = imBody+val.fileName+"<br/>";
                                    })
                                }
                            }else if(obj.field_type != "default_field"){
                                if(obj.value){
                                    imBody = imBody+obj.value+"<br/>";
                                }
                            }
                        }
                        if(nodeDataList.length>3){
                            for(var i = 0;i<3;i++){
                                if(nodeDataList[i].field_type == "twoColumns" || nodeDataList[i].field_type == "threeColumns"){
                                    $.each(nodeDataList[i].firstCol.fields,function (num,val){
                                        imbodyFun(val);
                                    })
                                    $.each(nodeDataList[i].secondCol.fields,function (num,val){
                                        imbodyFun(val);
                                    })
                                    if(nodeDataList[i].thirdCol){
                                        $.each(nodeDataList[i].thirdCol.fields,function (num,val){
                                            imbodyFun(val);
                                        })
                                    }
                                }else{
                                    imbodyFun(nodeDataList[i]);
                                }
                            }
                        }else {
                            for(var i = 0;i<nodeDataList.length;i++){
                                if(nodeDataList[i].field_type == "twoColumns" || nodeDataList[i].field_type == "threeColumns"){
                                    $.each(nodeDataList[i].firstCol.fields,function (num,val){
                                        imbodyFun(val);
                                    })
                                    $.each(nodeDataList[i].secondCol.fields,function (num,val){
                                        imbodyFun(val);
                                    })
                                    if(nodeDataList[i].thirdCol){
                                        $.each(nodeDataList[i].thirdCol.fields,function (num,val){
                                            imbodyFun(val);
                                        })
                                    }
                                }else{
                                    imbodyFun(nodeDataList[i]);
                                }
                            }
                        }
                        var recipientTemp = t._data.auditDataList[0].process_cc.slice(0);
                        var recipientList = [];
                        /*用户选择时间*/
                        var startTime = "";
                        if(t.tempName == "周报"){
                            startTime = t.modleChooseTime.slice(0,10);
                            startTime = startTime.replace(/\//g,"-");
                        }else{
                            startTime = $("#report_previewAudit").find(".choose_report_right input.Wdate").val();
                        }
                        $.each(recipientTemp,function (key,val) {
                            var objTemp = {
                                "type":"0",
                                "receiverId":""
                            };
                            objTemp.receiverId = val.person_id+"";
                            recipientList.push(objTemp);
                        });
                        if(that.options.previewType == "singleDraftPre"){ //草稿提交预览
                            var oPostData = {
                                "forwardType":t.forwardType+"",//禁止转发
                                "status":that.options.submitType,////提交状态 1: 已发送 2:草稿
                                "receiver":recipientList, //接收人
                                "nodeData":oSend.customParam.node_data,
                                "uuid":that.options.data.uuid+"",
                                "dataId":that.options.data.dataId,
                                "imTitle":that.options.tempName,
                                "imBody":imBody,
                                "tempId":that.options.data.tempId,
                                "sms":JSON.stringify(smsNodeData),
                            };
                            t.doWaitForAudit({
                                oMetadata:oSend
                                ,recipientList:t._data.auditDataList[0].process_cc
                                ,oPostData:oPostData
                                ,previewType:that.options.previewType
                                ,reportsListClassify:that.options.reportsListClassify
                            });
                        }else{                                          //汇报发起时提交预览
                            var oPostData = {
                                "formId":oSend.customParam.form_id+"",
                                "forwardType":t._data.forwardType+"",//禁止转发
                                "status":"1",////提交状态 1: 已发送 2:草稿
                                "remark":"test",//备注（无）
                                "startTime":startTime,//用户选择时间
                                "endTime":"",
                                "reportType":"1",//模板类型 0 :系统模板 1:用户新增
                                "personName":that.options.reporterInfor.personName+"",//发起人名字
                                "receiver":recipientList, //接收人
                                "nodeData":oSend.customParam.node_data,
                                "tempId":that.options.data.uuid+"",
                                "imTitle":that.options.tempName,
                                "imBody":imBody,
                                "sms":JSON.stringify(smsNodeData),
                            };
                            t.doWaitForAudit({
                                oMetadata:oSend
                                ,recipientList:t._data.auditDataList[0].process_cc
                                ,oPostData:oPostData
                                ,previewType:"submitPre"
                            });
                        }
                        return false;
                    }
                    /**
                     * 存草稿
                     * */
                    ,saveDraft:function () {
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
                        var nodeData = t.setValue(t.aFields).slice(0);//把发起人的信息拼接到表单信息//表单填写完毕的json数据
                        if(that.options.previewType != "singleDraftPre"){  //提交汇报存草稿则要把发起人信息添加到表单数据
                            var addPersonInfor = true;
                            for(var i = 0;i<nodeData.length;i++){
                                if(nodeData[i].field_type == "default_field"){
                                    addPersonInfor = false;
                                }
                            }
                            if(addPersonInfor){
                                nodeData.push(
                                    {
                                        "field_type": "default_field",
                                        "field_name": "orgName",
                                        "value":that.options.reporterInfor.orgName+""
                                    }
                                    ,{
                                        "field_type": "default_field",
                                        "field_name": "personName",
                                        "value":that.options.reporterInfor.personName+""
                                    }
                                )
                            }
                        }
                        var oSend = {
                            customParam:{
                                ccAndAuditPerson:JSON.stringify({
                                    auditPersonList:tools.parseJson(t.auditPersonList)
                                    ,processCc:tools.parseJson(t.processCc)
                                })
                                ,form_id:String(that.options.data.formId)
                                ,node_data:JSON.stringify(nodeData)  //表单填写完毕的json数据
                            }
                            ,dataList:[
                                {key:"instanc_state",value:"2"}, //审批发起状态：1：暂存，2：发起
                            ]
                            ,infoSetId:"wf_process_list"
                        };
                        var recipientTemp = t._data.auditDataList[0].process_cc.slice(0);
                        var recipientList = [],postUrl;
                       $.each(recipientTemp,function (key,val) {
                           var objTemp = {
                               "type":"0",
                               "receiverId":""
                           };
                           objTemp.receiverId = val.person_id+"";
                           recipientList.push(objTemp);
                       });
                        if(that.options.previewType == "singleDraftPre"){ //更新草稿
                            var oPostData = {
                                "forwardType":t.forwardType+"",//禁止转发
                                "status":that.options.submitType,////提交状态 1: 已发送 2:草稿
                                "receiver":recipientList, //接收人
                                "nodeData":oSend.customParam.node_data,
                                "uuid":that.options.data.uuid+"",
                                "dataId":that.options.data.dataId,
                            };
                            postUrl = gMain.apiBasePath + "wrReportData/updateReportData.do";
                        }else{                              //提交草稿
                            var oPostData = {
                                "formId":oSend.customParam.form_id+"",
                                "forwardType":t._data.forwardType+"",//禁止转发
                                "status":"2",////提交状态 1: 已发送 2:草稿
                                "remark":"test",//备注（无）
                                "startTime":"",//搜索时间区段
                                "endTime":"",
                                "reportType":"1",//模板类型 0 :系统模板 1:用户新增
                                "personName":that.options.reporterInfor.personName+"",//发起人名字
                                "receiver":recipientList, //接收人
                                "nodeData":oSend.customParam.node_data,
                                "tempId":that.options.data.uuid+"",
                            };
                            postUrl = gMain.apiBasePath + "wrReportData/addReportData.do";
                        }

                        //保存数据
                        Ajax.ajax({
                            url:postUrl,
                            data:JSON.stringify(oPostData),
                            beforeSend:function () {
                                $("body").loading({zIndex:999999999}); //开启提交遮罩
                            },
                            complete:function () {
                                $("body").loading({state:false}); //关闭提交遮罩
                            },
                            success:function(data) {
                                if (data.result == "true") {
                                    tools.showMsg.ok("保存成功"); //成功提示弹层
                                    that.d.close().remove();  //关闭并取消弹窗
                                    if(that.options.addReportDialog){
                                        that.options.addReportDialog.close().remove(); //关闭并取消选择模板弹窗
                                    }
                                    // if(that.options.editType == "add"){
                                    //     that.options.oFormBuild.dialog.close().remove(); //关闭表单设计器
                                    // }
                                    // that.options.oMetadata.mmg.load();//重载表格数据
                                }
                            }
                        });
                        return false;
                    }
                    /**
                     * 更新草稿状态
                     * */
                    ,updateDraft:function () {
                        var t = this;
                        var $el = $(t.$el);

                        //去掉的垃圾字段，只保留这三个字段
                        for(var i=0;i<t.auditPersonList.length;i++){
                            if(!t.auditPersonList[i].audit_person_id){
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
                        var nodeData = t.setValue(t.aFields).slice(0);//把发起人的信息拼接到表单信息//表单填写完毕的json数据
                        // nodeData.push(
                        //     {
                        //         "field_type": "default_field",
                        //         "field_name": "orgName",
                        //         "value":that.options.reporterInfor.orgName+""
                        //     }
                        //     ,{
                        //         "field_type": "default_field",
                        //         "field_name": "personName",
                        //         "value":that.options.reporterInfor.personName+""
                        //     }
                        // )
                        var oSend = {
                            customParam:{
                                ccAndAuditPerson:JSON.stringify({
                                    auditPersonList:tools.parseJson(t.auditPersonList)
                                    ,processCc:tools.parseJson(t.processCc)
                                })
                                ,form_id:String(that.options.data.formId)
                                ,node_data:JSON.stringify(nodeData)  //表单填写完毕的json数据
                            }
                            ,dataList:[
                                {key:"instanc_state",value:"2"}, //审批发起状态：1：暂存，2：发起
                            ]
                            ,infoSetId:"wf_process_list"
                        };
                        var recipientTemp = t._data.auditDataList[0].process_cc.slice(0);
                        var recipientList = [];
                        $.each(recipientTemp,function (key,val) {
                            var objTemp = {
                                "type":"0",
                                "receiverId":""
                            };
                            objTemp.receiverId = val.person_id+"";
                            recipientList.push(objTemp);
                        });
                        var oPostData = {
                            "forwardType":t.forwardType+"",//禁止转发
                            "status":that.options.submitType,////提交状态 1: 已发送 2:草稿
                            "receiver":recipientList, //接收人
                            "nodeData":oSend.customParam.node_data,
                            "uuid":that.options.data.uuid+"",
                            "dataId":that.options.data.dataId,
                        };
                        //保存数据
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrReportData/updateReportData.do",
                            data:JSON.stringify(oPostData),
                            beforeSend:function () {
                                $("body").loading({zIndex:999999999}); //开启提交遮罩
                            },
                            complete:function () {
                                $("body").loading({state:false}); //关闭提交遮罩
                            },
                            success:function(data) {
                                if (data.result == "true") {
                                    tools.showMsg.ok("保存成功"); //成功提示弹层
                                    that.d.remove();  //关闭并取消弹窗
                                }
                            }
                        });
                        return false;
                    }
                    /**
                     * 打开汇报预览
                     * */
                    ,doWaitForAudit:function (opts) {
                        var t = this;
                        require.async("js/modules/waitForAudit/waitForAudit.js",function (waitForAudit) {
                            new waitForAudit({
                                dataPre:opts,                       //所有数据
                                oMetadata:opts.oMetadata,           //表单数据
                                reporterInfor:t._data.reporters,   //发起人
                                recipientList:opts.recipientList, //接收人
                                oPostData:opts.oPostData,         //提交数据
                                dialog:that.d,               //此弹窗
                                previewType:opts.previewType, //查看的来源 从草稿点击提交
                                addReportDialog:that.options.addReportDialog ? that.options.addReportDialog:"",
                                reportsListClassify:opts.reportsListClassify ? opts.reportsListClassify:"", //汇报汇总组件
                                previewAudit:t,
                            });
                        });
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
                                    if(item.capital == 'true'){
                                        item.capValue = $el.find(".capitalShow[data-name='"+item.field_name+"'] span").text();
                                    }
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
                                            ,fileSort:$(this).find(".fileSort").text()
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
                    /*
                     * 去掉后台传回的过期图片地址
                     * */
                    ,deleteOverduePicUrl:function (arr) {
                        for(var i = 0;i<arr.length;i++){
                            if(arr[i].field_type == "pic"){
                                arr[i].valueUrls = [];
                            }
                        }
                        return arr;
                    }
                    /**
                     * 获取图片真实路径
                     * @arr 获取的字段集
                     * @callback 获取真实图片后的回调
                     * */
                    ,getPicTrueUrl:function (aFormStyle ,callback) {
                        var t = this;
                        //更新图片的url
                        var setData = function (arr) {
                            for(var i=0;i<arr.length;i++){
                                //如果是图片类型
                                if(arr[i].field_type == "pic"){
                                    arr[i].valueUrls = []; //专门存图片的真实url
                                    if($.isArray(arr[i].value)){
                                        for(var j=0;j<arr[i].value.length;j++){
                                            //获取图片路径
                                            if(arr[i].value[j]){
                                                Ajax.ajax({
                                                    url:gMain.basePath + "apiCloud/cpCloudCommon/download.do"
                                                    ,data:JSON.stringify({uuid:arr[i].value[j]})
                                                    ,async:false //同步加载
                                                    ,success:function (data) {
                                                        if(data.result = "true"){
                                                            arr[i].valueUrls.push({uuid:arr[i].value[j],url:data.data});
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }

                                //内嵌字段的处理
                                switch (arr[i].field_type){
                                    case "group":
                                        arr[i].group.fields = setData(arr[i].group.fields);
                                        break;
                                    case "twoColumns":
                                        arr[i].firstCol.fields = setData(arr[i].firstCol.fields);
                                        arr[i].secondCol.fields = setData(arr[i].secondCol.fields);
                                        break;
                                    case "threeColumns":
                                        arr[i].firstCol.fields = setData(arr[i].firstCol.fields);
                                        arr[i].secondCol.fields = setData(arr[i].secondCol.fields);
                                        arr[i].thirdCol.fields = setData(arr[i].thirdCol.fields);
                                        break;
                                    default:
                                    //

                                }
                            }
                            return  arr;
                        };
                        aFormStyle = setData(aFormStyle);
                        typeof callback == "function" && callback(aFormStyle);
                    }
                    /**
                     * 初次加载数据和保存数据的时候去掉垃圾字段
                     * @arrJson 待处理的数据
                     * */
                    ,removeUselessFields:function (arrJson) {
                        var t = this;
                        var setData = function (arr) {
                            for(var i=0;i<arr.length;i++){
                                delete arr[i].isDoEdit;

                                //内嵌字段的处理
                                switch (arr[i].field_type){
                                    case "group":
                                        arr[i].group.fields = setData(arr[i].group.fields);
                                        break;
                                    case "twoColumns":
                                        arr[i].firstCol.fields = setData(arr[i].firstCol.fields);
                                        arr[i].secondCol.fields = setData(arr[i].secondCol.fields);
                                        break;
                                    case "threeColumns":
                                        arr[i].firstCol.fields = setData(arr[i].firstCol.fields);
                                        arr[i].secondCol.fields = setData(arr[i].secondCol.fields);
                                        arr[i].thirdCol.fields = setData(arr[i].thirdCol.fields);
                                        break;

                                    default:
                                    //

                                }
                            }
                            return  arr;
                        };
                        return setData(arrJson);
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
                     * 添加接收人
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
                                    if(_.findIndex(t.auditInfo.process_cc,{person_id:obj.audit_person_id - 0}) == -1){
                                        t.auditInfo.process_cc.push({
                                            "person_id" : obj.audit_person_id - 0,
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
                        $(e.target).find("i").css({display:"block"})
                    }
                    ,addProcessCcMouseleave:function (e) {
                        $(e.target).find("i").css({display:"none"})
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

                }
            });
        }
    });
    module.exports = previewAudit;
});
/**
 * Created by THINK on 2017/4/6.
 */
/**
 * 添加汇报
 */

define(function (require,exports,module) {
    require("css/addReport.css");
    var sTpl = require("templates/addReport.html");
    var Ajax = require("js/ajax");
    var w = require("js/plugins/callAppHandler.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var v = require("commonStaticDirectory/plugins/isSupported.js");
    var GetPersonInfor = require("js/plugins/getPersonInfor.js")
    var _ver = require("js/plugins/versionHeader.js");  //判断是否4.5版本以上

    require("js/plugins/jquery.mobiscroll/mobiscroll.android-ics-2.5.2.css");
    require("js/plugins/jquery.mobiscroll/mobiscroll.core-2.5.2.css");

    // 日期选择控件
    require("js/plugins/jquery.mobiscroll/mobiscroll.datetime-2.5.1.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.datetime-2.5.1-zh.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.android-ics-2.5.2.js");

    // 选择控件
    require("js/plugins/jquery.mobiscroll/jquery.scrollSelect.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.core-2.5.2.js");

    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框
    require("commonStaticDirectory/plugins/Validform_v5.3.2.js");  //表单验证插件
    require("commonStaticDirectory/plugins/jquery.loading.js");
    require("js/modules/formPreview/formPreview.js");
    //表单数据展示插件
    require("js/modules/formDataShow/formDataShow.js");
    require("commonStaticDirectory/plugins/headImgLoad/headImgLoad.js");

    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function(){
            return {
                gMain:gMain,
                tempId:null,
                personId:null,
                formId:null,
                handle:null,
                reportCoverShow:false,
                firstChangeLastaFields:true,
                tempName:null,
                aFields:[],
                quoteClick:"0", //是否点击了引用
                isAnother:false, //是否是预览图片和附件中返回而来
                emptyaFields:[], //最初的空表单样式
                personInfor:null, //职工信息
                nodeData:[],
                modleChooseTime:"",
                modleChooseTimeList:[]
                ,nowYear:new Date().getFullYear()
                ,nowMonth:(new Date().getMonth()+1)<10 ? "0"+(new Date().getMonth()+1):(new Date().getMonth()+1)
                ,nowDay:new Date().getDate()<10 ? "0"+new Date().getDate():new Date().getDate()
                ,OrgList:[]      //选择的组织
                ,sParams:""  //路由参数默认值
                ,canSaveReportflag:true //可以提交汇报
                ,successReportflag:false  //提交成功
                ,isReportRouter:false   //预览时点击附件图片跳到腾讯云链接回来之后，会走attached，但是路由不是写汇报的而是预览的
                ,lastaFields:[] //上一次汇报的表单项
                ,auditPersonList:[]  //审批人列表数据
                ,receiverList:[] //接收人列表数据
                ,isShowMoreProcessCc:false
                ,isShowAuditPerson:true  //是否显示审批人和抄送人
                ,quoteReport:{
                    reportNotFirst:false,//不是第一次发起同类型汇报
                    canQuoteFlag:false,  //不是第一次发起但是汇报模板已调整，不可引用上次汇报内容
                    quoteReportAready:false,  //决定显示空的表单还是上一次汇报的表单 false(显示空的表单)
                    lastReceiver:[],    //上一次的接收人
                }
                ,forwardType:"0"   //0:可以转发 1:禁止转发
                ,reporters:[            //发起人信息
                    {
                        inforTitle:"部门"
                        ,inforContent:null
                    }
                    ,
                    {
                        inforTitle:"提交人"
                        ,inforContent:null
                    }
                    ,
                ]
                ,auditInfo:{
                    process_cc:[], //接收人
                }

                    //审批人节点列表
            }
        }
        /**
         * 监控路由改变
         * */
        ,route: {
            data: function (transition) {
                return {
                    sParams: transition.to.fullPath
                }
            }
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
                    t.lastaFields = t.deleteOverduePicUrl(t.lastaFields);
                    t.getPicTrueUrl(t.lastaFields,function (arr) {
                        arr = t.removeUselessFields(arr);  //去掉垃圾字段
                        t.lastaFields = JSON.parse(JSON.stringify(arr)); //表单数据
                        t.firstChangeLastaFields = false;
                    });
                }
            },
            'sParams': function (val) {
                var t = this;
                if(val == '/addReport/:temp_id/:form_id/:handle'){
                    t.isReportRouter = true;
                    if(t.aFields.length != 0){
                        $("#single_report_handle").show();
                        if(localStorage.getItem("wintop")){
                            $("body").scrollTop(localStorage.getItem("wintop"));
                            localStorage.removeItem("wintop");
                        }
                    }
                    if(JSON.parse(window.localStorage.getItem("previewStyle"))) {  //有，则是从预览图片或附件返回而来
                        t.isAnother = true;
                        t.tempName = JSON.parse(window.localStorage.getItem("previewTitle"));
                    }
                    if(t.tempName){
                        t.initPageHeader();
                    }
                    t.inputNoteBtnMove();
                }
            }
        }
        ,attached:function () {
            var t = this;
            // if(!v.isSupported()){ //旧版 APP 不支持，弹出升级提示，并不再渲染页面
            //     return false;
            // }
            // t.orgPersonListSelect("7583");
            t.tempId = t.$route.params.temp_id;
            t.formId = t.$route.params.form_id;
            t.handle = t.$route.params.handle;
            t.initDateTimeSelectPlugin();
            t.getBeforeWeek();
            if(gMain.personInforReport && gMain.personInforReport.personId){
                t.personInfor = gMain.personInforReport;
                t.personId = t.personInfor.personId;
            }else{
                GetPersonInfor();
                t.personInfor = gMain.personInforReport;
                t.personId = t.personInfor.personId;
            }
            if(localStorage.getItem("wintop")){ //进入多选框时记录的top值
                localStorage.removeItem("wintop");
            }
            if(JSON.parse(window.localStorage.getItem("previewStyle"))){  //有，则是从预览图片或附件返回而来
                t.isAnother = true;
                t.forwardType = JSON.parse(window.localStorage.getItem("previewForward"));
                if(t.forwardType == "1"){
                    $("#single_report_handle").find(".can_share_wrap .switch_wrap").attr({"data-status":"off"});
                    $("#single_report_handle").find(".can_share_wrap .switch_wrap").attr({"class":"switch_wrap"});
                }else{
                    $("#single_report_handle").find(".can_share_wrap .switch_wrap").attr({"data-status":"on"});
                    $("#single_report_handle").find(".can_share_wrap .switch_wrap").attr({"class":"switch_wrap active"});
                }
            }
            t.getTempNameById();
            t.quoteLastReport();
            $.when(t.getStyleForMongo()).done(function () {
                clearInterval(gMain.intervalAdd);
                gMain.intervalAdd = setInterval(function () {
                    var afilds = $.extend(true,[],t.aFields);
                    var nodeDatalocal = t.setValue(afilds);//把发起人的信息拼接到表单信息//表单填写完毕的json数据
                    var nodeDatalocalClear = []; // 去掉个人信息
                    $.each(nodeDatalocal,function (num,val) {
                        if(nodeDatalocal[num].field_type != "default_field"){
                            nodeDatalocalClear.push(nodeDatalocal[num]);
                        }
                    })
                    localStorage.setItem(t.tempId+"-"+t.personId,JSON.stringify(nodeDatalocalClear));
                },1000)
            });
            try{
                $("#report_app_index_test").remove();
            }catch(e){}
            try{
                $("#loading_wrap_detail").remove();
            }catch(e){}
        }
        ,compiled:function () {
            var t = this;
        },
        beforeDestroy:function () {
            var t = this;
            clearInterval(gMain.intervalAdd);
            $("input,textarea").blur();
            // alert(localStorage.getItem(t.tempId+"-"+t.personId));
        }
        ,methods:{
            initPageHeader: function () {
                var t = this,headerColor;
                if(_ver.versionHeader()){
                    headerColor = "";
                }else{
                    headerColor = "473f3a";
                }
                var data = {
                    leftBtn: "draft-save", //左边按钮，””表示无左边按钮
                    headerColor: headerColor, //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title", t.tempName);
            },
            coverPageHeader:function (name) {
                var t = this,headerColor;
                if(_ver.versionHeader()){
                    headerColor = "";
                }else{
                    headerColor = "473f3a";
                }
                var data = {
                    leftBtn: "", //左边按钮，””表示无左边按钮
                    headerColor: headerColor, //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title", name);
            },
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
            //初始化radio单选控件
            initRadioChooseTime:function(e,radioList){
                var that = this;
                $(e.target).blur()
                if($(".dayhApp_scrollSelect").length){
                    $(".dayhApp_scrollSelect").remove();
                    $(".dayhApp_scrollSelect_shade").remove();
                }
                var lists = [];
                var key='',value=$(e.target).val();
                var obj={};
                var index;
                for(var i=0;i<radioList.length;i++){
                    obj={
                        key:i+1,
                        value:radioList[i]
                    };
                    lists.push(obj);
                    if(value && value == radioList[i]){
                        index = i;
                    }
                }
                $(e.target).val(value).attr('data-sid',index+1).scrollSelect({
                    eleType:"input" //节点类型
                    ,data:lists
                    ,rows:4
                    ,callback: function($el){
                        var t = this;
                        var val = $(".dw-li[aria-selected = 'true']").find("div").text();
                        $(e.target).val(val);
                    }
                });
            },
            //初始化时间选择控件
            initDateTimeSelectPlugin:function(){
                var that = this;
                var currYear = (new Date()).getFullYear();
                $("#single_report_handle").off("focus.choose_time").on("focus.choose_time",".choose_time_wrap input.choose_time",function (e) {
                    var myDate = new Date();
                    var _name = $(this).attr("name");
                    var thisVal = $(e.target).val();
                    if(thisVal){
                        myDate = new Date(thisVal);
                        if($(this).attr("data-type") == "1"){ //ios NaN
                            thisVal = thisVal.replace(/-/g,':').replace(' ',':');
                            thisVal = thisVal.split(':');
                            myDate = new Date(thisVal[0],(thisVal[1]-1),thisVal[2],thisVal[3],thisVal[4]);
                        }
                    }
                    if($(this).attr("data-type") == "1"){ //年月日时分

                    }else if($(this).attr("data-type") == "2"){ //年月日
                        options = {
                            theme: 'android-ics light', //皮肤样式
                            display: 'modal', //显示方式
                            mode: 'scroller', //日期选择模式
                            lang:'zh',
                            startYear:currYear-10, //开始年份
                            endYear:currYear+1, //结束年份
                            setText:'完成',
                            cancelText:'取消',
                            dateFormat:'yyyy-mm-dd',
                            preset : 'date',
                            custom:'',      // ampm hm
                            onSelect:function(data){
                                var t = this;
                            }
                        }
                        $(this).mobiscrollDT(options).date(options).mobiscrollDT('setDate', myDate, true);
                    }else if($(this).attr("data-type") == "3"){ //年月
                        var options = {
                            theme: 'android-ics light', //皮肤样式
                            display: 'modal', //显示方式
                            mode: 'scroller', //日期选择模式
                            lang:'zh',
                            startYear:currYear-10, //开始年份
                            endYear:currYear+1, //结束年份
                            setText:'完成',
                            cancelText:'取消',
                            dateFormat:'yyyy-mm',
                            dateOrder:'yyyymm',
                            preset : 'date',
                            custom:'',      // ampm hm
                            onSelect:function(data){
                                var t = this;
                            }
                        }
                        $(this).mobiscrollDT(options).date(options).mobiscrollDT('setDate', myDate, true);
                    }
                    $(this).blur();
                });
            },
            /*
             * 进入便签按钮拖拽
             * */
            inputNoteBtnMove:function () {
                var t = this;
                $("#report_clipboard_inputBtn").on("touchstart",function (e) {
                    var $this = $(this);
                    var starX,starY,elleft,eltop,disX,disY,endX,endY;
                    starX = e.originalEvent.changedTouches[0].pageX;
                    starY = e.originalEvent.changedTouches[0].pageY;

                    elleft = $this.offset().left;
                    eltop = $this.offset().top - $(window).scrollTop();
                    /*点击位置距离元素左侧上侧的距离*/
                    disX = starX - elleft;
                    disY = starY - eltop;

                    $this.off("touchmove").on("touchmove", function (e) {
                        endX = e.originalEvent.changedTouches[0].pageX - disX;
                        endY = e.originalEvent.changedTouches[0].pageY - disY;
                        if(endX > $(window).width()-45){
                            endX = $(window).width()-45;
                        }
                        if(endX < 0){
                            endX = 0;
                        }
                        if(endY > $(window).height()-33){
                            endY = $(window).height()-33;
                        }
                        if(endY < 33){
                            endY = 33;
                        }
                        $this.css({"top":endY+"px"});

                        e.preventDefault();
                        e.stopPropagation();
                    })
                });
            },
            /*
            * 多选框填值
            * */
            checkBoxPushValue:function (fieldName,value) {
                var t = this;
                var $el = $(t.$el);
                $("#single_report_handle").find("input[name='"+fieldName+"']").val(value);
            },
            /*
             * 跳转到便签页
             * */
            jumpClipboard:function () {
                var  t = this;
                if($("#clipboard_wrap").length && $("#clipboard_wrap").length != 0){
                    return false;
                }else{
                    location.href = "#!/addReport/"+t.tempId+"/"+t.formId+"/"+t.handle+"/clipboard";
                }
            },
            /**
             * 根据tempId获取tempName
             * */
            getTempNameById:function () {
                var t = this;
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrReportTemp/getTempName.do"
                    ,data:JSON.stringify({
                        tempId:t.tempId+""
                    })
                    ,beforeSend:function () {

                    }
                    ,complete:function () {

                    }
                    ,success:function (data) {
                        if(data.result == "true" && data.data){
                            t.tempName = data.data.tempName;
                            if(!t.isAnother){
                                t.initPageHeader();
                            }
                        }
                    }
                });
            },

            /*
            * 进入接收人列表
            * */
            inReceiverCover:function () {
                var t = this,headerColor;
                if(_ver.versionHeader()){
                    headerColor = "";
                }else{
                    headerColor = "473f3a";
                }
                if(t.receiverList.length == 0){
                    t.chooseReceiver();
                }else{
                    var data = {
                        leftBtn: "back", //左边按钮，””表示无左边按钮
                        headerColor: headerColor, //导航条背景颜色，””表示默认颜色
                        rightBtn: []
                    };
                    w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                    w.callAppHandler("h5_set_page_title", "添加接收人");
                    $("#single_report_handle").hide();
                    window.location.href = "#!/addReport/"+t.tempId+"/"+t.formId+"/"+t.handle+"/reportReceiver"
                }
            },
            /*
            * 选择汇报对象
            * */
            chooseReceiver:function () {
                var t = this;
                var param = {
                    selectSelf:true //是否可以选自己
                    ,selectFriends:false //是否可以选好友
                    ,singleSelect:false // 是否限制为单选 （ true:单选，只能选一个人，不能选组织）
                    ,cached:false  //是否使用缓存   cache为true时，selectedUserInfo和selectedOrgInfo为[]
                    ,selectedUserInfo:[] //默认选择的用户列表
                    ,selectedOrgInfo:[]  //默认选择的组织列表
                };
                w.callAppHandler("h5_address_list_picker_new", param); //用于4.2版本及以上
                // w.callAppHandler("h5_address_list_picker","noCached");
                var interval = setInterval(function(){
                    //获取到人员属性
                    if(gMain.h5PersonInfo && (gMain.h5PersonInfo.UserInfo || gMain.h5PersonInfo.OrganizeInfo)){
                        clearInterval(interval);
                        if(gMain.h5PersonInfo.UserInfo){
                            $.each(gMain.h5PersonInfo.UserInfo,function (num,val) {
                                if(_.findIndex(t.receiverList,{personId:val.EmpId - 0}) == -1){
                                    var obj = {
                                        personId:val.EmpId - 0,
                                        personName:val.EmpName,
                                        headImg:val.UserImg
                                    }
                                    if(obj.headImg != undefined && obj.headImg != ""){
                                        obj.headImg = "group" + obj.headImg.split("group")[1];
                                    }
                                    t.receiverList.push(obj);
                                }
                            });
                        }
                        if(gMain.h5PersonInfo.OrganizeInfo){
                            $.each(gMain.h5PersonInfo.OrganizeInfo,function (num,val) {
                                var obj = {
                                    OrganizeId:val.OrganizeId+"",
                                    OrganizeName:val.OrganizeName,
                                }
                                t.orgPersonListSelect(obj.OrganizeId);
                            });
                            gMain.h5PersonInfo = {};
                        }else{
                            gMain.h5PersonInfo = {};
                        }
                    }
                }, 300);
            },
            /*
            * 删除汇报对象
            * */
            delReceiver:function (personId) {
                var t = this;
                for(var i = 0;i<t.receiverList.length;i++){
                    if((t.receiverList[i].personId+"") == (personId+"")){
                        t.receiverList.splice(i,1);
                    }
                }
            },
            /**
             * 根据orgId获取职位/人员列表
             * */
            orgPersonListSelect:function (OrgId) {
                var t = this;
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrOrgPerson/getPersonListByOrgId.do"
                    ,data:JSON.stringify({
                        orgId:OrgId
                        ,isInclude:true //是否包含下级
                    })
                    ,beforeSend:function () {

                    }
                    ,complete:function () {

                    }
                    ,success:function (data) {
                        if(data.result == "true" && data.data.list){
                            $.each(data.data.list,function (num,val) {
                                /* _.findIndex  数据类型不一样 也会是 -1 */
                                if(_.findIndex(t.receiverList,{personId:val.personId - 0}) == -1){
                                    var obj = {
                                        personId:val.personId - 0,
                                        personName:val.personName,
                                        headImg:val.headImg
                                    }
                                    if(obj.headImg != undefined && obj.headImg != ""){
                                        obj.headImg = "group" + obj.headImg.split("group")[1];
                                    }
                                    t.receiverList.push(obj);
                                }
                            });
                        }
                    }
                });
            },
            switchClick:function (e) {
                var t = this;
                var $dom = $(e.target).attr("class") == "switch_wrap active" ? $(e.target): $(e.target).parent();
                if($dom.attr("data-status") == "off"){
                    $dom.find(".circle").animate({
                        left:"22px"
                    },200);
                    $dom.css({background:"#FF7123"})
                    $dom.attr({"data-status":"on"});
                    t.forwardType = "0";
                }else{
                    $dom.find(".circle").animate({
                        left:"1px"
                    },200);
                    $dom.css({background:"#ccc"})
                    $dom.attr({"data-status":"off"});
                    t.forwardType = "1";
                }
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
                        id:t.formId,
                        mongoSymbol:"formStyle_table"
                    })
                    ,beforeSend:function () {
                        $("body").loading({zIndex:999}); //开启提交遮罩
                    }
                    ,complete:function () {
                        $("body").loading({state:false}); //关闭提交遮罩
                    }
                    ,success:function (data) {
                        if(data.result == "true" && data.data){
                            df.resolve();
                            var aFields = JSON.parse(data.data).fields;
                            t.aFields = aFields;
                            t.emptyaFields = t.aFields.slice(0);
                            if(t.isAnother){
                                t.aFields = JSON.parse(window.localStorage.getItem("previewStyle"));
                                t.nodeData = t.aFields.slice(0);
                                t.receiverList = JSON.parse(window.localStorage.getItem("previewReceiver"));
                            }else{
                                //如果后台获取的表单项条数和本地不符合  则说明模板改变
                                if(localStorage.getItem(t.tempId+"-"+t.personId) && (JSON.parse(localStorage.getItem(t.tempId+"-"+t.personId)).length == t.aFields.length)){
                                    // alert(2)
                                    aFields = JSON.parse(localStorage.getItem(t.tempId+"-"+t.personId));
                                    aFields  = t.deleteOverduePicUrl(aFields);
                                    t.getPicTrueUrl(aFields,function (arr) {
                                        arr = t.removeUselessFields(arr);  //去掉垃圾字段
                                        t.aFields = JSON.parse(JSON.stringify(arr)); //表单数据
                                        // alert(JSON.stringify(t.aFields));
                                    });
                                }
                            }
                        }
                    }
                });
                return df;
            }
            /**
             * 提交表单数据
             * */
            ,submitData:function () {
                var t = this;
                $('#add_report_app').trigger("validate"); //触发表单验证
                t.oFormValidForm.submitForm(false);
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
                        formId:t.formId.toString(),
                        tempId:t.tempId.toString()
                    })
                    ,beforeSend:function () {

                    }
                    ,complete:function () {

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
                                            "personId" : data.data.receiverList[i].receiverId,
                                            "personName" : data.data.receiverList[i].receiverName,
                                            "headImg":data.data.receiverList[i].headImg
                                        }
                                        t.quoteReport.lastReceiver.push(obj);
                                    }
                                    t.receiverList = t.quoteReport.lastReceiver.slice(0);
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
                        amyLayer.alert("汇报模板已调整，不可引用上次汇报内容");
                    }
                }
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
                                case "checkboxes":
                                case "radio":
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
                                    break;
                            }
                        }else{
                        }
                    }
                }
                setValidate(t.aFields);
                setTimeout(function () {
                    //表单验证
                    t.oFormValidForm = $('#add_report_app').Validform({
                        tipSweep:true, //提交表单时候才提示验证结果
                        tiptype:function(msg,o,cssctl){
                            if(o.type == 3){
                                amyLayer.alert(msg);
                            }else{

                            }
                        },
                        showAllError:false,
                        datatype:{
                            //验证文件上传
                            "isEmplyFile":function(gets,obj,curform,regxp){
                                var $el = $(t.$parent.$el);
                                return $el.find(".addFilePreview").find("li").length?true:false;
                            },
                            //验证图片上传
                            "isEmplyPic":function(gets,obj,curform,regxp){
                                var $el = $(t.$parent.$el);
                                return $el.find(".addPicPreview").find(".imgPreview").length?true:false;
                            },
                            //验证日期区间
                            "isEmplyDatearea":function(gets,obj,curform,regxp){
                                // console.log($(obj).parent().parent());
                                var isEmply = false;
                                $(obj).parent().parent().find("input.Wdate").each(function () {
                                    if(!$.trim($(this).val())){
                                        isEmply = true;
                                    }
                                });
                                return isEmply?false:true;
                            },
                            //验证复选，单选框
                            "isEmplyCheckboxRadio":function(gets,obj,curform,regxp){
                                var isHasValue = false;
                                var $el = $(t.$el);

                                $el.find("input[type='radio']").each(function () {
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
                            t.openPreview();
                            return false;
                        }
                    });
                    t.oFormValidForm.addRule(aRules);
                },100);
            }
            /**
             * 打开预览
             * */
            ,openPreview:function () {
                var t = this;
                var $el = $(t.$el);
                t.nodeData = t.setValue(t.aFields).slice(0);//把发起人的信息拼接到表单信息//表单填写完毕的json数据
                var addPersonInfor = {
                    headImg:t.personInfor.headImg+"",
                    orgId:t.personInfor.orgId+"",
                    orgName:t.personInfor.orgName+"",
                    personId:t.personInfor.personId+"",
                    personName:t.personInfor.personName+"",
                    posName:t.personInfor.posName+""
                };//表单信息添加上个人信息
                var havePerInfor = true; // 是否要添加
                for(var i = 0;i<t.nodeData.length;i++){
                    if(t.nodeData[i].field_type == "default_field"){
                        t.nodeData[i].value = addPersonInfor;
                        havePerInfor = false;
                    }
                }
                if(addPersonInfor){
                    t.nodeData.push(
                        {
                            "field_type": "default_field",
                            "field_name": "personInfor",
                            "value":addPersonInfor
                        }
                    )
                }
                t.getPicTrueUrl(t.nodeData,function (arr) {
                    arr = t.removeUselessFields(arr);  //去掉垃圾字段
                    t.nodeData = JSON.parse(JSON.stringify(arr)); //表单数据
                });
                var headerColor;
                if(_ver.versionHeader()){
                    headerColor = "";
                }else{
                    headerColor = "473f3a";
                }
                var data = {
                    leftBtn: "back", //左边按钮，””表示无左边按钮
                    headerColor: headerColor, //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title", "预览");
                $("#single_report_handle").hide();
                window.location.href = "#!/addReport/"+t.tempId+"/"+t.formId+"/"+t.handle+"/previewReport";
                return false;
            }
            /*
            * 取消提交返回修改
            * */
            ,cancelSubmit:function () {
                var t = this;
                t.handle = "edit";
                console.log(t.aFields)
                t.initPageHeader();
            }
            /**
             * 拼接表单填写的值
             * */
            ,setValue:function (arr) {
                var t = this;
                var $el = $(t.$parent.$el);
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
                            $el.find("input[name='"+item.field_name+"']").each(function () {
                                value = $(this).val();
                            });
                            item.value = value;
                            break;
                        case "checkboxes":
                            var value = [];
                            $el.find("input[name='"+item.field_name+"']").each(function () {
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
            /*
            * 提交汇报
            * */
            ,saveReport:function () {
                var t = this,postUrl;
                var recipientList = [];
                var changeCount = false;
                if(t.canSaveReportflag && !t.successReportflag){
                    Ajax.ajax({
                        url:gMain.apiBasePath + "wrOrgPerson/getPersonBaseInfo.do"
                        ,async:false
                        ,beforeSend:function () {
                        }
                        ,complete:function () {
                        }
                        ,success:function (data) {
                            if(data.result == "true"){
                                if((data.data.orgId == gMain.personInforReport.orgId) && (data.data.orgName == gMain.personInforReport.orgName) && (data.data.personId == gMain.personInforReport.personId) && (data.data.personName== gMain.personInforReport.personName)){

                                }else{  //登录人信息改变
                                    changeCount = true;
                                }
                            }
                        }
                    });
                }
                if(changeCount){
                    $("#preview_report_wrap .draft_cover_wrap").show();
                    return false;
                }
                $.each(t.receiverList,function (key,val) {
                    var objTemp = {
                        "type":"0",
                        "receiverId":""
                    };
                    objTemp.receiverId = val.personId+"";
                    recipientList.push(objTemp);
                });
                var imBody = "";
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
                if(t.nodeData.length>3){
                    for(var i = 0;i<3;i++){
                        if(t.nodeData[i].field_type == "twoColumns" || t.nodeData[i].field_type == "threeColumns"){
                            $.each(t.nodeData[i].firstCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            $.each(t.nodeData[i].secondCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            if(t.nodeData[i].thirdCol){
                                $.each(t.nodeData[i].thirdCol.fields,function (num,val){
                                    imbodyFun(val);
                                })
                            }
                        }else{
                            imbodyFun(t.nodeData[i]);
                        }
                    }
                }else {
                    for(var i = 0;i<t.nodeData.length;i++){
                        if(t.nodeData[i].field_type == "twoColumns" || t.nodeData[i].field_type == "threeColumns"){
                            $.each(t.nodeData[i].firstCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            $.each(t.nodeData[i].secondCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            if(t.nodeData[i].thirdCol){
                                $.each(t.nodeData[i].thirdCol.fields,function (num,val){
                                    imbodyFun(val);
                                })
                            }
                        }else{
                            imbodyFun(t.nodeData[i]);
                        }
                    }
                }
                /*给后台截取一份简短的表单*/
                var smsNodeData = [];
                if(t.nodeData.length > 3){
                    smsNodeData = t.nodeData.slice(0,3);
                }else{
                    smsNodeData = t.nodeData.slice(0);
                }
                var startTime = "";
                startTime = $("#single_report_handle").find(".choose_time_wrap input.choose_time").val()
                if(t.tempName == "周报"){
                    startTime = startTime.slice(0,10);
                    startTime = startTime.replace(/\//g,"-");
                }
                var oPostData = {
                    "formId":t.formId+"",
                    "forwardType":t.forwardType,//禁止转发
                    "status":"1",////提交状态 1: 已发送 2:草稿
                    "remark":"test",//备注（无）
                    "startTime":startTime,//用户选择时间
                    "endTime":"",
                    "reportType":"1",//模板类型 0 :系统模板 1:用户新增
                    "personName":t.personInfor.personName,//发起人名字
                    "receiver":recipientList, //接收人
                    "nodeData":JSON.stringify(t.nodeData),
                    "tempId":t.tempId+"",
                    "imTitle":t.tempName+"",
                    "imBody":imBody,
                    "sms":JSON.stringify(smsNodeData),
                };
                // alert(JSON.stringify(oPostData));
                postUrl = gMain.apiBasePath + "wrReportData/addReportData.do";
                if(oPostData.receiver.length > 0 && t.canSaveReportflag && !t.successReportflag){   //汇报接收人为空 提交未完成  提交已成功  不能点击
                    t.canSaveReportflag = false;
                    //保存数据
                    Ajax.ajax({
                        url:postUrl,
                        data:JSON.stringify(oPostData),
                        beforeSend:function () {
                            $("body").loading({zIndex:999}); //开启提交遮罩
                        },
                        complete:function () {
                            t.canSaveReportflag = true;
                            $("body").loading({state:false}); //关闭提交遮罩
                        },
                        success:function(data) {
                            if (data.result == "true") {
                                amyLayer.alert("提交成功"); //成功提示弹层
                                t.successReportflag = true;
                                clearInterval(gMain.intervalAdd);
                                $(".report_submit_sure").css({color:"#999"});
                                if(localStorage.getItem(t.tempId+"-"+t.personId)){
                                    localStorage.removeItem(t.tempId+"-"+t.personId);
                                }
                                if(t.isAnother){
                                    window.localStorage.removeItem("previewStyle");
                                    window.localStorage.removeItem("previewReceiver");
                                    window.localStorage.removeItem("previewForward");
                                    window.localStorage.removeItem("previewTitle");
                                }
                                location.replace("#!/");
                                // window.location.href = "#!/";
                                // window.location.href = gMain.basePath + "views/common/go.jsp?sPath="+encodeURIComponent('/views/report_mobile/')+"&sRouter="+encodeURIComponent('/chooseTemp');
                            }
                        }
                    });
                }else{
                    if(!(oPostData.receiver.length > 0)){
                        amyLayer.alert("接收人不能为空"); //错误提示弹层
                    }
                }
            }
            /*
             * 存草稿
             * */
            ,saveDraft:function (status) {
                var t = this,postUrl;
                t.nodeData = t.setValue(t.aFields).slice(0);//把发起人的信息拼接到表单信息//表单填写完毕的json数据
                var recipientList = [];
                $.each(t.receiverList,function (key,val) {
                    var objTemp = {
                        "type":"0",
                        "receiverId":""
                    };
                    objTemp.receiverId = val.personId+"";
                    recipientList.push(objTemp);
                });
                var imBody = "";
                if(status == "1"){  //保存
                    var oPostData = {
                        "formId":t.formId+"",
                        "forwardType":t.forwardType,//禁止转发
                        "status":"2",////提交状态 1: 已发送 2:草稿
                        "remark":"test",//备注（无）
                        "startTime":"",//搜索时间区段
                        "endTime":"",
                        "reportType":"1",//模板类型 0 :系统模板 1:用户新增
                        "personName":t.personInfor.personName,//发起人名字
                        "receiver":recipientList, //接收人
                        "nodeData":JSON.stringify(t.nodeData),
                        "tempId":t.tempId+"",
                        "imTitle":t.tempName+"",
                        "imBody":imBody,
                    };
                    // alert(JSON.stringify(t.nodeData));
                    postUrl = gMain.apiBasePath + "wrReportData/addReportData.do";
                    //保存数据
                    Ajax.ajax({
                        url:postUrl,
                        data:JSON.stringify(oPostData),
                        beforeSend:function () {
                            $("body").loading({zIndex:999}); //开启提交遮罩
                        },
                        complete:function () {
                            $("body").loading({state:false}); //关闭提交遮罩
                        },
                        success:function(data) {
                            if (data.result == "true") {
                                amyLayer.alert("保存成功"); //成功提示弹层
                                $("#single_report_handle").find(".draft_cover_wrap").hide();
                                if(t.isAnother){
                                    window.localStorage.removeItem("previewStyle");
                                    window.localStorage.removeItem("previewReceiver");
                                    window.localStorage.removeItem("previewForward");
                                    window.localStorage.removeItem("previewTitle");
                                }
                                location.replace("#!/");
                                // window.location.href = "#!/";
                                // window.location.href = gMain.basePath + "views/common/go.jsp?sPath="+encodeURIComponent('/views/report_mobile/')+"&sRouter="+encodeURIComponent('/chooseTemp');
                            }
                        }
                    });
                }else if(status == "0"){
                    $("#single_report_handle").find(".draft_cover_wrap").hide();
                    if(t.isAnother){
                        window.localStorage.removeItem("previewStyle");
                        window.localStorage.removeItem("previewReceiver");
                        window.localStorage.removeItem("previewForward");
                        window.localStorage.removeItem("previewTitle");
                    }
                    location.replace("#!/");
                    // window.location.href = "#!/";
                }
            }
        }
        ,transitions:{

        }
        ,directives: {
            'app-head-img':function(data){
                if (!$.isEmptyObject(data)) {
                    $(this.el).headImgLoad({
                        userId: data.personId //dd号
                        , userName: data.personName
                        , userImg: gMain.DayHRDomains.baseStaticDomain + data.headImg
                    });
                }
            }
        }
    });
    module.exports = VueComponent;
});



/**
 * Created by THINK on 2017/4/6.
 */
/**
 * 编辑草稿
 */

define(function (require,exports,module) {
    require("css/draftEdit.css");
    var sTpl = require("templates/draftEdit.html");
    var Ajax = require("js/ajax");
    var w = require("js/plugins/callAppHandler.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var v = require("commonStaticDirectory/plugins/isSupported.js");

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
                reportId:null,
                tempId:null,
                formId:null,
                handle:null,
                singleReportData:{},
                firstChangeLastaFields:true,
                tempName:null,
                aFields:null,
                isAnother:false, //是否是预览图片和附件中返回而来
                canDelReceiverFlag:false,
                personInfor:null, //职工信息
                nodeData:[],
                OrgList:[]      //选择的组织
                ,sParams:""  //路由参数默认值
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
                if(val == '/draftEdit/:report_id/:handle'){
                    $("#single_report_handle").show();
                    t.initPageHeader();
                }
            }
        }
        ,attached:function () {
            var t = this;
            // if(!v.isSupported()){ //旧版 APP 不支持，弹出升级提示，并不再渲染页面
            //     return false;
            // }
            t.reportId = t.$route.params.report_id;
            t.handle = t.$route.params.handle;
            if(JSON.parse(window.localStorage.getItem("previewStyle"))){  //有，则是从预览图片或附件返回而来
                t.isAnother = true;
            }else{
                t.initPageHeader();
            }
            t.getStyleForMongo();
            t.getPersonInfo();
        }
        ,compiled:function () {

        }
        ,methods:{
            initPageHeader: function () {
                var t = this;
                var data = {
                    leftBtn: "draft-save", //左边按钮，””表示无左边按钮
                    headerColor: "473f3a", //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title", "草稿编辑");
            },
            coverPageHeader:function (name) {
                var t = this;
                var data = {
                    leftBtn: "", //左边按钮，””表示无左边按钮
                    headerColor: "473f3a", //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title", name);
            },
            getPersonInfo:function () {
                var t = this;
                //获取汇报的模板列表
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrOrgPerson/getPersonInfo.do"
                    ,beforeSend:function () {
                        $("body").loading({zIndex:999999999}); //开启提交遮罩
                    }
                    ,complete:function () {
                        $("body").loading({state:false}); //关闭提交遮罩
                    }
                    ,success:function (data) {
                        if(data.result == "true"){
                            t.personInfor = data.data;
                        }
                    }
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
             * 显示可以删除接收人标志
             * */
            canDelReceiver:function () {
                var t = this;
                t.canDelReceiverFlag = !t.canDelReceiverFlag;
            },
            /*
             * 进入接收人列表
             * */
            inReceiverCover:function () {
                var t = this;
                if(t.receiverList.length == 0){
                    t.chooseReceiver();
                }else{
                    var data = {
                        leftBtn: "back", //左边按钮，””表示无左边按钮
                        headerColor: "473f3a", //导航条背景颜色，””表示默认颜色
                        rightBtn: []
                    };
                    w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                    w.callAppHandler("h5_set_page_title", "添加接收人");
                    $("#single_report_handle").hide();
                    window.location.href = "#!/draftEdit/"+t.reportId+"/"+t.handle+"/reportReceiver";
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
                var $dom = $(e.target).attr("class") == "switch_wrap" ? $(e.target): $(e.target).parent();
                if($dom.attr("data-status") == "off"){
                    $dom.find(".circle").animate({
                        left:"22px"
                    },200);
                    $dom.css({background:"#FF7123"})
                    $dom.attr({"data-status":"on"});
                    t.forwardType = "1";
                }else{
                    $dom.find(".circle").animate({
                        left:"1px"
                    },200);
                    $dom.css({background:"#ccc"})
                    $dom.attr({"data-status":"off"});
                    t.forwardType = "0";
                }
            },
            /**
             * 获取表单json
             * */
            getStyleForMongo:function () {
                var t = this;
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrReportData/getReportDataById.do",
                    data:JSON.stringify({
                        reportId:t.reportId+"",
                    }),
                    beforeSend:function () {
                        $("body").loading({zIndex:999999999}); //开启提交遮罩
                    },
                    complete:function () {
                        $("body").loading({state:false}); //关闭提交遮罩
                    },
                    success:function(data) {
                        if (data.result == "true"){
                            t.singleReportData = JSON.parse(JSON.stringify(data.data.data));
                            t.tempName = t.singleReportData.wrData.tempName;
                            for(var i = 0;i<data.data.data.receiverList.length;i++){
                                var obj = {
                                    personId:data.data.data.receiverList[i].receiverId,
                                    personName:data.data.data.receiverList[i].receiverName,
                                    headImg:data.data.data.receiverList[i].headImg,
                                }
                                t.receiverList.push(obj);
                            }
                            t.nodeData = JSON.parse(data.data.data.wrData.nodeData);
                            t.forwardType = data.data.data.wrData.forwardType+"";
                            if(t.isAnother){      //直接从localstorage里拿值覆盖
                                t.nodeData = JSON.parse(window.localStorage.getItem("previewStyle"));
                                t.receiverList = JSON.parse(window.localStorage.getItem("previewReceiver"));
                                t.forwardType = JSON.parse(window.localStorage.getItem("previewForward"));
                            }
                            if(t.forwardType == "0"){
                                $("#single_report_handle").find(".can_share_wrap .switch_wrap").attr({"data-status":"off"});
                                $("#single_report_handle").find(".can_share_wrap .switch_wrap").attr({"class":"switch_wrap"});
                            }else{
                                $("#single_report_handle").find(".can_share_wrap .switch_wrap").attr({"data-status":"on"});
                                $("#single_report_handle").find(".can_share_wrap .switch_wrap").attr({"class":"switch_wrap active"});
                            }
                            t.aFields = t.nodeData.slice(0);
                            t.getPicTrueUrl(t.aFields,function (arr) {
                                arr = t.removeUselessFields(arr);  //去掉垃圾字段
                                t.aFields = JSON.parse(JSON.stringify(arr)); //表单数据
                            });
                        }
                    }
                });
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
                                console.log($(obj).parent().parent());
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
                t.getPicTrueUrl(t.nodeData,function (arr) {
                    arr = t.removeUselessFields(arr);  //去掉垃圾字段
                    t.nodeData = JSON.parse(JSON.stringify(arr)); //表单数据
                });
                var data = {
                    leftBtn: "back", //左边按钮，””表示无左边按钮
                    headerColor: "473f3a", //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title", "预览");
                $("#single_report_handle").hide();
                window.location.href = "#!/draftEdit/"+t.reportId+"/"+t.handle+"/previewReport";
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
                $.each(t.receiverList,function (key,val) {
                    var objTemp = {
                        "type":"0",
                        "receiverId":""
                    };
                    objTemp.receiverId = val.personId+"";
                    recipientList.push(objTemp);
                });
                var imBody = "";
                if(t.nodeData.length>3){
                    for(var i = 0;i<3;i++){
                        if(t.nodeData[i].label){
                            imBody = imBody+t.nodeData[i].label+"<br/>";
                        }
                        if(t.nodeData[i].field_type == "pic"){

                        }else if(t.nodeData[i].field_type == "file"){  //文件另做处理
                            if(t.nodeData[i].value){
                                $.each(t.nodeData[i].value,function (num,val) {
                                    imBody = imBody+val.fileName+"<br/>";
                                })
                            }
                        }else if(t.nodeData[i].field_type != "default_field"){
                            if(t.nodeData[i].value){
                                imBody = imBody+t.nodeData[i].value+"<br/>";
                            }
                        }
                    }
                }else {
                    for(var i = 0;i<t.nodeData.length;i++){
                        if(t.nodeData[i].label){
                            imBody = imBody+t.nodeData[i].label+"<br/>";
                        }
                        if(t.nodeData[i].field_type == "pic"){

                        }else if(t.nodeData[i].field_type == "file"){  //文件另做处理
                            if(t.nodeData[i].value){
                                $.each(t.nodeData[i].value,function (num,val) {
                                    imBody = imBody+val.fileName+"<br/>";
                                })
                            }
                        }else if(t.nodeData[i].field_type != "default_field"){
                            if(t.nodeData[i].value){
                                imBody = imBody+t.nodeData[i].value+"<br/>";
                            }
                        }
                    }
                }
                var oPostData = {
                    "dataId":t.singleReportData.wrData.dataId+"",
                    "forwardType":t.forwardType,//禁止转发
                    "status":"1",////提交状态 1: 已发送 2:草稿
                    "receiver":recipientList, //接收人
                    "nodeData":JSON.stringify(t.nodeData),
                    "imTitle":t.singleReportData.wrData.tempName+"",
                    "imBody":imBody,
                    "uuid":t.singleReportData.wrData.uuid+"",
                };
                // alert(JSON.stringify(oPostData));
                postUrl = gMain.apiBasePath + "wrReportData/updateReportData.do";
                if(oPostData.receiver.length > 0){   //汇报接收人不能为空
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
                                amyLayer.alert("提交成功"); //成功提示弹层
                                if(t.isAnother){
                                    window.localStorage.removeItem("previewStyle");
                                    window.localStorage.removeItem("previewReceiver");
                                    window.localStorage.removeItem("previewForward");
                                    window.localStorage.removeItem("previewTitle");
                                }
                                window.location.href = "#!/";
                                // window.location.href = gMain.basePath + "views/common/go.jsp?sPath="+encodeURIComponent('/views/report_mobile/')+"&sRouter="+encodeURIComponent('/chooseTemp');
                            }
                        }
                    });
                }else{
                    amyLayer.alert("接收人不能为空"); //错误提示弹层
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
                if(status == "1"){
                    var oPostData = {
                        "forwardType":t.forwardType+"",//禁止转发
                        "status":"2",////提交状态 1: 已发送 2:草稿
                        "receiver":recipientList, //接收人
                        "nodeData":JSON.stringify(t.nodeData),
                        "uuid":t.singleReportData.wrData.uuid+"",
                        "dataId":t.singleReportData.wrData.dataId+"",
                    };
                    // alert(JSON.stringify(oPostData));
                    postUrl = gMain.apiBasePath + "wrReportData/updateReportData.do";
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
                                amyLayer.alert("保存成功"); //成功提示弹层
                                $("#single_report_handle").find(".draft_cover_wrap").hide();
                                if(t.isAnother){
                                    window.localStorage.removeItem("previewStyle");
                                    window.localStorage.removeItem("previewReceiver");
                                    window.localStorage.removeItem("previewForward");
                                    window.localStorage.removeItem("previewTitle");
                                }
                                window.location.href = "#!/";
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
                    window.location.href = "#!/";
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
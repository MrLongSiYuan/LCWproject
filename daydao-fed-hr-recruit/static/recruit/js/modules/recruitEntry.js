/**
 * Created by plus on 2017/7/28.
 * 招聘入职
 */

define(function (require,exports,module) {
    require("css/recruitEntry.css");
    var sTpl = require("templates/recruitEntry.html");

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
    $.extend(showDialog.prototype,{
        options:{}
        ,init:function (options) {
            var t = this;
            $.extend(t.options,options);
            t.initDialog();
        }
        ,initDialog:function () {
            var t = this;
            t.d = dialog({
                skin: 'base_artdialog_blue'
                ,width:'900px'
                ,title: "<div class='table_edit_dialog_title_left'><span class='icon iconfont_dayhr_base'>&#xe603;</span>应聘入职</div>"
                ,content:'<div id="recruitEntry">'+sTpl+'</div>'
            });
            //t.d.showModal();
            $("body").loading({zIndex:999});
            t.initVue(t.d,t.options);
        }
        ,initVue:function (dialog,opts) {
            var that = this;
            that.vueDialog = new Vue({
                el:"#recruitEntry"
                ,data:{
                    titleData:["入职信息","工作经历","技能情况","社会关系"]
                    ,statusData:[true,false,false,false]
                    ,arrCtId:["hr_org","ct_310","ct_304","ct_302","ct_303","ct_321","r_hr_org_pos","ct_314","ct_300","ct_110","ct_306"]//hr_org:入职组织 ct_310:人员状态 ct_304:身份证 ct_302:民族 ct_303:政治面貌 ct_321:学历  r_hr_org_pos:担任职位 ct_314:人员类型 ct_300:性别 ct_110:籍贯 ct_306:婚姻状况
                    ,entryData:{"name":"","phone":"","birthday":"","address":"","place":"","joinDate":"","email":"","num":"","workDate":"","code":"","order":""}
                    ,workListData:[]/*工作经历*/
                    ,eduListData:[]/*教育经历*/
                    ,lanListData:[]/*语言能力*/
                    ,proListData:[]/*专业技术*/
                    ,posListData:[]/*职业资格*/
                    ,resListData:[]/*社会关系*/
                    ,entryId:""//入职之后的ID
                    ,oData:""
                }
                ,attached:function () {
                    var t = this;
                    t.init();
                },
                watch: {
                    /**
                     * 把参数格式转换成：infoSetId:app_corp_menu&leftNav:initConfig 来方便获取
                     * 获取参数方式如：
                     * 获取infoSetId: t.options.infoSetId
                     * 获取leftNav: t.options.leftNav
                     * */
                    'edit': function (val, oldVal) {
                        var t = this;
                        if (val == true) {
                        }
                    },


                }
                ,methods:{
                    init:function(){
                        var t = this;
                        t.getAll();//获取整个简历信息
                    },
                    getAll:function(){
                        var t = this;
                        Ajax.ApiTools().getResumeBaseInfoEntry({
                            data: {resumeId: opts.resumeId},
                            success: function (data) {
                                //如果是tree
                                if (data.result == "true") {
                                    t.obj = data.data;
                                    t.entryData.name = t.obj.name;//姓名
                                    t.entryData.phone = t.obj.mobile;//手机
                                    t.entryData.birthday = t.obj.birthday;//出生日期
                                    t.entryData.email = t.obj.email;//邮箱
                                    t.entryData.workDate = t.obj.workTime;//参加工作日期
                                    t.getCtData();
                                    t.workListData = data.data.workingList;/*工作经历*/
                                }
                            }
                        });
                    },
                    getCtData:function(){
                        var t = this;
                        $("body").loading({zIndex:999});
                        for(var i = 0; i<t.arrCtId.length; i++){
                            var oData = {
                                infoSetId: t.arrCtId[i],
                                isDateFilter: false,
                                keyId: "code_id",
                                valueId: "code_name",
                                multiType: "G_zh-CN"
                            };
                            (function(i){
                                switch (t.arrCtId[i]){
                                    case "hr_org":
                                        oData = {
                                            infoSetId: t.arrCtId[i],
                                            isDateFilter: true,
                                            keyId: "org_id",
                                            valueId: "org_name",
                                            multiType: "G_zh-CN",
                                            orderStr: "gid",
                                            parentId: "parent_org_id"
                                        }
                                        break;
                                    case "ct_310":
                                        oData.parentId = "parent_id";
                                        break;
                                    case "r_hr_org_pos":
                                        oData = {
                                            infoSetId: t.arrCtId[i],
                                            isDateFilter: false,
                                            keyId: "id",
                                            valueId: "value",
                                            multiType: "G_zh-CN",
                                            orderStr: "gid, pos_order",
                                            parentId: "parent_id"
                                        }
                                        break;
                                    case "ct_110":
                                        oData.parentId = "parent_id";
                                        break;
                                    default:
                                }
                                Ajax.ApiTools().getKeyValueData({
                                    data: oData,
                                    success: function (data) {
                                        //如果是tree
                                        if (data.result == "true") {
                                            for(var j =0 ;j<data.beans.length;j++ ){
                                                data.beans[j]["id"] = parseInt(data.beans[j]["id"]) + "";/*码表id做处理*/
                                            }
                                            t.dropFunction(t.arrCtId[i], data.beans);
                                        }
                                    }
                                });
                            })(i);
                        }

                        t.$nextTick(function(){
                            $('#recruit-entry-right-0').validator({
                                theme:"yellow_right",
                                rules: {
                                },
                                fields: {
                                    recruit_entry_name_hr_org: 'required;'//入职组织
                                    ,recruit_entry_name_ct_310:'required;'//人员状态
                                    ,entry_phone:'required,rules.mobile;'//移动电话
                                    ,entry_joinDate:'required;'//入职日期
                                    ,recruit_entry_name_ct_314:'required;'//人员类型
                                    ,entry_email:'rules.email;'//邮箱格式
                                },
                                valid: function(form){
                                    t.saveInfo();
                                }
                            });
                        })
                    },
                    /*下拉菜单*/
                    dropFunction:function(id,data){
                        var t = this;
                        t["drop-"+id] = new dayhrDropSelect({
                            id: "recruit_entry_"+id,
                            width: 178,
                            maxHeight: 120,
                            data: data,
                            name: "recruit_entry_name_"+id,
                            onSelected: function (oSelect, type) {
                            }
                        });

                        if(t["drop-"+id]){
                            switch (id){
                                case "ct_300":
                                    t["drop-"+id].setValue(t.obj.gender+"");//性别
                                    break;
                                case "ct_302":
                                    t["drop-"+id].setValue(t.obj.nation+"");//民族
                                    break;
                                case "ct_303":
                                    t["drop-"+id].setValue(t.obj.political+"");//政治面貌
                                    break;
                                case "ct_306":
                                    t["drop-"+id].setValue(t.obj.maritalStatus+"");//婚姻状况
                                    dialog.showModal();
                                    $("body").loading({state:false}); //关闭遮罩
                                    break;
                                case "ct_321":
                                    t["drop-"+id].setValue(t.obj.educationId+"");//学历
                                    break;
                                default:
                            }

                        }
                    },
                    /*页签切换*/
                    tabFn:function (param) {
                        var t = this;
                        if(t.entryId != "") {
                            var arr = [];
                            for (var i = 0; i < t.statusData.length; i++) {
                                if (param == i) {
                                    arr.push(true);
                                } else {
                                    arr.push(false);
                                }
                            }
                            t.statusData = arr;
                        }else{
                            tools.showMsg.error("请先入职人员！");
                        }
                    },
                    /*取消入职*/
                    cancelEntry:function(){
                        var t = this;
                        dialog.remove();
                    },
                    /*确认入职*/
                    okEntry:function(){
                        var t = this;
                        $('#recruit-entry-right-0').trigger("validate");
                    },
                    /*删除信息*/
                    deleteFn:function (oData,sType) {
                        var t = this;
                        var iId;
                        switch (sType){
                            case "work":
                                iId = 7;
                                break;
                            case "edu":
                                iId = 2;
                                break;
                            case "language":
                                iId = 4;
                                break;
                            case "pro":
                                iId = 3;
                                break;
                            case "pos":
                                iId = 5;
                                break;
                            case "res":
                                iId = 8;
                                break;
                            default:
                        }
                        layer.confirm('您确定删除此条信息么？', {
                            icon:3,
                            title: '删除操作',
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            Ajax.ApiTools().delOrgPersonItem({
                                data: {uuid:oData.uuid,operator:iId},
                                success: function (data) {
                                    if (data.result == "true") {
                                        switch (sType){
                                            case "work":
                                                for(var i =0;i<t.workListData.length;i++){
                                                    if(oData.uuid == t.workListData[i].uuid){
                                                        t.workListData.splice(i,1);
                                                    }
                                                }
                                                break;
                                            case "edu":
                                                for(var i =0;i<t.eduListData.length;i++){
                                                    if(oData.uuid == t.eduListData[i].uuid){
                                                        t.eduListData.splice(i,1);
                                                    }
                                                }
                                                break;
                                            case "language":
                                                for(var i =0;i<t.lanListData.length;i++){
                                                    if(oData.uuid == t.lanListData[i].uuid){
                                                        t.lanListData.splice(i,1);
                                                    }
                                                }
                                                break;
                                            case "pro":
                                                for(var i =0;i<t.proListData.length;i++){
                                                    if(oData.uuid == t.proListData[i].uuid){
                                                        t.proListData.splice(i,1);
                                                    }
                                                }
                                                break;
                                            case "pos":
                                                for(var i =0;i<t.posListData.length;i++){
                                                    if(oData.uuid == t.posListData[i].uuid){
                                                        t.posListData.splice(i,1);
                                                    }
                                                }
                                                break;
                                            case "res":
                                                for(var i =0;i<t.resListData.length;i++){
                                                    if(oData.uuid == t.resListData[i].uuid){
                                                        t.resListData.splice(i,1);
                                                    }
                                                }
                                                break;
                                            default:
                                        }
                                        layer.closeAll();
                                        tools.showMsg.ok("删除成功!");
                                    }
                                }
                            });
                        }, function () {
                        });
                    },
                    /*新增或编辑*/
                    addOrEdit:function(oData,sType){
                        var t = this;
                        $("#recruitEntry").loading({zIndex:999}) //启用loading遮罩
                        require.async("js/modules/makeEntry.js",function(makeEntry){
                            new makeEntry({Item:oData,type:sType,entryId:t.entryId,$that:t});
                        })
                    },
                    saveInfo:function () {
                        var t = this;
                        layer.confirm('您确定对此人员进行入职么？入职之后修改基本信息需到组织人事！', {
                            icon:3,
                            title: '入职操作',
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            var oData = {
                                resumeId :opts.resumeId
                                ,person_name:t.entryData.name//姓名
                                ,org_id:t["drop-hr_org"]["selectedId"]+""//入职组织
                                ,person_status:t["drop-ct_310"]["selectedId"]+""//人员状态
                                ,cell_phone:t.entryData.phone//移动电话
                                ,id_type:t["drop-ct_304"]["selectedId"]+""//证件类型
                                ,birthday:t.entryData.birthday+""//出生日期
                                ,national:t["drop-ct_302"]["selectedId"]+""//民族
                                ,political_status:t["drop-ct_303"]["selectedId"]+""//政治面貌
                                ,education_level:t["drop-ct_321"]["selectedId"]+""//学历
                                ,home_address:t.entryData.address//家庭住址
                                ,birth_place:t.entryData.place//出生地
                                ,join_date:t.entryData.joinDate//入职日期
                                ,sys_ext1_r_hr_org_pos_value:t["drop-r_hr_org_pos"]["selectedId"]+""//担任职位
                                ,person_type:t["drop-ct_314"]["selectedId"]+""//人员类型
                                ,email_address:t.entryData.email+""//邮箱
                                ,id_num:t.entryData.num+""//证件号码
                                ,sex:t["drop-ct_300"]["selectedId"]+""//性别
                                ,home_town:t["drop-ct_110"]["selectedId"]+""//籍贯
                                ,marital_status:t["drop-ct_306"]["selectedId"]+""//婚姻状态
                                ,first_work_date:t.entryData.workDate+""//参加工作日期
                                ,emp_code:t.entryData.code+""//员工编码
                                ,person_order:t.entryData.order+""//排序号
                            }
                            t.oData = {
                                person_name:t.entryData.name//姓名
                                ,org_id:t["drop-hr_org"]["selectedVal"]+""//入职组织
                                ,person_status:t["drop-ct_310"]["selectedVal"]+""//人员状态
                                ,cell_phone:t.entryData.phone//移动电话
                                ,id_type:t["drop-ct_304"]["selectedVal"]+""//证件类型
                                ,birthday:t.entryData.birthday+""//出生日期
                                ,national:t["drop-ct_302"]["selectedVal"]+""//民族
                                ,political_status:t["drop-ct_303"]["selectedVal"]+""//政治面貌
                                ,education_level:t["drop-ct_321"]["selectedVal"]+""//学历
                                ,home_address:t.entryData.address//家庭住址
                                ,birth_place:t.entryData.place//出生地
                                ,join_date:t.entryData.joinDate//入职日期
                                ,sys_ext1_r_hr_org_pos_value:t["drop-r_hr_org_pos"]["selectedVal"]+""//担任职位
                                ,person_type:t["drop-ct_314"]["selectedVal"]+""//人员类型
                                ,email_address:t.entryData.email+""//邮箱
                                ,id_num:t.entryData.num+""//证件号码
                                ,sex:t["drop-ct_300"]["selectedVal"]+""//性别
                                ,home_town:t["drop-ct_110"]["selectedVal"]+""//籍贯
                                ,marital_status:t["drop-ct_306"]["selectedVal"]+""//婚姻状态
                                ,first_work_date:t.entryData.workDate+""//参加工作日期
                                ,emp_code:t.entryData.code+""//员工编码
                                ,person_order:t.entryData.order+""//排序号
                            }

                           Ajax.ApiTools().orgPersonBaseInfo({
                                data: oData,
                                success: function (data) {
                                    if (data.result == "true") {
                                        layer.closeAll();/*关闭提示弹窗*/

                                        t.entryId = data.data.person_id;

                                        var arrWork = [];
                                        if(data.data.orgWorks.length>0){
                                            for(var i = 0;i<data.data.orgWorks.length;i++) {
                                                arrWork.push({
                                                    uuid:data.data.orgWorks[i].uuid,
                                                    date_from:data.data.orgWorks[i].date_from,
                                                    date_to:data.data.orgWorks[i].date_to,
                                                    company:data.data.orgWorks[i].company,
                                                    job:data.data.orgWorks[i].job,
                                                    desc:data.data.orgWorks[i].desc
                                                })
                                            }
                                        }
                                        t.workListData = arrWork;

                                        var arrEdu = [];
                                        if(data.data.orgEdus.length>0){
                                            for(var i = 0;i<data.data.orgEdus.length;i++) {
                                                arrEdu.push({
                                                    uuid:data.data.orgEdus[i].uuid,
                                                    begin_date:data.data.orgEdus[i].begin_date,
                                                    end_date:data.data.orgEdus[i].end_date,
                                                    school:data.data.orgEdus[i].school,
                                                    major:data.data.orgEdus[i].major,
                                                    educational_level:data.data.orgEdus[i].educational_level,
                                                    educational_level_name:data.data.orgEdus[i].educational_level_name,
                                                    degree:data.data.orgEdus[i].degree,
                                                    degree_name:"",
                                                    education_type:data.data.orgEdus[i].education_type,
                                                    education_type_name:""
                                                })
                                            }
                                        }
                                        t.eduListData = arrEdu;

                                        var arrLan = [];
                                        if(data.data.orgLanguages.length>0){
                                            for(var i = 0;i<data.data.orgLanguages.length;i++) {
                                                arrLan.push({
                                                    uuid:data.data.orgLanguages[i].uuid,
                                                    language_id:data.data.orgLanguages[i].language_id,
                                                    language_level:data.data.orgLanguages[i].language_level,
                                                })
                                            }
                                        }
                                        t.lanListData = arrLan;

                                        opts.opt.opt.mmButtonTemplateFun();
                                        opts.opt.opt.mmg.load();
                                        tools.showMsg.ok("入职成功!");
                                    }
                                }
                            });
                        }, function () {
                        });
                    }
                }
            });
        }

    });

    module.exports = showDialog;
});

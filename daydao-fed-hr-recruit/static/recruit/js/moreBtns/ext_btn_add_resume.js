/**
 * Created by plus on 2017/6/21.
 * 新增简历
 */

define(function (require,exports,module) {
    require("css/ext_btn_add_resume.css");
    var sTpl = require("templates/ext_btn_add_resume.html");

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
                title:t.options.status == "add" ? '新增简历':'编辑简历'
                ,content:'<div id="extBtnAddResume">'+sTpl+'</div>'
            });
            t.d.showModal();
            $("body").loading({zIndex:999}) //启用loading遮罩
            t.initVue(t.d,t.options);
        }
        ,initVue:function (dialog,opt) {
            var that = this;
            that.vueDialog = new Vue({
                el:"#extBtnAddResume"
                ,data:{
                    resumeId:""
                    ,generate:false//是否已生成简历
                    ,requested:false//是否已请求个人信息码表
                    ,editDialog:false//是否开始就是编辑
                    ,arrTable:["ct_110a","ct_110b","ct_300","ct_302","ct_303","ct_306","ct_321","ct_re_07","re_1","re_2"]//300：性别  302：民族  303：政治面貌 306：婚姻状况 07：简历渠道 1：简历类别 2：职业状态 110a:籍贯 110b:所在地 321:学历
                    ,infoData:{sName:"",sBirthday:"",sWorkTime:"",sMobile:"",sEmail:"",sCity:"",sOriginPlace:"",}
                    ,arr_re_1:[{id:"1",name:"主动投递"},{id:"2",name:"主动邀请"},{id:"3",name:"内部推荐"}]//简历类别
                    ,arr_re_2:[{id:"1",name:"目前正在找工作"},{id:"2",name:"观望有好机会会考虑"},{id:"3",name:"目前不想换工作"}]//职业状态
                    ,arr_ct_300:""
                    ,arr_ct_302:""
                    ,arr_ct_303:""
                    ,arr_ct_306:""
                    ,arr_ct_re_07:""
                    ,showInfoData:""/*简历展示信息*/
                    ,editInfo:true /*编辑个人信息*/
                    ,editHopeWork:false /*编辑期望工作*/
                    ,arrTable_1:["ct_110","re_3","re_4"]//ct_110：期望城市 re_3：期望职位状态  re_4：期望月薪
                    ,arr_re_3 :[{id:"1",name:"全职"},{id:"2",name:"兼职"},{id:"3",name:"实习"}]//期望职位状态
                    ,arr_re_4 :[{id:"1",name:"2k以下"},{id:"2",name:"2k-5k"},{id:"3",name:"5k-10k"},{id:"4",name:"10k-15k"},{id:"5",name:"15k-25k"},{id:"6",name:"25k-50k"},{id:"7",name:"50k以上"}]//期望月薪
                    ,requested1 : false //是否已请求期望工作码表
                    ,hopeWorkData : {posName:""}
                    ,showHopeWorkData : ""
                    ,hopeWorkUuid:""/*期望工作uuid*/
                    ,editWorkExp:false/*编辑工作经历*/
                    ,showWorkExpData:""
                    ,workExpData:{startDate:"",endDate:"",company:"",posName:"",content:""}
                    ,workExpUuid:""/*当前工作内容uuid*/
                    ,editEduExp:false/*编辑教育经历*/
                    ,eduExpUuid : ""/*uuid为空表示新增*/
                    ,eduExpData : {startDate:"",endDate:"",school:"",profession:"",eduLevelId:"",eduLevelName:""}
                    ,showEduExpData:""
                    ,arrTable_2:["ct_324","ct_321","ct_322"]
                    ,requested2 : false //是否已请求教育经历码表
                    ,arr_ct_re_10:""
                    ,editProExp:false/*编辑项目经历*/
                    ,showProExpData:""
                    ,proExpData:{startDate:"",endDate:"",projectName:"",responsibility:"",projectDesc:""}
                    ,proExpUuid:""/*当前工作内容uuid*/
                    ,editSkill:false/*编辑技能评价*/
                    ,skillUuid : ""/*uuid为空表示新增*/
                    ,skillData : {name:"",level:""}
                    ,showSkillData:""
                    ,arrTable_3:["re_5"]
                    ,arr_re_5:[{id:"1",name:"了解"},{id:"2",name:"掌握"},{id:"3",name:"精通"},{id:"4",name:"专家"}]//技能评价
                    ,editTraExp:false/*编辑培训经历*/
                    ,showTraExpData:""
                    ,traExpData:{startDate:"",endDate:"",organization:"",course:""}
                    ,traExpUuid:""/*当前培训内容uuid*/
                    ,editLanguage:false/*编辑语言能力*/
                    ,languageUuid : ""/*uuid为空表示新增*/
                    ,languageData : {language:"",level:""}
                    ,showLanguageData:""
                    ,arrTable_4:["re_6"]
                    ,arr_re_6:[{id:"1",name:"了解"},{id:"2",name:"掌握"},{id:"3",name:"精通"},{id:"4",name:"专家"}]//编辑语言能力
                    ,editDesc:false
                    ,descData:""
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
                    'editWorkExp': function (val, oldVal) {
                        var t = this;
                        if (val == true) {
                            t.editWorkExpNext();
                        }
                    },
                    'editEduExp': function (val, oldVal) {
                        var t = this;
                        if (val == true) {
                            t.editEduExpNext();
                        }
                    },
                    'editProExp': function (val, oldVal) {
                        var t = this;
                        if (val == true) {
                            t.editProExpNext();
                        }
                    },
                    'editSkill': function (val, oldVal) {
                        var t = this;
                        if (val == true) {
                            t.editSkillNext();
                        }
                    },
                    'editTraExp': function (val, oldVal) {
                        var t = this;
                        if (val == true) {
                            t.editTraExpNext();
                        }
                    },
                    'editLanguage': function (val, oldVal) {
                        var t = this;
                        if (val == true) {
                            t.editLanguageNext();
                        }
                    },

                }
                ,methods:{
                    init:function(){
                        var t = this;
                        if(opt.status=="edit"){/*是否编辑*/
                            t.generate = true;
                            t.editInfo = false;
                            t.editDialog = true;
                            t.getTable();

                        }else{
                            t.getTable();
                        }

                    },
                    /*个人信息下拉*/
                    getTable:function(){
                        var t = this;
                        for(var i=0;i<t.arrTable.length;i++) {
                            var oData = {
                                infoSetId: t.arrTable[i],
                                isDateFilter: false,
                                keyId: "code_id",
                                valueId: "code_name"
                            };
                            if(t.arrTable[i] == "ct_110a"||t.arrTable[i] == "ct_110b"){
                                 oData = {
                                     infoSetId: "ct_110",
                                     isDateFilter: false,
                                     keyId: "code_id",
                                     parentId: "parent_id",
                                     valueId: "code_name"
                                };
                            }
                            (function(i){
                                switch (t.arrTable[i]){
                                    case "re_1":
                                        if(t.editDialog == false) {
                                            t.dropFunction(t.arrTable[i], t.arr_re_1);
                                        }
                                        break;
                                    case "re_2":
                                        if(t.editDialog == false) {
                                            t.dropFunction(t.arrTable[i], t.arr_re_2);
                                        }
                                        break;
                                    default:
                                        if(t.requested == false) {
                                            Ajax.ApiTools().getKeyValueData({
                                                data: oData,
                                                success: function (data) {
                                                    //如果是tree
                                                    if (data.result == "true") {
                                                        for(var j =0 ;j<data.beans.length;j++ ){
                                                            data.beans[j]["id"] = parseInt(data.beans[j]["id"]) + "";/*码表id做处理*/
                                                        }
                                                        if(t.editDialog == false) {
                                                            t.dropFunction(t.arrTable[i], data.beans);
                                                        }else{
                                                              if(i == 4) {/*请求完最后一个码表*/
                                                                  Ajax.ApiTools().getResumeAllInfo({
                                                                      data: {resumeId: opt.item.resumeId},
                                                                      success: function (data) {
                                                                          //如果是tree
                                                                          if (data.result == "true") {
                                                                              t.showInfoData = data.data;
                                                                              t.resumeId = data.data.id;
                                                                              if (t.showInfoData) {
                                                                                  t.showInfoData.deliverTypeName = t.showInfoData.deliverType !=0 ? t.arr_re_1[t.showInfoData.deliverType-1]["name"]:"";
                                                                                  t.showInfoData.workStatusName =t.showInfoData.workStatus !=0 ? t.arr_re_2[t.showInfoData.workStatus-1]["name"]:"";
                                                                              }
                                                                              /*期望工作*/
                                                                              t.showHopeWorkData = data.data["hopeWorkList"][0];
                                                                              if(t.showHopeWorkData) {
                                                                                  t.hopeWorkData.posName = t.showHopeWorkData.posName;
                                                                                  t.hopeWorkUuid = t.showHopeWorkData.uuid;
                                                                                  t.showHopeWorkData.posPropertyName = t.showHopeWorkData.length !=0 ? t.arr_re_3[t.showHopeWorkData.posProperty-1]["name"]:"";
                                                                                  t.showHopeWorkData.payRangeName =t.showHopeWorkData.length !=0 ? t.arr_re_4[t.showHopeWorkData.payRange-1]["name"]:"";
                                                                              }

                                                                              /*工作经验*/
                                                                              t.showWorkExpData = data.data["workingList"];
                                                                              /*教育经历*/
                                                                              t.showEduExpData = data.data["educationList"];
                                                                              /*项目经历*/
                                                                              t.showProExpData = data.data["projectList"];
                                                                              /*技能评价*/
                                                                              t.showSkillData = data.data["technologieList"];
                                                                              /*培训经历*/
                                                                              t.showTraExpData = data.data["trainList"];
                                                                              /*技能评价*/
                                                                              t.showLanguageData = data.data["languageList"];
                                                                              t.$nextTick(function(){
                                                                                  $("body").loading({state:false}); //关闭遮罩
                                                                                  dialog.reset();
                                                                              });

                                                                          }
                                                                      }
                                                                  });
                                                              }
                                                        }
                                                        t["arr_" + t.arrTable[i]] = data.beans;
                                                    }
                                                }
                                            });
                                        }else{
                                            t.dropFunction(t.arrTable[i], t["arr_" + t.arrTable[i]]);
                                        }
                                }

                            })(i);

                        }

                        t.requested = true;

                        t.$nextTick(function(){
                            $('#add-resume-person-info').validator({
                                theme:"yellow_right",
                                rules: {
                                },
                                fields: {
                                    resume_name: 'required;'
                                    ,resume_birthday:'required;'
                                    ,resume_mobile:'required;rules.mobile'
                                    ,resume_email:'required;rules.email'
                                    ,recruit_resume_name_ct_300:'required;'
                                    ,resume_workTime:'required;'
                                    /*,recruit_resume_name_re_2:'required;'*/
                                    ,resume_city:'required;'
                                },
                                valid: function(form){
                                    t.saveInfo();
                                }
                            });
                        })


                    },
                    /*个人信息生成下拉菜单*/
                    dropFunction:function(id,data){
                        var t = this;
                        if(id == "ct_321"){
                            id = "ct_321a";
                        }
                        t["drop-"+id] = new dayhrDropSelect({
                            id: "recruit_resume_drop_"+id,
                            width: 208,
                            maxHeight: 180,
                            data: data,
                            name: "recruit_resume_name_"+id,
                            onSelected: function (oSelect, type) {
                            }
                        });
                        if(opt.status=="edit"||t.editInfo == true){
                            for(var i=0;i<t.arrTable.length;i++) {
                               if(t["drop-"+t.arrTable[i]]||t["drop-"+t.arrTable[i]+"a"]){
                                   switch (t.arrTable[i]){
                                       case "ct_300":
                                           t["drop-"+t.arrTable[i]].setValue(t.showInfoData.gender+"");
                                           break;
                                       case "ct_302":
                                           t["drop-"+t.arrTable[i]].setValue(t.showInfoData.nation+"");
                                           break;
                                       case "ct_303":
                                           t["drop-"+t.arrTable[i]].setValue(t.showInfoData.political+"");
                                           break;
                                       case "ct_306":
                                           t["drop-"+t.arrTable[i]].setValue(t.showInfoData.maritalStatus+"");
                                           break;
                                       case "ct_321":
                                           t["drop-"+t.arrTable[i]+"a"].setValue(t.showInfoData.educationId+"");
                                           break;
                                       case "ct_re_07":
                                           t["drop-"+t.arrTable[i]].setValue(t.showInfoData.channelId+"");
                                           break;
                                       case "re_1":
                                           t["drop-"+t.arrTable[i]].setValue(t.showInfoData.deliverType+"");
                                           break;
                                       case "re_2":
                                           t["drop-"+t.arrTable[i]].setValue(t.showInfoData.workStatus+"");
                                           break;
                                       case "ct_110a":
                                           t["drop-"+t.arrTable[i]].setValue(t.showInfoData.originPlace+"");
                                           break;
                                       case "ct_110b":
                                           t["drop-"+t.arrTable[i]].setValue(t.showInfoData.city+"");
                                           break;
                                       default:
                                   }

                               }
                            }
                        }

                    },
                    /*保存个人信息*/
                    saveInfo:function(){
                        var t = this;
                        var oData = {
                            id:t.resumeId
                            ,name:t.infoData.sName//姓名
                            ,gender:t["drop-ct_300"]["selectedId"]+""//性别
                            ,birthday:t.infoData.sBirthday//出生日期
                            ,workTime:t.infoData.sWorkTime//开始工作时间
                            ,mobile:t.infoData.sMobile//联系电话
                            ,workStatus:t["drop-re_2"]["selectedId"]+""//职业状态
                            ,email:t.infoData.sEmail//邮箱
                            ,city:t["drop-ct_110b"]["selectedId"]+""//所在地
                            ,originPlace:t["drop-ct_110a"]["selectedId"]+""//籍贯
                            ,maritalStatus:t["drop-ct_306"]["selectedId"]+""//婚姻状况
                            ,nation:t["drop-ct_302"]["selectedId"]+""//民族
                            ,political:t["drop-ct_303"]["selectedId"]+""//政治面貌
                            ,deliverType:t["drop-re_1"]["selectedId"]+""//简历类型
                            ,channelId:t["drop-ct_re_07"]["selectedId"]+""//简历渠道id
                            ,channelName:t["drop-ct_re_07"].getShowValue()//简历渠道名
                            ,educationId:t["drop-ct_321a"]["selectedId"]+""//最高学历
                        }
                        Ajax.ApiTools().addOrInsertResumeBaseInfo({
                            data: oData,
                            success: function (data) {
                                //如果是tree
                                if (data.result == "true") {
                                    t.resumeId = data.data.id;
                                    t.generate = true;
                                    t.editInfo = false;
                                    t.showInfoData = data.data;
                                    if(t.showInfoData) {
                                        t.showInfoData.genderName = t.showInfoData.gender != 0 ? t.arr_ct_300[t.showInfoData.gender - 1]["name"] : "";
                                        t.showInfoData.nationName = t.showInfoData.nation != 0 ? t.arr_ct_302[t.showInfoData.nation - 1]["name"] : "";
                                        t.showInfoData.politicalName = t.showInfoData.political != 0 ? t.arr_ct_303[t.showInfoData.political - 1]["name"] : "";
                                        t.showInfoData.maritalStatusName = t.showInfoData.maritalStatus !=0 ? t.arr_ct_306[t.showInfoData.maritalStatus - 1]["name"]:"";
                                        t.showInfoData.deliverTypeName = t.showInfoData.deliverType !=0 ? t.arr_re_1[t.showInfoData.deliverType-1]["name"]:"";
                                        t.showInfoData.workStatusName =t.showInfoData.workStatus !=0 ? t.arr_re_2[t.showInfoData.workStatus-1]["name"]:"";
                                        t.showInfoData.educationName =t["drop-ct_321a"]["selectedVal"];
                                        t.showInfoData.originPlaceName =t["drop-ct_110a"]["selectedVal"];
                                        t.showInfoData.cityName =t["drop-ct_110b"]["selectedVal"];
                                    }

                                    opt.oMetaData.mmg.load();
                                    tools.showMsg.ok("保存成功！");

                                }
                            }
                        });
                    },
                    cancelInfo:function(){
                        var t = this;
                        dialog.remove();
                    },
                    cancelInfoOther:function(){
                        var t = this;
                        t.editInfo = false;

                    },
                    editInfoFun:function(){
                        var t = this;
                        t.editInfo = true;
                        t.editDialog = false;
                        t.infoData.sName = t.showInfoData.name;
                        t.infoData.sBirthday = t.showInfoData.birthday;
                        t.infoData.sWorkTime = t.showInfoData.workTime;
                        t.infoData.sMobile = t.showInfoData.mobile;
                        t.infoData.sEmail = t.showInfoData.email;
                        t.infoData.sCity = t.showInfoData.city;
                        t.infoData.sOriginPlace = t.showInfoData.originPlace;
                        t.$nextTick(function(){
                            t.getTable();
                        });

                    },
                    /*编辑期望工作*/
                    editHopeWorkFun:function(){
                        var t = this;
                        t.editHopeWork = true;
                        t.$nextTick(function(){
                            t.getTable1("hopeWork");
                        });

                    },
                    getTable1:function(param){
                        var t = this;
                        for(var i=0;i<t.arrTable_1.length;i++) {
                            var oData = {
                                infoSetId: t.arrTable_1[i],
                                isDateFilter: false,
                                keyId: "code_id",
                                valueId: "code_name",
                            };
                            //接口参数处理
                            switch(t.arrTable_1[i]){
                                case "ct_110":
                                    oData.parentId = "parent_id";
                                    break;
                                default:
                            }

                            (function(i){
                                switch (t.arrTable_1[i]){
                                    case "re_3":
                                            t.dropFunctionCommon(t.arrTable_1[i], t.arr_re_3,208,param);
                                        break;
                                    case "re_4":
                                            t.dropFunctionCommon(t.arrTable_1[i], t.arr_re_4,208,param);
                                        break;
                                    default:
                                        if(t.requested1 == false) {
                                            Ajax.ApiTools().getKeyValueData({
                                                data: oData,
                                                success: function (data) {
                                                    //如果是tree
                                                    if (data.result == "true") {
                                                        for(var j =0 ;j<data.beans.length;j++ ){
                                                            data.beans[j]["id"] = parseInt(data.beans[j]["id"]) + "";/*码表id做处理*/
                                                        }
                                                        t.dropFunctionCommon(t.arrTable_1[i], data.beans,208,param);
                                                        t["arr_" + t.arrTable_1[i]] = data.beans;
                                                    }
                                                }
                                            });
                                        }else{
                                            t.dropFunctionCommon(t.arrTable_1[i], t["arr_" + t.arrTable_1[i]],208,param);
                                        }
                                }

                            })(i);

                        }
                        t.requested1 = true;
                        t.$nextTick(function(){
                            $('#add-resume-expected-work').validator({
                                theme:"yellow_right",
                                rules: {
                                },
                                fields: {
                                    posName: 'required;'
                                    ,recruit_resume_name_ct_110:'required;'
                                    ,recruit_resume_name_re_3:'required;'
                                    ,recruit_resume_name_re_4:'required;'
                                },
                                valid: function(form){
                                    t.saveHopeWork();
                                }
                            });
                        })
                    },
                    /*通用生成下拉菜单*/
                    dropFunctionCommon:function(id,data,sWidth,param){
                        var t = this;
                        t["drop-"+id] = new dayhrDropSelect({
                            id: "recruit_resume_drop_"+id,
                            width: sWidth,
                            maxHeight: 180,
                            data: data,
                            name: "recruit_resume_name_"+id,
                            onSelected: function (oSelect, type) {
                            }
                        });
                        /*自动选中处理*/
                        switch(param){
                            case "hopeWork":
                                if(t.showHopeWorkData) {
                                    t.currentHopeWork();
                                }
                                break;
                            case "eduExp":
                                if(t.showEduExpData) {
                                    t.currentEduExp();
                                }
                                break;
                            case "skill":
                                if(t.showSkillData) {
                                    t.currentSkill();
                                }
                                break;
                            case "language":
                                if(t.showLanguageData) {
                                    t.currentLanguage();
                                }
                                break;
                            default:
                        }


                    },
                    currentHopeWork:function(){
                        var t = this;
                            for(var i=0;i<t.arrTable_1.length;i++) {
                                if(t["drop-"+t.arrTable_1[i]]){
                                    switch (t.arrTable_1[i]){
                                        case "ct_110":
                                            t["drop-"+t.arrTable_1[i]].setValue(t.showHopeWorkData.workSpace+"");
                                            break;
                                        case "re_3":
                                            t["drop-"+t.arrTable_1[i]].setValue(t.showHopeWorkData.posProperty+"");
                                            break;
                                        case "re_4":
                                            t["drop-"+t.arrTable_1[i]].setValue(t.showHopeWorkData.payRange+"");
                                            break;
                                        default:
                                    }

                                }
                            }

                    },
                    currentEduExp:function(){
                        var t = this;
                        for(var i=0;i<t.arrTable_2.length;i++) {
                            if(t["drop-"+t.arrTable_2[i]]){
                                switch (t.arrTable_2[i]){
                                    case "ct_321":
                                        t["drop-"+t.arrTable_2[i]].setValue(t.eduExpData.eduLevelId+"");
                                        break;
                                    case "ct_324":
                                        t["drop-"+t.arrTable_2[i]].setValue(t.eduExpData.school+"");
                                        break;
                                    case "ct_322":
                                        t["drop-"+t.arrTable_2[i]].setValue(t.eduExpData.profession+"");
                                        break;
                                    default:
                                }

                            }
                        }
                    },
                    currentSkill:function(){
                        var t = this;
                        for(var i=0;i<t.arrTable_3.length;i++) {
                            if(t["drop-"+t.arrTable_3[i]]){
                                switch (t.arrTable_3[i]){
                                    case "re_5":
                                        t["drop-"+t.arrTable_3[i]].setValue(t.skillData.level+"");
                                        break;
                                    default:
                                }

                            }
                        }
                    },
                    currentLanguage:function(){
                        var t = this;
                        for(var i=0;i<t.arrTable_4.length;i++) {
                            if(t["drop-"+t.arrTable_4[i]]){
                                switch (t.arrTable_4[i]){
                                    case "re_6":
                                        t["drop-"+t.arrTable_4[i]].setValue(t.languageData.level+"");
                                        break;
                                    default:
                                }

                            }
                        }
                    },
                    saveHopeWork:function(){
                        var t = this;
                        var oData = {
                            uuid:t.hopeWorkUuid,
                            resumeId:t.resumeId,
                            posName:t.hopeWorkData.posName,
                            posProperty:t["drop-re_3"]["selectedId"]+"",
                            workSpace:t["drop-ct_110"]["selectedId"]+"",
                            payRange:t["drop-re_4"]["selectedId"]+"",
                        }
                        Ajax.ApiTools().addOrInsertHopeWork({
                            data: oData,
                            success: function (data) {
                                //如果是tree
                                if (data.result == "true") {
                                    t.editHopeWork = false;
                                    t.showHopeWorkData = data.data;
                                    if(t.showHopeWorkData) {
                                        t.showHopeWorkData.posPropertyName = t.showHopeWorkData.posProperty !=0 ? t.arr_re_3[t.showHopeWorkData.posProperty-1]["name"]:"";
                                        t.showHopeWorkData.payRangeName =t.showHopeWorkData.payRange !=0 ? t.arr_re_4[t.showHopeWorkData.payRange-1]["name"]:"";
                                    }

                                    opt.oMetaData.mmg.load();
                                    tools.showMsg.ok("保存成功！");
                                    t.$nextTick(function(){
                                        dialog.reset();
                                    });
                                }
                            }
                        });
                    },
                    /*工作经历*/
                    makeWorkExp:function(){
                        var t = this;
                        t.editWorkExp = true;
                        t.workExpUuid = "";/*uuid为空表示新增*/
                        t.workExpData = {startDate:"",endDate:"",company:"",posName:"",content:""};

                    },
                    saveWorkingExp:function(){
                        var t = this;
                        var oData = {
                            uuid :  t.workExpUuid,
                            resumeId:t.resumeId,
                            startDate:t.workExpData.startDate,
                            endDate:t.workExpData.endDate,
                            company:t.workExpData.company,
                            posName:t.workExpData.posName,
                            content:t.workExpData.content
                        }
                        Ajax.ApiTools().addOrInsertWorking({
                            data: oData,
                            success: function (data) {
                                //如果是tree
                                if (data.result == "true") {
                                    t.editWorkExp = false;
                                    if(t.workExpUuid == "") {/*判断是新增还是修改*/
                                        t.showWorkExpData.push(data.data);
                                    }else{
                                        for(var i =0;i<t.showWorkExpData.length;i++){
                                            if(t.workExpUuid == t.showWorkExpData[i].uuid){
                                                t.showWorkExpData[i].posName = data.data.posName;
                                                t.showWorkExpData[i].startDate = data.data.startDate;
                                                t.showWorkExpData[i].endDate = data.data.endDate;
                                                t.showWorkExpData[i].company = data.data.company;
                                                t.showWorkExpData[i].content = data.data.content;
                                            }
                                        }
                                    }
                                    opt.oMetaData.mmg.load();
                                    tools.showMsg.ok("保存成功！");
                                }
                            }
                        });
                    },
                    editWorkExpFun:function(obj){
                        var t = this;
                        t.editWorkExp = true ;
                        t.workExpUuid = obj.uuid;
                        t.workExpData.startDate = obj.startDate;
                        t.workExpData.endDate = obj.endDate;
                        t.workExpData.company = obj.company;
                        t.workExpData.posName = obj.posName;
                        t.workExpData.content = obj.content;
                    },
                    editWorkExpNext:function(){
                        var t = this;
                        t.$nextTick(function(){
                            $('#add-resume-work-experience').validator({
                                theme:"yellow_right",
                                rules: {
                                },
                                fields: {
                                    workExp_startDate: 'required;'
                                    ,workExp_endDate:'required;'
                                    ,workExp_company:'required;'
                                    ,workExp_position:'required;'
                                    ,workExp_content:'required;'
                                },
                                valid: function(form){
                                    t.saveWorkingExp();
                                }
                            });
                        })
                    },
                    /*
                         ~~~~type~~~
                     HopeWork(1, "期望工作"),
                     Technology(2, "技能"),
                     Education(3, "教育"),
                     project(4, "项目经验"),
                     train(5, "培训经历"),
                     language(6, "语言能力"),
                     working(7, "工作经历");
                     */
                    deleteFun:function(uuid,type){
                        var t = this;

                        var oData ={
                            resumeId:t.resumeId,
                            itemId:uuid,
                            operator:type
                        }
                        layer.confirm('您确定删除此条数据吗？', {
                            icon: 3,
                            title: '提示',
                            btn: ['确定','取消'] //按钮
                        }, function(){
                            Ajax.ApiTools().delResumeItems({
                                type: "GET",
                                data: oData,
                                success: function (data) {
                                    //如果是tree
                                    if (data.result == "true") {
                                        switch (type){
                                            case "7":
                                                for(var i =0;i<t.showWorkExpData.length;i++){
                                                    if(uuid == t.showWorkExpData[i].uuid){
                                                        t.showWorkExpData.splice(i,1);
                                                        if(uuid == t.workExpUuid) {/*删除的是当前编辑的*/
                                                            t.editWorkExp = false;
                                                        }
                                                    }
                                                }
                                                break;
                                            case "3":
                                                for(var i =0;i<t.showEduExpData.length;i++){
                                                    if(uuid == t.showEduExpData[i].uuid){
                                                        t.showEduExpData.splice(i,1);
                                                        if(uuid == t.eduExpUuid) {
                                                            t.editEduExp = false;
                                                        }
                                                    }
                                                }
                                                break;
                                            case "4":
                                                for(var i =0;i<t.showProExpData.length;i++){
                                                    if(uuid == t.showProExpData[i].uuid){
                                                        t.showProExpData.splice(i,1);
                                                        if(uuid == t.proExpUuid) {
                                                            t.editProExp = false;
                                                        }
                                                    }
                                                }
                                                break;
                                            case "2":
                                                for(var i =0;i<t.showSkillData.length;i++){
                                                    if(uuid == t.showSkillData[i].uuid){
                                                        t.showSkillData.splice(i,1);
                                                        if(uuid == t.skillUuid) {
                                                            t.editSkill = false;
                                                        }
                                                    }
                                                }
                                                break;
                                            case "5":
                                                for(var i =0;i<t.showTraExpData.length;i++){
                                                    if(uuid == t.showTraExpData[i].uuid){
                                                        t.showTraExpData.splice(i,1);
                                                        if(uuid == t.traExpUuid) {
                                                            t.editTraExp = false;
                                                        }
                                                    }
                                                }
                                                break;
                                            case "6":
                                                for(var i =0;i<t.showLanguageData.length;i++){
                                                    if(uuid == t.showLanguageData[i].uuid){
                                                        t.showLanguageData.splice(i,1);
                                                        if(uuid == t.languageUuid) {
                                                            t.editLanguage = false;
                                                        }
                                                    }
                                                }
                                                break;
                                            default:
                                        }
                                        opt.oMetaData.mmg.load();
                                        tools.showMsg.ok("删除成功！");
                                    }
                                }
                            });
                        }, function(){
                        });

                    },

                    /*新增教育经历*/
                    makeEduExp:function(){
                        var t = this;
                        t.editEduExp = true;
                        t.eduExpUuid = "";/*uuid为空表示新增*/
                        t.eduExpData = {startDate:"",endDate:"",school:"",profession:"",eduLevelId:"",eduLevelName:""};
                    },

                    editEduExpNext:function(){
                        var t = this;
                        t.$nextTick(function(){
                            t.getTable2();
                            $('#add-resume-edu-experience').validator({
                                theme:"yellow_right",
                                rules: {
                                },
                                fields: {
                                    eduWork_startDate: 'required;'
                                    ,eduWork_endDate:'required;'
                                    ,recruit_resume_name_ct_324:'required;'
                                    ,recruit_resume_name_ct_321:'required;'
                                    ,recruit_resume_name_ct_322:'required;'
                                },
                                valid: function(form){
                                    t.saveEduExp();
                                }
                            });
                        })
                    },
                    getTable2:function(){
                        var t = this;
                        for(var i=0;i<t.arrTable_2.length;i++) {
                            var oData = {
                                infoSetId: t.arrTable_2[i],
                                isDateFilter: false,
                                keyId: "code_id",
                                valueId: "code_name",
                            };
                            if(t.arrTable_2[i] == "ct_324"||t.arrTable_2[i] == "ct_322"){
                                oData.parentId = "parent_id";
                            }
                            (function (i) {
                                if (t.requested2 == false) {
                                    Ajax.ApiTools().getKeyValueData({
                                        data: oData,
                                        success: function (data) {
                                            //如果是tree
                                            if (data.result == "true") {
                                                for (var j = 0; j < data.beans.length; j++) {
                                                    data.beans[j]["id"] = parseInt(data.beans[j]["id"]) + "";
                                                    /*码表id做处理*/
                                                }
                                                t.dropFunctionCommon(t.arrTable_2[i], data.beans, 208, "eduExp");
                                                t["arr_" + t.arrTable_2[i]] = data.beans;
                                            }
                                        }
                                    });
                                } else {
                                    t.dropFunctionCommon(t.arrTable_2[i], t["arr_" + t.arrTable_2[i]], 208, "eduExp");
                                }
                            })(i);
                        }
                        t.requested2 = true;
                    },
                    saveEduExp:function(){
                        var t = this;
                        var oData = {
                            uuid :  t.eduExpUuid,
                            resumeId:t.resumeId,
                            startDate:t.eduExpData.startDate,
                            endDate:t.eduExpData.endDate,
                            school:t["drop-ct_324"].getShowValue(),//学校
                            profession:t["drop-ct_322"].getShowValue(),//专业,
                            eduLevelId:t["drop-ct_321"]["selectedId"]+"",//学历id
                            eduLevelName:t["drop-ct_321"].getShowValue(),//学历名
                        }
                        Ajax.ApiTools().addOrInsertEducation({
                            data: oData,
                            success: function (data) {
                                //如果是tree
                                if (data.result == "true") {
                                    t.editEduExp = false;
                                    if(t.eduExpUuid == "") {/*判断是新增还是修改*/
                                        t.showEduExpData.push(data.data);
                                    }else{
                                        for(var i =0;i<t.showEduExpData.length;i++){
                                            if(t.eduExpUuid == t.showEduExpData[i].uuid){
                                                t.showEduExpData[i].school = data.data.school;
                                                t.showEduExpData[i].startDate = data.data.startDate;
                                                t.showEduExpData[i].endDate = data.data.endDate;
                                                t.showEduExpData[i].profession = data.data.profession;
                                                t.showEduExpData[i].eduLevelId = data.data.eduLevelId;
                                                t.showEduExpData[i].eduLevelName = data.data.eduLevelName;
                                            }
                                        }
                                    }
                                    opt.oMetaData.mmg.load();
                                    tools.showMsg.ok("保存成功！");
                                }
                            }
                        });
                    },
                    editEduExpFun:function(obj){
                        var t = this;
                        t.editEduExp = true;
                        t.eduExpUuid = obj.uuid;
                        t.eduExpData.startDate = obj.startDate;
                        t.eduExpData.endDate = obj.endDate;
                        t.eduExpData.school = obj.school;
                        t.eduExpData.profession = obj.profession;
                        t.eduExpData.eduLevelId = obj.eduLevelId;
                        if(t["drop-ct_re_10"]){
                            t["drop-ct_re_10"].setValue(t.eduExpData.eduLevelId + "");
                        }
                    },
                    /*项目经历*/
                    makeProExp:function(){
                        var t = this;
                        t.editProExp = true;
                        t.proExpUuid = "";/*uuid为空表示新增*/
                        t.proExpData = {startDate:"",endDate:"",projectName:"",responsibility:"",projectDesc:""};

                    },
                    editProExpNext:function(){
                        var t = this;
                        t.$nextTick(function(){
                            $('#add-resume-project-experience').validator({
                                theme:"yellow_right",
                                rules: {
                                },
                                fields: {
                                    proExp_startDate: 'required;'
                                    ,proExp_endDate:'required;'
                                    ,proExp_projectName:'required;'
                                    ,proExp_responsibility:'required;'
                                    ,proExp_projectDesc:'required;'
                                },
                                valid: function(form){
                                    t.saveProExp();
                                }
                            });
                        })
                    },
                    saveProExp:function(){
                        var t = this;
                        var oData = {
                            uuid :  t.proExpUuid,
                            resumeId:t.resumeId,
                            startDate:t.proExpData.startDate,
                            endDate:t.proExpData.endDate,
                            projectName:t.proExpData.projectName,
                            responsibility:t.proExpData.responsibility,
                            projectDesc:t.proExpData.projectDesc
                        }
                        Ajax.ApiTools().addOrInsertProject({
                            data: oData,
                            success: function (data) {
                                //如果是tree
                                if (data.result == "true") {
                                    t.editProExp = false;
                                    if(t.proExpUuid == "") {/*判断是新增还是修改*/
                                        t.showProExpData.push(data.data);
                                    }else{
                                        for(var i =0;i<t.showProExpData.length;i++){
                                            if(t.proExpUuid == t.showProExpData[i].uuid){
                                                t.showProExpData[i].projectName = data.data.projectName;
                                                t.showProExpData[i].startDate = data.data.startDate;
                                                t.showProExpData[i].endDate = data.data.endDate;
                                                t.showProExpData[i].responsibility = data.data.responsibility;
                                                t.showProExpData[i].projectDesc = data.data.projectDesc;
                                            }
                                        }
                                    }
                                    opt.oMetaData.mmg.load();
                                    tools.showMsg.ok("保存成功！");
                                }
                            }
                        });
                    },
                    editProExpFun:function(obj){
                        var t = this;
                        t.editProExp = true ;
                        t.proExpUuid = obj.uuid;
                        t.proExpData.startDate = obj.startDate;
                        t.proExpData.endDate = obj.endDate;
                        t.proExpData.projectName = obj.projectName;
                        t.proExpData.responsibility = obj.responsibility;
                        t.proExpData.projectDesc = obj.projectDesc;
                    },
                    /*技能评价*/
                    makeSkill:function(){
                        var t = this;
                        t.editSkill = true;
                        t.skillUuid = "";/*uuid为空表示新增*/
                        t.skillData = {name:"",level:""};
                    },
                    editSkillNext:function(){
                        var t = this;
                        t.$nextTick(function(){
                            t.getTable3();
                            $('#add-resume-skill-evaluation').validator({
                                theme:"yellow_right",
                                rules: {
                                },
                                fields: {
                                    skill_name: 'required;'
                                    ,recruit_resume_name_re_5:'required;'
                                },
                                valid: function(form){
                                    t.saveSkill();
                                }
                            });
                        })
                    },
                    getTable3:function(){
                        var t = this;
                        for(var i=0;i<t.arrTable_3.length;i++) {
                            (function (i) {
                                switch (t.arrTable_3[i]) {
                                    case "re_5":
                                            t.dropFunctionCommon(t.arrTable_3[i], t["arr_" + t.arrTable_3[i]], 208, "skill");
                                        break;
                                    default:

                                }

                            })(i);
                        }

                    },
                    saveSkill:function(){
                        var t = this;
                        var oData = {
                            uuid :  t.skillUuid,
                            resumeId:t.resumeId,
                            name:t.skillData.name,
                            level:t["drop-re_5"]["selectedId"]+"",

                        }
                        Ajax.ApiTools().addOrInsertTechnology({
                            data: oData,
                            success: function (data) {
                                //如果是tree
                                if (data.result == "true") {
                                    t.editSkill = false;
                                    if(t.skillUuid == "") {/*判断是新增还是修改*/
                                        t.showSkillData.push(data.data);
                                    }else{
                                        /*var showSkillData =[];
                                        for(var i =0;i<t.showSkillData.length;i++){
                                            var oShowSkillData = $.extend({},t.showSkillData[i]);
                                            if(t.skillUuid == t.showSkillData[i].uuid){
                                                oShowSkillData.name = data.data.name;
                                                oShowSkillData.level = data.data.level;
                                                oShowSkillData.levelName =  t.arr_re_5[oShowSkillData.level - 1]["name"];

                                            }
                                            showSkillData.push(oShowSkillData);
                                        }
                                        t.showSkillData = showSkillData;*/
                                        for(var i =0;i<t.showSkillData.length;i++){
                                            if(t.skillUuid == t.showSkillData[i].uuid){
                                                t.showSkillData[i].name = data.data.name;
                                                t.showSkillData[i].level = data.data.level;
                                            }
                                        }

                                    }
                                    opt.oMetaData.mmg.load();
                                    tools.showMsg.ok("保存成功！");
                                }
                            }
                        });
                    },
                    editSkillFun:function(obj){
                        var t = this;
                        t.skillUuid = obj.uuid;
                        t.skillData.name = obj.name;
                        t.skillData.level = obj.level;
                        t.editSkill = true;
                        if(t["drop-re_5"]) {
                           t["drop-re_5"].setValue(t.skillData.level + "");
                        }
                    },
                    /*培训经历*/
                    makeTraExp:function(){
                        var t = this;
                        t.editTraExp = true;
                        t.traExpUuid = "";/*uuid为空表示新增*/
                        t.traExpData = {startDate:"",endDate:"",organization:"",course:""}
                    },
                    saveTraExp:function(){
                        var t = this;
                        var oData = {
                            uuid :  t.traExpUuid,
                            resumeId:t.resumeId,
                            startDate:t.traExpData.startDate,
                            endDate:t.traExpData.endDate,
                            organization:t.traExpData.organization,
                            course:t.traExpData.course
                        }
                        Ajax.ApiTools().addOrInsertTrain({
                            data: oData,
                            success: function (data) {
                                //如果是tree
                                if (data.result == "true") {
                                    t.editTraExp = false;
                                    if(t.traExpUuid == "") {/*判断是新增还是修改*/
                                        t.showTraExpData.push(data.data);
                                    }else{
                                        for(var i =0;i<t.showTraExpData.length;i++){
                                            if(t.traExpUuid == t.showTraExpData[i].uuid){
                                                t.showTraExpData[i].startDate = data.data.startDate;
                                                t.showTraExpData[i].endDate = data.data.endDate;
                                                t.showTraExpData[i].course = data.data.course;
                                                t.showTraExpData[i].organization = data.data.organization;
                                            }
                                        }
                                    }
                                    opt.oMetaData.mmg.load();
                                    tools.showMsg.ok("保存成功！");
                                }
                            }
                        });
                    },
                    editTraExpFun:function(obj){
                        var t = this;
                        t.editTraExp = true ;
                        t.traExpUuid = obj.uuid;
                        t.traExpData.startDate = obj.startDate;
                        t.traExpData.endDate = obj.endDate;
                        t.traExpData.course = obj.course;
                        t.traExpData.organization = obj.organization;
                    },
                    editTraExpNext:function(){
                        var t = this;
                        t.$nextTick(function(){
                            $('#add-resume-training-experience').validator({
                                theme:"yellow_right",
                                rules: {
                                },
                                fields: {
                                    traExp_startDate: 'required;'
                                    ,traExp_endDate:'required;'
                                    ,traExp_course:'required;'
                                    ,traExp_organization:'required;'
                                },
                                valid: function(form){
                                    t.saveTraExp();
                                }
                            });
                        })
                    },
                    /*语言能力*/
                    makeLanguage:function(){
                        var t = this;
                        t.editLanguage = true;
                        t.languageUuid = "";/*uuid为空表示新增*/
                        t.languageData = {language:"",level:""};
                    },
                    editLanguageNext:function(){
                        var t = this;
                        t.$nextTick(function(){
                            t.getTable4();
                            $('#add-resume-language-ability').validator({
                                theme:"yellow_right",
                                rules: {
                                },
                                fields: {
                                    language_name: 'required;'
                                    ,recruit_resume_name_re_6:'required;'
                                },
                                valid: function(form){
                                    t.saveLanguage();
                                }
                            });
                        })
                    },
                    getTable4:function(){
                        var t = this;
                        for(var i=0;i<t.arrTable_4.length;i++) {
                            (function (i) {
                                switch (t.arrTable_4[i]) {
                                    case "re_6":
                                        t.dropFunctionCommon(t.arrTable_4[i], t["arr_" + t.arrTable_4[i]], 208, "language");
                                        break;
                                    default:

                                }

                            })(i);
                        }

                    },
                    saveLanguage:function(){
                        var t = this;
                        var oData = {
                            uuid :  t.languageUuid,
                            resumeId:t.resumeId,
                            language:t.languageData.language,
                            level:t["drop-re_6"]["selectedId"]+"",

                        }
                        Ajax.ApiTools().addOrInsertLanguage({
                            data: oData,
                            success: function (data) {
                                //如果是tree
                                if (data.result == "true") {
                                    t.editLanguage = false;
                                    if(t.languageUuid == "") {/*判断是新增还是修改*/
                                        t.showLanguageData.push(data.data);
                                    }else{
                                        for(var i =0;i<t.showLanguageData.length;i++){
                                            if(t.languageUuid == t.showLanguageData[i].uuid){
                                                t.showLanguageData[i].language = data.data.language;
                                                t.showLanguageData[i].level = data.data.level;
                                            }
                                        }

                                    }
                                    opt.oMetaData.mmg.load();
                                    tools.showMsg.ok("保存成功！");
                                }
                            }
                        });
                    },
                    editLanguageFun:function(obj){
                        var t = this;
                        t.languageUuid = obj.uuid;
                        t.languageData.language = obj.language;
                        t.languageData.level = obj.level;
                        t.editLanguage = true;
                        if(t["drop-re_6"]) {
                            t["drop-re_6"].setValue(t.languageData.level + "");
                        }
                    },
                    /*保存描述*/
                    editDescFun:function(){
                        var t = this;
                        t.editDesc = true;
                        t.descData = t.showInfoData.selfDesc;
                        t.$nextTick(function(){
                            $('#add-resume-self-description').validator({
                                theme:"yellow_right",
                                rules: {
                                },
                                fields: {
                                    desc: 'required;'
                                },
                                valid: function(form){
                                    t.saveDesc();
                                }
                            });
                        })
                    },
                    saveDesc:function () {
                        var t = this;
                        var oData = {
                            id:t.resumeId,
                            selfDesc:t.descData
                        }
                        Ajax.ApiTools().addOrInsertSelfDesc({
                            data: oData,
                            success: function (data) {
                                //如果是tree
                                if (data.result == "true") {
                                    t.editDesc = false;
                                    t.showInfoData.selfDesc = t.descData;
                                    opt.oMetaData.mmg.load();
                                    tools.showMsg.ok("保存成功！");
                                }
                            }
                        });
                    }
                }
            });
        }

    });

    module.exports = showDialog;
});

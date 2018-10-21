/**
 * ------------------------------------------------------------------
 *  简历详细信息页
 * ------------------------------------------------------------------
 */

define(function(require, exports, module){
    require("css/resumeDetail.css");
    require("css/ext_btn_add_resume.css");
    var sTpl = require("templates/resumeDetail.html");
    var Ajax = require("js/ajax");
    var tools = require("commonStaticDirectory/plugins/tools.js");//工具

    var VueComponent = Vue.extend({
        template: sTpl
        ,data:function(){
            return {
                gMain:gMain
                ,options:{}
                ,resumeId:""
                ,tabData:[{name:"候选人",infoSetId:"recruit_resume_deal_list"},{name:"职位",infoSetId:"recruit_resume_position_list"},{name:"看板",infoSetId:"recruit_resume_kanban_list"}]
                ,arr_re_1:[{id:"1",name:"主动投递"},{id:"2",name:"主动邀请"},{id:"3",name:"内部推荐"}]//简历类别
                ,arr_re_2:[{id:"1",name:"目前正在找工作"},{id:"2",name:"观望有好机会会考虑"},{id:"3",name:"目前不想换工作"}]//职业状态
                ,showInfoData:""/*简历展示信息*/
                ,arr_re_3 :[{id:"1",name:"全职"},{id:"2",name:"兼职"},{id:"3",name:"实习"}]//期望职位状态
                ,arr_re_4 :[{id:"1",name:"2k以下"},{id:"2",name:"2k-5k"},{id:"3",name:"5k-10k"},{id:"4",name:"10k-15k"},{id:"5",name:"15k-25k"},{id:"6",name:"25k-50k"},{id:"7",name:"50k以上"}]//期望月薪
                ,showHopeWorkData : ""
                ,showWorkExpData:""
                ,showEduExpData:""
                ,showProExpData:""
                ,showSkillData:""
                ,arr_re_5:[{id:"1",name:"了解"},{id:"2",name:"掌握"},{id:"3",name:"精通"},{id:"4",name:"专家"}]//技能评价
                ,showTraExpData:""
                ,showLanguageData:""
                ,arr_re_6:[{id:"1",name:"了解"},{id:"2",name:"掌握"},{id:"3",name:"精通"},{id:"4",name:"专家"}]//编辑语言能力
                ,descData:""
                ,hopeWorkData : {posName:""}
                ,workExpData:{startDate:"",endDate:"",company:"",posName:"",content:""}
                ,eduExpData : {startDate:"",endDate:"",school:"",profession:"",eduLevelId:"",eduLevelName:""}
                ,proExpData:{startDate:"",endDate:"",projectName:"",responsibility:"",projectDesc:""}
                ,traExpData:{startDate:"",endDate:"",organization:"",course:""}
                ,languageData : {language:"",level:""}
            }
        }
        ,attached:function () {
            var t = this;
            t.init();

        }
        , watch: {
            /**
             * 把参数格式转换成：infoSetId:app_corp_menu&leftNav:initConfig 来方便获取
             * 获取参数方式如：
             * 获取infoSetId: t.options.infoSetId
             * 获取leftNav: t.options.leftNav
             * */
        }
        ,methods: {
            init: function(options) {
                var t = this;
                this.options = $.extend({}, t.options, options);
                $("#main_menu").html("简历详情");
                console.log(t.$route.params.posId);
                t.getDetailInfo();
            },
            getDetailInfo:function () {
                var t = this;
                Ajax.ApiTools().getResumeAllInfo({
                    data: {resumeId: "5000000147566146"},
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

                        }
                    }
                });
            }
        }
    });

    module.exports = VueComponent;

});



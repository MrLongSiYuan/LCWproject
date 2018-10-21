/**
 * Created by Zackey on 2017/1/5.
 * 新增流程设置
 */
define(function(require, exports, module) {
    require("js/modules/addReport/addReport.css");
    var sTpl = require("js/modules/addReport/addReport.html");

    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");
    var orgSelect = require("js/modules/orgSelect/orgSelect.js")
    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");
    require("js/modules/formPreview/formPreview.js"); //表单预览插件
    var previewAudit = require("js/modules/previewAudit/previewAudit.js");//预览插件

    var modulesClass = function () {
        this.init.apply(this,arguments);
    };

    $.extend(modulesClass.prototype,{
        options:{}
        ,init:function (options) {
            var t = this;
            t.options = $.extend({},t.options,options);
            t.initDialog();
        }
        ,initDialog:function () {
            var t = this;
            t.d = dialog({
                title:"写汇报"
                ,content:sTpl
                ,button:[
                    {
                        value:"取消"
                        ,callback:function () {
                        }
                    }
                ]
                ,onclose: function () {
                    console.log(t.d.returnValue)
                    if(t.d.returnValue && t.d.returnValue == "addReportFinish"){
                        t.options.sponsorAll.sParams = "sendOut";
                        t.options.sponsorAll.reportList.sendAready = "1";
                        //我收到的 改变左边菜单栏
                        /*if(t.options.sponsorAll.reportList.reportsSource == "received"){
                            try {
                                window.top.document.getElementsByTagName("iframe")[0].src = "//oa.daydao.com/views/report/#!/sponsorAll/sendOut";
                                window.top.location.href = "//oa.daydao.com/views/home/#!/report/sendOut"
                                var $body = window.top.document.body;
                                $($body).find(".second_level_nav .current").attr({class: "second_level_li"}).siblings(".second_level_li").attr({class: "second_level_li current"});
                                location.href = "#!/sponsorAll/sendOut"
                            }catch (e){}
                        }*/
                        t.options.sponsorAll.pageChangeInfor.pageNo = "1";
                        t.options.sponsorAll.getHaveSentDataOrNot(); //请求已发或未发的全部汇报
                        t.options.sponsorAll.getRoportType(); //请求已发或未发的全部汇报类型
                        $("#reportSummary_wrap").find(".title_alreadySend_notSend .tabSendBtn").eq(2).find("a").attr({class:"active"});
                        $("#reportSummary_wrap").find(".title_alreadySend_notSend .tabSendBtn").eq(1).find("a").attr({class:""});
                        $("#reportSummary_wrap").find(".title_alreadySend_notSend .tabSendBtn").eq(0).find("a").attr({class:""});
                        $("#reportSummary_wrap").find(".title_alreadySend_notSend").find(".moveBar").css({left:"280px"});
                        /*if(t.options.sponsorAll._data.reportList.sendAready == "1"){ //已发
                            $("#reportSummary_wrap").find(".title_alreadySend_notSend .tabSendBtn").eq(0).find("a").attr({class:"active"});
                            $("#reportSummary_wrap").find(".title_alreadySend_notSend .tabSendBtn").eq(1).find("a").attr({class:""});
                            $("#reportSummary_wrap").find(".title_alreadySend_notSend").find(".moveBar").css({left:""});
                        }else{
                            $("#reportSummary_wrap").find(".title_alreadySend_notSend .tabSendBtn").eq(0).find("a").attr({class:""});
                            $("#reportSummary_wrap").find(".title_alreadySend_notSend .tabSendBtn").eq(1).find("a").attr({class:"active"});
                            $("#reportSummary_wrap").find(".title_alreadySend_notSend").find(".moveBar").css({left:"140px"});
                        }
                        if(t.options.sponsorAll._data.reportList.sendAready == "1" && t.options.sponsorAll._data.reportList.reportsSource == "received"){ //已阅
                            $("#reportSummary_wrap").find(".title_alreadySend_notSend .tabSendBtn").eq(0).find("a").attr({class:""});
                            $("#reportSummary_wrap").find(".title_alreadySend_notSend .tabSendBtn").eq(1).find("a").attr({class:"active"});
                        }else{
                            $("#reportSummary_wrap").find(".title_alreadySend_notSend .tabSendBtn").eq(0).find("a").attr({class:"active"});
                            $("#reportSummary_wrap").find(".title_alreadySend_notSend .tabSendBtn").eq(1).find("a").attr({class:""});
                        }*/
                    }
                },
            });
            t.d.showModal();
            t.initVue();
        }
        ,initVue:function () {
            var that = this;
            that.vueDialog = new Vue({
                el:"#report_addReportSetting"
                ,data:{
                    gMain:gMain,
                    templateList:[],//系统默认模板
                    NewtemplateList:[],//用户自定义模板
                    isShow:false, //控制新增模板的显示与隐藏
                    personInfor:null,
                }
                ,attached:function () {//在此写接口
                    var t = this;
                    t.getFormTemps();
                    t.personInfor = gMain.personInforReport;
                }
                ,methods:{//时间在methods内写
                    //选择模板,应用模板，自主添加组件
                    selectTemplate:function ($event,$index,item) {
                        var t = this;
                        $("body").loading({zIndex:9999}); //启用loading
                        require.async("js/modules/formBuild/formBuild.js",function (FormBuild) {
                            new FormBuild({
                                oMetadata:that.options.sponsorAll
                                ,editType:"add"
                                ,oFormEditData:{
                                    form_id:String(item.formId), //自定义模式没有formId
                                }
                            });
                        });
                    },
                    getFormTemps:function () {
                        var t = this;
                        //获取汇报的模板列表
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrReportTemp/getFormTemplates.do"
                            ,beforeSend:function () {
                                $(t.$el).loading();//启用loading
                            }
                            ,complete:function () {
                                $(t.$el).loading({state:false});//取消loading
                            }
                            ,success:function (data) {
                                if(data.result == "true" && data.data.list){
                                    if($.isArray(data.data.list)){
                                        t.templateList = data.data.list.slice(0);//设置模板
                                    }
                                }
                                setTimeout(function () {
                                    that.d.reset();
                                },50);
                            }
                        });
                    }
                    ,getPersonInfo:function () {
                        var t = this;
                        //获取汇报的模板列表
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrOrgPerson/getPersonBaseInfo.do"
                            ,beforeSend:function () {
                                $(t.$el).loading();//启用loading
                            }
                            ,complete:function () {
                                $(t.$el).loading({state:false});//取消loading
                            }
                            ,success:function (data) {
                                if(data.result == "true"){
                                    t.personInfor = data.data;
                                }
                            }
                        });
                    }
                    //创建自定义表单，自主添加组件
                    ,createCustomForm:function () {
                        var t = this;
                        $("body").loading({zIndex:9999}); //启用loading
                        require.async("js/modules/formBuild/formBuild.js",function (FormBuild) {
                            new FormBuild({
                                oMetadata:that.options.sponsorAll
                                ,editType:"add"
                                ,oFormEditData:{
                                    form_id:"", //自定义模式没有formId
                                }
                            });
                        });
                    }

                    //预览模板，填写表单信息
                    ,previewTemplate:function ($event,$index,item) {
                        var t = this;
                        that.previewFormDialog = dialog({
                            title:item.name
                            ,ok:function () {
                               that.vueObj1.submit();
                               return false;
                            },
                            cancel:function () {
                                that.vueObj1.cancelDialog();
                                return false;
                            }
                            // ,
                            // button:[{
                            //     name:"存草稿",
                            //     callback:function(){
                            //
                            //     }
                            // }]

                            ,content:'' +
                            '<div id="builderViewPreview" style="width:880px;max-height: '+($(window).height() - 200) +'px;overflow-y: auto;padding-right: 30px;" class="clearfix">' +
                            // '   <div class="pull-right" style="background:#ed6c2b;color: #fff;width: 110px;height: 24px;line-height: 24px;text-align: center;border-radius: 3px;">引用上一次模板</div>'+
                            '   <form-preview v-bind:afields="aFormJson" style="margin-top:10px;"></form-preview>' +
                            '</div>'
                        });
                        that.previewFormDialog.showModal();
                        that.vueObj1 = new Vue({
                            el:"#builderViewPreview"
                            ,data:{
                                aFormJson:[]
                            }
                            ,attached:function () {
                                var v = this;
                                Ajax.ajax({
                                    url:gMain.apiBasePath + "wrReportTemp/getFormStyleForMongo.do"
                                    ,data:JSON.stringify({
                                        id:item.formId + ""
                                        ,mongoSymbol:"formStyle_table"
                                    })
                                    ,beforeSend:function () {
                                        $(v.$el).loading();
                                    }
                                    ,complete:function () {
                                        $(v.$el).loading({state:false});
                                    }
                                    ,success:function (data) {
                                        if(data.result == "true"){
                                            if(data.data){
                                                var aFields = JSON.parse(data.data).fields;
                                                v.aFormJson = aFields;
                                                v.$nextTick(function () {
                                                    that.previewFormDialog.reset();
                                                });
                                            }
                                        }
                                    }
                                });
                            },
                            methods:{
                                //提交数据
                                submit:function () {
                                    var t =this;

                                    that.d.close().remove();
                                    that.previewFormDialog.close().remove();
                                },
                                cancelDialog:function(){
                                    var t =this;

                                    that.d.close().remove();
                                    that.previewFormDialog.close().remove();
                                }
                            }

                        });
                    }
                    /*
                    * 填写表单
                    * */
                    ,previewAudit:function(item,type){
                        var t = this;
                        var oUser = tools.Cache.getCache("oHeaderData","session");
                        var personInfor = {
                            "orgName":""+oUser.userInfo.orgName,
                            "personName":""+t.personInfor.personName
                        }
                        if(type == "start"){
                            new previewAudit({
                                data:tools.parseJson(item)
                                ,type:type
                                ,tempName:item.name
                                ,reporterInfor:personInfor
                                ,addReportDialog:that.d,
                            });
                        }
                    }
                }
            });
        }
    });

    module.exports = modulesClass;
});



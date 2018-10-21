/**
 * Created by plus on 2017/6/15.简历处理
 */

define(function (require, exports, module) {
    require("css/resumeDeal.css");
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗
    require("commonStaticDirectory/plugins/layer/layer"); //弹窗
    require("commonStaticDirectory/plugins/jquery.loading");
    require("commonStaticDirectory/plugins/My97DatePicker/WdatePicker.js"); //日历组件
    var template = require("commonStaticDirectory/plugins/template");
    //单选下拉框
    require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect.css");
    var dayhrDropSelect = require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect");
    //表单验证
    require("commonStaticDirectory/plugins/jquery.validator/jquery.validator.css");
    require("commonStaticDirectory/plugins/jquery.validator/jquery.validator");
    require("commonStaticDirectory/plugins/jquery.validator/local/zh_CN.js");
    //下拉菜单组件
    var ClassName = function () {
        this.init.apply(this, arguments);
    }
    ClassName.prototype = {
        constructor: ClassName
        , options: {}
        /**
         *初始化函数
         */
        , init: function (options) {
            var t = this;
            //初始化类要做的事情
            this.options = $.extend({}, this.options, options);
            t.resumeId = t.options.arr[0];//简历id
            require.async("templates/resumeDeal.html", function (tpl) {
                t.tpl = tpl;//整个模板
                t.editData1 ="";
                t.editData2 ="";

                switch(t.options.status){
                    case "recommend":
                        /*直接转荐*/
                        t.changeTemplateData(1, "转荐职位","");
                        break;
                    case "record":
                        /*应聘记录*/
                        t.status = parseInt(t.options.status);//简历状态 1：待处理   2：面试中  3：已录用   4：已入职  5：已淘汰
                        Ajax.ApiTools().getResumeBaseInfo({
                            data: {
                                resumeId: t.resumeId,
                            },
                            success: function (data) {
                                if (data.result == "true") {
                                    t.personInfo = data.data;
                                    t.getTemplateData(5, "应聘记录")
                                }
                            }
                        });

                        break;
                    default:
                        t.status = parseInt(t.options.status);//简历状态 1：待处理   2：面试中  3：已录用   4：已入职  5：已淘汰
                        Ajax.ApiTools().getResumeBaseInfo({
                            data: {
                                resumeId: t.resumeId,
                            },
                            success: function (data) {
                                if (data.result == "true") {
                                    t.personInfo = data.data;
                                    t.getDealStatus(t.status);
                                }
                            }
                        });
                }
            });


        },
        /*根据简历状态响应弹窗*/
        getDealStatus: function (status) {
            var t = this;
            switch (status) {
                case 1:
                    t.getTemplateData(status, "面试安排")
                    break;
                case 2:
                    t.getTemplateData(status, "面试评价")//按钮自定义
                    break;
                case 3:
                    t.getTemplateData(status, "应聘记录")
                    break;
                case 4:
                    t.getTemplateData(status, "应聘记录")
                    break;
                case 5:
                    t.getTemplateData(status, "应聘记录")
                    break;
                default:
                    return tools.showMsg.error('数据有误！');
            }

        },
        /*获取对应模板*/
        getTemplateData: function (status, sTitle) {
            var t = this;
                if(!t.d) {
                    t.d = dialog({
                        width: "490px",
                        title: sTitle,
                        content: '<div id="resumeDeal">' + t.tpl + '</div>'
                    })
                    t.d.showModal();
                }

            switch (status) {
                case 1:
                    t.d.title(sTitle);
                    t.d.width("490px");
                    $(".resumeDeal").html(template("resume_deal_" + status, t.personInfo));
                    t.d.reset();//重置弹窗
                    $('#resume_deal_form_1').validator({
                        theme:"yellow_right",
                        rules: {
                        },
                        fields: {
                            form_1_date:'required;'
                            ,form_1_address: 'required;'
                            ,form_1_contract:'required;'
                            ,form_1_contract_mobile:'required;rules.mobile'
                            ,form_1_remark:'required;'
                            ,form_1_interview:'required;'
                            ,form_1_mobile:'required;rules.mobile'
                        },
                        valid: function(form){
                            t.resume_deal_1_fun();
                        }
                    });
                    $("#resumeDeal .btn1").unbind("click").bind("click", function () {
                          t.deal1 = true;
                          $('#resume_deal_form_1').submit();
                    })
                    $("#resumeDeal .btn2").unbind("click").bind("click", function () {
                          t.deal1 = false;
                          $('#resume_deal_form_1').submit();
                    })
                    $("#resumeDeal .zj").unbind("click").bind("click", function () {
                        t.changeTemplateData(1, "转荐职位")
                    })
                    $("#resumeDeal .ly").unbind("click").bind("click", function () {
                        t.changeTemplateData(2, "录用");
                    })
                    $("#resumeDeal .fq").unbind("click").bind("click", function () {
                        t.changeTemplateData(4, "淘汰或放弃");
                    })
                    Ajax.ApiTools().getAllPersonNameData({
                        data: {
                            "infoSetId": "r_hr_org_person",
                            "keyId": "id",
                            "valueId": "value",
                            "parentId": "parent_id",
                            "tipId": "tip",
                            "orderStr": "gid, person_order",
                            "multiType": "G_zh-CN"
                        },
                        success: function (data) {
                            if (data.result == "true") {
                                t.drop1 = new dayhrDropSelect({
                                    id: "dropSelect",
                                    width: 148,
                                    maxHeight: 60,
                                    data: data.beans,
                                    name: "form_1_interview",
                                    onSelected: function (oSelect, type) {
                                    }
                                });
                                if(t.editData1!=""){
                                    if(t.editData1.isNotice == 1){
                                        $('input[name="form_1_notice"]').prop("checked",true);
                                    }
                                    t.drop1.setValue(t.editData1.interviewerId+"");
                                    $('input[name="form_1_date"]').val(t.editData1.interviewDate);
                                    $('input[name="form_1_address"]').val(t.editData1.interviewAddress);
                                    $('input[name="form_1_contract"]').val(t.editData1.contract);
                                    $('input[name="form_1_contract_mobile"]').val(t.editData1.contractMobile);
                                    $('textarea[name="form_1_remark"]').val(t.editData1.remark);
                                    $('input[name="form_1_mobile"]').val(t.editData1.interviewerMobile);
                                }
                            }
                        }
                    });

                    break;
                case 2:
                    t.d.title(sTitle);
                    t.d.width("600px");
                    $(".resumeDeal").html(template("resume_deal_" + status, t.personInfo));
                    Ajax.ApiTools().getResumeRecord({
                        data: {resumeId:t.resumeId},
                        success: function (data) {
                            if (data.result == "true") {
                                $(".resume_deal_2 .bottom2 ul").html(template("resume_deal_li",data))
                                t.d.reset();
                            }
                        }
                    });

                    Ajax.ApiTools().getAllPersonNameData({
                        data: {
                            "infoSetId": "r_hr_org_person",
                            "keyId": "id",
                            "valueId": "value",
                            "parentId": "parent_id",
                            "tipId": "tip",
                            "orderStr": "gid, person_order",
                            "multiType": "G_zh-CN"
                        },
                        success: function (data) {
                            if (data.result == "true") {
                                t.drop21 = new dayhrDropSelect({
                                    id: "dropSelect_1",
                                    width: 198,
                                    maxHeight: 60,
                                    data: data.beans,
                                    name: "form_3_name",
                                    onSelected: function (oSelect, type) {
                                    }
                                });

                            }
                        }
                    });
                    t.drop22 = new dayhrDropSelect({
                        id: "dropSelect_2",
                        width: 198,
                        maxHeight: 60,
                        data: [{id: "1", name: "通过"}, {id: "0", name: "不通过"}],
                        name: "form_3_result",
                        onSelected: function (oSelect, type) {
                        }
                    });
                    $('#resume_deal_form_3').validator({
                        theme:"yellow_right",
                        rules: {
                        },
                        fields: {
                            form_3_date:'required;'
                            ,form_3_name: 'required;'
                            ,form_3_result:'required;'
                            ,form_3_record:'required'
                        },
                        valid: function(form){
                            t.resume_deal_3_fun();
                        }
                    });
                    $("#resumeDeal .save2").unbind("click").bind("click", function () {
                        $('#resume_deal_form_3').submit();
                    })
                    $("#resumeDeal .cancel2").unbind("click").bind("click", function () {
                        t.d.remove();
                    })
                    $("#resumeDeal .xl").unbind("click").bind("click", function () {
                        t.getTemplateData(1, "面试安排")
                    })
                    $("#resumeDeal .zj").unbind("click").bind("click", function () {
                        t.changeTemplateData(1, "转荐职位")
                    })
                    $("#resumeDeal .ly").unbind("click").bind("click", function () {
                        t.changeTemplateData(2, "录用");
                    })
                    $("#resumeDeal .fq").unbind("click").bind("click", function () {
                        t.changeTemplateData(4, "淘汰或放弃");
                    })
                    break;
                case 3:
                    t.d.title(sTitle);
                    t.d.width("490px");
                    $(".resumeDeal").html(template("resume_deal_" + status, t.personInfo));
                    Ajax.ApiTools().getResumeRecord({
                        data: {resumeId:t.resumeId},
                        success: function (data) {
                            if (data.result == "true") {
                                if(data.data.length >0) {
                                    $(".resume_deal_3 .bottom2 ul").html(template("resume_deal_li", data))
                                }else{
                                    $(".resume_deal_3 .bottom2 ul").html("暂无数据！");
                                }
                                t.d.reset();
                            }
                        }
                    });
                    $("#resumeDeal .rz").unbind("click").bind("click", function () {
                        t.d.remove();
                        require.async("js/modules/recruitEntry.js",function(recruitEntry){
                               new recruitEntry({resumeId:t.resumeId,opt:t.options});
                        })
                    })
                    $("#resumeDeal .fq").unbind("click").bind("click", function () {
                        t.changeTemplateData(4, "淘汰或放弃");
                    })
                    break;
                case 4:
                    t.d.title(sTitle);
                    t.d.width("490px");
                    $(".resumeDeal").html(template("resume_deal_" + status, t.personInfo));
                    Ajax.ApiTools().getResumeRecord({
                        data: {resumeId:t.resumeId},
                        success: function (data) {
                            if (data.result == "true") {
                                if(data.data.length >0) {
                                    $(".resume_deal_4 .bottom2 ul").html(template("resume_deal_li", data))
                                }else{
                                    $(".resume_deal_4 .bottom2 ul").html("暂无数据！");
                                }
                                t.d.reset();
                            }
                        }
                    });
                    break;
                case 5:
                    t.d.title(sTitle);
                    t.d.width("490px");
                    $(".resumeDeal").html(template("resume_deal_" + status, t.personInfo));
                    Ajax.ApiTools().getResumeRecord({
                        data: {resumeId:t.resumeId},
                        success: function (data) {
                            if (data.result == "true") {
                                if(data.data.length >0) {
                                    $(".resume_deal_5 .bottom2 ul").html(template("resume_deal_li", data))
                                }else{
                                    $(".resume_deal_5 .bottom2 ul").html("暂无数据！");
                                }
                                t.d.reset();
                            }
                        }
                    });
                    break;
                default:
            }

        },
        /*改变模板 1：转荐  2：录用  3：预览offer 4：放弃或淘汰 5：预览简历*/
        changeTemplateData: function (status, sTitle, oData) {
            var t = this;

            if(t.options.status=="recommend") {
                t.d = dialog({
                    width: "490px",
                    title: sTitle,
                    content: '<div id="resumeDeal">' + t.tpl + '</div>'
                })
                t.d.showModal();
            }

            switch (status) {
                case 1://转荐
                    t.d.width("450px");
                    t.d.title(sTitle);
                    t.d.button( [
                    {
                        value: "确定",
                        callback: function () {
                            if(t.recommendPosId) {
                                Ajax.ApiTools().recommendPos({
                                    data: {
                                        resumeIds: t.options.arr,
                                        posId: t.recommendPosId,
                                        posName: t.recommendPosName
                                    },
                                    success: function (data) {
                                        if (data.result == "true") {
                                            t.options.opt.mmButtonTemplateFun();
                                            t.options.opt.mmg.load();
                                            tools.showMsg.ok('转荐成功');
                                        }
                                    }
                                });
                            }else{
                                layer.msg("尚未选择职位！", {offset: 0,shift:6});
                                return;
                            }
                        },
                        autofocus: true
                    },
                    {
                        value: "取消",
                        callback: function () {

                        }
                    }])
                    $(".resumeDeal").html(template("resume_deal_zj", {}));
                    t.d.reset();//重置弹窗
                    Ajax.ApiTools().getPosList({
                        data: {},
                        success: function (data) {
                            if (data.result == "true") {
                                var drop = new dayhrDropSelect({
                                    id: "dropSelect_zj",
                                    width: 300,
                                    maxHeight: 60,
                                    data: data.data,
                                    name: "modelId",
                                    onSelected: function (oSelect, type) {
                                        t.recommendPosId =drop.getValue();//返回id值
                                        t.recommendPosName = drop.getShowValue(); // 返回name值
                                    }
                                });
                            }
                        }
                    });

                    break;
                case 2://录用
                    t.d.width("490px");
                    t.d.title(sTitle);
                    $(".resumeDeal").html(template("resume_deal_ly", t.personInfo));
                    t.d.reset();//重置弹窗
                    $('#resume_deal_form_2').validator({
                        theme:"yellow_right",
                        rules: {
                        },
                        fields: {
                            form_2_date:'required;'
                            ,form_2_address: 'required;'
                            ,form_2_contract:'required;'
                            ,form_2_contract_mobile:'required;rules.mobile'
                            ,form_2_remark:'required;'
                        },
                        valid: function(form){
                            t.resume_deal_2_fun();
                        }
                    });
                    if(t.editData2!=""){
                        if(t.editData2.isNotice == 1){
                            $('input[name="form_2_notice"]').prop("checked",true);
                        }
                        if(t.editData2.fileName&&t.editData2.fileName!="") {
                            $(".a-file").text(t.editData2.fileName);
                        }
                        $('input[name="form_2_date"]').val(t.editData2.arrivalTime);
                        $('input[name="form_2_address"]').val(t.editData2.arrivalPlace);
                        $('input[name="form_2_contract"]').val(t.editData2.contract);
                        $('input[name="form_2_contract_mobile"]').val(t.editData2.mobile);
                        $('textarea[name="form_2_remark"]').val(t.editData2.remark);

                    }
                    $("#resumeDeal .btn5").unbind("click").bind("click", function () {
                        t.deal2 = true;
                        $('#resume_deal_form_2').submit();
                    })
                    $("#resumeDeal .btn6").unbind("click").bind("click", function () {
                        t.deal2 = false;
                        $('#resume_deal_form_2').submit();
                    })
                    var sFileName = "";
                    $(".resume_deal_ly").find("input[name='form_2_file']").change(function(){
                           var $this = $("input[name='form_2_file']");
                           $(".upload").text("开始上传");
                           t.oParam = new FormData();
                           t.oParam.append('file', $this[0].files[0]);
                           $(".a-file").text($this[0].files[0].name);
                           sFileName= $this[0].files[0].name;
                           $this.val("");
                    });
                    $("#resumeDeal .upload").unbind("click").bind("click", function () {
                        if(t.oParam!=""&&t.oParam!=undefined) {
                            $.ajax({
                                type: "post",
                                url: gMain.apiBasePath + "file/upload.do",
                                data: t.oParam,
                                processData: false, //告诉jq不要去处理发送的数据
                                contentType: false //告诉jq不要设置Content-Type请求头
                            }).done(function (ret) {
                                tools.showMsg.ok('上传成功');
                                $(".upload").text("上传完成");
                                t.fileName = sFileName;
                                t.fileUrl = ret.fullImgPath;
                                t.oParam = "";
                            });
                        }else{
                            tools.showMsg.ok('请选择需要上传的文件！');
                        }
                    });
                    break;
                case 3://预览offer
                    $(".resumeDeal").html(template("resume_deal_yl", $.extend({},t.personInfo,oData)));
                    t.d.reset();//重置弹窗
                    $("#resumeDeal .btn7").unbind("click").bind("click", function () {
                        t.deal2 = true;
                        t.resume_deal_2_fun(oData);
                    })
                    $("#resumeDeal .btn8").unbind("click").bind("click", function () {
                        t.editData2 = oData;
                        t.changeTemplateData(2, "录用");
                    })
                    break;
                case 4://放弃
                    t.d.width("490px");
                    t.d.title(sTitle);
                    t.d.button( [
                        {
                            value: "确定",
                            callback: function () {
                                var sTalents = $('input[name="fq1"]').prop("checked") == true ? 1 : 0;
                                var sNotice = $('input[name="fq2"]').prop("checked") == true ? 1 : 0;
                                var sTextarea = $("#textarea_fq").val();
                                if(sTextarea!=""||t.dropfq2["selectedId"]!="") {
                                    var oParam = {
                                        resumeId: t.resumeId,
                                        isTalents: sTalents,
                                        talentsTypeId: t.dropfq1["selectedId"],
                                        talentsTypeName: t.dropfq1.getShowValue(),
                                        isNotice: sNotice,
                                        eliminateSelf: t.dropfq2["selectedId"] = sTextarea!=""?"":t.dropfq2["selectedId"],
                                        eliminateRemark : sTextarea
                                    }
                                    Ajax.ApiTools().eliminateResume({
                                        data: oParam,
                                        success: function (data) {
                                            if (data.result == "true") {
                                                t.options.opt.mmButtonTemplateFun();
                                                t.options.opt.mmg.load();
                                                tools.showMsg.ok('淘汰成功');
                                            }
                                        }
                                    });
                                }else{
                                    tools.showMsg.error('淘汰或放弃原因不能为空！');
                                    return false;
                                }
                            },
                            autofocus: true
                        },
                        {
                            value: "取消",
                            callback: function () {

                            }
                        }])


                    Ajax.ApiTools().getAllEliminateData({
                        data: {
                        },
                        success: function (data) {
                            if (data.result == "true") {
                               $(".resumeDeal").html(template("resume_deal_fq", t.personInfo));
                               $(".ul_fq").html(template("resume_deal_fq_li",data));
                               t.d.reset();//重置弹窗
                                Ajax.ApiTools().getKeyValueData({
                                    data: {
                                        infoSetId: "ct_re_04",
                                        isDateFilter: false,
                                        keyId: "code_id",
                                        valueId: "code_name"
                                    },
                                    beforeSend:function(){
                                        $("#resumeDeal").loading({zIndex:999})
                                    },
                                    success: function (data) {
                                        if (data.result == "true") {
                                            t.dropfq1 = new dayhrDropSelect({
                                                id: "dropSelect_type",
                                                width: 120,
                                                maxHeight: 60,
                                                data: data.beans,
                                                name: "modelId",
                                                onSelected: function (oSelect, type) {
                                                }
                                            });
                                            $("#resumeDeal").loading({state:false}); //关闭遮罩
                                        }
                                    }
                                });
                                $("ul.ul_fq li input").unbind("click").bind("click", function () {
                                    var sId = $(this).attr("data-id");
                                    if (sId == "other") {//自愿放弃
                                        $("#textarea_fq").val("");
                                        $(".resume_deal_fq").find(".content").hide();
                                        $(".resume_deal_fq").find(".body").show();
                                    } else {
                                        $(".resume_deal_fq").find(".body").hide();
                                        $(".resume_deal_fq").find(".content").show();
                                        $("#textarea_fq").val(sId);
                                    }
                                })
                                t.dropfq2 = new dayhrDropSelect({
                                    id: "dropSelect_fq",
                                    width: 180,
                                    maxHeight: 60,
                                    data: [{id: "1", name: "接受其他Offer"}, {id: "2", name: "角色/职责不符"}, {id: "3", name: "内部升职/转岗"}, {id: "4", name: "工作地点"}, {id: "4", name: "其他"}],
                                    name: "modelId",
                                    onSelected: function (oSelect, type) {
                                    }
                                });
                                $("input[name='fq1']").unbind("click").bind("click", function () {
                                    if($(this).prop("checked")==false) {
                                        $(".tp").hide();
                                    }else{
                                        $(".tp").show();
                                    }
                                })
                            }
                        }
                    });


                    break;
                case 5://预览简介
                    $(".resumeDeal").html(template("resume_deal_jl", $.extend({},t.personInfo,oData)));
                    t.d.reset();//重置弹窗
                    $("#resumeDeal .btn3").unbind("click").bind("click", function () {
                        t.deal1 = true;
                        t.resume_deal_1_fun(oData);
                    })
                    $("#resumeDeal .btn4").unbind("click").bind("click", function () {
                        t.editData1 = oData;
                        t.getTemplateData(1, "面试安排");
                    })
                    break;
                default:
            }

        },

        /*安排面试成功*/
        resume_deal_1_fun:function(param){
            var t = this;
            if(!param) {
                var sNotice = $('input[name="form_1_notice"]').prop("checked") == true ? 1 : 0;
                var oData = {
                    resumeId: t.resumeId,
                    interviewerId: t.drop1["selectedId"],
                    interviewerName: t.drop1["selectedVal"],
                    interviewDate: $('input[name="form_1_date"]').val(),
                    interviewAddress: $('input[name="form_1_address"]').val(),
                    contract: $('input[name="form_1_contract"]').val(),
                    contractMobile: $('input[name="form_1_contract_mobile"]').val(),
                    remark: $('textarea[name="form_1_remark"]').val(),
                    interviewerMobile: $('input[name="form_1_mobile"]').val(),
                    isNotice: sNotice
                };
            }else{
                var oData = param;
            }
            if(t.deal1 == true) {
                Ajax.ApiTools().interviewArrange({
                    data: oData,
                    success: function (data) {
                        if (data.result == "true") {
                            t.d.remove();
                            t.options.opt.mmButtonTemplateFun();
                            t.options.opt.mmg.load();
                            tools.showMsg.ok('安排成功');
                        }
                    }
                });
            }else{
                t.changeTemplateData(5, "面试安排", oData);
            }

        },

        resume_deal_2_fun:function(param){
            var t = this;
            if(!param) {
                var sNotice = $('input[name="form_2_notice"]').prop("checked") == true ? 1 : 0;
                var oData = {
                    resumeId: t.resumeId,
                    arrivalTime: $('input[name="form_2_date"]').val(),
                    arrivalPlace: $('input[name="form_2_address"]').val(),
                    contract: $('input[name="form_2_contract"]').val(),
                    mobile: $('input[name="form_2_contract_mobile"]').val(),
                    remark: $('textarea[name="form_2_remark"]').val(),
                    isNotice: sNotice,
                    offerUrl:t.fileUrl
                };
            }else{
                var oData = param;
            }
            if(t.deal2 == true) {
                Ajax.ApiTools().sendOffer({
                    data: oData,
                    success: function (data) {
                        if (data.result == "true") {
                            t.d.remove();
                            t.options.opt.mmButtonTemplateFun();
                            t.options.opt.mmg.load();
                            tools.showMsg.ok('录用成功');
                        }
                    }
                });
            }else{
                oData.fileName = t.fileName;
                t.changeTemplateData(3, "发送Offer", oData);
            }
        },
        resume_deal_3_fun:function(){
            var t = this;
            var oParam = {
                resumeId : t.resumeId,
                interviewerId : t.drop21["selectedId"],
                interviewerName : t.drop21["selectedVal"],
                interviewDate : $("input[name='form_3_date']").val(),
                interviewEvaluate : $("textarea[name='form_3_record']").val(),
                result : t.drop22["selectedId"]
            }
            Ajax.ApiTools().interviewEvaluate({
                data: oParam,
                success: function (data) {
                    if (data.result == "true") {
                        t.d.remove();
                        t.options.opt.mmButtonTemplateFun();
                        t.options.opt.mmg.load();
                        tools.showMsg.ok('保存成功');
                    }
                }
            });
        }
    };
    module.exports = ClassName;
});



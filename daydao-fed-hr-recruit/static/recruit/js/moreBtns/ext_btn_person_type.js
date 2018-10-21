/**
 * Created by tangguoping on 2017/1/6.
 * 人才分类
 */
define(function(require, exports, module) {
    //"use strict";
    var Ajax = require("js/ajax");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗
    //表单控件
    require("commonStaticDirectory/plugins/autoForm/autoForm.css");
    require("commonStaticDirectory/plugins/jquery.loading");
    var ClassName = function(){
        this.init.apply(this,arguments);
    }
    ClassName.prototype = {
        constructor : ClassName,
        options:{
            oPayOrgDate:undefined,
            mmg:undefined
        },
        /**
         *初始化函数
         */
        init : function(options){
            var t = this;
            //初始化类要做的事情
            this.options = $.extend({},this.options,options);
            t.validatorFields = {};
            var aItem = this.options.aItem;
            var _html = '<div id="recruit_person_type" class="recruit_content"><form id="recruit_person_type_form"></form></div>';
            if(aItem.length < 1){
                tools.showMsg.error("请选择需要人才分类的数据");
                return;
            }
            t.aFormData = [
                {label: "人才类别",name:"personTypeId",type:"treeSelect",isMust:true,keyValueBean:{infoSetId:"ct_re_04",isDateFilter:false,keyId:"code_id",valueId:"code_name"}}
            ]
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
            t.dialog = dialog({
                title: '人才分类',
                content: _html,
                okValue: '保存',
                ok: function () {
                    $('#recruit_person_type').find("form:first").trigger("validate"); //触发表单验证
                    return false;
                },
                cancelValue: '取消',
                cancel: function () {}
            });
            t.getDropSelectData();
        }
        ,saveData:function () {
            var t = this;
            var _oOldEditData = {};
            var $form = $("#recruit_person_type_form");

            require.async("commonStaticDirectory/plugins/autoForm/autoForm",function(AutoForm){
                var form1 = new AutoForm({
                    id:"recruit_person_type_form",
                    data:t.aFormData,
                    minHeight:50,
                    showRow:1,
                    //加载完成
                    formComplete:function($form){
                        t.$form = $form;
                        t.dialog.showModal();
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
                        //表单验证通过
                        var aItem = []
                        for (var i=0; i<t.options.aItem.length;i++){
                            aItem.push(t.options.aItem[i].resumeId);
                        }
                        var oSubmitData = {
                            talentsTypeId:$form.find("input[name=personTypeId]").val(),
                            talentsTypeName:$form.find(".dayhr_drop_select_input").attr("title"),
                            resumeIds:aItem
                        };
                        $("body").loading({zIndex:999}) //启用loading遮罩
                        Ajax.ApiTools().talentClassify({
                            data:oSubmitData
                            ,success:function (data) {
                                if(data.result=="true"){
                                    tools.showMsg.ok("保存成功！");
                                    $("body").loading({state:false});
                                    t.options.oMetaData.mmg.load();
                                    t.dialog.remove();
                                }else {
                                    tools.showMsg.error(data.resultDesc);
                                }
                            }
                        });
                    }
                });
            });


        }
        ,getDropSelectData:function () {
            var t = this;
            var aFormObj = t.aFormData;
            var iIndex = 0; //开始处理的表单的索引
            function setFormPlugins() {
                //处理特殊表单项完毕，开始初始化表单了
                if(iIndex == aFormObj.length){
                    $("body").loading({state:false}); //关闭遮罩
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
            $("body").loading({zIndex:999}) //启用loading遮罩
            //特殊插件的表单项处理
            setFormPlugins();
        },
        /**
         * 继续扩展方法
         */
        otherFunction : function(){

        }

    };
    module.exports = ClassName;
});



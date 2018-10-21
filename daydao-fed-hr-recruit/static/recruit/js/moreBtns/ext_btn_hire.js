/**
 * Created by tangguoping on 2016/12/29.
 * 转入职
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
            var _html = '<div id="recruit_hire" class="recruit_content"></div>';
            if(aItem.length != 1){
                tools.showMsg.error("请选择一条需要转入职的数据");
                return;
            };
            if(aItem[0].resume_status_id == "已入职"){
                tools.showMsg.error("已入职状态的简历不能转入职");
                return;
            };
            t.aFormData = [
                {label: "入职组织",name:"org_id",type:"treeSelect",isMust:true,keyValueBean:{infoSetId:"hr_org",isDateFilter:true,keyId:"org_id",parentId:"parent_org_id",valueId:"org_name",orderStr:"gid"}}
                ,{label: "担任职位",name:"pos_id",type:"treeSelect",isMust:true,keyValueBean:{infoSetId:"r_hr_org_pos",isDateFilter:false,keyId:"id",parentId:"parent_id",valueId:"value"}}
                ,{label: "入职日期",name:"joinDate",type:"date",isMust:true}
                ,{label: "人员状态",name:"status",type:"treeSelect",isMust:true,keyValueBean:{infoSetId:"ct_310",isDateFilter:false,keyId:"code_id",parentId:"parent_id",valueId:"code_name"}}
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
                title: '应聘入职',
                content: _html,
                okValue: '保存',
                ok: function () {
                    $('#recruit_hire').find("form:first").trigger("validate"); //触发表单验证
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
            require.async("commonStaticDirectory/plugins/autoForm/autoForm",function(AutoForm){
                var form1 = new AutoForm({
                    id:"recruit_hire",
                    data:t.aFormData,
                    minHeight:50,
                    showRow:1,
                    //加载完成
                    formComplete:function($form){
                        t.$form = $form;
                        t.dialog.showModal();
                    }
                });
                var $form = $('#recruit_hire').find("form:first");
                $form.validator({
                    theme: "yellow_right",
                    timely:0, // 保存的时候验证
                    focusCleanup:true,
                    stopOnError:true,
                    //待验证字段集合
                    fields: t.validatorFields,
                    valid:function(form) {
                        //表单验证通过
                        var oSubmitData = {
                            joinDate:$form.find("input[name=joinDate]").val()
                            ,orgId:parseInt($form.find("input[name=org_id]").val())
                            ,posId:parseInt($form.find("input[name=pos_id]").val())
                            ,status:$form.find("input[name=status]").val()
                            ,resumeId:t.options.aItem[0].id
                        };
                        $("body").loading({zIndex:999}) //启用loading遮罩
                        Ajax.ApiTools().hire({
                            data:oSubmitData
                            ,success:function (data) {
                                tools.showMsg.ok("转入职成功！");
                                $("body").loading({state:false});
                                t.options.oMetaData.mmg.load();
                                t.dialog.remove();
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

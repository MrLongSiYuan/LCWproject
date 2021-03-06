/**
 * Created by tangguoping on 2017/1/4.
 * 加入黑名单
 */
define(function(require, exports, module) {
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗
    //表单控件
    require("commonStaticDirectory/plugins/autoForm/autoForm.css");
    require("commonStaticDirectory/plugins/jquery.loading");
    //下拉菜单组件
    var ClassName = function(){
        this.init.apply(this,arguments);
    }
    ClassName.prototype = {
        constructor : ClassName
        ,options:{
            mmg:undefined
        }
        /**
         *初始化函数
         */
        ,init : function(options){
            var t = this;
            //初始化类要做的事情
            this.options = $.extend({},this.options,options);
            var aItem = this.options.aItem;
            t.validatorFields = {};
            if(aItem.length < 1){
                tools.showMsg.error("请选择需要加入黑名单的数据");
                return;
            };
            for (var i=0; i<aItem.length;i++){
                if(aItem[i].resume_status_id == "黑名单"){
                    tools.showMsg.error("黑名单状态的简历不能加入黑名单");
                    return;
                };
            };
            var _html = '<div id="recruit_blist" class="recruit_content"></div>';
            t.aFormData = [
                {label: "转入日期",name:"recycleDate",type:"date",isMust:true}
                ,{label: "黑名单原因",name:"blackReasonId",type:"treeSelect",isMust:true,keyValueBean:{infoSetId:"ct_re_05",isDateFilter:false,keyId:"code_id",valueId:"code_name"}}
                ,{label: "备注",name:"blacklistMark",type:"textarea",isMust:false,maxlength:36}
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
                title: '加入黑名单',
                content: _html,
                okValue: '保存',
                ok: function () {
                    $('#recruit_blist').find("form:first").trigger("validate"); //触发表单验证
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
                    id:"recruit_blist",
                    data:t.aFormData,
                    minHeight:50,
                    showRow:1,
                    //加载完成
                    formComplete:function($form){
                        t.$form = $form;
                        t.dialog.showModal();
                    }
                });
                var $form = $('#recruit_blist').find("form:first");
                $form.validator({
                    theme: "yellow_right",
                    timely:0, // 保存的时候验证
                    focusCleanup:true,
                    stopOnError:true,
                    //待验证字段集合
                    fields: t.validatorFields,
                    valid:function(form) {
                        var _aItem = [];
                        for (var i=0; i<t.options.aItem.length;i++){
                            _aItem.push(t.options.aItem[i].id);
                        }
                        //表单验证通过
                        var oSubmitData = {
                            blackReasonId:$form.find("input[name=blackReasonId]").val()
                            ,recycleDate:$form.find("input[name=recycleDate]").val()
                            ,blacklistMark:$form.find("textarea[name=blacklistMark]").val()
                            ,id:_aItem.toString()
                        };
                        $("body").loading({zIndex:999}) //启用loading遮罩
                        Ajax.ApiTools().blist({
                            data:oSubmitData
                            ,success:function (data) {
                                tools.showMsg.ok("加入黑名单成功！");
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
        }
        /**
         * 继续扩展方法
         */
        ,otherFunction : function(){

        }

    };
    module.exports = ClassName;
});

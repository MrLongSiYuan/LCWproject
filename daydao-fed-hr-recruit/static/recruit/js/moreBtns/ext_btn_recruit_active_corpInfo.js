/**
 * Created by tangguoping on 2017/1/9.
 * 企业信息
 */
define(function(require, exports, module) {
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗
    //表单控件
    require("commonStaticDirectory/plugins/autoForm/autoForm.css");
    require("commonStaticDirectory/plugins/jquery.loading");
    var ImgCropper = require("commonStaticDirectory/plugins/imgCropper/imgCropper");
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
            t.validatorFields = {
                telephone:{rule: 'phone;'}
                ,mailbox:{rule: 'email;'}
            };
            t.logoUrl = gMain.baseStaticHrPath+"/recruit/images/recruit_default.png";
            var _html = '<div id="recruit_corpInfo"></div>';
            t.aFormData = [
                {label: "公司名称",name:"corpName",type:"text",value:"",isMust:false,maxlength:30}
                ,{label: "公司网址",name:"corpWebsite",type:"text",value:"",isMust:false,maxlength:30}
                ,{label: "业务领域",name:"busDomain",type:"text",value:"",isMust:false,maxlength:30}
                ,{label: "发展阶段",name:"stage",type:"text",value:"",isMust:false,maxlength:20}
                ,{label: "人员规模",name:"employeeRange",type:"text",value:"",isMust:false,maxlength:10}
                ,{label: "城市",name:"location",type:"text",value:"",isMust:false,maxlength:10}
                ,{label: "公司介绍",name:"profile",type:"textarea",isMust:false,maxlength:800}
                ,{label: "发展历程",name:"history",type:"textarea",isMust:false,maxlength:800}
                ,{label: "联系人",name:"contact",type:"text",value:"",isMust:false,maxlength:10}
                ,{label: "联系方式",name:"telephone",type:"text",value:"",isMust:false,maxlength:18}
                ,{label: "Email",name:"mailbox",type:"text",value:"",isMust:false,maxlength:30}
                ,{label: "logo",name:"logo",type:"hidden",value:"",isMust:false}
            ];
            t.dialog = dialog({
                title: '企业信息维护',
                content: _html,
                okValue: '保存',
                ok: function () {
                    $('#recruit_corpInfo').find("form:first").trigger("validate"); //触发表单验证
                    return false;
                },
                cancelValue: '取消',
                cancel: function () {}
            });
            t.getCorpInfo();
        }
        ,saveData:function () {
            var t = this;
            var _oOldEditData = {};
            require.async("commonStaticDirectory/plugins/autoForm/autoForm",function(AutoForm){
                var form1 = new AutoForm({
                    id:"recruit_corpInfo",
                    data:t.aFormData,
                    minHeight:50,
                    showRow:1,
                    //加载完成
                    formComplete:function($form){
                        t.$form = $form;
                        //自定义图片上传
                        t.imgCropper();
                        t.dialog.showModal();
                    }
                });
                var $form =  $('#recruit_corpInfo').find("form:first");
                $form.validator({
                    theme: "yellow_right",
                    timely:0, // 保存的时候验证
                    focusCleanup:true,
                    stopOnError:true,
                    rules:{phone: [/^(\d(\d|\-)*\d|1[3-9]\d{9})$/, "请输入正确的联系方式"]},
                    //待验证字段集合
                    fields: t.validatorFields,
                    valid:function(form) {
                        //表单验证通过
                        var oSubmitData = {};
                        for(var item in t.postData){
                            if($form.find("input[name="+item+"]").length){
                                oSubmitData[item] = $form.find("input[name="+item+"]").val();
                            }else if($form.find("textarea[name="+item+"]").length){
                                oSubmitData[item] = $form.find("textarea[name="+item+"]").val();
                            }else {
                                oSubmitData[item] = t.postData[item];
                            }
                        }
                        $("body").loading({zIndex:999});//启用loading遮罩
                        Ajax.ApiTools().saveCorpInfo({
                            data:oSubmitData
                            ,success:function (data) {
                                tools.showMsg.ok("保存成功！");
                                $("body").loading({state:false});
                                t.dialog.remove();
                            }
                        });
                    }
                });
            });
        }
        /**
         * logo上传裁剪
         * */
        ,imgCropper:function () {
            var t = this;
            var _html = "<div id='recruit_corpInfoLogo'><img src='"+t.logoUrl+"' alt='logo'>" +
                "<div class='corpInfoHover'><p class='iconfont_daydao_recruit'>&#xe607;</p>上传LOGO请小于10M<br/>尺寸：170px*170px</div></div>";
            t.$form.append(_html);
            var _infoSetId = t.options.oMetaData.options.infoSetId;
            $("#recruit_corpInfoLogo").on('click',function () {
                if(typeof FileReader === "function"){
                    new ImgCropper({
                        fileFormName:"img"
                        ,title:"企业logo裁剪"
                        ,url:gMain.apiBasePath + "route/"+_infoSetId+"/uploadImg.do"
                        ,callback:function(data){
                            if(data.result == "true"){
                                $("#recruit_corpInfoLogo img").attr('src',data.fullImgPath);
                                $("#recruit_corpInfo").find('input[name=logo]').val(data.fullImgPath);
                            }else {
                                tools.showMsg.error(data.resultDesc);
                            }
                        }
                    });
                }
            })
        }
        /**
         * 获取企业信息
         * */
        ,getCorpInfo:function () {
            var t = this;
            Ajax.ApiTools().getCorpInfo({
                success:function (data) {
                    t.postData =  data;
                    for(var item in data){
                        for(var i=0;i<t.aFormData.length;i++){
                            if(t.aFormData[i].name == item){
                                if(item == "logo"){
                                    if(data[item]){
                                        t.logoUrl = data[item];
                                    }
                                }
                                t.aFormData[i].value = data[item];
                            }
                        }
                    }
                    t.saveData();
                }
            });
        }
        /**
         * 继续扩展方法
         */
        ,otherFunction : function(){

        }

    };
    module.exports = ClassName;
});


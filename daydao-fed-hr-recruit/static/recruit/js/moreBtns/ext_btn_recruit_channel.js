/**
 * Created by plus on 2017/7/4.
 * 招聘渠道
 */
define(function(require, exports, module) {
    require("css/ext_btn_recruit_channel.css");
    var sTpl = require("templates/ext_btn_recruit_channel.html");

    var Ajax = require("js/ajax");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗*/
    require("commonStaticDirectory/plugins/layer/layer"); //弹窗
    //表单控件
    require("commonStaticDirectory/plugins/jquery.loading");
    //单选下拉框
    require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect.css");
    var dayhrDropSelect = require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropSelect");


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
                width:'500px',
                title:'招聘渠道维护'
                ,content:'<div id="recruit_channel_list">'+sTpl+'</div>'
            });
            t.d.showModal();
            t.initVue(t.d);
        }
        ,initVue:function (dialog) {
            var that = this;
            that.vueDialog = new Vue({
                el:"#recruit_channel_list"
                ,data:{
                    gMain:gMain,
                    sId:"1",
                    imgData:["recruit_channel_1.png","recruit_channel_2.png","recruit_channel_3.png"],
                    allData:"",
                    currentData:"",
                    add:true,
                }
                ,attached:function () {
                    var t = this;
                    t.init();
                    t.getAll();
                }
                , watch: {
                    'add': function (val, oldVal) {
                        var t = this;
                    },
                }
                ,methods:{
                    init:function(){
                        var t = this;
                        var oData = {infoSetId:"ct_re_07",isDateFilter:false,keyId:"code_id",valueId:"code_name"};
                        Ajax.ApiTools().getKeyValueData({
                            data:oData,
                            success:function(data){
                                //如果是tree
                                if(data.result == "true") {
                                    t.drop = new dayhrDropSelect({
                                        id: "recruit_channel_drop",
                                        width: 198,
                                        maxHeight: 250,
                                        data: data.beans,
                                        name: "recruit-channel-type",
                                        onSelected: function (oSelect, type) {
                                            t.sId = t.drop.getValue();
                                        }
                                    });
                                }

                            }
                        });

                    },
                    /*获取所有绑定账号*/
                    getAll:function() {
                        var t = this;
                        Ajax.ApiTools().getChannelAccount({
                            data:{},
                            success:function(data){
                                //如果是tree
                                if(data.result == "true") {
                                        t.allData = data.data;
                                        $("input[name='recruit-channel-member']").val("");
                                        $("input[name='recruit-channel-name']").val("");
                                        $("input[name='recruit-channel-password']").val("");
                                        t.$nextTick(function () {
                                            dialog.reset();
                                        })

                                }

                            }
                        });
                    },
                    /*绑定修改账号*/
                    binding:function(param){
                        var t = this;
                        var sVipName,sAccountName,sPasswd,oData;
                        sVipName =  $("input[name='recruit-channel-member']").val().replace(/\s+/g,"");
                        sAccountName = $("input[name='recruit-channel-name']").val().replace(/\s+/g,"");
                        sPasswd = $("input[name='recruit-channel-password']").val().replace(/\s+/g,"");

                        oData = {
                            vipname:sVipName,
                            accountName:sAccountName,
                            passwd:sPasswd,
                            channelTypeId:t.drop.getValue(),
                            channelTypeName:t.drop.getShowValue()
                        }
                        if(param != true){
                            oData.uuid = param; /*如果是修改就加uuid*/
                        }
                        if(sVipName!=""&&sAccountName!=""&&sPasswd!=""&&t.drop.getValue()!=""){
                            Ajax.ApiTools().updateOrAddChannel({
                                data:oData,
                                success:function(data){
                                    //如果是tree
                                    if(data.result == "true") {
                                        if(param == true) {
                                            tools.showMsg.ok("新增成功！");
                                        }else{
                                            tools.showMsg.ok("保存成功！");
                                            t.add = true;
                                        }
                                        t.getAll();
                                    }

                                }
                            });
                        }else{
                            tools.showMsg.error("全部为必填项！");
                        }
                    },
                    /*删除账号*/
                    deleteAccount:function(sUuid){
                        var t = this;
                        layer.confirm('删除后，你将无法继续通过该帐号接收简历及发布职位到该渠道，请确认？', {
                            icon: 3,
                            title: '提示',
                            btn: ['确定','取消'] //按钮
                        }, function(){
                            Ajax.ApiTools().deleteChannelAccount({
                                data:{uuid:sUuid},
                                success:function(data){
                                    //如果是tree
                                    if(data.result == "true") {
                                        tools.showMsg.ok("删除成功！");
                                        t.add = true;
                                        t.getAll();
                                    }

                                }
                            });
                        }, function(){
                        });

                    },
                    /*修改账号*/
                    editAccount:function(obj){
                        var t = this;
                        t.add = false;
                        t.currentData = obj;
                        $("input[name='recruit-channel-member']").val(obj.vipname);
                        $("input[name='recruit-channel-name']").val(obj.accountName);
                        $("input[name='recruit-channel-password']").val(obj.passwd);
                        t.drop.setValue(obj.channelTypeId);
                    }
                }
            });
        },


    });
    module.exports = showDialog;
});
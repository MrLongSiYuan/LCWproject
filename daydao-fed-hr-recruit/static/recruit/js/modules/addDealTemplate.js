/**
 * Created by plus on 2017/6/21.
 * 简历处理淘汰模板
 */

define(function (require, exports, module) {
    require("css/addDealTemplate.css");
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗
    require("commonStaticDirectory/plugins/layer/layer"); //弹窗
    require("commonStaticDirectory/plugins/jquery.loading");
    var template = require("commonStaticDirectory/plugins/template");

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
            require.async("templates/addDealTemplate.html", function (tpl) {
                t.tpl = tpl;//整个模板
                t.add = "";
                t.addTemplate();
            });

        },

        addTemplate: function () {
            var t = this;
            t.d = dialog({
                width: "680px",
                title: '基础设置',
                content: '<div id="resumeDealAddTemplate">'+t.tpl+'</div>',
            })
            t.d.showModal();
            Ajax.ApiTools().getAllEliminateData({
                data:{}
                ,success:function (data) {
                    if(data.result == "true") {
                        t.getDataAfter(data.data);
                    }
                }
            });
        },

        getDataAfter:function(oData){
            var t = this;
            var $resumeDeal= $(".resumeDealAddTemplate");
            $resumeDeal.html(template("resume_deal_add", {data:oData}));
            t.d.reset();
            var $bottom = $(".resume_deal_add_bottom");
            var $layerContent = $(".layui-layer-content");
            /*删除*/
            $resumeDeal.delegate(".del","click",function () {
                var $del = $(this);
                t.templateId = $del.parent().attr("data-id");
                layer.confirm('您确定删除此模板么？', {
                    icon:3,
                    title: '删除操作',
                    btn: ['确定', '取消'] //按钮
                }, function () {
                    Ajax.ApiTools().delEliminateData({
                        data:{templateId:t.templateId}
                        ,success:function (data) {
                            if(data.result == "true") {
                                tools.showMsg.ok('删除成功');
                                $del.parent().parent().remove();
                                $(".resume_deal_add_tpl").remove();
                                t.d.reset();
                            }
                        }
                    });

                }, function () {
                });
            })
            /*编辑*/
            $resumeDeal.delegate(".edit","click",function () {
                t.add = false;
                var  $this = $(this);
                t.templateId = $this.parent().attr("data-id");
                layer.confirm('您确定编辑此模板么？', {
                    icon:3,
                    title: '编辑操作',
                    btn: ['确定', '取消'] //按钮
                }, function (index) {
                    layer.close(index);
                    var sReason = $this.parent().parent().find("td.t_2").text();
                    var sContent = $this.parent().parent().find("td.t_3").text();
                    var data = {
                        reason:sReason,
                        content:sContent
                    }
                    $bottom.html(template("resume_deal_add_tpl", data));
                    t.d.reset();
                }, function () {
                });

            })
            /*新增*/
            $resumeDeal.delegate(".add","click",function () {
                t.add = true;
                $bottom.html(template("resume_deal_add_tpl", {}));
                t.d.reset();
            })
            /*取消*/
            $resumeDeal.delegate(".cancel","click",function () {
                $(".resume_deal_add_tpl").remove();
                t.d.reset();
            })
            /*保存*/
            $resumeDeal.delegate(".save","click",function () {
                /*判断t.add*/
                var sReason = $("input[name='reason']").val();
                var sContent = $("textarea[name='content']").val();
                if(sReason==""||sContent==""){
                    tools.showMsg.error('淘汰原因和解释说明不能为空！');
                    return;
                }
                if(t.add == true) {
                    Ajax.ApiTools().addEliminateData({
                        data: {shortReason: sReason, detailReason: sContent}
                        , success: function (data) {
                            if (data.result == "true") {
                                if(data.data) {
                                    tools.showMsg.ok('新增成功');
                                    $(".resume_deal_add_tpl").remove();
                                    var sTpl = '<tr><td class="t_1" data-id="'+data.data+'"><span class="iconfont_daydao_recruit edit" title="编辑">&#xe607;</span><span class="iconfont_daydao_recruit del" title="删除">&#xe6a0;</span></td><td class="t_2">' + sReason + '</td><td class="t_3">' + sContent + '</td></tr>';
                                    $(".table2 table tbody").append(sTpl);
                                    t.d.reset();
                                }else{
                                    tools.showMsg.error('新增失败');
                                }
                            }
                        }
                    });
                }else{
                    Ajax.ApiTools().updateEliminateData({
                        data: {templateId:t.templateId,shortReason: sReason, detailReason: sContent}
                        , success: function (data) {
                            if (data.result == "true") {
                                tools.showMsg.ok('保存成功');
                                $(".resume_deal_add_tpl").remove();
                                t.d.reset();
                                $("td.t_1[data-id='"+t.templateId+"']").parent().find(".t_2").text(sReason);
                                $("td.t_1[data-id='"+t.templateId+"']").parent().find(".t_3").text(sContent);
                            }
                        }
                    });
                }

            })
        },

    };
    module.exports = ClassName;
});



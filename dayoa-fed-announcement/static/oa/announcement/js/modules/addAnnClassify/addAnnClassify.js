/**
 * Created by dyl on 2017/4/5.
 */
define(function (require, exports, module) {
    require("js/modules/addAnnClassify/addAnnClassify.css")
    var sTpl = require("js/modules/addAnnClassify/addAnnClassify.html")
    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");
    var addAnnClassify= function () {
        this.init.apply(this,arguments);
    };
    $.extend(addAnnClassify.prototype,{
        constructor: addAnnClassify
        , options: {
        }
        , init: function (options) {
            var t = this;
            t.options = $.extend({}, t.options, options);
            t.createDialog(); //弹窗
        }
        , createDialog: function () {
            var t = this;
            t.dialog = dialog({
                title: "新增"
                , button: [
                    {
                        value:"保存",
                        callback:function(){
                            if(t.vueObj.sClass==""){
                                tools.showMsg.error("新增公告分类不能为空");
                                return false;
                            }
                            t.vueObj.addClass();
                        }
                        ,autofocus:true
                    },
                    {
                        value:"取消",
                        callback:function(){

                        }
                    },
                ]
                , content: sTpl
            });
            t.dialog.showModal();
            t.initVue();
        }
        ,initVue: function () {
            var that = this;
            that.vueObj = new Vue({
                el:"#addAnnClassify"
                ,data:{
                    maxLen:100//输入框最大字数
                    ,currLen:0//输入框当前字数
                    ,sClass:""//输入的分类
                    ,sExplain:""//说明
                },
                attached: function () {
                }
                ,methods:{
                    checkLen: function (e) {
                        var t=this;
                        t.currLen=$(e.target).val().length;
                        t.currLen=JSON.parse(JSON.stringify(t.currLen));
                        if(t.currLen>t.maxLen){
                            $(e.target).val($(e.target).val().substring(0,t.maxLen-1))
                        }
                    },
                    addClass:function () {
                        var t = this;
                        Ajax.ajax({
                            url: gMain.apiBasePath + "route/am_type_list/insert.do",
                            data: JSON.stringify({"dataList": [{"key": "type_name", "value": t.sClass},{"key": "explain", "value": t.sExplain}], "infoSetId": "am_type_list"}),
                            success: function (data) {
                                if (data.result == "true" && data.resultDesc) {
                                    t.getAnnList();
                                }
                            }
                        })
                    },
                    getAnnList:function(){
                        var t = this;
                        Ajax.ajax({
                            url:gMain.apiBasePath+"route/am_type_list/getAll.do"
                            ,data:JSON.stringify({
                                "infoSetId":"am_type_list",
                                "searchConditionList":[],
                                "pageBean":{
                                    "pageNo":"1",
                                    "pageSize":20
                                },
                                "sort":{"sortName":"",
                                    "sortStatus":"asc"
                                }
                            })
                            ,success:function(data){
                               if(data.result = "true"){
                                   if(that.options.addAnnouncement){
                                       var classList = [];
                                       if(data.maps.length != 0) {
                                           for (var i = 0; i < data.maps.length; i++) {
                                               classList.push({id:data.maps[i].uuid, name:data.maps[i].type_name})
                                           };
                                       };
                                       that.options.addAnnouncement.dropClassify.updateTreeJson(classList);
                                       that.options.addAnnouncement.dropClassify.setValue(classList[0].name);
                                   }
                               }
                            }
                        })
                    },

                }
            })
        }
    })

    module.exports = addAnnClassify;
});
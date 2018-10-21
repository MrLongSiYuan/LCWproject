/**
 * Created by tanggguoping on 2017/1/3.
 */
define(function(require, exports, module) {
    var Ajax = require("js/ajax.js");
    require("commonStaticDirectory/plugins/zTree/zTreeStyle/zTreeStyle.css");
    require("commonStaticDirectory/plugins/zTree/jquery.ztree.all.min.js");
    require("commonStaticDirectory/plugins/underscore.min");
    //下拉菜单组件
    var ClassName = function(){
        this.init.apply(this,arguments);
    }
    ClassName.prototype = {
        constructor : ClassName
        ,options:{
            oPayOrgDate:undefined,
            mmg:undefined
        }
        /**
         *初始化函数
         */
        ,init : function(options){
            var t = this;
            //初始化类要做的事情
            this.options = $.extend({},this.options,options);
            t.infoSetId = this.options.oMetaData.options.infoSetId;
            t.mmg = this.options.oMetaData.mmg;
            t.className = "dark";
            t.dataJob = '_type';
            t.sTip =  '注意：请不要超过两层分类，以方便于归类统计。' ;
            t.initDom();
        }
        /**
         * 初始化dom结构
         * */
        ,initDom:function () {
            var t = this;
            var _sHtml = '<ul class="base_org_person_reports_title" id="basicDataBtn"><li class="on" data-job ="_type">人才类别</li></ul>' +
                '<div class="base_org_person_reports_box base_import_infomation_show_btn iconfont_dayhr_base">&#xe603;<div class="base_import_infomation_show">'+t.sTip+'</div></div>' +
                '<ul id="basic_data_family" class="ztree" style="width:315px;height:450px;border:1px solid #ccc;overflow-y: scroll;overflow-x: auto;">' +
                '&nbsp;&nbsp;数据加载中...' +
                '</ul>';
            t.dialog = dialog({
                title:"基础数据",
                button:[
                    {
                        value: '确定',
                        callback: function () {
                            if(t.dataJob == '_type'){
                                var aNodes = t.treeObj.getNodes()[0].children; //排除名为“全部”的根节点
                                var aSends = []; //简洁性的树传给后端
                                if(aNodes.length){
                                    function setNewNodes(arr){
                                        var aTemp = [];
                                        for(var i=0;i<arr.length;i++){
                                            var oNode = {
                                                id:arr[i].id,
                                                name:arr[i].name
                                            };
                                            if(arr[i].children && arr[i].children.length){
                                                oNode.children = setNewNodes(arr[i].children);
                                            }
                                            aTemp.push(oNode);
                                        }
                                        return aTemp;
                                    }
                                    aSends = setNewNodes(aNodes);
                                }
                                Ajax.ApiTools().updateJobFamilyTree({
                                    data:aSends
                                    ,success:function(data){
                                        if(data.result == "true"){
                                            //操作失败的职务类型
                                            if(data.notPassJobFamily && $.isArray(data.notPassJobFamily) && data.notPassJobFamily.length && data.notPassInfo && $.isArray(data.notPassInfo) && data.notPassInfo.length){
                                                var sTitle = data.notPassJobFamily[0];
                                                var sDes = data.notPassInfo[0];
                                                layer.msg('操作失败，"'+sTitle+'"'+sDes, {offset: 0,shift:6});
                                            }else{
                                                layer.msg("保存成功", {offset: 0});
                                                t.options.oMetaData.quickMenuNav.updateTreeDataAndDom(); //重载导航树
                                                t.mmg.load(); //重载表格
                                                t.dialog.close().remove();
                                            }
                                        }
                                    }
                                });
                            }else{
                                var aNodes = t.treeObjNew.getNodes()[0].children; //排除名为“全部”的根节点
                                var aSends = []; //简洁性的树传给后端
                                if(aNodes.length){
                                    function setNewNodes(arr){
                                        var aTemp = [];
                                        for(var i=0;i<arr.length;i++){
                                            var oNode = {
                                                id:arr[i].id,
                                                name:arr[i].name
                                            };
                                            if(arr[i].children && arr[i].children.length){
                                                oNode.children = setNewNodes(arr[i].children);
                                            }
                                            aTemp.push(oNode);
                                        }
                                        return aTemp;
                                    }
                                    aSends = setNewNodes(aNodes);
                                }
                                Ajax.ApiTools().updateJobLevelTree({
                                    data:aSends
                                    ,success:function(data){
                                        if(data.result == "true"){
                                            //操作失败的职务类型
                                            if(data.notPassJobFamily && $.isArray(data.notPassJobFamily) && data.notPassJobFamily.length && data.notPassInfo && $.isArray(data.notPassInfo) && data.notPassInfo.length){
                                                var sTitle = data.notPassJobFamily[0];
                                                var sDes = data.notPassInfo[0];
                                                layer.msg('操作失败，"'+sTitle+'"'+sDes, {offset: 0,shift:6});
                                            }else{
                                                layer.msg("保存成功", {offset: 0});
                                                t.options.oMetaData.quickMenuNav.updateTreeDataAndDom(); //重载导航树
                                                t.mmg.load(); //重载表格
                                                t.dialog.close().remove();
                                            }
                                        }
                                    }
                                });
                            }

                            return false;
                        },
                        autofocus: true
                    },
                    {
                        value: '重置',
                        callback: function () {
                            if(t.dataJob == '_type'){
                                t.initTree();
                            }else{
                                t.initTreeNew();
                            }

                            return false;
                        }
                    },
                    {
                        value: '取消',
                        callback: function () {
                        }
                    }
                ],
                content:_sHtml
            }).showModal();
        }
        /**
         * 继续扩展方法
         */
        ,otherFunction : function(){

        }

    };
    module.exports = ClassName;
});

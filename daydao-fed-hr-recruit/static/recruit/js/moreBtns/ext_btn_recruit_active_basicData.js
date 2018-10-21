/**
 * Created by tangguoping on 2017/1/9.
 * 招聘信息列表的招聘类型管理
 * @options 参数对象
 * @options.aItem  当前选中的行的数据集
 * @options.aRowIndex 前端选中行的序号集
 * @options.oMetaData  元数据的对象
 */
define(function(require,exports,module){
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");
    var Ajax = require("js/ajax.js");
    require("commonStaticDirectory/plugins/zTree/zTreeStyle/zTreeStyle.css");
    require("commonStaticDirectory/plugins/zTree/jquery.ztree.all.min.js");
    require("commonStaticDirectory/plugins/underscore.min");

    var ExtBtnClass = function(){
        this.init.apply(this,arguments);
    };
    ExtBtnClass.prototype = {
        constructor:ExtBtnClass,
        options:{
        },
        init:function(options){
            var t = this;
            this.options = $.extend({},this.options,options);
            this.infoSetId = this.options.oMetaData.options.infoSetId;
            this.mmg = this.options.oMetaData.mmg;
            this.className = "dark";
            this.dataJob = '_type';
            t.sTip =  '注意：请不要超过两层分类，以方便于归类统计。' ;
            this.initDom();
        },
        /**
         * 初始化dom结构
         * */
        initDom:function(){
            var t = this;
            var _sHtml = '<ul class="base_org_person_reports_title" id="basicDataBtn"><li class="on" data-job ="_type">招聘类型</li><li data-job ="_lv">费用项目</li></ul>' +
                // '<div class="base_org_person_reports_box base_import_infomation_show_btn iconfont_dayhr_base">&#xe603;<div class="base_import_infomation_show">'+t.sTip+'</div></div>' +
                '<ul id="base_job_family" class="ztree" style="width:315px;height:450px;border:1px solid #ccc;overflow-y: scroll;overflow-x: auto;">' +
                '   数据加载中...' +
                '</ul>';
            t.dialog = dialog({
                title:"基础数据",
                button:[
                    {
                        value: '确定',
                        callback: function () {
                            if(t.dataJob == '_type'){
                                var aNodes = t.treeObj.getNodes()[0].children; //排除名为“全部”的根节点
                                var nodeArr = t.treeObj.transformToArray(aNodes);
                                var aSends = [];   //存储所有节点数据的数组
                                var _aSends = [];
                                //当子节点为空时不提交
                                if (nodeArr.length) {
                                    //将 zTree 使用的标准 JSON 嵌套格式的数据转换为简单 Array 格式。免去自行编写递归遍历全部节点的麻烦
                                    for (var i=0;i<nodeArr.length;i++){
                                        var oNode = {
                                            id : nodeArr[i].id,
                                            name: $.trim(nodeArr[i].name),
                                            parentId :nodeArr[i].pId == "familyRoot" ? 0 : nodeArr[i].pId
                                        }
                                        aSends.push(oNode);
                                        _aSends.push(oNode.name);
                                    }
                                    var hash = {};
                                    var isRepeat = '';
                                    for (var i in _aSends){
                                        if(hash[_aSends[i]]){
                                            isRepeat = _aSends[i];
                                            break;
                                        }
                                        hash[_aSends[i]] = true;
                                    }
                                    if (isRepeat){
                                        layer.msg('类型名‘' + isRepeat + "’重复了！", {offset: 0,shift: 6 });
                                        return false;
                                    }
                                    Ajax.ApiTools().updateActivityTypeTree({
                                        data:aSends
                                        ,success:function(data){
                                            if(data.result == "true"){
                                                //操作失败的招聘类型
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

                            }else{
                                var aNodes = t.treeObjNew.getNodes()[0].children; //排除名为“全部”的根节点
                                var nodeArr = t.treeObj.transformToArray(aNodes);
                                var aSends = [];   //存储所有节点数据的数组
                                var _aSends = [];
                                //当子节点为空时不提交
                                if (nodeArr.length) {
                                    //将 zTree 使用的标准 JSON 嵌套格式的数据转换为简单 Array 格式。免去自行编写递归遍历全部节点的麻烦
                                    for (var i=0;i<nodeArr.length;i++){
                                        var oNode = {
                                            id : nodeArr[i].id,
                                            name: $.trim(nodeArr[i].name),
                                            parentId :nodeArr[i].pId == "familyRoot" ? 0 : nodeArr[i].pId
                                        }
                                        aSends.push(oNode);
                                        _aSends.push(oNode.name);
                                    }
                                    var hash = {};
                                    var isRepeat = '';
                                    for (var i in _aSends){
                                        if(hash[_aSends[i]]){
                                            isRepeat = _aSends[i];
                                            break;
                                        }
                                        hash[_aSends[i]] = true;
                                    }
                                    if (isRepeat){
                                        layer.msg('项目名‘' + isRepeat + "’重复了！", {offset: 0,shift: 6 });
                                        return false;
                                    }
                                    Ajax.ApiTools().updateCostTypeTree({
                                        data:aSends
                                        ,success:function(data){
                                            if(data.result == "true"){
                                                //操作失败的招聘类型
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
            t.initBtnEvent();
            t.initTree();
        },
        /*
         *绑定导航点击事件
         * */
        initBtnEvent:function(){
            var t = this;
            $('#basicDataBtn').on('click','>li',function(){
                $(this).addClass('on').siblings().removeClass('on');
                if($(this).attr('data-job') == '_type'){
                    t.dataJob = '_type';
                    $('.base_import_infomation_show').text('注意：请不要超过两层分类，以方便于归类统计。') ;
                    t.initTree();
                }
                else{
                    t.dataJob = '_lv';
                    $('.base_import_infomation_show').text('注意：按照界面中从上至下，职等由高到低。');
                    t.initTreeNew();
                }
            });
        },
        /**
         * 初始化招聘类型树
         * */
        initTree:function(){
            var t = this;
            t.bRemoveFlag = false; //默认点击删除不执行删除节点，而是提示下，为true才删除
            t.setting = {
                view: {
                    //用于当鼠标移动到节点上时，显示用户自定义控件，显示隐藏状态同 zTree 内部的编辑、删除按钮
                    addHoverDom:function(treeId, treeNode){
                        var sObj = $("#" + treeNode.tId + "_span");
                        if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
                        var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
                            + "' title='添加类型' onfocus='this.blur();'></span>";
                        sObj.after(addStr);
                        var btn = $("#addBtn_"+treeNode.tId);
                        if (btn) btn.bind("click", function(){
                            var zTree = $.fn.zTree.getZTreeObj("base_job_family");
                            var arrNodes = zTree.transformToArray(zTree.getNodesByFilter(function(node){
                                return node.id != "familyRoot";
                            }));
                            //每次遍历树中的最大id，如果默认树中没有节点就从1开始
                            var iNum = 1;
                            if(arrNodes.length){
                                for(var i=0;i<arrNodes.length;i++){
                                    arrNodes[i].id = parseInt(arrNodes[i].id);
                                }
                                iNum = _.max(arrNodes,function(item){return item.id}).id;
                            }
                            zTree.addNodes(treeNode, {id:(iNum+1)+"", pId:treeNode.id, name:"新的类型名称"});
                            return false;
                        });
                    },
                    //必须与addHoverDom同时使用
                    removeHoverDom: function(treeId, treeNode){
                        $("#addBtn_"+treeNode.tId).unbind().remove();
                    },
                    selectedMulti: false,
                    showIcon:false
                },
                edit: {
                    enable: true,
                    editNameSelectAll: true,
                    drag:{
                        isCopy:true,
                        isMove:false,
                        prev:false,
                        inner:false,
                        next:false
                    },
                    showRemoveBtn:function(treeId, treeNode) {
                        return treeNode.id != "familyRoot";
                    },
                    showRenameBtn:function(treeId, treeNode){
                        return treeNode.id != "familyRoot";
                    },
                    removeTitle:"删除",
                    renameTitle:"编辑"
                },
                data: {

                },
                callback: {
                    beforeEditName: function(treeId, treeNode){
                        t.className = (t.className === "dark" ? "":"dark");
                        var zTree = $.fn.zTree.getZTreeObj("base_job_family");
                        zTree.selectNode(treeNode);
                    },
                    beforeRemove: function(treeId, treeNode){
                        t.className = (t.className === "dark" ? "":"dark");
                        var zTree = $.fn.zTree.getZTreeObj("base_job_family");
                        zTree.selectNode(treeNode);

                        if(!t.bRemoveFlag){
                            layer.confirm("确定要删除<span style='color: red;'>"+treeNode.name+"</span>这个类型吗？", {icon: 3, title:'提示'}, function(index){
                                t.bRemoveFlag = true;
                                $("#"+treeNode.tId+"_remove")[0].click();
                                layer.close(index);
                            });
                        }
                        return t.bRemoveFlag;
                    },
                    beforeRename:function(treeId, treeNode, newName, isCancel){
                        t.className = (t.className === "dark" ? "":"dark");
                        if (newName.length == 0) {
                            layer.msg("类型名称不能为空", {offset: 0,shift:6});
                            var zTree = $.fn.zTree.getZTreeObj("base_job_family");
                            setTimeout(function(){zTree.editName(treeNode)}, 10);
                            return false;
                        }
                        return true;
                    },
                    beforeDrag: function(){
                        return true;
                    },
                    beforeDrop: function(){
                        return true;
                    },
                    onRemove:function(event, treeId, treeNode){
                        t.bRemoveFlag = false; //恢复到默认状态
                    }
                }
            };

            Ajax.ApiTools().getKeyValueData({
                data:{
                    conditionBean: null
                    ,conditionFieldId: null
                    ,conditionId: null
                    ,corpId: null
                    ,infoSetId: "re_activity_type"
                    ,isDateFilter: false
                    ,keyId: "id"
                    ,orderBean: null
                    ,orderStr: null
                    ,parentId: "parent_id"
                    ,valueId: "name"
                },
                success:function(data){
                    if(data.beans && data.beans.length){
                        //如果只有一个空节点，表示后台没有节点，就去掉这个空节点
                        if(data.beans.length == 1 && !data.beans[0].id){
                            data.beans = [];
                        }
                        t.aZTreeData = [{name:"全部",id:"familyRoot",children:data.beans,open:true}];
                        $.fn.zTree.init($("#base_job_family"),t.setting , t.aZTreeData);
                        t.treeObj = $.fn.zTree.getZTreeObj("base_job_family");
                    }
                }
            });
        },
        /**
         * 初始化招聘等级树
         * */
        initTreeNew:function(){
            var t = this;
            t.bRemoveFlagNew = false; //默认点击删除不执行删除节点，而是提示下，为true才删除
            t.settingNew = {
                view: {
                    //用于当鼠标移动到节点上时，显示用户自定义控件，显示隐藏状态同 zTree 内部的编辑、删除按钮
                    addHoverDom:function(treeId, treeNode){
                        var sObj = $("#" + treeNode.tId + "_span");
                        if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
                        // if($(treeNode.editNameFlag || "#addBtn_"+treeNode.tId).length>0||treeNode.getParentNode()){
                        //     return;
                        // }
                        var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
                            + "' title='添加项目' onfocus='this.blur();'></span>";
                        sObj.after(addStr);
                        var btn = $("#addBtn_"+treeNode.tId);
                        if (btn) btn.bind("click", function(){
                            var zTree = $.fn.zTree.getZTreeObj("base_job_family");
                            var arrNodes = zTree.transformToArray(zTree.getNodesByFilter(function(node){
                                return node.id != "familyRoot";
                            }));
                            //每次遍历树中的最大id，如果默认树中没有节点就从1开始
                            var iNum = 1;
                            if(arrNodes.length){
                                for(var i=0;i<arrNodes.length;i++){
                                    arrNodes[i].id = parseInt(arrNodes[i].id);
                                }
                                iNum = _.max(arrNodes,function(item){return item.id}).id;
                            }

                            zTree.addNodes(treeNode, {id:(iNum+1), pId:treeNode.id, name:"新的项目名称"});
                            return false;
                        });
                    },
                    //必须与addHoverDom同时使用
                    removeHoverDom: function(treeId, treeNode){
                        $("#addBtn_"+treeNode.tId).unbind().remove();
                    },
                    selectedMulti: false,
                    showIcon:false
                },
                edit: {
                    enable: true,
                    editNameSelectAll: true,
                    drag:{
                        isCopy:true,
                        isMove:false,
                        prev:false,
                        inner:false,
                        next:false
                    },
                    showRemoveBtn:function(treeId, treeNode) {
                        return treeNode.id != "familyRoot";
                    },
                    showRenameBtn:function(treeId, treeNode){
                        return treeNode.id != "familyRoot";
                    },
                    removeTitle:"删除",
                    renameTitle:"编辑"
                },
                data: {

                },
                callback: {
                    beforeEditName: function(treeId, treeNode){
                        t.className = (t.className === "dark" ? "":"dark");
                        var zTree = $.fn.zTree.getZTreeObj("base_job_family");
                        zTree.selectNode(treeNode);
                    },
                    beforeRemove: function(treeId, treeNode){
                        t.className = (t.className === "dark" ? "":"dark");
                        var zTree = $.fn.zTree.getZTreeObj("base_job_family");
                        zTree.selectNode(treeNode);

                        if(!t.bRemoveFlagNew){
                            layer.confirm("确定要删除<span style='color: red;'>"+treeNode.name+"</span>这个项目吗？", {icon: 3, title:'提示'}, function(index){
                                t.bRemoveFlagNew = true;
                                $("#"+treeNode.tId+"_remove")[0].click();
                                layer.close(index);
                            });
                        }
                        return t.bRemoveFlagNew;
                    },
                    beforeRename:function(treeId, treeNode, newName, isCancel){
                        t.className = (t.className === "dark" ? "":"dark");
                        if (newName.length == 0) {
                            layer.msg("项目名称不能为空", {offset: 0,shift:6});
                            var zTree = $.fn.zTree.getZTreeObj("base_job_family");
                            setTimeout(function(){zTree.editName(treeNode)}, 10);
                            return false;
                        }
                        return true;
                    },
                    beforeDrag: function(){
                        return true;
                    },
                    beforeDrop: function(){
                        return true;
                    },
                    onRemove:function(event, treeId, treeNode){
                        t.bRemoveFlagNew = false; //恢复到默认状态
                    }
                }
            };

            Ajax.ApiTools().getKeyValueData({
                data:{
                    conditionBean: null
                    ,conditionFieldId: null
                    ,conditionId: null
                    ,corpId: null
                    ,infoSetId: "re_cost_type"
                    ,isDateFilter: false
                    ,keyId: "id"
                    ,orderBean: null
                    ,orderStr: null
                    ,parentId: "parent_id"
                    ,valueId: "name"
                },
                success:function(data){
                    if(data.beans && data.beans.length){
                        //如果只有一个空节点，表示后台没有节点，就去掉这个空节点
                        if(data.beans.length == 1 && !data.beans[0].id){
                            data.beans = [];
                        }
                        t.aZTreeDataNew = [{name:"全部",id:"familyRoot",children:data.beans,open:true}];
                        //t.aZTreeDataNew = data.beans;
                        $.fn.zTree.init($("#base_job_family"),t.settingNew , t.aZTreeDataNew);

                        t.treeObjNew = $.fn.zTree.getZTreeObj("base_job_family");
                    }
                }
            });
        },
        lastPrototype:undefined //////最后一个属性的分割线----------------------------------------------

    };
    module.exports = ExtBtnClass;
});

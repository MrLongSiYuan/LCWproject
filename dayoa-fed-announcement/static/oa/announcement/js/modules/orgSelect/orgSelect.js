/**
 * 审批人选择框
 * @options.data 已经选中的数据
 * @options.selectType String 添加模式  "add/edit"
 * @options.afterSelect  function 选择之后的回调
 */

define(function(require, exports, module) {
    require("js/modules/orgSelect/orgSelect.css");

    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");

    //tree组件
    require("commonStaticDirectory/plugins/zTree/zTreeStyle/zTreeStyle.css");
    require("commonStaticDirectory/plugins/zTree/jquery.ztree.all.min.js");

    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");

    var orgSelect = function () {
        this.init.apply(this,arguments);
    };
    $.extend(orgSelect.prototype,{
        options:{}
        ,init:function (options) {
            var t = this;
            $.extend(t.options,options);
            t.id = "orgSelect" + (new Date()).getTime();

            t.oIncludeChildConfig =  { "Y": "s", "N": "s" }; //包含树下级的配置
            t.oUnIncludeChildConfig =  { "Y": "", "N": "" }; //不包含树下级的配置
            t.initDialog();
        }
        ,initDialog:function () {
            var that = this;
            that.d = dialog({
                title:that.options.title || "选择组织"
                ,ok:function () {
                    var aResult = that.vueOrgSelect.aResult;
                    typeof that.options.callback == "function" && that.options.callback(tools.parseJson(aResult));
                }
                ,content:'<div class="common_orgSelect" id="'+that.id+'">' +
                '<div class="search"><input type="text" placeholder="输入组织名称"  name="keyword" v-model="keyword" v-on:keyup.13="submit"><input type="button" class="submit" v-on:click="submit" value="搜索"></div>' +
                '<div class="orglisthead">' +
                '   <h3>组织列表</h3> ' +
                '   <div class="beautifulCheckbox" style="margin-left: 15px;"><input type="checkbox" id="isIncludeChild" style="vertical-align: middle" v-model="isIncludeChild"><label for="isIncludeChild">包含下级</label></div>' +
                '   <span title="表示全部" class="removeAll" v-on:click="removeAll">清空选择</span>' +
                '</div>' +
                '<ul class="ztree orgList" id="ztree'+that.id+'"></ul>' +
                '<ul class="result">' +
                ' <li v-for="item in aResult" title="{{item.name}}">{{item.name}} <span class="close" v-on:click.prevent="removeResult(item.id)" title="移除">x</span></li>' +
                '</ul>' +
                '</div>'
            });
            that.d.showModal();
            that.vueOrgSelect = new Vue({
                el:"#" + that.id
                ,data:{
                    aResult:[]
                    ,keyword:""
                    ,isIncludeChild:true //是否包含下级
                }
                ,watch:{
                    "isIncludeChild":function (val,oldVal) {
                        var t = this;
                        var ztreeObj = $.fn.zTree.getZTreeObj("ztree"+that.id);
                        if(val){
                            ztreeObj.setting.check.chkboxType = that.oIncludeChildConfig;
                        }else{
                            ztreeObj.setting.check.chkboxType = that.oUnIncludeChildConfig;
                        }

                    }
                }
                ,attached:function () {
                    var t = this;
                    t.queryOrgList({
                        url:gMain.apiBasePath + "wfFormSet/getOrgTree.do"
                        ,data:""
                    });
                }
                ,methods:{
                    /**
                     * 加载组织列表
                     * @options.url 请求地址
                     * @options.data 请求的数据
                     * */
                    queryOrgList:function (opts) {
                        opts = opts || {};
                        var t = this;
                        Ajax.ajax({
                            url:opts.url
                            ,data:opts.data
                            ,success:function(data){
                                if(data.result == "true"){
                                    var aNode = data.val || [];//节点数据

                                    if(opts.url == gMain.apiBasePath + "wfFormSet/getOrgTree.do"){
                                        //关闭一级组织的自动展开
                                        for(var i=0;i<aNode.length;i++){
                                            aNode[i].open = false;
                                        }
                                    }else{
                                        aNode = _.map(aNode,function (item) {
                                            return {
                                                id:item.orgId
                                                ,name:item.orgName
                                            };
                                        });
                                    }

                                    //初始化树
                                    $.fn.zTree.init($(that.vueOrgSelect.$el).find("ul.orgList"), {
                                        view:{showIcon:false,showTitle:true,fontCss:function(treeId, treeNode){
                                            if(treeNode.chkDisabled){
                                                return {opacity:"0.6"};
                                            }
                                        }},
                                        check: {
                                            enable: true,
                                            chkStyle: "checkbox",
                                            chkboxType: t.isIncludeChild?that.oIncludeChildConfig:that.oUnIncludeChildConfig
                                        },
                                        data: {
                                            key: {
                                                title: "name"
                                            }
                                        }
                                        ,callback:{
                                            onCheck:function (event, treeId, treeNode) {
                                                t.aResult = [];//先清空
                                                var ztreeObj = $.fn.zTree.getZTreeObj("ztree"+that.id);
                                                var aNodes = ztreeObj.getCheckedNodes(true);
                                                //再更新所有选中的值
                                                $.each(aNodes,function (index,item) {
                                                    if(_.findIndex(t.aResult,{id:item.id}) == -1){
                                                        t.aResult.push({
                                                            id:item.id
                                                            ,name:item.name
                                                        });
                                                    }
                                                });
                                                t.aResult = tools.parseJson(t.aResult); //更新视图
                                            }
                                        }
                                    }, aNode);

                                    //设置树的初始选中状态
                                    var ztreeObj = $.fn.zTree.getZTreeObj("ztree"+that.id);
                                    var aNodes = ztreeObj.getNodes();
                                    t.setNodeSelected(aNodes);

                                }
                            }
                        });
                    }
                    /**
                     * 设置树的初始选中状态
                     * */
                    ,setNodeSelected:function (aNodes) {
                        var t = this;
                        var aSelected = that.options.data || [];
                        var ztreeObj = $.fn.zTree.getZTreeObj("ztree"+that.id);

                        //结果集框的显示
                        //勾选默认
                        for (var i=0; i < aNodes.length; i++) {
                            if(_.indexOf(aSelected, aNodes[i].id) != -1){
                                ztreeObj.checkNode(aNodes[i], true, false);
                                t.aResult.push({
                                    id:aNodes[i].id
                                    ,name:aNodes[i].name
                                });
                            }
                            if(aNodes[i].children && aNodes[i].children.length){
                                t.setNodeSelected(aNodes[i].children);
                            }
                        }
                        t.aResult = tools.parseJson(t.aResult);
                    }
                    //移除结果
                    ,removeResult:function (id) {
                        var t = this;
                        var ztreeObj = $.fn.zTree.getZTreeObj("ztree"+that.id);
                        var nodes = ztreeObj.getCheckedNodes();
                        for (var i=0, l=nodes.length; i < l; i++) {
                            if(nodes[i].id == id){
                                ztreeObj.checkNode(nodes[i], false, false);
                            }
                        }

                        t.aResult =_.filter(t.aResult,function (item) {
                            return item.id != id;
                        });
                    }
                    //移除所有结果
                    ,removeAll:function () {
                        var t =this;
                        //取消树的选中
                        var ztreeObj = $.fn.zTree.getZTreeObj("ztree"+that.id);
                        ztreeObj.checkAllNodes(false);
                        t.aResult = [];//清空结果集
                    }
                    //搜索
                    ,submit:function () {
                        var t = this;
                        if($.trim(t.keyword)){
                            //加载搜索的组织
                            t.queryOrgList({
                                url:gMain.apiBasePath + "wfOrgPos/getOrgByName.do"
                                ,data:JSON.stringify({orgName:$.trim(t.keyword)})
                            });
                        }else{
                            //加载全部组织树
                            t.queryOrgList({
                                url:gMain.apiBasePath + "wfFormSet/getOrgTree.do"
                                ,data:""
                            });
                        }
                    }
                }
            });
        }
    });
    module.exports = orgSelect;
});
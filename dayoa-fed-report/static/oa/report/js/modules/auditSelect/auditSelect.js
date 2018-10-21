/**
 * 人员职位选择控件
 * @options.addType String 添加模式  "single/multiple(单选/多选)"
 * @options.isSelectPos Boolean 是否选择职位
 * @options.isSelectPerson Boolean 是否选择人员
 * @options.afterSelect  function 选择之后的回调
 */

define(function(require, exports, module) {
    require("js/modules/auditSelect/auditSelect.css");
    var sTpl = require("js/modules/auditSelect/auditSelect.html");

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
    var utils = require("js/modules/utils.js"); //取色对象

    var AuditSelect = function () {
        this.init.apply(this,arguments);
    };

    $.extend(AuditSelect.prototype,{
        constructor: AuditSelect
        , options: {
            isSelectPos:false //是否选择职位
            ,isSelectPerson:true //是否选择人员
            ,title:"审批人选择"
        }
        , init: function (options) {
            var t = this;
            t.options = $.extend({}, t.options, options);
            t.createDialog(); //弹窗
        }
        ,createDialog:function () {
            var t = this;
            var button;
            if(t.options.origin == "reportShare"){
                button = [
                    {
                        value: '确认转发',
                        callback: function () {
                            //保存数据
                            if(t.vueAuditSelect.aResult.length != 0 && t.vueAuditSelect.canShareflag){
                                t.vueAuditSelect.canShareflag = false;
                                t.vueAuditSelect.reportShareIM(t.vueAuditSelect.aResult);
                            }else{
                                return false;
                            }
                        },
                        autofocus: true
                    }
                ]
            }else{
                button = [
                    {
                        value: '确定',
                        callback: function () {
                            //保存数据
                            if(t.vueAuditSelect.aResult.length){
                                typeof t.options.afterSelect == "function" && t.options.afterSelect(JSON.parse(JSON.stringify(t.vueAuditSelect.aResult)));
                            }else{
                                return false;
                            }
                        },
                        autofocus: true
                    },
                    {
                        value: '取消',
                        callback: function () {
                        }
                    }
                ]
            }
            t.dialogAuditSelect = dialog({
                // title:t.options.title + "("+ (t.options.addType=="single"?"单选模式":"多选模式") +")"
                title:t.options.title
                ,button:button
                ,content:sTpl
            });
            t.dialogAuditSelect.showModal();
            t.initVue();
        }
        /**
         * 初始化VueJS部分
         * */
        ,initVue:function () {
            var that = this;
            that.vueAuditSelect = new Vue({
                el: '#dialogAuditSelect'
                ,data: {
                    gMain:gMain
                    ,aJobList:[]  //职位列表
                    ,aPersonList:[]  //人员列表
                    ,aResult:[] //选择的结果
                    ,isIncludeChild:false  //是否包含下级组织
                    ,selectType:"person"  //选择类型(pos/person)，默认：职位，可以切换到人员
                    ,keyword:""
                    ,isSelectPos:true //是否选择职位
                    ,isSelectPerson:true //是否选择人员
                    ,addType:null //选择人员的模式（多选/单选）
                    ,allBtnIsSelected:false   //选择所有按钮
                    ,canShareflag:true  //可以转发标志
                }
                ,watch:{

                }
                /**
                 * 组件编译完成要执行的
                 * */
                ,attached:function () {
                    var t = this;
                    if(that.options.addType){
                        t.addType = that.options.addType;
                    }
                    t.initOrgListTree();
                    //只选择人员的情况
                    if(that.options.isSelectPerson && !that.options.isSelectPos){
                        t.selectType = "person";
                    }
                    //如果传了职位和人员选择都不显示，那么就默认选择人员
                    if(!that.options.isSelectPerson && !that.options.isSelectPos){
                        that.options.isSelectPerson = true;
                    }
                    t.isSelectPos = that.options.isSelectPos;
                    t.isSelectPerson = that.options.isSelectPerson;
                }
                /**
                 * 方法
                 * */
                ,methods:{
                    /*
                    * 转发IM
                    * */
                    reportShareIM:function (selectResult) {
                        var postPersonList = [];
                        for(var i = 0;i<selectResult.length;i++){
                            if(postPersonList.indexOf(selectResult[i].audit_person_id) == -1){
                                postPersonList.push(selectResult[i].audit_person_id);
                            }
                        }
                        var t = this;
                        console.log(that)
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrReportReceiveData/transpondReport.do",
                            data:JSON.stringify({
                                personList:postPersonList,
                                reportId:that.options.reportId+"",
                                imTitle:that.options.imTitle,
                                imBody:that.options.imBody,
                            }),
                            beforeSend:function () {
                                $("body").loading({zIndex:999999999}); //开启提交遮罩
                            },
                            complete:function () {
                                t.canShareflag = true;
                                $("body").loading({state:false}); //关闭提交遮罩
                            },
                            success:function(data) {
                                if (data.result == "true"){
                                    tools.showMsg.ok("转发成功！");
                                }
                            }
                        });
                    }
                    /*
                    * 正则验证
                    * */
                    ,regExpName:function (userName) {
                        userName = userName.replace(/\s/g,"");
                        var chinesereg = /^[\u4E00-\u9FA5]+$/;
                        var englishreg = /[A-Za-z]/;
                        var showResult;
                        if (userName.length == 1) {//当用户昵称只有一位时，显示全部
                            showResult = userName.toLocaleUpperCase()
                        } else if (userName && chinesereg.test(userName)) {
                            showResult = userName.slice(-2)
                        } else if (userName && englishreg.test(userName)) {
                            showResult = userName.slice(0,1).toLocaleUpperCase()
                        } else {
                            showResult = userName.slice(0,2)
                        }
                        return showResult;
                    }
                    /**
                     * 选择类型
                     * */
                    ,selectAuditType:function (type) {
                        var t = this;
                        t.selectType = type;
                        t.aJobList = [];
                        t.aPersonList = [];
                        $.fn.zTree.getZTreeObj("orgListTree").refresh();
                    }
                    /**
                     * 组织树
                     * */
                    ,initOrgListTree:function () {
                        var t = this;
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrOrgPerson/getOrgTree.do"
                            ,success:function(data){
                                if(data.result == "true"){
                                    var aNode = data.data.list || []; //节点数据

                                    //关闭一级组织的自动展开
                                    for(var i=0;i<aNode.length;i++){
                                        aNode[i].open = false;
                                    }
                                    //初始化树
                                    $.fn.zTree.init($("#orgListTree"), {
                                        view:{showIcon:false,showTitle:true,fontCss:function(treeId, treeNode){
                                            if(treeNode.chkDisabled){
                                                return {opacity:"0.6"};
                                            }
                                        }},
                                        data: {
                                            key: {
                                                title: "name"
                                            }
                                        }
                                        ,callback:{
                                            onClick:function (event, treeId, treeNode) {
                                                t.initJobListSelect(event, treeId, treeNode);
                                                t.aJobList = []; //重新选择组织清空结果
                                                t.aPersonList = []; //清空结果
                                                t.allBtnIsSelected = false;
                                            }
                                        }
                                    }, aNode);
                                }
                            }
                        });
                    }
                    /**
                     * 根据orgId获取职位/人员列表
                     * */
                    ,initJobListSelect:function (event, treeId, treeNode) {
                        var t = this;
                        Ajax.ajax({
                            url:gMain.apiBasePath + (t.selectType=="pos"?"wrOrgPerson/getPersonListByOrgId.do":"wrOrgPerson/getPersonListByOrgId.do")
                            ,data:JSON.stringify({
                                orgId:treeNode.id
                                ,isInclude:t.isIncludeChild  //是否包含下级
                            })
                            ,beforeSend:function () {
                                if(t.selectType == "pos"){
                                    $("#jobListSelect").loading();
                                }else{
                                    $("#personListSelect").loading();
                                }
                            }
                            ,complete:function () {
                                if(t.selectType == "pos"){
                                    $("#jobListSelect").loading({state:false});
                                }else{
                                    $("#personListSelect").loading({state:false});
                                }
                            }
                            ,success:function (data) {
                                if(data.result == "true"){
                                    var arr =data.data.list || [];

                                    if(t.selectType == "pos"){
                                        //给所有列出的人员添加_posId属性
                                        for(var i=0;i<arr.length;i++){
                                            arr[i].dataType = "pos";  //数据类型是“职位”
                                        }
                                        t.aJobList = arr;
                                        t.aPersonList = [];
                                    }else if(t.selectType == "person"){
                                        //给所有列出的人员添加_posId属性
                                        for(var i=0;i<arr.length;i++){
                                            arr[i].dataType = "person";  //数据类型是“人员”
                                        }
                                        t.aPersonList = arr;
                                        t.aJobList = [];
                                    }
                                }
                            }
                        });
                    }
                    /**
                     * 选择职位,并查询人员
                     * */
                    ,selectJob:function ($event,item) {
                        var t = this;
                        var o = JSON.parse(JSON.stringify(item));
                        for(var i=0;i<t.aJobList.length;i++){
                            t.aJobList[i].isSelected = false;
                            if(t.aJobList[i].posId == o.posId){
                                t.aJobList[i].isSelected = true;
                            }
                        }
                        t.aJobList = tools.parseJson(t.aJobList);
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wrOrgPerson/getPersonListByOrgId.do"
                            ,data:JSON.stringify({
                                posId:String(o.posId)
                            })
                            ,beforeSend:function () {
                                $("#personListSelect").loading();
                            }
                            ,complete:function () {
                                $("#personListSelect").loading({state:false});
                            }
                            ,success:function (data) {
                                if(data.result == "true"){
                                    var arr = data.data.list || [];
                                    //给所有列出的人员添加_posId属性
                                    for(var i=0;i<arr.length;i++){
                                        arr[i]._posId = String(o.posId);
                                        arr[i].dataType = "person"; //数据类型是“人员”
                                    }
                                    t.aPersonList = arr;
                                }
                            }
                        });
                    }
                    /**
                     * 选择人员结果,单选框
                     * */
                    ,selectRadioResult:function ($event,item,type) {
                        var t = this;
                        for(var i=0;i<t.aPersonList.length;i++){
                            t.aPersonList[i].isSelected = false;
                            if(t.aPersonList[i].personId == item.personId){
                                t.aPersonList[i].isSelected = true;
                            }
                        }
                        t.aPersonList = tools.parseJson(t.aPersonList);
                        t.addToResult();
                    }
                    /**
                     * 选择人员结果，复选框
                     * */
                    ,selectCheckBoxResult:function ($event,item,type) {
                        var t = this;
                        if(item.isSelected){
                            item.isSelected = false;
                            t.aPersonList = tools.parseJson(t.aPersonList);
                            t.checkDelToResult(item.personId);
                        }else{
                            item.isSelected = true;
                            t.aPersonList = tools.parseJson(t.aPersonList);
                            t.checkAddToResult(item.personId);
                        }
                    }
                    /*
                    * 复选框全选
                    * */
                    ,selectAllResult:function () {
                        var t = this;
                        if(t.allBtnIsSelected){
                            t.allBtnIsSelected = false;
                            for(var i=0;i<t.aPersonList.length;i++){
                                t.aPersonList[i].isSelected = false;
                                t.checkDelToResult(t.aPersonList[i].personId);
                            }
                            t.aPersonList = tools.parseJson(t.aPersonList);
                        }else{
                            t.allBtnIsSelected = true;
                            for(var i=0;i<t.aPersonList.length;i++){
                                t.aPersonList[i].isSelected = true;
                                t.checkAddToResult(t.aPersonList[i].personId);
                            }
                            t.aPersonList = tools.parseJson(t.aPersonList);
                        }
                    }
                    /**
                     *复选框操作添加到结果集
                     * */
                    ,checkAddToResult:function(personId){
                        var t = this;
                        var oResult = {
                            audit_person_id:"",
                            audit_person_name:"",
                            audit_pos_id:"",
                            audit_pos_name:"",
                            _posId:"",
                            dataType:""
                        };
                        var indexPerson = _.findIndex(t.aPersonList,{personId:personId}); //找到选中的人
                        if(indexPerson != -1){
                            oResult.showId = oResult.audit_person_id = t.aPersonList[indexPerson].personId;
                            oResult.showName = oResult.audit_person_name = t.aPersonList[indexPerson].personName;
                            oResult.dataType = "person";
                        }else{
                            return false;
                        }
                        if(_.findLastIndex(t.aResult,{audit_person_id:personId}) == -1){
                            t.aResult.push(oResult);
                        }
                        t.aResult = JSON.parse(JSON.stringify(t.aResult));  //更新视图数据
                    }
                    /**
                     *复选框操作从结果集移除
                     * */
                    ,checkDelToResult:function(personId){
                        var t = this;
                        var indexPerson = _.findLastIndex(t.aResult,{audit_person_id:personId}); //找到选中的人
                        if(indexPerson != -1){
                            t.aResult.splice(indexPerson,1);
                        }else{
                            return false;
                        }
                        t.aResult = JSON.parse(JSON.stringify(t.aResult));  //更新视图数据
                    }
                    /**
                     * 添加到结果集
                     * */
                    ,addToResult:function () {
                        var t = this;
                        var oResult = {
                            audit_person_id:"",
                            audit_person_name:"",
                            audit_pos_id:"",
                            audit_pos_name:"",
                            _posId:"",
                            dataType:""
                        };

                        //如果是选择职位模式
                        if(t.selectType == "pos"){
                            //有选中的职位和人员
                            var indexJob = _.findIndex(t.aJobList,{isSelected:true}); //找到选中的职位
                            var indexPerson = _.findIndex(t.aPersonList,{isSelected:true});  //找到选中的人
                            if(indexJob != -1 && indexPerson != -1 ){
                                oResult.showId = oResult.audit_pos_id = t.aJobList[indexJob].posId;
                                oResult.showName = oResult.audit_pos_name = t.aJobList[indexJob].posName;
                                oResult.audit_person_id = t.aPersonList[indexPerson].personId;
                                oResult.audit_person_name = t.aPersonList[indexPerson].personName;
                                oResult.dataType = "pos";
                            }else{
                                return false;
                            }

                            /*if(_.findIndex(t.aResult,{audit_pos_id:oResult.audit_pos_id}) != -1){
                                tools.showMsg.error("不能重复添加审批职位节点");
                                return false;
                            }*/
                        }else{
                            var indexPerson = _.findIndex(t.aPersonList,{isSelected:true}); //找到选中的人
                            if(indexPerson != -1){
                                oResult.showId = oResult.audit_person_id = t.aPersonList[indexPerson].personId;
                                oResult.showName = oResult.audit_person_name = t.aPersonList[indexPerson].personName;
                                oResult.dataType = "person";
                            }else{
                                return false;
                            }

                            /*if(_.findIndex(t.aResult,{audit_person_id:oResult.audit_person_id}) != -1){
                                tools.showMsg.error("不能重复添加审批人节点");
                                return false;
                            }*/
                        }

                        //如果是多选模式，否则是单选模式
                        if(that.options.addType == "multiple"){
                            t.aResult.push(oResult);
                        }else{
                            t.aResult = [oResult];
                        }
                        t.aResult = JSON.parse(JSON.stringify(t.aResult));  //更新视图数据
                    }
                    /**
                     * 移除结果
                     * */
                    ,removeResult:function ($index) {
                        var t = this;
                        t.aResult.splice($index,1);
                    }
                    ,searchResult:function ($event,type) {
                        var t = this;
                        if(type == "keyup"){
                            if($event.keyCode != "13"){
                                return false;
                            }
                        }

                        if(!t.keyword){
                            return false;
                        }

                        var oSend = {};
                        if(t.selectType=="pos"){
                            oSend = {posName:t.keyword}
                        }else{
                            oSend = {keyword:t.keyword}
                        }
                        Ajax.ajax({
                            url:gMain.apiBasePath + (t.selectType=="pos"?"wfOrgPos/getPosLikePosName.do":"wrOrgPerson/getPersonListByKeyword.do")
                            ,data:JSON.stringify(oSend)
                            ,beforeSend:function () {
                                if(t.selectType == "pos"){
                                    $("#jobListSelect").loading();
                                }else{
                                    $("#personListSelect").loading();
                                }
                            }
                            ,complete:function () {
                                if(t.selectType == "pos"){
                                    $("#jobListSelect").loading({state:false});
                                }else{
                                    $("#personListSelect").loading({state:false});
                                }
                            }
                            ,success:function (data) {
                                if(data.result == "true"){
                                    var arr =data.data.list || [];
                                    if(t.selectType == "pos"){
                                        //给所有列出的人员添加_posId属性
                                        for(var i=0;i<arr.length;i++){
                                            arr[i].dataType = "pos";  //数据类型是“职位”
                                        }
                                        t.aJobList = arr;
                                        t.aPersonList = [];
                                    }else if(t.selectType == "person"){
                                        //给所有列出的人员添加_posId属性
                                        for(var i=0;i<arr.length;i++){
                                            arr[i].dataType = "person";  //数据类型是“人员”
                                        }
                                        t.aPersonList = arr;
                                        t.aJobList = [];
                                    }
                                }
                            }
                        });
                    }
                    /**
                     * 获取随机颜色
                     * */
                    ,getRandomColor:function (num) {
                        num = parseInt(num) || 0;
                        num = num%6; //取余数
                        return utils.getRandomColor(num); //获取第几个颜色
                    }

                }
                /**
                 * 自定义指令
                 * */
                ,directives:{

                }
            });
        }
    });

    module.exports = AuditSelect;

});
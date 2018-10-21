<template>
    <div id="dialogAuditSelect" class="clearfix">
        <div class="pos-person-tab clearfix">
            <ul>
                <li v-bind:class="{'selected':selectType == 'person'?true:false}" v-on:click.prevent="selectAuditType('person')" v-show="isSelectPerson">选择人员</li>
                <li v-bind:class="{'selected':selectType == 'pos'?true:false}" v-on:click.prevent="selectAuditType('pos')" v-show="isSelectPos">选择职位</li>
            </ul>
        </div>

        <div class="search">
            <input type="text" name="keyword" v-model="keyword" v-on:keyup="searchResult($event,'keyup')" placeholder="人员姓名、拼音简写">
            <span class="icon" v-on:click.prevent="searchResult($event,'click')">搜索</span>
        </div>

        <div class="clearfix" style="height: 369px;">
            <dl class="orgList">
                <dt>
                    <span>组织列表</span>
                <div class="beautifulCheckbox" style="margin-left: 15px;">
                    <input type="checkbox" id="isIncludeChild" style="vertical-align: middle" v-model="isIncludeChild"><label for="isIncludeChild">包含下级</label>
                </div>
                </dt>
                <dd>
                    <ul id="orgListTree" class="ztree">
                        数据加载中...
                    </ul>
                </dd>
            </dl>

            <!--职位选择列表-->
            <dl class="jobList" v-show="selectType == 'pos' && isSelectPos">
                <dt>
                    <span>包含职位</span>
                    <span class="des" style="color: red;display: none;">职位下有多人的，请选择具体人员</span>
                </dt>
                <dd>
                    <ul id="jobListSelect">
                        <li v-for="(item,index) in aJobList" v-on:click.prevent="selectJob($event,item)">
                            <div class="beautifulRadio">
                                <input type="radio" :id="'poslist-radio-'+index" name="posId" :value="item.posId" v-bind:checked="item.isSelected" style="vertical-align: middle"><label :for="'poslist-radio-'+index" :title="item.posName">{{item.posName}}</label>
                            </div>
                        </li>
                    </ul>
                </dd>
            </dl>

            <!--人员选择列表-->
            <dl class="personList" v-bind:style="{left:selectType == 'person'?'302px':'526px'}">
                <dt>
                    <span>包含人员({{aPersonList.length}}人)</span>
                </dt>
                <dd>
                    <ul id="personListSelect" v-if="addType != 'multiple'">
                        <li v-for="(item,index) in aPersonList" v-on:click.prevent="selectRadioResult($event,item)">
                            <div class="beautifulRadio">
                                <input type="radio" :id="'personlist-radio-'+index" name="personId" :value="item.personId" v-bind:checked="item.isSelected" style="vertical-align: middle"><label :for="'personlist-radio-'+index" :title="item.personName">{{item.personName}}</label>
                            </div>
                        </li>
                    </ul>
                    <ul id="personListSelect" v-if="addType == 'multiple'">
                        <li v-on:click.prevent="selectAllResult()">
                            <div class="beautifulCheckbox" v-if="aPersonList.length != 0">
                                <input type="checkbox" id="select_all_person" v-bind:checked="allBtnIsSelected" style="vertical-align: middle"><label for="select_all_person" title="全选">全选</label>
                            </div>
                        </li>
                        <li v-for="(item,index) in aPersonList" v-on:click.prevent="selectCheckBoxResult($event,item)">
                            <div class="beautifulCheckbox">
                                <input type="checkbox" :id="'personlist-radio-'+index" name="personId" :value="item.personId" v-bind:checked="item.isSelected" style="vertical-align: middle"><label :for="'personlist-radio-'+index" :title="item.personName">{{item.personName}}</label>
                            </div>
                        </li>
                    </ul>
                </dd>
            </dl>
        </div>

        <div class="clearfix">
            <ul class="selectResult clearfix">
                <li v-for="(item,index) in aResult">
                    <img v-if="item.headImg" :src="gMain.DayHRDomains.baseStaticDomain+item.headImg" :alt="item.showName" class="personImg" :title="item.dataType=='pos'?'包含人员：'+item.audit_person_name:''" style="width: 56px;height: 56px">
                    <!--<span class="person_img_span" v-if="!item.headImg && regExpName(item.audit_person_name)" :style="{'background-color':getRandomColor(item.audit_person_id),'font-size':'16px'}">{{item.audit_person_name.substr(0,1).toUpperCase()}}</span>-->
                    <span class="person_img_span" :style="{'background-color':getRandomColor(item.audit_person_id)}">{{regExpName(item.audit_person_name)}}</span>
                    <span class="personName" :title="item.showName">{{item.showName}}</span>
                    <span class="close" v-on:click.prevent="removeResult(index)" title="移除"></span>
                </li>
            </ul>
        </div>
        <div class="button_box">
            <Button type="primary" @click="reportShareIM">确认转发</Button>
        </div>
    </div>
</template>
<script type="text/javascript">

    export default{
        props:["singleReportData"],
        data: function () {
            return {
                gMain:gMain
                ,aJobList:[]  //职位列表
                ,aPersonList:[]  //人员列表
                ,aResult:[] //选择的结果
                ,isIncludeChild:false  //是否包含下级组织
                ,selectType:"person"  //选择类型(pos/person)，默认：职位，可以切换到人员
                ,keyword:""
                ,isSelectPos:false //是否选择职位
                ,isSelectPerson:true //是否选择人员
                ,addType:"multiple" //选择人员的模式（多选/单选）
                ,allBtnIsSelected:false   //选择所有按钮
                ,canShareflag:true  //可以转发标志
                ,reportId:null
                ,tempName:""
                ,nodeData:[]
            }
        },
        watch:{
            "singleReportData":function () {
                var t = this;
                t.tempName = t.$parent.$parent.singleReportData.wrData.tempName;
                t.nodeData = JSON.parse(t.$parent.$parent.singleReportData.wrData.nodeData).slice(0);
            }
        },
        created: function () {
            var t = this;
            seajs.use(["commonStaticDirectory/plugins/zTree/zTreeStyle/zTreeStyle.css","commonStaticDirectory/plugins/zTree/jquery.ztree.all.min.js"],function(){
                t.initOrgListTree();
            })
            seajs.use(["commonStaticDirectory/plugins/tools.js","commonStaticDirectory/plugins/underscore.min.js"],function(tools){
                t.tools = tools;
            })
            t.reportId = t.$parent.$parent.reportId;
            t.$Message.config({
                top: 50,
                duration: 2
            })
        },
        methods:{
            /*
             * 转发IM
             * */
            reportShareIM:function () {
                var t = this;
                var imBody = "";
                if(t.aResult.length != 0 && t.canShareflag){
                    t.canShareflag = false;
                }else{
                    t.$Message.destroy()
                    t.$Message.warning('请选择转发对象！');
                    return false;
                }
                var postPersonList = [];
                for(var i = 0;i<t.aResult.length;i++){
                    if(postPersonList.indexOf(t.aResult[i].audit_person_id) == -1){
                        postPersonList.push(t.aResult[i].audit_person_id);
                    }
                }
                var imbodyFun = function (obj) {
                    if(obj.label){
                        imBody = imBody+obj.label+"<br/>";
                    }
                    if(obj.field_type == "pic"){

                    }else if(obj.field_type == "file"){  //文件另做处理
                        if(obj.value){
                            $.each(obj.value,function (num,val) {
                                imBody = imBody+val.fileName+"<br/>";
                            })
                        }
                    }else if(obj.field_type != "default_field"){
                        if(obj.value){
                            imBody = imBody+obj.value+"<br/>";
                        }
                    }
                }
                if(t.nodeData.length>3){
                    for(var i = 0;i<3;i++){
                        if(t.nodeData[i].field_type == "twoColumns" || t.nodeData[i].field_type == "threeColumns"){
                            $.each(t.nodeData[i].firstCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            $.each(t.nodeData[i].secondCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            if(t.nodeData[i].thirdCol){
                                $.each(t.nodeData[i].thirdCol.fields,function (num,val){
                                    imbodyFun(val);
                                })
                            }
                        }else{
                            imbodyFun(t.nodeData[i]);
                        }
                    }
                }else {
                    for(var i = 0;i<t.nodeData.length;i++){
                        if(t.nodeData[i].field_type == "twoColumns" || t.nodeData[i].field_type == "threeColumns"){
                            $.each(t.nodeData[i].firstCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            $.each(t.nodeData[i].secondCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            if(t.nodeData[i].thirdCol){
                                $.each(t.nodeData[i].thirdCol.fields,function (num,val){
                                    imbodyFun(val);
                                })
                            }
                        }else{
                            imbodyFun(t.nodeData[i]);
                        }
                    }
                }
                t.$daydao.$ajax({
                    url:gMain.apiBasePath + "wrReportReceiveData/transpondReport.do",
                    data:JSON.stringify({
                        personList:postPersonList,
                        reportId:t.reportId+"",
                        imTitle:t.tempName,
                        imBody:imBody,
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
                            t.$parent.$parent.showChoosePersonnel = false;
                            t.aResult = [];
                            t.$Message.success('转发成功');
                        }
                    }
                });
            }
            /*
             * 正则验证
             * */
            ,regExpName:function (userName) {
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
                t.$daydao.$ajax({
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
                t.$daydao.$ajax({
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
                    t.aJobList = t.tools.parseJson(t.aJobList);
                    t.$daydao.$ajax({
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
                    t.aPersonList = t.tools.parseJson(t.aPersonList);
                    t.addToResult();
                }
                /**
                 * 选择人员结果，复选框
                 * */
            ,selectCheckBoxResult:function ($event,item,type) {
                    var t = this;
                    if(item.isSelected){
                        item.isSelected = false;
                        t.aPersonList = t.tools.parseJson(t.aPersonList);
                        t.checkDelToResult(item.personId);
                    }else{
                        item.isSelected = true;
                        t.aPersonList = t.tools.parseJson(t.aPersonList);
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
                        t.aPersonList = t.tools.parseJson(t.aPersonList);
                    }else{
                        t.allBtnIsSelected = true;
                        for(var i=0;i<t.aPersonList.length;i++){
                            t.aPersonList[i].isSelected = true;
                            t.checkAddToResult(t.aPersonList[i].personId);
                        }
                        t.aPersonList = t.tools.parseJson(t.aPersonList);
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
            ,removeResult:function (index) {
                    var t = this;
                    t.aResult.splice(index,1);
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
                t.$daydao.$ajax({
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
                var t = this;
                num = parseInt(num) || 0;
                num = num%6;
                var aRandomColors = ["#C589E2","#EA8484","#6EA7EA","#6FCD86","#EFA858","#6FCD86"];
                if(typeof num === "number"){
                    if(num > 5){
                        num = 0;
                    }
                    return aRandomColors[num];
                }else{
                    return aRandomColors[t.random(0,5)];
                }
            }
            /**
             * 取min与max之间的随机数
             * */
            ,random:function (min, max) {
                if (max == null) {
                    max = min;
                    min = 0;
                }
                return min + Math.floor(Math.random() * (max - min + 1));
            }

        }
    }
</script>
<style lang="scss" rel="stylesheet/scss">
    /*多选框组件*/
    .beautifulCheckbox{
        display: inline;
    }
    .beautifulCheckbox label{
        display: inline;
        position: relative;
        padding-left: 22px;
        height: 20px;
        line-height: 20px;
        cursor: pointer;
        font-weight: normal;
        white-space: nowrap;
    }
    .beautifulCheckbox label:before{
        content:" ";
        width:14px;
        height:14px;
        position:absolute;
        top: 0px;
        left: 0px;
        background: url(../assets/images/bgs.png) -20px -20px;
    }
    .beautifulCheckbox input[type='checkbox']{
        display: none;
    }
    .beautifulCheckbox input[type='checkbox']:checked + label:before{
        background: url(../assets/images/bgs.png) -20px -3px;
    }

    /*单选框组件*/
    .beautifulRadio{
        display: inline;
    }
    .beautifulRadio label{
        display: inline;
        position: relative;
        padding-left: 22px;
        height: 20px;
        line-height: 20px;
        cursor: pointer;
        font-weight: normal;
        white-space: nowrap;
    }
    .beautifulRadio label:before{
        content:" ";
        width:14px;
        height:14px;
        position:absolute;
        top: 3px;
        left: 0px;
        background: url(../assets/images/bgs.png) -3px -19px;
    }
    .beautifulRadio input[type='radio']{
        display: none;
    }
    .beautifulRadio input[type='radio']:checked + label:before{
        background: url(../assets/images/bgs.png) -3px -3px;
    }
    #dialogAuditSelect *{
        box-sizing: content-box;
    }
    #dialogAuditSelect .clearfix{
        width: 628px;
        margin: 0 auto;
        position: relative;
    }
    #dialogAuditSelect dt{
        font-weight:normal;
    }

    /*审批人选择器*/
    #dialogAuditSelect{
        width: 628px;
    }

    /*职位人员tab切换*/
    #dialogAuditSelect .pos-person-tab{
        height: 32px;
        background: #f4f4f4;
        line-height: 30px;
        margin-bottom: 20px;
    }
    #dialogAuditSelect .pos-person-tab ul{
    }
    #dialogAuditSelect .pos-person-tab li{
        float: left;
        width: 100px;
        text-align: center;
        box-sizing: border-box;
        cursor: pointer;
        margin: 0 10px;
    }
    #dialogAuditSelect .pos-person-tab li.selected{border-bottom: 2px solid #ed6c2b;cursor: default;}


    /*搜索*/
    #dialogAuditSelect .search{
        width: 628px;
        height: 32px;
        line-height: 32px;
        margin: 0 auto;
        border: 1px solid #bcbcbc;
        border-radius: 3px;
        box-sizing: border-box;
        padding: 0 10px;
        text-align: center;
        color: #ccc;
        position: relative;
    }
    #dialogAuditSelect .search input[name='keyword']{
        border: none;
        width: 618px;
        height: 30px;
        top: 0;
        left: 5px;
        position: absolute;
    }
    #dialogAuditSelect .search input[name='keyword']::-ms-input-placeholder{
        text-align: center;
    }
    #dialogAuditSelect .search input[name='keyword']::-webkit-input-placeholder{
        text-align: center;
    }
    #dialogAuditSelect .search .icon{
        width: 21px;
        height: 21px;
        position: absolute;
        display: block;
        right: 5px;
        top: 4px;
        text-indent: -99em;
        overflow: hidden;
        background: url(../assets/images/bgs.png) -1px -99px;
        cursor: pointer;
    }


    /*
    组织列表*/
    #dialogAuditSelect .orgList{
        position: absolute;
        width: 240px;
        top: 20px;
    }
    #dialogAuditSelect .orgList:after{
        content:" ";
        position:absolute;
        top: 48%;
        width:34px;
        height:31px;
        background:url(../assets/images/bgs.png) -3px -128px;
        left: 255px;
    }
    #dialogAuditSelect .orgList dl{}
    #dialogAuditSelect .orgList dt{
        line-height: 32px;
        height: 32px;
    }
    #dialogAuditSelect .orgList dd{
    }
    #orgListTree {
        border: 1px solid #bcbcbc;
        height: 285px;
        overflow: auto;
        padding: 10px;
        box-sizing: border-box;
    }

    /*包含职位*/
    #dialogAuditSelect .jobList{
        position: absolute;
        width: 170px;
        top: 20px;
        left: 300px;
    }
    #dialogAuditSelect .jobList:after{
        content:" ";
        position:absolute;
        top: 48%;
        width:34px;
        height:31px;
        background:url(../assets/images/bgs.png) -3px -128px;
        left: 177px;
    }
    #dialogAuditSelect .jobList dl{}
    #dialogAuditSelect .jobList dt{
        line-height: 32px;
        height: 32px;
    }
    #dialogAuditSelect .jobList dd{}
    #jobListSelect {
        border: 1px solid #bcbcbc;
        box-sizing: border-box;
        height: 285px;
        overflow: auto;
        padding: 5px 0px;
    }
    #jobListSelect li{
        padding: 0 10px;
        height: 22px;
        line-height: 22px;
    }

    /*包含人员*/
    #dialogAuditSelect .personList{
        position: absolute;
        width: 170px;
        top: 20px;
        left: 504px;
    }
    #dialogAuditSelect .personList dl{}
    #dialogAuditSelect .personList dt{
        line-height: 32px;
        height: 32px;
    }
    #dialogAuditSelect .personList dd{

    }
    #personListSelect {
        border: 1px solid #bcbcbc;
        box-sizing: border-box;
        height: 285px;
        overflow: auto;
        padding: 5px 0px;
    }
    #personListSelect li{
        padding:0 10px;
        height: 22px;
        line-height: 22px;
    }

    /*
    选择结果*/
    #dialogAuditSelect .selectResult{
        min-height: 89px;
        border: 2px dashed #ccc;
        padding: 10px;
        width: 604px;
        max-height: 167px;
        overflow-y: auto;
    }
    #dialogAuditSelect .selectResult li{
        display: inline-block;
        width: 56px;
        text-align: center;
        position: relative;
        padding-left: 21px;
    }
    #dialogAuditSelect .selectResult li .personImg{
        vertical-align: bottom;
    }
    #dialogAuditSelect .selectResult li .person_img_span{
        display: block;
        width: 56px;
        height: 56px;
        border-radius: 100%;
        text-align: center;
        line-height: 56px;
        color: #fff;
        font-size: 14px;
    }
    #dialogAuditSelect .selectResult li .personName{
        line-height: 28px;
        display: block;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
    }
    #dialogAuditSelect .selectResult li .close{
        width:24px;
        height:24px;
        background: url(../assets/images/bgs.png) -20px -37px;
        position: absolute;
        right: -5px;
        top: -5px;
        display: none;
        cursor: pointer;
    }
    #dialogAuditSelect .selectResult li:hover .close{
        display: block;
    }

    #dialogAuditSelect .selectResult li:after{
        content:"    ";
        position:absolute;
        font-size: 24px;
        color: #ccc;
        width: 50px;
        text-align: center;
        line-height: 24px;
        top: 17px;
        left: -14px;
    }
    #dialogAuditSelect .selectResult li:first-child{
        padding-left: 0;
    }
    #dialogAuditSelect .selectResult li:nth-child(8n+1){
        padding-left: 0;
    }
    #dialogAuditSelect .selectResult li:first-child:after{
        display: none;
    }

    /*
    添加到审批待选列表中*/
    #dialogAuditSelect .addAudit{
        position: absolute;
        top: 46%;
        left: 677px;
        font-size: 31px;
        color: #ea5f21;
        cursor: pointer;
    }
    .button_box{
        margin-top: 16px;
        overflow: hidden;
        button{
            float: right;
        }
    }
</style>

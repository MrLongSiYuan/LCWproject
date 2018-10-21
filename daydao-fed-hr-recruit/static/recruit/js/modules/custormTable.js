/**
 * Created by tangguoping on 2016/11/28.
 */
define(function (require,exports,module) {
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools");
    //表格控件
    require("commonStaticDirectory/plugins/jqGrid/mmButton"); //表格按钮

    require("commonStaticDirectory/plugins/jqGrid/css/ui.jqgrid.css"); //表格核心组件样式
    require("commonStaticDirectory/plugins/jqGrid/jquery.jqGrid.src.js"); //表格核心组件
    require("commonStaticDirectory/plugins/jqGrid/grid.locale-cn.js"); //表格语言包
    require("commonStaticDirectory/plugins/jqGrid/jquery.jqGrid.backboard.js"); //隐藏列插件
    var ClassName = function () {
        this.init.apply(this,arguments);
    }
    ClassName.prototype = {
        constructor:ClassName
        ,options:{
            infoSetId:'recruit_level_detail_list'
        }
        ,init:function (options) {
            this.options = $.extend({},this.options,options);
            var t = this;
            var _html = '' +
                '<div id="'+t.options.infoSetId +'_wrap" class="myjqgrid_wrap" style="width:100%;height: auto;">' +
                '   <div id="'+t.options.infoSetId +'_pager"></div>' +
                '   <table id="'+t.options.infoSetId +'_list"></table>' +
                '</div>';
            $('#'+t.options.infoSetId).html(_html);
            t.recruitSetTable();
        }
        /**
         * 加载表格数据
         * */
        ,recruitSetTable:function(){
            var t = this;
            var aColNames = ["操作"]; //表头名称数组
            var aColModels =[{name:'editBtn',width:50,fixed:true,align:'center',sortable:false,formatter:function(cellvalue, options, rowObject){
                var temp = '<a href="javascript:void(0)" title="修改" data-index = "'+ options.rowId +'" class="recruitTdEdit iconfont">&#xe6bd;</a>'
                +'<a class="recruitTdDel iconfont_dayhr_base" title="删除" data-index = "'+ options.rowId +'" href="javascript:void(0);">&#xe613;</a>';
                return temp;
            }}]; //表头数据数组
            var oColumnEdit = t.options.oTableColumn.columnEdit;
            //var sTableId = 'base_pop_store_capture_org';
            //计算宽度，如果每列的传值宽度总和大于浏览器的宽度则使用固定宽度，否则使用自适应宽度
            var isFixation = false; //是否使用固定宽度
            if(t.options.infoSetId=="recruit_activity_postab"&&t.options.oItem.status&&t.options.oItem.status=="已开始"){ //已发布的活动不允许再对数据进行操作
                aColNames=[];
                aColModels=[];
                $("#table_edit_dialog").find(".add").remove();
            }
            if(oColumnEdit.length){
                for(var i=0;i<oColumnEdit.length;i++){
                    var item = oColumnEdit[i];
                    var colObj = {
                        name:item.name //字段名
                        ,index:item.name //排序索引
                        ,align:item.alignX //显示位置
                        ,width:item.width //宽度
                        ,isListShow:item.isListShow || !!item.frozen //是否列表显示，如果是冻结的列就必显示
                        ,sortable:!!item.isSortable //是否可排序
                    };
                    //只有isHidden为false的时候才在表头中显示
                    if(!item.isHidden){
                        aColNames.push(item.title);
                        aColModels.push(colObj);
                    }
                }
            }
            var isFixation = false; //是否使用固定宽度
            if(aColModels.length){
                var iWidth = 0;
                for(var i=0;i<aColModels.length;i++){
                    iWidth += (aColModels[i].width?aColModels[i].width:0);
                }
                if(iWidth > $("#"+t.options.infoSetId +"_wrap").width()){
                    isFixation = true;
                }
            }

            if(aColModels.length == 1){ //只有一条没用的索引列
                aColModels.push({name:"none_table_head_data",isListShow:true,sortable:false});
                aColNames.push("暂无表头数据");
            }
            //如果只有一个表格控件的时候直接把表格高度增高到底部
            var _iTableHeiht = "205px";
            if(t.options.dataIndex == 1){
                _iTableHeiht = "150px";
            }
            t.sTableId = t.options.infoSetId+"_list";
            var lastsel2;
            t.myJqGrid = $("#" + t.sTableId).jqGrid({
                url: gMain.apiBasePath+"route/"+ t.options.infoSetId+"/getAll.do"
                , datatype: "json"
                , colNames:aColNames
                , colModel:aColModels
                // , width:722
                , autowidth:true
                , height: _iTableHeiht
                // , rowNum: 500
                , rowNum:20
                , rowList: [10, 20, 30,40,50,100]
                , pager: '#'+t.options.infoSetId +'_pager'
                , pageLimitDirection:"up"
                , mtype: "post"
                , viewrecords: true
                , shrinkToFit:isFixation?false:true //是否使用固定宽度，为false表示使用固定宽度
                , postData:(function(){
                    return {infoSetId: t.options.infoSetId,editCondition:t.options.editCondition
                };
                })()
                ,loadComplete:function (xhr) {
                    t.myJqGridAllData = xhr.rows;
                }
            });
            //操作表格的一些方法的封装
            t.mmg = {
                //重载表格数据
                load:function(oPost){
                    oPost = oPost || {};
                    $("#"+t.sTableId).trigger("reloadGrid");
                }
            };
            t.createTabel(t.options.oTableColumn,null);
        }
        ,createTabel:function(data,queryData){
            var t = this;
            t.queryData = queryData ||{}; //插件查数据
            t.oTableColumnData = data; //表头数据
            var aPrimaryList = []; //新增和修改时候要传入的主键列表
            var aFormData = []; //表单包含的字段
            var aFormEditData = []; //修改时的表单集合
            var oRules = {}; //验证规则
            var validatorFields ={}; //待验证的字段集
            if(data.columnEdit.length){
                for(var i=0;i<data.columnEdit.length;i++){
                    var item = data.columnEdit[i];
                    if(item.isEditShow){
                        //自定义表单的值
                        if(t.options.infoSetId=="recruit_activity_postab"||t.options.infoSetId=="recruit_activity_costtab"){
                            if(item.name=="org_name"){
                                item.cellType = "treeSelect";
                                item.keyValueBean = $.extend({},item.keyValueBean,{keyId:"org_id",infoSetId:"hr_org",parentId:"parent_org_id",valueId:"org_name",isDateFilter:true,orderStr:"gid"})
                            }else if(item.name=="pos_id"){
                                item.cellType = "treeSelect";
                                item.keyValueBean = $.extend({},item.keyValueBean,{keyId:"id",infoSetId:"r_hr_org_pos",parentId:"parent_id",valueId:"value",isDateFilter:false,orderStr:"gid, pos_order"})
                            }else if(item.name=="leader_name"){
                                item.cellType = "treeSelect";
                                item.keyValueBean = $.extend({},item.keyValueBean,{keyId:"id",infoSetId:"r_hr_org_person",parentId:"parent_id",valueId:"value",isDateFilter:true,orderStr:"gid"})
                            }
                        }
                        aFormData.push({
                            name:item.name
                            ,label:item.title
                            ,isEdit:item.isEdit?true:false //禁用修改
                            ,type:item.cellType || "text" //用于判断是什么类型的表单，默认为文本框
                            ,keyValueBean:item.keyValueBean  //用来判断该字段的表单项是否是异步获取数据做下拉菜单用
                            ,isParentField:item.isParentField //是否是父表字段，非autoForm必传
                            ,isMust:item.isMust //是否必填样式
                            ,maxlength:item.fieldSize //显示文本框的长度
                            ,value: ""
                        });
                        //是否放在编辑界面
                        aFormEditData.push({
                            name:item.name
                            ,label:item.title
                            ,type:item.cellType ||"text" //用于判断是什么类型的表单，默认为文本框
                            ,isEdit:item.isEdit?true:false //禁用修改
                            ,isLogicPrimaryKey:item.isLogicPrimaryKey  //是否是逻辑主键
                            ,keyValueBean:item.keyValueBean  //用来判断该字段的表单项是否是异步获取数据做下拉菜单用
                            ,isParentField:item.isParentField //是否是父表字段，非autoForm必传
                            ,isMust:item.isMust //是否必填样式
                            ,maxlength:item.fieldSize //显示文本框的长度
                        });
                    }
                    //如果是必填字段
                    if(item.isMust){
                        validatorFields[item.name] = {
                            rule: 'required;',
                            msg: {
                                required:"不能为空"
                            }
                        };
                        //如果是日期、时间型的空间
                        if(item.cellType && item.cellType.indexOf("date") != -1){
                            validatorFields[item.name]["timely"] = false; //日期型控件不需要即时验证
                        }
                    }
                    if(item.regExpress){
                        var _reg = new RegExp(item.regExpress);
                        oRules[item.name] = [_reg, '格式不正确'];
                        if(validatorFields[item.name]){
                            validatorFields[item.name].rule += " "+item.name+";";
                        }else{
                            validatorFields[item.name] = {
                                rule:item.name+";"
                            };
                        }
                    }
                    if(item.isLogicPrimaryKey){
                        aPrimaryList.push(item.name);
                    }
                }
            }
            //修改/删除事件
            var oParameter = {aFormData:aFormData,validatorFields:validatorFields,oRules:oRules};
            t.eventBind(oParameter);
        }
        /**
         * 事件绑定
         * */
        ,eventBind:function(oParameter){
            var t = this;
            $('#'+t.options.infoSetId).on('click','.recruitTdDel',function(){
                var _index = $(this).parents('tr[id='+$(this).attr('data-index')+']').index()-1;
                var oRowData = t.myJqGridAllData[_index];
                t.deleteTableData(oRowData);
            });
            $('#'+t.options.infoSetId).on('click','.recruitTdEdit',function(){
                var _index = $(this).parents('tr[id='+$(this).attr('data-index')+']').index()-1;
                var oRowData = t.myJqGridAllData[_index];
                var item = oRowData;
                var aFormEditData = oParameter.aFormData;
                var validatorFields = oParameter.validatorFields;
                var oRules = oParameter.oRules;
                t.createFormAndDoSubmit("edit",aFormEditData,validatorFields,oRules,item.uuid,item);
            });
            $('#'+t.options.infoSetId).parent('dl').on('click','.add',function(){
                var aFormEditData = oParameter.aFormData;
                var validatorFields = oParameter.validatorFields;
                var oRules = oParameter.oRules;
                t.createFormAndDoSubmit("add",aFormEditData,validatorFields,oRules);
            });
        }
        /**
         * 删除表格数据
         * @aSelect 当前选中的数据组
         * */
        ,deleteTableData:function(aSelect){
            var t = this;
            if(aSelect){
                layer.confirm('请确定是要删除这条数据吗？', {icon: 3, title:'提示'}, function(index){
                    var aSendData = {infoSetId:t.options.infoSetId,uuidLists:[]};
                    aSendData.uuidLists.push(aSelect.uuid);
                    Ajax.ApiTools().del({
                        infoSetId: t.options.infoSetId,
                        data:aSendData,
                        success:function(data){
                            if(data.result == "true"){
                                $("#"+ t.sTableId).trigger("reloadGrid");
                                //重载当前选项卡的更多模板
                                $("#table_edit_dialog").find(".table_edit_dialog_left_ul").find("li.on")[0].click();
                                layer.msg("删除成功", {offset: 0});
                            }
                        }
                    });

                    layer.close(index);
                });
            }else{
                layer.msg("请先选择需要删除的数据", {offset: 0,shift:6});
                return false;
            }
        }
        /**
         *新增或者修改的时候遇到特殊的表单插件的处理
         *@type 类型 是修改还是新增
         *@aFormObj 要处理的表单项
         *@validatorFields 验证字段
         *@uuid 修改的时候传的uuid
         */
        ,createFormAndDoSubmit:function(type,aFormEditData,validatorFields,oRules,uuid,item){
            var t = this;
            var iIndex = 0; //开始处理的表单的索引
            var _formLayer; //处理中的遮罩
            var aFormObj = [];
            //常规修改
            for(var i= 0,len=aFormEditData.length;i<len;i++){
                aFormObj.push(aFormEditData[i]);
                if (type == 'edit'&&item){
                    for(var j in item){
                        if(aFormEditData[i].name == j){
                            aFormObj[i].value = item[j];
                        }
                    }
                }else {
                    aFormObj[i].value = '';
                }
            }
            //特殊插件的表单项处理
            function setFormPlugins(){
                //处理特殊表单项完毕，开始初始化表单了
                if(iIndex == aFormObj.length){
                    layer.close(_formLayer); //关闭loading遮罩
                    if(type =="edit"){
                        t.saveData(type,aFormObj,validatorFields,oRules,uuid);
                    }else{
                        t.saveData(type,aFormObj,validatorFields,oRules);
                    }
                    return;
                }
                //如果有特殊表单项要处理

                if(aFormObj.length){
                    var oData = aFormObj[iIndex].keyValueBean;
                    //如果是树下拉菜单或者是可填写其他值的树下拉，如果这个下拉菜单关联了父下拉
                    if(aFormObj[iIndex].type == "treeSelect" || aFormObj[iIndex].type == "treeAdviceSelect" || aFormObj[iIndex].type == "treeMultipleSelect"){
                        //如果有conditionId表示是关联父字段而来就不用查询
                        if(aFormObj[iIndex].keyValueBean.conditionId){
                            aFormObj[iIndex].treeJsonArr = []; //控件的备选值
                            aFormObj[iIndex].keyValueBean = aFormObj[iIndex].keyValueBean; //把keyValueBean传给autoForm缓存起来，下拉树请求要用到
                            //继续处理
                            iIndex++;
                            setFormPlugins();
                        }else{
                            var sUrl = gMain.apiBasePath +"route/getKeyValueData.do";
                            if(aFormObj[iIndex].name === "item_id"){
                                sUrl =gMain.apiBasePath +'recruitItem/getItemByIsEditAndRuleId.do';
                                oData.conditionBean = {key: "ruleId", value:t.options.rule_id}
                            }
                            Ajax.ApiTools().getKeyValueData({
                                url:sUrl,
                                data:oData,
                                success:function(data){
                                    var aData = [];
                                    if(aFormObj[iIndex].name === "item_id"){
                                        aData = data.maps;
                                    }else {
                                        aData = data.beans;
                                    }
                                    //如果是tree
                                    if(aData && aData.length||data.maps){
                                        //aFormObj[iIndex].type = "treeSelect"; //控件的类型
                                        aFormObj[iIndex].treeJsonArr = aData; //控件的备选值
                                        var _valueOrKey = aFormObj[iIndex].value; //key或value都匹配

                                        //如果该字段是父表字段，就让它选中key为t.options.navigationId的项
                                        if(aFormObj[iIndex].isParentField){
                                            aFormObj[iIndex].value = t.options.navigationId;
                                        }
                                        //如果是默认编辑字段，就设置值为当前选中的导航
                                        if(aFormObj[iIndex].isEditDefaultKey){
                                            aFormObj[iIndex].value = t.quickMenuNav.selectedNavNode.name;
                                        }
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

                                        setEditDefVal(aData);
                                    }

                                    //成功才继续处理
                                    iIndex++;
                                    setFormPlugins();
                                }
                            });
                        }
                    }else{
                        //不是特殊表单项就跳过直接继续处理
                        iIndex++;
                        setFormPlugins();
                    }
                }else{
                    layer.msg("暂无要"+(type=="add"?"新增":"修改")+"的字段", {offset: 0,shift:6});
                    layer.close(_formLayer); //关闭loading遮罩
                    return;
                }
            }
            _formLayer= layer.load(1, {shade: [0.3,'#ffffff']}); //启动loading遮罩
            //特殊插件的表单项处理
            setFormPlugins();
        }
        /**
         * 保存数据
         * @saveType  add|edit 新增|修改
         * @aFormData  要生成的表单项
         * @validatorFields 待验证的字段集
         * @uuid 表的索引ID
         */
        ,saveData:function(saveType,aFormData,validatorFields,oRules,uuid){
            var t = this;
            saveType = saveType || "add";
            var sActionStr = saveType=="add"?"新增":"修改";
            var isContinueAdd = false; //是否继续弹出新增
            require.async("commonStaticDirectory/plugins/autoForm/autoForm",function(AutoForm){
                var aButtons = [];
                if(saveType =="add"){
                    aButtons = [
                        {
                            value: '保存并继续新增',
                            callback: function () {
                                saveType = "add";
                                $('#myAutoForm2').find("form:first").trigger("validate"); //触发表单验证
                                isContinueAdd = true;
                                return false;
                            }
                        },
                        {
                            value: '保存',
                            callback: function () {
                                saveType = "add";
                                $('#myAutoForm2').find("form:first").trigger("validate"); //触发表单验证
                                isContinueAdd = false;
                                return false;
                            },
                            autofocus: true
                        },
                        {
                            value: '取消'
                        }
                    ];
                    //如果是弹窗详情中的卡片新增模式，只有两个按钮
                    if(t.options.oMetadata.showEditPop && t.options.oMetadata.showEditPop.oShowData && t.options.oMetadata.showEditPop.oShowData.isEditTemplateInsert){
                        aButtons.shift();
                    }
                }else if(saveType =="edit"){
                    aButtons = [
                        {
                            value: '保存',
                            callback: function () {
                                $('#myAutoForm2').find("form:first").trigger("validate"); //触发表单验证
                                return false;
                            },
                            autofocus: true
                        },
                        {
                            value: '取消'
                        }
                    ];
                }

                require.async("commonStaticDirectory/plugins/artDialog/dialog-plus",function(){
                    var n=0,iWidth = 402; //表单宽度
                    if(!aFormData.length){ //如果没有表单项
                        return false;
                    }
                    for(var i=0;i<aFormData.length;i++){
                        if(aFormData[i].type !="hidden"){n++;}
                    }
                    //如果表单大于10项就双排显示
                    if(n>10){
                        n =  Math.floor(n/2);
                        iWidth  = iWidth * 2-54;
                    }
                    var d = dialog({
                        title: sActionStr,
                        //fixed: true,
                        content: '<div id="myAutoForm2"  style="width:'+iWidth+'px;height: '+n*43+'px;" class="addAndEditStore"></div>',
                        button: aButtons
                    });
                    d.showModal();//模态弹出


                    function creatForm(){
                        //把编辑前的数据缓存起来
                        var _oOldEditData = {};
                        $("#myAutoForm2").html("");
                        var form1 = new AutoForm({
                            id:"myAutoForm2",
                            data:aFormData,
                            minHeight:50,
                            showRow:1,
                            //加载完成
                            formComplete:function($form){
                                $form.find("[name]").each(function(){
                                    var _key = $(this).attr("name");
                                    var _value = $(this).val();
                                    _oOldEditData[_key] = _value;
                                });
                            }
                        });
                        if(t.options.infoSetId === 'recruit_activity_postab') {
                            for(var i=0;i<aFormData.length;i++){
                                if(aFormData[i].name === 'pos_id') {
                                      aFormData[i].dayhrDropSelect && (aFormData[i].dayhrDropSelect.options.onSelected = function (posId) {
                                          Ajax.ajax({
                                              data:{
                                                  posId: posId.value
                                              }
                                              ,type:"GET"
                                              ,url:gMain.apiBasePath +"active/posInfo.do"
                                              ,success:function (data) {
                                                  if(data.result == "true"){
                                                      if(data.ext) {
                                                          $('textarea[name="pos_requirements"]').text(data.ext.pos_requirements);
                                                          $('textarea[name="responsibility_scope"]').text(data.ext.responsibility_scope);
                                                      }
                                                  }else {
                                                      if(data.resultDesc) {
                                                          tools.showMsg.error(data.resultDesc);
                                                      }
                                                  }
                                              }
                                          });
                                    })
                                    break;
                                }
                            }
                        }

                        t.form1 = form1; //编辑和新增的表单
                        var $form = $('#myAutoForm2').find("form:first"); //表单
                        $('#myAutoForm2').removeClass('addAndEditStore');
                        //表单验证
                        $form.validator({
                            theme: "yellow_right",
                            timely:0, // 保存的时候验证
                            focusCleanup:true,
                            stopOnError:true,
                            //自定义用于当前实例的消息
                            rules: oRules,
                            //待验证字段集合
                            fields: validatorFields,
                            valid:function(form) {
                                //表单验证通过
                                var oSubmitData = {dataList:[{key:"activity_id",value:t.options.oItem.activity_id}],infoSetId:t.options.infoSetId};

                                $form.find("[name]").each(function(){
                                    var _key = $(this).attr("name");
                                    var _value = $(this).val();
                                    if(_key == "plan_id"){
                                        _value = parseInt(_value);
                                    }
                                    if(_key=="pos_id"){
                                        oSubmitData.dataList.push({key:"pos_name",value:$(this).prev().attr("title")});
                                    }else if(_key=="org_id"){
                                        oSubmitData.dataList.push({key:"org_name",value:$(this).prev().attr("title")});
                                    }
                                    //新增的时候如果该表单项有值才提交
                                    if(saveType =="add"){
                                        if($(this).val()){
                                            oSubmitData.dataList.push({key:_key,value:_value});
                                        }
                                    }else if(saveType =="edit" && !$.isEmptyObject(_oOldEditData)){ //如果是编辑的时候，如果数据没修改就不提交
                                        for(var i in _oOldEditData){
                                            if(i ==_key && _value !=_oOldEditData[i]){
                                                oSubmitData.dataList.push({key:_key,value:_value});
                                            }
                                        }
                                    }
                                });
                                //如果是编辑
                                if(saveType=="edit"){
                                    oSubmitData.uuid = uuid;
                                    if(t.showEditPop && t.showEditPop.oShowData){
                                        oSubmitData.uuid = uuid || t.showEditPop.oShowData.uuid;
                                    }
                                    if(!oSubmitData.dataList.length){
                                        layer.msg(sActionStr+"成功", {offset: 0}); //成功提示弹层
                                        d.close().remove(); //关闭弹层
                                        return false; 
                                    }
                                }
                                var pageLayer = layer.load(1, {shade: [0.3,'#ffffff']}); //启用loading遮罩
                                Ajax.ajax({
                                    url:gMain.apiBasePath+(saveType=="add"?"route/"+ (oSubmitData.infoSetId?oSubmitData.infoSetId:t.options.infoSetId)+"/insert.do":"route/"+ (oSubmitData.infoSetId?oSubmitData.infoSetId:t.options.infoSetId)+"/update.do"),
                                    data:JSON.stringify(oSubmitData),
                                    dataType:"json",
                                    success:function(data){
                                        layer.close(pageLayer);//关闭loading遮罩
                                        if(data.result =="true"){
                                            layer.msg(sActionStr+"成功", {offset: 0}); //成功提示弹层
                                            t.mmg.load();//重载表格数据
                                            if(isContinueAdd){ //如果是保存并新增
                                                creatForm();
                                                //如果是组织列表的新增就保存的时候刷新上级组织的表单项
                                            }else{
                                                d.close().remove(); //关闭弹层
                                            }
                                        }else {
                                            tools.showMsg.error(data.resultDesc);
                                        }
                                    }
                                });
                            }
                        });

                    }
                    creatForm();

                });

            });
        }
    }
    module.exports = ClassName;
});

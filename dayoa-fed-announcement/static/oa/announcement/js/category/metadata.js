/**
 * 公共表格模块.
 * @options 类型 Object
 * @options.infoSetId
 * @options.navigationId
 */
define(function(require, exports,module) {
    require("css/metadata.css");
    var sTpl = require("templates/metadata.html");
    require("commonStaticDirectory/plugins/jqGrid/mmButton"); //表格按钮

    require("commonStaticDirectory/plugins/jqGrid/css/ui.jqgrid.css"); //表格核心组件样式
    require("commonStaticDirectory/plugins/jqGrid/jquery.jqGrid.src.js"); //表格核心组件
    require("commonStaticDirectory/plugins/jqGrid/grid.locale-cn.js"); //表格语言包
    require("commonStaticDirectory/plugins/jqGrid/jquery.jqGrid.backboard.js"); //隐藏列插件

    //表单控件
    require("commonStaticDirectory/plugins/autoForm/autoForm.css");
    var Ajax = require("js/ajax");

    //导航插件
    var QuickMenu = require('commonStaticDirectory/plugins/quickMenu/quickMenu.js');
    var template = require("commonStaticDirectory/plugins/template");
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css"); //artDialog弹窗
    var tools = require("commonStaticDirectory/plugins/tools"); //工具函数集
    var HighSearch = require("commonStaticDirectory/plugins/highSearch/highSearch.js"); //高级搜索模块
    require("commonStaticDirectory/plugins/jquery.transit.min"); //jquery的css3动画库
    require("commonStaticDirectory/plugins/underscore.min"); //underscore工具库
    require("commonStaticDirectory/plugins/jquery.loading");


    var VueComponent = Vue.extend({
        template: sTpl
        ,data:function(){
            return {
                options:{}
                ,sParams:""  //路由参数默认值
            }
        }
        ,attached:function () {
            var t = this;

        }
        /**
         * 监控路由改变
         * */
        ,route: {
            data: function (transition) {
                return {
                    sParams: transition.to.params.sParams
                }
            }
        }
        /**
         * 监控数据改变
         * */
        ,watch:{
            /**
             * 把参数格式转换成：infoSetId:app_corp_menu&leftNav:initConfig 来方便获取
             * 获取参数方式如：
             * 获取infoSetId: t.options.infoSetId
             * 获取leftNav: t.options.leftNav
             * */
            'sParams': function (val, oldVal) {
                var t = this;
                var oPara = {}; //附加其他参数
                if(val && val.indexOf(':') > -1) {
                    val.replace(/(\w+)\s*:\s*([\w-]+)/g, function(a, b, c) {
                        b && (oPara[b] = c);
                    });
                }
                t.init(oPara);
            }
        }
        ,methods:{
            /**
             * 初始化函数
             * */
            init:function(options){
                var t = this;
                this.options = options;
                /*if(sessionStorage.getItem("dSessionDate") && sessionStorage.getItem("dSessionDate").indexOf("-")){
                    var _arr = sessionStorage.getItem("dSessionDate").split("-");
                    var dNow = new Date();dNow.setHours(0); dNow.setMinutes(0); dNow.setSeconds(0); dNow.setMilliseconds(0);
                    if(parseInt((new Date(_arr[0],_arr[1]-1,_arr[2])).getTime()/(24*60*60*1000)) < parseInt(dNow.getTime()/(24*60*60*1000))){
                        layer.msg("您当前正在浏览历史数据", {offset: 0});
                    }
                }*/


                //查询表头
                if(t.options.infoSetId){
                    Ajax.ApiTools().getTableColumn({
                        infoSetId: t.options.infoSetId,
                        data:{infoSetId: t.options.infoSetId},
                        success: function (data) {
                            t.quickMenuNav = new QuickMenu("#mmPositionTools",{oMetadata:t,tableColumnData:data});
                            //如果有面包屑导航
                            if(data.breadNavigation && data.breadNavigation.length){
                                t.initMainMenu(data.breadNavigation); //初始化导航
                            }
                        }
                    });
                }

                t.tableHtml = '<div id="base_metadata_pager"></div><table id="base_metadata_list"></table>'; //表格控件的所需的html结构缓存起来方便下次初始化

                //左变有导航的情况
                if(t.options.leftNav){
                    $("#base_left_nav").show();
                    $("#base_right_content").css({marginLeft:"171px"});
                    require.async("js/modules/leftNav",function(LeftNav){
                        new LeftNav({$ele:$("#base_left_nav"),navName:t.options.leftNav,infoSetId: t.options.infoSetId});
                    });
                }else{
                    $("#base_left_nav").html("").hide();
                    $("#base_right_content").css({marginLeft:"0"});
                    $("#base_right_content").find(".base_right_content_title").remove();
                }

                t.resizeTable(); //随时改变表格的高度
            },
            /**
             * 初始化导航
             * */
            initMainMenu:function(aNav){
                var t = this;
                t.$parent.mainTitle = aNav[aNav.length-1].title;  //二级标题
                t.$parent.documentTitle = aNav[aNav.length-1].title;  //页面标题
                if(t.options.infoSetId == "wf_process_waitaudit_list"){
                    switch (t.options.read_state){
                        case "4":
                            t.$parent.documentTitle = t.$parent.mainTitle = "我发起的";
                            break;
                        case "3":
                            t.$parent.documentTitle = t.$parent.mainTitle = "抄送我的";
                            break;
                        case "2":
                            t.$parent.documentTitle = t.$parent.mainTitle = "已审流程";
                            break;
                        case "1":
                            t.$parent.documentTitle = t.$parent.mainTitle = "待审批的";
                            break;
                        default:
                            t.$parent.documentTitle = t.$parent.mainTitle = "待审批模板";
                    }
                }
            },
            /**
             * 初始化表格
             * @data columnEdit接口的数据
             * @queryData 查询数据
             * */
            initTabel:function(data,queryData){
                var t = this;

                function createTabel(data,queryData){
                    t.queryData = queryData ||{}; //插件查数据
                    t.queryData.searchConditionList = t.queryData.searchConditionList || []; //搜索的条件
                    t.oTableColumnData = data; //表头数据

                    //初始化高级搜索控件
                    t.highSearch = new HighSearch({$el:$("#base_mmSearch"),oTableColumnData: t.oTableColumnData,oMetadata: t});

                    //var cols = [];  //展示的字段
                    var aColNames = ["索引ID"]; //表头名称数组
                    var aColModels =[{name:"_indexId",width:1,isListShow:false}]; //表头数据数组

                    var aPrimaryList = []; //新增和修改时候要传入的主键列表
                    var aFormData = []; //表单包含的字段
                    var aFormEditData = []; //修改时的表单集合
                    var oRules = {}; //验证规则
                    var validatorFields ={}; //待验证的字段集

                    var isHasFrozen = false; // 是否含有冻结的列
                    var iLastColIndex = -1; //最后一个传了冻结的列的名称

                    //头像基础路径
                    if(data.filePrefix){
                        t.filePrefix = data.filePrefix;
                    }

                    //如果有列头数据
                    if(data.columnEdit.length){
                        //如果有哪一列设置了冻结，就把该列前面的列都设置成冻结
                        for(var i=0;i<data.columnEdit.length;i++) {
                            var item = data.columnEdit[i];
                            if (item.isFrozen) {
                                isHasFrozen = true;
                                iLastColIndex = i;
                            }
                        }
                        if(isHasFrozen && iLastColIndex != -1){
                            //把前面的列都设置成冻结
                            aColModels[0].frozen = true;
                            for(var i=0;i<=iLastColIndex;i++) {
                                data.columnEdit[i].frozen = true;
                            }
                        }

                        for(var i=0;i<data.columnEdit.length;i++){
                            var item = data.columnEdit[i];
                            //判断用户之前隐藏过哪些列
                            var oColumnShow = tools.Cache.getCache("oColumnShow"+gMain.sDdh);
                            if(oColumnShow && !$.isEmptyObject(oColumnShow)){
                                var _obj = oColumnShow[t.options.infoSetId];
                                if(_obj){
                                    if(_obj[item.name] =="true"){
                                        item.isListShow = true;
                                    }else if(_obj[item.name] =="false"){
                                        item.isListShow = false;
                                    }
                                }
                            }
                            var colObj = {
                                name:item.name //字段名
                                ,index:item.name //排序索引
                                ,align:item.alignX //显示位置
                                ,width:item.width //宽度
                                ,isListShow:item.isListShow //是否列表显示
                                ,sortable:!!item.isSortable //是否可排序
                                ,frozen:item.frozen?true:false //是否冻结列
                            };

                            /**
                             * 列的数据的处理
                             * */
                            colObj.formatter = function(cellvalue, options, rowObject){
                                for(var j=0;j<data.columnEdit.length;j++){
                                    if(options.colModel.name == data.columnEdit[j].name){
                                        options.columnEditParam = data.columnEdit[j];
                                    }
                                }
                                return t.formateData(cellvalue, options, rowObject);
                            };

                            //只有isHidden为false的时候才在表头中显示
                            if(!item.isHidden){
                                aColNames.push(item.title);
                                aColModels.push(colObj);
                            }
                            if(item.isEditShow){
                                aFormData.push({
                                    name:item.name
                                    ,label:item.title
                                    ,isEdit:item.isParentField?false:true //如果是父表字段就禁用修改
                                    ,type:item.cellType || "text" //用于判断是什么类型的表单，默认为文本框
                                    ,keyValueBean:item.keyValueBean  //用来判断该字段的表单项是否是异步获取数据做下拉菜单用
                                    ,isParentField:item.isParentField //是否是父表字段，非autoForm必传
                                    ,isEditDefaultKey:item.isEditDefaultKey  //是否是默认编辑字段，如果是的话，用户设置导航的选中值
                                    ,isMust:item.isMust //是否必填样式
                                    ,maxlength:item.fieldSize //显示文本框的长度
                                    ,value:item.defaultAddVal || ""
                                    ,align:item.alignX //显示位置
                                    ,height:item.height //组件的高度
                                });
                                //是否放在编辑界面
                                aFormEditData.push({
                                    name:item.name
                                    ,label:item.title
                                    ,type:item.cellType ||"text" //用于判断是什么类型的表单，默认为文本框
                                    ,isEdit:(!item.isEdit || item.isParentField)?false:true  //如果不可编辑为true或者说是父表字段就不可修改，此字段仅作为判断是否可编辑用，不做自动表单插件用
                                    ,isLogicPrimaryKey:item.isLogicPrimaryKey  //是否是逻辑主键
                                    ,keyValueBean:item.keyValueBean  //用来判断该字段的表单项是否是异步获取数据做下拉菜单用
                                    ,isParentField:item.isParentField //是否是父表字段，非autoForm必传
                                    ,isMust:item.isMust //是否必填样式
                                    ,maxlength:item.fieldSize //显示文本框的长度
                                    ,align:item.alignX //显示位置
                                    ,height:item.height //组件的高度
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


                    //重现渲染表格骨架
                    $("#"+sTableId).jqGrid('GridDestroy'); //从dom上删除此grid
                    $("#base_metadata_wrap").html(t.tableHtml);

                    //表格的初始高度，高度浏览器窗口的高度来计算
                    var iTableH = $(window).height() - $("#base_metadata_wrap").offset().top -100; //减去表格距离顶部的高度，再减去翻页条的高度
                    if(t.options.leftNav == "highConfig"){
                        iTableH = iTableH - 10;
                    }

                    if(iTableH < 360){iTableH=360}
                    var sTableId = "base_metadata_list"; //表格的id
                    //计算宽度，如果每列的传值宽度总和大于浏览器的宽度则使用固定宽度，否则使用自适应宽度
                    var isFixation = false; //是否使用固定宽度
                    if(aColModels.length){
                        var iWidth = 0;
                        for(var i=0;i<aColModels.length;i++){
                            if(!!aColModels[i].isListShow){
                                iWidth += (aColModels[i].width?aColModels[i].width:0);
                            }
                        }
                        if(iWidth > $("#base_metadata_wrap").width()){
                            isFixation = true;
                        }
                        t.aColModels = aColModels; //把各个列的数据存起来
                    }

                    if(aColModels.length == 1){ //只有一条没用的索引列
                        aColModels.push({name:"none_table_head_data",isListShow:true,sortable:false});
                        aColNames.push("暂无表头数据");
                    }

                    //如果是流程设置页面,新表格尾部新增“设置操作”一列
                    if(t.options.infoSetId == "wf_form_set_list"){
                        aColModels.push({name:"setting",isListShow:true,sortable:false,align:"center"});
                        aColNames.push("设置操作");
                    }

                    //初始化核心表格
                    t.baseJqGrid = $("#" + sTableId).jqGrid({
                        url: gMain.apiBasePath+"route/"+ t.options.infoSetId+"/getAll.do"
                        , datatype: "json"
                        , colNames:aColNames
                        , colModel:aColModels
                        //, width: $("#base_metadata_wrap").width()
                        , autowidth:true
                        , height: iTableH
                        , rowNum: (tools.Cache.getCache("oPageLimit"+gMain.sDdh) && tools.Cache.getCache("oPageLimit"+gMain.sDdh)[t.options.infoSetId])?parseInt(tools.Cache.getCache("oPageLimit"+gMain.sDdh)[t.options.infoSetId]):20
                        , rowList: [10, 20, 30,40,50,100]
                        , pager: '#base_metadata_pager'
                        , mtype: "post"
                        , viewrecords: true //定义是否要显示总记录数
                        , multiselect:true
                        , multiselectWidth:35
                        , multiboxonly:false //只有当multiselect = true.起作用，当multiboxonly 为ture时只有选择checkbox才会起到多选的作用
                        , rownumbers:true
                        , rownumWidth:50
                        , shrinkToFit:isFixation?false:true //是否使用固定宽度，为false表示使用固定宽度
                        , postData: t.markGetAllPostData()
                        //双击表格事件
                        , ondblClickRow:function(rowid,iRow,iCol,e){
                            var oItem =  $("#"+sTableId).jqGrid("getRowData",iRow);
                            oItem.iRowIndex = iRow;

                            //如果是流程-- "我发起的" 页面
                            if((t.options.infoSetId == "wf_process_waitaudit_list" && (t.options.read_state == "4" || t.options.read_state == "1" || t.options.read_state == "2" || t.options.read_state == "3" )) || t.options.infoSetId == "wf_process_list"){
                                //调用流程待审
                                t.doWaitForAudit({
                                    item:oItem
                                });
                            }else if(t.options.infoSetId == "wf_form_set_list"){ //流程设置页面
                                $("body").loading({zIndex:9999}); //启用loading
                                require.async("js/modules/formBuild/formBuild.js",function (FormBuild) {
                                    new FormBuild({oMetadata:t,editType:"edit",oFormEditData:oItem});
                                });
                            }else{
                                //编辑数据组装
                                t.doEdit({
                                    item:oItem
                                    ,data:data
                                    ,aFormEditData:aFormEditData
                                    ,validatorFields:validatorFields
                                    ,oRules:oRules
                                });
                            }
                        }
                        //数据加载完成
                        ,loadComplete:function(xhr){
                            //从sessionStorage从存选中匹配uuid
                            if(sessionStorage.getItem("sMetadataSelectedUuid")){
                                t.mmg.select(function(item, index){
                                    if(item.uuid == sessionStorage.getItem("sMetadataSelectedUuid")){
                                        t.mmg.select(index);
                                    }
                                });
                            }
                            if(isHasFrozen && iLastColIndex != -1){
                                $("#base_metadata_wrap").hackHeight(sTableId); //修复冻结列之后，两边数据高度不一致的问题
                            }

                        }
                        //表格初始化完成事件
                        ,gridComplete : function() {
                            var ids = $("#" + sTableId).jqGrid('getDataIDs');
                            for ( var i = 0; i < ids.length; i++) {
                                $("#" + sTableId).jqGrid('setRowData', ids[i],{
                                    setting : '<div><a href="javascript:void(0)" class="formStyle" data-rowid="'+ids[i]+'" style="color: #ed6c2b;text-decoration: underline;">表单</a> <span style="color: #ccc;">|</span> <a href="javascript:void(0)" class="auditStyle" data-rowid="'+ids[i]+'" style="color: #ed6c2b;text-decoration: underline;">流程</a></div>'
                                });
                            }
                        }


                    });

                    sessionStorage.removeItem("sMetadataSelectedUuid"); //清除编辑的时候的记录

                    $("#base_metadata_wrap").jqGridBackboard({
                        sTableId:sTableId
                        ,aColModels:aColModels
                        ,aColNames:aColNames
                        ,afterSelectBackboard:function(obj){
                            //存储用户在浏览器操作的时候隐藏了哪些列的信息
                            var oColumnShow = tools.Cache.getCache("oColumnShow"+gMain.sDdh) || {};
                            oColumnShow[t.options.infoSetId] = obj;
                            tools.Cache.setCache("oColumnShow"+gMain.sDdh,oColumnShow);
                        }
                    }); //隐藏列的插件

                    //合并表头
                    /*$("#"+sTableId).jqGrid('setGroupHeaders', {
                     useColSpanStyle: true,
                     groupHeaders:[
                     {startColumnName: 'zhenngjianbianma', numberOfColumns: 2, titleText: '附加资料'}
                     ]
                     });*/

                    //设置锁定列  注意：如果同时存在合并表头和锁定列的情况，一定要先把合并表头的代码放到锁定列的前面
                    if(isHasFrozen && iLastColIndex != -1){
                        $("#"+sTableId).jqGrid('setFrozenColumns');
                    }

                    t.ininMMButtons({
                        data:data,
                        aFormData:aFormData,
                        aFormEditData:aFormEditData,
                        validatorFields:validatorFields,
                        oRules:oRules,
                        aPrimaryList:aPrimaryList
                    }); //初始化表格按钮

                    //操作表格的一些方法的封装
                    t.mmg = {
                        //当前页有多少条
                        rowsLength:function(){
                            return $("#"+sTableId).jqGrid("getGridParam","reccount"); //当前页共有多少条数据
                        }
                        //取消选中所有行
                        ,deselect:function(){
                            $("#"+sTableId).jqGrid("resetSelection");
                        }
                        //选中某一行
                        ,select:function(iNum){
                            $("#"+sTableId).jqGrid("setSelection",iNum);
                        }
                        //获取一条选中的数据
                        ,row:function(iRowIndex){
                            var oItem =  $("#"+sTableId).jqGrid("getRowData",iRowIndex);
                            return oItem;
                        }
                        //获取所有选中的数据的数组
                        ,selectedRows:function(){
                            var aIds=$("#"+sTableId).jqGrid("getGridParam","selarrrow");
                            var aRows = [];
                            for(var i=0;i<aIds.length;i++){
                                aRows.push($("#"+sTableId).jqGrid("getRowData",aIds[i]));
                            }
                            //console.log(aRows);
                            return aRows;
                        }
                        //获取所有选中的数据的索引的数组
                        ,selectedRowsIndex:function(){
                            var aIds=$("#"+sTableId).jqGrid("getGridParam","selarrrow");
                            return aIds;
                        }
                        //重载表格数据
                        ,load:function(oPost){
                            oPost = oPost || {};
                            var oPostData = t.markGetAllPostData();
                            if(!$.isEmptyObject(oPost)){
                                $.extend(true,oPostData,oPost);
                            }
                            $("#"+sTableId).jqGrid("setGridParam",{postData: oPostData});
                            $("#"+sTableId).trigger("reloadGrid");
                        }
                    };


                    //记录每页多少条
                    $("#base_metadata_wrap").find("select.ui-pg-selbox").off("change.saveDropValue").on("change.saveDropValue",function(){
                        var iNum = $(this).val();
                        if(iNum){
                            var oPageLimit = tools.Cache.getCache("oPageLimit"+gMain.sDdh) || {};
                            oPageLimit[t.options.infoSetId] = iNum;
                            tools.Cache.setCache("oPageLimit"+gMain.sDdh,oPageLimit);
                        }
                    });

                    //给能排序的列添加特殊标示
                    $("#base_metadata_wrap").find(".ui-jqgrid-htable").find("th").each(function(){
                        if(aColModels.length){
                            for(var i=0;i<aColModels.length;i++){
                                if($(this).attr("id") == "base_metadata_list_"+aColModels[i].name && aColModels[i].sortable){
                                    $(this).addClass("jqgrid-th-sortable");
                                }
                            }
                        }
                    });

                    t.EditFormAndAudit(); //编辑表单和流程

                }

                if(data){
                    //重新加载表头信息的情况
                    if(data.isRefreshTableStyle){
                        var _postData = {infoSetId: t.options.infoSetId};
                        if(data.navigationCondition){_postData.navigationCondition = data.navigationCondition;}
                        Ajax.ApiTools().getTableColumn({
                            infoSetId: t.options.infoSetId,
                            data:_postData,
                            success: function (data) {
                                data.isRefreshTableStyle = true;
                                createTabel(data,queryData);
                            }
                        });
                    }else{
                        createTabel(data,queryData);
                    }
                }
            },
            /**
             * 初始化表格按钮
             * */
            ininMMButtons:function (opts) {
                var t = this;
                opts = opts || {};
                var data = opts.data;
                var aFormData = opts.aFormData;
                var aFormEditData = opts.aFormEditData;
                var validatorFields = opts.validatorFields;
                var oRules = opts.oRules;
                var aPrimaryList = opts.aPrimaryList;

                //按钮控件
                $("#mmmmButton").mmButton({
                    //选显示按钮
                    btns: t.getBtns({
                        data:data
                        ,aFormData:aFormData
                        ,aFormEditData:aFormEditData
                        ,validatorFields:validatorFields
                        ,oRules:oRules
                        ,aPrimaryList:aPrimaryList
                    }),
                    //更多按钮
                    morebtns: t.getMoreButtons({
                        data:data
                        ,aFormData:aFormData
                        ,aFormEditData:aFormEditData
                        ,validatorFields:validatorFields
                        ,oRules:oRules
                        ,aPrimaryList:aPrimaryList
                    }),
                    //表格对象
                    oMetadata:t
                });
            },
            /**
             * 获取一条选中的数据
             * */
            getSelectedOneData:function () {
                var t = this;
                var aRows = t.mmg.selectedRows(); //选中的数据
                if(aRows.length==1){
                    var iRowIndex = t.mmg.selectedRowsIndex(); //返回选择行索引的数组。
                    aRows[0].iRowIndex = iRowIndex[0];
                    return aRows[0];
                }else{
                    tools.showMsg.error("请选择一条数据");
                    return false;
                }
            },
            /**
             * 表格数据编辑
             * */
            doEdit:function(opts){
                opts = opts || {};
                var t = this;
                var item = opts.item;
                var data = opts.data;
                var aFormEditData= opts.aFormEditData;
                var validatorFields = opts.validatorFields;
                var oRules = opts.oRules;

                t.mmg.deselect("all");//所有行取消选中
                t.mmg.select(item.iRowIndex);//选中行
                //如果有editTemplate数据说明是弹出详情预览修改模块
                if(data.editTemplate && !$.isEmptyObject(data.editTemplate)){
                    //详情数据弹出预览修改
                    var pageLayer = layer.load(1, {shade: [0.3,'#ffffff']}); //启用loading遮罩
                    require.async("js/modules/showEditPop",function(showEditPop){
                        layer.close(pageLayer);//关闭loading遮罩
                        t.showEditPop = new showEditPop({
                            oMetadata:t,
                            mmg: t.mmg,
                            oItem:item,  //修改的选中数据
                            oTableColumn:data //表头
                        });
                    });
                    return;
                }
                //常规修改
                for(var i= 0,len=aFormEditData.length;i<len;i++){
                    for(var j in item){
                        if(aFormEditData[i].name == j){
                            aFormEditData[i].value = item[j];
                        }
                    }
                }

                t.createFormAndDoSubmit("edit",aFormEditData,validatorFields,oRules,item.uuid);
            },

            /**
             * 获取表格上方的按钮数据
             * */
            getBtns:function(opts){
                var t = this;
                opts = opts || {};
                var data = opts.data;
                var aFormData = opts.aFormData;
                var aFormEditData = opts.aFormEditData;
                var validatorFields = opts.validatorFields;
                var oRules = opts.oRules;
                var aPrimaryList = opts.aPrimaryList;

                //按钮组，按钮组的判断，从后台的data.functionRange数组中取值，[1,2,3,4,5] 分别表示["新增","修改","删除","导入","导出"]
                var aBtns = [];
                //如果1在data.functionRange数组中，说明存在新增按钮
                if(data.functionRange && data.functionRange.length && _.indexOf(data.functionRange,1) != -1){
                    aBtns.push({btnName:"新增",btnfn:function(){
                        //如果是应用中心->应用维护页面，新增要特殊处理
                        if(t.options.infoSetId == "app_corp_menu"){
                            $("body").loading({zIndex:9999}); //启用loading
                            require.async("js/modules/editAppCorp.js",function (EditAppCorp) {
                                $("body").loading({state:false}); //取消loading
                                new EditAppCorp({oMetadata:t});
                            });
                        }else if(t.options.infoSetId == "wf_form_set_list"){  //流程设置页面
                            $("body").loading({zIndex:9999}); //启用loading
                            require.async("js/modules/addWorkflowSetting/addWorkflowSetting.js",function (addWorkflowSetting) {
                                $("body").loading({state:false}); //取消loading
                                new addWorkflowSetting({oMetadata:t});
                            });
                        }else{
                            //特殊插件的表单项处理
                            t.showEditPop = null; //清空showEditPop
                            t.createFormAndDoSubmit("add",aFormData,validatorFields,oRules);
                        }
                    },className:"flabutton add"});
                }else if(data.functionRange && data.functionRange.length && _.indexOf(data.functionRange,1) == -1){
                    aBtns.push({btnName:"新增",btnfn:function(){
                    },className:"disablebutton"});
                }

                //如果是流程--我发起的、抄送我的、待审批的页面
                if(t.options.infoSetId == "wf_process_waitaudit_list" && _.indexOf(["1","2","3","4"],t.options.read_state) != -1){
                    aBtns = [{btnName:"流程申请",btnfn:function(){
                        location.href = "#!/workflowStart";
                    },className:"flabutton workflowApply"}];
                    //已审
                    if(t.options.read_state == "1"){
                        aBtns = [{btnName:"已审流程",btnfn:function(){
                            location.href = "#!/metadata/infoSetId:wf_process_waitaudit_list&read_state:2";
                        },className:"flabutton workflowApply"}];
                    }
                }

                //如果是流程监控页面
                if(t.options.infoSetId == "wf_process_list"){
                    aBtns = [{btnName:"流程重定位",btnfn:function(){
                        if(t.getSelectedOneData()){
                            t.doWaitForAudit({
                                item:t.getSelectedOneData()
                            });
                        }
                    },className:"flabutton redirectAuditPerson"}];
                }

                return aBtns;
            },

            /**
             * 获取表格上方的更多按钮数据
             * */
            getMoreButtons:function(opts){
                var t = this;
                opts = opts || {};
                var data = opts.data;
                var aFormEditData = opts.aFormEditData;
                var validatorFields = opts.validatorFields;
                var oRules = opts.oRules;
                var aPrimaryList = opts.aPrimaryList;

                //更多按钮
                var aMoreBtns = [
                    {btnName:"修改",btnfn:function(){
                        var aRows = t.mmg.selectedRows(); //选中的数据
                        if(aRows.length==1){
                            var iRowIndex = t.mmg.selectedRowsIndex(); //返回选择行索引的数组。
                            aRows[0].iRowIndex = iRowIndex[0];
                            t.doEdit({
                                item:aRows[0]
                                ,data:data
                                ,aFormEditData:aFormEditData
                                ,validatorFields:validatorFields
                                ,oRules:oRules
                            }); //编辑数据组装
                        }else{
                            layer.msg("请选择一条需要修改的数据", {offset: 0,shift:6});
                            return false;
                        }
                    },isShow:(data.functionRange && data.functionRange.length && _.indexOf(data.functionRange,2) != -1)},
                    //删除数据
                    {btnName:"删除",btnfn: function(){
                        t.deleteTableData(t.mmg.selectedRows());
                    },isShow:(data.functionRange && data.functionRange.length && _.indexOf(data.functionRange,3) != -1)}
                ];
                //如果TableColumn有传来更多按钮，一并展示
                if(data.extBtn && data.extBtn.length){
                    var setExtBtns = function(aBtns){
                        var _arr = [];
                        for(var i=0;i<aBtns.length;i++){
                            var oBtnOpts = {
                                btnName:aBtns[i].btnName
                                ,btnfn:function(thisObj){
                                    var btnId = $(thisObj).parent().attr("data-btnid");
                                    //载入并执行对应的按钮模块功能,扩展这里请在 modules文件夹下自定创建对应模块的js文件
                                    $("body").loading({zIndex:9999});  //启用loading
                                    require.async("js/moreBtns/"+btnId+".js",function(Model){
                                        t["oBtnObj"+btnId] = new Model({aItem: t.mmg.selectedRows(),aRowIndex:t.mmg.selectedRowsIndex(),oMetaData:t,navigationData: t.oTableColumnData.navigationData});
                                        $("body").loading({state:false}); //取消loading
                                    });
                                }
                                ,icon:""
                                ,btnData:{
                                    btnId:aBtns[i].btnId,
                                    btnTemplate:aBtns[i].btnTemplate
                                }
                                ,isShow:true
                                ,children:[]
                            };
                            if(aBtns[i].childs && aBtns[i].childs.length){
                                oBtnOpts.children = setExtBtns(aBtns[i].childs);
                            }
                            _arr.push(oBtnOpts);
                        }
                        return _arr;
                    };
                    aMoreBtns = aMoreBtns.concat(setExtBtns(data.extBtn));
                }

                //如果是流程--我的发起页面
                if(t.options.infoSetId == "wf_process_waitaudit_list" && _.indexOf(["1","2","3","4"],t.options.read_state) != -1){
                    aMoreBtns = [
                        //删除数据
                        {btnName:"删除",btnfn: function(){
                            var aSelect = t.mmg.selectedRows(); //选中的条目
                            if(aSelect.length && aSelect[0]){
                                //如果选中的结果中包含审批中的数据就阻止删除
                                if(_.findIndex(aSelect,{instanc_state:"审批中"}) != -1){
                                    tools.showMsg.error("选择的流程中有包含“审批中”的流程，请重新选择");
                                    return false
                                }
                            }

                            t.deleteWaitauditData(t.mmg.selectedRows());
                        },isShow:t.options.read_state == "4"},
                        /*{btnName:"待审",btnfn:function(){
                            if(t.getSelectedOneData()){
                                t.doWaitForAudit({
                                    item:t.getSelectedOneData()
                                });
                            }
                        },isShow:true},*/
                        {btnName:"打印",btnfn:function(){
                            if(t.getSelectedOneData()){
                                require.async("js/modules/printAudit/printAudit.js",function (waitForAudit) {
                                    new waitForAudit({item:t.getSelectedOneData(),oMetadata:t});
                                });
                            }
                        },isShow:true}
                    ];
                }

                //如果是流程监控页面
                if(t.options.infoSetId == "wf_process_list"){
                    aMoreBtns = [
                        {btnName:"删除",btnfn: function(){
                            var aSelect = t.mmg.selectedRows(); //选中的条目
                            t.deleteAuditData(t.mmg.selectedRows());
                        },isShow:true},
                        {btnName:"打印",btnfn:function(){
                            if(t.getSelectedOneData()){
                                require.async("js/modules/printAudit/printAudit.js",function (waitForAudit) {
                                    new waitForAudit({item:t.getSelectedOneData(),oMetadata:t});
                                });
                            }
                        },isShow:true}
                    ];
                }

                return aMoreBtns;
            },

            /**
             * 表格请求数组组装
             * */
            markGetAllPostData:function(){
                var t = this;
                var _obj = {infoSetId: t.options.infoSetId};

                if(!$.isEmptyObject(t.queryData)){
                    //来自导航的插件的数据
                    if(t.queryData.navigationCondition || t.queryData.navigationCondition === null){
                        _obj.navigationCondition = t.queryData.navigationCondition;
                    }
                    //来自高级搜索的数据
                    if(t.queryData.searchConditionList || t.queryData.searchConditionList === null){
                        _obj.searchConditionList = t.queryData.searchConditionList;
                    }
                }

                if(t.options.infoSetId == "wf_process_waitaudit_list" && t.options.read_state){
                    _obj.customParam = {read_state:t.options.read_state};
                }

                t.oGetAllRequestData = _obj; //把getAll.do的请求数据缓存起来供导出Excel用
                return _obj;
            },
            /**
             * 设置表格的高度实时的跟浏览器的高度同步
             * */
            resizeTable:function(){
                //随着浏览器的窗口高度变化表格高度
                var iTableH = $(window).height() - $("#base_metadata_wrap").offset().top;
                $(window).unbind("resize.changeTableHeight").bind("resize.changeTableHeight",function(){
                    $("#base_metadata_list").jqGrid("setGridHeight",iTableH-60);
                    $("#base_metadata_list").jqGrid("setGridWidth",$("#base_metadata_wrap").width());
                });
            },
            /**
             * 取min与max之间的随机数
             * */
            random:function (min, max) {
                if (max == null) {
                    max = min;
                    min = 0;
                }
                return min + Math.floor(Math.random() * (max - min + 1));
            },


            /**
             * 列表数据格式化处理
             * */
            formateData:function(cellvalue, options, rowObject){
                var t = this;
                //头像的处理
                if(options.columnEditParam.name == "head_img"){
                    return t.formateHeadImg(cellvalue, options, rowObject);
                }

                //流程-- 我发起的页面的“当前节点人ID”列显示“催办”按钮
                if(t.options.infoSetId == "wf_process_waitaudit_list" && t.options.read_state=="4" && options.columnEditParam.name == "date_to"){
                    return (cellvalue?cellvalue:"") + '<a href="javascript:void(0)" title="催办" class="urgeAudit iconfont_dayoa" data-processInstancId="'+rowObject.process_instanc_id+'" style="vertical-align: middle;color: #a0a0a0;margin-left: 10px;'+(rowObject.instanc_state=='审批中'?'':'display:none;')+'">&#xe625;</a>';
                }

                //日期显示的特殊处理
                if((options.columnEditParam.name == "date_from" || options.columnEditParam.name == "date_to")){
                    return t.formateDateStr(cellvalue, options, rowObject);
                }

                //数据的格式处理 showFormat showType
                if(options.columnEditParam.showType){
                    return t.formateDataShow(cellvalue, options, rowObject);
                }

                //应用中心，应用维护的应用图标图片显示
                if(t.options.infoSetId == "app_corp_menu" && options.columnEditParam.name == "icon" && cellvalue){
                    return '<img src="'+tools.getImgPath() + "/" + cellvalue+'" style="width: 55px;height: 55px;border: 1px solid #ccc;padding: 2px;box-sizing: border-box;">';
                }

                //获取Html转义字符  先取消，到时候在根据页面特殊处理
                /*function htmlEncode( html ) {
                 return document.createElement( 'a' ).appendChild(
                 document.createTextNode( html ) ).parentNode.innerHTML;
                 };
                 if((typeof cellvalue === "string") && (cellvalue.indexOf("<") != -1 || cellvalue.indexOf(">") != -1)){
                 cellvalue = htmlEncode(cellvalue);
                 }*/
                //流程设置表单状态
                if(t.options.infoSetId == "wf_form_set_list" && options.columnEditParam.name == "form_state"){
                    return t.setFormState(cellvalue, options, rowObject);
                }

                //如果是“流程审批，流程设置，我的流程,流程监控”流程页面，流程名称可点击
                if(((t.options.infoSetId == "wf_process_waitaudit_list" && (t.options.read_state == "1" || t.options.read_state == "2" || t.options.read_state == "3" || t.options.read_state == "4")) || t.options.infoSetId == "wf_process_list")  && options.columnEditParam.name == "form_name"){
                    return "<a href='javascript:void(0)' style='color:blue;' class='workflow_audit_name' data-rowdata='"+JSON.stringify(rowObject)+"'>"+cellvalue+"</a>";
                }

                return cellvalue || "";
            },
            /**
             * 渲染表格的头像数据
             * @cellvalue 单元格的值
             * @options
             * @rowObject 行对象的某字段的值
             * */
            formateHeadImg:function(cellvalue, options, rowObject){
                var t = this;
                var aColors = ["#07a9ea","#82c188","#ab97c2","#ffb500","#59ccce"]; //蓝，绿，紫，黄，浅蓝
                var iRanDom = t.random(0,4); //随机颜色切换值
                //头像处理方案
                if(!cellvalue){
                    //从sessionStorage中读取头像颜色
                    var oHeadImgColor = tools.Cache.getCache("oHeadImgColor","session") || {};
                    var sColor = "";
                    if(!$.isEmptyObject(oHeadImgColor) && oHeadImgColor[rowObject.person_id]){
                        sColor = oHeadImgColor[rowObject.person_id];
                    }else{
                        sColor=aColors[iRanDom];
                        oHeadImgColor[rowObject.person_id] = sColor;
                        //存储用户头像颜色
                        tools.Cache.setCache("oHeadImgColor",oHeadImgColor,"session");
                    }
                    cellvalue =  '<i class="base_head_img" style="background-color: '+sColor+'">'+rowObject.person_name.substr(-2)+'</i>';
                }else{
                    cellvalue =  '<img class="base_head_img_img" src="'+ t.filePrefix +"/"+cellvalue+'" alt="'+rowObject.person_name+'" />';
                }
                return cellvalue;
            },
            /**
             * 渲染表格日期数据处理
             * @cellvalue
             * @options
             * @rowObject
             * */
            formateDateStr:function(cellvalue, options, rowObject){
                var t = this;
                //日期处理
                if(cellvalue == "1900-01-01" || cellvalue == "2099-12-31"){
                    cellvalue = "";
                }
                return cellvalue || "";
            },

            /**
             * 渲染表格数据格式处理  showType  showFormat
             * @cellvalue
             * @options
             * @rowObject
             * */
            formateDataShow:function(cellvalue, options, rowObject){
                var t = this;
                switch (options.columnEditParam.showType){
                    //如果是数值型
                    case "number":
                        if(options.columnEditParam.showFormat){
                            if(!cellvalue){
                                cellvalue = 0;
                            }
                            cellvalue = parseFloat(cellvalue).toFixed(parseInt(options.columnEditParam.showFormat));
                        }
                        break;
                    //如果没有类型，就当成是字符串处理
                    default:
                        cellvalue = cellvalue || "";

                }
                if(cellvalue !== 0){
                    cellvalue = cellvalue || "";
                }
                return cellvalue;
            },

            /**
             * 删除表格数据
             * @aSelect 当前选中的数据组
             * */
            deleteTableData:function(aSelect){
                var t = this;
                if(aSelect.length && aSelect[0]){
                    layer.confirm('请确定是要删除选中的<strong style="color: #00a2e5;font-weight: bold;">'+aSelect.length+'</strong>条数据吗？', {icon: 3, title:'提示'}, function(index){
                        var aSendData = {infoSetId:t.options.infoSetId,uuidLists:[]};

                        var aSelectdData = t.mmg.selectedRows();
                        if(aSelectdData.length){
                            for(var i=0;i<aSelectdData.length;i++){
                                aSendData.uuidLists.push(aSelectdData[i].uuid);
                            }
                        }

                        Ajax.ApiTools().del({
                            infoSetId: t.options.infoSetId,
                            data:aSendData,
                            success:function(data){
                                if(data.result == "true"){
                                    //更新导航组织树
                                    if(data.statusCode && data.statusCode == "2000"){
                                        layer.msg("删除成功，2秒后刷新页面", {offset: 0});
                                        t.quickMenuNav.updateTreeDataAndDom({isReloadMmg:true});
                                    }else{
                                        layer.msg("删除成功", {offset: 0});
                                        t.mmg.load();
                                    }
                                }else if(data.result == "false" && data.statusCode == "1000"){
                                    layer.confirm(data.resultDesc, {icon: 3, title:'提示'}, function(index1){
                                        //满足条件再次删除
                                        aSendData.customParam = {enforce:1};
                                        Ajax.ApiTools().del({
                                            infoSetId: t.options.infoSetId,
                                            data: aSendData,
                                            success: function (data) {
                                                if(data.result == "true"){
                                                    //更新导航组织树
                                                    if(data.statusCode && data.statusCode == "2000"){
                                                        layer.msg("删除成功，2秒后刷新页面", {offset: 0});
                                                        t.quickMenuNav.updateTreeDataAndDom({isReloadMmg:true});
                                                    }else{
                                                        layer.msg("删除成功", {offset: 0});
                                                        t.mmg.load();
                                                    }
                                                }
                                            }
                                        });
                                        layer.close(index1);
                                    });
                                }
                            }
                        });

                        layer.close(index);
                    });
                }else{
                    layer.msg("请先选择需要删除的数据", {offset: 0,shift:6});
                    return false;
                }
            },
            /**
             * 删除流程监控页面的数据
             * */
            deleteAuditData:function (aSelect) {
                var t = this;
                if(aSelect.length == 1){
                    layer.confirm('请确定是要删除选中的<strong style="color: #00a2e5;font-weight: bold;">'+aSelect.length+'</strong>条数据吗？', {icon: 3, title:'提示'}, function(index){
                        Ajax.ajax({
                            url:gMain.apiBasePath + "wfProcess/delProcess.do"
                            ,data:JSON.stringify({
                                process_instanc_id:String(aSelect[0].process_instanc_id)
                            })
                            ,beforeSend:function () {
                                $("body").loading();
                            }
                            ,complete:function () {
                                $("body").loading({state:false});
                            }
                            ,success: function (data) {
                                if(data.result == "true"){
                                    tools.showMsg.ok("删除成功")
                                    t.mmg.load();
                                }
                            }
                        });
                        layer.close(index);
                    });
                }else{
                    tools.showMsg.error("请只选择一条需要删除的数据");
                    return false;
                }
            },

            /**
             * 我发起的流程页面删除数据
             * */
            deleteWaitauditData:function (aSelect) {
                var t = this
                if(aSelect.length == 1){
                    layer.confirm('请确定是要删除选中的<strong style="color: #00a2e5;font-weight: bold;">'+aSelect.length+'</strong>条数据吗？', {icon: 3, title:'提示'}, function(index){
                        Ajax.ajax({
                            url:gMain.apiBasePath + "route/wf_process_list/del.do"
                            ,data:JSON.stringify({
                                uuidLists:[aSelect[0].uuid]
                                ,infoSetId:"wf_process_list"
                                ,dataList:[
                                    {key:"node_data_id",value:String(aSelect[0].node_data_id)}
                                ]
                            })
                            ,beforeSend:function () {
                                $("body").loading();
                            }
                            ,complete:function () {
                                $("body").loading({state:false});
                            }
                            ,success: function (data) {
                                if(data.result == "true"){
                                    tools.showMsg.ok("删除成功")
                                    t.mmg.load();
                                }
                            }
                        });
                        layer.close(index);
                    });
                }else{
                    tools.showMsg.error("请只选择一条需要删除的数据");
                    return false;
                }
            },

            /**
             *新增或者修改的时候遇到特殊的表单插件的处理
             *@type 类型 是修改还是新增
             *@aFormObj 要处理的表单项
             *@validatorFields 验证字段
             *@uuid 修改的时候传的uuid
             */
            createFormAndDoSubmit:function(type,aFormObj,validatorFields,oRules,uuid){
                var t = this;
                var iIndex = 0; //开始处理的表单的索引
                var _formLayer; //处理中的遮罩
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
                                Ajax.ApiTools().getKeyValueData({
                                    data:aFormObj[iIndex].keyValueBean,
                                    success:function(data){
                                        //如果是tree
                                        if(data.beans && data.beans.length){
                                            //aFormObj[iIndex].type = "treeSelect"; //控件的类型
                                            aFormObj[iIndex].treeJsonArr = data.beans; //控件的备选值
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

                                            setEditDefVal(data.beans);
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
            },
            /**
             * 保存数据
             * @saveType  add|edit 新增|修改
             * @aFormData  要生成的表单项
             * @validatorFields 待验证的字段集
             * @uuid 表的索引ID
             */
            saveData:function(saveType,aFormData,validatorFields,oRules,uuid){
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
                                    $('#myAutoForm1').find("form:first").trigger("validate"); //触发表单验证
                                    isContinueAdd = true;
                                    return false;
                                }
                            },
                            {
                                value: '保存',
                                callback: function () {
                                    saveType = "add";
                                    $('#myAutoForm1').find("form:first").trigger("validate"); //触发表单验证
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
                        if(t.showEditPop && t.showEditPop.oShowData && t.showEditPop.oShowData.isEditTemplateInsert){
                            aButtons.shift();
                        }
                    }else if(saveType =="edit"){
                        aButtons = [
                            {
                                value: '保存',
                                callback: function () {
                                    $('#myAutoForm1').find("form:first").trigger("validate"); //触发表单验证
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
                            content: '<div id="myAutoForm1" style="width:'+iWidth+'px;height: '+n*43+'px;"></div>',
                            button: aButtons
                        });
                        d.showModal();//模态弹出


                        function creatForm(){
                            //把编辑前的数据缓存起来
                            var _oOldEditData = {};
                            $("#myAutoForm1").html("");
                            var form1 = new AutoForm({
                                id:"myAutoForm1",
                                data:aFormData,
                                minHeight:50,
                                showRow:1,
                                //加载完成
                                formComplete:function($form){
                                    $form.find("[name]").each(function(){
                                        var _key = $(this).attr("name");
                                        var _value = $(this).val();
                                        //如果是checkbox表单
                                        if($(this).attr("type") == "checkbox"){
                                            if($(this).prop("checked")){
                                                _value = 1;
                                            }else{
                                                _value = 0;
                                            }
                                        }
                                        //如果是日历表单
                                        if(_value == "" && saveType == "edit"){
                                            if(_key == "date_from"){
                                                _value = "1900-01-01";
                                            }else if(_key == "date_to"){
                                                _value = "2099-12-31";
                                            }
                                        }
                                        _oOldEditData[_key] = _value;
                                    });
                                }
                            });
                            t.form1 = form1; //编辑和新增的表单
                            var $form = $('#myAutoForm1').find("form:first"); //表单

                            //表单验证
                            $form.validator({
                                theme: "yellow_right",
                                timely:0, // 保存的时候验证
                                focusCleanup:true, //聚焦时清除错误提示
                                stopOnError:true,
                                //自定义用于当前实例的消息
                                rules: oRules,
                                //待验证字段集合
                                fields: validatorFields,
                                valid:function(form) {
                                    //表单验证通过
                                    var oSubmitData = {dataList:[],infoSetId:t.options.infoSetId};
                                    //如果是修改组织管理的弹出的卡片模板 infoSeiId为固定值
                                    if(t.showEditPop && t.showEditPop.oShowData && t.showEditPop.oShowData.currentEditTpl){
                                        oSubmitData.infoSetId = t.showEditPop.oShowData.infoSetId;
                                        if(t.showEditPop.oShowData.isEditTemplateInsert){
                                            oSubmitData.isEditTemplateInsert = true; //是否是卡片类型的编辑界面提交的
                                        }
                                        oSubmitData.editCondition = t.showEditPop.oShowData.editTemplate.editCondition;
                                        if(saveType == "add"){
                                            oSubmitData.dataList.push({key: t.showEditPop.oShowData.editTemplate.editCondition.key,value: t.showEditPop.oShowData.editTemplate.editCondition.value}); //隐藏的主字段
                                        }
                                    }
                                    $form.find("[name]").each(function(){
                                        var _key = $(this).attr("name");
                                        var _value = $(this).val();
                                        //如果是checkbox表单
                                        if($(this).attr("type") == "checkbox"){
                                            if($(this).prop("checked")){
                                                _value = 1;
                                            }else{
                                                _value = 0;
                                            }
                                        }
                                        //如果是日历表单
                                        if(_value == "" && saveType == "edit"){
                                            if(_key == "date_from"){
                                                _value = "1900-01-01";
                                            }else if(_key == "date_to"){
                                                _value = "2099-12-31";
                                            }
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

                                    // 2015-5-31 11:45:00，如果是“码表”，新增、修改、删除都需要带上导航条件
                                    if(t.queryData.navigationCondition){oSubmitData.navigationCondition = t.queryData.navigationCondition;}

                                    var fnSavedata = function () {
                                        Ajax.ajax({
                                            url:gMain.apiBasePath+(saveType=="add"?"route/"+ (oSubmitData.infoSetId?oSubmitData.infoSetId:t.options.infoSetId)+"/insert.do":"route/"+ (oSubmitData.infoSetId?oSubmitData.infoSetId:t.options.infoSetId)+"/update.do"),
                                            data:JSON.stringify(oSubmitData),
                                            dataType:"json",
                                            beforeSend:function () {
                                                $("body").loading({zIndex:999999999}); //开启提交遮罩
                                            },
                                            complete:function () {
                                                $("body").loading({state:false}); //关闭提交遮罩
                                            },
                                            success:function(data){
                                                if(data.result =="true"){
                                                    layer.msg(sActionStr+"成功", {offset: 0}); //成功提示弹层

                                                    //更新导航组织树
                                                    if(data.statusCode && data.statusCode == "2000"){
                                                        t.quickMenuNav.updateTreeDataAndDom({complate:function(data){
                                                            t.oTableColumnData.navigationData = data; //更新调整组织的默认树的数据
                                                        }});
                                                    }

                                                    //更新弹出详情修改模板
                                                    if(t.showEditPop  && t.showEditPop.oShowData && !$.isEmptyObject(t.showEditPop.oShowData)){
                                                        //如果是主模板
                                                        if(t.showEditPop.oShowData.currentEditTpl == "columnCart_tpl"){
                                                            t.showEditPop.getMainTemplateData(); //自动加载主模板
                                                        }else{
                                                            //重载当前选项卡的更多模板
                                                            $("#table_edit_dialog").find(".table_edit_dialog_left_ul").find("li.on")[0].click();
                                                        }
                                                    }


                                                    t.mmg.load();//重载表格数据

                                                    if(isContinueAdd){ //如果是保存并新增
                                                        creatForm();
                                                        //如果是组织列表的新增就保存的时候刷新上级组织的表单项
                                                        if(t.form1 && t.options.infoSetId == "org_list" && t.form1.options.data.length){
                                                            for(var i=0;i<t.form1.options.data.length;i++){
                                                                //如果存在这样的一个字段，并且表单类型是下拉类型的
                                                                if(t.form1.options.data[i].name == "parent_org_id" && t.form1.options.data[i].dayhrDropSelect){
                                                                    Ajax.ApiTools().getKeyValueData({
                                                                        beforeSend:function(){
                                                                            $("#myAutoForm1").loading(); //启用遮罩
                                                                        },
                                                                        complete:function(){
                                                                            $("#myAutoForm1").loading({state:false}); //关闭遮罩
                                                                        },
                                                                        data:t.form1.options.data[i].dayhrDropSelect.options.keyValueBean,
                                                                        success:function(data){
                                                                            //如果是tree
                                                                            if(data.beans && data.beans.length){
                                                                                //选中下拉框的值为当前导航的选中节点 t.options.navigationId
                                                                                t.form1.options.data[i].dayhrDropSelect.updateTreeJson(data.beans);
                                                                                t.form1.options.data[i].dayhrDropSelect.setValue(t.options.navigationId);
                                                                            }
                                                                        }
                                                                    });
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }else{
                                                        d.close().remove(); //关闭弹层
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    fnSavedata();
                                }
                            });
                        }
                        creatForm();

                    });

                });
            },
            /**
             * 编辑表单和流程
             * */
            EditFormAndAudit:function () {
                var t = this;
                if(t.options.infoSetId == "wf_form_set_list"){
                    //调用表单设计器
                    $("#base_metadata_list").off("click.wf_form_set_list_formStyle").on("click.wf_form_set_list_formStyle",".formStyle",function (e) {
                        var _this = this;
                        $("body").loading({zIndex:9999}); //启用loading
                        require.async("js/modules/formBuild/formBuild.js",function (FormBuild) {
                            new FormBuild({oMetadata:t,editType:"edit",oFormEditData:t.mmg.row($(_this).data("rowid"))});
                        });
                        e.stopPropagation();
                    });

                    //调用流程设计器
                    $("#base_metadata_list").off("click.wf_form_set_list_auditStyle").on("click.wf_form_set_list_auditStyle",".auditStyle",function (e) {
                        var _this = this;
                        $("body").loading({zIndex:9999}); //启用loading
                        require.async("js/modules/workflowSetting/workflowSetting.js",function (WorkflowSetting) {
                            new WorkflowSetting({oMetadata:t,editType:"edit",oFormEditData:t.mmg.row($(_this).data("rowid"))});
                        });
                        e.stopPropagation();
                    });
                }else if((t.options.infoSetId == "wf_process_waitaudit_list" && (t.options.read_state == "1" || t.options.read_state == "2" || t.options.read_state == "3" || t.options.read_state == "4")) || t.options.infoSetId == "wf_process_list"){  //流程审批，查看，监控等页面

                    //催办
                    $("#base_metadata_list").off("click.wf_form_set_list_auditStyle").on("click.wf_form_set_list_auditStyle",".urgeAudit",function (e) {
                        var _this = this;
                        Ajax.ajax({
                            url:gMain.basePath + "wfProcessWaitAudit/sendImMsg.do"
                            ,data:JSON.stringify({process_instanc_id:$(_this).attr("data-processInstancId")})
                            ,beforeSend:function () {
                                $("body").loading({zIndex:999});
                            }
                            ,complete:function () {
                                $("body").loading({state:false});
                            }
                            ,success:function (data) {
                                if(data.result == "true"){
                                    tools.showMsg.ok("催办成功");
                                    t.mmg.load();
                                }
                            }
                        });
                        e.stopPropagation();
                    });

                    //流程预览、查看、并操作
                    $("#base_metadata_list").off("click.workflow_audit_name").on("click.workflow_audit_name",".workflow_audit_name",function (e) {
                        var oItem = JSON.parse($(this).attr("data-rowdata"));
                        oItem.iRowIndex = oItem._indexId;
                        t.doWaitForAudit({
                            item:oItem
                            ,oMetadata:t
                        });
                        e.stopPropagation();
                    });
                }
            },
            /**
             * 设置“流程设置”的表单状态
             * */
            setFormState:function (cellvalue, options, rowObject) {
                var t = this;
                var sVal = "";
                switch (cellvalue){
                    case "启用":
                        sVal = '<span style="">'+cellvalue+'</span>';
                        break;
                    case "禁用":
                        sVal = '<span style="color: red;">'+cellvalue+'</span>';
                        break;
                    case "未发布":
                        sVal = '<span style="color: #f0ad4c;">'+cellvalue+'</span>';
                        break;
                    default:
                        sVal = cellvalue;
                }
                return sVal;
            },
            /**
             * 调用待审模块
             * */
            doWaitForAudit:function (opts) {
                var t = this;
                opts = opts || {};
                t.mmg.deselect("all");//所有行取消选中
                t.mmg.select(opts.item.iRowIndex);//选中行
                require.async("js/modules/waitForAudit/waitForAudit.js",function (waitForAudit) {
                    new waitForAudit({item:opts.item,oMetadata:t,read_state:t.options.read_state});
                });
            }
            
            
        }
    });

    module.exports = VueComponent;

});

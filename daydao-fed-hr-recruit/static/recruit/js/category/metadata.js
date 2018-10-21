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
                t.oItemType = {
                    'recruit_resume_deal_list':"候选人",
                    'recruit_resume_position_list':"职位",
                    'recruit_resume_kanban_list':"看板"
                }
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

                            if(t.oItemType[t.options.infoSetId]){//如果有页签
                                t.createItemType(t.oItemType);
                                $("#base_table_tools").css("min-width","1000px");
                                $("#base_metadata_wrap").css("min-width","1000px");
                            }else{
                                $(".base_mmg_tabs >ul").empty().parent().hide();
                                $("#base_table_tools").css("min-width","0");
                                $("#base_metadata_wrap").css("min-width","0");
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
             * 表头页签itemtypes
             * */
            createItemType:function (oItemType) {
                var t = this;
                var aLi = [];
                var sActId = t.options.act_id?('&act_id:'+t.options.act_id):'';
                for(var i in oItemType){
                    aLi.push('<li class="'+(t.options.infoSetId == i?"current":"")+'" data-infoSetId="'+i+'"><a href="#!/metadata/infoSetId:'+ i+sActId+'">'+oItemType[i]+'</a></li>');
                }
                $(".base_mmg_tabs >ul").html(aLi.join("")).parent().show();
            },
            /**
             * 初始化导航
             * */
            initMainMenu:function(aNav){
                var t = this;
                $("#main_menu").html(aNav[aNav.length-1].title);
                document.title = aNav[aNav.length-1].title;
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

                    /*如果从职位进入候选人*/
                    if(t.options.infoSetId == "recruit_resume_deal_list"&&t.options.positionId&&t.options.positionId!=""){
                        for(var i =0;i<t.oTableColumnData.searchCondition.length;i++){
                            if(t.oTableColumnData.searchCondition[i].conditionId == "170"){/*应聘职位*/
                                t.oTableColumnData.searchCondition[i].defaultValue = t.options.positionId;
                            }
                        }
                    }

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
                                ,isListShow:item.isListShow || !!item.frozen //是否列表显示，如果是冻结的列就必显示 //是否列表显示
                                ,sortable:!!item.isSortable //是否可排序
                                ,frozen:item.frozen?true:false //是否冻结列
                            };

                            /**
                             * 列的数据的处理
                             * */
                            if(item.name =='status'&&t.options.infoSetId=='recruit_resume_deal_list') {//简历处理候选人
                                var arrColor = ["#a6a6a6","#fec000","#7dce00","#d63fdf","#ff0000"];
                                var arrWord = ["待处理","面试中","已录用","已入职","已淘汰"];
                                colObj.formatter = function (celvalue, options, rowObject) {
                                    options.colModel.title = false;
                                    return '<a href="javascript:;" data-resumeId="'+rowObject.resumeId+'" data-id="'+celvalue+'" class="deal_status" style="display:block;margin:auto;border-radius:50%;width:16px; height:16px;background:'+arrColor[celvalue-1]+'" title="'+arrWord[celvalue-1]+'"></a>';
                                };
                            }else if(item.name =='operate'&&t.options.infoSetId=='recruit_resume_lib'){
                                colObj.formatter = function (celvalue, options, rowObject) {
                                    options.colModel.title = false;
                                    var sTitle,sClass,sIcon;
                                    if(rowObject.isBlackList==0){
                                        sTitle = "加入黑名单";
                                        sClass = "recruit_resume_lib_add_black"
                                        sIcon = "&#xe657;";
                                    }else{
                                        sTitle = "解除黑名单";
                                        sClass = "recruit_resume_lib_remove_black";
                                        sIcon = "&#xe69b;";
                                    }
                                    return '<span title="应聘记录" data-id="'+rowObject.resumeId+'" class="recruit_resume_lib_record iconfont_daydao_recruit">&#xe6b0;</span><span data-id="'+rowObject.resumeId+'" title="'+sTitle+'" class="iconfont_daydao_recruit '+sClass+'">'+sIcon+'</span>';
                                };
                            }else if(item.name =='candidate_count'&&t.options.infoSetId=='recruit_resume_position_list'){
                                colObj.formatter = function (celvalue, options, rowObject) {
                                    return '<a href="#!/metadata/infoSetId:recruit_resume_deal_list&positionId:'+rowObject.pos_id+'">'+rowObject.candidate_count+'</a>';
                                };
                            }else {
                                colObj.formatter = function(cellvalue, options, rowObject){
                                    for(var j=0;j<data.columnEdit.length;j++){
                                        if(options.colModel.name == data.columnEdit[j].name){
                                            options.columnEditParam = data.columnEdit[j];
                                        }
                                    }
                                    return t.formateData(cellvalue, options, rowObject);
                                };
                            }


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


                    switch (t.options.infoSetId){
                        case "recruit_resume_deal_list":
                            var sUrl = gMain.apiBasePath + "candidate/getCandidateList.do";
                            break;
                        case "recruit_resume_lib":
                            var sUrl = gMain.apiBasePath + "resumeLib/getTalentList.do";
                            break;
                        case "recruit_resume_position_list":
                            var sUrl = gMain.apiBasePath + "resume_deal_pos/getPosLit.do";
                            break;
                        case "recruit_resume_kanban_list":
                            var sUrl = gMain.apiBasePath + "billboard/getBillboardList.do";
                            break;
                        default:
                            var sUrl = gMain.apiBasePath+"route/"+ t.options.infoSetId+"/getAll.do";
                    }


                    //初始化核心表格
                    t.baseJqGrid = $("#" + sTableId).jqGrid({
                        url: sUrl
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
                            var oItem =  $("#"+sTableId).jqGrid("getRowData",rowid);
                            oItem.iRowIndex = rowid;
                            /*暂时隐藏回收站和人才库简历查看*/
                            /*if(t.options.infoSetId == "recruit_resume_lib"||t.options.infoSetId == "recruit_resume_recycle_list"){
                                require.async("templates/resumeInfo.html",function (tpl) {
                                    if($("#main_wrap").find("#resume_info_tpl").length==0){
                                        $("#main_wrap").append(tpl);
                                    }
                                    require.async("js/modules/resumeInfo.js",function (ClassName) {
                                        new ClassName({item:oItem,oMetaData:t});
                                    });
                                });
                                return;
                            }*/
                            if(t.options.infoSetId == "recruit_resume_lib"){
                                require.async("js/moreBtns/ext_btn_add_resume.js",function (ClassName) {
                                    new ClassName({item:oItem,oMetaData: t,status:"edit"});
                                });
                                return;
                            }
                            if(t.oItemType[t.options.infoSetId]){
                                return;
                            }
                            t.doEdit({
                                item:oItem
                                ,data:data
                                ,aFormEditData:aFormEditData
                                ,validatorFields:validatorFields
                                ,oRules:oRules
                            }); //编辑数据组装

                        }
                        //数据加载完成
                        ,loadComplete:function(){
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

                            /*简历状态点击*/
                            $(".deal_status").click(function(e){
                                e.stopPropagation();
                                var sId = $(this).attr("data-id");//状态
                                var sResumeId = parseInt($(this).attr("data-resumeId"));//简历id
                                if(t.options.infoSetId =="recruit_resume_deal_list"){
                                    require.async("js/modules/resumeDeal.js",function (ClassName) {
                                        new ClassName({status:sId,opt:t,arr:[sResumeId]});
                                    });
                                    return;
                                }
                            })

                            /*人才库应聘记录*/
                            $(".recruit_resume_lib_record").click(function(e){
                                e.stopPropagation();
                                var sId = $(this).attr("data-id");//简历id
                                require.async("js/modules/resumeDeal.js",function (ClassName) {
                                    new ClassName({opt:t,arr:[sId],status:"record"});
                                });
                                return;
                            })

                            /*解除黑名单点击*/
                            $(".recruit_resume_lib_remove_black").click(function(e){
                                e.stopPropagation();
                                var sId = $(this).attr("data-id");/*简历id*/
                                require.async("js/moreBtns/ext_btn_out_blacklist.js",function(Model){
                                        t["oBtnObj" + "ext_btn_out_blacklist"] = new Model({
                                            aItem: [{resumeId:sId}],
                                            aRowIndex: t.mmg.selectedRowsIndex(),
                                            oMetaData: t,
                                            navigationData: t.oTableColumnData.navigationData
                                        });
                                });
                            })

                            /*加入黑名单点击*/
                            $(".recruit_resume_lib_add_black").click(function(e){
                                e.stopPropagation();
                                var sId = $(this).attr("data-id");/*简历id*/
                                require.async("js/moreBtns/ext_btn_to_blacklist.js",function(Model){
                                    t["oBtnObj" + "ext_btn_to_blacklist"] = new Model({
                                        aItem: [{resumeId:sId}],
                                        aRowIndex: t.mmg.selectedRowsIndex(),
                                        oMetaData: t,
                                        navigationData: t.oTableColumnData.navigationData
                                    });
                                });
                            })

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


                        //按钮控件
                        $("#mmmmButton").mmButton({
                            //选显示按钮
                            btns: t.getBtns({
                                data: data
                                , aFormData: aFormData
                                , aFormEditData: aFormEditData
                                , validatorFields: validatorFields
                                , oRules: oRules
                                , aPrimaryList: aPrimaryList
                            }),
                            //更多按钮
                            morebtns: t.getMoreButtons({
                                data: data
                                , aFormData: aFormData
                                , aFormEditData: aFormEditData
                                , validatorFields: validatorFields
                                , oRules: oRules
                                , aPrimaryList: aPrimaryList
                            }),
                            //表格对象
                            oMetadata: t
                        });
                    if(t.oItemType[t.options.infoSetId]) {
                        t.mmButtonTemplateFun(t.options.infoSetId);
                    }
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
             * 部分模板左上角显示  包括候选人、职位、看板
             * */
            mmButtonTemplateFun:function(){
                var t = this;
                switch (t.options.infoSetId) {
                    case "recruit_resume_deal_list":
                        Ajax.ApiTools().getResumeBasic({
                                data: {},
                                success: function (data) {
                                    if (data.result == "true") {
                                        $("#mmmmButton").html(template(t.options.infoSetId, data.data));
                                        $("#mmPositionTools").html(template(t.options.infoSetId+"_btn", data.data));
                                        /*简历处理基础设置淘汰模板*/
                                        $(".deal_set").on("click", function (e) {
                                            e.stopPropagation();
                                            require.async("js/modules/addDealTemplate.js", function (ClassName) {
                                                new ClassName({});
                                            });
                                        });
                                        /*简历处理快捷推荐*/
                                        $(".deal_recommend").on("click", function (e) {
                                            e.stopPropagation();
                                            t.recommendFun();//推荐职位
                                        });
                                        /*新增简历*/
                                        $(".candidate_deal_btn_wrap .candidate_oparetion_right").on("click",function (e) {
                                                $("body").loading({zIndex:9999});  //启用loading
                                                require.async("js/moreBtns/ext_btn_add_resume.js", function (Model) {
                                                    new Model({oMetaData: t, status: "add"});
                                                    $("body").loading({state: false}); //取消loading
                                                });
                                        })
                                    }
                                }
                        });
                    break;
                    case "recruit_resume_position_list":
                        Ajax.ApiTools().getPosStatistics({
                            data: {},
                            success: function (data) {
                                if (data.result == "true") {
                                    $("#mmmmButton").html(template(t.options.infoSetId, data.data));
                                    $("#mmPositionTools").html(template(t.options.infoSetId+"_btn", data.data));
                                    /*下线*/
                                    $(".pos_offline").on("click", function (e) {
                                        e.stopPropagation();
                                        require.async("js/modules/offline.js", function (ClassName) {
                                            new ClassName({opts:t.mmg});
                                        });
                                    });
                                    /*新增招聘职位*/
                                    $(".position_tpl_btn_wrap .add_position_btn").on("click",function () {
                                        require.async("js/modules/addPosition.js",function (AddPosition) {
                                            new AddPosition({oMetaData: t});
                                        });
                                        return;
                                    });
                                }
                            }
                        });
                     break;
                    case "recruit_resume_kanban_list":
                        Ajax.ApiTools().getBillboardStatistics({
                            data: {},
                            success: function (data) {
                                if (data.result == "true") {
                                    $("#mmmmButton").html(template(t.options.infoSetId, data.data));
                                    /*简历处理基础设置淘汰模板*/
                                    $(".kanban_download").on("click", function (e) {
                                        e.stopPropagation();
                                        require.async("js/modules/kanBan.js", function (ClassName) {
                                            new ClassName({opts:t.mmg,status:"download"});
                                        });
                                    });
                                    $(".kanban_email").on("click", function (e) {
                                        e.stopPropagation();
                                        require.async("js/modules/kanBan.js", function (ClassName) {
                                            new ClassName({opts:t.mmg,status:"email"});
                                        });
                                    });
                                }
                            }
                        });
                        break;
                    default:

                }

            },
            /**
             * 推荐职位公共部分
             * */
            recommendFun:function(){
                var t = this;
                $("body").loading({state: false}); //取消loading
                var aRows = t.mmg.selectedRows();
                var arrResumeId = [];//简历id数组
                for(var i = 0;i<aRows.length;i++){
                    arrResumeId.push(aRows[i].resumeId);
                }
                if(aRows.length>0) {
                    require.async("js/modules/resumeDeal.js", function (ClassName) {
                        new ClassName({status: "recommend",arr:arrResumeId,opt:t});
                    });
                }else{
                    layer.msg("请选择需要推荐职位的数据！", {offset: 0,shift:6});
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
                //如果是应用中心->应用维护页面，新增要特殊处理
                if(t.options.infoSetId == "app_corp_menu"){
                    $("body").loading({zIndex:9999}); //启用loading
                    require.async("js/modules/editAppCorp.js",function (EditAppCorp) {
                        new EditAppCorp({oMetadata:t,editType:"edit",aFormEditData:aFormEditData,validatorFields:validatorFields,oRules:oRules,uuid:item.uuid});
                    });
                }else{
                    t.createFormAndDoSubmit("edit",aFormEditData,validatorFields,oRules,item.uuid);
                }
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
                                new EditAppCorp({oMetadata:t});
                            });
                        }else{
                            //特殊插件的表单项处理
                            t.showEditPop = null; //清空showEditPop
                            t.createFormAndDoSubmit("add",aFormData,validatorFields,oRules);
                        }
                    },className:"flabutton"});
                }else if(data.functionRange && data.functionRange.length && _.indexOf(data.functionRange,1) == -1){
                    aBtns.push({btnName:"新增",btnfn:function(){
                    },className:"disablebutton"});
                    if(_.indexOf(data.functionRange,0) != -1){ //放到新增按钮位置上的自定义按钮
                        var oBtn = data.extBtn[0];
                        oBtn.className = "flabutton";
                        oBtn.btnfn = function(){
                            //载入并执行对应的按钮模块功能,扩展这里请在 modules文件夹下自定创建对应模块的js文件
                            $("body").loading({zIndex:9999});  //启用loading
                            if(oBtn.btnId == "ext_btn_recommend_pos") {//推荐职位按钮
                                t.recommendFun();
                            }else if (oBtn.btnId == "ext_btn_add_resume" && t.options.infoSetId == "recruit_resume_lib") {
                                require.async("js/moreBtns/" + oBtn.btnId + ".js", function (Model) {
                                    //新增简历
                                     new Model({oMetaData: t, status: "add"});
                                    $("body").loading({state: false}); //取消loading
                                });

                            }else{
                                require.async("js/moreBtns/" + oBtn.btnId + ".js", function (Model) {
                                    t["oBtnObj" + oBtn.btnId] = new Model({
                                        aItem: t.mmg.selectedRows(),
                                        aRowIndex: t.mmg.selectedRowsIndex(),
                                        oMetaData: t,
                                        navigationData: t.oTableColumnData.navigationData
                                    });
                                    $("body").loading({state: false}); //取消loading
                                });
                            }
                        }
                        aBtns.push(oBtn);
                    }
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
                    {btnName:"复制",btnfn:function(){
                        var aRows = t.mmg.selectedRows(); //选中的数据
                        if(aRows.length !=1){layer.msg("请选择一条记录", {offset: 0,shift:6});return false;}
                        t.copyData(aRows[0]);
                    },isShow:data.isShowCopyBtn?true:false},
                    //删除数据
                    {btnName:"删除",btnfn: function(){
                        t.deleteTableData(t.mmg.selectedRows());
                    },isShow:(data.functionRange && data.functionRange.length && _.indexOf(data.functionRange,3) != -1)},
                    //进入子信息项维护 childPageBtnName：按钮名称，childPageSetId：跳转的id
                    {btnName:data.childPageBtnName,btnfn:function(){
                        var aRows = t.mmg.selectedRows(); //选中的数据
                        if(aRows.length !=1){layer.msg("请选择一条记录", {offset: 0,shift:6});return false;}
                        if(!aRows[0][aPrimaryList[0]]){layer.msg("没找到主键字段，请联系管理员", {offset: 0,shift:6});return false;}
                        location.href = "#!/metadata/infoSetId:"+data.childPageSetId+"&navigationId:"+aRows[0][aPrimaryList[0]];
                    },isShow:data.childPageSetId?true:false},
                    {btnName:"导入",btnfn:function(){
                        t.importExcel(data.funcId);
                    },isShow:(data.functionRange && data.functionRange.length && _.indexOf(data.functionRange,4) != -1)},
                    {btnName:"导出",btnfn:function(){
                        t.exportExcel();
                    },isShow:(data.functionRange && data.functionRange.length && _.indexOf(data.functionRange,5) != -1)},
                    {btnName:"导出脚本",btnfn:function(){
                        t.exportSql();
                    },isShow:(data.functionRange && data.functionRange.length && _.indexOf(data.functionRange,6) != -1)}
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
                                    if(btnId =="ext_btn_import_resume"){//导入模板
                                        require.async("commonStaticDirectory/plugins/import/import.js", function (Import) {
                                            $("body").loading({ state: false });
                                            Ajax.ApiTools().getImportModelByFuncId({
                                                infoSetId: "resume_import_add",
                                                data: { "funcId": "HR33005", "infoSetId": "resume_import_add" },
                                                success: function (data) {
                                                    new Import({
                                                        oMetaData: t,
                                                        mmg: t.mmg,
                                                        funcId: "HR33005",
                                                        dropData: data,
                                                        exportDisabled:false,
                                                        importDisabled:false,
                                                        success:function(){
                                                            t.mmg.load();
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }else if(btnId == "ext_btn_modify_resume"){
                                        var oItem = t.mmg.selectedRows();
                                        $("body").loading({state: false}); //取消loading
                                        if(oItem.length != 1){
                                            layer.msg("请选择一条需要修改的简历", {offset: 0,shift:6});
                                            return false
                                        }else {
                                            require.async("js/moreBtns/ext_btn_add_resume.js", function (ClassName) {
                                                new ClassName({item: oItem[0], oMetaData: t, status: "edit"});
                                            });
                                        }

                                    }else {
                                        require.async("js/moreBtns/" + btnId + ".js", function (Model) {
                                            //新增简历
                                            if (btnId == "ext_btn_add_resume" && t.options.infoSetId == "recruit_resume_lib") {
                                                new Model({oMetaData: t, status: "add"});
                                            } else {
                                                t["oBtnObj" + btnId] = new Model({
                                                    aItem: t.mmg.selectedRows(),
                                                    aRowIndex: t.mmg.selectedRowsIndex(),
                                                    oMetaData: t,
                                                    navigationData: t.oTableColumnData.navigationData
                                                });
                                            }
                                            $("body").loading({state: false}); //取消loading
                                        });
                                    }
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
                    if(data.functionRange && data.functionRange.length && _.indexOf(data.functionRange,0) != -1){
                        data.extBtn = data.extBtn.slice(1);//放到新增按钮位置上的自定义按钮 从更多按钮中移除
                    }
                    aMoreBtns = aMoreBtns.concat(setExtBtns(data.extBtn));
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

                var arrInfosetId = {
                    recruit_resume_deal_list:"候选人",
                    recruit_resume_lib:"人才库",
                    recruit_resume_position_list:"职位",
                    recruit_resume_kanban_list:"看板"
                }
                if(arrInfosetId[t.options.infoSetId]){
                    _obj = {"pageBean":{"pageNo":"1","pageSize":"10"}}
                    switch (t.options.infoSetId){
                        case "recruit_resume_deal_list":
                            //简历处理候选人搜索条件
                            var arrConditionId = ["406","170","168","407","408","409"];
                            var arrWord = ["keyword","posId","statusList","educationLevel","workExperienceId","channelId"];
                            break;
                        case "recruit_resume_lib":
                            //人才库搜索条件
                            var arrConditionId = ["406","170","407","408","412"];
                            var arrWord = ["keyword","posId","educationLevel","workExperienceId","workPlace"];
                            break;
                        case "recruit_resume_position_list":
                            //简历处理职位搜索条件
                            var arrConditionId = ["410","170","409"];
                            var arrWord = ["keyword","posId","channelId"];
                            break;
                        case "recruit_resume_kanban_list":
                            //简历处理看板搜索条件
                            var arrConditionId = ["411","170","168","407","408","409"];
                            var arrWord = ["keyword","posId","statusList","educationLevel","workExperienceId","channelId"];
                            break;
                        default:
                    }

                    for(var i = 0; i<arrConditionId.length;i++){
                        var sVal = $('input[name='+arrConditionId[i]+']').val();
                        if(sVal!=""){
                            switch (arrWord[i]){
                                case "statusList":
                                    var arrVal = sVal.replace(/'/g,"").split(",");
                                    for(var j = 0;j<arrVal.length;j++){
                                        arrVal[j] = parseInt(arrVal[j]);
                                    }
                                    sVal = arrVal;
                                    break;
                                case "keyword":
                                    sVal = sVal;
                                    break;
                                case "posId":
                                    if(t.options.positionId&&t.options.positionId!=""){
                                        if(sVal!=undefined) {
                                            sVal = parseInt(sVal);
                                        }else{
                                            sVal = parseInt(t.options.positionId);
                                        }
                                    }else{
                                        sVal = parseInt(sVal);
                                    }
                                    break;
                                default:
                                    sVal = parseInt(sVal);
                            }

                            _obj[arrWord[i]] = sVal;
                        }
                    }
                }
                t.oGetAllRequestData = _obj; //把getAll.do的请求数据缓存起来供导出Excel用
                return _obj;
            },
            /**
             * 设置表格的高度实时的跟浏览器的高度同步
             * */
            resizeTable:function(){
                var t = this;
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
                if(options.columnEditParam.name == "image"){
                    return t.formateHeadImg(cellvalue, options, rowObject);
                }
                //日期显示的特殊处理
                if((options.columnEditParam.name == "date_from" || options.columnEditParam.name == "date_to")){
                    return t.formateDateStr(cellvalue, options, rowObject);
                }
                //数据的格式处理 showFormat showType
                if(options.columnEditParam.showType){
                    return t.formateDataShow(cellvalue, options, rowObject);
                }
                //简历回收站 黑名单特殊符号处理
                if(t.options.infoSetId == "recruit_resume_recycle_list"&&options.columnEditParam.name=="resume_status_id"){
                    if(cellvalue=="黑名单"){
                        return "<span style='font-size: 20px;'>★</span>";
                    }else {
                        return "";
                    }
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
                //头像处理方案
                if(!cellvalue){
                    cellvalue = '<img class="base_head_img_img" src="'+gMain.baseStaticPath+'common/images/head_default.jpg" />';
                }else{
                    cellvalue =  '<img class="base_head_img_img" src="'+ t.filePrefix +"/"+cellvalue+'" />';
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

                        // 2015-5-31 11:45:00，如果是“码表”，新增、修改、删除都需要带上导航条件
                        if(t.queryData.navigationCondition){aSendData.navigationCondition = t.queryData.navigationCondition;}
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


                //如果是新增并且infoSetId为formula_list（计算公式列表界面） 新增的模板不一样，弹出公式配置界面
                if(t.options.infoSetId == "formula_list"){
                    var tempLayer = layer.load(1, {shade: [0.3,'#ffffff']}); //启用loading遮罩
                    require.async("commonStaticDirectory/plugins/fromula/dialogFromulaEdit.js",function(DialogFromulaEdit){
                        new DialogFromulaEdit({aFormData:aFormData,infoSetId: t.options.infoSetId,oTableList:t,saveType:saveType,uuid:uuid,oLayer:tempLayer,data:{getinfoitem:{"calNumbers":"s01,s02,s03,s04,s05,s06,s07,s08,s09,s10","type":"1"},insert:{cal_rule_id:111}},isEdit:(typeof gMain.sDdh !== "undefined" && gMain.sDdh === "100000008")?true:false});
                    });
                    return false;
                }


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
                                    	//判断提交数据是否为空
                                    	if (oSubmitData.dataList.length == 0){
                                    		layer.msg("数据不能为空！", {offset: 0}); 
                                    		return;
                                    	}
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

                                    //组织范围权限新增提示
                                    if(t.options.infoSetId == 'org_permission_list'){
                                        var sName = t.form1.$form.find(".dayhr_drop_select[data-name='person_id']").find("input.dayhr_drop_select_input").val();
                                        var sOrg = t.form1.$form.find(".dayhr_drop_select[data-name='org_id']").find("input.dayhr_drop_select_input").val();
                                        layer.confirm('确定对员工<span style="color: red;">'+sName+'</span>授予“'+sOrg+'”以及下级组织的查看及管理权限吗？', {icon: 3, title:'提示'}, function(index2){
                                            fnSavedata();
                                            layer.close(index2);
                                        });
                                    }else {
                                        fnSavedata();
                                    }


                                }
                            });
                        }
                        creatForm();

                    });

                });
            },
            /**
             * 复制一条数据
             * @item 一条选中的表格数据
             * */
            copyData:function(item){
                var t = this;
                Ajax.ApiTools().copy({
                    infoSetId: t.options.infoSetId,
                    data:{infoSetId: t.options.infoSetId,uuid:item.uuid},
                    success:function(data){
                        t.mmg.load(); //重载表格
                    }
                });

            },
            /**
             * 导入Excel
             * */
            importExcel:function(funcId){
                var t = this;
                $("body").loading({zIndex:99999});
                require.async("commonStaticDirectory/plugins/import/import.js",function(Import){
                    $("body").loading({state:false});
                    Ajax.ApiTools().getImportModelByFuncId({
                        infoSetId: t.options.infoSetId,
                        data:{funcId:funcId,infoSetId: t.options.infoSetId},
                        success:function(data){
                            new Import({oMetaData:t,mmg: t.mmg,dropData:data,funcId:funcId});
                        }
                    });
                });
            },
            /**
             * 导出Excel
             * */
            exportExcel:function(){
                var t = this;

                //判断session是否过期
                Ajax.ApiTools().checkSessionTimeout({
                    success:function(data){
                        if(data.result == "true"){
                            var sInfoSetId = t.options.infoSetId;
                            var aColumnList = [];
                            var oColumnShow = tools.Cache.getCache("oColumnShow"+gMain.sDdh);

                            //如果有缓存就直接读缓存里面的
                            if(!$.isEmptyObject(oColumnShow) && !$.isEmptyObject(oColumnShow[t.options.infoSetId])){
                                for(var i in oColumnShow[t.options.infoSetId]){
                                    if(oColumnShow[t.options.infoSetId][i] == "true"){
                                        aColumnList.push(i);
                                    }
                                }
                            }else{
                                //否则读首次加载的
                                if($.isArray(t.aColModels) && t.aColModels.length){
                                    for(var i=0;i<t.aColModels.length;i++){
                                        var oItem = t.aColModels[i];
                                        if(oItem.isListShow){
                                            aColumnList.push(oItem.name);
                                        }
                                    }
                                }
                            }

                            var url = gMain.apiBasePath + "route/"+sInfoSetId+"/export.do"+ Ajax.getParamsStr(t.oGetAllRequestData)+"&columnList="+aColumnList;
                            location.href =encodeURI(url);
                        }
                    }
                });
            },
            /**
             * 导出脚本
             * */
            exportSql:function(){
                var t = this;
                var aRows = t.mmg.selectedRows(); //选中的数据
                var aUuids = [];
                if(aRows.length){
                    for(var i=0;i<aRows.length;i++){
                        aUuids.push(aRows[i].uuid);
                    }
                    var oParam = {
                        infoSetId: t.options.infoSetId
                        ,navigationCondition:t.quickMenuNav?t.quickMenuNav.selectedNodeCondition:{}
                        ,uuids:aUuids.join(",")
                    };
                    window.location.href = gMain.apiBasePath+"route/"+t.options.infoSetId+"/exportSql.do?infoSetId="+oParam.infoSetId+"&uuids="+oParam.uuids+"&navigationCondition="+JSON.stringify(oParam.navigationCondition);
                }else{
                    layer.msg("请先选择要导出的记录", {offset: 0,shift:6});
                    return false;
                }
            }
        }
    });

    module.exports = VueComponent;

});

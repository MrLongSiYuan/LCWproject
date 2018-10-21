/**
 * Created by zhangqi on 2015/6/29.
 * 弹出详情并可以修改
 */
define(function(require,exports,module){
    var template = require("commonStaticDirectory/plugins/template");
    var Ajax = require("js/ajax");
    var tools = require("commonStaticDirectory/plugins/tools");
    var ImgCropper = require("commonStaticDirectory/plugins/imgCropper/imgCropper");

    //表格控件
    require("commonStaticDirectory/plugins/mmGrid/mmGrid.css");
    require("commonStaticDirectory/plugins/mmGrid/mmGrid.js"); //表格主核心控件
    require("commonStaticDirectory/plugins/mmGrid/mmPaginator"); //表格翻页

    var showEditPop = function(){
        this.init.apply(this,arguments);
    };

    showEditPop.prototype = {
        /** 构造函数 */
        constructor: showEditPop,
        /**
         * 默认的配置
         * */
        options:{
            oMetadata:undefined,
            mmg:undefined,
            oItem:undefined,  //修改的选中数据
            oTableColumn:undefined //表头
        },
        /**
         * 初始化函数
         * @options {参数对象}
         * */
        init:function(options){
            var t = this;
            this.options = $.extend({},this.options,options); //合并配置参数
            this.initDialog(options.oItem,options.oTableColumn);
            t.infoSetId = t.options.oMetadata.options.infoSetId;
        },
        /**
         * 初始化弹出
         * */
        initDialog:function(oItem,oTableColumn){
            var t = this;
            t.initOShowData(oItem,oTableColumn); //初始化oShowData
            var iRowIndex = oItem.iRowIndex; //当前行的索引

            var goToRow =  function(type){
                if(type=="prev"){
                    iRowIndex--;
                    if(iRowIndex < 1){
                        iRowIndex = 1;
                        layer.msg("已经是当前页的第一条", {offset: 0,shift:6});
                        return false;
                    }
                }else if(type=="next"){
                    iRowIndex++;
                    if(iRowIndex >= t.options.mmg.rowsLength()+1){
                        iRowIndex = t.options.mmg.rowsLength();
                        layer.msg("已经是当前页的最后一条", {offset: 0,shift:6});
                        return false;
                    }
                }
                var oNewItem = t.options.mmg.row(iRowIndex);
                oNewItem.iRowIndex = iRowIndex;
                t.options.oItem = oNewItem; //更新传过来的oItem的值
                t.initOShowData(oNewItem,oTableColumn); //再次初始化更新oShowData
                var _iIndex = $("#table_edit_dialog").find(".table_edit_dialog_left_ul").find("li.on").index(); //记录当前选中的事第几个左侧菜单,渲染模板之后执行
                //更新数据并重新绑定事件
                $(".ui-dialog-content").html(template('table_edit_dialog_tpl',t.oShowData));
                t.bindShowEditPopEvent(_iIndex); //绑定事件
                t.options.mmg.deselect("all");//所有行取消选中
                t.options.mmg.select(iRowIndex);//选中行
                return false;
            }
            require.async("commonStaticDirectory/plugins/artDialog/dialog-plus",function(){
                var d = dialog({
                    //id:"table_edit_dialog_tpl",
                    skin: 'base_artdialog_blue',
                    //fixed: true,
                    title: "<div class='table_edit_dialog_title_left'><span class='icon iconfont_dayhr_base'>&#xe603;</span>详情</div>",
                    onclose: function () {
                        //t.mmg.load(); //关闭后重载表格数据
                    },
                    content: template('table_edit_dialog_tpl',t.oShowData)
                });
                d.showModal();
                //弹窗按钮组的点击事件，上一个、下一个、关闭按钮
                $(".base_artdialog_blue").on("click","input.dialog-edit-pop-btn",function(){
                    var sAction = $(this).attr("data-action");
                    if(sAction == "prev"){
                        return goToRow("prev");
                    }else if(sAction == "next"){
                        return goToRow("next");
                    }else if(sAction == "close"){
                        d.close().remove();
                    }
                });
                t.bindShowEditPopEvent();
            });
        },
        /**
         * 首次给oShowData赋值
         * */
        initOShowData:function(oItem,oTableColumn){
            var t = this;
            t.oShowData = {uuid:oItem.uuid}; //显示的数据
            //主模板数据
            t.oShowData.editTemplate= {aData:[],editConditionKey:undefined,editCondition:{}}; //模板左侧菜单

            //遍历模板菜单
            if(!$.isEmptyObject(oTableColumn.editTemplate)){
                if(!oTableColumn.editTemplate.editConditionKey){
                    throw new Error("getTableColumn.do的editTemplate.editConditionKey为空");
                }
                t.oShowData.editTemplate.editConditionKey = oTableColumn.editTemplate.editConditionKey;
                t.oShowData.editTemplate.mainTemplateId = oTableColumn.editTemplate.mainTemplateId; //主模板id
                //如果有附加模板
                if(oTableColumn.editTemplate.tabNames && oTableColumn.editTemplate.tabNames.length){
                    for(var i=0;i<oTableColumn.editTemplate.tabNames.length;i++){
                        t.oShowData.editTemplate.aData.push({
                            tabName:oTableColumn.editTemplate.tabNames[i]
                            ,templateId:oTableColumn.editTemplate.templateIds[i]
                            ,templateName:oTableColumn.editTemplate.templateNames[i]
                            ,chooseIds:oTableColumn.editTemplate.chooseIds[i]
                            ,reporturls:oTableColumn.editTemplate.reportURLs[i]
                            ,formIds:oTableColumn.editTemplate.formIds[i]
                        });
                    }
                }
            }

            //拼接editCondition
            for(var i in oItem){
                if(i == t.oShowData.editTemplate.editConditionKey){
                    t.oShowData.editTemplate.editCondition = {key:i,value:oItem[i]};
                }
            }
        },
        /**
         * 绑定弹出事件
         * @iIndex 自动初始化第几个左侧菜单的内容
         * */
        bindShowEditPopEvent:function(iIndex){
            iIndex = iIndex || 0;
            var t = this;
            // 选项卡切换
            /*require.async("commonStaticDirectory/plugins/jquery.SuperSlide",function(){
                $("#table_edit_dialog").slide({mainCell:".bd > ul",trigger:"click",delayTime:500,easing:"easeOutExpo"});
            });*/
            $("#table_edit_dialog").off("click.slide",".table_edit_dialog_left_li").on("click.slide",".table_edit_dialog_left_li",function(){
                var _index = $(this).index();
                $(this).addClass("on").siblings().removeClass("on");
                $("#table_edit_dialog").find(".table_edit_dialog_right_li").eq(_index).show().siblings().hide();
            });

            $(".table_edit_dialog_left_ul").on("click","li",function(){
                var _index = $(this).index();
                t.getTemplateData(_index,$(this).attr("data-templateid"),function(){
                    t.showEditOrDelBtn();
                    //职位评估,如果职位评估模块被渲染进页面了
                    if($("#base_pop_pos_ipe").length){
                        t.initJobIpe();
                    }
                });
            });
            //加载主模板
            t.getMainTemplateData();

            //自动加载第一个附加模板(如果有权限)
            setTimeout(function(){
                $(".table_edit_dialog_left_ul >li").length && $(".table_edit_dialog_left_ul >li").eq(iIndex)[0].click();
            },200);

            //修改数据的事件绑定
            $("#table_edit_dialog").on("click",".edit",function(){
                var $parent = $(this).parent().parent(".base_template_edit_wrap");
                //修改表单模板
                if($parent.attr("data-tpl-id") == "biaodan_tpl"){
                    //修改表格模板
                    t.editFormTpl({
                        ele:$parent
                        ,formId:$parent.attr("data-formid")
                    });
                }else{
                    t.showEditPop_Edit(this);
                }
            });

            // 员工报表时间绑定
            $("#table_edit_dialog").on("click",".person_table_report",function(){
                /*if($(this).parents("dl.base_table_edit_rows").find("#mmpager-org_person_tab").is(":hidden")){
                    layer.msg("该组织下暂无数据", {offset: 0,shift:6});
                }*/
                var pageLayer = layer.load(1, {shade: [0.3,'#ffffff']}); //启用loading遮罩
                require.async("js/modules/personReport",function(PersonReport){
                    layer.close(pageLayer);//关闭loading遮罩
                    new PersonReport({
                        conditionId:t.oShowData.editTemplate.editCondition.value,
                        routeReportId: t.infoSetId
                    });
                });
            });

            //新增点击绑定
            $("#table_edit_dialog").on("click",".add",function(){
                t.showEditPop_Add(this);
            });
            //删除绑定
            $("#table_edit_dialog").on("click",".delete",function(){
                t.showEditPop_Delete(this);
            });
            //绑定头像上传事件
            $("#table_edit_dialog").on("click",".base_person_img_edit",function(){
                new ImgCropper({
                     fileFormName:"headImg"
                    ,url:gMain.basePath+'person/uploadPersonHeadImg.do'
                    ,params:{personId:t.oShowData.editTemplate.editCondition.value}
                    ,callback:function(data){
                        if(data.success){
                            var $div = $("#table_edit_dialog").find(".base_person_img");
                            if(!$div.find(">img").length){
                                $div.prepend('<img src="'+data.avatarUrls+'" />');
                            }else{
                                $div.find(">img").attr("src",data.avatarUrls);
                            }
                            t.options.mmg.load();
                            layer.msg("保存成功", {offset: 0});
                        }else{
                            layer.msg("上传失败，请重试", {offset: 0,shift:6});
                        }
                    }
                });
            });
            //绑定保存按钮事件
            $("#table_edit_dialog").on("click","a.save",function(){
                var $parent = $(this).parent().parent(".base_template_edit_wrap");
                //表单模型模板提交
                if($parent.attr("data-formid") && $parent.attr("data-formid") != "null"){
                    t.saveFormTplData({
                        ele:$parent
                    }); //保存表单模型数据
                }
            });
        },
        /**
         * 加载主模板数据
         * */
        getMainTemplateData:function(){
            var t = this;
            var oSendObj = {infoSetId:$(".table_edit_dialog_left_ul").attr("data-maintemplateid"),editCondition:t.oShowData.editTemplate.editCondition};
            Ajax.ApiTools().getEditDataAndColumn({
                infoSetId: oSendObj.infoSetId,
                data:oSendObj,
                beforeSend:function(){
                    $("#table_edit_dialog").loading({opacity:0.2}); //启用loading遮罩
                },
                complete:function(){
                    $("#table_edit_dialog").loading({state:false});//关闭loading遮罩
                },
                success:function(data) {
                    //主模板处理
                    if (data.beans && data.beans.length && !$.isEmptyObject(data.beans[0]) && data.beans[0].columnEdit.length) {
                        t.oShowData.Main = {
                            content: "" //语句数据
                            , title: "" //语句模式的标题
                            , list: [] //卡片数据
                            , columnEdit: [] //主模板的表头数据
                            , head_img: undefined //头像
                            , has_head_img: false //是否是有头像的模式
                            , filePrefix: t.options.oMetadata.filePrefix //图像路径
                        }; //主模板
                        t.oShowData.Main.columnEdit = data.beans[0].columnEdit; //主模板的表头数据
                        if (data.beans[0].showMode == "2" || data.beans[0].showMode == "1") { //如果是语句式的,或者是卡片式的
                            t.oShowData.Main.showMode = data.beans[0].showMode;
                            if (data.beans[0].expression && data.beans[0].expression.length) {
                                var _arr = data.beans[0].expression[0].split("<br/>");
                                t.oShowData.Main.title = _arr[0];
                                _arr.shift();
                                t.oShowData.Main.content = _arr.join("<br/>");
                            }
                            //语句模式和卡片模式的编辑数据
                            for (var i = 0; i < data.beans[0].columnEdit.length; i++) {
                                var itemI = data.beans[0].columnEdit[i];
                                //遍历主模板的值
                                for (var j in data.beans[0].data[0]) {
                                    var itemJ = data.beans[0].data[0][j];
                                    if (j == itemI.name) {
                                        //对主模板的特殊日期进行空格处理
                                        if(j == "date_from" || j == "date_to"){
                                            if(itemJ == "1900-01-01" || itemJ =="2099-12-31"){
                                                itemJ = "";
                                            }
                                        }
                                        data.beans[0].columnEdit[i].value = itemJ;
                                        if(!data.beans[0].columnEdit[i].isHidden){ //只有配置了isHidden才显示
                                            t.oShowData.Main.list.push({
                                                key: itemI.name,
                                                title: itemI.title,
                                                value: itemJ
                                            });
                                        }
                                    }
                                    //如果有头像传过来
                                    if (itemI.name == "head_img" && j == itemI.name) {
                                        t.oShowData.Main.has_head_img = true; //有头像的模式
                                        if (itemJ) {
                                            t.oShowData.Main.head_img = itemJ; //头像的值（url）
                                        } else {
                                            t.oShowData.Main.person_name = data.beans[0].data[0]["person_name"]; //如果头像的值为空就显示person_name
                                            var oHeadImgColor = tools.Cache.getCache("oHeadImgColor","session");
                                            if(oHeadImgColor && oHeadImgColor[t.oShowData.editTemplate.editCondition.value]){
                                                t.oShowData.Main.head_img_color = oHeadImgColor[t.oShowData.editTemplate.editCondition.value]; //如果头像的值为空就显示person_name
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        $(".table_person_info").html(template('columnCart_tpl', t.oShowData));
                        //主模板是否可编辑
                        if(data.beans[0].isEditAble){
                            $(".table_person_info").attr("data-iseditable","true");
                        }else{
                            $(".table_person_info").attr("data-iseditable","false");
                        }

                        if(data.beans[0].data && data.beans[0].data[0] && data.beans[0].data[0].uuid){
                            sessionStorage.setItem("sMetadataSelectedUuid",data.beans[0].data[0].uuid); //先存起来在加载表格数据完成的时候在让其自动选中
                        }

                        //console.log(t.options.mmg.selet(t.options.mmg.selectedRowsIndex()));
                    }
                }
            });
        },
        /**
         *加载对应模板的详细数据
         *@index 第几个选项卡
         *@tplIds 模板的id
        */
        getTemplateData:function(index,tplIds,callback){
            var t = this;
            var $li = $(".table_edit_dialog_left_ul").find("li").eq(index);
            var aTemplateName = $li.attr("data-templatename").split(","); //模板的标题集
            var aTemplateId = $li.attr("data-templateid").split(","); //模板的id集
            var aChooseids = $li.attr("data-chooseids").split(","); //表格列表模板类型的id集
            var aReportUrls = $li.attr("data-reporturls") ?$li.attr("data-reporturls").split(","):[]; // 表格列模板表头报表操作的标识
            var aFormIds = $li.attr("data-formIds")?$li.attr("data-formIds").split(","):[];  //表单模板的标示
            var oSendObj = {infoSetId:tplIds,editCondition:t.oShowData.editTemplate.editCondition};

            Ajax.ApiTools().getEditDataAndColumn({
                infoSetId: oSendObj.infoSetId,
                beforeSend:function(){
                    $("#table_edit_dialog").parent(".ui-dialog-content").loading({opacity:0.1});
                },
                complete:function(){
                    $("#table_edit_dialog").parent(".ui-dialog-content").loading({state:false});
                },
                data:oSendObj,
                success:function(data){
                    //附加模板的数据包含卡片模式，语句模式以及表格模式的空骨架
                    if(data.beans.length) {
                        t.oShowData.tplList = []; //附加模板的数据
                        for (var x = 0; x < data.beans.length; x++) {
                            var itemX = data.beans[x];
                            var aColumnEditData = []; //卡片字段集
                            var aColumnFormData = []; //表单模式的字段集
                            var sKapianUuid = ""; //卡片的uuid
                            var aExpressionData = []; //语句数据结构
                            if(itemX.columnEdit.length){
                                //0:表格列表模式，1：卡片模式，2：语句模式，3：表单模式，4：表格列表新增模式，5：自定义模式（职位评估模块）,3、4、5要被废弃掉
                                if(itemX.showMode == "1" || itemX.showMode == "2" || itemX.showMode == "3"  || itemX.showMode == "4"){
                                    for(var i=0;i<itemX.columnEdit.length;i++){
                                        //如果卡片有数据,就把value值设置上，否则设置为空
                                        if(itemX.data.length && !$.isEmptyObject(itemX.data[0])){
                                            //卡片模板只需要遍历第一个data
                                            itemX.columnEdit[i].value = itemX.data[0][itemX.columnEdit[i].name];
                                            sKapianUuid = itemX.data[0]["uuid"];
                                            aColumnEditData.push(itemX.columnEdit[i]); //卡片模式
                                            aColumnFormData.push(itemX.columnEdit[i]); //表单模式
                                        }else{ //如果没有数据
                                            itemX.columnEdit[i].value = "";
                                            aColumnEditData.push(itemX.columnEdit[i]); //卡片模式
                                            aColumnFormData.push(itemX.columnEdit[i]); //表单模式
                                        }

                                    }
                                    //语句模式的数据处理
                                    if(itemX.data.length && itemX.expression && itemX.expression.length){
                                        for(var j=0;j<itemX.data.length;j++){
                                            aExpressionData.push({
                                                uuid:itemX.data[j].uuid,
                                                data:itemX.data[j], //值的对象
                                                expression:itemX.expression[j] //语句拼接的字符串
                                            });
                                        }
                                    }
                                }
                            }

                            //aColumnEditData的所有字段中字段为editCondition的key的字段不展示在页面中，并且编辑的时候保存该字段的值传editCondition的value
                            if(aColumnEditData.length){
                                for(var i=0;i<aColumnEditData.length;i++){
                                    if(aColumnEditData[i].name == t.oShowData.editTemplate.editCondition.key){
                                        aColumnEditData[i].type = "hidden";
                                        aColumnEditData[i].value = t.oShowData.editTemplate.editCondition.value;
                                    }
                                }
                            }

                            //除了主模板，更多模板的数据集
                            t.oShowData.tplList.push({
                                showMode:itemX.showMode
                                ,aExpressionData:aExpressionData
                                ,title:aTemplateName[x]
                                ,uuid:sKapianUuid || "" //卡片的uuid
                                ,templateId:aTemplateId[x]
                                ,aColumnEditData:aColumnEditData  //表单数据展示，卡片，语句，表单模式公共表数据
                                ,aColumnFormData:aColumnFormData //表单模式
                                ,chooseid:aChooseids[x]  //用于判断在编辑的时候是否弹出选择岗位的弹出控件
                                ,isEditTemplateInsert:(!itemX.data || itemX.data.length == 0 || !sKapianUuid)?true:false //是否是卡片空白修改模式，后端要特殊处理，相当于新增
                                ,specialTabType:itemX.specialTabType //是否是文件上传列表,1:附件列表页签；2：IPE页签
                                ,specialTabParam:itemX.specialTabParam  //表格列表模式的getAll的时候用到
                                ,reporturl:aReportUrls.length?aReportUrls[x]:""
                                ,formId:aFormIds.length?aFormIds[x]:""
                                ,isEditAble:itemX.isEditAble?"true":"false"   //是否显示新增，编辑，删除按钮
                            });
                        }


                        //把得到的数据渲染到对应的右边的li容器中
                        $(".table_edit_dialog_right_li").eq(index).html(template('columnCart_more_tpl',t.oShowData));

                        //表格模板处理
                        //以上程序是先要初始化好卡片模板及数据和表格模板的骨架，所以下面对表格模板再次遍历并初始化表格模板的具体数据
                        for(var x=0;x<data.beans.length;x++){
                            var itemX = data.beans[x];
                            //"0"表示表格列表模式、表格列表带新增按钮模式
                            if(itemX.showMode == "0" || itemX.showMode == "4"){
                                var aCols =[{ title:'操作', name:'' ,width:50, align:'center', lockWidth:true, lockDisplay: true, renderer: function(val){
                                    return '<a class="iconfont_dayhr_base base_table_rows_data_biaoge_delete" title="删除" style="color: #666666;font-size: 15px;" href="javascript:void(0);">&#xe613;</a>'
                                }}]; //表头

                                //如果chooseid为null并且为表格模式的情况下，不显示编辑按钮和删除按钮
                                if(aChooseids[x] == "null"){
                                    aCols = [];
                                }
                                //如果是附件上传列表
                                if(itemX.specialTabType && itemX.specialTabType == "1"){
                                    aCols = [{ title:'操作', name:'' ,width:50, align:'center', lockWidth:true, lockDisplay: true, renderer: function(val){
                                        var _html = '<a class="iconfont_dayhr_base base_table_rows_data_biaoge_delete" title="删除" style="color: #666666;font-size: 15px;" href="javascript:void(0);">&#xe613;</a>' +
                                            ' <a class="iconfont_dayhr_base base_table_rows_data_biaoge_download" title="下载" style="color: #666666;font-size: 15px;" href="javascript:void(0);">&#xe605;</a>';
                                        return _html;
                                    }}];
                                }

                                //如果是表格列表新增模式
                                if(itemX.showMode == "4"){
                                    aCols = [{ title:'操作', name:'' ,width:50, align:'center', lockWidth:true, lockDisplay: true, renderer: function(val){
                                        var _html = '<a class="iconfont_dayhr_base base_table_rows_data_biaoge_delete" title="删除" style="color: #666666;font-size: 15px;" href="javascript:void(0);">&#xe613;</a>';
                                        return _html;
                                    }}];
                                }

                                //附件的路径前缀
                                var sFilePrefix = itemX.filePrefix || "";

                                if(itemX.columnEdit.length){
                                    for(var i=0;i<itemX.columnEdit.length;i++){
                                        var item = itemX.columnEdit[i];
                                        var colObj = {title:item.title,name:item.name,align:item.align,width:item.width,isLogicPrimaryKey:item.isLogicPrimaryKey,hidden:!item.isListShow,renderer:function(val,item,rowIndex,name){
                                            var _html = "";
                                            if(name == "file_size"){
                                                _html =  t.formatSize(val);
                                            }else if(name == "file_real_name"){ //如果是文件名
                                                _html = '<i class="base_file_name" style="font-style:normal;" data-url="'+item.file_url+'">'+val+'</i>';
                                            }else{
                                                _html = val;
                                            }
                                            return _html;
                                        }};
                                        aCols.push(colObj);
                                    }

                                    //如果只有一个表格控件的时候直接把表格高度增高到底部
                                    var _iTableHeiht = "150px";
                                    if(t.oShowData.tplList.length ==1 && t.oShowData.tplList[0].showMode == 0){
                                        _iTableHeiht = "235px"
                                    }

                                    t["mmg"+aTemplateId[x]] = $('#mmg-'+aTemplateId[x]).mmGrid({
                                        width:"auto"
                                        , height:_iTableHeiht
                                        , cols: aCols
                                        , fullWidthRows: true
                                        , url: gMain.apiBasePath+"route/"+ aTemplateId[x]+"/getAll.do"
                                        , autoLoad: true
                                        , showBackboard:false //不显示背板表头过滤
                                        , plugins: [
                                            //翻页控件
                                            $('#mmpager-'+aTemplateId[x]).mmPaginator({isShowLimitList:false,isShowPageGoto:false,isShowSelectLimit:true})
                                        ]
                                        , params: function(mmg){
                                            //如果这里有验证，在验证失败时返回false则不执行AJAX查询。
                                            var oGetAllSendData = {infoSetId: mmg.$body.data("templateId"),editCondition: $.extend(true,{},t.oShowData.editTemplate.editCondition)};
                                            //如果表格列表是附件列表类型,参数改变 ，specialTabType 1:附件列表页签；2：IPE页签
                                            if(mmg.$body.data("specialTabType") =="1"){
                                                oGetAllSendData.editCondition.key = "code_id";
                                                oGetAllSendData.navigationCondition = {key:"code_set_id",value:mmg.$body.data("specialTabParam")};
                                            }
                                            return oGetAllSendData;
                                        }
                                    }).data("templateId",aTemplateId[x]);
                                    //如果表格列表是附件列表类型
                                    if(itemX.specialTabType && itemX.specialTabType == "1"){
                                        $('#mmg-'+aTemplateId[x]).data("specialTabParam",itemX.specialTabParam).data("specialTabType","1");
                                    }

                                    t["mmg"+aTemplateId[x]].on('cellSelected',function(e, item, rowIndex, colIndex){
                                        var _templateId = $(e.target).parents(".base_table_edit_rows").attr("data-templateid");
                                        //删除
                                        if($(e.target).is('.base_table_rows_data_biaoge_delete')){
                                            layer.confirm('你确定要删除该行记录吗?', {icon: 3, title:'提示'}, function(index){
                                                e.stopPropagation(); //阻止事件冒泡
                                                Ajax.ApiTools().del({
                                                    infoSetId: _templateId,
                                                    data:{
                                                        infoSetId: _templateId,editCondition:t.oShowData.editTemplate.editCondition,uuidLists:[item.uuid]
                                                    },
                                                    success:function(data){
                                                        if(data.result == "true"){
                                                            layer.msg("删除成功", {offset: 0});
                                                            t["mmg"+_templateId].load();
                                                        }
                                                    }
                                                });
                                                layer.close(index);
                                            });
                                        }
                                        //下载附件
                                        if($(e.target).is('.base_table_rows_data_biaoge_download')){
                                            var _url = gMain.apiBasePath+'route/'+_templateId+'/downfilelog.do?fileName='+item.file_url+'&fileRealName='+item.file_real_name;
                                            //var _url = gMain.basePath+'route/'+_templateId+'/downfilelog.do?fileName='+item.file_url+'&fileRealName=QQ图片20150408181147.jpg';
                                            window.location.href = _url;
                                        }
                                    });

                                    //附件列表的鼠标移动预览图片
                                    $("#table_edit_dialog").off("mouseover").on("mouseover",".base_file_name",function(event){
                                        var sName = $(this).text();
                                        var patt1 = new RegExp("([a-zA-Z0-9_]+)(.GIF|.JPG|.JPEG|.PNG|.BMP)","i");
                                        var result = patt1.test(sName);
                                        if(result){
                                           var _url = sFilePrefix + "/" + $(this).attr('data-url');
                                           var x = event.clientX + 50;
                                           var y = event.clientY - 50;
                                           var _imgHtml = '<img id="base_file_name_img" style="width:180px; height:auto; position:absolute; top:'+y+'px; left:'+x+'px; z-index: 9999;border: 1px solid #ccc;padding: 2px;background-color: #fff;" src="'+_url+'">';
                                           $('body').append(_imgHtml);
                                        }
                                    }).off("mouseout").on("mouseout",".base_file_name",function(){
                                        if($('#base_file_name_img')){
                                            $('#base_file_name_img').remove();
                                        }
                                    });
                                }
                            }
                        }
                    }

                    typeof callback == "function" && callback();
                }
            });
        },
        /**
         * 预览窗的公共修改方法
         * @objThis 当前被点击的对象
         * */
        showEditPop_Edit:function(objThis){
            var t = this;
            var $parent = $(objThis).parents(".base_template_edit_wrap");
            var sTplId = $parent.attr("data-tpl-id"); //如：columnCart（主模板）
            var sChooseid = $parent.attr("data-chooseid"); //判断弹出控件的类型是否是选择组织岗位型
            var sTemplateId = $parent.attr("data-templateid"); //后端模板id

            //弹出选择岗位控件
            if(sTplId == "biaoge_tpl"){
                if(sChooseid && sChooseid != "null"){
                    require.async("commonStaticDirectory/plugins/chooseOrg/chooseOrg",function(chooseOrg){
                        new chooseOrg({
                            infoSetId:$parent.attr("data-chooseid"),
                            editCondition:t.oShowData.editTemplate.editCondition,
                            //选择成功后的回调
                            callback:function(){
                                $("#table_edit_dialog").find(".table_edit_dialog_left_ul").find("li.on")[0].click();
                            }
                        });
                    });
                }
            }else if(sTplId == "kapian_tpl"){  //卡片类型的修改
                var aData = [];
              /*  var aFormData = [];*/
                var sUuid = $parent.attr("data-uuid");
                var isEditTemplateInsert = false; //是否是卡片空白修改模式，后端要特殊处理，相当于新增
                //找到卡片的表头数据集
                $.each(t.oShowData.tplList,function(i,itemTpl){
                    if(itemTpl.templateId == sTemplateId){
                        aData = itemTpl.aColumnEditData;
                        isEditTemplateInsert = itemTpl.isEditTemplateInsert;
                    }
                });

                t.editFormDataCreate({
                    saveType:"edit",
                    aData:aData,
                    sTplId:sTplId,
                    isEditTemplateInsert:isEditTemplateInsert, //是否是卡片空白修改模式，后端要特殊处理，相当于新增
                    sTemplateId:sTemplateId,
                    sUuid:sUuid
                });
            }else if(sTplId == "yuju_tpl"){
                //如果是语句模式
                var aData = []; //表头数据
                /*var aFormData = [];*/
                var sUuid = $parent.attr("data-uuid");
                var oData = {}; //表头数据对应的值
                //找到语句的表头数据集
                $.each(t.oShowData.tplList,function(i,itemTpl){
                    if(itemTpl.templateId == sTemplateId){
                        aData = itemTpl.aColumnEditData;
                        //找到语句的值
                        $.each(itemTpl.aExpressionData,function(j,itemExp){
                            if(itemExp.uuid == sUuid){
                                oData = itemExp.data;
                            }
                        });
                    }
                });

                t.editFormDataCreate({
                    saveType:"edit",
                    aData:aData,
                    oData:oData,
                    sTplId:sTplId,
                    sTemplateId:sTemplateId,
                    sUuid:sUuid
                });
            }else{ //主模板
                var aData = t.oShowData.Main.columnEdit; //跟表头数据集的类型差不多

                t.editFormDataCreate({
                    saveType:"edit",
                    aData:aData,
                    sTplId:sTplId,
                    sTemplateId:sTemplateId,
                    sUuid:t.oShowData.uuid
                });
            }
        },
        /**
         * 创建表单
         * @opts {参数对象}
         * @opts.saveType 保存类型
         * @opts.aData 表头数据组，创建表单用
         * @opts.oData 填充表单数据用
         * */
        editFormDataCreate:function(opts){
            var t = this;
            opts = opts ||{};
            var aFormData = [];
            var saveType = opts.saveType;
            var aData = opts.aData;
            var oData = opts.oData;
            var sTplId = opts.sTplId;
            var sTemplateId = opts.sTemplateId;
            var sUuid = opts.sUuid;
            var isEditTemplateInsert = opts.isEditTemplateInsert; //卡片专用
            var validatorFields ={}; //待验证的字段集
            var oRules = {}; //验证规则
            for(var i=0;i<aData.length;i++){
                var item = aData[i];
                var oFormData = {};
                if(item.isEditShow){
                    if (saveType == "edit") {
                        oFormData = {
                            name: item.name
                            , label: item.title
                            , type: item.cellType || "text" //用于判断是什么类型的表单，默认为文本框
                            , isEdit: (!item.isEdit || item.isParentField) ? false : true  //如果不可编辑为true或者说是父表字段就不可修改，此字段仅作为判断是否可编辑用，不做自动表单插件用
                            , isLogicPrimaryKey: item.isLogicPrimaryKey  //是否是逻辑主键
                            , keyValueBean: item.keyValueBean  //用来判断该字段的表单项是否是异步获取数据做下拉菜单用
                            , isParentField: item.isParentField //是否是父表字段，非autoForm必传
                            , isEditShow: item.isEditShow //如果是编辑的时候，只有isEditShow为true的时候才显示
                            , isMust: item.isMust //是否必填样式
                            , maxlength: item.fieldSize //显示文本框的长度
                            ,align:item.alignX //显示位置
                        };
                        //设置编辑时候的值
                        if(oData && !$.isEmptyObject(oData)){
                            oFormData.value = oData[item.name];
                        }else{
                            oFormData.value = item.value;
                        }
                    } else if (saveType == "add") {
                        oFormData = {
                            name: item.name
                            , label: item.title
                            , isEdit: item.isParentField ? false : true //如果是父表字段就禁用修改
                            , type: item.cellType || "text" //用于判断是什么类型的表单，默认为文本框
                            , keyValueBean: item.keyValueBean  //用来判断该字段的表单项是否是异步获取数据做下拉菜单用
                            , isParentField: item.isParentField //是否是父表字段，非autoForm必传
                            , isEditDefaultKey: item.isEditDefaultKey  //是否是默认编辑字段，如果是的话，用户设置导航的选中值
                            , isMust: item.isMust //是否必填样式
                            , maxlength: item.fieldSize //显示文本框的长度
                            , value: item.defaultAddVal || ""
                            ,align:item.alignX //显示位置
                        };
                    }

                    //如果是编辑的时候，只有isEditShow为true的时候才显示
                    if(saveType =="edit"){
                        if(sTplId == "kapian_tpl"){
                            oFormData.value = oFormData.value || item.defaultAddVal || "";
                        }
                        if(oFormData.isEditShow){
                            aFormData.push(oFormData);
                        }
                    }else{
                        aFormData.push(oFormData);
                    }
                    if(item.isMust){
                        validatorFields[item.name] = {
                            rule: 'required;',
                            msg: {
                                required:"不能为空"
                            }
                        };
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
                }

            }
            t.oShowData.currentEditTpl = sTplId; //当前正在修改的模板
            if(sTplId == "kapian_tpl"){
                t.oShowData.isEditTemplateInsert = isEditTemplateInsert?true:false; //是否是卡片空白修改模式，后端要特殊处理，相当于新增
            }
            //附加卡片模板的isEditTemplateInsert如果为true，表示data为空，用新增来处理
            if(t.oShowData.isEditTemplateInsert){
                saveType = "add";
            }
            t.oShowData.infoSetId = sTemplateId; //
            if(saveType =="edit"){
                t.options.oMetadata.createFormAndDoSubmit("edit",aFormData,validatorFields,oRules,sUuid);
            }else if(saveType=="add"){
                t.options.oMetadata.createFormAndDoSubmit("add",aFormData,validatorFields,oRules);
            }
        },
        /**
         * 预览窗的公共新增、保存方法
         * @objThis 当前被点击的对象
         * */
        showEditPop_Add:function(objThis){
            var t = this;

            //新增文件上传
            if($(objThis).attr("data-isfileuploadlist") == "true"){
                var that = objThis;
                var pageLayer = layer.load(1, {shade: [0.5,'#ccc']}); //启用loading遮罩
                require.async("commonStaticDirectory/plugins/webuploader/FileUpload",function(FileUpload){
                    layer.close(pageLayer);//关闭loading遮罩
                    var _infoSetId = $(that).parents(".base_template_edit_wrap").attr("data-templateid");
                    t.fileUpload = new FileUpload({
                        url:gMain.basePath + 'route/'+ t.options.oMetadata.options.infoSetId+'/uploadAttachment.do',
                        specialTabParam:$(that).attr("data-specialTabParam"),
                        codeId:t.oShowData.editTemplate.editCondition.value,
                        infoSetId:_infoSetId
                    });
                });
                return false;
            }


            var $parent = $(objThis).parents(".base_template_add_wrap");
            var sTplId = $parent.attr("data-tpl-id"); //模板类型
            //如果是语句式、表格列表新增模式
            if(sTplId == "yuju_tpl" || sTplId == "biaoge_tpl"){
                var sTemplateId = $parent.attr("data-templateid"); //后端模板id
                var aData = []; //表头数据
                $.each(t.oShowData.tplList,function(i,item){
                    if(item.templateId == sTemplateId){
                        aData = item.aColumnEditData;
                    }
                });
                t.editFormDataCreate({
                    saveType:"add",
                    aData:aData,
                    oData:{},
                    sTplId:sTplId,
                    sTemplateId:sTemplateId
                });
            }

        },
        /**
         * 预览窗的公共删除方法
         * @objThis 当前被点击的对象
         * */
        showEditPop_Delete:function(objThis){
            var t = this;
            var $parent = $(objThis).parents(".base_template_edit_wrap");
            var sTplId = $parent.attr("data-tpl-id"); //模板类型
            var sTemplateId = $parent.attr("data-templateid"); //后端模板id
            var sUuid = $parent.attr("data-uuid");
            //如果是语句式
            if(sTplId == "yuju_tpl"){
                layer.confirm('你确定要删除该条记录吗?', {icon: 3, title:'提示'}, function(index){
                    Ajax.ApiTools().del({
                        infoSetId: sTemplateId,
                        data:{
                            infoSetId: sTemplateId,editCondition:t.oShowData.editTemplate.editCondition,uuidLists:[sUuid]
                        },
                        success:function(data){
                            if(data.result == "true"){
                                layer.msg("删除成功", {offset: 0});
                                $parent.remove();
                            }
                        }
                    });

                    layer.close(index);
                });
            }

        },
         /**
         * 绑定显示编辑删除按钮事件
         * */
        showEditOrDelBtn:function(){
            var t = this;
            var sEdit_Delete = '<div class="base_table_buttons">' +
                '<a href="javascript:void(0)" title="编辑" class="edit iconfont_dayhr_base">&#xe612;</a><a href="javascript:void(0)" title="删除" class="delete iconfont_dayhr_base">&#xe613;</a>' +
                '</div>';
            var sEdit = '<div class="base_table_buttons">' +
                '<a href="javascript:void(0)" title="编辑" class="edit iconfont_dayhr_base">&#xe612;</a>' +
                '</div>';

            $("#table_edit_dialog").find(".base_template_edit_wrap").unbind("mouseenter mouseleave").hover(function(){
                var _tplId = $(this).attr("data-tpl-id");
                //如果chooseid为null并且为表格模式的情况下，不显示编辑按钮和删除按钮
                if(_tplId == "columnCart_tpl" || (_tplId=="biaoge_tpl" && ($(this).attr("data-chooseid") != "null")) || _tplId=="kapian_tpl"){ //如果是主模板,表格模板，卡片模板就只有编辑
                    $(this).append(sEdit);
                }else if(_tplId =="yuju_tpl"){ //语句模板
                    $(this).append(sEdit_Delete);
                }
            },function(){
                $(this).find(".base_table_buttons").remove();
            });
        },
         /**
          * 修改表格模板
          * @obj 参数对象
          * @obj.infoSetId formId
          * @obj.ele 节点对象
          * */
         editFormTpl:function(obj){
            var t = this;
            Ajax.ApiTools().getFormData({
                infoSetId: obj.formId
                ,data:{infoSetId:obj.formId}
                ,success:function(data){
                    $(obj.ele).attr("data-isshoweidt","false").attr("data-actionUrl",data.actionUrl).find("textarea").removeProp("readonly");
                }
            });
         },
         /**
          * 保存表单模型数据
          * @obj 参数对象
          * @obj.ele 节点对象
          * */
         saveFormTplData:function(obj){
            var t = this;
            var oSend = {infoSetId:$(obj.ele).attr("data-templateid") , dataList:[{key:t.oShowData.editTemplate.editCondition.key, value:t.oShowData.editTemplate.editCondition.value}]};
            $(obj.ele).find("textarea").each(function(){
                oSend.dataList.push({
                    key:$(this).attr("name")
                    ,value: $.trim($(this).val())
                });
            });
            Ajax.ajax({
                url:gMain.apiBasePath + $(obj.ele).attr("data-actionurl")
                ,data:JSON.stringify(oSend)
                ,dataType:"json"
                ,success:function(data){
                    if(data.result == "true"){
                        layer.msg("保存成功", {offset: 0});
                        $(".table_edit_dialog_left_ul").find("li.on")[0].click();//重载数据
                    }
                }
            });
         },
         /**
         * 职位评估
         * */
         initJobIpe:function(){
             var t = this;
             var $oDiv = $("#base_pop_pos_ipe");
             Ajax.ApiTools().getIPEquestions({
                 data:{modelId: t.options.oItem.pos_id+"",modelType:"pos_id"},
                 success:function(data){
                     if(data.result == "true"){
                         t.oIPEquestions = data; //评估的问题列表数据
                         //如果没有得分情况，就表示还没有评估过
                         if(!data.score){
                             var sHtml = '<p>'+data.ipeRemark+'</p><p style="margin:10px 0;"><button id="base_startAssess" class="flat-button flat-small flat-yellow">开始评估</button></p>';
                             $oDiv.html(sHtml);
                         }else{
                             var sHtml = '<p><b>该职位的评估结果如下：</b></p>' +
                                 '<p style="margin: 10px 0;">得分：<span style="color: #36a3fe;font-size: 14px;font-weight: bold;">'+data.score+'</span>&nbsp;&nbsp;&nbsp;等级：<span style="color: #36a3fe;font-size: 14px;font-weight: bold;">'+data.level+'</span></p>' +
                                 '<p>'+data.ipeRemark+'</p><p style="margin:10px 0;"><button id="base_startAssess" class="flat-button flat-small flat-yellow">重新评估</button></p>';
                             $oDiv.html(sHtml);
                         }
                     }
                 }
             });
             //第几道题
             var iIndex = 0;
             //答题结果集
             var oSubmit = {
                 modelId: t.options.oItem.pos_id+"",modelType:"pos_id"
             };
             //显示题目
             var showQuestion = function(){
                 //这是最后一道题
                 if(iIndex >= t.oIPEquestions.listIpeQuestion.length){
                     iIndex = t.oIPEquestions.listIpeQuestion.length;
                     //提交查询评估结果
                     Ajax.ApiTools().evaluateIPE({
                         data:oSubmit
                         ,success:function(data){
                             if(data.result == "true"){
                                 layer.msg("评估完成", {offset: 0});
                                 var sHtml = '<p><b>该职位的评估结果如下：</b></p>' +
                                     '<p style="margin: 8px 0;">得分：<span style="color: #36a3fe;font-size: 14px;font-weight: bold;">'+data.score+'</span>&nbsp;&nbsp;&nbsp;等级：<span style="color: #36a3fe;font-size: 14px;font-weight: bold;">'+data.level+'</span></p>' +
                                     '<p>'+data.ipeRemark+'</p>' +
                                     '<p style="margin:10px 0;"><button id="base_submitAssess" class="flat-button flat-small flat-yellow">提交结果</button>&nbsp;&nbsp;&nbsp;<a href="javascript:void(0);" id="base_startAssess" style="color: #fd9309;font-weight: bold;">重新评估</a></p>';
                                 $oDiv.html(sHtml);
                             }
                         }
                     });
                     return false;
                 }

                 var oItem = t.oIPEquestions.listIpeQuestion[iIndex];
                 $oDiv.attr("data-questiontype",oItem.questionType); //缓存到节点上
                 var sHtml = '<h6 '+(oItem.questionType == "text"?'style="display:inline-block;margin-right: 5px;"':'')+'>'+(iIndex+1)+"、"+oItem.questionContent+'</h6>'; //如果是填空题标题就不换行
                 //如果是单选按钮
                 if(oItem.questionType == "radio"){
                     for(var i=0;i<oItem.listOption.length;i++){
                         sHtml += '<p><input type="radio" name="'+oItem.questionId+'" id="id-'+oItem.questionId+'-'+i+'" value="'+oItem.listOption[i].coordinate+'" /><label for="id-'+oItem.questionId+'-'+i+'">'+oItem.listOption[i].optionContent+'</label></p>';
                     }
                 }else if(oItem.questionType == "checkbox"){ //如果是多选框
                     for(var i=0;i<oItem.listOption.length;i++){
                         sHtml += '<p><input type="checkbox" name="'+oItem.questionId+'" id="id-'+oItem.questionId+'-'+i+'" value="'+oItem.listOption[i].coordinate+'" /><label for="id-'+oItem.questionId+'-'+i+'">'+oItem.listOption[i].optionContent+'</label></p>';
                     }

                 }else if(oItem.questionType == "text"){ //如果是填空题
                     sHtml += '<input type="text" name="'+oItem.questionId+'" value="'+(oItem.defaultValue?oItem.defaultValue:'')+'" autofocus="autofocus" style=" border: none; border-bottom: 1px solid #ccc; width: 150px; height: 25px; line-height: 25px; vertical-align: middle;background: transparent;">';
                 }
                 sHtml += (oItem.questionType=='text'?'<br/>':'')+'<br/><button id="base_nextAssess" class="flat-button flat-small flat-yellow">'+(iIndex == t.oIPEquestions.listIpeQuestion.length-1?'完成':'下一题')+'</button>';
                 $oDiv.html(sHtml);
             };
             //绑定开始评估按钮
             $('#table_edit_dialog').off("click","#base_startAssess").on("click","#base_startAssess",function(){
                 if(t.oIPEquestions && t.oIPEquestions.listIpeQuestion && t.oIPEquestions.listIpeQuestion.length){
                     iIndex = 0;  //第几道题
                     oSubmit = {
                         modelId: t.options.oItem.pos_id+"",modelType:"pos_id"
                     };  //答题结果集
                     showQuestion();
                 }
             });

             //绑定提交评估的事件
             $("#table_edit_dialog").off("click","#base_submitAssess").on("click","#base_submitAssess",function(){
                 Ajax.ApiTools().submitIPE({
                     data:oSubmit
                     ,success:function(data){
                         layer.msg("保存成功", {offset: 0});
                         t.options.mmg.load(); //评估完了刷新表格
                         $("#table_edit_dialog").find(".table_edit_dialog_left_ul").find("li.on")[0].click(); //重载此模块
                     }
                 });
             });

             //绑定跳转下一题
             $('#table_edit_dialog').off("click","#base_nextAssess").on("click","#base_nextAssess",function(){
                 var sType = $oDiv.attr("data-questiontype"); //问题类型
                 switch (sType){
                     case "radio":
                         if(!$oDiv.find("input[type='radio']:checked").val()){
                             layer.msg("请先选择一项", {offset: 0,shift:6});
                             return false;
                         }
                         var _obj = {
                             key:$oDiv.find("input[type='radio']:first").attr("name")
                             ,value:parseInt($oDiv.find("input[type='radio']:checked").val())
                         };
                         if(_obj.key == "orgType"){
                             _obj.value = _obj.value + "";
                         }
                         oSubmit[_obj.key] = _obj.value;
                         break;
                     case "checkbox":
                         if(!$oDiv.find("input[type='checkbox']:checked").val()){
                             layer.msg("请先至少选择一项", {offset: 0,shift:6});
                             return false;
                         }
                         var arr = [];
                         $oDiv.find("input[type='checkbox']:checked").each(function(){
                             arr.push($(this).val());
                         });
                         var _obj = {
                             key:$oDiv.find("input[type='checkbox']:first").attr("name")
                             ,value:arr.join(",")
                         };
                         oSubmit[_obj.key] = _obj.value;
                         break;
                     case "text":
                         var $oInput = $oDiv.find("input[type='text']");
                         if(!$.trim($oInput.val())){
                             layer.msg("请先填写空格", {offset: 0,shift:6});
                             return false;
                         }

                         //如果是营业额或者组织人数，空格必须填写整型
                         if($oInput.attr("name") == "personNum" || $oInput.attr("name") == "turnover"){
                             if(!/^[1-9]\d*$/.test($.trim($oInput.val()))){
                                 layer.msg("请填写正整数", {offset: 0,shift:6});
                                 return false;
                             }
                         }

                         var _obj = {
                             key:$oDiv.find("input[type='text']").attr("name")
                             ,value: parseInt($.trim($oDiv.find("input[type='text']").val()))
                         };
                         if(_obj.key == "turnover"){
                             _obj.value = _obj.value + "";
                         }
                         oSubmit[_obj.key] = _obj.value;
                         break;
                     default :
                         //
                 }

                 iIndex++;
                 showQuestion();
             });
         },
        /**
         * 格式化文件大小, 输出成带单位的字符串
         * @method formatSize
         * @grammar Base.formatSize( size ) => String
         * @grammar Base.formatSize( size, pointLength ) => String
         * @grammar Base.formatSize( size, pointLength, units ) => String
         * @param {Number} size 文件大小
         * @param {Number} [pointLength=2] 精确到的小数点数。
         * @param {Array} [units=[ 'B', 'K', 'M', 'G', 'TB' ]] 单位数组。从字节，到千字节，一直往上指定。如果单位数组里面只指定了到了K(千字节)，同时文件大小大于M, 此方法的输出将还是显示成多少K.
         * @example
         * console.log( Base.formatSize( 100 ) );    // => 100B
         * console.log( Base.formatSize( 1024 ) );    // => 1.00K
         * console.log( Base.formatSize( 1024, 0 ) );    // => 1K
         * console.log( Base.formatSize( 1024 * 1024 ) );    // => 1.00M
         * console.log( Base.formatSize( 1024 * 1024 * 1024 ) );    // => 1.00G
         * console.log( Base.formatSize( 1024 * 1024 * 1024, 0, ['B', 'KB', 'MB'] ) );    // => 1024MB
         */
        formatSize: function( size, pointLength, units ) {
            var unit;
            units = units || [ 'B', 'K', 'M', 'G', 'TB' ];
            while ( (unit = units.shift()) && size > 1024 ) {
                size = size / 1024;
            }
            return (unit === 'B' ? size : size.toFixed( pointLength || 2 )) + unit;
        },
         /**
         * 分割属性，无意义
         * */
        lastProperty:undefined //=========================================最后一项===分割线==================




    }

    module.exports = showEditPop;

});

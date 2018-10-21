/**
 * 表单设计器
 * @options.el  String 必填
 * @options.oMetadata
 * @options.editType
 * @options.oFormEditData
 */

define(function(require, exports, module) {
    require("commonStaticDirectory/plugins/bootstrap/bootstrap.min.css");
    require("js/modules/formBuild/formBuild.css");
    var sTpl = require("js/modules/formBuild/formBuild.html");

    require("commonStaticDirectory/plugins/Sortable.js");
    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");

    var template = require("commonStaticDirectory/plugins/template.js");
    var tools = require("commonStaticDirectory/plugins/tools"); //工具函数集
    var Ajax = require("js/ajax");
    var orgSelect = require("js/modules/orgSelect/orgSelect.js")
    require("js/modules/formPreview/formPreview.js"); //表单预览插件

    var FormBuild = function () {
        this.init.apply(this,arguments);
    };

    var oPro = {
        constructor: FormBuild
        ,options:{

        }
        ,init:function (options) {
            var t = this;
            t.options = $.extend({},t.options,options);
            $("body").loading({state:false});  //取消加载遮罩

            t.infoSetId = t.options.oMetadata.options.infoSetId; //信息集ID
            t.setHoldWindow(true);
            t.createDialog(); //弹窗
            t.registerTemplate(); //注册模板

            t.sb = true; //是否允许提交
            t.$editView = $("#editFieldView"); //单个控件的属性编辑区
            t.$formBuilderEdit = $("#formBuilderEdit"); //整个表单的信息设置区
            t.$builderView = $("#builderView");  //生成区

            t.$curItem = null; //当前被拖动的控件对象
            t.CID = 0; //控件生成ID

            //初始化表单数据
            t.FormBuilderInit(t.options.oFormEditData);

            t.SortableViewRowFields(); //行列控件
            t.SortableViewFieldView(); //生成控件区
            t.bindEvent(); //绑定事件
        }
        ,setHoldWindow:function (isHoldWindow) {
            var t = this;
            if(isHoldWindow){
                window.onbeforeunload = function () {
                    return "表单设计器正在编辑中...";
                };
            }else{
                window.onbeforeunload = null;
            }
        }
        /**
         * 弹窗
         * */
        ,createDialog:function () {
            var t = this;
            var sHtml = '<div id="buildFormWrap">'+sTpl+'</div>';
            var aButton = [
                {
                    value: '预览',
                    callback: function () {
                        t.previewFormDialog = dialog({
                            title:"模板预览"
                            ,ok:function () {

                            }
                            ,content:'' +
                            '<div id="builderViewPreview" style="width:880px;max-height: '+($(window).height() - 200) +'px;overflow-y: auto;padding-right: 30px;position: relative;" class="clearfix">' +
                            '   <form-preview v-bind:afields="aFormJson"></form-preview>' +
                            '   <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; background:rgba(255, 255, 255, 0); opacity: 0;"></div>' +
                            '</div>'
                        });
                        t.previewFormDialog.showModal();
                        new Vue({
                            el:"#builderViewPreview"
                            ,data:{
                                aFormJson:[]
                            }
                            ,attached:function () {
                                var v = this;
                                v.aFormJson = t.createFormJson().fields;
                                v.$nextTick(function () {
                                    t.previewFormDialog.reset();
                                });
                            }
                        });
                        return false;//组织关闭弹窗
                    }
                },
                {
                    value: '保存',
                    callback: function () {
                        t.saveData(); //保存数据
                        return false;
                    },
                    autofocus: true
                },
                {
                    value: '取消',
                    callback: function () {

                    },
                    autofocus: false
                }
            ];

            if(t.options.editType == "add"){
                // aButton.splice(2,0,{
                //     id: 'formBuilder-button-nextStep',
                //     value: '下一步',
                //     callback: function () {
                //         if(t.validataForm()){
                //             $("body").loading({zIndex:9999}); //启用loading
                //             if(t.options.editType == "add"){
                //                 require.async("js/modules/workflowSetting/workflowSetting.js",function (WorkflowSetting) {
                //                     new WorkflowSetting({
                //                         oMetadata:t.options.oMetadata,
                //                         editType:"add",
                //                         aFormStyle:t.createFormJson(),
                //                         formName:t.vueFormBuilderEdit.form_name,
                //                         dataList:t.getFormBaseInfo(),
                //                         oFormBuild:t
                //                     });
                //                 });
                //             }
                //         }
                //         return false;
                //     },
                //     autofocus: true
                // });
            }

            t.dialog = dialog({
                title:"表单设计器"+(t.options.oFormEditData.form_name?("（"+t.options.oFormEditData.form_name+"）"):"")
                ,content:sHtml
                ,button:aButton
                ,onclose: function () {
                    t.setHoldWindow(false);
                }
            });
            t.dialog.showModal(); //显示弹窗
            t.$el = $("#buildFormWrap");

        }
        /**
         * 控件名称数组，判断名称是否重复用
         * */
        ,tempArrFieldType:{
            text: [],
            paragraph: [],
            checkboxes: [],
            radio: [],
            date: [],
            datearea: [],
            number: [],
            price: [],
            pic: [],
            file:[],
            group: [],
            remark: [],
            twoColumns:[], //三列控件
            threeColumns:[]  //三列控件
        }
        /**
         * 注册模板
         * */
        ,registerTemplate:function () {
            //去掉空格
            template.helper("trim", function(text) {
                var result;
                result = text.replace(/(^\s+)|(\s+$)/g, "");
                result = result.replace(/\s/g, "");
                return result;
            });

            //JSON转字符串
            template.helper("jsonTostring", function(text) {
                var result;
                result = JSON.stringify(text) || "{}";
                return result;
            });

            //最大长度
            template.helper("maxlength", function(text) {
                return text.length >= 10 ? "red-border" : "";
            });
        }
        /**
         * 行列控件
         * */
        ,SortableViewRowFields:function () {
            var t = this;
            Sortable.create($('#viewRowFields')[0], {
                sort: false,
                group: {
                    name: 'advanced',
                    pull: 'clone',
                    put: false
                },
                animation: 150,
                onStart: function(evt) {
                    t.formToolClosePut(evt, t.FormBuilderArrSortable);
                },
                onEnd: function(evt) {
                    //t.formToolOpenPut(t.FormBuilderArrSortable);
                    // console.log('onEnd.foo:', evt.item);
                }
            });
        }
        /**
         * 表单排版区
         * */
        ,SortableBuilderView:function () {
            var t = this;
            Sortable.create($('#builderView')[0], {
                group: {
                    name: 'advanced',
                    pull: true,
                    put: true
                },
                animation: 150,
                draggable: '.filed-item',
                handle: '.handle',
                filter: '.js-remove',
                onFilter: function(evt) {
                    $(evt.item).remove();  //点叉叉的时候删除节点
                    $('#formBuilder-myTab-fieldEdit li:eq(0)').addClass("active").siblings().removeClass("active");
                    $("#formBuilder-myTabContent-fieldEidt .tab-pane").eq(0).addClass("in active").siblings().removeClass("in active");
                },
                onAdd: function(evt) {
                    t.FormBuilderOnAdd(evt);
                },
                onUpdate: function(evt) {
                    console.log('onUpdate.bar:', evt.item);
                },
                onRemove: function(evt) {
                    //console.log('onRemove.bar:', evt.item);
                },
                onStart: function(evt) {
                    t.formToolClosePut(evt, t.FormBuilderArrSortable);
                    t.formToolSelectedField(evt);
                    t.FormBuilderShowEdit(evt);
                },
                onEnd: function(evt) {
                    t.formToolOpenPut(t.FormBuilderArrSortable);
                }
            });
        }
        /**
         * 原始表单控件区
         * */
        ,SortableViewFieldView:function () {
            var t = this;
            Sortable.create($('#viewFieldView')[0], {
                sort: false,
                group: {
                    name: 'advanced',
                    pull: 'clone',
                    put: false
                },
                animation: 150,
                onStart: function(evt) {
                    t.formToolClosePut(evt, t.FormBuilderArrSortable);
                },
                onEnd: function(evt) {
                    t.formToolOpenPut(t.FormBuilderArrSortable);
                }
            });
        }
        /**
         * 嵌套的拖拽组件
         * @opts.element
         * @opts.fieldType
         * */
        ,SortableGroupAndArrFiedls:function (opts) {
            var t = this;
            opts = opts || {};
            t.FormBuilderArrSortable.push(Sortable.create(opts.element, {
                group: {
                    name: 'advanced',
                    pull: true,
                    put: true
                },
                draggable: '.filed-item',
                handle: '.handle',
                animation: 150,
                onAdd: function(evt) {
                    //明细
                    if(opts.fieldType == "group"){
                        t.FormBuilderOnAdd(evt);
                    }else if(opts.fieldType == "twoColumns"){  //两列控件
                        t.FormBuilderOnAdd(evt,function (addOpts) {
                            t.checkAddFields({
                                evt:evt,
                                itemType:$(evt.item).data("type"),
                                addOpts:addOpts
                            });
                        });
                    }else if(opts.fieldType == "threeColumns"){  //三列控件
                        t.FormBuilderOnAdd(evt,function (addOpts) {
                            t.checkAddFields({
                                evt:evt,
                                itemType:$(evt.item).data("type"),
                                addOpts:addOpts
                            });
                        });
                    }
                },
                onStart: function(evt) {
                    t.formToolClosePut(evt, t.FormBuilderArrSortable);
                    t.formToolSelectedField(evt);
                    t.FormBuilderShowEdit(evt);
                },
                onEnd: function(evt) {
                    t.formToolOpenPut(t.FormBuilderArrSortable);
                }

            }));
        }
        /**
         * 绑定修改字段的属性事件
         * */
        ,bindEvent:function () {
            var t = this;

            /**
             * ================================选项卡切换===================================================
             * */

            $("#formBuilder-myTab-fieldView").on("click","li",function () {
                $(this).addClass("active").siblings().removeClass("active");
                $("#"+$(this).attr("data-to")).addClass("in active").siblings().removeClass("in active");
            });

            $("#formBuilder-myTab-fieldEdit").on("click","li",function () {
                $(this).addClass("active").siblings().removeClass("active");
                $("#"+$(this).attr("data-to")).addClass("in active").siblings().removeClass("in active");
            });

            /**
             * ============================拖拽区的绑定事件====================================================
             * */
            //点击控件
            t.$builderView.on("click", ".filed-item", function(e) {
                e.stopPropagation();
                var filed_item = $("#builderView").find(".filed-item");

                filed_item.removeClass("active");
                $(this).addClass("active");
                t.FormBuilderShowEdit($(this).data("id"));

            });

            //鼠标移入控件
            t.$builderView.on("mouseenter", ".filed-item", function(e) {
                $(this).addClass("filed-item-hover");
                e.stopPropagation();
            });
            t.$builderView.on("mouseleave", ".filed-item", function(e) {
                $(this).removeClass("filed-item-hover");
                e.stopPropagation();
            });


            /**
             * ============================编辑区的绑定事件====================================================
             * */
            //编辑框,标题
            t.$editView.on("input", "#inputLabel", function() {
                var _this = $(this);
                var val = _this.val();
                var type = t.$curItem.data("fieldtype");
                t.$curItem.attr("data-label", val);

                switch (type) {
                    case "group":
                        t.$curItem.find(".group-title").find("span").text(val);
                        break;
                    case "datearea":
                        t.$curItem.find(".handle").eq(0).find(".text").text(val);
                        break;
                    default:
                        t.$curItem.find(".text").text(val);
                }
            });

            //编辑框,标题2
            t.$editView.on("input", "#inputLabel2", function() {
                var _this = $(this);
                var val = _this.val();
                t.$curItem.find(".handle").eq(1).find(".text").text(val);
                t.$curItem.attr("data-label2", val);

            });

            //编辑框,描述
            t.$editView.on("input", "#inputDes", function() {
                var _this = $(this);
                var val = _this.val();
                var type = t.$curItem.data("fieldtype");
                t.$curItem.attr("data-describe", val);

                switch (type) {
                    case "datearea":
                        t.$curItem.find(".handle").eq(0).find(".text").text(val);
                        break;
                    case "group":
                        t.$curItem.find(".describe-group").text(val);
                        break;
                    default:
                        t.$curItem.find(".describe").text(val);
                }

            });

            //大写金额
            t.$editView.on("click", "#inputCapital", function() {
                var _this = $(this);
                var options = JSON.parse(t.$curItem.attr("data-fieldoptions"));

                //如果勾选了大写金额
                if(_this.prop("checked")){
                    options.capital = "true";
                    t.$curItem.find(".capitalShow").show(); //显示大写金额提示
                }else{
                    options.capital = "false";
                    t.$curItem.find(".capitalShow").hide(); //显示大写金额提示
                }

                t.$curItem.attr("data-fieldoptions", JSON.stringify(options));
            });

            //编辑框，必填
            t.$editView.on("click", "#inputRequired", function() {
                var _this = $(this);
                var isRequired = _this.prop("checked");
                t.$curItem.attr("data-required", isRequired);
                t.$curItem.find(".required").text(isRequired ? "(必填)" : "");
            });
            //编辑框 日期类型选择
            t.$editView.on("click", ".radio-date", function() {
                var _this = $(this);
                var val = _this.val();
                var obj = {
                    date_type: val
                };
                t.$curItem.attr("data-fieldoptions", JSON.stringify(obj));
            });
            // 编辑框 大写
            t.$editView.on("click", "#inputCapital", function() {
                var _this = $(this);
                var checked = _this.prop("checked");
                var $capital = t.$curItem.find(".capital");
                t.$curItem.attr("data-capital", checked);
                if (checked) {
                    $capital.removeClass("hidden");
                } else {
                    $capital.addClass("hidden");
                }

            })

            //点击tab默认当前点击item被点击，否则显示第一个item
            $('#formBuilder-myTab-fieldEdit li:eq(1)').click(function() {
                if (t.$curItem) {
                    t.$curItem.trigger("click");
                } else if (t.$builderView.children(".filed-item").length) {
                    t.$builderView.children(".filed-item").eq(0).trigger("click");
                } else {
                    t.$editView.html("");
                }
            });
            //单选、多选选项操作
            //添加
            t.$editView.on("click", ".js-add-option", function() {
                var MAX_ITEM_LENGTH = 200;  //单选，多选最多200项
                var _this = $(this);
                var option = _this.parent();
                var index = option.data("index");
                var curItemOption = t.$curItem.attr("data-fieldoptions");
                var jsonData = JSON.parse(curItemOption);
                var jsonOptions = jsonData.options;
                var jsonOptionsLen = jsonOptions.length;
                var parents = _this.parents(".edit-item");
                var verify = parents.find(".verify");
                var arrObj = {
                    label: "",
                    checked: false
                }
                var reg = /^(选项).*?\d$/;
                var tempArr = [];

                //选项不能大于20条
                if (jsonOptionsLen >= MAX_ITEM_LENGTH) {
                    verify.addClass("verify-error");
                    return;
                }

                for (var i = 0; i < jsonOptionsLen; i++) {
                    if (reg.test(jsonOptions[i].label)) {
                        tempArr.push(jsonOptions[i].label);
                    }
                }
                if (tempArr.length) {
                    var j = 1;
                    while (true) {
                        if (tempArr.indexOf("选项" + j) >= 0) {
                            j++;
                        } else {
                            break;
                        }
                    }
                    arrObj.label = "选项" + j;
                } else {
                    tempArr.push("选项1");
                    arrObj.label = "选项1";
                }

                t.formToolArrInsert(jsonData.options, index + 1, arrObj);
                t.$curItem.attr("data-fieldoptions", JSON.stringify(jsonData));
                var obj = {};
                obj.label = t.$curItem.attr("data-label");
                obj.describe = t.$curItem.attr("data-describe");
                obj.required = t.$curItem.attr("data-required");
                obj.fieldtype = t.$curItem.attr("data-fieldtype");
                obj.field_options = JSON.parse(t.$curItem.attr("data-fieldoptions"));

                t.$editView.html(template('edit_text',obj));
            });

            //移除
            t.$editView.on("click", ".js-remove-option", function() {
                // var options = t.$editView.find(".option");
                var _this = $(this);
                var option = _this.parent();
                var index = option.data("index");
                option.remove();
                var curItemOption = t.$curItem.attr("data-fieldoptions");
                var jsonData = JSON.parse(curItemOption);
                jsonData.options.splice(index, 1);
                t.$curItem.attr("data-fieldoptions", JSON.stringify(jsonData))
                var obj = {};
                obj.label = t.$curItem.attr("data-label");
                obj.describe = t.$curItem.attr("data-describe");
                obj.required = t.$curItem.attr("data-required");
                obj.fieldtype = t.$curItem.data("fieldtype");
                obj.field_options = JSON.parse(t.$curItem.attr("data-fieldoptions"));

                t.$editView.html(template('edit_text',obj));
            });
            //选项输入
            t.$editView.on("input", ".option-label-input", function(e) {
                var _this = $(this);
                var option = _this.parent();
                var index = option.data("index");
                var curItemOption = t.$curItem.attr("data-fieldoptions");
                var val = _this.val();
                var jsonData = JSON.parse(curItemOption);
                var parents = _this.parents(".edit-item");
                var jsonDataLen = jsonData.options.length;
                var verify = parents.find(".verify");
                if (val.length >= 10) {
                    verify.addClass("verify-error");
                    // return;
                } else {
                    console.log(jsonDataLen)
                    //大于200项，返回错误状态
                    if (verify.hasClass("verify-error") && jsonDataLen < 200) {
                        verify.removeClass("verify-error");
                    }
                }

                jsonData.options[index].label = val;
                t.$curItem.attr("data-fieldoptions", JSON.stringify(jsonData));
            });

            //附件大小控制
            t.$editView.on("input","#fileSize",function () {
                var _this = $(this);
                t.$curItem.attr("data-filesize",$.trim(_this.val()));
            });

            //设置 仅用于多个字段组合（明细控件用）
            t.$editView.on("click", "#inputWithoutAddButton", function() {
                var _this = $(this);
                var isChecked = _this.prop("checked");
                t.$curItem.attr("data-isWithoutAddButton", isChecked?"true":"false");
                t.$curItem.find(".addbtn > span")[isChecked?'hide':'show'](); //隐藏显示加号按钮
            });

            //选择流程类型
            t.$formBuilderEdit.find(".select").on("click","a.checkbox",function () {
                if($(this).hasClass("checked")){
                    $(this).removeClass("checked").parent().find("input[type='radio']").attr("checked",false);
                }else{
                    t.$formBuilderEdit.find(".select").find("input[type='radio']").attr("checked",false); //取消选中所有
                    t.$formBuilderEdit.find(".select").find("a.checkbox").removeClass("checked"); //取消选中所有
                    $(this).addClass("checked").parent().find("input[type='radio']").attr("checked",true);
                }
            });
        }
        /**
         * ==============================================
         * 工具方法
         * ==============================================
         * */
        //关闭成组的sortable再次嵌套（当拖拽那种能够继续容纳表单的表单容器的时候后，瞬间把其他的sortable的group.name的值改变掉，这样就可以使当前的表单容器不能被拖入别的表单容器）
        ,formToolClosePut: function(evt, sortable) {
            var t = this;
            var item = evt.item;
            if (($(item).attr("data-type") == "group" || $(item).attr("data-type") == "twoColumns" || $(item).attr("data-type") == "threeColumns" || $(item).attr("data-fieldtype") == "group" || $(item).attr("data-fieldtype") == "twoColumns" || $(item).attr("data-fieldtype") == "threeColumns") && $.isArray(sortable) && sortable.length) {
                for (var i =0;i<sortable.length;i++) {
                    sortable[i].options.group.name = "advanced1";
                }
            }
        },
        //打开成组的sortable再次嵌套
        formToolOpenPut: function(sortable) {
            var t = this;
            if ($.isArray(sortable) && sortable.length) {
                for (var i=0;i<sortable.length;i++) {
                    sortable[i].options.group.name = "advanced";
                }
            }
        },
        //选中的控件
        formToolSelectedField: function(evt) {
            var t = this;
            var filed_item = $("#builderView").find(".filed-item");
            filed_item.removeClass("active");
            t.$curItem = (evt.clone === undefined || evt.clone === null) ? $(evt.item) : $("#c" + t.CID);
            t.$curItem.length && t.$curItem.addClass("active");

        },
        //遍历，获取最大的cid
        formToolGetCid: function(data) {
            var t = this;
            if ($.isArray(data) && data.length) {
                var temp = [];
                var reg = /\d+/g;
                for (var i = 0;i<data.length;i++) {
                    var d = data[i];

                    //明细
                    if (d.group && $.isArray(d.group.fields) && d.group.fields.length) {
                        for (var j=0;j<d.group.fields.length;j++) {
                            var g = d.group.fields[j];
                            temp.push(g.cid.match(reg)[0]);
                        }
                    }else if(d.field_type == "twoColumns"){ //两列控件
                        if($.isArray(d.firstCol.fields)){
                            for (var j=0;j<d.firstCol.fields.length;j++) {
                                var g = d.firstCol.fields[j];
                                temp.push(g.cid.match(reg)[0]);
                            }
                        }
                        if($.isArray(d.secondCol.fields)){
                            for (var j=0;j<d.secondCol.fields.length;j++) {
                                var g = d.secondCol.fields[j];
                                temp.push(g.cid.match(reg)[0]);
                            }
                        }
                    }else if(d.field_type == "threeColumns"){  //三列控件
                        if($.isArray(d.firstCol.fields)){
                            for (var j=0;j<d.firstCol.fields.length;j++) {
                                var g = d.firstCol.fields[j];
                                temp.push(g.cid.match(reg)[0]);
                            }
                        }
                        if($.isArray(d.secondCol.fields)){
                            for (var j=0;j<d.secondCol.fields.length;j++) {
                                var g = d.secondCol.fields[j];
                                temp.push(g.cid.match(reg)[0]);
                            }
                        }
                        if($.isArray(d.thirdCol.fields)){
                            for (var j=0;j<d.thirdCol.fields.length;j++) {
                                var g = d.thirdCol.fields[j];
                                temp.push(g.cid.match(reg)[0]);
                            }
                        }
                    } else {
                        temp.push(d.cid.match(reg)[0]);
                    }
                }
                t.CID = Math.max.apply(null, temp);
            }
        },

        //临时存储控件field_type，避免控件field_type重复
        formToolSaveFieldType: function(obj) {
            var t = this;
            t.tempArrFieldType[obj.field_type].push(obj.field_type);
        },
        //检查是否有重名
        formToolHasRepeat: function(el) {
            var t = this;
            el.each(function() {

            })
        },
        //数组指定位置插入数据
        formToolArrInsert: function(arr, index, item) {
            var t = this;
            arr.splice(index, 0, item);
        },
        /**
         * ==============================================
         * 生成表单
         * ==============================================
         * */
        FormBuilderInit: function(data) {
            var t = this;
            //如果有表单ID传过来，就加载已有的表单数据（包含历史表单数据和模板表单数据）
            //点击应用时候初始化表单预览
            if(data.form_id){
                //加载已保存过的表单json
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrReportTemp/getFormStyleForMongo.do"
                    ,data:JSON.stringify({
                        id:data.form_id + ""
                        ,mongoSymbol:"formStyle_table"
                    })
                    ,success:function (data) {
                        if(data.result == "true"){
                            if(data.data){
                                var aFields = JSON.parse(data.data).fields;
                                t.formToolGetCid(aFields);
                                if ($.isArray(aFields)) {
                                    t.$builderView.html(template('form_items_template',{fields:aFields}));
                                    for (var i = 0; i < aFields.length; i++) {
                                        var field = aFields[i];
                                        t.formToolSaveFieldType(field);

                                        //如果是明细控件
                                        if (field.field_type === "group" && $.isArray(field.group.fields)) {
                                            for (var j = 0;j<field.group.fields.length;j++) {
                                                var groupField = field.group.fields[j];
                                                t.formToolSaveFieldType(groupField);
                                            }
                                            t.SortableGroupAndArrFiedls({
                                                element:$("#" + field.cid)[0]
                                                ,fieldType:"group"
                                            });
                                        }

                                        //如果是两列控件
                                        if(field.field_type == "twoColumns"){
                                            for (var j = 0;j<field.firstCol.fields.length;j++) {
                                                var groupField = field.firstCol.fields[j];
                                                t.formToolSaveFieldType(groupField);
                                            }
                                            for (var j = 0;j<field.secondCol.fields.length;j++) {
                                                var groupField = field.secondCol.fields[j];
                                                t.formToolSaveFieldType(groupField);
                                            }
                                            t.SortableGroupAndArrFiedls({
                                                element:$("#" + field.cid).find(".left")[0]
                                                ,fieldType:"twoColumns"
                                            });
                                            t.SortableGroupAndArrFiedls({
                                                element:$("#" + field.cid).find(".right")[0]
                                                ,fieldType:"twoColumns"
                                            });
                                        }

                                        //如果是三列列控件
                                        if(field.field_type == "threeColumns"){
                                            for (var j = 0;j<field.firstCol.fields.length;j++) {
                                                var groupField = field.firstCol.fields[j];
                                                t.formToolSaveFieldType(groupField);
                                            }
                                            for (var j = 0;j<field.secondCol.fields.length;j++) {
                                                var groupField = field.secondCol.fields[j];
                                                t.formToolSaveFieldType(groupField);
                                            }
                                            for (var j = 0;j<field.thirdCol.fields.length;j++) {
                                                var groupField = field.thirdCol.fields[j];
                                                t.formToolSaveFieldType(groupField);
                                            }
                                            t.SortableGroupAndArrFiedls({
                                                element:$("#" + field.cid).find(".left")[0]
                                                ,fieldType:"threeColumns"
                                            });
                                            t.SortableGroupAndArrFiedls({
                                                element:$("#" + field.cid).find(".center")[0]
                                                ,fieldType:"threeColumns"
                                            });
                                            t.SortableGroupAndArrFiedls({
                                                element:$("#" + field.cid).find(".right")[0]
                                                ,fieldType:"threeColumns"
                                            });
                                        }

                                    }
                                }
                            }
                            t.SortableBuilderView();//生成表单预览区
                        }
                    }
                });
            }else{
                t.SortableBuilderView();//生成表单预览区
            }
            t.setFormInfoFields(); //设置表单信息字段
        }
        /**
         * 设置表单信息字段
         * */
        ,setFormInfoFields:function () {
            var t = this;
            t.initFormBuilderEdit({
                oFormEditData:t.options.oFormEditData   //表单编辑数据
            });
        }
        /**
         * 初始化表单基本信息编辑
         * */
        ,initFormBuilderEdit:function (opts) {
            opts = opts || {};
            var that = this;
            that.vueFormBuilderEdit = new Vue({
                el:"#formBuilderEdit"
                ,data:{
                    org_names:""
                    ,org_ids:""
                    ,form_id:""
                    ,form_name:""
                    ,form_type:""
                    ,form_type_id:""
                    ,form_type_list:[]
                    ,uuid:""
                    ,isHiddenSelect:true //是否显示流程类型的下拉选择框
                    ,remark:""
                }
                ,attached:function () {
                    var t = this;
                    if(!$.isEmptyObject(opts.oFormEditData)){
                        t.org_ids = opts.oFormEditData.org_ids || "";
                        t.org_names = opts.oFormEditData.org_names || "全部";
                        t.form_id = opts.oFormEditData.form_id || "";
                        t.form_name = opts.oFormEditData.name || "";
                        t.form_type = opts.oFormEditData.form_type;
                        t.uuid = opts.oFormEditData.uuid;
                        t.remark = opts.oFormEditData.remark || "";
                    }

                    t.getFormTypeList();
                }
                ,methods:{
                    /**
                     * 获取流程分类
                     * */
                    getFormTypeList:function () {
                        var t = this;
                        //流程类型选择列表
                        Ajax.ajax({
                            url:gMain.apiBasePath + "route/wf_form_type_list/getAll.do"//获取all的接口，与流程设置共用一个接口
                            ,data:JSON.stringify({"infoSetId":"wf_form_type_list"})
                            ,beforeSend:function () {
                                $("#formBuilder-myTabContent-fieldEidt").loading();
                            }
                            ,complete:function () {
                                $("#formBuilder-myTabContent-fieldEidt").loading({state:false});
                            }
                            ,success:function (data) {
                                if(data.result == "true"){
                                    if($.isArray(data.maps)){
                                        t.form_type_list = data.maps;
                                        //获取form_type_id 流程类型的真实ID
                                        for(var i=0;i<data.maps.length;i++){
                                            if(data.maps[i].name == opts.oFormEditData.form_type){
                                                t.form_type_id = data.maps[i].type_id;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                    /**
                     * 选择组织列表
                     * */
                    ,selectOrgList:function () {
                        var t = this;
                        new orgSelect({
                            title:"适用范围选择"
                            ,data:t.org_ids.split(",")
                            ,callback:function (data) {
                                var arr = [];
                                var arrIds = [];
                                if(data.length){
                                    for(var i=0;i<data.length;i++){
                                        arr.push(data[i].name);
                                        arrIds.push(data[i].id);
                                    }
                                    t.org_names = arr.join("，");
                                    t.org_ids = arrIds.join(",");
                                }else{
                                    t.org_names = "全部";
                                    t.org_ids = "";
                                }
                            }
                        });
                    }
                    ,addFormType:function () {
                        var t = this;
                        var id = "input" + (new Date()).getTime();
                        var d = dialog({
                            title:"输入类型名称"
                            ,ok:function () {
                                if($.trim($("#" + id).val())){
                                    Ajax.ajax({
                                        url:gMain.apiBasePath + "route/wr_report_templates_list/insert.do"
                                        ,data:JSON.stringify({"dataList":[{"key":"name","value":$.trim($("#" + id).val())}],"infoSetId":"wf_form_type_list"})
                                        ,beforeSend:function () {
                                            $("#formBuilder-myTabContent-fieldEidt").loading();
                                        }
                                        ,complete:function () {
                                            $("#formBuilder-myTabContent-fieldEidt").loading({state:false});
                                        }
                                        ,success:function (data) {
                                            if(data.result == "true"){
                                                tools.showMsg.ok("添加成功");
                                                t.getFormTypeList();
                                            }
                                        }
                                    });
                                    d.close().remove();//关闭弹窗
                                }else{
                                    return false;
                                }
                            }
                            ,content:'<div><input type="text" id="'+id+'" style=" border: 1px solid #bcbcbc; height: 32px; line-height: 32px; border-radius: 3px; padding: 0 5px;"></div>'
                        });
                        d.showModal();
                    }
                    ,removeFormType:function (item) {
                        var t = this;
                        layer.confirm('是否确定要删除此类型？', {icon: 3, title:'提示'}, function(index){
                            Ajax.ajax({
                                url:gMain.apiBasePath + "route/wrReportTemp/del.do"
                                ,data:JSON.stringify({"infoSetId":"wr_report_templates_list","uuidLists":[item.uuid]})
                                ,beforeSend:function () {
                                    $("#formBuilder-myTabContent-fieldEidt").loading();
                                }
                                ,complete:function () {
                                    $("#formBuilder-myTabContent-fieldEidt").loading({state:false});
                                }
                                ,success:function (data) {
                                    if(data.result == "true"){
                                        tools.showMsg.ok("删除成功");
                                        t.getFormTypeList();
                                    }
                                }
                            });
                            layer.close(index);
                        });
                    }
                    ,okSelectFormType:function () {
                        var t = this;
                        $(t.$el).find(".select_ul").find("input[type='radio']").each(function () {
                            if($(this).prop("checked")){
                                t.form_type = $(this).val();
                                t.form_type_id = $(this).attr("data-id");
                            }
                        });
                        t.isHiddenSelect = true;
                    }
                }
            });
        }
        /**
         * 控件的添加事件
         * */
        ,FormBuilderOnAdd: function(evt,callback) {
            var t = this;
            t.CID += 1;
            var _this = this;
            var cid = "c" + t.CID;
            var obj = {
                "label": "",
                "describe": "填写内容",
                "field_type": "",
                "required": "false",
                "field_options": {},
                "cid": cid,
                "field_name":"f"+cid+"_"+(new Date()).getTime()
            };
            var item = $(evt.item);
            var itemType = item.data("type");

            obj.field_type = itemType;

            if (itemType) {
                var len = t.tempArrFieldType[itemType].length; //此类型控件的个数

                //如果不是行列控件
                if(!item.hasClass("row-fields-item")){
                    var text = item.find(".fieldsName").text(); //当前被拖动的控件的显示内容
                    //如果之前添加过此类型的控件，显示名称+1
                    if (len) {
                        obj.label = text + "(" + (len + 1) + ")";
                    } else {
                        obj.label = text;
                    }
                }

                t.tempArrFieldType[itemType].push(itemType);
                //单选、多选
                switch (itemType) {
                    case "radio":
                    case "checkboxes":
                        obj.field_options = {
                            options: [{
                                label: "选项1",
                                checked: false
                            }, {
                                label: "选项2",
                                checked: false
                            }, {
                                label: "选项3",
                                checked: false
                            }]
                        };
                        obj.describe = "请选择";
                        break;
                    //日期
                    case "date":
                        obj.field_options = {
                            date_type: 1
                        };
                        obj.describe = "请选择";
                        break;
                    // 日期区间
                    case "datearea":
                        obj.field_options = {
                            date_type: 2
                        };
                        obj.describe = "请选择";
                        obj.label = "开始时间";
                        obj.label2 = "结束时间";

                        break;
                    //file类型
                    case "file":
                        obj.describe = "(小于等于20M)";  //这两个字段管理员要对照填写一样的限制大小
                        obj.fileSize = 20;  //默认不能小于5M
                        break;
                    //明细
                    case "group":
                        obj.isWithoutAddButton = 'false'; //默认不选中 "仅用于多个字段组合"
                        break;
                    //两列控件
                    case "twoColumns":
                    case "threeColumns":
                        obj.describe = "";
                        break;
                    default:
                        //

                }

                //根据类型渲染模板
                if(item.parents("#builderView").length){
                    item.replaceWith(template("view_"+itemType,obj));
                }

                //如果是明细容器
                if (itemType === "group") {
                    t.SortableGroupAndArrFiedls({
                        element:$("#" + cid)[0]
                        ,fieldType:"group"
                    });
                }

                //如果是两列控件
                if(itemType === "twoColumns"){
                    t.SortableGroupAndArrFiedls({
                        element:$("#" + cid).find(".left")[0]
                        ,fieldType:"twoColumns"
                    });
                    t.SortableGroupAndArrFiedls({
                        element:$("#" + cid).find(".right")[0]
                        ,fieldType:"twoColumns"
                    });
                }

                //如果是三列控件
                if(itemType === "threeColumns"){
                    t.SortableGroupAndArrFiedls({
                        element:$("#" + cid).find(".left")[0]
                        ,fieldType:"threeColumns"
                    });
                    t.SortableGroupAndArrFiedls({
                        element:$("#" + cid).find(".center")[0]
                        ,fieldType:"threeColumns"
                    });
                    t.SortableGroupAndArrFiedls({
                        element:$("#" + cid).find(".right")[0]
                        ,fieldType:"threeColumns"
                    });
                }


                t.formToolSelectedField(evt);
                t.FormBuilderShowEdit(evt);
                typeof callback === "function" && callback({cid:cid});
            }
        },
        /**
         * 检查是否可以继续添加字段控件
         * */
        checkAddFields:function (opts) {
            var t = this;
            opts = opts || {};
            var evt = opts.evt;
            var itemType = opts.itemType;
            var addOpts = opts.addOpts;

            //不能拖入超过两个字段控件
            if($(evt.target).find(".filed-item").length > 1  || itemType == "twoColumns"  || itemType == "threeColumns"){
                $(evt.target).find(".filed-item[data-id='"+addOpts.cid+"']").remove();
                t.CID = t.CID - 1; //只能添加一个，移除后cid减一
                t.tempArrFieldType[itemType].pop();//删除没被添加的表单控件
            }
        },
        /**
         * 显示每个控件的编辑属性
         * */
        FormBuilderShowEdit: function(evt) {
            var t = this;
            //console.log(typeof evt == "string")
            if (typeof evt === "string") {
                t.$curItem = $("#" + evt);
            } else {
                //是否为新加元素
                //evt.clone === null 不是新加元素
                t.$curItem = (evt.clone === undefined || evt.clone === null) ? $(evt.item) : $("#c" + t.CID);
            }

            //如果从控件区拖到编辑区再拖回控件区就会t.$curItem获取到空对象
            if(!t.$curItem.length){
                return;
            }

            var type = t.$curItem.data("fieldtype");

            var obj = {};
            obj.label = t.$curItem.attr("data-label");
            obj.describe = t.$curItem.attr("data-describe");
            obj.required = t.$curItem.attr("data-required");
            obj.fieldtype = t.$curItem.attr("data-fieldtype");
            obj.field_options = JSON.parse(t.$curItem.attr("data-fieldoptions"));


            //不同类型表单的特殊属性
            switch (type) {
                case "datearea":
                    obj.label2 = t.$curItem.attr("data-label2");
                    break;
                case "file":
                    obj.fileSize = t.$curItem.attr("data-filesize");
                    break;
                case "number":
                    obj.capital = t.$curItem.attr("data-capital");  //是否大写金额
                    break;
                case "group":
                    obj.isWithoutAddButton = t.$curItem.attr("data-isWithoutAddButton");
                    break;
                default:
                //
            }

            t.$editView.html(template("edit_text",obj));
            //显示第二个编辑属性标签
            $('#formBuilder-myTab-fieldEdit li').eq(1).addClass("active").siblings().removeClass("active");
            $("#formBuilder-myTabContent-fieldEidt .tab-pane").eq(1).addClass("in active").siblings().removeClass("in active");
        },
        FormBuilderArrSortable: []  //把所有可继续装入表单的控件组对象缓存起来
        /**
         * 收集要保存的各个子项的字段
         * */
        ,setItemFields:function ($obj) {
            var t = this;
            var oItem = {};
            oItem.label = $obj.attr("data-label"); //表单名称
            oItem.field_type = $obj.attr("data-fieldtype"); //表单类型
            oItem.required = $obj.attr("data-required"); //是否必填
            oItem.capital = $obj.attr("data-capital"); //是否显示大写（针对金额）
            oItem.describe = $obj.attr("data-describe"); //提示文字
            oItem.cid = $obj.attr("data-id"); // 当前表单控件在当前表单中的唯一索引id
            oItem.field_options = JSON.parse($obj.attr("data-fieldoptions")); //表单控件的选择项（单选，多选等）
            oItem.field_name = $obj.attr("data-fieldName");  //字段名称

            //特殊字段的默认值
            switch (oItem.field_type){
                //日期区间
                case "datearea":
                    oItem.label2 = $obj.attr("data-label2") ||　"";
                    break;
                //文件
                case "file":
                    oItem.file_size = $obj.attr("data-filesize") || 20;
                    break;
                //明细
                case "group":
                    oItem.isWithoutAddButton = $obj.attr("data-isWithoutAddButton") || 'false';  //仅用于多个字段组合(不显示添加按钮)
                    delete oItem.required;
                    break;
                default:
                    //
            }
            return oItem;
        }
        /**
         * 创建表单最终生成的json
         * */
        ,createFormJson:function () {
            var t = this;
            //拼接表单json
            var formStyle = {
                fields:[]
            };
            t.$builderView.children(".filed-item").each(function() {
                var item = {};
                var _this = $(this);
                //收集要保存的各个字段
                item = t.setItemFields(_this);

                var type = _this.data("fieldtype");

                //如果是明细
                if (type === "group") {
                    item.group = {fields:[]};
                    _this.find(".filed-item").each(function(){
                        var _that = $(this);
                        var subItem = {};

                        //收集要保存的各个子项的字段
                        subItem = t.setItemFields(_that);

                        item.group.fields.push(subItem);
                    });

                }else if(type === "twoColumns"){  //如果是两列控件，这是个什么情说的飞
                    item.firstCol = {fields:[]}; //第一列的表单
                    item.secondCol = {fields:[]}; //第二列的表单

                    _this.find(".left").find(".filed-item").each(function(){
                        var _that = $(this);
                        var subItem = {};
                        //收集要保存的各个子项的字段
                        subItem = t.setItemFields(_that);
                        item.firstCol.fields.push(subItem);
                    });

                    _this.find(".right").find(".filed-item").each(function(){
                        var _that = $(this);
                        var subItem = {};
                        //收集要保存的各个子项的字段
                        subItem = t.setItemFields(_that);
                        item.secondCol.fields.push(subItem);
                    });
                }else if(type === "threeColumns"){  //如果是三列控件
                    item.firstCol = {fields:[]}; //第一列的表单
                    item.secondCol = {fields:[]}; //第二列的表单
                    item.thirdCol = {fields:[]}; //第三列的表单

                    _this.find(".left").find(".filed-item").each(function(){
                        var _that = $(this);
                        var subItem = {};
                        //收集要保存的各个子项的字段
                        subItem = t.setItemFields(_that);
                        item.firstCol.fields.push(subItem);
                    });

                    _this.find(".center").find(".filed-item").each(function(){
                        var _that = $(this);
                        var subItem = {};
                        //收集要保存的各个子项的字段
                        subItem = t.setItemFields(_that);
                        item.secondCol.fields.push(subItem);
                    });

                    _this.find(".right").find(".filed-item").each(function(){
                        var _that = $(this);
                        var subItem = {};
                        //收集要保存的各个子项的字段
                        subItem = t.setItemFields(_that);
                        item.thirdCol.fields.push(subItem);
                    });
                }

                formStyle.fields.push(item);
            });
            return formStyle;
        }
        /**
         * 保存数据之前把流程的json中的字段权限中的json更新一下
         * */
        ,updateAuditJson:function (formStyle,callback) {
            var t = this;
            //保存数据之前把流程的json中的字段权限中的json更新一下
            Ajax.ajax({
                url:gMain.apiBasePath + "wrReportTemp/getFormStyleForMongo.do"
                ,data:JSON.stringify({id:String(t.options.oFormEditData.form_id) ,mongoSymbol:"formStyle_table"})
                ,beforeSend:function () {
                    $("body").loading({zIndex:999999999}); //开启提交遮罩
                }
                ,complete:function () {
                    $("body").loading({state:false}); //关闭提交遮罩
                }
                ,success:function (data) {
                    if(data.result == "true"){
                        var sAuditStyle = ""; //流程的json
                        if(data.data){
                            // console.log(data.data)
                            // console.log(formStyle)
                            var aAudit = JSON.parse(data.data);  //流程列表
                            var aNew = []; //新的字段列表
                            for(var i=0;i<formStyle.fields.length;i++){
                                var oItem = {
                                    field_name:formStyle.fields[i].field_name
                                    ,isEdit:true
                                    ,isShow:true
                                };
                                aNew.push(oItem);
                            }
                            for(var i=0;i<aAudit.length;i++){
                                var aOld = i == "0"?aAudit[i].process_cc_field_permissions:aAudit[i].field_permissions;//i 等于0表示发起人的字段权限
                                var aNew2 = aNew.concat([]); //拷贝一份新的字段列表，并把原来审批人的字段权限的值再重新赋予进去
                                for(var j=0;j<aNew2.length;j++){
                                    for(var k=0;k<aOld.length;k++){
                                        if(aNew2[j].field_name == aOld[k].field_name){
                                            aNew2[j].isShow = aOld[k].isShow;
                                            aNew2[j].isEdit = aOld[k].isEdit;
                                        }
                                    }
                                }

                                //更新字段权限
                                if(i == "0"){
                                    aAudit[i].process_cc_field_permissions = aNew2;
                                }else{
                                    aAudit[i].field_permissions = aNew2;
                                }
                            }
                            sAuditStyle = JSON.stringify(aAudit);  //更新流程的json
                            typeof callback == "function" && callback(sAuditStyle);
                        }else{
                            typeof callback == "function" && callback();
                        }
                    }

                }

            });
        }
        //获取表单的基本填写信息,自定义增加
        ,getFormBaseInfo:function () {
            var t = this;
            return [
                {
                    key:"name"
                    ,value:$.trim(t.$formBuilderEdit.find("input[name='form_name']").val())  //流程表单名称
                }
                ,{
                    key:"org_ids"
                    ,value:t.$formBuilderEdit.find("input[name='org_ids']").attr("data-ids")  //应用范围ID
                }
                ,{
                    key:"org_names"
                    ,value:t.$formBuilderEdit.find("input[name='org_ids']").val()  //应用范围名称
                }
                ,{
                    key:"form_type"
                    ,value:"1"  //流程类型
                }
                ,{
                    key:"remark"
                    ,value:$.trim(t.$formBuilderEdit.find("textarea[name='remark']").val())  //流程类型
                }
            ];
        }
        /**
         * 更新表单和流程的json
         * @formStyle 表单json
         * @sAuditStyle 流程json 非必填
         * */
        ,updateFormAndAuditJson:function (formStyle,sAuditStyle) {
            var t = this;
            var sActionStr = t.options.editType=="add"?"新增":"修改";

            //拼接表单数据
            var oPostData = {
                infoSetId:t.options.oMetadata.options.infoSetId
                ,customParam:{
                    formStyle:JSON.stringify(formStyle)
                }
                ,dataList:t.getFormBaseInfo()
            };

            //当有流程json的是才提交流程json
            if(sAuditStyle){
                oPostData.customParam.auditStyle = sAuditStyle;
            }
            if(t.options.editType == "edit"){
                oPostData.uuid = t.$formBuilderEdit.find("input[name='uuid']").val();
                oPostData.dataList.push({
                    key:"form_id"
                    ,value:t.$formBuilderEdit.find("input[name='form_id']").val() //表单ID
                });
            }
            if(t.options.editType == "add"){
                oPostData.dataList.push({
                    key:"status"
                    ,value:"2" //未发布
                });
            }
            //保存数据
            Ajax.ajax({
                url:gMain.apiBasePath+(t.options.editType=="add"?"route/"+ oPostData.infoSetId+"/insert.do":"route/"+ oPostData.infoSetId +"/update.do"),
                data:JSON.stringify(oPostData),
                dataType:"json",
                beforeSend:function () {
                    $("body").loading({zIndex:999999999}); //开启提交遮罩
                },
                complete:function () {
                    $("body").loading({state:false}); //关闭提交遮罩
                },
                success:function(data) {
                    if (data.result == "true") {
                        tools.showMsg.ok(sActionStr + "成功"); //成功提示弹层
                        t.dialog.close().remove();  //关闭并取消弹窗
                        if(t.options.dialogParent){
                            t.options.dialogParent.close().remove();//关闭并取消上级弹窗
                        }
                        t.options.oMetadata.mmg.load();//重载表格数据
                    }
                }
            });
        }
        /**
         * 验证
         * */
        ,validataForm:function () {
            var t = this;
            //验证
            if(!$.trim(t.$formBuilderEdit.find('input[name="form_name"]').val())){
                tools.showMsg.error("表单名称不能为空");
                $("#formBuilder-myTab-fieldEdit > li:first").trigger("click");
                setTimeout(function () {
                    t.$formBuilderEdit.find('input[name="form_name"]').focus();
                },100);
                return false;
            }else{
                return true;
            }
        }
        /**
         * 保存数据
         * */
        ,saveData:function () {
            var t = this;
            var formStyle = t.createFormJson(); //表单字段集
            if(t.validataForm()){
                if(t.options.editType == "edit"){
                    t.updateAuditJson(formStyle,function (sAuditStyle) {
                        t.updateFormAndAuditJson(formStyle,sAuditStyle);
                    });
                }else{
                    t.updateFormAndAuditJson(formStyle);
                }
            }else{
                return false;
            }

        }
    };
    FormBuild.prototype = oPro;

    module.exports = FormBuild;
});
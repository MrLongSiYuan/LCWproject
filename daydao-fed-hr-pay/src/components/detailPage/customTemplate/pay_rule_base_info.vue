<style lang="scss" rel="stylesheet/scss">
    @import "css/ztree.skin";
    .detail-page-main-left-item-content{
        .ztree li span.button.bottom_docu{
            display: none;
        }
        .ztree li span.button.center_docu{
            display: none;
        }
        ul.detail-page-main-left-list{
            li.detail-page-main-left-list-item{
                height: 32px;
                padding: 0;
                margin-bottom: 10px;
                .list_left_title{
                    font-size: 14px;
                    color: #939BA6;
                    margin-right: 20px;
                    line-height: 32px;
                }
                .list_right_content{
                    display: inline-block;
                    font-size: 14px;
                    color: #657180;
                    line-height: 32px;
                }
                .ivu-tree-children{
                    li{
                        margin: 0;
                    }
                }
                .ivu-checkbox-disabled .ivu-checkbox-inner{
                    border-color: #c4ceda;
                    background-color: #f4f4f4;
                }
                .ivu-checkbox-checked .ivu-checkbox-inner,.ivu-checkbox-indeterminate .ivu-checkbox-inner {
                    background-color: #b2b8bf;
                    border-color: none;
                }
            }
        }
        .detail-edit-box{
            .ivu-form-item{
                &:nth-child(3){
                    margin-top: -46px;
                }
                &:nth-last-child(2){
                    margin-top: -102px;
                }
            }
            .pay_edit_begin_data_wrap{
                .pay_edit_begin_data_title{
                    display: inline-block;
                    margin-right: 10px;
                    font-size: 14px;
                    margin-left: 5px;
                }
                #daydao_drop_select-begin_date{
                    margin-left: 10px;
                }
            }
            .pay_edit_end_data_wrap{
                margin-top: 10px;
                #daydao_drop_select-end_date{
                    margin-left: 10px;
                }
                @extend .pay_edit_begin_data_wrap;
                .pay_edit_end_data_title{
                    @extend .pay_edit_begin_data_title;
                }
            }
        }
    }
</style>
<template>
    <!-- 编辑 -->
    <section class="detail-page-main-left-item" :class="'detaile-full-main-l-item-'+ tabIndex" v-if="templateItem.title">
        <h4>
           <!-- <em class="icon iconfont_daydao_common">&#xe615;</em>
            <span>{{templateItem.title}}</span>-->
            <i class="icon iconfont_daydao_common" v-if="templateItem.isEdit" @click="templateItem.isEdit = !templateItem.isEdit">&#xe69c;</i>
        </h4>
        <div class="detail-page-main-left-item-content">
            <!-- 非编辑状态 -->
            <div v-show="templateItem.isEdit">
                <ul class="detail-page-main-left-list" v-for="(blockItem, index) in templateItem.data" :key="index">
                    <li class="detail-page-main-left-list-item"
                        v-for="item in blockItem.data"
                        :key="item.uuid"
                        v-if="!(item.name=='parent_org_id' && item.value=='')"
                        v-show="!(item.name == 'begin_month' ||  item.name == 'begin_date' || item.name == 'end_month' || item.name == 'end_date')">
                            <span class="list_left_title" :title="item.title">{{item.title}}</span>
                            <template v-if="item.name != 'pay_org_id'">
                                <div class="list_right_content" :title="item.value">{{item | filterItemValue}}</div>
                            </template>
                            <template v-else-if="item.name == 'pay_org_id'">
                                <div class="list_right_content">
                                    <!--<Tree :data="iviwTreeData" show-checkbox multiple></Tree>-->
                                    <ul id="treePayRuleBaseSet" class="ztree"></ul>
                                </div>
                            </template>
                    </li>
                </ul>
            </div>
            <!-- 编辑状态 -->
            <div v-show="!templateItem.isEdit" class="detail-edit-box">
                <Form v-for="(blockItem, blockIndex) in templateItem.data" :key="blockIndex" ref="formCustom" :model="formCustom" :rules="ruleCustom">
                    <FormItem
                        v-for="(item, itemIndex) in blockItem.data"
                        v-if="!(item.name=='parent_org_id' && item.value=='')"
                        :key="itemIndex"
                        :label="item.title"
                        :prop="item.name"
                        :required="item.isMust"
                        :style="{height:item.cellType=='radio'?'32px':''}"
                        v-show="!(item.name == 'begin_month' ||  item.name == 'begin_date' || item.name == 'end_month' || item.name == 'end_date')">
                        <!---->
                        <!-- 文件框 -->
                        <Input v-if="(item.cellType=='text') && item.name != 'cell_phone'" v-model="item.value" :disabled="actionFlag" :maxlength="20" placeholder="请输入..."></Input>
                        <!-- <Input v-if="(item.name == 'parent_org_id' && item.value=='')" v-model="item.value" :maxlength="item.fieldSize" disabled></Input> -->

                        <!-- textarea -->
                        <Input v-if="item.cellType=='textarea'"
                               v-model="item.value"
                               :maxlength="item.fieldSize"
                               style="width: 280px"
                               :disabled="actionFlag"
                               type="textarea"
                               :rows="4"
                               placeholder="请输入..."></Input>
                        <template v-if="item.name == 'calculate_cycle'">
                            <div class="pay_edit_begin_data_wrap">
                                <div class="pay_edit_begin_data_title">开始</div>
                                <daydao-drop-select
                                    name="cycle_begin_month"
                                    :data="treeSelectData['begin_month']"
                                    :val="item.myDataValue.begin_month"
                                    @onSelected="setDropSelectData($event, 'begin_month',item.name)"
                                    ref="cycle_begin_month"
                                    :width="110"></daydao-drop-select>
                                <daydao-drop-select
                                    name="cycle_begin_date"
                                    :data="treeSelectData['begin_date']"
                                    :val="item.myDataValue.begin_date"
                                    @onSelected="setDropSelectData($event, 'begin_date',item.name)"
                                    ref="cycle_begin_date"
                                    :width="110"></daydao-drop-select>
                            </div>
                            <div class="pay_edit_end_data_wrap">
                                <div class="pay_edit_end_data_title">结束</div>
                                <daydao-drop-select
                                    name="cycle_end_month"
                                    :data="treeSelectData['end_month']"
                                    :val="item.myDataValue.end_month"
                                    @onSelected="setDropSelectData($event, 'end_month',item.name)"
                                    ref="cycle_end_month"
                                    :width="110"></daydao-drop-select>
                                <daydao-drop-select
                                    name="cycle_end_date"
                                    :data="treeSelectData['end_date']"
                                    :val="item.myDataValue.end_date"
                                    @onSelected="setDropSelectData($event, 'end_date',item.name)"
                                    ref="cycle_end_date"
                                    :width="110"></daydao-drop-select>
                            </div>
                        </template>
                        <!--日期处理 -->
                        <Date-picker v-if="item.cellType=='date'" :disabled="actionFlag" v-model="item.value" placeholder="请选择" class="text-filed-length" type="date"></Date-picker>

                        <!--下拉列表 -->
                        <daydao-drop-select v-if="(item.cellType=='treeSelect' || item.cellType=='treeAdviceSelect')"
                                            :isAllowOther="item.cellType=='treeAdviceSelect' ? true : false"
                                            :name="item.name"
                                            :data="item.treeSelectData"
                                            :val="item.valueId"
                                            :showVal="item.value"
                                            :isEdit="item.value!='' && !actionFlag"
                                            ref="daydaoDropSelect"></daydao-drop-select>

                       <daydao-drop-select-mul v-if="item.cellType=='treeMultipleSelect'"
                              ref="daydaoDropSelectMul"
                              placeholder="请选择" :onSelected="setDropSelectMulData"
                              :data="item.treeSelectData"
                              :val="(item.value && item.value.split(',')) || ['']"
                              :name="item.name"
                              :isEdit="!actionFlag"
                              :isShowContain="isShowContain"></daydao-drop-select-mul>

                        <i-switch v-if="item.cellType=='switch'" :disabled="actionFlag"  v-model="item.value" >
                            <span slot="open">是</span>
                            <span slot="close">否</span>
                        </i-switch>

                        <!-- Radio -->
                        <RadioGroup v-if="item.cellType=='radio'" v-model="item.value" :disabled="actionFlag">
                            <Radio v-for="radioItem in item.treeSelectData" :key="radioItem.id" :label="radioItem.name"></Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem class="detail-edit-box-btns">
                        <Button type="primary" :loading="actionFlag" @click="saveRowData('formCustom')">保存</Button>
                        <Button type="ghost" @click="cancelRowData">取消</Button>
                    </FormItem>
                </Form>
            </div>
        </div>
    </section>
</template>

<script>
import { daydaoDropSelect, daydaoDropSelectMul } from 'commonVueLib/daydaoDropSelect/index'
import  './jquery.ztree.all'

export default {
    name: "editPayRuleBaseInfo",
    props: {
        currentTabInfo:{
            type: Object,
            default() {
                return {}
            }
        },
        tabIndex: {
            type: Number,
            default: 0
        },
        customTemplateData:{
            type:Object,
            default(){
                return {};
            }
        }
    },
    components: {
        daydaoDropSelect,
        daydaoDropSelectMul
    },
    data() {
        return {
            isShowContain: true,
            actionFlag: false,   // 是否正在提交状态   false: 否     true: 提交中
            templateItem: {},   // 列表数据
            treeSelectData: {}, // 下拉框数据对象
            formCustom: {}, // 表单数据对象
            iviwTreeData:[],
            ruleCustom: {}, // 表单验证规则
            editListData: {}, // 编辑列表原始数据
            org_id: "",
            setting : {
                view: {
                    selectedMulti: false,
                    showIcon: false
                },
                check: {
                    enable: true,
                    autoCheckTrigger: true
                },
                edit:{
                    enable:false
                }
            },
            zTreeObjPay:null
        };
    },
    watch: {
        'editListData': {
            handler: function(newValue, oldValue) {
                if(!!oldValue.data) {
                    return false;
                }

                var t = this;
                t.templateItem = JSON.parse(JSON.stringify(newValue));
                t.initSelectTreeData(t.templateItem.data[0].data);
                t.handleSalaryCycle(t.templateItem.data[0].data)
            },
            deep: true
        }
    },
    created() {
        const t = this;
        t.templateItem = JSON.parse(JSON.stringify(t.$parent.sectionItem));
        t.editListData = JSON.parse(JSON.stringify(t.templateItem));
        // 初始化选项的下拉框选项
//        t.initSelectTreeData(t.templateItem.data[0].data);
        console.log(t.templateItem,"dddd")
        // 初始化表单数据和表单验证规则
        t.formatFormAndRuleCustom();
//        特殊处理计薪周期
        t.handleSalaryCycle(t.templateItem.data[0].data);
    },
    mounted(){
        const t = this;
    },
    filters: {
        filterItemValue(item) {
            if(item.cellType === 'switch') {
                return item.value ? '是' : '否';
            } else {
                return item.value
            }
        }
    },
    methods: {
        /*
        * 处理计薪周期
        * */
        handleSalaryCycle(items){
            var t = this;
            var beginDate,beginMonth,endDate,endMonth,salaryCycleIndex;
            items.forEach(function (val,index) {
                switch(val.name){
                    case "calculate_cycle":
                        salaryCycleIndex = index;
                        break;
                    case "begin_month":
                        beginMonth = val.valueId;
                        break;
                    case "begin_date":
                        beginDate = val.valueId;
                        break;
                    case "end_month":
                        endMonth = val.valueId;
                        break;
                    case "end_date":
                        endDate = val.valueId;
                        break;
                }
            })
            t.templateItem.data[0].data[salaryCycleIndex].myDataValue = {
                begin_month:beginMonth.toString(),
                begin_date:beginDate,
                end_month:endMonth.toString(),
                end_date:endDate
            }
        },
        /**
         * 初始化下拉框数据集
         */
        initSelectTreeData(items) {
            var _this = this;
            items.forEach(function(item,index) {
                // 变化数据时候改变refreshHeaderTitle
                if(item.name === 'rule_name') {
                    _this.$emit("refreshHeaderTitle", item.value);
                }
                // 应用范围特殊处理
                if(item.name == "pay_org_id"){
                    item.cellType = "treeMultipleSelect";
                    item.keyValueBean = {"infoSetId":"hr_org","keyId":"org_id","valueId":"org_name","parentId":"parent_org_id","tipId":null,"corpId":null,"conditionId":null,"conditionFieldId":null,"isDateFilter":false,"conditionBean":null,"orderBean":null,"orderStr":null,"filterStr":null,"openSize":null,"multiType":"G_zh-CN","isInner":true}
                }
                // 非select、radio不执行下面逻辑
                if (!(item.cellType == 'treeSelect' || item.cellType == 'radio' ||  item.cellType == 'treeMultipleSelect')) return false;

                // 如果对应的的下拉选择infosetid有下拉框时，不执行下面的逻辑
                if (_this.treeSelectData[item.keyValueBean.infoSetId] && _this.treeSelectData[item.keyValueBean.infoSetId].length > 0) {
                    item['treeSelectData'] = _this.treeSelectData[item.keyValueBean.infoSetId];
                    return false;
                }

                // 为treeSelect\radio时，获取选项数据
                _this.getKeyValueData({
                    data: item.keyValueBean,
                    success: function(data) {
                        item['treeSelectData'] = JSON.parse(JSON.stringify(data.beans));
                        _this.treeSelectData[item.name] = JSON.parse(JSON.stringify(data.beans));  // 保存起来，方便之后不再重复请求下拉框数据
                        if(item.name == 'pay_org_id'){
                            let selected = item.value.split(",");
                            _this.iviwTreeData = _this.transforIviewTreeData(data.beans,selected);

                            _this.zTreeObjPay = $.fn.newZTree.init($("#treePayRuleBaseSet"), _this.setting, _this.iviwTreeData);
                            var nodes = _this.zTreeObjPay.getNodes();
                            for (let i=0; i < nodes.length; i++) {
                                _this.zTreeObjPay.setChkDisabled(nodes[i], true,true,true);
                            }
                        }
                    }
                })
            })
        },
        /*
        * 转换为iviewTree数据
        * serverArr   原数组
        * selected    选中的值
        * */
        transforIviewTreeData(serverArr,selected) {
            const t = this;
            var backArr = [];
            if(serverArr.length != 0){
                serverArr.forEach(function (val,index) {
                    var isChoosed = false;
                    if(selected.indexOf(val.id) != -1){  //后台数据返回的id和下拉列表做对比
                        isChoosed = true;
                    }
                    var tempObj = {
                        name:val.name,
                        checked:isChoosed,
                        disableCheckbox: true,
                        selected:false
                    }
                    if(val.children && val.children.length != 0){
                        tempObj.children = t.transforIviewTreeData(val.children,selected);
                    }
                    backArr.push(tempObj);
                })
            }
            return backArr;
        },
        /**
         * 保存
         */
        saveRowData(name) {
            var _this = this,
                oSendObj = {};

            if(_this.actionFlag) return;
            _this.actionFlag = true;

            try {
                _this.formatFormAndRuleCustom(function() {
                    _this.$refs[name][0].validate((valid) => {
                        if (valid) {
                            saveFn();
                        } else {
                            //_this.$Message.error('表单验证失败!');
                            _this.actionFlag = false;
                            console.log('表单验证失败!');
                        }
                    })
                })
            }
            catch (e) {
                console.log(e.message);
                _this.actionFlag = false;
            }

            /**
             * 保存
             */
            function saveFn() {
                oSendObj.editCondition = _this.$parent.$parent.editCondition;
                oSendObj.infoSetId = _this.templateItem.templateId;

                oSendObj.dataList = formatSendData(_this.templateItem.data[0].data);
                if (oSendObj.dataList && oSendObj.dataList.length == 0) {
                    // 没有修改的数据，直接提示修改成功
                    _this.actionFlag = false;
                    _this.cancelRowData();
                    return _this.$Message.success('保存成功');
                }

                if (_this.templateItem.data[0].uuid) {
                    // 修改
                    oSendObj.uuid = _this.templateItem.data[0].uuid;  // 修改时加上uuid
                    _this.$daydao.$ajax({
                        url: gMain.apiBasePath + "route/" + oSendObj.infoSetId + "/update.do",
                        data: JSON.stringify(oSendObj),
                        success: function(data) {
                            // 保存失败
                            if (data.result != "true") {
                                _this.actionFlag = false;
                                _this.$Message.error(data.resultDesc);
                                return;
                            }

                            // 保存成功
                            oSendObj.dataList.forEach((item)=>{
                                // 组织名称，用于组织详情列表更新
                                if(item.key == 'rule_name') _this.$emit("refreshHeaderTitle", item.value);
                            });

                            _this.actionFlag = false;
                            _this.$Message.success('保存成功');
                            new Promise(function(resolve, reject) {
                                _this.getDetailOptionData(resolve);
                            }).then(function(data) {
                                _this.cancelRowData();
                            });
                        }
                    });
                }
                else {
                    // 新增
                    oSendObj.isEditTemplateInsert = true;
                    oSendObj.dataList.push(_this.$parent.$parent.editCondition);
                    _this.$daydao.$ajax({
                        url: gMain.apiBasePath + "route/" + oSendObj.infoSetId + "/insert.do",
                        data: JSON.stringify(oSendObj),
                        success: function(data) {
                            // 保存失败
                            if (data.result != "true") {
                                _this.actionFlag = false;
                                _this.$Message.error(data.resultDesc);
                                return;
                            }

                            // 保存成功
                            oSendObj.dataList.forEach((item)=>{
                                // 组织名称，用于组织详情列表更新
                                if(item.key == 'rule_name') _this.$emit("refreshHeaderTitle", item.value);
                            });

                            _this.actionFlag = false;
                            _this.$Message.success('保存成功');
                            _this.getDetailOptionData();
                            _this.cancelRowData();
                        }
                    });
                }
            }

            /**
             * 格式化详情列表数据
             */
            function formatSendData(items) {
                var arr = [];
                var t = _this;
                try {
                    items.forEach(function(item,index) {
                        if (item.cellType == 'treeAdviceSelect' || item.cellType == 'treeSelect') {
                            // 下拉框
                            if(t.editListData.data[0].data[index].valueId != $('input[name=cycle_' + item.name + ']').val()){   //有改变才填值
                                arr.push({
                                    key: item.name,
                                    value: $('input[name=cycle_' + item.name + ']').val()
                                })
                            }
                        }else if(item.cellType == 'treeMultipleSelect'){  //应用范围
                            if(t.editListData.data[0].data[index].value != t.templateItem.data[0].data[index].value){   //有改变才填值
                                arr.push({
                                    key: item.name,
                                    value: t.templateItem.data[0].data[index].value
                                })
                            }
                        } else if(item.cellType == 'switch') {
                            if(t.editListData.data[0].data[index].value != t.templateItem.data[0].data[index].value){
                                arr.push({
                                    key: item.name,
                                    value: item.value === true ? 1 : 0
                                })
                            }
                        }else if(item.cellType == 'radio') {
                            if(t.editListData.data[0].data[index].value != t.templateItem.data[0].data[index].value){
                                arr.push({
                                    key: item.name,
                                    value: item.value === "是" ? 1 : 0
                                });
                            }

                        } else {
                            if(t.editListData.data[0].data[index].value != t.templateItem.data[0].data[index].value){
                                arr.push({
                                    key: item.name,
                                    value: item.value
                                });
                            }
                        }

                    })
                }
                catch (e) {
                    console.log(e.message)
                }
                return arr;
            }

            /**
             * 判断是否有修改的数据
             */
            function uniqData(key, value) {
                let isUniq = true,
                    obj = JSON.parse(JSON.stringify(_this.editListData));

                if (_this.templateItem.data[0].uuid) {
                    // 修改，去除没有变更的数据
                    for (var i = 0; i < obj.data[0].data.length; i++) {

                        if (obj.data[0].data[i].name == key && obj.data[0].data[i].value == value) {
                            isUniq = false;
                            continue
                        }
                    }
                }
                else {
                    // 新增，去除为空的数据
                    if (!value) isUniq = false;
                }

                return isUniq;
            }

            /*
             * check dateType
             * return {forat:"" , dateType:""}
             */
            function checkDateType(sDateType) {
                var format = "yyyy-MM-dd",
                    dateType = "date";

                if (sDateType == "datetime") {
                    format = "yyyy-MM-dd HH:mm:ss";
                    dateType = "datetime"
                }
                else if (sDateType == "date_worktime") {
                    format = "H:mm";
                    dateType = ""
                } else if (sDateType == "date_yyyy_MM_dd_HH_mm") {
                    format = "yyyy-MM-dd HH:mm";
                    dateType = "datetime"
                } else if (sDateType == "date_yyyy_MM_dd_HH") {
                    format = "yyyy-MM-dd HH";
                    dateType = "datetime";
                } else if (sDateType == "date_yyyy_MM") {
                    format = "yyyy-MM";
                    dateType = "month"
                } else if (sDateType == "date_yyyy") {
                    format = "yyyy";
                    dateType = "year"
                }
                let result = {
                    'format': format,
                    'dateType': dateType
                }

                return result
            }


            function dateFormat(date, format) {
                if (typeof date == 'string') return date;

                if (format === undefined) {
                    format = date;
                    date = new Date();
                }
                var map = {
                    "M": date.getMonth() + 1,//月份
                    "d": date.getDate(),//日
                    "h": date.getHours(),//小时
                    "m": date.getMinutes(),//分
                    "s": date.getSeconds(),//秒
                    "q": Math.floor((date.getMonth() + 3) / 3),//季度
                    "S": date.getMilliseconds()//毫秒
                };
                format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
                    var v = map[t];
                    if (v !== undefined) {
                        if (all.length > 1) {
                            v = '0' + v;
                            v = v.substr(v.length - 2);
                        }
                        return v;
                    } else if (t === 'y') {
                        return (date.getFullYear() + '').substr(4 - all.length);
                    }
                    return all;
                });
                return format;
            }
        },
        /**
         * 取消
         */
        cancelRowData() {
            var t = this;
            t.templateItem = JSON.parse(JSON.stringify(t.editListData));
            // 初始化选项的下拉框选项
            t.initSelectTreeData(t.templateItem.data[0].data);
            t.handleSalaryCycle(t.templateItem.data[0].data)
        },
//        点击选择下拉
        setDropSelectData: function(node, name,wrapNmae) {
            console.log(node, name,wrapNmae);
            var t = this;
            t.templateItem.data[0].data.forEach(function(item, index) {
                if (item.name == name) {
                    t.templateItem.data[0].data[index].value = node.value || '';
                }
            });
            if(wrapNmae &&  wrapNmae == "calculate_cycle"){
                t.templateItem.data[0].data.forEach(function (item,index) {
                    if(item.name == "calculate_cycle"){
                        t.templateItem.data[0].data[index].myDataValue[name] = node.value;
                        //计薪周期全部选择
                        if( t.templateItem.data[0].data[index].myDataValue.begin_month && t.templateItem.data[0].data[index].myDataValue.begin_date && t.templateItem.data[0].data[index].myDataValue.end_month && t.templateItem.data[0].data[index].myDataValue.end_date){
                            t.templateItem.data[0].data[index].tag = "true";
                        }
                    }

                })
            }
        },
        //应用范围设置value值
        setDropSelectMulData: function(node) {
            console.log(node);
            var t = this;
            t.templateItem.data[0].data.forEach(function(item, index) {

                if (item.name == "pay_org_id") {
                    if(node){
                        t.templateItem.data[0].data[index].value = node.ids.join(',') || '';
                    }else{
                        t.templateItem.data[0].data[index].value = "";
                    }
                }
            });
        },
        /**
         * 获取下拉键值对
         * @options.data
         * @options.success
         * */
        getKeyValueData(options) {

            this.$daydao.$ajax({
                url: gMain.apiBasePath + "route/getKeyValueData.do",
                data: JSON.stringify(options.data),
                beforeSend: function() {
                    //typeof options.beforeSend == "function" && options.beforeSend();
                },
                complete: function() {
                    //typeof options.complete == "function" && options.complete();
                },
                success: function(data) {
                    if (data.result == "true") {
                        typeof options.success == "function" && options.success(data);
                    }
                }
            });
        },
        /**
         * 获取单个模版数据
         * templateId 模版id
         * isEdit  是否为只可编辑的模版
         */
        getDetailOptionData(resolve) {
            var _this = this,
                oSendObj = {    // 请求子模块数据条件
                    infoSetId: _this.templateItem.templateId,
                    editCondition: _this.$parent.$parent.editCondition
                };

            _this.$daydao.$ajax({
                url: gMain.apiBasePath + "route/" + _this.templateItem.templateId + "/getEditDataAndColumn.do",
                data: JSON.stringify(oSendObj),
                success: function(data) {
                    var dataBeans = data.beans[0];
                    dataBeans.data.forEach(function(item) {
                        var arr = [];
                        dataBeans.columnEdit.forEach(function(columnItme) {

                            if (!columnItme.isEditShow) return;

                            if(columnItme.cellType == 'checkbox'){
                                // 多选框
                                arr.push({
                                    title: columnItme.title,
                                    name: columnItme.name,
                                    cellType: columnItme.cellType,
                                    keyValueBean: columnItme.keyValueBean,
                                    isMust: columnItme.isMust,
                                    regExpress: columnItme.regExpress,
                                    isEditShow: columnItme.isEditShow,
                                    fieldSize: columnItme.fieldSize,
                                    fieldType: columnItme.fieldType,
                                    isDisabled: false,
                                    value: item[columnItme.name] == '1' ? true : false
                                })
                            }
                            else if(columnItme.cellType == 'switch'){
                                // 开关
                                arr.push({
                                    title: columnItme.title,
                                    name: columnItme.name,
                                    cellType: columnItme.cellType,
                                    keyValueBean: columnItme.keyValueBean,
                                    isMust: columnItme.isMust,
                                    regExpress: columnItme.regExpress,
                                    isEditShow: columnItme.isEditShow,
                                    fieldSize: columnItme.fieldSize,
                                    fieldType: columnItme.fieldType,
                                    isDisabled: false,
                                    value: item[columnItme.name] == '是' ? true : false
                                })
                            }
                            else{
                                if(columnItme.name == "begin_month" || columnItme.name == "end_month" || columnItme.name == "end_date" || columnItme.name == "begin_date"){   // 起始日/结束日
                                    arr.push({
                                        title: columnItme.title,
                                        name: columnItme.name,
                                        cellType: columnItme.cellType,
                                        keyValueBean: columnItme.keyValueBean,
                                        isMust: columnItme.isMust,
                                        regExpress: columnItme.regExpress,
                                        isEditShow: columnItme.isEditShow,
                                        fieldSize: columnItme.fieldSize,
                                        fieldType: columnItme.fieldType,
                                        isDisabled: false,
                                        value: item[columnItme.name] || '',
                                        valueId:item[columnItme.name+'_id']
                                    })
                                }else if(columnItme.name == "calculate_cycle"){
                                    arr.push({
                                        title: columnItme.title,
                                        name: columnItme.name,
                                        cellType: columnItme.cellType,
                                        keyValueBean: columnItme.keyValueBean,
                                        myDataValue :{
                                            begin_month:'',
                                            begin_date:'',
                                            end_month:'',
                                            end_date:''
                                        },
                                        isMust: columnItme.isMust,
                                        regExpress: columnItme.regExpress,
                                        isEditShow: columnItme.isEditShow,
                                        fieldSize: columnItme.fieldSize,
                                        fieldType: columnItme.fieldType,
                                        isDisabled: false,
                                        value: item[columnItme.name] || ''
                                    })
                                }else {
                                    // 其它...
                                    arr.push({
                                        title: columnItme.title,
                                        name: columnItme.name,
                                        cellType: columnItme.cellType,
                                        keyValueBean: columnItme.keyValueBean,
                                        isMust: columnItme.isMust,
                                        regExpress: columnItme.regExpress,
                                        isEditShow: columnItme.isEditShow,
                                        fieldSize: columnItme.fieldSize,
                                        fieldType: columnItme.fieldType,
                                        isDisabled: false,
                                        value: item[columnItme.name] || ''
                                    })
                                }
                            }
                        });
                        _this.editListData.data[0].data = arr;
                        if(resolve){
                            resolve(data);
                        }
                    })
                }
            })
        },
        /**
         * 格式化表单数据和表单验证规则
         */
        formatFormAndRuleCustom(endFn) {
            var _this = this;
            _this.templateItem.data[0].data.forEach((item) => {
                let key = item.name,
                    val = item.value;
                // 表单数据对象
                if (item.cellType == 'date' || item.cellType == 'time' || item.cellType == 'dateTime') {
                    _this.formCustom[key] = _this.formatCustomDate(val, item.cellType);   //转化为yy-mm..的时间格式
                }
                else if (item.cellType == 'treeSelect' || item.cellType == 'treeAdviceSelect') {
                    //_this.formCustom[key] = $('input[name="'+item.name+'"]').parent().find('.daydao_drop_select_input').val();
                    _this.formCustom[key] = $('input[name="'+item.name+'"]').val();
                }
                else if (item.cellType == 'treeMultipleSelect') {
                    //_this.formCustom[key] = $('input[name="'+item.name+'"]').parent().find('.daydao_drop_select_input').val();
                    let ele = $('input[name="'+item.name+'"]').val()
                    _this.formCustom[key] = ele && ele.split(',')
                }
                else {
                    _this.formCustom[key] = val;
                }

                // 表单验证规则
                _this.ruleCustom[key] = []
                if (item.isMust && item.name!='parent_org_id') {    // 必填
                    let json = { required: true };

                    if (!item.cellType || item.cellType == 'text' || item.cellType == 'textarea') {
                        // 文本框
                        json.message = item.title + '不能为空';
                        //json.trigger = 'blur';
                    }
                    else if (item.cellType == 'date') {
                        // 日期
                        json.message = '请选择' + item.title;
                        //json.trigger = 'change';
                    }
                    else if (item.cellType == 'treeAdviceSelect' || item.cellType == 'treeSelect' || item.cellType == 'treeMultipleSelect') {
                        // 下拉选择框
                        json.message = '请选择' + item.title;
                        //json.trigger = 'change';
                    }
                    else if (item.cellType == 'radio') {
                        // 单选框
                        json.message = '请选择' + item.title;
                        //json.trigger = 'change';
                    }
                    else if (item.cellType == 'checkbox') {
                        // 复选框
                        json.min = 1;
                        json.message = '至少选择一个' + item.title;
                        //json.trigger = 'change';
                    }
                    else {
                        console.log('未知的类型，将配置成blur验证规则');
                        json.message = item.title + '不能为空';
                        //json.trigger = 'blur';
                    }

                    _this.ruleCustom[key].push(json);
                }else if(item.name=='parent_org_id'){
                    if(item.value !=''){
                        // 不是顶级节点
                        let json2 = { required: true };
                        json2.message = '请选择' + item.title;
                    }
                }

                if (item.regExpress) {    // 获取的数据中有验证规则
                    let json = {};

                    json.pattern = eval('(' + '/' + item.regExpress + '/' + ')');
                    json.message = item.title + '格式不正确';
                    if (!item.cellType || item.cellType == 'text' || item.cellType == 'textarea') {
                        // 文本框
                        //json.trigger = 'false';
                    }
                    else if (item.cellType == 'date') {
                        // 日期
                        //json.trigger = 'change';
                    }
                    else if (item.cellType == 'treeAdviceSelect' || item.cellType == 'treeSelect') {
                        // 下拉选择框
                        //json.trigger = 'change';
                    }
                    else if (item.cellType == 'radio') {
                        // 单选框
                        //json.trigger = 'change';
                    }
                    else if (item.cellType == 'checkbox') {
                        // 复选框
                        //json.trigger = 'change';
                    }
                    else {
                        console.log('未知的类型，将配置成blur验证规则');
                        //json.trigger = 'blur';
                    }

                    _this.ruleCustom[key].push(json);
                }
            })

            endFn && endFn();
        },
        /**
         * 格式化日期对象
         * date 时间对象
         * type 时间类型
         */
        formatCustomDate(date, type) {
            if (!date) return '';

            let str = '',
                oDate = new Date(date),
                year = oDate.getFullYear(),
                month = oDate.getMonth() + 1,
                day = oDate.getDate(),
                hours = oDate.getHours(),
                minutes = oDate.getMinutes(),
                seconds = oDate.getSeconds(),
                toDou = function(n) {
                    return n = n < 10 ? '0' + n : n;
                };


            if (type == 'date') {
                // 日期 yyyy-MM-dd
                str = year + '-' + toDou(month) + '-' + toDou(day);
            }
            else if (type == 'time') {
                // 时间 HH:mm:ss
                str = toDou(hours) + ':' + toDou(minutes) + ':' + toDou(seconds);
            }
            else if (type == 'dateTime') {
                // 日期+时间 yyyy-MM-dd HH:mm:ss
                str = year + '-' + toDou(month) + '-' + toDou(day) + ' ' + toDou(hours) + ':' + toDou(minutes) + ':' + toDou(seconds);
            }
            else {
                console.log('未知的时间类型：' + type);
            }

            return str;
        }
    }
}
</script>

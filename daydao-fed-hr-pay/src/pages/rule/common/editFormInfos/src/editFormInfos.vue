<style lang="scss" rel="stylesheet/scss">
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
.person-info-list .item-width {
    width: 48%;
}

.form-item-width {
    width: 210px;
}

.bottom-content {
    width: 100%;
    margin-left: 0;
}

.bottom-left-content {
    position: absolute;
    left: -90px;
}

.bottom-right-content {
    display:inline-block;
    position: absolute;
    right: 60px;
}
.content_wrapper {
    height: 100%;
    height: calc(100% - 160px);
    height: -ms-calc(100% - 160px);
    height: -moz-calc(100% - 160px);
    overflow-y: auto;
    overflow-x:hidden;
    .ztree li span.button.bottom_docu{
        display: none;
    }
    .ztree li span.button.center_docu{
        display: none;
    }
}
</style>
<template>
    <div class="content_wrapper">
        <Form :model="tempEditTpl" ref="tempEditTpl" :label-width="labelWidth" :rules="formRules" style="margin-top:20px;" inline :show-message="isShowErrorTips">
            <Form-item v-for="(item,index) in tempEditTpl.editTpl" :key="item.id" :label="item.title" :prop="'editTpl.'+index+'.tag'" :required="item.isMust" :style="incenter"  v-show="!(item.name == 'begin_month' ||  item.name == 'begin_date' || item.name == 'end_month' || item.name == 'end_date')">
<!---->
                <Input v-if="item.cellType=='text'" :name="item.name" v-model="item.tag" style="width: 280px" :maxlength="20"></Input>

                <DatePicker format="yyyy-MM-dd" v-if="item.cellType=='date'" placeholder="请选择" :editable="false" type="date" v-model="item.tag" :style="inputWidthObj"></DatePicker>

                <daydao-drop-select v-if="item.cellType=='treeSelect'" :name="item.name" :data="dropSelectDatas[item.name]" :val="item.tag" @onSelected="setDropSelectData($event, item.name)" :ref="item.name" :isEdit="isEditAble" :width="inputWidth"></daydao-drop-select>

                <daydao-drop-select-mul v-if="item.cellType=='treeMultipleSelect'"
                    ref="daydaoDropSelectMul"
                    :onSelected="setDropSelectMulData"
                    placeholder="请选择"
                    :data="dropSelectDatas[item.name]"
                    :val="item.tag ? item.tag.split(',') : ['']"
                    :name="item.name"
                    :isEdit="isEditAble"
                    :width="280"
                    :isShowContain="isShowContain"></daydao-drop-select-mul>
                <Input v-if="item.cellType=='textarea'" type="textarea" :rows="4" class="text-filed-length" v-model="item.tag" :name="item.name"  style="width: 280px"></Input>
                <i-switch v-if="item.cellType=='switch'" v-model="item.tag"></i-switch>
                <RadioGroup v-if="item.cellType=='radio' && item.name=='is_init'" v-model="item.tag">
                    <Radio label="是"></Radio>
                    <Radio label="否"></Radio>
                </RadioGroup>
                <template v-if="item.name == 'calculate_cycle'">
                    <div class="pay_edit_begin_data_wrap">
                        <div class="pay_edit_begin_data_title">开始</div>
                        <daydao-drop-select
                            name="cycle_begin_month"
                            :data="dropSelectDatas['begin_month']"
                            :val="item.myDataValue.begin_month"
                            @onSelected="setDropSelectData($event, 'begin_month',item.name)"
                            ref="cycle_begin_month"
                            :isEdit="isEditAble"
                            :width="110"></daydao-drop-select>
                        <daydao-drop-select
                            name="cycle_begin_date"
                            :data="dropSelectDatas['begin_date']"
                            :val="item.myDataValue.begin_date"
                            @onSelected="setDropSelectData($event, 'begin_date',item.name)"
                            ref="cycle_begin_date"
                            :isEdit="isEditAble"
                            :width="110"></daydao-drop-select>
                    </div>
                   <div class="pay_edit_end_data_wrap">
                       <div class="pay_edit_end_data_title">结束</div>
                       <daydao-drop-select
                           name="cycle_end_month"
                           :data="dropSelectDatas['end_month']"
                           :val="item.myDataValue.end_month"
                           @onSelected="setDropSelectData($event, 'end_month',item.name)"
                           ref="cycle_end_month"
                           :isEdit="isEditAble"
                           :width="110"></daydao-drop-select>
                       <daydao-drop-select
                           name="cycle_end_date"
                           :data="dropSelectDatas['end_date']"
                           :val="item.myDataValue.end_date"
                           @onSelected="setDropSelectData($event, 'end_date',item.name)"
                           ref="cycle_end_date"
                           :isEdit="isEditAble"
                           :width="110"></daydao-drop-select>
                   </div>
                </template>
            </Form-item>
            <Form-item class="bottom-content">
                <!-- <Button type="primary" :loading="actionFlag" @click="validate(2)">保存</Button> -->
                <div class="bottom-right-content">
                    <Button type="primary" :loading="actionFlag" @click="validate(2)">提交</Button>
                    <Button type="ghost" @click="cancelOperate" style="margin-left: 10px">取消</Button>
                </div>

            </Form-item>
        </Form>
        <Spin size="large" fix v-if="isShowSpin"></Spin>
    </div>
</template>
<script>
// 编辑表单信息
import { daydaoDropSelect, daydaoDropSelectMul } from "commonVueLib/daydaoDropSelect/index"
import Utils from "commonVueLib/utils/index"
export default {
    name: "editFormInfos",
    components: {
        daydaoDropSelect,
        daydaoDropSelectMul
    },
    props: {
        infoSetId: {
            type: String,
            default: ""
        }
        ,inputWidth: {
            type: Number
            ,default: 210
        }
        ,labelWidth: {
            type: Number
            ,default: 112
        },isShow: {
            type: Boolean,
            default: false
        },
        isCopyRule:{        //是否为复制规则
            type: Object,
            default(){
                return {
                    state: false,
                    item: {}
                }
            }
        }
    },
    data:function() {
        var _this = this;
        return {
            isShowContain: true,
            actionFlag: false,   // 是否正在提交状态   false: 否     true: 提交中
            actionContinueFlag:false, // 继续保存的提交状态 false:否， true:提交中
            inputWidthObj: {
                width: _this.inputWidth + 'px'
            },
            incenter: {
                marginLeft: (660 - _this.inputWidth - _this.labelWidth) / 2 - 40 + 'px'
            }
            ,tempEditTpl: {
                editTpl: []
            }
            ,emptyTempEditTpl:{}  //存规则的空表单
            // 缓存数据
            ,cacheEditDatas: {
                editTpl: [],
                needReloadDropSelect: [] // 需要重新请求下拉框的对象
            }
            ,formRules: {

            }
            ,dropSelectDatas: {
                begin_date: []
                ,begin_month: []
                ,end_date: []
                ,end_month: []
                ,pay_org_id: []
            }
            ,isShowSpin: true
            ,isEditAble: true
            ,isShowErrorTips: false
        }
    },
    computed:{
    },
    watch:{
        isShow(val,oldVal){
            const t = this;
            if(!val) {  //退出
                // 清空daydaoDropSelectMul
                t.clearDaydaoDropSelectMul();
//                清空计薪周期
                t.clearalCulateCycle();

            };
            // self.tempEditTpl.editTpl = self.cacheEditDatas.editTpl;
        },
        isCopyRule:function(val,oldVal){
            const _this = this;
            if(val.state){
                _this.emptyTempEditTpl = Object.assign({},_this.tempEditTpl); //将初始的表单保存
                _this.tempEditTpl.editTpl.find(function (value,index) {
                    switch (value.name){
                        case "rule_name":
                            _this.tempEditTpl.editTpl[index].tag = val.item.rule_name;
                            break;
                        case "calculate_cycle":
                            _this.tempEditTpl.editTpl[index].tag = "true";
//                            月份要传ID
                            _this.tempEditTpl.editTpl[index].myDataValue.begin_date = val.item.begin_date_id;
                            _this.tempEditTpl.editTpl[index].myDataValue.begin_month = val.item.begin_month_id.toString();
                            _this.tempEditTpl.editTpl[index].myDataValue.end_date = val.item.end_date_id;
                            _this.tempEditTpl.editTpl[index].myDataValue.end_month = val.item.end_month_id.toString();
                            break;
                        case "is_init":
                            _this.tempEditTpl.editTpl[index].tag = val.item.is_init;
                            break;
                        case "remark":
                            _this.tempEditTpl.editTpl[index].tag = val.item.remark;
                            break;
                        case "begin_month":
                            _this.tempEditTpl.editTpl[index].tag = val.item.begin_month_id.toString();
                            _this.$refs.cycle_begin_month[0].setValue(val.item.begin_month_id.toString());
                            break;
                        case "begin_date":
                            _this.tempEditTpl.editTpl[index].tag = val.item.begin_date;
                            break;
                        case "end_date":
                            _this.tempEditTpl.editTpl[index].tag = val.item.end_date;
                            break;
                        case "end_month":
                            _this.tempEditTpl.editTpl[index].tag = val.item.end_month_id.toString();
                            _this.$refs.cycle_end_month[0].setValue(val.item.end_month_id.toString());
                            break;
                        case "pay_org_id":
                            _this.tempEditTpl.editTpl[index].tag = val.item.pay_org_id;
                            _this.$refs.daydaoDropSelectMul[0].setValue(val.item.pay_org_id);   //初始化应用范围里面的值
                            break;
                    }
                });
                _this.tempEditTpl.editTpl = JSON.parse(JSON.stringify(_this.tempEditTpl.editTpl));
            }else{   //新增
                _this.initEditDatas(_this.infoSetId);
            }
        }
    },
    mounted:function() {
        this.initEditDatas(this.infoSetId);
    },
    methods: {
        initEditDatas: function(infoSetId) {
            var _this = this;
            _this.tempEditTpl.editTpl = [];// 置空编辑模板
            // _this.formRules = {};//置空规则
            // 需要重新请求
            _this.isShowSpin = true;
            _this.$daydao.$ajax({
                url: gMain.apiBasePath + "route/" + infoSetId + "/getTableColumn.do",
                data: JSON.stringify({ infoSetId: infoSetId }),
                success: function(data) {
                    if (data.result == 'true') {
                        _this.isShowSpin = false;
                        data.columnEdit.find((item, num) => {
                            if(item.name == "pay_org_id"){  // 应用范围特殊处理
                                data.columnEdit[num].cellType = "treeMultipleSelect";
                                data.columnEdit[num].keyValueBean = {"infoSetId":"hr_org","keyId":"org_id","valueId":"org_name","parentId":"parent_org_id","tipId":null,"corpId":null,"conditionId":null,"conditionFieldId":null,"isDateFilter":false,"conditionBean":null,"orderBean":null,"orderStr":null,"filterStr":null,"openSize":null,"multiType":"G_zh-CN","isInner":true}
                            }
                            if(item.name == "calculate_cycle"){  //计薪周期
                                data.columnEdit[num].myDataValue = {
                                    begin_month:'0',
                                    begin_date:'1',
                                    end_month:'0',
                                    end_date:'31'
                                };
                            }
                        })
                        _this.editTplFilter(data.columnEdit);
                    }

                }
            });
        }
        // 编辑数据过滤
        ,editTplFilter: function(oDatas) {
            var _this = this;
            oDatas.forEach(function(item, index) {
                // 可编辑的数据
                if (item.isEditShow) {
                    _this.tempEditTpl.editTpl.push(item);
                    var realIndex = _this.tempEditTpl.editTpl.length - 1;
                    _this.formRules['editTpl.' + realIndex + '.tag'] = [];
                    if (item.regExpress) {
                        const validator = (rule, value, callback) => {
                            const reg = new RegExp(item.regExpress);
                            if (!reg.test(value)) {
                                callback(new Error(item.title + '格式错误!'));
                            } else {
                                callback();
                            }
                        }
                        _this.formRules['editTpl.' + realIndex + '.tag'].push({ validator: validator, trigger: 'change' });
                    }

                    //  必填规则
                    if (item.isMust) {
                        //必填规则 根据不同类型添加不同校验规则  editColumnsArray.0.tag
                        const validator = (rule, value, callback) => {
                            if (value == '' && _this.isShowErrorTips) {
                                callback(new Error('不能为空!'));
                            } else {
                                callback();
                            }
                        }
                        _this.formRules['editTpl.' + realIndex + '.tag'].push({ validator: validator, trigger: 'change' });
                    }
                    if (item.cellType === 'treeSelect' || item.cellType === 'treeMultipleSelect') {
                        // 特殊请求：新增职位 的所属组织使用新版的权限组织树
                        if ((_this.infoSetId && _this.infoSetId == 'pos_list' && item.name == 'org_id') || (_this.infoSetId && _this.infoSetId == 'org_list' && item.name == 'parent_org_id')) {
                            // 目前只有上级组织需要重新请求,缓存重新需要请求item
                            if (_this.infoSetId && _this.infoSetId == 'org_list' && item.name == 'parent_org_id') {
                                _this.cacheEditDatas.needReloadDropSelect.push(item);
                            }
                            new Promise(function(resolve, reject) {
                                _this.getSpecialKeyValue(resolve, item);
                            }).then(function(data) {
                                _this.dropSelectDatas[data.item.name] = data.data;
                            });
                        } else {
                            // 常规下拉框的请求
                            if (item.keyValueBean) {
                                new Promise(function(resolve, reject) {
                                    _this.getKeyValue(resolve, item.keyValueBean, item);
                                }).then(function(data) {
                                    _this.dropSelectDatas[data.item.name] = data.beans;
                                });
                            }
                        }

                    } else if(item.cellType == 'switch') {
                        item.tag = false
                    } else if(item.cellType == 'radio'){
                        item.tag = "是"
                    }
                }
            });
            _this.cacheEditDatas.editTpl = JSON.parse(JSON.stringify(_this.tempEditTpl.editTpl));// 保留编辑模板 不再做多次请求
            console.log(_this.tempEditTpl, _this.formRules);
        },
        // 特殊请求
        /*
        @params resolve :promise 的成功回调
        @params specialItem 对应编辑项的全部数据
        */
        getSpecialKeyValue: function(resolve, specialItem) {
            var _this = this;
            var url = "org/getOrgPermissionTree.do"; // 请求对应的参数
            var params = {};
            /*switch (specialItem.name) {
                case "org_id":
                    params = {
                        archive: false
                    }
                    url = "org/getOrgPermissionTree.do";
                    break;
                case "parent_org_id":
                    params = {
                        archive: false
                    }
                    url = "org/getOrgPermissionTree.do";
                    break;
                default:
                    cosnole.log("不存在编辑模板的name值");
            }*/
            if(specialItem.name == "org_id" || specialItem.name == "parent_org_id"){
                params = {
                    archive: false
                }
                url = "org/getOrgPermissionTree.do";
            }else {
                cosnole.log("不存在编辑模板的name值");
            }
            _this.$daydao.$ajax({
                url: gMain.apiBasePath + url,
                data: JSON.stringify(params),
                success: function(data) {
                    data['item'] = specialItem;
                    resolve(data);
                }
            });
        },
        getKeyValue: function(resolve, keyValueBean, item) {
            var _this = this;
            _this.$daydao.$ajax({
                url: gMain.apiBasePath + "route/getKeyValueData.do"
                , data: JSON.stringify(keyValueBean)
                , success: function(data) {
                    if (data.result == 'true') {
                        data['item'] = item;
                        resolve(data);
                    }

                }
            });
        }
        // 根据缓存下拉框item，重新请求的下拉框数据
        ,reloadNewDropSelectDatas: function() {
            var _this = this;
            _this.tempEditTpl.editTpl = _this.cacheEditDatas.editTpl; // 使用缓存数据
            _this.$refs.tempEditTpl.resetFields();// 重置，将所有字段值重置为空并移除校验结果
            _this.cacheEditDatas.needReloadDropSelect.forEach(function(reloadItem, index) {
                new Promise(function(resolve, reject) {
                    _this.getSpecialKeyValue(resolve, reloadItem);
                }).then(function(data) {
                    _this.dropSelectDatas[data.item.name] = data.data;
                });
            });
        }
        // 保存 和保存并继续新增事件
        , validate: function(type) {
            var _this = this;
            _this.isShowErrorTips = true;
            _this.$refs.tempEditTpl.validate((valid) => {
                if (valid) {
                    this.saveAdd(type);
                }
            });
        }
        ,saveAdd: function(type) {
            var _this = this;
            //console.log(this.tempEditTpl.editTpl);

            var dataList = [];
            _this.tempEditTpl.editTpl.forEach(function(item, index) {
                if (item.cellType == 'date') {
                    dataList.push({
                        key: item.name,
                        value: Utils.dateFormat(item.tag, "yyyy-MM-dd")
                    });
                } else if(item.cellType == 'switch') {
                    dataList.push({
                        key: item.name,
                        value: item.value === true ? 1 : 0
                    });
                } else if(item.cellType == 'radio') {
                    dataList.push({
                        key: item.name,
                        value: item.tag === "是" ? 1 : 0
                    });
                }else  {
                    dataList.push({
                        key: item.name,
                        value: item.tag
                    });
                }

            })
            var params = {
                infoSetId: _this.infoSetId,
                dataList: dataList
            };
            if(_this.isCopyRule.state){
                params.copy_rule_id = _this.isCopyRule.item.uuid;
            }
            console.log(params);
            if(type==1){
                //保存并继续新增
                if(_this.actionContinueFlag) return;
                _this.actionContinueFlag = true;
            }else{
               if(_this.actionFlag) return;
                _this.actionFlag = true;
            }
            _this.isShowSpin=true;
            // ivu-btn-loading 移除position属性
            _this.$daydao.$ajax({
                url: gMain.apiBasePath + "route/" + _this.infoSetId + "/insert.do",
                data: JSON.stringify(params),
                success: function(data) {
                    _this.actionFlag = false;
                    _this.actionContinueFlag = false;
                    _this.isShowSpin=false;
                    if (data.result == 'true') {
                        if(_this.isCopyRule.state){
                            _this.$Message.success("复制成功")
                        }else {
                            _this.$Message.success("新增成功");
                        }
                        // 使用缓存数据，重新请求'上级组织'下拉框的数据
                        _this.reloadNewDropSelectDatas();
                        _this.isShowErrorTips = false;
                        // _this.initEditDatas(_this.infoSetId);
                        if (type == 1) {
                            //保存并新增
                            _this.$emit("saveSuccessCallback", false);
                        } else {
                            // 保存 ，提示保存成功
                            _this.$emit("saveSuccessCallback", true);
                        }
                    }

                },
                error: function(){
                    _this.actionFlag = false;
                    _this.actionContinueFlag=false;
                    _this.isShowSpin=false;
                }
            });
        },
        // 设置tag值
        setDropSelectData: function(node, name,wrapNmae) {
            console.log(node, name,wrapNmae);
            var _this = this;
            _this.tempEditTpl.editTpl.forEach(function(item, index) {
                if (item.name == name) {
                    _this.tempEditTpl.editTpl[index].tag = node.value || '';
                }
            });
            if(wrapNmae &&  wrapNmae == "calculate_cycle"){
                _this.tempEditTpl.editTpl.forEach(function (item,index) {
                    if(item.name == "calculate_cycle"){
                        _this.tempEditTpl.editTpl[index].myDataValue[name] = node.value;
                        //计薪周期全部选择
                        if( _this.tempEditTpl.editTpl[index].myDataValue.begin_month && _this.tempEditTpl.editTpl[index].myDataValue.begin_date && _this.tempEditTpl.editTpl[index].myDataValue.end_month && _this.tempEditTpl.editTpl[index].myDataValue.end_date){
                            _this.tempEditTpl.editTpl[index].tag = "true";
                        }
                    }

                })
            }
        },
        //应用范围设置tag值
        setDropSelectMulData: function(node,type,cal) {
            console.log(node);
            var _this = this;
            _this.tempEditTpl.editTpl.forEach(function(item, index) {

                if (item.name == "pay_org_id") {
                    if(node){
                        _this.tempEditTpl.editTpl[index].tag = node.ids.join(',') || '';
                    }else{
                        _this.tempEditTpl.editTpl[index].tag = "";
                    }
                }
            });
        }
        //取消操作
        , cancelOperate: function() {
            var t = this;
            // this.initEditDatas(this.infoSetId);
            t.$refs.tempEditTpl.resetFields();// 重置，将所有字段值重置为空并移除校验结果
            t.isShowErrorTips=false;
            t.$emit("cancelCallback");
        },
        // 清空daydaoDropSelectMul
        clearDaydaoDropSelectMul() {
            const t = this;
            t.$refs.daydaoDropSelectMul[0].setValue("");
        },
//        清空计薪周期
        clearalCulateCycle:function () {
            const t = this;
            t.$refs.cycle_begin_month[0].setValue("");
            t.$refs.cycle_begin_date[0].setValue("");
            t.$refs.cycle_end_month[0].setValue("");
            t.$refs.cycle_end_date[0].setValue("");
//            隐藏项也清空
            t.$refs.begin_month[0].setValue("");
            t.$refs.begin_date[0].setValue("");
            t.$refs.end_month[0].setValue("");
            t.$refs.end_date[0].setValue("");
        }

    }
}
</script>

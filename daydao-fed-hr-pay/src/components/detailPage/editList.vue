<style lang="scss">

</style>

<template>
    <!-- 编辑 -->
    <section class="detail-page-main-left-item" :class="'detail-page-main-left-item-'+ templateItem.index">
        <h4>
            <em class="icon iconfont_daydao_common">&#xe615;</em>
            <span>{{templateItem.title}}</span>
            <i class="icon iconfont_daydao_common" v-if="templateItem.isEdit" @click="templateItem.isEdit = !templateItem.isEdit">&#xe69c;</i>
        </h4>
        <div class="detail-page-main-left-item-content">
            <!-- 非编辑状态 -->
            <div v-if="templateItem.isEdit">
                <ul class="detail-page-main-left-list" v-for="(blockItem, index) in templateItem.data" :key="index">
                    <li v-for="item in blockItem.data" :key="item.uuid" v-if="item.name != 'is_phone_show'" :style="item.cellType=='textarea' ? 'width: 100%;' : ''">
                        <label :title="item.title">
                            {{item.title}}
                            </label>
                        <dl>
                            <span :title="item.value"
                                  :style="item.cellType == 'textarea' ? 'white-space: normal; width: calc(((100% + 135px) - 135px) - ((((100% + 135px) / 2) - 135px) * (1 / 3)));' : ''">{{item.value}}
                                  </span>
                        </dl>

                    </li>
                </ul>
            </div>
            <!-- 编辑状态 -->
            <div v-if="!templateItem.isEdit" class="detail-edit-box">
                <Form v-for="(blockItem, blockIndex) in templateItem.data" :key="blockIndex" ref="formCustom" :model="formCustom" :rules="ruleCustom">
                    <FormItem v-for="(item, itemIndex) in blockItem.data" :key="itemIndex"
                            v-if="item.name != 'is_phone_show'"
                            :label="item.title"
                            :prop="item.name"
                            :required="item.isMust"
                            :style="item.cellType=='textarea' ? 'width: 100%;' : ''">
                        <!-- 文件框 -->
                        <Input v-if="(item.cellType=='text' || !item.cellType) && item.name != 'cell_phone'"
                               v-model="item.value"
                               :maxlength="item.fieldSize"
                               :disabled="actionFlag"
                               placeholder="请输入..."></Input>

                        <!-- 手机号 -->
                        <div v-if="(item.cellType=='text' || !item.cellType) && item.name == 'cell_phone'">
                            <Tooltip content="该账号已激活，只能由员工自助更改手机号" placement="bottom-end" v-if="item.disabled">
                                <Input v-model="item.value" :maxlength="item.fieldSize" :disabled="item.disabled" placeholder="请输入..."></Input>
                            </Tooltip>
                            <Input v-if="!item.disabled" :disabled="actionFlag" v-model="item.value" :maxlength="item.fieldSize" placeholder="请输入..."></Input>
                            <Checkbox v-for="phoneItem in blockItem.data"
                                        :key="phoneItem.id"
                                        v-model="phoneItem.value"
                                        v-if="phoneItem.name == 'is_phone_show'">{{phoneItem.title}}</Checkbox>
                        </div>

                        <!-- textarea -->
                        <Input v-if="item.cellType=='textarea'"
                               v-model="item.value"
                               :maxlength="item.fieldSize"
                               :disabled="actionFlag"
                               style="width: calc(((100% + 135px) - 135px) - ((((100% + 135px) / 2) - 135px) * (1 / 3))) !important;"
                               type="textarea"
                               :rows="4"
                               placeholder="请输入..."></Input>

                        <!--日期处理 -->
                        <Date-picker v-if="item.cellType=='date'"
                                     v-model="item.value"
                                     :disabled="actionFlag"
                                     placeholder="请选择"
                                     class="text-filed-length"
                                     type="date"></Date-picker>

                        <!--下拉列表 -->
                        <daydao-drop-select v-if="item.cellType=='treeSelect' || item.cellType=='treeAdviceSelect'"
                                            :isAllowOther="item.cellType=='treeAdviceSelect' ? true : false"
                                            :name="item.name"
                                            :data="treeSelecArray[item.keyValueBean.infoSetId]"
                                            :val="item.value"
                                            :isEdit="!actionFlag"
                                            :showVal="item.value"
                                            ref="daydaoDropSelect"></daydao-drop-select>

                        <!-- switch -->
                        <i-switch v-if="item.cellType=='switch'" :disabled="actionFlag">
                            <span slot="open">是</span>
                            <span slot="close">否</span>
                        </i-switch>

                        <!-- Radio -->
                        <RadioGroup v-if="item.cellType=='radio'" :disabled="actionFlag" v-model="item.value">
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
    import {daydaoDropSelect,daydaoDropSelectMul} from 'commonVueLib/daydaoDropSelect/index'

    export default{
        name:"editList",
        props:{
            editListData: {
                type: Object,
                default(){
                    return {};
                }
            },
            getPersonInfo: {
                type: Function,
                default(){}
            }
        },
        components: {
            daydaoDropSelect
        },
        data () {
            return {
                actionFlag: false,   // 是否正在提交状态   false: 否     true: 提交中
                templateItem: {},   // 列表数据
                treeSelecArray: {}, // 下拉框数据对象
                formCustom: {}, // 表单数据对象
                ruleCustom: {} // 表单验证规则
            };
        },
        created(){
            // 初始化列表数据
            this.templateItem = JSON.parse(JSON.stringify(this.editListData));

            // 初始化选项的下拉框选项
            this.initSelectTreeData(this.templateItem.data[0].data);

            // 初始化表单数据和表单验证规则
            this.formatFormAndRuleCustom();
        },
        methods:{
            /**
             * 初始化下拉框数据集
             */
            initSelectTreeData (items){
                var _this = this;

                items.forEach(function(item){
                    // 非select、radio不执行下面逻辑
                    if(!(item.cellType == 'treeSelect' || item.cellType == 'treeAdviceSelect' || item.cellType == 'radio')) return false;

                    // 如果对应的的下拉选择infosetid有下拉框时，不执行下面的逻辑
                    if(_this.treeSelecArray[item.keyValueBean.infoSetId] && _this.treeSelecArray[item.keyValueBean.infoSetId].length>0) {

                        if(item.cellType == 'radio') item['treeSelectData'] = _this.treeSelecArray[item.keyValueBean.infoSetId];

                        return false;
                    }

                    // 为treeSelect\radio时，获取选项数据
                    _this.getKeyValueData({
                        data: item.keyValueBean,
                        success: function (data) {
                            // 如果是单选框类型，则数据保存在当前的item里
                            if(item.cellType == 'radio') item['treeSelectData'] = data.beans;

                            _this.treeSelecArray[item.keyValueBean.infoSetId] = data.beans;  // 保存起来，方便之后不再重复请求下拉框数据
                            _this.treeSelecArray = JSON.parse(JSON.stringify(_this.treeSelecArray));
                        }
                    })
                })
            },
            /**
             * 保存
             */
            saveRowData (name) {
                var _this = this,
                    oSendObj = {};

                if(_this.actionFlag) return;
                _this.actionFlag = true;

                try{
                    _this.formatFormAndRuleCustom(function(){
                        _this.$refs[name][0].validate((valid) => {
                            if (valid) {
                                saveFn();
                            } else {
                                //_this.$Message.error('表单验证失败!');
                                console.log('表单验证失败!');
                                _this.actionFlag = false;
                            }
                        })
                    })
                }
                catch (e){
                    console.log(e.message);
                    _this.actionFlag = false;
                }

                /**
                 * 保存
                 */
                function saveFn(){
                    oSendObj.editCondition = _this.$parent.editCondition;
                    oSendObj.infoSetId = _this.templateItem.templateId;
                    oSendObj.dataList = formatSendData(_this.templateItem.data[0].data);
                    if(oSendObj.dataList && oSendObj.dataList.length <= 0){
                        // 没有修改的数据，直接提示修改成功
                        _this.actionFlag = false;
                        _this.cancelRowData();
                        return _this.$Message.success('保存成功');
                    }

                    if(_this.templateItem.data[0].uuid){
                        // 修改
                        oSendObj.uuid = _this.templateItem.data[0].uuid;  // 修改时加上uuid
                        _this.$daydao.$ajax({
                            url:gMain.apiBasePath +"route/"+oSendObj.infoSetId+"/update.do",
                            data:JSON.stringify(oSendObj),
                            success: function(data){
                                // 保存失败
                                _this.actionFlag = false;
                                if(data.result != "true") return _this.$Message.error(data.resultDesc);

                                // 保存成功
                                _this.$Message.success('保存成功');
                                _this.cancelRowData();
                                _this.getDetailOptionData();
                                _this.getPersonInfo();
                            },
                            error: function(data){
                                _this.$Message.error(data.message);
                                _this.actionFlag = false;
                            }
                        });
                    }
                    else{
                        // 新增
                        oSendObj.isEditTemplateInsert = true;
                        oSendObj.dataList.push(_this.$parent.editCondition);
                        _this.$daydao.$ajax({
                            url:gMain.apiBasePath +"route/"+oSendObj.infoSetId+"/insert.do",
                            data:JSON.stringify(oSendObj),
                            success: function(data){
                                // 保存失败
                                _this.actionFlag = false;
                                if(data.result != "true") return _this.$Message.error(data.resultDesc);

                                // 保存成功
                                _this.$Message.success('保存成功');
                                _this.cancelRowData();
                                _this.getDetailOptionData();
                                _this.getPersonInfo();
                            },
                            error: function(data){
                                _this.$Message.error(data.message);
                                _this.actionFlag = false;
                            }
                        });
                    }
                }

                /**
                 * 格式化详情列表数据
                 */
                function formatSendData(items){
                    var arr = [];

                    try{
                        items.forEach(function(item){
                            if(item.cellType == 'date'){
                                // 日期
                                let date = _this.formatCustomDate(item.value, item.cellType)

                                if(uniqData(item.name, date)){
                                    arr.push({
                                        key: item.name,
                                        value: date
                                    })
                                }
                            }
                            else if(item.cellType == 'treeAdviceSelect' || item.cellType == 'treeSelect'){
                                // 下拉框
                                if(uniqData(item.name, $('input[name='+item.name+']').parent().find('input.daydao_drop_select_input').val())){
                                    arr.push({
                                        key: item.name,
                                        value: $('input[name='+item.name+']').val()
                                    })
                                }
                            }
                            else if(item.cellType == 'radio'){
                                // 单选框

                                item.treeSelectData.forEach(function(selectItem){
                                    if(selectItem.name != item.value) return true;
                                    if(uniqData(item.name, item.value)){
                                        arr.push({
                                            key: item.name,
                                            value: selectItem.id
                                        })
                                    }
                                })
                            }
                            else if(item.cellType == 'checkbox'){
                                arr.push({
                                    key: item.name,
                                    value: item.value ? 1 : 0
                                })
                            }
                            else {
                                if(uniqData(item.name, item.value)){
                                    arr.push({
                                        key: item.name,
                                        value: item.value
                                    })
                                }
                            }

                        })
                    }
                    catch (e){
                        console.log(e.message)
                    }
                    return arr;
                }

                /**
                 * 判断是否有修改的数据
                 * @param key   字段名称
                 * @param value 字段的值
                 * @returns {boolean}
                 */
                function uniqData(key, value){
                    let isUniq = true,
                        obj = JSON.parse(JSON.stringify(_this.editListData));

                    if(_this.templateItem.data[0].uuid){
                        // 修改，去除没有变更的数据
                        for(var i=0;i<obj.data[0].data.length;i++){

                            if(obj.data[0].data[i].name == key && obj.data[0].data[i].value == value){
                                isUniq = false;
                                continue
                            }
                        }
                    }
                    else{
                        // 新增，去除为空的数据
                        if(!value) isUniq = false;
                    }

                    return isUniq;
                }
            },
            /**
             * 取消
             */
            cancelRowData () {
                this.templateItem = JSON.parse(JSON.stringify(this.editListData));
                // 初始化选项的下拉框选项
                this.initSelectTreeData(this.templateItem.data[0].data);
            },
            /**
             * 获取下拉键值对
             * @options.data
             * @options.success
             * */
            getKeyValueData (options) {
                options.data.openSize = '0';

                this.$daydao.$ajax({
                    url: gMain.apiBasePath +"route/getKeyValueData.do",
                    data: JSON.stringify(options.data),
                    beforeSend:function(){
                        //typeof options.beforeSend == "function" && options.beforeSend();
                    },
                    complete:function(){
                        //typeof options.complete == "function" && options.complete();
                    },
                    success: function(data){
                        if(data.result == "true"){
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
            getDetailOptionData () {
                var _this = this,
                    oSendObj = {    // 请求子模块数据条件
                        infoSetId: _this.templateItem.templateId,
                        editCondition: _this.$parent.editCondition
                    };

                _this.$daydao.$ajax({
                    url: gMain.apiBasePath + "route/"+ _this.templateItem.templateId +"/getEditDataAndColumn.do",
                    data: JSON.stringify(oSendObj),
                    success: function (data) {

                        var dataBeans = data.beans[0];
                        dataBeans.data.forEach(function(item){
                            var arr = [];
                            dataBeans.columnEdit.forEach(function(columnItme){

                                if(!columnItme.isEditShow) return;

                                if(columnItme.cellType == 'checkbox'){
                                    arr.push({
                                        title: columnItme.title,
                                        name: columnItme.name,
                                        cellType: columnItme.cellType,
                                        keyValueBean: columnItme.keyValueBean,
                                        isMust: columnItme.isMust,
                                        regExpress: columnItme.regExpress,
                                        value: item[columnItme.name] == '1' ? true : false
                                    })
                                }
                                else{
                                    arr.push({
                                        title: columnItme.title,
                                        name: columnItme.name,
                                        cellType: columnItme.cellType,
                                        keyValueBean: columnItme.keyValueBean,
                                        isMust: columnItme.isMust,
                                        regExpress: columnItme.regExpress,
                                        value: item[columnItme.name] || ''
                                    })
                                }
                            });

                            _this.editListData.data[0].data = arr;
                        })
                    }
                })
            },
            /**
             * 格式化表单数据和表单验证规则
             */
            formatFormAndRuleCustom (endFn){
                var _this = this;

                _this.templateItem.data[0].data.forEach((item)=>{
                    let key = item.name,
                        val = item.value;

                    // 表单数据对象
                    if(item.cellType == 'date' || item.cellType == 'time' || item.cellType == 'dateTime'){
                        _this.formCustom[key] = _this.formatCustomDate(val, item.cellType);
                    }
                    else if(item.cellType == 'treeSelect' || item.cellType == 'treeAdviceSelect'){
                        //_this.formCustom[key] = $('input[name="'+item.name+'"]').parent().find('.daydao_drop_select_input').val();
                        _this.formCustom[key] = $('.detail-page-main-left-item-'+_this.templateItem.index+' .detail-page-main-left-item-content>div').eq(0).find('input[name="'+ item.name +'"]').val();
                    }
                    else{
                        _this.formCustom[key] = val;
                    }

                    // 表单验证规则
                    _this.ruleCustom[key] = []
                    if(item.isMust){    // 必填
                        let json = {required: true};

                        if(!item.cellType || item.cellType == 'text' || item.cellType == 'textarea'){
                            // 文本框
                            json.message = item.title + '不能为空';
                            //json.trigger = 'blur';
                        }
                        else if(item.cellType == 'date'){
                            // 日期
                            json.message = '请选择' + item.title;
                            //json.trigger = 'change';
                        }
                        else if(item.cellType == 'treeAdviceSelect' || item.cellType == 'treeSelect'){
                            // 下拉选择框
                            json.message = '请选择' + item.title;
                            //json.trigger = 'change';
                        }
                        else if(item.cellType == 'radio'){
                            // 单选框
                            json.message = '请选择' + item.title;
                            //json.trigger = 'change';
                        }
                        else if(item.cellType == 'checkbox'){
                            // 复选框
                            json.min =  1;
                            json.message = '至少选择一个' + item.title;
                            //json.trigger = 'change';
                        }
                        else{
                            console.log('未知的类型，将配置成blur验证规则');
                            json.message = item.title + '不能为空';
                            //json.trigger = 'blur';
                        }

                        _this.ruleCustom[key].push(json);
                    }

                    if(item.regExpress){    // 获取的数据中有验证规则
                        let json = {};

                        json.pattern = eval('('+'/'+ item.regExpress + '/'+')');
                        json.message = item.title + '格式不正确';
                        if(!item.cellType || item.cellType == 'text' || item.cellType == 'textarea'){
                            // 文本框
                            //json.trigger = 'false';
                        }
                        else if(item.cellType == 'date'){
                            // 日期
                            //json.trigger = 'change';
                        }
                        else if(item.cellType == 'treeAdviceSelect' || item.cellType == 'treeSelect'){
                            // 下拉选择框
                            //json.trigger = 'change';
                        }
                        else if(item.cellType == 'radio'){
                            // 单选框
                            //json.trigger = 'change';
                        }
                        else if(item.cellType == 'checkbox'){
                            // 复选框
                            //json.trigger = 'change';
                        }
                        else{
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
            formatCustomDate (date, type){
                if(!date) return '';

                let str = '',
                    oDate = new Date(date),
                    year = oDate.getFullYear(),
                    month = oDate.getMonth() + 1,
                    day = oDate.getDate(),
                    hours = oDate.getHours(),
                    minutes = oDate.getMinutes(),
                    seconds = oDate.getSeconds(),
                    toDou = function(n){
                        return n = n < 10 ? '0' + n : n;
                    };


                if(type == 'date'){
                    // 日期 yyyy-MM-dd
                    str = year + '-' + toDou(month) + '-' + toDou(day);
                }
                else if(type == 'time'){
                    // 时间 HH:mm:ss
                    str = toDou(hours) + ':' + toDou(minutes) + ':' + toDou(seconds);
                }
                else if(type == 'dateTime'){
                    // 日期+时间 yyyy-MM-dd HH:mm:ss
                    str = year + '-' + toDou(month) + '-' + toDou(day) + ' ' + toDou(hours) + ':' + toDou(minutes) + ':' + toDou(seconds);
                }
                else{
                    console.log('未知的时间类型：' + type);
                }

                return str;
            }
        },
        watch:{
            // 深度监听父组件传递过来的列表数据
            'editListData': {
                handler (newValue, oldValue){
                    var _this = this;
                    this.templateItem = JSON.parse(JSON.stringify(newValue));
                    _this.initSelectTreeData(_this.templateItem.data[0].data);
                },
                deep: true
            }
        }
    }
</script>

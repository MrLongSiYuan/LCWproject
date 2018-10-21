<template>
    <div id="pay_add_payrule">
        <Form ref="formModel" 
               :model="formModel" 
               :rules="ruleValidate" 
               :label-width="100">
            <Form-item v-for="(item,index) in ruleFormDataBak"
                       :label="item.title"
                       :key="index"
                       :prop="item.name"
                       :required="item.isMust"
                       style="width:50%;display:inline-block"
                       v-if="item.isEditShow">
                <template style="width:100%" v-if="ruleItemData.type !== 'view'">
                    <!-- 输入框 -->
                    <Input v-if="item.cellType === 'text'" 
                           v-model="formModel[item.name]"
                           :style="inputStyle"></Input>

                     <!--日期 -->
                    <Date-picker v-if="item.cellType=='date_yyyy_MM'" 
                                :placeholder='"请选择"+item.title' 
                                type="month"
                                v-model="formModel[item.name]"
                                :value="formModel[item.name]"
                                @on-change="getDate(item,$event)"
                                :editable="false"
                                :style="inputStyle"></Date-picker>

                    <!--下拉列表 -->
                    <daydao-drop-select v-if="item.cellType=='treeSelect' && item.name === 'bank'" 
                                        :name="item.name" 
                                        :placeholder='"请选择"+item.title' 
                                        :data="bankSelectList" 
                                        :onSelected="setDropSelectData" 
                                        :val="formModel[item.name]"
                                        :showVal="formModel[item.name]"
                                        ref="daydaoDropSelect"
                                        :style="inputStyle"></daydao-drop-select>
                    <daydao-drop-select v-if="item.cellType=='treeSelect' && item.name === 'rule_id'" 
                                        :name="item.name" 
                                        :placeholder='"请选择"+item.title' 
                                        :data="ruleSelectList"                                         
                                        :onSelected="setDropSelectData" 
                                        v-model="formModel[item.name]"
                                        ref="daydaoDropSelect"
                                        :style="inputStyle"></daydao-drop-select>

                     <!-- 文本textarea -->
                    <Input type="textarea" 
                            v-if="item.cellType=='textarea'" 
                            :name="item.name"
                            v-model="formModel[item.name]"
                            :style="inputStyle"></Input>

                </template>

                <template v-if="ruleItemData.type === 'view'">
                    <div class="view_info">
                        {{ruleItemData.data[item.name]}}
                        <!-- {{ [item , item.name && ruleItemData.data[item.name]] | viewRuleItemData}} -->
                    </div>
                </template>
            </Form-item>

            <div class="pay_rule_add_footer"  v-if="ruleItemData.type !== 'view'">
                <Button type="primary" @click="saveRuleinfoFormData">保存</Button>
                <Button @click="cancelRuleinfoFormData">取消</Button>
            </div>
        </Form>
    </div> 
</template>

<script type="text/babel">
    const infoSetId = "pay_person_rules";  //页面信息集ID
    import daydaoDropSelect from 'commonVueLib/daydaoDropSelect/daydaoDropSelect';
    import utils from 'commonVueLib/utils/index';
    
    export default {
        name: infoSetId,
        components: {
            daydaoDropSelect
        },
        props:{
            ruleFormData: {
                type:Array,
                defautlt:[],
            },
            ruleItemData: {
                type: Object,
                defautlt: {}
            },
            bankSelectList: {
                type: Array,
                defautlt: []
            },
            ruleSelectList: {
                type: Array,
                defautlt: []
            }
        },
        data(){
           return {
               inputStyle: 'width:260px;height:32px;',
               infoSetId: infoSetId,
            //    ruleItemDataBak: {},
               ruleFormDataBak: {},

               formModel: {},
               ruleValidate: {},

               dateOptions: {}
           }
        },
        created() {
            this.init();
        },
        methods:{
            init() {
                const self = this;
                self.ruleFormDataBak = JSON.parse(JSON.stringify(self.ruleFormData));
                // self.ruleItemDataBak = JSON.parse(JSON.stringify(self.ruleItemData));
                //查看和修改时不显示薪酬规则
                if(self.ruleItemData.type !== 'add'){
                    self.ruleFormDataBak.forEach(function(item, index){
                        if(item.name === 'rule_id'){
                            self.ruleFormDataBak[index].isEditShow = false;
                        }
                    })
                }
                self.ruleInfoFormat();
            },
            //获取表单编辑数据
            ruleInfoFormat() {
                const self = this;
                const currentItem = self.ruleItemData.data;
                self.ruleFormDataBak.map(item => {
                    if(item.name === 'bank'){
                        // 获取银行id
                        self.formModel[item.name] = self.getBankName('',currentItem.bank);
                    }else{
                        self.formModel[item.name] = currentItem[item.name];
                    }
                    //添加验证规则
                    self.ruleValidate[item.name] = [];
                    // 文本域字数限制
                    /* if(item.cellType === 'textarea'){
                        const validator = (rule, value, callback)=>{
                            if(value && value.length > 4){
                                callback(new Error(item.title + '超出字数!'));
                            }else{
                                callback();
                            }
                        }
                        self.ruleValidate[item.name].push({validator: validator, trigger: "blur"})
                    } */

                    // 银行账号正则校验
                    if(item.name === 'account1'){
                        const validator = (rule, value, callback)=>{
                            // const reg = new RegExp(item.regExpress);
                            // const reg = /^(\d{16}|\d{19})$/;
                            const reg = /^\d{12,19}$/
                            if(reg.test(value) || !value){
                                callback();
                            }else{
                                callback(new Error(item.title + '格式不正确!'));
                            }
                        }
                        self.ruleValidate[item.name].push({validator: validator, trigger: "blur"})
                    }

                    // 必填项
                    if(item.isMust){
                        self.ruleValidate[item.name].push({required: true, message: item.title+'不能为空', trigger:'blur'}) 
                    }
                })
            },
            // 保存
            saveRuleinfoFormData() {
                const self = this;

                // 当添加新的薪酬规则有重复则中断后面的操作
                if(self.ruleItemData.type === 'add'){
                    let isRepeat = false;
                    self.$parent.ruleList.find(function(item){
                        if(item.person_rule_id && item.person_rule_id === self.formModel.rule_id){
                            isRepeat = true;
                        }
                    })
                    if(isRepeat){
                        self.$Message.error('该薪酬规则已存在，不可重复新增!')
                        return false;
                    }
                }
                const dataList = [];
                for(var item in self.formModel){
                    //格式化日期格式
                    if((item === 'begin_period' || item === 'end_period') && self.formModel[item] ){
                        if(!self.formModel[item].length){
                            self.formModel[item] = utils.dateFormat(self.formModel[item],'yyyy-MM');
                        }
                        // self.formModel[item] = self.formModel[item].substr(0,4)+self.formModel[item].substr(5,6);
                    }else if(item === 'rule_name'){
                        //获取当前规则名称
                        self.formModel[item] = self.ruleItemData[item];
                    }
                    else if(item === 'rule_id' && !self.ruleItemData.is_add){
                        //当前规则id  后端返回的rule_id与rule_name同值,person_rule_id才是请求接口的rule_id传参
                        self.formModel[item] = self.ruleItemData.person_rule_id ? self.ruleItemData.person_rule_id : self.formModel[item];
                        // self.formModel[item] = self.ruleItemData.rule_id;
                    }
                    if(item !== 'person_rule_id'){
                        dataList.push({
                            key: item,
                            value: self.formModel[item] || ''
                        })
                    }                
                }
                
                if(self.compareDate(self.formModel.begin_period,self.formModel.end_period)){
                    self.$Message.error('计薪开始周期不能大于计薪结束周期')
                    return false;
                }

                dataList.push({
                        key: 'person_id',
                        value: parseInt(self.$route.query.id)
                    },
                )
                //验证表单
                self.$refs['formModel'].validate((valid) => {
                    if(valid){
                        const postData = {};
                        postData.dataList = dataList;
                        postData.editCondition = {
                            key : "person_id",
                            value : self.$route.query.id
                        };
                        postData.infoSetId = self.infoSetId;
                        if(self.ruleItemData.type === 'add'){
                            self.$daydao.$ajax({
                                url:gMain.apiBasePath + `route/${self.infoSetId}/insert.do`,
                                data: JSON.stringify(postData),
                                success: function(data) {
                                    if(data.result === 'true'){
                                        //保存后改type为view并渲染
                                        const addSuccess = {
                                            state: true,
                                            data:{
                                                formModel: self.formModel,
                                                uuid: data.uuid,
                                                rule_id: data.val
                                            }
                                        }
                                        self.$emit('addSuccess', addSuccess);
                                        //表单银行value为id值，改为view需转换为name                                        
                                        self.ruleItemData.type = 'view';
                                        // 存储bank的id
                                        let tempBankId = JSON.parse(JSON.stringify(self.formModel.bank));
                                        // 根据id获取bank名
                                        self.ruleItemData.data.bank = self.getBankName(tempBankId,'');

                                        self.$Message.success('保存成功!');
                                        self.init();
                                    }      
                                }
                            })
                        }else{
                            postData.uuid = self.ruleItemData.uuid;
                            self.$daydao.$ajax({
                                url:gMain.apiBasePath + `route/${self.infoSetId}/update.do`,
                                data: JSON.stringify(postData),
                                success: function(data) {
                                    if(data.result === 'true'){
                                        //保存后改type为view并渲染
                                        self.ruleItemData.type = 'view';
                                        let tempBankId = JSON.parse(JSON.stringify(self.formModel.bank));
                                        for(item in self.ruleItemData.data){
                                            if(item === 'bank'){
                                                self.ruleItemData.data[item] = self.getBankName(tempBankId,'');
                                            }else{
                                                self.ruleItemData.data[item] = self.formModel[item];
                                            }
                                        }
                                        // self.init();
                                        self.$Message.success('修改成功!');
                                    }      
                                }
                            })
                        }   
                    }else{
                        // self.$Message.error('验证失败!');
                    }
                }) 
            },
            // 比较时间
            compareDate(d1, d2) {
                return ((new Date(d1.replace(/-/g,"\/"))) > (new Date(d2.replace(/-/g,"\/"))));
            },
            //取消保存
            cancelRuleinfoFormData() {
                const self = this;
                $('body').find('.ivu-form-item-error-tip').remove();
                // 对整个表单进行重置                
                self.$refs['formModel'].resetFields();
                if(self.ruleItemData.type === 'add'){
                    self.$emit('addCancel', true);
                }else{
                    self.ruleItemData.type = 'view';
                    self.bankSelectList.find(function(item){
                        if(item.id === self.ruleItemData.data.bank){
                            self.ruleItemData.data.bank = item.name;
                        }
                    })
                }      
            },
            //获取下拉框选定的值
            setDropSelectData(data) {
                const self = this;
                if(data.key === 'bank'){
                    self.formModel.bank = data.value;
                }else if(data.key === 'rule_id'){
                    self.formModel.rule_id = data.value;
                    self.formModel.rule_name = data.node.name;
                }
            },
            //bank根据id获取name(渲染) 或者根据name获取id(传参)
            getBankName(id,name) {
                const self = this;
                let transBankValue = null;
                self.bankSelectList.find(function(item){
                    if(item.id === id){
                        transBankValue = item.name;
                        return true;
                    }
                    if(item.name === name){
                        transBankValue = item.id;
                        return true;
                    }
                })
                return transBankValue;                
            },
            // 获取选择的日期
            getDate(item,date) {
                const self = this;
                self.formModel[item.name] = date;
            }
        },
        filters:{
            /* viewRuleItemData([item,name,value]){
                return name;
            } */
        },
        watch: {
            'ruleItemData.data': function(newValue,oldValue){
                const self = this;
                if(!newValue){
                    self.ruleItemData.data = oldValue;
                }
                if(self.formModel.bank){
                    self.ruleItemData.data.bank = self.getBankName(self.formModel.bank,'');
                }
            },
            'ruleItemData.type': function(newValue,oldValue){
                const self = this;
                if(self.ruleItemData.type === 'edit'){
                    self.init();
                }
            }
        }
    }
</script>

<style lang="scss">
    #pay_add_payrule{
        width:100%;
        margin:0 auto;
        padding: 30px 20px 30px 80px;        
        & > .ivu-form {
                & > .ivu-form-item{
                        margin-bottom: 20px;
                        textarea{
                            min-height: 32px;
                            max-height: 90px;
                            width: 260px;
                            resize: none;
                        }
                    }
                    .ivu-date-picker{
                        width: 260px;
                    }
                    .ivu-picker-panel-body{
                        width:260px;
                    }
                    .ivu-date-picker-cells{
                        width: 260px!important;
                    }
            }
            .pay_rule_add_footer{
                display: flex;
                justify-content: flex-end;
                margin-top: 30px;
                & > button{
                    margin-right: 10px;
                }
            }
            .view_info{
                font-size: 14px;
                line-height: 34px;
                word-wrap: break-word;
                white-space: normal;
            }
    }
    /* .pay_add_payrule_edit{
        border: 1px solid #D7DDE4;
        margin-bottom: 50px;
    } */
</style>


<template>
    <div id="pay_record_addrule">
        
        <Form ref="formModel" 
              :model="formModel" 
              :rules="ruleValidate" >
                <!-- <Form-item label="已选人员" :label-width="labelWidth">
                    <p class="choose_num">{{choosePersonNum}}位</p>
                </Form-item>
                <Form-item label="新增薪酬规则" prop='rule' :label-width="labelWidth" :data="ruleSelectList" >
                    <daydao-drop-select name='rule' style="width:300px"></daydao-drop-select>
                </Form-item>
                <Form-item label="开始计薪周期" prop='period' :label-width="labelWidth">
                    <Date-picker placeholder="请选择" type="month" :editable="false" style="width:300px"></Date-picker>
                </Form-item>
                <Form-item label="银行名称" prop='bank' :label-width="labelWidth" :data="bankSelectList" >
                    <daydao-drop-select name='bank' style="width:300px"></daydao-drop-select>
                </Form-item> -->
                <Form-item label="已选人员">
                    <p class="choose_num">{{choosePersonNum}}位</p>
                </Form-item>
                <Form-item v-for="(item,index) in ruleFormData"
                       :label="item.title"
                       :key="index"
                       :prop="item.name"
                       :required="item.isMust"
                       style="text-align:right">
                    
                    <!--日期 -->
                    <Date-picker v-if="item.cellType=='date_yyyy_MM'" 
                                :placeholder='"请选择"+item.title' 
                                type="month"
                                v-model="formModel[item.name]"
                                :value="formModel[item.name]"
                                @on-change="getDate(item,$event)"
                                :editable="false"></Date-picker>

                    <!--下拉列表 -->
                    <daydao-drop-select v-if="item.cellType=='treeSelect' && item.name === 'bank'" 
                                        :name="item.name" 
                                        :data="bankSelectList" 
                                        :onSelected="setDropSelectData" 
                                        :placeholder='"请选择"+item.title' 
                                        :val="formModel[item.name]"
                                        :showVal="formModel[item.name]"
                                        :isAllowOther="false"
                                        width=300
                                        ref="daydaoDropSelect"></daydao-drop-select>
                    <daydao-drop-select v-if="item.cellType=='treeSelect' && item.name === 'rule_id'" 
                                        :name="item.name" 
                                        :data="ruleSelectList"
                                        :placeholder='"请选择"+item.title' 
                                        width=300
                                        :isAllowOther="false"
                                        :onSelected="setDropSelectData" 
                                        v-model="formModel[item.name]"
                                        ref="daydaoDropSelect"></daydao-drop-select>

                    <!-- <Select v-model="formModel[item.name]"  v-if="item.cellType=='treeSelect' && item.name === 'bank'" style="width:300px" @on-change="setDropSelectData">
                        <Option v-for="option in bankSelectList" :value="option.name" :key="option.id">{{ option.name }}</Option>
                    </Select> -->
                </Form-item>
        </Form>
    </div>
</template>

<script type="text/babel">
    import daydaoDropSelect from 'commonVueLib/daydaoDropSelect/daydaoDropSelect'

    const infoSetId = 'pay_persons_batch_add';
    export default {
        name: infoSetId,
        props: {
            choosePersonNum: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                infoSetId: infoSetId,
                bankSelectList: [],
                ruleSelectList: [],
                formModel: {},
                ruleValidate: {},
                ruleFormData: [],
                caseCode: 'hr_pay_org_rule'           //与后端约定好用keyValueBean请求薪酬规则下拉框时将hr_pay_org_rule赋值上去请求
            }
        },
        components: {
            daydaoDropSelect
        },
        created() {
            this.getSelectList();
        },
        methods: {
            //初始化表单
            getSelectList() {
                const self = this;
                const postData = {
                    infoSetId: self.infoSetId
                }
                self.$daydao.$ajax({
                    url:gMain.apiBasePath + `route/${self.infoSetId}/getEditDataAndColumn.do`,
                    data:JSON.stringify(postData),
                    success: function(res){
                        self.ruleFormData = res.beans[0].columnEdit;
                        //初始化下拉框
                        self.ruleinfoFormDataFormat();
                    }
                })
                
            },
            ruleinfoFormDataFormat() {
                const self = this;
                self.ruleFormData.map(item => {
                    if (item.cellType == 'treeSelect') {
                        new Promise(function(resolve, reject) {
                            //获取下拉框数据
                            self.getKeyValue(item, resolve, item.name);
                        }).then(function(datas) {
                            if(item.name === 'bank' && datas.beans){
                                self.bankSelectList = datas.beans;
                            }else if(item.name === 'rule_id' && datas.beans){
                                self.ruleSelectList = datas.beans;
                            }
                        });
                    }

                    //添加验证规则
                    self.ruleValidate[item.name] = [];
                    // 必填项
                    if(item.isMust){
                        self.ruleValidate[item.name].push({required: true, message: item.title+'不能为空', trigger:'blur'}) 
                    }
                })
            },
            getKeyValue(item, resolve,name) {
                var self = this;
                let postUrl = '';        
                postUrl = 'route/getKeyValueData.do'    
               /*  if(name === "bank"){
                    postUrl = 'route/getKeyValueData.do'
                }else if(name === 'rule_id'){
                    postUrl = 'payOrgRule/getOrgRules.do'
                    item.keyValueBean.caseCode = self.caseCode;                    
                } */
                if(name === 'rule_id'){
                    item.keyValueBean.caseCode = self.caseCode;                    
                }
                self.$daydao.$ajax({
                    url: gMain.apiBasePath + postUrl,
                    data: JSON.stringify(item.keyValueBean),
                    success: function(data) {
                        resolve(data);
                    }
                });
            },
            getDate(item,date) {
                const self = this;
                self.formModel[item.name] = date;
            },
            setDropSelectData(data) {
                const self = this;
                if(data.key === 'bank'){
                    self.formModel.bank = data.value;
                }else if(data.key === 'rule_id'){
                    self.formModel.rule_id = data.value;
                    self.formModel.rule_name = data.node.name;
                }
            }
        }
     }
</script>

<style lang="scss">
   #pay_record_addrule{
            padding-top: 86px;
            width:450px;
            margin: 0 auto;
            .ivu-form .ivu-form-item-label{
                color:#939BA6;
                width: 120px;
            }
            .ivu-form-item-content{
                display: inline-block;
            }
            .ivu-form-item{
                text-align: left!important;
            }
            .ivu-date-picker{
                width: 300px;
            }
            .ivu-picker-panel-body{
                width:300px;
            }
            .ivu-date-picker-cells{
                width: 300px!important;
            }
            .choose_num{
                line-height:32px;
                font-size:20px;
                color: #657180;
            }
        }
    
</style>

<template>
    <Modal class-name="hr_pay_model_vertical_center_modal pay_record_modal_step" v-model="batchInfo.state" :title="batchInfo.title" :mask-closable="false" width='1030' :styles="{height: '765px'}">
        <div id="pay_record_batch_edit">    
            <div class="header">
                <Steps :current="currentStep"  >
                    <Step v-for="(item, index) in stepData" :title="item.title" :key="index"></Step>
                </Steps>
            </div>
            <div class="body">
                <div class="step_body">
                    <!-- 上一步回到选人操作需保留之前已选数据 -->
                    <choose-person v-show="currentStep === 0" ref="personList"></choose-person>  

                    <add-rule v-if="currentStep === 1" ref="addRule" :choosePersonNum='choosePersonNum'></add-rule>
                </div>
            </div>
        </div>
        <div class="footer" slot="footer">
            <Button type="primary"
                    class="next footer-button"
                    @click="nextClick"
                    v-if="currentStep === 0">
                    下一步</Button>
            <Button class="prev footer-button"
                    @click="currentStep--"
                    v-if="currentStep === 1">
                上一步</Button>
            <Button type="primary"
                    class="confirm footer-button"
                    @click="confirm"
                    :loading="loading"
                    v-if="currentStep === 1">
                确定</Button>
        </div>
    </Modal>
</template>

<script type="text/babel">
    import choosePerson from "./comp/choosePerson";
    import addRule from "./comp/addRule";    

    export default {
        data() {
            return {
                currentStep: -1,

                stepData: [{
                        title: '选择人员',
                    },{
                        title: '添加规则',
                    }],
                loading:false,
                choosePersonNum: 0,          //已选人数
                payPersonSelectData: []       //点击下一步会注销选人操作的dom，需将选中的数据保留
            }
        },
        props:{
            batchInfo:{
                type: Object,
                default: {}
            }
        },
        components: {
            choosePerson,addRule
        },
        created() {
            var self = this;
        },
        methods:{
            // 下一步
            nextClick() {
                const self = this;
                const postData = {
                    orgIdList: [],
                    personIdList: [],
                    statusType: 1               // 1 批量新增  2 在线编辑
                };
                // 已选组织idList
                self.$refs.personList.$refs.settingPersonSelect.selectedData.orgData.forEach(function(item){
                    postData.orgIdList.push(item.id);
                })
                // 已选人员idList
                self.$refs.personList.$refs.settingPersonSelect.selectedData.personData.forEach(function(item){
                    postData.personIdList.push(item.personId);
                })
                self.$daydao.$ajax({
                    url: gMain.apiBasePath + 'payPerson/selectPayOnEditPersonNum.do',
                    data:JSON.stringify(postData),
                    success:function (data) {
                        // debugger
                        if(data.result == "true"){
                            if(!data.personNum){
                                self.$Message.info("请选择人员");
                            }else{
                                self.choosePersonNum = data.personNum;
                                self.payPersonSelectData = data.personIdList;
                                self.currentStep++;
                            }
                        }
                    }
                });
            },
            // 确定
            confirm() {
                const self = this;
                self.$refs.addRule.$refs['formModel'].validate((valid) => {
                    if(valid){
                        self.loading = true;
                        let personIds = [];
                        self.payPersonSelectData.forEach(function(item){
                            personIds.push(item);
                        })
                        // 调用接口响应成功后loading置为false且关闭弹窗
                        // debugger
                        const postData = {
                            bank: self.$refs.addRule.formModel.bank,
                            beginPeriod: self.$refs.addRule.formModel.begin_period,
                            ruleId: self.$refs.addRule.formModel.rule_id,
                            personIdList: personIds,
                        }
                        self.$daydao.$ajax({
                            url: gMain.apiBasePath + 'payPerson/payPersonAddBatch.do',
                            data:JSON.stringify(postData),
                            success:function (data) {
                                self.loading = false;
                                if(data.result == "true"){
                                    const payRecordEditOnline = {
                                        orgIds: '',
                                        personIds: personIds.join(',')
                                    }
                                    const storage = window.sessionStorage;
                                    storage.setItem('payRecordEditOnline',JSON.stringify(payRecordEditOnline));
                                    self.$parent.$refs.tableDataList.getTableData();
                                    self.batchInfo.state = false;
                                    self.$parent.addInfo.state = true;
                                }
                            }
                        });
                    }
                })
            }
        },
        watch: {
            'batchInfo.state':function(newVal,oldVal){
                const self = this;
                // debugger
                //关闭弹窗需初始化步骤，不然会停留在上一次的流程中
                self.currentStep = 0;
                // 弹窗打开时需重置数据
                if(!newVal){
                    self.$refs.personList.$refs.settingPersonSelect.reset();
                }
            }
        }

    }
</script>


<style lang="scss">
    .pay_record_modal_step{
        .ivu-modal-content{
            height:100%;
        }
        #pay_record_batch_edit{     
            .header{
                width:400px;
                // display: flex;
                // justify-content: center;
                // align-items: center;
                margin:0px auto;
                padding-left: 65px;
                .ivu-steps-title{
                    line-height: 26px;
                }
            }
            .body{
                & >.step_body{
                        width:1000px;
                        margin:0 auto;
                    }
                }
        }
        
        .ivu-modal-footer{
            position: absolute;
            bottom: 0;
            width: 100%;
        }
    }
    
</style>

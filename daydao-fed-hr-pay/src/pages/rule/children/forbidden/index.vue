<template>
    <Modal
        v-model="isforbiddenRule.state"
        :title="isforbiddenRule.operator == 1 ? '停用':'启用'"
        class-name="hr_pay_model_vertical_center_modal" width="350">
        <Form ref="formValidate" :model="formValidate" label-position="left" :rules="ruleValidate" :label-width="80" style="margin-top: 27px;" v-if="isforbiddenRule.operator == 1">
            <FormItem label="停用日期" prop="time">
                <DatePicker type="date" placeholder="选择日期" v-model="formValidate.time" @on-change="changeTime"></DatePicker>
            </FormItem>
        </Form>
        <p v-else-if="isforbiddenRule.operator == 2" style="text-align: center">是否确定启用？</p>
        <div slot="footer">
            <Button  @click="forbiddenOk" type="primary">确定</Button>
            <Button @click="forbiddenCancel">取消</Button>
        </div>
    </Modal>
</template>

<script type="text/babel">
    export default {
        name: 'activity_fobidden',
        props: {
            isforbiddenRule:{
                type:Object,
                default(){
                    return{
                        state : false,
                        item:{},
                        operator:1,
                    }
                }
            },
            activeId:{
                default : 0
            },
            activityName : {
                type : String,
                default : ''
            },
            ruleRow:{
                type: Object,
                default() {
                    return {

                    }
                }
            }
        },
        data() {
            return {
                maskClosable:false,
                formValidate: {
                    time: '',
                },
                ruleValidate: {
                    time: [
                        { required: true, type: 'date', message: '请选择时间', trigger: 'blur' }
                    ],
                }
            }
        },
        watch:{
            "ruleRow"(newValue,oldValue){
                const t = this;
                t.formValidate.time =  newValue.date_to;
            }
        },
        created:function () {
            const t = this;
        },
        methods : {
            forbiddenOk() {
                const self = this;
                if(!self.formValidate.time && self.isforbiddenRule.operator == 1){
                    self.$Message.warning('请选择停用日期');
                    return false;
                }
                const postData = {
                    ruleId : self.activeId,
                    dateTo:self.formValidate.time,
                    operator:self.isforbiddenRule.operator,
                }
                self.$daydao.$ajax({
                    url:gMain.apiBasePath + 'payOrgRule/ruleEnabledOrDisabled.do',
                    data:JSON.stringify(postData),
                    success:function (data) {
                        const getForbiddenClick = {};
                        if(data.result === 'true'){
                            getForbiddenClick.isClose = true;
                            getForbiddenClick.isOk = true;   //获取该数据判断是否需要刷新表格
                            if(self.isforbiddenRule.operator == 1){
                                self.$Message.success('停用成功');
                            }else if(self.isforbiddenRule.operator == 2){
                                self.$Message.success('启用成功');
                            }
                            self.isforbiddenRule.state = false;
                            self.$emit('getForbiddenClick', getForbiddenClick);
                        }else{
                            // self.$Message.error(data.resultDesc);
                            getForbiddenClick.isClose = false;
                            getForbiddenClick.isOk = false;   //获取该数据判断是否需要刷新表格
                            self.isforbiddenRule.state = false;
                            self.$emit('getForbiddenClick', getForbiddenClick);
                        }
                    }
                })
            },
            forbiddenCancel() {
                const self = this;
                const getForbiddenClick = {};
                getForbiddenClick.isClose = false;
                getForbiddenClick.isOk = false;
                self.isforbiddenRule.state = false;
                self.$emit('getForbiddenClick', getForbiddenClick);
            },
            changeTime(data){
                var t = this;
                t.formValidate.time = data;
            }
        }
    }
</script>

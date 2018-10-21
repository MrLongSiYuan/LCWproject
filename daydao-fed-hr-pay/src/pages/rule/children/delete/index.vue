<template>
    <Modal
        v-model="isdelRule.state"
        title="删除"
        @on-ok="delOk"
        @on-cancel="delCancel"
        class-name="hr_perf_model_vertical_center_modal"
        :mask-closable="maskClosable"
        width="350"
        >
        <!--<p>你确定要删除薪酬规则
            <span class="keyNameColor">【{{ruleName}}】</span>吗？
        </p>-->
        <p style="text-align: center">删除后不可恢复，您确定要删除吗？</p>
    </Modal>
</template>

<script type="text/babel">
    export default {
        name: 'activity_delete',
        props: {
            isdelRule:{
                state:false,
                item:{}
            },
            isdelActivity:{
                type : Object,
                default() {
                    return {
                        state: false,
                        item: {}
                    }
                }
            },
            activeId:{
                default :"0"
            },
            ruleRow:{
                type : Object,
                default : {}
            },
            ruleName : {
                type : String,
                default : ''
            },
            infoSetId:{
                type : String,
                default : ''
            }
        },
        data() {
            return {
//               activityName:''
                maskClosable: false
            }
        },
        methods : {
            delOk() {
                const self = this;
                const delData = {};
                delData.infoSetId = self.infoSetId;
                delData.uuidLists = [];
                delData.uuidLists.push(self.activeId);

                self.$daydao.$ajax({
                    url:gMain.apiBasePath + 'route/pay_org_rule_list/del.do',
                    data:JSON.stringify(delData),
                    success:function (data) {
                        const getDelClick = {};
                        if(data.result === 'true'){
                            getDelClick.isClose = true;
                            getDelClick.isOk = true;   //获取该数据判断是否需要刷新表格
                            self.$Message.success('删除成功');
                            self.$emit('getDelClick', getDelClick);
                        }else{
                            // self.$Message.error(data.resultDesc);
                            getDelClick.isClose = false;
                            getDelClick.isOk = false;   //获取该数据判断是否需要刷新表格
                            self.$emit('getDelClick', getDelClick);
                        }
                    }
                })
            },
            delCancel() {
                const self = this;
                const getDelClick = {};
                self.isdelRule.state = false
                getDelClick.isClose = false;
                getDelClick.isOk = false;
                self.$emit('getDelClick', getDelClick);
            }
        }
    }
</script>

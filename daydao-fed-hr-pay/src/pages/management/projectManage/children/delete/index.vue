<template>
    <!--删除-->
    <Modal
        v-model="isDelProject.state"
        title="删除"
        @on-ok="delOk"
        @on-cancel="delCancel"
        class-name="hr_pay_project_vertical_center_modal"
        :mask-closable="false">
        <p>你确定要删除<span class="keyNameColor">【{{isDelProject.item.name}}】</span>吗？</p>
    </Modal>
</template>


<script type="text/babel">
    export default {
        data() {
            return {

            }
        },
        props: {
            isDelProject: {
                type : Object,
                default() {
                    return {
                        state: false,
                        item: {}
                    }
                }
            }
        },
        methods: {
            delOk() {
                const self = this;
                const postData = {
                    infoSetId: 'pay_rule_item_manage',
                    uuidLists: []
                }
                postData.uuidLists.push(self.isDelProject.item.uuid)
                self.$daydao.$ajax({
                    url:gMain.apiBasePath + "route/pay_rule_item_manage/del.do",
                    data:JSON.stringify(postData),
                    success:function(res) {
                        if(res.result === 'true'){

                        }
                    }
                })

            },
            delCancel() {

            }
        }
    }
</script>

<style lang="scss">
    .hr_pay_project_vertical_center_modal{
        .ivu-modal-footer {
            display: flex;
            flex-direction: row-reverse;
            justify-content: center;
            & > button {
                margin-left: 30px;
                margin-bottom: 0;
            }
        }
        .keyNameColor{
            color:#F18950
        }
    }
</style>


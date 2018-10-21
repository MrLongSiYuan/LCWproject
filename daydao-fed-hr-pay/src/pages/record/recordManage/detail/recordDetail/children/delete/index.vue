<template>
    <Modal class-name="hr_pay_model_vertical_center_modal" v-model="deleteInfo.state" :title="deleteInfo.title" :mask-closable="false">
        <div>你确定要删除<span class="keyNameColor" style="color: #f18950;">【{{deleteInfo.data.rule_name}}】</span>吗?</div>
        <div slot="footer">
            <Button size="large" @click="delCancel">取消</Button>            
            <Button type="primary" size="large" @click="delOk" :loading="loading">确定</Button>            
        </div>
    </Modal>
</template>

<script type="text/babel">
    const infoSetId = "pay_person_rules";  //页面信息集ID    
    export default {
        name:infoSetId,
        props:{
            deleteInfo:{
                type: Object,
                default: {}
            }
        },
        data() {
            return {
                loading:false,
                infoSetId: infoSetId
            }
        },
        created() {
            
        },
        methods: {
            delOk() {
                const self = this;

                const postData = {
                    infoSetId : self.infoSetId,
                    customParam: {
                        person_id: parseInt(self.$route.query.id),
                        rule_id: self.deleteInfo.data.person_rule_id
                    },
                    editCondition: {
                        key: 'person_id',
                        value: parseInt(self.$route.query.id)
                    },
                    uuidLists: []
                };
                postData.uuidLists.push(self.deleteInfo.data.uuid);
                self.$daydao.$ajax({
                    url: gMain.apiBasePath + `route/${self.infoSetId}/del.do`,
                    data: JSON.stringify(postData),
                    success: function(res){
                        if(res.result === 'true'){
                            self.$Message.success('删除成功!');
                            self.deleteInfo.state = false;
                            self.$parent.ruleList.splice(self.deleteInfo.index,1)
                        }
                    }
                })
            },
            delCancel() {
                const self = this;
                self.deleteInfo.state = false;
            }
        }

    }
</script>

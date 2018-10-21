<template>
    <Modal class-name="hr_pay_model_vertical_center_modal" v-model="editOnlineInfo.state" :title="editOnlineInfo.title" :mask-closable="false"  width='1030' >
        <div id="pay_record_edit_online_modal">
            <person-select :ApiPersonURL="getPersonListUrl" ref="editOnlinePersonSelect" :type="type" :ApiPersonParams="ApiPersonParams"></person-select>
        </div>
        <div slot="footer">
            <Button size="large" @click="cancelEdit">取消</Button>
            <Button type="primary" size="large" @click="jumpToEdit" :loading="loading">确定</Button>
        </div>
    </Modal>
</template>

<script type="text/babel">
    import personSelect from "commonVueLib/selectPerson/index"    
    export default {
        data() {
            return {
                getPersonListUrl: gMain.apiBasePath + "payPerson/payPersonAddBatchInfo.do",
                type: 1,
                ApiPersonParams: {
                    statusType: 2          // 1：代表批量新增 ， 2：代表在线编辑
                },
                payPersonSelectData: [],
                loading: false
            }
        },
        props:{
            editOnlineInfo:{
                type: Object,
                default: {}
            }
        },
        components: {
            personSelect
        },
        created(){
            
        },
        methods: {
            cancelEdit() {
                this.editOnlineInfo.state = false;
            },
            jumpToEdit() {
                const self = this;
                self.loading = true;
                // debugger
                if(self.$refs.editOnlinePersonSelect.selectedData.orgData.length === 0 && self.$refs.editOnlinePersonSelect.selectedData.personData.length === 0){
                    self.$Message.info('请选择人员');
                    self.loading = false;
                    return false;
                }
                // 获取弹框选定的组织id与人员id
                const postData = {
                    orgIdList: [],
                    personIdList: [],
                    statusType: 2               // 1 批量新增  2 在线编辑
                };
                self.$refs.editOnlinePersonSelect.selectedData.orgData.forEach(function(item){
                    postData.orgIdList.push(item.id);
                })
                self.$refs.editOnlinePersonSelect.selectedData.personData.forEach(function(item){
                    postData.personIdList.push(item.personId);
                })
                
                this.$daydao.$ajax({
                    url: gMain.apiBasePath + 'payPerson/selectPayOnEditPersonNum.do',
                    data:JSON.stringify(postData),
                    success:function (data) {
                        if(data.result == "true"){
                            self.loading = false;
                            if(data.personNum > 500){
                                self.$Message.info('单次操作数据量过多会影响性能哦，现已超过500条，请重新选择');
                            }else{
                                // payRecordEditOnline为编辑页需要作为传参的数据
                                const payRecordEditOnline = {
                                    orgIds: postData.orgIdList.join(','),
                                    personIds: postData.personIdList.join(',')
                                }
                                const storage = window.sessionStorage;
                                storage.setItem('payRecordEditOnline',JSON.stringify(payRecordEditOnline));
                                self.$router.push({path:'/recordManage/editOnline'});
                            }
                            
                        }
                    }
                })
            }
        },
        watch:{
            // 当打开弹窗时reset,重置选中的数据
            'editOnlineInfo.state': function(n , o){
                if(n){
                    this.$refs.editOnlinePersonSelect.reset();
                }
            }
        }
    }
</script>

<style lang="scss">
    
</style>
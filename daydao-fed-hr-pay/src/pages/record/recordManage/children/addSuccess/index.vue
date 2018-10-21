<template>
    <Modal class-name="hr_pay_model_vertical_center_modal" v-model="addInfo.state" :title="addInfo.title" :mask-closable="false" width="320">
        <div>
            <p style="font-size:16px;display:flex;justify-content:center;align-items: center;">
                <Icon type="ios-checkmark-outline" size="32" color="#1BBE6B"></Icon>
                <span style="margin-left:16px;">新增成功</span>
            </p>
            <p style="text-align:center;margin-top:28px;">是否继续完善信息？</p>
        </div>
        <div slot='footer'>
            <Button type="primary" @click="perfectInfo">完善信息</Button>
            <Button @click="cancel">取消</Button>
        </div>
    </Modal>
</template>

<script type="text/babel">
    export default {
        data() {
            return {

            }
        },
        props:{
            addInfo:{
                type: Object,
                default: {}
            }
        },
        methods: {
            cancel() {
                this.addInfo.state = false;
            },
            perfectInfo() {
                const self = this;
                if(self.$parent.$refs.batchAdd.choosePersonNum > 500){
                    self.$Message.info('单次操作数据量过多会影响性能哦，现已超过500条，请重新选择');
                }else{
                    self.$router.push({path:'/recordManage/editOnline'});
                }
                // 点击完善信息跳到在线编辑的表格
                // self.$router.push({path:'/recordManage/editOnline'});
            }

        }

    }
</script>

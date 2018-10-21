<template>
    <Modal
        v-model="iscopyActivity.state"
        title="复制"
        @on-ok="copyOk"
        @on-cancel="copyCancel"
        class-name="hr_perf_model_vertical_center_modal"
        :mask-closable="maskCloseable">
        <p>你确定要复制活动
            <span class="keyNameColor">【{{activityName}}】</span>吗
        </p>
    </Modal>
</template>

<script type="text/babel">
    export default {
        name: 'activity_copy',
        props:{
            /*iscopyActivityShow :{
                type : Boolean,
                default : true
            },*/
            iscopyActivity:{
                type : Object,
                default() {
                    return {
                        state: false,
                        item: {}
                    }
                }
            },
            activeId:{
//                type : Number,
                default : 0
            },
            activityRow:{
                type : Object,
                default : {}
            },
            activityName : {
                type : String,
                default : ''
            }
        },
        data() {
            return {
                maskCloseable:false,
            }
        },
        methods : {
            copyOk() {
                this.$router.push(`/activity/copy/${this.activeId}`);
            },
            copyCancel() {
                const self = this;
                const getCopyClick = {};
                getCopyClick.isClose = false;
                getCopyClick.isOk = false;
                self.$emit('getCopyClick', getCopyClick);
            }
        }
    }
</script>

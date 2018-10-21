<template>
    <Modal
        v-model="ispublishActivity.state"
        title="发布"
        @on-ok="publishOk"
        @on-cancel="publishCancel"
        class-name="hr_perf_model_vertical_center_modal"
        :mask-closable="maskClosable">
        <p>你确定要发布活动
            <span class="keyNameColor">【{{activityName}}】</span>吗
        </p>
    </Modal>
</template>

<script type="text/babel">
    export default {
        name: 'activity_publish',
        props: {
            /*ispublishActivityShow :{
                type : Boolean,
                default : true
            },*/
            ispublishActivity: {
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
               maskClosable:false,
           }
        },
        methods : {
            publishOk() {
                const self = this;
                const activeId = self.activityRow.active_id;
                const postData = {
                    activeId : parseInt(activeId)
                }
                self.$daydao.$ajax({
                    url:gMain.apiBasePath + 'perf/active/publishActive',
                    data:JSON.stringify(postData),
                    success:function (data) {
                        const getPublishClick = {};
                        if(data.result === 'true'){
                            getPublishClick.isClose = true;
                            getPublishClick.isOk = true;   //获取该数据判断是否需要刷新表格
                            self.$Message.success('发布成功');
                            self.$emit('getPublishClick', getPublishClick);
                        }else{
                            // self.$Message.error(data.resultDesc);
                            getPublishClick.isClose = false;
                            getPublishClick.isOk = false;   //获取该数据判断是否需要刷新表格
                            self.$emit('getPublishClick', getPublishClick);
                        }
                    }
                })
            },
            publishCancel() {
                const self = this;
                const getPublishClick = {};
                getPublishClick.isClose = false;
                getPublishClick.isOk = false;
                self.$emit('getPublishClick', getPublishClick);
            }
        }
    }
</script>

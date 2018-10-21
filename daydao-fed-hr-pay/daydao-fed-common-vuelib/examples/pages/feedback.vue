<template>
    <div>
        <div  @click="callFeedbackCompon" class="feed-btn">我要反馈</div>
        <div class="feedback-wrap" >
            <feedback
                    :wrapWidth="650"
                    :feedbackContentHeight="160"
                    @close-feedback="closeFeedback"
                    ref="feedback"
            ></feedback>
        </div>

    </div>
</template>
<style lang="scss">
    .feed-btn{
        cursor: pointer;
    }

</style>

<script>
    import feedback from 'commonVueLib/feedback/index';
    export default{
        components:{ feedback },
        data () {
            return {
                isShow:false
            }
        }
        ,created(){

        }
        ,methods:{
            callFeedbackCompon (){
                this.$refs.feedback.isShow = !this.$refs.feedback.isShow;
            },
            //反馈组件的关闭反馈组件的事件，
            closeFeedback (val){
                this.isShow = val;
            }
        }
    }
</script>   
        
            
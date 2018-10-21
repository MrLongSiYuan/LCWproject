<template>
    <div id="pay_record_detail">
        <div class="header">
            <div class="back" @click="cancelClick">
                <Icon type="close-round"></Icon>
            </div>
            <div class="title">{{staffName}}</div>
        </div>
        <div class="body">
            <base-info></base-info>
            <record-list></record-list>
        </div>
    </div>
</template>

<script type="text/babel">
    const infoSetId = "pay_record_detail";
    import baseInfo from './recordDetail/baseinfo.vue';
    import recordList from './recordDetail/recordList.vue';

    export default {
        name:infoSetId,
        data() {
            return {
                staffName: ''
            }
        },
        components:{
            baseInfo,
            recordList
        },
        created() {
            var t = this;
            // 显示头部
            gMain.showPayHead(false);
        },
        methods:{
             //取消
            cancelClick() {
                const self = this;
                self.$router.push('/pay_persons_list');
            },
        }
    }
</script>

<style lang="scss">
    #pay_record_detail{
                margin-top: -20px;
        
        & > .header{
                display: flex;
                justify-content: center;
                align-items: center;
                position: fixed;
                z-index: 4;
                width: 100%;
                height: 46px;
                background: #F5F7F9;
                .back {
                    position: absolute;
                    right: 20px;
                    cursor: pointer;                        
                    line-height: 46px;
                    height: 46px;
            }
            .title {
                font-size: 16px;
                color: #657180;
                font-weight: bold;
            }
        }
            .body{
                // margin-top: 30px;
            }
    }
</style>

<template>
    <div class="pay-list">
        <span @click="skipRule">{{name}}</span><br/><span @click="skipIndex">{{name1}}</span>
        <my-loading  :isShow="isRequest" ref="loading"></my-loading>
    </div>
</template>

<style lang="scss" rel="stylesheet/scss">
    $redColor : red;
    .pay-list{ color: $redColor; width: 100px; height: 100px;border: 1px solid #CCC; position: relative;}
</style>

<script type="text/babel">

    const infoSetId = "pay_rule";  //页面信息集ID
    import myLoading from "src/components/loading/myLoading.vue"

    export default {
        name:infoSetId
        ,data(){
            return {
                infoSetId:infoSetId,
                name:"薪酬规则",
                name1:"薪酬核算",
                isRequest:true
            };
        },
        computed: {
        }
        ,components:{
            myLoading
        }
        ,created(){
            var t = this;
            // 全屏展示详情
            gMain.showPayHead(false);
        }
        ,mounted(){
            var t = this;
            setTimeout(function () {
                t.isRequest = false;
            },2000)

        },
        methods:{
            skipRule:function () {
                let t = this;
                t.$router.push("/ruletest");
            },
            skipIndex:function () {
                let t = this;
                t.$router.push("/index");
            }
        },
        watch: {

        }

    }
</script>






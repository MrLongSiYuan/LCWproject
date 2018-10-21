<template>
    <div class="pay-list1">
        <span @click="skipFn">{{name}}</span><br/><span>{{name1}}</span>
        <my-loading  :isShow="isRequest" ref="loading"></my-loading>
    </div>
</template>

<style lang="scss" rel="stylesheet/scss">
    $redColor : green;
    .pay-list1{ color: $redColor; width: 100px; height: 100px;border: 1px solid #CCC; position: relative;}
    .pay-list1 span { cursor: pointer;}
</style>

<script type="text/babel">

    const infoSetId = "pay_list";  //页面信息集ID
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
            // 显示头部
            gMain.showPayHead(true);
        }
        ,mounted(){
            var t = this;
            setTimeout(function () {
                t.isRequest = false;
            },2000)

        },
        methods:{
            skipFn:function () {
                let t = this;
                t.$router.push("/ruletest");
            }
        },
        watch: {

        }

    }
</script>



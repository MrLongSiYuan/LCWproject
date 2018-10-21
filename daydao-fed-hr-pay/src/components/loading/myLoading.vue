<template>
        <div class="my-loading-content" v-if="isShow">
             <div class="my-loading-wrap"></div>
        </div>
</template>


<style lang="scss" scoped>
    .my-loading-content{position: absolute;  top: 0;  bottom: 0;  left: 0;  right: 0;  z-index: 8;  width: 100%;  height: 100%;  background-color: rgba(255,255,255,.8);}
    .my-loading-content .my-loading-wrap{ width: 32px;height: 32px;position: relative; left: 50%; top:50%;margin-left: -16px;margin-top: -16px;border-radius: 50%;  background-color: #e6773b; animation: ani-spin-bounce 1s 0s ease-in-out infinite;}

</style>
<script>
    /*页面弹出详情*/
    export default{
        name:"myLoading",
        props:{
            isShow:""
        },
        methods:{

        }
    }
</script>

<style lang="scss" rel="stylesheet/scss">
    /*组织人事*/
    #daydao_content_app_org{
        .left_menu{
            width:170px;
            position: absolute;
        }
        .right_data_content{
            margin-left:170px;
        }
    }

</style>

<template>
    <commom-main>
        <div slot="content">
            <router-view></router-view>
        </div>
    </commom-main>
</template>

<script type="text/babel">
    import commomMain from 'commonVueLib/commMain/index.js';

    export default {
        name: 'App'
        ,data () {
            return {

            }
        }
        ,watch:{

        }
        ,beforeCreate(){

        }
        ,created() {
            var t = this;
            gMain.components.commonHeader.handleShowLeftMenu(true); // 显示公共左侧菜单
        }
        ,mounted(){
            var t = this;
        }
        ,components:{
            commomMain
        }
        ,methods:{

        }
    }
</script>

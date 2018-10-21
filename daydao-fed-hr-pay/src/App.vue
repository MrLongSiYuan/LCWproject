<template>
    <commom-main>
        <div slot="content">
            <keep-alive>
                <router-view v-if="$route.meta.keepAlive"></router-view>
            </keep-alive>
            <router-view v-if="!$route.meta.keepAlive"></router-view>
        </div>
    </commom-main>
</template>

<script type="text/babel">
    import commomMain from 'commonVueLib/commMain/index.js';

    export default {
        name: 'AppPay'
        ,data(){
            return {
                bLeft:"",//全屏时去掉margin-left用
            };
        }
        ,components:{
            commomMain
        }
        ,created() {
            let t = this;
            /*gMain.components.commonHeader.handleShowLeftMenu(true); // 显示公共左侧菜单，公共部分的暂时注释*/
            /**
             *是否显示头部和左侧
             * @param status 当为true时显示头部和左侧导航，false时不显示头部和左侧导航
             */
            gMain.showPayHead = function (status) {
                t.bLeft = status;
                gMain.components.commonHeader.handleShowLeftMenu(status); // 是否显示左侧菜单
                t.$root.isShowHead = status;
            }

        },
        watch: {
            bLeft(val,oldVal){
                let t = this;
                let $appContent = $("#daydao_content_app_content");
                if(val == true){
                    $appContent.css("margin-left","170px")
                }else{
                    $appContent.css("margin-left","0")
                }
            },
        },
    }
</script>

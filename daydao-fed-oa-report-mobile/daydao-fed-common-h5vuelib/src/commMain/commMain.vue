<style lang="scss">
    $prefixCls:'daydao_content_app';
    /*组织人事*/
    ##{$prefixCls}_wrap{

    }
    ##{$prefixCls}_content{
        position: relative;
    }

</style>

<template>
    <div :id="prefixCls + '_wrap'" class="clearfix">
        <!--右侧数据内容-->
        <div :id="prefixCls + '_content'">
            <slot name="content">

            </slot>
        </div>

    </div>
</template>

<script type="text/babel">
    export default {
        name: 'App'
        ,data () {
            return {
                prefixCls:'daydao_content_app'
            }
        }
        ,watch:{

        }
        ,beforeCreate(){

        }
        ,created() {
            var t = this;
        }
        ,mounted(){
            var t = this;

        }

        ,methods:{

        }
    }
</script>

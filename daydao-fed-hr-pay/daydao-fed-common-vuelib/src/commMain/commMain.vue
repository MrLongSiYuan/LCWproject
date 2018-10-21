<style lang="scss">
    @import "../styles/fontIcon.css";  //引用公共图标库
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
        <div :id="prefixCls + '_content'" :style="{marginLeft:sLeftStyle}">
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
                sLeftStyle:top === self?'170px':'0'
                ,prefixCls:'daydao_content_app'
            }
        }
        ,watch:{
            $route(val,oldval){
                var t = this;
                //关闭所有的iview弹窗
                t.$Modal.remove();

                //关闭所有的artDialog弹窗
                if(window.artDialog){
                    for(var x in window.artDialog.list){
                        window.artDialog.list[x].remove().close()
                    }
                }

            }
        }
    }
</script>

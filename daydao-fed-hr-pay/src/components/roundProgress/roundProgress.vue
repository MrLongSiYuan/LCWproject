<template>
    <!--计算-->
    <div :class="prefixCls + '-count'" v-if="isShow === true">
        <div class="loading-bg"></div>
        <div class="circle-content">
            <i-circle :percent="percent" :stroke-color="color">
                <Icon v-if="percent == 100" type="ios-checkmark-empty" size="60" style="color:#5cb85c"></Icon>
                <span v-else style="font-size:24px;color: #FFF;">{{ percent }}%</span>
            </i-circle>
            <p>{{title}}</p>
        </div>
    </div>


</template>


<style lang="scss" rel="stylesheet/scss">
    $prefixCls : round-progress;//样式前缀名
    .#{$prefixCls}-count{
        overflow: hidden;
        .loading-bg{
            position: fixed;
            background: #000;
            z-index: 999;
            top:0;
            left: 0;
            bottom: 0;
            right: 0;
            opacity: 0.5;
        }
        .circle-content{
            position: fixed;
            z-index: 1000;
            width: 150px;
            height: 150px;
            left: 50%;
            margin-left: -75px;
            top:50%;
            margin-top: -75px;
            text-align: center;
        p{
            font-size: 12px;
            text-align: center;
            color: #FFF;
        }

        }

    }

</style>
<script>
    /*页面弹出详情*/
    const prefixCls = "round-progress";

    export default{
        name:"roundOProgress",
        props:{
            isShow:{
                type:Boolean,
                default:false
            },
            percent:{
                type:Number,
                default:0
            },
            title:{
                type:String,
                default:"加载中"
            }

        },
        data() {
            return {
                prefixCls:"round-progress",
                color:"#2DB7F5"
            }
        },
        methods:{

        },
        watch: {
            percent(val,oldVal){
                let t = this;
                if(val >= 100){
                    t.color = "#5cb85c";;
                    setTimeout(function () {
                        t.$emit('successFn');
                    },1500)
                }else{
                    t.color = "#2DB7F5";
                }
            }
        }

    }

</script>

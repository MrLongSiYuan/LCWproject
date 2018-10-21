<template>
    <div>
        <detail-page
            :pageInfoSetId="pageInfoSetId"
            :id="id"
            :fullPageFlag="true"
            @refreshHeaderTitle="refreshHeaderTitle"
            ref="detailFull">
            <!-- 重写pagetitle -->
            <div slot="detail-page-title-content">
                <!-- title  -->
                <span>{{headerTitleName}}</span>
            </div>

            <!-- 通过slot复写组件模板 -->
            <div slot="detail-page-header" style='text-align:center;'>
                <!-- <span class="pos_name_span">{{headerTitleName}}</span> -->
            </div>

            <!--  重写右侧  -->
            <div slot="detail-page-main-right"></div>
        </detail-page>
    </div>
</template>

<script>

import detailPage from 'components/detailPage/detailPage'

export default {
    name: 'ruleDetail',
    props: {

    },
    components: {
        detailPage
    },
    data: function() {
        var t = this;
        return {
            pageInfoSetId: 'pay_rule_base_info',
            id: this.$route.params.ruleId,
            uuid: '',
            headerTitleName: ''
        }
    },
    created: function() {
        const self = this;
        // 不显示头部
        gMain.showPayHead(false);
    },
    mounted: function() {
    },
    methods: {
        refreshHeaderTitle(name) {
            this.headerTitleName = name
        }
    }
}
</script>

<style lang="scss" rel="stylesheet/scss">
    .detail-page{
        .detail-page-nav{
            height: 61px;
            border-bottom: 1px solid #C1C6CC;
            ul{
                li{
                    height: 100%;
                    line-height: 60px;
                    padding: 0;
                    margin: 0;
                    padding-right: 40px;
                    a{
                        display: inline-block;
                        height: 100%;
                        line-height: 59px;
                        font-size: 16px;
                        padding: 0;
                    }
                    &:after{
                        border: none;
                    }
                }
                li.active{
                    a{
                        border-bottom: 2px solid #F18950;
                        line-height: 58px;
                    }
                    @extend li;
                }
            }
        }
        .detail-page-main-left-item{
            margin-top: 50px;
        }
    }
</style>

<style lang="scss">

</style>


<template>
    <!-- 自定义模版 -->
    <mycomponent
        :is="sectionItem.templateId"
        @refreshHeaderTitle="refreshHeaderTitle"
        :currentTabInfo="currentTabInfo"
        :tabIndex="tabIndex" ></mycomponent>

</template>

<script>
    import {daydaoDropSelect,daydaoDropSelectMul} from 'commonVueLib/daydaoDropSelect/index'
    import pay_rule_base_info from 'components/detailPage/customTemplate/pay_rule_base_info'
    import pay_rule_item_tab from 'components/detailPage/customTemplate/pay_rule_item_tab'
    import pay_rule_formula_tab from 'components/detailPage/customTemplate/pay_rule_formula_tab'
    import pay_rule_payroll_tab from 'components/detailPage/customTemplate/pay_rule_payroll_tab'

    export default{
        name:"customTemplate",
        props:{
            customTemplateData: {
                type: Object,
                default(){
                    return {};
                }
            },
            currentTabInfo:{
                type: Object,
                default() {
                    return {}
                }
            },
            tabIndex: {
                type: Number,
                default: 0
            }
        },
        components: {
            daydaoDropSelect,
            pay_rule_base_info,
            pay_rule_item_tab,
            pay_rule_formula_tab,
            pay_rule_payroll_tab
        },
        data () {
            return {
                sectionItem: {}
            }
        },
        created(){
            var _this=this;
            this.sectionItem = JSON.parse(JSON.stringify(this.customTemplateData));
            var templateId=this.sectionItem.templateId;
            if(templateId=='org_report_form' || templateId=='job_report_form' || templateId =='pos_report_form'){
                // 报表的组件
                _this.sectionItem.templateId='report_form';
            }
        },
        methods:{
            refreshHeaderTitle(name){
                this.$emit("refreshHeaderTitle", name);
            }
        },
        watch:{
            'customTemplateData': {
                handler (newValue, oldValue) {
                    this.sectionItem = JSON.parse(JSON.stringify(newValue))
                },
                deep: true
            }
        }
    }
</script>

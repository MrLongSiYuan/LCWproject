<template>
  <div :id = "templateItem.templateId">

  </div>

</template>

<script>

export default {
    name: "payRuleFormulaTab",
    props: {
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

    },
    data() {
        return {
            templateItem: {}   // 列表数据
        };
    },
    mounted() {
        // this.init()
    },
    created() {
        // this.init()
    },
    filters: {

    },
    methods: {
        init() {
            const self = this;
            let postData = {};
            let url = gMain.apiBasePath
            self.templateItem = JSON.parse(JSON.stringify(self.$parent.sectionItem));
            switch (self.templateItem.templateId) {
                case 'pay_rule_formula_tab':
                    url += 'payItemBase/getItemIdByRuleId.do';
                    postData.customParam = {
                        rule_id: self.$route.params.ruleId
                    }
                    break;
                case 'pay_piece_rule_item_tab':
                    url += 'payFormula/formulaAll.do';
                    postData = {
                        pieceRuleId: uuid
                    }
                    break;
                default:
                    url = '';
            }
            self.$daydao.$ajax({
                url: url,
                data: JSON.stringify(postData),
                success: function(data) {
                    if(data.result === 'true') {
                        seajs.use(["commonStaticDirectory/plugins/fromula/fromula.js"],function (Fromula) {
                            new Fromula({
                                calNames:data.calNames
                                , calNumbers: data.calNumbers
                                , ruleId: data.ruleId
                                , type: data.type
                                ,area: '#' + self.templateItem.templateId
                            });
                        });
                    }
                }
             })

        }
    },
    watch: {
        "currentTabInfo" (newValue, oldValue) {
            if(newValue.index === this.tabIndex) {
                this.init()
            }
        }
    }
}
</script>


<style lang="scss">
#pay_rule_formula_tab{
    padding-top: 70px;
    display: flex;
    justify-content: center;
}
</style>

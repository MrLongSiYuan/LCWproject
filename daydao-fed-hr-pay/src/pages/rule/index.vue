<template>
    <div class="clearfix" id="pay_rule_base_info">
        <table-data-list ref="tableDataList" :infoSetId="infoSetId" :cardListOptions="cardListOptions" :defineBtns="defineBtns" @cell-click="cellClick" :iOperateWidth=150 :getOperateHtml="getOperateHtml" :isShowSerialIndexNumber="isShowSerialIndexNumber">

            <!--这里允许通过 <div slot="模块名称"></div> 来重写列表数据组件的模板-->

        </table-data-list>

        <!--发布活动-->
         <!--<publish-rule :ispublishRule="ispublishRule" :activeId="activeId" :ruleRow="ruleRow" :ruleName="ruleName" @getPublishClick="getPublishClick"></publish-rule>-->
        <!--停用/启用-->
        <forbidden-rule :isforbiddenRule="isforbiddenRule" :activeId="activeId" :ruleRow="ruleRow" :ruleName="ruleName" @getForbiddenClick="getForbiddenClick"></forbidden-rule>

        <!--<copy-rule :iscopyRule="iscopyRule" :activeId="activeId" :ruleRow="ruleRow" :ruleName="ruleName" @getCopyClick="getCopyClick"></copy-rule>-->

        <delete-rule :isdelRule="isdelRule" @getDelClick="getDelClick" :ruleName="ruleName" :infoSetId="infoSetId" :ruleRow="ruleRow" :activeId="activeId"></delete-rule>


        <page-slide v-model="isShowPageSlide" pageTitle="新增规则">
            <edit-form-infos ref="editFormInfos" :isShow="isShowPageSlide" :infoSetId="infoSetId" :labelWidth="formStyle.labelWidth" :inputWidth="formStyle.inputWidth" @saveSuccessCallback="saveSuccessCallback" @cancelCallback="cancelCallback" :isCopyRule="isCopyRule"></edit-form-infos>
        </page-slide>
    </div>
</template>

<style lang="scss" rel="stylesheet/scss">

#pay_rule_base_info{
    .page-btn-group{
        margin-bottom: 20px;
    }
}

</style>

<script>

    import tableDataList from "commonVueLib/tableDataList/index"
    // import publishRule from "pages/rule/children/publish/index"
    // import copyRule from "pages/rule/children/copy/index"
     import forbiddenRule from "pages/rule/children/forbidden/index"
     import deleteRule from "pages/rule/children/delete/index"

    import pageSlide from "commonVueLib/pageSlide/index"
    import editFormInfos from "./common/editFormInfos/index"

    import formatTableData from 'utils/formatTableData'

    const infoSetId = "pay_rule_base_info";  //页面信息集ID


    export default {
        name:infoSetId
        ,data(){
            var t = this;
            return {
                infoSetId:infoSetId
                ,cardListOptions:{
                    boldFields:["indent_name"] //加粗显示的字段，最多两个
                },
                defineBtns:[
                    {
                        name:'新增',
                        active: true,
                        event:()=>{
                            this.addRule()
                        }
                    }
                ],
//                ispublishRuleShow:false,   //发布活动模态框
                ispublishRule:{
                    state:false,
                    item:{}
                },
//                isforbiddenRuleShow:false,   //中止活动模态框
                isforbiddenRule:{
                    state : false,
                    item:{},
                    operator:1     //1：禁用，2：启用
                },
//                isdelRuleShow:false,   //删除活动模态框
                isdelRule:{
                    state:false,
                    item:{}
                },
                isShowSerialIndexNumber:true,  //翻页显示连续序号的
                activeId : 0,
                ruleRow : {},
                ruleName : '',
                isShowPageSlide: false,
                isCopyRule:{        //是否为复制规则
                    state:false,
                    item:{}
                },
                formStyle: {
                    inputWidth: 210,
                    labelWidth: 112
                }
            };
        },
        computed: {
//            ...mapGetters(['orgTreeList', 'header', 'areaList'])
        }
        ,components:{
            tableDataList,
            /* publishRule,
            copyRule,*/
            forbiddenRule,
            deleteRule,
            pageSlide,
            editFormInfos
        },
        created() {
            const self = this;
            // 显示头部
            gMain.showPayHead(true);
        }
        ,mounted(){
            const self = this;
            //重写方法
            // 列表表头格式化
            // self.$refs.tableDataList.formatTableData = self.formatTableData
            self.$refs.tableDataList.formatTableData = function(arr) {
                const self = this;
                return formatTableData.formatTableData(self, arr, "");
            }
        },
        methods:{
            /*
            * 新增规则
            * */
            addRule() {
                const self = this;
                self.isCopyRule = {
                    state:false,
                    item:{}
                };
                self.isShowPageSlide = true;
            },
            /*
            * 编辑
            * */
            editRule(id, row) {
                const self = this;
                const ruleTable = self.$refs.tableDataList;
                self.$store.dispatch('setRuleTableColumn', ruleTable.getTableColumnData);
                // self.$store.dispatch('setRuleTableData', ruleTable.tableData);
                self.$router.push({
                    name: 'rule_detail',
                    params: {
                        ruleId: id,
                        uuid: row.uuid
                    }
                })
            },

            getPublishClick(data) {
                const self = this;
//                self.ispublishRuleShow = data.isClose;
                //确认需要刷新表格
                if(data.isOk){
                    self.$refs.tableDataList.getTableData();
                }
            },
            //启用规则
            enableRule(id,row) {
                const t = this;
//                self.ispublishRuleShow = true;
                t.isforbiddenRule={
                    state:true,
                    item:row,
                    operator:2     //1：禁用，2：启用
                };
                t.initParams(id,row)
            },

            //停用规则
            forbiddenRule(id,row) {
                const _this = this;
                new Promise(function(resolve, reject) {
                    _this.canForbiddenRule(resolve,row);
                }).then(function(data) {
                    if(data.result == "true"){
                        _this.isforbiddenRule={
                            state:true,
                            item:row,
                            operator:1     //1：禁用，2：启用
                        }
                        _this.initParams(id,row);
                    }
                });
            },
            /*验证是否可以停用*/
            canForbiddenRule:function (resolve,item) {
                const _this = this;
                _this.$daydao.$ajax({
                    url:gMain.apiBasePath + 'payOrgRule/verify.do',
                    data:JSON.stringify({
                        ruleId:item.uuid
                    }),
                    success:function (data) {
                        if(data.result === 'true'){
                            resolve(data);
                        }
                    }
                })
            },
            getForbiddenClick(data) {
                const self = this;
//                self.isforbiddenRuleShow = data.isClose;
                //确认需要刷新表格
                if(data.isOk){
                    self.$refs.tableDataList.getTableData();
                }
            },


            //复制规则
            copyRule(id,row) {
                const self = this;
                self.isCopyRule = {
                    state: true,
                    item: row
                }
                self.isShowPageSlide = true;
            },
            getCopyClick(data) {
                const self = this;
//                self.iscopyRuleShow = data.isClose;
                //确认需要刷新表格
                if(data.isOk){
                    self.$refs.tableDataList.getTableData();
                }
            },


            //删除活动
            deleteRule(id,row) {
                const self = this;
//                self.isdelRuleShow = true;
                self.isdelRule = {
                    state:true,
                    item:{}
                }
                self.initParams(id,row);
            },
            getDelClick(data){
                const self = this;
//                self.isdelRuleShow = data.isClose;
                //确认需要刷新表格
                if(data.isOk){
                    self.$refs.tableDataList.getTableData();
                }
            },

            //向子组件传参
            initParams(id,row) {
                const self = this;
                self.activeId = id;
                self.ruleRow = row;
                self.ruleName = row.rule_name;
            },

            /**
             * 点击列
             */
            cellClick(row, column, cell, event) {
                const self = this;
                const operate =  event.target.getAttribute('data-operate');
                self[operate] && self[operate](row.uuid, row);
            },
            /**
             * 操作列
             * scope是当前行的各种数据
             * 操作列有删除 通过这个$event来判断($event.target判断点击的是哪个按钮)
             */
          /*  onClickOperate($event,scope){
                const self = this;
                const operate =  $event.target.getAttribute('data-operate');
                self[operate] && self[operate](scope.row.active_id, scope.row);
            },*/
            // 操作列的数据
            getOperateHtml(scope){
                let currentOperate = [];
                /*未发布的操作排序0：发布、复制、删除
                 未开始的操作排序1：复制、删除、中止
                 进行中的操作排序2：中止、复制
                 已结束的操作排序3：复制
                 已中止的操作排序4：复制*/
                switch(scope.row.rule_status) {
                    case 0 :
                        currentOperate = [
                            {
                                name: '复制',
                                operate: 'copyRule'
                            },
                            {
                                name: '启用',
                                operate: 'enableRule'
                            },
                            {
                                name: '删除',
                                operate: 'deleteRule'
                            }

                        ];
                        break;
                    case 1 :
                        currentOperate = [
                            {
                                name: '复制',
                                operate: 'copyRule'
                            },
                            {
                                name: '停用',
                                operate: 'forbiddenRule'
                            },
                            {
                                name: '删除',
                                operate: 'deleteRule'
                            }

                        ];
                        break;
                }

                let operateStr = '';

                currentOperate.map(item => {
                    operateStr += `<span class='operateBtn' style='margin-left: 10px;cursor:pointer;color:#2D8CF0;vertical-align:middle' data-operate="${item.operate}">${item.name}</span>`
            })

                return `<div class='operateRow' style='white-space: nowrap'>${operateStr}</div>`

            },
            //成功回调
            saveSuccessCallback: function(isClose) {
                this.$refs.tableDataList.getTableData();
                if (isClose) {
                    this.isShowPageSlide = false;
                }
            },
            //取消回调
            cancelCallback: function() {
                this.isShowPageSlide = false;
            }



        },
        watch: {

        }

    }
</script>



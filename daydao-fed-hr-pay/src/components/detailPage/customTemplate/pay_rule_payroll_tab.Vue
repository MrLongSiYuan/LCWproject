<style lang="scss" rel="stylesheet/scss">
    .pay_rule_payroll_tabs{
        margin-top: 50px;
        .payroll_handle_btn{
            margin-bottom: 10px;
            button{
                float: right;
                margin-left: 10px;
            }
        }
        .draggable_payroll_handle{
            .payroll-list-group{
                li.detail-pay-project-piece{
                    display: block;
                    width: 100%;
                    height: 36px;
                    margin-bottom: 10px;
                    box-sizing: border-box;
                    padding-left: 26px;
                    position: relative;
                    line-height: 34px;
                    font-size: 14px;
                    color: #657180;
                    cursor: move;
                    border: 1px solid #E3E8EE;
                    &:hover{
                        border: 1px dashed #9CA8B6;
                    }
                    i.icon_sort{
                        position: absolute;
                        left: 6px;
                        top:0;
                    }
                    i.arrow_right{
                        position: absolute;
                        left: 26px;
                        top:0;
                        cursor: pointer;
                    }
                    button{
                        position: absolute;
                        right: 0;
                        height: 100%;
                        span{
                            color: #2D8CF0;
                        }
                    }
                    span.pay_system{
                        display: inline-block;
                        width: 36px;
                        height: 20px;
                        border: 1px solid #9593EC;
                        border-radius: 2px;
                        font-size: 12px;
                        color: #9593EC;
                        line-height: 18px;
                        text-align: center;
                        margin-left: 10px;
                    }
                    span.pay_remark{
                        font-size: 12px;
                        color: #939BA6;
                        margin-left: 20px;
                    }
                    .draging_hover{
                        width: 100%;
                        height: 46px;
                        position: absolute;
                        left: 0;
                        top:0;
                        background: rgba(255,248,197,0.50);
                        display: none;
                        z-index: 9;
                    }
                }
                li.paysroll-sortable-drag,li.paysroll-sortable-chosen{
                    background: rgba(255,248,197,0.50);
                    @extend .detail-pay-project-piece;
                }
            }
        }
        .draggable_payroll{
            .payroll-list-group{
                li.detail-pay-project-piece{
                    cursor: default;
                    border: 1px solid #E3E8EE;
                    &:hover{
                        border: 1px solid #E3E8EE;
                    }
                    i.icon_sort{
                        position: absolute;
                        left: 10px;
                        top:0;
                        display: none;
                    }
                }
            }
            @extend .draggable_payroll_handle;
        }
    }
</style>
<template>
    <div class="pay_rule_payroll_tabs" v-show="payRollData.length != 0">
        <div class="payroll_handle_btn clearfix">
            <Button v-if="!canHandle" @click="setPayrollSwitch(true)">设置</Button>
            <Button v-if="canHandle" @click="setPayrollSwitch(false)">取消</Button>
            <Button type="primary" v-if="canHandle" @click="savePayroll">保存</Button>
        </div>
        <draggable  :class="canHandle ? 'draggable_payroll_handle':'draggable_payroll'" :options="dragOptions" @end="dragOver" v-model="payRollData">
            <transition-group class="payroll-list-group" type="transition" :name="'flip-list'">
                <li v-for="(item, index) in payRollData" :key="index" class="detail-pay-project-piece">
                    <i class="iconfont_daydao_common icon_sort">&#xe625;</i>
                    <Checkbox :value="item.isChecked" :disabled="!canHandle" class="detail-pay-check" @click.prevent.native="changeChecked(item)" v-if="item.itemId != 'n056' && item.itemId != 'n053'"></Checkbox>
                    <Checkbox :value="item.isChecked" :disabled="true" class="detail-pay-check" @click.prevent.native="changeChecked(item)" v-else></Checkbox>
                    <span class="pay_name">{{item.itemName}}</span>
                    <span class="pay_system" v-show="item.isSystem == 1">内置</span>
                    <span class="pay_remark">{{item.remark}}</span>
                    <div class="draging_hover"></div>
                </li>
            </transition-group>
        </draggable>
    </div>
</template>
<script type="text/javascript">
    import draggable from 'vuedraggable'

    export default{
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
            },
            customTemplateData:{
                type:Object,
                default(){
                    return {
                    };
                }
            }
        },
        data: function () {
            return {
                payRollData:[],   //工资条数据
                originalPayRollData:[], //工资条原始数据
                ruleId:'',
                canHandle:false  //是否可以设置工资条
            }
        },
        watch: {
            "currentTabInfo" (newValue, oldValue) {
                if(newValue.index === this.tabIndex) {
                    this.init()
                }
            }
        },
        computed:{
            // lib
            dragOptions() {
                return {
                    animation: 200,
                    dragClass: "paysroll-sortable-drag",
                    chosenClass: "paysroll-sortable-chosen",
                    disabled: !this.canHandle,
                    filter: ".detail-pay-check",
                }
            },
        },
        created: function () {
            var t = this;
            t.templateItem = JSON.parse(JSON.stringify(t.$parent.sectionItem));
            t.ruleId = t.$route.params.ruleId;
        },
        components: {
            draggable,
        },
        methods: {
            init:function () {
                var t = this;
                t.getPayrollData();
            },
            /*
            * 获取工资条数据
            * */
            getPayrollData:function () {
                var t = this;
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payRollBillSet/selectPayrollBillList.do",
                    data: JSON.stringify({
                        ruleId:t.ruleId
                    }),
                    success: function (data) {
                        if(data.result == 'true'){
                            t.payRollData = data.beanList.slice(0);
                            t.payRollData.forEach(function (val,index) {     //判断数据是否显示在工资条  通过uuid
                                if(val.uuid || val.itemId == "n053" || val.itemId == "n056"){
                                    t.payRollData[index].isChecked = true;
                                }else{
                                    t.payRollData[index].isChecked = false;
                                }
                            });
                            t.originalPayRollData = $.extend(true,[],t.payRollData);
                        }
                    }
                })
            },
            dragOver:function (evt) {
                var itemEl = evt.item;  // dragged HTMLElement
                var t = this;
                evt.to;    // target list
                evt.from;  // previous list
                evt.oldIndex;  // element's old index within old parent
                evt.newIndex;  // element's new index within new parent
                console.log(t.payRollData)

            },
            /*
            * 是否可以设置工资条
            * */
            setPayrollSwitch:function (option) {
                var t = this;
                if(option){
                    t.canHandle = true;
                }else{
                    t.canHandle = false;
                    t.payRollData = $.extend(true,[],t.originalPayRollData);
                    t.payRollData = JSON.parse(JSON.stringify(t.payRollData));
                }
            },
            /*
            * 改变单选框
            * */
            changeChecked:function (data) {
                var t = this;
//                iview的CheckBox双向绑定有问题   ^^
                t.payRollData.forEach(function (val,index) {
                    if(val.billOrder == data.billOrder){
                        t.payRollData[index].isChecked = !t.payRollData[index].isChecked;
                    }
                })
                t.payRollData = JSON.parse(JSON.stringify(t.payRollData));
            },
            /*
            * 保存工资条顺序
            * */
            savePayroll:function () {
                var t = this;
                var postOption = {};
                var delList = [];
                var beanList = [];
                t.payRollData.forEach(function (val,index){
                    t.payRollData[index].billOrder = 100+index;
                    if(t.payRollData[index].isChecked){   //选中的数据
                        beanList.push(t.payRollData[index]);
                    }
                    if(!(t.payRollData[index].isChecked) && t.payRollData[index].uuid){  //没有勾选并且uuid存在说明不在工资条显示
                        delList.push(t.payRollData[index].uuid);
                    }
                })
                postOption.beanList = beanList;
                postOption.delList = delList;
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payRollBillSet/savePayrollBillData.do",
                    data: JSON.stringify(postOption),
                    success: function (data) {
                        if(data.result == 'true'){
                            t.canHandle = false;
                            t.getPayrollData();
                            t.$Message.success(data.resultDesc);
                        }
                    }
                })
            }
        }
    }
</script>


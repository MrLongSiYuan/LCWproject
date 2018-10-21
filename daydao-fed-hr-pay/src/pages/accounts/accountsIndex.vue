<template>
    <div :class="prefixCls">
        <div :class="prefixCls + '-title'">
            <span>薪酬核算</span>
        </div>
        <div class="clear-both"></div>
        <div :class="prefixCls + '-top'">
            <div class="float-left">
                <span class="name">薪酬周期</span>
                <span class="time">
                    <DatePicker   :value ="searchDate" type="month" placeholder="按月搜索"  style="width: 220px" :editable="editable"    @on-change="changeSearchDate"     v-show="isSearchMonth == true" >
                    </DatePicker>
                    <DatePicker  :value="searchDate"  type="year" placeholder="按年搜索"  style="width: 220px"  :editable="editable"   @on-change="changeSearchDate"      v-show="isSearchMonth == false">
                    </DatePicker>
                </span>
                <!--<Button type="ghost"   icon="ios-search"  @click="searchFn"></Button>-->
                <span class="search" @click="searchFn"><Icon type="ios-search-strong" size="20"></Icon></span>
            </div>
            <div class="float-right">
                <Button type="primary" @click="showAddFn">新增周期</Button>
            </div>
        </div>
        <my-loading  :isShow="contentLoading" ref="contentLoading"></my-loading>
        <div class="clear-both"></div>
        <!--周期内容-->
        <div :class="prefixCls + '-center'" v-if="dataContent === true">
            <!--遮罩-->
             <div class="wrap" v-for="item in countRuleNumList">
                 <div class="wrap-title"><span>{{item.period}}</span><span style="margin-left: 18px;">计薪规则数：{{item.ruleNum}}</span></div>
                 <div class="wrap-body">
                      <div class="wrap-body-li" v-for="val in item.payrollRuleSumBeanList">
                          <span class="span-1"><Tag color="green" v-if="val.status == 3">已结账</Tag><Tag color="yellow" v-else>未结账</Tag></span>
                          <span  class="span-2"><b class="b-1" @click="skipDetail(val.ruleId,val.period)" :title="val.ruleName">{{val.ruleName}}</b><br/><b class="b-2">{{val.beginDate|myDateFormat}}~{{val.endDate|myDateFormat}}</b></span>
                          <span class="span-3">计薪人数 <b>{{val.personNum}}</b></span>
                          <span class="span-4">应发工资 <b>{{val.totalPayAmount|payToThousands}}</b></span>
                          <span class="span-5">实发工资 <b>{{val.finalPayAmount|payToThousands}}</b></span>
                          <span class="span-6">
                              <Dropdown trigger="click">
                                    <Button>
                                        导出
                                        <Icon type="arrow-down-b"></Icon>
                                    </Button>
                                    <DropdownMenu slot="list">
                                        <div class="item-menu">
                                            <div class="item-menu-wrap" @click="exportOrgFn('pay_payroll_detail_list',val.period,val.ruleId)">明细表</div>
                                            <div class="item-menu-wrap" @click="exportOrgFn('pay_orgs_sum_list',val.period,val.ruleId)">组织汇总表</div>
                                        </div>
                                    </DropdownMenu>
                                </Dropdown>
                          </span>
                      </div>
                 </div>
             </div>
        </div>
        <div :class="prefixCls + '-content'" v-if="dataContent === false">
            <div class="no-data"></div>
            <p class="desc">暂无内容</p>
        </div>
        <Modal title="新增薪酬周期" v-model="showAddDialog" :mask-closable="false" width="450" class="add-pay-period">
            <Form ref="addPayPeriod" :model="payPeriodForm" :rules="payPeriodRule" :label-width="80">
                <FormItem label="薪酬周期" prop="payPeriod">
                    <DatePicker  v-model="payPeriodForm.payPeriod"  type="month" placeholder="选择日期" style="width: 310px" :editable="editable" @on-change="changeAddDate"></DatePicker>
                </FormItem>
                <FormItem label="薪酬规则" prop="payRule">
                    <!--<Select v-model="payPeriodForm.payRule" style="width:310px" :clearable="clearable">
                        <Option v-for="item in ruleData" :value="item.ruleId" :key="item.ruleId">{{item.ruleName}}<a :href="'/hr/pay/rule_detail/'+item.ruleId+'/'+item.uuid" @click.stop  style="float: right;color: #2D8CF0;font-size: 12px;" target="_blank">查看</a></Option>
                    </Select> <Tooltip content="规则一初次系统自带一个规则" placement="top-start"><Icon type="help-circled" size="18" color="#6FB7FF"></Icon></Tooltip>-->
                    <CheckboxGroup v-model="payPeriodForm.payRule">
                        <Checkbox :label="item.ruleId" v-for="item in ruleData" :key="item.uuid" v-if="item.chkDisable == false">
                            <span>{{item.ruleName}}</span>
                            <a :href="'/hr/pay/rule_detail/'+item.ruleId+'/'+item.uuid" @click.stop  style="float: right;color: #2D8CF0;font-size: 12px;" target="_blank">查看</a>
                        </Checkbox>
                        <Checkbox :label="item.ruleId" v-for="item in ruleData" :key="item.uuid" v-if="item.chkDisable == true" disabled>
                            <span>{{item.ruleName}}</span>
                            <a :href="'/hr/pay/rule_detail/'+item.ruleId+'/'+item.uuid" @click.stop  style="float: right;color: #2D8CF0;font-size: 12px;" target="_blank">查看</a>
                        </Checkbox>
                    </CheckboxGroup>

                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="primary" @click="handleSubmit()" :loading="loading">确定</Button>
                <Button type="ghost" @click="handleReset()" style="margin-left: 8px">取消</Button>
            </div>
        </Modal>

    </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
    $prefixCls : pay-index;//样式前缀名
    $left :left;
    $right :right;
    .#{$prefixCls} {
        padding: 20px;
        .#{$prefixCls}-title{
            color: #657180;
            font-size: 16px;
            padding-left: 10px;
            font-weight: 600;
        }
        .#{$prefixCls}-top{
            margin-top: 10px;
            padding-left: 10px;
            .float-left{
                float: $left;
                .name{
                    font-size: 14px;
                    color: #939BA6;
                    padding-right: 8px;
                    float: left;
                    line-height: 32px;
                }
                .time{
                    float: left;
                }
                .search{
                    height: 32px;
                    line-height: 32px;
                    text-align: center;
                    box-sizing: border-box;
                    border: 1px solid #c4ceda;
                    width: 36px;
                    display: inline-block;
                    cursor: pointer;
                    border-radius:2px;
                    float: left;
                    margin-left: 20px;
                }
            }
            .float-right{
                float: $right;
                margin-right: 10px;
            }
        }
        .#{$prefixCls}-center{
            .wrap{
                min-width: 1100px;
                margin-top: 20px;
                border: 1px solid #E3E8EE;
                position: relative;
                .wrap-title{
                    background: #F4F6F8;
                    height: 38px;
                    line-height: 38px;
                    padding-left: 30px;
                    font-size: 14px;
                    color:#657180;
                    font-weight: 600;
                }
                .wrap-body{
                    width: 100%;
                    .wrap-body-li{
                        width: 100%;
                        height: 68px;
                        border-top: 1px solid #E3E8EE;
                        overflow: hidden;
                        span{
                            float: left;
                            text-align: left;
                            box-sizing: border-box;
                            &.span-1{
                                line-height: 68px;
                                width: 96px;
                                text-align: left;
                                padding-left: 32px;
                            }
                            &.span-2{
                                padding-top: 14px;
                                width:calc(25% - 51px);
                                overflow: hidden;
                                text-overflow: ellipsis;
                                b{
                                    white-space: nowrap;
                                    &.b-1{
                                        font-size: 14px;
                                        color: #2D8CF0;
                                        cursor: pointer;
                                        font-weight: 600;
                                    }
                                    &.b-2{
                                        font-size: 12px;
                                        color: #657180;
                                        font-weight: normal;
                                    }
                                }
                            }
                            &.span-3{
                                line-height: 68px;
                                width:calc(25% - 133px);
                                color: #657180;
                                font-size: 14px;
                                b{
                                    font-size: 22px;
                                    font-weight: 600;
                                    letter-spacing: 1px;
                                    position: relative;
                                    top: 3px;
                                }
                                min-width: 140px;
                            }
                            &.span-4{
                                line-height: 68px;
                                width:calc(25% - 10px);
                                color: #657180;
                                font-size: 14px;
                                text-align: right;
                                b{
                                    font-size: 22px;
                                    font-weight: 600;
                                    letter-spacing: 1px;
                                    position: relative;
                                    top: 3px;
                                    width: 150px;
                                    display: inline-block;
                                }
                                min-width: 215px;
                                padding-right: 40px;
                            }
                            &.span-5{
                                line-height: 68px;
                                width:calc(25% - 10px);
                                color: #657180;
                                font-size: 14px;
                                text-align: right;
                                b{
                                    font-size: 22px;
                                    font-weight: 600;
                                    letter-spacing: 1px;
                                    position: relative;
                                    top: 3px;
                                    width: 150px;
                                    display: inline-block;
                                }
                                min-width: 215px;
                                padding-right: 40px;
                            }
                            &.span-6{
                                float:right;
                                width: 108px;
                                text-align: left;
                                button {
                                    margin-top: 17px;
                                }
                            }
                        }
                    }
                }
            }
        }
        .#{$prefixCls}-content{
            .no-data{
                width: 400px; height: 176px; margin: 100px auto 30px; background: url("../../assets/images/no_content.png") no-repeat;
            }
            .content {
                position: relative;
            }
            .desc{
                font-size: 14px; text-align:  center;color: #657180;
            }
        }
        .clear-both{
            clear: both;
        }
        .item-menu{overflow: hidden;}
        .item-menu .item-menu-wrap{line-height: 28px; text-align: left;height: 28px;color: #657180;font-size: 14px; padding: 0 15px;cursor: pointer;}
        .item-menu .item-menu-wrap:hover{ background: #f8f8f8;}
        .ivu-tag-yellow { background: #FFB532;}
        .ivu-tag-green { background: #67C443;}
    }
    .add-pay-period {
        .ivu-checkbox-group{
            max-height: 150px;
            overflow-x: hidden;
            padding-right: 5px;
        }
        .ivu-checkbox-group-item{
            width: 100%;
        }
    }

</style>

<script type="text/babel">

    const prefixCls = "pay-index";
    const infoSetId = "pay-list";  //页面信息集ID
    import {payToThousands,myDateFormat} from "src/utils/helpers.js"
    import myLoading from "src/components/loading/myLoading.vue"

    export default {
        name:infoSetId
        ,data(){
            let t = this;
            return {
                infoSetId:infoSetId,
                prefixCls:prefixCls,
                isRequest:true,
                searchDate:"",         //搜索日期
                editable:false,        //是否能输入
                showAddDialog:false,   //是否展示新增弹窗
                loading:false,         //按钮遮罩
                payPeriodForm:{
                    payRule:[],
                    payPeriod:""
                },
                payPeriodRule:{
                    payPeriod: [
                        { required: true, message: '周期不能为空', trigger: 'change' }
                    ],
                    payRule: [
                        { required: true, type: 'array', min: 1, message: '至少选择一个规则', trigger: 'change' },
                    ]
                },
                ruleData:"",           //规则数据
                isRequestRule:false,   //是否请求规则数据
                clearable:true,        //是否可以清空规则下拉选中
                countRuleNumList:[],   //主页面所有数据
                dataContent:"",        //是否有数据
                isSearchMonth:true,    //搜索是否显示月
                contentLoading:false,  //内容遮罩

            };
        },
        computed: {
        }
        ,components:{
            myLoading,
        },
        filters: {
            payToThousands,
            myDateFormat
        }
        ,created(){
            let t = this;
            // 显示头部方法
            gMain.showPayHead(true);
        }
        ,mounted(){
            let t = this;
            t.getAllData();            //薪酬核算主页面统计数据
        },
        methods:{
            /**
             *获取薪酬核算主页面数据接口
             * */
            getAllData:function (param) {
                let t = this;
                t.contentLoading = true;
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payPayroll/getPayPayrollCountData.do"
                    , type: "POST"
                    , data: JSON.stringify({yearAndMonthStr:param})
                    , success: function (data) {
                        if (data.result == "true") {
                            t.contentLoading = false;
                            t.countRuleNumList = data.countRuleNumList;
                            if(t.countRuleNumList&&t.countRuleNumList!=null&&t.countRuleNumList.length>0){
                                t.dataContent = true;
                            }else{
                                t.dataContent = false;
                            }
                        }
                    }
                });
            },
            /**
             * 新增周期
             */
            showAddFn:function () {
                let t = this;
                t.showAddDialog = true;
                t.$refs["addPayPeriod"].resetFields();
                if(t.isRequestRule == false) {
                    t.$daydao.$ajax({
                        url: gMain.apiBasePath + "payPeriod/getPayRuleList.do"
                        , type: "POST"
                        , data: JSON.stringify({})
                        , success: function (data) {
                            if (data.result == "true") {
                                t.ruleData = data["payRuleBeanList"];
                                t.isRequestRule = true;
                            }
                        }
                    });
                }
            },
            /**
             *新增周期确定
             */
            handleSubmit:function () {
                let t = this;
                t.$refs["addPayPeriod"].validate((valid) => {
                    if (valid) {
                        t.loading = true;
                        t.addPeriodFn();
                    }
                })
            },
            /**
             * 取消新增
             */
            handleReset:function () {
                let t = this;
                t.showAddDialog = false;
            },
            /**
             * 新增周期提交接口
             */
            addPeriodFn:function () {
                let t = this;
                let oData = {
                    ruleIdList:t.payPeriodForm.payRule,
                    period:t.payPeriodForm.payPeriod
                }
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payPeriod/initPeriod.do"
                    , type: "POST"
                    , data: JSON.stringify(oData)
                    ,isPassFalse:true
                    , success: function (data) {
                        if (data.result == "true") {
                            t.loading = false;
                            t.showAddDialog = false;
                            t.getAllData();
                            t.$Message.success('新增成功');
                        }else if(data.result == "false"){
                            t.loading = false;
                            t.$Message.error(data.resultDesc);//接口报错提示
                        }
                    }
                });
            },
            /**
             * 改变新增日期触发的方法
             * @param date 日期格式
             */
            changeAddDate:function (date) {
                let t = this;
                t.payPeriodForm.payPeriod = date;
            },
            /**
             * 改变搜索日期触发的方法
             * @param date 日期格式
             */
            changeSearchDate:function (date) {
                let t = this;
                t.searchDate = date;
            },
            /**
             * 跳转进入薪酬规则详情页
             *@param ruleId 规则id
             *@param period 周期
             */
            skipDetail:function (ruleId,period) {
                let t = this;
                t.$router.push("/accountsDetail/"+ruleId+"/"+period);//加密周期
            },
            /**
             * 导出
             * @param paramId   pay_payroll_detail_list明细表  pay_orgs_sum_list组织汇总表
             * @param period 周期
             * @param ruleId 规则
             */
            exportOrgFn:function(paramId,period,ruleId){
                let t = this;
                t.$daydao.$ajax({
                    url:gMain.apiBasePath +"route/checkSessionTimeout.do",
                    data:JSON.stringify({}),
                    success: function (data) {
                        if (data.result == "true") {
                            let oData = {
                                customParam: {
                                    period: period,
                                    rule_id: ruleId,
                                },
                                infoSetId:paramId
                            }
                            var url = gMain.apiBasePath + "route/"+paramId+"/export.do"+ t.$daydao.$Ajax.getParamsStr(oData);
                            location.href =encodeURI(url);
                        }
                    }
                });
            },
            searchFn:function () {
                let t = this;
                t.getAllData(t.searchDate);
            },

        },
        watch: {

        }

    }
</script>



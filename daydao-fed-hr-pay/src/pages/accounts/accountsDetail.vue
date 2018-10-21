<template>
    <div :class="prefixCls">
        <div class="close_box" @click="closePage" title="关闭">
            <Icon type="close" class="close_btn"></Icon>
        </div>
        <div class="detail_title" v-show="!indexLoading">
            <p class="account_tip"><Tag color="green" v-if="isCheckout === true">已结账</Tag><Tag color="yellow" v-else>未结账</Tag></p>
            <p class="rule_name">{{detailInfo&&detailInfo.ruleName}}</p>
            <p class="rule_time">{{detailInfo&&detailInfo.period}}({{detailInfo&&detailInfo.beginDate|myDateFormat}}~{{detailInfo&&detailInfo.endDate|myDateFormat}})</p>
            <p class="rule_delete" @click="deleteRule" title="删除"><Icon type="trash-a"></Icon></p>
        </div>
        <div class="second_title" v-show="!indexLoading">
            <p class="sum">合计</p>
            <p class="person">计薪人数<span>{{detailInfo&&detailInfo.personNum}}</span></p>
            <p class="grosspay">应发工资<span>{{detailInfo&&detailInfo.totalPayAmount}}</span></p>
            <p class="factpay">实发工资<span>{{detailInfo&&detailInfo.finalPayAmount}}</span></p>
            <div class="exportlist">
                <Dropdown trigger="click">
                    <Button>
                        导出
                        <Icon type="arrow-down-b"></Icon>
                    </Button>
                    <DropdownMenu slot="list">
                        <div class="item-menu">
                            <div class="item-menu-wrap" @click="exportOrgFn('pay_payroll_detail_list')">明细表</div>
                            <div class="item-menu-wrap" @click="exportOrgFn('pay_orgs_sum_list')">组织汇总表</div>
                        </div>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
        <!--基础表格-->
        <div :class="prefixCls + '-content'" v-if="detailInfo!=''">
            <table-data-list  :infoSetId="infoSetId" ref="tableDataList"  :queryData="queryData" :getTableColumnParams="getTableColumnParams" :defineBtns="defineBtns" :isShowSelectionRow="isShowSelectionRow">
                <!--这里允许通过 <div slot="模块名称"></div> 来重写列表数据组件的模板-->
                <div slot="page-tree-menu"></div>
                <div slot="page-top"></div>
            </table-data-list>
        </div>
        <!--计算-->
        <div :class="prefixCls + '-count'" v-if="isCount === true">
            <div class="loading-bg"></div>
            <div class="circle-content">
                <i-circle :percent="percent" :stroke-color="color">
                    <Icon v-if="percent == 100" type="ios-checkmark-empty" size="60" style="color:#5cb85c"></Icon>
                    <span v-else style="font-size:24px;color: #FFF;">{{ percent }}%</span>
                </i-circle>
                <p>正在努力计算中，请稍后...</p>
            </div>
        </div>
        <!--发放工资条-->
        <Modal title="发放工资条" v-model="showSalaryClause" :mask-closable="false" width="470">
            <div class="salary-clause">
                <Form  :label-width="100">
                    <div style="width: 50%;float: left;">
                    <FormItem label="发放人员">{{salaryData.personSize}}</FormItem>
                    </div>
                    <div style="width: 50%;float: left;">
                    <FormItem label="实发工资" width="50%">{{salaryData.finalPayingAmount}}</FormItem>
                    </div>
                    <!--<FormItem label="薪酬周期">{{detailInfo.period}}</FormItem>
                    <FormItem label="薪酬规则">{{detailInfo.ruleName}}</FormItem>
                    <FormItem label="工资表名称">
                        <Input v-model="salaryClauseName" placeholder="请输入工资表名称" style="width: 300px"></Input>
                    </FormItem>
                    <FormItem label="工资条通知形式">
                        <CheckboxGroup>
                            <Checkbox label="工作消息"></Checkbox>
                            <Checkbox label="邮件"></Checkbox>
                            <Tooltip content="邮件发送成功后，工资条将不能被撤回" placement="top-start"><Icon type="help-circled" size="18" color="#6FB7FF"></Icon></Tooltip>
                        </CheckboxGroup>
                    </FormItem>-->
                </Form>
            </div>
            <div slot="footer">
                <Button type="primary" @click="enterFn()" :loading="loading">确定</Button>
                <Button type="ghost" @click="cancelFn()" style="margin-left: 8px">取消</Button>
            </div>
        </Modal>
        <!--调整计薪人员-->
        <Modal title="调整计薪人员" v-model="showPerson" :mask-closable="false" width="1000">
            <div class="pay-show-person">
                <div class="title">
                    <RadioGroup v-model="tabValue" size="large">
                        <Radio label="1">
                            <span>增员</span>
                        </Radio>
                        <Radio label="2">
                            <span>减员</span>
                        </Radio>
                    </RadioGroup>
                </div>
                <select-person ref="personSelect1" :ApiPersonURL="getPersonListUrl" :ApiPersonParams="getPersonListParams1" v-if="isRequestPerson" v-show="tabValue == 1"></select-person>
                <select-person ref="personSelect2" :ApiPersonURL="getPersonListUrl" :ApiPersonParams="getPersonListParams2" v-if="isRequestPerson" v-show="tabValue == 2"></select-person>
            </div>
            <div slot="footer" style="text-align: center">
                <Button type="primary"  :loading="loading1" @click="savePerson">确定</Button>
                <Button type="ghost" @click="showPerson = false" style="margin-left: 8px">取消</Button>
            </div>
        </Modal>
        <!--薪酬对比-->
        <Modal title="薪酬对比" v-model="showContrast" :mask-closable="false" width="330">
            对比周期：
            <Select v-model="contrastPeriod" style="width:220px" :clearable="clearable">
                <Option v-for="item in periodData" :value="item.id" :key="item.id">{{item.name}}</Option>
            </Select>
            <div slot="footer" style="text-align: center">
                <Button type="primary"  @click="saveContrast" :loading="loading2">确定</Button>
                <Button type="ghost" @click="showContrast = false" style="margin-left: 8px">取消</Button>
            </div>
        </Modal>
        <!--取数-->
        <Modal title="取数(跨周期/跨规则)" v-model="showNumber" :mask-closable="false" width="1100">
            <div class="show-number-title">
                <Steps :current="current">
                    <Step title="取数设置" content=""></Step>
                    <Step title="取数确认" content=""></Step>
                </Steps>
            </div>
            <div class="show-number-body" @click.self="closeAll" v-show="current == 0">
                <div class="show-number-body-rule">
                     <div class="float-left">
                         <span class="name">薪酬规则</span><Button type="text" @click="numSelect('rule')">选择</Button>
                         <div class="drop-select" v-show="ruleShow === true">
                         <CheckboxGroup v-model="checkRuleGroup">
                             <div class="check-li" v-for="item in checkRuleData">
                             <Checkbox :label="item.ruleName"  :key="item.uuid"></Checkbox>
                             </div>
                         </CheckboxGroup>
                         </div>
                     </div>
                     <div class="float-right">
                         <Tag   v-for="(val,$index) in checkRuleGroup" :key="val" closable @on-close="closeCheckNum($index,'rule')">{{val}}</Tag>
                     </div>
                </div>
                <div style="clear: both"></div>
                <div class="show-number-body-period">
                    <div class="float-left">
                        <span class="name">薪酬周期</span><Button type="text" @click="numSelect('period')">选择</Button>
                        <div class="drop-year" v-if="periodShow === true">
                            <Select v-model="searchYear" style="width:180px"   @on-change="changeSearchDate" placeholder="筛选年份">
                                <Option v-for="item in yearData" :value="item" :key="item">{{item}}</Option>
                            </Select>
                        </div>
                        <div class="drop-select second" v-show="periodShow === true">
                            <CheckboxGroup v-model="checkPeriodGroup">
                                <div class="check-li" v-for="item in checkPeriodData">
                                    <Checkbox :label="item"  :key="item"></Checkbox>
                                </div>
                            </CheckboxGroup>
                            <template v-if="checkPeriodData.length == 0 ">无数据</template>
                        </div>
                    </div>
                    <div class="float-right">
                        <Tag    v-for="(val,$index) in checkPeriodGroup" :key="val" closable @on-close="closeCheckNum($index,'period')">{{val}}</Tag>
                    </div>
                </div>
                <div style="clear: both"></div>
                <div class="show-number-body-pro">
                    <div class="float-left">
                        <span class="name">源项目</span><Button type="text" @click="numSelect('pro')">选择</Button>
                        <div class="drop-select" v-show="proShow === true">
                            <CheckboxGroup v-model="checkProGroup">
                                <div class="check-li" v-for="item in checkProData">
                                    <Checkbox :label="item.itemName"  :key="item.itemId"></Checkbox>
                                </div>
                            </CheckboxGroup>
                        </div>
                    </div>
                    <div class="float-right">
                        <Tag  v-for="(val,$index) in checkProGroup" :key="val" closable @on-close="closeCheckNum($index,'pro')">{{val}}</Tag>
                    </div>
                </div>
                <div style="clear: both"></div>
                <div class="show-number-body-item">
                    <div class="float-left">
                        <span class="name">目的项目</span>
                    </div>
                    <div class="float-right">
                        <template v-for="(val,$index) in checkProGroup">
                            <div class="show-number-body-item-wrap">
                            {{val}} →
                            <Select v-model="arrItem[$index]" style="width:150px" :key="val">
                                <Option v-for="item in checkProData" :value="item.itemId" :key="item.itemId">{{ item.itemName }}</Option>
                            </Select>
                            </div>
                        </template>

                    </div>
                </div>
            </div>

            <div class="show-number-table"  v-show="current == 1">
                <div class="show-number-table-title">
                    <table   border="1" cellpadding="0" cellspacing="0"  borderColor="#e9eaec" id="showNumberTableTitle">
                        <colgroup>
                            <col width="200" v-for="item in newTableHead">
                        </colgroup>
                        <thead>
                        <th v-for="item in newTableHead">{{item}}</th>
                        </thead>
                    </table>
                </div>
                <div class="show-number-table-content" id="showNumberTableContent">
                    <table width="100%"  border="1" cellpadding="0" cellspacing="0"  borderColor="#e9eaec"  style="margin-top: -40px;">
                         <colgroup>
                            <col width="200" v-for="item in newTableHead">
                         </colgroup>
                         <thead>
                           <th v-for="item in newTableHead">{{item}}</th>
                         </thead>
                         <tbody>
                             <template v-for="(item,index) in payPersonBeanList">
                                 <template v-for="(val,$index) in item.payPayrollBeanList">
                                     <tr>
                                         <td :rowspan="item.payPayrollBeanList.length + 1" v-if="$index == 0">{{index+1}}</td>
                                         <td :rowspan="item.payPayrollBeanList.length + 1" v-if="$index == 0">{{item.personName}}</td>
                                         <td class="no-border">{{val.ruleName}}</td>
                                         <td class="no-border">{{val.period}}</td>
                                         <td v-for="obj in arrProId" class="text-right no-border">{{val[obj]}}</td>
                                         <td class="no-border"><template v-if="val.status == 3">已结账</template><template v-if="val.status != 3">未结账</template></td>
                                     </tr>
                                     <tr v-if="$index == item.payPayrollBeanList.length - 1" class="no-content">
                                         <td colspan="2" class="border-right text-left" >小计</td>
                                         <td v-for="key in arrProId" class="border-center text-right">{{item.payPayrollBean[key]}}</td>
                                         <td></td>
                                     </tr>
                                 </template>
                             </template>
                         </tbody>
                    </table>
                </div>
                <div class="show-number-table-page">
                    <Page size="small" :total="iNum" :page-size="pageSize" :page-size-opts="[5,10,20,50,100]" @on-change="changePage" @on-page-size-change="changePage2"  show-elevator show-sizer show-total></Page>
                </div>
            </div>
            <div slot="footer" style="text-align: right" v-if="current == 0">
                <Button type="primary"  @click="nextFn" :loading="loading3">下一步</Button>
            </div>
            <div slot="footer" style="text-align: right" v-if="current == 1">
                <Button type="ghost" @click="preFn">上一步</Button>
                <Button type="primary"  @click="saveNumber" :loading="loading3">完成</Button>
            </div>
        </Modal>
    </div>
</template>

<script type="text/babel">
    const prefixCls = "pay-accounts-detail";
    const infoSetId = "pay_payroll_detail_list";  //页面信息集ID
    import myLoading from "src/components/loading/myLoading.vue"
    import tableDataList from "commonVueLib/tableDataList/index";
    import { ElTable,ElTableColumn } from 'commonVueLib/element-table/index'
    import {myDateFormat} from "src/utils/helpers.js"//日期转换
    import selectPerson from "commonVueLib/selectPerson/index";//新版选人组件
    import formatTableData from 'utils/formatTableData'

    export default {
        name:infoSetId,
        data() {
            let t = this;
            return {
                infoSetId:infoSetId,
                prefixCls:prefixCls,                        //class或id前缀
                detailInfo:"",
                period:"",                                  //周期
                getTableColumnParams:{},                    //表头需要的参数
                queryData:{},                               //表格getAll参数
                defineBtns:[],                              //按钮
                percent:0,                                  //百分比
                isCount:false,                              //是否开始计算，false表示否
                color:"#2DB7F5",                            //计算圆圈颜色
                isCheckout:false,                           //是否已结账，false表示否
                showSalaryClause:false,                     //是否展示发放工资条
                showPerson:false,                           //是否展示调薪人员弹窗
                showNumber:false,                           //是否展示取数弹窗
                loading:false,                              //工资条按钮遮罩
                loading1:false,                             //计薪人员遮罩
                loading2:false,                             //薪酬对比遮罩
                loading3:false,                             //取数按钮遮罩
                salaryClauseName:"201710集团总部规则工资表1", //工资表名称
                isShowSelectionRow:true,                    //是否选择复选框
                isRequestPerson:false,                      //是否请求了选人接口
                showContrast:false,                         //薪酬对比弹窗
                contrastPeriod:"",                          //选中对比周期
                periodData:[],                              //对比周期数据
                clearable:false,                            //是否能清除
                aCompareBeans:[],                           //薪酬对比获取的比较数据
                aRowData:[],                                //当前页所有数据
                aColModels:[],                              //当前表头数据
                current:0,                                  //取数当前步骤
                checkRuleData:[],                           //取数薪酬规则
                ruleShow:false,
                checkRuleGroup:[],                          //取数选中的规则
                checkPeriodData:[],                         //取数薪酬周期
                periodShow:false,
                checkPeriodGroup:[],                        //取数选中的周期
                searchYear:"",                              //薪酬周期搜索的年
                yearData:[],                                //年份数据
                editable:false,                             //禁止输入
                checkProData:[],                            //取数源项目
                proShow:false,
                checkProGroup:[],                           //取数选中的源项目
                arrItem:[],                                 //目的项目下拉取值数组
                isRequestPeriod:false,                      //是否请求了周期  特殊处理
                arrRuleId:[],
                arrProId:[],
                tableHead1:["序号","姓名","薪酬规则","薪酬周期"],
                tableHead2:["结账状态"],
                newTableHead:[],                            //合并的表头
                payPersonBeanList:[],
                sPeriod:"",
                getPersonListUrl:gMain.apiBasePath +"payPayroll/selectAdjustPayPersonData.do",//获取计薪人员接口
                getPersonListParams1:{                      //获取计薪人员接口增员附带参数
                    handleType:1,
                    period:t.$route.params.period,
                    ruleId:t.$route.params.ruleId,
                },
                getPersonListParams2:{                      //获取计薪人员接口减员附带参数
                    handleType:2,
                    period:t.$route.params.period,
                    ruleId:t.$route.params.ruleId,
                },
                tabValue:"1",
                pageNo:1,
                pageSize:5,
                iNum:0,                                     //总数
                indexLoading:false,                         //详情遮罩
                salaryData:"",                              //发送工资条数据
            }

        },
        computed: {
        },
        components:{
            myLoading,
            tableDataList,
            ElTable,
            ElTableColumn,
            selectPerson
        },
        filters: {
            myDateFormat
        },
        created() {
            let t = this;
            // 显示头部
            gMain.showPayHead(false);
            t.getDetailData();
        },
        mounted(){
            let t = this;

        },
        updated(){
            let t = this;
            t.$refs.tableDataList.$watch('tableData.maps', function(val){
                if ($('.payComparepTdIco').length){
                    $('.payComparepTdIco').remove();
                }
                $('.enterClass').stop(true,true).css('display','none');
            })
            t.$refs.tableDataList.formatTableData = function(arr) {
                const t = this;
                return formatTableData.formatTableData(t, arr, "");
            }
            t.headerDeatil();
            $('#showNumberTableContent').scroll(function(){
                $('#showNumberTableTitle').css('transform', 'translate(-' + $(this).scrollLeft() + 'px)');
            })
        },

        methods: {
            /**
             * 渲染表格之后绑定薪酬对比事件
             * */
            headerDeatil(){
                let t = this;
                if(!$('#pay_status_txt').length){
                    $('.page_table').append('<div class="enterClass" id="pay_status_txt" style="display: none;"></div>');
                }
                //表格单元格鼠标移动事件
                t.payTimer = null;
                $('.page_table').on('mouseenter','td',function () {
                    var $that = $(this);
                    clearTimeout(t.payTimer);
                    t.payTimer = setTimeout(function () {
                        var offsetL = $that.offset().left - $('.page_table').offset().left - $('#pay_status_txt').width() - 20;
                        var offsetT = $that.offset().top - $('.page_table').offset().top;
                        if(offsetL<0){//如果是第一列，到达最左边
                            $('.enterClass').css({'left':'0','top':offsetT});
                        } else {
                            $('.enterClass').css({'left':offsetL,'top':offsetT});
                        }
                        var  $compareDemo= $that.find(".payComparepTdIco");
                        if($compareDemo.length==0){
                            $('.enterClass').stop(true,true).css('display','none');
                            return;
                        }
                        var compareValue = $compareDemo.attr('compareValue');
                        var subValue = $compareDemo.attr('subValue');
                        var comparePeriod = $compareDemo.attr('comparePeriod');
                        var _className = "compare_close_btn";
                        if(parseInt(subValue)<0){
                            _className = "compare_green";
                        }else if(parseInt(subValue)>0){
                            _className = "compare_red";
                        }
                        var differenceValue = parseFloat(subValue).toFixed(parseInt(2)) > 0 ?  '+' + parseFloat(subValue).toFixed(parseInt(2)) : parseFloat(subValue).toFixed(parseInt(2));
                        var sCompareData = "<p><label>&nbsp;</label><a href='javascript:;' class='pay_compare_link'>关闭对比</a></p>" +
                            "<p><label>对比周期</label><span>"+comparePeriod+"</span></p>" +
                            "<p><label>对比周期值</label><span>"+parseFloat(compareValue).toFixed(parseInt(2))+"</span></p>" +
                            "<p><label>差异值</label><span class='"+_className+"'>"+ differenceValue +"</span></p>";
                        $('#pay_status_txt').html(sCompareData);
                        $('#pay_status_txt').on('click','.pay_compare_link',function () {
                            if ($('.payComparepTdIco').length){
                                $('.payComparepTdIco').remove();
                            }
                            $('.enterClass').stop(true,true).css('display','none');
                        })
                        $('.enterClass').stop(true,true).css('display','block');
                    },200);

                });
                $('.page_table').on('mouseleave','td',function (event) {
                    var  $compareDemo= $(this).find(".payComparepTdIco");
                    if($compareDemo.length==0){
                        $('.enterClass').stop(true,true).css('display','none');
                        return;
                    }
                    if(!$(event.relatedTarget).closest(".enterClass").length){
                        clearTimeout(t.payTimer);
                        $('.enterClass').stop(true,true).css('display','none');
                    }
                });
            },
            /**
             * td添加薪酬对比数据
             * */
            createTdIco() {
                let t = this;
                if ($('.payComparepTdIco').length){
                    $('.payComparepTdIco').remove();
                }
                $('.enterClass').stop(true,true).css('display','none');
                let $tr = $('.el-table__body-wrapper').find('tr');
                //标记行 列
                t.aRowData = t.$refs.tableDataList.tableData.maps;
                t.aColModels = t.$refs.tableDataList.tableColumnData;
                let arrColModels = [];
                for(let k=0;k<t.aColModels.length;k++){
                    if(t.aColModels[k].isListShow == true){
                        arrColModels.push(t.aColModels[k]);
                    }
                }
                for(let i=0;i<t.aRowData.length;i++){
                    let $demoTr = $tr.eq(i);
                    $demoTr.find('td').attr('data-uuid',t.aRowData[i].uuid);
                    for(let j=0;j<arrColModels.length;j++){
                        $demoTr.find('td').eq(j+2).attr('data-colName',arrColModels[j].name);
                    }
                }
                for(let i=0;i<t.aCompareBeans.length;i++){
                    let sUuid = t.aCompareBeans[i].uuid;
                    let sColName = t.aCompareBeans[i].itemId;
                    let $demoTd = $('.el-table__body-wrapper').find('td[data-uuid='+sUuid+'][data-colName='+sColName+']');
                    $demoTd.css('position','relative');
                    let _className = "comparepTdIco_gray";
                    if(parseInt(t.aCompareBeans[i].subValue)<0){
                        _className = "comparepTdIco_red";
                    }else if(parseInt(t.aCompareBeans[i].subValue)>0){
                        _className = "comparepTdIco_green";
                    }
                    $demoTd.append("<span class='payComparepTdIco "+_className+"' comparePeriod='"+t.contrastPeriod+"' compareValue='"+t.aCompareBeans[i].compareValue+"' subValue='"+t.aCompareBeans[i].subValue+"'></span>");
                }
            },
            /**
             * 关闭详情返回薪酬核算首页
             */
            closePage() {
                let t = this;
                t.$router.push("/accountsIndex");
            },
            /**
             * 获取薪酬核算详情页基本详情
             */
            getDetailData(){
                let t = this;
                t.indexLoading = true;
                let oData = {
                    period:t.$route.params.period,
                    ruleId:t.$route.params.ruleId
                }
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payPayroll/getPayrollCountDataByRuleId.do"
                    , type: "POST"
                    , data: JSON.stringify(oData)
                    , success: function (data) {
                        if (data.result == "true") {
                           t.detailInfo = data.payrollRuleSumBean;
                           t.indexLoading = false;

                           if(t.detailInfo.status == 3){
                               t.isCheckout = true;
                               t.getBtn1();
                           }else{
                               t.isCheckout = false;
                               t.getBtn();
                           }
                           t.getTableColumnParams = {
                               customParam :{
                                   begin_date:t.detailInfo.beginDate,
                                   end_date:t.detailInfo.endDate,
                                   period:t.detailInfo.period,
                                   rule_id:t.detailInfo.ruleId,
                                   status:t.detailInfo.status,
                               }
                           }
                           t.queryData = {
                              pageBean:{
                                  pageNo:"1",
                                  pageSize:20
                              },
                               customParam :{
                                   begin_date:t.detailInfo.beginDate,
                                   end_date:t.detailInfo.endDate,
                                   period:t.detailInfo.period,
                                   rule_id:t.detailInfo.ruleId,
                                   status:t.detailInfo.status,
                               }

                           }

                        }
                    }
                });
            },
            /**
             * 获取薪酬核算详情页表格按钮 结账状态
             */
            getBtn(){
                let t = this;
                t.defineBtns=[
                    {
                        name:"取数",
                        event:function(){
                            t.showNumberFn();
                        }

                    },
                    {
                        name:'导入',
                        event:function(){
                            sessionStorage.setItem("importData",JSON.stringify({
                                getTableColumnData:t.$refs.tableDataList.getTableColumnData //表格配置
                                ,aColumnShowData:t.$refs.tableDataList.$refs.tableList.aColumnShowData //显示列的字段
                                ,modelId:{
                                    add:"pay_payroll_detail_list",
                                    edit:"pay_payroll_detail_list"
                                }, //导入模板的ID
                                oCustomParam:{
                                    customParam: "{'period': '"+t.$route.params.period+"', 'rule_id':'"+ t.$route.params.ruleId +"'}",
                                    period: t.$route.params.period,
                                    rule_id: t.$route.params.ruleId
                                }//自定义额外参数
                            }));
                            t.$router.push("/importData/" + infoSetId + "/single");  //单行导入
                        }
                    },
                    {
                        name:"计算",
                        event:function(){
                            t.startCountFn();
                        }
                    },
                    {
                        name:"发放工资条",
                        event:function(){
                            t.showSalaryClauseFn();
                        }
                    },
                    {
                        name:"更多操作",
                        children:[
                            {
                                name:"调整计薪人员",
                                event:function(){
                                    t.regulationPerson();
                                }
                            },
                            {
                                name:"重新初始化",
                                event:function(){
                                    t.resetInit();
                                }
                            },
                            {
                                name:"薪酬对比",
                                event:function(){
                                    t.showContrastFn();
                                }
                            },
                            {
                                name:"结账",
                                event:function(){
                                    t.checkoutFn();
                                }
                            }
                        ]

                    },
                ]
            },
            /**
             * 获取薪酬核算详情页表格按钮 反结账状态
             */
            getBtn1(){
                let t = this;
                t.defineBtns=[
                    {
                        name:"取数",
                        event:function(){
                            t.showNumberFn();
                        }

                    },
                    {
                        name:'导入',
                        event:function(){
                            sessionStorage.setItem("importData",JSON.stringify({
                                getTableColumnData:t.$refs.tableDataList.getTableColumnData //表格配置
                                ,aColumnShowData:t.$refs.tableDataList.$refs.tableList.aColumnShowData //显示列的字段
                                ,modelId:{
                                    add:"pay_payroll_detail_list",
                                    edit:"pay_payroll_detail_list"
                                }, //导入模板的ID
                                oCustomParam:{
                                    customParam: "{'period': '"+t.$route.params.period+"', 'rule_id':'"+ t.$route.params.ruleId +"'}",
                                    period: t.$route.params.period,
                                    rule_id: t.$route.params.ruleId
                                }//自定义额外参数
                            }));
                            t.$router.push("/importData/" + infoSetId + "/single");  //单行导入
                        }
                    },
                    {
                        name:"计算",
                        event:function(){
                            t.startCountFn();
                        }
                    },
                    {
                        name:"发放工资条",
                        event:function(){
                            t.showSalaryClauseFn();
                        }
                    },
                    {
                        name:"更多操作",
                        children:[
                            {
                                name:"调整计薪人员",
                                event:function(){
                                    t.regulationPerson();
                                }
                            },
                            {
                                name:"重新初始化",
                                event:function(){
                                    t.resetInit();
                                }
                            },
                            {
                                name:"薪酬对比",
                                event:function(){
                                    t.showContrastFn();
                                }
                            },
                            {
                                name:"反结账",
                                event:function(){
                                    t.checkoutFn1();
                                }
                            }
                        ]

                    },
                ]
            },
            /**
             * 开始计算
             */
            startCountFn() {
                let t = this;
                if(t.isCheckout == true){
                    t.$Message.warning('已结账状态不能进行计算!');
                    return false;
                }
                let arrPersonSelected = t.$refs.tableDataList.getSelectedRows();//选中的人
                let sArrPerson = "";
                let arrPersonUuid = [];
                for(let i =0;i<arrPersonSelected.length;i++){
                    arrPersonUuid.push(arrPersonSelected[i].uuid);
                }
                sArrPerson = arrPersonUuid.join(",");
                if(arrPersonSelected.length==0) {
                    t.$daydao.$ajax({
                        url: gMain.apiBasePath + "payPayroll/paymentCaldyn.do"
                        , type: "POST"
                        , data: JSON.stringify({period:t.$route.params.period,ruleId:t.$route.params.ruleId})
                        ,isPassFalse:true
                        , success: function (data) {
                            if (data.result == "true") {
                                t.counting(data.maps[0].uuid);
                            }
                        }
                    });

                }else{
                    t.counting(sArrPerson);
                }



            },
            /**
             * 发送计算中请求
             * @param personUuid  人员uuid字符串
             * */
            counting(personUuid){
                let t = this;
                let oData1 = {
                    customParam: {
                        rule_id: t.$route.params.ruleId
                    }
                }
                t.percent = 0;
                t.isCount = true;//开启遮罩计算
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payPayroll/getPayFormula.do"
                    , type: "POST"
                    , data: JSON.stringify(oData1)
                    , success: function (data) {
                        if (data.result == "true") {
                            let arrRuleUuid = [];
                            let sArrRule = "";
                            for(let i =0;i<data.beans.length;i++){
                                arrRuleUuid.push(data.beans[i].uuid);
                            }
                            sArrRule = arrRuleUuid.join(",");

                            let oData2 = {
                                calFormulas:sArrRule,
                                calFromDate:t.detailInfo.endDate,
                                calToDate:t.detailInfo.endDate,
                                extParam: '{"getCalFromDateKey":"'+t.detailInfo.beginDate +'"}',
                                isSaveToDB:true,
                                rule_id: t.$route.params.ruleId,
                                period: t.$route.params.period,
                                uuid:personUuid,
                            }

                            t.$daydao.$ajax({
                                url: gMain.apiBasePath + "formulacal/calStart.do"
                                , type: "POST"
                                , data: JSON.stringify(oData2)
                                ,isPassFalse:true
                                , success: function (data) {
                                    let timer = null;
                                    timer = setInterval(function () {
                                        t.$daydao.$ajax({
                                            url: gMain.apiBasePath + "formulacal/getFinishPer.do"
                                            , type: "POST"
                                            , data: JSON.stringify({uid:data.uid})
                                            ,isPassFalse:true
                                            , success: function (data) {
                                                if (data.result == "true") {
                                                    t.percent = parseInt(data.finishPer);
                                                    if(t.percent==100){
                                                        clearInterval(timer);
                                                        setTimeout(function () {
                                                            t.isCount = false;
                                                            t.$Message.success(data.resultDesc);
                                                            t.getDetailData();//重新请求一遍基本数据
                                                            t.$refs.tableDataList.getTableData();
                                                        },2000)
                                                    }
                                                }else{
                                                    clearInterval(timer);
                                                    t.isCount = false;
                                                    t.$Message.warning(data.resultDesc);
                                                }
                                            }
                                        });
                                    },1000)
                                }
                            });

                        }
                    }
                });
            },
            /**
             * 确定发放工资条
             */
            enterFn(){
                let t = this;
                let arrPersonSelected = t.$refs.tableDataList.getSelectedRows();//选中的人
                let arrPersonUuid = [];
                let arrPersonId = [];
                for(let i =0;i<arrPersonSelected.length;i++){
                    arrPersonUuid.push(arrPersonSelected[i].uuid);
                    arrPersonId.push(arrPersonSelected[i].id);
                }
                let oData = {
                    period:t.$route.params.period,
                    ruleId:t.$route.params.ruleId,
                    uuidLists:arrPersonUuid,
                    personList:arrPersonId
                }
                t.loading = true;
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payPayroll/generateSalary.do"
                    , type: "POST"
                    , data: JSON.stringify(oData)
                    ,isPassFalse:true
                    , success: function (data) {
                        if (data.result == "true") {
                            t.loading = false;
                            t.showSalaryClause = false;
                            t.$Message.success("发放工资条成功");
                            t.$refs.tableDataList.getTableData();
                        }else{
                            t.loading = false;
                            t.$Message.warning(data.resultDesc);
                        }
                    }
                });


            },
            /**
             * 取消发放工资条
             */
            cancelFn() {
                let t = this;
                t.showSalaryClause = false;
            },
            /**
             * 点击发放工资条
             */
            showSalaryClauseFn(){
                let t = this;
                if(t.isCheckout == true) {
                    let arrPersonSelected = t.$refs.tableDataList.getSelectedRows();//选中的人
                    let arrPersonUuid = [];
                    let arrPersonId = [];
                    for(let i =0;i<arrPersonSelected.length;i++){
                        arrPersonUuid.push(arrPersonSelected[i].uuid);
                        arrPersonId.push(arrPersonSelected[i].id);
                    }
                    let oData = {
                        period:t.$route.params.period,
                        ruleId:t.$route.params.ruleId,
                        uuidLists:arrPersonUuid,
                        personList:arrPersonId
                    }
                    t.$daydao.$ajax({
                        url: gMain.apiBasePath + "payPayroll/getPayrollAmountDataByRuleId.do"
                        , type: "POST"
                        , data: JSON.stringify(oData)
                        , success: function (data) {
                            if (data.result == "true") {
                                t.salaryData = data;
                                t.showSalaryClause = true;
                            }
                        }
                    });
                }else{
                    t.$Message.warning("请先结账，才能进行发放工资条！")
                }
            },
            /**
             * 结账
             */
            checkoutFn(){
                let t = this;
                let oData = {
                    customParam: {
                        period: t.$route.params.period,
                        rule_id: t.$route.params.ruleId
                    }
                }
                t.$Modal.confirm({
                    title: '结账提示',
                    content: '<Icon type="help-circled"></Icon><p>当前周期下的所有员工</p>',
                    loading: true,
                    onOk: function(){
                        let _this = this;
                        _this.buttonLoading = true;
                        t.$daydao.$ajax({
                            url: gMain.apiBasePath + "payPayroll/checkOut.do"
                            , type: "POST"
                            , data: JSON.stringify(oData)
                            ,isPassFalse:true
                            , success: function (data) {
                                if (data.result == "true") {
                                    t.isCheckout = true;
                                    t.$Modal.remove();
                                    t.$Message.success("结账成功");
                                    t.getBtn1();
                                    t.$refs.tableDataList.getTableData();
                                }else if(data.result == "false"){
                                    _this.buttonLoading = false;
                                    t.$Message.error(data.resultDesc);//接口报错提示
                                }
                            }
                        });

                    }
                })

            },
            /**
             * 反结账
             */
            checkoutFn1(){
                let t = this;
                let oData = {
                    customParam: {
                        period: t.$route.params.period,
                        rule_id: t.$route.params.ruleId,
                        status: 4
                    }
                }
                t.$Modal.confirm({
                    title: '反结账提示',
                    content: '<p>当前周期下的所有员工</p>',
                    loading: true,
                    onOk: function(){
                        let _this = this;
                        _this.buttonLoading = true;
                        t.$daydao.$ajax({
                            url: gMain.apiBasePath + "payPayroll/checkPayStatus.do"
                            , type: "POST"
                            , data: JSON.stringify(oData)
                            ,isPassFalse:true
                            , success: function (data) {
                                if (data.result == "true") {
                                    t.isCheckout = false;
                                    t.$Modal.remove();
                                    t.$Message.success("反结账成功");
                                    t.getBtn();
                                    t.$refs.tableDataList.getTableData();
                                }else if(data.result == "false"){
                                    _this.buttonLoading = false;
                                    t.$Message.error(data.resultDesc);//接口报错提示
                                }
                            }
                        });

                    }
                })

            },
            /**
             * 重新初始化
             */
            resetInit(){
                let t = this;
                if(t.isCheckout == true){
                    t.$Message.warning('已结账状态不能进行初始化!');
                    return false;
                }
                let oData = {
                    customParam: {
                        period: t.$route.params.period,
                        rule_id: t.$route.params.ruleId,
                    }
                }
                t.$Modal.confirm({
                    title: '提示',
                    content: '<p>系统将重置相关薪酬项目的初始值，原有的数值都将会被替换，您确定要这样做么？</p>',
                    loading: true,
                    onOk: function(){
                        let _this = this;
                        _this.buttonLoading = true;
                        t.$daydao.$ajax({
                            url: gMain.apiBasePath + "payPayroll/initData.do"
                            , type: "POST"
                            , data: JSON.stringify(oData)
                            ,isPassFalse:true
                            , success: function (data) {
                                if (data.result == "true") {
                                    t.$Modal.remove();
                                    t.$Message.success("初始化成功");
                                    t.getDetailData();//重新请求一遍基本数据
                                    t.$refs.tableDataList.getTableData();
                                }else if(data.result == "false"){
                                    _this.buttonLoading = false;
                                    t.$Message.error(data.resultDesc);//接口报错提示
                                }
                            }
                        });

                    }
                })
            },
            /**
             * 导出
             * @param paramId   pay_payroll_detail_list明细表  pay_orgs_sum_list组织汇总表
             */
            exportOrgFn(paramId){
                let t = this;
                t.$daydao.$ajax({
                    url:gMain.apiBasePath +"route/checkSessionTimeout.do",
                    data:JSON.stringify({}),
                    success: function (data) {
                        if (data.result == "true") {
                            let oData = {
                                customParam: {
                                    period: t.$route.params.period,
                                    rule_id: t.$route.params.ruleId,
                                },
                                infoSetId:paramId
                            }
                            let url = gMain.apiBasePath + "route/"+paramId+"/export.do"+ t.$daydao.$Ajax.getParamsStr(oData);
                            location.href =encodeURI(url);
                        }
                    }
                });
            },
            /**
             * 调整计薪人员
             */
            regulationPerson(){
                let t = this;
                t.tabValue = "1";
                t.showPerson = true;
                t.isRequestPerson = true;
            },
            /**
             * 保存计薪人员
             */
            savePerson(){
                let t = this;
                if(t.isCheckout == true){
                    t.$Message.warning('已结账状态不能进行调整计薪人员!');
                    return false;
                }
                t.loading1 = true;
                let arrPerson =[];
                let arrOrg =[];
                if(t.tabValue == 1){
                    for(let i = 0;i<t.$refs.personSelect1.selectedPerson.length;i++){
                         let obj = {
                             personId:t.$refs.personSelect1.selectedPerson[i].personId
                         }
                        arrPerson.push(obj);
                    }
                    for(let i = 0;i<t.$refs.personSelect1.selectedOrg.length;i++){
                        arrOrg.push(t.$refs.personSelect1.selectedOrg[i].id);
                    }
                }else{
                    for(let i = 0;i<t.$refs.personSelect2.selectedPerson.length;i++){
                        let obj = {
                            personId:t.$refs.personSelect2.selectedPerson[i].personId
                        }
                        arrPerson.push(obj);
                    }
                    for(let i = 0;i<t.$refs.personSelect2.selectedOrg.length;i++){
                        arrOrg.push(t.$refs.personSelect2.selectedOrg[i].id);
                    }
                }
                let oData1 = {
                    handleType:t.tabValue,
                    payPersonBeanList:arrPerson,
                    orgIdList:arrOrg
                }

                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payPayroll/selectCheckPersonInfo.do"
                    , type: "POST"
                    , data: JSON.stringify(oData1)
                    , success: function (data) {
                        let oData = {
                            handleType:t.tabValue,
                            payPersonBeanList:data.payPersonBeanList,
                            period:t.$route.params.period,
                            ruleId:t.$route.params.ruleId
                        }
                        t.$daydao.$ajax({
                            url: gMain.apiBasePath + "payPayroll/synchronousPayrollDataDo.do"
                            , type: "POST"
                            , data: JSON.stringify(oData)
                            ,isPassFalse:true
                            , success: function (data) {
                                t.loading2 = false;
                                if (data.result == "true") {
                                    t.showPerson = false;
                                    t.loading1 = false;
                                    if(t.tabValue == 1) {
                                        t.$Message.success("增员成功");
                                    }else{
                                        t.$Message.success("减员成功");
                                    }
                                    t.getDetailData();//重新请求一遍基本数据
                                    t.$refs.tableDataList.getTableData();

                                }else if(data.result == "false"){
                                    t.loading1 = false;
                                    t.$Message.error(data.resultDesc);
                                }
                            }
                        });
                    }
                });

            },
            /**
             * 薪酬对比
             */
            showContrastFn(){
                let t = this;
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payPayroll/getPayComparePeriod.do"
                    , type: "POST"
                    , data: JSON.stringify({period:t.$route.params.period,ruleId:t.$route.params.ruleId})
                    , success: function (data) {
                        if (data.result == "true") {
                            t.periodData = data.maps;
                            t.contrastPeriod = data.maps[0].id;
                            t.showContrast = true;
                        }
                    }
                });

            },
            /**
             * 薪酬对比保存
             */
            saveContrast(){
                let t = this;
                if(t.contrastPeriod == ""){
                    t.$Message.warning("请选择周期");
                }
                let dataList = t.$refs.tableDataList.tableData.maps;
                let arrUUid = [],arrPerson=[];
                for(let i =0;i<dataList.length;i++){
                    arrUUid.push(dataList[i].uuid);
                    arrPerson.push(dataList[i].id);
                }
                t.loading2 = true;
                let oData = {
                    comparePeriod:t.contrastPeriod,
                    period:t.$route.params.period,
                    ruleId:t.$route.params.ruleId,
                    uuidLists:arrUUid,
                    personList:arrPerson,
                }
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payPayroll/getExtendsPayItem.do"
                    , type: "POST"
                    , data: JSON.stringify(oData)
                    ,isPassFalse:true
                    , success: function (data) {
                        t.loading2 = false;
                        if (data.result == "true") {
                            t.showContrast = false;
                            t.aCompareBeans = data.beans;
                            t.createTdIco();
                        }
                    }
                });

            },
            /**
             * 删除规则
             */
            deleteRule(){
                let t = this;
                let oData = {
                    customParam: {
                        period: t.$route.params.period,
                        rule_id: t.$route.params.ruleId,
                        uuid:t.detailInfo.periodUuid
                    }
                }
                t.$Modal.confirm({
                    title: '删除提示',
                    content: '<p>是否删除此周期数据？</p>',
                    loading: true,
                    onOk: function(){
                        let _this = this;
                        _this.buttonLoading = true;
                        t.$daydao.$ajax({
                            url: gMain.apiBasePath + "payPeriod/deletePayPeriodData.do"
                            , type: "POST"
                            , data: JSON.stringify(oData)
                            ,isPassFalse:true
                            , success: function (data) {
                                if (data.result == "true") {
                                    t.$Modal.remove();
                                    t.$Message.success("删除成功");
                                    t.$router.push("/accountsIndex");
                                }else if(data.result == "false"){
                                    _this.buttonLoading = false;
                                    t.$Message.error(data.resultDesc);//接口报错提示
                                }
                            }
                        });

                    }
                })
            },
            /**
             * 取数
             */
            showNumberFn(){
                let t = this;
                if(t.isCheckout == true){
                    t.$Message.warning('已结账状态不能进行取数!');
                    return false;
                }
                t.showNumber = true;
                t.current = 0;
                t.loading3 = false;
                t.checkRuleGroup = [];//选择的清空
                t.checkPeriodGroup = [];//选择的清空
                t.checkProGroup = [];
                t.arrItem = [];
                t.arrRuleId = [],
                t.arrProId = [],
                t.sPeriod = ""
                t.closeAll();
            },
            /**
             * 取数下一步
             */
            nextFn(){
                let t = this;
                t.sPeriod = [];
                t.arrRuleId = [];
                t.arrProId = [];
                for(let i = 0;i<t.checkRuleData.length;i++){
                   for(let j = 0;j<t.checkRuleGroup.length;j++){
                       if(t.checkRuleData[i].ruleName == t.checkRuleGroup[j]){
                           t.arrRuleId.push(t.checkRuleData[i].ruleId);
                       }
                   }
                }
                for(let i = 0;i<t.checkProData.length;i++){
                    for(let j = 0;j<t.checkProGroup.length;j++){
                        if(t.checkProData[i].itemName == t.checkProGroup[j]){
                            t.arrProId.push(t.checkProData[i].itemId);
                        }
                    }
                }
                if(t.arrRuleId.length == 0){
                    t.$Message.warning('没有选择规则');
                    return false;
                }
                if(t.checkPeriodGroup.length == 0){
                    t.$Message.warning('没有选择周期');
                    return false;
                }
                if(t.arrProId.length == 0){
                    t.$Message.warning('没有选择源项目');
                    return false;
                }
                if($.inArray(" ", t.arrItem) != -1){
                    t.$Message.warning('目的项目没有全部选择完全');
                    return false;
                }
                for(let i = 0;i<t.checkPeriodGroup.length;i++) {
                    t.sPeriod = t.sPeriod +"'" +  t.checkPeriodGroup[i]+"',"
                }
                console.log(t.arrItem)
                t.sPeriod = t.sPeriod.substring(0,t.sPeriod.length-1);
                t.loading3 = true;
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payPayroll/fetchPersonPayrollData.do"
                    , type: "POST"
                    , data: JSON.stringify({
                        ruleIds:t.arrRuleId.join(","),
                        periods:t.sPeriod,
                        itemIdSources:t.arrProId.join(","),
                        pageBean:{pageNo:t.pageNo,pageSize:t.pageSize}
                    })
                    ,isPassFalse:true
                    , success: function (data) {
                        if (data.result == "true") {
                            t.current = 1;
                            t.loading3 = false;
                            t.iNum = parseInt(data.pb.pageDataCount);
                            t.payPersonBeanList = data["payPersonBeanList"];
                            t.newTableHead = (t.tableHead1.concat(t.checkProGroup)).concat(t.tableHead2);
                        }else if(data.result == "false"){
                            t.loading3 = false;
                            t.$Message.error(data.resultDesc);
                        }
                    }
                });

            },
            /**
             * 取数上一步
             */
            preFn(){
                let t = this;
                t.current = 0;
            },
            /**
             * 取数完成
             */
            saveNumber(){
                let t = this;
                let obj = {}
                for(let i =0;i<t.arrProId.length;i++){
                    obj[t.arrProId[i]] = t.arrItem[i];
                }
                let oData = {
                    period:t.$route.params.period,
                    ruleId:t.$route.params.ruleId,
                    periods:t.sPeriod,
                    ruleIds:t.arrRuleId.join(","),
                    itemIdSources:t.arrProId.join(","),
                    itemMap:obj
                }
                t.loading3 = true;
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payPayroll/fillFetchPersonPayrollData.do"
                    , type: "POST"
                    , data: JSON.stringify(oData)
                    ,isPassFalse:true
                    , success: function (data) {
                        if (data.result == "true") {
                            t.loading3 = false;
                            t.showNumber = false;
                            t.$Message.success("取数完成");
                            t.$refs.tableDataList.getTableData();
                        }else if(data.result == "false"){
                            t.loading3 = false;
                            t.$Message.error(data.resultDesc);
                        }
                    }
                });

            },
            /**
             * 取数下拉框
             * @param status 类型
             */
            numSelect(status){
                let t = this;
                switch (status){
                    case "rule":
                        t.ruleShow = !t.ruleShow;
                        if(t.ruleShow){
                            t.periodShow = false;
                            t.proShow = false;
                        }
                        if(t.checkRuleData.length == 0){
                            t.$daydao.$ajax({
                                url: gMain.apiBasePath + "payPeriod/getPayRuleList.do"
                                , type: "POST"
                                , data: JSON.stringify({})
                                , success: function (data) {
                                    if (data.result == "true") {
                                        t.checkRuleData = data["payRuleBeanList"];
                                    }
                                }
                            });
                        }
                        break;
                    case "period":
                        t.periodShow = !t.periodShow;
                        if(t.periodShow){
                            t.ruleShow = false;
                            t.proShow = false;
                        }
                        if(t.isRequestPeriod == false){
                            t.$daydao.$ajax({
                                url: gMain.apiBasePath + "payPeriod/getPeriodList.do"
                                , type: "POST"
                                , data: JSON.stringify({ruleIds:t.$route.params.ruleId,yearStr:""})
                                , success: function (data) {
                                    if (data.result == "true") {
                                        t.checkPeriodData = data["periodList"];
                                        t.isRequestPeriod = true;
                                    }
                                }
                            });
                        }
                        if(t.yearData.length == 0){
                            t.$daydao.$ajax({
                                url: gMain.apiBasePath + "payPeriod/getPeriodYearList.do"
                                , type: "POST"
                                , data: JSON.stringify({ruleIds:t.$route.params.ruleId})
                                , success: function (data) {
                                    if (data.result == "true") {
                                        t.yearData = data["yearList"];
                                    }
                                }
                            });
                        }
                        break;
                    case "pro":
                        t.proShow = !t.proShow;
                        if(t.proShow){
                            t.periodShow = false;
                            t.ruleShow = false;
                        }
                        if(t.checkProData.length == 0){
                            t.$daydao.$ajax({
                                url: gMain.apiBasePath + "payItemBase/selectPayItemNames.do"
                                , type: "POST"
                                , data: JSON.stringify({ruleIds:t.$route.params.ruleId})
                                , success: function (data) {
                                    if (data.result == "true") {
                                        t.checkProData = data["payItemBeanList"];

                                    }
                                }
                            });
                        }
                        break;
                    default:
                }
            },
            /**
             * 关闭取数选中
             */
            closeCheckNum(index,status){
                let t = this;
                switch (status){
                    case "rule":
                        t.checkRuleGroup.splice(index,1);
                        break;
                    case "period":
                        t.checkPeriodGroup.splice(index,1);
                        break;
                    case "pro":
                        t.checkProGroup.splice(index,1);
                        t.arrItem.splice(index,1);
                        break;
                    default:
                }
            },
            /**
             * 点击右侧关闭
             */
            closeAll(){
                let t = this;
                t.proShow = false;
                t.periodShow = false;
                t.ruleShow = false;
            },
            /**
             * 周期筛选
             * @param date 返回的年份
             */
            changeSearchDate(date){
                let t = this;
                t.searchYear = date;
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "payPeriod/getPeriodList.do"
                    , type: "POST"
                    , data: JSON.stringify({ruleIds:t.$route.params.ruleId,yearStr:t.searchYear})
                    , success: function (data) {
                        if (data.result == "true") {
                            t.checkPeriodData = data["periodList"];
                        }
                    }
                });
            },
            /**
             * 翻页
             * @param num
             */
            changePage:function (num) {
                var t = this;
                t.pageNo = num;
                t.nextFn();
            },
            changePage2:function (num) {
                var t = this;
                t.pageSize = num;
                t.nextFn();
            }
        },
        watch: {
            percent(val,oldVal){
                let t = this;
                if(val == 100){
                    t.color = "#5cb85c";
                }else{
                    t.color = "#2DB7F5";
                }
            },
            showPerson(val,oldVal){
                let t = this;
                if(val == true){
                    t.isRequestPerson = true;
                }else{
                    t.isRequestPerson = false;
                }
            },
            checkProGroup(val,oldVal){
                let t = this;
                if(val.length>oldVal.length) {
                    t.arrItem.push(" ")
                }
            }
        }
    }
</script>

<style lang="scss" rel="stylesheet/scss">

    $prefixCls : pay-accounts-detail;//样式前缀名
    .#{$prefixCls}{
        width: 100%;
        min-width: 1200px;
        .page_table_data_list-page-group-btns{
            top:6px !important;
        }
        .page_table{
            position: relative !important;
        }
        .#{$prefixCls}-content{
            padding:0 80px;
        }
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
        & > .detail_title{
            height: 46px;
            line-height: 46px;
            text-align: center;
            background: #F5F7F9;
            p{
                display: inline-block;
                height: 46px;
                overflow: hidden;
                &.account_tip{

                }
                &.rule_name{
                    margin-right: 20px;
                    font-weight: bold;
                    color: #657180;
                    font-size: 16px;
                }
                &.rule_time{
                    color: #657180;
                    font-size: 16px;
                    font-weight: bold;
                }
                &.rule_delete{
                    cursor: pointer;
                    font-size: 20px;
                    margin-left: 30px;
                }
            }
        }
            .second_title{
                margin:20px 80px;
                font-size:18px;
                height:80px;
                border: 1px solid #E3E8EE;
                border-radius: 2px;
                position: relative;
                & > p{
                    float: left;
                    width: 20%;
                    height: 80px;
                    & > span{
                        font-size:22px;
                        color:#657180;
                        margin-left: 15px;
                    }
                }
                    .sum{
                        font-size:18px;
                        color:#657180;
                        line-height: 80px;
                        text-indent: 45px;
                        position: relative;
                        &::after{
                            content:"";
                            position: absolute;
                            background: #E3E8EE;
                            width: 1px;
                            height: 50px;
                            left: 128px;
                            top:15px;
                        }
                    }
                    .person,.grosspay,.factpay{
                        line-height: 80px;
                        font-size: 14px;
                    }
                    .exportlist{
                        position: absolute;
                        top:22px;
                        right: 45px;
                    }
            }
            .close_box{
                position: absolute;
                top:15px;
                right:40px;
                cursor: pointer;
            }
        /*.page-btn-group{
            .page-btn-more:first-child{
              background: #ed6c2b;
                color: #FFF;
                &::after{
                    border-top: 5px solid #FFF;
                }
                .page-btn-list li{
                    color: #657180;
                }
            }
        }*/
        .item-menu{overflow: hidden;}
        .item-menu .item-menu-wrap{line-height: 28px; text-align: left;height: 28px;color: #657180;font-size: 14px; padding: 0 15px;cursor: pointer;}
        .item-menu .item-menu-wrap:hover{ background: #f8f8f8;}
        .ivu-tag-yellow { background: #FFB532;}
        .ivu-tag-green { background: #67C443;}
    }
    .pay-show-person { height: 616px;}
    .pay-show-person .title{ width: 115px; margin: 0 auto;}
    .payCompareContent{padding: 0 40px;}
    .payCompare{padding-left: 70px; position: relative; line-height: 34px;}
    .payCompareTitle{position: absolute;left: 0;}
    .payCompare input[type=checkbox]{margin-right:5px;}
    .enterClass{
        width: 190px;
        position: absolute;
        background: #ffffff;
        left: 0;
        top:-89px;
        padding: 0px 10px;
        z-index: 3;
        overflow-y: auto;
        line-height: 35px;
        border-radius: 5px;
        box-shadow: 1px 1px 15px rgba(0, 0, 0, 0.4);
    }
    .enterClass span{
        color: #8B8B8B;
    }
    .enterClass label{
        width: 80px;
        text-align: right;
        display: inline-block;
        margin-right: 20px;
    }
    .enterClass span.compare_red{
        color: #FF3300;
    }
    .enterClass span.compare_green{
        color: #00B700;
    }
    a.pay_compare_link{
        color: #FF6101;
        text-decoration: underline;
    }
    .payComparepTdIco{
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        background: url("../../assets/images/payComparepTdIco.png");
        width: 14px;
        height:13px;
    }
    .comparepTdIco_red{
        background-position:-10px -33px;
    }
    .comparepTdIco_green{
        background-position:-10px -56px;
    }
    .comparepTdIco_gray{
        background-position:-10px -10px;
    }
    #payLevelContent{
        width: 1040px;
        height: 430px;
    }
    .show-number-title { width: 500px;margin: 0 auto;}
    .show-number-body {
        height: 460px;
        width: 100%;
        margin-top: 20px;
        overflow-y: auto;
        .show-number-body-rule{
            display: inline-block;
            padding: 10px 5px;
        }
        .show-number-body-period{
            display: inline-block;
            padding: 10px 5px;
        }
        .show-number-body-pro{
            display: inline-block;
            padding: 10px 5px;
        }
        .show-number-body-item {
            display: inline-block;
            padding: 10px 5px;
            .show-number-body-item-wrap {
                float: left;
                margin-right: 15px;
                margin-bottom: 10px;
            }
        }
        .float-left{
            margin-left: 60px;
            float: left;
            width: 140px;
            position: relative;
            color: #939BA6;
            font-size: 14px;
            .name{
                display: inline-block;
                float: left;
                width: 60px;
                text-align: right;
                height: 33px;
                line-height: 33px;
            }
            button{
                span{
                    color: #2D8CF0;
                }
            }
            .drop-select{
                position:absolute;
                background: #fff;
                box-shadow: 0 0 5px 0 #bbb;
                border-radius: 2px;
                width: 200px;
                top:30px;
                left: 72px;
                box-sizing: border-box;
                z-index: 500;
                max-height: 300px;
                overflow-y: auto;
                overflow-x: hidden;
                text-overflow: ellipsis;
                padding: 10px;
                &.second{
                    top:70px !important;
                }
                .check-li{
                    margin-bottom: 3px;
                }
            }
            .drop-year{
                top:30px !important;
                left: 72px;
                box-shadow: 0 -3px 5px 0 #bbb;
                border-radius: 2px;
                position: absolute;
                box-sizing: border-box;
                background: #fff;
                height: 50px;
                border-bottom: none;
                z-index: 501;
                padding: 10px;
            }
        }
        .float-right{
            float: left;
            width: calc(100% - 200px);
        }
    }
    .show-number-table {
        padding: 20px 10px 10px;
        .show-number-table-title {
            width: 100%;
            overflow: hidden;
        }
        .show-number-table-content{
            overflow: auto;
            position: relative;
            max-height: 450px;
        }
        .show-number-table-page{
            text-align: center;
            margin-top: 10px;
        }
        th{
            padding: 9px 5px;
            font-weight: 600;
            color: #657180;
            background: #f5f7f9;
            text-align: center;
            white-space: nowrap;
        }
        td{
            padding: 9px 5px;
            text-align: center;
            white-space: normal;
            word-break: break-all;
            text-overflow: ellipsis;
            &.border-left{
                border-left: 1px solid #f1f8ff;
            }
            &.border-center{
                border-left: 1px solid #f1f8ff;
                border-right: 1px solid #f1f8ff;
            }
            &.no-border{
                border-left: none;
                border-right: none;
            }
            &.border-right{
                border-right: 1px solid #f1f8ff;
            }
            &.text-left{
                text-align: left;
            }
            &.text-right{
                text-align: right;
            }
        }
        .no-content{
            background: #f1f8ff;
        }
    }
</style>

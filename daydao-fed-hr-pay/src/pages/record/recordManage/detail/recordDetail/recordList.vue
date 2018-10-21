<template>
    <div id="record_detail_pay_rule">
        <div class="rule_list" v-for="(item,index) in ruleList" :key="index" >
            <div class="rule_header" v-if="item.type !== 'add'">
                <div class="open_icon" @click="showRule(index)">
                    <!-- <Icon type="chevron-right"></Icon> -->
                    <i class="iconfont_daydao_common" v-if="!item.is_open">&#xe6aa;</i> 
                    <i class="iconfont_daydao_common" v-if="item.is_open">&#xe6a9;</i> 
                    <p class="rule_name">{{item.rule_name}}</p>                         
                </div>
                <div class="delete_icon"  @click="deleteRule(index)">
                    <i class="iconfont_daydao_common">&#xe6ae;</i>
                </div>
            </div>

            <div class="rule_body" v-if="item.is_open">
                <div class="base_info record_history" 
                         @mouseover="item.is_showicon = true" 
                         @mouseout="item.is_showicon = false">
                    <div class="baseinfo_header header" 
                         v-if="isShowAddbtn">
                        <p class="title"><span></span>基本信息</p>
                        <div class="operate" 
                             v-show="item.is_showicon && item.type === 'view'" 
                             @click="(item.type = 'edit') && (item.is_showicon = false)">
                            <i class="iconfont_daydao_common">&#xe69c;</i>
                        </div>
                    </div>
                    <div class="baseinfo_body" :class="{'baseinfo_body_border': item.type !== 'view'}">
                        <edit-rule :ruleFormData="ruleFormData" 
                                   :ruleItemData="item" 
                                   :itemIndex="index" 
                                   :bankSelectList="bankSelectList" 
                                   :ruleSelectList="ruleSelectList" 
                                   @addSuccess="addSuccess" 
                                   @addCancel="addCancel"></edit-rule> 
                    </div>
                </div>

                <div class="count_record record_history" v-if="isShowAddbtn">
                    <div class="history_header header">
                        <p class="title"><span></span>计薪历史</p>
                    </div>
                    <table-data-list class="hr_pay_table_list" ref="payHistory" :infoSetId="infoSetId" :queryData="queryData" :iPageSize=10 :tableHeight=443 >
                        <div slot="page-top">
                        </div>
                    </table-data-list>

                </div>
            </div>

        </div>

        <!-- <p class="add_pay_rule" @click="addPayRule" v-if="ruleList[ruleList.length-1].type !== 'add'">新增薪酬规则</p> -->
        <p class="add_pay_rule" @click="addPayRule" v-if="isShowAddbtn">新增薪酬规则</p>

        <delete-modal :deleteInfo="deleteInfo"></delete-modal>
    </div>
</template>

<script type="text/babel">
const infoSetId = "pay_person_rules";
import myLoading from "src/components/loading/myLoading.vue";
import tableDataList from "components/common/tableDataList/tableDataList";
import editRule from "./recordList/editRule.vue";
import deleteModal from './children/delete/index'


export default {
    data() {
        return {
            infoSetId: infoSetId,
            ruleList: [], //全部薪酬规则数组
            ruleFormData: [], //规则基本信息表格元数据
            queryData: {
                pageBean: {
                    pageNo: "1",
                    pageSize: 10
                },
                editCondition: {
                    key: "person_id",
                    value: this.$route.query.id
                },
                customParam: {
                    rule_id: ''
                }
            },
            bankSelectList: [],
            ruleSelectList: [],
            isShowAddbtn: true,
            deleteInfo: {
                state: false,
                title: '删除',
                index: 0,
                data: {}
            },
            caseCode: 'hr_pay_org_rule'           //与后端约定好用keyValueBean请求薪酬规则下拉框时将hr_pay_org_rule赋值上去请求
        };
    },
    components: {
        myLoading,
        tableDataList,
        editRule,
        deleteModal
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            const self = this;
            const postData = {};
            postData.editCondition = {
                key: "person_id",
                value: self.$route.query.id
            };
            postData.infoSetId = self.infoSetId;
            // pay_person_rules
            self.$daydao.$ajax({
                url:gMain.apiBasePath + `route/${self.infoSetId}/getEditDataAndColumn.do`,
                data: JSON.stringify(postData),
                success: function(data) {
                    if (data.result === "true") {
                        const allDataList = data.beans[0].data;
                        //新增保存成功后需要将最后一条也就是新增的那条相关数据改一下
                        //初始化列表所需数据
                        self.ruleList = [];
                        allDataList.forEach(function(item, index){
                            self.ruleList.push({
                                rule_id: item.rule_id,        //规则id
                                person_rule_id: item.person_rule_id,
                                rule_name: item.rule_name,    //规则名称
                                uuid: item.uuid,              //规则uuid
                                is_open: false,               //是否展开
                                is_add: false,                //是否新增
                                is_showicon: false,            //是否显示滑过出现的编辑icon
                                type: 'view',
                                data: {},                      //规则下详细数据
                            })
                        })
                            
                        //初始化表单元数据
                        self.ruleFormData = [];
                        data.beans[0].columnEdit.forEach(function(item, index){
                            self.ruleFormData.push({
                                cellType: item.cellType,              //控件类型
                                isEdit: item.isEdit,           
                                isEditShow: item.isEditShow,           //是否显示
                                isMust: item.isMust,                   //必填
                                keyValueBean: item.keyValueBean,       //请求参数
                                name: item.name,                       //label名称
                                title: item.title,                     //label显示名称
                                uuid: item.uuid,
                            })
                        })
                        //初始化下拉框
                        self.ruleinfoFormDataFormat();
                    }
                }
            });

        },
        //初始化表单
        ruleinfoFormDataFormat() {
            const self = this;
            self.ruleFormData.map(item => {
                if (item.cellType == 'treeSelect') {
                    new Promise(function(resolve, reject) {
                        //获取下拉框数据
                        self.getKeyValue(item, resolve, item.name);
                    }).then(function(datas) {
                        if(item.name === 'bank' && datas.beans){
                            self.bankSelectList = datas.beans;
                        }else if(item.name === 'rule_id' && datas.beans){
                            self.ruleSelectList = datas.beans;
                        }
                    });
                }
            })
        },
        getKeyValue(item, resolve,name) {
            var self = this;
            let postUrl = 'route/getKeyValueData.do';    
            if(name === 'rule_id'){
                item.keyValueBean.caseCode = self.caseCode;
            } 
            /* if(name === "bank"){
                postUrl = 'route/getKeyValueData.do'
            }else if(name === 'rule_id'){
                item.keyValueBean.caseCode = self.caseCode;
                postUrl = 'payOrgRule/getOrgRules.do'
            } */
            self.$daydao.$ajax({
                url: gMain.apiBasePath + postUrl,
                data: JSON.stringify(item.keyValueBean),
                success: function(data) {
                    resolve(data);
                }
            });
        },
        // 展开某个规则查看详情
        showRule(i) {
            const self = this;
            self.isShowAddbtn = true;
            self.queryData.customParam.rule_id = self.ruleList[i].person_rule_id;
            self.ruleList.forEach(function(item,index){
                if(index === i){
                    if(self.ruleList[i].is_open) {
                        self.ruleList[i].is_open = false;
                        self.ruleList[i].type = 'view';                
                    }else {
                        self.ruleList[i].is_open = true;
                        const detailInfoSetId = 'pay_person_base_info';
                        const postData = {
                            infoSetId: detailInfoSetId,
                            customParam: {
                                rule_id: self.ruleList[i].person_rule_id
                            },
                            editCondition: {
                                key: 'person_id',
                                value: self.$route.query.id
                            }
                        };
                         self.$daydao.$ajax({
                            url:gMain.apiBasePath + `route/${detailInfoSetId}/getEditDataAndColumn.do`,
                            data: JSON.stringify(postData),
                            success: function(res) {
                                if(res.result === 'true'){
                                    // debugger
                                    self.ruleList[i].data = res.beans[0].data[0];
                                }
                            }
                        })
                    }
                }else{
                    item.is_open = false;
                }
            })
            
        },
        // 删除档案规则记录
        deleteRule(i) {
            const self = this;
            self.deleteInfo.state = true;
            self.deleteInfo.data = self.ruleList[i];
            self.deleteInfo.index = i;
        },
        // 新增薪酬规则
        addPayRule() {
            const self = this;
            // 新增将全部规则详情都收起、隐藏新增按钮、更改列表组件传参的ruleId
            self.ruleList.forEach(function(item,index){
                item.is_open = false;
            })
            self.queryData.customParam.rule_id = self.ruleList[self.ruleList.length-1] && self.ruleList[self.ruleList && (self.ruleList.length-1)].person_rule_id;            
            self.isShowAddbtn = false;
            self.ruleList.push({
                rule_id: '',           //规则id
                person_rule_id: '',
                rule_name: '',         //规则名称
                uuid: '',              //规则uuid
                is_open: true,         //是否展开
                is_add: true,          //是否新增
                is_showicon: false,    //是否显示滑过出现的编辑icon
                type: 'add',
                data: {},
            })
        },
        // 新增成功后返回父组件的操作
        addSuccess(data) {
            //组件返回新增成功则显示新增按钮
            const self = this;
            if(data.state){
                self.isShowAddbtn = true;
                self.ruleList[self.ruleList.length-1].type = 'view';
                self.ruleList[self.ruleList.length-1].is_add = false;
                self.ruleList[self.ruleList.length-1].uuid = data.data.uuid;
                self.ruleList[self.ruleList.length-1].person_rule_id = data.data.uuid;                             
                self.ruleSelectList.find(function(item){
                    if(item.id === data.data.formModel.rule_id){
                        self.ruleList[self.ruleList.length-1].rule_name = item.name;
                    }
                })
                self.ruleList[self.ruleList.length-1].data = data.data.formModel;
            }
        },
        // 新增取消
        addCancel(data){
            const self = this;
            if(data){
                self.isShowAddbtn = true;
                // 删除addPayRule()中添加的空对象
                self.ruleList.splice(self.ruleList.length-1,1)              
            }
        }
    },
    watch:{
        /*'ruleList': function(newValue,oldValue){
            const self =this;
            if(self.ruleList[self.ruleList.length-1].type === 'add'){
                self.isShowAddbtn = false;
            }else{
                self.isShowAddbtn = true;
            }
        }*/
    }
};
</script>

<style lang="scss">
#record_detail_pay_rule {
    font-size: 16px;
    width:1000px;
    margin:0 auto;
    margin-top: 50px;
    & > .rule_list {
            margin-bottom: 20px;
            & > .rule_header {
                display: flex;
                position: relative;
                width: 100%;
                margin: 0 auto;
                background: #F5F7F9;
                height:46px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding:0 20px;
                font-size: 18px;
                color: #657180;
                & > .open_icon {
                        display: flex;
                        font-size: 18px;
                        cursor: pointer;
                        & > .rule_name{
                                margin-left: 14px;
                            }
                            i{
                                color: #848F9D;
                                font-size: 18px;
                                cursor: pointer;
                                &:hover{
                                    color: #657180;
                                }
                            }
                    }
                    .delete_icon{
                        display: none;
                        & > i{
                                color: #848F9D;
                                font-size: 18px;
                                cursor: pointer;
                                &:hover{
                                    color: #657180;
                                }
                            }
                        
                    }
                &:hover{
                    background: #EEF0F3;
                    & > .delete_icon{
                            display: block;
                        }
                }
            }
            .rule_body {
                width: 100%;
                margin: 30px auto 40px;
                & > .record_history {
                    & > .header {
                            display: flex;
                            justify-content: space-between;
                            height: 26px;   
                            padding: 0 38px;
                            & > .title{
                                    font-size: 16px;
                                    color: #657180;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    & > span{
                                        display: inline-block;
                                        width: 5px;
                                        height: 5px;
                                        border-radius: 50%;
                                        background: #657180;
                                        margin-right: 5px;
                                    }
                                }
                        }
                        .baseinfo_header{
                            // margin-bottom: 30px;
                            & > .operate {
                                    i{
                                        font-size: 16px;
                                        color: #848F9D;
                                        cursor: pointer;
                                        &:hover{
                                            color: #657180;
                                        }
                                    }

                                }
                        }
                        .history_header{
                            margin-bottom: 10px;
                        }
                        .baseinfo_body_border{
                            border: 1px solid #D7DDE4;
                            margin: 30px 0;
                        }
                        
                }
            }
        }
        .add_pay_rule {
            width: 100%;
            margin: 10px auto;
            height: 40px;
            display: flex;
            font-size: 14px;
            color: #657180;
            justify-content: center;
            align-items: center;
            border: 1px solid #CBD3DE;
            border-radius: 2px;
            cursor: pointer;
        }
}
</style>

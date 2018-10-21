<style lang="scss" rel="stylesheet/scss">
    $prefixCls : pay-make-manage;//样式前缀名
    .#{$prefixCls}-slide{
        height: calc(100% - 110px);
        overflow-y: auto;
        box-sizing: border-box;
        .#{$prefixCls}-slide-form{
            padding:28px 175px 0;
        }
        .#{$prefixCls}-slide-btn {
            width: 100%;
            position: relative;
            .btn1 {
                position: absolute;
                left: 30px;
            }
            .btn2 {
                position: absolute;
                right: 105px;
            }
            .btn3 {
                position: absolute;
                right: 30px;
            }
        }
    }


</style>

<template>
    <!--右滑弹窗新增或修改-->
    <page-slide :pageTitle="title" v-model="isShow" ref="proSlide" >
        <div :class= "prefixCls+'-slide'">
            <div :class= "prefixCls+'-slide-form'">
                <Form ref="proManange" :model="proManangeForm" :rules="proManangeRule" :label-width="100">
                    <FormItem label="项目名称" prop="proName">
                        <Input v-model="proManangeForm.proName" placeholder="请输入项目名称" :maxlength="maxlength1"></Input>
                    </FormItem>
                    <FormItem label="项目分类" prop="proType">
                        <Select v-model="proManangeForm.proType"  :clearable="clearAble">
                            <Option v-for="item in arrSelectData['ct_750']" :value="item.id" :key="item.id">{{item.name}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="字段类型" prop="fieldType">
                        <Select v-model="proManangeForm.fieldType"  :clearable="clearAble">
                            <Option v-for="item in arrSelectData['ct_091']" :value="item.id" :key="item.id">{{item.name}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="收入/支出" prop="incExp">
                        <Select v-model="proManangeForm.incExp"  :clearable="clearAble">
                            <Option v-for="item in arrSelectData['ct_pay_761']" :value="item.id" :key="item.id">{{item.name}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="是否计税项" prop="isTax">
                        <Select v-model="proManangeForm.isTax"  :clearable="clearAble">
                            <Option v-for="item in arrSelectData['ct_pay_762']" :value="item.id" :key="item.id">{{item.name}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="是否调薪项" prop="isAdjust">
                        <Select v-model="proManangeForm.isAdjust"  :clearable="clearAble">
                            <Option v-for="item in arrSelectData['ct_pay_763']" :value="item.id" :key="item.id">{{item.name}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="是否编辑项" prop="isEdit">
                        <Select v-model="proManangeForm.isEdit"  :clearable="clearAble">
                            <Option v-for="item in arrSelectData['ct_pay_766']" :value="item.id" :key="item.id">{{item.name}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="是否继承项" prop="isInherit">
                        <Select v-model="proManangeForm.isInherit"  :clearable="clearAble">
                            <Option v-for="item in arrSelectData['ct_pay_764']" :value="item.id" :key="item.id">{{item.name}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="小数位数" prop="decDig">
                        <Select v-model="proManangeForm.decDig"  :clearable="clearAble">
                            <Option v-for="item in arrSelectData['ct_pay_765']" :value="item.id" :key="item.id">{{item.name}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="备注" prop="tip">
                        <Input v-model="proManangeForm.tip" type="textarea" :autosize="{minRows: 3,maxRows: 10}" :maxlength="maxlength2"></Input>
                    </FormItem>
                </Form>
            </div>
            <div :class= "prefixCls+'-slide-btn'">
                <Button type="primary"  :loading="loading" class="btn1" @click="saveFn(1)" v-if="status == 'add'">保存并继续新增</Button>
                <Button type="primary" class="btn2"  :loading="loading" @click="saveFn(2)">保存</Button>
                <Button type="ghost" @click="isShow = false"  class="btn3">取消</Button>
            </div>
        </div>
    </page-slide>
</template>


<script type="text/babel">
    const prefixCls = "pay-make-manage";
    import pageSlide from 'commonVueLib/pageSlide'/*右滑编辑公共组件*/

    export default {
        name: 'makeManage'
        ,props:{
            /**
             * 页面信息集的ID
             * */
            showStatus:{
                type:Boolean
                ,default:false
            },
            /**
             * 要编辑的整行信息
             * */
            row:{
                type:Object
                ,default:function () {
                    return {};
                }
            },
            /**
             * 新增或编辑状态
             * */
            status:{
                type:String
                ,default:"add"
            }

        }
        /**
         * 组件
         * */
        ,components:{
            pageSlide,
        }
        ,data:function () {
            let t = this;
            return {
                gMain:gMain,
                infoSetId:"pay_rule_item_manage",
                prefixCls:prefixCls,//前缀
                isShow:t.showStatus,//监控
                title:"",//弹窗标题
                clearAble:true,//是否可以清空规则下拉选中
                maxlength1:30,//项目名称最大长度
                proManangeForm:{
                    proName:"",//项目名称
                    proType:"",//项目分类
                    fieldType:"",//字段类型
                    incExp:"",//收入/支出
                    isTax:"",//是否计税项
                    isAdjust:"",//是否调薪项
                    isInherit:"",//是否继承项
                    decDig:"",//小数位数
                    tip:""//备注
                },
                proManangeRule:{
                    proName: [
                        { required: true, message: '项目名称不能为空', trigger: 'change' }
                    ],
                    proType: [
                        { required: true, message: '项目分类不能为空', trigger: 'change' }
                    ],
                    fieldType: [
                        { required: true, message: '字段类型不能为空', trigger: 'change' }
                    ],
                    incExp: [
                        { required: true, message: '收入/支出不能为空', trigger: 'change' }
                    ],
                    isTax: [
                        { required: true, message: '计税项不能为空', trigger: 'change' }
                    ],
                    isAdjust: [
                        { required: true, message: '调薪项不能为空', trigger: 'change' }
                    ],
                    isEdit: [
                        { required: true, message: '编辑项不能为空', trigger: 'change' }
                    ],
                    isInherit: [
                        { required: true, message: '继承项不能为空', trigger: 'change' }
                    ],
                    decDig: [
                        { required: true, message: '小数位数不能为空', trigger: 'change' }
                    ],
                },
                loading:false,//按钮遮罩
                maxlength2:200,//最大长度
                sUuid:"",//数据uuid
                arrTabData:["ct_750","ct_091","ct_pay_761","ct_pay_762","ct_pay_763","ct_pay_764","ct_pay_765","ct_pay_766"],//码表id集合 ct_750(项目分类)   ct_091(字段类型)  ct_pay_761(收入支出)  ct_pay_762(计税项) ct_pay_763(调薪项) ct_pay_764(继承项) ct_pay_765(小数位数) ct_pay_766(编辑项)
                arrSelectData:{
                    "ct_750":[],
                    "ct_091":[],
                    "ct_pay_761":[],
                    "ct_pay_762":[],
                    "ct_pay_763":[],
                    "ct_pay_764":[],
                    "ct_pay_765":[],
                    "ct_pay_766":[]
                },

            }
        },
        watch:{
            showStatus(val,oldVal){
                let t = this;
                t.isShow = val;
                if(val == true){
                   t.init();
                }
            },
            isShow(val){
                let t = this;
                t.$emit("changeVal",val);//组件内对isShow变更后向外部发送事件通知
            }

        }
        ,created:function () {
            let t = this;

        }
        ,mounted:function () {
            let t = this;
            /**
             * 获取表头及其他配置数据
             * */

        },
        beforeUpdate:function () {
            let t = this;
        }
        ,updated:function () {
            let t = this;
        }
        ,methods: {
            /**
             *新增项目管理
             */
            init() {
                let t = this;
                t.$refs["proManange"].resetFields();
                t.loading = false;
                if(t.status == "edit"){
                     t.title = "修改 "+ t.row["item_name"];
                     t.sUuid = t.row["uuid"]+"";
                    t.proManangeForm = {
                        proName:t.row["item_name"]+""||"",//项目名称
                        proType:t.row["item_type_id"]+""||"",//项目类型
                        fieldType:t.row["field_type_id"]+""||"",//字段类型
                        incExp:t.row["category_id"]+""||"",//收入/支出
                        isTax:t.row["is_tax_id"]+""||"",//是否计税项
                        isAdjust:t.row["is_adjustable_id"]+""||"",//是否调薪项
                        isEdit:t.row["is_edited"]+""||"",//是否编辑项
                        isInherit:t.row["is_extends_id"]+""||"",//是否继承项
                        decDig:t.row["dec_length_id"]+""||"",//小数位数
                        tip:t.row["remark"]||""//备注
                    }
                }else{
                     t.title = "薪酬项目管理";
                     t.sUuid = "";
                     t.proManangeForm = {
                        proName:"",//项目名称
                        proType:"",//项目类型
                        fieldType:"",//字段类型
                        incExp:"",//收入/支出
                        isTax:"",//是否计税项
                        isAdjust:"",//是否调薪项
                        isEdit:"", //是否编辑项
                        isInherit:"",//是否继承项
                        decDig:"",//小数位数
                        tip:""//备注
                     }

                }
                t.requestFn();

            },
            /**
             *获取请求数据
             */
            requestFn(){
                let t = this;
                for(let i = 0;i<t.arrTabData.length;i++){
                    if(t.arrSelectData[t.arrTabData[i]].length==0){
                        var oData = {
                            infoSetId: t.arrTabData[i],
                            isDateFilter: false,
                            keyId: "code_id",
                            valueId: "code_name"
                        }
                        t.$daydao.$ajax({
                            url: gMain.apiBasePath+"route/getKeyValueData.do"
                            ,type:"POST"
                            ,data:JSON.stringify(oData)
                            ,success: function (data) {
                                if (data.result == "true") {
                                    t.arrSelectData[t.arrTabData[i]] = data.beans;
                                }
                            }
                        });
                    }
                }
            },
            /**
             *保存项目管理
             * @param status 1表示保存并继续新增  2保存
             */
            saveFn(status){
                let t = this;
                t.$refs["proManange"].validate((valid) => {
                    if (valid) {
                        t.loading = true;
                        let oData = {
                            infoSetId:t.infoSetId,
                            dataList:[
                                {key:"item_name",value:t.proManangeForm.proName},
                                {key:"item_type",value:t.proManangeForm.proType},
                                {key:"field_type",value:t.proManangeForm.fieldType},
                                {key:"category",value:t.proManangeForm.incExp},
                                {key:"is_tax",value:t.proManangeForm.isTax},
                                {key:"is_adjustable",value:t.proManangeForm.isAdjust},
                                {key:"is_edited",value:t.proManangeForm.isEdit},
                                {key:"is_extends",value:t.proManangeForm.isInherit},
                                {key:"dec_length",value:t.proManangeForm.decDig},
                                {key:"remark",value:t.proManangeForm.tip},
                            ]
                        }

                        let sUrl = gMain.apiBasePath+"route/"+t.infoSetId+"/insert.do";

                        if(t.sUuid !=""){
                            oData.uuid = t.sUuid;
                            sUrl = gMain.apiBasePath+"route/"+t.infoSetId+"/update.do";
                        }
                        t.$daydao.$ajax({
                            url: sUrl
                            ,type:"POST"
                            ,data:JSON.stringify(oData)
                            ,isPassFalse:true
                            ,success: function (data) {
                                if (data.result == "true") {
                                    if(status == 2) {
                                        t.isShow = false;
                                    }else{
                                        t.$refs["proManange"].resetFields();
                                    }
                                    t.loading = false;
                                    if(t.status == "edit") {
                                        t.$Message.success('保存成功!');
                                        if(t.$parent.$refs.tableDataList) {
                                            t.$parent.$refs.tableDataList.getTableData();
                                        }
                                    }else{
                                        t.$Message.success('新增成功!');
                                        t.$parent.init();
                                    }
                                }else if(data.result == "false"){
                                    t.loading = false;
                                    t.$Message.error(data.resultDesc);//接口报错提示
                                }
                            }
                        });
                    }
                })
            },


        }
    }
</script>



<style lang="scss" rel="stylesheet/scss">
    $titltH: 46px;
    $navH: 50px;

    .detail-page{
        padding-top: $titltH + $navH;
    }


    // title部分
    .detail-page-title{
        position: fixed;
        width: calc(100% - 170px);
        margin-top: -($titltH + $navH);
        z-index: 99;
        height: $titltH;
        line-height: $titltH;
        text-align: center;
        font-size: 16px;
        overflow: hidden;
        background: #F5F7F9;
        color: #657180;
    }

    .detail-title-close{
        position: absolute;
        right: 0;
        top: 0;
        width: $titltH;
        height: $titltH;
        line-height: $titltH;
        font-size: 14px;
        text-align: center;
        cursor: pointer;
    }

    .detaile-title-back {
        position: absolute;
        left: 0;
        top: 0;
        cursor: pointer;
        font-size: 14px;

        >i {
            display: inline-block;
            width: 20px;
            line-height: 36px;
        }
    }

    .detail-page-title div[slot="detail-page-title-content"], .detail-page-title>span{
        font-size: 16px;
        font-weight: bold;
    }


    // nav部分
    .detail-page-nav{
        position: fixed;
        margin-top: -$navH;
        width: calc(100% - 170px);
        background: #fff;
        text-align: center;
        z-index: 99;

        li{
            position: relative;
            display: inline-block;
            margin-right: 12px;
            line-height: $navH;

            &:after{
                content: '';
                position: absolute;
                top: calc(50% - 1px);
                width: 12px;
                border-bottom: 1px dotted #ccc;
            }

            &:last-child{
                margin-right: 0;

                &:after{
                    display: none;
                }
            }

            a{
                display: inline-block;
                line-height: 18px;
                padding: 0 3px;
                font-size: 12px;
                color: #657180;
                background-color: #fff;
                transition: 0.3s ease-out;

                &:hover{
                    color: #F18950;
                }
            }

            &.active a{
                color: #F18950;
            }
        }
    }


    // main部分
    .detail-page-main{
        max-width: 1440px;
        margin: 0 auto;
        display: table;
        width: 100%;
        min-width: 820px;
        padding: 0 40px;
        box-sizing: border-box;
        table-layout: fixed;
    }


    // main 左侧部分
    .detail-page-main-left{
        display: table-cell;
        width: 100%;
    }

    .detail-page-main-left-item{
        margin-bottom: 40px;
        min-height: 120px;

        >h4{
            margin-bottom: 30px;
            position: relative;
            display: flex;
            padding-right: 36px;
            /*border-bottom: 1px solid #C1C6CC;*/
            color: #657180;
            box-sizing: border-box;

            em{
                margin-right: 6px;
                display: block;
                line-height: 36px;
                font-size: 14px;
                color: #657180;
            }

            span{
                display: block;
                line-height: 36px;
                padding-right: 5px;
                font-size: 18px;
            }

            i{
                display: none;
                position: absolute;
                right: 0;
                top: 0;
                height: 36px;
                line-height: 36px;
                width: 36px;
                text-align: center;
                color: #848F9D;
                cursor: pointer;
                transition: 0.3s ease-out;

                &:hover{
                    color: #F18950;
                }
            }
        }

        &:hover{
            >h4 i{
                display: block;
            }
        }
    }

    .detail-page-main-left-item-content{
        position: relative;
        margin-bottom: 30px;
        transition: 0.3s linear;
    }

    .detail-page-main-left-list{
        display: flex;
        flex-wrap: wrap;
        padding: 0 50px;
        margin: 30px 0 10px;

        >li{
            display: flex;
            width: 50%;
            line-height: 20px;
            padding-bottom: 20px;
            align-items: top;

            >label{
                width: 120px;
                padding-right: 20px;
                color: #A0A7B1;
                text-align: right;
                font-size: 14px;
            }

            >dl{
                flex: 1;
                font-size: 14px;
                color:  #657180;
                overflow: hidden;

                >span{
                    display: block;
                    width: (2 / 3) * 100%;
                    box-sizing: border-box;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

            }
        }
    }

    .detail-page-main-left-item-more{
        ul.detail-page-main-left-list{
            margin: 30px 0;
            padding: 20px 50px 0;
            //border: 1px solid transparent;
            background: #FCFCFC;
            box-sizing: border-box;
        }

        .detail-page-main-left-item-content{

            &:hover{

                .detail-page-main-left-item-content-editbtn{

                    >i{
                        display: inline-block;
                    }
                }

                .detail-page-main-left-list{
                    background: #FCFCFC;
                    //border: 1px solid #D7DDE4;
                    border-radius: 2px;
                }
            }
        }

        .detail-page-main-left-item-content-edit{
            .detail-page-main-left-list{
                background: #FCFCFC;
                //border: 1px solid #D7DDE4;
                border-radius: 2px;
            }
        }
    }

    .detail-page-main-left-item-content-editbtn{
        position: absolute;
        right: 10px;
        top: 20px;

        >i{
            display: none;
            height: 20px;
            line-height: 20px;
            margin-right: 5px;
            text-align: center;
            color: #848F9D;
            cursor: pointer;
            transition: 0.3s ease-out;

            &:hover{
                color: #F18950;
            }
        }
    }

    .detail-page-main-left-item-add{
        height: 40px;
        border-radius: 2px;
        font-size: 14px;
        color: #657180;
    }


    // 编辑状态下的样式
    .detail-edit-box{
        margin: 30px 0;
        padding: 20px 50px;
        box-sizing: border-box;

        .ivu-form{
            display: flex;
            flex-wrap: wrap;
        }

        .ivu-form-item{
            display: flex;
            width: 50%;
        }

        .detail-edit-box-btns{
            width: 100%;
            text-align: right;

            .ivu-btn{
                display: inline-block;
                margin-left: 8px;
            }
        }

        .ivu-form-item-label{
            width: 120px;
            font-size: 14px;
            color: #A0A7B1;
        }

        .ivu-form-item-content{
            flex: 1;

            >div{
                width: (2 / 3) * 100% !important;
            }

            .daydao_drop_select_input, .daydao_drop_select_tree{
                width: 100% !important;
            }
        }

        .ivu-tooltip-rel, .ivu-tooltip{
            width: 100%;
        }
    }

    .detail-add-box{
        position: relative;
        margin: 30px 0 80px 0;
        padding: 20px 0 0 0;
        background: #FCFCFC;

        .detail-edit-box-btns{
            position: absolute;
            left: 0;
            bottom: -70px;
        }
    }

    .detail-block-box {
        position: relative;

        &:hover {

            .detail-page-main-left-item-content-editbtn>i {
                display: inline-block;
            }
        }
    }

    .detail-add-box {
        position: relative;
        margin: 30px 0 80px;
        padding: 20px 50px 0;
        background: #fcfcfc;
    }


    // main 右侧部分
    .detail-page-main-right{
        display: table-cell;
        width: 360px;
        padding-left: 40px;
    }


    // 弹框
    .detail-list-modeal{
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;

        .ivu-modal-footer{
            padding: 24px 18px;
            border-top: none;
        }

        .ivu-modal{
            top: 0;
        }
    }



    .daydao_full_page {
        #daydao_content_app_content{
            margin-left:0 !important;
        }
        #daydao_header_app {
            display : none !important;
        }
    }
</style>

<template>
    <div class="detail-page">
        <!-- title  -->
        <h3 class="detail-page-title">
            <slot name="detail-page-title-content">
                <span>员工详情</span>
            </slot>
            <template v-if="print">
                <slot name="detail-page-title-left" v-if="!fullPageFlag">
                    <div class="detaile-title-back" @click="goToBack"><Icon type="chevron-left"></Icon>返回</div>
                </slot>

                <slot name="detail-page-title-right" v-if="fullPageFlag">
                    <div class="detail-title-close" @click="goToBack"><Icon type="close-round"></Icon></div>
                </slot>
            </template>
        </h3>

        <!-- nav -->
        <slot name="detail-page-nav">
            <nav class="detail-page-nav" v-if="print">
                <ul>
                    <li v-for="(item, index) in suspendNavData" @click="navEventFn(item, index)" :key="index" :class="item.action ? 'active' : ''">
                        <a>{{item.value}}</a>
                    </li>
                </ul>
            </nav>
        </slot>

        <!-- header -->
        <slot name="detail-page-header">
            <p>header</p>
        </slot>

        <!-- main -->
        <div class="detail-page-main">

            <!-- main 左侧部分 -->
            <slot name="detail-page-main-left">
                <div class="detail-page-main-left">
                    <div v-for="(templateItem, tabIndex) in templateDataArr" :key="tabIndex">
                        <!--
                            specialTabType:
                            0：具备新增、修改、删除
                            1：附件列表
                            5：具备修改
                            36:不可编辑修改，只用于数据展示
                        -->

                        <!-- 编辑 -->
                        <template  v-for="(sectionItem, index) in templateItem">
                            <edit-list
                                v-show="currentTabInfo.index === tabIndex"
                                :currentTabInfo="currentTabInfo"
                                :tabIndex="tabIndex"
                                v-if="sectionItem.specialTabType == '5'"
                                :key="index"
                                :editListData="sectionItem"
                                :getPersonInfo="getPersonInfo"></edit-list>

                            <!-- 新增 -->
                            <add-list
                                v-show="currentTabInfo.index === tabIndex"
                                :currentTabInfo="currentTabInfo"
                                :tabIndex="tabIndex"
                                v-else-if="sectionItem.specialTabType == '0'"
                                :addListData="sectionItem"></add-list>

                            <!-- 列表 -->
                            <attachment-list
                                v-show="currentTabInfo.index === tabIndex"
                                :currentTabInfo="currentTabInfo"
                                :tabIndex="tabIndex"
                                v-else-if="sectionItem.specialTabType == '1'"
                                :attachmentListData="sectionItem"></attachment-list>

                            <!-- 表格 -->
                            <table-list
                                v-show="currentTabInfo.index === tabIndex"
                                :currentTabInfo="currentTabInfo"
                                :tabIndex="tabIndex"
                                v-else-if="sectionItem.specialTabType == '36'"
                                :tableListData="sectionItem"></table-list>

                            <!-- 自定义模版 templateId -->
                            <custom-template
                                v-show="currentTabInfo.index == tabIndex"
                                :currentTabInfo="currentTabInfo"
                                :tabIndex="tabIndex"
                                v-else-if="sectionItem.specialTabType == '14'"
                                :customTemplateData="sectionItem"
                                @refreshHeaderTitle="refreshHeaderTitle">
                            </custom-template>
                        </template>

                    </div>
                </div>
            </slot>

            <!-- main右侧部分 -->
            <slot name="detail-page-main-right">
                <div class="detail-page-main-right" v-if="print">
                    <operate-data ref="operate" @refreshPersonBaseInfo="refreshPersonBaseInfo"></operate-data>
                </div>
            </slot>
        </div>
    </div>
</template>

<script>
    // 引入组件
    import editList from "./editList.vue"; //表格列表
    import addList from "./addList.vue"; //表格列表
    import attachmentList from "./attachmentList.vue"; //表格列表
    import operateData from "./operateData.vue"; //操作记录
    import tableList from "./tableList.vue"; //表格
    import customTemplate from "./customTemplate.vue"; //自定义模版


    export default {
        name: 'detailPage',
        props: {
            pageInfoSetId: {
                type: String,
                default() {
                    return '';
                }
            },
            getPersonInfo: {
                type: Function,
                default() { }
            },
            print:{
                type:Boolean,
                default:true
            },
            fullPageFlag: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            id: [Number, String]
        },
        components: {   //组件
            editList,
            addList,
            attachmentList,
            operateData,
            tableList,
            customTemplate
        },
        data: function() {
            return {
                personInfo: {},
                editState: true,
                suspendNavData: [],     // 悬浮导航数据
                templateDataArr: [],    // 详情数据
                editCondition: {},
                tableData: {},
                // 当前选中的tab信息
                currentTabInfo: {
                    index: 0
                }
            }
        },
        watch: {
            'pageInfoSetId': function(newValue, oldValue) {
                this.getTableColumn();
            },
            "templateDataArr" (newValue, oldValue) {
                var t = this;
                console.log(t.templateDataArr,"123")
            }
        },
        created (){
            if(this.fullPageFlag) {
                // 全屏展示详情
                gMain.components.commonHeader.handleShowLeftMenu(false); // 是否显示左侧菜单

                $('#daydao_main_app').addClass('daydao_full_page');
            }
            else{
                // 非全屏展示详情
                gMain.components.commonHeader.handleShowLeftMenu(true); // 是否显示左侧菜单
            }
        },
        mounted: function() {
            this.getTableColumn();
            //this.scrollChangeNav();
            this.initScorll();
        },
        beforeDestroy : function(){
            if(this.fullPageFlag){
                // 全屏
                gMain.components.commonHeader.handleShowLeftMenu(true);
                $('#daydao_main_app').removeClass('daydao_full_page');
            }
        },
        methods: {
            /**
             * 返回
             */
            goToBack (){

                if (this.pageInfoSetId === 'person_list' || this.pageInfoSetId === 'person_out_list'||
                    this.pageInfoSetId==='org_list' ||this.pageInfoSetId==='pos_list' || this.pageInfoSetId==='job_list') {
                    // this.$router.push({ path: "/person_list", query: { keepAlive: this.keepAliveFlag} });
                    this.$router.push({path:'/'+this.pageInfoSetId , query: { keepAlive: 'false'}}); //this.keepAliveFlag
                    return;
                }
                this.$router.back();
            },
            /**
             * 自定义事件，如果操作记录“撤销”成功，则会刷新基本信息
             */
            refreshPersonBaseInfo (){
                this.$emit('refreshPersonBaseInfo', 'refresh');
            },
            /**
             * 获取各个模版的数据
             */
            getDetailTemplateData (){
                var _this = this,
                    templateIds = _this.tableData.editTemplate.templateIds;   // 模版的id集合,用于获取模版数据
                templateIds.forEach(function(element, index) {
                    var templateData = [],  // 存储子模块里的数据集合
                        templateNames = _this.tableData.editTemplate.templateNames[index],    // 子模块的title
                        oSendObj = {    // 请求子模块数据条件
                            infoSetId: element,
                            editCondition: _this.editCondition
                        };
                    _this.templateDataArr.push(templateData);
                    // pay_rule_base_info 特殊化处理
                    if(_this.pageInfoSetId === 'pay_rule_base_info') {
                        if(['pay_rule_base_info', 'pay_rule_item_tab'].indexOf(element) == -1) { //不在其中则不去请求数据
                            if(['pay_rule_formula_tab','pay_rule_payroll_tab'].indexOf(element) != -1) {
                               templateData.push({
                                    templateId: element,     // 模版ID
                                    index: index,
                                    specialTabType: '14'
                                })
                            } else {
                                templateData.push({
                                    templateId: element,     // 模版ID
                                    index: index
                                })
                            }
                            return false;
                        }
                    }
                    _this.$daydao.$ajax({
                        url: gMain.apiBasePath + "route/"+ element +"/getEditDataAndColumn.do",
                        data: JSON.stringify(oSendObj),
                        success: function (data) {
                            try{
                                if(data.result != 'true') return;
                                if(data.beans && data.beans.length > 0){
                                    data.beans.forEach(function(item, sIndex){
                                        try{
                                            if(item.specialTabType == '0'){
                                                // 有新增按钮
                                                templateData.push({
                                                    title: templateNames.split(',')[sIndex],    // 模块标题
                                                    filePrefix: item.filePrefix,                // 文件前缀路径
                                                    specialTabType: item.specialTabType,        // 模版类型
                                                    templateId: element.split(',')[sIndex],     // 模版ID
                                                    data: formatTemplateData(item, true),       // 列表数据
                                                    index: index,                               // 列表当前数据在模版数据中的索引值
                                                    addTemplate: fomatAddTemplateData(item)     // 新增时模版数据
                                                })
                                            }
                                            else if(item.specialTabType == '5'){
                                                // 只有编辑按钮
                                                templateData.push({
                                                    title: templateNames.split(',')[sIndex],    // 模块标题
                                                    filePrefix: item.filePrefix,                // 文件前缀路径
                                                    specialTabType: item.specialTabType,        // 模版类型
                                                    templateId: element.split(',')[sIndex],     // 模版ID
                                                    data: formatTemplateData(item, false),      // 列表数据
                                                    index: index,                               // 列表当前数据在模版数据中的索引值
                                                    isEdit: true                                // 列表编辑状态
                                                })
                                            }
                                            else if(item.specialTabType == '1'){
                                                // 附件列表
                                                templateData.push({
                                                    title: templateNames.split(',')[sIndex],    // 模块标题
                                                    filePrefix: item.filePrefix,                // 文件前缀路径
                                                    specialTabType: item.specialTabType,        // 模版类型
                                                    templateId: element.split(',')[sIndex],     // 模版ID
                                                    data: [],                                   // 列表数据
                                                    uuid: item.uuid,                            // 模块的uuid
                                                    specialTabParam: item.specialTabParam,      // 用于请求附件数据的codeId的值
                                                    columnEdit: item.columnEdit,                // 附件数据
                                                    isEdit: true                                // 列表编辑状态
                                                })
                                            }
                                            else if(item.specialTabType == '36'){
                                                // 表格
                                                templateData.push({
                                                    title: templateNames.split(',')[sIndex],    // 模块标题
                                                    filePrefix: item.filePrefix,                // 文件前缀路径
                                                    specialTabType: item.specialTabType,        // 模版类型
                                                    templateId: element.split(',')[sIndex],     // 模版ID
                                                    data: [],                                   // 列表数据
                                                    uuid: _this.$parent.uuid,                   // 模块的uuid
                                                    columnEdit: item.columnEdit,                // 附件数据
                                                    isEdit: true                                // 列表编辑状态
                                                })
                                            }
                                            else if(item.specialTabType == '14'){
                                                // 自定义模版类型
                                                templateData.push({
                                                    title: templateNames.split(',')[sIndex],    // 模块标题
                                                    filePrefix: item.filePrefix,                // 文件前缀路径
                                                    specialTabType: item.specialTabType,        // 模版类型
                                                    templateId: element.split(',')[sIndex],     // 模版ID
                                                    data: formatTemplateData(item, false),      // 列表数据
                                                    isEdit: true // 列表编辑状态
                                                })
                                            }
                                            else{
                                                console.log('未知的specialTabType类型：'+ item.specialTabType);
                                            }
                                        }
                                        catch (e){
                                            console.log(e.message)
                                        }
                                    })
                                }
                            }
                            catch(e){
                                console.log(e.message)
                            }
                        }
                    })
                }, this);
                /**
                 * 格式化模版里子模块的数据
                 * options  列表数据对象
                 * isEdit   列表是否可以编辑
                 */
                function formatTemplateData(options, isEdit){
                    var result = [],
                        columnEdit = options.columnEdit,
                        data = options.data || [];
                    if(data && data.length>0){
                        data.forEach(function(item){
                            var arr = []
                            columnEdit.forEach(function(columnItme){

                                if(!columnItme.isEditShow) return;

                                if(columnItme.cellType == 'checkbox'){
                                    // 多选框
                                    arr.push({
                                        title: columnItme.title,
                                        name: columnItme.name,
                                        cellType: columnItme.cellType,
                                        keyValueBean: columnItme.keyValueBean,
                                        isMust: columnItme.isMust,
                                        regExpress: columnItme.regExpress,
                                        isEditShow: columnItme.isEditShow,
                                        fieldSize: columnItme.fieldSize,
                                        fieldType: columnItme.fieldType,
                                        isDisabled: false,
                                        value: item[columnItme.name] == '1' ? true : false
                                    })
                                }
                                else if(columnItme.cellType == 'switch'){
                                    // 开关
                                    arr.push({
                                        title: columnItme.title,
                                        name: columnItme.name,
                                        cellType: columnItme.cellType,
                                        keyValueBean: columnItme.keyValueBean,
                                        isMust: columnItme.isMust,
                                        regExpress: columnItme.regExpress,
                                        isEditShow: columnItme.isEditShow,
                                        fieldSize: columnItme.fieldSize,
                                        fieldType: columnItme.fieldType,
                                        isDisabled: false,
                                        value: item[columnItme.name] == '是' ? true : false
                                    })
                                }
                                else{
                                    // 基本信息中的起始日期/结束日期
                                    if(columnItme.name == "begin_month" || columnItme.name == "end_month" || columnItme.name == "end_date" || columnItme.name == "begin_date"){
                                        arr.push({
                                            title: columnItme.title,
                                            name: columnItme.name,
                                            cellType: columnItme.cellType,
                                            keyValueBean: columnItme.keyValueBean,
                                            isMust: columnItme.isMust,
                                            regExpress: columnItme.regExpress,
                                            isEditShow: columnItme.isEditShow,
                                            fieldSize: columnItme.fieldSize,
                                            fieldType: columnItme.fieldType,
                                            isDisabled: false,
                                            value: item[columnItme.name] || '',
                                            valueId:item[columnItme.name+'_id']
                                        })
                                        // 基本信息中的计薪周期
                                    }else if(columnItme.name == "calculate_cycle"){
                                        arr.push({
                                            title: columnItme.title,
                                            name: columnItme.name,
                                            cellType: columnItme.cellType,
                                            keyValueBean: columnItme.keyValueBean,
                                            myDataValue :{
                                                begin_month:'',
                                                begin_date:'',
                                                end_month:'',
                                                end_date:''
                                            },
                                            isMust: columnItme.isMust,
                                            regExpress: columnItme.regExpress,
                                            isEditShow: columnItme.isEditShow,
                                            fieldSize: columnItme.fieldSize,
                                            fieldType: columnItme.fieldType,
                                            isDisabled: false,
                                            value: item[columnItme.name] || ''
                                        })
                                    }else {
                                        // 其它...
                                        arr.push({
                                            title: columnItme.title,
                                            name: columnItme.name,
                                            cellType: columnItme.cellType,
                                            keyValueBean: columnItme.keyValueBean,
                                            isMust: columnItme.isMust,
                                            regExpress: columnItme.regExpress,
                                            isEditShow: columnItme.isEditShow,
                                            fieldSize: columnItme.fieldSize,
                                            fieldType: columnItme.fieldType,
                                            isDisabled: false,
                                            value: item[columnItme.name] || ''
                                        })
                                    }
                                }
                            })
                            arr.forEach((arrItem)=>{
                                // 如果是手机号码，将判断'is_active'字段（1：激活状态；2：未激活状态），用于确定输入框是否可以编辑
                                if(arrItem.name == 'cell_phone'){
                                    if(item['is_active']){
                                        arrItem.disabled = item['is_active'] == '1' ? true : false;
                                    }
                                    else{
                                        arrItem.disabled = false;
                                    }
                                }
                            })

                            if(isEdit){
                                // showMode=10 每列数据都有一个编辑的标识
                                result.push({
                                    isEdit: true,
                                    uuid: item.uuid || '',
                                    data: arr
                                });
                            }
                            else{
                                // showMode=11 整个子模块一个编辑的标识
                                result.push({
                                    uuid: item.uuid || '',
                                    data: arr
                                });
                            }
                        })
                    }
                    else{
                        if(options.specialTabType == '14' || options.specialTabType == '5'){
                            var arr = []
                            columnEdit.forEach(function(columnItme){

                                if(!columnItme.isEditShow) return;

                                if(columnItme.cellType == 'checkbox'){
                                    arr.push({
                                        title: columnItme.title,
                                        name: columnItme.name,
                                        cellType: columnItme.cellType,
                                        keyValueBean: columnItme.keyValueBean,
                                        isMust: columnItme.isMust,
                                        regExpress: columnItme.regExpress,
                                        isEditShow: columnItme.isEditShow,
                                        fieldSize: columnItme.fieldSize,
                                        fieldType: columnItme.fieldType,
                                        isDisabled: false,
                                        value: false
                                    })
                                }
                                if(columnItme.cellType == 'switch'){
                                    arr.push({
                                        title: columnItme.title,
                                        name: columnItme.name,
                                        cellType: columnItme.cellType,
                                        keyValueBean: columnItme.keyValueBean,
                                        isMust: columnItme.isMust,
                                        regExpress: columnItme.regExpress,
                                        isEditShow: columnItme.isEditShow,
                                        fieldSize: columnItme.fieldSize,
                                        fieldType: columnItme.fieldType,
                                        isDisabled: false,
                                        value: false
                                    })
                                }
                                else{
                                    // 基本信息中的起始日期/结束日期
                                    if(columnItme.name == "begin_month" || columnItme.name == "end_month" || columnItme.name == "end_date" || columnItme.name == "begin_date"){
                                        arr.push({
                                            title: columnItme.title,
                                            name: columnItme.name,
                                            cellType: columnItme.cellType,
                                            keyValueBean: columnItme.keyValueBean,
                                            isMust: columnItme.isMust,
                                            regExpress: columnItme.regExpress,
                                            isEditShow: columnItme.isEditShow,
                                            fieldSize: columnItme.fieldSize,
                                            fieldType: columnItme.fieldType,
                                            isDisabled: false,
                                            value: '',
                                            valueId: ''
                                        })
//                                        基本信息中的计薪周期
                                    }else if(columnItme.name == "calculate_cycle"){
                                        arr.push({
                                            title: columnItme.title,
                                            name: columnItme.name,
                                            cellType: columnItme.cellType,
                                            keyValueBean: columnItme.keyValueBean,
                                            myDataValue :{
                                                begin_month:'',
                                                begin_date:'',
                                                end_month:'',
                                                end_date:''
                                            },
                                            isMust: columnItme.isMust,
                                            regExpress: columnItme.regExpress,
                                            isEditShow: columnItme.isEditShow,
                                            fieldSize: columnItme.fieldSize,
                                            fieldType: columnItme.fieldType,
                                            isDisabled: false,
                                            value: ''
                                        })
                                    }else {
                                        // 其它...
                                        arr.push({
                                            title: columnItme.title,
                                            name: columnItme.name,
                                            cellType: columnItme.cellType,
                                            keyValueBean: columnItme.keyValueBean,
                                            isMust: columnItme.isMust,
                                            regExpress: columnItme.regExpress,
                                            isEditShow: columnItme.isEditShow,
                                            fieldSize: columnItme.fieldSize,
                                            fieldType: columnItme.fieldType,
                                            isDisabled: false,
                                            value: ''
                                        })
                                    }
                                }
                            })

                            if(isEdit){
                                // showMode=10 每列数据都有一个编辑的标识
                                result.push({
                                    isEdit: true,
                                    uuid: '',
                                    data: arr
                                });
                            }
                            else{
                                // showMode=11 整个子模块一个编辑的标识
                                result.push({
                                    uuid: '',
                                    data: arr
                                });
                            }
                        }
                    }
                    return result;
                }

                /**
                 * 获取treeselect数据
                 */
                function formatTreeSelectData(items){
                    items.forEach(function(item){
                        if(item.cellType == 'treeSelect' || item.cellType == 'radio' || item.cellType == 'treeMultipleSelect' || item.name == 'pay_org_id'){
                            _this.getKeyValueData({
                                data: item.keyValueBean,
                                success: function(data){
                                    item.treeSelectData = data.beans;
                                }
                            })
                        }
                    })
                }

                /**
                 * 格式化新增时模版
                 */
                function fomatAddTemplateData(options){
                    var result = [],
                        columnEdit = options.columnEdit;

                    if(columnEdit && columnEdit.length > 0){
                        columnEdit.forEach(function(item){
                            if(!item.isEditShow) return;

                            if(item.cellType == 'switch'){
                                result.push({
                                    title: item.title,
                                    name: item.name,
                                    cellType: item.cellType,
                                    keyValueBean: item.keyValueBean,
                                    isMust: item.isMust,
                                    regExpress: item.regExpress,
                                    fieldSize: item.fieldSize,
                                    fieldType: item.fieldType,
                                    value: false
                                })
                            }
                            else{
                                result.push({
                                    title: item.title,
                                    name: item.name,
                                    cellType: item.cellType,
                                    keyValueBean: item.keyValueBean,
                                    isMust: item.isMust,
                                    regExpress: item.regExpress,
                                    fieldSize: item.fieldSize,
                                    fieldType: item.fieldType,
                                    value: ''
                                })
                            }
                        })
                    }
                    return {
                        isEdit: false,
                        data: result
                    }
                }

                /**
                 * 格式化表格数据
                 */
                function formatTableListTemplateData(columnData, listData){
                    console.log('columnData', columnData, 'listData', listData)

                    var result = {};
                    result.updataColumns = [];  // 表头数据
                    result.updataData = []; // 附件数据

                    // 格式化附件表头数据
                    columnData.forEach(function(item){
                        if(!item.isListShow) return true;
                        result.updataColumns.push({
                            title: item.title,
                            key: item.name,
                            render: (h, params) => {
                                let style = {
                                    fontSize: '14px',
                                    color: '#24AC17',
                                    marginRight: '5px'
                                }

                                if(item.name == 'file_real_name'){
                                    return h('div', [
                                        h('Icon', {
                                            style: style,
                                            props: {
                                                type: 'image'
                                            }
                                        }),
                                        h('strong', params.row[item.name])
                                    ]);
                                }
                                else{
                                    return h('div', [
                                        h('strong', params.row[item.name])
                                    ]);
                                }
                            }
                        })
                    });

                    // 格式化附件数据
                    if(listData && listData.length > 0) {
                        listData.forEach(function (item) {
                            var json = {};
                            for (var name in item) {
                                json[name] = item[name]
                            }

                            result.updataData.push(json);
                        });
                    }

                    return result;
                }

                /**
                 * 格式化附件列表数据
                 */
                function formatAttachmenTemplateData(columnData, listData, templateId, type){
                    var result = {},
                        columnData = columnData || [],
                        listData = listData || [];
                    result.updataColumns = [];  // 表头数据
                    result.updataData = []; // 附件数据

                    if(type == '1'){

                        // 格式化附件表头数据
                        result.updataColumns.push({
                            title: '操作',
                            key: 'action',
                            width: 150,
                            align: 'center',
                            render: (h, params) => {
                                let style = {
                                    margin: '0 10px',
                                    width: '16px',
                                    fontSize: '16px',
                                    cursor: 'pointer'
                                }

                                return h('div', [
                                    h('Icon', {
                                        style: style,
                                        props: {
                                            type: 'ios-cloud-download'
                                        },
                                        nativeOn: {
                                            click: () => {
                                                console.log('下载');
                                                var _url = gMain.apiBasePath+'route/'+templateId+'/downfilelog.do?fileName='+params.row.file_url+'&fileRealName='+params.row.file_real_name;
                                                window.location.href = _url;
                                            }
                                        }
                                    }),
                                    h('Icon', {
                                        style: style,
                                        props: {
                                            type: 'trash-a'
                                        },
                                        nativeOn: {
                                            click: () => {
                                                console.log('删除');
                                                var oSendObj = {
                                                    infoSetId: templateId,
                                                    editCondition: {
                                                        key: 'person_id',
                                                        value: params.row.code_id
                                                    },
                                                    uuidLists: []
                                                }

                                                oSendObj.uuidLists.push(params.row.uuid);
                                                deleteFile(oSendObj)
                                            }
                                        }
                                    })
                                ]);
                            }
                        })
                    }
                    columnData.forEach(function(item){
                        if(!item.isListShow) return true;
                        result.updataColumns.push({
                            title: item.title,
                            key: item.name,
                            render: (h, params) => {
                                let style = {
                                    fontSize: '14px',
                                    color: '#24AC17',
                                    marginRight: '5px'
                                }

                                if(item.name == 'file_real_name'){
                                    return h('div', [
                                        h('Icon', {
                                            style: style,
                                            props: {
                                                type: 'image'
                                            }
                                        }),
                                        h('strong', params.row[item.name])
                                    ]);
                                }
                                else{
                                    return h('div', [
                                        h('strong', params.row[item.name])
                                    ]);
                                }
                            }
                        })
                    })

                    // 格式化附件数据
                    listData.forEach(function(item){
                        var json = {};
                        for(var name in item){
                            if(name == 'file_size'){
                                json[name] = bytesToSize(item[name])
                            }
                            else{
                                json[name] = item[name]
                            }
                        }

                        // 附件列表，加上操作
                        if(item.file_real_name){
                            json.type = item.file_real_name.substring(item.file_real_name.lastIndexOf('.'), item.file_real_name.length);
                            json.success = '2';
                        }

                        result.updataData.push(json);
                    })

                    return result;
                }

                /**
                 * 格式化文件大小  1024为单位
                 */
                function bytesToSize(bytes) {
                    if (bytes === 0) return '0 B';

                    var k = 1024,
                        sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                        i = Math.floor(Math.log(bytes) / Math.log(k));

                    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
                    //toPrecision(3) 后面保留一位小数，如1.0GB                                                                                                                  //return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
                }

                function deleteFile(options){
                    _this.$daydao.$ajax({
                        url: gMain.apiBasePath +"route/"+ options.infoSetId +"/del.do",
                        data: JSON.stringify(options),
                        beforeSend:function(){
                            //_formLayer= layer.load(1, {shade: [0.3,'#ffffff']}); //启动loading遮罩
                        },
                        complete:function(){
                            //layer.close(_formLayer); //关闭loading遮罩
                        },
                        success: function(data){
                            //typeof options.success == "function" && options.success(data);
                        }
                    });
                }
            },
            /**
             * 获取表头及其他配置数据
             */
            getTableColumn (){
                var _this = this;

                if(!_this.pageInfoSetId || typeof _this.pageInfoSetId != 'string') return;
                _this.$daydao.$ajax({
                    url: gMain.apiBasePath + "route/"+ _this.pageInfoSetId +"/getTableColumn.do",
                    data:JSON.stringify({
                        infoSetId: _this.pageInfoSetId
                    }),
                    success:function (data) {
                        if(data.result == "true"){
                            _this.editCondition = {
                                key: data.editTemplate.editConditionKey,
                                value: _this.id
                            }

                            _this.tableData = data;

                            _this.tableData.editTemplate.tabNames.forEach(function(item, index){
                                const templateId =  _this.tableData.editTemplate.templateIds[index]
                                if(index == 0){
                                    _this.suspendNavData.push({
                                        index: index,
                                        value: item,
                                        action: true,
                                        templateId: templateId
                                    })
                                }
                                else{
                                    _this.suspendNavData.push({
                                        index: index,
                                        value: item,
                                        action: false,
                                        templateId: templateId
                                    })
                                }
                            })
                            //_this.suspendNavData = _this.tableData.editTemplate.tabNames;

                            _this.getDetailTemplateData();
                        }
                    }
                });
            },
            /**
             * 初始化scorll事件
             * */
            initScorll (){
                var _this = this;

                $(window).off('scroll.detailPage').on('scroll.detailPage', function(){
                    if(this.fullPageFlag) {
                        // 全屏展示详情
                        var h = $('body, html').scrollTop() + $('.detail-page-title').height() + $('.detail-page-nav').height();
                    }
                    else{
                        // 非全屏展示详情
                        var h = $('body, html').scrollTop() + $('.detail-page-title').height() + $('.detail-page-nav').height() + $('#header_crosswise_bar').height();
                    }

                    $('.detail-page-main-left>div').each(function(index, element){
                        if(h >= $(element).offset().top && h <= $(element).offset().top + $(element).height()){
                            // 改变导航当前选择的哪项
                            _this.suspendNavData.forEach(function(i){
                                i.action = false;
                            })
                            _this.suspendNavData[index].action = true;
                        }
                    });
                })

                // 初始化title、nav的宽度
                if(this.fullPageFlag) {
                    // 全屏展示详情

                    $('#daydao_main_app').addClass('daydao_full_page');
                    $('.detail-page-title').css({
                        width: '100%'
                    })
                    $('.detail-page-nav').css({
                        width: '100%'
                    })
                }
                else{
                    // 非全屏展示详情
                    $('.detail-page-title').css({
                        width: 'calc(100% - 170px)'
                    })
                    $('.detail-page-nav').css({
                        width: 'calc(100% - 170px)'
                    })
                }
            },
            /**
             * 导航点击事件
             * @param item
             * @param index
             */
            navEventFn (item, index) {
                const _this = this;
                _this.currentTabInfo = item
                // 改变导航当前选择的哪项
                _this.suspendNavData.forEach(function(i){
                    i.action = false;
                })
                _this.suspendNavData[index].action = true;

                // 运动的高度 = 当前div的offsetTop - 固定的高度
                if(_this.fullPageFlag) {
                    // 全屏展示详情
                    var totalH = $('.detail-page-main-left>div').eq(index).offset().top - $('.detail-page-title').height() - $('.detail-page-nav').height();
                }
                else{
                    // 非全屏展示详情
                    var totalH = $('.detail-page-main-left>div').eq(index).offset().top - $('.detail-page-title').height() - $('.detail-page-nav').height() - $('#header_crosswise_bar').height();
                }
//                $("html,body").animate({scrollTop: totalH}, 400, "swing");
            },
            /**
             * 滚动页面，来判断当前显示的是哪个导航内容
             */
            scrollChangeNav (){
                var _this = this;

                $(window).off('scroll.detailPage').on('scroll.detailPage', function(){
                    //console.log($('body').scrollTop())
                    var h = $('body').scrollTop() + $('.detaile-full-title').height() + $('.detaile-full-nav').height() + $('#header_crosswise_bar').height();
                    console.log('h', h)
                    $('.detaile-full-main-left>div').each(function(index, element){
                        //console.log($(element).offset().top)

                        if(h >= $(element).offset().top && h <= $(element).offset().top + $(element).height()){
                            // 改变导航当前选择的哪项
                            _this.suspendNavData.forEach(function(i){
                                i.action = false;
                            })
                            _this.suspendNavData[index].action = true;
                        }
                    })
                })
            },

            refreshHeaderTitle(orgName){
                this.$emit("refreshHeaderTitle", orgName);
            }
        }
    }
</script>

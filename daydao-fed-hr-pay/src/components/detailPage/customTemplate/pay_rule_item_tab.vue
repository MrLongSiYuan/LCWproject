<style lang="scss" rel="stylesheet/scss">
    .detail-page-main-left-item{
        .detail-page-main-left-item-project-list{
            .pay-project-piece-wrap{
                .pay-project-piece-box{
                    .detail-pay-project-piece{
                        margin-bottom: 10px;
                        min-height: 46px;
                        .detail-pay-project-piece-box{
                            display: block;
                            width: 100%;
                            height: 46px;
                            box-sizing: border-box;
                            padding-left: 50px;
                            position: relative;
                            background-color: #F5F7F9;
                            line-height: 46px;
                            font-size: 16px;
                            color: #657180;
                            i.icon_sort{
                                position: absolute;
                                left: 10px;
                                top:0;
                                cursor: move;
                            }
                            i.arrow_right{
                                position: absolute;
                                left: 26px;
                                top:0;
                                cursor: pointer;
                                transition: 0.5s;
                                transform: rotate(0deg);
                            }
                            i.arrow_right_active{
                                transform: rotate(90deg);
                                @extend i.arrow_right;
                            }
                            button.ivu-btn{
                                float: right;
                            }
                            button.ivu-btn-text{
                                height: 100%;
                                display: none;
                                &:nth-last-child(1){
                                    padding-right: 6px;
                                }
                                &:nth-last-child(2){
                                    padding-left: 6px;
                                }
                                span{
                                    color: #2D8CF0;
                                }
                            }
                            button.active_btn{
                                margin-left: 10px;
                                margin-top: 12px;
                                &:nth-last-child(2){
                                    margin-right: 20px;
                                }
                            }
                            .draging_hover{
                                width: 100%;
                                height: 100%;
                                position: absolute;
                                left: 0;
                                top:0;
                                background: rgba(255,248,197,0.50);
                                display: none;
                            }
                            &:hover{
                                button.ivu-btn-text{
                                    display: block;
                                }
                            }
                        }
                    }
                    .sortable-drag,.sortable-chosen{
                        .draging_hover{
                            display: block;
                        }
                        @extend .detail-pay-project-piece-box;
                    }
                    .children_list_wrap{
                        margin-top: 20px;
                        margin-bottom: 40px;
                        padding:0 50px;
                        .children_list_project{
                            .all_wrap_list{
                                width: 100%;
                                height: 40px;
                                position: relative;
                                i.icon_sort{
                                    position: absolute;
                                    left: 3px;
                                    top: 8px;
                                    display: none;
                                }
                                .btn_wrap{
                                    height: 100%;
                                    position: absolute;
                                    width: 100px;
                                    right: -75px;
                                    top: 0;
                                    display: none;
                                    i.iconfont_daydao_common{
                                        position: absolute;
                                        top:0;
                                        left: 40px;
                                        color: #848F9D;
                                        display: block;
                                        height: 100%;
                                        line-height: 40px;
                                        cursor: pointer;
                                    }
                                    i.edit_btn,i.cancel_btn{
                                        left: 70px;
                                        @extend .iconfont_daydao_common;
                                    }
                                }
                                &:hover{
                                    border: 1px solid #E3E8EE;
                                    .btn_wrap{
                                        display: block;
                                    }
                                }
                                .list_box{
                                    display: block;
                                    height: 100%;
                                    .list_item{
                                        display: inline-block;
                                        height: 100%;
                                        line-height: 40px;
                                        padding:0 14px ;
                                        vertical-align: middle;
                                        position: relative;
                                        &:nth-child(1){
                                            width: 160px;
                                        }
                                        &:nth-child(2){
                                            width: 85px;
                                        }
                                        &:nth-child(3){
                                            width: 71px;
                                        }
                                        &:nth-child(4){
                                            width: 92px;
                                        }
                                        &:nth-child(5){
                                            width: 89px;
                                        }
                                        &:nth-child(6){
                                            width: 92px;
                                        }
                                        &:nth-child(7){
                                            width: 99px;
                                        }
                                       /* &:nth-child(8){
                                            width: 99px;
                                        }*/
                                        &:nth-child(8){
                                            width: 99px;
                                        }
                                        &:nth-child(9){
                                            width: calc(100% - 788px);
                                            overflow: hidden;
                                            white-space: nowrap;
                                            text-overflow: ellipsis;
                                        }
                                        span{
                                            cursor: default;
                                        }
                                        span.item_name{
                                            i{
                                                font-style: normal;
                                                display: inline-block;
                                                width: 36px;
                                                height: 20px;
                                                border: 1px solid #9593EC;
                                                border-radius: 2px;
                                                margin-right: 12px;
                                                line-height: 20px;
                                                font-size: 12px;
                                                color: #9593EC;
                                                text-align: center;
                                            }
                                        }
                                        span.span_can_edit{
                                            position: absolute;
                                            display: block;
                                            width: 100%;
                                            padding: 0 5px;
                                            height: 40px;
                                            box-sizing: border-box;
                                            left: 0;
                                            top: 0;
                                            .ivu-select-item{
                                                padding: 7px 0px;
                                                text-align: center;
                                            }
                                        }
                                    }
                                }
                            }
                            .list_is_can_edit{
                                &:hover{
                                    border: none;
                                }
                                @extend .all_wrap_list;
                            }
                            .header_wrap_list{
                                &:hover{
                                    border: none;
                                }
                                @extend .all_wrap_list;
                                .header_list_box{
                                    background-color: #F5F7F9;
                                    .header_list_item{
                                        &:nth-child(1){
                                            border-left: none;
                                        }
                                    }
                                }
                            }
                        }
                        .children_list_project_sort{
                            .all_wrap_list{
                                i.icon_sort{
                                    display: block;
                                }
                                &:hover{
                                    border: 1px dashed #E3E8EE;
                                    cursor: move;
                                    .btn_wrap{
                                        display: none;
                                    }
                                }
                                .list_box{
                                    .list_item{
                                        &:nth-child(1){
                                            box-sizing: border-box;
                                            padding-left: 23px;
                                        }
                                        span{
                                            cursor: move;
                                        }
                                    }
                                }
                            }
                            .pay-item-sortable-drag,.pay-item-sortable-chosen{
                                background: rgba(255,248,197,0.50);
                            }
                            @extend .children_list_project;
                        }
                    }
                }
            }
        }
    }
</style>
<template>
    <!-- 编辑 -->
    <section class="detail-page-main-left-item" :class="'detaile-full-main-l-item-'+ tabIndex" v-show="templateItem.title">
        <Modal
            v-model="deleteOption.state"
            title="提示"
            @on-ok="deleteChildrenItem"
            width="300">
           <p style="text-align: center">删除后所有相关数据将会消失且不可恢复，您确定要删除吗？</p>
        </Modal>
        <div class="detail-page-main-left-item-project-list">
            <!-- :style="style" -->
            <div  class="pay-project-piece-wrap">
                <ul class="pay-project-piece-box">
                    <!--外层的大项-->
                    <li v-for="(itemOne,indexOne) in childrenTableDatas" :key="indexOne" class="detail-pay-project-piece" :data-type="itemOne.itemType">
                        <div class="detail-pay-project-piece-box">
                            <i class="iconfont_daydao_common arrow_right" :class="itemOne.isSpread ? 'arrow_right_active':''" @click="openOrCloseChildrenList(indexOne)">&#xe6aa;</i>
                            {{itemOne.itemTypeName}}
                            <Button type="text" class="default_btn" v-if="itemOne.dragOptions.disabled" @click="addChildrenItem(indexOne)">添加</Button>
                            <Button type="text" class="default_btn" v-if="itemOne.dragOptions.disabled" @click="canSortChildrenList(indexOne)">排序</Button>
                            <Button class="active_btn" size="small" v-if="!itemOne.dragOptions.disabled" @click="closeSortChildrenList(indexOne)">取消</Button>
                            <Button type="primary" class="active_btn" size="small" v-if="!itemOne.dragOptions.disabled" @click="sortChildrenItem(indexOne)">保存</Button>
                        </div>
                        <!--隐藏的下拉项-->
                        <div class="children_list_wrap" v-show="itemOne.isSpread">
                            <ul class="children_list_project" :class="!itemOne.dragOptions.disabled?'children_list_project_sort':''">
                                <!--大项中的小项列表的表头-->
                                <li class="all_wrap_list header_wrap_list" v-show="itemOne.ruleTypeItems.length != 0">
                                    <ul class="list_box header_list_box">
                                        <li class="list_item header_list_item" v-for="(itemHeader,index) in childrenHeaderList">{{itemHeader.name}}</li>
                                    </ul>
                                </li>
                                <!--表里的数据项-->
                                <draggable  :class="'draggable_pay_project_'+indexOne" :options="itemOne.dragOptions" v-model="itemOne.ruleTypeItems">
                                    <transition-group class="pay_project_list_group" type="transition">
                                        <!--itemOne.ruleTypeItems 大项中的小项列表-->
                                        <li v-for="(itemTwo, indexTwo) in itemOne.ruleTypeItems" :key="indexTwo" :class="itemTwo.isCanEdit ? 'all_wrap_list list_is_can_edit':'all_wrap_list'" :data-item-id="itemTwo.itemId">
                                            <i class="iconfont_daydao_common icon_sort">&#xe625;</i>
                                            <ul class="list_box">
                                                <!--childrenHeaderList 写死的列表项-->
                                                <li class="list_item" v-for="(itemThree,indexThree) in childrenHeaderList">
                                                    <span v-if="itemThree.typeFlag == 0" class="item_name"><i v-if="itemTwo.isSystem == '1'">内置</i>{{itemTwo.itemName}}</span>
                                                    <span v-if="itemThree.typeFlag == 1" class="file_type">
                                                        <span v-if="itemTwo.fieldType == '1'">数字型</span>
                                                        <span v-if="itemTwo.fieldType == '2'">字符型</span>
                                                    </span>
                                                    <span v-if="itemThree.typeFlag == 2" class="dec_length">{{itemTwo.decLength}}</span>
                                                    <!--非编辑的-->
                                                    <template v-if="!itemTwo.isCanEdit">
                                                        <span v-if="itemThree.typeFlag == '3'">
                                                            <!--是否调薪 后台数据和下拉数据做比对-->
                                                            <span v-for="(valFileType,index) in itemThree.treeSelectData3" v-if="valFileType.id == itemTwo.isAdjustable">{{valFileType.name}}</span>
                                                        </span>
                                                        <span v-if="itemThree.typeFlag == '4'">
                                                            <!--收入/支出 后台数据和下拉数据做比对-->
                                                            <span v-for="(valFileType,index) in itemThree.treeSelectData4" v-if="valFileType.id == itemTwo.category">{{valFileType.name}}</span>
                                                        </span>
                                                        <span v-if="itemThree.typeFlag == '5'">
                                                            <!--是否计税 后台数据和下拉数据做比对-->
                                                            <span v-for="(valFileType,index) in itemThree.treeSelectData5" v-if="valFileType.id == itemTwo.isTax">{{valFileType.name}}</span>
                                                        </span>
                                                        <span v-if="itemThree.typeFlag == '6'">
                                                            <!--是否可编辑 后台数据和下拉数据做比对-->
                                                            <span v-for="(valFileType,index) in itemThree.treeSelectData6" v-if="valFileType.id == itemTwo.isEdited">{{valFileType.name}}</span>
                                                        </span>
                                                        <span v-if="itemThree.typeFlag == '7'">
                                                            <!--是否可继承 后台数据和下拉数据做比对-->
                                                            <span v-for="(valFileType,index) in itemThree.treeSelectData7" v-if="valFileType.id == itemTwo.isExtends">{{valFileType.name}}</span>
                                                        </span>
                                                         <span v-if="itemThree.typeFlag == '8'">
                                                            <!--是否可启用 后台数据和下拉数据做比对-->
                                                            <span v-for="(valFileType,index) in itemThree.treeSelectData8" v-if="valFileType.id == itemTwo.isEnable">{{valFileType.name}}</span>
                                                        </span>
                                                        <span v-if="itemThree.typeFlag == '9'" :title="itemTwo.remark">
                                                            <!--备注 后台数据和下拉数据做比对-->
                                                            {{itemTwo.remark}}
                                                        </span>
                                                    </template>
                                                    <!--可编辑-->
                                                    <template v-if="itemTwo.isCanEdit">
                                                        <span v-if="itemThree.typeFlag == '3'" class="span_can_edit">
                                                            <!--是否调薪 后台数据和下拉数据做比对-->
                                                             <Select v-model="itemTwo.isAdjustable">
                                                                <Option v-for="itemSle in itemThree.treeSelectData3" :value="itemSle.id" :key="itemSle.id">{{ itemSle.name }}</Option>
                                                             </Select>
                                                        </span>
                                                        <span v-if="itemThree.typeFlag == '4'"  class="span_can_edit">
                                                            <!--收入/支出 后台数据和下拉数据做比对-->
                                                            <Select v-model="itemTwo.category">
                                                                <Option v-for="itemSle in itemThree.treeSelectData4" :value="itemSle.id" :key="itemSle.id">{{ itemSle.name }}</Option>
                                                             </Select>
                                                        </span>
                                                        <span v-if="itemThree.typeFlag == '5'"  class="span_can_edit">
                                                            <!--是否计税 后台数据和下拉数据做比对-->
                                                            <Select v-model="itemTwo.isTax">
                                                                <Option v-for="itemSle in itemThree.treeSelectData5" :value="itemSle.id" :key="itemSle.id">{{ itemSle.name }}</Option>
                                                             </Select>
                                                        </span>
                                                        <span v-if="itemThree.typeFlag == '6'"  class="span_can_edit">
                                                            <!--是否可编辑 后台数据和下拉数据做比对-->
                                                               <Select v-model="itemTwo.isEdited">
                                                                <Option v-for="itemSle in itemThree.treeSelectData6" :value="itemSle.id" :key="itemSle.id">{{ itemSle.name }}</Option>
                                                             </Select>
                                                        </span>
                                                        <span v-if="itemThree.typeFlag == '7'"  class="span_can_edit">
                                                            <!--是否可继承 后台数据和下拉数据做比对-->
                                                            <Select v-model="itemTwo.isExtends">
                                                                <Option v-for="itemSle in itemThree.treeSelectData7" :value="itemSle.id" :key="itemSle.id">{{ itemSle.name }}</Option>
                                                             </Select>
                                                        </span>
                                                        <span v-if="itemThree.typeFlag == '8'"  class="span_can_edit">
                                                            <!--是否可启用 后台数据和下拉数据做比对-->
                                                        </span>
                                                        <span v-if="itemThree.typeFlag == '9'" :title="itemTwo.remark"  class="span_can_edit">
                                                            <!--备注 后台数据和下拉数据做比对-->
                                                            <Input v-model="itemTwo.remark" placeholder="请输入..."></Input>
                                                        </span>
                                                    </template>
                                                </li>
                                            </ul>
                                            <!--按钮组-->
                                            <div class="btn_wrap">
                                                <i class="iconfont_daydao_common delete_btn" v-if="!itemTwo.isCanEdit && itemTwo.itemId != 'n056' && itemTwo.itemId != 'n053'" @click="openDeleteChildren(indexOne,indexTwo)">&#xe6ae;</i>
                                                <i class="iconfont_daydao_common edit_btn" v-if="!itemTwo.isCanEdit" @click="openListEdit(indexOne,indexTwo)">&#xe69c;</i>
                                                <i class="iconfont_daydao_common save_btn" v-if="itemTwo.isCanEdit" @click="saveChildrenItem(indexOne,indexTwo)">&#xe705;</i>
                                                <i class="iconfont_daydao_common cancel_btn" v-if="itemTwo.isCanEdit" @click="closeListEdit(indexOne,indexTwo)">&#xe618;</i>
                                            </div>
                                        </li>
                                    </transition-group>
                                </draggable>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<script>
import { daydaoDropSelect, daydaoDropSelectMul } from 'commonVueLib/daydaoDropSelect/index'
import draggable from 'vuedraggable'
import selectAndSortableTool from 'commonVueLib/selectAndSortableTool/index'; //隐藏显示列工具
import dialog from 'commonVueLib/artDialog/index.js';
var _ = require('commonVueLib/utils/underscore.js')._;  //underscore工具库组件

export default {
    name: "payRuleItemTab",
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
        daydaoDropSelect,
        daydaoDropSelectMul,
        draggable
    },
    computed:{
    },
    data() {
        return {
            childrenSaveItemflag:false,   //是否正在提交子项目
            childrenSortItemflag:false,   //是否正在排序子项目
            templateItem: {},   // 列表数据
            treeSelectData: {}, // 下拉框数据对象
            formCustom: {}, // 表单数据对象
            ruleCustom: {}, // 表单验证规则
            ruleId:'',
            deleteOption:{  //删除子项目参数
                state:false,
                indexOne:"",
                indexTwo:""
            },
            editListData: {}, // 编辑列表原始数据
            addItemDialog:'',
            addChildrenList:[], //存放子项目当前添加的列表uuid
            allChildrenItemData:[], //所有的子项的源数据 (添加功能)
            allSelectChildrenItem:[],  //所有存在此规则里面的子项目的列表
            postDialogData:[],  //供选择的数据
            childrenTableDatas:[],  //整个薪酬项目数据
            childrenTableDatasBak:[],  //整个薪酬项目数据原始数据
            childrenHeaderList:[
                {
                    name:'项目名称',  //名称
                    isEdit:false, //是否请求后台码表数据
                    infoSetId:null, //码表id
                    typeFlag:"0"   //唯一标识
                },
                {
                    name:'字段类型',
                    isEdit:false,
                    infoSetId:null,
                    typeFlag:"1"   //唯一标识
                },
                {
                    name:'小数位',
                    isEdit:false,
                    infoSetId:null,
                    typeFlag:"2"   //唯一标识
                },
                {
                    name:'是否调薪',
                    isEdit:true,
                    infoSetId:'ct_pay_763',
                    typeFlag:"3"   //唯一标识
                },
                {
                    name:'收入/支出',
                    isEdit:true,
                    infoSetId:'ct_pay_761',
                    typeFlag:"4"   //唯一标识
                },
                {
                    name:'是否计税',
                    isEdit:true,
                    infoSetId:'ct_pay_762',
                    typeFlag:"5"   //唯一标识
                },
                {
                    name:'是否可编辑',
                    isEdit:true,
                    infoSetId:'ct_pay_766',
                    typeFlag:"6"   //唯一标识
                },
                {
                    name:'是否可继承',
                    isEdit:true,
                    infoSetId:'ct_pay_764',
                    typeFlag:"7"   //唯一标识
                },
                /*{
                    name:'是否可启用',
                    isEdit:false,
                    infoSetId:null,
                    typeFlag:"8",   //唯一标识
                },*/
                {
                    name:'备注',
                    isEdit:false,
                    infoSetId:null,
                    typeFlag:"9"   //唯一标识
                }
            ],  //下拉表头
            subprojectList:[]  //子项目的选项
        };
    },
    watch: {
        'editListData': {
            handler: function(newValue, oldValue) {
                var _this = this;

                this.templateItem = JSON.parse(JSON.stringify(newValue));
                _this.initSelectTreeData(_this.templateItem.data[0].data);
            },
            deep: true
        },
        "currentTabInfo" (newValue, oldValue) {
            if(newValue.index === this.tabIndex) {
                this.init()
            }
        }
    },
    created() {
        var t = this;
        t.ruleId = t.$route.params.ruleId;
    },
    filters: {
        filterItemValue(item) {
            if(item.cellType === 'switch') {
                return item.value ? '是' : '否';
            } else {
                return item.value
            }
        }
    },
    methods: {
        /*
        * 初始化数据
        * */
        init() {
            var t = this;
            t.org_id = t.$parent.$parent.id;
            t.templateItem = JSON.parse(JSON.stringify(t.$parent.sectionItem));
            t.editListData = t.templateItem;
            console.log(t.templateItem,"re")
            // 初始化选项的下拉框选项
            t.initSelectTreeData(t.childrenHeaderList);
            t.getAll();
        },
        /*
        * 获取所有子项目数据
        * */
        getAllChildrenItemList(resolve,itemType){
            var t = this;
            t.$daydao.$ajax({
                url: gMain.apiBasePath + "payItemBase/get_item_setting.do",
                data: JSON.stringify({
                    itemType:itemType
                }),
                beforeSend: function() {
                    //typeof options.beforeSend == "function" && options.beforeSend();
                },
                complete: function() {
                    //typeof options.complete == "function" && options.complete();
                },
                success: function(data) {
                    if (data.result == "true") {
                        t.allChildrenItemData = $.extend(true,[],data.data);
//
                        t.allChildrenItemData.forEach(function (val,index) {
                            t.allChildrenItemData[index].isLock = false;  //是否冻结
                            t.allChildrenItemData[index].title = val.itemName;  //名字
                            t.allChildrenItemData[index].isListShow = false;   //是否选中
                            t.allChildrenItemData[index].isCanEdit = false;   //每个子项目是否打开即时编辑
                            t.allChildrenItemData[index].category += '';
                            t.allChildrenItemData[index].isAdjustable += '';
                            t.allChildrenItemData[index].isEdited += '';
                            t.allChildrenItemData[index].isEnable += '';
                            t.allChildrenItemData[index].isExtends += '';
                            t.allChildrenItemData[index].isSystem += '';
                            t.allChildrenItemData[index].isTax += '';
                        });
                            resolve(data);
                    }
                }
            });
        },
        /*
        * 添加子项目
        * */
        addChildrenItem(indexOne){
            var t = this;
            new Promise(function(resolve, reject) {
                t.getAllChildrenItemList(resolve,t.childrenTableDatas[indexOne].itemType);
            }).then(function(data) {
                t.postDialogData = $.extend(true,[],t.allChildrenItemData);
                t.childrenTableDatas[indexOne].ruleTypeItems.forEach(function (val,index) {
                    t.postDialogData.forEach(function (data,num) {  //现有的子项目id和所有子项目的id做一一对比
                        if(val.itemId == data.itemId){   //id一致选中且冻结
                            t.postDialogData[num].isLock = true;
                            t.postDialogData[num].isListShow = true;
                        }
                    })
                })
                t.addItemDialog = dialog({
                    title:'添加项目'
                    ,width:800
                    ,render:function (h,options) {
                        //用选择和排序列组件来渲染
                        return h(selectAndSortableTool,{
                            //传参
                            props:{
                                aColumns:t.postDialogData
                                ,isSort:true
                                ,isSetFrozen:false
                            }
                        });
                    }
                    ,ok:function () {
                        console.log("可见数据：-----------",t.addItemDialog.vueInstance.aAllData,"index:"+indexOne);
                        let chooseArr = [];//当前选中的（包括了冻结的）
                        t.addChildrenList = [];
                        t.addItemDialog.vueInstance.aAllData.forEach(function (val,index) {
                            if(val.isListShow){
                                chooseArr.push(t.addItemDialog.vueInstance.aAllData[index]);
                            }
                        });
                        chooseArr.forEach(function (data,num) {     //添加的项筛选（筛选未冻结选中的）
                            if(_.findIndex(t.allSelectChildrenItem,{itemId:data.itemId}) == -1){
                                t.addChildrenList.push(data.uuid);
                            }
                        });
                        if(t.addChildrenList.length > 0){   //有添加项才去请求接口
                            t.saveAddChildrenItem(indexOne);
                        }
                        return ;
                    }
                    ,cancel:function () {

                    }
                });
                t.addItemDialog.showModal();
            });
        },
        /*
        * 打开对子项目排序
        * */
        canSortChildrenList(index){
            var t = this;
            t.cancelRowData(index);
            t.childrenTableDatas[index].dragOptions.disabled = false;
            t.childrenTableDatas[index].isSpread = true;
            t.childrenTableDatas = JSON.parse(JSON.stringify(t.childrenTableDatas));
        },
        /*
         * 关闭对子项目排序
         * */
        closeSortChildrenList(index){
            var t = this;
            t.childrenTableDatas[index].dragOptions.disabled = true;
            t.childrenTableDatas = JSON.parse(JSON.stringify(t.childrenTableDatas));
            t.cancelRowData(index);
        },
        /*
        * 打开或者展开子项目列表
        * */
        openOrCloseChildrenList(index){
            var t = this;
            t.childrenTableDatas[index].isSpread = !t.childrenTableDatas[index].isSpread;
            t.childrenTableDatas = JSON.parse(JSON.stringify(t.childrenTableDatas));
        },
        /*
        * 打开即时编辑
        * indexOne   项目下标
        * indexTwo   子项目下标
        * */
        openListEdit(indexOne,indexTwo) {
            var t = this;
            t.childrenTableDatas[indexOne].ruleTypeItems[indexTwo].isCanEdit = true;
            t.childrenTableDatas = JSON.parse(JSON.stringify(t.childrenTableDatas));
        },
        /*
         * 关闭即时编辑
         * indexOne   项目下标
         * indexTwo   子项目下标
         * */
        closeListEdit(indexOne,indexTwo) {
            var t = this;
            t.childrenTableDatas[indexOne].ruleTypeItems[indexTwo].isCanEdit = false;
            t.childrenTableDatas = JSON.parse(JSON.stringify(t.childrenTableDatas));
            t.cancelRowData(indexOne);
        },
        /**
         * 初始化下拉框数据集
         */
        initSelectTreeData(items) {
            var t = this;
            items.forEach(function(item,index) {
                // 是否要请求后台的码表
                if (item.isEdit && item.infoSetId){
//                    拼接参数字段
                    item.keyValueBean = {"infoSetId":item.infoSetId,"keyId":"code_id","valueId":"code_name","parentId":null,"tipId":null,"corpId":null,"conditionId":null,"conditionFieldId":null,"isDateFilter":false,"conditionBean":null,"orderBean":null,"orderStr":null,"filterStr":null,"openSize":null,"multiType":"G_zh-CN","isInner":true,"caseCode":null,"currPersonId":null,"securityId":null,"systemSource":"dayhr"}
                    // 为treeSelect\radio时，获取选项数据
                    t.getKeyValueData({
                        data: item.keyValueBean,
                        success: function(data) {
                            item['treeSelectData'+item.typeFlag] = data.beans;
                        }
                    })
                }
            })
        },
        /**
         * 获取下拉键值对
         * @options.data
         * @options.success
         * */
        getKeyValueData(options) {
            this.$daydao.$ajax({
                url: gMain.apiBasePath + "route/getKeyValueData.do",
                data: JSON.stringify(options.data),
                beforeSend: function() {
                    //typeof options.beforeSend == "function" && options.beforeSend();
                },
                complete: function() {
                    //typeof options.complete == "function" && options.complete();
                },
                success: function(data) {
                    if (data.result == "true") {
                        typeof options.success == "function" && options.success(data);
                    }
                }
            });
        },
        /**
         * 取消
         */
        cancelRowData(index) {
            const  t = this;
            t.childrenTableDatas = $.extend(true,[],t.childrenTableDatasBak);
            t.childrenTableDatas[index].isSpread = true;
        },
        /*
        * 保存子项目添加
        * */
        saveAddChildrenItem(indexOne){
            const t = this;
            let postOption = {
                itemType:t.childrenTableDatas[indexOne].itemType,
                ruleId:t.ruleId,
                uuidList:t.addChildrenList
            }
            t.$daydao.$ajax({
                url: gMain.apiBasePath + "payItemBase/save_rule_item.do",
                data: JSON.stringify(postOption),
                complete: function() {
                    t.childrenSaveItemflag = false;
                },
                success: function(data) {
                    if(data.result == "true"){
                        t.$Message.success('保存成功');
                        t.getAll(indexOne);
                    }
                }
            });
        },
        /*
        * 子项目排序
        * */
        sortChildrenItem(indexOne){
            const t = this;
            let postOption = {
                dataList:[],
                ruleId:t.ruleId
            }
            let itemOrderArr = [];  //序号值数组
            if(t.childrenSortItemflag) return;
            t.childrenSortItemflag = true;

            t.childrenTableDatas[indexOne].ruleTypeItems.forEach(function (val,index) {
                itemOrderArr.push(val.itemOrder);
            });
            itemOrderArr.sort(function (a,b) {  //序号值排序完毕 (反序)
                return b - a;
            });
            t.childrenTableDatas[indexOne].ruleTypeItems.forEach(function (val,index) {
                let obj = {
                    item_order:itemOrderArr[index],
                    uuid:val.uuid
                };
                postOption.dataList.push(obj);
            });
            t.$daydao.$ajax({
                url: gMain.apiBasePath + "payItemBase/rule_item_sort.do",
                data: JSON.stringify(postOption),
                complete: function() {
                    t.childrenSortItemflag = false;
                },
                success: function(data) {
                    if(data.result == "true"){
                        t.$Message.success('保存成功');
                        t.childrenTableDatas[indexOne].dragOptions.disabled = true;
                        t.childrenTableDatas = JSON.parse(JSON.stringify(t.childrenTableDatas));
                        t.childrenTableDatasBak = $.extend(true,[],t.childrenTableDatas);
                    }
                }
            });
        },
        /*
        * 打开删除子项目
        * */
        openDeleteChildren(indexOne,indexTwo){
            var t = this;
            t.deleteOption = {  //删除子项目参数
                state:true,
                indexOne:indexOne,
                indexTwo:indexTwo
            };
        },
        /*
        * 删除子项目
        * */
        deleteChildrenItem(){
            var t = this;
            var postOption = {
                infoSetId:t.templateItem.templateId,
                uuidLists:[
                    t.childrenTableDatas[t.deleteOption.indexOne].ruleTypeItems[t.deleteOption.indexTwo].uuid
                ]
            }
            t.$daydao.$ajax({
                url: gMain.apiBasePath + "route/" + t.templateItem.templateId + "/del.do",
                data: JSON.stringify(postOption),
                beforeSend: function() {
                    //typeof options.beforeSend == "function" && options.beforeSend();
                },
                complete: function() {
                    //typeof options.complete == "function" && options.complete();
                },
                success: function(data) {
                    if (data.result == "true") {
                        t.$Message.success('删除成功');
                        t.getAll(t.deleteOption.indexOne);
                    }
                }
            });
        },
        /*
        * 子项目的修改选项
        * */
        saveChildrenItem(indexOne,indexTwo){
            var t = this;
            if(t.childrenSaveItemflag) return;
            t.childrenSaveItemflag = true;
            let postOption = {
                infoSetId:t.templateItem.templateId,
                dataList:[
                    {
                        key:"item_type",
                        value:t.childrenTableDatas[indexOne].itemType
                    },
                    {
                        key:"is_adjustable",
                        value:t.childrenTableDatas[indexOne].ruleTypeItems[indexTwo].isAdjustable
                    },
                    {
                        key:"category",
                        value:t.childrenTableDatas[indexOne].ruleTypeItems[indexTwo].category
                    },
                    {
                        key:"is_tax",
                        value:t.childrenTableDatas[indexOne].ruleTypeItems[indexTwo].isTax
                    },
                    {
                        key:"is_edited",
                        value:t.childrenTableDatas[indexOne].ruleTypeItems[indexTwo].isEdited
                    },
                    {
                        key:"is_extends",
                        value:t.childrenTableDatas[indexOne].ruleTypeItems[indexTwo].isExtends
                    },
                    {
                        key:"remark",
                        value:t.childrenTableDatas[indexOne].ruleTypeItems[indexTwo].remark
                    }
                ],
                uuid:t.childrenTableDatas[indexOne].ruleTypeItems[indexTwo].uuid
            }
            t.$daydao.$ajax({
                url: gMain.apiBasePath + "route/" + t.templateItem.templateId + "/update.do",
                data: JSON.stringify(postOption),
                complete: function() {
                    t.childrenSaveItemflag = false;
                },
                success: function(data) {
                    if(data.result == "true"){
                        t.$Message.success('保存成功');
                        t.childrenTableDatas[indexOne].ruleTypeItems[indexTwo].isCanEdit = false;
                        t.childrenTableDatasBak = $.extend(true,[],t.childrenTableDatas);
                    }
                }
            });
        },
        // 获取该模板的list数据
        getAll(indexOne) {
            var t = this,
                oSendObj = {    // 请求子模块数据条件
                    infoSetId: t.templateItem.templateId,
                    editCondition: t.$parent.$parent.editCondition,
                    pageBean: {
                        pageNo: 1,
                        pageSize: 10000
                    }
                };
            t.$daydao.$ajax({
                url: gMain.apiBasePath + "route/" + t.templateItem.templateId + "/getAll.do",
                data: JSON.stringify(oSendObj),
                beforeSend: function() {
                    //typeof options.beforeSend == "function" && options.beforeSend();
                },
                complete: function() {
                    //typeof options.complete == "function" && options.complete();
                },
                success: function(data) {
                    if (data.result == "true") {
                        if(data.ext && data.ext.ruleItems.length != 0){
                            t.payProjectDataHandle(data.ext,indexOne);
                        }
                    }
                }
            });
        },
        /*
        * 考核项目数据格式处理
        * */
        payProjectDataHandle(data,indexOne){
            var t = this
            var selectChildrenItem = [];
            t.childrenTableDatas = $.extend(true,[],data.itemTypes);
            t.childrenTableDatas.forEach(function (val,index) {
                if(typeof(indexOne) != "undefined" && index == indexOne){   //有indexOne说明此时进行了其他操作
                    t.childrenTableDatas[index].isSpread = true;   //是否展开子项目列表
                }else{
                    t.childrenTableDatas[index].isSpread = false;   //是否展开子项目列表
                }
                t.childrenTableDatas[index].dragOptions = {      //排序参数
                        animation: 200,
                        dragClass: "pay-item-sortable-drag",
                        chosenClass: "pay-item-sortable-chosen",
                        disabled: true    //默认禁止排序
                }
                data.ruleItems.forEach(function (value,number) {
                    if(val.itemType == value.itemType){
                        t.childrenTableDatas[index].ruleTypeItems = value.ruleTypeItems.slice(0);  //对应的子项列表拼接进去
                        selectChildrenItem = selectChildrenItem.concat(value.ruleTypeItems.slice(0));  //集合所有子项
                        t.childrenTableDatas[index].ruleTypeItems.forEach(function (data,num) {
                            t.childrenTableDatas[index].ruleTypeItems[num].category += '';   //iview 的select需要的是字符串类型
                            t.childrenTableDatas[index].ruleTypeItems[num].isAdjustable += '';
                            t.childrenTableDatas[index].ruleTypeItems[num].isEdited += '';
                            t.childrenTableDatas[index].ruleTypeItems[num].isEnable += '';
                            t.childrenTableDatas[index].ruleTypeItems[num].isExtends += '';
                            t.childrenTableDatas[index].ruleTypeItems[num].isSystem += '';
                            t.childrenTableDatas[index].ruleTypeItems[num].isTax += '';
                            t.childrenTableDatas[index].ruleTypeItems[num].isCanEdit = false;   //每个子项目是否打开即时编辑
                        })
                    }
                })
            })
            t.childrenTableDatas = JSON.parse(JSON.stringify(t.childrenTableDatas));
            t.childrenTableDatasBak = $.extend(true,[],t.childrenTableDatas);
            t.allSelectChildrenItem = $.extend(true,[],selectChildrenItem);
            console.log(t.childrenTableDatas,"red")
        }
    }
}
</script>

<style lang="scss">
    $prefixCls:'page_table'; //样式前缀

    .#{$prefixCls}{
        &_list{
            position: relative;
            margin-left: -1px;


            .el-table th>.cell{
                font-weight: 600;
            }

            /*翻页*/
            .#{$prefixCls}_pager{
                width:100%;
                height:30px;
                padding:3px 0;
                background: rgba(255, 255, 255, 0.45);
                margin-top: 10px;
                margin-bottom: 10px;
                z-index: 9;
                position: relative;

                position: relative;
                text-align: center;
                .ivu-page{
                    transform: inherit!important;
                    position: static!important;
                    left: auto!important;
                }
                .ivu-select-item{
                    font-size:12px!important;
                }
            }


            /*隐藏显示列*/
            .#{$prefixCls}_column_show{
                position: absolute;
                top:41px;
                right:0;
                height:100px;
                width:500px;
                background: #525665;
                color:#fff;
                padding:20px;
                height:500px;
                z-index: 9;
                min-width: 306px;

                .select_all{
                    height:45px;
                    line-height: 45px;
                }

                .select_items{
                    ul{
                        overflow: hidden;
                    }
                    li{
                        width:168px;
                        float: left;
                        line-height: 34px;
                        height:34px;

                        .ivu-checkbox{
                            margin-right:10px;
                        }
                    }
                }

            }

        }

        &_list_width_data{
            position: relative;
        }

        &-cell-content{
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /*隐藏列按钮*/
        &_hide_column{
            width: 22px;
            position: absolute;
            right: 0px;
            top: 1px;
            text-align: center;
            overflow: hidden;
            cursor: pointer;
            height: 40px;
            line-height: 40px;
            background: #f5f7f9;
            z-index: 9;

            .show_column_btn{
                font-size: 24px;
                color: #657180;
                font-weight: bold;
                line-height: 40px;
            }
        }

        /*暂无数据*/
        &_list_widthout_data{
            position: absolute;
            top:0;
            left:0;
            width:100%;
            height:100%;

            &_inner{
                width:400px;
                height:226px;
                position: absolute;
                left:50%;
                top:122px;
                margin-left:-200px;
            }

            .no_data{
                background: url("./img/no-data.png") no-repeat center center;
                width:400px;
                height: 176px;
            }
            .no_data_text{
                margin-top:20px;
                line-height: 30px;
                font-size: 14px;
                color: #657180;
                text-align: center;
            }
        }
    }

</style>

<template>

    <div :class="[prefixCls + '_list','clearfix']">

        <!--有数据的时候-->
        <div :class="[prefixCls + '_list_width_data','clearfix']" v-show="myTableData.length">

            <!--<Table
                :columns="myTableColumnData"
                :data="myTableData"
                :height="myTableHeight"
                :isShowTableColumnToolBtn="true"

                width="100%"
                @showTableHideColumnTool="showTableHideColumnTool"

                @on-current-change="onCurrentChange"
                @on-sort-change="onSortChange"
                @on-select="onSelect"
                @on-select-all="onSelectAll"
                @on-select-cancel="onSelectCancel"
                @on-selection-change="onSelectionChange"
                @on-row-click="onRowClick"
                @on-row-dblclick="onRowDblclick"
                draggable
                ref="table">
            </Table>-->

            <el-table
                :data="myTableData"
                :height="myTableHeight"
                border
                @sort-change="onSortChange"
                @select="onSelect"
                @select-all="onSelectAll"
                @selection-change="onSelectionChange"
                @row-click="onRowClick"
                @row-dblclick="onRowDblclick"
                @cell-click="cellClick"
                style="width: 100%">

                <el-table-column
                    fixed
                    type="selection"
                    :resizable="false"
                    width="55" v-if="isShowSelectionRow">
                </el-table-column>

                <el-table-column
                    fixed
                    type="index"
                    label="序号"
                    align="center"
                    :resizable="false"
                    width="66">
                    <template scope="scope">
                        <div style="white-space: nowrap;">{{getIndexHtml(scope)}}</div>
                    </template>
                </el-table-column>

                <!--<el-table-column-->
                    <!--fixed-->
                    <!--label="操作"-->
                    <!--:width="iOperateWidth" v-if="getOperateHtml">-->
                    <!--<template scope="scope">-->
                        <!--<div v-html="getOperateHtml(scope)" @click="onClickOperateRow($event,scope)">-->

                        <!--</div>-->
                    <!--</template>-->
                <!--</el-table-column>-->

                <el-table-column
                    :fixed="operateRow.fixed"
                    :label="operateRow.label"
                    :align="operateRow.align"
                    :resizable="false"
                    :width="operateRow.render ? operateRow.width : iOperateWidth" v-if="getOperateHtml || operateRow.render">
                    <template scope="scope">
                        <Expand v-if="operateRow.render" :scope="scope" :render="operateRow.render"></Expand>
                        <div v-if="getOperateHtml" v-html="getOperateHtml(scope)" @click="onClickOperateRow($event,scope)"></div>
                    </template>
                </el-table-column>

                <el-table-column
                    v-for="item in myTableColumnData"
                    :fixed="item.fixed"
                    :prop="item.key"
                    :label="item.title"
                    :formatter="item.formatter"
                    :sortable="item.sortable"
                    :align="item.align"
                    :resizable="item.resizable"
                    :min-width="item.minWidth" :key="item.key">

                    <!--特殊渲染模式-->
                    <template scope="scope">
                        <div :class="[prefixCls +'-cell-content']" :title="scope.row[scope.column.property]" v-html="getRowHtml(scope)"></div>
                    </template>

                </el-table-column>

            </el-table>

            <!--翻页-->
            <div :class="[prefixCls + '_pager']">
                <Page :total="parseInt(pageTotal)" size="small" :page-size="pageSize" :page-size-opts="pageSizeLimit" :current="parseInt(pageNo)" placement="top" @on-change="onChangePageNo" @on-page-size-change="onPageSizeChange" show-elevator show-sizer show-total></Page>
            </div>

            <!--隐藏显示列的按钮-->
            <div :class="[prefixCls + '_hide_column']" title="显示隐藏列" @click="showTableHideColumnTool">
                <Icon type="ios-more" class="show_column_btn"></Icon>
            </div>

            <!--隐藏显示列插件-->
            <transition name="fade" mode="out-in">
                <div :class="[prefixCls + '_column_show']" :style="{width:iColumnShowWidth}" v-if="isShowTableColumn">
                    <div class="select_all">
                        <Checkbox v-model="isCheckAllColumn" @on-change="onCheckAllStatusChange">全选（排除已冻结选项，至少显示一列）</Checkbox>
                    </div>
                    <div class="select_items">
                        <Checkbox-group v-model="aColumnShowData">
                            <ul>
                                <!--排除序号和复选框列-->
                                <li v-for="(item,index) in tableColumnData" v-if="!item.isHidden">
                                    <Checkbox :data-value="item.name" :label="item.name" :disabled="(item.isFrozen || item.disabled)?true:false">{{item.title}}</Checkbox>
                                </li>
                            </ul>
                        </Checkbox-group>
                        <div style="text-align: right;padding-right:100px;margin-top:10px;">
                            <Button type="primary" @click="setHideColumn">确定</Button>
                            &nbsp;
                            <Button @click="cancelSetHideColumn">取消</Button>
                        </div>
                    </div>

                </div>
            </transition>
        </div>

        <!--无数据的时候-->
        <div :class="[prefixCls + '_list_widthout_data','clearfix']" v-show="!myTableData.length">
            <div :class="[prefixCls + '_list_widthout_data_inner']" v-show="isDataLoaded">
                <div class="no_data">

                </div>
                <div class="no_data_text">
                    暂无内容
                </div>
            </div>
        </div>

    </div>

</template>

<script>
    //引入表格组件
    import { ElTable,ElTableColumn } from 'commonVueLib/element-table/index.js'
    import Expand from "./expand.js";
    var timerResize = null;
    var selectionConfig = {
        type: 'selection',
        width: 60,
        align: 'center',
        resizable:false //此列不可拖拽
    };
    export default{
        name:"tableList"
        ,components:{
            ElTable,
            ElTableColumn,
            Expand
        }
        ,props:{
            tableColumnData:{
                type:Array
                ,default(){
                    return [];
                }
            }
            ,tableData:{
                type:Object
                ,default(){
                    return {};
                }
            }
            ,pageSize:{
                type:Number
                ,default:20
            }
            //操作列的宽度
            ,iOperateWidth:{
                type:Number
                ,default:100
            }
            //操作列函数，getOperateHtml(scope){return '字符串就是操作列要显示的内容';}
            ,getOperateHtml:{
                type:Function
            }
            ,operateRow:{
                type:Object,
                default(){
                    return {
                        fixed:true,
                        label:"操作",
                        align:"left",
                        width:100
                    };
                }
            }
            //是否显示表格复选框
            ,isShowSelectionRow:{
                type:Boolean
                ,default:false
            }
            //是否表格数据加载完成
            ,isDataLoaded:{
                type:Boolean
            }
        }
        ,data () {
            var t = this;
            return {
                 prefixCls:'page_table'  //样式前缀
                ,myTableColumnData:[]  //真实的表头的数据
                ,myTableData: [] //表格数据
                //翻页信息
                ,pageSizeLimit:[10,20,30,40,50,100]
                ,pageTotal:0
                ,pageNo:1

                ,isHasFixed:false //是否有冻结的列


                ,isSelectAllTableData:false //是否选中所有表格数据

                ,iColumnNum:0 //可显示的列的个数
                ,iColumnShowWidth:0 //显示隐藏
                ,aColumnShowData:[] //已经设置为显示的列
                ,isCheckAllColumn:false //是否已经设置了显示全部列

                ,isShowTableColumn:false //是否显示表格列
                ,aSelectionData:[] //多选选中的数据
                ,myTableHeight : 443
            };
        }
        ,created(){
            var t = this;
            t.myTableColumnData = t.getTableColumnData(t.tableColumnData);
            if(!$.isEmptyObject(t.tableData)){
                t.myTableData = JSON.parse(JSON.stringify(t.tableData.maps));

                //后台返回的翻页信息
                var pb = t.tableData.pb;
                t.pageTotal = parseInt(pb.pageDataCount) || 0;
                t.pageNo = parseInt(pb.pageNo) || 1;
            }

            //要发送给后端的翻页对象
            t.oPageBean = {
                "pageNo":t.pageNo
                ,"pageSize":t.pageSize
            };

        }
        /**
         * 组件el渲染之后
         * */
        ,mounted () {
            var t = this;
            var iTableWrapLeft = $(t.$el).offset().left; //容器距离左边距离

            //窗口变化
            var timerResize = null;
/*
            $(window).on("resize.setHeight",function () {
                clearTimeout(timerResize);
                timerResize = setTimeout(function () {
                    t.setTableHeight();
                },50);
            });
*/

            //点击空白处隐藏“隐藏显示列工具”
            $(document).on("click",function (event) {
                 if(!$(event.target).closest('.page_table_hide_column').length && !$(event.target).closest('.'+t.prefixCls + '_column_show').length){
                     t.showTableHideColumnTool(false);
                 }
            });

        }
        ,watch:{
            tableColumnData (val,oldVal) {
                var t = this;
                if(val && val.length){
                    this.myTableColumnData = t.getTableColumnData(val);
                }
            }
            ,tableData (val,oldVal) {
                var t = this;
                if(val){
                    t.myTableData = JSON.parse(JSON.stringify(val.maps || []));

                    //后台返回的翻页信息
                    var pb = val.pb || {};
                    t.pageTotal = parseInt(pb.pageDataCount) || 0;
                    t.pageNo = parseInt(pb.pageNo) || 1;
                }
            }
            ,isSelectAllTableData(){
                var t = this;
                $(t.$el).find(".ivu-table-header").find(".ivu-checkbox-wrapper").trigger("click");
            }
            /**
             * 已经显示的列的数组
             * */
            ,aColumnShowData(val,old){
                var t = this;
                //如果勾选取消列只剩下最后一个的时候就禁用最后一个不许再取消，至少保持一个
                if(val.length == 1){
                    for(var i=0;i<t.tableColumnData.length;i++){
                        if(t.tableColumnData[i].name == val[0]){
                            t.tableColumnData[i].disabled = true; //禁用其中至少一个列要被选中
                            break;
                        }
                    }
                }else{
                    for(var i=0;i<t.tableColumnData.length;i++){
                        t.tableColumnData[i].disabled = false; //取消所有的禁用
                    }
                }
                if(val.length >= t.iColumnNum){
                    t.isCheckAllColumn = true;
                }else{
                    t.isCheckAllColumn = false;
                }
            }
            /**
             * 是否显示隐藏列
             * */
            ,isShowTableColumn(val,old){
                var t = this;
                if(val){
                    t.aColumnShowData_old = JSON.parse(JSON.stringify(t.aColumnShowData)); //先备份一份，提供给取消按钮来还原
                }
            }

        }
        ,methods:{
            /**
             * 重新格式化处理表头数据
             * */
            getTableColumnData (arr) {
                var t = this;

                var iColumnNum = 0; //可显示的列的个数
                t.aColumnShowData = []; //重新初始化
                var aColumnCache = localStorage.getItem("column_data_" + t.$route.path + gMain.sDdh,t.aColumnShowData)?localStorage.getItem("column_data_" + t.$route.path + gMain.sDdh,t.aColumnShowData).split(","):[];
                arr.forEach(function (item,index) {
                    //如果曾经改列设置显示过，这次在列表里面就直接显示
                    if(aColumnCache.indexOf(item.name) != -1){
                        item.isListShow = true;
                    }

                    //如果不是固定隐藏的列
                    if(!item.isHidden){
                        iColumnNum++;
                        if(item.isListShow){
                            t.aColumnShowData.push(item.name);
                        }
                    }

                    //如果是冻结的列
                    if(item.isFrozen){
                        t.isHasFixed = true;
                    }

                    //如果是显示的列
                    if(item.isListShow && !item.isHidden){
                        item.width = item.width || 100; //没有设置宽度的默认为100处理
                        item.width = item.width < 100 ? 100:item.width; //数据的最小宽度为100
                    }
                });
                t.iColumnNum = iColumnNum;
                t.iColumnShowWidth = Math.ceil(iColumnNum/12)*168 + 40 + "px";
                selectionConfig.fixed = t.isHasFixed?"left":''; //设置复选框是否冻结

                var newArr = [];

                arr.forEach(function (item,index) {
                    if(item.isListShow && !item.isHidden){
                        var oItem = {
                            title:item.title
                            ,key:item.name
                            ,align:item.alignX
                            ,resizable:true //此列可拖拽
                            ,render:item.render
                            ,minWidth:item.width //列的最小宽度
                            ,sortable:item.isSortable?"custom":false //排序
                        };
                        //表格冻结列
                        if(item.isFrozen){
                            oItem.fixed = 'left';
                        }
                        //表格数据格式化
                        if(item.formatter){
                            oItem.formatter = item.formatter;
                        }
                        newArr.push(oItem);
                    }
                })
                return newArr;
            }
            /**
             * 计算表格高度
             * */
            ,setTableHeight(){
/*
                var t = this;
                if(document.querySelector('.'+t.prefixCls+'_list')){
                    var rectY = document.querySelector('.'+t.prefixCls+'_list').getBoundingClientRect().top;
                    t.myTableHeight = window.innerHeight-rectY-68;
                }
*/
            }
            /**
             * 展示数据
             * */
            ,showDataClick (index) {
                var t = this;
                t.$emit("onShowDataClick",t.myTableData[index]);
            }
            /**
             * 索引列显示的处理
             * */
            ,getIndexHtml(scope){
                var t = this;
                return (parseInt(t.pageNo) -1) * parseInt(t.pageSize) + (scope.$index + 1);
            }
            /**
             * 展示数据处理
             * */
            ,getRowHtml(scope){
                var t = this;
                if(scope.column.formatter){
                    return scope.column.formatter(scope.row, scope.column, scope.row[scope.column.property]); //三个参数分别代表row, column, cellValue
                }else{
                    return scope.row[scope.column.property];
                }
            }
            /**
             * 改变翻页码
             * */
            ,onChangePageNo (num) {
                var t = this;
                $.extend(t.oPageBean,{pageNo:String(num)})
                t.$emit("onChangePage",t.oPageBean);
            }
            /**
             * 改变每页条数
             * */
            ,onPageSizeChange (num) {
                var t = this;
                $.extend(t.oPageBean,{pageSize:num});
                t.$emit("onChangePage",t.oPageBean);
            }
            /**
             * 设置隐藏显示列
             * */
            ,setHideColumn(){
                var t = this;
                localStorage.setItem("column_data_" + t.$route.path + gMain.sDdh,t.aColumnShowData); //把设置显示的列缓存起来
                var aColmuns = $.extend([],t.tableColumnData);
                aColmuns.forEach(function (item,index,arr) {
                    if(t.aColumnShowData.indexOf(item.name) !=-1){
                        arr[index].isListShow = true; //设为可显示
                    }else{
                        arr[index].isListShow = false; //设为隐藏
                    }
                });
                t.myTableColumnData = t.getTableColumnData(aColmuns); //更新表头数据
                t.isShowTableColumn = false; //隐藏操作隐藏列的界面
            }
            /**
             * 取消设置隐藏显示列
             * */
            ,cancelSetHideColumn(){
                var t = this;
                t.aColumnShowData = JSON.parse(JSON.stringify(t.aColumnShowData_old)); //取消还原为原来的
                t.isShowTableColumn = false;
            }
            /**
             * 全选状态发生改变的时候
             * */
            ,onCheckAllStatusChange(val){
                var t = this;
                if(val){
                    t.aColumnShowData = [];
                    t.tableColumnData.forEach(function (o,i) {
                        o.disabled = false; //取消所有的禁用
                        if(!o.isHidden){
                            t.aColumnShowData.push(o.name);
                        }
                    });
                }else{
                    t.aColumnShowData = [];
                    t.tableColumnData.forEach(function (o,i) {
                        if(o.isFrozen){
                            t.aColumnShowData.push(o.name);
                        }
                    });

                    //如果一个都没有被匹配中，就选择第一个不是深度隐藏的列
                    if(!t.aColumnShowData.length){
                        for(var i=0;i<t.tableColumnData.length;i++){
                            if(!t.tableColumnData[i].isHidden){
                                t.tableColumnData[i].disabled = true; //禁用其中至少一个列要被选中
                                t.aColumnShowData.push(t.tableColumnData[i].name);
                                break;
                            }
                        }
                    }
                }
            }
            /**
             * 表格显示隐藏按钮
             * */
            ,showTableHideColumnTool(flag){
                var t =this;
                if(typeof flag === "boolean"){
                    t.isShowTableColumn = flag;
                }else{
                    t.isShowTableColumn = !t.isShowTableColumn;
                }
            }

            /**
             * 排序
             * */
            ,onSortChange(opts) {
                var t = this;
                t.$emit("on-sort-change",opts);
            }
            /**
             * 选择数据
             * */
            ,onSelect(selection,row){
                var t = this;
                t.$emit("on-select",arguments);
            }
            /**
             * 选择数据
             * */
            ,onSelectAll(selection,row){
                var t = this;
                t.aSelectionData = selection;
                t.$emit("on-select-all",arguments);
            }

            /**
             * 选择数据
             * */
            ,onSelectionChange(selection){
                var t = this;
                t.aSelectionData = selection;
                t.$emit("on-selection-change",arguments);
            }
            /**
             * 行的单击事件
             * */
            ,onRowClick(row, event, column,$index){
                var t = this;
                //console.log(row, event, column,$index);return false;
                t.$emit("on-row-click",{
                    $event:event
                    ,iIndex:$index
                    ,rowData:row
                });
            }
            /**
             * 行的双击事件
             * */
            ,onRowDblclick(row, event, column,$index){
                var t = this;
                t.$emit("on-row-dblclick",{
                    $event:event
                    ,iIndex:$index
                    ,rowData:row
                });
            }
            /**
             * 操作列的点击
             * */
            ,onClickOperateRow($event,scope){
                var t = this;
                t.$emit("on-click-operate",$event,scope);
            }
            /**
             * 单元格的点击
             * */
            ,cellClick(row, column, cell, event){
                var t = this;
                t.$emit("cell-click",row, column, cell, event);
            }
        }
    }
</script>

<template>
    <div id="pay_record_manage_index" style="position:relative">
        <div class="status">
            <span>状态： </span>
            <daydao-drop-select :data="statusList" 
                                name="status" 
                                placeholder="全部" 
                                class="statusSelect"
                                :onSelected="selectBasePerson"></daydao-drop-select>
        </div>

        <table-data-list class="hr_pay_table_list"
                         ref="tableDataList" 
                         :spanMethod="spanMethod"
                         :infoSetId="infoSetId" 
                         :defineBtns="defineBtns"
                         :isShowSerialIndexNumber=isShowSerialIndexNumber
                         @cell-click="cellClick">
            <div slot="page-tree-menu"></div>  
        </table-data-list>

        <batch-add :batchInfo="batchInfo" ref="batchAdd"></batch-add>
        <add-success :addInfo="addInfo"></add-success>
        <edit-online :editOnlineInfo="editOnlineInfo"></edit-online> 
    </div>
</template>

<script type="text/babel">
    const infoSetId = "pay_persons_list";  //页面信息集ID

    import tableDataList from "commonVueLib/tableDataList/index";
    import formatTableData from 'utils/formatTableData';
    import daydaoDropSelect from 'commonVueLib/daydaoDropSelect/daydaoDropSelect';
    import importData from 'commonVueLib/importData/importData';
    import exportData from 'commonVueLib/exportData/exportData';
    import batchAdd from './children/batchAdd/index';
    import addSuccess from './children/addSuccess/index';
    import editOnline from './children/editOnlineModal/index';


    export default {
        name:infoSetId,
        data() {
            return {
                infoSetId: infoSetId,
                defineBtns: [
                    {
                        name: '在线编辑',
                        active: false,
                        event: () => {
                            this.editOnline();
                        }  
                    },
                    {
                        name:'批量新增',
                        active: false,
                        event: ()=>{
                            this.batchAdd();
                        }
                    },
                    {
                        name: '导入',
                        active: false,
                        event: ()=>{
                            this.import();
                        }
                    },
                    {
                        name: '导出',
                        active: false,
                        event: ()=>{
                            this.export();
                        }
                    },

                ],
                editOnlineInfo:{
                    state: false,                    
                    title: '在线编辑'
                },
                batchInfo: {
                    state: false,                    
                    title: '批量新增规则'
                },
                addInfo:{
                    state:false,
                    title:'提示',
                },
                statusList:[
                    {
                        name: '全部',
                        id: 0
                    },
                ],
                isShowSerialIndexNumber: true,
                columnData: [],        //合并列 行索引 行数
                data: []               //合并列  行 行索引 列 列索引
            }
        },
        components:{
            tableDataList,
            formatTableData,
            daydaoDropSelect,
            importData,
            exportData,
            batchAdd,
            addSuccess,
            editOnline
        },
        mounted(){
            const self = this;
            //重写方法
            // 列表表头格式化
            self.$refs.tableDataList.formatTableData = function(arr) {
                const self = this;
                return formatTableData.formatTableData(self, arr, "");
            }
            // 翻页清空合并列所需数据
            self.$refs.tableDataList.$watch('tableData',(val)=>{
               self.columnData = {};
               self.data = [];
            });
        },
        created() {
            var t = this;
            // 显示头部
            gMain.showPayHead(true);
            t.statusListReq();
        },
        methods:{
            // 初始化计薪人数下拉列表
            statusListReq() {
                const self = this;
                self.$daydao.$ajax({
                    url: gMain.apiBasePath + "payPerson/getPayPersonCountByCorp.do",
                    type: 'POST',
                    success: function(data) {
                        self.statusList.push({
                            name: '在职计薪人员('+ data.onJobPersonPayCount + ')',
                            id: 1
                        },{
                            name: '在职未计薪人员('+ data.onJobPersonNotPayCount + ')',
                            id: 2
                        },{
                            name: '离职未停薪人员('+ data.disPersonPayCount + ')',
                            id: 3
                        })
                    }
                })
            },
            // 在线编辑 
            editOnline() {
                const self = this;
                /* self.$store.dispatch('setRecordTableColumn', self.$refs.tableDataList.getTableColumnData);
                self.$store.dispatch('setRecordTableData', self.$refs.tableDataList.tableData); */
                self.editOnlineInfo.state = true;
                // self.$router.push({path:'/recordManage/editOnline'});
            },  
            // 批量新增
            batchAdd() {
                const self = this;
                self.batchInfo.state = true;   
            },
            // 导入
            import() {
                const self = this;
                sessionStorage.setItem('importData',JSON.stringify({
                    getTableColumnData: self.$refs.tableDataList.getTableColumnData,
                    aColumnShowData: self.$refs.tableDataList.$refs.tableList.aColumnShowData,
                    modelId: {
                        add: 'pay_person_import',
                        edit: 'pay_person_import'
                    }
                }))
                self.$router.push(`/importData/${self.infoSetId}/single`);
            },
            // 导出
            export() {
                const self = this;
                self.$refs.tableDataList.exportExcel();
            },
            // 点击特殊列 查看档案详情
            viewDetail(id,row) {
                const self = this;
                self.$router.push({path: '/recordManage/recordDetail', query: {id: id}});
            },
            // 点击列
            cellClick(row, column, cell, event) {
                const self = this;  
                const operate =  event.target.getAttribute('data-operate');
                if(column.property === 'person_name') {
                    self[operate] && self[operate](row.person_id, row);
                }
            },
            // 统计人数
            selectBasePerson(data) {
                const self = this;
                // 传参刷新表格
                if(data){
                    const postData = {
                        customParam: {
                            status_type: data && data.value
                        }
                    };
                    self.$refs.tableDataList.getTableData(postData);
                }
            },
            /**
             * 合并列
             * row  当前行
             * column  当前列
             * rowIndex  当前行号
             * columnIndex 当前列号
             * 返回一个包含两个元素的数组，第一个元素代表rowspan，第二个元素代表colspan
             */
            spanMethod({row, column, rowIndex, columnIndex}) {
                if(column.property === 'person_name' || column.property === 'org_id' || column.property === 'emp_code'){
                    if(!this.data[rowIndex]){
                        this.data.push({row, column, rowIndex, columnIndex})
                        if(!this.columnData[row.person_id]){
                            this.columnData[row.person_id] = {
                                'rowIndex':rowIndex,
                                'number':1
                            }
                        }else{
                            this.columnData[row.person_id].number++;
                        }
                    }else{
                        let keysArr = Object.keys(this.columnData);
                        for(let i = 0;i < keysArr.length;i++){
                            if(i < keysArr.length -1){
                                if(rowIndex === this.columnData[row.person_id].rowIndex){
                                    return [this.columnData[row.person_id].number,1];
                                }
                            }else{
                                if(rowIndex === this.columnData[row.person_id].rowIndex){
                                    return [this.columnData[row.person_id].number,1];
                                }else{
                                    return [0,0];
                                }
                            }
                        }
                    }                 
                }
            }
        },
    }
</script>

<style lang="scss">
    #pay_record_manage_index{
        position: relative;
        & > .status{
            position: absolute;
            z-index:7;
            left: 310px;
            top: 43px;
        }
    }
</style>
<template>
    <div :class="prefixCls">
        <table-data-list class="hr_pay_table_list" ref="tableDataList" :infoSetId="infoSetId" :isFirstAutoGetData="isFirstAutoGetData"   :iOperateWidth=150 :getOperateHtml="getOperateHtml" @on-click-operate = "onClickOperate" @after-get-table-column="init">
            <div slot="page-top-right">
                <div :class="prefixCls+'-close'" title="关闭" @click="colseFn">
                    <Icon type="close-round"></Icon>
                </div>
            </div>
        </table-data-list>
        <make-manage :showStatus.asyc="showStatus" :status="status" :row="row" @changeVal="myVal"></make-manage>
    </div>
</template>
<style lang="scss" rel="stylesheet/scss">
    $prefixCls : pay-pro-manage;//样式前缀名
    .#{$prefixCls}{
        .#{$prefixCls}-close{
            cursor: pointer;
            margin-right: 20px;
            margin-top: 5px;
        }
    }
    .keyNameColor{
        color:#F18950
    }
</style>
<script type="text/babel">
    const prefixCls = "pay-pro-manage";
    const infoSetId = "pay_rule_item_manage";  //页面信息集ID
    import tableDataList from "commonVueLib/tableDataList/index";
    import formatTableData from 'utils/formatTableData'
    import makeManage from "src/pages/management/projectManage/children/makeManage.vue";

    export default {
        name:infoSetId,
        data() {
            let t = this;
            return {
                infoSetId:infoSetId,
                prefixCls:prefixCls,//class或id前缀
                showStatus:false,
                row:{},//对象
                status:"edit",//状态
                isFirstAutoGetData:false,//是否默认请求表格数据
            }
        },
        components:{
            tableDataList,
            formatTableData,
            makeManage
        },
        mounted(){
            const self = this;
            //重写方法
            // 列表表头格式化
            // self.$refs.tableDataList.formatTableData = self.formatTableData
            self.$refs.tableDataList.formatTableData = function(arr) {
                const self = this;
                return formatTableData.formatTableData(self, arr, "");
            }
        },
        created() {
            var t = this;
            // 显示头部
            gMain.showPayHead(true);
        },
        methods:{
            /*获取表格数据*/
            init:function () {
                var t = this;
                var oData = {
                    customParam:{item_type:t.$route.params.codeId}
                }
                t.$refs.tableDataList.getTableData(oData);

            },

            /**
             * 操作列
             * scope是当前行的各种数据
             * 操作列有删除 通过这个$event来判断($event.target判断点击的是哪个按钮)
             */
            onClickOperate($event,scope){
                const self = this;
                const operate =  $event.target.getAttribute('data-operate');
                self[operate] && self[operate](scope.row.item_name, scope.row);

            },
            // 操作列的数据
           getOperateHtml(scope){
                let currentOperate;
                currentOperate = [
                    {
                        name: '修改',
                        operate: 'edit'
                    },
                    {
                        name: '删除',
                        operate: 'delete'
                    }
                ];
                let operateStr = '';
                currentOperate.map(item => {
                    operateStr += `<span class='operateBtn' style='margin-left: 10px;cursor:pointer;color:#2D8CF0;vertical-align:middle' data-operate="${item.operate}">${item.name}</span>`
                })

                return `<div class='operateRow' style='white-space: nowrap'>${operateStr}</div>`
           },
            /**
             * 改变显示的值
             *
             */
           myVal(val){
               let t = this;
               t.showStatus = val;
           },
            /**
             * 关闭回到排序首页
             */
           colseFn(){
                let t = this;
                t.$router.push("/management/sort");
           },
           edit(name,row) {
               let t = this;
               t.showStatus = true;
               t.row = row;
           },
           delete(name,row) {
              let t = this;
               let oData = {
                   infoSetId: t.infoSetId,
                   uuidLists: [row.uuid]
               }
               t.$Modal.confirm({
                   title: '删除提示',
                   content: '<p>你确定要删除<span class="keyNameColor">【'+name+'】</span>吗？</p>',
                   loading: true,
                   onOk: function(){
                       this.buttonLoading = false;
                       t.$daydao.$ajax({
                           url: gMain.apiBasePath+"route/"+t.infoSetId+"/del.do"
                           ,type:"POST"
                           ,data:JSON.stringify(oData)
                           ,success: function (data) {
                               if(data.result == "true") {
                                   t.$Message.success('删除成功!');
                                   t.$Modal.remove();
                                   t.$refs.tableDataList.getTableData();
                               }
                           }
                       });

                   }
               });
           },
        }
    }
</script>

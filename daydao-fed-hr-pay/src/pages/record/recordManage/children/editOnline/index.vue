<template>
    <div id="pay_record_edit_online">
        <div class="eidt_online_title">
            <div class="back" @click="back">
                <Icon type="close-round"></Icon>
            </div>
            <div class="save_form" @click="saveClick">
                <Button type="primary" size="small" :loading="saveLoading">保存</Button>
            </div>
            <h1>完善信息</h1>
        </div>
        <div class="edit_online_form">
            <table-list
                ref='tableData'
                
                :tableColumnData="tableColumns"
                :tableData="tableData">
            </table-list>
                <!-- @onChangePage="changePage" 
                :pageSize="pageSize"-->
            <div class="pay_record_spin_container">
                <Spin size="large" fix v-if="spinShow" :background="'rgba(255, 255, 255, 0.9)'" :zIndex="10">
                    <slot>正在为您准备数据...</slot>
                </Spin>
            </div>
            
        </div>

        <!--无数据的时候-->
        <div class="pay_record_edit_online_nodata" v-if="isShowBg">
            <!--数据加载完成并且无数据才显示“暂无内容图片”-->
            <div class="no_data">

            </div>
            <div class="no_data_text">
                暂无内容
            </div>
        </div>
        
    </div>
</template>

<script>
    const infoSetId = "pay_persons_online_edit";

    //引入表格组件
    import tableList from 'commonVueLib/tableList/index.js'
    import {daydaoDropSelect} from 'commonVueLib/daydaoDropSelect/index';
    export default {
        components: {
            tableList
        },
        props: {

        },
        data(){
            return {
                infoSetId: infoSetId,
                // pageSize: 100,
                // oQueryData:{"pageBean":{"pageNo":"1","pageSize":500}},
                // vm: {},             //点击编辑时的vue实例
                tableColumns:[],      //表头数据
                tableData: {},       //表格数据
                haveEditData: [],   //存放已编辑的数据用作传参
                selectList: {      //下拉框数据
                    // bankListData: [] 
                },
                isShowBg: false,         //是否显示空白页
                spinShow: true,         //是否关闭遮罩
                saveLoading: false,    //保存按钮遮罩
                // hasError: false,      //是否有校验不通过的编辑项
                hasError: [],
                isDatePass: false    //验证开始周期是否在结束周期前
            }
        },
        created(){      
            var t = this;
            // 显示头部
            gMain.showPayHead(false);
            t.getTableColumn();
        },
        mounted(){
            var t = this;
            $(document).on("click.closeForm",function (event) {
                if(!$(event.target).closest('.data-item').length){
                    t.closeOtherForm('');
                }
            });
            // 隐藏列表分页与筛选表头
            setTimeout(function() {
                const dom = t.$refs.tableData.$el;
                dom.querySelector('.page_table_pager').style.display = 'none';
                dom.querySelector('.page_table_hide_column').style.display = 'none';
            }, 100);

            // 居中显示表格加载中遮罩
            let spinHeight = null;
            spinHeight = $(window).height() - 132 - 30;
            spinHeight += 'px';
            $(".pay_record_spin_container").css({height: spinHeight});
        },
        computed:{
            /* recordTableColumn(){  //表头
                return this.$store.getters.recordTableColumn;
            },
            recordTableData(){    //表格数据
                return this.$store.getters.recordTableData.maps;
            }, */
        },
        /**
         * 组件销毁之前
         * */
        beforeDestroy() {
            var t = this;
            $(document).off("click.closeForm");
        },
        methods:{
            back() {
                this.$router.push({path:'/pay_persons_list'});
            },
            getTableColumn() {
                const t = this;
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + `route/${t.infoSetId}/getTableColumn.do`,
                    data:JSON.stringify({infoSetId: t.infoSetId}),
                    success:function (data) {
                        if(data.result == "true"){
                            t.tableColumns = data.columnEdit || {};
                            t.tableColumns = t.formatData(t.tableColumns);
                            t.getTableData();
                            // 当没有点击下拉框时，修改其他保存时获取不到id
                            t.tableColumns.find(function(item){
                                //如果是下拉树组件
                                if(item.cellType == 'treeSelect'){
                                    t.$daydao.$ajax({
                                        url:gMain.apiBasePath + 'route/getKeyValueData.do'
                                        ,data:JSON.stringify(item.keyValueBean)
                                        ,success:function (data) {
                                            if(data.result == 'true'){
                                                /* switch (item.name){
                                                    case "bank" :
                                                         t.selectList.bankListData = data.beans;
                                                        break;     
                                                    default:
                                                        break;
                                                } */
                                                // 以name作为下拉框数据属性名
                                                t.selectList[item.name] = data.beans;
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    }
                });
            },
            getTableData(data) {
                var t = this;
                data = data || {};
                // 获取存在本地的组织id与人员id作为传参
                const storage = window.sessionStorage;
                let payRecordEditOnline = JSON.parse(storage.getItem("payRecordEditOnline"));
                // 没有缓存时请求全部数据
                if(!payRecordEditOnline){
                    payRecordEditOnline = {
                        orgIds: '',
                        personIds: ''
                    }
                }
                const postData = {
                    customParam: payRecordEditOnline,
                    pageBean: {
                        pageNo:"1",
                        pageSize:500    //超过500条不做显示
                    }
                }
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + `route/${t.infoSetId}/getAll.do`
                    ,beforeSend:function () {
                        t.spinShow = true;
                    }
                    ,complete:function () {
                        t.spinShow = false;
                        $("body").find(".pay_record_spin_container").remove();
                    }
                    ,data:JSON.stringify(postData)                    
                    ,success:function (data) {
                        if(data.result == "true"){
                            t.tableData = data || {};
                            if(t.tableData.maps && t.tableData.maps.length){
                                t.isShowBg = false;
                            }else{
                                t.isShowBg = true;
                            }
                            $("body").scrollTop(0); //查询完数据滚动条滚动到顶部
                        }
                    }
                });
            },
            /**
             * 翻页传数据
             * */
            /* changePage:function (opts) {
		        var t = this;
	            t.pageSize = opts.pageSize;
	            $.extend(t.oQueryData,{pageBean:opts});

	            //这里延迟调用获取数据请求，因为改变pageSize会同时触发onChangePageNo事件，这里会被再次回调，再次回调的平均时间为0.3ms，超过这个延迟时间即可
	            clearTimeout(t.timerGetTableData);
                t.timerGetTableData = setTimeout(function () {
                    t.getTableData();
                },10)
            }, */
            formatData(arr){
                var t = this;
                arr.forEach(function (item) {
                    
                    if(item.key =='_indexNumber'){
                        item.render = function (h,params) {
                            // return t.renderIndexRow(h,params)
                        };
                    }else{
                        item.render = function (h,params) {
                            var cellType = t.tableColumns.find(function (item2) {return item2.name == params.column.property;}).cellType; //表单类型
                            var regExpress = t.tableColumns.find(function (item2) {return item2.name == params.column.property;}).regExpress; //表单正则
                            var keyValueBean = t.tableColumns.find(function (item2) {return item2.name == params.column.property;}).keyValueBean; //表单下拉框查询条件
                            var isEditShow = t.tableColumns.find(function (item2) {return item2.name == params.column.property;}).isEditShow;//是否可编辑

                            const itemProperty = params.column;   //列
                            const selectList = t.selectList;      //下拉框数据

                            var arrContent = [h('div',{
                                attrs: {
                                    class:'data-show'
                                }
                                ,style:{
                                    height: '24px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }
                                ,on:{
                                    click:(event) =>{
                                        // 是否为可编辑项
                                        if(isEditShow){
                                            var tempId = 'data-' + (new Date()).getTime();                                            
                                            var $target = $(event.target);
                                            // 编辑时不显示错误，去除error_border类名
                                            $target[0].parentElement.className = $target[0].parentElement.className.replace(/ error_border/,'');
                                            $target.hide();
                                            params.row[params.column.property] = params.row[params.column.property] || '';//当返回为空时会渲染为undefined
                                            
                                            //编辑容器
                                            var startHtml = '<div class="data-editing" data-id="'+tempId+'" id="'+tempId+'" data-title="'+params.column.label+'" data-index="'+params.index+'" data-name="'+params.column.property+'" data-regexpress="'+regExpress+'" data-celltype="'+cellType+'">';
                                            var endHtml = '</div>';

                                            //组装控件
                                            switch (cellType){
                                                case 'date_yyyy_MM': //如果是日历组件
                                                    $target.parent().append(startHtml + '<date-picker type="month" :editable="false" placeholder="选择日期" style="width: 100%;min-width:100px;" value="'+params.row[params.column.property]+'"></date-picker>' + endHtml);
                                                    break;
                                                case 'datetime':
                                                    $target.parent().append(startHtml + '<date-picker type="datetime" placeholder="选择日期时间" style="width: 100%;min-width:100px;" value="'+params.row[params.column.property]+'"></date-picker>' + endHtml);
                                                    break;
                                                case 'treeSelect': //如果是树组件
                                                    $target.parent().append(startHtml + '<daydao-drop-select name="testname" :data="treeData" :show-val="treeShowVal" ref="treeSelect" width="100%"  :max-height="180"></daydao-drop-select>' + endHtml);
                                                    break;
                                                case 'treeAdviceSelect': //如果是可以自定义内容的树组件
                                                    $target.parent().append(startHtml + '<daydao-drop-select name="testname" :data="treeData" :show-val="treeShowVal" ref="treeSelect" width="100%" :max-height="180" :is-allow-other="true"></daydao-drop-select>' + endHtml);
                                                    break;
                                                default:  //默认的
                                                    $target.parent().append(startHtml + '<i-input class="data-editing-input" value="'+params.row[params.column.property]+'" style="width: 100%;min-width:100px;"></i-input>' + endHtml);
                                            }

                                            new Vue({
                                                el:'#'+tempId
                                                ,data:{
                                                    treeData:[]
                                                    ,treeShowVal:params.row[params.column.property] || ''
                                                }
                                                ,mounted(){
                                                    var t = this;
                                                    //获取下拉框数据
                                                    /* switch (itemProperty.property){
                                                        case "bank" :
                                                            t.treeData = selectList.bankListData;
                                                            break;
                                                        default:
                                                            break;
                                                    } */
                                                    // 获取对应的下拉框数据
                                                    t.treeData = selectList[itemProperty.property];
                                                }
                                                ,components:{
                                                    daydaoDropSelect
                                                },
                                                methods: {
                                                    
                                                }
                                            });
                                            t.closeOtherForm(tempId);
                                            event.stopPropagation();
                                        }else{
                                            t.$Message.info('该项不可编辑');
                                        }
                                        
                                    }
                                }
                            },(params.row[params.column.property]))];

                            return h('div',{
                                attrs:{
                                    class:'data-item'
                                },
                                on:{
                                    mouseenter:function (event) {
                                        var $current = $(event.currentTarget);
                                        // 判断是否包含error_border类名,是则需要弹出错误提示
                                        if($current[0].className.indexOf(" error_border") >= 0){
                                            var sText = '格式不正确';
                                            var iLeft = $current.offset().left;
                                            var iTop = $current.offset().top;
                                            var sStyle = `left:${iLeft - 20}px;
                                                          top:${iTop- 35}px;
                                                          position:absolute;
                                                          background: rgba(0,0,0,.7);
                                                          box-shadow: 0 0 5px 0 rgba(0,0,0,.18);
                                                          border-radius: 2px;
                                                          font-size: 12px;
                                                          color: #fff;
                                                          padding: 5px 10px;
                                                          max-width: 115px;
                                                          z-index: 9;`;

                                            if($("body").find(".pay-editonline-data-error-msg").length){
                                                $("body").find(".pay-editonline-data-error-msg").remove();
                                            }
                                            $("body").append(`<span class="${'pay-editonline-data-error-msg'}" style="${sStyle}">${sText}</span>`);
                                        }
                                    }
                                    ,mouseleave:function () {
                                        if($("body").find(".pay-editonline-data-error-msg").length){
                                            $("body").find(".pay-editonline-data-error-msg").remove();
                                        }
                                    }
                                }
                            },arrContent);
                        }
                    }
                });
                return arr;
            },
             /**
             * 关闭其他的表单
             * */
            closeOtherForm(tempId){
                var t = this;
                $(t.$el).find('.data-editing').each(function () {
                    if($(this).attr('data-id') != tempId){
                        $(this).parent().find('.data-show').show();

                        var cellType = $(this).attr('data-celltype');  //表单类型
                        var newVal = $(this).find(".ivu-input").val();
                        var newValId =  $(this).find('[name="testname"]').val();

                        if(cellType == 'treeSelect'){
                            if($(this).find(".ivu-input").attr("data-is-value-ready") != 'yes'){
                                newVal = $(this).parent().find(".data-show").text();
                                // newValId = $(this).find('[name="testname"]').attr('value');
                            }
                        }
                        //更新结果集
                        t.updateJsonData({
                             name:$(this).attr('data-name')
                             , index:$(this).attr('data-index')
                             , newVal:newVal
                             , newValId:newValId
                             , $el:$(this).parent()
                             , regExpress:$(this).attr('data-regexpress')  //正则
                             , cellType:cellType  //表单类型
                             , title:$(this).attr('data-title')  //字段中文名称
                        });
                        $(this).remove();
                    }
                });
            },
             /**
             * 更新json数据
             * */
            updateJsonData(opts){
                var t = this;
                opts = opts || {};
                var reg = new RegExp(opts.regExpress);
                // 以name作为筛选条件
                switch (opts.name){
                    case 'account1':   //银行账号,判断正则是否验证通过
                        if(!reg.test(opts.newVal) && opts.newVal){
                            opts.$el[0].className += ' error_border';
                            t.hasError[parseInt(opts.index)] = true;
                            // t.hasError = true;
                        }else{
                            t.hasError[opts.index] = '';
                            // t.hasError = false;
                        }
                        break;
                    default:
                        //

                }
                //更改表格数据后需要在后面调用getTableData方法重新渲染
                // 当更改的数据跟原有数据相同时说明没有更改，不需做后续操作，不同时则需覆盖
                if(t.tableData.maps[opts.index][opts.name] !== opts.newVal){
                    t.tableData.maps[opts.index][opts.name] = opts.newVal;
                    t.tableData.maps[opts.index].newValId = opts.newValId;
                }else{
                    return false;
                }
                // 判断haveEditData是否包含了之前已存储的数据，有则直接覆盖，没有则直接push
                
                // t.compareDate(t.tableData.maps[opts.index].beginPeriod, t.tableData.maps[opts.index].endPeriod, opts);
                if(t.haveEditData && t.haveEditData.length){
                    t.haveEditData.find(function(item){
                        if(item.uuid === t.tableData.maps[opts.index].uuid){
                            item = t.tableData.maps[opts.index];       //有
                        }else{
                            t.haveEditData.push(t.tableData.maps[opts.index]);        //没有
                        }
                    })
                }else{
                    t.haveEditData.push(t.tableData.maps[opts.index]);   //为空时直接push
                }
                t.$refs.tableData.getTableData(t.tableData);   //tableList组件内watch时重新渲染表格
            },

            // 点击保存
            saveClick() {
                const t = this;
                t.saveLoading = true;
                // 点击保存事件需在关闭表单事件后执行
                setTimeout(function(){
                    // 当hasError数组中含有true值时说明有检验失败的数据
                    const hasError = $.inArray(true, t.hasError)  
                    if(t.haveEditData.length && hasError === -1){
                        t.saveReq();
                    }else if(t.haveEditData.length && hasError >= 0){
                        t.saveLoading = false;
                        t.$Message.error('校验失败');
                        // t.hasError = true;
                    }else{
                        t.saveLoading = false;
                        t.$Message.info('没有数据更改');
                    }
                },300)
            },
            // 保存请求接口
            saveReq() {
                const t = this;
                // 将已编辑的数据中下拉框数据转为id值
                t.haveEditData.find(function(dataItem){ 
                    // 存在结束周期小于开始周期要提示错误
                    if(t.compareDate(dataItem.beginPeriod, dataItem.endPeriod)){
                        t.$Message.error(dataItem.person_name +'的“'+ dataItem.rule_id+'”规则计薪开始周期不能大于计薪结束周期');
                        t.isDatePass = false;
                        t.saveLoading = false;
                        return true;
                    }else{
                        t.isDatePass = true;
                    }
                })
                
                if(t.isDatePass){
                    /* t.haveEditData.find(function(dataItem){ 
                        t.selectList.bankListData.find(function(listItem){
                            if(dataItem.bank === listItem.name){
                                dataItem.bank = listItem.id;
                            }
                        })
                    }) */
                    // 下拉框选中数据的id值需要在保存时替换，否则会影响重新渲染表格的操作
                    t.haveEditData.forEach(function(dataItem){
                        dataItem.bank = dataItem.newValId
                    })
                    const postData = {
                        payPersonBeanList: t.haveEditData
                    }
                    t.$daydao.$ajax({
                        url: gMain.apiBasePath + 'payPerson/payPersonOnlineEdit.do',
                        data:JSON.stringify(postData),
                        type: 'POST',
                        success:function (data) {
                            if(data.result == "true"){
                                t.$Message.success(data.resultDesc);
                                t.saveLoading = false;
                                /*// 之前为传参银行id改变了haveEditData的值，使tableData也成了id值渲染错误
                                 t.haveEditData.find(function(dataItem){ 
                                    t.selectList.bankListData.find(function(listItem){
                                        if(dataItem.bank === listItem.id){
                                            dataItem.bank = listItem.name;
                                        }
                                    })
                                }) */
                                t.haveEditData = [];
                            }
                        }
                    });
                }
                
            },
              // 比较时间
            compareDate(d1, d2) {
                return ((new Date(d1.replace(/-/g,"\/"))) > (new Date(d2.replace(/-/g,"\/"))));
            }
        },
        watch:{
            /**
             * 传过来的查询数据
             * */
            /* queryData(n, o){
                var t = this;
                $.extend(t.oQueryData,n);
            } */
        }
    }
</script>


<style lang="scss">
    #pay_record_edit_online{
        .error_border{
            border: 1px solid red;
            border-radius: 2px;
        }
        .el-table tr{
            height: 50px;
        }
        .el-table__body-wrapper{
            // min-height: 200px;
        }
        & > .eidt_online_title{
            background: #f5f7f9;
            line-height: 46px;
            height: 46px;
            text-align: center;
            // position: relative;
            position: fixed;
            top:0;
            left:0;
            width: 100%;
            z-index: 9;
            & > .back{
                    position: absolute;
                    top: 0;
                    right: 1.5%;
                    cursor: pointer;
                    font-size: 14px;
                    line-height: 46px;
                    height: 46px;
                }
                .save_form{
                    position: absolute;
                    top: 0;
                    right: 5%;
                }
                h1{
                    font-size: 16px;
                    font-weight: 700;
                    color: #657180;
                    display: inline;
                }
            }
            .edit_online_form{
                // margin-top: 20px;
                padding-top: 66px;
                & > .pay_record-spin-container{
                        display: inline-block;
                        width: 100%;
                        position: relative;
                    }
            }
            .el-table .cell{
                overflow: inherit; 
            }

            .pay_record_edit_online_nodata{
                width: 400px;
                height: 226px;
                position: absolute;
                left: 50%;
                top: 222px;
                margin-left: -200px;
                .no_data{
                    background: url('../../../../../../daydao-fed-common-vuelib/src/commonImages/empty_no_data.png') no-repeat center center;                   
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
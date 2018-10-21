<template>
    <div :class="prefixCls">
        <my-loading  :isShow="loading" ref="loading"></my-loading>
        <div :class="prefixCls+'-title'">
            薪酬项目管理
        </div>
        <div :class="prefixCls+'-btn'">
            <template v-if="!isSort">
                <Button type="primary" @click="addFn" style="margin-right: 10px;">新增</Button><Button @click="editFn">排序</Button>
            </template>
            <template v-else>
                <Button type="primary" @click="saveSortFn" style="margin-right: 10px;">保存</Button><Button @click="isSort = !isSort">取消</Button>
            </template>
        </div>
        <draggable  class="draggableLib" v-model="tags"  @update="datadragEnd" :options="dragOptions" >
            <transition-group class="list-group" type="transition" :name="'flip-list'">
                <li v-for="(item, index) in tags" :key="index" class="detail-pay-project-piece">
                    <div class="show-title" @click="showFn(item.uuid)">
                        <i class="iconfont_daydao_common icon_sort" v-if="isSort">&#xe625;</i>
                        <i class="iconfont_daydao_common arrow_right" v-if="currentFn(item.uuid)">&#xe6a9;</i>
                        <i class="iconfont_daydao_common arrow_right" v-else>&#xe6aa;</i>
                        {{item.typeName}} （{{item.count}}）
                        <template v-if="!isSort&&uuidData[item.uuid] == false">
                            <Button type="text" @click.stop="setFn(item.uuid,item.itemList)" >批量修改</Button>
                        </template>
                        <template v-if="!isSort&&uuidData[item.uuid] == true">
                            <Button class="saveUuid" type="primary" size="small" @click.stop="saveUuidFn(item.uuid)">保存</Button><Button @click.stop="cancelUuidFn(item.uuid)" size="small" class="cancelUuid">取消</Button>
                        </template>
                        <div class="draging_hover"></div>
                    </div>
                    <div class="show-content" :class="'show-content-'+ item.uuid" v-if="item.itemList.length != 0">
                        <div class="show-content-left">
                            <span class="t-head">项目名称</span>
                            <span class="t-head">字段类型</span>
                            <span class="t-head">收入/支出</span>
                            <span class="t-head">是否计税项</span>
                            <span class="t-head">是否调薪项</span>
                            <span class="t-head">是否编辑项</span>
                            <span class="t-head">是否继承项</span>
                            <span class="t-head">小数位数</span>
                            <span class="t-head">备注</span>
                        </div>
                        <draggable  class="draggableLib-item" v-model="item.itemList" @update="datadragEndItem"  :options="dragOptionsItem">
                            <transition-group class="list-group-item" type="transition" :name="'flip-list-item'">
                                <div class="show-content-right" v-for="(obj, $index) in item.itemList" :key="$index" :parent-id="item.uuid">
                                    <div :class="'show-wrap-'+obj.uuid" class="show-wrap" v-if="editData[obj.uuid].showEdit === false">
                                        <div class="wrap-1">
                                            <span class="t-body first-title" :title="obj.itemName"><i class="iconfont_daydao_common icon_sort_item" v-if="isSort">&#xe625;</i><b v-if="obj.isSystem == 1" class="set-btn">内置</b> {{obj.itemName}}</span>
                                            <span class="t-body">{{obj.fieldTypeTxt}}</span>
                                            <span class="t-body">{{obj.categoryTxt}}</span>
                                            <span class="t-body">{{obj.isTaxTxt}}</span>
                                            <span class="t-body">{{obj.isAdjustableTxt}}</span>
                                            <span class="t-body">{{obj.isEditedTxt}}</span>
                                            <span class="t-body">{{obj.isExtendsTxt}}</span>
                                            <span class="t-body">{{obj.decLengthTxt}}</span>
                                            <span class="t-body last-child" :title="obj.remark">{{obj.remark}}</span>
                                            <div class="draging_hover_item"></div>
                                        </div>
                                        <div class="wrap-2" v-if="!isSort&&uuidData[item.uuid] == false">
                                            <a @click="editItemFn(obj.uuid,obj)" class="a-btn"><Icon type="compose" size="20" title="修改"></Icon></a>
                                            <a @click="deleteFn(obj.itemName,obj.uuid)" class="a-btn"><Icon type="trash-a" size="20" title="删除"></Icon></a>
                                        </div>
                                    </div>
                                   <div :class="'edit-wrap-'+obj.uuid" class="edit-wrap" v-if="editData[obj.uuid].showEdit === true">
                                        <div class="wrap-1">
                                            <span class="t-body">
                                                <i class="iconfont_daydao_common icon_sort_item" v-if="isSort">&#xe625;</i>
                                                <Input  v-model="editData[obj.uuid].itemNameTxt" placeholder="项目名称" style="width: 100%" :maxlength="maxlength1"></Input>
                                            </span>
                                            <span class="t-body">{{obj.fieldTypeTxt}}</span>
                                            <span class="t-body">
                                                <Select v-model="editData[obj.uuid].category"  :clearable="clearAble">
                                                    <Option v-for="item in arrSelectData['ct_pay_761']" :value="item.id" :key="item.id">{{item.name}}</Option>
                                                </Select>
                                            </span>
                                            <span class="t-body">
                                                <Select  v-model="editData[obj.uuid].isTax" :clearable="clearAble">
                                                    <Option v-for="item in arrSelectData['ct_pay_762']" :value="item.id" :key="item.id">{{item.name}}</Option>
                                                </Select>
                                            </span>
                                            <span class="t-body">
                                                <Select  v-model="editData[obj.uuid].isAdjustable" :clearable="clearAble">
                                                    <Option v-for="item in arrSelectData['ct_pay_763']" :value="item.id" :key="item.id">{{item.name}}</Option>
                                                </Select>
                                            </span>
                                            <span class="t-body">
                                                <Select  v-model="editData[obj.uuid].isEdited" :clearable="clearAble">
                                                    <Option v-for="item in arrSelectData['ct_pay_766']" :value="item.id" :key="item.id">{{item.name}}</Option>
                                                </Select>
                                            </span>
                                            <span class="t-body">
                                                <Select  v-model="editData[obj.uuid].isExtends" :clearable="clearAble">
                                                    <Option v-for="item in arrSelectData['ct_pay_764']" :value="item.id" :key="item.id">{{item.name}}</Option>
                                                </Select>
                                            </span>
                                            <span class="t-body">
                                                <Select  v-model="editData[obj.uuid].decLength" :clearable="clearAble">
                                                    <Option v-for="item in arrSelectData['ct_pay_765']" :value="item.id" :key="item.id">{{item.name}}</Option>
                                                </Select>
                                            </span>
                                            <span class="t-body">
                                                <Input  v-model="editData[obj.uuid].remarkTxt" placeholder="备注" style="width: 100%" :maxlength="maxlength2"></Input>
                                            </span>
                                            <div class="draging_hover_item"></div>
                                        </div>
                                        <div class="wrap-2" v-if="!isSort&&uuidData[item.uuid] == false">
                                            <a title="保存" @click="saveItemFn(obj.uuid)" class="a-btn"><Icon type="checkmark-round" size="20"></Icon></a>
                                            <a title="取消" @click="cancelItemFn(obj.uuid)" class="a-btn"><Icon type="refresh" size="20"></Icon></a>
                                        </div>
                                    </div>
                                    <div class="clear-both"></div>
                                </div>
                            </transition-group>
                        </draggable>
                        <div class="clear-both"></div>
                    </div>
                    <div class="show-content" :class="'show-content-'+ item.uuid" v-else>
                        <div class="no-data"></div>
                        <p class="desc">暂无内容</p>
                    </div>
                </li>
            </transition-group>
        </draggable>
        <make-manage :showStatus.asyc="showStatus" :status="status"  @changeVal="myVal"></make-manage>
    </div>
</template>
<style lang="scss" rel="stylesheet/scss">
    $prefixCls : pay-pro-sort;//样式前缀名
    .#{$prefixCls}{
        min-width: 1100px;
        padding: 20px 30px;
        box-sizing: border-box;
        .#{$prefixCls}-title{
            font-size: 16px;
            color: #657180;
            font-weight: 600;
            overflow: hidden;
            margin-bottom: 5px;
        }
        .#{$prefixCls}-btn{
            overflow: hidden;
            margin-bottom: 10px;
            text-align: right;
        }
        .set-btn{
            font-size: 12px;
            border: 1px solid #9593ec;
            color:#9593ec;
            white-space: nowrap;
            position: relative;
            z-index: 3;
            border-radius:2px;
            padding:2px;
            font-weight: normal;
        }
        .page-slide{
            top:0 !important;
            height: 100% !important;
        }
        .clear-both{
            clear: both
        }
        .draggableLib{
            -webkit-user-select:none;
            -moz-user-select:none;
            -ms-user-select:none;
            user-select:none;
            .saveUuid{
                background: #F18950;
                border-radius: 2px;
                width: 52px;
                height: 24px !important;
                border: 1px solid #F18950;
                top:10px;
                right: 72px !important;
                span{
                    font-size: 12px !important;
                    color: #fff !important;
                }
            }
            .cancelUuid{
                background: #FFF;
                border-radius: 2px;
                width: 52px;
                height: 24px !important;
                border: 1px solid #C4CEDA;
                top:10px;
                right: 10px !important;
                span{
                    font-size: 12px !important;
                    color: #657180 !important;
                }
            }
            .list-group{
                .detail-pay-project-piece{
                    margin-bottom: 10px;
                    .show-title {
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
                        border: 1px dashed #fff;
                        &:hover{
                            border: 1px dashed #9CA8B6;
                        }
                    }
                    .show-content {
                        display: none;
                        background: #FFF;
                        padding: 10px;
                        width: 100%;
                        .no-data{
                            width: 400px; height: 176px; margin: 20px auto 30px; background: url("../../../assets/images/no_content.png") no-repeat;
                        }
                        .content {
                            position: relative;
                        }
                        .desc{
                            font-size: 14px; text-align:  center;color: #657180;
                        }
                        .show-content-left{
                            float: left;
                            width: calc(100% - 85px);
                            background: #F5F7F9;
                            span.t-head{
                                float: left;
                                width: 11.1111%;
                                height: 38px;
                                line-height: 38px;
                                color: #657180;
                                font-size: 14px;
                                text-indent: 5px;
                                font-weight:600;
                                &:first-child{
                                    text-indent: 25px;
                                }
                            }
                        }
                        .show-content-right{
                            width: 100%;
                            position: relative;
                            .edit-wrap{
                                /*display: none;*/
                            }
                            .wrap-1{
                                width: calc(100% - 85px);
                                float: left;
                                margin-top: 10px;
                                border: 1px dashed #fff;
                                box-sizing: border-box;
                                position: relative;
                                span.t-body{
                                    color: #657180;
                                    font-size: 14px;
                                    line-height: 40px;
                                    width: 11.1111%;
                                    float: left;
                                    padding: 0 5px;
                                    position: relative;
                                    &:first-child{
                                        padding: 0 0 0 25px;
                                    }
                                    &.first-title{
                                        white-space: nowrap;
                                        text-overflow: ellipsis;
                                        overflow: hidden;
                                    }
                                    &.last-child{
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                        height: 40px;
                                        white-space: nowrap;
                                    }
                                    i.icon_sort_item{
                                        position: absolute;
                                        left: 10px;
                                        top:0;
                                        cursor: move;
                                    }
                                }
                            }
                            .wrap-2{
                                width: 85px;
                                float: right;
                                pointer-events: none;
                                text-align: center;
                                padding-top: 20px;
                                box-sizing: border-box;
                                a{
                                    color: #FFF;
                                    padding: 5px;
                                }
                            }
                            &:hover{
                                .wrap-1 {
                                    border: 1px solid #E3E8EE;
                                    cursor: Default;
                                }
                                .wrap-2{
                                    pointer-events: auto;
                                    a{
                                        color: #848F9D;
                                        transition: 0.5s;
                                        &:hover{
                                            color:#657180;
                                        }
                                    }
                                }
                            }


                        }
                        .sortable-chosen-item{
                            .draging_hover_item{
                                display: block;
                            }
                        }
                        .draging_hover_item{
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            left: 0;
                            top:0;
                            background: rgba(255,248,197,0.50);
                            display: none;
                        }
                    }

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
                    }
                    button{
                        position: absolute;
                        right: 0;
                        height: 100%;
                        span{
                            color: #2D8CF0;
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
                }
                .sortable-drag,.sortable-chosen{
                    .draging_hover{
                        display: block;
                    }
                    @extend .detail-pay-project-piece;
                }
            }
        }
    }
    .keyNameColor{
        color:#F18950
    }
</style>
<script type="text/babel">
    const prefixCls = "pay-pro-sort";
    const infoSetId = "pay_rule_item_manage"; //页面信息集ID
    import draggable from 'vuedraggable';
    import makeManage from "src/pages/management/projectManage/children/makeManage.vue";
    import myLoading from 'src/components/loading/myLoading.vue'//遮罩

    export default {
        name:infoSetId,
        data() {
            let t = this;
            return {
                infoSetId:infoSetId,
                prefixCls:prefixCls,         //class或id前缀
                tags:[],
                oSort:{
                    itemTypeData:[],
                    itemData:[]
                },
                showStatus:false,            //又滑弹窗状态
                status:"add",                //状态
                arrItem:[{uuid:"1111",name:"基础工资"},{uuid:"2222",name:"绩效工资"}],
                currentUUid:[],//当前uuid
                arrTabData:["ct_pay_761","ct_pay_762","ct_pay_763","ct_pay_764","ct_pay_765","ct_pay_766"],
                                             //码表id集合 ct_750(项目分类)   ct_091(字段类型)  ct_pay_761(收入支出)  ct_pay_762(计税项) ct_pay_763(调薪项) ct_pay_764(继承项) ct_pay_765(小数位数) ct_pay_766(是否编辑项)
                arrSelectData:{
                    "ct_pay_761":[],
                    "ct_pay_762":[],
                    "ct_pay_763":[],
                    "ct_pay_764":[],
                    "ct_pay_765":[],
                    "ct_pay_766":[]
                },
                clearAble:false,             //是否可以清空规则下拉选中
                isSort:false,                //是否处于排序
                editData:{},                 //编辑的数据
                loading:false,               //遮罩层
                uuidData:{},                 //状态的数据
                uuidStatus:false,            //状态
                arrOrder:[],                 //起始父级排序
                arrItemOrder:[],             //起始子级排序
                maxlength1:30,               //项目名最大长度
                maxlength2:200               //备注最大长度
            }
        },
        components:{
            draggable
            ,makeManage
            ,myLoading
        },
        computed:{
            // lib
            dragOptions() {
                return {
                    group:{
                        name:'dragOptions1',
                        pull: false
                    },
                    animation: 200,
                    dragClass: "sortable-drag",
                    chosenClass: "sortable-chosen",
                    handle: ".icon_sort",
                }
            },
            dragOptionsItem(){
                return {
                    group:{
                        name:'dragOptions2',
                        pull: false
                    },
                    animation: 200,
                    dragClass: "sortable-drag-item",
                    chosenClass: "sortable-chosen-item",
                    handle: ".icon_sort_item",
                }
            }
        },
        mounted(){
            let t = this;

        },
        created() {
            let t = this;
            // 显示头部
            gMain.showPayHead(false);
            t.init();

        },
        methods:{
            /**
             * 初始化数据接口
             */
            init(){
                let t = this;
                t.loading = true;
                t.$daydao.$ajax({
                    url: gMain.apiBasePath+"route/"+t.infoSetId+"/getAll.do"
                    ,type:"POST"
                    ,data:JSON.stringify({})
                    ,success: function (data) {
                        if (data.result == "true") {
                            t.loading = false;
                            t.tags = data.ext;
                            t.tags = JSON.parse(JSON.stringify(t.tags));
                            let arrData = t.tags;
                            t.editData = {};
                            t.arrOrder = [];
                            t.arrItemOrder = [];
                            for(let i = 0;i<arrData.length;i++){
                                t.arrOrder.push(arrData[i]["typeOrder"])
                                if(t.uuidStatus == false) {
                                    t.uuidData[arrData[i]["uuid"]] = false;
                                }
                                let obj  = arrData[i]["itemList"];
                                for(let j = 0;j<obj.length;j++) {
                                    for(let val in obj[j]){
                                        obj[j][val] = obj[j][val] + "";
                                        if(val == "itemName"){
                                           obj[j]["itemNameTxt"] = obj[j][val];
                                        }
                                        if(val == "remark"){
                                            obj[j]["remarkTxt"] = obj[j][val];
                                        }
                                        obj[j]["showEdit"] = false;//新加字段状态
                                    }
                                    t.editData[obj[j].uuid] = obj[j];
                                    t.arrItemOrder.push(obj[j]["itemOrder"]);
                                }
                            }
                            t.editData = JSON.parse(JSON.stringify(t.editData));
                            t.uuidStatus = true;
                        }
                    }
                });

                /*t.requestFn();*/

            },
            /**
             * 拖动父级
             */
            datadragEnd(evt){
                let t = this;
                t.oSort["itemTypeData"] = [];
                for(let i = 0;i<t.tags.length;i++){
                    for(let j = 0;j<t.arrOrder.length;j++) {
                        if(i == j) {
                            let obj = {}
                            obj = {
                                uuid: t.tags[i].uuid,
                                code_order: t.arrOrder[j]
                            }
                            t.oSort["itemTypeData"].push(obj)
                        }
                    }

                }
                t.datadragEndItem();
                t.oSort = JSON.parse(JSON.stringify(t.oSort));
                $(".show-content").slideUp();
                t.currentUUid = [];
            },
            /**
             * 拖动子级
             */
            datadragEndItem(evt){
                let t = this;
                /*let sParentId = evt["item"]["attributes"]["parent-id"]["value"];*/
                t.oSort["itemData"] = [];
                t.oSort["itemTypeData"] = [];
                let arrData = t.tags;
                let k = 0;
                for(let i = 0;i<arrData.length;i++){
                    let objData  = arrData[i]["itemList"];
                    for(let j = 0;j<objData.length;j++) {
                        //子级排序
                        let objItem = {
                            "item_order": t.arrItemOrder[k],
                            "item_type": objData[j]["itemType"],
                            "uuid": objData[j]["uuid"]
                        }
                        t.oSort["itemData"].push(objItem);
                        k++
                    }

                    for(let j = 0;j<t.arrOrder.length;j++) {
                        if(i == j) {
                            let obj = {}
                            obj = {
                                uuid: arrData[i].uuid,
                                code_order: t.arrOrder[j]
                            }
                            t.oSort["itemTypeData"].push(obj)
                        }
                    }
                }

                t.oSort = JSON.parse(JSON.stringify(t.oSort));
            },
            /**
             * 保存排序
             */
            saveSortFn(){
                let t = this;
                let oData = {
                    "itemTypeData": t.oSort["itemTypeData"],
                    "itemData": t.oSort["itemData"]
                };
                t.loading = true;
                if(t.oSort["itemTypeData"].length == 0&&t.oSort["itemData"] == 0){
                    t.isSort = false;
                    t.loading = false;
                    t.$Message.success('无排序变化！');
                }else {
                    t.$daydao.$ajax({
                        url: gMain.apiBasePath + "manage_item/itemSort.do"
                        , type: "POST"
                        , data: JSON.stringify(oData)
                        , success: function (data) {
                            if (data.result == "true") {
                                t.isSort = false;
                                t.loading = false;
                                t.$Message.success('排序成功!');
                            }
                        }
                    });
                }
            },
           /**
             * 展示的项
             */
            currentFn(uuid){
                let t = this;
                //判断数组中是否含有某个特定元素
                if($.inArray(uuid,t.currentUUid) == -1) {
                    return false;
                }else{
                    return true;
                }
            },


            /**
             * 新增
             */
            addFn(){
                let t = this;
                t.showStatus = true;
            },
            /**
             * 排序
             */
            editFn(){
                let t = this;
                t.isSort = true;
                /*$(".edit-wrap").hide();
                $(".show-wrap").show();*/
                for(let val in t.editData){
                    t.editData[val]["showEdit"] = false;
                }
                for(let val in t.uuidData){
                    t.uuidData[val] = false;
                }
                t.editData = JSON.parse(JSON.stringify(t.editData));
            },
            /**
             * 批量修改
             */
            setFn(parentUuid,itemList){
                let t = this;
                t.requestFn();
                t.isSort = false;
                t.uuidData[parentUuid] = true;
                t.uuidData = JSON.parse(JSON.stringify(t.uuidData));
                let arrUuid = t.arrChildFn(parentUuid);
                $(".show-content-" + parentUuid).slideDown();
                for(let i =0;i<arrUuid.length;i++){
                    for(let j =0;j<itemList.length;j++){
                        if(arrUuid[i] == itemList[j]["uuid"]) {
                            t.editData[arrUuid[i]] = {
                                itemNameTxt: itemList[j]["itemName"],
                                itemType: itemList[j]["itemType"],
                                fieldType: itemList[j]["fieldType"],
                                category: itemList[j]["category"],
                                isTax: itemList[j]["isTax"],
                                isAdjustable: itemList[j]["isAdjustable"],
                                isEdited: itemList[j]["isEdited"],
                                isExtends: itemList[j]["isExtends"],
                                decLength: itemList[j]["decLength"],
                                remarkTxt: itemList[j]["remark"],
                                showEdit:true
                            }
                        }
                    }
                    /*$(".show-wrap-" + arrUuid[i]).hide();
                    $(".edit-wrap-" + arrUuid[i]).show();*/
                }
                t.editData = JSON.parse(JSON.stringify(t.editData));

            },
            /**
             * 批量修改取消
             */
            cancelUuidFn(parentUuid){
                let t = this;
                t.isSort = false;
                t.uuidData[parentUuid] = false;
                t.uuidData = JSON.parse(JSON.stringify(t.uuidData));
                let arrUuid = t.arrChildFn(parentUuid);
                for(let i =0;i<arrUuid.length;i++){
                    /*$(".edit-wrap-" + arrUuid[i]).hide();
                    $(".show-wrap-" + arrUuid[i]).show();*/
                    t.editData[arrUuid[i]]["showEdit"] = false;
                }
                t.editData = JSON.parse(JSON.stringify(t.editData));
            },
            /**
             * 批量保存
             */
            saveUuidFn(parentUuid){
                let t = this;
                t.isSort = false;
                let arrUuid = t.arrChildFn(parentUuid);
                let arrData = [];
                for(let i =0;i<arrUuid.length;i++){
                    arrData.push([
                        {key:"item_name",value:t.editData[arrUuid[i]].itemNameTxt},
                        {key:"item_type",value:t.editData[arrUuid[i]].itemType},
                        {key:"field_type",value:t.editData[arrUuid[i]].fieldType},
                        {key:"category",value:t.editData[arrUuid[i]].category},
                        {key:"is_tax",value:t.editData[arrUuid[i]].isTax},
                        {key:"is_adjustable",value:t.editData[arrUuid[i]].isAdjustable},
                        {key:"is_edited",value:t.editData[arrUuid[i]].isEdited},
                        {key:"is_extends",value:t.editData[arrUuid[i]].isExtends},
                        {key:"dec_length",value:t.editData[arrUuid[i]].decLength},
                        {key:"remark",value:t.editData[arrUuid[i]].remarkTxt},
                        {key:"uuid",value:arrUuid[i]},
                    ])
                }
                let oData = {
                    infoSetId:t.infoSetId,
                    customParam:{
                        dataList:arrData
                    }

                }
                if(arrData.length == 0){
                    t.$Message.warning('无数据变化!');
                    return false;
                }
                t.loading = true;
                t.$daydao.$ajax({
                    url: gMain.apiBasePath+"route/"+t.infoSetId+"/update.do"
                    ,type:"POST"
                    ,data:JSON.stringify(oData)
                    ,isPassFalse:true
                    ,success: function (data) {
                        if (data.result == "true") {
                            t.init();
                            t.uuidData[parentUuid] = false;
                            t.uuidData = JSON.parse(JSON.stringify(t.uuidData));
                            t.$Message.success('保存成功!');
                            for(let i =0;i<arrUuid.length;i++){
                                /*$(".edit-wrap-" + arrUuid[i]).hide();
                                 $(".show-wrap-" + arrUuid[i]).show();*/
                                t.editData[arrUuid[i]]["showEdit"] = false;
                                t.editData = JSON.parse(JSON.stringify(t.editData));
                            }
                            setTimeout(function () {
                                t.loading = false;
                            },1000)

                        }else if(data.result == "false"){
                            t.loading = false;
                            t.$Message.error(data.resultDesc);//接口报错提示
                        }
                    }
                });

            },
            /**
             * 改变显示的值
             */
            myVal(val){
                let t = this;
                t.showStatus = val;
            },
            /**
             * 展示
             */
            showFn(uuid){
                let t = this;

                $(".show-content-" + uuid).slideToggle(function () {
                    if($(".show-content-" + uuid).is(":hidden")){
                        let arr = [];
                        for(let i = 0;i<t.currentUUid.length;i++){
                            if(t.currentUUid[i]!=uuid){
                                arr.push(t.currentUUid[i]);
                            }
                        }
                        t.currentUUid = arr;

                    }else{
                        t.currentUUid.push(uuid);
                    }
                });
                /*$(".show-content").hide();
                if($(".show-content-" + uuid).is(":hidden")){
                    t.currentUUid = uuid;
                    $(".show-content-" + uuid).slideToggle();
                }else{
                    t.currentUUid = "";
                    $(".show-content-" + uuid).slideToggle();
                }
                */
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
             *编辑小项
             */
            editItemFn(uuid,obj){
                let t = this;
                t.requestFn();
                /*$(".show-wrap-" + uuid).hide();
                $(".edit-wrap-" + uuid).show();*/
                t.editData[uuid] = {
                    itemNameTxt:obj["itemName"],
                    itemType:obj["itemType"],
                    fieldType:obj["fieldType"],
                    category:obj["category"],
                    isTax:obj["isTax"],
                    isAdjustable:obj["isAdjustable"],
                    isEdited: obj["isEdited"],
                    isExtends:obj["isExtends"],
                    decLength:obj["decLength"],
                    remarkTxt:obj["remark"],
                    showEdit:true
                }
                t.editData = JSON.parse(JSON.stringify(t.editData));
            },
            /**
             *取消编辑小项
             */
            cancelItemFn(uuid){
                let t = this;
                /*$(".edit-wrap-" + uuid).hide();
                $(".show-wrap-" + uuid).show();*/
                t.editData[uuid]["showEdit"] = false;
                t.editData = JSON.parse(JSON.stringify(t.editData));
            },
            /**
             *保存编辑小项
             */
            saveItemFn(uuid){
                let t = this;
                t.loading = true;
                let oData = {
                    infoSetId:t.infoSetId,
                    customParam:{
                        dataList: [[
                            {key:"item_name",value:t.editData[uuid].itemNameTxt},
                            {key:"item_type",value:t.editData[uuid].itemType},
                            {key:"field_type",value:t.editData[uuid].fieldType},
                            {key:"category",value:t.editData[uuid].category},
                            {key:"is_tax",value:t.editData[uuid].isTax},
                            {key:"is_adjustable",value:t.editData[uuid].isAdjustable},
                            {key:"is_edited",value:t.editData[uuid].isEdited},
                            {key:"is_extends",value:t.editData[uuid].isExtends},
                            {key:"dec_length",value:t.editData[uuid].decLength},
                            {key:"remark",value:t.editData[uuid].remarkTxt},
                            {key:"uuid",value:uuid}
                        ]]
                    }
                }

                t.$daydao.$ajax({
                    url: gMain.apiBasePath+"route/"+t.infoSetId+"/update.do"
                    ,type:"POST"
                    ,data:JSON.stringify(oData)
                    ,isPassFalse:true
                    ,success: function (data) {
                        if (data.result == "true") {
                            t.init();
                            /*$(".edit-wrap-" + uuid).hide();
                            $(".show-wrap-" + uuid).show();*/
                            t.$Message.success('保存成功!');
                            t.editData[uuid]["showEdit"] = false;
                            t.editData = JSON.parse(JSON.stringify(t.editData));
                            setTimeout(function () {
                                t.loading = false;
                            },1000)
                        }else if(data.result == "false"){
                            t.loading = false;
                            t.$Message.error(data.resultDesc);//接口报错提示
                        }
                    }
                });
            },
            deleteFn(name,uuid) {
                let t = this;
                let oData = {
                    infoSetId: t.infoSetId,
                    uuidLists: [uuid]
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
                                    t.init();
                                    t.$Message.success('删除成功!');
                                    t.$Modal.remove();
                                }
                            }
                        });

                    }
                });
            },
            /**
             *返回某一项的所有子集uuid
             */
            arrChildFn(parentUuid){
                let t = this;
                let arrData = t.tags;
                let arr = []
                for(let i = 0;i<arrData.length;i++){
                    let obj  = arrData[i]["itemList"];
                    if(arrData[i]["uuid"] == parentUuid) {
                        for (let j = 0; j < obj.length; j++) {
                            arr.push(obj[j]['uuid'])
                        }
                    }
                }
                return arr;
            }


        }
    }
</script>

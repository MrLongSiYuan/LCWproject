<style lang="scss">
    .detaile-full-main-r-operate{
        //margin-top: 55px;
        margin-bottom: 20px;

        >h4{
            position: relative;
            display: flex;
            padding-right: 36px;
            border-bottom: 1px solid #C1C6CC;
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
                background-color: #fff;
                font-size: 18px;
            }
        }

    }

    // 时间轴
    .detaile-full-timeline{
        padding:  35px 0;

        li{
            &:first-child .detaile-full-timeline-item-head{
                &:before{
                    left: 2px;
                    top: 2px;
                    z-index: 11;
                    width: 6px;
                    height: 6px;
                    background: #3399FF;
                }

                /* &:after{
                    content: '';
                    position: absolute;
                    left: 1px;
                    top: 1px;
                    z-index: 10;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: #fff;
                } */
            }

            &:last-child .detaile-full-timeline-item-tail{
                display: none;
            }
        }
    }

    .detaile-full-timeline-item{
        position: relative;
        display: flex;
        padding-bottom: 32px;
    }

    .detaile-full-timeline-item-tail{
        position: absolute;
        left: 103px;
        top: 0;
        z-index: 8;
        height: 100%;
        width: 2px;
        background: #D7DDE4;
    }

    .detaile-full-timeline-item-head{
        position: absolute;
        left: 97px;
        top: 0;
        z-index: 9;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid #fff;
        background: #3399FF;

        &:before{
            content: '';
            position: absolute;
            left: 2px;
            top: 2px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #fff;
        }
    }

    .detaile-full-timeline-item-content-l{
        margin-top: -3px;
        width: 120px;
        padding-right: 17px;
        text-align: right;
        font-size: 14px;
        color: #657180;
        //letter-spacing: -0.6px;
        box-sizing: border-box;
    }

    .detaile-full-timeline-item-content-r{
        margin-top: -3px;
        width: 250px;
        padding-left: 19px;
        box-sizing: border-box;

        >h5{
            position: relative;
            padding-right: 40px;
            font-size: 14px;
            color: #657180;
        }

        >p{
            font-size: 14px;
            color: #A0A7B1;
        }

        >ul{
             padding: 5px 0;
            font-size: 14px;
            color: #657180;

            >li{
                 padding: 5px 0;
             }

            h6{
                font-size: 14px;
                color: #657180;
                background: #FAFBFC;
            }
        }
    }

    .detaile-full-timeline-back{
        position: absolute;
        right: 0;
        top: 0;
        font-size: 14px;
        color: #3399FF;
    }

    .detaile-operate-effective-date{
        margin-bottom: 3px;
        font-size: 14px;
        color: #A0A7B1;

        >label{
            margin-right: 10px;
        }
    }
</style>

<template>
    <div>
        <section class="detaile-full-main-r-operate">
            <h4>
                <em class="icon iconfont_daydao_common">&#xe615;</em>
                <span>操作记录</span>
            </h4>
            <ul class="detaile-full-timeline">
                <li class="detaile-full-timeline-item">
                    <div class="detaile-full-timeline-item-tail"></div>
                    <div class="detaile-full-timeline-item-head"></div>
                    <div class="detaile-full-timeline-item-content-l">至今</div>
                    <div class="detaile-full-timeline-item-content-r">

                    </div>
                </li>
                <li class="detaile-full-timeline-item" v-for="(recordItem, recordIndex) in recordListData" :key="recordIndex">
                    <div class="detaile-full-timeline-item-tail"></div>
                    <div class="detaile-full-timeline-item-head"></div>
                    <div class="detaile-full-timeline-item-content-l">{{recordItem.operateRecordDate}}</div>
                    <div class="detaile-full-timeline-item-content-r">
                        <h5>
                            {{recordItem.operateType}}
                            <a class="detaile-full-timeline-back" v-if="recordItem.allowRevoke && recordIndex == 0" @click="revoke(recordItem.recordId)">撤销</a>
                        </h5>
                        <ul v-if="recordItem.personInfo && recordItem.personInfo.length > 0">
                            <li v-for="(personItem, index) in recordItem.personInfo" :key="index">
                                <h6>{{personItem.itemName}}</h6>
                                <span>{{personItem.oldData || '无'}}</span>
                                <i class="iconfont_daydao_common">&#xe613;</i>
                                <span>{{personItem.newData}}</span>
                            </li>
                        </ul>

                        <ul v-if="recordItem.personLevelInfo && recordItem.personLevelInfo.length > 0">
                            <li v-for="(personLeveItem, index) in recordItem.personLevelInfo" :key="index">
                                <h6>{{personLeveItem.itemName}}</h6>
                                <span>{{personLeveItem.oldData || '无'}}</span>
                                <i class="iconfont_daydao_common">&#xe613;</i>
                                <span>{{personLeveItem.newData}}</span>
                            </li>
                        </ul>

                        <ul v-if="recordItem.personOrgInfo && recordItem.personOrgInfo.length > 0">
                            <li v-for="(personOrgItem, index) in recordItem.personOrgInfo" :key="index">
                                <h6>{{personOrgItem.itemName}}</h6>
                                <span>{{personOrgItem.oldData || '无'}}</span>
                                <i class="iconfont_daydao_common">&#xe613;</i>
                                <span>{{personOrgItem.newData}}</span>
                            </li>
                        </ul>

                        <ul v-if="recordItem.personOrgLeader && recordItem.personOrgLeader.length > 0">
                            <li v-for="(personOrgItem, index) in recordItem.personOrgLeader" :key="index">
                                <h6>{{personOrgItem.itemName}}</h6>
                                <span>{{personOrgItem.oldData || '无'}}</span>
                                <i class="iconfont_daydao_common">&#xe613;</i>
                                <span>{{personOrgItem.newData}}</span>
                            </li>
                        </ul>

                        <ul v-if="recordItem.personPartPosAndJobInfo && recordItem.personPartPosAndJobInfo.length > 0">
                            <li v-for="(personOrgItem, index) in recordItem.personPartPosAndJobInfo" :key="index">
                                <h6>{{personOrgItem.itemName}}</h6>
                                <span>{{personOrgItem.oldData || '无'}}</span>
                                <i class="iconfont_daydao_common">&#xe613;</i>
                                <span>{{personOrgItem.newData}}</span>
                            </li>
                        </ul>

                        <ul v-if="recordItem.personPosAndJobInfo && recordItem.personPosAndJobInfo.length > 0">
                            <li v-for="(personOrgItem, index) in recordItem.personPosAndJobInfo" :key="index">
                                <h6>{{personOrgItem.itemName}}</h6>
                                <span>{{personOrgItem.oldData || '无'}}</span>
                                <i class="iconfont_daydao_common">&#xe613;</i>
                                <span>{{personOrgItem.newData}}</span>
                            </li>
                        </ul>

                        <ul v-if="recordItem.personReportInfo && recordItem.personReportInfo.length > 0">
                            <li v-for="(personOrgItem, index) in recordItem.personReportInfo" :key="index">
                                <h6>{{personOrgItem.itemName}}</h6>
                                <span>{{personOrgItem.oldData || '无'}}</span>
                                <i class="iconfont_daydao_common">&#xe613;</i>
                                <span>{{personOrgItem.newData}}</span>
                            </li>
                        </ul>

                        <dl class="detaile-operate-effective-date" v-if="recordItem.remark">
                            {{recordItem.remark || ''}}
                        </dl>
                        <dl class="detaile-operate-effective-date" v-if="recordItem.operatePersonName">
                            <label>操作人</label><span>{{recordItem.operatePersonName}}</span>
                        </dl>
                        <dl class="detaile-operate-effective-date">
                            <label>生效时间</label><span>{{recordItem.effectiveDate}}</span>
                        </dl>
                    </div>
                </li>
            </ul>
        </section>

        <!-- 弹窗 -->
        <Modal
            :title="showModal.title"
            :mask-closable="false"
            :closable="false"
            v-model="modalState"
            width="360px"
            class-name="vertical-center-modal detail-list-modeal">

            <p v-html="showModal.content" style="padding: 5px; font-size: 14px;"></p>

            <div slot="footer" style="text-align: center;">
                <Button type="primary" :loading="actionFlag" @click="modalConfirm">确定</Button>
                <Button type="ghost" @click="modalCancel" style="margin-left: 28px;">取消</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    export default{
        name:"operateData",
        props:{
            /* editListData: {
                type: Object,
                default(){
                    return {};
                }
            } */
        },
        data () {
            return {
                actionFlag: false,   // 是否正在提交状态   false: 否     true: 提交中
                recordListData: [],
                recordId: '',
                modalState: false,
                showModal: {state: false, title: '提示', content: ''}   // 撤销提示框
            };
        },
        created(){
            this.getRecordList()
        },
        methods:{
            /**
             * 获取操作记录数据
             */
            getRecordList (){
                var _this = this;

                _this.$daydao.$ajax({
                    url: gMain.apiBasePath + "operateRecord/getRecordList",
                    data:JSON.stringify({
                        personId: _this.$parent.id
                    }),
                    success:function (data) {
                        if(data.result == "true"){
                            console.log(data)

                            _this.recordListData = data.data;
                        }
                    }
                })
            },
            /**
             * 撤销
             */
            revoke (recordId){
                var _this = this;

                _this.recordId = '';
                _this.recordId = recordId;

                // 删除前的提示
                _this.modalState = true;
                _this.showModal.content = '确定撤销该操作记录吗？该操作不可恢复。';
            },
            modalConfirm (){
                var _this = this;

                if(_this.actionFlag) return;
                _this.actionFlag = true;

                _this.$daydao.$ajax({
                    url: gMain.apiBasePath + "operateRecord/revoke",
                    data:JSON.stringify({
                        personId: _this.$parent.id,
                        recordId: _this.recordId
                    }),
                    success:function (data) {
                        try{
                            if(data.result == "true"){
                                _this.getRecordList();

                                _this.$emit("refreshPersonBaseInfo", 'refresh');
                            }
                        }
                        catch (e){
                            console.log(e.message)
                        }
                        finally {
                            _this.modalState = false;
                            _this.actionFlag = false;
                        }
                    },
                    error: function(data){
                        _this.$Message.error(data.message);
                        _this.actionFlag = false;
                    }
                })
            },

            modalCancel (){
                this.modalState = false;
            }
        },
        watch:{

        }
    }
</script>

<template>
    <div class="single_announcement_wrap">
        <page-slide :pageTitle="annDetailTitle" v-model="pageDetailIsShow" :cover="false">
            <div class="page_slide_wrap">
                <announcement-detail
                    :page-detail-id="pageDetailId"
                    :announcement-type="announcementType"
                    v-if="annDetailIsShow"></announcement-detail>
            </div>
        </page-slide>
        <ul>
            <li class="announcement_list"  v-for="item in announcementList" @click="openAnnDetail(item)">
                <div class="announcement_title">
                    {{item.title}}
                    <div class="unpublish_mark draft_mark" v-if="announcementType == 'notPublish' && item.status == '草稿'"></div>
                    <div class="unpublish_mark timing_mark" v-if="announcementType == 'notPublish' && item.status == '定时发布'"></div>
                    <div class="unpublish_mark withdraw_mark" v-if="announcementType == 'notPublish' && item.status == '撤回'"></div>
                </div>
                <div class="announcement_content" v-ann-content-handle="item"></div>
                <div class="announcement_list_footer clearfix">
                    <div class="publisher_publish_time clearfix">
                        <div class="publisher">{{item.person_name}}</div>
                        <div class="publish_time" v-add-ann-time="item"></div>
                    </div>
                    <div class="announcement_classify">{{item.type_name}}</div>
                </div>
            </li>
        </ul>
    </div>
</template>
<script type="text/javascript">
    import pageSlide from 'commonVueLib/pageSlide'
    import announcementDetail from '../pages/announcementDetail.vue'

    export default{
        props:['announcementList','announcementType'],
        data: function () {
            return {
                annDetailTitle:"公告详情",
                pageDetailIsShow:false, //侧滑是否展示
                annDetailIsShow:false, //详情是否展示
                pageDetailId:"",//详情ID
            }
        },
        created: function () {
            var t = this;
            console.log(t.announcementType)
        },
        methods: {
            /*
             * 打开详情
             * */
            openAnnDetail:function (data) {
                var t = this;
                t.pageDetailIsShow = true;
                t.annDetailIsShow = false;
                t.$nextTick(()=>{
                    t.annDetailIsShow = true;
                    t.pageDetailId = data.uuid;
                });
            },
        },
        components:{
            "page-slide":pageSlide,
            "announcement-detail":announcementDetail
        },
        directives:{
            'add-ann-time':function(el,data){
                if (!$.isEmptyObject(data.value)) {
                    var showtime,date,nowDate;
                    date = new Date(data.value.operation_time);
                    nowDate = new Date();
                    var year,month,day,hour,minute,second;
                    year = date.getFullYear();
                    month = date.getMonth()+1 < 10 ? "0"+(date.getMonth()+1):date.getMonth()+1;
                    day = date < 10 ? "0"+date.getDate():date.getDate();
                    hour = date.getHours() < 10 ? "0"+date.getHours():date.getHours()
                    minute = date.getMinutes() < 10 ? "0"+date.getMinutes():date.getMinutes();
                    if(nowDate.getFullYear() != year){  //其他年份
                        showtime = year+"/"+month+"/"+day+" "+hour+":"+minute;
                    }else if(nowDate.getFullYear() == year && ((nowDate.getMonth() + 1) == month && nowDate.getDate() == day)){ //今时今日
                        showtime = hour+":"+minute;
                    }else if(nowDate.getFullYear() == year && ((nowDate.getMonth() + 1) == month && nowDate.getDate() == (day + 1))){//昨日
                        showtime = "昨天"+hour+":"+minute;
                    }else{
                        showtime = month+"/"+day+" "+hour+":"+minute;
                    }
                    $(el).text(showtime);
                }
            },
            'add-ann-time-status':function(el,data){
                if (!$.isEmptyObject(data.value) && (data.value.status == "定时发布" || data.value.status == "撤回" || data.value.status == "草稿")) {
                    var showtime,date;
                    if(data.value.status == "定时发布"){
                        date = new Date(data.value.job_time);
                    }else if(data.value.status == "撤回" || data.value.status == "草稿"){
                        date = new Date(data.value.operation_time);
                    }
                    var year,month,day,hour,minute,second;
                    year = date.getFullYear();
                    month = date.getMonth()+1 < 10 ? "0"+(date.getMonth()+1):date.getMonth()+1;
                    day = date < 10 ? "0"+date.getDate():date.getDate();
                    hour = date.getHours() < 10 ? "0"+date.getHours():date.getHours()
                    minute = date.getMinutes() < 10 ? "0"+date.getMinutes():date.getMinutes();
                    showtime = year+"/"+month+"/"+day+" "+hour+":"+minute;
                    if(data.value.status == "定时发布"){
                        $(this.el).text("将于 "+showtime+" 发布");
                    }else if(data.value.status == "撤回" || data.value.status == "草稿"){
                        $(this.el).text("最后编辑于 "+showtime);
                    }
                }
            },
            'ann-content-handle':function (el,data) {
                if(!$.isEmptyObject(data.value)){
                    if(data.value.content){
                        var conent = data.value.content.replace(/[\n]/g,'<br/>');
                        conent = conent.replace(/[\s]/g,'&nbsp;');
                    }
                    $(el).html(conent);
                }
            }
        }
    }
</script>
<style lang="scss" rel="stylesheet/scss">
    .single_announcement_wrap{
        background: #fff;
        .page_slide_wrap{
            height: calc(100% - 105px);
            overflow: auto;
        }
        ul{
            li.announcement_list{
                border-bottom: 1px solid #e3e8ee;
                display: block;
                padding: 15px 20px;
                cursor: pointer;
                &:hover{
                    background-color: #F5F7F9;
                }
                &:active{
                    background-color: #FCF3E9;
                }
                .announcement_title{
                    font-size: 16px;
                    color: #3D4651;
                    line-height: 16px;
                    position: relative;
                    .unpublish_mark{
                        position: absolute;
                        top:0;
                        right: 0;
                        width: 56px;
                        height: 16px;
                        background-size: 56px 16px;
                        background-repeat: no-repeat;
                    }
                    .draft_mark{
                        background-image: url(../assets/images/draft.png);
                        @extend .unpublish_mark
                    }
                    .timing_mark{
                        width: 66px;
                        background-image: url(../assets/images/timing.png);
                        background-size: 66px 16px;
                        @extend .unpublish_mark
                    }
                    .withdraw_mark{
                        background-image: url(../assets/images/withdraw.png);
                        @extend .unpublish_mark
                    }
                }
                .announcement_content{
                    height: 66px;
                    overflow: hidden;
                    box-sizing: border-box;
                    margin: 11px 0;
                    font-size: 14px;
                    line-height: 22px;
                    color: #657180;
                }
                .announcement_list_footer{
                    .publisher_publish_time{
                        float: left;
                        font-size: 14px;
                        color: #90A2B9;
                        line-height: 14px;
                        .publisher{
                            float: left;
                        }
                        .publish_time{
                            float: left;
                            margin-left: 20px;
                        }
                    }
                    .announcement_classify{
                        float: right;
                        font-size: 14px;
                        color: #90A2B9;
                        line-height: 14px;
                        padding-right: 30px;
                    }
                }
            }
        }
    }
</style>

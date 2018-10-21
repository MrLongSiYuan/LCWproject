<template>
    <div class="report_content_list_wrap">
        <div class="single_report_content" v-for="item in reportList" v-bind:data-uuid="item.uuid"  v-show="!(reportSource=='sendOut'&&item.status == 2)">
            <div class="single_report_header">
                <!--头像-->
                <div class="person_header_img">
                    <img v-app-head-img="item"/>
                </div>

                <div class="person_name">{{item.personName}}</div>
                <!--状态-->
                <div class="report_mark" v-if="(reportSource=='sendOut'&&item.readCounts>0&&item.status == 1)">
                    <!--<img :src="gMain.baseStaticPath+'oa/report_mobile/images/read@3x.png'" alt="">-->
                </div>
                <div class="report_mark" v-if="(reportSource=='sendOut'&&item.status == 2)">
                    <img :src="gMain.baseStaticPath+'oa/report_mobile/images/draft.png'" alt="">
                </div>
                <div class="report_mark" v-if="(reportSource=='received'&&item.readInfo.isRead == 1)">
                    <img :src="gMain.baseStaticPath+'oa/report_mobile/images/read@3x.png'" alt="">
                </div>
                <div class="report_mark" v-if="(reportSource=='received'&&item.readInfo.isRead == 0)">
                    <img :src="gMain.baseStaticPath+'oa/report_mobile/images/list_tag_unread_def@3x.png'" alt="">
                </div>
                <!--汇报名-->
                <div class="report_name" v-if="item.tempName != '周报' && item.tempName != '月报'">{{item.tempName}}&nbsp;（{{item.dateParam.monthOfYear}}/{{item.dateParam.daysOfMonth}}&nbsp;{{item.dateParam.theWeekStr}}）</div>
                <div class="report_name" v-if="item.tempName == '周报'">{{item.tempName}}&nbsp;（{{item.dateParam.theYear}}年{{item.dateParam.monthOfYear}}月第{{item.dateParam.weekOfMonth}}周）</div>
                <div class="report_name" v-if="item.tempName == '月报'">{{item.tempName}}&nbsp;（{{item.dateParam.theYear}}年{{item.dateParam.monthOfYear}}月）</div>
            </div>
            <div class="single_report_detail">
                <form-data-show v-bind:a-fields="item.nodeData"></form-data-show>
                <!--<div class="single_report_detail_cover"></div>-->
            </div>
            <div class="single_report_footer">
                <div class="report_create_time">{{item.createTime}}</div>
                <div class="footer_word" v-if="item.status == 2">草稿&nbsp;编辑于</div>
                <div class="delete_report" v-if="item.status == 2" v-on:click.stop=" deleteDraft(item.uuid)"></div>
            </div>
        </div>
        <div class="no-data-page" v-if="reportList.length == 0">
            <div class="no-data-box">
                暂无数据
            </div>
        </div>
    </div>
</template>
<script type="text/javascript">
    import formDataShow from "../components/formDataShow.vue"

    export default{
        props:["reportListInfo"],
        data: function () {
            return {
                gMain:gMain,
                reportList:[],
                reportSource:this.reportListInfo.reportSource,      //sendOut（我发起的） received（我收到的）
            }
        },
        watch:{
            "reportListInfo.reportList":function () {
                var t = this;
                t.reportList = t.reportListInfo.reportList;
                if(t.reportList.length == 0){
                    $(".report_content_list_wrap").find(".no-data-page").show();
                }
            }
        },
        created: function () {
            var t = this;
            seajs.use(["commonStaticDirectory/plugins/headImgLoad/headImgLoad.js"],function(){

            })
        },
        methods:{
            /*
             * 预览单个汇报
             * */
            previewSingleReport:function (reportId,tempName,status) {
                var t = this;
                if(status == "1"){
                    window.location.href = "#!/singleReportDetail/"+reportId;
                }else if(status == "2"){    //草稿
                    window.location.href = "#!/draftEdit/"+reportId+"/edit";
                }
            },
        }
        ,components:{
            "form-data-show":formDataShow
        }
        ,directives: {
            'app-head-img':function(el,data){
                if (!$.isEmptyObject(data.value)) {
                    $(el).headImgLoad({
                        userId: data.value.personId //dd号
                        , userName: data.value.personName
                        , userImg: gMain.DayHRDomains.baseStaticDomain + data.value.headImg
                    });
                }
            }
        }
    }
</script>
<style lang="scss" rel="stylesheet/scss">
    /*汇报列表start*/
    .report_content_list_wrap{
        width: 100%;
        box-sizing: border-box;
        padding: 0 0.3rem;
        background: #f2f2f2;
    }
    .report_content_list_wrap .single_report_content{
        width: 100%;
        height: 169px;
        box-sizing: border-box;
        background: #fff;
        border: 1px solid #D2D2D2;
        border-radius: 0.08rem;
        margin-bottom: 40px;
    }
    .report_content_list_wrap  .single_report_header{
        width: 100%;
        height: 64px;
        border-bottom: 1px solid #D2D2D2;
        box-sizing: border-box;
        padding: 15px 0;
        position: relative;
    }
    .report_content_list_wrap  .single_report_header .person_header_img{
        width: 32px;
        height: 100%;
        float: left;
        margin-left: 0.3rem;
        border-radius: 100%;
        overflow: hidden;
    }
    .report_content_list_wrap  .single_report_header .person_header_img b{
        display: inline-block;
        width: 100% !important;
        height: 100% !important;
        text-align: center;
        line-height: 33px !important;
    }
    .report_content_list_wrap  .single_report_header .person_header_img img{
        width: 100%;
        height: 100%;
    }
    .report_content_list_wrap  .single_report_header .person_name{
        height: 32px;
        line-height: 32px;
        font-size: 15px;
        max-width: 1.3rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #222;
        margin-left: 0.18rem;
        float: left;
    }
    .report_content_list_wrap  .single_report_header .report_mark{
        width: 80px;
        height: 52px;
        position: absolute;
        left: 3.41rem;
        top:0rem;
    }
    .report_content_list_wrap  .single_report_header .report_mark img{
        width: 100%;
        height: 100%;
    }
    .report_content_list_wrap  .single_report_header .report_name{
        height: 32px;
        line-height: 32px;
        float: right;
        font-size: 12px;
        color: #666;
        margin-right: 0.19rem;
    }
    /*汇报详情开始*/
    .report_content_list_wrap .single_report_detail{
        width: 100%;
        height: 75px;
        padding: 10px 0.3rem 0 0.3rem;
        font-size: 14px;
        color: #222;
        overflow: hidden;
        position: relative;
        box-sizing: border-box;
    }
    .report_content_list_wrap .single_report_detail .dataListItem{
        display: block;
        overflow: hidden;
    }
    .report_content_list_wrap .single_report_detail .dataListItem[data-fieldtype="pic"]{
        display: none;
    }
    .report_content_list_wrap .single_report_detail .dataListItem[data-fieldtype="file"]{
        display: none;
    }
    .report_content_list_wrap .single_report_detail .dataListItem[data-fieldtype="datearea"] .clearfix{
        overflow: hidden;
    }
    .report_content_list_wrap .single_report_detail .single_report_detail_cover{
        width: 100%;
        height: 100%;
        position: absolute;
        top:0;
        left: 0;
        z-index: 2;
    }
    .report_content_list_wrap .single_report_detail .right{
        word-break: break-all;
        font-size: 14px;
        color: #222;
        float: left;
    }
    .report_content_list_wrap .single_report_detail .left{
        word-break: break-all;
        font-size: 14px;
        color: #222;
        float: left;
    }
    .report_content_list_wrap .single_report_detail .preview_download_upload{
        display: none;
    }
    /*汇报详情结束*/
    .report_content_list_wrap .single_report_footer{
        width: 100%;
        height: auto;
        position: relative;
    }
    .report_content_list_wrap .footer_word,.report_content_list_wrap .report_create_time{
        font-size: 10px;
        color: #666;
        float: right;
    }
    .report_content_list_wrap .report_create_time{
        margin-right: 0.19rem;
    }
    .report_content_list_wrap .delete_report i{
        font-size: 0.34rem;
        color: #FF7123;
    }
    /*汇报列表end*/
    /*无数据展示页*/
    .report_content_list_wrap .no-data-page{
        position: fixed;
        top:0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #f2f2f2;
        z-index: -1;
        display: none;
    }
    .report_content_list_wrap .no-data-page .no-data-box{
        width: 100px;
        height: 133px;
        font-size: 14px;
        color: #aaa;
        text-align: center;
        padding-top: 113px;
        box-sizing: border-box;
        position: absolute;
        left: 0;
        right: 0;
        top:0;
        bottom: 0;
        margin: auto;
        background-image: url(../assets/images/work_icon_blank_def@3x.png);
        background-repeat: no-repeat;
        background-position: center top;
        background-size: 100px 100px;
    }
    /*无数据展示页结束*/
</style>

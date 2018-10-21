<template>
    <div id="report_detail_wrap">
        <div class="report_detail_box" v-show="nodeData.length != 0">
            <div class="submit_report_infor">
                <div class="sponsor_orgname clearfix">
                    <div class="infor_left">部门</div>
                    <div class="infor_right">{{sponsorInfor.orgName}}</div>
                </div>
                <div class="sponsor_personname clearfix">
                    <div class="infor_left">提交人</div>
                    <div class="infor_right">{{singleReportData.wrData.personName}}</div>
                </div>
                <div class="sponsor_submit_time clearfix">
                    <div class="infor_left">提交时间</div>
                    <div class="infor_right">{{singleReportData.wrData.createTime}}</div>
                </div>
            </div>
            <div class="formData clearfix">
                <form-data-show :a-fields="nodeData" :uuid="reportId"></form-data-show>
            </div>
            <div class="report_receiver clearfix">
                <div class="infor_left">汇报对象</div>
                <div class="infor_right">
                    <ul class="clearfix">
                        <li class="receiver_name" v-for="item in singleReportData.receiverList">{{item.receiverName}}</li>
                    </ul>
                </div>
            </div>
            <!--操作项-->
            <div class="reportFooter_box clearfix">
                <div class="reportFooter clearfix">
                    <!--阅读-->
                    <div :class="openReadImg?'operation_item active':'operation_item'" @click="openAdditionalContent('read')">
                        <p class="iconfont_daydao_common"  v-if="isRead" style="font-size: 20px;line-height: 15px">&#xe67c;</p>
                        <p class="iconfont_daydao_common iconfont_dayoa_read"  v-if="!isRead" style="font-size: 20px;line-height: 15px">&#xe67c;</p>
                        <p class="operation_item_num">{{singleReportData.wrData.readCounts}}</p>
                    </div>
                    <!--点赞-->
                    <div :class="openPraiseImg?'operation_item active':'operation_item'" @click="reportPraise">
                        <p class="iconfont_daydao_common" v-if="singleReportData.wrData.praiseInfo.isPraise == 0" >&#xe631;</p>
                        <p class="iconfont_daydao_common iconfont_dayoa_fabulous" style="color: #F65C5E;" v-if="singleReportData.wrData.praiseInfo.isPraise == 1">&#xe62d;</p>
                        <p class="operation_item_num">{{singleReportData.wrData.praiseInfo.count}}</p>
                    </div>
                    <!--评论-->
                    <div :class="canComment?'operation_item active':'operation_item'" v-on:click="openAdditionalContent('comment')">
                        <p class="iconfont_daydao_common" v-if="singleReportData.wrData.commentInfo.isComment == 0">&#xe62f;</p>
                        <p class="iconfont_daydao_common iconfont_dayoa_comment" v-if="singleReportData.wrData.commentInfo.isComment == 1">&#xe62f;</p>
                        <p class="operation_item_num">{{pageInforComment.total}}</p>
                    </div>
                    <!--转发-->
                    <div :class="showChoosePersonnel?'operation_item active':'operation_item'" v-if="singleReportData.wrData.forwardType == 0" @click="showChoosePersonnel = true">
                        <p class="iconfont_daydao_common">&#xe62e;</p>
                        <!--<p class="operation_item_num"></p>-->
                    </div>
                </div>
            </div>
            <!--阅读人头像-->
            <div id="reader_headimg_content_wrap" class="additional_content_wrap" v-if="openReadImg">
                <!--<div class="arrow_up" style="left: 428px"></div>-->
                <!--<div class="people_number"><span>{{pageInforRead.total}}</span>人已阅读</div>-->
                <ul class="people_headimg_detail clearfix">
                    <li v-for="item in showReadHeadImgList">
                        <div class="img_box" v-list-head-img="item">
                            <img :src="gMain.DayHRDomains.baseStaticDomain+item.headImg" alt="" :title="item.personName">
                            <span :title="item.personName"></span>
                        </div>
                        <div class="people_name">{{item.personName}}</div>
                    </li>
                </ul>
               <!-- <div class="page_search" v-if="pageInforRead.total != 0">
                    <Page :total="pageInforRead.total" simple size="small" :current="pageInforRead.pageNo" v-on:on-change="changeReadPageNo" class = "report_base_mmpager" :page-size="pageInforRead.onePageNum"></Page>
                </div>-->
                <div class="load_more_read" v-if="pageInforRead.total > 14">
                    <div class="read_more_btn" v-if="showReadHeadImgList.length < pageInforRead.total" @click="loadMoreReader">点击加载更多<i class="iconfont_daydao_common">&#xe62c;</i></div>
                    <div class="nomore_reader" v-if="showReadHeadImgList.length == pageInforRead.total">---已全部加载完---</div>
                </div>
            </div>
            <!--点赞人头像-->
            <div id="praise_wrap" v-show="openPraiseImg">
                <div class="arrow_up" style="left: 622px"></div>
                <div id="praise_plugin"></div>
            </div>
            <!--<div id="praise_headimg_content_wrap" class="additional_content_wrap" v-if="openPraiseImg">
                &lt;!&ndash;<div class="arrow_up" style="left: 494px"></div>
                <div class="people_number"><span>{{pageInforPraise.total}}</span>人赞过</div>&ndash;&gt;
                <ul class="people_headimg_detail clearfix">
                    <li v-for="item in showPraiseHeadImgList">
                        <div class="img_box" v-list-head-img="item">
                            <img :src="gMain.DayHRDomains.baseStaticDomain+item.headImg" alt="" :title="item.personName">
                            <span :title="item.personName"></span>
                        </div>
                        <div class="people_name">{{item.personName}}</div>
                    </li>
                </ul>
                <div class="page_search" v-if="pageInforPraise.total != 0">
                    <Page :total="pageInforPraise.total" simple size="small" :current="pageInforPraise.pageNo" v-on:on-change="changePraisePageNo" class = "report_base_mmpager" :page-size="pageInforPraise.onePageNum"></Page>
                </div>
            </div>-->
            <!--添加评论-->
            <div id="comment_wrap" v-show="canComment">
                <div class="arrow_up" style="left: 560px"></div>
                <div id="comment_plugin"></div>
            </div>
            <!--<div id="add_comment_content_wrap" class="additional_content_wrap" v-if="canComment">
                <div class="arrow_up" style="left:582px"></div>
                <textarea name="comment_content" class="comment_content_input" placeholder="所有工作的进步都离不开细心的点评与指导" v-model="commentContent" @focus="commentOnfocus()"></textarea>
                <div class="button_box">
                    <div class="comment_submit" style="margin-left: 10px;" v-on:click="openAdditionalContent('comment')">取消</div>
                    <div v-on:click="reportComment('comment')" :class="[commentContent?'comment_submit active':'comment_submit']">发送</div>
                </div>
                <div class="all_comment_wrap">
                    <div class="person_comment" v-for="item in showCommentInforList" v-bind:comment-id="item.uuid">
                        <div class="headimg">
                            <img v-bind:src="item.reviewerHeadImg?gMain.DayHRDomains.baseStaticDomain+item.reviewerHeadImg:(gMain.baseStaticPath+'oa/report/images/personImg.png')" alt="" v-bind:title="item.reviewerName">
                        </div>
                        <div class="person_comment_personInfo">
                            <span class="person_comment_name" v-bind:reviewer-id="item.reviewer">{{item.reviewerName}}</span>
                            <span class="person_comment_createtime">{{item.createTime}}</span>
                            <div class="delete_comment" v-if="item.reviewer == personInfor.personId" v-on:click="deletecomment(item.uuid)">删除</div>
                            <div class="reply_comment" v-if="!(item.reviewer == personInfor.personId)" v-on:click="replycomment(item.uuid,item.reviewerName,item.reviewer,item.reviewerHeadImg,$event)">回复</div>
                        </div>
                        <div class="person_comment_content">
                            <span v-if="item.replyTo">回复<a href="javascript:void(0)">@{{item. replyToName}}</a>:</span>
                            <span v-html="item.content"></span>
                        </div>
                        <div class="reply_comment_box" style="display: none" v-if="!(item.reviewer == personInfor.personId)">
                            <textarea name="comment_content" class="comment_content_input" v-bind:placeholder="commentPlaceholder" v-model="replyContent" @focus="replyOnfocus(item.uuid,item.reviewerName,item.reviewer,item.reviewerHeadImg)"></textarea>
                            <div class="button_box">
                                <div class="comment_submit" style="margin-left: 10px;" v-on:click="replycomment(item.uuid,item.reviewerName,item.reviewer,item.reviewerHeadImg,$event)">取消</div>
                                <div :class="[replyContent?'comment_submit active':'comment_submit']" v-on:click="reportComment('reply',$event)">回复</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="page_search_wrap clearfix" v-if="pageInforComment.total != 0">
                    <div class="page_search">
                        <Page :total="pageInforComment.total" size="small" show-elevator show-sizer show-total class = "report_base_mmpager" :page-size="pageInforComment.onePageNum" :current="pageInforComment.pageNo" :page-size-opts="pageInforComment.onePageNumArr" v-on:on-change="changePageNo" v-on:on-page-size-change="changeOneDataNum" :placement="top"></Page>
                    </div>
                </div>
            </div>-->
            <!--选择人员-->
            <div id="choose_personnel">
                <Modal
                    title="汇报转发"
                    v-model="showChoosePersonnel"
                    class-name="vertical-center-modal"
                    width="660"
                    :mask-closable="false"
                >
                    <div slot="footer">
                    </div>
                    <personnel-select :single-report-data="singleReportData"></personnel-select>
                </Modal>
            </div>
        </div>
        <div class="loading" style="position: fixed;width: 100%;height: 100%;left: 0;top: 0;" v-show="nodeData.length == 0 && !notFind">
            <Spin size="large" fix></Spin>
        </div>
        <div class="report_not_find_box" v-show="notFind">
            <div class="report_not_find"> 汇报已经被删除啦！</div>
        </div>
    </div>
</template>
<script type="text/javascript">
    import formDataShow from "../components/formDataShow.vue"
    import personnelSelect from "../components/personnelSelect.vue"

    export default{
        data: function () {
            return {
                gMain:gMain,
                singleReportData:{
                    receiverList:[],
                    wrData:{
                        praiseInfo:{},
                        commentInfo:{}
                    }
                }, //单个汇报信息
                showChoosePersonnel: false,
                reportId:"",
                sponsorInfor:{}, //表单拼接信息
                nodeData:[], //表单
                isRead:false,
                personInfor:{},
                canPraiseFlag:true, //可以点赞
                openReadImg:false, //阅读人头像
                canComment:false,
                openPraiseImg:false,
                replyContent:"",
                notFind:false,
                readList:[],
                commentContent:"",
                commentPlaceholder:"",
                showReadHeadImgList:[],
                showPraiseHeadImgList:[],
                showCommentInforList:[],
                postCommentOption:{   //评论参数
                    content:"",
                    infoId:null,
                    replyTo:null,
                    reviewer:null,
                    extParam:{},
                    messageType:37,
                    ifSendMsg:1,
                    projectName:"汇报",
                    receivePersonId:""
                },
                replyInfor:{       //回复对象
                    replyHeadImg:null,
                    replyTo:null,
                    replyToName:null,
                },
                pageInforComment:{
                    total:0,
                    pageNo:1,          //当前页
                    onePageNum:10,      //一页显示评论数量
                    onePageNumArr:[10,20,50,100]
                },
                pageInforPraise:{
                    total:0,
                    pageNo:1,          //当前页
                    onePageNum:12,      //一页显示汇报数量
                    onePageNumArr:[10,20,50,100]
                },
                pageInforRead:{
                    total:0,
                    pageNo:1,          //当前页
                    onePageNum:42,      //一页显示阅读数量
                },
            }
        },
        watch:{
        },
        created: function () {
            var t = this;
            t.reportId = t.$route.params.report_id;
            t.initPraisePlugin();
            t.getAllCommentData(t.pageInforComment.pageNo,t.pageInforComment.onePageNum);
            if(gMain.personInforReport){
                t.personInfor = gMain.personInforReport;
            }else{
                t.getPersonInfor();
                t.personInfor = gMain.personInforReport;
            }
            $.when(t.reportReadStatus()).done(function () {
                t.getReportById();
            })
            t.$Message.config({
                top: 50,
                duration: 2
            })
        },
        methods: {
            /*
             * 获取单个汇报数据
             * */
            getReportById:function () {
                var t = this;
                t.$daydao.$ajax({
                    url:gMain.apiBasePath + "wrReportData/getReportDataById.do",
                    data:JSON.stringify({
                        reportId:t.reportId+"",
                    }),
                    beforeSend:function () {

                    },
                    complete:function () {

                    },
                    success:function(data) {
                        if (data.result == "true"){

                            t.singleReportData = Object.assign({},t.singleReportData,JSON.parse(JSON.stringify(data.data.data)))
                            t.getReadList();
                            t.initCommentPlugin();
                            t.singleReportData.wrData.createTime = t.singleReportData.wrData.modifyTime.slice(0,-3);
                            t.nodeData = JSON.parse(t.singleReportData.wrData.nodeData);
                            t.praiseInfo = t.singleReportData.wrData.praiseInfo;
                            t.commentInfo = t.singleReportData.wrData.commentInfo;
                            var nodeDataInfor = JSON.parse(t.singleReportData.wrData.nodeData);
                            var fixedInfor;
                            try{
                                $.each(nodeDataInfor,function (num,val) {
                                    if(val.field_type == "default_field" && val.field_name == "personInfor"){
                                        fixedInfor = $.extend({},fixedInfor,val.value);
                                    }
                                })
                            }catch(e){};
                            if(fixedInfor && fixedInfor.orgName != "undefined"){
                                t.sponsorInfor.headImg = fixedInfor.headImg;
                                t.sponsorInfor.orgName = fixedInfor.orgName;
                                t.sponsorInfor.personName = fixedInfor.personName;
                                t.sponsorInfor.personId = fixedInfor.personId;
                            }else{
                                t.sponsorInfor.headImg = t.singleReportData.wrData.headImg;
                                t.sponsorInfor.orgName = t.singleReportData.wrData.orgName;
                                t.sponsorInfor.personName = t.singleReportData.wrData.personName;
                                t.sponsorInfor.personId = t.singleReportData.wrData.personId;
                            }
                            t.sponsorInfor = JSON.parse(JSON.stringify(t.sponsorInfor));
                            t.getPicTrueUrl(t.nodeData,function (arr) {
                                // arr = t.removeUselessFields(arr);  //去掉垃圾字段
                                t.nodeData = JSON.parse(JSON.stringify(arr)); //表单数据
                            });
                        }else if(data.result == "remind" && data.resultDesc == "report_not_found"){
                            t.notFind = true;
                        }
                    }
                });
            },
            /*初始化评论组件*/
            initCommentPlugin:function () {
                var t = this;
                seajs.use(["commonStaticDirectory/plugins/daydaoFedComment/daydaoFedCommentJq.js"],function (comment) {
                    var params =  {
                        infoId:t.reportId,
                        "ifSendMsg":1,
                        "messageType":37,
                        "extParam":{
                            "uuid":t.reportId,
                            "is_need_st":"1",
                            "projectName":"汇报"
                        },
                        "receivePersonId":t.singleReportData.wrData.personId,
                        "projectName":"汇报"
                    }
                    t.comment = new comment({
                        id: 'comment_plugin',
                        params: params
                        ,count: function(count){
                            t.pageInforComment.total = count;
                        }
                        , success: function(data){
                            if(data == "add"){
                                t.$Message.success("评论成功！")
                            }else if(data == "reply"){
                                t.$Message.success("回复成功！")
                            }else if(data == "del"){
                                t.$Message.success("删除成功！")
                            }
                        }
                        , cancel: function(){
                            t.openAdditionalContent('comment');
                        }
                    });
                })
            },
            initPraisePlugin:function () {
                var t = this;
                seajs.use(["commonStaticDirectory/plugins/daydaoFedComment/daydaoFedLikeJq.js"],function (praise) {
                    t.praise = new praise({
                        id: 'praise_plugin',
                        uuid: t.reportId
                        ,count: function(count){
                            t.singleReportData.wrData.praiseInfo.count = count;
                        }
                    });

                })
            },
            initReadPlugin:function () {
                var t = this;
                seajs.use(["commonStaticDirectory/plugins/daydaoFedComment/daydaoFedReadJq.js"],function (read) {
                    t.read = new read({
                        id: 'read_plugin',
                        uuid: t.reportId
                        ,count: function(count){
                            t.singleReportData.wrData.readCounts = count;
                        }
                    });
                    t.read.addRead(t.reportId, function(){
                        // 添加成功
                        t.getReportById();
                    });
                })
            },
            getPersonInfor:function () {
                var t = this;
                t.$daydao.$ajax({
                    url:gMain.apiBasePath + "wrOrgPerson/getPersonBaseInfo.do"
                    ,async:false
                    ,beforeSend:function () {
                    }
                    ,complete:function () {
                    }
                    ,success:function (data) {
                        if(data.result == "true"){
                            gMain.personInforReport = data.data;
                        }
                    }
                });
            },
            /**
             * 获取图片真实路径
             * @arr 获取的字段集
             * @callback 获取真实图片后的回调
             * */
            getPicTrueUrl:function (aFormStyle ,callback) {
                var t = this;
                //更新图片的url
                var setData = function (arr) {
                    for(var i=0;i<arr.length;i++){
                        //如果是图片类型
                        if(arr[i].field_type == "pic"){
                            arr[i].valueUrls = []; //专门存图片的真实url
                            if($.isArray(arr[i].value)){
                                for(var j=0;j<arr[i].value.length;j++){
                                    //获取图片路径
                                    if(arr[i].value[j]){
                                        t.$daydao.$ajax({
                                            url:gMain.apiPath + "apiCloud/cpCloudCommon/download.do"
                                            ,data:JSON.stringify({uuid:arr[i].value[j]})
                                            ,async:false //同步加载
                                            ,success:function (data) {
                                                if(data.result = "true"){
                                                    arr[i].valueUrls.push({uuid:arr[i].value[j],url:data.data});
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                        }

                        //内嵌字段的处理
                        switch (arr[i].field_type){
                            case "group":
                                arr[i].group.fields = setData(arr[i].group.fields);
                                break;
                            case "twoColumns":
                                arr[i].firstCol.fields = setData(arr[i].firstCol.fields);
                                arr[i].secondCol.fields = setData(arr[i].secondCol.fields);
                                break;
                            case "threeColumns":
                                arr[i].firstCol.fields = setData(arr[i].firstCol.fields);
                                arr[i].secondCol.fields = setData(arr[i].secondCol.fields);
                                arr[i].thirdCol.fields = setData(arr[i].thirdCol.fields);
                                break;
                            default:
                            //

                        }
                    }
                    return  arr;
                };
                aFormStyle = setData(aFormStyle);
                typeof callback == "function" && callback(aFormStyle);
            },
            /**
             * 汇报阅读
             * */
            reportReadStatus:function () {
                var t = this;
                var df = $.Deferred();
                t.$daydao.$ajax({
                    url:gMain.apiBasePath + "wrReportRead/readReportData.do",
                    data:JSON.stringify({
                        reportId:t.reportId+""
                    }),
                    beforeSend:function () {
                    },
                    complete:function () {
                        df.resolve();
                    },
                    success:function(data) {
                        if (data.result == "true") {
                        }
                    }
                });
                return df;
            },
            /*
            * 获取已阅人列表
            * */
            getReadList:function () {
                var t = this;
                var df = $.Deferred();
                t.$daydao.$ajax({
                    url:gMain.apiBasePath + "wrReportRead/appListByReprotId.do",
                    data:JSON.stringify({
                        corpId:t.singleReportData.wrData.corpId+"",
                        reportId:t.reportId+"",
                    }),
                    beforeSend:function () {
                    },
                    complete:function () {
                        df.resolve();
                    },
                    success:function(data) {
                        if (data.result == "true" && data.data.list){
                            t.readList = JSON.parse(JSON.stringify(data.data.list)).slice(0);
                            $.each(t.readList,function (num,val) {
                                if(val.personId == t.personInfor.personId){
                                    t.isRead = true;
                                }
                            })
                            t.pageInforRead.total = t.readList.length;
                            t.showReadHeadImgList = t.pagingData(t.pageInforRead.pageNo,t.pageInforRead.onePageNum,t.readList.slice(0));
                            console.log(t.showReadHeadImgList)
                        }
                    }
                });
                return df;
            }
            /*
            * 点赞组件
            * */
            ,praiseOperation:function (e) {
                var t = this;

                if(t.singleReportData.wrData.praiseInfo.isPraise == 0 && t.canPraiseFlag){
                    t.canPraiseFlag = false;
                    var parameter = {
                        infoId:t.reportId,
                        "ifSendMsg":1,
                        "messageType":38,
                        "extParam":{
                            "uuid":t.reportId,
                            "is_need_st":"1",
                            "projectName":"汇报"
                        },
                        "receivePersonId":t.singleReportData.wrData.personId,
                        "projectName":"汇报"
                    }
                    t.praise.addLike(parameter, function(){
                        t.canPraiseFlag = true;
                        t.singleReportData.wrData.praiseInfo.isPraise = 1;
                        t.singleReportData.wrData.praiseInfo.count += 1;
                    });
                }else if(t.singleReportData.wrData.praiseInfo.isPraise == 1 && t.canPraiseFlag){
                    t.canPraiseFlag = false;
                    t.praise.cancelLike(t.reportId, function(){
                        // 取消成功
                        t.canPraiseFlag = true;
                        t.singleReportData.wrData.praiseInfo.isPraise = 0;
                        t.singleReportData.wrData.praiseInfo.count -= 1;
                    });
                }
                e.stopPropagation();
            }
            /*
             * 点赞
             * */
            ,reportPraise:function (e) {
                var t = this,postUrl,praiseId;
                if(!t.canPraiseFlag){  //请求未完成不能再次请求
                    return;
                }
                if(t.singleReportData.wrData.praiseInfo.isPraise == 0){
                    postUrl = gMain.amBasePath + "cmPraise/addPraise.do";
                }else if(t.singleReportData.wrData.praiseInfo.isPraise == 1){
                    postUrl = gMain.amBasePath + "cmPraise/delPraise.do";
                }
                praiseId = t.singleReportData.wrData.praiseInfo.praiseId;
                t.$daydao.$ajax({
                    url:postUrl,
                    data:JSON.stringify({
                        infoId:t.reportId,
                        "ifSendMsg":1,
                        "messageType":38,
                        "extParam":{
                            "uuid":t.reportId,
                            "is_need_st":"1",
                            "projectName":"汇报"
                        },
                        "receivePersonId":t.singleReportData.wrData.personId,
                        "projectName":"汇报"
                    }),
                    beforeSend:function () {
                        t.canPraiseFlag = false;
                    },
                    complete:function () {
                        t.canPraiseFlag = true;
                    },
                    success:function(data) {
                        if (data.result == "true"){
                            t.singleReportData.wrData.praiseInfo.praiseId = data.data;
                            if(t.singleReportData.wrData.praiseInfo.isPraise == 0){
                                t.singleReportData.wrData.praiseInfo.isPraise = 1;
                                t.singleReportData.wrData.praiseInfo.count += 1;
                                t.praiseRemind();
                            }else{
                                t.singleReportData.wrData.praiseInfo.isPraise = 0;
                                t.singleReportData.wrData.praiseInfo.count -= 1;
                            }
                        }
                    }
                });
            }
            /*
             * 点赞发消息
             * */
            ,praiseRemind:function () {
                var t = this;
                var postData = {
                    imTitle:t.singleReportData.wrData.tempName+"",
                    imBody:"赞："+gMain.personInforReport.personName+"觉得很赞",
                    personId:t.singleReportData.wrData.personId+"",   //汇报发起人的id
                    reportId:t.reportId+"",
                }
                t.$daydao.$ajax({
                    url:gMain.apiBasePath + "wrCmcPraise/sendPraiseImIfFirst.do",
                    data:JSON.stringify(postData),
                    beforeSend:function () {

                    },
                    complete:function () {

                    },
                    success:function(data) {
                        if (data.result == "true"){

                        }
                    }
                });
            }
            /*
            * 加载更多阅读人
            * */
            ,loadMoreReader:function () {
                var t = this;
                if(t.showReadHeadImgList.length < t.pageInforRead.total){
                    t.pageInforRead.pageNo += 1;
                    var arr = t.pagingData(t.pageInforRead.pageNo,t.pageInforRead.onePageNum,t.readList.slice(0))
                    t.showReadHeadImgList = t.showReadHeadImgList.concat(arr);
                }
            }
            /*
             * 数据分页
             * */
            ,pagingData:function (pageNo,onePageNum,allArr) {
                var start,end,t = this;
                start = (pageNo - 1) * onePageNum;
                end = pageNo * onePageNum;
                return allArr.slice(start,end);
            }
            /*
             * 附加项（点赞头像、阅读头像、评论）展开/收起
             * */
            ,openAdditionalContent:function (str) {
                var t = this;
                if(str == "comment"){
                    t.canComment = !t.canComment;
                    t.openReadImg = false;
                    t.openPraiseImg = false;
                }else if(str == "read"){
                    t.canComment = false;
                    t.openReadImg = !t.openReadImg;
                    t.openPraiseImg = false;
                }else if(str == "praise"){
                    t.canComment = false;
                    t.openReadImg = false;
                    t.openPraiseImg = !t.openPraiseImg;
                    if(t.openPraiseImg){
                        t.getAllPraiseData(t.pageInforPraise.pageNo,t.pageInforPraise.onePageNum);
                    }
                }
                t.wrapScrollTopBottom();
            }
            ,wrapScrollTopBottom:function () {
                setTimeout(function () {
                    var innerHeight = $(window).scrollTop();
                    $(window).scrollTop(innerHeight + 200);
                },200)
            }
            /*
             * 获取点赞人列表
             * */
            ,getAllPraiseData:function (pageNo,onePageNum) {
                var t = this;
                t.$daydao.$ajax({
                    url:gMain.amBasePath + "cmPraise/getPraiseInfo.do",
                    data:JSON.stringify({
                        infoId:parseInt(t.reportId),
                        pageNo:parseInt(pageNo),
                        pageSize:parseInt(onePageNum),
                    }),
                    beforeSend:function () {
                    },
                    complete:function () {
                    },
                    success:function(data) {
                        if (data.result == "true" && data.data.list){
                            t.pageInforPraise.total = data.data.recordCount;
                            t.showPraiseHeadImgList = data.data.list.slice(0);
                        }
                    }
                });
            }
            /*
             * 评论页码改变
             * */
            ,changePageNo:function (state) {
                var t = this;
                t.pageInforComment.pageNo = state;
                t.showCommentInforList = t.getAllCommentData(t.pageInforComment.pageNo,t.pageInforComment.onePageNum);
            }
            /*
             * 一页显示的数量
             * */
            ,changeOneDataNum:function (state) {
                var t = this;
                t.pageInforComment.onePageNum = state;
                t.pageInforComment.pageNo = 1;
                t.showCommentInforList = t.getAllCommentData(t.pageInforComment.pageNo,t.pageInforComment.onePageNum);
            }
            /*
             * 点赞头像页码改变
             * */
            ,changePraisePageNo:function (state) {
                var t = this;
                t.pageInforPraise.pageNo = state;
                t.showPraiseHeadImgList =  t.getAllPraiseData(t.pageInforPraise.pageNo,t.pageInforPraise.onePageNum);
            }
            /*
             * 阅读头像页码改变
             * */
            ,changeReadPageNo:function (state) {
                var t = this;
                t.pageInforRead.pageNo = state;
                t.showReadHeadImgList = t.pagingData(t.pageInforRead.pageNo,t.pageInforRead.onePageNum,t.readList);
            }
            /*
             * 评论输入框获取焦点
             * */
            ,commentOnfocus:function () {
                var t = this;
                /*t.replyInfor = {
                    replyHeadImg:null,
                    replyTo:null,
                    replyToName:null,
                }*/
            }
            /*
             * 回复评论输入框获取焦点
             * */
            ,replyOnfocus:function (commentUuid,replyName,replyId,repltHeadImg) {
                var t = this;
                t.replyInfor = {
                    replyHeadImg:null,
                    replyTo:null,
                    replyToName:null,
                }
                t.replyInfor.replyTo = replyId;
                t.replyInfor.replyName = replyName;
                t.replyInfor.repltHeadImg = repltHeadImg;
            }
            /*
             * 评论
             * */
            ,reportComment:function (str,e) {
                var t = this,postUrl;
                postUrl = gMain.amBasePath + "cmComments/addComment.do";
                if(str == "reply"){
                    if(!t.replyContent){
                        return false;
                    }
                    t.postCommentOption.replyTo = t.replyInfor.replyTo;
                    t.postCommentOption.content = t.replyContent;
                }else if(str == "comment"){
                    if(!t.commentContent){
                        return false;
                    }
                    t.postCommentOption.replyTo = null;
                    t.postCommentOption.content = t.commentContent;
                }
                t.postCommentOption.infoId = t.reportId;
                t.postCommentOption.reviewer = t.personInfor.personId;
                t.postCommentOption.receivePersonId = t.singleReportData.wrData.personId;
                t.postCommentOption.extParam = {
                    "uuid":t.reportId,
                    "is_need_st":"1",
                    "projectName":"汇报",
                },
                t.$daydao.$ajax({
                    url:postUrl,
                    data:JSON.stringify(t.postCommentOption),
                    beforeSend:function () {

                    },
                    complete:function () {

                    },
                    success:function(data) {
                        if (data.result == "true"){
                            if(str == "reply"){
                                $(e.target).parents(".reply_comment_box").css("display","none");
                                t.$Message.success("回复成功！")
//                                t.commentRemind("reply",t.replyContent);
                                t.replyContent = "";
                            }else{
//                                t.commentRemind("comment",t.commentContent);
                                t.$Message.success("评论成功！")
                                t.commentContent = "";
                            };
                            t.singleReportData.wrData.commentInfo.isComment = 1;
                            t.pageInforComment = {
                                total:"",
                                pageNo:1,          //当前页
                                onePageNum:10,      //一页显示评论数量
                                onePageNumArr:[10,20,50,100]
                            }
                            t.pageInforComment.pageNo = 1;
                            t.getAllCommentData(t.pageInforComment.pageNo,t.pageInforComment.onePageNum);
                        }
                    }
                });
            }
            /*
             * 回复评论
             * */
            ,replycomment:function (commentUuid,replyName,replyId,repltHeadImg,e) {
                var t = this;
                if($(e.target).parents(".person_comment").find(".reply_comment_box").css("display") == "none"){
                    $(e.target).parents(".person_comment").find(".reply_comment_box").css("display","block");
                    t.commentPlaceholder = "回复@"+replyName+"：对他说点什么吧...";
                }else{
                    $(e.target).parents(".person_comment").find(".reply_comment_box").css("display","none");
                    t.replyContent = null;
                }

            }
            /*
             * 删除评论
             * */
            ,deletecomment:function (uuid) {
                var t = this,postUrl;
                postUrl = gMain.amBasePath + "cmComments/delComment.do";
                t.$daydao.$ajax({
                    url:postUrl,
                    data:JSON.stringify({
                        infoId:parseInt(t.reportId),
                        uuid:parseInt(uuid),
                    }),
                    beforeSend:function () {

                    },
                    complete:function () {

                    },
                    success:function(data) {
                        if (data.result == "true"){
                            t.$Message.success("删除成功！")
                            for(var i = 0;i<t.showCommentInforList.length;i++){
                                if(t.showCommentInforList[i].uuid == uuid){
                                    t.showCommentInforList.splice(i,1);
                                }
                            }
                            t.pageInforComment.total -= 1;
                        }
                    }
                });
            }
            /*
             * 评论发消息
             * */
            ,commentRemind:function (type,content) {
                var t = this,postData;
                if(type == "comment"){
                    postData = {
                        imTitle:t.singleReportData.wrData.tempName+"",
                        // imBody:gMain.personInforReport.personName+"："+content,
                        imBody:content,
                        personId:t.singleReportData.wrData.personId+"",   //汇报发起人的id
                        reportId:t.reportId+"",
                    }
                }else if(type == "reply"){
                    postData = {
                        imTitle:t.singleReportData.wrData.tempName+"",
                        // imBody:gMain.personInforReport.personName+"回复你："+content,
                        imBody:content,
                        personId:t.singleReportData.wrData.personId+"",   //汇报发起人的id
                        reportId:t.reportId+"",
                        replyTo:t.replyInfor.replyTo+"",
                    }
                }
                t.$daydao.$ajax({
                    url:gMain.apiBasePath + "wrCmcPraise/sendCmcPariseImMsg.do",
                    data:JSON.stringify(postData),
                    beforeSend:function () {

                    },
                    complete:function () {

                    },
                    success:function(data) {
                        if (data.result == "true"){

                        }
                    }
                });
            }
            /*
             * 获取当前汇报所有评论
             * */
            ,getAllCommentData:function (pageNo,onePageNum) {
                var t = this,postUrl;
                postUrl = gMain.amBasePath + "cmComments/getCommentsInfo.do";
                t.$daydao.$ajax({
                    url:postUrl,
                    data:JSON.stringify({
                        infoId:parseInt(t.reportId),
                        pageNo:parseInt(pageNo),
                        pageSize:parseInt(onePageNum),
                    }),
                    beforeSend:function () {

                    },
                    complete:function () {
                    },
                    success:function(data) {
                        if (data.result == "true" && data.data.list){
                            t.pageInforComment.total = data.data.recordCount;
                            t.showCommentInforList = data.data.list.slice(0);
                        }
                    }
                });
            }
        },
        components:{
            "form-data-show":formDataShow,
            "personnel-select":personnelSelect
        },
        directives: {
            'list-head-img':function(el,data){
                if (!$.isEmptyObject(data.value)) {
                    var colors = ["#07a9ea","#82c188","#ab97c2","#ffb500","#59ccce","#ff5959"]
                    var _index= parseInt(data.value.personId)%6;
                    if(data.value.headImg){
                        $(el).find("span").hide();
                        $(el).find("img").show();
                    }else{
                        var chinesereg = /^[\u4E00-\u9FA5]+$/;
                        var englishreg = /[A-Za-z]/;
                        var userName = data.value.personName;
                        var showResult;
                        if (userName.length == 1) {//当用户昵称只有一位时，显示全部
                            showResult = userName.toLocaleUpperCase()
                        } else if (userName && chinesereg.test(userName)) {
                            showResult = userName.slice(-2)
                        } else if (userName && englishreg.test(userName)) {
                            showResult = userName.slice(0, 1).toLocaleUpperCase()
                        } else {
                            showResult = userName.slice(0, 2)
                        }
                        $(el).find("span").show();
                        $(el).find("img").hide();
                        $(el).find("span").css({background:colors[_index],display:"block"});
                        $(el).find("span").text(showResult);
                    }
                }
            },
        }
    }
</script>
<style lang="scss" rel="stylesheet/scss">
    html{
        body{
            min-width: 0;
        }
    }
    .ivu-modal-footer{
        display: none;
    }
    .ivu-modal{
        width: 660px !important;
        margin: 0 !important;
    }
    #report_detail_wrap{
        width: 660px;
        margin: 0 auto;
        .infor_left{
            float: left;
            width: 108px;
            word-break: break-all;
            font-size: 14px;
            line-height: 20px;
            color: #90A2B9 ;
            text-align: right;
        }
        .infor_right{
            float: left;
            width: 532px;
            margin-left: 20px;
            word-break: break-all;
            font-size: 14px;
            line-height: 20px;
            color: #3D4651;
        }
        .submit_report_infor{
            padding-top: 6px;
            .sponsor_orgname,.sponsor_personname,.sponsor_submit_time{
                margin-top: 15px;
            }
        }
        .report_receiver{
            .infor_right{
                ul{
                    li.receiver_name{
                        float: left;
                        font-size: 14px;
                        color: #3D4651;
                        margin-left: 10px;
                    }
                    li.receiver_name:nth-child(1){
                        margin-left: 0px;
                    }
                }
            }
        }
        .reportFooter_box{
            width: 100%;
            height: 17px;
            margin-top: 25px;
            margin-bottom: 5px;
            .reportFooter{
                height: 100%;
                float: right;
                .operation_item{
                    float: left;
                    margin-right: 34px;
                    p{
                        float: left;
                        line-height: 17px;
                    }
                    p.iconfont_daydao_common{
                        font-size: 14px;
                        cursor: pointer;
                    }
                    p.operation_item_num{
                        font-size: 12px;
                        color: #657180;
                        margin-left: 10px;
                        cursor: pointer;
                    }
                }
                .operation_item:hover{
                    p.operation_item_num{
                        color: #F18950;
                    }
                    p.iconfont_daydao_common{
                        color: #F18950;
                    }
                }
                .active{
                    p.operation_item_num{
                        color: #F18950;
                    }
                    p.iconfont_daydao_common{
                        color: #F18950;
                    }
                }
            }
        }
        .additional_content_wrap{
            padding: 32px 36px 4px 36px;
            background: #fff;
            position: relative;
            .load_more_read{
                width: 100%;
                height: 61px;
                box-sizing: border-box;
                padding-top: 19px;
                .read_more_btn{
                    width: 180px;
                    margin: 0 auto;
                    text-align: center;
                    font-size: 12px;
                    color: #285DA4;
                    line-height: 12px;
                    cursor: pointer;
                    i{
                        display: inline-block;
                        -moz-transform: scale(.5);
                        -ms-transform: scale(.5);
                        -o-transform: scale(.5);
                        transform: scale(.5);
                    }
                }
                .nomore_reader{
                    text-align: center;
                    font-size: 12px;
                    color: #657180;
                }
                .read_more_btn:hover{
                    color: #ED6C2B;
                }
            }
            .arrow_up{
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-bottom: 8px solid #F5F7F9;
                position: absolute;
                left: 301px;
                top: -8px;
            }
            .people_number{
                margin-bottom: 6px;
                span{
                    color: #ED6C2B;
                    margin-right: 3px;
                }
            }
            .people_headimg_detail{
                display: block;
                width: 100%;
                li{
                    display: block;
                    width: 84px;
                    float: left;
                    margin-bottom: 30px;
                    .img_box{
                        width: 44px;
                        height: 44px;
                        margin: 0 auto;
                        margin-bottom: 5px;
                        img{
                            width: 100%;
                            height: 100%;
                            border-radius: 100%;
                        }
                        span{
                            display: block;
                            width: 100%;
                            height: 100%;
                            border-radius: 100%;
                            font-size: 14px;
                            color: #fff;
                            line-height: 44px;
                            text-align: center;
                        }
                    }
                    .people_name{
                        width: 100%;
                        text-align: center;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        font-size: 14px;
                        color: #657180;
                    }
                }
            }
            .page_search{
                height: 24px;
            }
            .report_base_mmpager{
                float: right;
            }
            .report_base_mmpager .ivu-page-prev{
                background: transparent;
            }
            .page_search{
                height: 24px;
            }
            .report_base_mmpager{
                float: right;
            }
            .report_base_mmpager .ivu-page-next {
                background: transparent;
            }
            .comment_content_input{
                width: 100%;
                height: 100px;
                border: 1px solid #D7DDE4;
                resize: none;
                line-height: 1.6;
                padding: 3px 6px 0;
                box-sizing: border-box;
                font-size: 14px;
            }
            .comment_content_input::-webkit-input-placeholder {
                　　color:#3D4651;
            }
            .comment_content_input:-moz-placeholder {
                　　color:#3D4651;
            }
            .comment_content_input::-moz-placeholder {
                　　color:#3D4651;
            }
            .comment_content_input:-ms-input-placeholder {
                　　color:#3D4651;
            }
            .button_box{
                width: 100%;
                height: 32px;
                padding: 10px 0;
                box-sizing: content-box;
                .comment_submit{
                    width: 60px;
                    height: 30px;
                    font-size: 14px;
                    text-align: center;
                    line-height: 30px;
                    color: #657180;
                    border: none;
                    border-radius: 2px;
                    background: #fff;
                    float: right;
                    cursor: pointer;
                    border: 1px solid #D7DDE4;
                }
                .active{
                    background: #F18950;
                    color: #fff;
                }
            }
            .all_comment_wrap{
                width: 100%;
                padding: 0 3px;
                .person_comment{
                    box-sizing: border-box;
                    width: 100%;
                    min-height: 54px;
                    padding: 9px 0 9px 59px;
                    position: relative;
                    border-top: 1px dashed #e1e1e1;
                    .headimg{
                        width: 46px;
                        height: 46px;
                        position: absolute;
                        left:0;
                        top:9px;
                        img{
                            width: 100%;
                            height: 100%;
                            border-radius: 100%;
                        }
                    }
                }
                .person_comment_personInfo{
                    margin-bottom: 10px;
                    .delete_comment{
                        float: right;
                        color: #f01b2a;
                        cursor: pointer;
                        margin-right: 12px;
                    }
                    .reply_comment{
                        float: right;
                        color: #ed6c2b;
                        cursor: pointer;
                        margin-right: 12px;
                    }
                    .reply_comment_cancel{
                        float: right;
                        color: #8d8d8d;
                        cursor: pointer;
                        margin-right: 12px;
                    }
                    .person_comment_name{
                        color: #333;
                        margin-right: 12px;
                    }
                    .person_comment_createtime{
                        color: #8b8b8b;
                        font-size: 13px;
                    }
                }
                .person_comment_content{
                    color: #8b8b8b;
                    word-break: break-all;
                    a{
                        color: #2486dd;
                        cursor: default;
                    }
                    a:hover{
                        color: #2486dd;
                    }
                    .reply_comment_box{
                        width: 100%;
                        margin-top: 20px;
                    }
                }
            }
        }
        #add_comment_content_wrap{
            .page_search_wrap{
                padding-left: 15px;
            }
            .page_search {
                height: 24px;
                float: left;
                margin-top: 10px;
                .report_base_mmpager{
                }
            }
            .page_search .report_base_mmpager .ivu-page-options-elevator input{
                height: 21px;
            }
            .page_search .ivu-page-next, .ivu-page-prev{
                background-color:transparent;
            }
            .page_search .ivu-page-item{
                background-color:transparent;
            }
            .page_search .ivu-page-item-active{
                background-color: #39f;
            }
        }
        #choose_personnel{
        }
        #comment_wrap{
            position: relative;
            .arrow_up{
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-bottom: 8px solid #F5F7F9;
                position: absolute;
                left: 301px;
                top: -8px;
            }
            .comment-box{
                textarea{
                    height: 100px;
                    margin-bottom: 10px;
                }
            }
        }
        .report_not_find_box{
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            .report_not_find{
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                margin: auto;
                width: 100%;
                height: 257px;
                padding-top: 177px;
                font-size: 14px;
                text-align: center;
                color: #657180;
                line-height: 80px;
                background: url(../assets/images/none.png) no-repeat center 0;
                background-size: 298px 177px;
                padding-left: 12px;
            }
        }
    }
</style>

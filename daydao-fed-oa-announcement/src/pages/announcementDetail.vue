<template>
    <div id="announcement_detail_wrap" v-bind:style="{'padding-bottom':adminJuri ? '60px' : ''}">
        <div id="announcement_detail" v-show="!isEmptyObj(announcementData)">
            <div class="announcement_detail_box">
                <p class="preview_title">{{announcementData.title}}</p>
                <p class="preview_sort clearfix">
                    <span class="preview_classify">{{announcementData.type_name}}</span>
                    <span class="preview_issuer">发布人：{{announcementData.person_name}}</span>
                    <span class="preview_sTime" v-add-ann-time="announcementData"></span>
                </p>
                <p class="preview_content" v-ann-content-handle="announcementData"></p>
                <div class="ann_img_box clearfix">
                    <!--<p class="ofile_type_name">图片：</p>-->
                    <ul class="imglist clearfix">
                        <li v-for="itemPic in oFileList"  :data-uuid="itemPic.resourceUrl-0" v-if="itemPic.fileType == 2">
                            <div class="preview_download_upload">
                                <div class="point_up"></div>
                                <div class="img_operation_item" v-on:click.prevent="previewPic($event,itemPic.realUrl)">
                                    <span>查看</span>
                                </div>
                                <div class="img_operation_item" v-on:click.prevent="downloadFile(itemPic.resourceUrl)">
                                    <span>下载</span>
                                </div>
                            </div>
                            <div class="imglist_imgbox" v-on:click.prevent="previewPic($event,itemPic.realUrl)">
                                <img v-bind:src="itemPic.realUrl" class="previewPic" alt="">
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="addFilePreview clearfix">
                    <!--<p class="ofile_type_name">附件：</p>-->
                    <ul class="filelist clearfix">
                        <li v-for="itemFile in oFileList"  :data-uuid="itemFile.resourceUrl-0" v-if="itemFile.fileType == 1">
                            <div class="preview_download_upload">
                                <div class="point_left"></div>
                                <div class="img_operation_item" v-on:click.prevent="previewFile($event,itemFile.resourceUrl-0,itemFile.fileSort)">
                                    <span>查看</span>
                                </div>
                                <!--<div class="img_operation_item">
                                    <Icon type="ios-cloud-upload-outline"></Icon>
                                    <span>存云盘</span>
                                </div>-->
                                <div class="img_operation_item" v-on:click.prevent="downloadFile(itemFile.resourceUrl)">
                                    <span>下载</span>
                                </div>
                            </div>
                            <!--<span class="icon">图标：</span>-->
                            <span class="filename" :title="itemFile.fileName" v-on:click.prevent="downloadFile(itemFile.resourceUrl)">{{itemFile.fileName}}</span>
                            <!--<span class="size">{{itemFile.fileSize}}</span>-->
                        </li>
                    </ul>
                </div>
                <div class="preview_publish">发布范围({{sReceiver.length}})
                    <template v-for="item in sReceiver">
                        <span class="preview_publisher">{{item.receiver_name}}<i>、</i></span>
                    </template>
                    <div class="publish_Range">
                        <div class="preview_unfold" @click="unfold" v-if="isShow">展开</div>
                        <div class="preview_unfold" @click="unfold" v-else>收起</div>
                    </div>
                </div>
            </div>
            <!--操作项-->
            <div class="reportFooter_box clearfix" v-if="announcementData.status == 1">
                <div class="reportFooter clearfix">
                    <!--阅读-->
                    <div :class="showRead?'operation_item active':'operation_item'" @click="showOperation($event,'read')">
                        <p class="iconfont_daydao_common"  v-if="announcementData.isRead" style="font-size: 20px;line-height: 15px">&#xe67c;</p>
                        <p class="iconfont_daydao_common iconfont_dayoa_read" style="font-size: 20px;line-height: 15px" v-if="!announcementData.isRead">&#xe67c;</p>
                        <p class="operation_item_num">{{announcementData.readCount}}</p>
                    </div>
                    <!--点赞-->
                    <div :class="showPraise?'operation_item active':'operation_item'" @click="praiseOperation($event)">
                        <p class="iconfont_daydao_common" v-if="!announcementData.isPraise">&#xe631;</p>
                        <p class="iconfont_daydao_common iconfont_dayoa_fabulous" style="color: #F65C5E;" v-if="announcementData.isPraise" @click="praiseOperation($event)">&#xe62d;</p>
                        <p class="operation_item_num">{{announcementData.praiseCount}}</p>
                    </div>
                    <!--评论-->
                    <div :class="showComment?'operation_item active':'operation_item'" @click="showOperation($event,'comment')" v-if="announcementData.is_comment">
                        <p class="iconfont_daydao_common" v-if="announcementData.isComment">&#xe62f;</p>
                        <p class="iconfont_daydao_common iconfont_dayoa_comment" v-if="!announcementData.isComment">&#xe62f;</p>
                        <p class="operation_item_num">{{announcementData.commentscount}}</p>
                    </div>
                </div>
            </div>
            <div class="watermark_wrap"></div>
            <div id="comment_wrap" v-show="showComment">
                <div class="arrow_up" style="left: 622px"></div>
                <div id="comment_plugin"></div>
            </div>
            <div id="read_wrap" v-show="showRead">
                <div class="arrow_up" style="left: 622px"></div>
                <div id="read_plugin"></div>
            </div>
            <div id="praise_wrap" v-show="showPraise">
                <div class="arrow_up" style="left: 622px"></div>
                <div id="praise_plugin"></div>
            </div>
        </div>
        <div class="loading" style="position: fixed;width: 100%;height: 100%;left: 0;top: 0;" v-show="isEmptyObj(announcementData)">
            <Spin size="large" fix></Spin>
        </div>
        <div class="data_not_find_box" style="display: none">
            <div class="data_not_find"> 公告已经被删除啦！</div>
        </div>
        <div class="detail_operation_btn_wrap" v-show="adminJuri && announcementType != 'received'">
            <!--status：公告类型：1-发布；2-定时发布；3-草稿；4-撤回；5-删除-->
            <div class="clearfix operation_btn">
                <Button type="primary" v-if="announcementData.status == 1" @click="messagePrompt('4')">撤回</Button>
                <Button type="primary" v-if="announcementData.status == 2 || announcementData.status == 3 || announcementData.status == 4">发布</Button>
                <Button  v-if="announcementData.status == 2 || announcementData.status == 3 || announcementData.status == 4">编辑</Button>
                <Button @click="messagePrompt('5')">删除</Button>
            </div>
        </div>
        <Modal
            v-model="showPromptInfor.canShow"
            :title="showPromptInfor.title"
            @on-ok="singleAnnOperation(showPromptInfor.okFun)">
            <div v-html="showPromptInfor.contentHtml"></div>
        </Modal>
    </div>
</template>
<script type="text/javascript">
    export default{
        props:["pageDetailId","announcementType"],
        data: function () {
            return {
                sTitle:""//公告标题
                ,gMain:gMain
                ,sClassify:""//公告分类
                ,sClassifyId:"" //id
                ,releaser:""//发布人
                ,sTime:""//发布时间
                ,personName:""
                ,adminJuri:false //公告管理员权限
                ,personId:""
                ,sContent:""//公告内容
                ,sReceiver:[]//发布范围
                ,oFileList:[]//附件图片列表
                ,isShow:true //接收人数组是否显示
                ,canPraiseFlag:true //可以点赞
                ,showPromptInfor:{  //撤回删除
                    canShow:false,
                    title:"",
                    contentHtml:"",
                    okFun:"",
                    cancelFun:""
                }
                ,showRead:false
                ,showComment:false
                ,showPraise:false
                ,praiseOperationflag:true
                ,announcementData:{}
                ,announcementId:""
                ,wmarkOption:{}
                ,canEditAnnflag:true //可以打开编辑公告
                ,showComment:false
                ,showRead:false
                ,showPraise:false
                ,isEmptyObj: $.isEmptyObject
            }
        },
        created: function () {
            var t = this;
            t.announcementId = t.$route.params.announcement_id || t.pageDetailId;
            t.getJurisdiction();
            seajs.use(["commonStaticDirectory/plugins/piczoom/imgzoom.js","commonStaticDirectory/plugins/preview.js"],function(imgzoom,filePreview){
                t.imgzoom = imgzoom;
                t.filePreview = filePreview;
            })
            /*阅读新增接口*/
            t.$daydao.$ajax({
                url:gMain.apiBasePath+"announcement/readAm.do"
                ,data:JSON.stringify({
                    "amUuid":t.announcementId,
                })
                ,beforeSend:function () {
                }
                ,complete:function () {
                }
                ,success:function(data){
                    if(data.result == "true"){
                    }
                }
            });
            if(t.announcementData.isRead == 0){
                t.announcementData.isRead = 1;
            }
            t.initDomEvent();
            t.releaseRange(t.announcementId);
            t.$Message.config({
                top: 50,
                duration: 2
            })
        },
        mounted:function () {
            var t = this;
            seajs.use(["commonStaticDirectory/plugins/daydaoFedComment/daydaoFedReadJq.js"],function (read) {
                t.read = new read({
                    id: 'read_plugin',
                    uuid: t.announcementId
                    ,count: function(count){
                        t.announcementData.readCount = count;
                    }
                });
                t.read.addRead(t.announcementId, function(){
                    // 添加成功
                });
            })
            seajs.use(["commonStaticDirectory/plugins/daydaoFedComment/daydaoFedLikeJq.js"],function (praise) {
                t.praise = new praise({
                    id: 'praise_plugin',
                    uuid: t.announcementId
                    ,count: function(count){
                        t.announcementData.praiseCount = count;
                    }
                });
            })
            $.when(t.getWorkersRealName(),t.getAnnouncementById(),t.getAnnFileImg(t.announcementId)).done(function () {
                seajs.use(["commonStaticDirectory/plugins/daydaoFedComment/daydaoFedCommentJq.js"],function (comment) {
                    var params =  {
                        infoId:t.announcementId,
                        "ifSendMsg":1,
                        "messageType":30,
                        "extParam":{
                            "uuid":t.announcementId,
                            "is_need_st":"1",
                            "projectName":"公告"
                        },
                        "receivePersonId":t.announcementData.person_id,
                        "projectName":"公告"
                    }
                    t.comment = new comment({
                        id: 'comment_plugin',
                        params: params
                        ,count: function(count){
                            t.announcementData.commentscount = count;
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
                            t.showOperation("",'comment');
                        }
                    });
                })

                if(t.announcementData.is_watermark == 1){
                    setTimeout(function () {
                        t.addAnnWatermark(t.personName);
                    },100)
                }
            });
        },
        methods: {
            /*
             * 获取单个公告数据
             * */
            getAnnouncementById:function () {
                var t = this;
                var df = $.Deferred();
                t.$daydao.$ajax({
                    url:gMain.apiBasePath + "mobile/getAnnouncement.do",
                    data:JSON.stringify({
                        amUuid:t.announcementId+"",
                    }),
                    beforeSend:function () {
                    },
                    complete:function () {
                    },
                    success:function(data) {
                        if (data.result == "true" && data.data){
                            t.announcementData = data.data;
                            df.resolve();
                        }else if(data.result == "remind"){
                            $("#announcement_detail").hide();
                            $("#announcement_detail_wrap .data_not_find_box").show();
                            if(data.resultDesc == "delete"){
                                $("#announcement_detail_wrap .data_not_find_box .data_not_find").text("公告已经被删除啦！");
                            }else if(data.resultDesc == "cancel"){
                                $("#announcement_detail_wrap .data_not_find_box .data_not_find").text("公告已经被撤回啦！");
                            }else if(data.resultDesc == "notExist"){
                                $("#announcement_detail_wrap .data_not_find_box .data_not_find").text("公告已经被删除啦！");
                            }
                        }

                    }
                });
                return df;
            },
            /*
             * 获取公告附件图片
             * */
            getAnnFileImg:function (uuid) {
                var t = this;
                var df = $.Deferred();
                t.$daydao.$ajax({
                    url:gMain.apiBasePath+"amFile/getFiles.do"
                    ,data:JSON.stringify({"amUuid":uuid})
                    ,success: function (data) {
                        if(data.result=="true" && data.data.list){
                            df.resolve();
                            t.oFileList = data.data.list.slice(0);
                            t.getPicTrueUrl(t.oFileList,function (arr) {
                                t.oFileList = JSON.parse(JSON.stringify(arr)); //表单数据
                            })
                            t.announcementData.oFileList = $.extend({}, t.announcementData.oFileList, t.oFileList);
                        }
                    }
                });
                return df;
            },
            /*
             * 获取职工姓名
             * */
            getWorkersRealName:function () {
                var t = this;
                var df = $.Deferred();
                t.$daydao.$ajax({
                    url:gMain.apiBasePath+"common/getUser.do"
                    ,data:JSON.stringify({})
                    ,success:function(data){
                        if(data.result=="true"){
                            t.personName = data.data.personName;
                            t.personId = data.data.personId;
                            df.resolve();
                        }
                    }
                })
                return df;
            },
            /**
             * 验证用户权限
             */
            getJurisdiction:function(){
                var t=this;
                t.$daydao.$ajax({
                    url:gMain.apiBasePath+"common/validateUser.do"
                    ,data:""
                    ,beforeSend:function () {

                    }
                    ,complete:function () {

                    }
                    ,success:function(data){
                        if(data.result=="true") {
                            if(data.data=="true"){
                                t.adminJuri = true;
                            }else{
                                t.adminJuri = false;
                            }
                        }
                    }
                });
            },
            /*
             * 显示评论、点赞、阅读
             * */
            showOperation:function (e,str) {
                var t = this;
                if(str == "read"){
                    t.showRead = !t.showRead;
                    t.showComment = false;
                    t.showPraise = false;
                }else if(str == "comment"){
                    t.showRead = false;
                    t.showComment = !t.showComment;
                    t.showPraise = false;
                }else if(str == "praise"){
                    t.showRead = false;
                    t.showComment = false;
                    t.showPraise = !t.showPraise;
                }
                t.wrapScrollTopBottom();
            },
            wrapScrollTopBottom:function () {
                var t = this;
                setTimeout(function () {
                    if(t.pageDetailId){
                        var innerHeight = $(".page_slide_wrap").scrollTop();
                        $(".page_slide_wrap").scrollTop(innerHeight + 200);
                    }else{
                        var innerHeight = $(window).scrollTop();
                        $(window).scrollTop(innerHeight + 200);
                    }
                },200)
            },
            /**
             * 获取图片真实路径
             * @arr 获取的字段集
             * @callback 获取真实图片后的回调
             * */
            /*
             * 点赞/取消赞
             * */
            praiseOperation:function (e) {
                var t = this;

                if(t.announcementData.isPraise == 0 && t.praiseOperationflag){
                    t.praiseOperationflag = false;
                    var parameter = {
                        infoId:t.announcementId,
                        "ifSendMsg":1,
                        "messageType":31,
                        "extParam":{
                            "uuid":t.announcementId,
                            "is_need_st":"1",
                            "projectName":"公告"
                        },
                        "receivePersonId":t.announcementData.person_id,
                        "projectName":"公告"
                    }
                    t.praise.addLike(parameter, function(){
                        t.praiseOperationflag = true;
                        t.announcementData.isPraise = 1;
                        t.announcementData.praiseCount += 1;
                    });
                }else if(t.announcementData.isPraise == 1 && t.praiseOperationflag){
                    t.praiseOperationflag = false;
                    t.praise.cancelLike(t.announcementId, function(){
                        // 取消成功
                        t.praiseOperationflag = true;
                        t.announcementData.isPraise = 0;
                        t.announcementData.praiseCount -= 1;
                    });
                }
                e.stopPropagation();
            },
            getPicTrueUrl:function (aFormStyle ,callback) {
                var t = this;
                //更新图片的url
                var setData = function (arr) {
                    for(var i = 0;i<arr.length;i++){
                        if(arr[i].fileType == 2){
                            t.$daydao.$ajax({
                                url:gMain.apiPath  + "apiCloud/cpCloudCommon/download.do"
                                ,data:JSON.stringify({uuid:arr[i].resourceUrl})
                                ,async:false //同步加载
                                ,success:function (data) {
                                    if(data.result = "true"){
                                        arr[i].realUrl = data.data;
                                    }
                                }
                            });
                        }
                    }
                    return  arr;
                };
                aFormStyle = setData(aFormStyle);
                typeof callback == "function" && callback(aFormStyle);
            },
            /*
             * 发布范围
             * */
            releaseRange:function (uuid) {
                var t = this;
                var df = $.Deferred();
                t.$daydao.$ajax({
                    url:gMain.apiBasePath+"receiver/getReceiver.do"
                    ,data:JSON.stringify({
                        "amUuid":uuid,
                    })
                    ,beforeSend:function () {
                    }
                    ,complete:function () {
                    }
                    ,success:function(data){
                        if(data.result == "true"){
                            df.resolve();
                            t.sReceiver = data.data.list.slice(0);
                            t.sReceiver = JSON.parse(JSON.stringify(t.sReceiver));
                            t.announcementData.receiver = $.extend({}, t.announcementData.receiver, t.sReceiver);
                        }
                    }
                })
                return df;
            },
            /*
             * 添加水印
             * */
            addAnnWatermark:function (container, options) {
                var t = this;
                var tpl = '<canvas id = "watermark" width = "160px"  height = "70px" style="display:none;"></canvas>' + '<canvas id = "repeat-watermark"></canvas>';
                $("#announcement_detail .watermark_wrap").append(tpl);
                t.wmarkOption = {
                    docWidth: $("#announcement_detail .announcement_detail_box").width(),
                    docHeight: $("#announcement_detail .announcement_detail_box").height(),
                    fontStyle: "16px 黑体", //水印字体设置
                    rotateAngle: -20 * Math.PI / 180, //水印字体倾斜角度设置
                    fontColor: "rgba(100, 100, 100, 0.2)", //水印字体颜色设置
                    firstLinePositionX: 0, //canvas第一行文字起始X坐标
                    firstLinePositionY: 50, //Y
                    SecondLinePositionX: 0, //canvas第二行文字起始X坐标
                    SecondLinePositionY: 70,//Y
                    watermark:container
                };
                $.extend(t.wmarkOption, options);
                t.draw(t.wmarkOption.docWidth,t.wmarkOption.docHeight);
            },
            /*
             * 画画布
             * */
            draw:function (docWidth, docHeight) {
                var t = this;
                var cw = $('#announcement_detail #watermark')[0];
                var crw = $('#announcement_detail #repeat-watermark')[0];
                crw.width = docWidth;
                crw.height = docHeight;
                var ctx = cw.getContext("2d");
                //清除小画布
                ctx.clearRect(0, 0, 160, 100);
                ctx.font = t.wmarkOption.fontStyle;
                //文字倾斜角度
                ctx.rotate(t.wmarkOption.rotateAngle);
                ctx.fillStyle = t.wmarkOption.fontColor;
                //第一行文字
                ctx.fillText(t.wmarkOption.watermark, t.wmarkOption.firstLinePositionX, t.wmarkOption.firstLinePositionY);
                //第二行文字
                //ctx.fillText(window.watermark.mobile, t.wmarkOption.SecondLinePositionX, t.wmarkOption.SecondLinePositionY);
                //坐标系还原
                ctx.rotate(-t.wmarkOption.rotateAngle);
                var ctxr = crw.getContext("2d");
                //清除整个画布
                ctxr.clearRect(0, 0, crw.width, crw.height);
                //平铺--重复小块的canvas
                var pat = ctxr.createPattern(cw, "repeat");
                ctxr.fillStyle = pat;
                ctxr.fillRect(0, 0, crw.width, crw.height);
            },
            /**
             * 初始化dom事件
             * */
            initDomEvent:function () {
                var  t = this;
                $("#announcement_detail").off("mouseenter.imglist").on("mouseenter.imglist",".imglist li",function () {
                    $(this).find(".preview_download_upload").css({display:"block"});
                });
                $("#announcement_detail").off("mouseleave.imglist").on("mouseleave.imglist",".imglist li",function () {
                    $(this).find(".preview_download_upload").css({display:"none"});
                });
                $("#announcement_detail").off("mouseenter.addFilePreview").on("mouseenter.addFilePreview",".addFilePreview li",function () {
                    $(this).find(".preview_download_upload").css({display:"block"});
                });
                $("#announcement_detail").off("mouseleave.addFilePreview").on("mouseleave.addFilePreview",".addFilePreview li",function () {
                    $(this).find(".preview_download_upload").css({display:"none"});
                });
            },
            /*预览文件*/
            previewFile:function (e,uuid,fileSort) {
                var t = this;
                if(fileSort == 1){   //文件
                    new filePreview({
                        uuid:uuid+""
                        ,title:"文件预览"
                    });
                }else if(fileSort == 2){  //图片
                    t.$daydao.$ajax({
                        url:gMain.apiPath + "apiCloud/cpCloudCommon/download.do"
                        ,data:JSON.stringify({
                            uuid:uuid+""
                        })
                        ,async:false //同步加载
                        ,success:function (data) {
                            if(data.result = "true"){
                                t.previewPic(e,data.data);
                            }
                        }
                    });
                }
            },
            /*
             *  图片预览
             * */
            previewPic:function ($event,src) {
                var t = this;
                new t.imgzoom({
                    width: 640,
                    src: src,
                    autoShow: true
                });
            },
            /*
             * 下载文件
             * */
            downloadFile:function (uuid) {
                var t = this;
                t.$daydao.$ajax({
                    url:gMain.apiPath + "apiCloud/cpCloudCommon/download.do"
                    ,data:JSON.stringify({uuid:uuid})
                    ,beforeSend:function () {
                    }
                    ,complete:function () {
                    }
                    ,success:function (data) {
                        if(data.result = "true"){
                            location.href = data.data;
                        }
                    }
                });
            },
            /*
            * 弹框提示
            *
            * */
            messagePrompt:function (status) {
                var t = this;
                switch (status){
                    case '4':
                        t.showPromptInfor.canShow = true;
                        t.showPromptInfor.title = "提示";
                        t.showPromptInfor.okFun = "4";
                        t.showPromptInfor.contentHtml = "<p style='text-align: center'>你确定要撤回公告吗？</p>"
                        break;
                    case '5':
                        t.showPromptInfor.canShow = true;
                        t.showPromptInfor.title = "提示";
                        t.showPromptInfor.okFun = "4";
                        t.showPromptInfor.contentHtml = "<p style='text-align: center'>你确定要删除公告吗？</p><p style='text-align: center'>删除后将清空记录且无法恢复</p>"
                        break;
                }
            },
            /*
             * 撤回/删除公告
             * */
            singleAnnOperation:function (status) {
                var t = this;
                var postOption = {
                    "dataList": [
                        {
                            "key": "status",
                            "value": status
                        }
                    ],
                    "infoSetId": "am_announce_list",
                    "uuid": t.announcementId
                }
                var df = $.Deferred();
                t.$daydao.$ajax({
                    url:gMain.apiBasePath+"route/am_announce_list/update.do"
                    ,data:JSON.stringify(postOption)
                    ,beforeSend:function () {
                    }
                    ,complete:function () {
                    }
                    ,success:function(data){
                        if(data.result == "true"){
                            df.resolve();
                            if(t.announcementType){
                                $.each(t.$parent.$parent.announcementList,function (num,val) {
                                    if(t.announcementId == val.uuid){
                                        t.$parent.$parent.announcementList.splice(num,1);
                                    }
                                });
                            }
                            t.$Message.success('操作成功！');
                        }
                    }
                })
                return df;
            },
            unfold: function (e) {
                var t=this;
                t.isShow=!t.isShow;
                if(t.isShow){
                    $("#announcement_detail .preview_publish").css({height:""});
                }else {
                    $("#announcement_detail .preview_publish").css({height:"auto"});
                }
                var w = $("#announcement_detail .announcement_detail_box").width();
                var h = $("#announcement_detail .announcement_detail_box").height();
                t.draw(w, h);
            },
            /*
             * 编辑公告
             * */
            editAnnouncement:function () {
                var t = this;
            },
        }
        ,directives: {
            'add-ann-time':function(el,data){
                if (!$.isEmptyObject(data.value)) {
                    var showtime,date;
                    date = new Date(data.value.operation_time);
                    if(data.value.status == "定时发布"){
                        date = new Date(data.value.job_time);
                    }
                    var year,month,day,hour,minute,second;
                    year = date.getFullYear();
                    month = date.getMonth()+1 < 10 ? "0"+(date.getMonth()+1):date.getMonth()+1;
                    day = date < 10 ? "0"+date.getDate():date.getDate();
                    hour = date.getHours() < 10 ? "0"+date.getHours():date.getHours()
                    minute = date.getMinutes() < 10 ? "0"+date.getMinutes():date.getMinutes();
                    showtime = year+"/"+month+"/"+day+" "+hour+":"+minute;
                    if(data.value.status == "定时发布"){
                        $(el).text("将于 "+showtime+" 发布");
                    }else if(data.value.status == "撤回" || data.value.status == "草稿"){
                        $(el).text("最后编辑于 "+showtime);
                    }else{
                        $(el).text("发布时间："+showtime);
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
    html{
        body{
            min-width: 0;
        }
    }
    #announcement_detail_wrap{
        width: 660px;
        margin: 0 auto;
        position: relative;
        padding-bottom: 10px;
        .data_not_find_box{
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            .data_not_find{
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
        .detail_operation_btn_wrap{
            height: 50px;
            width: 660px;
            background: rgba(116, 127, 140,0.8);
            position: fixed;
            right: 0;
            bottom: 46px;
            line-height: 50px;
            .operation_btn{
                display: inline-block;
                float: right;
                margin-right: 100px;
                button{
                    margin-left: 10px;
                }
            }
        }
    }
    #announcement_detail{
        width: 660px;
        position: relative;
        margin: 0 auto;
        box-sizing: border-box;
        padding: 20px;
        padding-bottom: 0;
    }
    #announcement_detail .announcement_detail_box{
        overflow: hidden;
        .preview_title{
            height: 18px;
            line-height: 18px;
            margin-top: 10px;
            font-size: 18px;
            color: #3D4651;
            margin-bottom: 13px;
        }
        .preview_sort{
            height: 14px;
            line-height: 14px;
            font-size: 14px;
            color: #657180;
            text-align: center;
            margin-bottom: 30px;
            .preview_classify{
                height: 14px;
                line-height: 14px;
                display: inline-block;
                float: left;
            }
            .preview_issuer{
                height: 14px;
                line-height: 14px;
                display: inline-block;
            }
            .preview_sTime{
                height: 14px;
                line-height: 14px;
                display: inline-block;
                float: right;
            }
        }
        preview_content{
            text-indent: 2em;
            white-space: normal;
            word-break: break-all;
            font-size: 14px;
            color: #657180;
        }

    }
    #announcement_detail .preview_imgD{
        width: 400px;
        height: 300px;
    }
    #announcement_detail .preview_imgF{
        text-align: center;
    }
    #announcement_detail .preview_imgLi{
        height: 50px;
        width: 70px;
        opacity: 0.5;
    }
    #announcement_detail .preview_imgSure{
        border:1px solid #f57536;
        opacity: 1;
    }
    #announcement_detail .preview_file{
        height: 30px;
        line-height: 30px;
    }
    #announcement_detail .preview_fileIcon{
        width: 20px;
        height: 20px;
        display: inline-block;
        background: url("../assets/images/announcement_accessory_icon.png") no-repeat;
        margin-left: 20px;
        vertical-align: middle;
    }
    #announcement_detail .preview_publish{
        width: 100%;
        line-height: 20px;
        overflow: hidden;
        word-break: break-all;
        padding-right: 30px;
        position: relative;
        height: 20px;
        overflow-y: hidden;
        font-size: 14px;
        color: #90A2B9;
    }
    #announcement_detail .preview_publish span:nth-child(1){
        margin-left: 15px;
    }
    #announcement_detail .preview_publish span{
        color: #657180;
    }
    #announcement_detail .preview_publish span i{
        font-style: normal;
    }
    #announcement_detail .preview_publish span:nth-last-child(2) i{
        display: none;
    }
    #announcement_detail .preview_publisher{
        display: inline-block;
    }
    #announcement_detail .preview_unfold{
        display: inline-block;
        width: 30px;
        height: 20px;
        line-height: 20px;
        position: absolute;
        top:0;
        right:0px;
        color: #3D4651;
        cursor: pointer;
    }
    #announcement_detail .preview_unfold:hover{
        color: #666;
    }
    #announcement_detail .preview_height{
        height: 30px;
    }

    /*文件上传预览*/
    #announcement_detail .addFilePreview{
        margin: 20px 0;
    }
    #announcement_detail .addFilePreview li{
        position: relative;
        margin-bottom: 10px;
    }
    #announcement_detail .addFilePreview .icon{
        background: url(../assets/images/bgs.png) -1px -161px;
        width: 23px;
        height: 23px;
        text-indent: -999em;
        overflow: hidden;
        float: left;
    }
    #announcement_detail .addFilePreview .filename{
        font-size: 14px;
        line-height: 14px;
        color: #4B9FFA;
        max-width: 532px;
        word-break: break-all;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
    }
    #announcement_detail .addFilePreview .size{
        line-height: 23px;
        margin-left: 10px;
        position: absolute;
        right: -61px;
    }
    #announcement_detail .addFilePreview .status{
        line-height: 23px;
        margin-left: 10px;
        position: absolute;
        right: -132px;
    }

    /*文件上传预览 --结束*/

    /*图片展示开始*/
    #announcement_detail .ann_img_box{
        margin-top: 20px;
    }
    #announcement_detail .ofile_type_name{
        line-height: 30px;
    }
    #announcement_detail .imglist{
        float: left;
    }
    #announcement_detail .imglist li{
        width: 83px;
        float: left;
        margin-right: 24px;
        position: relative;
        height: 83px;
        /*overflow: hidden;*/
        margin-bottom: 20px;
    }
    #announcement_detail .imglist li:nth-child(6n){
        margin-right: 0;
    }
    #announcement_detail .imglist li .imglist_imgbox{
        width: 83px;
        position: relative;
        height: 83px;
        overflow: hidden;
        border: 1px solid #ccc;
        cursor: pointer;
    }
    #announcement_detail .imglist li img{
        position: absolute;
        top: 50%;
        -ms-transform:translate(-50%, -50%);
        -moz-transform:translate(-50%, -50%);
        -webkit-transform:translate(-50%, -50%);
        -o-transform:translate(-50%, -50%);
        transform: translate(-50%, -50%);
        max-width: 83px;
        left: 50%;
    }
    /*图片展示结束*/
    /*图片附件操作项开始*/
    #announcement_detail .preview_download_upload{
        display: none;
        width: 155px;
        height: 36px;
        background: rgba(0,0,0,0.5);
        position: absolute;
        left: 0px;
        top:68px;
        z-index: 9;
        box-sizing: border-box;
        padding: 0px 10px;
    }
    #announcement_detail .addFilePreview .preview_download_upload{
        left:166px;
        top:0px;
    }
    #announcement_detail .preview_download_upload .point_up{
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-bottom: 8px solid rgba(0,0,0,0.5);
        position: absolute;
        left: 24px;
        top:-8px;
    }
    #announcement_detail .addFilePreview .preview_download_upload .point_left{
        width: 0;
        height: 0;
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-right: 8px solid rgba(0,0,0,0.5);
        position: absolute;
        left: -8px;
        top:13px;
        display: none;
    }
    #announcement_detail .preview_download_upload .img_operation_item{
        float: left;
        height: 100%;
        margin-right: 30px;
        cursor: pointer;
    }
    #announcement_detail .preview_download_upload .img_operation_item:nth-last-child(1){
        margin-right: 0px;
    }
    #announcement_detail .preview_download_upload .img_operation_item span{
        color: #fff;
        display: inline-block;
        height: 100%;
        line-height: 36px;
        float: left;
        margin-left: 5px;
    }
    #announcement_detail .preview_download_upload .img_operation_item i{
        color: #fff;
        font-size: 24px;
        display: inline-block;
        line-height: 36px;
        height: 100%;
        float: left;
    }
    #announcement_detail .preview_download_upload .img_operation_item:hover i,#announcement_detail .preview_download_upload .img_operation_item:hover span{
        color: #ed6c2b;
    }
    #announcement_detail .preview_download_upload .img_operation_item i.ivu-icon-ios-cloud-download-outline{
        font-size: 20px;
        line-height: 38px;
    }
    /*图片附件操作项结束*/
    #announcement_detail  .watermark_wrap{
        position:absolute;
        z-index:-1;
        top:0;
        background: #fff;
    }

    /*操作项开始*/
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
                margin-right: 35px;
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
            .operation_item:nth-last-child(1){
                margin-right: 0;
            }
        }
    }
    /*操作项结束*/
    #comment_wrap{
        background: #F5F7F9;
        padding: 23px 40px;
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
</style>

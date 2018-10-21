/**
 * Created by THINK on 2017/3/13.
 * 汇报列表显示
 */
define(function(require, exports, module) {
    require("js/modules/reportsListClassify/reportsListClassify.css");
    var sTpl = require("js/modules/reportsListClassify/reports-list-classify.html");

    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");

    var AuditSelect = require("js/modules/auditSelect/auditSelect.js"); //添加接收人组件

    //表单数据展示插件
    require("js/modules/formDataShow/formDataShow.js");

    Vue.component('reports-list-classify', Vue.extend({
        props: ['reportList']
        ,template: sTpl
        ,data:function(){
            return {
                oFileList:{}  //各个表单待上传的文件列表
                ,gMain:gMain
                ,iIndexGroup:0
                ,recipientList:[] //接收人列表
                ,mouseReportId:null //当前鼠标移上去的汇报ID
                ,canPraiseFlag:true   //可以执行点赞操作
                ,reporterInfor:this.reportList.reporterInfor //发起人信息
                ,canOpenPreview:true   //打开预览详情的控制开关
                ,shareReciverList:[]    //分享接收人列表
                ,readHeadImgList:[]  //所有阅读头像列表
                ,showReadHeadImgList:[] //当前显示阅读头像
                ,iconEnterFlag:{     //鼠标移进icon图标是否请求接口
                    iconReadFirst:true,
                    iconFabulousFirst:true,
                    iconCommentFirst:true,
                }
                ,pageInforRead:{
                    total:0,
                    pageNo:1,          //当前页
                    onePageNum:10,      //一页显示汇报数量
                    onePageNumArr:[10,20,50,100]
                }
            };
        }
        ,watch:{
            'reportList.reportListsArr':function () {
                var t = this;
                console.log(t.reportList);
            },
        }
        ,attached:function () {
            var t =this;
            t.initDomEvent();
        }
        ,methods:{
            /*
            * 随机色
            * */
            randomColor:function (uuid) {
                var t = this;
                var  aColors = ["background:#07a9ea","background:#82c1a7","background:#ab97c2","background:#ffb500","background:#59ccce"]; //蓝，绿，紫，黄，浅蓝
                var i = parseInt(uuid)%5;
                return aColors[i];
            },
            /*
            * 预览单个汇报
            * */
            previewSingleReport:function (reportId,previewType,e,tempName) {
                var t = this;

                if(t.canOpenPreview){
                    t.canOpenPreview = false;
                    Ajax.ajax({
                        url:gMain.apiBasePath + "wrReportData/getReportDataById.do",
                        data:JSON.stringify({
                            reportId:reportId+"",
                        }),
                        beforeSend:function () {
                            $("body").loading({zIndex:999999999}); //开启提交遮罩
                        },
                        complete:function () {
                            $("body").loading({state:false}); //关闭提交遮罩
                        },
                        success:function(data) {
                            if (data.result == "true"){
                                var creaTimeObj = {
                                    createTime:data.data.data.wrData.createTime,
                                    modifyTime:data.data.data.wrData.modifyTime,
                                }
                                t.reporterInfor = $.extend(t.reporterInfor,creaTimeObj);//发起时间
                                t.recipientList = data.data.data.receiverList.slice(0);
                                if(previewType == "singlePre"){
                                    t.doWaitForAudit(data.data.data,previewType,"",tempName);
                                }else if(previewType == "comment"){
                                    t.doWaitForAudit(data.data.data,"singlePre","comment",tempName);
                                }else{                                             //草稿预览
                                    t.doPreviewAudit(data.data.data,previewType,tempName)
                                }
                            }
                        }
                    });
                }

            },
            /*
            * 创建预览组件实例
            * */
            doWaitForAudit:function (opts,previewType,comment,tempName) {
                var t = this;
                var personName,orgName,fixedInfor;
                var nodeDataInfor = JSON.parse(opts.wrData.nodeData);
                try{
                    $.each(nodeDataInfor,function (num,val) {
                        if(val.field_type == "default_field" && val.field_name == "personInfor"){
                            fixedInfor = $.extend({},fixedInfor,val.value);
                        }
                    })
                }catch(e){};
                if(fixedInfor && fixedInfor.orgName != "undefined"){
                    personName = fixedInfor.personName;
                    orgName = fixedInfor.orgName;
                }else{
                    personName = opts.wrData.personName;
                    orgName = opts.wrData.orgName;
                }
                require.async("js/modules/waitForAudit/waitForAudit.js",function (waitForAudit) {
                    new waitForAudit({
                        reporterInfor:[            //发起人信息
                            {
                                inforTitle:"部门"
                                ,inforContent:orgName  //我收到的发起人根据汇报变化  我发起的不需要
                            },
                            {
                                inforTitle:"提交人"
                                ,inforContent:opts.wrData.personName
                            },
                            {
                                inforTitle:"提交时间"
                                ,inforContent:t.reporterInfor.modifyTime
                            },
                        ],   //发起人t.reporterInfor
                        recipientList:t.recipientList, //接收人
                        previewType:previewType,
                        nodeData:opts.wrData.nodeData,
                        forwardType:opts.wrData.forwardType+"",    //是否禁止转发
                        singleReportData:opts,
                        reportsListClassify:t,
                        comment:comment?comment:"",
                        tempName:tempName,
                        reportListClassify:t,
                    });
                });
            },
            /*
             * 创建可编辑组件实例
             * */
            doPreviewAudit:function (opts,previewType,tempName) {
                var t = this;
                require.async("js/modules/previewAudit/previewAudit.js",function (previewAudit) {
                    new previewAudit({
                        reporterInfor:t.reporterInfor,   //发起人
                        recipientList:t.recipientList, //接收人
                        previewType:previewType,
                        nodeData:opts.wrData.nodeData,      //表单数据
                        forwardType:opts.wrData.forwardType+"",    //是否禁止转发
                        data:opts.wrData,
                        reportsListClassify:t,
                        tempName:tempName
                    });
                });
            },
            /*
             * 删除草稿
             * */
            deleteDraftReport:function (uuid,operationStr) {
                var t = this;
                for(var i = 0;i<t.reportList.reportListsArr.length;i++){  //删除dom
                    if(t.reportList.reportListsArr[i].uuid == uuid){
                        t.reportList.reportListsArr.splice(i,1);
                    }
                }
                if(operationStr == "deleteRealy"){    //是否是删除操作 还是提交草稿成功之后的dom删除
                    Ajax.ajax({
                        url:gMain.apiBasePath + "wrReportData/deleteReportData.do",
                        data:JSON.stringify({
                            reportId:uuid+""
                        }),
                        beforeSend:function () {
                            $("body").loading({zIndex:999999999}); //开启提交遮罩
                        },
                        complete:function () {
                            $("body").loading({state:false}); //关闭提交遮罩
                        },
                        success:function(data) {
                            if (data.result == "true") {
                                tools.showMsg.ok("删除成功"); //成功提示弹层
                            }
                        }
                    });
                }
            },
            /*
             * 分享
             * */
            reportShare:function (e,uuid,tempName,nodeData) {
                var t = this;
                var imBody = "";
                var imbodyFun = function (obj) {
                    if(obj.label){
                        imBody = imBody+obj.label+"<br/>";
                    }
                    if(obj.field_type == "pic"){

                    }else if(obj.field_type == "file"){  //文件另做处理
                        if(obj.value){
                            $.each(obj.value,function (num,val) {
                                imBody = imBody+val.fileName+"<br/>";
                            })
                        }
                    }else if(obj.field_type != "default_field"){
                        if(obj.value){
                            imBody = imBody+obj.value+"<br/>";
                        }
                    }
                }
                if(nodeData.length>3){
                    for(var i = 0;i<3;i++){
                        if(nodeData[i].field_type == "twoColumns" || nodeData[i].field_type == "threeColumns"){
                            $.each(nodeData[i].firstCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            $.each(nodeData[i].secondCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            if(nodeData[i].thirdCol){
                                $.each(nodeData[i].thirdCol.fields,function (num,val){
                                    imbodyFun(val);
                                })
                            }
                        }else{
                            imbodyFun(nodeData[i]);
                        }
                    }
                }else {
                    for(var i = 0;i<nodeData.length;i++){
                        if(nodeData[i].field_type == "twoColumns" || nodeData[i].field_type == "threeColumns"){
                            $.each(nodeData[i].firstCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            $.each(nodeData[i].secondCol.fields,function (num,val){
                                imbodyFun(val);
                            })
                            if(nodeData[i].thirdCol){
                                $.each(nodeData[i].thirdCol.fields,function (num,val){
                                    imbodyFun(val);
                                })
                            }
                        }else{
                            imbodyFun(nodeData[i]);
                        }
                    }
                }
                new AuditSelect({
                    addType:"multiple",
                    title:"添加转发接收人",
                    origin:"reportShare",
                    isSelectPos:false,
                    reportId:uuid,
                    imTitle:tempName,
                    imBody:imBody,
                    afterSelect:function (data,obj) {
                        var isHasSame = false;
                        t.shareReciverList = [];
                        //过滤重复的
                        _.each(data,function (obj) {
                            if(_.findIndex(t.shareReciverList,{person_id:obj.audit_person_id}) == -1){
                                t.shareReciverList.push({
                                    "person_id" : obj.audit_person_id,
                                    "person_name" : obj.audit_person_name,
                                    "person_img":obj.audit_person_img
                                });
                            }else{
                                isHasSame = true;
                            }
                        });
                        if(isHasSame){
                            tools.showMsg.ok("已经去除重复选择的抄送人");
                        }
                        obj.remove();
                    }
                });
            },
            /*
             * 阅读人详情
             * */
            reportReadDetail:function (start,onePageNum,theReportData) {
                var t = this;
                Ajax.ajax({
                    url:gMain.apiBasePath + "wrReportRead/listByReprotId.do",
                    data:JSON.stringify({
                        offset:start - 0,
                        limit:onePageNum - 0,
                        corpId:theReportData.corpId+"",
                        reportId:t.mouseReportId+"",
                    }),
                    beforeSend:function () {
                        $(".headimg_box .loading").show(); //开启提交遮罩
                    },
                    complete:function () {
                        $(".headimg_box .loading").hide(); //关闭提交遮罩
                    },
                    success:function(data) {
                        if (data.result == "true" && data.data.list){   //多余10个后台只传10个
                            t.showReadHeadImgList = data.data.list.slice(0);
                        }else{
                            t.readHeadImgList = [];
                            t.showReadHeadImgList = [];
                        }
                    }
                });
            },
            /*
             * 阅读头像页码改变
             * */
            changeReadPageNo:function (state) {
                var t = this;
                t.pageInforRead.pageNo = state;
                t.pagingData(t.pageInforRead.pageNo,t.pageInforRead.onePageNum);
            },
            /*
             * 数据分页
             * */
            pagingData:function (pageNo,onePageNum) {
                var start,end,t = this;
                start = (pageNo - 1) * onePageNum;
                // end = pageNo * onePageNum;
                t.reportReadDetail(start,onePageNum);
            },
            /*
             * 点赞
             * */
            reportPraise:function (reportId,isPraise,e,personId,tempName) {
                var t = this,postUrl,praiseId;
                if(!t.canPraiseFlag){  //请求未完成不能再次请求
                    return;
                }
                if(isPraise == '0'){
                    postUrl = gMain.amBasePath + "cmPraise/addPraise.do";
                }else if(isPraise == '1'){
                    postUrl = gMain.amBasePath + "cmPraise/delPraise.do";
                }
                praiseId = parseInt($(e.target).attr("praise-id"));
                Ajax.ajax({
                    url:postUrl,
                    data:JSON.stringify({
                        infoId:reportId,
                        "ifSendMsg":1,
                        "messageType":38,
                        "extParam":{
                            "uuid":reportId,
                            "is_need_st":"1",
                            "projectName":"汇报"
                        },
                        "receivePersonId":personId,
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
                            for(var i = 0;i<t.reportList.reportListsArr.length;i++){
                                if(t.reportList.reportListsArr[i].uuid == (reportId+"")){
                                    if(isPraise == '0'){
                                        t.reportList.reportListsArr[i].praiseInfo.isPraise = 1;
                                        t.reportList.reportListsArr[i].praiseInfo.praiseId = data.data;
                                        t.reportList.reportListsArr[i].praiseInfo.count += 1;
                                    }else if(isPraise == '1'){
                                        t.reportList.reportListsArr[i].praiseInfo.isPraise = 0;
                                        t.reportList.reportListsArr[i].praiseInfo.praiseId = null;
                                        t.reportList.reportListsArr[i].praiseInfo.count -= 1;
                                    }
                                }
                            }
                            if(isPraise == '0'){
                                t.praiseRemind(reportId,personId,tempName);
                            }
                        }
                    }
                });
            },
            /*
            * 点赞发消息
            * */
            praiseRemind:function (reportId,personId,tempName) {
                var t = this;
                var oUser = tools.Cache.getCache("oHeaderData","session");
                var userInfor = {
                    "orgName":""+oUser.userInfo.orgName,
                    "personName":""+oUser.userInfo.userName
                }
                var postData = {
                    imTitle:tempName+"",
                    imBody:"赞："+gMain.personInforReport.personName+"觉得很赞",
                    personId:personId+"",   //汇报发起人的id
                    reportId:reportId+"",
                }
                Ajax.ajax({
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
            },
            /*
             * 初始化dom事件
             * */
            initDomEvent:function () {
                var t = this;
                /*鼠标移进icon图标*/
                $(".reportContent").off("mouseenter.operation_item").on("mouseenter.operation_item",".iconfont_dayoa",function (){
                    t.mouseReportId = $(this).parents(".singleReport").attr("data-uuid");
                    var dataOperaName = $(this).parent(".operation_item").attr("data-operaName");
                    if(dataOperaName == "read" && t.iconEnterFlag.iconReadFirst){
                        t.readHeadImgList = [];
                        for(var i=0;i<t.reportList.reportListsArr.length;i++){
                            if(t.reportList.reportListsArr[i].uuid == t.mouseReportId && t.iconEnterFlag.iconReadFirst){
                                t.reportReadDetail(0,10,t.reportList.reportListsArr[i]);
                                t.iconEnterFlag.iconReadFirst = false;
                                t.pageInforRead.total = t.reportList.reportListsArr[i].readCounts;
                                if(t.pageInforRead.total == 0){
                                    $(this).siblings(".headimg_box").hide();
                                }else {
                                    $(this).siblings(".headimg_box").show();
                                }
                                $(this).parent(".operation_item").siblings().find(".headimg_box").hide();
                            }
                        }
                       /* for(var i=0;i<t.reportList.reportListsArr.length;i++){
                            if(t.reportList.reportListsArr[i].uuid == t.mouseReportId && t.iconEnterFlag.iconReadFirst){
                                t.showReadHeadImgList = t.reportList.reportListsArr[i].readerList.list;
                                t.pageInforRead.total = t.reportList.reportListsArr[i].readCounts;
                                t.iconEnterFlag.iconReadFirst = false;
                                if(t.pageInforRead.total == 0){
                                    $(this).siblings(".headimg_box").hide();
                                }else {
                                    $(this).siblings(".headimg_box").show();
                                }
                                $(this).parent(".operation_item").siblings().find(".headimg_box").hide();
                            }
                        }*/
                    }else if(dataOperaName == "fabulous" && t.iconEnterFlag.iconFabulousFirst){

                    }else if(dataOperaName == "comment" && t.iconEnterFlag.iconCommentFirst){

                    }
                });
                /*鼠标移出单个汇报*/
                $(".reportContent").off("mouseleave.singleReport").on("mouseleave.singleReport",".singleReport",function (e) {
                    $(this).find(".headimg_box").hide();
                    t.pageInforRead = {
                        total:0,
                        pageNo:1,          //当前页
                        onePageNum:10,      //一页显示汇报数量
                        onePageNumArr:[10,20,50,100]
                    }
                    t.iconEnterFlag.iconReadFirst = true;
                    t.iconEnterFlag.iconFabulousFirst = true;
                    t.iconEnterFlag.iconCommentFirst = true;
                });
                $(".reportContent").delegate(".ivu-page-next,.ivu-page-prev,.headimg_box_content li","mouseenter mouseleave",function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                })
            },
            closeHeadImgBox:function (e) {
                $(e.target).parents(".headimg_box").hide();
            }
        }
        ,directives:{
            "start-time-handle":function (data) {
                if (!$.isEmptyObject(data)){
                    var nowDate =new Date(data.startTime.slice(0,10));//截取日期字符串转换问日期变量
                    var theWeek = nowDate.getDay(); //当天为周几
                    var daysOfMonth = nowDate.getDate(); //这个月的第几天
                    var monthOfYear = nowDate.getMonth()+1; //今年的几月份
                    var theYear = nowDate.getFullYear(); //年
                    var weekOfMonth = "";   //这个月的第几周
                    var arr = ["日","一","二","三","四","五","六"];
                    if(theWeek == 0){     //这天刚好是周日
                        weekOfMonth = Math.floor(daysOfMonth/7);
                    }else {
                        weekOfMonth = Math.floor((daysOfMonth + 7 - theWeek)/7);
                    }
                    var theWeekStr = theWeek+"";
                    theWeekStr ="周" + theWeekStr.replace(new RegExp(theWeekStr, "g"),arr[theWeek]);
                    if(data.tempName == "周报"){
                        var monday
                        if(theWeek == 0){     //这天刚好是周日
                            monday = new Date(nowDate.getTime() - 6*24*60*60*1000);
                            theYear = monday.getFullYear(); //年
                            monthOfYear = monday.getMonth()+1; //今年的几月份
                            daysOfMonth = monday.getDate(); //这个月的第几天
                            theWeek = monday.getDay(); //当天为周几
                        }else {
                            monday = new Date(nowDate.getTime() - (theWeek - 1)*24*60*60*1000);
                            theYear = monday.getFullYear(); //年
                            monthOfYear = monday.getMonth()+1; //今年的几月份
                            daysOfMonth = monday.getDate(); //这个月的第几天
                            theWeek = monday.getDay(); //当天为周几
                        }
                        weekOfMonth = Math.floor((daysOfMonth + 7 - theWeek)/7);
                        $(this.el).html(theYear+"年"+monthOfYear+"月"+"第"+weekOfMonth+"周");
                    }else if(data.tempName == "月报"){
                        $(this.el).html(theYear+"年"+monthOfYear+"月");
                    }else{
                        $(this.el).html(theYear+"-"+monthOfYear+"-"+daysOfMonth+"("+theWeekStr+")");
                    }
                }
            }
        }
    }));


});
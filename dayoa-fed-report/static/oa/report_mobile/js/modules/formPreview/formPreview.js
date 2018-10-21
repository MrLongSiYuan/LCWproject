/**
 * Created by Zackey on 2016/12/9.
 * 表单预览
 */
define(function(require, exports, module) {
    require("js/modules/formPreview/formPreview.css");
    var sTpl = require("js/modules/formPreview/formPreview.html");

    require("js/plugins/jquery.mobiscroll/mobiscroll.android-ics-2.5.2.css");
    require("js/plugins/jquery.mobiscroll/mobiscroll.core-2.5.2.css");

    // 日期选择控件
    require("js/plugins/jquery.mobiscroll/mobiscroll.datetime-2.5.1.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.datetime-2.5.1-zh.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.android-ics-2.5.2.js");

    // 选择控件
    require("js/plugins/jquery.mobiscroll/jquery.scrollSelect.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.core-2.5.2.js");


    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");

    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");
    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框
    //日历控件
    // require("commonStaticDirectory/plugins/My97DatePicker/WdatePicker.js");

    var updateFile = require("commonStaticDirectory/plugins/updateFile-qcloud/updateFile-qcloud.js");
    var w = require("js/plugins/callAppHandler.js");//h5与浏览器通信
    var _ver = require("js/plugins/versionHeader.js");  //判断是否4.5版本以上

    Vue.component('form-preview', Vue.extend({
        props: ['afields','quoteclick']
        ,template: sTpl
        ,data:function(){
            return {
                oFileList:{}  //各个表单待上传的文件列表
                ,gMain:gMain
                ,iIndexGroup:0
                ,changeFlag:true    //第一次改变afields
                ,coverShow:false
                ,typeListShow:false
                ,showInputType:null
                ,chooseResult:[]  //单选多选结果
                ,groupList:[]
                ,resizeFlag:false  //改变提交按钮position状态标志
                ,resizeTimeout:""  //定时器
            };
        }
        ,watch:{
            "afields":function (val) {
                var t = this;
                if(t.changeFlag){
                    for(var i = 0;i<t.afields.length;i++){
                        if(t.afields[i].field_type == "pic"){
                            t.oFileList[t.afields[i].field_name] = t.afields[i].valueUrls;
                        }
                        if(t.afields[i].field_type == "file"){
                            t.oFileList[t.afields[i].field_name] = t.afields[i].value;
                        }
                    }
                    t.oFileList = JSON.parse(JSON.stringify(t.oFileList));
                    for(var i = 0;i<t.afields.length;i++){
                        if(t.afields[i].field_type == "group"){
                            t.afields[i].data_can_add = "canadd"
                        }
                    }
                    t.afields = JSON.parse(JSON.stringify(t.afields));
                    t.changeFlag = false;
                }
                console.log(t.afields)
                t.$nextTick(function () {
                    // DOM 现在更新了
                    t.initDateTimeSelectControl();
                    t.groupCount();
                })
            },
            "quoteclick":function () {     //父级触发了引用上一次汇报
                var t = this;
                for(var i = 0;i<t.afields.length;i++){
                    if(t.afields[i].field_type == "pic"){
                        t.oFileList[t.afields[i].field_name] = t.afields[i].valueUrls;
                    }
                    if(t.afields[i].field_type == "file"){
                        t.oFileList[t.afields[i].field_name] = t.afields[i].value;
                    }
                }
                t.oFileList = JSON.parse(JSON.stringify(t.oFileList));
                t.afields = t.getParagraph(t.afields);
            }
        }
        ,attached:function () {
            var t =this;
            if(t.judgeMobileType() == "1"){
                $(window).on("resize",function () {
                    if(t.resizeFlag){   //窗口大小改变输入框获焦
                        t.resizeFlag = false;
                        if($("#single_report_handle").find(".report_submit_wrap").css("position") == "static"){
                            $("#single_report_handle").find(".report_submit_wrap").css({position:""});
                            $("#single_report_handle").find(".blank_for_submitBtn").css({height:""});
                        }
                    }
                })
            }
        }
        ,beforeDestroy:function () {
            if($(".dayhApp_scrollSelect").length){
                $(".dayhApp_scrollSelect").remove();
                $(".dayhApp_scrollSelect_shade").remove();
            }
            if($(".android-ics").length){
                $(".android-ics").remove();
            }
        }
        ,methods:{
            /*
             * 进入多选
             * */
            showOrHideCover:function (e,fieldName,name,options) {
                var t = this;
                var chooseInfor = {
                    name:name,
                    fieldName:fieldName,
                    options:options,
                    value:$(e.target).val(),
                }
                var headerColor;
                if(_ver.versionHeader()){
                    headerColor = "";
                }else{
                    headerColor = "473f3a";
                }
                var data = {
                    leftBtn: "back", //左边按钮，””表示无左边按钮
                    headerColor: headerColor, //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
                w.callAppHandler("h5_set_page_title", name);
                window.localStorage.setItem("chooseInfor",JSON.stringify(chooseInfor));
                localStorage.setItem("wintop",$("body").scrollTop());
                $("#single_report_handle").hide();
                window.location.href = window.location.href+"/chooseCover";
                $(e.target).blur();
            },
            /*
             * 筛选多行文本
             * */
            getParagraph:function (arr) {
                var t = this;
                for(var i = 0;i<arr.length;i++){
                    if(arr[i].field_type == "paragraph"){
                        if(arr[i].value){
                            arr[i].value = arr[i].value.replace(/<br\/>/g,'\n');
                        }
                    }else if(arr[i].field_type == "group"){
                        arr[i].group.fields = t.getParagraph(arr[i].group.fields);
                    }
                }
                return arr;
            },
            /*
            * 输入获取焦点
            * */
            inputOnfocus:function (e) {
                var t = this
                t.resizeFlag = false;
                var manageBtn = function () {
                    clearTimeout(t.resizeTimeout);
                    $("#single_report_handle").find(".report_submit_wrap").css({position:"static"});
                    $("#single_report_handle").find(".blank_for_submitBtn").css({height:"17px"});
                    t.resizeTimeout = setTimeout(function () {
                        t.resizeFlag = true;
                    },500)
                }
                manageBtn();
                $(e.target).off("click").on("click",function () {
                    manageBtn();
                })
            },
            /*
             * 输入失去焦点
             * */
            inputOnblur:function (e) {
                var t = this
                if(t.judgeMobileType() == "1"){
                    t.resizeFlag = false;
                }
                $(e.target).off("click");
                if(t.judgeMobileType() == "0"){
                    if(t.resizeFlag){
                        t.resizeFlag = false;
                        if($("#single_report_handle").find(".report_submit_wrap").css("position") == "static"){
                            $("#single_report_handle").find(".report_submit_wrap").css({position:""});
                            $("#single_report_handle").find(".blank_for_submitBtn").css({height:""});
                        }
                    }
                }
            },
            judgeMobileType:function () {
                var u = navigator.userAgent, app = navigator.appVersion;
                if(/AppleWebKit.*Mobile/i.test(navigator.userAgent) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))){
                    if(window.location.href.indexOf("?mobile")<0){
                        try{
                            if(/iPhone|mac|iPod|iPad/i.test(navigator.userAgent)){
                                return '0';
                            }else{
                                return '1';
                            }
                        }catch(e){}
                    }
                }else if( u.indexOf('iPad') > -1){
                    return '2';
                }else{
                    return '3';
                }
            },
            /*
            * 确定或者取消选择
            * */
            chooseSureOrCancel:function (e,type) {
                var t = this;
                if(type == "sure"){
                    var chooseResultStr = t.chooseResult.join(",");
                    $(e.target).parents(".choose_cover_wrap").siblings("input").val(chooseResultStr);
                }
                t.chooseResult = [];
                t.showOrHideCover("hide");
            },
            inputTextarea:function (e) {
                var num = $(e.target).context.value.length;
            }
            //展开更多内容
            ,slideUpRemark:function (e) {
                $(e.target).parents(".f_remark_wrap").find(".remark_cover_wrap").show();
                $(e.target).parents(".f_remark_wrap").find(".remark_cover_footer").animate({
                    bottom:"0"
                },200);
            }
            //收起更多内容
            ,slideDownRemark:function (e) {
                $(e.target).parents(".f_remark_wrap").find(".remark_cover_footer").animate({
                    bottom:"-220px"
                },200);
                $(e.target).parents(".f_remark_wrap").find(".remark_cover_wrap").hide();
            }
            //初始化插件
            ,initJqueryPlugins:function () {
                var t =this;
                //日历插件
                var that = this;
                var myDate=new Date();
                //myDate.setDate(myDate.getDate());//默认截止时间为明天
                //t.initDateTimeSelectControl(myDate);
                t.initDateTimeSelectControl(myDate);
            }
            //初始化radio单选控件
            ,initRadioType:function(e,radioList){
                var that = this;
                $(e.target).blur()
                if($(".dayhApp_scrollSelect").length){
                    $(".dayhApp_scrollSelect").remove();
                    $(".dayhApp_scrollSelect_shade").remove();
                }
                var lists = [];
                var key='',value=$(e.target).val();
                var obj={};
                var index;
                for(var i=0;i<radioList.length;i++){
                    obj={
                        key:i+1,
                        holId:radioList[i].holId,
                        value:radioList[i].label
                    };
                    lists.push(obj);
                    if(value && value == radioList[i].label){
                        index = i;
                    }
                }
                $(e.target).val(value).attr('data-sid',index+1).scrollSelect({
                    eleType:"input" //节点类型
                    ,data:lists
                    ,rows:4
                    ,callback: function($el){
                        var t = this;
                        var val = $(".dw-li[aria-selected = 'true']").find("div").text();
                        $(e.target).val(val);
                    }
                });
                $(".dw-li").eq(index).attr({class:"dw-li dw-v dw-sel","aria-selected":"true"}).siblings(".dw-li").attr({class:"dw-li dw-v","aria-selected":"false"});
                $(".dw-ul").css({transform:"translate3d(0px, -"+index*40+"px, 0px)"});
            }
            //初始化时间选择控件
            ,initDateTimeSelectControl:function(){
                var that = this;
                var currYear = (new Date()).getFullYear();
                var options = {
                    theme: 'android-ics light', //皮肤样式
                    display: 'modal', //显示方式
                    mode: 'scroller', //日期选择模式
                    lang:'zh',
                    startYear:currYear-100, //开始年份
                    endYear:currYear + 10, //结束年份
                    setText:'完成',
                    cancelText:'取消',
                    dateFormat:'yyyy-mm-dd',
                    preset : 'date',
                    custom:'',      // ampm hm
                    onSelect:function(data){
                        var t = this;
                    }
                };
                $(that.$el).off("focus.Wdate").on("focus.Wdate","input.Wdate",function (e) {
                    var myDate = new Date();
                    var _name = $(this).attr("name");
                    var $startDate = $(that.$el).find('input[name=' + _name + ']').eq(0).val();
                    var $endDate = $(that.$el).find('input[name=' + _name + ']').eq(1).val();
                    var thisVal = $(e.target).val();
                    if(thisVal){
                        myDate = new Date(thisVal);
                        if($(this).attr("data-type") == "1"){ //ios NaN
                            thisVal = thisVal.replace(/-/g,':').replace(' ',':');
                            thisVal = thisVal.split(':');
                            myDate = new Date(thisVal[0],(thisVal[1]-1),thisVal[2],thisVal[3],thisVal[4]);
                        }
                    }
                    if($(this).attr("data-type") == "1"){ //年月日时分
                        options = {
                            theme: 'android-ics light', //皮肤样式
                            display: 'modal', //显示方式
                            mode: 'scroller', //日期选择模式
                            lang:'zh',
                            startYear:currYear-100, //开始年份
                            endYear:currYear + 10, //结束年份
                            setText:'完成',
                            cancelText:'取消',
                            preset : 'datetime',
                            custom:'',      // ampm hm
                            onSelect:function(data){
                                var t = this;
                            }
                        }
                        $.extend(options,{custom:'hm', width: 50});
                        if($(this).hasClass("startDate")){
                            if($endDate != ""){
                                $endDate = $endDate.replace(/-/g,':').replace(' ',':');
                                $endDate = $endDate.split(':');
                                options.maxDate = new Date($endDate[0],($endDate[1]-1),$endDate[2],$endDate[3],$endDate[4]);
                            }
                            $(this).mobiscrollDT(options).datetime(options).mobiscrollDT('setDate', myDate, true);
                        }else if($(this).hasClass("endDate")){
                            if($startDate != ""){
                                $startDate = $startDate.replace(/-/g,':').replace(' ',':');
                                $startDate = $startDate.split(':');
                                options.minDate = new Date($startDate[0],($startDate[1]-1),$startDate[2],$startDate[3],$startDate[4]);
                            }
                            $(this).mobiscrollDT(options).datetime(options).mobiscrollDT('setDate', myDate, true);
                        }else{
                            $(this).mobiscrollDT(options).datetime(options).mobiscrollDT('setDate', myDate, true);
                        }
                    }else if($(this).attr("data-type") == "2"){ //年月日
                        options = {
                            theme: 'android-ics light', //皮肤样式
                            display: 'modal', //显示方式
                            mode: 'scroller', //日期选择模式
                            lang:'zh',
                            startYear:currYear-100, //开始年份
                            endYear:currYear + 10, //结束年份
                            setText:'完成',
                            cancelText:'取消',
                            dateFormat:'yyyy-mm-dd',
                            preset : 'date',
                            custom:'',      // ampm hm
                            onSelect:function(data){
                                var t = this;
                            }
                        }
                        if($(this).hasClass("startDate")){
                            if($endDate != ""){
                                options.maxDate = new Date($endDate);
                            }
                            $(this).mobiscrollDT(options).date(options).mobiscrollDT('setDate', myDate, true);
                        }else if($(this).hasClass("endDate")){
                            if($startDate != ""){
                                options.minDate = new Date($startDate);
                            }
                            $(this).mobiscrollDT(options).date(options).mobiscrollDT('setDate', myDate, true);
                        }else{
                            $(this).mobiscrollDT(options).date(options).mobiscrollDT('setDate', myDate, true);
                        }
                    }else if($(this).attr("data-type") == "3"){ //年月
                        var options = {
                            theme: 'android-ics light', //皮肤样式
                            display: 'modal', //显示方式
                            mode: 'scroller', //日期选择模式
                            lang:'zh',
                            startYear:currYear-100, //开始年份
                            endYear:currYear + 10, //结束年份
                            setText:'完成',
                            cancelText:'取消',
                            dateFormat:'yyyy-mm',
                            dateOrder:'yyyymm',
                            preset : 'date',
                            custom:'',      // ampm hm
                            onSelect:function(data){
                                var t = this;
                            }
                        }
                        if($(this).hasClass("startDate")){
                            if($endDate != ""){
                                options.maxDate = new Date($endDate);
                            }
                            $(this).mobiscrollDT(options).date(options).mobiscrollDT('setDate', myDate, true);
                        }else if($(this).hasClass("endDate")){
                            if($startDate != ""){
                                options.minDate = new Date($startDate);
                            }
                            $(this).mobiscrollDT(options).date(options).mobiscrollDT('setDate', myDate, true);
                        }else{
                            // $(this).find(".Wdate").mobiscrollDT(options).date(options).mobiscrollDT();
                            $(this).mobiscrollDT(options).date(options).mobiscrollDT('setDate', myDate, true);
                        }
                    }
                    $(this).blur();
                });
            }

            //上传图片
            ,uploadImg:function($event){
                var t = this;
                var param = {
                    num:"9" //  num为""时表示拍照 num最大值为9
                }
                w.callAppHandler("h5_photos_picker_new", param);
                var interval = setInterval(function(){
                    //获取到上传图片列表
                    var name = $($event.target).attr("name");
                    t.oFileList[name] = t.oFileList[name] || [];
                    // gMain.h5ImgList = [
                    //     {
                    //         "name":"1.jpg",
                    //         "size":"121.16",
                    //         "src":window.btoa("https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1794894692,1423685501&fm=117&gp=0.jpg")
                    //     },
                    // ]
                    // gMain.getPhoteosNew = true;
                    //当前上传了几张图片
                    var currentImg = $($event.target).parents(".addPicPreview").find("img.preview").length;
                    if(currentImg >= 9){
                        amyLayer.alert("最多只允许上传9张图片");
                        clearInterval(interval);
                        return;
                    }
                    if(gMain.getPhoteosNew){
                        if(gMain.h5ImgList && gMain.h5ImgList.length > 0){
                            clearInterval(interval);
                            $("body").loading({zIndex:999});
                            setTimeout(function () {
                                $("body").loading({state:false}); //关闭提交遮罩
                            },5000)
                            //如果当前上传图片未超过9张，判断还有上传几张
                            var upImgLength = 9 - currentImg;
                            var canImg = "";
                            if(upImgLength > gMain.h5ImgList.length){
                                canImg = gMain.h5ImgList.length;   //选取张数
                            }else{
                                //截取能上传的图片
                                canImg = upImgLength;    //剩余张数
                            }
                            for(var i=0; i<canImg; i++){
                                var oFile = gMain.h5ImgList[i];
                                var imgType = oFile.name.split(".")[1].toLowerCase(); //图片类型
                                var oFileInfo = {
                                    uuid:""
                                    ,tempId:"id-" + name + "-" + i + "-" + (new Date()).getTime()
                                    ,size:oFile.size
                                    ,sizeWithUnit:tools.formatSize(oFile.size)
                                    ,fileName:oFile.name
                                    ,uploadStatus:"uploading" //上传中
                                    ,url:"data:" + imgType +";base64," + oFile.src
                                };
                                t.oFileList[name].push(oFileInfo);
                                // alert(oFileInfo.size)
                                if(oFileInfo.size > 10 * 1024 * 1024){
                                    oFileInfo.uploadStatus = "faild";//上传失败
                                    amyLayer.alert("图片大小不能超过10M");
                                    continue;
                                }

                                var dataURL = 'data:image/' + imgType + ';base64,' + oFile.src;  //图片的base64编码
                                var data = dataURL.split(',')[1];
                                data = window.atob(data);

                                var ia = new Uint8Array(data.length);
                                for (var s = 0; s < data.length; s++) {
                                    ia[s] = data.charCodeAt(s);
                                };
                                //canvas.toDataURL 返回的默认格式就是 image/png
                                var blob=new Blob([ia], {type:"image/" + imgType});
                                blob.name = oFile.name;//文件流不包含图片名，将图片名放入文件流中
                                new updateFile({
                                    oFile:blob //上传的文件
                                    ,tempId:oFileInfo.tempId
                                    ,bucketName:"cloudp"//腾讯云的bucketName
                                    ,appid:"10061427"//为项目的 APPID；
                                    ,successUpload:function (data) {
                                        for(var j=0;j<t.oFileList[name].length;j++){
                                            if(t.oFileList[name][j].tempId == data.tempId){
                                                t.oFileList[name][j].uuid = data.uuid + "";
                                                //t.oFileList[name][j].url = t.oFileList[name][j];
                                                t.oFileList[name][j].uploadStatus = "success"; //上传成功
                                            }
                                            //alert("腾讯云成功后："+ oFile.name);
                                            t.oFileList = tools.parseJson(t.oFileList);
                                        }

                                    }
                                    ,errorUpload:function (data) {
                                        for(var j=0;j<t.oFileList[name].length;j++){
                                            if(t.oFileList[name][j].tempId == data.tempId){
                                                t.oFileList[name][j].uploadStatus = "faild"; //上传失败
                                            }
                                        }
                                        t.oFileList = tools.parseJson(t.oFileList);
                                    }
                                });
                            }
                            gMain.getPhoteosNew = false;
                            gMain.h5ImgList = [];
                            t.oFileList = tools.parseJson(t.oFileList);
                            $("body").loading({state:false}); //关闭提交遮罩
                            //t.updateFile(currentIndex,$event);
                        }
                    }

                }, 300);
            }
            /****
             * 上传附件
             * ***/
            ,uploadFile:function($event){
                var t = this;
                $($event.target).blur();
                w.callAppHandler("h5_open_daypan", "9") //daypan界面

                var interval = setInterval(function(){
                    //获取到上传图片列表
                    var name = $($event.target).attr("name");
                    t.oFileList[name] = t.oFileList[name] || [];

                    //当前上传了几张图片
                    var currentFile = $($event.target).parents(".addFile").siblings(".addFilePreview").find("li").length;
                    if(currentFile >= 9){
                        amyLayer.alert("最多只允许上传9个附件");
                        clearInterval(interval);
                        return;
                    }
                    if(gMain.h5FileDayoa && gMain.h5FileDayoa.length > 0){
                        clearInterval(interval);
                        $("body").loading({zIndex:999});
                        setTimeout(function () {
                            $("body").loading({state:false}); //关闭提交遮罩
                        },5000)
                        //如果当前上传附件未超过9个，判断还有上传几个
                        var upFileLength = 9 - currentFile;
                        var canFile = "";
                        if(upFileLength > gMain.h5FileDayoa.length){
                            canFile = gMain.h5FileDayoa.length;
                        }else{
                            //截取能上传的附件
                            canFile = upFileLength;
                        }
                        for(var i=0; i<canFile; i++){
                            var oFile = gMain.h5FileDayoa[i];
                            var oFileInfo = {
                                tempId:"id-" + name + "-" + i + "-" + (new Date()).getTime()
                                ,fileName:oFile.fileName
                                ,fileSort:oFile.fileSort  //文件类型 1:文件 2:图片
                                ,dfsId:oFile.dfsId
                                ,size: oFile.fileSize
                                ,sizeWithUnit:tools.formatSize(oFile.fileSize*1024)
                                ,uuid:oFile.dfsId
                            };
                            t.oFileList[name].push(oFileInfo);

                            var fileSort = oFile.fileSort  //文件类型 1:文件 2:图片 99:zip类型
                            /*安卓以kb为单位ios以b为单位*/
                            if(fileSort == 2){
                                // alert(oFileInfo.size)
                                if(oFileInfo.size > parseInt($($event.target).attr("data-fileSize")) * 1024 * 1024){
                                    amyLayer.alert("文件最大上传"+ $($event.target).attr("data-fileSize") +"M");
                                    continue;
                                }
                            }else if(fileSort == 1){ //文件最大上传20M
                                // alert(oFileInfo.size)
                                if(oFileInfo.size > parseInt($($event.target).attr("data-fileSize")) * 1024 * 1024){
                                    amyLayer.alert("文件最大上传"+ $($event.target).attr("data-fileSize") +"M");
                                    continue;
                                }
                            }else if(fileSort == 99){
                                // alert(oFileInfo.size)
                                if(oFileInfo.size > parseInt($($event.target).attr("data-fileSize")) * 1024 * 1024){
                                    amyLayer.alert("文件最大上传"+ $($event.target).attr("data-fileSize") +"M");
                                    continue;
                                }
                            }
                            t.oFileList = tools.parseJson(t.oFileList);
                        }
                        gMain.h5FileDayoa = [];
                        t.oFileList = tools.parseJson(t.oFileList);
                        $("body").loading({state:false}); //关闭提交遮罩
                        // alert(JSON.stringify(t.oFileList))
                    }
                }, 300);
            }
            //获取图片地址
            ,getFileUrl:function (oFile,tempId,callback) {
                var t = this;
                var reader = new FileReader();
                reader.readAsDataURL(oFile);
                reader.onload = function (e) {
                    var url = e.target.result;
                    typeof callback == "function" && callback(tempId,url);
                }
            }
            //删除图片、文件
            ,delFilePreview:function (fieldName,$index) {
                var t = this;
                t.oFileList[fieldName].splice($index,1);
            }
            //添加明细
            ,addGroupItem:function ($event,item) {
                var t = this;
                var trueFieldName = item.field_name.slice(0,18);
                var oItem = $.extend({},JSON.parse(JSON.stringify(item)));
                var index = _.findIndex(t.afields,{field_name:item.field_name}); //被添加这个明细
                oItem.field_name = trueFieldName + "_new_" + String(t.iIndexGroup);
                oItem.data_class = "new-group";
                if(oItem.group.fields){
                    for(var i=0;i<oItem.group.fields.length;i++){
                        oItem.group.fields[i].field_name = oItem.group.fields[i].field_name.slice(0,18) + "_new_" + String(t.iIndexGroup);
                        if(oItem.group.fields[i].value){
                            oItem.group.fields[i].value = "";
                        }
                        if(oItem.group.fields[i].valueUrls){
                            oItem.group.fields[i].valueUrls = "";
                        }
                    }
                }
                t.iIndexGroup += 1;
                t.afields[index].data_can_add = "noadd";
                t.afields.splice(index+1,0,oItem);
            }

            //移除明细
            ,removeGroupItem:function ($event,item) {
                var t = this;
                var trueFieldName = item.field_name.slice(0,18);
                var  indexGroup;  //同一类的明细
                $.each(t.afields,function (num,val) {
                    if(val.field_name.indexOf(trueFieldName) != -1){
                        indexGroup = num;
                    }
                });
                var index = _.findIndex(t.afields,{field_name:item.field_name});
                if(index == indexGroup){
                    t.afields[indexGroup - 1].data_can_add = "canadd";
                }
                if(item.field_name.indexOf("_new_") != -1){
                    t.afields.splice(index,1);
                }
            }
            /*
            * 第一次明细统计
            * */
            ,groupCount:function () {
                var t = this;
                for(var i = 0;i<t.afields.length;i++){
                    if(t.afields[i].field_type == "group"){
                        t.groupList[t.afields[i].field_name] = new Array(t.afields[i]);
                    }
                }
            }
            //大写
            ,capitalShow:function ($event,item) {
                var t = this;
                var $target = $($event.target);
                var val = $target.val();
                if(!val){$target.val("");}
                var index = val.indexOf('.');
                if(index !== -1){
                    var integer = val.substring(0, index+1);
                    var decimal = val.substring(index + 1);
                    $target.val(integer + decimal.substring(0, 2));
                }
                if(item.capital == "true"){
                    if($target.val().length > 10){
                        $target.val($target.val().slice(0,10));
                    }
                    $target.parents(".form_number_box").find(".capitalShow > span").text(t.arabiaToChinese($target.val()));
                }
            }
            /**
             * 转换成人民币大写
             * */
            ,arabiaToChinese:function (Num) {
                var t =this;
                for(i=Num.length-1;i>=0;i--)
                {
                    Num = Num.replace(",","")
                    Num = Num.replace(" ","")
                }
                Num = Num.replace("￥","")
                if(isNaN(Num)) {
                    alert("请检查小写金额是否正确");
                    return;
                }
                part = String(Num).split(".");
                newchar = "";
                for(i=part[0].length-1;i>=0;i--){
                    if(part[0].length > 10){ alert("位数过大，无法计算");return "";}
                    tmpnewchar = ""
                    perchar = part[0].charAt(i);
                    switch(perchar){
                        case "0": tmpnewchar="零" + tmpnewchar ;break;
                        case "1": tmpnewchar="壹" + tmpnewchar ;break;
                        case "2": tmpnewchar="贰" + tmpnewchar ;break;
                        case "3": tmpnewchar="叁" + tmpnewchar ;break;
                        case "4": tmpnewchar="肆" + tmpnewchar ;break;
                        case "5": tmpnewchar="伍" + tmpnewchar ;break;
                        case "6": tmpnewchar="陆" + tmpnewchar ;break;
                        case "7": tmpnewchar="柒" + tmpnewchar ;break;
                        case "8": tmpnewchar="捌" + tmpnewchar ;break;
                        case "9": tmpnewchar="玖" + tmpnewchar ;break;
                    }
                    switch(part[0].length-i-1){
                        case 0: tmpnewchar = tmpnewchar +"元" ;break;
                        case 1: if(perchar!=0)tmpnewchar= tmpnewchar +"拾" ;break;
                        case 2: if(perchar!=0)tmpnewchar= tmpnewchar +"佰" ;break;
                        case 3: if(perchar!=0)tmpnewchar= tmpnewchar +"仟" ;break;
                        case 4: tmpnewchar= tmpnewchar +"万" ;break;
                        case 5: if(perchar!=0)tmpnewchar= tmpnewchar +"拾" ;break;
                        case 6: if(perchar!=0)tmpnewchar= tmpnewchar +"佰" ;break;
                        case 7: if(perchar!=0)tmpnewchar= tmpnewchar +"仟" ;break;
                        case 8: tmpnewchar= tmpnewchar +"亿" ;break;
                        case 9: tmpnewchar= tmpnewchar +"拾" ;break;
                    }
                    newchar = tmpnewchar + newchar;
                }
                if(Num.indexOf(".")!=-1){
                    if(part[1].length > 2) {
                        part[1] = part[1].substr(0,2)
                    }
                    for(i=0;i<part[1].length;i++){
                        tmpnewchar = ""
                        perchar = part[1].charAt(i)
                        switch(perchar){
                            case "0": tmpnewchar="零" + tmpnewchar ;break;
                            case "1": tmpnewchar="壹" + tmpnewchar ;break;
                            case "2": tmpnewchar="贰" + tmpnewchar ;break;
                            case "3": tmpnewchar="叁" + tmpnewchar ;break;
                            case "4": tmpnewchar="肆" + tmpnewchar ;break;
                            case "5": tmpnewchar="伍" + tmpnewchar ;break;
                            case "6": tmpnewchar="陆" + tmpnewchar ;break;
                            case "7": tmpnewchar="柒" + tmpnewchar ;break;
                            case "8": tmpnewchar="捌" + tmpnewchar ;break;
                            case "9": tmpnewchar="玖" + tmpnewchar ;break;
                        }
                        if(i==0)tmpnewchar =tmpnewchar + "角";
                        if(i==1)tmpnewchar = tmpnewchar + "分";
                        newchar = newchar + tmpnewchar;
                    }
                }
                while(newchar.search("零零") != -1)
                    newchar = newchar.replace("零零", "零");
                newchar = newchar.replace("零亿", "亿");
                newchar = newchar.replace("亿万", "亿");
                newchar = newchar.replace("零万", "万");
                newchar = newchar.replace("零元", "元");
                newchar = newchar.replace("零角", "");
                newchar = newchar.replace("零分", "");
                if (newchar.charAt(newchar.length-1) == "元" || newchar.charAt(newchar.length-1) == "角")
                    newchar = newchar+"整"
                return newchar;
            }
            /*
            *  图片预览
            * */
            ,previewPic:function ($event,uuid) {
                var t = this;
                // if( $($event.target).attr("data-status") != "true"){
                //     Ajax.ajax({
                //         url:gMain.basePath + "apiCloud/cpCloudCommon/download.do"
                //         ,data:JSON.stringify({uuid:uuid})
                //         ,beforeSend:function () {
                //             $($event.target).next("img").show();
                //         }
                //         ,complete:function () {
                //             $($event.target).next("img").hide();
                //         }
                //         ,success:function (data) {
                //             if(data.result = "true"){
                //                 $($event.target).attr("src",data.data).attr("data-status","true");
                //             }
                //         }
                //     });
                // }else{
                //     dialog({
                //         title:"图片预览"
                //         ,content:'<img src="'+$($event.target).attr("src")+'" width="600" style="margin-bottom: 20px;">'
                //     }).showModal();
                // }
                dialog({
                    title:"图片预览"
                    ,content:'<img src="'+$($event.target).attr("src")+'" width="600" style="margin-bottom: 20px;">'
                }).showModal();
            }
        }
        ,transitions:{
            // "fade_cover":{
            //     enter:function () {
            //         var t = this;
            //         t.typeListShow = true;
            //     }
            // },
            // "type_rise":{
            //     leave:function () {
            //         var t = this;
            //         t.coverShow = false;
            //     }
            // }
        }
    }));


});
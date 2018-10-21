/**
 * Created by Zackey on 2016/12/9.
 * 表单预览
 */
define(function(require, exports, module) {
    require("js/modules/formPreview/formPreview.css");
    var sTpl = require("js/modules/formPreview/formPreview.html");

    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");

    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");
    //日历控件
    require("commonStaticDirectory/plugins/My97DatePicker/WdatePicker.js");

    var updateFile = require("commonStaticDirectory/plugins/updateFile-qcloud/updateFile-qcloud.js");
    var filePreview =  require("commonStaticDirectory/plugins/preview.js"); //文件预览插件

    Vue.component('form-preview', Vue.extend({
        props: ['afields','quoteclick']
        ,template: sTpl
        ,data:function(){
            return {
                oFileList:{}  //各个表单待上传的文件列表
                ,gMain:gMain
                ,iIndexGroup:0
                ,changeFlag:true  //第一次改变afields
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
                    // t.changeFlag = false;
                }
                console.log(t.afields)
                t.$nextTick(function () {
                    // DOM 现在更新了
                    t.initJqueryPlugins();
                })
            },
            "quoteclick":function () {     //父级触发了引用上一次汇报
                var t = this;
                t.afields = t.getParagraph(t.afields);
            }
        }
        ,attached:function () {
            var t =this;
        }
        ,methods:{
            previewFile:function (e,uuid,fileSort) {
                var t = this;
                if(fileSort == 1){   //文件
                    new filePreview({
                        uuid:uuid
                        ,title:"文件预览"
                    });
                }else if(fileSort == 2){  //图片
                    Ajax.ajax({
                        url:gMain.basePath + "apiCloud/cpCloudCommon/download.do"
                        ,data:JSON.stringify({
                            uuid:uuid
                        })
                        ,async:false //同步加载
                        ,success:function (data) {
                            if(data.result = "true"){
                                t.previewPic(e,data.data);
                            }
                        }
                    });
                }
            }
            /*
             * 筛选多行文本
             * */
            ,getParagraph:function (arr) {
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
            }
            //展开收起更多内容
            ,slideUpRemark:function ($event) {
                if($($event.target).attr("data-isslideup") == "true"){
                    $($event.target).parent().parent().css({height:"30px",paddingBottom:"0"});
                    $($event.target).text("展开").attr("data-isslideup","false");
                    $($event.target).parents(".f_remark_wrap").css({"padding-right":"49px"});
                }else{
                    $($event.target).parent().parent().css({height:"auto",paddingBottom:"27px"});
                    $($event.target).text("收起").attr("data-isslideup","true");
                    $($event.target).parents(".f_remark_wrap").css({"padding-right":"0px"});
                }
            }
            //初始化插件
            ,initJqueryPlugins:function () {
                var t =this;
                //日历插件
                $(t.$el).off("focus.Wdate").on("focus.Wdate","input.Wdate",function () {
                    var that = this;
                    var _name = $(this).attr("name");
                    var $startDate = $(t.$el).find('input[name=' + _name + ']').eq(0);
                    var $endDate = $(t.$el).find('input[name=' + _name + ']').eq(1);
                    if($(this).attr("data-type") == "1"){
                        sDateFmt = "yyyy-MM-dd HH:mm"; //年月日时分
                    }else if($(this).attr("data-type") == "2"){
                        sDateFmt = "yyyy-MM-dd"; //年月日
                    }else if($(this).attr("data-type") == "3"){
                        sDateFmt = "yyyy-MM"; //年月
                    }
                    if($endDate.length != 0){
                        $startDate.off("click").on("click",function(){
                            WdatePicker({dateFmt:sDateFmt,maxDate:$endDate.val()});
                        });
                        $endDate.off("click").on("click",function(){
                            WdatePicker({dateFmt:sDateFmt,minDate:$startDate.val()});
                        });
                    }else{
                        $(that).off("click").on("click",function(){
                            WdatePicker({dateFmt:sDateFmt});
                        });
                    }
                });
            }
            /*
            * 判断单选/多选控件的默认选择
            * */
            ,setCheckbox:function (value1,value2) {
                var t = this;
                if(_.indexOf(value2,value1) != -1){
                    return true;
                }else{
                    return false;
                }
            }
            //上传图片
            /*,uploadImg:function ($event) {
                //获取图片的真实地址，来预览
                Ajax.ajax({
                    url:gMain.basePath + "apiCloud/cpCloudCommon/download.do"
                    ,data:JSON.stringify({uuid:uuid})
                    ,success:function (data) {
                        if(data.result = "true"){
                            $($event.target).parent().parent().find(".addPicPreview").find("img[data-id='"+tempId+"']").attr("src",data.data).parent().attr("href",data.data).parent().attr("data-uuid",uuid);
                        }
                    }
                });
            }*/
            //上传文件
            ,uploadFile:function ($event,fileType) {
                var t = this;
                var userAgent = navigator.userAgent.toLowerCase();
                uaMatch = userAgent.match(/trident\/([\w.]+)/);

                //排除IE11的这个错误提示，因为IE11会执行两次uploadFile方法，第二次这里为空了，导致提示请选择文件的误报
                if(!$($event.target).val() && uaMatch[1] != "7.0"){
                    tools.showMsg.error("请先选择文件");
                    return false;
                }

                var name = $($event.target).attr("name");
                t.oFileList[name] = t.oFileList[name] || [];

                //循环添加
                for(var i=0;i<$event.target.files.length;i++){
                    var oFile = $event.target.files[i];
                    var fileSort;
                    if(oFile.type.substr(0,5) == "image"){
                        fileSort = 2;
                    }else{
                        fileSort = 1;
                    }
                    var oFileInfo = {
                        uuid:""
                        ,tempId:"id-" + name + "-" + i + "-" + (new Date()).getTime()
                        ,fileSort:fileSort
                        ,size:oFile.size
                        ,sizeWithUnit:tools.formatSize(oFile.size)
                        ,lastModified:oFile.lastModified
                        ,fileName:oFile.name
                        ,uploadStatus:"uploading" //上传中
                        ,url:""
                    };

                    // t.oFileList[name].push(oFileInfo);

                    if(fileType == "file"){
                        if(t.oFileList[name].length == 9){
                            tools.showMsg.error("最多9个附件");
                            break;
                        }else if(oFileInfo.size > parseInt($($event.target).attr("data-fileSize")) * 1024 * 1024){
                            oFileInfo.uploadStatus = "faild";//上传失败
                            tools.showMsg.error("文件过大");
                            continue;// 改文件不继续上传了
                        }else{
                            t.oFileList[name].push(oFileInfo);
                        }
                    }else if(fileType == "img"){
                        if(t.oFileList[name].length == 9){
                            tools.showMsg.error("最多9张图片");
                            break;
                        }else if(oFileInfo.size > 10 * 1024 * 1024){
                            oFileInfo.uploadStatus = "faild";//上传失败
                            tools.showMsg.error("文件过大");
                            continue;// 改文件不继续上传了
                        }else{
                            t.oFileList[name].push(oFileInfo);
                        }
                    }

                    if(fileType == "img"){
                        t.getFileUrl(oFile,oFileInfo.tempId,function (tempId,url) {
                            for(var j=0;j<t.oFileList[name].length;j++){
                                if(t.oFileList[name][j].tempId == tempId){
                                    t.oFileList[name][j].url = url;
                                }
                            }
                            t.oFileList = tools.parseJson(t.oFileList);
                        });
                    }

                    new updateFile({
                        oFile:oFile //上传的文件
                        ,tempId:oFileInfo.tempId
                        ,bucketName:"cloudp"//腾讯云的bucketName
                        ,appid:"10061427"//为项目的 APPID；
                        ,successUpload:function (data) {
                            $($event.target).val("");
                            for(var j=0;j<t.oFileList[name].length;j++){
                                if(t.oFileList[name][j].tempId == data.tempId){
                                    t.oFileList[name][j].uuid = data.uuid + "";
                                    t.oFileList[name][j].uploadStatus = "success"; //上传成功
                                }
                            }
                            t.oFileList = tools.parseJson(t.oFileList);
                        }
                        ,errorUpload:function (data) {
                            $($event.target).val("");
                            for(var j=0;j<t.oFileList[name].length;j++){
                                if(t.oFileList[name][j].tempId == data.tempId){
                                    t.oFileList[name][j].uploadStatus = "faild"; //上传失败
                                }
                            }
                            t.oFileList = tools.parseJson(t.oFileList);
                        }
                    });

                }

                t.oFileList = tools.parseJson(t.oFileList);
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
                var oItem = $.extend({},JSON.parse(JSON.stringify(item)));
                var index = _.findIndex(t.afields,{field_name:item.field_name});
                oItem.field_name = item.field_name + "_new_" + String(t.iIndexGroup+1);
                if(oItem.group.fields){
                    for(var i=0;i<oItem.group.fields.length;i++){
                        oItem.group.fields[i].field_name = oItem.group.fields[i].field_name + "_new_" + String(t.iIndexGroup+1);
                    }
                }
                t.afields.splice(index+1,0,oItem);
            }

            //移除明细
            ,removeGroupItem:function ($event,item) {
                var t = this;
                var index = _.findIndex(t.afields,{field_name:item.field_name});
                if(item.field_name.indexOf("_new_") != -1){
                    t.afields.splice(index,1);
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
                    var $target = $($event.target);
                    if($target.val().length > 10){
                        $target.val($target.val().slice(0,10));
                    }
                    $target.parent().find(".capitalShow > span").text(t.arabiaToChinese($target.val()));
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
            ,previewPic:function ($event,imgSrc) {
                var t = this;
                var docWid = $(document).width();
                var winWid = $(window).width()-60;
                if(imgSrc){
                    dialog({
                        title:"图片预览"
                        ,content:'<div style="min-width: 600px;max-width:'+winWid+'px;overflow-x: auto;text-align: center;"><img src="'+imgSrc+'" style="margin-bottom: 20px;"></div>'
                    }).showModal();
                }else{
                    dialog({
                        title:"图片预览"
                        ,content:'<div style="min-width: 600px;max-width:'+winWid+'px;overflow-x: auto;text-align: center;"><img src="'+$($event.target).attr("src")+'" style="margin-bottom: 20px;"></div>'
                    }).showModal();
                }
            }
        }
    }));


});
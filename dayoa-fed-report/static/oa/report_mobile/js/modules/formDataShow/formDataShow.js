/**
 * Created by Zackey on 2016/12/22.
 * 显示表单数据
 */

define(function (require) {
    var sTplFormDataShow = require("js/modules/formDataShow/form-data-show.html");
    var filePreview =  require("commonStaticDirectory/plugins/preview.js"); //文件预览插件

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");
    var w = require("js/plugins/callAppHandler.js");
    var _ver = require("js/plugins/versionHeader.js");  //判断是否4.5版本以上

    require("commonStaticDirectory/plugins/underscore.min.js");

    //转换大写
    Vue.filter('arabiaToChinese', function (Num) {
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
    });

    //截取字段
    Vue.filter('showLittle', function (value) {
        return value.substr(0,2);
    });

    //循环显示数据组件
    Vue.component('form-data-show', Vue.extend({
        props: ['aFields']
        ,template: sTplFormDataShow
        ,data:function(){
            return {
                gMain:gMain,
                firstChange:true, //第一次进来
            };
        }
        ,attached:function () {
            var t = this;
        }
        ,watch:{
            "aFields":function () {
                var t = this;
                // //所有的图片自动预览
                // setTimeout(function () {
                //     //数据预览和打印预览页面
                //     $("#workflow_waitForAudit ,#workflow_printAudit").find("img.previewPic").each(function () {
                //         $(this).trigger("click");
                //     });
                // },500);
                if(t.firstChange){
                    t.firstChange = false;
                    t.aFields = t.getParagraph(t.aFields);
                }
            },
        }
        ,methods:{
            previewFile:function (uuid,fileSort) {
                var t = this;
                if(gMain.reportAvailableVersion && gMain.reportAvailableVersion == "available"){
                    window.localStorage.setItem("available","H5Available");
                }else{
                    window.localStorage.setItem("available","IMAvailable");
                }
                try{
                    clearInterval(gMain.intervalAdd);
                }catch(e){};
                t.initPageHeader("back");
                if(fileSort == 1){
                    new filePreview({
                        uuid:uuid,
                        title:"",
                        isPopDialog:true,
                        isWap:true
                    });//移动端文件预览
                }
                if(fileSort == 2){
                    new filePreview({
                        uuid:uuid,
                        title:'',
                        isPopDialog:true,
                        isPic:true,
                        isWap:true
                    });
                }
            },
            initPageHeader: function (leftBtnName) {
                var headerColor;
                if(_ver.versionHeader()){
                    headerColor = "";
                }else{
                    headerColor = "473f3a";
                }
                var data = {
                    leftBtn: leftBtnName, //左边按钮，””表示无左边按钮
                    headerColor: headerColor, //导航条背景颜色，””表示默认颜色
                    rightBtn: []
                };
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
            },
            /*
             * 筛选多行文本
             * */
            getParagraph:function (arr) {
                var t = this;
                for(var i = 0;i<arr.length;i++){
                    if(arr[i].field_type == "paragraph"){
                        arr[i].value = arr[i].value.replace(/[\n]/g,'<br/>');
                    }else if(arr[i].field_type == "group"){
                        arr[i].group.fields = t.getParagraph(arr[i].group.fields);
                    }else if(arr[i].field_type == "twoColumns"){
                        arr[i].firstCol.fields = t.getParagraph(arr[i].firstCol.fields);
                        arr[i].secondCol.fields = t.getParagraph(arr[i].secondCol.fields);
                    }else if(arr[i].field_type == "threeColumns"){
                        arr[i].firstCol.fields = t.getParagraph(arr[i].firstCol.fields);
                        arr[i].secondCol.fields = t.getParagraph(arr[i].secondCol.fields);
                        arr[i].thirdCol.fields = t.getParagraph(arr[i].thirdCol.fields);
                    }
                }
                return arr;
            },
            //移动端图片预览
            previewPic:function ($event,uuid) {
                var t = this;
                if(gMain.reportAvailableVersion && gMain.reportAvailableVersion == "available"){
                    window.localStorage.setItem("available","H5Available");
                }else{
                    window.localStorage.setItem("available","IMAvailable");
                }
                try{
                    clearInterval(gMain.intervalAdd);
                }catch(e){};
                t.initPageHeader("back");
                new filePreview({
                    uuid:uuid,
                    title:'',
                    isPopDialog:true,
                    isPic:true,
                    isWap:true
                });
            },
            /*
            * 展开/收起说明
            * */
            remarkOpenClose:function (e) {
                var text = $(e.target).text();
                if(text == "展开"){
                    $(e.target).text("收起");
                    $(e.target).attr({class:"right active"});
                    $(e.target).siblings(".left").css({height:"auto"});
                }else{
                    $(e.target).text("展开");
                    $(e.target).attr({class:"right"});
                    $(e.target).siblings(".left").css({height:"47px"});
                }
            }
            /*
            * 下载文件
            * */
            ,downloadFile:function (uuid) {
                Ajax.ajax({
                    url:gMain.basePath + "apiCloud/cpCloudCommon/download.do"
                    ,data:JSON.stringify({uuid:uuid})
                    ,beforeSend:function () {
                    }
                    ,complete:function () {
                    }
                    ,success:function (data) {
                        if(data.result = "true"){
                            window.location.href = data.data;
                        }
                    }
                });
            }
        }
    }));
});

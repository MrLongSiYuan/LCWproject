/**
 * Created by Zackey on 2016/12/22.
 * 显示表单数据
 */

define(function (require) {
    var sTplFormDataShow = require("js/modules/formDataShow/form-data-show.html");
    var filePreview =  require("commonStaticDirectory/plugins/preview.js"); //文件预览插件
    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");

    require("commonStaticDirectory/plugins/underscore.min.js");
    require("commonStaticDirectory/plugins/jquery.loading.js");
    var imgzoom = require("commonStaticDirectory/plugins/piczoom/imgzoom.js");

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
        props: ['aFields','uuid']
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
                    console.log(t.aFields)
                }
            },
            "uuid":function () {    //上一篇写一篇查看汇报
                var t = this;
                t.aFields = t.getParagraph(t.aFields);
            }
        }
        ,methods:{
            previewFile:function (e,uuid,fileSort) {
                var t = this;
                if(fileSort == "1"){   //文件
                    new filePreview({
                        uuid:uuid
                        ,title:"文件预览"
                    });
                }else if(fileSort == "2"){  //图片
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
                        arr[i].value = arr[i].value.replace(/[\n\r]/g,'<br/>');
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
                            location.href = data.data;
                        }
                    }
                });
            }
            ,previewPic:function ($event,src) {
                var t = this;
               /* var docWid = $(document).width();
                var winWid = $(window).width()-60;
                dialog({
                    title:"图片预览"
                    ,content:'<div style="min-width: 600px;max-width:'+winWid+'px;overflow-x: auto;text-align: center;"><img src="'+src+'"style="margin-bottom: 20px;"></div>'
                }).showModal();*/
                new imgzoom({
                    src: src,
                    autoShow: true
                });

            }
        }
    }));
});

/**
 * Created by THINK on 2017/4/22.
 * 汇报搜索
 */
define(function(require, exports, module) {
    require("js/modules/reportReceiver/reportReceiver.css");
    var sTpl = require("js/modules/reportReceiver/reportReceiver.html");


    // 日期选择控件
    require("js/plugins/jquery.mobiscroll/mobiscroll.android-ics-2.5.2.css");
    require("js/plugins/jquery.mobiscroll/mobiscroll.core-2.5.2.css");
    require("js/plugins/jquery.mobiscroll/mobiscroll.datetime-2.5.1.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.datetime-2.5.1-zh.js");
    require("js/plugins/jquery.mobiscroll/mobiscroll.android-ics-2.5.2.js");
    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框
    require("commonStaticDirectory/plugins/headImgLoad/headImgLoad.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");

    var VueComponent = Vue.extend({
        template:sTpl
        ,data:function(){
            return {
                gMain:gMain,
                canDelReceiverFlag:false,
                receiverList:[]
            }
        }
        ,watch:{

        }
        ,compiled:function () {
            $("html").css({background:"#fff"});
        }
        ,attached:function () {
            var t = this;
            t.receiverList = t.$parent.receiverList;
            console.log(t.receiverList)
        }
        ,beforeDestroy:function () {
            $("html").css({background:"#f2f2f2"});
        }
        ,methods:{
            /*
             * 显示可以删除接收人标志
             * */
            canDelReceiver:function () {
                var t = this;
                t.canDelReceiverFlag = !t.canDelReceiverFlag;
            },
            /*
             * 删除汇报对象
             * */
            delReceiverCh:function (personId) {
                var t = this;
                t.$parent.delReceiver(personId);
            },
            /*
             * 添加汇报对象
             * */
            addReceiver:function () {
                var t = this;
                t.$parent.chooseReceiver();
            },
            /*
             * 退出接收人列表
             * */
            outReceiverCover:function () {
                var t = this;
                $("#single_report_handle").show();
                window.history.go(-1);
            },
        }
        ,transitions:{

        }
        ,directives: {
            'app-head-img':function(data){
                if (!$.isEmptyObject(data)) {
                    $(this.el).headImgLoad({
                        userId: data.personId //dd号
                        , userName: data.personName
                        , userImg: gMain.DayHRDomains.baseStaticDomain + data.headImg
                    });
                }
            }
        }

    });
    module.exports = VueComponent;

});

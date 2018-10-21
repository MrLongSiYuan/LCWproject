/**
 * Created by plus on 2017/7/14.
 * 看板处理
 */

define(function (require, exports, module) {
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/layer/layer"); //弹窗
    require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗
    require("commonStaticDirectory/plugins/jquery.loading");
    //多选下来
    require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropMultipleSelect.css");
    var dayhrDropMulSelect = require("commonStaticDirectory/plugins/dayhrDropSelect/dayhrDropMultipleSelect.js");

    var ClassName = function () {
        this.init.apply(this, arguments);
    }
    ClassName.prototype = {
        constructor: ClassName
        , options: {}
        /**
         *初始化函数
         */
        , init: function (options) {
            var t = this;
            //初始化类要做的事情
            this.options = $.extend({}, this.options, options);
            var arr = t.options.opts.selectedRows();
            var arrResumeId = [];
            for(var i =0; i <arr.length; i++){
                arrResumeId.push(arr[i]["resume_id"])
            }
            switch (t.options.status){
                case "download":
                    t.downloadFun(arr,arrResumeId);
                    break;
                case "email":
                    t.emailFun(arr,arrResumeId);
                    break;
                default:
            }
        },
        downloadFun:function (arr,arrResumeId) {
            var t = this;
            if(arr.length > 0){

                console.log(arrResumeId.toString())
                var url = gMain.apiBasePath +"billboard/downloadBillboard.do?resumeIds="+arrResumeId;
                location.href =encodeURI(url);
               /* Ajax.ApiTools().downloadBillboard({
                    data: {
                        resumeIds : arrResumeId,
                    },
                    success: function (data) {
                        if (data.result == "true") {
                            /!*t.options.opts.load();
                            tools.showMsg.ok('下载成功');*!/
                        }
                    }
                });*/
            }else{
                tools.showMsg.error("请选择需要下载的数据！");
            }

        },
        emailFun:function (arr,arrResumeId) {
            var t = this;
            if(arr.length > 0){
                t.d = dialog({
                    width: "450px",
                    title: '发送招聘看板',
                    height: "100px",
                    content: '<div id="recruitKanBan" style="margin: 0 auto; width: 300px;"><span style="color: #2E2E2E; line-height: 30px;">接收人：</span><div id="kanBanDropSelect" class="dayhr_drop_MulSelect"></div></div>',
                    button: [
                                {
                                    value: "发送",
                                    callback: function () {

                                            Ajax.ApiTools().sendBillboard({
                                                data: {
                                                    resumeIds : arrResumeId,
                                                    personIds: t.drop["selectedIds"]
                                                },
                                                success: function (data) {
                                                    if (data.result == "true") {
                                                        t.options.opts.load();
                                                        tools.showMsg.ok('发送成功');
                                                    }
                                                }
                                            });

                                },
                                autofocus: true
                        },
                                {
                                    value: "取消",
                                    callback: function () {

                                }
                        }
                        ]
                })
                t.d.showModal();
                Ajax.ApiTools().getAllPersonNameData({
                    data: {
                        "infoSetId": "r_hr_org_person",
                        "keyId": "id",
                        "valueId": "value",
                        "parentId": "parent_id",
                        "tipId": "tip",
                        "orderStr": "gid, person_order",
                        "multiType": "G_zh-CN"
                    },
                    success: function (data) {
                        if (data.result == "true") {
                            t.drop = new dayhrDropMulSelect({
                                id: "kanBanDropSelect",
                                width: 300,
                                maxHeight: 250,
                                data: data.beans,
                                name: "kanBanName",
                                onSelected: function (oSelect, type) {
                                }
                            });

                        }
                    }
                });

            }else {
                tools.showMsg.error("请选择需要发送的简历数据！");

            }
        }

    };
    module.exports = ClassName;
});



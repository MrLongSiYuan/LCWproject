/**
 * ------------------------------------------------------------------
 *  招聘app详情页
 * ------------------------------------------------------------------
 */


define(function(require, exports, module){
    require("css/recruitDetail.css");
    var sTpl = require("templates/recruitDetail.html");
    var Ajax = require("js/ajax");
    var tools = require("commonStaticDirectory/plugins/tools.js");//工具
    require("commonStaticDirectory/plugins/layer_mobile/need/layer.css"); //移动弹窗
    require("commonStaticDirectory/plugins/layer_mobile/layer"); //移动弹窗
    var w = require("js/plugins/callAppHandler.js");//与H5通信

    var VueComponent = Vue.extend({
        template: sTpl
        ,data:function(){
            return {
                gMain:gMain
                ,options:{}
                ,sParams:""  //路由参数默认值
                ,infoId:""
                ,isTurn:false
                ,infoData:""
                ,evaluate:""//评价

            }
        }
        ,attached:function () {
            var t = this;
            t.init();

        }
        , watch: {
            /**
             * 把参数格式转换成：infoSetId:app_corp_menu&leftNav:initConfig 来方便获取
             * 获取参数方式如：
             * 获取infoSetId: t.options.infoSetId
             * 获取leftNav: t.options.leftNav
             * */
            'isTurn': function (val, oldVal) {
                var t = this;
                if (val == true) {
                    $("#recruitDetail").css("background","#F0F0F0");
                }else{
                    $("#recruitDetail").css("background","#ffffff");
                }
            },
        }
        ,methods: {
            init: function(options) {
                var t = this;
                this.options = $.extend({}, t.options, options);
                document.title = "面试评价";
                $("body").animate({scrollTop:0}, "normal");
                console.log(t.$route.params.infoId);
                t.infoId = t.$route.params.infoId;
                gMain.resumeId = t.$route.params.resumeId;
                var $recruitDetail =  $("#recruitDetail");
                $recruitDetail.height($(window).height());
                t.initPageHeader();
                t.getInfoData();
            },
            initPageHeader:function(){
                var data = {
                    leftBtn:"back", //左边按钮，””表示无左边按钮
                    headerColor:"403934", //导航条背景颜色，””表示默认颜色
                    rightBtn: [{btnAction:"recruit_more",
                        btnUrl:gMain.baseStaticHrPath+"recruit/images/recruit-more.png",
                        btnName:"",
                        btnParam:{}
                        }]
                }
                w.callAppHandler("h5_init_page_header", data); //通过w.callAppHandler()向APP发送消息
            },
            /*获取基本信息*/
            getInfoData:function () {
                var t = this;
                Ajax.ApiTools().getPersonInterviewsApp({
                    data: {"pageBean":{"pageNo":1,"pageSize":1},interviewId:t.$route.params.infoId},
                    success: function (data) {
                        if(data.maps!=null) {
                            t.infoData = data.maps[0];
                        }
                    }
                });
            },
            chooseInterviewer:function () {
                var t = this;
                var param = {
                    selectSelf:true //是否可以选自己
                    ,selectFriends:true //是否可以选好友
                    ,singleSelect:true // 是否限制为单选 （ true:单选，只能选一个人，不能选组织）
                    ,cached:false  //是否使用缓存   cache为true时，selectedUserInfo和selectedOrgInfo为[]
                    ,selectedUserInfo:[] //默认选择的用户列表
                    ,selectedOrgInfo:[]  //默认选择的组织列表
                };
                w.callAppHandler("h5_address_list_picker_new", param);
            },
            turnFun:function(){
                var t = this;
                var $personLi = $("#recruitDetail").find(".person").find(".float-right ul li");
                if($personLi.length>0) {
                    var sUserId = $personLi.attr("data-id");
                    var sUserName = $personLi.attr("data-name");

                    Ajax.ApiTools().turnToHoldApp({
                        data: {personId:sUserId,personName:sUserName,resumeId:t.$route.params.resumeId,interviewId:t.$route.params.infoId},
                        success: function (data) {
                            if(data.result == "true") {
                                window.location.href="#!/recruitCenter";
                            }
                        }
                    });
                }else{
                    layer.open({
                        content: '请选择转办面试官！'
                        ,skin: 'msg'
                        ,shadeClose: false
                        ,time: 2 //2秒后自动关闭
                    });
                }
            },
            passFun:function(param){
                var t = this;
                if(param == 1){
                   var sTitle = "通过";
                }else{
                   var sTitle = "不通过";
                }
                if(t.evaluate!="") {
                    layer.open({
                        content: '您确定要' + sTitle + '么？'
                        , shadeClose: false
                        , btn: ['确定', '取消']
                        , yes: function (index) {
                            layer.close(index);
                            Ajax.ApiTools().interviewEvaluateApp({
                                data: {
                                    resumeId: t.infoData.resume_id
                                    , interviewId: t.$route.params.infoId
                                    , interviewEvaluate: t.evaluate
                                    , result: param
                                },
                                success: function (data) {
                                    if (data.result == "true") {
                                        location.href = "#!/recruitCenter";//评价成功返回首页
                                    }
                                }
                            });
                        }
                    });
                }else{
                    layer.open({
                        content: '评价内容不能为空！'
                        ,skin: 'msg'
                        ,time: 2 //2秒后自动关闭
                    });
                }
            }
        }
    });

    module.exports = VueComponent;

});


/**
 * 首页
 */

define(function (require,exports,module) {
    require("css/index.css")
    var sTpl=require("templates/index.html")
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集

    require("js/modules/annoucementClassify/annoucementClassify.js")
    var VueComponent = Vue.extend({
        template: sTpl
        ,data:function(){
            return {
                gMain:gMain,
                annoucementList:[],//公告列表
                orgId:null,//组织ID
                personId:null,//职工ID
                firstAnnGet:true,//第一次进公告
                seniorSearchShow:false,//显示高级搜索
                pageChangeInfor:{
                    pageNo:"1",          //当前页
                    onePageNum:"10",      //一页显示汇报数量
                    onePageNumArr:[10,20,50,100]
                },
                switchTapOver:false, //公告列表获取完毕
                annoucementType:"received", //"received"-我收到的 "collect"-我的收藏 "publish"-我发布的 "notPublish"-未发布的
                adminJuri:false, //是否为公告员
                annClassigyList:[], //公告的类型列表
                canAddAnnflag:true, //可以打开增加公告
                announcementTotal:"", //此时公告总数
                searchInfor:{
                    annoucementTitle:"",          //搜索公告标题
                    startTime:"",
                    endTime:"",
                    AnnTypeId:"" //分类ID
                },
                noMoreData:false,
            }
        }
        ,watch:{}
        ,compiled:function () {

        }
        ,computed:{
            startTimeOption: function(){
                var t = this;
                return {
                    disabledDate:function (date) {
                        return date && date.valueOf() > new Date(t.searchInfor.endTime);
                    }
                }
            },
            endTimeOption:function(){
                var t = this;
                return{
                    disabledDate:function (date) {
                        return date && date.valueOf() < new Date(t.searchInfor.startTime) ;
                    }
                }
            },
        }
        ,attached:function(){
            var t = this;
            t.personId = gMain.oUser.beans[0].userInfo.personId;
            t.initDomEvent();
            t.getJurisdiction();
            t.getAnnClassigyList();
            $.when(t.getOrgId()).done(function () {
                t.getAnnoucementList();
            });
        }
        ,methods:{
            /*
            * 切换公告Tap
            * */
            switchAnnTap:function (e,typeNum) {
                var t = this;
                t.annoucementType = typeNum;
                var $dom = e.target.localName == "li" ? $(e.target) : $(e.target).closest("li");
                var index = $dom.index() - 0;
                $dom.attr({class:"active"}).siblings("li").attr({class:""});
                $("#announcement_index").find(".menu_bottom_bar").animate({
                    left:index*115 + "px"
                },500);
                t.noMoreData = false;
                t.pageChangeInfor = {
                    pageNo:"1",          //当前页
                    onePageNum:"10",      //一页显示汇报数量
                    onePageNumArr:[10,20,50,100]
                };
                t.annoucementList = [];
                t.getAnnoucementList();
            },
            /*
            * 初始化dom事件
            * */
            initDomEvent:function () {
                var t = this;
                $(window).scroll(function () {
                    if($(document).scrollTop() + window.innerHeight == $(document).height()) {
                        if(t.annoucementList.length < t.announcementTotal){
                            t.pageChangeInfor.pageNo = (t.pageChangeInfor.pageNo-0)+1;
                            t.getAnnoucementList();
                        }
                    }
                });
                var mainWrapLeft = $("#main_wrap").css("padding-left");
                $(".announcement_menu").css({'width':'calc(100% - '+mainWrapLeft+' - 65px - 355px)'});
                $("#announcement_index").on("resize",function () {
                    console.log(1)
                });
                $("#announcement_index").find(".annoucement_filtrate_libox").scroll(function (e) {
                    e.stopPropagation();
                    return false
                });
                $(document).on("click",function (e) {
                    if(t.seniorSearchShow){
                        t.seniorSearchShow = !t.seniorSearchShow;
                        $("#announcement_index .simple_search_rightIcon").css({
                            "-ms-transform":"",
                            "-moz-transform":"",
                            "-webkit-transform":"",
                            "-o-transform":"",
                            "transform":"",
                        });
                    }
                });
                $("#announcement_index  .annoucementSearch").on("click",function (e) {
                    e.stopPropagation();
                })
            },
            /*
            * 显示高级搜索
            * */
            seniorSearchSwitch:function (e) {
                var t = this;
                t.seniorSearchShow = !t.seniorSearchShow;
                if(t.seniorSearchShow){
                    $(e.target).css({
                        "-ms-transform":"rotate(-180deg)",
                        "-moz-transform":"rotate(-180deg)",
                        "-webkit-transform":"rotate(-180deg)",
                        "-o-transform":"rotate(-180deg)",
                        "transform":"rotate(-180deg)",
                    });
                }else{
                    $(e.target).css({
                        "-ms-transform":"",
                        "-moz-transform":"",
                        "-webkit-transform":"",
                        "-o-transform":"",
                        "transform":"",
                    });
                }
                e.stopPropagation();
            },
            /*
            * 高级搜索
            * */
            seniorSearchResult:function (e,searchType) {
                var t = this;
                if(searchType == "simpleKeyup"){
                    if(e.keyCode != "13"){
                        return false;
                    }
                }
                if(searchType != "seniorSearch"){
                    if(searchType == "simple" || searchType == "simpleKeyup"){
                        t.searchInfor.startTime = "";
                        t.searchInfor.endTime = "";
                    }
                }
                t.noMoreData = false;
                t.pageChangeInfor = {
                    pageNo:"1",          //当前页
                    onePageNum:"10",      //一页显示汇报数量
                    onePageNumArr:[10,20,50,100]
                };
                t.annoucementList = [];
                t.getAnnoucementList();
            },
            /*
            * 查询公告
            * */
            getAnnoucementList:function () {
                var t = this;
                var postOption = {
                    "pageType":t.annoucementType,
                    "title":t.searchInfor.annoucementTitle,
                    "startTime":t.searchInfor.startTime,
                    "endTime":t.searchInfor.endTime,
                    "announcementType":t.searchInfor.AnnTypeId,
                    "myType":"",
                    "pageNo":t.pageChangeInfor.pageNo,
                    "pageSize":t.pageChangeInfor.onePageNum
                }
                Ajax.ajax({
                    url:gMain.apiBasePath + "announcement/listAnnouncement.do",
                    data:JSON.stringify(postOption),
                    beforeSend:function () {
                        if(!t.firstAnnGet){
                            $("body").loading({zIndex:999999999}); //开启提交遮罩
                        }
                        t.switchTapOver = false;
                    },
                    complete:function () {
                        if(t.firstAnnGet){
                            $("body").loading({state:false}); //关闭提交遮罩
                            t.firstAnnGet = false;
                        }else{
                            $("body").loading({state:false}); //关闭提交遮罩
                        }
                        t.switchTapOver = true;
                    },
                    success:function(data) {
                        if(data.result == "true"){
                            t.annoucementList = t.annoucementList.concat(data.data.list);
                            if(t.annoucementList.length == t.announcementTotal && t.announcementTotal > 4){
                                t.noMoreData = true;
                            }
                            if(t.annoucementList.length != 0){
                                t.getPictrueUrl(t.annoucementList,function (arr) {
                                    t.annoucementList = JSON.parse(JSON.stringify(arr));
                                    t.announcementTotal = data.data.recordCount;
                                })
                            }
                        }
                    }
                });
            },
            /*
            * 改变搜索公告分类
            * */
            changeAnnClissify:function (e,item) {
                var t = this;
                var className = $(e.target).attr("class");
                if(className && className.indexOf("annoucement_filtrate_all") != -1){
                    $(e.target).attr({class:"annoucement_filtrate_all active"});
                    $(e.target).siblings("li").removeClass("active");
                    t.searchInfor.AnnTypeId = "";
                }else if($(e.target).prop("nodeName") == "LI"){
                    $(e.target).addClass("active").siblings("li").removeClass("active");
                    t.searchInfor.AnnTypeId = item.uuid;
                }
                t.noMoreData = false;
                t.pageChangeInfor = {
                    pageNo:"1",          //当前页
                    onePageNum:"10",      //一页显示汇报数量
                    onePageNumArr:[10,20,50,100]
                };
                t.annoucementList = [];
                t.getAnnoucementList();
            },
            /**
             * 获取图片真实路径
             * @arr 获取的字段集
             * @callback 获取真实图片后的回调
             * */
            getPictrueUrl:function (aFormStyle ,callback) {
                var t = this;
                var setData = function (arr) {
                    for(var i=0;i<arr.length;i++){
                        if(arr[i].resourceUrl){
                            Ajax.ajax({
                                url:gMain.basePath + "apiCloud/cpCloudCommon/download.do"
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
            * 获取组织Id
            * */
            getOrgId:function () {
                var t=this;
                var df = $.Deferred();
                Ajax.ajax({
                    url:gMain.apiBasePath + "receiver/getOrgInfo.do",
                    data:"",
                    beforeSend:function () {
                        $("body").loading({zIndex:999999999}); //开启提交遮罩
                    },
                    complete:function () {

                    },
                    success:function (data) {
                        if(data.result == "true"){
                            t.orgId=data.data.orgId;
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
                Ajax.ajax({
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
            /**
             *获取公告类型列表
             **/
            getAnnClassigyList:function(){
                var t=this;
                Ajax.ajax({
                    url:gMain.apiBasePath+"route/am_type_list/getAll.do"
                    ,data:JSON.stringify({
                        "infoSetId":"am_type_list",
                        "searchConditionList":[],
                        "pageBean":{
                            "pageNo":"1",
                            "pageSize":20
                        },
                    })
                    ,beforeSend:function () {
                        $("body").loading({zIndex:999999999}); //开启提交遮罩
                    }
                    ,complete:function () {
                    }
                    ,success:function(data){
                        if(data.result=="true"){
                            t.annClassigyList = data.maps.slice(0);
                        }
                    }
                })
            },
            /**
             *发布公告
             **/
            addAnnoucement:function(){
                var t=this;
                if(t.canAddAnnflag){
                    t.canAddAnnflag = false;
                    require.async("js/modules/addAnnouncement/addAnnouncement.js",function (addAnnouncement) {
                        new addAnnouncement({
                            announcementIndex:t
                        });
                    });
                }
            },
        }
    });

    module.exports = VueComponent;
});


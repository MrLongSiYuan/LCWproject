/**
 * Created by Administrator on 2017/11/2.
 */

import singleListFile from "../components/singleListFile.vue"

export default{
    data: function () {
        return {
            simpleSearchValue:"",
            classifyAnn:"",
            classifyAnnList:[], //公告分类列表
            announcementType:"", //"received"-我收到的 "collect"-我的收藏 "publish"-我发布的 "notPublish"-未发布的
            announcementList:[],//公告列表
            searchTimeResult:[],//搜索时间结果
            adminJuri:false, //公告管理员权限
            pageChangeInfor:{
                pageNo:"1",          //当前页
                onePageNum:"10",      //一页显示汇报数量
                onePageNumArr:[10,20,50,100]
            },
            searchInfor:{
                announcementTitle:"",          //搜索公告标题
                startTime:"",
                endTime:"",
                AnnTypeId:"" //分类ID
            },
            spinShow:false, //遮罩
            firstAnnGet:true,//第一次进公告
            announcementTotal:"", //此时公告总数
            noMoreData:false,
        }
    },
    watch:{
        '$route':function (to, from) {
            var t = this;
            t.announcementType = t.$route.params.indexParams;
            t.pageChangeInfor = {
                pageNo:"1",          //当前页
                onePageNum:"10",      //一页显示汇报数量
                onePageNumArr:[10,20,50,100]
            };
            t.announcementList = [];
            t.getannouncementList();
        }
    },
    created: function () {
        var t = this;
        t.announcementType = t.$route.params.indexParams;
        t.getannouncementList();
        t.getAnnClassigyList();
        t.getJurisdiction();
    },
    mounted: function () {
        var t = this;
        t.$nextTick(function () {
            // DOM 更新了
            t.initDomEvent();
        });
    },
    methods: {
        /*
        * 显示搜索框
        * */
        showSimpleSearch:function () {
            var t = this;
            $(".search_btn_wrap .only_search_btn").hide();
            $(".search_btn_wrap .search_input").show();
            $(".senior_search_wrap").hide();
        },
        /*
        *初始化dom事件
        * */
        initDomEvent:function () {
            var t = this;
            /*tap根据路由显示活动*/
            switch(t.announcementType){
                case "received":
                    $("body").find(".index_tap_switch_wrap ul li[data-param='received']").attr({class:"tap_list active"});
                    $("body").find(".index_tap_switch_wrap ul li[data-param='received']").siblings("li").attr({class:"tap_list"});
                    break;
                case "publish":
                    $("body").find(".index_tap_switch_wrap ul li[data-param='publish']").attr({class:"tap_list active"});
                    $("body").find(".index_tap_switch_wrap ul li[data-param='publish']").siblings("li").attr({class:"tap_list"});
                    break;
                case "notPublish":
                    $("body").find(".index_tap_switch_wrap ul li[data-param='notPublish']").attr({class:"tap_list active"});
                    $("body").find(".index_tap_switch_wrap ul li[data-param='notPublish']").siblings("li").attr({class:"tap_list"});
                    break;
            }
            /*隐藏搜索框*/
           /* $("body").find("#announcement_index").bind("click",function () {
                $(".search_btn_wrap .only_search_btn").show();
                $(".search_btn_wrap .search_input").hide();
            });*/
           /*tap 标签点击*/
            $("body").find(".index_tap_switch_wrap ul li").on("click",function (e) {
                t.$refs.single.pageDetailIsShow = false;
                $(this).attr({class:"tap_list active"});
                $(this).siblings("li").attr({class:"tap_list"});
                var params = $(this).attr("data-param");
                t.$router.push({ path:"/index/" + params})
            })
        },
        /*
        * 打开高级搜索
        * */
        openSeniorSearch:function () {
            var t = this;
            $(".senior_search_wrap").show();
            $(".search_btn_wrap .search_input").hide();
            $(".search_btn_wrap .only_search_btn").show();
        },
        /*
         * 条件搜索
         * @searchType 判断事件类型
         * */
        conditionSearch:function (e,searchType) {
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
                    t.searchInfor.AnnTypeId = "";
                }
            }
            t.pageChangeInfor = {
                pageNo:"1",          //当前页
                onePageNum:"10",      //一页显示汇报数量
                onePageNumArr:[10,20,50,100]
            };
            t.announcementList = [];
            t.getannouncementList();
        },
        /*
        * 选择搜索分类
        * */
        selectSearchClassify:function (data) {
            var t = this;
            $.each(t.classifyAnnList,function (num,val) {
                if(val.type_name == data){
                    t.searchInfor.AnnTypeId = val.uuid;
                }
            })
        },
        /*
        *选择搜索时间段
        * */
        selectSearchTime:function (data) {
            var t = this;
            t.searchInfor.startTime = data[0];
            t.searchInfor.endTime = data[1];
            t.searchTimeResult = data.slice(0);
        },
        /*
        * 重置搜索条件
        * */
        resetSearchOption:function () {
            var t = this;
            t.searchInfor = {
                announcementTitle:"",          //搜索公告标题
                startTime:"",
                endTime:"",
                AnnTypeId:"" //分类ID
            };
            t.searchTimeResult = [];
            t.classifyAnn = "";
        },
        /*
        * 关闭高级搜索
        * */
        closeSeniorSearch:function () {
            var t = this;
            $(".senior_search_wrap").hide();
        },
        /*
        * 加载更多列表
        * */
        loadMoreAnnList:function () {
            var t = this;
            t.pageChangeInfor.pageNo = (parseInt(t.pageChangeInfor.pageNo) + 1).toString();
            t.getannouncementList();
        },
        /*
        * 获取公告列表
        * */
        getannouncementList:function () {
            var t = this;
            var postOption = {
                "pageType":t.announcementType,
                "title":t.searchInfor.announcementTitle,
                "startTime":t.searchInfor.startTime,
                "endTime":t.searchInfor.endTime,
                "announcementType":t.searchInfor.AnnTypeId,
                "myType":"",
                "pageNo":t.pageChangeInfor.pageNo,
                "pageSize":t.pageChangeInfor.onePageNum
            }
            t.$daydao.$ajax({
                url:gMain.apiBasePath + "announcement/listAnnouncement.do",
                data:JSON.stringify(postOption),
                beforeSend:function () {
                    if(!t.firstAnnGet){
                        t.spinShow = true;
                    }
                },
                complete:function () {
                    if(t.firstAnnGet){
                        t.firstAnnGet = false;
                    }
                    t.spinShow = false;
                },
                success:function(data) {
                    if(data.result == "true"){
                        t.announcementList = t.announcementList.concat(data.data.list);
                        if(t.announcementList.length == t.announcementTotal && t.announcementTotal > 4){
                            t.noMoreData = true;
                        }
                        if(t.announcementList.length != 0){
                            t.getPictrueUrl(t.announcementList,function (arr) {
                                t.announcementList = JSON.parse(JSON.stringify(arr));
                                t.announcementTotal = data.data.recordCount;
                            })
                        }
                    }
                }
            });
        },
        /**
         * 获取图片真实路径
         * @aFormStyle 获取的字段集
         * @callback 获取真实图片后的回调
         * */
        getPictrueUrl:function (aFormStyle ,callback) {
            var t = this;
            var setData = function (arr) {
                for(var i=0;i<arr.length;i++){
                    if(arr[i].resourceUrl){
                        t.$daydao.$ajax({
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
        /**
         *获取公告类型列表
         **/
        getAnnClassigyList:function(){
            var t=this;
            t.$daydao.$ajax({
                url:gMain.apiBasePath+"route/am_type_list/getAll.do"
                ,data:JSON.stringify({
                    "infoSetId":"am_type_list",
                    "searchConditionList":[],
                    "pageBean":{
                        "pageNo":"1",
                        "pageSize":1000
                    },
                })
                ,beforeSend:function () {

                }
                ,complete:function () {
                }
                ,success:function(data){
                    if(data.result=="true"){
                        t.classifyAnnList = data.maps.slice(0);
                    }
                }
            })
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
        * 跳转发布公告
        * */
        jumpAddAnnouncement:function () {
            var t = this;
            t.$router.push({path:'/addAnnouncement'})
        }
    },
    components:{
        "single-list-file":singleListFile,
    }
}

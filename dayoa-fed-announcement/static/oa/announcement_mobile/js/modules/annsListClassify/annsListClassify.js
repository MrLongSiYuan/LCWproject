/**
 * Created by THINK on 2017/3/13.
 * 汇报列表显示
 */
define(function(require, exports, module) {
    require("js/modules/annsListClassify/annsListClassify.css");
    var sTpl = require("js/modules/annsListClassify/annsListClassify.html");

    //弹窗
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus.js");
    require("commonStaticDirectory/plugins/amy-layer/amy-layer.js"); //移动端确认框和信息提示框
    require("commonStaticDirectory/plugins/headImgLoad/headImgLoad.js");

    var tools = require("commonStaticDirectory/plugins/tools.js"); //工具函数集
    var Ajax = require("js/ajax");

    // var AuditSelect = require("js/modules/auditSelect/auditSelect.js"); //添加接收人组件


    Vue.component('anns-list-classify', Vue.extend({
        props: ['annoucementListInfo']
        ,template: sTpl
        ,data:function(){
            return {
                gMain:gMain,
                annoucementList:[],
                annoucementSource:this.annoucementListInfo.annoucementSource,      //sendOut（我发起的） received（我收到的）
            };
        }
        ,watch:{
            "annoucementListInfo.annoucementList":function () {
                var t = this;
                t.annoucementList = t.annoucementListInfo.annoucementList;
                if(t.annoucementList.length == 0){
                    $(".report_content_list_wrap").find(".no-data-page").show();
                }
            }
        }
        ,attached:function () {
            var t = this;
        }
        ,methods:{
            /*
            * 预览单个公告
            * */
            previewSingleAnn:function (annId) {
                var t = this;
                location.href = "#!/singleAnnDetail/"+annId;
            },
            /*
            * 删除草稿汇报
            * */
            deleteDraft:function (uuid) {
                var t = this;
                t.$parent.inDeleteDraft(uuid);
            },
        }
        ,directives: {
            'add-ann-time':function(data){
                if (!$.isEmptyObject(data)) {
                    var showtime,date;
                    date = new Date(data.operation_time);
                    var year,month,day,hour,minute,second;
                    year = date.getFullYear();
                    month = date.getMonth()+1 < 10 ? "0"+(date.getMonth()+1):date.getMonth()+1;
                    day = date < 10 ? "0"+date.getDate():date.getDate();
                    hour = date.getHours() < 10 ? "0"+date.getHours():date.getHours()
                    minute = date.getMinutes() < 10 ? "0"+date.getMinutes():date.getMinutes();
                    showtime = year+"/"+month+"/"+day+" "+hour+":"+minute;
                    $(this.el).text(showtime);
                }
            },
            'ann-content-handle':function (data) {
                if(!$.isEmptyObject(data)){
                    if(data.content){
                        var conent = data.content.replace(/[\n]/g,'<br/>');
                        conent = conent.replace(/[\s]/g,'&nbsp;');
                    }
                    $(this.el).html(conent);
                }
            }
        }
    }));


});
/**
 * Created by Administrator on 2017/11/9.
 */
import pageSlide from 'commonVueLib/pageSlide'
import addAnnClassify from '../components/addAnnClassify.vue'
import pageTreeMenu from "commonVueLib/pageTreeMenu/index"; //组织树
import dropTreeMenu from "commonVueLib/dropTreeMenu/index"; //组织树

export default{
    data: function () {
        return {
            formValidate: {
                addAnnTitle: '',  //标题
                publicationScope: '',  //范围
                annClassify: '', //分类
                annContent:'', //正文
                fileList:[],
                dataTimePublish:"", //选中的时间
                canComment:false,  //可以评论
                canWatermark:false, //水印
                canTimedPublish:false, //是否开启定时
            },
            ruleValidate: {
                addAnnTitle: [
                    { required: true, message: '公告标题不能为空', trigger: 'blur' }
                ],
                publicationScope: [
                    { required: true, message: '发布范围不能为空', trigger: 'blur' },
                ],
                annClassify: [
                    { required: true, message: '请选择公告分类', trigger: 'change' }
                ],
                annContent: [
                    { required: true, message: '公告内容不能为空', trigger: 'blur' },
                ],
            },
            classifyAnnList:[],  //分类列表
            addClassifyShow:false,  //侧滑
            addClassifyTitle:"新增分类",
            isDrop:true,
            leftTreeId:'leftTreeId'+(new Date()).getTime()
        }
    },
    created: function () {
        var t = this;
        t.getAnnClassigyList();
        t. dropPersonTree();
    },
    methods: {
        /*
        * 返回上一级
        * */
        goBack:function () {
            var t = this;
            t.$router.go(-1);
        },
        /*
        * 添加分类
        * */
        addClassify:function () {
            var t = this;
            t.addClassifyShow = true;
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
        /*
        * 选择定时发布时间
        * */
        chooseTimePublish:function (data) {
            var t = this;
            t.formValidate.dataTimePublish = data;
        },
        /*获取组织树*/
        dropPersonTree: function () {
            var t = this;
            t.$daydao.$ajax({
                url: gMain.apiBasePath + "receiver/getOrgTree.do"
                ,data: ""
                ,success: function (data) {
                    if (data.result == "true") {
                        console.log(data);
                    }
                }
            });
        },
    },
    components:{
        "page-slide":pageSlide,
        "add-ann-classify":addAnnClassify,
        "page-tree-menu":pageTreeMenu,
        "drop-tree-menu":dropTreeMenu,
    },
}

import 'babel-polyfill'; //添加浏览器es6部分特性支持
import $ from "jquery";
import router from './router'; //路由
import store from 'src/store/store.js'; //公共状态管理
import Ajax from 'commonVueLib/Ajax/index.js'; //公共ajax
import 'commonVueLib/config/config.js'; //前端配置文件

//获取最新版本号
$.getScript("//static1.daydao.com/static/common/version.js",function () {
    /**
     * seajs配置信息
     */
    seajs.config({
        map: [[ /^(.*\.(?:css|js|html))(.*)$/i, '$1?v='+ sProjectVersion +'-'+gMain.verson]]  //加上版本号，清缓存用1
    });

    /**
     * 加载依赖的公共ajax，公共工具库，这两个文件是seajs的风格写的
     * */
    seajs.use([
        "commonStaticDirectory/plugins/tools.js"
    ],function (tools,commonHeader) {


        var vueRouter = new VueRouter({
            mode: 'history' // //去掉#号的模式hash(#),history(无#)
            ,base:"/oa/report_mobile/"
        })
        //通用工具的注入到vue中
        Vue.mixin({
            created: function () {
                this.$daydao = {
                    //公共ajax方法
                    $ajax:function (options) {
                        return Ajax.ajax(options);
                    }
                    ,$Ajax:Ajax
                    ,$tools:tools
                }
            }
        });

        //所有api的请求前缀，开发模式和生产的代码前缀不一样，开发是跨域请求，生产代码是当前域请求
        gMain.apiPath = "/";
        //如果当前是webpack的开发模式
        if(process.env.NODE_ENV == "development"){
            gMain.apiPath = "https://www.daydao.com/";
        }
        gMain.amBasePath = gMain.apiPath +  "apiComment/";  //nginx反向代理公告路径
        gMain.apiBasePath = gMain.apiPath + "apiReport/"; //当前模块的接口请求前缀
        gMain.projectSource = "dayoa"; //项目标识

        //入口app
        gMain.components.daydaoApp = new Vue({
            el:"#daydao_main_app",
            data:{
                spinShow: false
            },
            name:"daydaoApp",
            router:vueRouter,
            store:store,
            components:{
            }
            ,methods:{
            },
            created:function () {
                vueRouter.addRoutes(router);
                this.spinShow = false; //取消屏幕遮罩
            }
        });

    });
});




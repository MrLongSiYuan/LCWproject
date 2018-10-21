/**
 * Created by qi_zhang on 2015/4/3.1
 */

define(function(require, exports, module) {
    var tools = require("commonStaticDirectory/plugins/tools");
    var HeaderBar = require("commonStaticDirectory/header/header.js");
    require("commonStaticDirectory/plugins/iview1.x/iview.css");
    require("commonStaticDirectory/plugins/iview1.x/iview.min.js");
    // 路由器需要一个根组件。
    var App = Vue.extend({
        data:function () {
            return {
                mainTitle:""   //页面名称
                ,documentTitle:"" //浏览器标题
            };
        }
    });

    //方便打日志
    window.log = function(){
        return console.log.apply(console,arguments);
    };

    // 创建一个路由器实例
    var router = new VueRouter();
    // 定义路由规则
    router.map({
        /**
         * 默认首页
         * */
        '/': {
            component: function (resolve) {
                    require.async(['js/category/index.js'],resolve);
            }
        },
        /**
         * 元数据表格页面
         * */
        '/metadata/:sParams': {
            component: function (resolve) {
                require.async(['js/category/metadata.js'],resolve);
            }
        },
        /**
         * 测试页面---用于测试一些组件
         * */
        '/test': {
            component: function (resolve) {
                require.async(['js/category/test.js'],resolve);
            }
        },
    });

    // 路由器会创建一个 App 实例，并且挂载到选择符 #app 匹配的元素上。
    router.start(App, 'html');

    //该函数会在每次路由切换成功进入激活阶段时被调用。
    router.afterEach(function (transition) {
        //console.log('成功浏览到: ' + transition.to.path)
        //关闭所有dialog弹窗
        if(window.dialog){
            for(var x in dialog.list){
                dialog.list[x].remove().close()
            }
        }
        //关闭所有layer提示框
        window.layer && layer.closeAll();
        //左侧导航选中
        HeaderBar.setNavPosition();   //左侧全站导航的定位
    });

    module.exports = App;

});

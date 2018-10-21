/**
 * Created by qi_zhang on 2015/4/3.
 */

define(function(require, exports, module) {
    var tools = require("commonStaticDirectory/plugins/tools");

    // 路由器需要一个根组件。
    var App = Vue.extend({});

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
         * 招聘效果分析图
         * */
        '/recruitAnalysis': {
            component:function (resolve) {
                require.async(['js/category/recruitAnalysis.js'],resolve);
            }
        },
        /**
         * 招聘app首页面
         * */
        '/recruitCenter': {
            component:function (resolve) {
                require.async(['js/category/recruitCenter.js'],resolve);
            }
        },
        /**
         * 招聘app详情
         * */
        '/recruitDetail/:infoId/:resumeId': {
            component:function (resolve) {
                require.async(['js/category/recruitDetail.js'],resolve);
            }
        },
        /**
         * 招聘app应聘记录
         * */
        '/recruitRecord/:resumeId': {
            component:function (resolve) {
                require.async(['js/category/recruitRecord.js'],resolve);
            }
        },
        /**
         * 招聘app简历预览
         * */
        '/resumePreview/:infoId': {
            component:function (resolve) {
                require.async(['js/category/resumePreview.js'],resolve);
            }
        },
        /**
         * 职位信息
         * */
        '/posCenter/:posId': {
            component:function (resolve) {
                require.async(['js/category/posCenter.js'],resolve);
            }
        },
        /**
         * 简历详细信息
         * */
        '/resumeDetail/:resumeId': {
            component:function (resolve) {
                require.async(['js/category/resumeDetail.js'],resolve);
            }
        },


    });

    // 路由器会创建一个 App 实例，并且挂载到选择符 #app 匹配的元素上。
    router.start(App, 'html');

    //该函数会在每次路由切换成功进入激活阶段时被调用。
    router.afterEach(function (transition) {
        //console.log('成功浏览到: ' + transition.to.path)
        $(window).unbind('scroll');

        //关闭所有dialog弹窗
        if(window.dialog){
            for(var x in dialog.list){
                dialog.list[x].remove().close()
            }
        }
        //关闭所有layer提示框
        layer.closeAll();

        //左侧导航选中 移动端无菜单
        if(gMain.isMobile!=true) {
            require.async("commonStaticDirectory/header/header.js",function(HeaderBar){
                HeaderBar.setNavPosition();   //左侧全站导航的定位
            })

        }else{
            $("body").mLoading({state:false});
            //移动端自适应
            function RemSize() {
                var docEl = document.documentElement,
                    oSize = docEl.clientWidth / 6.4;

                if (oSize > 100) {
                    oSize = 100; //  限制rem值   640 / 6.4 =100
                }

                docEl.style.fontSize = oSize + 'px';
            }
            RemSize();
            $(window).resize(function() {
                RemSize();
            });
        }
    });

    module.exports = App;

});

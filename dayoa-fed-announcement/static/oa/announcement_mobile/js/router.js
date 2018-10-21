/**
 * Created by qi_zhang on 2015/4/3.
 */

define(function(require, exports, module) {
    var tools = require("commonStaticDirectory/plugins/tools");
    //引入iView框架
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
    /*
     * 禁止左右滑动
     * */
    (function () {
        $('body').bind('touchstart',function(e){
            startX = e.originalEvent.changedTouches[0].pageX;
            startY = e.originalEvent.changedTouches[0].pageY;
        });
        $("body").bind("touchmove",function(e) {
            //获取滑动屏幕时的X,Y
            endX = e.originalEvent.changedTouches[0].pageX;
            endY = e.originalEvent.changedTouches[0].pageY;
            //获取滑动距离
            distanceX = endX - startX;
            distanceY = endY - startY;
            //判断滑动方向
            if (Math.abs(distanceX) > Math.abs(distanceY) && distanceX > 0) {
                e.preventDefault();
            } else if (Math.abs(distanceX) > Math.abs(distanceY) && distanceX < 0) {
                e.preventDefault();
            } else if (Math.abs(distanceX) < Math.abs(distanceY) && distanceY < 0) {
                // amyLayer.alert('往上滑动');
            } else if (Math.abs(distanceX) < Math.abs(distanceY) && distanceY > 0) {
                // amyLayer.alert('往下滑动');
            }
        });
    })();
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
            },
        },
        /**
         * 测试页面---用于测试一些组件
         * */
        '/test': {
            component: function (resolve) {
                require.async(['js/category/test.js'],resolve);
            }
        },
        /**
         * 模板选择
         * */
        '/chooseTemp': {
            component: function (resolve) {
                require.async(['js/category/chooseTemp.js'],resolve);
            }
        },
        /**
         * 添加公告
         * */
        '/addAnn': {
            component: function (resolve) {
                require.async(['js/category/addAnnouncement.js'],resolve);
            },
            subRoutes:{
                /*多选框*/
                "/chooseCover": {
                    component: function (resolve) {
                        require.async(['js/modules/chooseCover/chooseCover.js'], resolve);
                    }
                },
                /*汇报对象*/
                "/reportReceiver": {
                    component: function (resolve) {
                        require.async(['js/modules/reportReceiver/reportReceiver.js'], resolve);
                    }
                },
                "/clipboard": {
                    component: function (resolve) {
                        require.async(['js/modules/clipboard/clipboard.js'], resolve);
                    }
                },
                /*提交预览*/
                "/previewReport": {
                    component: function (resolve) {
                        require.async(['js/modules/previewReport/previewReport.js'], resolve);
                    },
                    subRoutes:{
                        /*提交预览查看汇报对象*/
                        "/previewReceiver": {
                            component: function (resolve) {
                                require.async(['js/modules/previewReceiver/previewReceiver.js'], resolve);
                            }
                        },
                    }
                },
            }
        },
        /**
         * 单个公告查看
         * */
        '/singleAnnDetail/:announcement_id': {
            component: function (resolve) {
                require.async(['js/category/singleAnnDetail.js'],resolve);
            },
            subRoutes:{
                /*
                * 添加评论
                * */
                "/addComment": {
                    component: function (resolve) {
                        require.async(['js/modules/addComment/addComment.js'], resolve);
                    }
                },
                /**
                 * 汇报对象查看
                 * */
                '/receiverList': {
                    component: function (resolve) {
                        require.async(['js/category/receiverList.js'],resolve);
                    },
                },
                /**
                 * 阅读人查看
                 * */
                '/readerList': {
                    component: function (resolve) {
                        require.async(['js/category/readerList.js'],resolve);
                    }
                },
                "/clipboard": {
                    component: function (resolve) {
                        require.async(['js/modules/clipboard/clipboard.js'], resolve);
                    }
                },
            }
        },
        /**
         * 引导页
         * */
        '/guidePage': {
            component: function (resolve) {
                require.async(['js/category/guidePage.js'],resolve);
            }
        },
    });

    // 路由器会创建一个 App 实例，并且挂载到选择符 #app 匹配的元素上。
    router.start(App, 'html');

    //该函数会在每次路由切换成功进入激活阶段时被调用。
    router.afterEach(function (transition) {
        //console.log('成功浏览到: ' + transition.to.path)
        $("body").loading({state:false});
        $(window).unbind('scroll');
        //关闭所有dialog弹窗
        if(window.dialog){
            for(var x in dialog.list){
                dialog.list[x].remove().close()
            }
        }
        //关闭所有layer提示框
        window.layer && layer.closeAll();
    });

    module.exports = App;

});

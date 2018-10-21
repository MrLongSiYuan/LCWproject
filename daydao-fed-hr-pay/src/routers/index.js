import Vue from 'vue'
import App from '../App.vue'


var routes = [{
        path: '/',
        component: App, //顶层路由，对应index.html
        meta: {
            title: 'dayhr'
        },
        redirect: "/accountsIndex", //默认跳转到薪酬核算首页
        children: [{
                path: 'accountsIndex',
                component: function (resolve) {
                    require.ensure([], function () {
                        resolve(require('pages/accounts/accountsIndex.vue'));
                    }, 'models');
                },
                meta: {
                    title: "薪酬核算"
                }
            },
            {
                path: 'accountsDetail/:ruleId/:period',
                component: function (resolve) {
                    require.ensure([], function () {
                        resolve(require('pages/accounts/accountsDetail.vue'));
                    }, 'models');
                },
                meta: {
                    title: "薪酬详情"
                }
            },
            {
                path: 'index',
                component: function (resolve) {
                    require.ensure([], function () {
                        resolve(require('pages/base/index.vue'));
                    }, 'models');
                },
                meta: {
                    title: "测试2"
                }
            },
            {
                path: 'ruletest',
                component: function (resolve) {
                    require.ensure([], function () {
                        resolve(require('pages/base/rule.vue'));
                    }, 'ruletest');
                },
                meta: {
                    title: "测试1"
                }
            },

            {
                path: 'rule',
                component: function (resolve) {
                    require.ensure([], function () {
                        resolve(require('pages/rule/index.vue'));
                    }, 'rule');
                },
                meta: {
                    title: "薪酬规则"
                },
                name: 'rule'
            },
            {
                path: 'rule_detail/:ruleId/:uuid',
                component: function (resolve) {
                    require.ensure([], function () {
                        resolve(require('pages/rule/rule_detail/rule_detail.vue'));
                    }, 'rule');
                },
                meta: {
                    title: "薪酬规则详情"
                },
                name: 'rule_detail'
            },
            // 薪酬档案
            {
                path: 'pay_persons_list',
                component: function(resolve){
                    require.ensure([], function () {
                        resolve(require('pages/record/recordManage/index.vue'));
                    }, 'record');
                },
                meta: {
                    title: '薪酬档案管理'
                }
            },
            // {
            //     path: 'recordManage/batchEdit',
            //     component: function(resolve){
            //         require.ensure([], function () {
            //             resolve(require('pages/record/recordManage/children/batchEdit/index.vue'));
            //         }, 'batchEdit');
            //     },
            //     meta: {
            //         title: '薪酬档案批量修改'
            //     }
            // },
            {
                path: 'recordManage/editOnline',
                component: function(resolve){
                    require.ensure([], function () {
                        resolve(require('pages/record/recordManage/children/editOnline/index.vue'));
                    }, 'editOnline');
                },
                meta: {
                    title: '薪酬档案在线编辑'
                }
            },
            {
                path: 'recordManage/recordDetail',
                component: function(resolve){
                    require.ensure([], function () {
                        resolve(require('pages/record/recordManage/detail/recordDetail.vue'));
                    }, 'recordDetail');
                },
                meta: {
                    title: '薪酬档案详情'
                }
            },
            // 导出Excel
            {
                path: "exportData/:infoSetId",
                component: function (resolve) {
                    require.ensure([], function () {
                        resolve(require("commonVueLib/exportData/exportData.vue"));
                    }, "exportData");
                },
                meta: {
                    title: "导出数据"
                }
            },
            /*{
                path: 'changePay',
                component: function(resolve){
                    require.ensure([], function () {
                        resolve(require('pages/record/changePay/index.vue'));
                    }, 'changePay');
                },
                meta: {
                    title: '定薪调薪'
                }
            },
            {
                path: 'changePay/changePaySingle',
                component: function(resolve){
                    require.ensure([], function () {
                        resolve(require('pages/record/changePay/detail/changePaySingle.vue'));
                    }, 'changePaySingle');
                },
                meta: {
                    title: '单个定薪调薪'
                }
            },*/
            // 后台管理
            {
                path: 'management/type/:codeId',
                component: function(resolve){
                    require.ensure([], function () {
                        resolve(require('pages/management/projectManage/index.vue'));
                    }, 'management');
                },
                meta: {
                    title: '薪酬管理'
                }
            },
            //导入
            {
                path: "importData/:infoSetId/:importMode",
                component: function (resolve) {
                    require.ensure([], function () {
                        resolve(require("commonVueLib/importData/importData.vue"));
                    }, "importData");
                },
                meta: {
                    title: "导入数据"
                }
            },
            // 排序
            {
                path: 'management/sort',
                component: function(resolve){
                    require.ensure([], function () {
                        resolve(require('pages/management/projectManage/sort.vue'));
                    }, 'sort');
                },
                meta: {
                    title: '薪酬项目排序'
                }
            }


        ]
    },

    {
        path: '*',
        component: function (resolve) {
            require.ensure([], function () {
                resolve(require('commonVueLib/error/error404.vue')); //引入公共组件中的404页面
            }, 'error404');
        },
        meta: {
            title: "error404"
        }
    }

]


export default routes;

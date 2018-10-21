import Vue from 'vue'
import App from '../App.vue'


var routes = [
    {
        path: '/',
        component: App, //顶层路由，对应index.html
        meta:{title:'dayhr'},
        redirect:"reportDetail/:report_id",
        children:[
            {
                path: 'reportDetail/:report_id',
                component: function (resolve) {
                    require.ensure([], function(){
                        resolve(require('pages/reportDetail.vue'));
                    },'reportDetail');
                },
                meta:{
                    title:"汇报详情"
                }
            }

        ]
    },
    {
        path: '*'
        ,component: function (resolve) {
            require.ensure([], function(){
                resolve(require('commonVueLib/error/error404.vue'));  //引入公共组件中的404页面
            },'error404');
        },
        meta:{
            title:"error404"
        }
    }

]


export default routes;

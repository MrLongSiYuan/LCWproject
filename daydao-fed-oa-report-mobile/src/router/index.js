import Vue from 'vue'
import App from '../App.vue'


var routes = [
    {
        path: '/',
        component: App, //顶层路由，对应index.html
        meta:{title:'dayhr'},
        redirect:"/index",
        children:[
            {
                path: '/index',
                component: function (resolve) {
                    require.ensure([], function(){
                        resolve(require('pages/index.vue'));
                    },'index');
                },
                name:"index",
                meta:{
                    title:"工作汇报"
                }
            },
            {
                path: '/received',
                name:"received",
                component: function (resolve) {
                    require.ensure([], function(){
                        resolve(require('pages/received.vue'));
                    },'received');
                },
                meta:{
                    title:"工作汇报"
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

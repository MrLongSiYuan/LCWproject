import Vue from 'vue'
import App from '../App.vue'


var routes = [
    {
        path: '/',
        component: App, //顶层路由，对应index.html
        meta:{title:'dayhr'},
        redirect:"index/received",
        children:[
            {
                path: 'announcementDetail/:announcement_id',
                component: function (resolve) {
                    require.ensure([], function(){
                        resolve(require('pages/announcementDetail.vue'));
                    },'announcementDetail');
                },
                meta:{
                    title:"公告详情"
                },
                name:"announcementDetail"
            },
            {
                path: 'index/:indexParams',
                component: function (resolve) {
                    require.ensure([], function(){
                        resolve(require('pages/index.vue'));
                    },'index');
                },
                meta:{
                    title:"公告"
                },
                name:"index"
            },
            {
                path: 'addAnnouncement',
                component: function (resolve) {
                    require.ensure([], function(){
                        resolve(require('pages/addAnnouncement.vue'));
                    },'index');
                },
                meta:{
                    title:"发布公告"
                },
                name:"addAnnouncement"
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

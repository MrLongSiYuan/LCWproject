import store from 'src/store/store.js'; //公共状态管理

iview.LoadingBar.config({
  height: 3
  ,color:"#2d8cf0"
});

var vueRouter = new VueRouter({
  mode: 'history' // //去掉#号的模式hash(#),history(无#)
  ,base:"/hr/pay"
})

//路由切换特效
vueRouter.beforeEach(function (to, from, next) {
   // 表单处于编辑状态 ,在对应编辑页面 如果有编辑操作则调用 this.$store.commit("checkoutState/modifiedform",{isModified:true});
  if (store.state.checkoutState.isModifiedForm) {
      // 弹出提示框
      if (confirm("正在编辑表单，是否继续跳转其他页面？")) {
          // 更改公共状态 isModifiedForm=false 默认值
          store.commit("checkoutState/modifiedform", {
              isModified: false
          });
          next();
      } else {
          console.log("取消导航");
          next(false);
      }
  } else {
      //正常跳转
      iview.LoadingBar.start(); //启动进度条
      document.title = to.meta.title || "理才网";
      next();
  }
});

vueRouter.afterEach(function (route) {
  iview.LoadingBar.finish(); //完成加载进度条
});


export default vueRouter

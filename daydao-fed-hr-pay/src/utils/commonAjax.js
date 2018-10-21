import Ajax from 'src/utils/ajax.js'

const CommonAjax =  {

    getUserInfo: function (callback) {
        Ajax.$ajax({
            url: gMain.basePath + "home/homeIndex/loginUser.do"
            ,success: function (data) {
                if (data.result == "true") {
                    var oUser = {
                        sSessionId:data.sessionId  //会话ID
                        ,sDdh:data.dd   //用户dd号
                        ,corpId:data.corpId  //企业ID
                        ,corpName:data.corpName //企业名称
                        ,dd:data.dd //dd号
                        ,logoPath:data.logoPath //logo
                        ,orgName:data.orgName //用户组织名称
                        ,personId:data.personId //用户id
                        ,posName:data.posName //用户职位
                        ,userImage:data.userImage //用户头像
                        ,userName:data.userName //用户名称
                        ,userType:data.userType //用户类型
                        ,imgPath:"//static.daydao.com/"
                    };
                    //把用户的信息存储在全局变量之中
                    $.extend(true,gMain,oUser);
                    gMain.oUser = {
                        beans:[
                            {userInfo:oUser}
                        ]
                    };
                    typeof callback == "function" && callback(); //用户数据加载好回调

                }
            }
        });
    },
    cancelSaveModel: function(params, callback)  {
        Ajax.$ajax({
            url: gMain.apiBasePath + "perf/active/cancelSaveModel.do",
            data: JSON.stringify({"activeId":params.activeId}),
            success: function (data) {
                if (data.result == "true") {
                    typeof callback == "function" && callback(); //用户数据加载好回调
                }
            }
        })
    }
}

export default CommonAjax

/**
 * Created by Administrator on 2017/9/2.
 */
define(function (require,exports,module) {
    //引入依赖项
    var Ajax = require("js/ajax");
    /*
     *  个人信息获取
     * */
    var getPersonInfo = function() {
        Ajax.ajax({
            url:gMain.apiBasePath + "wrOrgPerson/getPersonBaseInfo.do"
            ,async:false
            ,beforeSend:function () {
            }
            ,complete:function () {
            }
            ,success:function (data) {
                if(data.result == "true"){
                    gMain.personInforReport = data.data;
                }
            }
        });
    };
    module.exports = getPersonInfo;
})
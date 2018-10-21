/**
 * Created by chenbinqun.
 *
 * new标签
 */

import NewFlag from './newFlag.vue'
import Ajax from '../Ajax/index'

// 用户已点击new标签
gMain.oNewFlag = {};
/**
 * 保存用户点击new标签(提供给其他模块调用)
 * @param type 模块名称
 * **/
gMain.saveNewFlag = function(type){
    if(!gMain.oNewFlag[type]) {
        Ajax.ajax({
            url: gMain.apiPath + "apiHome/daydaoHome/saveUserClickNewMenu",
            data: JSON.stringify({menuCode: type}),
            success: function (data) {
                let oldData = Object.assign({}, gMain.oNewFlag);
                // 不管更新成不成功
                oldData[type] = true;
                gMain.oNewFlag = oldData;
            }
        });
    }
};

/**
 * 获取已添加数据
 * @param callback
 */
gMain.getNewFlagList = function(callback){
    Ajax.ajax({
        url: gMain.apiPath + "apiHome/daydaoHome/getUserClickMenuList"
        ,success:function (data) {
            if(data.result === "true"){
                data = data.data || [];
                let newFlag = {};

                data.forEach(item=>{
                    newFlag[item] = true;
                });

                gMain.oNewFlag = newFlag;

                if(typeof callback === 'function'){
                    callback(newFlag);
                }
            }
        }
    });
};


export default NewFlag;

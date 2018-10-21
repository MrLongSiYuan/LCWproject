import commonAjax from 'commonVueLib/Ajax/index.js'

const Ajax =  {
    /**
     * 基于$.ajax方法改写，使用方法与$.ajax一样,如：Ajax.ajax({});
     * */
    $ajax:function (options) {
        var oData = {};
        // 特殊的options处理
        $.extend(oData,options);

        oData.success = function(obj){

            //对绩效请求返回状态进行拦截
            if(obj.result == "true") {
                if(obj.statusCode == "perf_10000002") {
                    let perfStoreId = obj.resultDesc || '2000000120954098';
                    iview.Modal.confirm({
                        title: '提示',
                        content: '绩效管理属于付费模块，您尚未购买，是否进行购买？',
                        loading: true,
                        onOk: function() {
                            var _this = this;
                            setTimeout(function () {
                                _this.buttonLoading = false;
                            },100)
                            // _this.loading = true;
                            // _this.buttonLoading = true;
                            // _this.visible = true
                            window.open(gMain.DayHRDomains.sStoreDomain + '#!/storeDetails/storeId:' + perfStoreId);
                        },
                        onCancel: () => {
                            var _this = this;
                            setTimeout(function () {
                                _this.buttonLoading = false;
                            },100)
                            history.go(-1)
                        }
                    });
                    return false;
                }
            }
            typeof options.success == "function" && options.success(obj);
        };
        return commonAjax.ajax(oData);
    },

    /**
     * 基础工具---组合URL参数
     * @param params
     * @returns {string}
     */
    getParamsStr: function (params) {
        var paramStr = "";
        if (params) {
            for (var k in params) {
                if (k && params[k] != null) {
                    var sParaVal = "";
                    if(typeof params[k] == "string" || typeof params[k] == "number"){
                        sParaVal = params[k];
                    }else if(typeof params[k] == "object"){
                        sParaVal = JSON.stringify(params[k]);
                    }
                    paramStr += '&' + k + '=' + sParaVal;
                }
            }
        }
        if(paramStr){
            paramStr = "?"+paramStr.substring(1);
        }
        return paramStr;
    }
}

export default Ajax

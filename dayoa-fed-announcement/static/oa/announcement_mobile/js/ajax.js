/**
 * 此ajax中做了拦截请求错误的统一提示，以及session过期的统一处理
 * 支持seajs方式引用和直接src引用，依赖于 jquery.js、layer.js，调用方式跟jquery的$.ajax()一样
 * 调用方式一（src方式）：
 * Ajax.ajax({
 *     url:"xx/xx.do"
 *    ,data:JSON.stringify(data)
 *    ,success:function(data){
 *        if(data.result == "true"){
 *            console.log(data);
 *        }
 *    }
 * });
 *
 * 调用方式二(用seajs加载)：
 * var Ajax = require("ajax");
 * 然后就参见方法一...
 */
define(function(require,exports,module){
    require("commonStaticDirectory/plugins/jquery.loading");
    var commonAjax = require("commonStaticDirectory/plugins/ajax.js");

    var Ajax = {
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
        },
        /**
         * 基于$.ajax方法改写，使用方法与$.ajax一样
         * */
        ajax:function (options) {
            return commonAjax.ajax(options);
        },
        /**
         * api接口统一管理处
         * */
        ApiTools:function(){
            var t = this;
            return {
                /**
                 * 检测会话是否超时
                 * */
                checkSessionTimeout:function(options){
                    var _pageLayer = null; //启用loading遮罩
                    t.ajax({
                        url:gMain.apiBasePath +"route/checkSessionTimeout.do",
                        data:JSON.stringify({}),
                        beforeSend:function(){
                            _pageLayer= layer.load(1, {shade: [0.3,'#ffffff']}); //启动loading遮罩
                        },
                        complete:function(){
                            layer.close(_pageLayer);
                        },
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                        }
                    });
                },
                /**
                 * 获取表头
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                getTableColumn:function(options){
                    var _formLayer= layer.load(1, {shade: [0.00001,'#FFFFFF']}); //启动loading遮罩
                    t.ajax({
                        url: gMain.apiBasePath +"route/"+ options.infoSetId +"/getTableColumn.do",
                        data: JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            layer.close(_formLayer);
                        }
                    });
                },
                /**
                 * 删除表格数据
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                del:function(options){
                    var _formLayer = null; //
                    t.ajax({
                        url: gMain.apiBasePath +"route/"+ options.infoSetId +"/del.do",
                        data: JSON.stringify(options.data),
                        beforeSend:function(){
                            _formLayer= layer.load(1, {shade: [0.3,'#ffffff']}); //启动loading遮罩
                        },
                        complete:function(){
                            layer.close(_formLayer); //关闭loading遮罩
                        },
                        success: function(data){
                            typeof options.success == "function" && options.success(data);
                        }
                    });
                },
                /**
                 * 获取下拉键值对
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                getKeyValueData:function(options){
                    t.ajax({
                        url: gMain.apiBasePath +"route/getKeyValueData.do",
                        data: JSON.stringify(options.data),
                        beforeSend:function(){
                            typeof options.beforeSend == "function" && options.beforeSend();
                        },
                        complete:function(){
                            typeof options.complete == "function" && options.complete();
                        },
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                        }
                    });
                },

                /**
                 * 数据初始化-顺序控制总接口
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                getCountDataByStep:function(options){
                    var pageLayer = layer.load(1, {shade: [0.3,'#ffffff']}); //启用loading遮罩
                    t.ajax({
                        url:gMain.apiBasePath + "dataInit/getCountDataByStep.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            typeof options.success == "function" && options.success(data);
                            layer.close(pageLayer);//关闭loading遮罩
                        }
                    });
                },
                /**
                 * 最后一个属性分割线---无实际意义----------------------------------------
                 * */
                lastPrototype:undefined
            };
        },
        /**
         * 最后一个属性分割线---无实际意义----------------------------------------
         * */
         lastPrototype:undefined
     };

    module.exports = Ajax;
});

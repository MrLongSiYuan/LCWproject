/**
 * Created by tangguoping on 2017/1/5.
 * 简历信息
 */
define(function(require, exports, module) {
    require("css/resumeInfo.css");
    var Ajax = require("js/ajax.js");
    var tools = require("commonStaticDirectory/plugins/tools");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus"); //弹窗
    require("commonStaticDirectory/plugins/jquery.loading");
    //下拉菜单组件
    var ClassName = function(){
        this.init.apply(this,arguments);
    }
    ClassName.prototype = {
        constructor : ClassName
        ,options:{
            mmg:undefined
        }
        /**
         *初始化函数
         */
        ,init : function(options){
            var t = this;
            //初始化类要做的事情
            this.options = $.extend({},this.options,options);

            $("body").loading({zIndex:999}) //启用loading遮罩
            t.dialog = dialog({
                title: '&nbsp;',
                content: "<div id='resumeInfoBox'></div>"
            });
            t.getResumeInfo();
        }
        /**
         * 获取简历信息
         * */
        ,getResumeInfo:function () {
            var t = this;
            Ajax.ajax({
                data:{resumeId:t.options.item.id}
                ,type:"GET"
                ,url:gMain.apiBasePath +"resumeLib/resumeInfo.do"
                ,success:function (data) {
                    if(data.result == "true"){
                        data.bean.baseInfo.filePrefix = t.options.oMetaData.filePrefix;
                        data.bean.baseInfo.baseStaticPath = gMain.baseStaticPath;
                        var _html = template('resume_info_tpl', data.bean);
                        $("#resumeInfoBox").html(_html);
                        t.dialog.showModal();
                        $("body").loading({state:false});
                        t.bindEvent();
                    }else {
                        tools.showMsg.error(data.resultDesc);
                    }
                }
            });
        }
        /**
         * 事件绑定
         * */
        ,bindEvent:function () {
            var t = this;
            //人才分类
            $("#recruit_typeBtn").on('click',function () {
                $("body").loading({zIndex:9999});  //启用loading
                require.async("js/moreBtns/ext_btn_person_type.js",function(Model){
                    new Model({aItem:[t.options.item],oMetaData:t.options.oMetaData});
                    $("body").loading({state:false}); //取消loading
                });
            });
            //简历下载
            $("#recruit_downloadBtn").on('click',function () {
                //载入并执行对应的按钮模块功能,扩展这里请在 modules文件夹下自定创建对应模块的js文件
                $("body").loading({zIndex:9999});  //启用loading
                require.async("js/moreBtns/ext_btn_download_resume.js",function(Model){
                    new Model({aItem:[t.options.item],oMetaData:t.options.oMetaData});
                    $("body").loading({state:false}); //取消loading
                });
            });
        }
        /**
         * 继续扩展方法
         */
        ,otherFunction : function(){

        }

    };
    module.exports = ClassName;
});



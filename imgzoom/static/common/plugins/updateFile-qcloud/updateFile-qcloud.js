/**
 * Created by xuelei_liao on 2016/12/14.
 * daydao云文件上传组件
 * @options 参数对象
 * @options.oFile 单个的文件对象
 * @options.tempId 单个的文件临时ID
 * @options.bucketName 固定值："cloudp"//daydao云的bucketName
 * @options.appid 固定值："10061427"//为项目的 APPID；
 * @options.successUpload(data)  Function 成功上传的回调
 * @options.errorUpload()  Function 成功失败的回调
 */
define(function(require, exports,module) {
    var Ajax = require("commonStaticDirectory/plugins/ajax");
    //daydao云上传
    require('commonStaticDirectory/plugins/updateFile-qcloud/jssha.js');
    var CosCloud = require("commonStaticDirectory/plugins/updateFile-qcloud/qcloud_sdk_v4.js");
    //获取MD5
    var browserMd5File=require("commonStaticDirectory/plugins/updateFile-qcloud/browser-md5-file.js");
    // 工具类
    var tools = require("commonStaticDirectory/plugins/tools.js");
    // 图压缩
    require("commonStaticDirectory/plugins/updateFile-qcloud/lrz.all.bundle.js");
    //
    // var basePath = gMain.basePath;
    //
    // var os = function() {
    //     var ua = navigator.userAgent,
    //         isWindowsPhone = /(?:Windows Phone)/.test(ua),
    //         isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
    //         isAndroid = /(?:Android)/.test(ua),
    //         isFireFox = /(?:Firefox)/.test(ua),
    //         isChrome = /(?:Chrome|CriOS)/.test(ua),
    //         isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
    //         isPhone = /(?:iPhone)/.test(ua) && !isTablet,
    //         isPc = !isPhone && !isAndroid && !isSymbian;
    //     return {
    //         isTablet: isTablet,
    //         isPhone: isPhone,
    //         isAndroid : isAndroid,
    //         isPc : isPc
    //     };
    // }();
    //
    // // 兼容www.daydao.com域名
    // if(os.isPc){
    //     basePath = gMain.DayHRDomains.sCloudDomain;
    // }
    //
    // // 兼容本地开发
    // if(location.host === 'www.daydao.com' || location.hostname === 'localhost'){
    //     basePath = gMain.apiPath || '/';
    // }

    var basePath = '//www.daydao.com/';

    function isFunction(fn){
        return typeof fn === 'function';
    }

    var  updateFile= function(){
        this.init.apply(this,arguments);
    };

    updateFile.prototype = {
        constructor: updateFile,
        options:{
            oFile:null //上传的文件
            ,bucketName:"cloudp"   // 腾讯云存储目录
            ,appid:"10061427"//为项目的 APPID；
            ,region: 'sh'  // 地域  华南地区填gz 华东填sh 华北填tj
            ,compress: true // 压缩图片
            // ,fileSort: 2 // 文件类型：1:文档 2：图片  3：音乐 4：视频 99：其它; 默认图片
        },
        init: function (options) {
            this.options = $.extend({},this.options,options);
            if(!this.options.oFile || typeof this.options.oFile != "object"){
                throw "请传入上传的文件";return;
            }
            if(this.options.oFile.length){
                this.options.oFile = this.options.oFile[0];
            }
            this.initDom();
        },
        initDom:function(){
            var t=this;
            t.fileMd5(t.options.oFile);
        }
        /**
         * 获取文件md5值
         * @param file
         */
        , fileMd5: function(file){
            var t = this;
            browserMd5File(file, function(err, md5){
                if(err){
                    isFunction(t.options.errorUpload) && t.options.errorUpload(data);
                    return ;
                }
                t.compressImg(file, md5);
            });
        }
        /**
         * 图片压缩，非图片不做处理
         * @param file
         */
        , compressImg: function(file, md5){
            var t = this;
            var type = file.type;
            if(t.options.compress && /image/.test(type)){
                lrz(file, {
                    width: 1001 // 图片宽度最大1001
                })
                    .then(function (rst) {
                        t.preupLoadFile(rst.file, file.name, rst.fileLen, md5);
                    });
            }else{
                t.preupLoadFile(file, file.name, file.size, md5);
            }
        }
        /**
         * 文件预上传，如果用户上传文件已存在则无需上传云平台
         *
         * @param file
         * @param md5
         */
        , preupLoadFile: function(file, fileName, fileSize, md5){
            var t = this;
            Ajax.ajax({
                url: basePath + "apiCloud/cpCloudCommon/preupLoadFile.do",
                data: JSON.stringify({fileName: fileName, fileSize: fileSize, fileMd5: md5/*, fileSort: t.options.fileSort*/}),
                success: function (data) {
                    if (data.result == "true") {
                        if(data.data && data.data.uploadFlg == "true"){
                            // 如果文件已存在则无需传云平台
                            var oCallback = data.data.data;
                            oCallback.tempId = t.options.tempId;

                            isFunction(t.options.successUpload) && t.options.successUpload(oCallback); //成功回调
                        }else {
                            // 文件未上传过则获取云平台秘钥上传云平台
                            t.getSign(data.data, file, fileName, fileSize, md5);
                        }
                    }
                }
            });
        }
        /**
         * 获取授权
         *
         * @param upFileName
         * @param file
         */
        , getSign: function(upFileName, file, fileName, fileSize, md5){
            var t = this;
            Ajax.ajax({
                url: basePath + "apiCloud/cpCloudCommon/getSign.do",
                data: JSON.stringify({fileName: fileName, upFileName: upFileName}),
                success: function (data) {
                    if (data.result == "true") {
                        t.uploadCos(data.data, file, fileName, fileSize, md5);
                    }
                }
            });
        }
        /**
         * 上传云平台
         * @param signInfo
         */
        , uploadCos: function(signInfo, file, fileName, fileSize, md5){
            var t = this;
            var bucketName = t.options.bucketName;
            // 创建上传云服务器对象
            var cos = new CosCloud({
                appid: t.options.appid,// APPID 必填参数
                bucket: bucketName,//bucketName 必填参数
                region: t.options.region,//地域信息 必填参数 华南地区填gz 华东填sh 华北填tj
                getAppSign: function (callback) {
                    callback(signInfo.sign);
                },
                getAppSignOnce: function (callback) {
                    callback(signInfo.sign);
                }
            });

           cos.uploadFile(function(data){
                // 成功回调
                t.sendCosshResult(data, fileName, fileSize, md5);
            }, function(data){
                // 失败回调
                if(data.statusText != 'abort'){
                    isFunction(t.options.errorUpload) && t.options.errorUpload(data);
                }
            }, function(percent, sha1Check){
                // 上传进度
               isFunction(t.options.onprogress) && t.options.onprogress(percent, sha1Check);
            }, bucketName, signInfo.cosPath, file, 1);

        }
        // 发送上传云服务成功反馈信息到后台
        , sendCosshResult: function(data, fileName, fileSize, md5){
            var t = this;
            var oPostData = {
                fileName: fileName,
                fileSize: fileSize,
                fileMd5: md5,
                fileStorageJsonResponse: typeof data === "string" ? JSON.parse(data): data
                // ,fileSort: t.options.fileSort
            };
            Ajax.ajax({
                url:  basePath +"apiCloud/cpCloudCommon/upLoadFile.do",
                data: JSON.stringify(oPostData),
                success: function (data) {
                    if (data.result == "true") {
                        var oCallback = data.data;
                        oCallback.tempId = t.options.tempId;
                        isFunction(t.options.successUpload) && t.options.successUpload(oCallback); //成功回调
                    }
                }
            });
        }
        /**
         * =============================华丽的分割线=============End===============================
         * */
        , lastPro: undefined
    };

    module.exports = updateFile;

});

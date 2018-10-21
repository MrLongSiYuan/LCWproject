
define(function(require,exports,module){

    /**
     * 获取版本号, 判断当前app版本是否超过4.5版本
     */
    function versionHeader(version,maxVersion){
        //获取当前版本号
        if(version){
            version = version;
        }else{
            var _version = getUrlParam('version');
            if(_version){
                if(_version.indexOf("#") != -1){
                    version = _version.split("#")[0]; //截取#前面的参数
                }else{
                    version = _version;
                }
            }
        }

        if(maxVersion){
            maxVersion = maxVersion;
        }else{
            maxVersion = '4.5';
        }

        version = version || '0.0.0';
        maxVersion = maxVersion || '0.0.0';

        if(version == maxVersion) return true;
        var nowVerArr = version.split(".");
        var maxVerArr = maxVersion.split(".");
        var len = Math.max(nowVerArr.length, maxVerArr.length);
        for(var i=0;i<len;i++){
            var nowVal = ~~nowVerArr[i]; //移位运算
            var maxVal = ~~maxVerArr[i];
            if(nowVal < maxVal){
                return false;
            }else if(nowVal > maxVal){
                return true;
            }
        }
        return false;
    }

    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var _url = window.location.href;
        if(_url.indexOf("?") != -1){
            var r = _url.split("?")[1].match(reg);  //匹配目标参数
            if (r != null) {
                return encodeURI(r[2]);
            }
        }
        return null; //返回参数值
    }

    module.exports = {
        versionHeader:versionHeader
    };
});



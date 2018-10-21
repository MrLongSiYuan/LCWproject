/**
 * Created by Zackey on 2017/3/6.
 */
define(function (require, exports, module) {

    var Utils = {
        /**
         * 获取随机颜色
         * */
        getRandomColor:function (num) {
            var t = this;
            var aRandomColors = ["#C589E2","#EA8484","#6EA7EA","#6FCD86","#EFA858","#6FCD86"];
            if(typeof num === "number"){
                if(num > 5){
                    num = 0;
                }
                return aRandomColors[num];
            }else{
                return aRandomColors[t.random(0,5)];
            }
        }
        /**
         * 取min与max之间的随机数
         * */
        ,random:function (min, max) {
            if (max == null) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        }
    };

    module.exports = Utils;
});
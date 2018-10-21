/**
 * Created by zhangqi on 2015/12/8.
 */
define(function(require,exports,module){
    //滑动选择组按键
    require("js/plugins/jquery.mobiscroll/mobiscroll.min.css");
    require("js/plugins/jquery.mobiscroll/mobiscroll.min.js");
    require("js/plugins/jquery.mobiscroll/jquery.scrollSelect.css");

    ;(function($){
        $.fn.extend({
            scrollSelect:function(options){
                $.fn.scrollSelect.oDefaults = {
                    eleType:"input"
                    ,data:[]
                    ,name:''
                };
                var t = this;
                var oOptions = $.extend({}, $.fn.scrollSelect.oDefaults, options); //合并参数
                var aItems = [];
                if(oOptions.data.length){
                    for(var i=0;i<oOptions.data.length;i++){
                        aItems.push('<option value="'+oOptions.data[i].key+'">'+oOptions.data[i].value+'</option>');
                    }
                }


                var sHtml = '<dl class="dayhApp_scrollSelect" name="'+oOptions.name+'">'+
                    '    <dt class="dayhApp_scrollSelect_dt">'+
                    '        <div class="cancel">取消</div><div class="ok">完成</div>'+
                    '    </dt>'+
                    '    <dd class="dayhApp_scrollSelect_dd">'+
                    '        <select name="" class="dayhApp_scrollSelect_select" style="display: none;">'+
                    aItems.join("")
                    '        </select>'+
                    '    </dd>'+
                    '</dl>';
                var $wrap = $(sHtml);
                $("body").append($wrap);
                createShade();
                var $select = $wrap.find("select:first");
                $select.mobiscroll().select({
                    theme:'ios7'
                    ,display:'inline'
                    ,minWidth:$(window).width()
                    ,height:40
                    ,rows:5
                    ,onSelect:function(valueText, inst){
                        console.log(arguments);
                        fillInValue(valueText, inst.getValue());
                        options.callback && options.callback($select);
                        $wrap.slideUp();
                        removeShade();
                    }
                });

                //制造遮罩
                function createShade(){
                    if(!$('.dayhApp_scrollSelect_shade').length){
                        var sShadeHtml = '<div class="dayhApp_scrollSelect_shade" style="width:100%;position: fixed;top:0;left:0;background: #000;opacity: 0.3;height: 100%;"></div>';
                        var $shade = $(sShadeHtml);
                        $("body").append($shade);
                    }
                }

                //取消遮罩
                function removeShade(){
                    if($("body").find(".dayhApp_scrollSelect_shade").length){
                        $("body").find(".dayhApp_scrollSelect_shade").remove();
                    }
                }

                //填充值
                function fillInValue(sVal, sid){
                    sVal = sVal.split(' ')[0];
                    if(oOptions.eleType == "input"){
                        $(t).val(sVal);
                    }else if(oOptions.eleType == "div"){
                        $(t).text(sVal);
                    }
                    $(t).attr("data-sid", sid);
                }

                //弹出
                $(t).on("click",function(){
                    createShade();
                    $wrap.slideDown();
                });

                //确认按钮
                $wrap.on("click",".ok",function(){
                    var sKey = $select.mobiscroll('getVal');
                    var sValue = $select.find("option[value='"+sKey+"']").text();
                    fillInValue(sValue, sKey);
                    options.callback && options.callback($select);
                    $wrap.slideUp();
                    removeShade();
                });

                //取消按钮
                $wrap.on("click",".cancel",function(){
                    $wrap.slideUp();
                    removeShade();
                });

            }
        });
    })(jQuery);

});



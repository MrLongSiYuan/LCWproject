/**
 * Created by chenbinqun.
 *
 * 图片缩放插件
 */
define(function(require, exports, module) {

    require('commonStaticDirectory/plugins/piczoom/css/imgzoom.css');
    require("commonStaticDirectory/plugins/artDialog/ui-dialog.css");
    require("commonStaticDirectory/plugins/artDialog/dialog-plus");

    /**
     * 滚轮事件
     */
    (function ($) {

        var types = ['DOMMouseScroll', 'mousewheel'];

        if ($.event.fixHooks) {
            for (var i = types.length; i;) {
                $.event.fixHooks[types[--i]] = $.event.mouseHooks;
            }
        }

        $.event.special.mousewheel = {
            setup: function () {
                if (this.addEventListener) {
                    for (var i = types.length; i;) {
                        this.addEventListener(types[--i], handler, false);
                    }
                } else {
                    this.onmousewheel = handler;
                }
            },

            teardown: function () {
                if (this.removeEventListener) {
                    for (var i = types.length; i;) {
                        this.removeEventListener(types[--i], handler, false);
                    }
                } else {
                    this.onmousewheel = null;
                }
            }
        };

        $.fn.extend({
            mousewheel: function (fn) {
                return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
            },

            unmousewheel: function (fn) {
                return this.unbind("mousewheel", fn);
            }
        });


        function handler(event) {
            var orgEvent = event || window.event, args = [].slice.call(arguments, 1), delta = 0, returnValue = true,
                deltaX = 0, deltaY = 0;
            event = $.event.fix(orgEvent);
            event.type = "mousewheel";

            if (orgEvent.wheelDelta) {
                delta = orgEvent.wheelDelta / 120;
            }
            if (orgEvent.detail) {
                delta = -orgEvent.detail / 3;
            }

            deltaY = delta;

            // Gecko
            if (orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
                deltaY = 0;
                deltaX = -1 * delta;
            }

            // Webkit
            if (orgEvent.wheelDeltaY !== undefined) {
                deltaY = orgEvent.wheelDeltaY / 120;
            }
            if (orgEvent.wheelDeltaX !== undefined) {
                deltaX = -1 * orgEvent.wheelDeltaX / 120;
            }

            args.unshift(event, delta, deltaX, deltaY);

            return ($.event.dispatch || $.event.handle).apply(this, args);
        }

    })(jQuery);


    /**
     * 图片缩放插件
     * */
    var ImgZoom = function (options) {
        var t = this;
        // 默认参数
        t.__settings = {
            title: '图片预览',
            width: 720,
            height: 540,
            autoShow: false,
            // 是否显示保存按钮
            saveBtn: true
        };

        // 图片切换类型
        t.previewType = {
            next: 'next',
            prev: 'prev',
            curr: 'curr'
        };

        t.dialog = dialog();

        // 图片放大比率
        t._proportion = 100;

        // 旋转
        t.deg = 0;

        // 是否全屏模式
        t.fullScreen = false;


        // 传入src方式创建
        if(options && options.src){
            t.$imgs = [];
            if($.isArray(options.src)){
                var len = 0;
                $.each(options.src, function(){
                    t.$imgs.push({src: this});
                    len++;
                });
                t.imgLen = len;
            }else{
                t.$imgs = [{src: options.src}];
                t.imgLen = 1;
            }
            t.__create(options);
        }

    };

    $.extend(ImgZoom.prototype, {
        version: '1.0'
        /**
         * 初始化
         */
        , __init: function (position, img) {

            var t = this;

            $(img).on('click', function (e) {
                t.show(position);
            });

        }
        /**
         * 打开图片预览
         */
        , show: function (index) {
            var t = this;
            // 显示第几张图片
            t.previewImg(index, t.previewType.curr);
            // 打开dialog
            t.dialog.showModal();
        }
        /**
         * 创建图片预览
         */
        , __create: function (options) {
            var t = this
                , opt
            ;

            opt = $.extend(true, t.__settings, options);

            t.__settings = opt;

            // 创建对话框
            t.__createDialog(opt);

            // 创建图片
            t.__createImg(opt);

            // 创建工具栏
            t.__createToolbar();

            // 添加事件
            t.__addEvent();
        }
        /**
         * 创建dialog对话框
         */
        , __createDialog: function (options) {
            var t = this;
            t.id = 'jq_imgzoom_' + new Date().getTime();
            t.dialog = dialog({
                width: options.width,
                height: options.height,
                title: options.title,
                padding: 0,
                cancel: function () {
                    if(!options.autoShow){
                        // 手动关闭对话框，让对话框缓存
                        t.dialog.close();
                    }else{
                        t.dialog.remove();
                    }
                    // 不让关闭框自动关闭
                    return false;
                },
                cancelDisplay: false
                ,
                content: '<div class="jq-img-zoom-view" id="' + t.id + '" style="width: ' + options.width + 'px;height: ' + options.height + 'px"></div>'
            });

            t.$container = $('#' + t.id);
        }
        /**
         * 创建图片
         */
        , __createImg: function (options) {
            var t = this
                , viweW = options.width
                , viewH = options.height
                , loading = 0
            ;

            $.each(t.$imgs, function (index, item){

                $('<img />').bind('load', function () {
                    var $this = $(this)
                        , width = this.width
                        , height = this.height
                    ;

                    $this.data({width: width, height: height});

                    $this
                        .css({
                            'position': 'absolute',
                            'cursor': 'move',
                            'left': viweW
                        })
                        .data({
                            width: width,
                            height: height
                        })
                        .attr('index', index)
                        .appendTo(t.$container)
                    ;

                    // 加载成功图片个数
                    loading++;

                    // 加载完成
                    if(loading === t.imgLen){
                        // 自动打开
                        if(t.__settings.autoShow){
                            t.show(0);
                        }
                    }
                }).attr('src', item.src);

            });
        }
        /**
         * 创建工具栏
         */
        , __createToolbar: function () {
            var t = this
                , $container = t.$container
                , opt = t.__settings
            ;
            var $close = $('<div class="close iconfont-imgzomm" title="关闭">&#xe637;</div>');
            var $next = $('<div class="next iconfont-imgzomm" title="下一张">&#xe613;</div>');
            var $prev = $('<div class="prev iconfont-imgzomm" title="上一张">&#xe61d;</div>');
            var $toolbar = $('<div class="tool-bar"></div>');

            var $btnbar = $('<ul class="btn-bar"></ul>');

            $btnbar
                .append('<li class="item" type="original" title="图片实际大小"><a href="javascript: void(0);">1:1</a></li>')
                .append('<li class="item" type="full" title="全屏查看"><a href="javascript: void(0);" class="iconfont-imgzomm">&#xe68f;</a></li>')
                .append('<li class="item hide" type="small" title="退出全屏"><a href="javascript: void(0);" class="iconfont-imgzomm">&#xe91a;</a></li>')
                .append('<li class="item" type="up" title="放大图片"><a href="javascript: void(0);" class="iconfont-imgzomm">&#xe74e;</a></li>')
                .append('<li class="item" type="down" title="缩小图片"><a href="javascript: void(0);" class="iconfont-imgzomm">&#xe607;</a></li>')
                .append('<li class="item" type="rotate" title="向右旋转图片"><a href="javascript: void(0);" class="iconfont-imgzomm">&#xe606;</a></li>')
            ;

            if(opt.saveBtn){
                $btnbar.append('<li class="item" type="save" title="保存"><a href="javascript: void(0);" class="iconfont-imgzomm">&#xe74d;</a></li>');
            }

            $toolbar
                .append($btnbar);

            $container
                .append($close)
                .append($next)
                .append($prev)
                .append($toolbar)
            ;

            t.resetToolbar();
        }
        /**
         * 添加事件
         */
        , __addEvent: function () {
            var t = this
                , $container = t.$container
                , offset = $container.offset()

                , $nextBtn = $container.find('.next')
                , $prevBtn = $container.find('.prev')
                , $toolbar = $container.find('.tool-bar')
                , $close = $container.find('.close')


                , leftQuarter = $container.width() / 4
                , rightQuarter = 3 * leftQuarter
                , topQuarter = $container.height() / 4
                , bottomQuarter = topQuarter * 3
                , imgLen = t.imgLen

                , mouseIsDownInImg = false, _X = 0, _Y = 0
                , $currImg
            ;

            $container
                .bind('mousemove', function (e) {
                    var pageX = e.pageX
                        , pageY = e.pageY
                        , offset = $(this).offset()
                        , mouse_x = pageX - offset.left
                        , mouse_y = pageY - offset.top;

                    if (imgLen > 1) {

                        if (mouse_x < leftQuarter) {
                            $prevBtn.show();
                        } else {
                            $prevBtn.hide();
                        }

                        if (mouse_x > rightQuarter) {
                            $nextBtn.show();
                        } else {
                            $nextBtn.hide();
                        }

                    }

                    if (t.fullScreen) {
                        if (mouse_y < topQuarter) {
                            $close.show();
                        } else {
                            $close.hide();
                        }
                    }

                    if (mouse_y > bottomQuarter) {
                        $toolbar.fadeIn('show');
                    } else {
                        $toolbar.fadeOut('show');
                    }

                    // 移动图片
                    if (mouseIsDownInImg) {
                        var moveX = pageX - _X;
                        var moveY = pageY - _Y;

                        $currImg.css({
                            top: moveY,
                            left: moveX
                        });
                    }
                    e.preventDefault();
                })
                .bind('mouseleave', function (e) {
                    mouseIsDownInImg = false;
                })
                .bind('mouseup', function () {
                    mouseIsDownInImg = false;
                })
                .bind('mousewheel', function (e, delta, deltaX, deltaY) {
                    // ↑ e 1 0 1
                    // ↓ e -1 0 -1
                    deltaY = deltaY > 0 ? 1 : -1;
                    t.zoomImg(deltaY);
                    e.preventDefault();
                })
                .on('mousedown', 'img', function (e) {
                    var $this = $(this)
                        , pointer = $this.position()
                        , width = $this.width()
                        , height = $this.height()
                    ;
                    mouseIsDownInImg = true;

                    _X = e.pageX - pointer.left;
                    _Y = e.pageY - pointer.top;

                    if (t.deg === 90 || t.deg === 270) {
                        _X -= (height - width) / 2;
                        _Y -= (width - height) / 2;
                    }

                    $currImg = $this;
                    e.preventDefault();
                })
            ;

            // 却换图片按钮
            // 向右
            $nextBtn.bind('click', function (e) {
                var $this = $(this);
                if (!$this.hasClass('disabled') && !t.animating) {
                    t.animating = true;
                    t.previewImg(t.currIndex + 1, t.previewType.next);
                }
                e.preventDefault();
            });

            // 向左
            $prevBtn.bind('click', function (e) {
                var $this = $(this);
                if (!$this.hasClass('disabled') && !t.animating) {
                    t.animating = true;
                    t.previewImg(t.currIndex - 1, t.previewType.prev);
                }
                e.preventDefault();
            });

            // 工具条
            $toolbar.on('click', '.item', function (e) {
                var $this = $(this)
                    , type = $this.attr('type')
                    , rotate = t.deg
                ;

                switch (type) {
                    case 'original':
                        t.maxImg();
                        break;
                    case 'full':
                        t.resizeDialog('full');
                        break;
                    case 'small':
                        t.resizeDialog('small');
                        break;
                    case 'up':
                        t.zoomImg(1);
                        break;
                    case 'down':
                        t.zoomImg(-1);
                        break;
                    case 'rotate':
                        if (rotate < 360) {
                            rotate += 90;
                        } else {
                            rotate = 90;
                        }
                        t.rotate(rotate);
                        break;
                    case 'save':
                        t.download();
                        break;
                }

                e.preventDefault();
            });

            $close.bind('click', function (e) {
                if(t.__settings.autoShow){
                    t.dialog.remove();
                }else{
                    t.dialog.close();
                }
                e.preventDefault();
            });
        }
        /**
         * 预览图片
         */
        , previewImg: function (index, type) {
            var t = this
                , $showImg = t.$container.find('img[index=' + index + ']')
                , width = imgW = $showImg.data('width')
                , height = imgH = $showImg.data('height')
                , viewW = t.$container.width()
                , viewH = t.$container.height()
                , ratio = 1
                , top, left, nextLeft
            ;

            t.currIndex = index;

            t._proportion = 100;

            t.rotate(0);

            // 调整图片大小
            if (imgW > viewW) {
                ratio = viewW / imgW;
                width = viewW;
                height = imgH * ratio;
            } else if (imgH > viewH) {
                ratio = viewH / imgH;
                width = imgW * ratio;
                height = viewH;
            }

            top = (viewH - height) / 2;
            left = (viewW - width) / 2;

            nextLeft = left;

            if (type === t.previewType.next) {
                left = viewW;
            } else if (type === t.previewType.prev) {
                left = -viewW;
            } else {
                t.resetImg();
                left = left < 0 ? 0 : left;
            }

            $showImg
                .css({
                    width: width,
                    height: height,
                    top: top < 0 ? 0 : top,
                    left: left
                })
                .data({
                    zoomWidth: width * 0.1,
                    zoomHeight: height * 0.1,
                    minWidth: width,
                    minHeight: height
                })
                .attr('nextLeft', nextLeft)
            ;

            // 却换图片按钮
            if (t.imgLen === 1) {
                t.$container.find('.next, .prev').addClass('disabled');
            } else {
                if (index === 0) {
                    t.$container.find('.prev').addClass('disabled');
                    t.$container.find('.next').removeClass('disabled');
                } else if (index === (t.imgLen - 1)) {
                    t.$container.find('.next').addClass('disabled');
                    t.$container.find('.prev').removeClass('disabled');
                } else {
                    t.$container.find('.next, .prev').removeClass('disabled');
                }
            }

            if (type === t.previewType.next) {
                t.nextPreviewImg();
            } else if (type === t.previewType.prev) {
                t.prevPreviewImg();
            }
        }
        /**
         * 下一张
         */
        , nextPreviewImg: function () {
            var t = this
                , $container = t.$container
                , index = t.currIndex
                , viewW = $container.width()
                , $currImg = $container.find('img[index=' + (index - 1) + ']')
                , $nextImg = $container.find('img[index=' + index + ']')
            ;

            $currImg.animate({
                left: -viewW
            }, 500, function () {
                t.animating = false;
            });

            $nextImg.animate({
                left: $nextImg.attr('nextLeft')
            }, 500, function () {
                t.animating = false;
            });
        }
        /**
         * 上一张
         */
        , prevPreviewImg: function () {
            var t = this
                , $container = t.$container
                , index = t.currIndex
                , viewW = $container.width()
                , $currImg = $container.find('img[index=' + (index + 1) + ']')
                , $prevImg = $container.find('img[index=' + index + ']')
            ;

            $currImg.animate({
                left: viewW
            }, 500, function () {
                t.animating = false;
            });

            $prevImg.animate({
                left: $prevImg.attr('nextLeft')
            }, 500, function () {
                t.animating = false;
            });
        }
        /**
         * 缩放
         *
         * @param zoom 缩放：1：放大；-1缩小
         */
        , zoomImg: function (zoom) {
            var t = this
                , $img = t.$container.find('img[index=' + t.currIndex + ']')
                , proportion = t._proportion + 10 * zoom;

            if (proportion < 10 || proportion > 1000) {
                proportion = zoom > 0 ? 1000 : 10;
            } else {
                var width = $img.data('zoomWidth'),
                    height = $img.data('zoomHeight'),
                    position = $img.position(), left = position.left, top = position.top
                    , newW, neH
                ;

                newW = $img.width() + width * zoom;
                neH = $img.height() + height * zoom;

                top = top - (height / 2) * zoom;
                left = left - (width / 2) * zoom;

                if (t.deg === 90 || t.deg === 270) {
                    left += (neH - newW) / 2;
                    top += (newW - neH) / 2;
                }

                $img.css({
                    width: newW,
                    height: neH,
                    top: top,
                    left: left
                });
            }
            t._proportion = proportion;
        }
        /**
         * 重置图片位置
         */
        , resetImg: function () {
            var t = this;

            t.$container.find('img').css('left', t.$container.width());
        }
        /**
         * 旋转
         */
        , rotate: function (deg) {
            var t = this
                , $currImg = t.$container.find('img[index=' + t.currIndex + ']')
            ;
            t.deg = deg;

            $currImg.css({
                'transform': 'rotate(' + deg + 'deg)',
                '-ms-transform': 'rotate(' + deg + 'deg)',
                '-moz-transform': 'rotate(' + deg + 'deg)',
                '-webkit-transform': 'rotate(' + deg + 'deg)',
                '-o-transform': 'rotate(' + deg + 'deg)'
            });
        }
        /**
         * 图片实际大小
         */
        , maxImg: function () {
            var t = this
                , $currImg = t.$container.find('img[index=' + t.currIndex + ']')
                , viewW = t.$container.width(), viewH = t.$container.height()
                , imgW = $currImg.data('width'), imgH = $currImg.data('height')
                , left, top
            ;

            left = (viewW - imgW) / 2;

            top = (viewH - imgH) / 2;

            t.rotate(0);

            $currImg.css({
                width: imgW,
                height: imgH,
                left: left,
                top: top
            });
        }
        /**
         * 全屏/最小化
         */
        , resizeDialog: function (type) {
            var t = this
                , $win = $(window)
                , w, h
                , options = t.__settings
                , $container = t.$container
            ;

            if (type === 'full') {
                t.dialog.title(null);
                w = $win.width();
                h = $win.height();
                $container.find('[type=full]').hide();
                $container.find('[type=small]').show();
                t.fullScreen = true;
            } else {
                t.dialog.title(options.title);
                w = options.width;
                h = options.height;
                $container.find('[type=full]').show();
                $container.find('[type=small]').hide();
                t.fullScreen = false;
            }
            t.dialog.width(w);
            t.dialog.height(h);
            t.$container.css({
                width: w,
                height: h
            });
            t.previewImg(t.currIndex, t.previewType.curr);
            t.resetToolbar();
        }
        /**
         * 重置工具栏 位置
         */
        , resetToolbar: function () {
            var t = this
                , $container = t.$container
                , w = $container.width(), h = $container.height()
            ;

            var $next = $container.find('.next');
            var $prev = $container.find('.prev');
            var $toolbar = $container.find('.tool-bar');

            $next.css({
                top: (h - 48) / 2
            });

            $prev.css({
                top: (h - 48) / 2
            });

            $toolbar.css({
                left: (w - $toolbar.width()) / 2
            });

        }
        /**
         * 下载
         */
        , download: function () {
            var t = this;
            window.location.href = t.$container.find('img[index=' + t.currIndex + ']').attr('src');
        }
    });

    $.fn.imgZoom = function (options) {

        if (!this.length) {
            return this;
        }

        var imgZoom = new ImgZoom();

        imgZoom.$imgs = this;
        imgZoom.imgLen = this.length;

        imgZoom.__create(options);

        this.each(function (index, img) {
            imgZoom.__init(index, img);
        });

        return imgZoom;
    };

    module.exports = ImgZoom;
});
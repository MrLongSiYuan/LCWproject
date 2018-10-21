*  文档来源：陈斌群 2017-08-23

# PC端图片缩放组件
## 一、简单介绍
- 支持图片缩放
- 支持图片旋转
- 支持保存到本地

## 二、引入方式
```
   //图片缩放工具
   var imgzoom = require("commonStaticDirectory/plugins/piczoom/imgzoom.js");
```

## 三、快速参考

- javascript

```
1、默认
$('img').imgZoom();  

2、配置参数
$('img').imgZoom({
    title: '图片预览',
    width: 720,
    height: 540
});

3、外部打开图片预览窗口
var imgzoom = $('img').imgZoom(); 

$('button').click(function(){
    imgzoom.show(0); // 参数为打开第几张图片，从0开始
});

4、传src方式
var imgZoom2 = new imgzoom({
    src: ['img/2.jpg', 'img/qq.gif', 'img/Tulips.jpg'] // src也可以是个字符串src: ''img/2.jpg'
});
$('.imgsrc').click(function(){
    var index = $(this).index();
    imgZoom2.show(index)
});

5、直接打开
$('.img2').click(function(){
    var $this = $(this);
    new imgzoom({
        src: $this.attr('src'),
        autoShow: true   //自动打开
    });
});
```

## 四、方法

无

## 五、配置参数

无

## 六、属性

| **参数名** |  **类型** | **是否必传**  | **默认值**  | **描述**  |
| ------------ | ------------ | ------------ | ------------ | ------------ |
| title  | String  | 否  | 图片预览 |   |
| width  | Number  | 否  | 720 |   |
| height  | Number  | 否  | 540  |  |

### 七、Demo图片

![图片缩放](http://gitlab.dayhr.com/COMMON-COMPONENTS/daydao-fed-common-cloudcos/raw/dev/static/test/imgzoom.png) 

[http://static.daydao.com/static/test/imgzoom/index.html](http://static.daydao.com/static/test/imgzoom/index.html)  

*组件由 陈斌群 贡献，说明文档由 陈斌群 贡献。*     
*本文档更新于2017.08.23*
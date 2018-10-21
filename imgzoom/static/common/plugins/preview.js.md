*  文档来源：唐赛武 2017-03-20

# 文件预览组件
## 一、简单介绍
- 基于文件上传到daydao云
- 对上传到daydao云的文件进行预览
- 支持pc端和移动端

## 二、引入方式

将需要使用的 preview.js文件分别放置到相应目录，并且保证相对路径正确

```
   //preview预览工具
   var tools = require("commonStaticDirectory/plugins/preview.js");//预览工具
```

## 三、快速参考

- javascript

```
    new preview({
         uuid: sId,//文件id，必传
         title: sName,//文件名，是否图片，非必传，默认不是（图片预览时需要传入参数true）
         isPopDialog: true,//是否弹窗，非必传,默认是弹窗，false表示只调用预览接口，只取预览接口的数据（视业务情况为定）
         isPic: false,//是否图片，非必传，默认不是（图片预览时需要传入参数true）
         isWap: "false"//是否移动端，非必传，默认不是（移动端预览时需要传入参数true）
     });
```

## 四、方法

无

### 示例

```
    new preview({uuid:sId,title:sName,isPopDialog:false});//只需要预览接口返回的数据

    new preview({uuid:sId,title:sName,isPopDialog:true});//pc文件预览
    new preview({uuid:sId,title:sName,isPopDialog:true,isPic:true});//pc图片预览
    
    new preview({uuid:sId,title:sName,isPopDialog:true,isWap:true});//移动端文件预览
    new preview({uuid:sId,title:sName,isPopDialog:true,isPic:true,isWap:true});//移动端图片预览
```

## 五、配置参数

无

## 六、属性

无

## 七、其他

*组件由 唐赛武 贡献，说明文档由 唐赛武 贡献。*     
*本文档更新于2017.04.11*

 

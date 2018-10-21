*  文档来源：唐赛武 2017-05-22

# daydao云上传组件
## 一、简单介绍
- 将文件上传到daydao云

## 二、引入方式

将需要使用的 updateFile-qcloud.js文件分别放置到相应目录，并且保证相对路径正确

```
   //daydao云上传插件
   var updateFile = require("commonStaticDirectory/plugins/updateFile-qcloud/updateFile-qcloud.js");
```

## 三、快速参考

- javascript

```
new updateFile({
    oFile:oFile //上传的文件
    ,tempId:oFileInfo.tempId
    ,bucketName:"cloudp"// daydao云的bucketName（默认cloudp）
    ,appid:"10061427"// 为项目的 APPID（默认10061427）
    ,region: "sh"   // 腾讯云存储区域（默认sh）
    ,compress: true  // 上传图片是否压缩（默认true）
    // 文件上传进度
    ,onprogress: function(percent, sha1Check){
        // 但前文件上传进度为
        var progress = parseInt(percent * 100) + '%'; // 如：10%
    }
    //上传成功的回调
    // data = {"result":"true","resultDesc":"上传成功","data":0, "tempId": "tempId"}
    ,successUpload:function (data) {
        $($event.target).val("");
        for(var j=0;j<t.oFileList[name].length;j++){
            if(t.oFileList[name][j].tempId == data.tempId){
                t.oFileList[name][j].uuid = data.uuid + "";
                t.oFileList[name][j].uploadStatus = "success"; //上传成功
            }
        }
        t.oFileList = tools.parseJson(t.oFileList);
    }
    //上传失败的回调
    ,errorUpload:function (data) {
        $($event.target).val("");
        for(var j=0;j<t.oFileList[name].length;j++){
            if(t.oFileList[name][j].tempId == data.tempId){
                t.oFileList[name][j].uploadStatus = "faild"; //上传失败
            }
        }
        t.oFileList = tools.parseJson(t.oFileList);
    }
});
```

## 四、方法

无

### 示例

```
    见快速参考
```

## 五、配置参数

|  **参数名** | **类型**  | **参数说明** | **描述**  |
| ------------ | ------------ | ------------ |------------ |
| oFile   | String  | 必传 | 单个的文件对象  |
| tempId   | string  | 必传 | 单个的文件临时ID  |
| bucketName   | string  | 非必传 | 默认值："cloudp"//daydao云的bucketName  |
| appid   | string  | 非必传 | 默认值："10061427"//为项目的 APPID  |
| region   | string  | 非必传 | 默认值："sh"//为项目的 region  |
| compress   | boolean  | 非必传 | 默认值："true"//是否压缩图片标示  |
| onprogress   | function  | 非必传 | 上传进度回调  |
| successUpload   | function  | 非必传 | 成功上传的回调 {data} 返回上传后返回的daydao云文件信息 |
| errorUpload   | function  | 非必传 |失败之后的回调  {data}中只有一个tempId属性|

## 六、属性

无

## 七、Demo图片

无

## 八、其他

*组件由 唐赛武 贡献，说明文档由 唐赛武 贡献。陈斌群 修改*     
*本文档更新于2017.07.11*

 
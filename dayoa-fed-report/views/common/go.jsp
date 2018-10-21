<%@ page language="java" pageEncoding="utf-8" %>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
    <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no">
</head>
<body>

<div style="text-align: center;line-height: 50px;width:50px;height:50px;position:absolute;left:50%;top:39%;margin-left:-25px;">
    <img src="//static.daydao.com/static/common/images/loading-1.gif" alt="loading">
</div>


<script>
    /**
     * 中间跳转页面
     * 使用说明：
     * 例如要跳转到这个页面：
     * /views/workflow/#!/metadata/infoSetId:wf_process_waitaudit_list&read_state:3
     * 对应的中间页面的写法就是
     * /views/common/go.jsp?sPath=%2Fviews%2Fworkflow%2F&sRouter=%2Fmetadata%2FinfoSetId%3Awf_process_waitaudit_list%26read_state%3A3
     * 转义项1： sPath 等于用这个转义一下 encodeURIComponent("/views/workflow/")
     * 转义项2： sRouter 等于也转义一下 encodeURIComponent("/metadata/infoSetId:wf_process_waitaudit_list&read_state:3")
     * 然后把这两个参数拼接起来即可  http://项目域名 + /views/common/go.jsp?sPath=转义项1&sRouter=转义项2
     */
    var oGo = {
        init:function () {
            var t = this;
            var sPath = t.getUrlParam("sPath");
            var sRouter = t.getUrlParam("sRouter");
            if(sPath){
                window.location.replace(sPath + "#!" + sRouter);
            }
        },
        getUrlParam:function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null){return unescape(r[2]);}else{return null;}
        }
    };
    oGo.init();
</script>
</body>
</html>

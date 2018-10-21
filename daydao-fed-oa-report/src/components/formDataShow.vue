<template>
    <ul class="dataList ">
        <li class="dataListItem clearfix" v-for="item in aFields" :data-fieldType="item.field_type" :data-name="item.field_name">
            <div v-if="
				item.field_type == 'text' ||
				item.field_type == 'paragraph' ||
				item.field_type == 'date' ||
				item.field_type == 'number' ||
				item.field_type == 'radio' ||
				item.field_type == 'checkboxes'
				">
                <div class="infor_left">
                    {{item.label}}
                </div>
                <div class="infor_right">
                    <span v-html="item.value"></span>
                    <!--人民币大写-->
                    <div v-if="item.capital == 'true'">（{{item.value | arabiaToChinese}}）</div>
                </div>
            </div>

            <!--说明字段-->
            <div v-if="item.field_type == 'remark'">
                <div class="infor_left">
                    {{item.label}}
                </div>
                <div class="infor_right">
                    {{item.describe}}
                </div>
            </div>

            <!--日期区间-->
            <div v-if="item.field_type == 'datearea'">
                <div class="clearfix">
                    <div class="infor_left">
                        {{item.label}}
                    </div>
                    <div class="infor_right">
                        {{item.startValue}}
                    </div>
                </div>
                <div class="clearfix">
                    <div class="infor_left">
                        {{item.label2}}
                    </div>
                    <div class="infor_right">
                        {{item.endValue}}
                    </div>
                </div>
            </div>

            <!--图片类型-->
            <div v-if="item.field_type == 'pic'">
                <div class="infor_left">
                    {{item.label}}
                </div>
                <div class="infor_right">
                    <ul class="imglist clearfix" v-if="item.valueUrls">
                        <li v-for="itemPic in item.valueUrls" track-by="$index" :data-uuid="itemPic.uuid">
                            <div class="preview_download_upload">
                                <div class="point_up"></div>
                                <div class="img_operation_item" v-on:click.prevent="previewPic($event,itemPic.url)">
                                    <Icon type="ios-eye-outline"></Icon>
                                    <span>查看</span>
                                </div>
                                <!--<div class="img_operation_item">
                                    <Icon type="ios-cloud-upload-outline"></Icon>
                                    <span>存云盘</span>
                                </div>-->
                                <div class="img_operation_item" v-on:click.prevent="downloadFile(itemPic.uuid)">
                                    <Icon type="ios-cloud-download-outline"></Icon>
                                    <span>下载</span>
                                </div>
                            </div>
                            <div class="imglist_imgbox" v-on:click.prevent="previewPic($event,itemPic.url)">
                                <img v-bind:src="(typeof itemPic.url == 'string' && itemPic.url.indexOf('http') != -1)?itemPic.url:(gMain.baseStaticPath +'common/images/loading-2.gif')" class="previewPic" alt="">
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <!--附件类型-->
            <div v-if="item.field_type == 'file'">
                <div class="infor_left">
                    {{item.label}}
                </div>
                <div class="infor_right">
                    <div class="addFilePreview clearfix">
                        <ul v-if="item.value.length" class="clearfix">
                            <li v-for="itemFile in item.value" track-by="$index" :data-uuid="itemFile.uuid">
                                <div class="preview_download_upload">
                                    <div class="point_left"></div>
                                    <div class="img_operation_item" v-on:click.prevent="previewFile($event,itemFile.uuid,itemFile.fileSort)">
                                        <Icon type="ios-eye-outline"></Icon>
                                        <span>查看</span>
                                    </div>
                                    <!--<div class="img_operation_item">
                                        <Icon type="ios-cloud-upload-outline"></Icon>
                                        <span>存云盘</span>
                                    </div>-->
                                    <div class="img_operation_item" v-on:click.prevent="downloadFile(itemFile.uuid)">
                                        <Icon type="ios-cloud-download-outline"></Icon>
                                        <span>下载</span>
                                    </div>
                                </div>
                                <span class="icon" style="display: none">图标：</span>
                                <span class="filename" :title="itemFile.fileName" v-on:click.prevent="downloadFile(itemFile.uuid)">{{itemFile.fileName}}</span>
                                <span class="size" style="display: none">{{itemFile.size}}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>


            <!--两列控件-->
            <div v-if="item.field_type == 'twoColumns' && ((item.firstCol && item.firstCol.fields) || (item.secondCol && item.secondCol.fields))">
                <form-data-show v-bind:a-fields="item.firstCol.fields"></form-data-show>
                <form-data-show v-bind:a-fields="item.secondCol.fields"></form-data-show>
            </div>

            <!--三列控件-->
            <div v-if="item.field_type == 'threeColumns' && ((item.firstCol && item.firstCol.fields) || (item.secondCol && item.secondCol.fields)  || (item.thirdCol && item.thirdCol.fields))">
                <form-data-show v-bind:a-fields="item.firstCol.fields"></form-data-show>
                <form-data-show v-bind:a-fields="item.secondCol.fields"></form-data-show>
                <form-data-show v-bind:a-fields="item.thirdCol.fields"></form-data-show>
            </div>

            <!--明细控件-->
            <div v-if="item.field_type == 'group' && item.group && item.group.fields">
                <dl class="groupItem">
                    <dt>{{item.label}}</dt>
                    <dd>
                        <ul>
                            <form-data-show v-bind:a-fields="item.group.fields"></form-data-show>
                        </ul>
                    </dd>
                </dl>
            </div>
        </li>
    </ul>
</template>
<script type="text/javascript">
    export default{
        props: ['aFields','uuid'],
        name: 'form-data-show',
        data: function () {
            return {
                firstChange:true, //第一次进来
            }
        },
        created: function () {
            var t = this;
            seajs.use(["commonStaticDirectory/plugins/piczoom/imgzoom.js","commonStaticDirectory/plugins/preview.js"],function(imgzoom,filePreview){
                t.imgzoom = imgzoom;
                t.filePreview = filePreview;
            })
        },
        watch:{
            "aFields":function () {
                var t = this;
                if(t.firstChange){
                    t.firstChange = false;
                    t.aFields = t.getParagraph(t.aFields);
                    console.log(t.aFields)
                }
            },
            "uuid":function () {    //上一篇写一篇查看汇报
                var t = this;
                t.aFields = t.getParagraph(t.aFields);
            }
        },
        methods: {
            previewFile:function (e,uuid,fileSort) {
                var t = this;
                if(fileSort == "1"){   //文件
                    new t.filePreview({
                        uuid:uuid
                        ,title:"文件预览"
                    });
                }else if(fileSort == "2"){  //图片
                    t.$daydao.$ajax({
                        url:gMain.apiPath + "apiCloud/cpCloudCommon/download.do"
                        ,data:JSON.stringify({
                            uuid:uuid
                        })
                        ,async:false //同步加载
                        ,success:function (data) {
                            if(data.result = "true"){
                                t.previewPic(e,data.data);
                            }
                        }
                    });
                }

            }
            /*
             * 筛选多行文本
             * */
            ,getParagraph:function (arr) {
                var t = this;
                for(var i = 0;i<arr.length;i++){
                    if(arr[i].field_type == "paragraph"){
                        arr[i].value = arr[i].value.replace(/[\n\r]/g,'<br/>');
                    }else if(arr[i].field_type == "group"){
                        arr[i].group.fields = t.getParagraph(arr[i].group.fields);
                    }else if(arr[i].field_type == "twoColumns"){
                        arr[i].firstCol.fields = t.getParagraph(arr[i].firstCol.fields);
                        arr[i].secondCol.fields = t.getParagraph(arr[i].secondCol.fields);
                    }else if(arr[i].field_type == "threeColumns"){
                        arr[i].firstCol.fields = t.getParagraph(arr[i].firstCol.fields);
                        arr[i].secondCol.fields = t.getParagraph(arr[i].secondCol.fields);
                        arr[i].thirdCol.fields = t.getParagraph(arr[i].thirdCol.fields);
                    }
                }
                return arr;
            }
            /*
             * 下载文件
             * */
            ,downloadFile:function (uuid) {
                var t = this;
                t.$daydao.$ajax({
                    url:gMain.apiPath + "apiCloud/cpCloudCommon/download.do"
                    ,data:JSON.stringify({uuid:uuid})
                    ,beforeSend:function () {
                    }
                    ,complete:function () {
                    }
                    ,success:function (data) {
                        if(data.result = "true"){
                            location.href = data.data;
                        }
                    }
                });
            }
            ,previewPic:function ($event,src) {
                var t = this;
                new t.imgzoom({
                    width: 640,
                    src: src,
                    autoShow: true
                });

            }
        },

    }
</script>
<style lang="scss" rel="stylesheet/scss">
    .dataList{
        li.dataListItem{
            margin-top: 15px;
            .preview_download_upload{
                display: none;
                width: 155px;
                height: 36px;
                background: rgba(0,0,0,0.5);
                position: absolute;
                left: 0px;
                top:68px;
                z-index: 9;
                box-sizing: border-box;
                padding: 0px 10px;
            }
            .imglist{
                float: left;
                width: 532px;
                li{
                    width: 83px;
                    float: left;
                    margin-right: 10px;
                    position: relative;
                    height: 93px;
                    /*overflow: hidden;*/
                    margin-bottom: 10px;
                    .imglist_imgbox{
                        width: 83px;
                        position: relative;
                        height: 83px;
                        overflow: hidden;
                        border: 1px solid #ccc;
                        cursor: pointer;
                        img{
                            position: absolute;
                            top: 50%;
                            -ms-transform:translate(-50%, -50%);
                            -moz-transform:translate(-50%, -50%);
                            -webkit-transform:translate(-50%, -50%);
                            -o-transform:translate(-50%, -50%);
                            transform: translate(-50%, -50%);
                            max-width: 83px;
                            left: 50%;
                        }
                    }
                }
            }
            .addFilePreview{
                .filename{
                    font-size: 14px;
                    line-height: 20px;
                    color: #296695;
                    max-width: 532px;
                    word-break: break-all;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    cursor: pointer;
                }
            }
        }
        li.dataListItem[data-fieldtype="twoColumns"] li.dataListItem{
            display: block;
            float: left;
            width: 50%;
        }
        li.dataList .dataListItem[data-fieldtype="twoColumns"] li.dataListItem[data-fieldtype = "text"] .right{
            width: auto;
        }
        li.dataListItem[data-fieldtype="threeColumns"] li.dataListItem{
            display: block;
            float: left;
            width: 33.33%;
        }
        li.dataListItem[data-fieldtype="threeColumns"] li.dataListItem[data-fieldtype = "paragraph"] .right{
            width: auto;
        }
        li.dataListItem[data-fieldtype="threeColumns"] li.dataListItem[data-fieldtype = "text"] .right{
            width: auto;
        }
    }
</style>

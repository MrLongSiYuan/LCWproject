<template>
    <div id="add_announcement_classify">
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
            <FormItem label="分类名称" prop="addClassifyTitle">
                <Input
                    v-model="formValidate.addClassifyTitle"
                    placeholder="请输入标题不超过20个汉字"
                    style="width:460px;">
                </Input>
            </FormItem>
            <FormItem label="分类名称" prop="classifyExplain">
                <Input v-model="formValidate.classifyExplain"
                       type="textarea"
                       :autosize="{minRows: 6,maxRows: 20}"
                       placeholder="请输入说明"
                       style="width:460px;">
                </Input>
            </FormItem>
        </Form>
        <div class="add_classify_footer clearfix">
            <div class="add_classify_btn">
                <Button type="primary" @click="addAnnClass">保存</Button>
                <Button v-if="routerName != 'addAnnouncement'">保存并新增</Button>
                <Button @click="quitAddClassify">取消</Button>
            </div>
        </div>
    </div>
</template>
<script type="text/javascript">
    export default{
        data: function () {
            return {
                formValidate: {
                    addClassifyTitle: '', //分类名称
                    classifyExplain: '', //分类说明
                },
                ruleValidate: {
                    addClassifyTitle: [
                        { required: true, message: '分类名称不能为空', trigger: 'blur' }
                    ],
                },
                routerName:"", //当前的路由
            }
        },
        created: function () {
            var t = this;
            t.routerName =  t.$route.name;
        },
        methods: {
            /*
            * 添加公告分类
            * */
            addAnnClass:function () {
                var t = this;
                t.formValidate.addClassifyTitle = t.formValidate.addClassifyTitle.replace(/\s/g,"");
                t.formValidate.classifyExplain = t.formValidate.classifyExplain.replace(/\s/g,"");
                t.formValidate.classifyExplain = t.formValidate.classifyExplain.replace(/[\n\r]/g,"");
                if(!t.formValidate.addClassifyTitle){
                    this.$Message.error('分类名称不能为空');
                    return;
                }
                t.$daydao.$ajax({
                    url: gMain.apiBasePath + "route/am_type_list/insert.do",
                    data: JSON.stringify({
                        "dataList": [
                                {
                                    "key": "type_name",
                                    "value": t.formValidate.addClassifyTitle
                                },
                                {
                                    "key": "explain",
                                    "value": t.formValidate.classifyExplain
                                }
                            ],
                        "infoSetId": "am_type_list"
                    }),
                    beforeSend:function () {

                    },
                    complete:function () {

                    },
                    success: function (data) {
                        if (data.result == "true" && data.resultDesc) {
                            t.$Message.success('保存成功');
                            t.$parent.$parent.getAnnClassigyList();
                            t.$parent.$parent.addClassifyShow = false;
                        }
                    }
                })
            },
            /*
            * 退出
            * */
            quitAddClassify:function () {
                var t = this;
                t.$parent.$parent.addClassifyShow = false;
            }
        },
    }
</script>
<style lang="scss" rel="stylesheet/scss">
    #add_announcement_classify{
        padding-top: 25px;
        padding-left: 25px;
        .add_classify_footer{
            padding-right: 95px;
            margin-top: 26px;
            .add_classify_btn{
                float: right;
                button{
                    margin-left: 10px;
                }
            }
        }
    }
</style>

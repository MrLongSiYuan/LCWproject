<template>
    <div id="add_announcement_wrap">
        <div class="add_announcement_header">
            <div class="back_btn" @click="goBack"><i class="iconfont_daydao_common">&#xe6a8;</i>返回</div>
            发布公告
        </div>
        <div id="add_announcement_form_wrap">
            <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="150">
                <FormItem label="公告标题" prop="addAnnTitle">
                    <Input v-model="formValidate.addAnnTitle" placeholder="请输入标题不超过20个汉字" style="width: 750px"></Input>
                </FormItem>
                <FormItem label="发布范围" prop="publicationScope" >
                    <Input v-model="formValidate.publicationScope" icon="arrow-down-b" readonly  placeholder="请选择发布范围"></Input>
                    <drop-tree-menu
                        v-if="isDrop"
                        ref="treeMenu"
                        :treeStyleId="leftTreeId"
                        :isAutoInit="true"
                        :isFirstTriggerNodeClick="false"
                        :isShowInclude="true"
                    ></drop-tree-menu>
                    <!--<page-tree-menu
                        ref="treeMenu"
                        @clickMenuCallback="clickMenuCallback"
                        v-if="!isDrop && Array.isArray(navigationData) && navigationData.length"
                        :navigationData="navigationData" >
                    </page-tree-menu>-->
                </FormItem>
                <FormItem label="公告分类" prop="annClassify">
                    <Select v-model="formValidate.annClassify" style="width:642px;" placeholder="请选择分类">
                        <Option v-for="item in classifyAnnList" :value="item.type_name" :key="item.uuid" v-html="item.type_name"></Option>
                    </Select>
                    <Button type="primary" style="float: right" @click="addClassify">添加分类</Button>
                </FormItem>
                <FormItem label="公告正文" prop="annContent" >
                    <Input v-model="formValidate.annContent"
                           type="textarea"
                           :autosize="{minRows: 4,maxRows: 20}"
                           placeholder="请输入正文">
                    </Input>
                </FormItem>
                <FormItem label="添加图片">
                    <div class="add_pic_btn_wrap">
                        <div class="add_pic_btn">
                            <i class="iconfont_daydao_common">&#xe619;</i>
                        </div>
                        <p class="pic_max_size">图片不超过10M</p>
                    </div>
                </FormItem>
                <FormItem label="附件">
                    <div class="add_attachment_btn_wrap">
                        <Button type="ghost">添加附件</Button>
                        <span class="attachment_size">附件不超过10M</span>
                    </div>
                </FormItem>
                <FormItem label="其他设置">
                    <Checkbox label="允许评论" v-model="formValidate.canComment">
                        <span>允许评论</span>
                    </Checkbox>
                    <Checkbox label="显示水印" v-model="formValidate.canWatermark">
                        <span>显示水印</span>
                    </Checkbox>
                    <Checkbox label="定时发布" v-model="formValidate.canTimedPublish">
                        <span>定时发布</span>
                    </Checkbox>
                </FormItem>
                <FormItem label="请选择定时发送时间" v-show="formValidate.canTimedPublish">
                    <DatePicker type="datetime"
                                placeholder="请选择定时发布日期和时间"
                                style="width: 340px"
                                v-model="formValidate.dataTimePublish"
                                format="yyyy-MM-dd HH:mm"
                                @on-change="chooseTimePublish">
                    </DatePicker>
                    <div class="show_set_time" v-show="formValidate.dataTimePublish">
                        此公告将在<i>{{formValidate.dataTimePublish}}</i>自动发布
                    </div>
                </FormItem>
            </Form>
        </div>
        <div class="add_announcement_footer">
            <div class="footer_btn_box">
                <div class="btn_wrap">
                    <Button type="primary">发布</Button>
                    <Button>预览</Button>
                    <Button>存草稿</Button>
                    <Button @click="goBack">取消</Button>
                </div>
            </div>
        </div>
        <page-slide :pageTitle="addClassifyTitle" v-model="addClassifyShow">
            <add-ann-classify></add-ann-classify>
        </page-slide>
    </div>
</template>
<script type="text/javascript" src="./addAnnouncement.js"></script>
<style lang="scss" rel="stylesheet/scss">
   /* body,html{
        height: 100%;
        #daydao_main_app{
            height: 100%;
            #daydao_content_app_wrap{
                height: 100%;
                #daydao_content_app_content{
                    height: 100%;
                    div[slot = 'content']{
                        height: 100%;
                    }
                }
            }
        }
    }*/
    #add_announcement_wrap{
        position: relative;
        padding-top: 46px;
        height: 100%;
        box-sizing: border-box;
        padding-bottom: 50px;
        .add_announcement_header{
            width: 100%;
            position: absolute;
            height: 46px;
            background: #F5F7F9;
            text-align: center;
            line-height: 46px;
            font-size: 16px;
            color: #657180;
            left: 0;
            top: 0;
            .back_btn{
                cursor: pointer;
                padding-left: 18px;
                float: left;
                height: 100%;
                color: #657180;
                line-height: 46px;
                height: 46px;
                font-size: 14px;
                i{
                    margin-right: 6px;
                    font-size: 14px;
                }
            }
        }
        #add_announcement_form_wrap{
            width: 900px;
            margin: 0 auto;
            margin-top: 40px;
            .show_set_time{
                font-size: 12px;
                color: #90A2B9;
                i{
                    font-style: normal;
                    color: #F18950;
                }
            }
            .add_attachment_btn_wrap{
                span.attachment_size{
                    font-size: 12px;
                    color: #90A2B9;
                    margin-left: 10px;
                }
            }
            .add_pic_btn_wrap{
                .add_pic_btn{
                    width: 83px;
                    height: 83px;
                    border: 1px solid #D7DDE4;
                    border-radius: 2px;
                    text-align: center;
                    line-height: 83px;
                    i{
                        font-size: 35px;
                        color:  #D7DDE4;
                    }
                    cursor: pointer;
                }
                p.pic_max_size{
                    font-size: 12px;
                    color: #90A2B9;
                }
            }
        }
        .add_announcement_footer{
            height: 50px;
            position: absolute;
            width: 100%;
            left: 0;
            bottom: 0;
            box-sizing: border-box;
            padding-top: 10px;
            background: rgba(116, 127, 140,0.8);
            text-align: center;
            .footer_btn_box{
                display: block;
                width: 900px;
                margin: 0 auto;
                .btn_wrap{
                    float: right;
                    margin-right: 91px;
                    button{
                        margin-left: 10px;
                    }
                }
            }
        }
    }
</style>

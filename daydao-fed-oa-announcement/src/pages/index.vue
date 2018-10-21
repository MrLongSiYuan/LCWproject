<template>
    <div id="announcement_index">
        <div class="index_tap_switch_wrap" v-show="adminJuri">
            <ul>
                <li class="tap_list active" data-param="received">我收到的</li>
                <li class="tap_list" data-param="publish">我发布的</li>
                <li class="tap_list" data-param="notPublish">未发布的</li>
            </ul>
        </div>
        <Spin size="large" fix v-show="spinShow"></Spin>
        <div class="index_add_search_wrap clearfix">
            <div class="add_btn_wrap">
                <Button type="primary" @click="jumpAddAnnouncement" v-if="adminJuri">发布公告</Button>
            </div>
            <div class="search_btn_wrap clearfix">
                <div class="only_search_btn" @click.stop="">
                    <div class="search_btn iconfont_daydao_common" @click="showSimpleSearch">&#xe67f;</div>
                </div>
                <div class="search_input" style="display: none">
                    <Input v-model="searchInfor.announcementTitle" placeholder="请输入搜索内容" style="width: 300px" @on-keyup="conditionSearch($event,'simpleKeyup')"></Input>
                    <div class="search_btn iconfont_daydao_common" @click="conditionSearch($event,'simple')">&#xe67f;</div>
                </div>
                <Button type="text" @click="openSeniorSearch">高级筛选</Button>
            </div>
        </div>
        <div class="senior_search_wrap" style="display: none">
            <div class="close_senior_search" @click="closeSeniorSearch">
                <span class="iconfont_daydao_common">&#xe6a6;</span>
            </div>
            <Form  :label-width="80">
                <Row>
                    <Col span="8">
                        <FormItem label="关键词">
                            <Input  placeholder="请输入关键词" style="width: 280px" v-model="searchInfor.announcementTitle"></Input>
                        </FormItem>
                    </Col>
                    <Col span="8" style="text-align: center">
                        <FormItem label="日期" style="display: inline-block">
                            <DatePicker type="daterange" placeholder="全部日期" style="width: 280px" @on-change="selectSearchTime" v-model="searchTimeResult"></DatePicker>
                        </FormItem>
                    </Col>
                    <Col span="8">
                        <FormItem label="公告分类" style="float: right">
                            <Select v-model="classifyAnn" style="width:280px;" placeholder="全部分类" @on-change="selectSearchClassify">
                                <Option v-for="item in classifyAnnList" :value="item.type_name" :key="item.uuid">{{ item.type_name }}</Option>
                            </Select>
                        </FormItem>
                    </Col>
                </Row>
            </Form>
            <div class="senior_bottom_btn clearfix">
                <div class="clear_all_btn">
                    <Button type="ghost" @click="resetSearchOption">重置</Button>
                </div>
                <div class="search_btn">
                    <Button type="primary" @click="conditionSearch($event,'seniorSearch')">搜索</Button>
                </div>
            </div>
        </div>
        <div class="announcement_list_wrap">
            <single-list-file
                  :announcement-list="announcementList"
                  :announcement-type="announcementType" ref="single">
            </single-list-file>
        </div>
        <div class="more_announcement_list_btn" v-if="announcementTotal > 10 && announcementList.length < announcementTotal && announcementList.length != 0">
            <span class="more_btn" @click="loadMoreAnnList">点击加载更多<i class="iconfont_daydao_common">&#xe62c;</i></span>
        </div>
        <div class="announcement_list_end" v-if="announcementTotal > 10 && announcementList.length == announcementTotal">
            <span class="more_btn"></span>
            <span class="no_more">已全部加载完</span>
        </div>
    </div>
</template>
<script type="text/javascript" src="./index.js">
</script>
<style lang="scss" rel="stylesheet/scss">
    #announcement_index{
        background: #f5f7f9;
        .index_tap_switch_wrap{
            background: #fff;
            width: 100%;
            height: 46px;
            ul{
                display: block;
                box-sizing: border-box;
                height: 100%;
                padding: 14px 0 16px 0;
                li.tap_list{
                    display: block;
                    float: left;
                    color: #657180;
                    font-size: 16px;
                    line-height: 16px;
                    padding: 0 20px;
                    border-right: 1px solid #E3E8EE;
                    cursor: pointer;
                    &:nth-last-child(1){
                        border-right: none;
                    }
                    &:hover{
                        color: #F18950;
                    }
                }
                li.active{
                    color: #F18950;
                    @extend .tap_list;
                }
            }
        }
        .index_add_search_wrap{
            background: #fff;
            height: 46px;
            .add_btn_wrap{
                float: left;
                padding: 8px 20px;
            }
            .search_btn_wrap{
                float: right;
                .only_search_btn{
                    width: 300px;
                    height: 30px;
                    box-sizing: border-box;
                    padding-right: 10px;
                    margin-top: 8px;
                    margin-right: 10px;
                    float: left;
                    position: relative;
                    .search_btn{
                        position: absolute;
                        top:4px;
                        right: 10px;
                        font-size: 16px;
                        cursor: pointer;
                    }
                }
                .search_input{
                    @extend .only_search_btn;
                }
                .ivu-btn{
                    float: right;
                    padding: 16px 0px;
                    border: none;
                    span{
                        display: block;
                        font-size: 14px;
                        line-height: 14px;
                        padding: 0 20px;
                        border-left: 1px solid #E3E8EE;
                    }
                }
            }
        }
        .senior_search_wrap{
            background: #fff;
            height: 130px;
            background-color: #FAFBFD;
            margin-top: 2px;
            box-shadow: 0 0 5px 0 rgba(0,0,0,0.18);
            border-radius: 2px;
            box-sizing: border-box;
            position: relative;
            padding-top: 22px;
            padding-right: 60px;
            padding-left: 39px;
            padding-bottom: 20px;
            position: relative;
            .close_senior_search{
                position: absolute;
                top:12px;
                right: 20px;
                width: 16px;
                height: 16px;
                cursor: pointer;
                span{
                    line-height: 16px;
                }
            }
        }
        .senior_bottom_btn{
            background: #fff;
            position: absolute;
            right: 20px;
            bottom: 20px;
            .search_btn{
                float: right;
            }
            .clear_all_btn{
                float: right;
                margin-left: 10px;
            }
        }
        .more_announcement_list_btn{
            background: #fff;
            height: 30px;
            text-align: center;
            line-height: 30px;
            color: #285DA4;
            font-size: 12px;
            background:  #F4F8FA;
            margin-top: 10px;
            span{
                cursor: pointer;
                display: inline-block;
                height: 100%;
                &:hover{
                    color: #F18950;
                }
                i{
                    display: inline-block;
                    height: 100%;
                    font-size: 16px;
                    line-height: 25px;
                    transform: scale(.5);
                }
            }
        }
        .announcement_list_end{
            height: 40px;
            position: relative;
            text-align: center;
            line-height: 40px;
            .more_btn{
                display: block;
                height: 19px;
                position: absolute;
                box-sizing: border-box;
                width: 100%;
                top:0;
                left: 0;
                border-bottom: 1px dashed #90a2b9;
                z-index: 0;
            }
            .no_more{
                background: #f5f7f9;
                display: block;
                padding: 0 10px;
                height: 100%;
                position: absolute;
                top:0;
                left: 50%;
                margin-left: -46px;
                z-index: 2;
            }
        }
    }
</style>

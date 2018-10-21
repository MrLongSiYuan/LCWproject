<template>
    <div id="record_detail_base_info">
        <my-loading :isShow = 'isFetch' ></my-loading>
        <div class="head_img">
            <!-- <img :src="baseInfo.head_img | imgPreShow" 
                 :id="('baseinfo_'+baseInfo.person_id)" 
                 @error="imgLoadError($event,baseInfo.person_name,'baseinfo_'+baseInfo.person_id)"> -->
            <head-img :imgUrl="baseInfo.head_img | imgPreShow" 
                      :personId="baseInfo.person_id"
                      :personName="baseInfo.person_name"
                      v-show="!isFetch"
                      :fontSize="22"
                      :width="80"
                      :height="80">
            </head-img>
        </div>
        <p class="person_name">{{baseInfo.person_name}}</p>
        <p class="cell_phone">{{baseInfo.cell_phone}}</p>
        <p class="other_info">
            <span :class='[(baseInfo.org_id && baseInfo.join_date) && "addLine"]'>{{baseInfo.org_id}}</span>           
            <span>{{baseInfo.join_date}}入职</span>        
        </p> 
    </div>
</template>

<script type="text/babel">
    import myLoading from "src/components/loading/myLoading.vue";
    import {handleImgError , imgPreShow} from "src/utils/helpers.js";
    import headImg from "commonVueLib/headImg/headImg";

    const infoSetId = 'pay_person_base'
    export default {
        data() {
            return {
                infoSetId: infoSetId,
                baseInfo: {},
                isFetch: true
            }
        },
        components: {
            myLoading,
            headImg
        },
        filters: {
            imgPreShow
        },
        created() {
            this.init();
        },
        methods: {
            init() {
                const self = this;
                const postData = {};
                postData.editCondition = {
                    key: 'person_id',
                    value: self.$route.query.id,
                    infoSetId: self.infoSetId
                };
                self.$daydao.$ajax({
                    url: gMain.apiBasePath + `route/${self.infoSetId}/getEditDataAndColumn.do`,
                    data:JSON.stringify(postData),
                    success: function (data) {
                        self.isFetch = false; 
                        if(data.result === 'true') {
                            self.baseInfo = data.beans[0].data[0];
                            self.$parent.staffName = self.baseInfo.person_name;
                        }
                    }
                })
            },
            imgLoadError:handleImgError,
        },
    }
</script>

<style lang="scss">
    #record_detail_base_info{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
        padding-top: 76px;
        .addLine:after{content:' | ';}
        & > .head_img{
                margin-bottom:20px;
                img,.pay_base_head_img{
                    width:80px;
                    height:80px;
                    line-height: 80px;
                    border-radius: 50%;
                    display: inline-block;
                    text-align: center;
                    line-height: 80px;
                    color:#fff;  
                    font-size: 22px;
                    font-style: normal;
                }
            }
            .person_name{
                font-size: 18px;
                color: #657180;
            }
            .cell_phone{
                font-size: 16px;
                color: #3D4651;
            }
            .other_info{
                font-size: 14px;
                color: #657180;
                margin-top: 16px;
            }
    }
</style>
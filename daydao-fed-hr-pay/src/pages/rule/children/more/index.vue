<template>
    <activity-procedure :type="type" :infoSetId="infoSetId" :activityData="activityData" :activeId="activeId"></activity-procedure>
</template>

<style lang="scss">


</style>

<script type="text/babel">

//    import { mapGetters, mapActions } from 'vuex'
    import activityProcedure from 'components/activity/activity_procedure/procedure'

    export default {
        name: 'model_more',
        data (){
            var t = this;
            return {
                type: 'more',
                infoSetId: 'perf_active_list',
                activeId: this.$route.params.activeId,
                activityData: {}
            };
        },
        created() {
            this.init();
        },
        computed: {
            activityTableColumn() {
                return this.$store.getters.activityTableColumn
            }
        }
        ,beforeMount(){
        },
        components:{
            activityProcedure
        },
        methods:{
            init() {
                const t = this;
                if (t.activityTableColumn && t.activityTableColumn.columnEdit && (t.activityTableColumn.columnEdit.length > 0)) {
                    t.getActivityInfo();
                } else {
                    // 获取表头
                    t.$store.dispatch('getActivityTableColumn')
                }

            },
            getActivityInfo() {
                //该请求换在子组件下请求，现将modelId传递给子组件
                const self = this;
                const editConditionKey = self.activityTableColumn.editTemplate.editConditionKey
                let postData = {
                    editCondition: {
                        key: editConditionKey,
                        value: self.activeId
                    },
                    infoSetId: self.infoSetId
                };
                self.$daydao.$ajax({
                    url: gMain.apiBasePath + "route/perf_active_baseinfo/getEditDataAndColumn.do",
                    data: JSON.stringify(postData),
                    success: function (data) {
                        if(data.result === 'true') {
                            self.activityData = data.beans[0];
                        }
                    }
                })
            },
        },
        watch: {
            'activityTableColumn': function (newValue, oldValue) {
                this.init()
            }
        }

    }
</script>



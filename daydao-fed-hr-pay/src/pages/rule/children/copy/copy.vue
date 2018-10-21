<template>
    <activity-procedure :type="type" :infoSetId="infoSetId"></activity-procedure>
</template>

<style lang="scss">


</style>

<script type="text/babel">

//    import { mapGetters, mapActions } from 'vuex'
    import activityProcedure from 'components/activity/activity_procedure/procedure'

    export default {
        name: 'activity_add',
        data (){
            var t = this;
            return {
                type: 'copy',
                infoSetId: 'perf_active_list',
            };
        },
        computed: {

        }
        ,beforeMount(){
        },
        components:{
            activityProcedure
        },
        methods:{
        },
        watch: {

        }

    }
</script>



<template>
    <div id="pay_record_chooseperson">
        <person-select :ApiPersonURL="getPersonListUrl" ref="settingPersonSelect" :type="type" :ApiPersonParams="ApiPersonParams"></person-select>
    </div>
</template>

<script type="text/babel">
    // import personSelect from "commonVueLib/personSelect/index"
    import personSelect from "commonVueLib/selectPerson/index"    

    const infoSetId = 'pay_choose_person'
    export default {
        name:infoSetId,
        props: {
            
        },
        data() {
            return {
                getPersonListUrl: gMain.apiBasePath + "payPerson/payPersonAddBatchInfo.do",
                type: 1,
                ApiPersonParams: {
                    statusType: 1    // 1：代表批量新增 ， 2：代表在线编辑
                }
            }
        },
        components: {
            personSelect
        },
        created() {
           
        },
        methods: {
            
        }
    }
</script>

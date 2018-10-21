<template>
    <daydaoDropSelect :name="id" :data="data" :val="defaultVal" :width="width" @nativeSelect="onSelected" ref="select"></daydaoDropSelect>
</template>

<script>
    import { daydaoDropSelect } from '../../../../daydaoDropSelect/index'

    export default {
        data() {
            return {
                oData:[],
                defaultVal:'',
            }
        },
        props: {
            id: {
                type: String,
                default: ""
            },
            keyValueBean: {
                type: Object,
                default() {
                    return null
                }
            },
            value: {
                type: [String, Object],
                default: ''
            },
            data:{
                type:Array,
                default(){
                    return [];
                }
            },
            width:{
                type:String,
                default:'280'
            }
        },
        watch:{
            //handle default data
            value(val){
                if (val === '') {
                    this.$refs.select.setValue('');
                }else if(typeof val === 'string'){
                    this.defaultVal = this.value;
                }
            }
        },
        components: { daydaoDropSelect },
        created(){
            if (this.value) {
                this.defaultVal = this.value;
            }
        },
        methods: {
            onSelected(data) {
                if (data) {
                    let dataVal = {
                      'label' : data.node.name,
                      'value' : data.value
                    }
                    this.$emit('input' , dataVal)
                    this.$emit('on-change' , data)
                }
                
            }
        }
    }

</script>

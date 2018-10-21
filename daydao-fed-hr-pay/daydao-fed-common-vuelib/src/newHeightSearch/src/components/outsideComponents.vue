<template>
    <section class="outsideComponents">
        <div class="hs-out-input-wrapper" v-for="(item , index) in outsideConditions">
            <span class="hs-filter-label">{{item.title}}</span>

            <treeSelect 
                v-if="item.conditionId === '746'"
                :id="`outside${new Date().getTime()}${index}`" 
                :data="beansStore[item.keyValueBean.infoSetId]"
                width="200"
                v-model="modelList[index]"
                @on-change="getTreeData($event , item , index)"
                ></treeSelect>

            <Select 
                v-else
                label-in-value
                style="width:200px"
                v-model="modelList[index]">
                <Option v-for="bean in beansStore[item.keyValueBean.infoSetId]" :value="bean.id" :key="bean.id" @click.native="getSelectData(bean,item)">{{ bean.name }}</Option>
            </Select>
        </div>
    </section>
    

</template>

<script>
    import treeSelect from './inputComponent/treeSelect.vue'

    const mapActions = window.Vuex.mapMutations;
    const mapGetters = window.Vuex.mapGetters;


    export default {
        name : 'outsideComponents',
        components : {treeSelect},
        data() {
            return {
                modelList:['','','','',''],
            }
        },
        props: {
            queryCondition: {
                type: Array,
                default(){
                    return [];
                }
            },
            currentCustomSearch: {
                type: Object,
                default(){
                    return {};
                }
            }
        },
        computed:{
            ...mapGetters('highSearch',['beansStore']),
            outsideConditions(){
                let arr = this.queryCondition.filter(item=>item.isOutsideView);
                return arr;
            }
        },
        watch:{
            currentCustomSearch:{
                deep:true,
                handler(){
                    this.currentCustomSearch.datas.map(item=>{
                        if (item.type === 1 && item.value) {
                            this.outsideConditions.forEach((out , index)=>{

                                if (out.conditionId === item.conditionId) {
                                    if (Array.isArray(item.value) && item.value.length === 1) {
                                        this.$set(this.modelList , index , item.value[0]);
                                    }else{
                                        this.$set(this.modelList , index , '');
                                    }
                                };
                            })
                        }
                    })
                }
            }
        },
        created(){
            // 默认值
            this.outsideConditions.forEach((item , index)=>{
                this.$store.dispatch('highSearch/getBeans', {keyValueBean:item.keyValueBean});
                if (item.value) {
                    if (Array.isArray(item.value)) item.value = item.value[0];
                    this.modelList[index] = item.value;
                }
            })
        },
        methods: {
            ...mapActions('highSearch',['getBeans']),
            getTreeData({node} , item , index){
                let data = {value : node.id , label:node.name};
                this.modelList[index] = node.id;

                this.$emit('getOutsideCondition', data , item);
            },
            getSelectData(bean,item){
                let data = {value:bean.id , label:bean.name};
                this.$emit('getOutsideCondition', data , item);
            },
            reset(){
                this.modelList.forEach((item , index)=>{
                    this.$set(this.modelList , index , '');
                })
            }
        }
        
    }

</script>


<style lang="scss">
    .newHighSearch{
        .outsideComponents{
            display : flex;
        }
    }
</style>
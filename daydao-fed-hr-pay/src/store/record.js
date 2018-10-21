import Ajax from 'utils/ajax.js'

const state = {
    recordTableColumn: {},   //表头
    recordTableData: {}      //表格数据
}

const getters = {
    recordTableColumn: (state, getters)=> {
        return state.recordTableColumn;
    },
    recordTableData: (state, getters)=> {
        return state.recordTableData;
    }
}

const actions = {
    /*getRecordTableColumn({commit}, paramData = {infoSetId: 'pay_persons_list'}){
        return new Promise((resolve, reject) => {
            Ajax.$ajax({
                type: 'post',
                url: gMain.apiBasePath +'route/pay_persons_list/getTableColumn.do',
                data: JSON.stringify(paramData),
                success:function (data) {
                    if(data.result === 'true') {
                        commit('getRecordTableColumn', data);
                        resolve(data);
                    }
                }
            })
        })
    },*/

    setRecordTableColumn({commit}, data = {}){
        commit('setRecordTableColumn', data);
    },

    /*getRecordTableData({commit}, paramData = {infoSetId: 'pay_persons_list'}){
        return new Promise((resolve, reject) => {
            Ajax.$ajax({
                type: 'post',
                url: gMain.apiBasePath +'route/pay_persons_list/getAll.do',
                data: JSON.stringify(paramData),
                success:function (data) {
                    if(data.result === 'true') {
                        commit('getRecordTableData', data);
                        resolve(data);
                    }
                }
            })
        })
    },*/

    setRecordTableData({commit}, data = {}){
        commit('setRecordTableData', data);
    }
}

const mutations = {
    setRecordTableColumn(state, data){
        state['recordTableColumn'] = data;
    },
    setRecordTableData(state,data){
        state['recordTableData'] = data;
    }
}


export default {
    state,
    getters,
    actions,
    mutations
}

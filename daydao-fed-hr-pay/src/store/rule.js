import Ajax from 'utils/ajax.js'

const state = {
    ruleTableColumn: {}, // rule 列表相关数据
    ruleTableData: {}
}

const getters = {
    ruleTableColumn: (state, getters)=> {
        return state.ruleTableColumn;
    },
    ruleTableData: (state, getters)=> {
        return state.ruleTableData;
    }
}

const actions = {
    /**
     * 获取
     * @param commit
     * @param paramData
     * @returns {Promise}
     */
    getRuleTableColumn({commit}, paramData = {infoSetId: 'pay_rule_base_info'}){
        return new Promise((resolve, reject) => {
            Ajax.$ajax({
                type: 'post',
                url: gMain.apiBasePath +'route/pay_rule_base_info/getTableColumn.do',
                data: JSON.stringify(paramData),
                success:function (data) {
                    if(data.result === 'true') {
                        commit('getRuleTableColumn', data);
                        resolve(data);
                    }
                }
            })
        })
    },

    setRuleTableColumn({commit}, data = {}){
        commit('setRuleTableColumn', data);
    },

    getRuleTableData({commit}, paramData = {infoSetId: 'pay_rule_base_info'}){
        return new Promise((resolve, reject) => {
            Ajax.$ajax({
                type: 'post',
                url: gMain.apiBasePath +'route/pay_rule_base_info/getAll.do',
                data: JSON.stringify(paramData),
                success:function (data) {
                    if(data.result === 'true') {
                        commit('getRuleTableData', data);
                        resolve(data);
                    }
                }
            })
        })
    },

    setRuleTableData({commit}, data = {}){
        commit('setRuleTableData', data);
    }
}

const mutations = {
    getRuleTableColumn(state, data){
        state['ruleTableColumn'] = data;
    },
    setRuleTableColumn(state, data){
        state['ruleTableColumn'] = data;
    },
    getRuleTableData(state, data){
        state['ruleTableData'] = data;
    },
    setRuleTableData(state,data){
        state['ruleTableData'] = data;
    }
}


export default {
    state,
    getters,
    actions,
    mutations
}

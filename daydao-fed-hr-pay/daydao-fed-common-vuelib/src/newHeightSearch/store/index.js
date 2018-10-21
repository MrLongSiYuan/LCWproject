
import Ajax from 'commonVueLib/Ajax/index.js';


export default {
    namespaced:true,
    state:{
        beans:{}
    },
    mutations:{
        getBeans(state , val){
            state.beans = {...state.beans, [val.infoSetId]:val.beans};
        }
    },  
    actions:{
        getBeans({commit , state},{keyValueBean , cb}){

            if (!state.beans[keyValueBean.infoSetId]) {
                 Ajax.ajax({
                    url: gMain.apiBasePath + "route/getKeyValueData.do",
                    data: JSON.stringify(keyValueBean),
                    success: data => {
                        if (data.beans && data.beans.length) {

                            commit('getBeans' , {infoSetId : keyValueBean.infoSetId , beans:data.beans});
                            cb && cb(data.beans);
                        }
                    }
                })
            }
            
        }
    },
    getters:{
        beansStore:(state)=>{
            return state.beans;
        }
    }
}
//处理数据返回给后台
function searchDataHandler(list){

	let conditionArr = [];
    list.forEach(item=>{
        let condition = {};

        let str = item.conditionId?'conditionId':'uuid';
        condition[str] = item[str];

        if (Object.prototype.toString.call(item.value) === '[object Object]') {
            condition.value = item.value.value;
        }else if(Array.isArray(item.value)){
            condition.value = [];
            item.value.forEach(v=>{
                if (typeof v === 'string') {
                    condition.value.push(v);
                }else{
                    // if (!v.value) v.value = v.id;
                    condition.value.push(v.value);
                }
            })
        }else if(typeof item.value==='string' && item.value.includes('~')){
            condition.value = item.value.split('~');
        }else{
            condition.value = item.value;
        }
        conditionArr.push(condition);
    })
    return conditionArr;

}


export {searchDataHandler}
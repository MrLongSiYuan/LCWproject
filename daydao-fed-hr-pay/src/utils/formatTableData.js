const formatName = function(h,params,datalist, origin, key) {
    let str = '';
    // 可以json化数据到span中， 也可以吧重要数据单个赋值然后按需取
    let cellName = '';
    let operate = '';
    if(datalist.infoSetId === 'pay_rule_base_info') {
        cellName = params.row[key];
        operate = 'editRule';
    }else if(datalist.infoSetId === 'pay_persons_list'){
        cellName = params.row[key];
        operate = 'viewDetail';
    }


    return h('div',{
        style:{
            'white-space':'nowrap','overflow': 'hidden','text-overflow': 'ellipsis'
        }
    },[
        h('span',{
            attrs:{
                'data-operate':operate
            },
            style:{
                'cursor':'pointer','color':'#2D8CF0','vertical-align':'middle'
            }
        },cellName)
    ]);
}

const formatProcess = function (row, column, cellValue,datalist, origin) {
    let str = '';
    let cellName = '';
    if(datalist.infoSetId === 'perf_flow_list'){
        cellName = row.process.split('_').join('/');
    }
    str = `<div style="white-space:nowrap;overflow: hidden;text-overflow: ellipsis;">
        <span style="vertical-align:middle">${cellName}</span>
        </div>`;
    return str;
}

export default {
    /**
   * 格式化表格数据展示
   * @datalist 员工列表组件对象
   * @arr 表头字段的数组
   * @origin 员工列表的类型，在职，离职，未激活
   * */
    formatTableData(datalist, arr, origin){
        var _this = this;
        arr = arr || [];
        var newArr = [];
        arr.forEach(function (item,index) {

            if(datalist.infoSetId === 'pay_rule_base_info') {
                if(item.name === 'rule_name') {
                    item.render = (h,params) => {
                        return formatName(h,params,datalist, origin, 'rule_name');
                    };
                }
                if(item.name === 'rule_status') {
                    item.render = (h,params) => {
                        return h('span',{},params.row.rule_status === 1 ? "已启用":"停用");
                    };
                }
            }else if(datalist.infoSetId === 'pay_persons_list'){
                if(item.name === 'person_name'){
                    item.render = (h,params) => {
                        return formatName(h,params,datalist, origin, 'person_name');
                    };
                }

            }else if(datalist.infoSetId === 'pay_payroll_detail_list'){
                if(item.showFormat!=''&&item.showType == 'number'){
                    item.render = (h,params) => {
                        return h('span',{},params.row[params.column.property].toFixed(item.showFormat));
                    };
                }
                if(item.isEditShow == true){
                   item.render = function (h,params) {
                       let sStr,isNum;
                       if(item.showFormat!=''&&item.showType == 'number'){
                           sStr = params.row[params.column.property].toFixed(item.showFormat);
                           isNum = true;
                       }else{
                           sStr = params.row[params.column.property];
                           isNum = false;
                       }
                       return h('div',{
                              attrs:{
                                  class:'data-show',
                                  title:sStr
                              },
                              style: {
                                   position: 'absolute',
                                   width:'100%',
                                   height:'100%',
                                   top:0,
                                   left:0,
                                   lineHeight:'39px',
                                   overflow:'hidden',
                                   textOverflow: 'ellipsis',
                                   whiteSpace: 'nowrap'
                              },
                              on: {
                                    click: () => {
                                        let $target = $(event.target);
                                        $target.hide();
                                        let tempId = 'data-' + (new Date()).getTime();
                                        let sValue = $target.text();
                                        //编辑容器
                                        let startHtml = '<div class="data-editing"  id="'+tempId+'" data-id="'+sValue+'">';
                                        let endHtml = '</div>';
                                        let sType = "";//类型
                                        if(isNum){
                                            sType = "number";
                                        }else {
                                            sType = "text";
                                        }
                                        $target.parent().append(startHtml + '<input type="'+sType+'"   class="'+tempId+'" style="width: 100%; line-height: 23px; height:23px;box-sizing:border-box;border: 1px solid #c4ceda; padding:0 2px;border-radius: 4px;" value="'+sValue+'"/>' + endHtml);
                                        new Vue({
                                            el:'#'+tempId
                                            ,data:{

                                            }
                                            ,mounted(){
                                                let t = this;
                                                $('.'+tempId).select();
                                                $('.'+tempId).blur(function () {

                                                    if(sValue == $('.'+tempId).val()){
                                                        if (isNum == true) {
                                                            let sText = parseFloat($('.' + tempId).val()) || 0;
                                                            $target.text(sText.toFixed(item.showFormat))
                                                        } else {
                                                            let sText = $('.' + tempId).val() || "";
                                                            $target.text(sText)
                                                        }
                                                        $('#' + tempId).remove();
                                                        $target.show();
                                                    }else {
                                                        let oData = {
                                                            "infoSetId": datalist.infoSetId,
                                                            "uuid": params.row.uuid,
                                                            "dataList": [{
                                                                "key": params.column.property,
                                                                "value": $('.' + tempId).val()
                                                            }],
                                                            "customParam": {
                                                                "period": params.row.period,
                                                                "rule_id": params.row.rule_id
                                                            }
                                                        }
                                                        t.$daydao.$ajax({
                                                            url: gMain.apiBasePath + "route/" + datalist.infoSetId + "/update.do"
                                                            , type: "POST"
                                                            , data: JSON.stringify(oData)
                                                            , isPassFalse: true
                                                            , success: function (data) {
                                                                if (data.result == "true") {
                                                                    if (isNum == true) {
                                                                        let sText = parseFloat($('.' + tempId).val()) || 0;
                                                                        $target.text(sText.toFixed(item.showFormat))
                                                                    } else {
                                                                        let sText = $('.' + tempId).val() || "";
                                                                        $target.text(sText)
                                                                    }
                                                                    $('#' + tempId).remove();
                                                                    $target.show();
                                                                } else if (data.result == "false") {
                                                                    $('#' + tempId).remove();
                                                                    $target.show();
                                                                    t.$Message.warning(data.resultDesc);
                                                                }
                                                            }
                                                        });
                                                    }

                                                })
                                            }
                                            ,components:{
                                            }
                                        });
                                        event.stopPropagation();
                                    }
                              }
                       },sStr)
                   }
                }
            }else if(datalist.infoSetId === 'pay_rule_item_manage'){
                // 薪酬管理格式化字段显示
                if(item.name == "item_name") {
                    item.width = '155';
                    item.render = (h,params) => {
                        if (params.row.is_system == 1) {
                            return h('div',{},[
                                h('span',{},params.row[params.column.property]),
                                h('span',{
                                    style:{
                                        'font-size': '12px','border': '1px solid #9593ec','color':'#9593ec','white-space': 'nowrap','position': 'relative','z-index': '3', 'border-radius':'2px', 'margin-left': '5px', 'padding':'2px'
                                    }
                                },'内置项')
                            ]);
                        } else {
                            return h('span',{},params.row[params.column.property]);
                        }
                    }
                }
                /*if(item.name === 'is_tax' || item.name === 'is_adjustable' || item.name === 'is_extends'){
                    // 布尔类型的字段
                    item.formatter = (row, column, cellValue) => {
                        return cellValue = cellValue === 1 ? '是' : '否' ;
                    }
                }else if(item.name === 'field_type'){
                    //字段类型
                    item.formatter = (row, column, cellValue) => {
                        return cellValue = cellValue === 1 ? '收入' : '支出' ;
                    }
                }*/
            }

            newArr.push(item);
        });
        return newArr;
    }

}

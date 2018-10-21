//当有滚动条的时候需要为头部固定栏预留出8px 的滚动条宽度
//有传time值时执行setTimeout事件没有则直接执行
const calcuAddScrollWidth = function (dom , time) {
    const scrollXwidth = document.getElementById("daydao_content_app_perf").offsetWidth - document.getElementById("daydao_content_app_perf").clientWidth;
    if(time) {
        setTimeout(function () {
            if(scrollXwidth > 0){
                // domId.style.width -= 8
                dom.style.width = (document.body.clientWidth - document.getElementsByClassName("right_data_content")[0].offsetLeft) - scrollXwidth +'px';
            }
        },time)
    } else {
        if(scrollXwidth > 0){
            // domId.style.width -= 8
            dom.style.width = (document.body.clientWidth - document.getElementsByClassName("right_data_content")[0].offsetLeft) - scrollXwidth +'px';
        }
    }

}

const handleImgError = function (e, name, oldId, className = 'pay_base_head_img', length = 2) {
    var oldnode = document.getElementById(oldId);
    // 已经转换过的不在转换
    if(!name || !oldId || !oldnode) {
        return false;
    }
    const aColors = ["#07a9ea","#82c188","#ab97c2","#ffb500","#59ccce","#ff5959"]; //蓝，绿，紫，黄，浅蓝,浅红
    const sColor = aColors[parseInt(Math.random()*aColors.length)];
    /* $(e.target).hide().parent().append('<i class="base_head_img" style="background-color:'+sColor+'">'+name.substr(-2)+'</i>'); */
    const newnode = document.createElement("i");
    newnode.innerHTML = name.substr(-length);
    newnode.setAttribute('class', className)
    newnode.style.backgroundColor = sColor
    /* newnode.style.width = size + 'px'
    newnode.style.height = size + 'px' */
    oldnode.parentNode.replaceChild(newnode, oldnode);
}

const imgPreShow = function (url) {
    if(!url){
        return '';
    }else{
        return gMain.imgPath + url;
    }
    // return gMain.imgPath + url;
}

// 这里的滚动位置都是相对于daydao_content_app_perf， top是相对于body, 点击头部跳转
const clickHeaderTitle = function(id, index, firstTop = '#header_box', app = '#daydao_content_app_perf') {
    const self = this;
    self.currentStep = index
    // 第一个title开始位置的top
    let firstTitleTop = 0;
    if(!/^[0-9]+.?[0-9]*$/.test(firstTop)) {
        // firstTop = $('#header_box').height()  + $('#header_box').offset().top
        firstTitleTop = ($(firstTop) && ($(firstTop).height() + $(firstTop).offset().top)) || 0
    } else {
        firstTitleTop = firstTop
    }
    const targetTop = $('#' + id).offset().top
    let top = targetTop + $(app).scrollTop() - firstTitleTop
    // target 原始位置（相对于daydao_content_app_perf）= target 滚动后偏移 + app 滚动 - target 原始位置的top （#header_box）
    //  ( targettop - $(firstTop).offset().top)) +  $(app).scrollTop() = $(firstTop).height() (一开始top就这么高) + 最后移动到的top
    self.isScrolling = true;
    setTimeout(function(){
        self.isScrolling = false;
    }, 500)
    $(app).animate({scrollTop: top }, 400, "swing");
}


// 滚动时候显示对应等title
const  scrollChangeNav = function(module,firstTop = '#header_box',  app = '#daydao_content_app_perf') {
    const self = this;
    let firstTitleHeight = 0;
    if(!/^[0-9]+.?[0-9]*$/.test(firstTop)) {
        // firstTop = $('#header_box').height()  + $('#header_box').offset().top
        // firstTitleHeight = $(firstTop).height() - $(firstTop).offset().top
        firstTitleHeight = $(firstTop).height()
        // firstTitleTop = ($(firstTop) && ( $(firstTop).offset().top)) || 0
    } else {
        firstTitleHeight = firstTop
    }

    // $(app).off('scroll.' + module).on('scroll.' + module, function(){
    $(app).off('scroll.helpers').on('scroll.helpers', function(){
        calcuAddScrollWidth(document.getElementById('header_box'));
        if(self.isScrolling) {
            return false;
        }
        self.stepData.find((item, index) => {
            const appScrollTop = $(app).scrollTop()
            const target = $('#' + item.id)
            if(!target.offset()) {
                return false;
            }
            if((appScrollTop  > target.offset().top + firstTitleHeight) && (appScrollTop < (target.offset().top + firstTitleHeight + target.height()))) {
                self.currentStep = index
                return true
            }
        })
    })
}

const constant =  {

    // 个人考核节点的实际状态 // 个人考核节点的文字
    perfDetailForm: {
        0: '未考核',
        1: '已考核',
        2: '已打回',
        3: '被打回',
        4: '撤销'
    },
    // 个人考核节点的class
    perfDetailStateClass: {
        0: 'wait',
        1: 'agree',
        2: 'refuse',
        3: 'refuse',
        4: 'refuse'
    },
    doneType: {
        0: '存草稿',
        1: '提交',
        2: '打回',
        3: '撤回'
    },
    messageState: {
        0: 'wait',
        1: 'agree',
        2: 'wait',
        3: 'agree',
        4: 'refuse',
        5: 'refuse'
    },
    messageStateText: {
        0: '待提交',
        1: '已提交',
        2: '待考核',
        3: '已考核',
        4: '已打回',
        5: '被打回'
    },
    processStateText: {
        0: '立即处理',
        1: '查看详情',
        2: '立即处理',
        3: '查看详情',
        4: '查看详情',
        5: '重新提交'
    },
    activityStateText: {
        0: '未发布',
        1: '未开始',
        2: '已开始',
        3: '已结束',
        4: '已中止'
    },
    assessType: {
        0: 'KPI考核'
    },
    calculateType: [
        {
            name:'十分制',type:1
        },
        {
            name:'百分制',type:0
        },
        {
            name:'自由分制',type:2
        }
    ],
    modelCompareChar: [
        {
            label : '>',
            value : 0
        },
        {
            label : '>=',
            value : 1
        },
        {
            label : '=',
            value : 2
        },
        {
            label : '<',
            value : 3
        },
        {
            label : '<=',
            value:4
        }
    ]

}


//当屏幕变动时需要对应需要再执行计算宽度的方法
const resizeChange = function (modelName , dom, time = 200) {
    $(window).on("resize."+modelName,function () {
        dom.style.width = (document.body.clientWidth - document.getElementsByClassName("right_data_content")[0].offsetLeft)+'px';
        calcuAddScrollWidth(dom , time)
    })
}

// 计算头部固定栏宽度   屏幕可视区域宽度 - 右侧偏移量
const countHeaderWidth = function (modelName , domId = 'header_box', time = 1000) {
    var dom = document.getElementById(domId);
    dom.style.width = (document.body.clientWidth - document.getElementsByClassName("right_data_content")[0].offsetLeft)+'px';
    calcuAddScrollWidth(dom , time);
    resizeChange(modelName , dom , time);
}
/**
 *金额转千分位
 * @param num 金额
 */
const payToThousands= function (num) {
    //整型转字符串
    let number = new Number(num);
    let str = number.toString();
    let arr = [];
    arr = str.split(".")
    //正则匹配
    let newstr = arr[0].replace(/\d{1,3}(?=(\d{3})+$)/g,function(s){
        return s+','
    })
    if(arr.length == 1 ){
        return newstr;
    }else {
        return newstr +"."+arr[1];
    }
}
/**
 *时间日期格式转换
 * @param value 日期
 */
const myDateFormat= function (value) {
    Date.prototype.format = function(fmt) {
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
        };
        if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        }
        for(var k in o) {
            if(new RegExp("("+ k +")").test(fmt)){
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            }
        }
        return fmt;
    }
    return new Date(value).format("yyyy.MM.dd");
}

export {
    handleImgError,
    imgPreShow,
    clickHeaderTitle,
    constant,
    countHeaderWidth,
    scrollChangeNav,
    payToThousands,
    myDateFormat
}



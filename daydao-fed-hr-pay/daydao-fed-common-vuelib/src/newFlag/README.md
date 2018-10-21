# NEW标签插件
## 一、简单介绍

功能模块右上角new标签


## 二、引入方式
用es6的方式引入 import

```
    // 附件预览
    import NewFlag from 'commonVueLib/newFlag/index'
    
    components:{
       NewFlag
    }
```

## 三、快速参考：

```
<template>
    <new-flag :show="showNewFlag">
        <span>需要添加new标签的地方</span>
    </new-flag>
</template>
<script>
     export default {
         data(){
             return {
                showNewFlag: true;
             }
         }
     }
</script>
```
```
如果需要调整位置可以添加样式
<template>
    <new-flag :oNewStyle="{top:'1px',right:'-32px', 'z-index': 0}">
        <span>需要添加new标签的地方</span>
    </new-flag>
</template>
<script>
     export default {
         data(){
             return {
               
             }
         }
     }
</script>
```

#### API
newFlag 属性  

|  **属性** | **参数类型**  | **默认值**  | **说明**  |
| ------------ | ------------ | ------------ | ------------ |
| show | Boolean  | true | 是否显示new标签 |
| theme | String  | global | new标签颜色，global：白色；red：红色； |
| oNewStyle | Object  | 无 | new标签样式 |

# tree-pager
树形数据（层级关系数据）的一种分页方案。

## 用法
页面引用src/css/pager.css和src/js/tree-pager.js，调用loadData方法即可：
``` js
var pager = TreePager.instance
pager.loadData({
    'data': data,
    'srcPath': '../src'
})
```

## loadData方法参数说明：
``` js
{
    data: 树节点数据的数组，节点结构如下：
    {
        "No": "13", // 同级节点的排序字段，string类型
        "ID": "37B05B73-1420-4EFA-B344-C3EC3731A0B3", // 节点ID
        "PID": "37B05B73-1420-4EFA-B344-C3EC3731A0B3", // 父节点ID，第一级节点的父节点ID为空字符串
        "Name": "取得《预售许可证》", // 其他个性化数据，由业务需求决定，下同
        "PSD": "2017-04-07",
        "PED": "2017-04-20",
        "Level": "一级",
        "Type": "开发",
        "ASD": "2017-04-07",
        "AED": "2017-04-20",
        "Charge": "朱叶(报建主管)"
    }
    container: 'divPagerData', // 数据呈现区div的ID，默认为tree-pager
    template: 'tmplData', // 呈现数据的html模板script的ID，默认为tmplData
    pager: 'divPager', // 分页栏div的ID，默认为divPager
    pageSize: 10, // 页大小（默认为10）
    before: funs, // 数据加载前置事件，function类型
    complete: funs, // 数据加载完成事件，function类型
    srcPath: '../src' // 插件目录相对于页面的路径（若node节点未指定img则要提供本字段）
}
```

## 示例
请[点击查看](https://laughsky.github.io/tree-pager/example/index.html)示例
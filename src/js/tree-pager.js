/*
    树表分页插件
*/
var TreePager = (function () {
    var pager = function () {
        // 数据容器div
        this.frame = $('#divPagerData')
        this.pager = $('#divPager')
        this.temper = $('#tmplData')
        this.templates = {}
        this.templateCompiler

        // 页大小
        this.pageSize = 10

        // 各种元素的html模板
        this.htmls = {
            'tip': '<div class="pager-tip"></div>',
            'trees': [
                '<img src="/images/tree/collapse.gif" class="img-tree" col="1" />',
                '<img src="/images/tree/collapse_last.gif" class="img-tree" col="1" />',
                '<img src="/images/tree/expand.gif" class="img-tree" col="1" />',
                '<img src="/images/tree/expand_last.gif" class="img-tree" col="1" />',
                '<img src="/images/tree/item.gif" class="img-tree" />',
                '<img src="/images/tree/item_last.gif" class="img-tree" />',
                '<img src="/images/tree/vline.gif" class="img-tree" />',
                '<img src="/images/tree/blank.gif" class="img-tree" />'
            ]
        }

        // 当前页码（0表示第1页）
        this.currentPageIndex = 0

        // 数据（初始化后）
        this.data = []
    }

    var fn = pager.prototype

    /*
       绘制图形，options参数为json对象，键值说明：
       data: 节点数组，节点结构如下：
        {
            "No": "2.1.06", // 同级节点的排序字段
            "ID": "37B05B73-1420-4EFA-B344-C3EC3731A0B3", // 节点ID
            "PID": "37B05B73-1420-4EFA-B344-C3EC3731A0B3", // 父节点ID，第一级节点的父节点ID为空字符串
            "Name": "取得《预售许可证》",
            "PSD": "2017-04-07",
            "PED": "2017-04-20",
            "Level": "一级",
            "Type": "开发",
            "ASD": "2017-04-07",
            "AED": "2017-04-20",
            "Charge": "朱叶(报建主管)"
        }
       container: 'divPagerData', 数据区div的ID，默认为tree-pager
       template: 'tmplData', 呈现数据的html模板script的ID，默认为tmplData
       pager: 'divPager', 分页栏div的ID，默认为divPager
       pageSize: 20, 页大小（默认为20）
       before: 数据加载前置事件，function类型
       complete: 数据加载完成事件，function类型
       srcPath: '../src' 插件目录相对于页面的路径（若node节点未指定img则要提供本字段）
    */
    fn.loadData = function (options) {
        // 初始化配置
        this.initConfig(options)

        // 绘制前置事件
        if (options['before']) {
            options['before']()
        }

        // 初始化数据
        var data = options['data']
        this.initData(data)

        if (!this.data.length) {
            this.showTip('不存在任何数据。')
            return
        }

        // 刷新数据
        this.refreshData(this)

        // 加载完成事件
        if (options['complete']) {
            options['complete']()
        }
    }

    // 初始化配置
    fn.initConfig = function (config) {
        for (var k in config) {
            switch (k) {
                case 'container':
                    if (!this.frame.length || this.frame.attr('id') != config[k]) {
                        this.frame = $('#' + config[k])
                    }
                    break
                case 'template':
                    if (!this.temper.length || this.temper.attr('id') != config[k]) {
                        this.temper = $('#' + config[k])
                    }
                    break
                case 'pager':
                    if (!this.pager.length || this.pager.attr('id') != config[k]) {
                        this.pager = $('#' + config[k])
                    }
                    break
                case 'pageSize':
                    this.pageSize = config[k]
                    break
                case 'srcPath':
                    for (var i in this.htmls['trees']) {
                        this.htmls['trees'][i] = this.htmls['trees'][i].replace('src="/images', 'src="' + config[k] + '/images')
                    }
                    break
                default:
                    break
            }
        }

        if ($.isEmptyObject(this.templates)) {
            var that = this
            Handlebars.registerHelper("if_even", function (v, o) {
                return v % 2 == 0 ? o.fn(this) : o.inverse(this)
            })
            Handlebars.registerHelper("tree_ico", function (v) {
                var html = ''
                for (var i = 0; i < v.length; i++) {
                    html += that.htmls['trees'][parseInt(v.charAt(i), 10)]
                }
                return html
            })
        }

        var tempId = this.temper.attr('id')
        if (!this.templates[tempId]) {
            this.templates[tempId] = Handlebars.compile(this.temper.html())
        }
        this.templateCompiler = this.templates[tempId]
    }

    // 初始化数据
    fn.initData = function (data) {
        var recurseHandleData = function (datas, data, pID, pIsLast, pOutline, pPrefix) {
            var len = data.length
            var k = 0
            for (var i = 0; i < len; i++) {
                var item = data[i]
                if (item['PID'] == pID) {
                    var id = item['ID']
                    var isLeaf = true
                    for (var j in data) {
                        if (data[j]['PID'] == id) {
                            isLeaf = false
                            break
                        }
                    }

                    var isLast = i < len - 1 ? (data[i + 1]['PID'] == pID ? false : true) : true
                    var outline = (pOutline ? pOutline + '.' : '') + (++k)
                    var prefix = pPrefix + (pID ? (pIsLast ? '7' : '6') : '')
                    var ico = prefix + (isLeaf ? (isLast ? '5' : '4') : (isLast ? '3' : '2'))

                    item['Outline'] = outline
                    item['Ico'] = ico
                    datas.push(item)

                    recurseHandleData(datas, data, id, isLast, outline, prefix)
                }
            }
        }

        this.data.length = 0
        data.sort(function (m, n) { return m['PID'] + '_' + m["No"] < n['PID'] + '_' + n["No"] ? -1 : (m['PID'] + '_' + m["No"] > n['PID'] + '_' + n["No"] ? 1 : 0) })
        recurseHandleData(this.data, data, '', true, '', '')
    }

    // 刷新数据（页码参数pageIndex：0表示第1页）
    fn.refreshData = function (that, pageIndex, jq) {
        // 清空数据区
        that.clearDataArea()

        if (pageIndex == undefined) {
            pageIndex = this.currentPageIndex || 0
        }

        // 获取分页数据
        var pagerData = that.getPagerData(pageIndex, that.pageSize)
        that.frame.append(pagerData['html'])

        // 更新分页
        that.pager.pagination(pagerData['cnt'], {
            "callback": function (a, b) { that.refreshData(that, a, b) },
            "current_page": pagerData['idx'],
            "items_per_page": that.pageSize,
            "num_display_entries": 5,
            "num_edge_entries": 2,
            "prev_text": "&lt;&lt;",
            "next_text": "&gt;&gt;"
        })

        // 绑定展开折叠事件
        that.frame.find('img.img-tree[col="1"]').on('click', function () {
            that.switchTree(this)
        })

        // 更新当前页码
        that.currentPageIndex = pagerData['idx']
    }

    // 获取分页数据（页码参数pageIndex：0表示第1页）
    fn.getPagerData = function (pageIndex, pageSize) {
        var data = []
        var rowCount = 0
        var pageCount

        for (var i in this.data) {
            var item = this.data[i]
            if (!item['hidden']) {
                rowCount++
                if (rowCount > pageIndex * pageSize && rowCount <= (pageIndex + 1) * pageSize) {
                    item["idx"] = i
                    data.push(item)
                }
            }
        }

        pageCount = rowCount % pageSize == 0 ? (rowCount / pageSize) : (Math.floor(rowCount / pageSize) + 1)
        if (pageIndex > pageCount - 1) {
            return this.getPagerData(pageCount - 1, pageSize)
        }

        return {
            'idx': pageIndex,
            'cnt': rowCount,
            'html': this.templateCompiler(data)
        }
    }

    // 展开或折叠TreeTable的方法
    fn.switchTree = function (img) {
        var tree = { '0': '2', '1': '3', '2': '0', '3': '1' }
        var datalen = this.data.length;
        var currentIdx = parseInt($(img).closest("tr").attr("idx"), 10)
        var currentItem = this.data[currentIdx]
        var currentIco = currentItem["Ico"]
        var currentOutline = currentItem["Outline"]
        var currentLen = currentOutline.split(".").length

        // 更新图片和展开状态
        currentItem["Ico"] = currentIco.substr(0, currentIco.length - 1) + tree[currentIco.slice(-1)];
        var collapse = (currentItem["Ico"].slice(-1) === '0' || currentItem["Ico"].slice(-1) === '1')

        for (var i = currentIdx + 1; i < datalen; i++) {
            var item = this.data[i]
            var outline = item["Outline"];
            var len = outline.split(".").length
            if (outline.indexOf(currentOutline + '.') != -1 && len > currentLen) {
                if (collapse) {
                    item["hidden"] = true
                } else if (len == currentLen + 1) {
                    item["hidden"] = collapse
                } else {
                    var pOutline = outline.substr(0, outline.lastIndexOf("."))
                    var pItem
                    for (var j = i - 1; j >= 0; j--) {
                        pItem = this.data[j]
                        if (pItem["Outline"] == pOutline) {
                            break
                        }
                    }

                    if (pItem["hidden"]) {
                        item["hidden"] = true
                    } else {
                        item["hidden"] = (pItem["Ico"].slice(-1) === '0' || pItem["Ico"].slice(-1) === '1')
                    }
                }
            } else {
                break
            }
        }

        this.refreshData(this)
    }

    // 清空数据区
    fn.clearDataArea = function () {
        this.frame.empty()
    }

    // 提示信息
    fn.showTip = function (msg) {
        this.clearDataArea()

        var divTip = $(this.htmls['tip'])
        divTip.text(msg)
        this.frame.append(divTip)
    }

    pager.instance = void 0

    return pager
}())

$(function () {
    var pager = new TreePager()
    TreePager.instance = pager
})
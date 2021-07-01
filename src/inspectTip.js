const {httpGetWithCache} = require("../lib/wrappers");

module.exports = (pluginContext) => {
    return (params, env = {}) => {
        return new Promise((resolve, reject) => {
            let {apiHost, ruleCacheTime} = env
            ruleCacheTime = ruleCacheTime || 60000
            httpGetWithCache(`${apiHost}/inspect/rules`, ruleCacheTime, (content, err) => {
                const rules = JSON.parse(content).data
                if (rules.some(rule => params.match(new RegExp(rule)))) {
                    resolve([{
                        'icon': 'fa-hourglass-half',
                        'title': '已开始日志查询，请等待查询结果',
                        'subtitle': '有的日志查询可能较久，极端情况超过10s（优化中。。）',
                    }])
                } else {
                    resolve([])
                }
            })
        })
    }
}

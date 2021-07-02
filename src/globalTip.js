const {httpGetWithCache} = require("../lib/wrappers");

module.exports = (pluginContext) => {
    return {
        respondsTo: (query, env = {}) => {
            return query.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/)
        },
        search: (query, env = {}) => {
            return new Promise((resolve, reject) => {
                resolve([{
                    icon: 'fa-hourglass-half',
                    title: '已开始日志查询，请等待查询结果',
                    subtitle: '有的日志查询可能较久，极端情况超过20s（优化中。。）',
                    value: '',
                }])
            })
        }
    }
}

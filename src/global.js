const {fromServer} = require("../lib/wrappers");

module.exports = (pluginContext) => {
    return {
        respondsTo: (query, env = {}) => {
            return true
        },
        search: fromServer('_')(pluginContext),
    }
}

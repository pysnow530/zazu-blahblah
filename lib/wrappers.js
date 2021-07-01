const http = require('http')
const path = require('path')
const {readFile, writeFile, access, constants, stat} = require('fs')

module.exports.httpGet = (url, cb) => {
    http.get(url, (rsp) => {
            const chunks = []
            rsp.on('data', (chunk) => {
                chunks.push(chunk.toString())
            })
            rsp.on('end', () => {
                const content = chunks.join('')
                cb(content)
            })
        }
    )
}

module.exports.httpGetWithCache = (url, cacheTime, cb) => {
    const cachePath = path.join(path.dirname(__dirname), 'cache', (new Buffer(url)).toString('base64'))
    stat(cachePath, (err, stats) => {
        if (err && err.code === 'ENOENT' || (new Date().getTime()) - stats.mtimeMs > cacheTime) {
            this.httpGet(url, (content) => {
                writeFile(cachePath, content, (err) => {
                    cb(content, err)
                })
            })
        } else {
            readFile(cachePath, 'utf8', (err, data) => {
                cb(data, err)
            })
        }
    })
}

module.exports.fromServer = (cmd) => {
    return (pluginContext) => {
        return (params, env = {}) => {
            return new Promise((resolve, reject) => {
                let { apiHost, ruleCacheTime } = env
                ruleCacheTime = ruleCacheTime || 60000
                this.httpGetWithCache(`${apiHost}/${cmd}/rules`, ruleCacheTime, (content, err) => {
                    if (err) {
                        resolve([{
                            icon: 'fa-exclamation',
                            title: `${cmd}: get rules error`,
                            subtitle: err.toString()
                        }])
                        return
                    }

                    const rules = JSON.parse(content).data
                    if (rules.every(rule => !(params.match(new RegExp(rule))))) {
                        resolve([])
                        return
                    }

                    this.httpGet(`${apiHost}/${cmd}/${(new Buffer(params)).toString('base64')}`, (content, err) => {
                        if (err) {
                            resolve([{
                                icon: 'fa-exclamation',
                                title: `${cmd}: get rules error`,
                                subtitle: err.toString()
                            }])
                            return
                        }

                        resolve(JSON.parse(content).data)
                    })
                })
            })
        }
    }
}

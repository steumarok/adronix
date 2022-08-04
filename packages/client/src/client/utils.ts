const Url = require('domurl')

export function buildUrl(baseUrl: string, params: { [name: string]: any }) {

    const url = new Url(baseUrl)
    for (const name in params) {
        if (params[name] != null && params[name] != undefined) {
            url.query[name] = params[name]
        }
    }

    return url.toString()
}
import { isRef, reactive, Ref, ref, unref, watch } from "vue"
const Url = require('domurl')

export type GetParams = {
    [name: string]: any
}

export function urlComposer(baseUrl: string | Ref<string>) {
    const urlRef = ref(baseUrl)
    return function (params: GetParams) {

        function buildUrl(p: GetParams) {

            const url = new Url(unref(baseUrl))
            for (const name in p) {
                if (p[name] != null && p[name] != undefined) {
                    url.query[name] = p[name]
                }
            }

            return url.toString()
        }

        watch(params, (newParams) => {
            urlRef.value = buildUrl(newParams)
        })

        if (isRef(baseUrl)) {
            watch(baseUrl, () => {
                urlRef.value = buildUrl(params)
            })
        }

        urlRef.value = buildUrl(unref(params))

        return urlRef
    }
}
import { isRef, reactive, Ref, ref, unref, watch } from "vue"
const Url = require('domurl')

export type GetParams = {
    [name: string]: any
}

export function urlComposer(baseUrl: string | Ref<string>) {
    const urlRef = ref(baseUrl)
    return function (params: GetParams) {

        function buildUrl() {

            const url = new Url(unref(baseUrl))
            for (const name in params) {
                if (params[name] != null && params[name] != undefined) {
                    url.query[name] = params[name]
                }
            }

            return url.toString()
        }

        watch(params, (newParams) => {
            urlRef.value = buildUrl()
        })

        if (isRef(baseUrl)) {
            watch(baseUrl, () => {
                urlRef.value = buildUrl()
            })
        }

        urlRef.value = buildUrl()

        return urlRef
    }
}
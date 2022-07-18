import { reactive, ref, watch } from "vue"

export type GetParams = {
    [name: string]: any
}

export function useUrlComposer(
    composer: (params: GetParams) => string,
    initParams: GetParams) {
    const url = ref(composer(initParams))
    const params = reactive(initParams)

    watch(params, (newParams) => {
        url.value = composer(newParams)
    })

    return {
        url,
        params
    }
}
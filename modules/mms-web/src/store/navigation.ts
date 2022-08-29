import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
    const assetFilter = reactive({
        client: {
            id: null,
            ref: null
        },
        clientLocation: {
            id: null,
            ref: null
        },
    })

    const taskFilter = reactive({
        workOrder: {
            id: null,
            ref: null
        }
    })

    function clearAssetFilter(item: string) {
        assetFilter[item] = {
            id: null,
            ref: null
        }
    }

    function clearTaskFilter(item: string) {
        taskFilter[item] = {
            id: null,
            ref: null
        }
    }

    return {
        assetFilter, clearAssetFilter ,
        taskFilter, clearTaskFilter
    }
})

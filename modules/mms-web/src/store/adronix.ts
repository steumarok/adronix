import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAdronixStore = defineStore('adronix', () => {
    const params = ref<{ [name: string]: any }>({})

    const getTableParams = (name: string) => {
        if (!params[name]) {
            params[name] = { page: 1, limit: 10 }
        }
        return params[name]
    }

    return { getTableParams }
})

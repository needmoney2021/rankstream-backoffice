import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
    const searchCache = ref<Record<string, any>>({})

    function saveSearchParams(route: string, params: any) {
        searchCache.value[route] = { ...params }
    }

    function getSearchParams(route: string) {
        return searchCache.value[route] || {}
    }

    function clearSearchParams(route: string) {
        if (searchCache.value[route]) {
            delete searchCache.value[route]
        }
    }

    function clearAllSearchParams() {
        searchCache.value = {}
    }

    return {
        searchCache,
        saveSearchParams,
        getSearchParams,
        clearSearchParams,
        clearAllSearchParams
    }
}) 
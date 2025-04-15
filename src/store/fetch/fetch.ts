import {defineStore} from 'pinia'
import {ref} from 'vue'

export const useFetchStore = defineStore('fetch', () => {
    const isFetching = ref(false)
    
    function setFetching(value: boolean) {
        isFetching.value = value
    }
    
    return {
        isFetching,
        setFetching
    }
})

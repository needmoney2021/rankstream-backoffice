import {defineStore} from 'pinia'
import {ref} from 'vue'
import {Auth} from "@/types/auth/auth";

export const useAuthStore = defineStore('auth', () => {
    const userId = ref<string | null>(null)
    const companyIdx = ref<number | null>(null)
    const accessToken = ref<string | null>(null)
    
    function setAuth(auth: Auth) {
        userId.value = auth.userId
        companyIdx.value = auth.companyIdx
        accessToken.value = auth.accessToken
        
        // Save to localStorage to persist across page refreshes
        localStorage.setItem('auth', JSON.stringify({
            userId: auth.userId,
            companyIdx: auth.companyIdx,
            accessToken: auth.accessToken,
        }))
        
    }
    
    function clearAuth() {
        userId.value = null
        companyIdx.value = null
        accessToken.value = null
        
        // Remove from localStorage
        localStorage.removeItem('auth')
    }
    
    function isAuthenticated() {
        return !!accessToken.value
    }
    
    // Initialize from localStorage if available
    const storedAuth = localStorage.getItem('auth')
    if (storedAuth) {
        try {
            const auth = JSON.parse(storedAuth)
            userId.value = auth.userId
            companyIdx.value = auth.companyId
            accessToken.value = auth.accessToken
        } catch (error) {
            console.error('Failed to parse stored auth', error)
            clearAuth()
        }
    }
    
    return {
        userId,
        companyIdx,
        accessToken,
        setAuth,
        clearAuth,
        isAuthenticated
    }
})

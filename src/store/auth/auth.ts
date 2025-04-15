import {defineStore} from 'pinia'
import {ref} from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const userId = ref<string | null>(null)
    const companyId = ref<number | null>(null)
    const accessToken = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    
    function setAuth(auth: { userId: string, companyId: number, accessToken: string, refreshToken: string }) {
        userId.value = auth.userId
        companyId.value = auth.companyId
        accessToken.value = auth.accessToken
        refreshToken.value = auth.refreshToken
        
        // Save to localStorage to persist across page refreshes
        localStorage.setItem('auth', JSON.stringify({
            userId: auth.userId,
            companyId: auth.companyId,
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken
        }))
    }
    
    function clearAuth() {
        userId.value = null
        companyId.value = null
        accessToken.value = null
        refreshToken.value = null
        
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
            companyId.value = auth.companyId
            accessToken.value = auth.accessToken
            refreshToken.value = auth.refreshToken
        } catch (error) {
            console.error('Failed to parse stored auth', error)
            clearAuth()
        }
    }
    
    return {
        userId,
        companyId,
        accessToken,
        refreshToken,
        setAuth,
        clearAuth,
        isAuthenticated
    }
})

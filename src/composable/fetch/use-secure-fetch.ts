import { useAuthStore } from '@/store/auth/auth'
import { useFetchStore } from '@/store/fetch/fetch'

export function useSecureFetch() {
    const authStore = useAuthStore()
    const fetchStore = useFetchStore()
    
    const getCsrfTokenFromCookie = (): string | null => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] ?? null
    }
    
    const fetchCsrfToken = async (): Promise<void> => {
        try {
            const response = await fetch(`/api/csrf`, {
                credentials: 'include'
            })
            
            if (!response.ok) {
                throw new Error('Failed to fetch CSRF token')
            }
        } catch (err) {
            console.error('CSRF token fetch failed:', err)
            throw err
        }
    }
    
    const refreshToken = async (): Promise<string> => {
        
        try {
            const response = await fetch(`/api/auth/refresh-token`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            
            if (!response.ok) {
                throw new Error('Failed to refresh token')
            }
            
            const data = await response.json()
            
            authStore.setAuth({
                userId: authStore.userId as string,
                companyIdx: authStore.companyIdx as number,
                accessToken: data.accessToken,
            })
            
            return data.accessToken
        } catch (err) {
            console.error('Token refresh failed:', err)
            authStore.clearAuth()
            throw err
        }
    }
    
    const secureRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
        fetchStore.setFetching(true)
        
        const fullUrl = `/api${url}`
        const method = options.method?.toUpperCase() || 'GET'
        const needsCsrfToken = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
        let retried = false
        
        try {
            const headers = new Headers(options.headers)
            
            // Add CSRF token
            if (needsCsrfToken) {
                if (!getCsrfTokenFromCookie()) {
                    await fetchCsrfToken()
                }
                
                const csrfToken = getCsrfTokenFromCookie()
                if (csrfToken) {
                    headers.set('X-XSRF-TOKEN', csrfToken)
                }
            }
            
            // Add JWT access token
            if (authStore.accessToken) {
                headers.set('Authorization', `Bearer ${authStore.accessToken}`)
            }
            
            let response = await fetch(fullUrl, {
                ...options,
                headers,
                credentials: 'include',
            })
            
            // If access token expired
            if (response.status === 401) {
                try {
                    const newAccessToken = await refreshToken()
                    headers.set('Authorization', `Bearer ${newAccessToken}`)
                    
                    response = await fetch(fullUrl, {
                        ...options,
                        headers,
                        credentials: 'include',
                    })
                } catch (refreshError) {
                    throw refreshError
                }
            }
            
            // If CSRF token expired
            else if (response.status === 403 && needsCsrfToken && !retried) {
                retried = true
                await fetchCsrfToken()
                
                const csrfToken = getCsrfTokenFromCookie()
                if (csrfToken) {
                    headers.set('X-XSRF-TOKEN', csrfToken)
                    response = await fetch(fullUrl, {
                        ...options,
                        headers,
                        credentials: 'include',
                    })
                }
            }
            
            return response
        } finally {
            fetchStore.setFetching(false)
        }
    }
    
    return {
        secureRequest,
    }
}

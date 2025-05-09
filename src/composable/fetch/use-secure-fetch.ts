import { useAuthStore } from '@/store/auth/auth'
import { useFetchStore } from '@/store/fetch/fetch'
import router from "@/route";
import {nextTick} from "vue";



export function useSecureFetch() {
    const authStore = useAuthStore()
    const fetchStore = useFetchStore()
    
    const redirectToSignIn = async () => {
        authStore.clearAuth()
        alert('세션이 만료되었습니다. 다시 로그인해주세요.')
        await nextTick()
        await router.push('/signin')
    }
    
    const getCsrfTokenFromCookie = (): string | null => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] ?? null
    }
    
    const fetchCsrfToken = async (): Promise<boolean> => {
        try {
            const response = await fetch(`/api/csrf`, {
                credentials: 'include'
            })
            
            if (!response.ok) {
                console.error('Failed to fetch CSRF token')
                return false
            }
            return true
        } catch (err) {
            console.error('CSRF token fetch failed:', err)
            return false
        }
    }
    
    const refreshToken = async (): Promise<string | null> => {
        try {
            const response = await fetch('/api/auth/refresh-token', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            
            const contentType = response.headers.get('Content-Type') ?? ''
            
            if (!contentType.includes('application/json')) {
                const raw = await response.text()
                console.error('Non-JSON response from server:', raw)
                return null
            }
            
            const data = await response.json()
            
            if (!response.ok) {
                console.error('Token refresh failed:', data)
                return null
            }
            
            authStore.setAuth({
                ...data,
                accessToken: data.accessToken,
            })
            return data.accessToken
        } catch (err) {
            console.error('Token refresh failed:', err)
            return null
        }
    }
    
    
    const secureRequest = async (url: string, options: RequestInit = {}): Promise<Response | null> => {
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
                    const success = await fetchCsrfToken()
                    if (!success) {
                        authStore.clearAuth()
                        await router.push('/signin')
                        return null
                    }
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
                const newAccessToken = await refreshToken()
                if (!newAccessToken) {
                    redirectToSignIn()
                    return null
                }
                
                headers.set('Authorization', `Bearer ${newAccessToken}`)
                response = await fetch(fullUrl, {
                    ...options,
                    headers,
                    credentials: 'include',
                })
            }
            
            // If CSRF token expired
            else if (response.status === 403 && needsCsrfToken && !retried) {
                retried = true
                const success = await fetchCsrfToken()
                if (!success) {
                    redirectToSignIn()
                    return null
                }
                
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

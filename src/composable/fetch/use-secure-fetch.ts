import { useAuthStore } from '@/store/auth/auth'
import { useFetchStore } from '@/store/fetch/fetch'

export function useSecureFetch() {
    const authStore = useAuthStore()
    const fetchStore = useFetchStore()

    let csrfToken: string

    const getCsrfToken = async (): Promise<string> => {
        try {
            const response = await fetch('/api/csrf-token', {
                credentials: 'include'
            })
            
            if (!response.ok) {
                throw new Error('Failed to get CSRF token')
            }
            
            const data = await response.json()
            csrfToken = data.token
            return csrfToken
        } catch (error) {
            console.error('Error getting CSRF token:', error)
            throw error
        }
    }

    const refreshToken = async (): Promise<string> => {
        if (!authStore.refreshToken) {
            throw new Error('No refresh token available')
        }
        
        try {
            const response = await fetch('/api/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: authStore.refreshToken
                })
            })
            
            if (!response.ok) {
                throw new Error('Failed to refresh token')
            }
            
            const data = await response.json()
            authStore.setAuth({
                userId: authStore.userId as string,
                companyId: authStore.companyId as number,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            })
            
            return data.accessToken
        } catch (error) {
            console.error('Error refreshing token:', error)
            authStore.clearAuth()
            throw error
        }
    }

    const secureRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
        // Update fetching state
        fetchStore.setFetching(true)
        
        try {
            // Check if CSRF token is needed
            const needsCsrfToken = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')
            
            if (needsCsrfToken && !csrfToken) {
                try {
                    await getCsrfToken()
                } catch (error) {
                    console.error('Failed to get CSRF token:', error)
                }
            }
            
            // Set up headers
            const headers = new Headers(options.headers)
            
            // Add CSRF token if needed
            if (needsCsrfToken && csrfToken) {
                headers.set('X-XSRF-TOKEN', csrfToken)
            }
            
            // Add authorization if logged in
            if (authStore.accessToken) {
                headers.set('Authorization', `Bearer ${authStore.accessToken}`)
            }
            
            // Make request
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include'
            })
            
            // Handle token expiration
            if (response.status === 401 && authStore.refreshToken) {
                try {
                    // Try to refresh the token
                    const newToken = await refreshToken()
                    
                    // Update authorization header with new token
                    headers.set('Authorization', `Bearer ${newToken}`)
                    
                    // Retry the request with the new token
                    return fetch(url, {
                        ...options,
                        headers,
                        credentials: 'include'
                    })
                } catch (refreshError) {
                    console.error('Failed to refresh token:', refreshError)
                    throw refreshError
                }
            } else if (response.status === 403 && needsCsrfToken) {
                // CSRF token might be expired, try to get a new one and retry
                try {
                    await getCsrfToken()
                    
                    if (csrfToken) {
                        headers.set('X-XSRF-TOKEN', csrfToken)
                        
                        // Retry the request with the new CSRF token
                        return fetch(url, {
                            ...options,
                            headers,
                            credentials: 'include'
                        })
                    }
                } catch (csrfError) {
                    console.error('Failed to refresh CSRF token:', csrfError)
                }
            }
            
            return response
        } finally {
            // Update fetching state
            fetchStore.setFetching(false)
        }
    }
    
    return {
        secureRequest,
    }
}

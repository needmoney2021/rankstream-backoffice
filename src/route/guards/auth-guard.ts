import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/store/auth/auth'

export const authGuard = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const authStore = useAuthStore()
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    if (requiresAuth && !authStore.isAuthenticated()) {
        // User is not authenticated, redirect to signin
        next({ name: 'SignIn' })
    } else if (to.path === '/signin' && authStore.isAuthenticated()) {
        // User is authenticated but trying to access signin page, redirect to dashboard
        next({ name: 'Dashboard' })
    } else {
        // Allow navigation
        next()
    }
} 
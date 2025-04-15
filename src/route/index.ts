import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import {authGuard} from './guards/auth-guard'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/dashboard',
        meta: {requiresAuth: true}
    },
    {
        path: '/signin',
        name: 'SignIn',
        component: () => import('../pages/signin/SignIn.vue'),
        meta: {requiresAuth: false}
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../pages/dashboard/Dashboard.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/sponsorship',
        name: 'SponsorShip',
        component: () => import('../pages/sponsorship/SponsorShip.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/grade',
        children: [
            {
                path: 'search',
                name: 'GradeSearch',
                component: () => import('../pages/grade/GradeSearch.vue')
            },
            {
                path: 'detail/:id',
                name: 'GradeDetail',
                component: () => import('../pages/grade/GradeDetail.vue')
            },
            {
                path: 'register',
                name: 'GradeRegister',
                component: () => import('../pages/grade/GradeRegister.vue')
            }
        ],
        meta: {requiresAuth: true}
    },
    {
        path: '/member',
        children: [
            {
                path: 'search',
                name: 'MemberSearch',
                component: () => import('../pages/member/MemberSearch.vue')
            },
            {
                path: 'detail/:id',
                name: 'MemberDetail',
                component: () => import('../pages/member/MemberDetail.vue')
            },
            {
                path: 'register',
                name: 'MemberRegister',
                component: () => import('../pages/member/MemberRegister.vue')
            },
            {
                path: 'tree/:id',
                name: 'MemberTree',
                component: () => import('../pages/member/MemberTree.vue')
            }
        ],
        meta: {requiresAuth: true}
    },
    {
        path: '/order',
        children: [
            {
                path: 'search',
                name: 'OrderSearch',
                component: () => import('../pages/order/OrderSearch.vue')
            },
            {
                path: 'snapshot',
                name: 'OrderSnapshot',
                component: () => import('../pages/order/OrderSnapshot.vue')
            }
        ],
        meta: {requiresAuth: true}
    },
    {
        path: '/schedule',
        children: [
            {
                path: 'detail',
                name: 'ScheduleDetail',
                component: () => import('../pages/schedule/ScheduleDetail.vue')
            },
            {
                path: 'register',
                name: 'ScheduleRegister',
                component: () => import('../pages/schedule/ScheduleRegister.vue')
            }
        ],
        meta: {requiresAuth: true}
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/dashboard'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(authGuard)

export default router

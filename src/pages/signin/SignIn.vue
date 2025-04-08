<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth/auth'

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
    if (!email.value || !password.value) {
        errorMessage.value = '이메일과 비밀번호를 입력해주세요.'
        return
    }

    try {
        isLoading.value = true
        errorMessage.value = ''

        // In a real implementation, this would call an API
        console.debug('Attempting login with:', email.value)
        
        // Mock login for now - to be implemented by a human
        setTimeout(() => {
            // Simulate successful login
            authStore.setAuth({
                userId: email.value,
                companyId: 1,
                accessToken: 'mock-token-' + Math.random(),
                refreshToken: 'mock-refresh-token-' + Math.random()
            })
            
            router.push('/dashboard')
            isLoading.value = false
        }, 1000)
    } catch (error: any) {
        console.error('Login error:', error)
        errorMessage.value = error.message || '로그인에 실패했습니다.'
        isLoading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    RankStream Backoffice
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    관리자 로그인
                </p>
            </div>
            <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="email-address" class="sr-only">이메일</label>
                        <input
                            id="email-address"
                            v-model="email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="이메일"
                        />
                    </div>
                    <div>
                        <label for="password" class="sr-only">비밀번호</label>
                        <input
                            id="password"
                            v-model="password"
                            name="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="비밀번호"
                        />
                    </div>
                </div>

                <div v-if="errorMessage" class="text-red-500 text-sm text-center">
                    {{ errorMessage }}
                </div>

                <div>
                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <!-- Loading spinner -->
                            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                        </span>
                        로그인
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
</style> 
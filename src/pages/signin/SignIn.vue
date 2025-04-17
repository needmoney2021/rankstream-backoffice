<script lang='ts' setup>
import {computed, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/store/auth/auth'
import {useSecureFetch} from "@/composable/fetch/use-secure-fetch";
import {useFetchStore} from "@/store/fetch/fetch";
import {Auth} from "@/types/auth/auth";

const fetchStore = useFetchStore()

const email = ref('')
const password = ref('')
const isLoading = computed(() => {
    return fetchStore.isFetching
})
const errorMessage = ref('')

const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
    if (!email.value || !password.value) {
        errorMessage.value = '이메일과 비밀번호를 입력해주세요.'
        return
    }

    try {
        errorMessage.value = ''

        const { secureRequest: signInRequest } = useSecureFetch()
        const signInResponse = await signInRequest('/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email.value, password: password.value })
        })

        if (!signInResponse) {
            return
        }

        if (!signInResponse.ok) {
            try {
                const { code, message } = await signInResponse.json()
                console.error('Failed to sign in:', code, message)
                alert(`로그인 실패: ${message}`)
            } catch (error) {
                console.error('Failed to parse sign in error response:', error)
                alert('서버 응답을 파싱할 수 없습니다.')
            }
            return
        }

        const data = await signInResponse.json() as Auth
        authStore.setAuth(data)
        await router.push('/dashboard')
        return

    } catch (error: any) {
        console.error('Failed to sign in:', error)
        errorMessage.value = error.message || '로그인에 실패했습니다.'
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
                        <label class="sr-only" for="email-address">이메일</label>
                        <input
                            id="email-address"
                            v-model="email"
                            autocomplete="email"
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            name="email"
                            placeholder="이메일"
                            required
                            type="email"
                        />
                    </div>
                    <div>
                        <label class="sr-only" for="password">비밀번호</label>
                        <input
                            id="password"
                            v-model="password"
                            autocomplete="current-password"
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            name="password"
                            placeholder="비밀번호"
                            required
                            type="password"
                        />
                    </div>
                </div>

                <div v-if="errorMessage" class="text-red-500 text-sm text-center">
                    {{ errorMessage }}
                </div>

                <div>
                    <button
                        :disabled="isLoading"
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        type="submit"
                    >
                        <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <!-- Loading spinner -->
                            <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                <path class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                      fill="currentColor"></path>
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

<script lang='ts' setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { ApiError } from '@/types/error/apierror'
import { useFetchStore } from '@/store/fetch/fetch'

const router = useRouter()
const fetchStore = useFetchStore()

// Form fields
const name = ref('')
const code = ref('')
const achievementPoint = ref(0)
const refundRate = ref(0)

// UI state
const error = ref('')
const showConfirmModal = ref(false)

// Validate form
const validateForm = () => {
    if (!name.value.trim()) {
        error.value = '등급 이름을 입력해주세요.'
        return false
    }

    if (!code.value.trim()) {
        error.value = '등급 코드를 입력해주세요.'
        return false
    }

    if (achievementPoint.value <= 0) {
        error.value = '등급 달성 포인트는 0보다 커야 합니다.'
        return false
    }

    if (refundRate.value < 0 || refundRate.value > 1) {
        error.value = '환급률은 0에서 1 사이의 값이어야 합니다.'
        return false
    }

    return true
}

// Open confirmation modal
const openConfirmModal = () => {
    error.value = ''

    if (validateForm()) {
        showConfirmModal.value = true
    }
}

// Handle confirm modal close
const handleConfirmClose = (confirmed: boolean) => {
    showConfirmModal.value = false

    if (confirmed) {
        saveGrade()
    }
}

// Save new grade
const saveGrade = async () => {
    try {
        const { secureRequest: registerRequest } = useSecureFetch()
        const registerResponse = await registerRequest('/grade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name.value,
                code: code.value,
                achievementPoint: achievementPoint.value,
                refundRate: refundRate.value
            })
        })

        if (!registerResponse) {
            return
        }

        if (registerResponse.ok) {
            alert('새로운 등급이 성공적으로 생성되었습니다.')
            await router.push('/grade/search')
        } else {
            const apiError = await registerResponse.json() as ApiError
            console.error('Failed to create grade:', apiError)
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '등급을 생성하는데 실패했습니다.'
        console.error('Error creating grade:', err)
    }
}

// Go back to grades list
const goBack = () => {
    router.push('/grade/search')
}
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">새 등급 등록</h1>
            <button
                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                @click="goBack"
            >
                목록으로
            </button>
        </div>

        <div v-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">
            {{ error }}
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
            <div class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700" for="name">등급 이름</label>
                    <input
                        id="name"
                        v-model="name"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="예: 골드"
                        type="text"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700" for="code">등급 코드</label>
                    <input
                        id="code"
                        v-model="code"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="예: GOLD"
                        type="text"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700" for="achievementPoint">등급 달성 포인트</label>
                    <input
                        id="achievementPoint"
                        v-model.number="achievementPoint"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        min="0"
                        placeholder="10000"
                        type="number"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700" for="refundRate">환급률</label>
                    <input
                        id="refundRate"
                        v-model.number="refundRate"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        max="1"
                        min="0"
                        placeholder="0.05"
                        step="0.01"
                        type="number"
                    />
                    <p class="mt-1 text-xs text-gray-500">0부터 1 사이의 값을 입력하세요 (예: 0.05 = 5%)</p>
                </div>
            </div>

            <div class="mt-6">
                <button
                    class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="openConfirmModal"
                    :disabled="fetchStore.isFetching"
                >
                    <span v-if="fetchStore.isFetching" class="inline-flex items-center">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        저장 중...
                    </span>
                    <span v-else>저장</span>
                </button>
            </div>
        </div>

        <!-- Confirmation Modal -->
        <ModalConfirm
            v-if="showConfirmModal"
            message="작성하신 내용을 저장하시겠습니까?"
            @close="handleConfirmClose"
        />
    </div>
</template>

<style scoped>
</style>

<script lang='ts' setup>
import {ref} from 'vue'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'
import { Commission } from '@/types/commission/commission'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { ApiError } from '@/types/error/apierror'
import { useFetchStore } from '@/store/fetch/fetch'

const fetchStore = useFetchStore()
const commissionPlan = ref<Commission['commissionPlan']>()
const showConfirmModal = ref(false)
const showSecondConfirmModal = ref(false)
const confirmMessage = ref('')
const error = ref('')

// Fetch current commission plan
const fetchCommissionPlan = async () => {
    try {
        const { secureRequest: getCommissionRequest } = useSecureFetch()
        const response = await getCommissionRequest('/companies/commission', { method: 'GET' })
        
        if (!response) {
            return
        }

        if (response.ok) {
            const data = await response.json()
            if (!data.commissionPlan) {
                alert('현재 보상 플랜이 등록되지 않았습니다.')
            }
            commissionPlan.value = data.commissionPlan
        } else {
            const apiError = await response.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '보상 플랜 정보를 불러오는데 실패했습니다.'
    }
}

const openConfirmModal = () => {
    confirmMessage.value = '보상 플랜 변경 시 회원 및 주문 데이터가 삭제되고 다시 동기화하여야 합니다. 정말 진행하시겠습니까?'
    showConfirmModal.value = true
}

const handleConfirmClose = (confirmed: boolean) => {
    showConfirmModal.value = false

    if (confirmed) {
        // Show second confirmation
        confirmMessage.value = '재차 확인합니다. 정말 진행하시겠습니까? 모든 데이터가 삭제됩니다.'
        showSecondConfirmModal.value = true
    }
}

const handleSecondConfirmClose = (confirmed: boolean) => {
    showSecondConfirmModal.value = false

    if (confirmed) {
        saveCommissionPlan()
    }
}

const saveCommissionPlan = async () => {
    try {
        const { secureRequest } = useSecureFetch()
        const response = await secureRequest('/commission/plan', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                commissionPlan: commissionPlan.value
            })
        })

        if (!response) {
            return
        }

        if (response.ok) {
            alert('보상 플랜이 성공적으로 변경되었습니다.')
        } else {
            const apiError = await response.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '보상 플랜을 저장하는데 실패했습니다.'
    }
}

// Fetch initial data
fetchCommissionPlan()
</script>

<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-6">보상 플랜 설정</h1>

        <div v-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">
            {{ error }}
            <button class="ml-2 underline" @click="fetchCommissionPlan">다시 시도</button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
            <div class="mb-4">
                <h2 class="text-lg font-semibold mb-2">플랜 선택</h2>
                <p class="text-sm text-gray-600 mb-4">회사의 보상 플랜을 설정합니다. 이 설정은 회원 구조와 밀접한 관계가 있습니다.</p>

                <div class="space-y-2">
                    <div class="flex items-center">
                        <input
                            id="binary"
                            v-model="commissionPlan"
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                            type="radio"
                            value="BINARY"
                        >
                        <label class="ml-2 block text-sm text-gray-700" for="binary">
                            Binary (한 회원은 아래에 두 명의 후원자를 둘 수 있습니다)
                        </label>
                    </div>
                    <div class="flex items-center">
                        <input
                            id="general"
                            v-model="commissionPlan"
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                            type="radio"
                            value="GENERAL"
                        >
                        <label class="ml-2 block text-sm text-gray-700" for="general">
                            General (한 회원은 아래에 제한없이 후원자를 둘 수 있습니다)
                        </label>
                    </div>
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

        <!-- First Confirmation Modal -->
        <ModalConfirm
            v-if="showConfirmModal"
            :message="confirmMessage"
            @close="handleConfirmClose"
        />

        <!-- Second Confirmation Modal -->
        <ModalConfirm
            v-if="showSecondConfirmModal"
            :message="confirmMessage"
            @close="handleSecondConfirmClose"
        />
    </div>
</template>

<style scoped>
</style>

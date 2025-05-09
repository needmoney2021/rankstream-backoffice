<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {Grade} from '@/types/grade/grade'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { ApiError } from '@/types/error/apierror'
import { useFetchStore } from '@/store/fetch/fetch'

const route = useRoute()
const router = useRouter()
const fetchStore = useFetchStore()
const gradeId = route.params.id as string
const grade = ref<Grade>({} as Grade)
const isLoading = ref(true)
const error = ref('')
const showConfirmModal = ref(false)

// Form fields
const achievementPoint = ref(0)
const refundRate = ref(0)

// Form validation errors
const errors = ref<{
    achievementPoint?: string
    refundRate?: string
}>({})

// Validate form
const validateForm = () => {
    errors.value = {}
    let isValid = true

    if (achievementPoint.value <= 0) {
        errors.value.achievementPoint = '등급 달성 포인트는 0보다 커야 합니다.'
        isValid = false
    }

    if (refundRate.value < 0 || refundRate.value > 1) {
        errors.value.refundRate = '환급률은 0에서 1 사이의 값이어야 합니다.'
        isValid = false
    }

    return isValid
}

// Fetch grade details
const fetchGradeDetails = async () => {
    try {
        isLoading.value = true
        error.value = ''

        const { secureRequest: searchRequest } = useSecureFetch()
        const searchResponse = await searchRequest(`/grade/${gradeId}`, { method: 'GET' })
        
        if (!searchResponse) {
            return
        }

        if (searchResponse.ok) {
            grade.value = await searchResponse.json()
            // Initialize form fields
            achievementPoint.value = grade.value.achievementPoint
            refundRate.value = grade.value.refundRate
        } else {
            const apiError = await searchResponse.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '등급 정보를 불러오는데 실패했습니다.'
    } finally {
        isLoading.value = false
    }
}

// Save grade changes
const saveGrade = async () => {
    if (!validateForm()) {
        return
    }

    try {
        const { secureRequest: updateRequest } = useSecureFetch()
        const updateResponse = await updateRequest(`/grade/${gradeId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                achievementPoint: achievementPoint.value,
                refundRate: refundRate.value
            })
        })

        if (!updateResponse) {
            return
        }

        if (updateResponse.ok) {
            alert('등급 정보가 성공적으로 업데이트되었습니다.')
            await router.push('/grade/search')
        } else {
            const apiError = await updateResponse.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '등급 정보를 저장하는데 실패했습니다.'
    }
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

// Go back to grades list
const goBack = () => {
    router.push('/grade/search')
}

onMounted(() => {
    fetchGradeDetails()
})
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">등급 상세 정보</h1>
            <button
                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                @click="goBack"
            >
                목록으로
            </button>
        </div>

        <div v-if="isLoading" class="text-center py-10">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-gray-600">등급 정보를 불러오는 중...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">
            {{ error }}
            <button class="ml-2 underline" @click="fetchGradeDetails">다시 시도</button>
        </div>

        <div v-else class="bg-white p-6 rounded-lg shadow">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Read-only fields -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">등급 키</label>
                        <input
                            :value="grade.idx"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">등급 이름</label>
                        <input
                            :value="grade.name"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">등급 코드</label>
                        <input
                            :value="grade.code"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">등록자</label>
                        <input
                            :value="grade.createdBy"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">등록일시</label>
                        <input
                            :value="new Date(grade.createdAt).toLocaleString()"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>
                </div>

                <div class="space-y-4">
                    <!-- Editable fields -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700" for="achievementPoint">등급 달성 포인트</label>
                        <input
                            id="achievementPoint"
                            v-model.number="achievementPoint"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            min="0"
                            type="number"
                        />
                        <p v-if="errors.achievementPoint" class="text-red-500 text-sm mt-1">{{ errors.achievementPoint }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700" for="refundRate">환급률</label>
                        <input
                            id="refundRate"
                            v-model.number="refundRate"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            max="1"
                            min="0"
                            step="0.01"
                            type="number"
                        />
                        <p class="mt-1 text-xs text-gray-500">0부터 1 사이의 값을 입력하세요 (예: 0.05 = 5%)</p>
                        <p v-if="errors.refundRate" class="text-red-500 text-sm mt-1">{{ errors.refundRate }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">수정자</label>
                        <input
                            :value="grade.updatedBy"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">수정일시</label>
                        <input
                            :value="grade.updatedAt ? new Date(grade.updatedAt).toLocaleString() : '-'"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
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

        <!-- Confirmation Modal -->
        <ModalConfirm
            v-if="showConfirmModal"
            message="변경된 내용을 저장하시겠습니까?"
            @close="handleConfirmClose"
        />
    </div>
</template>

<style scoped>
</style>

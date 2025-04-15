<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {Grade} from '@/types/grade/grade'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'

const route = useRoute()
const router = useRouter()
const gradeId = route.params.id as string
const grade = ref<Grade>({} as Grade)
const isLoading = ref(true)
const error = ref('')
const showConfirmModal = ref(false)

// Form fields
const achievementPoint = ref(0)
const refundRate = ref(0)

// Fetch grade details
const fetchGradeDetails = async () => {
    try {
        isLoading.value = true
        error.value = ''

        // This would be an actual API call in a real implementation
        // const response = await fetch(`/api/grades/${gradeId}`)
        // if (!response.ok) throw new Error('Failed to fetch grade details')
        // grade.value = await response.json()

        // For mock purposes, we'll use static data
        setTimeout(() => {
            // Simulate API response
            grade.value = {
                id: Number(gradeId),
                name: ['브론즈', '실버', '골드', '플래티넘', '다이아몬드'][Number(gradeId) - 1],
                achievementPoint: [1000, 5000, 10000, 20000, 50000][Number(gradeId) - 1],
                refundRate: [0.01, 0.03, 0.05, 0.08, 0.12][Number(gradeId) - 1],
                createdBy: 'admin',
                createdAt: '2023-05-15T08:00:00Z',
                updatedBy: 'admin',
                updatedAt: '2023-05-15T08:00:00Z'
            }

            // Initialize form fields
            achievementPoint.value = grade.value.achievementPoint
            refundRate.value = grade.value.refundRate

            isLoading.value = false
        }, 500)

    } catch (err: any) {
        error.value = err.message || '등급 정보를 불러오는데 실패했습니다.'
        isLoading.value = false
    }
}

// Save grade changes
const saveGrade = async () => {
    try {
        // This would be an actual API call in a real implementation
        // const response = await fetch(`/api/grades/${gradeId}`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         achievementPoint: achievementPoint.value,
        //         refundRate: refundRate.value
        //     })
        // })
        // if (!response.ok) throw new Error('Failed to update grade')

        // For mock purposes, we'll just update the local state
        grade.value.achievementPoint = achievementPoint.value
        grade.value.refundRate = refundRate.value
        grade.value.updatedAt = new Date().toISOString()

        // Show success message
        alert('등급 정보가 성공적으로 업데이트되었습니다.')

        // Redirect back to grades list
        router.push('/grade')

    } catch (err: any) {
        error.value = err.message || '등급 정보를 저장하는데 실패했습니다.'
    }
}

// Open confirmation modal
const openConfirmModal = () => {
    showConfirmModal.value = true
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
    router.push('/grade')
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
                            :value="grade.id"
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
                    class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    @click="openConfirmModal"
                >
                    저장
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

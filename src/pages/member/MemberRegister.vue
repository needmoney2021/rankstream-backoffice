<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { ApiError } from '@/types/error/apierror'
import { useFetchStore } from '@/store/fetch/fetch'
import { Grade } from '@/types/grade/grade'

const router = useRouter()
const fetchStore = useFetchStore()

// Company sponsorship type
const sponsorshipType = ref<'binary' | 'non-binary'>('binary')
const isLoading = ref(true)

// Form fields
const memberId = ref('')
const name = ref('')
const gender = ref('M')
const joinDate = ref('')
const currentGrade = ref('')
const recommenderId = ref('')
const sponsorId = ref('')
const position = ref('Left')

// UI state
const error = ref('')
const showConfirmModal = ref(false)

// Grade options
const gradeOptions = ref<{value: number, label: string}[]>([])

// Set today's date as default join date
onMounted(async () => {
    const today = new Date().toISOString().split('T')[0]
    joinDate.value = today

    try {
        // Fetch grade options
        const { secureRequest: gradeRequest } = useSecureFetch()
        const gradeResponse = await gradeRequest('/grade', { method: 'GET' })
        
        if (!gradeResponse) {
            return
        }

        if (gradeResponse.ok) {
            const grades = await gradeResponse.json() as Grade[]
            gradeOptions.value = grades.map((grade: Grade) => ({
                value: grade.idx,
                label: grade.name
            }))
            // Set default grade to the first option
            if (gradeOptions.value.length > 0) {
                currentGrade.value = gradeOptions.value[0].value
            }
        } else {
            const apiError = await gradeResponse.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '데이터를 불러오는데 실패했습니다.'
    } finally {
        isLoading.value = false
    }
})

// Validate form
const validateForm = () => {
    if (!memberId.value.trim()) {
        error.value = '회원 아이디를 입력해주세요.'
        return false
    }

    if (!name.value.trim()) {
        error.value = '이름을 입력해주세요.'
        return false
    }

    if (!joinDate.value) {
        error.value = '가입일을 입력해주세요.'
        return false
    }

    if (!sponsorId.value.trim()) {
        error.value = '상위 스폰서 아이디를 입력해주세요.'
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
        saveMember()
    }
}

// Save new member
const saveMember = async () => {
    try {
        // This would be an actual API call in a real implementation
        // const response = await fetch('/api/members', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         id: memberId.value,
        //         name: name.value,
        //         gender: gender.value,
        //         joinDate: joinDate.value,
        //         currentGrade: currentGrade.value,
        //         recommenderId: recommenderId.value || undefined,
        //         sponsorId: sponsorId.value,
        //         position: sponsorshipType.value === 'binary' ? position.value : undefined
        //     })
        // })
        // if (!response.ok) throw new Error('Failed to create member')

        // For mock purposes, we'll simulate a successful creation
        console.debug('Creating member:', {
            id: memberId.value,
            name: name.value,
            gender: gender.value,
            joinDate: joinDate.value,
            currentGrade: currentGrade.value,
            recommenderId: recommenderId.value || undefined,
            sponsorId: sponsorId.value,
            position: sponsorshipType.value === 'binary' ? position.value : undefined
        })

        // Show success message
        alert('새로운 회원이 성공적으로 등록되었습니다.')

        // Redirect back to members list
        router.push('/member')

    } catch (err: any) {
        error.value = err.message || '회원을 등록하는데 실패했습니다.'
    }
}

// Go back to members list
const goBack = () => {
    router.push('/member/search')
}
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">새 회원 등록</h1>
            <button
                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                @click="goBack"
            >
                목록으로
            </button>
        </div>

        <div v-if="isLoading" class="text-center py-10">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-gray-600">데이터를 불러오는 중...</p>
        </div>

        <div v-else>
            <div v-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">
                {{ error }}
            </div>

            <div class="bg-white p-6 rounded-lg shadow">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="memberId">회원 아이디</label>
                            <input
                                id="memberId"
                                v-model="memberId"
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="회원 아이디 입력"
                                type="text"
                            />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="name">이름</label>
                            <input
                                id="name"
                                v-model="name"
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="이름 입력"
                                type="text"
                            />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="gender">성별</label>
                            <select
                                id="gender"
                                v-model="gender"
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="M">남성</option>
                                <option value="F">여성</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="joinDate">가입일</label>
                            <input
                                id="joinDate"
                                v-model="joinDate"
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                type="date"
                            />
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="currentGrade">등급</label>
                            <select
                                id="currentGrade"
                                v-model="currentGrade"
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option v-for="option in gradeOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="recommenderId">추천인 아이디</label>
                            <input
                                id="recommenderId"
                                v-model="recommenderId"
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="추천인 아이디 입력"
                                type="text"
                            />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="sponsorId">상위 스폰서 아이디</label>
                            <input
                                id="sponsorId"
                                v-model="sponsorId"
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="상위 스폰서 아이디 입력"
                                type="text"
                            />
                        </div>

                        <div v-if="sponsorshipType === 'binary'">
                            <label class="block text-sm font-medium text-gray-700" for="position">위치</label>
                            <select
                                id="position"
                                v-model="position"
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="Left">Left</option>
                                <option value="Right">Right</option>
                            </select>
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

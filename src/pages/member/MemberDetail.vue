<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {Member} from '@/types/member/member'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'
import MemberGradeHistory from '@/components/modal/MemberGradeHistory.vue'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { ApiError } from '@/types/error/apierror'
import { useFetchStore } from '@/store/fetch/fetch'
import { Grade } from '@/types/grade/grade'

const route = useRoute()
const router = useRouter()
const fetchStore = useFetchStore()
const memberIdx = route.params.id as string
const member = ref<Member>({} as Member)
const error = ref('')
const showConfirmModal = ref(false)
const showGradeHistoryModal = ref(false)

// Form fields
const state = ref<Member['state']>()
const gradeIdx = ref<number>()

// State options
const stateOptions = [
    {value: 'ACTIVE', label: '활성'},
    {value: 'DEACTIVATED', label: '비활성'}
]

// Grade options
const gradeOptions = ref<{value: number, label: string}[]>([])

// Fetch member details
const fetchMemberDetails = async () => {
    try {
        // Fetch grade options first
        const { secureRequest: getGradeRequest } = useSecureFetch()
        const gradeResponse = await getGradeRequest('/grade', { method: 'GET' })
        
        if (!gradeResponse) {
            return
        }

        if (gradeResponse.ok) {
            const gradeData = await gradeResponse.json() as Grade[]
            gradeOptions.value = gradeData.map((grade: Grade) => ({
                value: grade.idx,
                label: grade.name
            }))
        } else {
            const apiError = await gradeResponse.json() as ApiError
            error.value = apiError.message
            return
        }

        // Fetch member details
        const { secureRequest: getMemberRequest } = useSecureFetch()
        const response = await getMemberRequest(`/members/${memberIdx}`, { method: 'GET' })
        
        if (!response) {
            return
        }

        if (response.ok) {
            const data = await response.json() as Member
            member.value = data
            state.value = data.state
            gradeIdx.value = data.gradeIdx
        } else {
            const apiError = await response.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '회원 정보를 불러오는데 실패했습니다.'
    }
}

// Save member changes
const saveMember = async () => {
    try {
        const { secureRequest: updateMemberRequest } = useSecureFetch()
        const response = await updateMemberRequest(`/members/${memberIdx}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                state: state.value,
                gradeIdx: gradeIdx.value
            })
        })

        if (!response) {
            return
        }

        if (response.ok) {
            const data = await response.json() as Member
            member.value = data
            state.value = data.state
            gradeIdx.value = data.gradeIdx
            alert('회원 정보가 성공적으로 수정되었습니다.')
        } else {
            const apiError = await response.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '회원 정보를 수정하는데 실패했습니다.'
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
        saveMember()
    }
}

// Go back to members list
const goBack = () => {
    router.push('/member/search')
}

// View member tree
const viewMemberTree = () => {
    router.push(`/member/tree/${memberIdx}`)
}

// View grade history
const viewGradeHistory = () => {
    showGradeHistoryModal.value = true
}

// Handle grade history modal close
const handleGradeHistoryClose = () => {
    showGradeHistoryModal.value = false
}

onMounted(() => {
    fetchMemberDetails()
})
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">회원 상세 정보</h1>
            <div class="space-x-2">
                <button
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    @click="viewGradeHistory"
                >
                    등급이력
                </button>
                <button
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    @click="viewMemberTree"
                >
                    트리보기
                </button>
                <button
                    class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    @click="goBack"
                >
                    목록으로
                </button>
            </div>
        </div>

        <div v-if="fetchStore.isFetching" class="text-center py-10">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-gray-600">데이터를 불러오는 중...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">
            {{ error }}
            <button class="ml-2 underline" @click="fetchMemberDetails">다시 시도</button>
        </div>

        <div v-else class="bg-white p-6 rounded-lg shadow">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Read-only fields -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">회원 아이디</label>
                        <input
                            :value="member.id"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">이름</label>
                        <input
                            :value="member.name"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">성별</label>
                        <input
                            :value="member.gender === 'MALE' ? '남성' : '여성'"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">가입일</label>
                        <input
                            :value="member.createdAt"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">하위 회원 수</label>
                        <input
                            :value="member.childrenCount"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>
                </div>

                <div class="space-y-4">
                    <!-- Editable fields -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700" for="state">상태</label>
                        <select
                            id="state"
                            v-model="state"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option v-for="option in stateOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700" for="gradeIdx">현재 등급</label>
                        <select
                            id="gradeIdx"
                            v-model="gradeIdx"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option v-for="option in gradeOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">수정일</label>
                        <input
                            :value="member.updatedAt"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">상위 스폰서 아이디</label>
                        <input
                            :value="member.sponsorId || '-'"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">상위 스폰서 이름</label>
                        <input
                            :value="member.sponsorName || '-'"
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
                        수정 중...
                    </span>
                    <span v-else>수정</span>
                </button>
            </div>
        </div>

        <!-- Confirmation Modal -->
        <ModalConfirm
            v-if="showConfirmModal"
            message="관리자님의 시스템 데이터와 일치해야 합니다. 데이터 동기화가 깨지면 실적 및 환급 계산이 달라질 수 있습니다. 정말 수정하시겠습니까?"
            @close="handleConfirmClose"
        />

        <!-- Grade History Modal -->
        <MemberGradeHistory
            v-if="showGradeHistoryModal"
            :grade-history="member.gradeHistory"
            @close="handleGradeHistoryClose"
        />
    </div>
</template>

<style scoped>
</style>

<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {Member} from '@/types/member/member'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { ApiError } from '@/types/error/apierror'
import { useFetchStore } from '@/store/fetch/fetch'

interface MockMember {
    id: string
    name: string
    gender: 'M' | 'F'
    state: 'ACTIVE' | 'DEACTIVATED'
    joinDate: string
    withdrawDate?: string
    childrenCount: number
    currentGrade: string
    sponsorId?: string
    recommenderId?: string
    position?: 'Left' | 'Right'
}

const route = useRoute()
const router = useRouter()
const fetchStore = useFetchStore()
const memberId = route.params.id as string
const member = ref<MockMember>({} as Member)
const isLoading = ref(true)
const error = ref('')
const showConfirmModal = ref(false)

// Form fields
const state = ref<'ACTIVE' | 'DEACTIVATED'>()
const currentGrade = ref('')

// State options
const stateOptions = [
    {value: 'ACTIVE', label: '활성'},
    {value: 'DEACTIVATED', label: '비활성'}
]

// Grade options
const gradeOptions = ref<{value: string, label: string}[]>([])

// Fetch member details
const fetchMemberDetails = async () => {
    
}

// Save member changes
const saveMember = async () => {
    
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
    router.push(`/member/tree/${memberId}`)
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

        <div v-if="isLoading" class="text-center py-10">
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
                            :value="member.gender === 'M' ? '남성' : '여성'"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">가입일</label>
                        <input
                            :value="member.joinDate"
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
                        <label class="block text-sm font-medium text-gray-700" for="status">상태</label>
                        <select
                            id="status"
                            v-model="status"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700" for="currentGrade">현재 등급</label>
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
                        <label class="block text-sm font-medium text-gray-700">탈퇴일</label>
                        <input
                            :value="member.withdrawDate || '-'"
                            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            readonly
                            type="text"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">추천인 아이디</label>
                        <input
                            :value="member.recommenderId || '-'"
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
                </div>
            </div>

            <div class="mt-6">
                <button
                    class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    @click="openConfirmModal"
                >
                    수정
                </button>
            </div>
        </div>

        <!-- Confirmation Modal -->
        <ModalConfirm
            v-if="showConfirmModal"
            message="관리자님의 시스템 데이터와 일치해야 합니다. 데이터 동기화가 깨지면 실적 및 환급 계산이 달라질 수 있습니다. 정말 수정하시겠습니까?"
            @close="handleConfirmClose"
        />
    </div>
</template>

<style scoped>
</style>

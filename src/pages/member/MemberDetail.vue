<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {Member} from '@/types/member/member'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'

interface MockMember {
    id: string
    name: string
    gender: 'M' | 'F'
    status: 'ACTIVE' | 'INACTIVE' | 'WITHDRAW'
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
const memberId = route.params.id as string
const member = ref<MockMember>({} as Member)
const isLoading = ref(true)
const error = ref('')
const showConfirmModal = ref(false)

// Form fields
const status = ref<'ACTIVE' | 'INACTIVE' | 'WITHDRAW'>()
const currentGrade = ref('')

// Status options
const statusOptions = [
    {value: 'ACTIVE', label: '활성'},
    {value: 'INACTIVE', label: '비활성'},
    {value: 'WITHDRAW', label: '탈퇴'}
]

// Grade options
const gradeOptions = [
    {value: '브론즈', label: '브론즈'},
    {value: '실버', label: '실버'},
    {value: '골드', label: '골드'},
    {value: '플래티넘', label: '플래티넘'},
    {value: '다이아몬드', label: '다이아몬드'}
]

// Fetch member details
const fetchMemberDetails = async () => {
    try {
        isLoading.value = true
        error.value = ''

        // This would be an actual API call in a real implementation
        // const response = await fetch(`/api/members/${memberId}`)
        // if (!response.ok) throw new Error('Failed to fetch member details')
        // member.value = await response.json()

        // For mock purposes, we'll use static data
        setTimeout(() => {
            // Simulate API response
            const mockMembers: { [key: string]: MockMember } = {
                'member000001': {
                    id: 'member000001',
                    name: '김철수',
                    gender: 'M',
                    status: 'ACTIVE',
                    joinDate: '2023-01-15',
                    childrenCount: 5,
                    currentGrade: '골드',
                    sponsorId: 'member000000',
                    recommenderId: 'member000000'
                },
                'member000002': {
                    id: 'member000002',
                    name: '이영희',
                    gender: 'F',
                    status: 'ACTIVE',
                    joinDate: '2023-02-20',
                    childrenCount: 3,
                    currentGrade: '실버',
                    sponsorId: 'member000001',
                    recommenderId: 'member000001'
                },
                'member000003': {
                    id: 'member000003',
                    name: '박지민',
                    gender: 'M',
                    status: 'INACTIVE',
                    joinDate: '2023-03-05',
                    childrenCount: 0,
                    currentGrade: '브론즈',
                    sponsorId: 'member000001',
                    recommenderId: 'member000002'
                },
                'member000004': {
                    id: 'member000004',
                    name: '최유나',
                    gender: 'F',
                    status: 'ACTIVE',
                    joinDate: '2023-04-10',
                    childrenCount: 7,
                    currentGrade: '플래티넘',
                    sponsorId: 'member000002',
                    recommenderId: 'member000001'
                },
                'member000005': {
                    id: 'member000005',
                    name: '정민수',
                    gender: 'M',
                    status: 'WITHDRAW',
                    joinDate: '2023-05-15',
                    withdrawDate: '2023-08-20',
                    childrenCount: 2,
                    currentGrade: '실버',
                    sponsorId: 'member000002',
                    recommenderId: 'member000004'
                }
            }

            member.value = mockMembers[memberId] || {
                id: memberId,
                name: '존재하지 않는 회원',
                gender: 'M',
                status: 'INACTIVE',
                joinDate: '2023-01-01',
                childrenCount: 0,
                currentGrade: '브론즈'
            }

            // Initialize form fields
            status.value = member.value.status
            currentGrade.value = member.value.currentGrade

            isLoading.value = false
        }, 500)

    } catch (err: any) {
        error.value = err.message || '회원 정보를 불러오는데 실패했습니다.'
        isLoading.value = false
    }
}

// Save member changes
const saveMember = async () => {
    try {
        // This would be an actual API call in a real implementation
        // const response = await fetch(`/api/members/${memberId}`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         status: status.value,
        //         currentGrade: currentGrade.value
        //     })
        // })
        // if (!response.ok) throw new Error('Failed to update member')

        // For mock purposes, we'll just update the local state
        member.value.status = status.value ? status.value : 'ACTIVE'
        member.value.currentGrade = currentGrade.value

        // If status is WITHDRAW, set withdrawDate to today
        if (status.value === 'WITHDRAW' && !member.value.withdrawDate) {
            member.value.withdrawDate = new Date().toISOString().split('T')[0]
        } else if (status.value !== 'WITHDRAW') {
            member.value.withdrawDate = undefined
        }

        // Show success message
        alert('회원 정보가 성공적으로 업데이트되었습니다.')

    } catch (err: any) {
        error.value = err.message || '회원 정보를 저장하는데 실패했습니다.'
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
            <p class="mt-2 text-gray-600">회원 정보를 불러오는 중...</p>
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

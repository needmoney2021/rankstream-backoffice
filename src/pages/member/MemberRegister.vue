<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { ApiError } from '@/types/error/apierror'
import { useFetchStore } from '@/store/fetch/fetch'
import { Grade } from '@/types/grade/grade'

interface CommissionResponse {
    commissionPlan?: 'BINARY' | 'GENERAL'
}

const router = useRouter()
const fetchStore = useFetchStore()

// Company sponsorship type
const sponsorshipType = ref<'BINARY' | 'GENERAL'>('BINARY')
const isLoading = ref(true)

// Form fields
const memberId = ref('')
const name = ref('')
const gender = ref('MALE')
const joinDate = ref('')
const joinTime = ref('00:00')
const currentGrade = ref('')
const recommenderId = ref('')
const sponsorId = ref('')
const position = ref<'LEFT' | 'RIGHT'>('LEFT')
const isFirstMember = ref(false)

// Validation states
const isRecommenderValidated = ref(false)
const isSponsorValidated = ref(false)

// UI state
const error = ref('')
const showConfirmModal = ref(false)

// Grade options
const gradeOptions = ref<{value: number, label: string}[]>([])

// Set today's date and time as default
onMounted(async () => {
    const today = new Date()
    joinDate.value = today.toISOString().split('T')[0]
    joinTime.value = today.toTimeString().slice(0, 5)

    try {
        // Fetch commission plan
        const { secureRequest: commissionRequest } = useSecureFetch()
        const commissionResponse = await commissionRequest('/companies/commission', { method: 'GET' })
        
        if (!commissionResponse) {
            error.value = '서버와의 통신에 실패했습니다.'
            return
        }

        if (commissionResponse.ok) {
            const commissionData = await commissionResponse.json() as CommissionResponse
            if (!commissionData.commissionPlan) {
                error.value = '회사의 후원 방식이 설정되지 않았습니다. \'보상 플랜\' 메뉴에서 먼저 등록하세요.'
                return
            }
            sponsorshipType.value = commissionData.commissionPlan
        } else {
            const apiError = await commissionResponse.json() as ApiError
            error.value = apiError.message
            return
        }

        // Fetch grade options
        const { secureRequest: gradeRequest } = useSecureFetch()
        const gradeResponse = await gradeRequest('/grade', { method: 'GET' })
        
        if (!gradeResponse) {
            error.value = '서버와의 통신에 실패했습니다.'
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
        error.value = err.message || '필요한 데이터를 불러오는데 실패했습니다.'
    } finally {
        isLoading.value = false
    }
})

// Validate recommender
const validateRecommender = async () => {
    if (!recommenderId.value.trim()) {
        error.value = '추천인 아이디를 입력해주세요.'
        return
    }

    try {
        const { secureRequest: validateRequest } = useSecureFetch()
        const response = await validateRequest(`/members/recommender/${recommenderId.value}`, { method: 'GET' })
        
        if (!response) {
            return
        }

        if (response.ok) {
            const data = await response.json()
            if (data.valid) {
                isRecommenderValidated.value = true
                error.value = ''
            } else {
                error.value = data.reason || '유효하지 않은 추천인입니다.'
            }
        } else {
            const apiError = await response.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '추천인 검증에 실패했습니다.'
    }
}

// Validate sponsor
const validateSponsor = async () => {
    if (!sponsorId.value.trim()) {
        error.value = '상위 스폰서 아이디를 입력해주세요.'
        return
    }

    try {
        const { secureRequest: validateRequest } = useSecureFetch()
        const response = await validateRequest(`/members/sponsor/${sponsorId.value}?position=${position.value}`, { method: 'GET' })
        
        if (!response) {
            return
        }

        if (response.ok) {
            const data = await response.json()
            if (data.valid) {
                isSponsorValidated.value = true
                error.value = ''
            } else {
                error.value = data.reason || '유효하지 않은 상위 스폰서입니다.'
            }
        } else {
            const apiError = await response.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '상위 스폰서 검증에 실패했습니다.'
    }
}

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

    if (!isFirstMember.value) {
        if (!sponsorId.value.trim()) {
            error.value = '상위 스폰서 아이디를 입력해주세요.'
            return false
        }

        if (!isSponsorValidated.value) {
            error.value = '상위 스폰서 검증이 필요합니다.'
            return false
        }

        if (recommenderId.value.trim() && !isRecommenderValidated.value) {
            error.value = '추천인 검증이 필요합니다.'
            return false
        }
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
        const { secureRequest } = useSecureFetch()
        const response = await secureRequest('/members', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: memberId.value,
                name: name.value,
                gender: gender.value,
                gradeIdx: currentGrade.value,
                recommenderId: isFirstMember.value ? null : recommenderId.value || null,
                sponsorId: isFirstMember.value ? null : sponsorId.value || null,
                position: isFirstMember.value ? null : (sponsorshipType.value === 'BINARY' ? position.value : null),
                joinedAt: `${joinDate.value}T${joinTime.value}:00`,
                isGenesis: isFirstMember.value
            })
        })

        if (!response) {
            error.value = '서버와의 통신에 실패했습니다.'
            return
        }

        if (!response.ok) {
            const apiError = await response.json() as ApiError
            error.value = apiError.message
            return
        }

        // Show success message
        alert('새로운 회원이 성공적으로 등록되었습니다.')

        // Redirect back to members list
        router.push('/member/search')

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
                                <option value="MALE">남성</option>
                                <option value="FEMALE">여성</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="joinDate">가입일시</label>
                            <div class="flex gap-2">
                                <input
                                    id="joinDate"
                                    v-model="joinDate"
                                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    type="date"
                                />
                                <input
                                    id="joinTime"
                                    v-model="joinTime"
                                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    type="time"
                                />
                            </div>
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
                            <label class="block text-sm font-medium text-gray-700" for="isFirstMember">최초 회원 여부</label>
                            <div class="mt-1">
                                <input
                                    id="isFirstMember"
                                    v-model="isFirstMember"
                                    type="checkbox"
                                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="recommenderId">추천인 아이디</label>
                            <div class="flex gap-2">
                                <input
                                    id="recommenderId"
                                    v-model="recommenderId"
                                    :readonly="isRecommenderValidated"
                                    :disabled="isFirstMember"
                                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                    placeholder="추천인 아이디 입력"
                                    type="text"
                                />
                                <button
                                    v-if="!isRecommenderValidated && !isFirstMember"
                                    type="button"
                                    class="mt-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    @click="validateRecommender"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="sponsorId">상위 스폰서 아이디</label>
                            <div class="flex gap-2">
                                <input
                                    id="sponsorId"
                                    v-model="sponsorId"
                                    :readonly="isSponsorValidated"
                                    :disabled="isFirstMember"
                                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                    placeholder="상위 스폰서 아이디 입력"
                                    type="text"
                                />
                                <button
                                    v-if="!isSponsorValidated && !isFirstMember"
                                    type="button"
                                    class="mt-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    @click="validateSponsor"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div v-if="sponsorshipType === 'BINARY'">
                            <label class="block text-sm font-medium text-gray-700" for="position">위치</label>
                            <select
                                id="position"
                                v-model="position"
                                :disabled="isSponsorValidated || isFirstMember"
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                            >
                                <option value="LEFT">Left</option>
                                <option value="RIGHT">Right</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="mt-6">
                    <button
                        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="!!error"
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

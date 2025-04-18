<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'
import {Admin} from "@/types/admin/admin";
import {useSecureFetch} from "@/composable/fetch/use-secure-fetch";
import {ApiError} from "@/types/error/apierror";
import { useFetchStore } from '@/store/fetch/fetch'

const route = useRoute()
const router = useRouter()
const fetchStore = useFetchStore()

const adminIdx = route.params.id as string

const adminInfo = ref<Admin>()

const newPassword = ref('')
const showPasswordChange = ref(false)

const errors = ref<{
    state?: string
    department?: string
    newPassword?: string
}>({})

const validateForm = () => {
    errors.value = {}
    let isValid = true

    if (!adminInfo.value?.state) {
        errors.value.state = '상태를 선택해주세요'
        isValid = false
    }

    if (!adminInfo.value?.department?.trim()) {
        errors.value.department = '부서를 입력해주세요'
        isValid = false
    }

    if (showPasswordChange.value) {
        if (!newPassword.value.trim()) {
            errors.value.newPassword = '새 비밀번호를 입력해주세요'
            isValid = false
        } else if (newPassword.value.length < 8) {
            errors.value.newPassword = '비밀번호는 8자 이상이어야 합니다'
            isValid = false
        }
    }

    return isValid
}

const fetchAdminInfo = async () => {
    const { secureRequest: searchRequest } = useSecureFetch()
    try {
        const searchResponse = await searchRequest(`/administrators/${adminIdx}`, { method: 'GET' })
        if (!searchResponse) {
            return
        }
        adminInfo.value = await searchResponse.json()
    } catch (error: any) {
        console.error('Failed to search administrators:', error)
        alert(error.message || '알 수 없는 오류입니다.')
    }
}

type UpdateAdminRequest = {
    state: 'ACTIVE' | 'DEACTIVATED'
    department: string
    newPassword?: string
}

const updateAdmin = async () => {
    if (!validateForm()) {
        return
    }

    const updateForm: UpdateAdminRequest = {
        state: adminInfo.value?.state!!,
        department: adminInfo.value?.department!!,
        newPassword: (showPasswordChange.value && newPassword.value) || undefined
    }

    const { secureRequest: updateRequest } = useSecureFetch()
    try {
        const updateResponse = await updateRequest(`/administrators/${adminIdx}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateForm),
        })

        if (!updateResponse) {
            return
        }

        if (updateResponse.ok) {
            alert('관리자 정보가 수정되었습니다.')
            await router.push('/admin/search')
        } else {
            const apiError = await updateResponse.json() as ApiError
            console.error('Failed to update administrator:', apiError)
            alert(apiError.message)
        }
    } catch (error: any) {
        console.error('Failed to update administrator:', error)
        alert(error.message || '알 수 없는 오류입니다.')
    }
}

const goToList = () => {
    router.push('/admin/search')
}

onMounted(() => {
    fetchAdminInfo()
})
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">관리자 상세</h1>

        <div v-if="adminInfo" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">소속회사명</label>
                <input v-model="adminInfo.companyName" type="text" readonly class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">아이디</label>
                <input v-model="adminInfo.id" type="text" readonly class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">상태</label>
                <select v-model="adminInfo.state" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="ACTIVE">활성</option>
                    <option value="DEACTIVATED">비활성</option>
                </select>
                <p v-if="errors.state" class="text-red-500 text-sm mt-1">{{ errors.state }}</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">부서</label>
                <input v-model="adminInfo.department" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <p v-if="errors.department" class="text-red-500 text-sm mt-1">{{ errors.department }}</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">등록자</label>
                <input v-model="adminInfo.createdBy" type="text" readonly class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">등록일시</label>
                <input v-model="adminInfo.createdAt" type="text" readonly class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">수정자</label>
                <input v-model="adminInfo.updatedBy" type="text" readonly class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">수정일시</label>
                <input v-model="adminInfo.updatedAt" type="text" readonly class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100">
            </div>
        </div>

        <div class="mb-4">
            <div class="flex items-center mb-2">
                <input type="checkbox" v-model="showPasswordChange" class="mr-2">
                <label>비밀번호 변경</label>
            </div>
            <div v-if="showPasswordChange" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">새 비밀번호</label>
                    <input v-model="newPassword" type="password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <p v-if="errors.newPassword" class="text-red-500 text-sm mt-1">{{ errors.newPassword }}</p>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2">
            <button @click="goToList" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
                목록으로
            </button>
            <button 
                @click="updateAdmin" 
                class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
</template>

<style scoped>
</style>

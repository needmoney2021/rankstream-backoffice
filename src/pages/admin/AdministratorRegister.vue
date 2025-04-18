<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { ApiError } from '@/types/error/apierror'

const router = useRouter()

const form = ref({
    id: '',
    password: '',
    department: '',
    name: ''
})

const errors = ref<{
    id?: string
    password?: string
    department?: string
    name?: string
}>({})

const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

const validateForm = () => {
    errors.value = {}
    let isValid = true

    if (!form.value.id.trim()) {
        errors.value.id = '이메일을 입력해주세요'
        isValid = false
    } else if (!validateEmail(form.value.id)) {
        errors.value.id = '올바른 이메일 형식을 입력해주세요'
        isValid = false
    }

    if (!form.value.password.trim()) {
        errors.value.password = '비밀번호를 입력해주세요'
        isValid = false
    } else if (form.value.password.length < 8) {
        errors.value.password = '비밀번호는 8자 이상이어야 합니다'
        isValid = false
    }

    if (!form.value.department.trim()) {
        errors.value.department = '부서를 입력해주세요'
        isValid = false
    }

    if (!form.value.name.trim()) {
        errors.value.name = '이름을 입력해주세요'
        isValid = false
    }

    return isValid
}

const registerAdmin = async () => {
    if (!validateForm()) {
        return
    }

    const { secureRequest: registerRequest } = useSecureFetch()
    try {
        const registerResponse = await registerRequest('/administrators', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form.value)
        })

        if (!registerResponse) {
            return
        }

        if (registerResponse.ok) {
            alert('관리자가 등록되었습니다.')
            await router.push('/admin/search')
        } else {
            const apiError = await registerResponse.json() as ApiError
            console.error('Failed to register administrator:', apiError)
            alert(apiError.message)
        }
    } catch (error: any) {
        console.error('Failed to register administrator:', error)
        alert(error.message || '알 수 없는 오류입니다.')
    }
}
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">관리자 등록</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">아이디(이메일)</label>
                <input v-model="form.id" type="email" placeholder="이메일을 입력하세요." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <p v-if="errors.id" class="text-red-500 text-sm mt-1">{{ errors.id }}</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">임시 비밀번호</label>
                <input v-model="form.password" type="password" placeholder="8자 이상" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">부서</label>
                <input v-model="form.department" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <p v-if="errors.department" class="text-red-500 text-sm mt-1">{{ errors.department }}</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">이름</label>
                <input v-model="form.name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
            </div>
        </div>

        <div class="flex justify-end gap-2">
            <button @click="router.push('/admin/search')" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
                취소
            </button>
            <button @click="registerAdmin" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                저장
            </button>
        </div>
    </div>
</template>

<style scoped>
</style> 
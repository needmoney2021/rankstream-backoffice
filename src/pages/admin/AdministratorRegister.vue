<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'

const router = useRouter()

const form = ref({
    id: '',
    password: '',
    department: '',
    name: ''
})

const validateForm = () => {
    if (!form.value.id) {
        alert('아이디를 입력해주세요.')
        return false
    }
    if (!form.value.password) {
        alert('비밀번호를 입력해주세요.')
        return false
    }
    if (!form.value.department) {
        alert('부서를 입력해주세요.')
        return false
    }
    if (!form.value.name) {
        alert('이름을 입력해주세요.')
        return false
    }
    return true
}

const registerAdmin = async () => {
    if (!validateForm()) {
        return
    }

    // Simulate API call
    setTimeout(() => {
        alert('등록이 완료되었습니다.')
        router.push(`/admin/detail/${form.value.id}`)
    }, 500)
}
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">관리자 등록</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">아이디</label>
                <input v-model="form.id" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">임시 비밀번호</label>
                <input v-model="form.password" type="password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">부서</label>
                <input v-model="form.department" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">이름</label>
                <input v-model="form.name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
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
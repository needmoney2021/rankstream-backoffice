<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'

const route = useRoute()
const router = useRouter()

const adminId = route.params.id as string

const adminInfo = ref({
    companyName: '',
    id: '',
    status: '',
    department: '',
    registrant: '',
    registeredAt: '',
    modifier: '',
    modifiedAt: ''
})

const password = ref('')
const newPassword = ref('')
const showPasswordChange = ref(false)

const fetchAdminInfo = async () => {
    // Simulate API call
    setTimeout(() => {
        adminInfo.value = {
            companyName: '테스트회사',
            id: adminId,
            status: '활성',
            department: '개발팀',
            registrant: 'superadmin',
            registeredAt: '2024-03-20 10:00:00',
            modifier: 'superadmin',
            modifiedAt: '2024-03-21 11:00:00'
        }
    }, 500)
}

const updateAdmin = async () => {
    if (showPasswordChange.value && !newPassword.value) {
        alert('비밀번호를 입력해주세요.')
        return
    }

    // Simulate API call
    setTimeout(() => {
        alert('수정이 완료되었습니다.')
        router.push('/admin/search')
    }, 500)
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
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <select v-model="adminInfo.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="활성">활성</option>
                    <option value="비활성">비활성</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">부서</label>
                <input v-model="adminInfo.department" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">등록자</label>
                <input v-model="adminInfo.registrant" type="text" readonly class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">등록일시</label>
                <input v-model="adminInfo.registeredAt" type="text" readonly class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">수정자</label>
                <input v-model="adminInfo.modifier" type="text" readonly class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">수정일시</label>
                <input v-model="adminInfo.modifiedAt" type="text" readonly class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100">
            </div>
        </div>

        <div class="mb-4">
            <div class="flex items-center mb-2">
                <input type="checkbox" v-model="showPasswordChange" class="mr-2">
                <label>비밀번호 변경</label>
            </div>
            <div v-if="showPasswordChange" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">현재 비밀번호</label>
                    <input v-model="password" type="password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">새 비밀번호</label>
                    <input v-model="newPassword" type="password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2">
            <button @click="goToList" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
                목록으로
            </button>
            <button @click="updateAdmin" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                수정
            </button>
        </div>
    </div>
</template>

<style scoped>
</style> 
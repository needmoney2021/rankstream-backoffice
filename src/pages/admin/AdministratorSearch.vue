<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ResultTable from '@/components/table/ResultTable.vue'

const router = useRouter()

const searchParams = ref({
    name: '',
    department: '',
    id: '',
    status: ''
})

const columns = [
    { key: 'companyName', label: '소속회사명' },
    { key: 'id', label: '아이디' },
    { key: 'name', label: '이름' },
    { key: 'department', label: '부서' },
    { key: 'status', label: '상태' },
    { key: 'registrant', label: '등록자' },
    { key: 'registeredAt', label: '등록일시' }
]

const tableData = ref([])

const search = async () => {
    // Simulate API call
    setTimeout(() => {
        tableData.value = [
            {
                companyName: '테스트회사',
                id: 'admin1',
                name: '관리자1',
                department: '개발팀',
                status: '활성',
                registrant: 'superadmin',
                registeredAt: '2024-03-20 10:00:00'
            },
            {
                companyName: '테스트회사',
                id: 'admin2',
                name: '관리자2',
                department: '운영팀',
                status: '비활성',
                registrant: 'superadmin',
                registeredAt: '2024-03-21 11:00:00'
            }
        ]
    }, 500)
}

const handleRowDoubleClick = (row: any) => {
    router.push(`/admin/detail/${row.id}`)
}

const goToRegister = () => {
    router.push('/admin/register')
}

onMounted(() => {
    search()
})
</script>

<template>
    <div class="p-4">
        <div class="mb-4">
            <h1 class="text-2xl font-bold mb-4">관리자 조회</h1>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">이름</label>
                    <input v-model="searchParams.name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">부서</label>
                    <input v-model="searchParams.department" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">아이디</label>
                    <input v-model="searchParams.id" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">상태</label>
                    <select v-model="searchParams.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option value="">전체</option>
                        <option value="활성">활성</option>
                        <option value="비활성">비활성</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end">
                <button @click="search" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    조회
                </button>
            </div>
        </div>

        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">조회 결과</h2>
            <button @click="goToRegister" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                관리자 등록
            </button>
        </div>

        <ResultTable
            :columns="columns"
            :data="tableData"
            key-column="id"
            @row-double-click="handleRowDoubleClick"
        />
    </div>
</template>

<style scoped>
</style> 
<script setup lang='ts'>
import {ref, onMounted, computed} from 'vue'
import { useRouter } from 'vue-router'
import ResultTable from '@/components/table/ResultTable.vue'
import {useFetchStore} from "@/store/fetch/fetch";
import {useSecureFetch} from "@/composable/fetch/use-secure-fetch";
import {ApiError} from "@/types/error/apierror";
import {Admin} from "@/types/admin/admin";

const fetchStore = useFetchStore()

const isFetching = computed(() => {
    return fetchStore.isFetching
})

const router = useRouter()

const searchParams = ref({
    name: '',
    id: '',
    state: ''
})

const columns = [
    { key: 'companyName', label: '소속사' },
    { key: 'id', label: '아이디' },
    { key: 'name', label: '이름' },
    { key: 'department', label: '부서' },
    { key: 'state', label: '상태' },
    { key: 'createdAt', label: '등록자' },
    { key: 'createdBy', label: '등록일시' },
    { key: 'updatedAt', label: '수정자' },
    { key: 'updatedBy', label: '수정일시' },
]

const tableData = ref<Admin[]>([])

const search = async () => {
    const params = new URLSearchParams()

    Object.keys(searchParams.value).forEach(key => {
        const value = searchParams.value[key as keyof typeof searchParams.value]
        if (value !== '') {
            params.append(key, value)
        }
    })
    const { secureRequest: searchRequest } = useSecureFetch()
    const url = `/administrators?${params.toString()}`
    try {
        const searchResponse = await searchRequest(url, { method: 'GET' })
        if (!searchResponse) {
            return
        }
        
        if (searchResponse.ok) {
            tableData.value = await searchResponse.json()
        } else {
            tableData.value = []
            const apiError = await searchResponse.json() as ApiError
            console.error('Failed to search administrators:', apiError)
            alert(apiError.message)
        }
    } catch (error: any) {
        console.error('Failed to search administrators:', error)
        alert(error.message || '알 수 없는 오류입니다.')
    }
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
                    <label class="block text-sm font-medium text-gray-700">아이디</label>
                    <input v-model="searchParams.id" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">상태</label>
                    <select v-model="searchParams.state" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option value="">전체</option>
                        <option value="ACTIVE">활성</option>
                        <option value="DEACTIVATED">비활성</option>
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

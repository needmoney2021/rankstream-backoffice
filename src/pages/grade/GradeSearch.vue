<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import ResultTable from '@/components/table/ResultTable.vue'
import {Grade} from '@/types/grade/grade'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { ApiError } from '@/types/error/apierror'

const router = useRouter()
const grades = ref<Grade[]>([])
const isLoading = ref(true)
const error = ref('')

// Define table columns
const columns = [
    {key: 'idx', label: '등급 키', width: '100px'},
    {key: 'name', label: '등급 이름', width: '150px'},
    {key: 'code', label: '등급 코드', width: '120px'},
    {key: 'achievementPoint', label: '등급 달성 포인트', width: '150px'},
    {key: 'refundRate', label: '환급률', width: '100px'},
    {key: 'createdBy', label: '등록자', width: '120px'},
    {key: 'createdAt', label: '등록일시', width: '180px'},
    {key: 'updatedBy', label: '수정자', width: '120px'},
    {key: 'updatedAt', label: '수정일시', width: '180px'}
]

// Method to fetch grades
const fetchGrades = async () => {
    try {
        isLoading.value = true
        error.value = ''

        const { secureRequest: searchRequest } = useSecureFetch()
        const searchResponse = await searchRequest('/grade', { method: 'GET' })

        if (!searchResponse) {
            return
        }

        if (searchResponse.ok) {
            grades.value = await searchResponse.json()
            // Sort by achievement point in descending order
            grades.value.sort((a, b) => b.achievementPoint - a.achievementPoint)
        } else {
            const apiError = await searchResponse.json() as ApiError
            console.error('Failed to fetch grades:', apiError)
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '등급 정보를 불러오는데 실패했습니다.'
        console.error('Error fetching grades:', err)
    } finally {
        isLoading.value = false
    }
}

// Handle row double click
const handleRowDoubleClick = (grade: Grade) => {
    router.push(`/grade/detail/${grade.idx}`)
}

// Handle creating a new grade
const handleCreateGrade = () => {
    router.push('/grade/register')
}

// Handle clearing table data
const clearTableData = () => {
    grades.value = []
}

onMounted(() => {
    fetchGrades()
})
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">등급 목록</h1>
            <button
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                @click="handleCreateGrade"
            >
                새 등급 등록
            </button>
        </div>

        <div v-if="isLoading" class="text-center py-10">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-gray-600">등급 정보를 불러오는 중...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">
            {{ error }}
            <button class="ml-2 underline" @click="fetchGrades">다시 시도</button>
        </div>

        <div v-else>
            <ResultTable
                :columns="columns"
                :data="grades"
                keyColumn="idx"
                @row-dblclick="handleRowDoubleClick"
                @clear-table-data="clearTableData"
            />

            <div v-if="grades.length === 0" class="text-center py-10 text-gray-500">
                등급 정보가 없습니다.
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>

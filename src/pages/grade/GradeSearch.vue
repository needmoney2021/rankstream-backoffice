<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import ResultTable from '@/components/table/ResultTable.vue'
import {Grade} from '@/types/grade/grade'

const router = useRouter()
const grades = ref<Grade[]>([])
const isLoading = ref(true)
const error = ref('')

// Define table columns
const columns = [
    {key: 'id', label: '등급 키', width: '100px'},
    {key: 'name', label: '등급 이름', width: '150px'},
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

        // This would be an actual API call in a real implementation
        // const response = await fetch('/api/grades')
        // if (!response.ok) throw new Error('Failed to fetch grades')
        // grades.value = await response.json()

        // For now, generate mock data
        grades.value = [
            {
                id: 1,
                name: '브론즈',
                achievementPoint: 1000,
                refundRate: 0.01,
                createdBy: 'admin',
                createdAt: '2023-05-15T08:00:00Z',
                updatedBy: 'admin',
                updatedAt: '2023-05-15T08:00:00Z'
            },
            {
                id: 2,
                name: '실버',
                achievementPoint: 5000,
                refundRate: 0.03,
                createdBy: 'admin',
                createdAt: '2023-05-15T08:05:00Z',
                updatedBy: 'admin',
                updatedAt: '2023-05-15T08:05:00Z'
            },
            {
                id: 3,
                name: '골드',
                achievementPoint: 10000,
                refundRate: 0.05,
                createdBy: 'admin',
                createdAt: '2023-05-15T08:10:00Z',
                updatedBy: 'admin',
                updatedAt: '2023-05-15T08:10:00Z'
            },
            {
                id: 4,
                name: '플래티넘',
                achievementPoint: 20000,
                refundRate: 0.08,
                createdBy: 'admin',
                createdAt: '2023-05-15T08:15:00Z',
                updatedBy: 'admin',
                updatedAt: '2023-05-15T08:15:00Z'
            },
            {
                id: 5,
                name: '다이아몬드',
                achievementPoint: 50000,
                refundRate: 0.12,
                createdBy: 'admin',
                createdAt: '2023-05-15T08:20:00Z',
                updatedBy: 'admin',
                updatedAt: '2023-05-15T08:20:00Z'
            }
        ]

        // Sort by achievement point in descending order
        grades.value.sort((a, b) => b.achievementPoint - a.achievementPoint)

    } catch (err: any) {
        error.value = err.message || '등급 정보를 불러오는데 실패했습니다.'
        console.error('Error fetching grades:', err)
    } finally {
        isLoading.value = false
    }
}

// Handle row double click
const handleRowDoubleClick = (grade: Grade) => {
    router.push(`/grade/detail/${grade.id}`)
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
                keyColumn="id"
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

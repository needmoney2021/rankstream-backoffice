<script lang='ts' setup>
import {ref} from 'vue'
import {useSecureFetch} from '@/composable/fetch/use-secure-fetch'
import ResultTable from '@/components/table/ResultTable.vue'
import type {ClosedTransaction} from "@/types/transaction/transaction"
import { ApiError } from '@/types/error/apierror'

const { secureRequest } = useSecureFetch()
const searchType = ref<'all' | 'member'>('all')
const memberId = ref('')
const startMonth = ref('')
const endMonth = ref('')
const closedTransactions = ref<ClosedTransaction[]>([])
const isLoading = ref(false)
const error = ref('')
const columns = [
    {key: 'memberIdx', label: '회원키'},
    {key: 'memberName', label: '회원이름'},
    {key: 'year', label: '년도'},
    {key: 'month', label: '월'},
    {key: 'totalAmount', label: '주문금액'},
    {key: 'totalGradePoint', label: '등급포인트'},
    {key: 'totalBusinessPoint', label: '비즈니스포인트'},
    {key: 'totalValueAddedTax', label: '부가세'}
]

const validateSearch = (): boolean => {
    if (searchType.value === 'all') {
        if (!startMonth.value || !endMonth.value) {
            alert('마감월 범위를 지정해주세요.')
            return false
        }
    } else {
        if (!memberId.value) {
            alert('회원아이디를 입력해주세요.')
            return false
        }
        if (!startMonth.value || !endMonth.value) {
            alert('마감월 범위를 지정해주세요.')
            return false
        }
    }
    return true
}

const handleSearch = async () => {
    if (!validateSearch()) return

    try {
        isLoading.value = true
        error.value = ''

        const params = new URLSearchParams()
        
        // Parse start month (YYYY-MM)
        const [startYear, startMonthValue] = startMonth.value.split('-').map(Number)
        
        // Parse end month (YYYY-MM)
        const [endYear, endMonthValue] = endMonth.value.split('-').map(Number)

        if (searchType.value === 'member') {
            params.append('member-id', memberId.value)
        }
        
        // Add required parameters
        params.append('start-year', startYear.toString())
        params.append('start-month', startMonthValue.toString())
        params.append('end-year', endYear.toString())
        params.append('end-month', endMonthValue.toString())

        const response = await secureRequest(`/transactions/closed?${params.toString()}`, { method: 'GET' })

        if (!response) {
            return
        }

        if (response.ok) {
            closedTransactions.value = await response.json()
        } else {
            const apiError = await response.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '마감 주문 정보를 검색하는데 실패했습니다.'
        console.error('Failed to fetch closed transactions:', err)
    } finally {
        isLoading.value = false
    }
}

// Format currency for display
const formatCurrency = (value: number) => {
    return value.toLocaleString() + '원'
}
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">주문 마감 내역</h1>

        <div class="space-y-4 mb-6">
            <div class="flex items-center space-x-4">
                <div class="flex items-center">
                    <input
                        id="searchTypeAll"
                        v-model="searchType"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        type="radio"
                        value="all"
                    />
                    <label class="ml-2 block text-sm text-gray-900" for="searchTypeAll">전체</label>
                </div>
                <div class="flex items-center">
                    <input
                        id="searchTypeMember"
                        v-model="searchType"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        type="radio"
                        value="member"
                    />
                    <label class="ml-2 block text-sm text-gray-900" for="searchTypeMember">회원별</label>
                </div>
            </div>

            <div v-if="searchType === 'member'" class="grid grid-cols-1 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">회원아이디</label>
                    <input
                        v-model="memberId"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        type="text"
                    />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">마감월 시작</label>
                    <input
                        v-model="startMonth"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        type="month"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">마감월 종료</label>
                    <input
                        v-model="endMonth"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        type="month"
                    />
                </div>
            </div>

            <div>
                <button
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    @click="handleSearch"
                >
                    조회
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-10">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-gray-600">마감 주문 정보를 불러오는 중...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">
            {{ error }}
            <button class="ml-2 underline" @click="handleSearch">다시 시도</button>
        </div>

        <!-- Results -->
        <div v-else>
            <ResultTable
                :columns="columns"
                :data="closedTransactions.map(transaction => ({
                    ...transaction,
                    totalAmount: formatCurrency(transaction.totalAmount),
                    totalValueAddedTax: formatCurrency(transaction.totalValueAddedTax)
                }))"
                key-column="memberIdx"
            />
        </div>
    </div>
</template>

<style scoped>
</style>

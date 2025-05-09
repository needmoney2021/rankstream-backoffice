<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useSearchStore} from '@/store/search/search'
import ResultTable from '@/components/table/ResultTable.vue'
import {Transaction} from '@/types/transaction/transaction'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { ApiError } from '@/types/error/apierror'

const searchStore = useSearchStore()
const transactions = ref<Transaction[]>([])
const isLoading = ref(false)
const error = ref('')

// Search params
const searchParams = ref({
    memberId: '',
    orderId: '',
    orderedFrom: '',
    orderedTo: ''
})

// Define table columns
const columns = [
    {key: 'idx', label: '주문 키', width: '100px'},
    {key: 'memberIdx', label: '회원 키', width: '100px'},
    {key: 'memberName', label: '회원 이름', width: '120px'},
    {key: 'transactionId', label: '거래 아이디', width: '120px'},
    {key: 'amount', label: '주문금액', width: '120px'},
    {key: 'gradePoint', label: '등급 포인트', width: '120px'},
    {key: 'businessPoint', label: '비즈니스 포인트', width: '120px'},
    {key: 'valueAddedTax', label: '부가세', width: '100px'},
    {key: 'orderedAt', label: '주문일시', width: '150px'},
    {key: 'createdAt', label: '등록일시', width: '150px'},
    {key: 'updatedAt', label: '수정일시', width: '150px'}
]

// Method to search transactions
const searchTransactions = async () => {
    try {
        isLoading.value = true
        error.value = ''

        // Save search params to store
        searchStore.saveSearchParams('orderSearch', searchParams.value)

        // Build query parameters
        const queryParams = new URLSearchParams()
        if (searchParams.value.memberId) queryParams.append('member-id', searchParams.value.memberId)
        if (searchParams.value.orderId) queryParams.append('order-id', searchParams.value.orderId)
        if (searchParams.value.orderedFrom) queryParams.append('ordered-from', searchParams.value.orderedFrom)
        if (searchParams.value.orderedTo) queryParams.append('ordered-to', searchParams.value.orderedTo)

        const { secureRequest: searchRequest } = useSecureFetch()
        const searchResponse = await searchRequest(`/transactions?${queryParams}`, { method: 'GET' })

        if (!searchResponse) {
            return
        }

        if (searchResponse.ok) {
            transactions.value = await searchResponse.json()
        } else {
            const apiError = await searchResponse.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '주문 정보를 검색하는데 실패했습니다.'
        console.error('Error searching transactions:', err)
    } finally {
        isLoading.value = false
    }
}

// Format for display
const formatCurrency = (value: number) => {
    return value.toLocaleString() + '원'
}

// Handle clearing table data
const clearTableData = () => {
    transactions.value = []
}

// Set today's date as default order date range (last month)
onMounted(() => {
    const today = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    searchParams.value.orderedTo = today.toISOString().split('T')[0]
    searchParams.value.orderedFrom = oneMonthAgo.toISOString().split('T')[0]

    // Load search params from store
    const cachedParams = searchStore.getSearchParams('orderSearch')
    if (Object.keys(cachedParams).length > 0) {
        searchParams.value = {...cachedParams}
        searchTransactions() // Search with cached params
    }
})
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">주문 조회</h1>
        </div>

        <!-- Search Form -->
        <div class="bg-white p-6 rounded-lg shadow mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700" for="memberId">회원 아이디</label>
                    <input
                        id="memberId"
                        v-model="searchParams.memberId"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="회원 아이디 입력"
                        type="text"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700" for="orderId">주문 아이디</label>
                    <input
                        id="orderId"
                        v-model="searchParams.orderId"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="주문 아이디 입력"
                        type="text"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700" for="orderedFrom">주문일 (시작)</label>
                    <input
                        id="orderedFrom"
                        v-model="searchParams.orderedFrom"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        type="date"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700" for="orderedTo">주문일 (종료)</label>
                    <input
                        id="orderedTo"
                        v-model="searchParams.orderedTo"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        type="date"
                    />
                </div>
            </div>

            <div class="mt-4 flex justify-end">
                <button
                    class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    @click="searchTransactions"
                >
                    조회
                </button>
            </div>
        </div>

        <!-- Search Results -->
        <div v-if="isLoading" class="text-center py-10">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-gray-600">주문 정보를 불러오는 중...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">
            {{ error }}
            <button class="ml-2 underline" @click="searchTransactions">다시 시도</button>
        </div>

        <div v-else-if="transactions.length > 0">
            <ResultTable
                :columns="columns"
                :data="transactions.map(transaction => ({
                    ...transaction,
                    amount: formatCurrency(transaction.amount),
                    orderedAt: new Date(transaction.orderedAt).toLocaleString(),
                    createdAt: new Date(transaction.createdAt).toLocaleString(),
                    updatedAt: new Date(transaction.updatedAt).toLocaleString()
                }))"
                keyColumn="idx"
                @clear-table-data="clearTableData"
            />
        </div>

        <div v-else-if="Object.values(searchParams).some(value => !!value)" class="text-center py-10 text-gray-500">
            검색 결과가 없습니다.
        </div>
    </div>
</template>

<style scoped>
</style>

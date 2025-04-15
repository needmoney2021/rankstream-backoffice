<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useSearchStore} from '@/store/search/search'
import ResultTable from '@/components/table/ResultTable.vue'
import {Order} from '@/types/order/order'

const searchStore = useSearchStore()
const orders = ref<Order[]>([])
const isLoading = ref(false)
const error = ref('')

// Search params
const searchParams = ref({
    memberId: '',
    orderId: '',
    orderDateFrom: '',
    orderDateTo: ''
})

// Define table columns
const columns = [
    {key: 'memberId', label: '회원 아이디', width: '120px'},
    {key: 'memberName', label: '회원 이름', width: '120px'},
    {key: 'orderId', label: '주문 아이디', width: '120px'},
    {key: 'orderDate', label: '주문일시', width: '150px'},
    {key: 'cancelDate', label: '취소일시', width: '150px'},
    {key: 'amount', label: '주문금액', width: '100px'},
    {key: 'gradePoint', label: '등급 포인트', width: '100px'},
    {key: 'businessPoint', label: '비즈니스 포인트', width: '120px'},
    {key: 'status', label: '상태', width: '80px'},
    {key: 'isClosed', label: '마감 여부', width: '80px'}
]

// Method to search orders
const searchOrders = async () => {
    try {
        isLoading.value = true
        error.value = ''

        // Save search params to store
        searchStore.saveSearchParams('orderSearch', searchParams.value)

        // This would be an actual API call in a real implementation
        // const queryParams = new URLSearchParams()
        // if (searchParams.value.memberId) queryParams.append('memberId', searchParams.value.memberId)
        // if (searchParams.value.orderId) queryParams.append('orderId', searchParams.value.orderId)
        // if (searchParams.value.orderDateFrom) queryParams.append('orderDateFrom', searchParams.value.orderDateFrom)
        // if (searchParams.value.orderDateTo) queryParams.append('orderDateTo', searchParams.value.orderDateTo)
        //
        // const response = await fetch(`/api/orders?${queryParams}`)
        // if (!response.ok) throw new Error('Failed to fetch orders')
        // orders.value = await response.json()

        // For now, generate mock data based on search params
        setTimeout(() => {
            // Simple mock filtering based on search params
            const mockOrders: Order[] = [
                {
                    orderId: 'ORD001',
                    memberId: 'member001',
                    memberName: '김철수',
                    orderDate: '2023-06-10T14:30:00Z',
                    amount: 150000,
                    gradePoint: 150,
                    businessPoint: 75,
                    status: 'COMPLETED',
                    isClosed: true
                },
                {
                    orderId: 'ORD002',
                    memberId: 'member002',
                    memberName: '이영희',
                    orderDate: '2023-06-15T10:15:00Z',
                    amount: 210000,
                    gradePoint: 210,
                    businessPoint: 105,
                    status: 'COMPLETED',
                    isClosed: true
                },
                {
                    orderId: 'ORD003',
                    memberId: 'member003',
                    memberName: '박지민',
                    orderDate: '2023-06-20T16:45:00Z',
                    cancelDate: '2023-06-21T09:30:00Z',
                    amount: 85000,
                    gradePoint: 85,
                    businessPoint: 42.5,
                    status: 'CANCELLED',
                    isClosed: false
                },
                {
                    orderId: 'ORD004',
                    memberId: 'member001',
                    memberName: '김철수',
                    orderDate: '2023-07-05T11:20:00Z',
                    amount: 320000,
                    gradePoint: 320,
                    businessPoint: 160,
                    status: 'COMPLETED',
                    isClosed: true
                },
                {
                    orderId: 'ORD005',
                    memberId: 'member004',
                    memberName: '최유나',
                    orderDate: '2023-07-10T13:10:00Z',
                    amount: 175000,
                    gradePoint: 175,
                    businessPoint: 87.5,
                    status: 'COMPLETED',
                    isClosed: false
                }
            ]

            // Filter based on search params
            orders.value = mockOrders.filter(order => {
                const matchesMemberId = !searchParams.value.memberId ||
                    order.memberId.toLowerCase().includes(searchParams.value.memberId.toLowerCase())

                const matchesOrderId = !searchParams.value.orderId ||
                    order.orderId.toLowerCase().includes(searchParams.value.orderId.toLowerCase())

                const orderDate = new Date(order.orderDate)
                const matchesFromDate = !searchParams.value.orderDateFrom ||
                    orderDate >= new Date(searchParams.value.orderDateFrom)

                const matchesToDate = !searchParams.value.orderDateTo ||
                    orderDate <= new Date(searchParams.value.orderDateTo + 'T23:59:59')

                return matchesMemberId && matchesOrderId && matchesFromDate && matchesToDate
            })

            isLoading.value = false
        }, 500)

    } catch (err: any) {
        error.value = err.message || '주문 정보를 검색하는데 실패했습니다.'
        isLoading.value = false
    }
}

// Format for display
const formatCurrency = (value: number) => {
    return value.toLocaleString() + '원'
}

const formatStatus = (status: string) => {
    return status === 'COMPLETED' ? '완료' : '취소'
}

const formatClosed = (isClosed: boolean) => {
    return isClosed ? 'Y' : 'N'
}

// Handle clearing table data
const clearTableData = () => {
    orders.value = []
}

// Set today's date as default order date range (last month)
onMounted(() => {
    const today = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    searchParams.value.orderDateTo = today.toISOString().split('T')[0]
    searchParams.value.orderDateFrom = oneMonthAgo.toISOString().split('T')[0]

    // Load search params from store
    const cachedParams = searchStore.getSearchParams('orderSearch')
    if (Object.keys(cachedParams).length > 0) {
        searchParams.value = {...cachedParams}
        searchOrders() // Search with cached params
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
                    <label class="block text-sm font-medium text-gray-700" for="orderDateFrom">주문일 (시작)</label>
                    <input
                        id="orderDateFrom"
                        v-model="searchParams.orderDateFrom"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        type="date"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700" for="orderDateTo">주문일 (종료)</label>
                    <input
                        id="orderDateTo"
                        v-model="searchParams.orderDateTo"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        type="date"
                    />
                </div>
            </div>

            <div class="mt-4 flex justify-end">
                <button
                    class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    @click="searchOrders"
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
            <button class="ml-2 underline" @click="searchOrders">다시 시도</button>
        </div>

        <div v-else-if="orders.length > 0">
            <ResultTable
                :columns="columns"
                :data="orders.map(order => ({
                    ...order,
                    amount: formatCurrency(order.amount),
                    orderDate: new Date(order.orderDate).toLocaleString(),
                    cancelDate: order.cancelDate ? new Date(order.cancelDate).toLocaleString() : '-',
                    status: formatStatus(order.status),
                    isClosed: formatClosed(order.isClosed)
                }))"
                keyColumn="orderId"
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

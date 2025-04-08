<script setup lang='ts'>
import { ref } from 'vue'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import ResultTable from '@/components/table/ResultTable.vue'
import type { OrderSnapshot } from "@/types/order";

const secureFetch = useSecureFetch()
const searchType = ref<'all' | 'member'>('all')
const memberId = ref('')
const startMonth = ref('')
const endMonth = ref('')
const orderSnapshots = ref<OrderSnapshot[]>([])
const columns = [
  { key: 'memberId', label: '회원아이디' },
  { key: 'memberName', label: '회원이름' },
  { key: 'snapshotMonth', label: '마감월' },
  { key: 'totalAmount', label: '주문금액' },
  { key: 'gradePoint', label: '등급포인트' },
  { key: 'businessPoint', label: '비즈니스포인트' },
  { key: 'createdBy', label: '등록자' },
  { key: 'createdAt', label: '등록일시' }
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
    const params = new URLSearchParams()
    if (searchType.value === 'member') {
      params.append('memberId', memberId.value)
    }
    params.append('startMonth', startMonth.value)
    params.append('endMonth', endMonth.value)

    const response = await secureFetch(`/api/order/snapshot?${params.toString()}`)
    if (response.ok) {
      orderSnapshots.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch order snapshots:', error)
  }
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">주문 마감 내역</h1>

    <div class="space-y-4 mb-6">
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <input
            type="radio"
            id="searchTypeAll"
            v-model="searchType"
            value="all"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <label for="searchTypeAll" class="ml-2 block text-sm text-gray-900">전체</label>
        </div>
        <div class="flex items-center">
          <input
            type="radio"
            id="searchTypeMember"
            v-model="searchType"
            value="member"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <label for="searchTypeMember" class="ml-2 block text-sm text-gray-900">회원별</label>
        </div>
      </div>

      <div v-if="searchType === 'member'" class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">회원아이디</label>
          <input
            v-model="memberId"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">마감월 시작</label>
          <input
            v-model="startMonth"
            type="month"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">마감월 종료</label>
          <input
            v-model="endMonth"
            type="month"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <button
          @click="handleSearch"
          class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          조회
        </button>
      </div>
    </div>

    <ResultTable
      :columns="columns"
      :data="orderSnapshots"
      key-column="memberId"
    />
  </div>
</template>

<style scoped>
</style>

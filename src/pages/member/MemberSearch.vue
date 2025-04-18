<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useSearchStore} from '@/store/search/search'
import ResultTable from '@/components/table/ResultTable.vue'
import {Member, MemberSearchParams} from '@/types/member/member'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { ApiError } from '@/types/error/apierror'
import { useFetchStore } from '@/store/fetch/fetch'

const router = useRouter()
const searchStore = useSearchStore()
const fetchStore = useFetchStore()
const members = ref<Member[]>([])
const error = ref('')

// Search params
const searchParams = ref<MemberSearchParams>({
    memberId: '',
    name: '',
    gender: ''
})

// Define table columns
const columns = [
    {key: 'id', label: '회원 아이디', width: '150px'},
    {key: 'name', label: '이름', width: '150px'},
    {key: 'gender', label: '성별', width: '80px'},
    {key: 'state', label: '상태', width: '100px'},
    {key: 'createdAt', label: '가입일', width: '120px'},
    {key: 'updatedAt', label: '수정일', width: '120px'},
    {key: 'childrenCount', label: '하위 회원 수', width: '130px'},
    {key: 'gradeName', label: '현재 등급', width: '120px'}
]

// Method to search members
const searchMembers = async () => {
    try {
        error.value = ''

        // Save search params to store
        searchStore.saveSearchParams('memberSearch', searchParams.value)

        // Build query string
        const queryParams = new URLSearchParams()
        if (searchParams.value.memberId) queryParams.append('memberId', searchParams.value.memberId)
        if (searchParams.value.name) queryParams.append('name', searchParams.value.name)
        if (searchParams.value.gender) queryParams.append('gender', searchParams.value.gender)

        const { secureRequest: getMembersRequest } = useSecureFetch()
        const response = await getMembersRequest(`/members?${queryParams.toString()}`, { method: 'GET' })
        
        if (!response) {
            return
        }

        if (response.ok) {
            members.value = await response.json() as Member[]
        } else {
            const apiError = await response.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '회원 정보를 검색하는데 실패했습니다.'
    }
}

// Handle row double click
const handleRowDoubleClick = (member: Member) => {
    router.push(`/member/detail/${member.idx}`)
}

// Handle input changes and update search store
const handleInputChange = () => {
    searchStore.saveSearchParams('memberSearch', searchParams.value)
}

// Handle creating a new member
const handleCreateMember = () => {
    router.push('/member/register')
}

// Handle clearing table data
const clearTableData = () => {
    members.value = []
}

// Load search params from store
onMounted(() => {
    const cachedParams = searchStore.getSearchParams('memberSearch')
    if (Object.keys(cachedParams).length > 0) {
        searchParams.value = {...cachedParams}
        searchMembers() // Search with cached params
    }
})
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">회원 조회</h1>
            <button
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                @click="handleCreateMember"
            >
                새 회원 등록
            </button>
        </div>

        <!-- Search Form -->
        <div class="bg-white p-6 rounded-lg shadow mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700" for="memberId">회원 아이디</label>
                    <input
                        id="memberId"
                        v-model="searchParams.memberId"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="회원 아이디 입력"
                        type="text"
                        @change="handleInputChange"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700" for="name">이름</label>
                    <input
                        id="name"
                        v-model="searchParams.name"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="이름 입력"
                        type="text"
                        @change="handleInputChange"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700" for="gender">성별</label>
                    <select
                        id="gender"
                        v-model="searchParams.gender"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        @change="handleInputChange"
                    >
                        <option value="">전체</option>
                        <option value="MALE">남성</option>
                        <option value="FEMALE">여성</option>
                    </select>
                </div>
            </div>

            <div class="mt-4 flex justify-end">
                <button
                    class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="searchMembers"
                    :disabled="fetchStore.isFetching"
                >
                    <span v-if="fetchStore.isFetching" class="inline-flex items-center">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        조회 중...
                    </span>
                    <span v-else>조회</span>
                </button>
            </div>
        </div>

        <!-- Search Results -->
        <div v-if="fetchStore.isFetching" class="text-center py-10">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-gray-600">회원 정보를 불러오는 중...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">
            {{ error }}
            <button class="ml-2 underline" @click="searchMembers">다시 시도</button>
        </div>

        <div v-else-if="members.length > 0">
            <ResultTable
                :columns="columns"
                :data="members"
                keyColumn="id"
                @row-dblclick="handleRowDoubleClick"
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

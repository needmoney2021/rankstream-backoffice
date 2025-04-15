<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useSearchStore} from '@/store/search/search'
import ResultTable from '@/components/table/ResultTable.vue'
import {Member, MemberSearchParams} from '@/types/member/member'

const router = useRouter()
const searchStore = useSearchStore()
const members = ref<Member[]>([])
const isLoading = ref(false)
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
    {key: 'status', label: '상태', width: '100px'},
    {key: 'joinDate', label: '가입일', width: '120px'},
    {key: 'withdrawDate', label: '탈퇴일', width: '120px'},
    {key: 'childrenCount', label: '하위 회원 수', width: '130px'},
    {key: 'currentGrade', label: '현재 등급', width: '120px'}
]

// Method to search members
const searchMembers = async () => {
    try {
        isLoading.value = true
        error.value = ''

        // Save search params to store
        searchStore.saveSearchParams('memberSearch', searchParams.value)

        // This would be an actual API call in a real implementation
        // const queryParams = new URLSearchParams()
        // if (searchParams.value.memberId) queryParams.append('memberId', searchParams.value.memberId)
        // if (searchParams.value.name) queryParams.append('name', searchParams.value.name)
        // if (searchParams.value.gender) queryParams.append('gender', searchParams.value.gender)
        //
        // const response = await fetch(`/api/members?${queryParams}`)
        // if (!response.ok) throw new Error('Failed to fetch members')
        // members.value = await response.json()

        // For now, generate mock data based on search params
        setTimeout(() => {
            // Simple mock filtering based on search params
            const mockMembers: Member[] = [
                {
                    id: 'member000001',
                    name: '김철수',
                    gender: 'M',
                    status: 'ACTIVE',
                    joinDate: '2023-01-15',
                    childrenCount: 5,
                    currentGrade: '골드'
                },
                {
                    id: 'member000002',
                    name: '이영희',
                    gender: 'F',
                    status: 'ACTIVE',
                    joinDate: '2023-02-20',
                    childrenCount: 3,
                    currentGrade: '실버'
                },
                {
                    id: 'member000003',
                    name: '박지민',
                    gender: 'M',
                    status: 'INACTIVE',
                    joinDate: '2023-03-05',
                    childrenCount: 0,
                    currentGrade: '브론즈'
                },
                {
                    id: 'member000004',
                    name: '최유나',
                    gender: 'F',
                    status: 'ACTIVE',
                    joinDate: '2023-04-10',
                    childrenCount: 7,
                    currentGrade: '플래티넘'
                },
                {
                    id: 'member000005',
                    name: '정민수',
                    gender: 'M',
                    status: 'WITHDRAW',
                    joinDate: '2023-05-15',
                    withdrawDate: '2023-08-20',
                    childrenCount: 2,
                    currentGrade: '실버'
                }
            ]

            // Filter based on search params
            members.value = mockMembers.filter(member => {
                const matchesId = !searchParams.value.memberId ||
                    member.id.toLowerCase().includes(searchParams.value.memberId.toLowerCase())

                const matchesName = !searchParams.value.name ||
                    member.name.includes(searchParams.value.name)

                const matchesGender = !searchParams.value.gender ||
                    member.gender === searchParams.value.gender

                return matchesId && matchesName && matchesGender
            })

            isLoading.value = false
        }, 500)

    } catch (err: any) {
        error.value = err.message || '회원 정보를 검색하는데 실패했습니다.'
        isLoading.value = false
    }
}

// Handle row double click
const handleRowDoubleClick = (member: Member) => {
    router.push(`/member/detail/${member.id}`)
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
                        <option value="M">남성</option>
                        <option value="F">여성</option>
                    </select>
                </div>
            </div>

            <div class="mt-4 flex justify-end">
                <button
                    class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    @click="searchMembers"
                >
                    조회
                </button>
            </div>
        </div>

        <!-- Search Results -->
        <div v-if="isLoading" class="text-center py-10">
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

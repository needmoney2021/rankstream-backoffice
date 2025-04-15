<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'
import {useSecureFetch} from '@/composable/fetch/use-secure-fetch'

interface Schedule {
    day: number
    hour: number
    minute: number
    createdBy: string
    createdAt: string
    updatedBy: string
    updatedAt: string
}

const route = useRoute()
const secureFetch = useSecureFetch()
const schedule = ref<Schedule | null>(null)
const showConfirmModal = ref(false)

const fetchSchedule = async () => {
    try {
        const response = await secureFetch('/api/schedule')
        if (response.ok) {
            schedule.value = await response.json()
        }
    } catch (error) {
        console.error('Failed to fetch schedule:', error)
    }
}

const handleDeactivate = () => {
    showConfirmModal.value = true
}

const handleConfirm = async (confirmed: boolean) => {
    showConfirmModal.value = false
    if (confirmed) {
        try {
            const response = await secureFetch('/api/schedule/deactivate', {
                method: 'POST'
            })
            if (response.ok) {
                await fetchSchedule()
            }
        } catch (error) {
            console.error('Failed to deactivate schedule:', error)
        }
    }
}

onMounted(() => {
    fetchSchedule()
})
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">스케줄 상세</h1>

        <div v-if="schedule" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">스케줄 수행 일</label>
                    <input
                        v-model="schedule.day"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        readonly
                        type="number"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">스케줄 수행 시</label>
                    <input
                        v-model="schedule.hour"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        readonly
                        type="number"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">스케줄 수행 분</label>
                    <input
                        v-model="schedule.minute"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        readonly
                        type="number"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">등록자</label>
                    <input
                        v-model="schedule.createdBy"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        readonly
                        type="text"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">등록일시</label>
                    <input
                        v-model="schedule.createdAt"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        readonly
                        type="text"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">수정자</label>
                    <input
                        v-model="schedule.updatedBy"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        readonly
                        type="text"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">수정일시</label>
                    <input
                        v-model="schedule.updatedAt"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        readonly
                        type="text"
                    />
                </div>
            </div>

            <div class="mt-6">
                <button
                    class="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    @click="handleDeactivate"
                >
                    비활성화
                </button>
            </div>
        </div>

        <div v-else class="text-center py-4">
            <p class="text-gray-500">스케줄 정보를 불러오는 중입니다...</p>
        </div>

        <ModalConfirm
            v-if="showConfirmModal"
            message="일정을 비활성화하시겠습니까? 비활성화되면 복구할 수 없으며 새로 등록하셔야 합니다."
            @close="handleConfirm"
        />
    </div>
</template>

<style scoped>
</style>

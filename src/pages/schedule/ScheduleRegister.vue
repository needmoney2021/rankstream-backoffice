<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'

interface ScheduleForm {
  day: number
  hour: number
  minute: number
}

const router = useRouter()
const secureFetch = useSecureFetch()
const showConfirmModal = ref(false)
const form = ref<ScheduleForm>({
  day: 1,
  hour: 0,
  minute: 0
})

const handleSubmit = () => {
  showConfirmModal.value = true
}

const handleConfirm = async (confirmed: boolean) => {
  showConfirmModal.value = false
  if (confirmed) {
    try {
      const response = await secureFetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form.value)
      })
      if (response.ok) {
        router.push('/schedule/detail')
      }
    } catch (error) {
      console.error('Failed to register schedule:', error)
    }
  }
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">스케줄 등록</h1>
    
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">스케줄 수행 일</label>
          <input 
            v-model.number="form.day" 
            type="number" 
            min="1"
            max="31"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">스케줄 수행 시</label>
          <input 
            v-model.number="form.hour" 
            type="number" 
            min="0"
            max="23"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">스케줄 수행 분</label>
          <input 
            v-model.number="form.minute" 
            type="number" 
            min="0"
            max="59"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div class="mt-6">
        <button 
          @click="handleSubmit"
          class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          저장
        </button>
      </div>
    </div>

    <ModalConfirm
      v-if="showConfirmModal"
      message="일정을 등록하시겠습니까?"
      @close="handleConfirm"
    />
  </div>
</template>

<style scoped>
</style> 
<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'

const router = useRouter()

// Form fields
const gradeName = ref('')
const achievementPoint = ref(0)
const refundRate = ref(0)

// UI state
const error = ref('')
const showConfirmModal = ref(false)

// Validate form
const validateForm = () => {
    if (!gradeName.value.trim()) {
        error.value = '등급 이름을 입력해주세요.'
        return false
    }
    
    if (achievementPoint.value <= 0) {
        error.value = '등급 달성 포인트는 0보다 커야 합니다.'
        return false
    }
    
    if (refundRate.value < 0 || refundRate.value > 1) {
        error.value = '환급률은 0에서 1 사이의 값이어야 합니다.'
        return false
    }
    
    return true
}

// Open confirmation modal
const openConfirmModal = () => {
    error.value = ''
    
    if (validateForm()) {
        showConfirmModal.value = true
    }
}

// Handle confirm modal close
const handleConfirmClose = (confirmed: boolean) => {
    showConfirmModal.value = false
    
    if (confirmed) {
        saveGrade()
    }
}

// Save new grade
const saveGrade = async () => {
    try {
        // This would be an actual API call in a real implementation
        // const response = await fetch('/api/grades', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         name: gradeName.value,
        //         achievementPoint: achievementPoint.value,
        //         refundRate: refundRate.value
        //     })
        // })
        // if (!response.ok) throw new Error('Failed to create grade')
        
        // For mock purposes, we'll simulate a successful creation
        console.debug('Creating grade:', {
            name: gradeName.value,
            achievementPoint: achievementPoint.value,
            refundRate: refundRate.value
        })
        
        // Show success message
        alert('새로운 등급이 성공적으로 생성되었습니다.')
        
        // Redirect back to grades list
        router.push('/grade')
        
    } catch (err: any) {
        error.value = err.message || '등급을 생성하는데 실패했습니다.'
    }
}

// Go back to grades list
const goBack = () => {
    router.push('/grade')
}
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">새 등급 등록</h1>
            <button 
                @click="goBack" 
                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
                목록으로
            </button>
        </div>
        
        <div v-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">
            {{ error }}
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
            <div class="space-y-6">
                <div>
                    <label for="gradeName" class="block text-sm font-medium text-gray-700">등급 이름</label>
                    <input 
                        id="gradeName"
                        v-model="gradeName" 
                        type="text"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="예: 골드"
                    />
                </div>
                
                <div>
                    <label for="achievementPoint" class="block text-sm font-medium text-gray-700">등급 달성 포인트</label>
                    <input 
                        id="achievementPoint"
                        v-model.number="achievementPoint" 
                        type="number" 
                        min="0"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="10000"
                    />
                </div>
                
                <div>
                    <label for="refundRate" class="block text-sm font-medium text-gray-700">환급률</label>
                    <input 
                        id="refundRate"
                        v-model.number="refundRate" 
                        type="number"
                        step="0.01"
                        min="0"
                        max="1" 
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0.05"
                    />
                    <p class="mt-1 text-xs text-gray-500">0부터 1 사이의 값을 입력하세요 (예: 0.05 = 5%)</p>
                </div>
            </div>
            
            <div class="mt-6">
                <button 
                    @click="openConfirmModal"
                    class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    저장
                </button>
            </div>
        </div>
        
        <!-- Confirmation Modal -->
        <ModalConfirm 
            v-if="showConfirmModal" 
            message="작성하신 내용을 저장하시겠습니까?"
            @close="handleConfirmClose"
        />
    </div>
</template>

<style scoped>
</style> 
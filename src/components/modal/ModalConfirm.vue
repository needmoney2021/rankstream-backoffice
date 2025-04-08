<script setup lang='ts'>
defineProps<{
    message: string
}>()

const emit = defineEmits<{
    (e: 'close', confirmed: boolean): void
}>()

const confirmAction = () => {
    emit('close', true)
}

const cancelAction = () => {
    emit('close', false)
}
</script>

<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div class="mb-4 text-lg">{{ message }}</div>
            <div class="flex justify-end space-x-2">
                <button 
                    @click="confirmAction"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    확인
                </button>
                <button 
                    @click="cancelAction"
                    class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                    닫기
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style> 
<script lang="ts" setup>
import {ref, watch} from 'vue'

const props = defineProps<{
    message: string
}>()

const emit = defineEmits<{
    close: [result: boolean]
}>()

const isOpen = ref(true)

// Close the modal with a result (confirmed or cancelled)
const closeModal = (confirmed: boolean) => {
    isOpen.value = false
    emit('close', confirmed)
}

// Handle escape key to close modal
const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        closeModal(false)
    }
}

// Add and remove event listeners
watch(isOpen, (newValue) => {
    if (newValue) {
        document.addEventListener('keydown', handleKeyDown)
    } else {
        document.removeEventListener('keydown', handleKeyDown)
    }
})
</script>

<template>
    <div v-if="isOpen" aria-labelledby="modal-title" aria-modal="true" class="fixed inset-0 z-50 overflow-y-auto"
         role="dialog">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <!-- Background overlay -->
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal(false)"></div>

            <!-- Modal panel -->
            <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div
                            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                            <svg aria-hidden="true" class="h-6 w-6 text-yellow-600" fill="none"
                                 stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-linecap="round" stroke-linejoin="round"
                                      stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 id="modal-title" class="text-lg leading-6 font-medium text-gray-900">
                                확인
                            </h3>
                            <div class="mt-2">
                                <p class="text-sm text-gray-500">
                                    {{ message }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                        type="button"
                        @click="closeModal(true)"
                    >
                        확인
                    </button>
                    <button
                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        type="button"
                        @click="closeModal(false)"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>

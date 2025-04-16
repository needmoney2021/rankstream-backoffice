<script lang='ts' setup>
import {ref} from 'vue'
import ModalConfirm from '@/components/modal/ModalConfirm.vue'

const treeType = ref('binary')  // 'binary' or 'non-binary'
const showConfirmModal = ref(false)
const showSecondConfirmModal = ref(false)
const confirmMessage = ref('')

const openConfirmModal = () => {
    confirmMessage.value = '보상 플랜 변경 시 회원 및 주문 데이터가 삭제되고 다시 동기화하여야 합니다. 정말 진행하시겠습니까?'
    showConfirmModal.value = true
}

const handleConfirmClose = (confirmed: boolean) => {
    showConfirmModal.value = false

    if (confirmed) {
        // Show second confirmation
        confirmMessage.value = '재차 확인합니다. 정말 진행하시겠습니까? 모든 데이터가 삭제됩니다.'
        showSecondConfirmModal.value = true
    }
}

const handleSecondConfirmClose = (confirmed: boolean) => {
    showSecondConfirmModal.value = false

    if (confirmed) {
        // Proceed with the change
        saveTreeType()
    }
}

const saveTreeType = () => {
    // This would be an API call to save the tree type
    // For now, we'll just log it
    console.debug('Saving tree type:', treeType.value)

    // Here you would make the API call to save the tree type
    // const response = await fetch('/api/sponsorship/tree-type', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ treeType: treeType.value })
    // })

    // For the demo, we'll simulate a successful save
    alert('보상 플랜이 성공적으로 변경되었습니다.')
}
</script>

<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-6">보상 플랜 설정</h1>

        <div class="bg-white p-6 rounded-lg shadow">
            <div class="mb-4">
                <h2 class="text-lg font-semibold mb-2">플랜 선택</h2>
                <p class="text-sm text-gray-600 mb-4">회사의 보상 플랜을 설정합니다. 이 설정은 회원 구조와 밀접한 관계가 있습니다.</p>

                <div class="space-y-2">
                    <div class="flex items-center">
                        <input
                            id="binary"
                            v-model="treeType"
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                            type="radio"
                            value="binary"
                        >
                        <label class="ml-2 block text-sm text-gray-700" for="binary">
                            이진트리 (한 회원은 아래에 두 명의 후원자를 둘 수 있습니다)
                        </label>
                    </div>
                    <div class="flex items-center">
                        <input
                            id="non-binary"
                            v-model="treeType"
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                            type="radio"
                            value="non-binary"
                        >
                        <label class="ml-2 block text-sm text-gray-700" for="non-binary">
                            비이진트리 (한 회원은 아래에 제한없이 후원자를 둘 수 있습니다)
                        </label>
                    </div>
                </div>
            </div>

            <div class="mt-6">
                <button
                    class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    @click="openConfirmModal"
                >
                    저장
                </button>
            </div>
        </div>

        <!-- First Confirmation Modal -->
        <ModalConfirm
            v-if="showConfirmModal"
            :message="confirmMessage"
            @close="handleConfirmClose"
        />

        <!-- Second Confirmation Modal -->
        <ModalConfirm
            v-if="showSecondConfirmModal"
            :message="confirmMessage"
            @close="handleSecondConfirmClose"
        />
    </div>
</template>

<style scoped>
</style>

<script setup lang='ts'>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isOpen = ref(false)
const isMobile = ref(false)

const menuItems = [
  { path: '/', label: '대시보드' },
  { path: '/sponsorship', label: '후원 방식' },
  { path: '/grade/search', label: '등급 관리' },
  { path: '/member/search', label: '회원 관리' },
  { path: '/order/search', label: '주문 관리' },
  { path: '/order/snapshot', label: '주문 마감 내역' },
  { path: '/schedule/detail', label: '스케줄 관리' }
]

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    isOpen.value = true
  } else {
    isOpen.value = false
  }
}

const navigate = (path: string) => {
  router.push(path)
  if (isMobile.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div>
    <!-- Toggle Button -->
    <button
      @click="toggleMenu"
      class="fixed top-4 left-4 z-50 p-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <svg
        class="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          v-if="isOpen"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
        <path
          v-else
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- Menu Overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      @click="toggleMenu"
    ></div>

    <!-- Menu Content -->
    <div
      :class="[
        'fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="h-16 flex items-center justify-center border-b">
        <h1 class="text-xl font-bold text-gray-800">RankStream</h1>
      </div>

      <nav class="p-4">
        <ul class="space-y-2">
          <li v-for="item in menuItems" :key="item.path">
            <button
              @click="navigate(item.path)"
              class="w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
            >
              {{ item.label }}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 768px) {
  .fixed {
    position: fixed;
  }
}
</style> 
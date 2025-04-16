<script lang='ts' setup>
import {RouterView} from 'vue-router'
import LeftMenu from '@/components/nav/LeftMenu.vue'
import {useAuthStore} from "@/store/auth/auth";
import {computed} from "vue";

const authStore = useAuthStore()
const isAuth = computed(() => {
    return authStore.isAuthenticated()
})
</script>

<template>
    <div class="min-h-screen bg-gray-100">
        <LeftMenu v-if="isAuth"/>

        <main
            class="transition-all duration-300"
            :class="{ 'md:ml-64': isAuth, 'mx-auto': !isAuth }"
            :style="!isAuth ? 'max-width: 1200px;' : ''"
        >
            <RouterView/>
        </main>
    </div>
</template>

<style scoped>
</style>

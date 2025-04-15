<script lang='ts' setup>
import {RouterView} from 'vue-router'
import LeftMenu from '@/components/nav/LeftMenu.vue'
</script>

<template>
    <div class="min-h-screen bg-gray-100">
        <LeftMenu/>

        <!-- Main Content -->
        <main class="md:ml-64 transition-all duration-300">
            <RouterView/>
        </main>
    </div>
</template>

<style scoped>
</style>

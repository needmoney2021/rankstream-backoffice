<script lang='ts' setup>
import {useExcelGenerator} from '@/utils/parser/excel-generator'
import {computed} from 'vue'

interface Column {
    key: string
    label: string
    width?: string
}

interface Props {
    columns: Column[]
    keyColumn: string
    data?: any[]
}

const props = defineProps<Props>()
const emit = defineEmits(['clear-table-data', 'row-dblclick'])

const excelGenerator = useExcelGenerator()

const hasData = computed(() => {
    return props.data && props.data.length > 0
})

const handleRightClick = (event: MouseEvent) => {
    event.preventDefault()
    if (hasData.value) {
        exportToExcel()
    }
}

const exportToExcel = () => {
    if (props.data && props.columns) {
        excelGenerator.generateExcel(props.data, props.columns)
    }
}

const clearData = () => {
    emit('clear-table-data')
}
</script>

<template>
    <div class="overflow-x-auto">
        <div class="flex justify-end mb-2">
            <button
                :disabled="!hasData"
                class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="exportToExcel"
            >
                Export to Excel
            </button>
            <button
                :disabled="!hasData"
                class="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="clearData"
            >
                Clear
            </button>
        </div>

        <div class="border rounded" @contextmenu="handleRightClick">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                <tr>
                    <th
                        v-for="column in columns"
                        :key="column.key"
                        :style="{ width: column.width }"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                        {{ column.label }}
                    </th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="!hasData">
                    <td :colspan="columns.length" class="text-center py-4 text-gray-500">
                        No data available
                    </td>
                </tr>
                <tr
                    v-for="item in data"
                    v-else
                    :key="item[keyColumn]"
                    class="hover:bg-gray-100 cursor-pointer"
                    @dblclick="$emit('row-dblclick', item)"
                >
                    <td
                        v-for="column in columns"
                        :key="column.key"
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                        {{ item[column.key] }}
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
</style>

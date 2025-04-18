<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {Chart, registerables} from 'chart.js'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { ApiError } from '@/types/error/apierror'
import { MemberStatistics } from '@/types/dashboard/dashboard'
import { useFetchStore } from '@/store/fetch/fetch'

// Register Chart.js components
Chart.register(...registerables)

const fetchStore = useFetchStore()
const error = ref('')

// Example data for member statistics
const memberChartData = ref({
    labels: Array.from({length: 30}, (_, i) => `${i + 1}일`),
    datasets: [
        {
            label: '전체',
            data: Array.from({length: 30}, () => 0),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
        },
        {
            label: '남성',
            data: Array.from({length: 30}, () => 0),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
        },
        {
            label: '여성',
            data: Array.from({length: 30}, () => 0),
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.4,
        }
    ]
})

// Example data for quarterly order performance
const orderChartData = ref({
    labels: ['1분기', '2분기', '3분기'],
    datasets: [
        {
            label: '분기별 주문 실적',
            data: [21500000, 23700000, 18300000],
            borderColor: 'rgb(6, 182, 212)',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.4,
        }
    ]
})

const fetchMemberStatistics = async () => {
    try {
        const { secureRequest: getMemberStatisticsRequest } = useSecureFetch()
        const response = await getMemberStatisticsRequest('/dashboard/member-statistics', { method: 'GET' })
        
        if (!response) {
            return
        }

        if (response.ok) {
            const statistics = await response.json() as MemberStatistics[]
            
            // Update chart data
            memberChartData.value.labels = statistics.map(stat => stat.issuedOn)
            memberChartData.value.datasets[0].data = statistics.map(stat => stat.total)
            memberChartData.value.datasets[1].data = statistics.map(stat => stat.male)
            memberChartData.value.datasets[2].data = statistics.map(stat => stat.female)
        } else {
            const apiError = await response.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '회원 통계를 불러오는데 실패했습니다.'
    }
}

onMounted(async () => {
    // Initialize member statistics chart
    const initMemberChart = async () => {
        try {
            await fetchMemberStatistics()
            const memberCtx = document.getElementById('memberChart') as HTMLCanvasElement
            if (memberCtx) {
                new Chart(memberCtx, {
                    type: 'line',
                    data: memberChartData.value,
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                                onClick: function (e, legendItem, legend) {
                                    const index = legendItem.datasetIndex
                                    const ci = legend.chart
                                    if (ci.isDatasetVisible(index)) {
                                        ci.hide(index)
                                        legendItem.hidden = true
                                    } else {
                                        ci.show(index)
                                        legendItem.hidden = false
                                    }
                                }
                            },
                            title: {
                                display: true,
                                text: '최근 30일 회원 수 통계'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                title: {
                                    display: true,
                                    text: '회원 수'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: '일자'
                                }
                            }
                        }
                    }
                })
            }
        } catch (err) {
            console.error('Failed to initialize member chart:', err)
        }
    }

    // Initialize order performance chart
    const initOrderChart = async () => {
        try {
            const orderCtx = document.getElementById('orderChart') as HTMLCanvasElement
            if (orderCtx) {
                new Chart(orderCtx, {
                    type: 'line',
                    data: orderChartData.value,
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top'
                            },
                            title: {
                                display: true,
                                text: '분기별 마감된 주문 실적'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                title: {
                                    display: true,
                                    text: '실적 금액(원)'
                                },
                                ticks: {
                                    callback: function (value) {
                                        return value.toLocaleString() + '원'
                                    }
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: '분기'
                                }
                            }
                        }
                    }
                })
            }
        } catch (err) {
            console.error('Failed to initialize order chart:', err)
        }
    }

    // Run both initializations in parallel
    await Promise.allSettled([
        initMemberChart(),
        initOrderChart()
    ])
})
</script>

<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-6">대시보드</h1>

        <div v-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">
            {{ error }}
            <button class="ml-2 underline" @click="fetchMemberStatistics">다시 시도</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Member Statistics Chart -->
            <div class="bg-white p-4 rounded-lg shadow h-[440px]">
                <canvas id="memberChart"></canvas>
            </div>

            <!-- Order Performance Chart -->
            <div class="bg-white p-4 rounded-lg shadow h-[440px]">
                <canvas id="orderChart"></canvas>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>

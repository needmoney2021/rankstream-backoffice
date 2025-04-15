<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {Chart, registerables} from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

// Example data for member statistics
const memberChartData = ref({
    labels: Array.from({length: 30}, (_, i) => `${i + 1}일`),
    datasets: [
        {
            label: '전체',
            data: Array.from({length: 30}, () => Math.floor(Math.random() * 100 + 200)),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
        },
        {
            label: '남성',
            data: Array.from({length: 30}, () => Math.floor(Math.random() * 60 + 100)),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
        },
        {
            label: '여성',
            data: Array.from({length: 30}, () => Math.floor(Math.random() * 50 + 80)),
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

onMounted(() => {
    // Create member statistics chart
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

    // Create quarterly order performance chart
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
})
</script>

<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-6">대시보드</h1>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Member Statistics Chart -->
            <div class="bg-white p-4 rounded-lg shadow">
                <canvas id="memberChart"></canvas>
            </div>

            <!-- Order Performance Chart -->
            <div class="bg-white p-4 rounded-lg shadow">
                <canvas id="orderChart"></canvas>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>

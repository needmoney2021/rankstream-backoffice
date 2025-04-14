<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Link, Node } from '@/types/graph-types'

const route = useRoute()
const router = useRouter()
const memberId = route.params.id as string
const isLoading = ref(true)
const error = ref('')

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)

const treeData = ref<{ nodes: Node[]; links: Link[] }>({ nodes: [], links: [] })

const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartOffsetX = ref(0)
const dragStartOffsetY = ref(0)

let layoutWorker: Worker | null = null

const fetchTreeData = async () => {
    isLoading.value = true
    error.value = ''

    setTimeout(() => {
        if (memberId === 'member001') {
            const nodes: Node[] = []
            const links: Link[] = []
            const names = ['김','이','박','정','최','강','윤','한','송','임','신','권','황','안','양','배','조','유','서','홍']

            for (let i = 1; i <= Math.pow(2, 5) - 1; i++) {
                const randomName = names[Math.floor(Math.random() * names.length)] + Math.random().toString(36).substring(2, 5)
                const randomSalesLevel = Math.floor(Math.random() * 11)
                nodes.push({
                    id: `member${i.toString().padStart(6, '0')}`,
                    name: randomName,
                    x: 0,
                    y: 0,
                    radius: 20,
                    isDragging: false,
                    salesLevel: randomSalesLevel
                })

                if (i > 1) {
                    const parentIndex = Math.floor(i / 2)
                    links.push({
                        source: `member${parentIndex.toString().padStart(6, '0')}`,
                        target: `member${i.toString().padStart(6, '0')}`
                    })
                }
            }

            treeData.value = { nodes, links }
        }

        startLayoutWorker()
    }, 500)
}

const startLayoutWorker = () => {
    layoutWorker = new Worker(new URL('@/utils/worker/layout-worker.ts', import.meta.url), { type: 'module' })

    const container = canvasRef.value?.parentElement
    const width = container?.clientWidth ?? 800
    const height = container?.clientHeight ?? 600

    layoutWorker.postMessage({
        nodes: treeData.value.nodes.map(n => ({ ...n })),
        links: treeData.value.links.map(l => ({ source: l.source, target: l.target })),
        width,
        height
    })

    layoutWorker.onmessage = (event: MessageEvent) => {
        treeData.value.nodes = event.data as Node[]
        isLoading.value = false
        draw()
    }
}

const getNodeColor = (node: Node): string => {
    if (node.salesLevel >= 10) return '#e63946'
    if (node.salesLevel >= 7) return '#f1c40f'
    if (node.salesLevel >= 4) return '#3498db'
    return '#6c757d'
}

const draw = () => {
    if (!canvasRef.value || !ctx.value) return
    const canvas = canvasRef.value
    ctx.value.clearRect(0, 0, canvas.width, canvas.height)

    ctx.value.save()
    ctx.value.translate(offsetX.value, offsetY.value)
    ctx.value.scale(scale.value, scale.value)

    ctx.value.beginPath()
    ctx.value.strokeStyle = '#999'
    ctx.value.lineWidth = 1.5

    treeData.value.links.forEach(link => {
        const source = treeData.value.nodes.find(n => n.id === link.source)
        const target = treeData.value.nodes.find(n => n.id === link.target)
        if (source && target) {
            ctx.value!.moveTo(source.x, source.y)
            ctx.value!.lineTo(target.x, target.y)
        }
    })
    ctx.value.stroke()

    treeData.value.nodes.forEach(node => {
        ctx.value!.beginPath()
        ctx.value!.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.value!.fillStyle = getNodeColor(node)
        ctx.value!.fill()
        ctx.value!.strokeStyle = '#fff'
        ctx.value!.lineWidth = 1.5
        ctx.value!.stroke()

        ctx.value!.fillStyle = '#333'
        ctx.value!.font = '10px Arial'
        ctx.value!.textAlign = 'center'
        ctx.value!.fillText(node.name, node.x, node.y + 30)
    })

    ctx.value.restore()
}

const handleMouseDown = (e: MouseEvent) => {
    if (!canvasRef.value) return
    dragStartX.value = e.clientX
    dragStartY.value = e.clientY
    dragStartOffsetX.value = offsetX.value
    dragStartOffsetY.value = offsetY.value
    isDragging.value = true
}

const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return
    offsetX.value = dragStartOffsetX.value + (e.clientX - dragStartX.value)
    offsetY.value = dragStartOffsetY.value + (e.clientY - dragStartY.value)
    draw()
}

const handleMouseUp = () => {
    isDragging.value = false
}

const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY
    const zoomFactor = 0.001

    const oldScale = scale.value
    scale.value = Math.max(0.1, Math.min(4, scale.value - delta * zoomFactor))

    if (canvasRef.value) {
        const rect = canvasRef.value.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        offsetX.value = mouseX - (mouseX - offsetX.value) * (scale.value / oldScale)
        offsetY.value = mouseY - (mouseY - offsetY.value) * (scale.value / oldScale)
    }

    draw()
}

const handleResize = () => {
    if (canvasRef.value && ctx.value) {
        const container = canvasRef.value.parentElement!
        const dpr = window.devicePixelRatio || 1

        canvasRef.value.width = container.clientWidth * dpr
        canvasRef.value.height = container.clientHeight * dpr
        canvasRef.value.style.width = `${container.clientWidth}px`
        canvasRef.value.style.height = `${container.clientHeight}px`

        ctx.value.scale(dpr, dpr)
        draw()
    }
}

const goBack = () => router.push(`/member/detail/${memberId}`)

onMounted(async () => {
    await nextTick()
    if (canvasRef.value) {
        ctx.value = canvasRef.value.getContext('2d')
        handleResize()

        canvasRef.value.addEventListener('mousedown', handleMouseDown)
        canvasRef.value.addEventListener('mousemove', handleMouseMove)
        canvasRef.value.addEventListener('mouseup', handleMouseUp)
        canvasRef.value.addEventListener('wheel', handleWheel)
    }
    fetchTreeData()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (canvasRef.value) {
        canvasRef.value.removeEventListener('mousedown', handleMouseDown)
        canvasRef.value.removeEventListener('mousemove', handleMouseMove)
        canvasRef.value.removeEventListener('mouseup', handleMouseUp)
        canvasRef.value.removeEventListener('wheel', handleWheel)
    }
    if (layoutWorker) layoutWorker.terminate()
})
</script>



<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">회원 트리</h1>
            <button @click="goBack" class="bg-gray-600 text-white rounded px-4 py-2 hover:bg-gray-700">
                회원 상세로
            </button>
        </div>

        <div class="bg-white rounded-lg shadow p-4">
            <p class="text-sm text-gray-500 mb-2">마우스로 드래그/휠 줌 가능합니다.</p>
            <div class="border rounded overflow-hidden w-full" style="height: 600px;">
                <canvas ref="canvasRef" class="w-full h-full" />
            </div>
        </div>
    </div>
</template>

<style scoped></style>

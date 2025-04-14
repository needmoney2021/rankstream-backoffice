<script lang="ts" setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Node, Link } from '@/types/graph-types'
import { WebGLTreeRenderer } from '@/utils/renderer/WebGLTreeRenderer'

const route = useRoute()
const router = useRouter()
const memberId = route.params.id as string
const isLoading = ref(true)
const error = ref('')

const canvasRef = ref<HTMLCanvasElement | null>(null)
const minimapRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const minimapCtx = ref<CanvasRenderingContext2D | null>(null)
const renderer = ref<WebGLTreeRenderer | null>(null)

const treeData = ref<{ nodes: Node[]; links: Link[] }>({ nodes: [], links: [] })
const treeDataRaw = ref<{ nodes: Node[]; links: Link[] }>({ nodes: [], links: [] })

const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartOffsetX = ref(0)
const dragStartOffsetY = ref(0)
const hasCentered = ref(false)

let layoutWorker: Worker | null = null

function drawMinimap() {
    if (!minimapRef.value || !minimapCtx.value || treeData.value.nodes.length === 0) return

    const canvas = minimapRef.value
    const ctx = minimapCtx.value
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const xs = treeData.value.nodes.map(n => n.x)
    const ys = treeData.value.nodes.map(n => n.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    const dataWidth = maxX - minX
    const dataHeight = maxY - minY

    const padding = 20
    const zoomFactor = Math.max(1, scale.value * 1.5) //
    const scaleX = (canvas.width - padding * 2) / dataWidth
    const scaleY = (canvas.height - padding * 2) / dataHeight
    const miniScale = Math.min(scaleX, scaleY) * zoomFactor

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(miniScale, miniScale)
    ctx.translate(-centerX, -centerY)

    ctx.beginPath()
    ctx.strokeStyle = '#ccc'
    ctx.lineWidth = 1 / miniScale
    treeData.value.links.forEach(link => {
        const source = treeData.value.nodes.find(n => n.id === link.source)
        const target = treeData.value.nodes.find(n => n.id === link.target)
        if (!source || !target) return
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
    })
    ctx.stroke()

    const nodeRadius = Math.max(0.5, 2 / miniScale) // ✅ 노드 수 많으면 더 작게
    treeData.value.nodes.forEach(node => {
        ctx.beginPath()
        ctx.fillStyle = getNodeColor(node)
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
        ctx.fill()
    })

    const mainCanvas = canvasRef.value!
    const viewLeft = (-offsetX.value) / scale.value
    const viewTop = (-offsetY.value) / scale.value
    const viewRight = viewLeft + mainCanvas.width / scale.value
    const viewBottom = viewTop + mainCanvas.height / scale.value

    ctx.beginPath()
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 1 / miniScale
    ctx.rect(viewLeft, viewTop, viewRight - viewLeft, viewBottom - viewTop)
    ctx.stroke()
    ctx.restore()
}

function calculateVisibleDepth(zoom: number): number {
    if (zoom < 0.4) return 2
    if (zoom < 0.7) return 4
    if (zoom < 1.0) return 6
    if (zoom < 1.4) return 8
    if (zoom < 2.0) return 10
    return 14
}

function getInitialScale(nodeCount: number): number {
    if (nodeCount > Math.pow(2, 15)) return 0.2
    if (nodeCount > Math.pow(2, 12)) return 0.3
    if (nodeCount > Math.pow(2, 10)) return 0.5
    return 1.0
}

const fetchTreeData = async () => {
    isLoading.value = true
    error.value = ''
    hasCentered.value = false

    setTimeout(() => {
        if (memberId === 'member000001') {
            const nodes: Node[] = []
            const links: Link[] = []
            const names = ['김','이','박','정','최','강','윤','한','송','임','신','권','황','안','양','배','조','유','서','홍']

            for (let i = 1; i <= Math.pow(2, 15) - 1; i++) {
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

            treeDataRaw.value = { nodes, links }

            scale.value = getInitialScale(nodes.length)
            offsetX.value = 0
            offsetY.value = 0

            updateLayoutBasedOnZoom()
        }
    }, 500)
}

const updateLayoutBasedOnZoom = () => {
    if (!layoutWorker) {
        layoutWorker = new Worker(new URL('@/utils/worker/layout-worker.ts', import.meta.url), { type: 'module' })

        layoutWorker.onmessage = (event: MessageEvent) => {
            const { nodes, links } = event.data
            treeData.value.nodes = nodes
            treeData.value.links = links

            if (renderer.value) {
                renderer.value.updateNodes(nodes)
                renderer.value.updateLinks(links, nodes)
            }

            isLoading.value = false

            const container = canvasRef.value?.parentElement
            const centerNode = nodes.find(n => n.id === memberId)
            if (container && centerNode && !hasCentered.value) {
                offsetX.value = container.clientWidth / 2 - centerNode.x * scale.value
                offsetY.value = container.clientHeight / 2 - centerNode.y * scale.value
                hasCentered.value = true
            }

            draw()
        }
    }

    const container = canvasRef.value?.parentElement
    const width = container?.clientWidth ?? 800
    const height = container?.clientHeight ?? 600
    const visibleDepth = calculateVisibleDepth(scale.value)

    const safeNodes = treeDataRaw.value.nodes.map(n => ({
        id: n.id,
        name: n.name,
        x: n.x,
        y: n.y,
        radius: n.radius,
        salesLevel: n.salesLevel
    }))

    layoutWorker.postMessage({
        nodes: safeNodes,
        links: treeDataRaw.value.links.map(l => ({ source: l.source, target: l.target })),
        width,
        height,
        maxDepth: visibleDepth
    })
}

const getNodeColor = (node: Node): string => {
    if (node.salesLevel >= 10) return '#e63946'
    if (node.salesLevel >= 7) return '#f1c40f'
    if (node.salesLevel >= 4) return '#3498db'
    return '#6c757d'
}

const draw = () => {
    if (!canvasRef.value || !renderer.value) return

    const transform = new DOMMatrix()
        .translateSelf(offsetX.value, offsetY.value)
        .scaleSelf(scale.value, scale.value)

    renderer.value.render(transform, {
        width: canvasRef.value.width,
        height: canvasRef.value.height
    })

    drawMinimap()
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

    updateLayoutBasedOnZoom()
}

const handleResize = () => {
    if (canvasRef.value) {
        const container = canvasRef.value.parentElement!
        const dpr = window.devicePixelRatio || 1
        canvasRef.value.width = container.clientWidth * dpr
        canvasRef.value.height = container.clientHeight * dpr
        canvasRef.value.style.width = `${container.clientWidth}px`
        canvasRef.value.style.height = `${container.clientHeight}px`
        draw()
    }
}

const goBack = () => router.push(`/member/detail/${memberId}`)

const handleMinimapClick = (e: MouseEvent) => {
    if (!minimapRef.value || !canvasRef.value) return

    const rect = minimapRef.value.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // 전체 트리 좌표 범위
    const xs = treeData.value.nodes.map(n => n.x)
    const ys = treeData.value.nodes.map(n => n.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    const canvasWidth = minimapRef.value.width
    const canvasHeight = minimapRef.value.height
    const padding = 20

    const scaleX = (canvasWidth - padding * 2) / (maxX - minX)
    const scaleY = (canvasHeight - padding * 2) / (maxY - minY)
    const zoomFactor = Math.max(1, scale.value * 1.5)
    const miniScale = Math.min(scaleX, scaleY) * zoomFactor

    // 역변환 (미니맵 → 실제 트리 좌표계)
    const targetX = (clickX - canvasWidth / 2) / miniScale + centerX
    const targetY = (clickY - canvasHeight / 2) / miniScale + centerY

    const container = canvasRef.value.parentElement
    if (!container) return

    offsetX.value = container.clientWidth / 2 - targetX * scale.value
    offsetY.value = container.clientHeight / 2 - targetY * scale.value

    draw()
}

onMounted(async () => {
    await nextTick()
    if (canvasRef.value) {
        renderer.value = new WebGLTreeRenderer(canvasRef.value)
        handleResize()

        canvasRef.value.addEventListener('mousedown', handleMouseDown)
        canvasRef.value.addEventListener('mousemove', handleMouseMove)
        canvasRef.value.addEventListener('mouseup', handleMouseUp)
        canvasRef.value.addEventListener('wheel', handleWheel)
    }

    if (minimapRef.value) {
        minimapCtx.value = minimapRef.value.getContext('2d')
        minimapRef.value.addEventListener('mousedown', handleMinimapClick)
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

const searchQuery = ref('')
const searchResults = ref<Node[]>([])

const handleSearch = () => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return

    const matches = treeData.value.nodes.filter(n =>
        n.id.toLowerCase().includes(query) ||
        n.name.toLowerCase().includes(query)
    )

    if (matches.length === 0) {
        alert('검색 결과가 없습니다. 검색어를 다시 확인해보세요.')
        return
    }

    if (matches.length === 1) {
        focusOnNode(matches[0])
        searchResults.value = []
    } else {
        searchResults.value = matches
    }
}

const focusOnNode = (node: Node) => {
    const container = canvasRef.value?.parentElement
    if (!container) return

    offsetX.value = container.clientWidth / 2 - node.x * scale.value
    offsetY.value = container.clientHeight / 2 - node.y * scale.value
    searchResults.value = []
    draw()
}

</script>



<template>
    <div class="p-6">
        <div class="mb-4 flex items-center gap-2">
            <input
                v-model="searchQuery"
                @keydown.enter="handleSearch"
                placeholder="회원 이름 또는 ID 검색"
                class="border rounded px-3 py-1 w-60"
            />
            <button @click="handleSearch" class="px-3 py-1 bg-blue-600 text-white rounded">검색</button>
        </div>

        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">회원 트리</h1>
            <button @click="goBack" class="bg-gray-600 text-white rounded px-4 py-2 hover:bg-gray-700">
                회원 상세로
            </button>
        </div>

        <div v-if="searchResults.length > 1" class="mb-4 text-sm bg-gray-100 p-2 rounded">
            <p class="mb-1">여러 결과가 있습니다. 선택하세요:</p>
            <ul class="space-y-1">
                <li v-for="node in searchResults" :key="node.id">
                    <button @click="focusOnNode(node)" class="text-blue-700 hover:underline">
                        {{ node.name }} ({{ node.id }})
                    </button>
                </li>
            </ul>
        </div>

        <div class="relative border rounded-lg overflow-hidden w-full" style="height: 600px;">
            <canvas ref="canvasRef" class="w-full h-full"></canvas>
            <canvas ref="minimapRef" class="absolute bottom-4 right-4 border bg-white shadow rounded" width="200" height="150"></canvas>
        </div>
    </div>
</template>

<style scoped></style>

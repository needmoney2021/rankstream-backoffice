<script setup lang='ts'>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSecureFetch } from '@/composable/fetch/use-secure-fetch'
import { TreeRenderer } from '@/utils/webgl/tree-renderer'
import { TreeLayout } from '@/utils/webgl/tree-layout'
import { ApiError } from '@/types/error/apierror'
import { useFetchStore } from '@/store/fetch/fetch'

interface TreeNode {
    idx: number
    id: string
    name: string
    depth: number
    gradeLevel: number
    children: (TreeNode | null)[]
    x: number
    y: number
    radius: number
    color: string
}

interface TreeData {
    nodes: TreeNode[]
    links: { source: number; target: number }[]
    isBinary: boolean
}

interface FlattenedTreeData {
    nodes: (Omit<TreeNode, 'children'> & { x: number; y: number; radius: number; color: string })[]
    links: { source: number; target: number }[]
    isBinary: boolean
}

const route = useRoute()
const router = useRouter()
const fetchStore = useFetchStore()
const memberIdx = ref(route.params.id as string)
const treeData = ref<FlattenedTreeData | null>(null)
const error = ref('')
const canvas = ref<HTMLCanvasElement | null>(null)
const minimapCanvas = ref<HTMLCanvasElement | null>(null)
const textCanvas = ref<HTMLCanvasElement | null>(null)
const gl = ref<WebGL2RenderingContext | null>(null)
const minimapGl = ref<WebGL2RenderingContext | null>(null)
const treeRenderer = ref<TreeRenderer | null>(null)
const minimapRenderer = ref<TreeRenderer | null>(null)
const viewport = ref({ x: 0, y: 0, scale: 1 })
const isDragging = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })
const visibleDepth = ref(3)
const windowSize = ref({ width: 0, height: 0 })
const searchQuery = ref('')
const highlightedNodeIdx = ref<number | null>(null)

const updateWindowSize = () => {
    windowSize.value = {
        width: window.innerWidth,
        height: window.innerHeight
    }
}

const fetchTreeData = async () => {
    try {
        const { secureRequest: getTreeRequest } = useSecureFetch()
        const response = await getTreeRequest(`/members/${memberIdx.value}/tree`, { method: 'GET' })
        
        if (!response) {
            return
        }

        if (response.ok) {
            const apiResponse = await response.json() as TreeData
            console.log('API Response:', apiResponse)

            // Flatten the tree structure
            const flattenedNodes: FlattenedTreeData['nodes'] = []
            
            const processNode = (node: TreeNode) => {
                // Create a flattened node without children
                const { children, ...nodeWithoutChildren } = node
                flattenedNodes.push({
                    ...nodeWithoutChildren,
                    x: 0,
                    y: 0,
                    radius: 0,
                    color: node.color
                })

                // Process children recursively
                if (children) {
                    children.forEach(child => {
                        if (child) {
                            processNode(child)
                        }
                    })
                }
            }

            // Start processing from root
            processNode(apiResponse.nodes[0])

            // Create flattened tree data
            const flattenedData: FlattenedTreeData = {
                nodes: flattenedNodes,
                links: apiResponse.links,
                isBinary: apiResponse.isBinary
            }

            console.log('Flattened Tree Data:', {
                nodeCount: flattenedData.nodes.length,
                nodes: flattenedData.nodes.map(n => ({
                    idx: n.idx,
                    id: n.id,
                    depth: n.depth
                })),
                links: flattenedData.links
            })

            treeData.value = flattenedData
            calculateNodePositions()
        } else {
            const apiError = await response.json() as ApiError
            error.value = apiError.message
        }
    } catch (err: any) {
        error.value = err.message || '트리 데이터를 불러오는데 실패했습니다.'
    }
}

const calculateNodePositions = () => {
    if (!treeData.value) return

    // Create a map for quick node lookup
    const nodeMap = new Map<number, FlattenedTreeData['nodes'][0]>()
    treeData.value.nodes.forEach(node => nodeMap.set(node.idx, node))

    // Create a map of parent to children relationships
    const childrenMap = new Map<number, number[]>()
    treeData.value.links.forEach(link => {
        const parentChildren = childrenMap.get(link.source) || []
        parentChildren.push(link.target)
        childrenMap.set(link.source, parentChildren)
    })

    // Find root node (node with depth 0)
    const root = treeData.value.nodes.find(node => node.depth === 0)
    if (!root) {
        console.warn('Root node not found')
        return
    }

    const layout = new TreeLayout()
    layout.calculateLayout({
        nodes: treeData.value.nodes,
        links: treeData.value.links,
        isBinary: treeData.value.isBinary
    })

    // Debug node positions
    console.log('Node positions after calculation:', 
        treeData.value.nodes.map(n => ({
            idx: n.idx,
            id: n.id,
            x: n.x,
            y: n.y,
            depth: n.depth
        }))
    )
}

const initWebGL = () => {
    if (!canvas.value) return

    const context = canvas.value.getContext('webgl2')
    if (!context) {
        console.error('WebGL2 not supported')
        return
    }
    gl.value = context
    treeRenderer.value = new TreeRenderer(context)
}

const initMinimap = () => {
    if (!minimapCanvas.value) return

    const context = minimapCanvas.value.getContext('webgl2')
    if (!context) {
        console.error('WebGL2 not supported for minimap')
        return
    }
    minimapGl.value = context
    minimapRenderer.value = new TreeRenderer(context)
}

const handleWheel = (event: WheelEvent) => {
    event.preventDefault()
    const delta = event.deltaY
    const zoomFactor = delta > 0 ? 0.9 : 1.1
    viewport.value.scale *= zoomFactor

    // Update visible depth based on zoom level
    if (viewport.value.scale < 0.5) {
        visibleDepth.value = 2
    } else if (viewport.value.scale < 0.3) {
        visibleDepth.value = 1
    } else {
        visibleDepth.value = 3
    }

    render()
}

const handleMouseDown = (event: MouseEvent) => {
    isDragging.value = true
    lastMousePos.value = { x: event.clientX, y: event.clientY }
}

const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.value) return

    const dx = event.clientX - lastMousePos.value.x
    const dy = event.clientY - lastMousePos.value.y
    viewport.value.x += dx
    viewport.value.y += dy
    lastMousePos.value = { x: event.clientX, y: event.clientY }
    render()
}

const handleMouseUp = () => {
    isDragging.value = false
}

const renderText = () => {
    if (!textCanvas.value || !treeData.value) return

    const ctx = textCanvas.value.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, textCanvas.value.width, textCanvas.value.height)
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (const node of treeData.value.nodes) {
        if (node.depth > visibleDepth.value) continue

        const x = node.x * viewport.value.scale + viewport.value.x + windowSize.value.width / 2
        const y = node.y * viewport.value.scale + viewport.value.y + windowSize.value.height / 2

        // Draw node ID
        ctx.fillStyle = '#000'
        ctx.fillText(node.id, x, y - 15)

        // Draw node name
        ctx.fillText(node.name, x, y + 15)
    }
}

const drawNode = (ctx: CanvasRenderingContext2D, node: TreeNode, viewport: { x: number; y: number; scale: number }) => {
    const radius = 20 * viewport.scale // Base radius scaled by viewport
    const x = node.x * viewport.scale + viewport.x + windowSize.value.width / 2
    const y = node.y * viewport.scale + viewport.y + windowSize.value.height / 2

    // Draw circle
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = node.color || '#A0AEC0' // Use node color or default to gray
    ctx.fill()
    ctx.strokeStyle = '#2D3748' // Tailwind gray-800 for border
    ctx.lineWidth = 2
    ctx.stroke()
}

const render = () => {
    if (!canvas.value || !treeData.value) return

    const ctx = canvas.value.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, windowSize.value.width, windowSize.value.height)

    // Filter nodes based on visible depth
    const visibleNodes = treeData.value.nodes.filter(node => node.depth <= visibleDepth.value)
    
    // Create node map for quick lookup
    const nodeMap = new Map(visibleNodes.map(node => [node.idx, node]))
    
    // Filter links to only include those where both source and target nodes are visible
    const visibleLinks = treeData.value.links.filter(link => {
        const sourceNode = nodeMap.get(link.source)
        const targetNode = nodeMap.get(link.target)
        return sourceNode && targetNode && 
               sourceNode.depth <= visibleDepth.value && 
               targetNode.depth <= visibleDepth.value
    })

    // Draw links first
    ctx.strokeStyle = '#CBD5E0' // Tailwind gray-400
    ctx.lineWidth = 2
    visibleLinks.forEach(link => {
        const sourceNode = nodeMap.get(link.source)
        const targetNode = nodeMap.get(link.target)
        if (sourceNode && targetNode) {
            const sourceX = sourceNode.x * viewport.value.scale + viewport.value.x + windowSize.value.width / 2
            const sourceY = sourceNode.y * viewport.value.scale + viewport.value.y + windowSize.value.height / 2
            const targetX = targetNode.x * viewport.value.scale + viewport.value.x + windowSize.value.width / 2
            const targetY = targetNode.y * viewport.value.scale + viewport.value.y + windowSize.value.height / 2

            ctx.beginPath()
            ctx.moveTo(sourceX, sourceY)
            ctx.lineTo(targetX, targetY)
            ctx.stroke()
        }
    })

    // Then draw nodes
    visibleNodes.forEach(node => {
        drawNode(ctx, node, viewport.value)
    })

    renderText()
    renderMinimap()
}

const renderMinimap = () => {
    if (!minimapCanvas.value || !treeData.value) return

    const ctx = minimapCanvas.value.getContext('2d')
    if (!ctx) return

    // Clear minimap
    ctx.clearRect(0, 0, minimapCanvas.value.width, minimapCanvas.value.height)

    // Calculate tree bounds
    const bounds = {
        minX: Math.min(...treeData.value.nodes.map(n => n.x)),
        maxX: Math.max(...treeData.value.nodes.map(n => n.x)),
        minY: Math.min(...treeData.value.nodes.map(n => n.y)),
        maxY: Math.max(...treeData.value.nodes.map(n => n.y))
    }

    // Calculate tree dimensions
    const treeWidth = bounds.maxX - bounds.minX
    const treeHeight = bounds.maxY - bounds.minY

    // Calculate minimap scale to fit the entire tree
    const minimapWidth = minimapCanvas.value.width * 0.9 // Leave some padding
    const minimapHeight = minimapCanvas.value.height * 0.9
    const scaleX = minimapWidth / treeWidth
    const scaleY = minimapHeight / treeHeight
    const minimapScale = Math.min(scaleX, scaleY)

    // Calculate minimap center offset
    const centerX = minimapCanvas.value.width / 2
    const centerY = minimapCanvas.value.height / 2

    // Draw nodes in minimap
    treeData.value.nodes.forEach(node => {
        // Transform node position to minimap coordinates
        const x = (node.x - bounds.minX - treeWidth / 2) * minimapScale + centerX
        const y = (node.y - bounds.minY - treeHeight / 2) * minimapScale + centerY
        const radius = 4 // Fixed size for minimap nodes

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color || '#A0AEC0'
        ctx.fill()
        ctx.strokeStyle = '#2D3748'
        ctx.lineWidth = 1
        ctx.stroke()
    })

    // Draw links in minimap
    ctx.strokeStyle = 'rgba(203, 213, 224, 0.6)' // Tailwind gray-400 with transparency
    ctx.lineWidth = 1

    treeData.value.links.forEach(link => {
        const source = treeData.value!.nodes.find(n => n.idx === link.source)
        const target = treeData.value!.nodes.find(n => n.idx === link.target)
        
        if (source && target) {
            const sourceX = (source.x - bounds.minX - treeWidth / 2) * minimapScale + centerX
            const sourceY = (source.y - bounds.minY - treeHeight / 2) * minimapScale + centerY
            const targetX = (target.x - bounds.minX - treeWidth / 2) * minimapScale + centerX
            const targetY = (target.y - bounds.minY - treeHeight / 2) * minimapScale + centerY

            ctx.beginPath()
            ctx.moveTo(sourceX, sourceY)
            ctx.lineTo(targetX, targetY)
            ctx.stroke()
        }
    })

    // Calculate viewport rectangle in minimap coordinates
    const viewportWidth = windowSize.value.width / viewport.value.scale
    const viewportHeight = windowSize.value.height / viewport.value.scale
    
    const viewportX = (-viewport.value.x / viewport.value.scale - viewportWidth / 2) * minimapScale + centerX
    const viewportY = (-viewport.value.y / viewport.value.scale - viewportHeight / 2) * minimapScale + centerY
    const rectWidth = viewportWidth * minimapScale
    const rectHeight = viewportHeight * minimapScale

    // Draw viewport rectangle
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
    ctx.lineWidth = 2
    ctx.strokeRect(viewportX, viewportY, rectWidth, rectHeight)
}

const handleSearch = () => {
    if (!treeData.value || !searchQuery.value.trim()) {
        highlightedNodeIdx.value = null
        return
    }

    const query = searchQuery.value.toLowerCase().trim()
    const foundNode = treeData.value.nodes.find(node => 
        node.id.toLowerCase().includes(query) || 
        node.name.toLowerCase().includes(query)
    )

    if (foundNode) {
        highlightedNodeIdx.value = foundNode.idx
        // 찾은 노드로 뷰포트 중심 이동
        viewport.value.x = -foundNode.x * viewport.value.scale
        viewport.value.y = -foundNode.y * viewport.value.scale
        render()
    }
}

const handleBack = () => {
    router.back()
}

onMounted(() => {
    updateWindowSize()
    window.addEventListener('resize', updateWindowSize)
    fetchTreeData()
    initWebGL()
    initMinimap()
    render()

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateWindowSize)
    window.removeEventListener('wheel', handleWheel)
    window.removeEventListener('mousedown', handleMouseDown)
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
})

watch(treeData, () => {
    render()
})

watch(windowSize, () => {
    render()
})
</script>

<template>
    <div class="relative w-full h-screen">
        <!-- 상단 컨트롤 바 -->
        <div class="absolute top-0 left-0 right-0 bg-white shadow-md p-4 z-10 flex items-center gap-4">
            <button 
                @click="handleBack"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                돌아가기
            </button>

            <div class="flex-1 max-w-md relative">
                <input
                    v-model="searchQuery"
                    @keyup.enter="handleSearch"
                    type="text"
                    placeholder="회원 아이디 또는 이름으로 검색"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                    @click="handleSearch"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- 로딩 및 에러 상태 -->
        <div 
            v-if="fetchStore.isFetching" 
            class="absolute inset-0 flex items-center justify-center"
            style="top: 72px;"
        >
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p class="ml-2 text-gray-600">데이터를 불러오는 중...</p>
        </div>

        <div 
            v-else-if="error" 
            class="absolute inset-0 flex items-center justify-center"
            style="top: 72px;"
        >
            <div class="bg-red-100 p-4 rounded text-red-700">
                {{ error }}
                <button class="ml-2 underline" @click="fetchTreeData">다시 시도</button>
            </div>
        </div>

        <!-- 캔버스 영역 -->
        <template v-else>
            <div class="absolute inset-0" style="top: 72px;">
                <canvas
                    ref="canvas"
                    class="absolute inset-0 w-full h-full"
                    :width="windowSize.width"
                    :height="windowSize.height"
                />
                <canvas
                    ref="textCanvas"
                    class="absolute inset-0 w-full h-full pointer-events-none"
                    :width="windowSize.width"
                    :height="windowSize.height"
                />
                <canvas
                    ref="minimapCanvas"
                    class="absolute bottom-4 right-4 w-64 h-64 border border-gray-300 bg-white rounded shadow-lg"
                    width="256"
                    height="256"
                />
            </div>
        </template>
    </div>
</template>

<style>
html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

#app {
    height: 100%;
}
</style>

<style scoped>
canvas {
    touch-action: none;
}

.h-screen {
    height: 100vh;
}
</style> 
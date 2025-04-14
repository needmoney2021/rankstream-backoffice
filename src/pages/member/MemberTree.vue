<script lang='ts' setup>
import {nextTick, onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'

const route = useRoute()
const router = useRouter()
const memberId = route.params.id as string
const isLoading = ref(true)
const error = ref('')

// Canvas references
const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)

// Tree data
interface Node {
    id: string
    name: string
    x: number
    y: number
    radius: number
    isDragging: boolean
    salesLevel: number
}

interface Link {
    source: string
    target: string
}

interface GraphData {
    nodes: Node[]
    links: Link[]
}

const treeData = ref<GraphData>({
    nodes: [],
    links: []
})

// Canvas state
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartOffsetX = ref(0)
const dragStartOffsetY = ref(0)

const getNodeColor = (node: Node): string => {
    if (node.salesLevel > 8) {
        return '#ffd457'
    } else if (node.salesLevel <= 8 && node.salesLevel >= 5) {
        return '#aeff57'
    } else if (node.salesLevel < 5 && node.salesLevel >= 3) {
        return '#579eff'
    }
    return '#feebd7'
}

// Fetch tree data
const fetchTreeData = async () => {
    try {
        isLoading.value = true
        error.value = ''

        // This would be an actual API call in a real implementation
        // const response = await fetch(`/api/members/${memberId}/tree`)
        // if (!response.ok) throw new Error('Failed to fetch tree data')
        // treeData.value = await response.json()

        // For mock purposes, we'll use static data
        setTimeout(() => {
            // Simulate API response with different tree structures based on member ID
            if (memberId === 'member001') {
                treeData.value = {
                    nodes: [
                        {id: 'member001', name: '김철수', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 10},
                        {id: 'member002', name: '이영희', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 8},
                        {id: 'member003', name: '박지민', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 8},
                        {id: 'member010', name: '정소희', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 6},
                        {id: 'member011', name: '최준호', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 5},
                        {id: 'member012', name: '강민준', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 4},
                        {id: 'member013', name: '윤서연', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 0},
                    ],
                    links: [
                        {source: 'member001', target: 'member002'},
                        {source: 'member001', target: 'member003'},
                        {source: 'member002', target: 'member010'},
                        {source: 'member002', target: 'member011'},
                        {source: 'member003', target: 'member012'},
                        {source: 'member003', target: 'member013'},
                    ]
                }
            } else if (memberId === 'member002') {
                treeData.value = {
                    nodes: [
                        {id: 'member002', name: '이영희', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 8},
                        {id: 'member010', name: '정소희', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 6},
                        {id: 'member011', name: '최준호', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 5},
                        {id: 'member014', name: '한지민', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 4},
                        {id: 'member015', name: '송태호', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 2},
                    ],
                    links: [
                        {source: 'member002', target: 'member010'},
                        {source: 'member002', target: 'member011'},
                        {source: 'member010', target: 'member014'},
                        {source: 'member011', target: 'member015'},
                    ]
                }
            } else {
                // Default for other IDs
                treeData.value = {
                    nodes: [
                        {id: memberId, name: '회원' + memberId, x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 3},
                        {id: 'child1', name: '하위회원1', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 1},
                        {id: 'child2', name: '하위회원2', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 1},
                        {id: 'child3', name: '하위회원3', x: 0, y: 0, radius: 20, isDragging: false, salesLevel: 0},
                    ],
                    links: [
                        {source: memberId, target: 'child1'},
                        {source: memberId, target: 'child2'},
                        {source: 'child1', target: 'child3'},
                    ]
                }
            }

            isLoading.value = false
            arrangeNodes()
            draw()
        }, 1000)

    } catch (err: any) {
        error.value = err.message || '트리 데이터를 불러오는데 실패했습니다.'
        isLoading.value = false
    }
}

// Arrange nodes in a tree structure
const arrangeNodes = () => {
    if (!canvasRef.value || treeData.value.nodes.length === 0) return

    const canvasWidth = canvasRef.value.width
    const canvasHeight = canvasRef.value.height
    const levelHeight = 150
    const nodeGap = 80

    // 자식 노드를 재귀적으로 계산하며 x 위치 반환
    const computeLayout = (nodeId: string, depth: number): number => {
        const node = treeData.value.nodes.find(n => n.id === nodeId)
        if (!node) return 0

        const children = treeData.value.links
            .filter(link => link.source === nodeId)
            .map(link => treeData.value.nodes.find(n => n.id === link.target))
            .filter(Boolean) as Node[]

        if (children.length === 0) {
            // 리프 노드 - x 위치를 leafIndex 기반으로 설정
            const x = leafXCounter * nodeGap
            node.x = x
            node.y = depth * levelHeight
            leafXCounter += 1
            return x
        } else {
            const childXs = children.map(child => computeLayout(child.id, depth + 1))
            const minX = Math.min(...childXs)
            const maxX = Math.max(...childXs)
            node.x = (minX + maxX) / 2
            node.y = depth * levelHeight
            return node.x
        }
    }

    let leafXCounter = 0
    computeLayout(memberId, 0)

    // 중앙 정렬
    const allX = treeData.value.nodes.map(n => n.x)
    const minX = Math.min(...allX)
    const maxX = Math.max(...allX)
    const shiftX = (canvasWidth - (maxX - minX)) / 2 - minX

    treeData.value.nodes.forEach(n => {
        n.x += shiftX
    })
}


// Draw the tree
const draw = () => {
    if (!canvasRef.value || !ctx.value) return

    const canvas = canvasRef.value
    ctx.value.clearRect(0, 0, canvas.width, canvas.height)

    // Apply transformations
    ctx.value.save()
    ctx.value.translate(offsetX.value, offsetY.value)
    ctx.value.scale(scale.value, scale.value)

    // Draw links
    ctx.value.beginPath()
    ctx.value.strokeStyle = '#999'
    ctx.value.lineWidth = 1.5

    treeData.value.links.forEach(link => {
        const sourceNode = treeData.value.nodes.find(n => n.id === link.source)
        const targetNode = treeData.value.nodes.find(n => n.id === link.target)

        if (sourceNode && targetNode) {
            ctx.value!!.moveTo(sourceNode.x, sourceNode.y)
            ctx.value!!.lineTo(targetNode.x, targetNode.y)
        }
    })

    ctx.value.stroke()

    // Draw nodes
    treeData.value.nodes.forEach(node => {
        // Draw circle
        ctx.value!!.beginPath()
        ctx.value!!.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.value!!.fillStyle = getNodeColor(node)
        ctx.value!!.fill()
        ctx.value!!.strokeStyle = '#fff'
        ctx.value!!.lineWidth = 1.5
        ctx.value!!.stroke()

        // Draw text
        ctx.value!!.fillStyle = '#333'
        ctx.value!!.font = '10px Arial'
        ctx.value!!.textAlign = 'center'

        // Draw ID
        ctx.value!!.fillText(node.id, node.x, node.y - 25)

        // Draw name
        ctx.value!!.fillText(node.name, node.x, node.y + 35)
    })

    ctx.value.restore()
}

// Handle mouse events
const handleMouseDown = (e: MouseEvent) => {
    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const x = (e.clientX - rect.left - offsetX.value) / scale.value
    const y = (e.clientY - rect.top - offsetY.value) / scale.value

    // Check if clicked on a node
    const clickedNode = treeData.value.nodes.find(node => {
        const dx = x - node.x
        const dy = y - node.y
        return Math.sqrt(dx * dx + dy * dy) <= node.radius
    })

    if (clickedNode) {
        clickedNode.isDragging = true
    } else {
        isDragging.value = true
        dragStartX.value = e.clientX
        dragStartY.value = e.clientY
        dragStartOffsetX.value = offsetX.value
        dragStartOffsetY.value = offsetY.value
    }
}

const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.value) return

    if (isDragging.value) {
        offsetX.value = dragStartOffsetX.value + (e.clientX - dragStartX.value)
        offsetY.value = dragStartOffsetY.value + (e.clientY - dragStartY.value)
        draw()
    } else {
        const draggingNode = treeData.value.nodes.find(node => node.isDragging)
        if (draggingNode) {
            const rect = canvasRef.value.getBoundingClientRect()
            draggingNode.x = (e.clientX - rect.left - offsetX.value) / scale.value
            draggingNode.y = (e.clientY - rect.top - offsetY.value) / scale.value
            draw()
        }
    }
}

const handleMouseUp = () => {
    isDragging.value = false
    treeData.value.nodes.forEach(node => {
        node.isDragging = false
    })
}

const handleWheel = (e: WheelEvent) => {
    e.preventDefault()

    const delta = e.deltaY
    const zoomFactor = 0.001

    const oldScale = scale.value
    scale.value = Math.max(0.1, Math.min(4, scale.value - delta * zoomFactor))

    // Adjust offset to zoom at mouse position
    if (canvasRef.value) {
        const rect = canvasRef.value.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        offsetX.value = mouseX - (mouseX - offsetX.value) * (scale.value / oldScale)
        offsetY.value = mouseY - (mouseY - offsetY.value) * (scale.value / oldScale)
    }

    draw()
}

// Handle window resize
const handleResize = () => {
    if (canvasRef.value) {
        const container = canvasRef.value.parentElement
        if (container) {
            canvasRef.value.width = container.clientWidth
            canvasRef.value.height = container.clientHeight
            arrangeNodes()
            draw()
        }
    }
}

// Go back to member detail
const goBack = () => {
    router.push(`/member/detail/${memberId}`)
}

onMounted(async () => {
    await nextTick()

    if (canvasRef.value) {
        console.info('canvasRef.value', canvasRef.value)
        ctx.value = canvasRef.value.getContext('2d')
        const container = canvasRef.value.parentElement
        if (container) {
            const dpr = window.devicePixelRatio || 1

            const width = container.clientWidth
            const height = container.clientHeight

            // ⚠ 실제 픽셀 기준 캔버스 크기
            canvasRef.value.width = width * dpr
            canvasRef.value.height = height * dpr

            // 👀 CSS로는 그대로 보여주기
            canvasRef.value.style.width = `${width}px`
            canvasRef.value.style.height = `${height}px`

            // 🎯 캔버스 내부 좌표계도 배율 조정
            ctx.value!!.scale(dpr, dpr)
        }

        // Add event listeners
        canvasRef.value.addEventListener('mousedown', handleMouseDown)
        canvasRef.value.addEventListener('mousemove', handleMouseMove)
        canvasRef.value.addEventListener('mouseup', handleMouseUp)
        canvasRef.value.addEventListener('wheel', handleWheel)
    } else {
        console.info('canvasRef.value is null')
    }

    await fetchTreeData()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    if (canvasRef.value) {
        canvasRef.value.removeEventListener('mousedown', handleMouseDown)
        canvasRef.value.removeEventListener('mousemove', handleMouseMove)
        canvasRef.value.removeEventListener('mouseup', handleMouseUp)
        canvasRef.value.removeEventListener('wheel', handleWheel)
    }
    window.removeEventListener('resize', handleResize)
})
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">회원 트리</h1>
            <button
                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                @click="goBack"
            >
                회원 상세로
            </button>
        </div>

<!--        <div v-if="isLoading" class="text-center py-10">-->
<!--            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>-->
<!--            <p class="mt-2 text-gray-600">트리 데이터를 불러오는 중...</p>-->
<!--        </div>-->

<!--        <div v-else-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">-->
<!--            {{ error }}-->
<!--            <button class="ml-2 underline" @click="fetchTreeData">다시 시도</button>-->
<!--        </div>-->

        <div class="bg-white p-4 rounded-lg shadow">
            <div class="mb-4 text-sm text-gray-600">
                <p>마우스 휠로 확대/축소, 드래그로 이동, 노드를 드래그하여 위치 조정이 가능합니다.</p>
            </div>

            <div class="border rounded-lg overflow-hidden w-full" style="height: 600px;">
                <canvas
                    ref="canvasRef"
                    class="w-full h-full"
                ></canvas>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>

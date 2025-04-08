<script setup lang='ts'>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as d3 from 'd3'

const route = useRoute()
const router = useRouter()
const memberId = route.params.id as string
const isLoading = ref(true)
const error = ref('')

// Canvas dimensions
const width = ref(1000)
const height = ref(800)
const canvasRef = ref<HTMLDivElement | null>(null)

// Tree data
interface Node {
    id: string
    name: string
    x?: number
    y?: number
    fx?: number | null
    fy?: number | null
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
                        { id: 'member001', name: '김철수' },
                        { id: 'member002', name: '이영희' },
                        { id: 'member003', name: '박지민' },
                        { id: 'member010', name: '정소희' },
                        { id: 'member011', name: '최준호' },
                        { id: 'member012', name: '강민준' },
                        { id: 'member013', name: '윤서연' },
                    ],
                    links: [
                        { source: 'member001', target: 'member002' },
                        { source: 'member001', target: 'member003' },
                        { source: 'member002', target: 'member010' },
                        { source: 'member002', target: 'member011' },
                        { source: 'member003', target: 'member012' },
                        { source: 'member003', target: 'member013' },
                    ]
                }
            } else if (memberId === 'member002') {
                treeData.value = {
                    nodes: [
                        { id: 'member002', name: '이영희' },
                        { id: 'member010', name: '정소희' },
                        { id: 'member011', name: '최준호' },
                        { id: 'member014', name: '한지민' },
                        { id: 'member015', name: '송태호' },
                    ],
                    links: [
                        { source: 'member002', target: 'member010' },
                        { source: 'member002', target: 'member011' },
                        { source: 'member010', target: 'member014' },
                        { source: 'member011', target: 'member015' },
                    ]
                }
            } else {
                // Default for other IDs
                treeData.value = {
                    nodes: [
                        { id: memberId, name: '회원' + memberId },
                        { id: 'child1', name: '하위회원1' },
                        { id: 'child2', name: '하위회원2' },
                        { id: 'child3', name: '하위회원3' },
                    ],
                    links: [
                        { source: memberId, target: 'child1' },
                        { source: memberId, target: 'child2' },
                        { source: 'child1', target: 'child3' },
                    ]
                }
            }
            
            isLoading.value = false
            
            // Initialize the force-directed graph
            initForceGraph()
        }, 1000)
        
    } catch (err: any) {
        error.value = err.message || '트리 데이터를 불러오는데 실패했습니다.'
        isLoading.value = false
    }
}

// D3 variables
let simulation: d3.Simulation<d3.SimulationNodeDatum, undefined> | null = null
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let zoomGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
let zoom: d3.ZoomBehavior<Element, unknown> | null = null

// Initialize force-directed graph
const initForceGraph = () => {
    if (!canvasRef.value || treeData.value.nodes.length === 0) return
    
    // Clear any existing SVG
    d3.select(canvasRef.value).select('svg').remove()
    
    const containerWidth = canvasRef.value.clientWidth
    const containerHeight = canvasRef.value.clientHeight
    
    // Create SVG
    svg = d3.select(canvasRef.value)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .attr('viewBox', [0, 0, containerWidth, containerHeight])
        .attr('style', 'max-width: 100%; height: auto;')
    
    // Add zoom behavior
    zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            if (zoomGroup) {
                zoomGroup.attr('transform', event.transform)
                // Hide text on small scale
                const scale = event.transform.k
                zoomGroup.selectAll('text')
                    .style('display', scale < 0.5 ? 'none' : 'block')
            }
        })
    
    svg.call(zoom)
    
    // Add zoom group for all elements
    zoomGroup = svg.append('g')
    
    // Create links
    const link = zoomGroup.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(treeData.value.links)
        .join('line')
        .attr('stroke-width', 1.5)
    
    // Create nodes
    const node = zoomGroup.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('g')
        .data(treeData.value.nodes)
        .join('g')
        .call(d3.drag<SVGGElement, Node>()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))
    
    // Add circles for nodes
    node.append('circle')
        .attr('r', 20)
        .attr('fill', (d) => d.id === memberId ? '#e63946' : '#1d3557')
    
    // Add text labels
    node.append('text')
        .attr('x', 0)
        .attr('y', -25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#333')
        .text(d => d.id)
        .style('font-size', '10px')
    
    node.append('text')
        .attr('x', 0)
        .attr('y', 35)
        .attr('text-anchor', 'middle')
        .attr('fill', '#333')
        .text(d => d.name)
        .style('font-size', '10px')
    
    // Set up force simulation
    simulation = d3.forceSimulation(treeData.value.nodes as d3.SimulationNodeDatum[])
        .force('link', d3.forceLink<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>>()
            .id((d: any) => d.id)
            .links(treeData.value.links)
            .distance(150))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
        .force('x', d3.forceX(containerWidth / 2).strength(0.1))
        .force('y', d3.forceY(containerHeight / 2).strength(0.1))
        .force('collision', d3.forceCollide().radius(50))
        .on('tick', () => {
            link
                .attr('x1', d => (d.source as any).x)
                .attr('y1', d => (d.source as any).y)
                .attr('x2', d => (d.target as any).x)
                .attr('y2', d => (d.target as any).y)
            
            node.attr('transform', d => `translate(${(d as any).x},${(d as any).y})`)
        })
    
    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
        if (!event.active && simulation) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
    }
    
    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
        d.fx = event.x
        d.fy = event.y
    }
    
    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
        if (!event.active && simulation) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
    }
    
    // Set initial zoom
    const initialTransform = d3.zoomIdentity.translate(containerWidth / 2, containerHeight / 2).scale(0.8)
    svg.call(zoom.transform, initialTransform)
}

// Handle window resize
const handleResize = () => {
    if (canvasRef.value && svg) {
        const containerWidth = canvasRef.value.clientWidth
        const containerHeight = canvasRef.value.clientHeight
        
        svg.attr('width', containerWidth)
            .attr('height', containerHeight)
            .attr('viewBox', [0, 0, containerWidth, containerHeight])
        
        if (simulation) {
            simulation
                .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
                .force('x', d3.forceX(containerWidth / 2).strength(0.1))
                .force('y', d3.forceY(containerHeight / 2).strength(0.1))
                .restart()
        }
    }
}

// Go back to member detail
const goBack = () => {
    router.push(`/member/detail/${memberId}`)
}

onMounted(() => {
    fetchTreeData()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (simulation) simulation.stop()
})
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">회원 트리</h1>
            <button 
                @click="goBack" 
                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
                회원 상세로
            </button>
        </div>
        
        <div v-if="isLoading" class="text-center py-10">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-gray-600">트리 데이터를 불러오는 중...</p>
        </div>
        
        <div v-else-if="error" class="bg-red-100 p-4 rounded text-red-700 mb-4">
            {{ error }}
            <button @click="fetchTreeData" class="ml-2 underline">다시 시도</button>
        </div>
        
        <div v-else class="bg-white p-4 rounded-lg shadow">
            <div class="mb-4 text-sm text-gray-600">
                <p>마우스 휠로 확대/축소, 드래그로 이동, 노드를 드래그하여 위치 조정이 가능합니다.</p>
            </div>
            
            <div 
                ref="canvasRef" 
                class="border rounded-lg overflow-hidden w-full"
                style="height: 600px;"
            ></div>
        </div>
    </div>
</template>

<style scoped>
</style> 
import { hierarchy, cluster } from 'd3-hierarchy'
import { Node, Link } from '@/types/graph-types'

self.onmessage = (event) => {
    const { nodes, links, width, height } = event.data as {
        nodes: Node[]
        links: Link[]
        width: number
        height: number
    }
    
    const nodeMap = new Map<string, Node>()
    nodes.forEach(n => nodeMap.set(n.id, n))
    
    const childrenMap = new Map<string, Node[]>()
    links.forEach(link => {
        const source = nodeMap.get(link.source)
        const target = nodeMap.get(link.target)
        if (!source || !target) return
        if (!childrenMap.has(link.source)) childrenMap.set(link.source, [])
        childrenMap.get(link.source)!.push(target)
    })
    
    const allIds = new Set(nodes.map(n => n.id))
    links.forEach(l => allIds.delete(l.target))
    const rootId = allIds.values().next().value
    if (!rootId) {
        self.postMessage([])
        return
    }
    
    const rootNode = nodeMap.get(rootId)
    if (!rootNode) {
        self.postMessage([])
        return
    }
    
    nodes.forEach(n => {
        n.children = childrenMap.get(n.id)
    })
    
    const root = hierarchy<Node>(rootNode)
    
    // cluster layout 적용
    const xSpacing = 120
    const ySpacing = 150
    const layout = cluster<Node>().nodeSize([xSpacing, ySpacing])
    layout(root)
    
    const positionedNodes: Node[] = []
    root.each(node => {
        const d = node.data
        d.x = node.x!!
        d.y = node.y!!
        d.radius = Math.max(6, 20 - node.depth * 0.8)
        positionedNodes.push(d)
    })
    
    self.postMessage(positionedNodes)
}

import {cluster, hierarchy} from 'd3-hierarchy'
import {Link, Node} from '@/types/tree/graph-types'

self.onmessage = (event) => {
    const {nodes, links, width, height, maxDepth = Infinity} = event.data as {
        nodes: Node[]
        links: Link[]
        width: number
        height: number
        maxDepth?: number
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
        self.postMessage({nodes: [], links: []})
        return
    }
    
    const visibleNodeSet = new Set<string>()
    
    function assignChildren(node: Node, depth: number) {
        visibleNodeSet.add(node.id)
        if (depth >= maxDepth) {
            node.children = undefined
            return
        }
        const children = childrenMap.get(node.id)
        if (children) {
            node.children = children
            children.forEach(child => assignChildren(child, depth + 1))
        } else {
            node.children = undefined
        }
    }
    
    assignChildren(rootNode, 0)
    
    const root = hierarchy<Node>(rootNode)
    
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
    
    const positionedLinks: Link[] = links.filter(l => visibleNodeSet.has(l.source) && visibleNodeSet.has(l.target))
    
    self.postMessage({nodes: positionedNodes, links: positionedLinks})
}

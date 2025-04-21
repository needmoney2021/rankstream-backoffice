export interface TreeNode {
    idx: number
    id: string
    name: string
    depth: number
    gradeLevel: number
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

export class TreeLayout {
    private horizontalSpacing = 200
    private verticalSpacing = 100
    private nodeRadius = 20
    private treeData: TreeData | null = null

    // Add color calculation based on grade level
    private getNodeColor(gradeLevel: number): string {
        if (gradeLevel >= 10) {
            return '#F6E05E' // Tailwind yellow-400 - 최고 등급
        } else if (gradeLevel >= 7) {
            return '#9F7AEA' // Tailwind purple-500 - 상위 등급
        } else if (gradeLevel >= 4) {
            return '#4299E1' // Tailwind blue-500 - 중간 등급
        } else {
            return '#A0AEC0' // Tailwind gray-500 - 기본 등급
        }
    }

    calculateLayout(treeData: TreeData) {
        this.treeData = treeData
        // Create a map for quick node lookup
        const nodeMap = new Map<number, TreeNode>()
        treeData.nodes.forEach(node => nodeMap.set(node.idx, node))

        // Create a map of parent to children relationships
        const childrenMap = new Map<number, number[]>()
        treeData.links.forEach(link => {
            const parentChildren = childrenMap.get(link.source) || []
            parentChildren.push(link.target)
            childrenMap.set(link.source, parentChildren)
        })

        // Find root node (node with depth 0)
        const root = treeData.nodes.find(node => node.depth === 0)
        if (!root) {
            console.warn('Root node not found')
            return
        }

        // Calculate tree dimensions
        const maxDepth = Math.max(...treeData.nodes.map(node => node.depth))
        const width = this.calculateTreeWidth(root, maxDepth)
        const height = maxDepth * this.verticalSpacing

        // Center the tree
        const startX = -width / 2
        const startY = -height / 2

        // Position nodes
        this.positionNode(root.idx, startX, startY, nodeMap, childrenMap)

        // Set node colors based on grade level
        treeData.nodes.forEach(node => {
            node.color = this.getNodeColor(node.gradeLevel)
        })

        // Verify all nodes have positions
        const nodesWithoutPosition = treeData.nodes.filter(node => node.x === 0 && node.y === 0)
        if (nodesWithoutPosition.length > 0) {
            console.warn('Nodes without position:', nodesWithoutPosition.map(n => ({ idx: n.idx, id: n.id })))
        }

        // Center the tree
        const bounds = this.calculateBounds(treeData.nodes)
        const offsetX = -(bounds.maxX + bounds.minX) / 2
        const offsetY = -(bounds.maxY + bounds.minY) / 2

        // Apply offset to center the tree
        treeData.nodes.forEach(node => {
            node.x += offsetX
            node.y += offsetY
            node.radius = this.nodeRadius
        })

        // Debug output
        console.log('Tree layout calculated:', {
            bounds,
            offset: { x: offsetX, y: offsetY },
            nodes: treeData.nodes.map(n => ({
                idx: n.idx,
                id: n.id,
                x: n.x,
                y: n.y,
                depth: n.depth
            }))
        })
    }

    private positionNode(
        nodeIdx: number,
        x: number,
        y: number,
        nodeMap: Map<number, TreeNode>,
        childrenMap: Map<number, number[]>
    ): number {
        const node = nodeMap.get(nodeIdx)
        if (!node) return 0

        const children = childrenMap.get(nodeIdx) || []
        if (children.length === 0) {
            node.x = x
            node.y = y
            return this.horizontalSpacing
        }

        // Position children
        let totalWidth = 0
        let childX = x - (this.horizontalSpacing * (children.length - 1)) / 2
        
        children.forEach(childIdx => {
            const width = this.positionNode(
                childIdx,
                childX,
                y + this.verticalSpacing,
                nodeMap,
                childrenMap
            )
            childX += width
            totalWidth += width
        })

        // Center parent node above children
        node.x = x
        node.y = y

        return Math.max(totalWidth, this.horizontalSpacing)
    }

    private calculateBounds(nodes: TreeNode[]) {
        let minX = Infinity
        let maxX = -Infinity
        let minY = Infinity
        let maxY = -Infinity

        nodes.forEach(node => {
            minX = Math.min(minX, node.x)
            maxX = Math.max(maxX, node.x)
            minY = Math.min(minY, node.y)
            maxY = Math.max(maxY, node.y)
        })

        return { minX, maxX, minY, maxY }
    }

    private calculateTreeWidth(root: TreeNode, maxDepth: number): number {
        // Calculate the maximum number of nodes at any level
        const levelCounts = new Array(maxDepth + 1).fill(0)
        this.countNodesAtLevels(root, 0, levelCounts)
        
        // Find the level with the most nodes
        const maxNodesAtLevel = Math.max(...levelCounts)
        
        // Calculate required width based on horizontal spacing and maximum nodes
        return maxNodesAtLevel * this.horizontalSpacing
    }

    private countNodesAtLevels(node: TreeNode, level: number, levelCounts: number[]) {
        if (!node || level >= levelCounts.length || !this.treeData) return
        
        levelCounts[level]++
        
        // Find children through links
        const children = this.treeData.links
            .filter((link: { source: number; target: number }) => link.source === node.idx)
            .map((link: { source: number; target: number }) => 
                this.treeData?.nodes.find((n: TreeNode) => n.idx === link.target))
            .filter((n): n is TreeNode => n !== undefined)
        
        children.forEach((child: TreeNode) => this.countNodesAtLevels(child, level + 1, levelCounts))
    }
} 
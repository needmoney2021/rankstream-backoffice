export interface Node {
    id: string
    name: string
    salesLevel: number
    radius: number
    isDragging?: boolean
    x: number
    y: number
    children?: Node[]
}

export interface Link {
    source: string
    target: string
}

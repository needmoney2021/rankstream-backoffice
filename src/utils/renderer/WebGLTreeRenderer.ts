import { Node, Link } from '@/types/graph-types'

export class WebGLTreeRenderer {
    private gl: WebGL2RenderingContext
    private canvas: HTMLCanvasElement
    private nodeProgram: WebGLProgram
    private linkProgram: WebGLProgram
    private nodeBuffer: WebGLBuffer
    private linkBuffer: WebGLBuffer
    private nodeTexture: WebGLTexture
    private textCanvas: HTMLCanvasElement
    private textCtx: CanvasRenderingContext2D
    private nodeCount: number = 0
    private linkCount: number = 0

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.gl = canvas.getContext('webgl2')!
        this.textCanvas = document.createElement('canvas')
        this.textCtx = this.textCanvas.getContext('2d')!

        // Initialize WebGL programs and buffers
        this.nodeProgram = this.createProgram(this.nodeVertexShader, this.nodeFragmentShader)
        this.linkProgram = this.createProgram(this.linkVertexShader, this.linkFragmentShader)
        this.nodeBuffer = this.gl.createBuffer()!
        this.linkBuffer = this.gl.createBuffer()!
        this.nodeTexture = this.gl.createTexture()!

        // Set up text canvas
        this.textCanvas.width = 1024
        this.textCanvas.height = 1024
    }

    private nodeVertexShader = `#version 300 es
        in vec2 position;
        in float radius;
        in vec4 color;
        in vec2 texCoord;
        
        uniform mat3 transform;
        uniform vec2 viewport;
        
        out vec4 vColor;
        out vec2 vTexCoord;
        
        void main() {
            vec2 pos = (transform * vec3(position, 1.0)).xy;
            // Flip Y coordinate to match Canvas 2D coordinate system
            pos.y = -pos.y;
            gl_Position = vec4(pos / viewport * 2.0 - 1.0, 0.0, 1.0);
            gl_PointSize = radius * 2.0;
            vColor = color;
            vTexCoord = texCoord;
        }
    `

    private nodeFragmentShader = `#version 300 es
        precision highp float;
        
        in vec4 vColor;
        in vec2 vTexCoord;
        
        out vec4 fragColor;
        
        void main() {
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            if (dist > 0.5) discard;
            
            fragColor = vColor;
            if (dist > 0.45) {
                fragColor.rgb *= 0.8;
            }
        }
    `

    private linkVertexShader = `#version 300 es
        in vec2 position;
        in vec4 color;
        
        uniform mat3 transform;
        uniform vec2 viewport;
        
        out vec4 vColor;
        
        void main() {
            vec2 pos = (transform * vec3(position, 1.0)).xy;
            // Flip Y coordinate to match Canvas 2D coordinate system
            pos.y = -pos.y;
            gl_Position = vec4(pos / viewport * 2.0 - 1.0, 0.0, 1.0);
            vColor = color;
        }
    `

    private linkFragmentShader = `#version 300 es
        precision highp float;
        
        in vec4 vColor;
        
        out vec4 fragColor;
        
        void main() {
            fragColor = vColor;
        }
    `

    private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
        const gl = this.gl
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
        
        gl.shaderSource(vertexShader, vertexSource)
        gl.shaderSource(fragmentShader, fragmentSource)
        gl.compileShader(vertexShader)
        gl.compileShader(fragmentShader)
        
        const program = gl.createProgram()!
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)
        
        return program
    }

    public updateNodes(nodes: Node[]) {
        const gl = this.gl
        this.nodeCount = nodes.length
        
        const nodeData = new Float32Array(nodes.length * 8) // position(2) + radius(1) + color(4) + texCoord(1)
        
        nodes.forEach((node, i) => {
            const offset = i * 8
            nodeData[offset] = node.x
            nodeData[offset + 1] = node.y
            nodeData[offset + 2] = node.radius
            
            // Convert color to normalized RGBA
            const color = this.getNodeColor(node)
            nodeData[offset + 3] = parseInt(color.slice(1, 3), 16) / 255
            nodeData[offset + 4] = parseInt(color.slice(3, 5), 16) / 255
            nodeData[offset + 5] = parseInt(color.slice(5, 7), 16) / 255
            nodeData[offset + 6] = 1.0
            
            // Texture coordinate (for future use)
            nodeData[offset + 7] = 0
        })
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nodeBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, nodeData, gl.STATIC_DRAW)
    }

    public updateLinks(links: Link[], nodes: Node[]) {
        const gl = this.gl
        this.linkCount = links.length
        
        // Each link needs 2 points (start and end), each point has position(2) + color(4)
        const linkData = new Float32Array(links.length * 2 * 6)
        
        links.forEach((link, i) => {
            const source = nodes.find(n => n.id === link.source)
            const target = nodes.find(n => n.id === link.target)
            if (!source || !target) return
            
            // Start point
            const startOffset = i * 12
            linkData[startOffset] = source.x
            linkData[startOffset + 1] = source.y
            linkData[startOffset + 2] = 0.6  // R
            linkData[startOffset + 3] = 0.6  // G
            linkData[startOffset + 4] = 0.6  // B
            linkData[startOffset + 5] = 1.0  // A
            
            // End point
            const endOffset = startOffset + 6
            linkData[endOffset] = target.x
            linkData[endOffset + 1] = target.y
            linkData[endOffset + 2] = 0.6  // R
            linkData[endOffset + 3] = 0.6  // G
            linkData[endOffset + 4] = 0.6  // B
            linkData[endOffset + 5] = 1.0  // A
        })
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.linkBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, linkData, gl.STATIC_DRAW)
    }

    public render(transform: DOMMatrix, viewport: { width: number, height: number }) {
        const gl = this.gl
        gl.viewport(0, 0, viewport.width, viewport.height)
        gl.clearColor(1, 1, 1, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        
        // Convert DOMMatrix to 3x3 matrix for WebGL
        const matrix = new Float32Array([
            transform.a, transform.b, 0,
            transform.c, transform.d, 0,
            transform.e, transform.f, 1
        ])
        
        // Render links
        gl.useProgram(this.linkProgram)
        const linkTransformLoc = gl.getUniformLocation(this.linkProgram, 'transform')
        const linkViewportLoc = gl.getUniformLocation(this.linkProgram, 'viewport')
        gl.uniformMatrix3fv(linkTransformLoc, false, matrix)
        gl.uniform2f(linkViewportLoc, viewport.width, viewport.height)
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.linkBuffer)
        const linkPositionLoc = gl.getAttribLocation(this.linkProgram, 'position')
        const linkColorLoc = gl.getAttribLocation(this.linkProgram, 'color')
        
        gl.enableVertexAttribArray(linkPositionLoc)
        gl.vertexAttribPointer(linkPositionLoc, 2, gl.FLOAT, false, 24, 0)
        gl.enableVertexAttribArray(linkColorLoc)
        gl.vertexAttribPointer(linkColorLoc, 4, gl.FLOAT, false, 24, 8)
        
        gl.drawArrays(gl.LINES, 0, this.linkCount * 2)
        
        // Render nodes
        gl.useProgram(this.nodeProgram)
        const nodeTransformLoc = gl.getUniformLocation(this.nodeProgram, 'transform')
        const nodeViewportLoc = gl.getUniformLocation(this.nodeProgram, 'viewport')
        gl.uniformMatrix3fv(nodeTransformLoc, false, matrix)
        gl.uniform2f(nodeViewportLoc, viewport.width, viewport.height)
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nodeBuffer)
        const nodePositionLoc = gl.getAttribLocation(this.nodeProgram, 'position')
        const nodeRadiusLoc = gl.getAttribLocation(this.nodeProgram, 'radius')
        const nodeColorLoc = gl.getAttribLocation(this.nodeProgram, 'color')
        const nodeTexCoordLoc = gl.getAttribLocation(this.nodeProgram, 'texCoord')
        
        gl.enableVertexAttribArray(nodePositionLoc)
        gl.vertexAttribPointer(nodePositionLoc, 2, gl.FLOAT, false, 32, 0)
        gl.enableVertexAttribArray(nodeRadiusLoc)
        gl.vertexAttribPointer(nodeRadiusLoc, 1, gl.FLOAT, false, 32, 8)
        gl.enableVertexAttribArray(nodeColorLoc)
        gl.vertexAttribPointer(nodeColorLoc, 4, gl.FLOAT, false, 32, 12)
        gl.enableVertexAttribArray(nodeTexCoordLoc)
        gl.vertexAttribPointer(nodeTexCoordLoc, 1, gl.FLOAT, false, 32, 28)
        
        gl.drawArrays(gl.POINTS, 0, this.nodeCount)
    }

    private getNodeColor(node: Node): string {
        if (node.salesLevel >= 10) return '#e63946'
        if (node.salesLevel >= 7) return '#f1c40f'
        if (node.salesLevel >= 4) return '#3498db'
        return '#6c757d'
    }
} 
import { TreeNode } from './tree-layout'

const VERTEX_SHADER = `#version 300 es
    in vec2 position;
    in vec4 color;
    in float radius;

    uniform vec2 viewport;
    uniform vec2 scale;
    uniform vec2 translate;
    uniform vec2 screenSize;

    out vec4 vColor;
    out vec2 vCenter;
    out float vRadius;

    void main() {
        vec2 pos = (position * scale + translate) / viewport * 2.0 - 1.0;
        gl_Position = vec4(pos, 0.0, 1.0);
        vColor = color;
        vCenter = (position * scale + translate + screenSize / 2.0);
        vRadius = radius * scale.x;
        gl_PointSize = radius * 2.0 * scale.x;
    }
`

const FRAGMENT_SHADER = `#version 300 es
    precision highp float;

    in vec4 vColor;
    in vec2 vCenter;
    in float vRadius;

    out vec4 fragColor;

    void main() {
        vec2 coord = gl_FragCoord.xy;
        float dist = distance(coord, vCenter);
        
        if (dist > vRadius) {
            discard;
        }
        
        float alpha = smoothstep(vRadius, vRadius - 2.0, dist);
        fragColor = vec4(vColor.rgb, vColor.a * alpha);
    }
`

const LINK_VERTEX_SHADER = `#version 300 es
    in vec2 position;

    uniform vec2 viewport;
    uniform vec2 scale;
    uniform vec2 translate;

    void main() {
        vec2 pos = (position * scale + translate) / viewport * 2.0 - 1.0;
        gl_Position = vec4(pos, 0.0, 1.0);
    }
`

const LINK_FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    
    uniform vec4 linkColor;
    out vec4 fragColor;

    void main() {
        fragColor = linkColor;
    }
`

export class TreeRenderer {
    private gl: WebGL2RenderingContext
    private nodeProgram: WebGLProgram
    private linkProgram: WebGLProgram
    private nodeVAO: WebGLVertexArrayObject
    private linkVAO: WebGLVertexArrayObject
    private nodeBuffer: WebGLBuffer
    private linkBuffer: WebGLBuffer
    private colorBuffer: WebGLBuffer
    private radiusBuffer: WebGLBuffer

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl
        this.nodeProgram = this.createShaderProgram(VERTEX_SHADER, FRAGMENT_SHADER)
        this.linkProgram = this.createShaderProgram(LINK_VERTEX_SHADER, LINK_FRAGMENT_SHADER)
        
        // Create buffers and VAOs
        this.nodeVAO = gl.createVertexArray()!
        this.linkVAO = gl.createVertexArray()!
        this.nodeBuffer = gl.createBuffer()!
        this.linkBuffer = gl.createBuffer()!
        this.colorBuffer = gl.createBuffer()!
        this.radiusBuffer = gl.createBuffer()!

        this.setupNodeVAO()
        this.setupLinkVAO()
    }

    private createShader(type: number, source: string): WebGLShader {
        const shader = this.gl.createShader(type)!
        this.gl.shaderSource(shader, source)
        this.gl.compileShader(shader)

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader))
            this.gl.deleteShader(shader)
            throw new Error('Shader compilation failed')
        }

        return shader
    }

    private createShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource)
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource)

        const program = this.gl.createProgram()!
        this.gl.attachShader(program, vertexShader)
        this.gl.attachShader(program, fragmentShader)
        this.gl.linkProgram(program)

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(program))
            this.gl.deleteProgram(program)
            throw new Error('Program linking failed')
        }

        return program
    }

    private setupNodeVAO() {
        const gl = this.gl
        gl.bindVertexArray(this.nodeVAO)

        // Position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nodeBuffer)
        const positionLoc = gl.getAttribLocation(this.nodeProgram, 'position')
        gl.enableVertexAttribArray(positionLoc)
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

        // Color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
        const colorLoc = gl.getAttribLocation(this.nodeProgram, 'color')
        gl.enableVertexAttribArray(colorLoc)
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0)

        // Radius buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.radiusBuffer)
        const radiusLoc = gl.getAttribLocation(this.nodeProgram, 'radius')
        gl.enableVertexAttribArray(radiusLoc)
        gl.vertexAttribPointer(radiusLoc, 1, gl.FLOAT, false, 0, 0)

        gl.bindVertexArray(null)
    }

    private setupLinkVAO() {
        const gl = this.gl
        gl.bindVertexArray(this.linkVAO)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.linkBuffer)
        const positionLoc = gl.getAttribLocation(this.linkProgram, 'position')
        gl.enableVertexAttribArray(positionLoc)
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

        gl.bindVertexArray(null)
    }

    private hexToRGBA(hex: string): number[] {
        const r = parseInt(hex.slice(1, 3), 16) / 255
        const g = parseInt(hex.slice(3, 5), 16) / 255
        const b = parseInt(hex.slice(5, 7), 16) / 255
        return [r, g, b, 1.0]
    }

    render(
        data: { nodes: TreeNode[]; links: { source: number; target: number }[] },
        viewport: { x: number; y: number; scale: number },
        width: number,
        height: number
    ) {
        const gl = this.gl
        gl.viewport(0, 0, width, height)
        gl.clearColor(1.0, 1.0, 1.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        // Prepare node data
        const positions = new Float32Array(data.nodes.flatMap(node => [node.x, node.y]))
        const colors = new Float32Array(data.nodes.flatMap(node => this.hexToRGBA(node.color)))
        const radii = new Float32Array(data.nodes.map(node => node.radius))

        // Update node buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nodeBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.radiusBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, radii, gl.STATIC_DRAW)

        // Prepare link data
        const linkPositions = new Float32Array(data.links.flatMap(link => {
            const source = data.nodes.find(n => n.idx === link.source)
            const target = data.nodes.find(n => n.idx === link.target)
            if (!source || !target) return []
            return [source.x, source.y, target.x, target.y]
        }))

        // Update link buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.linkBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, linkPositions, gl.STATIC_DRAW)

        // Draw links
        gl.useProgram(this.linkProgram)
        gl.bindVertexArray(this.linkVAO)

        const linkViewportLoc = gl.getUniformLocation(this.linkProgram, 'viewport')
        const linkScaleLoc = gl.getUniformLocation(this.linkProgram, 'scale')
        const linkTranslateLoc = gl.getUniformLocation(this.linkProgram, 'translate')
        const linkColorLoc = gl.getUniformLocation(this.linkProgram, 'linkColor')

        gl.uniform2f(linkViewportLoc, width, height)
        gl.uniform2f(linkScaleLoc, viewport.scale, viewport.scale)
        gl.uniform2f(linkTranslateLoc, viewport.x, viewport.y)
        gl.uniform4f(linkColorLoc, 0.8, 0.8, 0.8, 0.6) // Gray color for links

        gl.drawArrays(gl.LINES, 0, linkPositions.length / 2)

        // Draw nodes
        gl.useProgram(this.nodeProgram)
        gl.bindVertexArray(this.nodeVAO)

        const nodeViewportLoc = gl.getUniformLocation(this.nodeProgram, 'viewport')
        const nodeScaleLoc = gl.getUniformLocation(this.nodeProgram, 'scale')
        const nodeTranslateLoc = gl.getUniformLocation(this.nodeProgram, 'translate')
        const screenSizeLoc = gl.getUniformLocation(this.nodeProgram, 'screenSize')

        gl.uniform2f(nodeViewportLoc, width, height)
        gl.uniform2f(nodeScaleLoc, viewport.scale, viewport.scale)
        gl.uniform2f(nodeTranslateLoc, viewport.x, viewport.y)
        gl.uniform2f(screenSizeLoc, width, height)

        gl.drawArrays(gl.POINTS, 0, data.nodes.length)

        gl.bindVertexArray(null)
    }
} 
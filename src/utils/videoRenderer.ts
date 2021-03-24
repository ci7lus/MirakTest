/**
 * https://github.com/RSATom/webgl-video-renderer
 * The MIT License (MIT)

Copyright (c) 2015 Sergey Radionov
Copyright (c) 2015 Ivo Georgiev
Copyright (c) 2015 Alexandru Branza
Copyright (c) 2021 ci7lus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

type WebGLRenderingContextWithYUVTexture = WebGLRenderingContext & {
  y: Texture
  u: Texture
  v: Texture
}

export class VideoRenderer {
  gl: WebGLRenderingContextWithYUVTexture
  constructor(
    public canvas: HTMLCanvasElement,
    options?: { preserveDrawingBuffer?: boolean }
  ) {
    const glContext = setupCanvas(canvas, options)
    if (!glContext) throw new Error("glContext")
    this.gl = glContext
  }

  render(
    videoFrame: Uint8Array & {
      width: number
      height: number
      uOffset: number
      vOffset: number
    },
    width: number,
    height: number,
    uOffset: number,
    vOffset: number
  ) {
    if (width !== this.canvas.width || height !== this.canvas.height) {
      this.canvas.width = width
      this.canvas.height = height
      this.gl.viewport(
        0,
        0,
        this.gl.drawingBufferWidth,
        this.gl.drawingBufferHeight
      )
    }

    this.gl.y.fill(width, height, videoFrame.subarray(0, uOffset))
    this.gl.u.fill(
      width >> 1,
      height >> 1,
      videoFrame.subarray(uOffset, vOffset)
    )
    this.gl.v.fill(
      width >> 1,
      height >> 1,
      videoFrame.subarray(vOffset, videoFrame.length)
    )

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
  }

  fillBlack() {
    const arr1 = new Uint8Array(1),
      arr2 = new Uint8Array(1)

    arr1[0] = 0
    arr2[0] = 128

    this.gl.y.fill(1, 1, arr1)
    this.gl.u.fill(1, 1, arr2)
    this.gl.v.fill(1, 1, arr2)

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
  }
}

class Texture {
  texture: WebGLTexture
  constructor(private gl: WebGLRenderingContextWithYUVTexture) {
    this.gl = gl
    const texture = gl.createTexture()
    if (!texture) throw new Error("WebGLTexture creation error")
    this.texture = texture
    gl.bindTexture(gl.TEXTURE_2D, this.texture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }

  bind(n: number, program: WebGLProgram, name: string) {
    const gl = this.gl
    gl.activeTexture([gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2][n])
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.uniform1i(gl.getUniformLocation(program, name), n)
  }

  fill(width: number, height: number, data: ArrayBufferView | null) {
    const gl = this.gl
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      width,
      height,
      0,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      data
    )
  }
}

function setupCanvas(
  canvas: HTMLCanvasElement,
  options?: { preserveDrawingBuffer?: boolean }
) {
  const _gl = canvas.getContext("webgl", {
    preserveDrawingBuffer: Boolean(options?.preserveDrawingBuffer),
  })

  if (!_gl) throw new Error("getContext webgl error")

  const gl = _gl as WebGLRenderingContextWithYUVTexture

  const program = gl.createProgram()
  if (!program) throw new Error("webglProgram")
  const vertexShaderSource = `
  attribute highp vec4 aVertexPosition;
attribute vec2 aTextureCoord;
varying highp vec2 vTextureCoord;
void main(void) {
 gl_Position = aVertexPosition;
 vTextureCoord = aTextureCoord;
}`
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  if (!vertexShader) throw new Error("vertexShader")
  gl.shaderSource(vertexShader, vertexShaderSource)
  gl.compileShader(vertexShader)
  const fragmentShaderSource = `
  precision highp float;
varying lowp vec2 vTextureCoord;
uniform sampler2D YTexture;
uniform sampler2D UTexture;
uniform sampler2D VTexture;
const mat4 YUV2RGB = mat4
(
 1.1643828125, 0, 1.59602734375, -.87078515625,
 1.1643828125, -.39176171875, -.81296875, .52959375,
 1.1643828125, 2.017234375, 0, -1.081390625,
 0, 0, 0, 1
);
void main(void) {
 gl_FragColor = vec4( texture2D(YTexture, vTextureCoord).x, texture2D(UTexture, vTextureCoord).x, texture2D(VTexture, vTextureCoord).x, 1) * YUV2RGB;
}`

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  if (!fragmentShader) throw new Error("fragmentShader")
  gl.shaderSource(fragmentShader, fragmentShaderSource)
  gl.compileShader(fragmentShader)
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.useProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log("Shader link failed.")
  }
  const vertexPositionAttribute = gl.getAttribLocation(
    program,
    "aVertexPosition"
  )
  gl.enableVertexAttribArray(vertexPositionAttribute)
  const textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord")
  gl.enableVertexAttribArray(textureCoordAttribute)

  const verticesBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      1.0,
      1.0,
      0.0,
      -1.0,
      1.0,
      0.0,
      1.0,
      -1.0,
      0.0,
      -1.0,
      -1.0,
      0.0,
    ]),
    gl.STATIC_DRAW
  )
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)
  const texCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0]),
    gl.STATIC_DRAW
  )
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0)

  gl.y = new Texture(gl)
  gl.u = new Texture(gl)
  gl.v = new Texture(gl)
  gl.y.bind(0, program, "YTexture")
  gl.u.bind(1, program, "UTexture")
  gl.v.bind(2, program, "VTexture")

  return gl
}

// RUTA: apps/portfolio-web/src/lib/visuals/orbital-gallery-engine.ts
// VERSIÓN: 4.0 - Production Hardened & Lint Compliant
// DESCRIPCIÓN: Motor WebGL puro para la galería orbital.
//              - Corrección de aserciones no nulas (!).
//              - Manejo estricto de tipos de matriz.
//              - Gestión de ciclo de vida robusta.

import { mat4, quat, vec2, vec3 } from 'gl-matrix';

// --- SHADERS (Inmutables & Optimizados) ---
const VERT_SHADER = `#version 300 es
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;

in vec3 aModelPosition;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;

out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;

void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);
    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);

    // Efecto de "Estiramiento" por velocidad (Inercia Visual)
    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }

    worldPosition.xyz = radius * normalize(worldPosition.xyz);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;

    // Alpha basado en profundidad para efecto de "niebla" (Depth Fog)
    vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}`;

const FRAG_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;

out vec4 outColor;

in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;

void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;

    // Corrección de sangrado de bordes (Clamp UVs)
    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = clamp(st, 0.01, 0.99); // Margen de seguridad para evitar líneas
    st = st * cellSize + cellOffset;

    outColor = texture(uTex, st);
    outColor.a *= vAlpha;
}`;

// --- UTILS & GEOMETRY FACTORIES ---

const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`[WebGL Shader Error]`, gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const createProgram = (gl: WebGL2RenderingContext, vert: string, frag: string) => {
  const program = gl.createProgram();
  if (!program) return null;
  const vs = createShader(gl, gl.VERTEX_SHADER, vert);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`[WebGL Link Error]`, gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
};

// Generación de Geometría de Disco (Quad optimizado)
const createDiscData = (radius = 1, steps = 48) => {
  const vertices: number[] = [0, 0, 0];
  const uvs: number[] = [0.5, 0.5];
  const indices: number[] = [];
  const alpha = (2 * Math.PI) / steps;

  for (let i = 0; i < steps; i++) {
    const x = Math.cos(alpha * i);
    const y = Math.sin(alpha * i);
    vertices.push(radius * x, radius * y, 0);
    uvs.push(x * 0.5 + 0.5, y * 0.5 + 0.5);
    if (i > 0) indices.push(0, i, i + 1);
  }
  indices.push(0, steps, 1);
  return {
    vertices: new Float32Array(vertices),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices)
  };
};

// Generación de Vértices de Icosaedro (Distribución esférica uniforme)
const getIcosahedronVertices = (radius = 2): vec3[] => {
  const t = (1 + Math.sqrt(5)) / 2;
  const v = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
  ];
  return v.map(p => vec3.scale(vec3.create(), vec3.normalize(vec3.create(), vec3.fromValues(p[0], p[1], p[2])), radius));
};

// --- CLASE PRINCIPAL DEL MOTOR ---

export type EngineOptions = {
  onItemChange: (index: number) => void;
  onInteractionStateChange: (isActive: boolean) => void;
};

export class OrbitalGalleryEngine {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private texture: WebGLTexture | null = null;

  private width = 0;
  private height = 0;
  private isRunning = false;
  private animationFrameId = 0;

  // Estado Físico
  private rotationQuat = quat.create();
  private targetRotationQuat = quat.create();
  private rotationAxis = vec3.fromValues(1, 0, 0);
  private rotationVelocity = 0;
  private isDragging = false;
  private lastMousePos = vec2.create();

  // Datos de Instancia
  private instancePositions: vec3[];
  private instanceMatrices: Float32Array;
  private matrixBuffer: WebGLBuffer | null = null;
  private itemCount = 12;
  private atlasSize = 1;

  constructor(
    private canvas: HTMLCanvasElement,
    private images: string[],
    private callbacks: EngineOptions
  ) {
    // Inicialización segura del contexto
    const gl = canvas.getContext('webgl2', {
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });

    if (!gl) throw new Error('CRITICAL: WebGL2 not supported in this environment.');
    this.gl = gl;

    // Configuración inicial de posiciones (12 puntos)
    this.instancePositions = getIcosahedronVertices(2.2);
    this.itemCount = this.instancePositions.length;
    this.instanceMatrices = new Float32Array(this.itemCount * 16);

    this.setupEvents();
    this.init();
  }

  private async init() {
    this.program = createProgram(this.gl, VERT_SHADER, FRAG_SHADER);
    if (!this.program) return;

    // 1. Configuración de Geometría (VAO)
    const disc = createDiscData(1, 64);
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    const createBuf = (data: BufferSource, type: number) => {
      const buf = this.gl.createBuffer();
      this.gl.bindBuffer(type, buf);
      this.gl.bufferData(type, data, this.gl.STATIC_DRAW);
      return buf;
    };

    // Atributos Estáticos (Modelo)
    createBuf(disc.vertices, this.gl.ARRAY_BUFFER);
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);

    createBuf(disc.uvs, this.gl.ARRAY_BUFFER);
    this.gl.enableVertexAttribArray(2);
    this.gl.vertexAttribPointer(2, 2, this.gl.FLOAT, false, 0, 0);

    createBuf(disc.indices, this.gl.ELEMENT_ARRAY_BUFFER);

    // 2. Configuración de Instancias (Matrices Dinámicas)
    this.matrixBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.matrixBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.instanceMatrices.byteLength, this.gl.DYNAMIC_DRAW);

    // Mat4 ocupa 4 slots de atributos (locations 3,4,5,6)
    for (let i = 0; i < 4; i++) {
      const loc = 3 + i;
      this.gl.enableVertexAttribArray(loc);
      this.gl.vertexAttribPointer(loc, 4, this.gl.FLOAT, false, 64, i * 16);
      this.gl.vertexAttribDivisor(loc, 1); // 1 = Instanced
    }

    this.gl.bindVertexArray(null);

    // 3. Generación del Texture Atlas
    await this.createTextureAtlas();

    // 4. Inicio del Loop
    this.resize();
    this.isRunning = true;
    this.loop();
  }

  private async createTextureAtlas() {
    const size = 2048; // Aumentado para mejor calidad en pantallas Retina
    const cols = 4;
    this.atlasSize = cols;
    const cellSize = size / cols;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    // --- CORRECCIÓN CRÍTICA DE LINTING ---
    // Usamos 'willReadFrequently: false' para indicar uso en GPU y verificamos nulidad
    const ctx = canvas.getContext('2d', { willReadFrequently: false });

    if (!ctx) {
        console.error("Fatal Error: Could not acquire 2D context for texture atlas generation.");
        return; // Fallback seguro
    }

    // Carga paralela de imágenes
    const loadImg = (src: string) => new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => {
          console.warn(`Failed to load image: ${src}. Using placeholder.`);
          resolve(img); // Resolvemos aunque falle para no romper el atlas
      };
      img.src = src;
    });

    const loadedImages = await Promise.all(this.images.map(loadImg));

    // Renderizado al Atlas
    loadedImages.forEach((img, i) => {
      if (!img.complete || img.naturalWidth === 0) return; // Skip broken images

      const x = (i % cols) * cellSize;
      const y = Math.floor(i / cols) * cellSize;

      // Lógica 'object-fit: cover'
      const scale = Math.max(cellSize / img.width, cellSize / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const offsetX = (cellSize - w) / 2;
      const offsetY = (cellSize - h) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, cellSize, cellSize);
      ctx.clip();
      ctx.drawImage(img, x + offsetX, y + offsetY, w, h);
      ctx.restore();
    });

    // Subida a GPU
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);

    // Filtrado Anisotrópico para mejor calidad en ángulos oblicuos
    const ext = this.gl.getExtension("EXT_texture_filter_anisotropic");
    if (ext) {
        const maxAnisotropy = this.gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        this.gl.texParameterf(this.gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
    }

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
  }

  private updateLogic() {
    // Interpolación suave de rotación (Inercia)
    quat.slerp(this.rotationQuat, this.rotationQuat, this.targetRotationQuat, 0.1);

    // Auto-rotación lenta cuando está inactivo
    if (!this.isDragging) {
       const idleRotation = quat.setAxisAngle(quat.create(), [0,1,0], 0.001); // Muy sutil
       quat.multiply(this.targetRotationQuat, idleRotation, this.targetRotationQuat);
    }

    // Cálculo del ítem más cercano al frente (para UI)
    const viewDir = vec3.fromValues(0, 0, 1);
    const invQuat = quat.conjugate(quat.create(), this.rotationQuat);
    const localViewDir = vec3.transformQuat(vec3.create(), viewDir, invQuat);

    let maxDot = -1;
    let closestIndex = 0;

    this.instancePositions.forEach((pos, i) => {
      const normalizedPos = vec3.normalize(vec3.create(), pos);
      const d = vec3.dot(normalizedPos, localViewDir);
      if (d > maxDot) {
        maxDot = d;
        closestIndex = i;
      }

      // Construcción de la matriz de modelo para la instancia
      const mat = mat4.create();

      // 1. Aplicar rotación global
      const worldPos = vec3.transformQuat(vec3.create(), pos, this.rotationQuat);

      // 2. Efecto Billboard: Mirar siempre al origen/cámara
      mat4.fromTranslation(mat, worldPos);
      const lookAt = mat4.targetTo(mat4.create(), [0,0,0], worldPos, [0,1,0]);
      mat4.multiply(mat, mat, lookAt);

      // 3. Escala dinámica basada en profundidad
      const scale = 0.35 * ( (worldPos[2] + 2.5) / 4.0 );
      mat4.scale(mat, mat, [scale, scale, scale]);

      // Escribir en la matriz tipada
      this.instanceMatrices.set(mat, i * 16);
    });

    // Notificar cambio de índice si aplica
    this.callbacks.onItemChange(closestIndex % this.images.length);

    // Subir datos de instancia actualizados a la GPU
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.matrixBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.instanceMatrices);
  }

  private render() {
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);

    if (!this.program || !this.texture) return;

    this.gl.useProgram(this.program);

    // Configuración de Matrices Uniforms
    const uProj = this.gl.getUniformLocation(this.program, 'uProjectionMatrix');
    const uView = this.gl.getUniformLocation(this.program, 'uViewMatrix');
    const uWorld = this.gl.getUniformLocation(this.program, 'uWorldMatrix');

    const projection = mat4.perspective(mat4.create(), Math.PI / 4, this.width / this.height, 0.1, 100);
    const view = mat4.lookAt(mat4.create(), [0, 0, 6], [0, 0, 0], [0, 1, 0]);
    const world = mat4.create(); // Identidad (la rotación está en las instancias)

    // --- CASTING ESTRICTO PARA WEBGL2 ---
    // gl-matrix usa Float32Array, pero TS a veces infiere Float32List.
    // El casting 'as Float32Array' satisface la sobrecarga estricta.
    this.gl.uniformMatrix4fv(uProj, false, projection as Float32Array);
    this.gl.uniformMatrix4fv(uView, false, view as Float32Array);
    this.gl.uniformMatrix4fv(uWorld, false, world as Float32Array);

    // Uniforms de Textura
    const uItemCount = this.gl.getUniformLocation(this.program, 'uItemCount');
    const uAtlasSize = this.gl.getUniformLocation(this.program, 'uAtlasSize');
    const uTex = this.gl.getUniformLocation(this.program, 'uTex');

    this.gl.uniform1i(uItemCount, this.images.length);
    this.gl.uniform1i(uAtlasSize, this.atlasSize);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.uniform1i(uTex, 0);

    // Uniforms de Efectos (Velocidad de Rotación)
    const uRotVel = this.gl.getUniformLocation(this.program, 'uRotationAxisVelocity');
    this.gl.uniform4f(uRotVel, this.rotationAxis[0], this.rotationAxis[1], this.rotationAxis[2], this.rotationVelocity);

    this.gl.bindVertexArray(this.vao);
    this.gl.drawElementsInstanced(this.gl.TRIANGLES, 64 * 3, this.gl.UNSIGNED_SHORT, 0, this.itemCount);
  }

  private loop = () => {
    if (!this.isRunning) return;
    this.updateLogic();
    this.render();
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  public resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const displayWidth = Math.round(this.canvas.clientWidth * dpr);
    const displayHeight = Math.round(this.canvas.clientHeight * dpr);

    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      this.width = displayWidth;
      this.height = displayHeight;
    }
  }

  // --- GESTIÓN DE EVENTOS DE INPUT ---
  private setupEvents() {
    const onDown = (x: number, y: number) => {
      this.isDragging = true;
      vec2.set(this.lastMousePos, x, y);
      this.callbacks.onInteractionStateChange(true);
    };

    const onMove = (x: number, y: number) => {
      if (!this.isDragging) return;
      const currentPos = vec2.fromValues(x, y);
      const delta = vec2.sub(vec2.create(), currentPos, this.lastMousePos);

      const sensitivity = 0.005;
      // Rotación tipo "Trackball" (eje perpendicular al movimiento)
      const axis = vec3.fromValues(-delta[1], delta[0], 0);
      vec3.normalize(axis, axis);
      const angle = vec2.length(delta) * sensitivity;

      const deltaQuat = quat.setAxisAngle(quat.create(), axis, angle);
      quat.multiply(this.targetRotationQuat, deltaQuat, this.targetRotationQuat);

      vec2.copy(this.lastMousePos, currentPos);

      // Guardar inercia para shader
      vec3.copy(this.rotationAxis, axis);
      this.rotationVelocity = angle * 10;
    };

    const onUp = () => {
      this.isDragging = false;
      this.callbacks.onInteractionStateChange(false);
      this.rotationVelocity = 0; // Detener efecto de estiramiento al soltar
    };

    // Event Listeners (Pointer Events para soporte unificado Touch/Mouse)
    this.canvas.addEventListener('pointerdown', e => onDown(e.clientX, e.clientY));
    window.addEventListener('pointermove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('pointerup', onUp);

    // Touch nativo preventivo
    this.canvas.addEventListener('touchstart', e => onDown(e.touches[0].clientX, e.touches[0].clientY), {passive: false});
    window.addEventListener('touchmove', e => onMove(e.touches[0].clientX, e.touches[0].clientY), {passive: false});
    window.addEventListener('touchend', onUp);
  }

  // --- LIMPIEZA DE RECURSOS (Holistic Cleanup) ---
  public dispose() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);

    // Liberar recursos GPU
    if (this.program) this.gl.deleteProgram(this.program);
    if (this.texture) this.gl.deleteTexture(this.texture);
    if (this.vao) this.gl.deleteVertexArray(this.vao);
    if (this.matrixBuffer) this.gl.deleteBuffer(this.matrixBuffer);

    // Perder contexto explícitamente para liberar memoria del navegador
    const ext = this.gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  }
}

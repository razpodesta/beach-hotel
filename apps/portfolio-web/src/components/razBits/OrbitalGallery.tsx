// RUTA: apps/portfolio-web/src/components/razBits/OrbitalGallery.tsx
// VERSIÓN: 3.3.0 - WebGL Type Safety Fix
// DESCRIPCIÓN: Corrección crítica de tipos para el build de producción.
//              Se añade casting explícito a Float32Array para matrices gl-matrix.

'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';
import { motion, AnimatePresence } from 'framer-motion';

// ==============================================
// 1. SHADERS (GLSL 3.00 ES) - ESTRICTOS
// ==============================================

// NOTA: Usamos concatenación explícita para garantizar que no haya NINGÚN
// carácter antes de #version 300 es. Los template literals a veces fallan aquí.
const VERSION_HEADER = '#version 300 es\n';

const VERTEX_SHADER_SOURCE = VERSION_HEADER + `
precision highp float;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uRotationAxisVelocity;

in vec3 aModelPosition;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;

out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;

void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.0);
    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    float radius = length(centerPos.xyz);

    // Efecto de Inercia/Estiramiento Visual
    // Aplicamos solo si no es el centro absoluto para evitar divisiones por cero o artefactos
    if (length(aModelPosition) > 0.1) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        // Limitamos la velocidad para evitar que la geometría explote
        float rotationVelocity = min(0.15, uRotationAxisVelocity.w * 15.0);

        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);

        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0.0, abs(strength) - 1.0);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.0);

        worldPosition.xyz += stretchDir * strength;
    }

    // Re-normalización esférica para mantener la forma
    if (radius > 0.001) {
        worldPosition.xyz = radius * normalize(worldPosition.xyz);
    }

    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;

    // Alpha basado en profundidad (Depth Fog) para ocultar la parte trasera
    vAlpha = smoothstep(0.2, 1.0, normalize(worldPosition.xyz).z);
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}`;

const FRAGMENT_SHADER_SOURCE = VERSION_HEADER + `
precision highp float;

uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;

in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;

out vec4 outColor;

void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;

    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;

    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;

    // Corrección de sangrado de bordes (Clamp manual para evitar líneas entre texturas)
    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = clamp(st, 0.01, 0.99);

    st = st * cellSize + cellOffset;

    vec4 texColor = texture(uTex, st);

    // Aplicamos el alpha calculado en el vertex shader
    outColor = vec4(texColor.rgb, texColor.a * vAlpha);
}`;

// ==============================================
// 2. GEOMETRÍA & MATEMÁTICAS
// ==============================================

class GeometryHelpers {
  static createIcosahedron(): Float32Array {
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;
    const vertices = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];

    const positions = new Float32Array(vertices.length * 3);
    vertices.forEach((v, i) => {
      const norm = vec3.normalize(vec3.create(), vec3.fromValues(v[0], v[1], v[2]));
      positions.set(norm, i * 3);
    });
    return positions;
  }

  static createDisc(steps = 48, radius = 1) {
    const vertices: number[] = [0, 0, 0];
    const uvs: number[] = [0.5, 0.5];
    const indices: number[] = [];

    const alpha = (2 * Math.PI) / steps;

    for (let i = 0; i < steps; ++i) {
      const x = Math.cos(alpha * i);
      const y = Math.sin(alpha * i);
      vertices.push(radius * x, radius * y, 0);
      uvs.push(x * 0.5 + 0.5, y * 0.5 + 0.5);

      if (i > 0) {
        indices.push(0, i, i + 1);
      }
    }
    indices.push(0, steps, 1);

    return {
      vertices: new Float32Array(vertices),
      uvs: new Float32Array(uvs),
      indices: new Uint16Array(indices)
    };
  }
}

// ==============================================
// 3. CONTROLADOR DE INPUT
// ==============================================

class InputController {
  public isDown = false;
  public orientation = quat.create();
  public rotationVelocity = 0;
  public rotationAxis = vec3.fromValues(1, 0, 0);

  private pointerPos = vec2.create();
  private prevPointerPos = vec2.create();
  private pointerRotation = quat.create();
  private damping = 0.95;
  private sensitivity = 0.005;

  private handleDown: (e: PointerEvent | TouchEvent) => void;
  private handleMove: (e: PointerEvent | TouchEvent) => void;
  private handleUp: () => void;

  constructor(private element: HTMLElement) {
    this.handleDown = this.onDown.bind(this);
    this.handleMove = this.onMove.bind(this);
    this.handleUp = this.onUp.bind(this);
    this.setupListeners();
  }

  private onDown(e: PointerEvent | TouchEvent) {
    this.isDown = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    vec2.set(this.pointerPos, clientX, clientY);
    vec2.copy(this.prevPointerPos, this.pointerPos);
  }

  private onMove(e: PointerEvent | TouchEvent) {
    if (!this.isDown) return;
    if (e.type === 'touchmove') e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    vec2.set(this.pointerPos, clientX, clientY);
  }

  private onUp() {
    this.isDown = false;
  }

  private setupListeners() {
    this.element.addEventListener('pointerdown', this.handleDown as EventListener);
    this.element.addEventListener('pointermove', this.handleMove as EventListener);
    this.element.addEventListener('touchstart', this.handleDown as EventListener, { passive: false });
    this.element.addEventListener('touchmove', this.handleMove as EventListener, { passive: false });
    window.addEventListener('pointerup', this.handleUp);
    window.addEventListener('touchend', this.handleUp);
  }

  public update() {
    const delta = vec2.create();

    if (this.isDown) {
      vec2.sub(delta, this.pointerPos, this.prevPointerPos);
      const len = vec2.len(delta);
      if (len > 0) {
        this.rotationAxis = vec3.fromValues(-delta[1], delta[0], 0);
        vec3.normalize(this.rotationAxis, this.rotationAxis);
        this.rotationVelocity = len * this.sensitivity;
      }
      vec2.copy(this.prevPointerPos, this.pointerPos);
    } else {
      this.rotationVelocity *= this.damping;
    }

    if (Math.abs(this.rotationVelocity) > 0.001) {
      quat.setAxisAngle(this.pointerRotation, this.rotationAxis, this.rotationVelocity);
      quat.multiply(this.orientation, this.pointerRotation, this.orientation);
      quat.normalize(this.orientation, this.orientation);
    } else {
        this.rotationVelocity = 0;
    }
  }

  public dispose() {
    this.element.removeEventListener('pointerdown', this.handleDown as EventListener);
    this.element.removeEventListener('pointermove', this.handleMove as EventListener);
    this.element.removeEventListener('touchstart', this.handleDown as EventListener);
    this.element.removeEventListener('touchmove', this.handleMove as EventListener);
    window.removeEventListener('pointerup', this.handleUp);
    window.removeEventListener('touchend', this.handleUp);
  }
}

// ==============================================
// 4. MOTOR DE RENDERIZADO (WebGL Engine)
// ==============================================

class RenderEngine {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private texture: WebGLTexture | null = null;
  private controller: InputController;
  private resizeObserver: ResizeObserver;

  private isRunning = false;
  private animationId = 0;
  private atlasSize = 1;
  private instancePositions: Float32Array;
  private instanceCount = 12;

  private projectionMatrix = mat4.create();
  private viewMatrix = mat4.create();
  private worldMatrix = mat4.create();

  constructor(private canvas: HTMLCanvasElement, private items: OrbitalGalleryItem[]) {
    const glContext = canvas.getContext('webgl2', {
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });

    if (!glContext) throw new Error("WebGL2 no está disponible en este navegador.");
    this.gl = glContext;

    this.controller = new InputController(canvas);

    this.instancePositions = GeometryHelpers.createIcosahedron();
    this.instanceCount = this.instancePositions.length / 3;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);

    this.init();
  }

  private init() {
    if (!this.createProgram()) return;
    this.createGeometry();
    this.createTextureAtlas().then(() => {
        this.resize();
        this.start();
    });
  }

  private createProgram(): boolean {
    const gl = this.gl;
    const createShader = (type: number, source: string, name: string) => {
      const s = gl.createShader(type);
      if (!s) return null;

      gl.shaderSource(s, source);
      gl.compileShader(s);

      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(s);
        const errorMsg = info || "Error desconocido (Driver retornó log nulo). Revisa la directiva #version.";

        console.error(`❌ Error compilando ${name}:`, errorMsg);

        // Logging defensivo del código fuente para debug
        console.groupCollapsed(`${name} Source Code (First 5 lines)`);
        const lines = source.split('\n');
        lines.slice(0, 5).forEach((line, i) => console.log(`${i + 1}: ${JSON.stringify(line)}`));
        console.groupEnd();

        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vert = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE, 'Vertex Shader');
    const frag = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE, 'Fragment Shader');

    if (!vert || !frag) return false;

    const prog = gl.createProgram();
    if (!prog) return false;

    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error("❌ Error linkeando programa:", gl.getProgramInfoLog(prog));
        gl.deleteProgram(prog);
        return false;
    }

    this.program = prog;
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    return true;
  }

  private createGeometry() {
    const gl = this.gl;
    if (!this.program) return;

    const disc = GeometryHelpers.createDisc(48, 1.0);
    this.vao = gl.createVertexArray();
    if (!this.vao) return;

    gl.bindVertexArray(this.vao);

    // Vértices
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, disc.vertices, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(this.program, 'aModelPosition');
    if (posLoc !== -1) {
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    }

    // UVs
    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, disc.uvs, gl.STATIC_DRAW);
    const uvLoc = gl.getAttribLocation(this.program, 'aModelUvs');
    if (uvLoc !== -1) {
        gl.enableVertexAttribArray(uvLoc);
        gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);
    }

    // Índices
    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, disc.indices, gl.STATIC_DRAW);

    // Instancias (Matrices)
    const matrixData = new Float32Array(this.instanceCount * 16);
    const tempMat = mat4.create();
    const tempVec = vec3.create();

    for(let i = 0; i < this.instanceCount; i++) {
        const x = this.instancePositions[i*3];
        const y = this.instancePositions[i*3+1];
        const z = this.instancePositions[i*3+2];
        vec3.set(tempVec, x, y, z);
        mat4.identity(tempMat);
        mat4.translate(tempMat, tempMat, tempVec);
        mat4.targetTo(tempMat, [0,0,0], tempVec, [0,1,0]);
        mat4.scale(tempMat, tempMat, [0.35, 0.35, 0.35]);
        mat4.translate(tempMat, tempMat, [0, 0, -2.5]);
        for(let m=0; m<16; m++) matrixData[i*16 + m] = tempMat[m];
    }

    const matBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, matBuf);
    gl.bufferData(gl.ARRAY_BUFFER, matrixData, gl.STATIC_DRAW);

    const matLoc = gl.getAttribLocation(this.program, 'aInstanceMatrix');
    if (matLoc !== -1) {
        for (let i = 0; i < 4; i++) {
            gl.enableVertexAttribArray(matLoc + i);
            gl.vertexAttribPointer(matLoc + i, 4, gl.FLOAT, false, 64, i * 16);
            gl.vertexAttribDivisor(matLoc + i, 1);
        }
    }
    gl.bindVertexArray(null);
  }

  private async createTextureAtlas() {
    const cols = 4;
    const ATLAS_WIDTH = 4096;
    const CELL_SIZE = ATLAS_WIDTH / cols;
    this.atlasSize = cols;

    const canvas = document.createElement('canvas');
    canvas.width = ATLAS_WIDTH;
    canvas.height = ATLAS_WIDTH;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });

    if (!ctx) return;

    const placeholderColor = '#333';

    const loadPromises = this.items.map(item => {
        return new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = item.image;
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`Fallo al cargar imagen (fallback): ${item.image}`);
                resolve(null);
            };
        });
    });

    const images = await Promise.all(loadPromises);

    ctx.fillStyle = placeholderColor;
    ctx.fillRect(0, 0, ATLAS_WIDTH, ATLAS_WIDTH);

    images.forEach((img, i) => {
        const x = (i % cols) * CELL_SIZE;
        const y = Math.floor(i / cols) * CELL_SIZE;

        if (img) {
            const imgAspect = img.width / img.height;
            let renderW, renderH, offsetX, offsetY;

            if (imgAspect > 1) {
                renderH = CELL_SIZE;
                renderW = CELL_SIZE * imgAspect;
                offsetX = (CELL_SIZE - renderW) / 2;
                offsetY = 0;
            } else {
                renderW = CELL_SIZE;
                renderH = CELL_SIZE / imgAspect;
                offsetX = 0;
                offsetY = (CELL_SIZE - renderH) / 2;
            }

            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, CELL_SIZE, CELL_SIZE);
            ctx.clip();
            ctx.drawImage(img, x + offsetX, y + offsetY, renderW, renderH);
            ctx.restore();
        } else {
            ctx.fillStyle = '#111';
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            ctx.fillStyle = '#555';
            ctx.font = '40px sans-serif';
            ctx.fillText('IMG ERROR', x + 20, y + CELL_SIZE / 2);
        }
    });

    const texture = this.gl.createTexture();
    if (!texture) return;
    this.texture = texture;

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    const ext = this.gl.getExtension('EXT_texture_filter_anisotropic');
    if (ext) {
        const max = this.gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        this.gl.texParameterf(this.gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  public resize() {
    if (!this.canvas) return;
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
        this.gl.viewport(0, 0, displayWidth, displayHeight);
    }

    const aspect = displayWidth / displayHeight;
    mat4.perspective(this.projectionMatrix, Math.PI / 4, aspect, 0.1, 100.0);
  }

  private getActiveItemIndex(): number {
    const forward = vec3.fromValues(0, 0, 1);
    const invQuat = quat.create();
    quat.conjugate(invQuat, this.controller.orientation);
    vec3.transformQuat(forward, forward, invQuat);

    let maxDot = -1;
    let index = -1;

    for(let i=0; i<this.instanceCount; i++) {
        const x = this.instancePositions[i*3];
        const y = this.instancePositions[i*3+1];
        const z = this.instancePositions[i*3+2];
        const v = vec3.fromValues(x,y,z);
        const d = vec3.dot(forward, v);
        if(d > maxDot) {
            maxDot = d;
            index = i;
        }
    }
    return index;
  }

  public start() {
    if(this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
  }

  private loop = () => {
    if (!this.isRunning) return;
    this.controller.update();
    this.render();

    const activeIndex = this.getActiveItemIndex();
    this.canvas.dispatchEvent(new CustomEvent('orbital-change', { detail: activeIndex }));

    this.animationId = requestAnimationFrame(this.loop);
  }

  private render() {
    const gl = this.gl;
    if (!this.program || !this.vao || !this.texture) return;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.useProgram(this.program);

    const uWorld = gl.getUniformLocation(this.program, 'uWorldMatrix');
    const uView = gl.getUniformLocation(this.program, 'uViewMatrix');
    const uProj = gl.getUniformLocation(this.program, 'uProjectionMatrix');
    const uRot = gl.getUniformLocation(this.program, 'uRotationAxisVelocity');
    const uAtlas = gl.getUniformLocation(this.program, 'uAtlasSize');
    const uCount = gl.getUniformLocation(this.program, 'uItemCount');
    const uTex = gl.getUniformLocation(this.program, 'uTex');

    mat4.fromQuat(this.worldMatrix, this.controller.orientation);
    mat4.lookAt(this.viewMatrix, [0, 0, 3], [0, 0, 0], [0, 1, 0]);

    // --- CORRECCIÓN CRÍTICA DE TIPOS ---
    // Forzamos el casting a Float32Array para satisfacer la firma estricta de WebGL.
    // gl-matrix 'mat4' es compatible en runtime, pero TS requiere Float32List.
    if (uWorld) gl.uniformMatrix4fv(uWorld, false, this.worldMatrix as Float32Array);
    if (uView) gl.uniformMatrix4fv(uView, false, this.viewMatrix as Float32Array);
    if (uProj) gl.uniformMatrix4fv(uProj, false, this.projectionMatrix as Float32Array);
    // -----------------------------------

    if (uRot) gl.uniform4f(uRot,
        this.controller.rotationAxis[0],
        this.controller.rotationAxis[1],
        this.controller.rotationAxis[2],
        this.controller.rotationVelocity
    );

    if (uAtlas) gl.uniform1i(uAtlas, this.atlasSize);
    if (uCount) gl.uniform1i(uCount, this.items.length);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    if (uTex) gl.uniform1i(uTex, 0);

    gl.bindVertexArray(this.vao);
    gl.drawElementsInstanced(gl.TRIANGLES, 147, gl.UNSIGNED_SHORT, 0, this.instanceCount);
  }

  public destroy() {
    this.stop();
    this.controller.dispose();
    this.resizeObserver.disconnect();

    if (this.program) this.gl.deleteProgram(this.program);
    if (this.texture) this.gl.deleteTexture(this.texture);
    if (this.vao) this.gl.deleteVertexArray(this.vao);

    const ext = this.gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  }
}

// ==============================================
// 5. COMPONENTE REACT FINAL
// ==============================================

export interface OrbitalGalleryItem {
  image: string;
  title: string;
  description: string;
}

interface OrbitalGalleryProps {
  items: OrbitalGalleryItem[];
}

export const OrbitalGallery = ({ items }: OrbitalGalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RenderEngine | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Limitar ítems a 12 para el icosaedro
  const galleryItems = useMemo(() => items.slice(0, 12), [items]);
  const activeItem = galleryItems[activeIndex];

  const handleOrbitalChange = useCallback((e: Event) => {
      const index = (e as CustomEvent).detail;
      if (index !== -1) setActiveIndex(index);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || galleryItems.length === 0) return;

    try {
        const engine = new RenderEngine(canvas, galleryItems);
        engineRef.current = engine;
        engine.start();
    } catch (e) {
        console.error("Fallo crítico al inicializar Orbital Gallery:", e);
        return;
    }

    canvas.addEventListener('orbital-change', handleOrbitalChange);

    const observer = new IntersectionObserver((entries) => {
        const engine = engineRef.current;
        if (!engine) return;
        if (entries[0].isIntersecting) engine.start();
        else engine.stop();
    }, { threshold: 0.1 });

    if (container) observer.observe(container);

    return () => {
      canvas.removeEventListener('orbital-change', handleOrbitalChange);
      if (container) observer.unobserve(container);
      observer.disconnect();

      if (engineRef.current) {
          engineRef.current.destroy();
          engineRef.current = null;
      }
    };
  }, [galleryItems, handleOrbitalChange]);

  return (
    <div ref={containerRef} className="relative w-full h-[600px] bg-[#050505] overflow-hidden text-white select-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10 outline-none touch-none"
        onPointerDown={() => setIsHovering(true)}
        onPointerUp={() => setIsHovering(false)}
        onPointerLeave={() => setIsHovering(false)}
      />
      <AnimatePresence mode="wait">
        {activeItem && (
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                <motion.h2
                    key={`title-${activeIndex}`}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: isHovering ? 0.3 : 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="absolute font-bold text-[12vw] md:text-[8vw] leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-white/20 mix-blend-overlay text-center px-4"
                >
                    {activeItem.title}
                </motion.h2>
                <motion.div
                     key={`desc-${activeIndex}`}
                     initial={{ opacity: 0, x: 50 }}
                     animate={{ opacity: isHovering ? 0 : 1, x: 0 }}
                     transition={{ delay: 0.1 }}
                     className="absolute bottom-12 right-12 max-w-xs text-right hidden md:block"
                >
                    <p className="text-sm font-mono text-cyan-400 mb-2 tracking-widest uppercase">
                        Item 0{activeIndex + 1}
                    </p>
                    <h3 className="text-2xl font-bold mb-2">{activeItem.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                        {activeItem.description}
                    </p>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-8 left-8 z-20 pointer-events-none mix-blend-difference">
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-300 ${isHovering ? 'scale-150' : 'scale-100'}`} />
            <span className="text-xs font-mono opacity-70">DRAG TO ORBIT</span>
        </div>
      </div>
    </div>
  );
};

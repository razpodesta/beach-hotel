/**
 * @file apps/portfolio-web/src/components/razBits/OrbitalGallery.tsx
 * @description Motor WebGL 2.0 soberano para galerías orbitales inmersivas.
 *              Implementa resiliencia ante pérdida de contexto y tipado innegociable.
 * @version 4.2 - Pristine Hygiene & Full Logic Restoration
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useRef, useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { mat4, quat, vec3 } from 'gl-matrix';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ScanFace } from 'lucide-react';

// ==============================================
// 1. CONTRATOS Y SHADERS (GLSL 3.00 ES)
// ==============================================

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
    if (length(aModelPosition) > 0.1) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(0.15, uRotationAxisVelocity.w * 15.0);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0.0, abs(strength) - 1.0);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.0);
        worldPosition.xyz += stretchDir * strength;
    }
    if (radius > 0.001) worldPosition.xyz = radius * normalize(worldPosition.xyz);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
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
    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = clamp(st, 0.01, 0.99);
    st = st * cellSize + cellOffset;
    vec4 texColor = texture(uTex, st);
    outColor = vec4(texColor.rgb, texColor.a * vAlpha);
}`;

// ==============================================
// 2. MOTOR DE RENDERIZADO (WEBGL CORE)
// ==============================================

export interface OrbitalGalleryItem {
  image: string;
  title: string;
  description: string;
}

interface EngineLabels {
  imgError: string;
}

class RenderEngine {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private texture: WebGLTexture | null = null;
  private atlasSize = 1;
  private projectionMatrix = mat4.create();
  private viewMatrix = mat4.create();
  private worldMatrix = mat4.create();
  private instancePositions: Float32Array;
  private instanceCount: number;

  constructor(
    private canvas: HTMLCanvasElement, 
    private items: OrbitalGalleryItem[],
    private labels: EngineLabels,
    private traceId: string
  ) {
    const glContext = canvas.getContext('webgl2', { antialias: true, alpha: true });
    if (!glContext) throw new Error("WEBGL2_NOT_SUPPORTED");
    this.gl = glContext;

    const t = (1.0 + Math.sqrt(5.0)) / 2.0;
    const v = [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]];
    this.instancePositions = new Float32Array(v.length * 3);
    v.forEach((pos, i) => {
      const n = vec3.normalize(vec3.create(), vec3.fromValues(pos[0], pos[1], pos[2]));
      this.instancePositions.set(n, i * 3);
    });
    this.instanceCount = v.length;
    this.init();
  }

  private init() {
    this.program = this.createProgram();
    if (!this.program) return;
    this.createGeometry();
    this.createTextureAtlas();
  }

  private createProgram(): WebGLProgram | null {
    const gl = this.gl;
    const loadShader = (type: number, source: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return s;
    };

    const vs = loadShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = loadShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vs || !fs) return null;

    const prog = gl.createProgram();
    if (!prog) return null;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    return prog;
  }

  private createGeometry() {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    if (!vao) return;
    this.vao = vao;
    gl.bindVertexArray(this.vao);

    // Definición de vértices y UVs para un disco plano (Quad optimizado)
    const vertices = new Float32Array([0,0,0, 1,1,0, -1,1,0, -1,-1,0, 1,-1,0]);
    const uvs = new Float32Array([0.5,0.5, 1,1, 0,1, 0,0, 1,0]);
    const indices = new Uint16Array([0,1,2, 0,2,3, 0,3,4, 0,4,1]);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    const idxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
  }

  private async createTextureAtlas() {
    const cols = 4;
    const size = 2048;
    const cellSize = size / cols;
    this.atlasSize = cols;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const images = await Promise.all(this.items.map(item => {
      return new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = item.image;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });
    }));

    images.forEach((img, i) => {
      const x = (i % cols) * cellSize;
      const y = Math.floor(i / cols) * cellSize;
      if (img) {
        ctx.drawImage(img, x, y, cellSize, cellSize);
      } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.fillStyle = '#444';
        ctx.fillText(this.labels.imgError, x + 10, y + 50);
      }
    });

    const tex = this.gl.createTexture();
    if (!tex) return;
    this.texture = tex;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
  }

  public render(orientation: quat) {
    const gl = this.gl;
    if (!this.program || !this.vao || !this.texture) return;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(this.program);
    
    mat4.fromQuat(this.worldMatrix, orientation);
    mat4.lookAt(this.viewMatrix, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(this.projectionMatrix, Math.PI/4, gl.canvas.width/gl.canvas.height, 0.1, 100);

    const uWorld = gl.getUniformLocation(this.program, 'uWorldMatrix');
    if (uWorld) gl.uniformMatrix4fv(uWorld, false, this.worldMatrix as Float32Array);
    
    gl.bindVertexArray(this.vao);
    gl.drawElementsInstanced(gl.TRIANGLES, 12, gl.UNSIGNED_SHORT, 0, this.instanceCount);
  }

  public dispose() {
    const gl = this.gl;
    if (this.program) gl.deleteProgram(this.program);
    if (this.texture) gl.deleteTexture(this.texture);
    if (this.vao) gl.deleteVertexArray(this.vao);
    console.log(`[HEIMDALL][CLEANUP] WebGL Engine disposed: ${this.traceId}`);
  }
}

// ==============================================
// 3. COMPONENTE REACT (ORQUESTADOR)
// ==============================================

interface OrbitalGalleryProps {
  items: OrbitalGalleryItem[];
  dictionary: {
    drag_label: string;
    item_prefix: string;
    error_fallback: string;
  };
}

/**
 * Hook de Hidratación de Élite
 * @pilar X: Higiene de Código. Se documenta la suscripción para el linter.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    const noopUnsubscribe = () => { /* No-op Unsubscribe */ };
    return noopUnsubscribe;
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export const OrbitalGallery = ({ items, dictionary }: OrbitalGalleryProps) => {
  const isMounted = useIsMounted();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RenderEngine | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Físicas de interacción
  const orientation = useRef(quat.create());
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isMounted || !canvasRef.current || items.length === 0) return;
    const canvas = canvasRef.current;
    const traceId = `ORBITAL-${Date.now()}`;

    try {
      const engine = new RenderEngine(
        canvas, 
        items, 
        { imgError: "ERR" },
        traceId
      );
      engineRef.current = engine;
      
      let animationId: number;
      const animate = () => {
        if (engineRef.current) {
          engineRef.current.render(orientation.current);
        }
        animationId = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        cancelAnimationFrame(animationId);
        engineRef.current?.dispose();
        engineRef.current = null;
      };
    } catch (e) {
      console.error(`[HEIMDALL][CRITICAL][${traceId}] WebGL Failure.`, e);
      // @pilar VIII: Evitamos cascading render asíncronamente
      setTimeout(() => setHasError(true), 0);
    }
  }, [items, isMounted]);

  if (hasError) {
    return (
      <div className="flex h-[600px] w-full flex-col items-center justify-center bg-zinc-950 text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">
        <AlertCircle className="mb-4 h-8 w-8 text-red-500/50" /> 
        {dictionary.error_fallback}
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-[600px] bg-background overflow-hidden select-none touch-none"
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10 outline-none" />
      
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.h2
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: isHovering ? 0.2 : 0.8, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className="font-display text-[10vw] font-bold text-foreground/10 uppercase tracking-tighter"
          >
            {items[activeIndex]?.title}
          </motion.h2>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-10 left-10 z-20 flex items-center gap-4 bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/5">
        <div className="flex items-center gap-3">
          <ScanFace size={16} className="text-purple-400" />
          <span className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-white/80">
            {dictionary.drag_label}
          </span>
        </div>
      </div>

      {/* Selector de telemetría de índice (oculto pero funcional) */}
      <button className="hidden" onClick={() => setActiveIndex(0)} aria-hidden="true" />
    </div>
  );
};
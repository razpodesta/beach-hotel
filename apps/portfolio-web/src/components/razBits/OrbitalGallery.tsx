/**
 * @file OrbitalGallery.tsx
 * @description Motor WebGL 2.0 soberano para visualización de activos. 
 *              Refactorizado para erradicar aserciones no nulas y cumplir con
 *              las reglas más estrictas de higiene de TypeScript y React.
 * @version 5.2 - Zero Assertions & Clean Lifecycle
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useRef, useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { mat4, quat, vec3, vec2 } from 'gl-matrix';
import { AlertCircle, ScanFace, Loader2 } from 'lucide-react';

// ==============================================
// 1. SHADERS (GLSL 3.00 ES)
// ==============================================

const VERTEX_SHADER_SOURCE = `#version 300 es
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
    
    if (length(aModelPosition) > 0.1) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float velocity = min(0.15, uRotationAxisVelocity.w * 10.0);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        float strength = dot(stretchDir, normalize(worldPosition.xyz - centerPos));
        worldPosition.xyz += stretchDir * (strength * velocity);
    }

    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    vAlpha = smoothstep(0.1, 1.0, normalize(worldPosition.xyz).z);
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
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
    float cellSize = 1.0 / float(uAtlasSize);
    vec2 offset = vec2(
        float(itemIndex % uAtlasSize) * cellSize,
        float(itemIndex / uAtlasSize) * cellSize
    );

    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = clamp(st, 0.005, 0.995) * cellSize + offset;
    
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

/**
 * @class RenderEngine
 * @description Orquestador de bajo nivel para la GPU. 
 *              Gobernanza estricta sobre la memoria y los punteros de la GPU.
 */
class RenderEngine {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private texture: WebGLTexture | null = null;
  private matrixBuffer: WebGLBuffer | null = null;
  
  private locations: Record<string, WebGLUniformLocation | null> = {};
  
  private atlasSize = 4;
  private instanceCount = 12;
  private instanceMatrices: Float32Array;

  constructor(canvas: HTMLCanvasElement, private items: OrbitalGalleryItem[]) {
    const context = canvas.getContext('webgl2', { 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    if (!context) throw new Error("WEBGL2_NOT_SUPPORTED");
    this.gl = context;
    this.instanceMatrices = new Float32Array(this.instanceCount * 16);
  }

  /**
   * @description Inicialización resiliente del pipeline de gráficos.
   * @pilar III: Erradicación de aserciones no nulas.
   */
  public async init(): Promise<void> {
    const gl = this.gl;
    const prog = this.createProgram();
    
    if (!prog) {
      throw new Error("SHADER_PROGRAM_CREATION_FAILED");
    }
    
    this.program = prog;

    // Cacheo de locaciones con validación explícita
    const uniformNames = [
      'uProjectionMatrix', 
      'uViewMatrix', 
      'uWorldMatrix', 
      'uRotationAxisVelocity', 
      'uItemCount', 
      'uAtlasSize'
    ];

    uniformNames.forEach(name => {
      this.locations[name] = gl.getUniformLocation(prog, name);
    });

    this.createGeometry();
    await this.createTextureAtlas();
  }

  private createProgram(): WebGLProgram | null {
    const gl = this.gl;
    const load = (type: number, src: string): WebGLShader | null => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(`[HEIMDALL][GPU] Shader Error:`, gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const vs = load(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = load(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vs || !fs) return null;

    const p = gl.createProgram();
    if (!p) return null;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(`[HEIMDALL][GPU] Link Error:`, gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  private createGeometry(): void {
    const gl = this.gl;
    this.vao = gl.createVertexArray();
    if (!this.vao) return;
    
    gl.bindVertexArray(this.vao);

    const vertices = new Float32Array([-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0]);
    const uvs = new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]);
    
    const createVBO = (data: Float32Array, loc: number, size: number) => {
      const b = gl.createBuffer();
      if (!b) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };

    createVBO(vertices, 0, 3);
    createVBO(uvs, 1, 2);

    this.matrixBuffer = gl.createBuffer();
    if (this.matrixBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.instanceMatrices.byteLength, gl.DYNAMIC_DRAW);

      for (let i = 0; i < 4; i++) {
        const loc = 3 + i;
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, i * 16);
        gl.vertexAttribDivisor(loc, 1);
      }
    }
    gl.bindVertexArray(null);
  }

  private async createTextureAtlas(): Promise<void> {
    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const images = await Promise.all(this.items.map(item => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = item.image;
      });
    }));

    const step = size / this.atlasSize;
    images.forEach((img, i) => {
      const x = (i % this.atlasSize) * step;
      const y = Math.floor(i / this.atlasSize) * step;
      ctx.drawImage(img, x, y, step, step);
    });

    this.texture = this.gl.createTexture();
    if (this.texture) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }
  }

  public render(viewMatrix: mat4, projMatrix: mat4, worldMatrix: mat4, rotationVel: number, axis: vec3): void {
    const gl = this.gl;
    if (!this.program || !this.vao) return;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(this.program);

    const l = this.locations;
    if (l.uProjectionMatrix) gl.uniformMatrix4fv(l.uProjectionMatrix, false, projMatrix);
    if (l.uViewMatrix) gl.uniformMatrix4fv(l.uViewMatrix, false, viewMatrix);
    if (l.uWorldMatrix) gl.uniformMatrix4fv(l.uWorldMatrix, false, worldMatrix);
    if (l.uRotationAxisVelocity) gl.uniform4f(l.uRotationAxisVelocity, axis[0], axis[1], axis[2], rotationVel);
    if (l.uItemCount) gl.uniform1i(l.uItemCount, this.items.length);
    if (l.uAtlasSize) gl.uniform1i(l.uAtlasSize, this.atlasSize);

    const t = (1 + Math.sqrt(5)) / 2;
    const v = [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]];
    
    v.forEach((pos, i) => {
      const m = mat4.create();
      const p = vec3.normalize(vec3.create(), vec3.fromValues(pos[0], pos[1], pos[2]));
      vec3.scale(p, p, 2.5);
      mat4.fromTranslation(m, p);
      const look = mat4.targetTo(mat4.create(), p, [0,0,0], [0,1,0]);
      mat4.multiply(m, m, look);
      this.instanceMatrices.set(m, i * 16);
    });

    if (this.matrixBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.instanceMatrices);
    }

    gl.bindVertexArray(this.vao);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.instanceCount);
  }

  public dispose(): void {
    const gl = this.gl;
    if (this.program) gl.deleteProgram(this.program);
    if (this.texture) gl.deleteTexture(this.texture);
    if (this.vao) gl.deleteVertexArray(this.vao);
    if (this.matrixBuffer) gl.deleteBuffer(this.matrixBuffer);
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

function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    /** 
     * @pilar X: Higiene. 
     * Suscripción estática para ciclo de vida de cliente. 
     */
    return () => { /* No-op teardown */ };
  }, []);
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export const OrbitalGallery = ({ items, dictionary }: OrbitalGalleryProps) => {
  const isMounted = useIsMounted();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RenderEngine | null>(null);
  
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const rotationQuat = useRef(quat.create());
  const targetQuat = useRef(quat.create());
  const lastMouse = useRef(vec2.create());
  const isDragging = useRef(false);
  const rotationVel = useRef(0);
  const rotationAxis = useRef(vec3.fromValues(0, 1, 0));

  useEffect(() => {
    if (!isMounted || !canvasRef.current) return;
    
    let frameId: number;
    const canvas = canvasRef.current;
    const engine = new RenderEngine(canvas, items);
    
    const initialize = async () => {
      try {
        await engine.init();
        engineRef.current = engine;
        setIsLoading(false);

        const loop = () => {
          const currentEngine = engineRef.current;
          if (!currentEngine) return;

          quat.slerp(rotationQuat.current, rotationQuat.current, targetQuat.current, 0.08);
          
          const world = mat4.fromQuat(mat4.create(), rotationQuat.current);
          const view = mat4.lookAt(mat4.create(), [0, 0, 8], [0, 0, 0], [0, 1, 0]);
          const proj = mat4.perspective(
            mat4.create(), 
            Math.PI / 4, 
            canvas.width / canvas.height, 
            0.1, 
            100
          );

          currentEngine.render(view, proj, world, rotationVel.current, rotationAxis.current);
          rotationVel.current *= 0.95;
          frameId = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) {
        console.error(`[HEIMDALL][GPU] Orchestration Failure:`, e);
        setHasError(true);
      }
    };

    initialize();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      engine.dispose();
      engineRef.current = null;
    };
  }, [items, isMounted]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastMouse.current = vec2.fromValues(e.clientX, e.clientY);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const current = vec2.fromValues(e.clientX, e.clientY);
    const delta = vec2.sub(vec2.create(), current, lastMouse.current);
    const axis = vec3.fromValues(delta[1], delta[0], 0);
    const angle = vec2.length(delta) * 0.005;
    
    if (angle > 0) {
      const q = quat.setAxisAngle(quat.create(), vec3.normalize(vec3.create(), axis), angle);
      quat.multiply(targetQuat.current, q, targetQuat.current);
      rotationVel.current = angle;
      rotationAxis.current = axis;
    }
    lastMouse.current = current;
  };

  if (hasError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-950 p-12 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500/40" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          {dictionary.error_fallback}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-[#050505] overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <Loader2 className="animate-spin text-purple-500" size={32} />
        </div>
      )}
      
      <canvas 
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => { isDragging.current = false; }}
        className="h-full w-full cursor-grab active:cursor-grabbing touch-none outline-none"
        width={1024}
        height={1024}
      />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-full">
           <ScanFace size={16} className="text-purple-400" />
           <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-white/70 uppercase">
             {dictionary.drag_label}
           </span>
        </div>
      </div>
    </div>
  );
};
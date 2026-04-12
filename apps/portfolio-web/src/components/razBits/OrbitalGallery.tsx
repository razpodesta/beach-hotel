/**
 * @file OrbitalGallery.tsx
 * @description Motor de Renderizado WebGL 2.0 para Síntesis Visual (Silo C).
 *              Responsabilidad: Orquestación de una galería orbital 3D con 
 *              instanciado de mallas y atlas de texturas dinámico.
 * 
 * @version 8.1 - Linter Pure & Zero Redundancy
 * @author Raz Podestá - MetaShark Tech
 * 
 * @pilar III: Seguridad de Tipos - Erradicación de tipos inferibles (TS2352/ESLint sync).
 * @pilar IX: Desacoplamiento - Lógica de renderizado aislada en RenderEngine.
 * @pilar X: Performance - Instanced Drawing para minimizar Draw Calls (1 solo paso).
 * @pilar XII: MEA/UX - Inercia física basada en cuaterniones para rotación fluida.
 */

'use client';

import React, { useRef, useState, useEffect, memo } from 'react';
import { mat4, quat, vec3, vec2 } from 'gl-matrix';
import { Info, Loader2 } from 'lucide-react';

// ============================================================================
// 1. SHADERS (GLSL Optimized for Instancing)
// ============================================================================

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
    
    // Deformación cinemática basada en velocidad
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
    
    // Mapeo dinámico al Atlas de Texturas
    vec2 offset = vec2(
        float(itemIndex % uAtlasSize) * cellSize, 
        float(itemIndex / uAtlasSize) * cellSize
    );
    
    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = clamp(st, 0.005, 0.995) * cellSize + offset;
    
    vec4 texColor = texture(uTex, st);
    outColor = vec4(texColor.rgb, texColor.a * vAlpha);
}`;

// ============================================================================
// 2. MOTOR DE RENDERIZADO (Stateless Class)
// ============================================================================

export interface OrbitalGalleryItem {
  image: string;
  title: string;
  description: string;
}

class RenderEngine {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private texture: WebGLTexture | null = null;
  private matrixBuffer: WebGLBuffer | null = null;
  private locations: Record<string, WebGLUniformLocation | null> = {};
  /** @fix: Eliminación de anotación de tipo redundante (no-inferrable-types) */
  private atlasSize = 4;
  private instanceMatrices: Float32Array;

  constructor(canvas: HTMLCanvasElement, private maxInstances = 12) {
    const context = canvas.getContext('webgl2', { 
      antialias: true, alpha: true, powerPreference: 'high-performance' 
    }) as WebGL2RenderingContext | null;

    if (!context) throw new Error("WEBGL_NOT_SUPPORTED"); 
    this.gl = context;
    this.instanceMatrices = new Float32Array(this.maxInstances * 16);
  }

  public async init(items: OrbitalGalleryItem[]): Promise<void> {
    const gl = this.gl;
    this.program = this.createProgram();
    if (!this.program) throw new Error("SHADER_PROGRAM_FAILED");

    const uniforms = ['uProjectionMatrix', 'uViewMatrix', 'uWorldMatrix', 'uRotationAxisVelocity', 'uItemCount', 'uAtlasSize'];
    uniforms.forEach(name => { 
        if (this.program) this.locations[name] = gl.getUniformLocation(this.program, name);
    });

    this.createGeometry();
    await this.createTextureAtlas(items);
  }

  private createProgram(): WebGLProgram | null {
    const gl = this.gl;
    const load = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };

    const vs = load(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = load(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vs || !fs) return null;

    const p = gl.createProgram();
    if (!p) return null;
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }

  private createGeometry(): void {
    const gl = this.gl;
    this.vao = gl.createVertexArray();
    if (!this.vao) return;
    gl.bindVertexArray(this.vao);

    // Quad base para el instanciado
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
          gl.enableVertexAttribArray(3 + i);
          gl.vertexAttribPointer(3 + i, 4, gl.FLOAT, false, 64, i * 16);
          gl.vertexAttribDivisor(3 + i, 1);
        }
    }
    gl.bindVertexArray(null);
  }

  private async createTextureAtlas(items: OrbitalGalleryItem[]): Promise<void> {
    const size = 1024; 
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handshake de Activos S3
    const images = await Promise.all(items.slice(0, this.maxInstances).map((item) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Vital para activos en Supabase S3
        img.onload = () => resolve(img);
        img.onerror = () => {
            console.error(`[HEIMDALL][GPU] Asset load failed: ${item.image}`);
            resolve(new Image()); 
        };
        img.src = item.image; 
      });
    }));

    const step = size / this.atlasSize;
    images.forEach((img, i) => {
      if (!img.src) return;
      const x = (i % this.atlasSize) * step;
      const y = Math.floor(i / this.atlasSize) * step;
      ctx.drawImage(img, x, y, step, step);
    });

    this.texture = this.gl.createTexture();
    if (this.texture) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    }
  }

  public render(viewMatrix: mat4, projMatrix: mat4, worldMatrix: mat4, rotationVel: number, axis: vec3, itemCount: number): void {
    const gl = this.gl;
    if (!this.program || !this.vao) return;
    
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.useProgram(this.program);
    
    const l = this.locations;
    gl.uniformMatrix4fv(l.uProjectionMatrix, false, projMatrix);
    gl.uniformMatrix4fv(l.uViewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(l.uWorldMatrix, false, worldMatrix);
    gl.uniform4f(l.uRotationAxisVelocity, axis[0], axis[1], axis[2], rotationVel);
    gl.uniform1i(l.uItemCount, itemCount);
    gl.uniform1i(l.uAtlasSize, this.atlasSize);

    const t = (1 + Math.sqrt(5)) / 2;
    const vertices = [
        [-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]
    ];
    
    vertices.slice(0, itemCount).forEach((pos, i) => {
      const m = mat4.create();
      const p = vec3.normalize(vec3.create(), vec3.fromValues(pos[0], pos[1], pos[2]));
      vec3.scale(p, p, 2.8);
      mat4.fromTranslation(m, p);
      mat4.multiply(m, m, mat4.targetTo(mat4.create(), p, [0,0,0], [0,1,0]));
      this.instanceMatrices.set(m, i * 16);
    });

    if (this.matrixBuffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.instanceMatrices);
    }
    gl.bindVertexArray(this.vao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 4, itemCount);
  }

  public dispose(): void {
    const gl = this.gl;
    if (this.program) gl.deleteProgram(this.program);
    if (this.texture) gl.deleteTexture(this.texture);
    if (this.vao) gl.deleteVertexArray(this.vao);
    if (this.matrixBuffer) gl.deleteBuffer(this.matrixBuffer);
  }
}

// ============================================================================
// 3. COMPONENTE REACT (Pure Orchestrator)
// ============================================================================

interface OrbitalGalleryProps {
  items: OrbitalGalleryItem[];
  dictionary: { drag_label: string; item_prefix: string; error_fallback: string; };
}

export const OrbitalGallery = memo(({ items, dictionary }: OrbitalGalleryProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RenderEngine | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Referencias de control físico
  const rotationQuat = useRef(quat.create());
  const targetQuat = useRef(quat.create());
  const lastMouse = useRef(vec2.create());
  const isDragging = useRef(false);
  const rotationVel = useRef(0);
  const rotationAxis = useRef(vec3.fromValues(0, 1, 0));

  useEffect(() => {
    if (!canvasRef.current || items.length === 0) return;
    
    let frameId: number;
    const canvas = canvasRef.current;
    
    const bootstrap = async () => {
      try {
        const engine = new RenderEngine(canvas, 12);
        await engine.init(items);
        engineRef.current = engine;
        setIsInitializing(false);

        const loop = () => {
          quat.slerp(rotationQuat.current, rotationQuat.current, targetQuat.current, 0.08);
          const view = mat4.lookAt(mat4.create(), [0, 0, 8], [0, 0, 0], [0, 1, 0]);
          const proj = mat4.perspective(mat4.create(), Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
          
          engineRef.current?.render(
            view, 
            proj, 
            mat4.fromQuat(mat4.create(), rotationQuat.current), 
            rotationVel.current, 
            rotationAxis.current,
            items.length
          );
          
          rotationVel.current *= 0.96; 
          frameId = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) {
        console.error('[HEIMDALL][GPU] Orbit Synthesis Failed:', e);
        setHasError(true);
        setIsInitializing(false);
      }
    };

    bootstrap();

    return () => { 
      if (frameId) cancelAnimationFrame(frameId); 
      engineRef.current?.dispose(); 
    };
  }, [items]);

  if (hasError) return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background/20 p-12 text-center border border-border/10 rounded-[4rem] backdrop-blur-xl">
        <Info className="relative h-12 w-12 text-red-500/50 mb-4" />
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground max-w-xs">
          {dictionary.error_fallback}
        </p>
    </div>
  );

  return (
    <div className="relative h-full w-full group cursor-grab active:cursor-grabbing">
      {isInitializing && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <span className="mt-6 text-[8px] font-mono font-bold uppercase tracking-[0.6em] text-primary">Synchronizing Visual Synth...</span>
        </div>
      )}
      
      <canvas 
          ref={canvasRef}
          onPointerDown={(e) => { 
              isDragging.current = true; 
              vec2.set(lastMouse.current, e.clientX, e.clientY); 
              e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!isDragging.current) return;
            const current = vec2.fromValues(e.clientX, e.clientY);
            const delta = vec2.sub(vec2.create(), current, lastMouse.current);
            const axis = vec3.fromValues(-delta[1], delta[0], 0);
            const angle = vec2.length(delta) * 0.005;
            
            if (angle > 0) {
              quat.multiply(
                targetQuat.current, 
                quat.setAxisAngle(quat.create(), vec3.normalize(vec3.create(), axis), angle), 
                targetQuat.current
              );
              rotationVel.current = angle; 
              rotationAxis.current = axis;
            }
            vec2.copy(lastMouse.current, current); 
          }}
          onPointerUp={() => { isDragging.current = false; }}
          className="h-full w-full touch-none outline-none transform-gpu"
          width={1024} height={1024}
      />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-700 opacity-60 group-hover:opacity-10 group-hover:blur-sm">
        <span className="text-[9px] font-bold tracking-[0.5em] uppercase text-muted-foreground bg-surface/80 border border-border/40 px-8 py-3 rounded-full backdrop-blur-2xl shadow-luxury">
          {dictionary.drag_label}
        </span>
      </div>
    </div>
  );
});

OrbitalGallery.displayName = 'OrbitalGallery';
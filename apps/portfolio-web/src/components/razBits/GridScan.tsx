// RUTA: apps/portfolio-web/src/components/razBits/GridScan.tsx
// VERSIÓN: 2.2 - Corrección de Parámetros de Renderizado para Calidad Visual Máxima.
// DESCRIPCIÓN: Se ha corregido un error tipográfico en las opciones de WebGLRenderer,
//              cambiando 'antiasias' por 'antialias'. Esta corrección activa el
//              suavizado de bordes, garantizando la más alta calidad visual y
//              eliminando el error de compilación de TypeScript.

'use client';

import React, { useEffect, useRef, useLayoutEffect } from 'react';
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  ChromaticAberrationEffect,
} from 'postprocessing';
import * as THREE from 'three';

// --- Tipos y Shaders (Sin cambios) ---
type GridScanProps = {
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  enablePost?: boolean;
  bloomIntensity?: number;
  chromaticAberration?: number;
  noiseIntensity?: number;
  scanColor?: string;
  scanOpacity?: number;
  scanGlow?: number;
  scanSoftness?: number;
  scanDuration?: number;
  scanDelay?: number;
  className?: string;
  style?: React.CSSProperties;
};
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;
const fragmentShader = `
  precision highp float;
  uniform vec3 iResolution;
  uniform float iTime;
  uniform vec2 uSkew;
  uniform float uLineThickness;
  uniform vec3 uLinesColor;
  uniform vec3 uScanColor;
  uniform float uGridScale;
  uniform float uScanOpacity;
  uniform float uNoise;
  uniform float uBloomOpacity;
  uniform float uScanGlow;
  uniform float uScanSoftness;
  uniform float uScanDuration;
  uniform float uScanDelay;
  varying vec2 vUv;

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
    vec3 ro = vec3(0.0);
    vec3 rd = normalize(vec3(p, 2.0));

    vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
    rd.xy += skew * rd.z;

    vec3 color = vec3(0.0);
    float minT = 1e20;
    float gridScale = max(1e-5, uGridScale);
    float fadeStrength = 2.0;
    vec2 gridUV = vec2(0.0);
    float hitIsY = 1.0;

    for (int i = 0; i < 2; i++) {
        float isY = float(i < 1);
        float pos = isY > 0.5 ? -0.2 : -0.5;
        float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
        float den = isY * rd.y + (1.0 - isY) * rd.x;
        float t = num / den;
        vec3 h = ro + rd * t;

        float depthBoost = smoothstep(0.0, 3.0, h.z);
        h.xy += skew * 0.15 * depthBoost;

        bool use = t > 0.0 && t < minT;
        gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
        minT = use ? t : minT;
        hitIsY = use ? isY : hitIsY;
    }

    vec3 hit = ro + rd * minT;
    float dist = length(hit - ro);

    float fx = fract(gridUV.x);
    float fy = fract(gridUV.y);
    float ax = min(fx, 1.0 - fx);
    float ay = min(fy, 1.0 - fy);
    float wx = fwidth(gridUV.x);
    float wy = fwidth(gridUV.y);
    float halfPx = max(0.0, uLineThickness) * 0.5;
    float tx = halfPx * wx;
    float ty = halfPx * wy;
    float aax = wx;
    float aay = wy;
    float lineX = 1.0 - smoothstep(tx, tx + aax, ax);
    float lineY = 1.0 - smoothstep(ty, ty + aay, ay);
    float lineMask = max(lineX, lineY);
    float fade = exp(-dist * fadeStrength);

    float dur = max(0.05, uScanDuration);
    float del = max(0.0, uScanDelay);
    float cycle = dur + del;
    float tCycle = mod(iTime, cycle);
    float scanPhase = clamp((tCycle - del) / dur, 0.0, 1.0);
    float t2 = mod(max(0.0, iTime - del), 2.0 * dur);
    float phase = (t2 < dur) ? (t2 / dur) : (1.0 - (t2 - dur) / dur);
    float scanZ = phase * 2.0;
    float dz = abs(hit.z - scanZ);

    float widthScale = max(0.1, uScanGlow);
    float sigma = max(0.001, 0.18 * widthScale * uScanSoftness);
    float pulse = exp(-0.5 * (dz * dz) / (sigma * sigma)) * clamp(uScanOpacity, 0.0, 1.0);

    vec3 gridCol = uLinesColor * lineMask * fade;
    vec3 scanCol = uScanColor * pulse;
    color = gridCol + scanCol;

    float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898,78.233))) * 43758.5453123);
    color += (n - 0.5) * uNoise;
    color = clamp(color, 0.0, 1.0);

    float alpha = clamp(max(lineMask, pulse), 0.0, 1.0);
    float gx = 1.0 - smoothstep(tx * 2.0, tx * 2.0 + aax * 2.0, ax);
    float gy = 1.0 - smoothstep(ty * 2.0, ty * 2.0 + aay * 2.0, ay);
    float halo = max(gx, gy) * fade;
    alpha = max(alpha, halo * clamp(uBloomOpacity, 0.0, 1.0));

    fragColor = vec4(color, alpha);
  }

  void main() {
    vec4 c;
    mainImage(c, vUv * iResolution.xy);
    gl_FragColor = c;
  }
`;
const srgbColor = (hex: string) => new THREE.Color(hex).convertSRGBToLinear();
const smoothDampVec2 = (current: THREE.Vector2, target: THREE.Vector2, velocity: THREE.Vector2, smoothTime: number, deltaTime: number): void => {
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = current.clone().sub(target);
  const temp = velocity.clone().addScaledVector(change, omega).multiplyScalar(deltaTime);
  velocity.sub(temp.clone().multiplyScalar(omega)).multiplyScalar(exp);
  current.copy(target.clone().add(change.add(temp).multiplyScalar(exp)));
};

// ===================================================================================
// COMPONENTE PRINCIPAL
// ===================================================================================

export function GridScan({
  lineThickness = 1,
  linesColor = '#27272a',
  gridScale = 0.1,
  enablePost = true,
  bloomIntensity = 0.6,
  chromaticAberration = 0.002,
  noiseIntensity = 0.01,
  scanColor = '#a855f7',
  scanOpacity = 0.4,
  scanGlow = 0.5,
  scanSoftness = 2,
  scanDuration = 2.0,
  scanDelay = 2.0,
  className,
  style,
}: GridScanProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const mouseCurrent = useRef(new THREE.Vector2(0, 0));
  const mouseVelocity = useRef(new THREE.Vector2(0, 0));
  const bloomRef = useRef<BloomEffect | null>(null);
  const chromaRef = useRef<ChromaticAberrationEffect | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- INICIO DE LA CORRECCIÓN ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // --- FIN DE LA CORRECCIÓN ---
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iResolution: { value: new THREE.Vector3(container.clientWidth, container.clientHeight, renderer.getPixelRatio()) },
        iTime: { value: 0 },
        uSkew: { value: new THREE.Vector2(0, 0) },
        uLineThickness: { value: lineThickness },
        uLinesColor: { value: srgbColor(linesColor) },
        uScanColor: { value: srgbColor(scanColor) },
        uGridScale: { value: gridScale },
        uScanOpacity: { value: scanOpacity },
        uNoise: { value: noiseIntensity },
        uBloomOpacity: { value: bloomIntensity },
        uScanGlow: { value: scanGlow },
        uScanSoftness: { value: scanSoftness },
        uScanDuration: { value: scanDuration },
        uScanDelay: { value: scanDelay },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    materialRef.current = material;
    scene.add(new THREE.Mesh(geometry, material));

    let composer: EffectComposer | null = null;
    if (enablePost) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      const bloom = new BloomEffect({ intensity: 1.0 });
      bloomRef.current = bloom;

      const chroma = new ChromaticAberrationEffect();
      chromaRef.current = chroma;

      composer.addPass(new EffectPass(camera, bloom, chroma));
    }

    let lastTime = performance.now();
    let animationFrameId: number;
    const animate = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      smoothDampVec2(mouseCurrent.current, mouseTarget.current, mouseVelocity.current, 0.3, deltaTime);
      material.uniforms.uSkew.value.copy(mouseCurrent.current).multiplyScalar(0.15);
      material.uniforms.iTime.value += deltaTime;

      if (composer) {
        composer.render(deltaTime);
      } else {
        renderer.render(scene, camera);
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      material.uniforms.iResolution.value.set(container.clientWidth, container.clientHeight, renderer.getPixelRatio());
      if (composer) composer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseTarget.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      );
    };
    const handleMouseLeave = () => mouseTarget.current.set(0, 0);

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (composer) composer.dispose();
    };
  }, [
      enablePost, lineThickness, linesColor, scanColor, gridScale, scanOpacity,
      noiseIntensity, bloomIntensity, scanGlow, scanSoftness, scanDuration, scanDelay
  ]);

  useEffect(() => {
    const material = materialRef.current;
    if (material) {
      material.uniforms.uLineThickness.value = lineThickness;
      material.uniforms.uLinesColor.value.copy(srgbColor(linesColor));
      material.uniforms.uScanColor.value.copy(srgbColor(scanColor));
      material.uniforms.uGridScale.value = gridScale;
      material.uniforms.uScanOpacity.value = scanOpacity;
      material.uniforms.uNoise.value = noiseIntensity;
      material.uniforms.uBloomOpacity.value = bloomIntensity;
      material.uniforms.uScanGlow.value = scanGlow;
      material.uniforms.uScanSoftness.value = scanSoftness;
      material.uniforms.uScanDuration.value = scanDuration;
      material.uniforms.uScanDelay.value = scanDelay;
    }

    const bloomEffect = bloomRef.current;
    if (bloomEffect) {
      bloomEffect.blendMode.opacity.value = bloomIntensity;
    }

    const chromaEffect = chromaRef.current;
    if (chromaEffect) {
      chromaEffect.offset.set(chromaticAberration, chromaticAberration);
    }
  }, [
    lineThickness, linesColor, scanColor, gridScale, scanOpacity, noiseIntensity,
    bloomIntensity, scanGlow, scanSoftness, scanDuration, scanDelay, chromaticAberration,
  ]);

  return <div ref={containerRef} className={className} style={style} />;
}

// RUTA: apps/portfolio-web/src/components/razBits/LetterGlitch.tsx
// VERSIÓN: 2.0 - Visión Ultra Holística: Puro, Estable y Resiliente.
// DESCRIPCIÓN: Re-arquitectura completa para cumplir con las reglas más estrictas de React Hooks.
//              Se garantiza la pureza del componente, la estabilidad de las dependencias con useCallback
//              y se gestiona el ciclo de vida de la animación de forma canónica con useEffect y useRef.

'use client';

import { useRef, useEffect, useCallback } from 'react';

const LetterGlitch = ({
  glitchColors = ['#2b4539', '#61dca3', '#61b3dc'],
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789'
}: {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const letters = useRef<
    {
      char: string;
      color: string;
      targetColor: string;
      colorProgress: number;
    }[]
  >([]);
  const grid = useRef({ columns: 0, rows: 0 });
  // PILAR I: Pureza - Se inicializa con 0. El valor real se establece en useEffect.
  const lastGlitchTime = useRef(0);

  // PILAR II: Estabilidad - Se memoizan las funciones base.
  const getRandomChar = useCallback(() => {
    return characters[Math.floor(Math.random() * characters.length)];
  }, [characters]);

  const getRandomColor = useCallback(() => {
    return glitchColors[Math.floor(Math.random() * glitchColors.length)];
  }, [glitchColors]);

  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };

  const interpolateColor = (start: { r: number; g: number; b: number }, end: { r: number; g: number; b: number }, factor: number) => {
    const r = Math.round(start.r + (end.r - start.r) * factor);
    const g = Math.round(start.g + (end.g - start.g) * factor);
    const b = Math.round(start.b + (end.b - start.b) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const drawLetters = useCallback(() => {
    const canvas = canvasRef.current;
    if (!context.current || !canvas || letters.current.length === 0) return;
    const ctx = context.current;
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    ctx.font = '16px monospace';
    ctx.textBaseline = 'top';
    letters.current.forEach((letter, index) => {
      const x = (index % grid.current.columns) * 10;
      const y = Math.floor(index / grid.current.columns) * 20;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });
  }, []);

  // PILAR II: Estabilidad - Este hook ahora depende de funciones estables.
  const initializeLetters = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    const columns = Math.ceil(width / 10);
    const rows = Math.ceil(height / 20);
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1,
    }));
  }, [getRandomChar, getRandomColor]);

  // PILAR II: Estabilidad - Este hook también depende de funciones estables.
  const updateLetters = useCallback(() => {
    if (letters.current.length === 0) return;
    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05));
    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      letters.current[index].char = getRandomChar();
      letters.current[index].targetColor = getRandomColor();
      letters.current[index].colorProgress = smooth ? 0 : 1;
    }
  }, [getRandomChar, getRandomColor, smooth]);

  // PILAR III: Ciclo de Vida - El useEffect principal gestiona todo el ciclo de animación.
  useEffect(() => {
    // PILAR I: Pureza - Se inicializa el valor impuro una sola vez.
    lastGlitchTime.current = Date.now();

    const handleSmoothTransitions = () => {
      let needsRedraw = false;
      letters.current.forEach(letter => {
        if (letter.colorProgress < 1) {
          letter.colorProgress = Math.min(1, letter.colorProgress + 0.05);
          const startRgb = hexToRgb(letter.color);
          const endRgb = hexToRgb(letter.targetColor);
          if (startRgb && endRgb) {
            letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
            needsRedraw = true;
          }
        }
      });
      if (needsRedraw) {
        drawLetters();
      }
    };

    // La función de animación vive dentro del useEffect.
    const animate = () => {
      const now = Date.now();
      if (now - lastGlitchTime.current >= glitchSpeed) {
        updateLetters();
        drawLetters();
        lastGlitchTime.current = now;
      }
      if (smooth) {
        handleSmoothTransitions();
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Inicia la animación.
    animate();

    // La función de limpieza detiene la animación cuando el componente se desmonta.
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [glitchSpeed, smooth, drawLetters, updateLetters]);

  // useEffect para inicialización y redimensionamiento
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    context.current = canvas.getContext('2d');

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.current?.setTransform(dpr, 0, 0, dpr, 0, 0);
      initializeLetters();
      drawLetters();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [initializeLetters, drawLetters]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {outerVignette && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0)_60%,rgba(0,0,0,1)_100%)]"></div>
      )}
      {centerVignette && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0)_60%)]"></div>
      )}
    </div>
  );
};

export default LetterGlitch;

/**
 * @file LiveStatusTicker.tsx
 * @version 1.0 - Production Ready
 * @description Aparato de comunicación dinámica que sustituye al Tech Stack.
 *              Diseñado para mostrar disponibilidad, eventos y clima en tiempo real.
 */

'use client';

import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Waves, 
  Music, 
  Ticket, 
  Users, 
  ThermometerSun, 
  ShieldCheck 
} from 'lucide-react';
import { useInfiniteCarouselAnimation } from '../../../lib/hooks/use-infinite-carousel-animation';

// --- Contrato de Datos (Atomizado) ---
interface TickerMessage {
  id: string;
  text: string;
  category: 'URGENTE' | 'EVENTO' | 'STATUS' | 'INFO';
  icon: React.ElementType;
  colorClass: string;
}

// --- Mocks Naturalizados (Sustituyen a los iconos de lenguajes) ---
const LIVE_DATA: TickerMessage[] = [
  { 
    id: 'msg-1', 
    text: "BOAT PARTY: ÚLTIMOS 12 TICKETS DISPONÍVEIS", 
    category: 'URGENTE', 
    icon: Ticket, 
    colorClass: "text-purple-500" 
  },
  { 
    id: 'msg-2', 
    text: "TEMPERATURA EM CANASVIEIRAS: 26°C - CÉU LIMPO", 
    category: 'INFO', 
    icon: ThermometerSun, 
    colorClass: "text-yellow-400" 
  },
  { 
    id: 'msg-3', 
    text: "SUITE MASTER: 100% OCUPADA PARA O PRIDE ESCAPE", 
    category: 'STATUS', 
    icon: ShieldCheck, 
    colorClass: "text-green-400" 
  },
  { 
    id: 'msg-4', 
    text: "DJ GUEST CONFIRMADO: TECH-HOUSE SESSIONS", 
    category: 'EVENTO', 
    icon: Music, 
    colorClass: "text-pink-500" 
  },
  { 
    id: 'msg-5', 
    text: "+300 PAX CONFIRMADOS DE ARGENTINA E CHILE", 
    category: 'INFO', 
    icon: Users, 
    colorClass: "text-blue-400" 
  },
  { 
    id: 'msg-6', 
    text: "MAR CALMO: CONDIÇÕES IDEAIS PARA NAVEGAÇÃO", 
    category: 'INFO', 
    icon: Waves, 
    colorClass: "text-cyan-400" 
  },
  { 
    id: 'msg-7', 
    text: "EXPERIÊNCIA VIP: UPGRADE DISPONÍVEL NO CHECK-IN", 
    category: 'STATUS', 
    icon: Sparkles, 
    colorClass: "text-purple-400" 
  }
];

export function LiveStatusTicker() {
  const trackRef = useRef<HTMLDivElement>(null);

  // --- Lógica de Loop Inteligente ---
  // Duplicamos el set de datos para asegurar un scroll infinito sin saltos visuales
  const loopedMessages = useMemo(() => [...LIVE_DATA, ...LIVE_DATA, ...LIVE_DATA], []);

  // Hook de animación (GSAP / Framer Motion optimizado para GPU)
  useInfiniteCarouselAnimation([
    { 
      ref: trackRef, 
      duration: 140, // Velocidad ultra lenta para lectura cómoda
      direction: 1 
    }
  ]);

  return (
    <section 
      className="relative w-full bg-[#050505] border-y border-white/5 py-8 overflow-hidden select-none"
      aria-label="Live Hotel Updates"
    >
      {/* Efecto de difuminado lateral (Vignette) para profundidad */}
      <div className="absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-black to-transparent pointer-events-none" />

      {/* Contenedor del Carrusel */}
      <div 
        ref={trackRef} 
        className="flex items-center w-max will-change-transform"
      >
        {loopedMessages.map((message, index) => (
          <div 
            key={`${message.id}-${index}`} 
            className="flex items-center gap-6 px-12 group cursor-default"
          >
            {/* Indicador de Categoría */}
            <div className="flex flex-col">
              <span className={`text-[8px] font-mono font-bold tracking-[0.3em] uppercase opacity-40 group-hover:opacity-100 transition-opacity ${message.colorClass}`}>
                {message.category}
              </span>
              
              <div className="flex items-center gap-4 mt-1">
                <message.icon 
                  size={18} 
                  className={`${message.colorClass} drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`} 
                />
                <span className="text-sm font-bold text-zinc-300 uppercase tracking-widest whitespace-nowrap group-hover:text-white transition-colors">
                  {message.text}
                </span>
              </div>
            </div>

            {/* Separador Estilizado entre mensajes */}
            <div className="ml-12 h-1 w-1 rounded-full bg-zinc-800 group-hover:bg-purple-500 transition-colors" />
          </div>
        ))}
      </div>
    </section>
  );
}
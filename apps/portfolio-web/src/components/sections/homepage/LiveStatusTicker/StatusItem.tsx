/**
 * @file StatusItem.tsx
 * @description Unidad atómica de telemetría con micro-interacciones de alta fidelidad.
 *              Implementa mapeo cromático determinista y optimización de renderizado (Memo).
 * @version 4.0 - Elite Production Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { memo } from 'react';
import { 
  Ticket, ThermometerSun, ShieldCheck, 
  Music, Users, Waves, Sparkles, Info,
  type LucideIcon 
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../../../lib/utils/cn';
import type { 
  SystemStatusItem, 
  StatusIconType, 
  StatusColorType 
} from '../../../../lib/schemas/system_status.schema';

/**
 * MAPA MAESTRO DE ICONOGRAFÍA (SSoT)
 * @description Centraliza la resolución de glifos con tipado estricto.
 */
const ICON_MAP: Record<StatusIconType, LucideIcon> = {
  Ticket,
  ThermometerSun,
  ShieldCheck,
  Music,
  Users,
  Waves,
  Sparkles,
};

/**
 * MATRIZ CROMÁTICA SOBERANA (Pilar VII)
 * @description Define explícitamente las combinaciones de clases para evitar manipulación de strings.
 *              Optimizado para Tailwind v4 y el motor de diseño MetaShark.
 */
const THEME_MAP: Record<StatusColorType, { text: string; bg: string; shadow: string }> = {
  purple: { text: "text-primary", bg: "bg-primary", shadow: "shadow-primary/20" },
  yellow: { text: "text-yellow-400", bg: "bg-yellow-400", shadow: "shadow-yellow-400/20" },
  green: { text: "text-green-400", bg: "bg-green-400", shadow: "shadow-green-400/20" },
  pink: { text: "text-accent", bg: "bg-accent", shadow: "shadow-accent/20" },
  blue: { text: "text-blue-400", bg: "bg-blue-400", shadow: "shadow-blue-400/20" },
  cyan: { text: "text-cyan-400", bg: "bg-cyan-400", shadow: "shadow-cyan-400/20" },
};

/**
 * @interface StatusItemProps
 * @property {SystemStatusItem} item - Entidad de estado validada por esquema Zod.
 */
interface StatusItemProps {
  item: SystemStatusItem;
}

/**
 * APARATO: StatusItem
 * @description Renderiza una cápsula de telemetría con interacciones cinemáticas.
 *              Envuelto en memo() para prevenir jank en el carrusel infinito (Pilar X).
 */
export const StatusItem = memo(({ item }: StatusItemProps) => {
  const Icon = ICON_MAP[item.iconKey] || Info;
  const theme = THEME_MAP[item.colorKey] || THEME_MAP.purple;

  return (
    <div 
      className="flex items-center gap-10 px-16 group cursor-default transition-opacity duration-500 hover:opacity-100"
      role="listitem"
    >
      <div className="flex flex-col">
        {/* INDICADOR LIVE: Pulso de Identidad (Pilar XII) */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex h-2 w-2">
            <div className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              theme.bg
            )} />
            <div className={cn(
              "relative inline-flex h-2 w-2 rounded-full shadow-lg",
              theme.bg,
              theme.shadow
            )} />
          </div>
          <span className={cn(
            "text-[10px] font-mono font-bold tracking-[0.5em] uppercase transition-all duration-700",
            "opacity-30 group-hover:opacity-100 group-hover:tracking-[0.6em]", 
            theme.text
          )}>
            {item.category}
          </span>
        </div>
        
        {/* CONTENIDO: Telemetría y Glifo */}
        <div className="flex items-center gap-5">
          <div className={cn(
            "p-2.5 rounded-xl bg-white/2 border border-white/5 transition-all duration-700",
            "group-hover:bg-white/5 group-hover:border-white/10 group-hover:scale-110 transform-gpu",
            theme.text
          )}>
            <Icon 
              size={20} 
              strokeWidth={1.5}
              className="transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) group-hover:rotate-360deg" 
              aria-hidden="true"
            />
          </div>
          <span className="text-sm font-display font-bold text-zinc-300 uppercase tracking-widest whitespace-nowrap transition-colors duration-500 group-hover:text-white">
            {item.message}
          </span>
        </div>
      </div>
      
      {/* SEPARADOR ESTRUCTURAL: Estética Glassmorphism (Pilar VII) */}
      <div className="ml-8 h-10 w-px bg-linear-to-b from-transparent via-white/10 to-transparent transition-all duration-1000 group-hover:via-primary/30 group-hover:h-12" />
    </div>
  );
});

StatusItem.displayName = 'StatusItem';
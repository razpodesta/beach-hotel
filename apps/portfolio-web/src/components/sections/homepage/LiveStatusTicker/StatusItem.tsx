/**
 * @file StatusItem.tsx
 * @description Unidad atómica de telemetría sensorial (Heimdall Pulse).
 *              Refactorizado: Optimización de micro-interacciones con aceleración GPU,
 *              mapeo cromático determinista via OKLCH y blindaje de tipos SSoT.
 * @version 5.0 - Next-Gen Performance & Tailwind v4 Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { memo } from 'react';
import { 
  Ticket, 
  ThermometerSun, 
  ShieldCheck, 
  Music, 
  Users, 
  Waves, 
  Sparkles, 
  Info,
  type LucideIcon 
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica a fronteras Nx.
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
 * @description Tokens semánticos sincronizados con el Oxygen Engine (Tailwind v4).
 */
const THEME_MAP: Record<StatusColorType, { text: string; bg: string; glow: string }> = {
  purple: { text: "text-primary", bg: "bg-primary", glow: "shadow-primary/20" },
  yellow: { text: "text-yellow-400", bg: "bg-yellow-400", glow: "shadow-yellow-400/20" },
  green: { text: "text-green-500", bg: "bg-green-500", glow: "shadow-green-500/20" },
  pink: { text: "text-accent", bg: "bg-accent", glow: "shadow-accent/20" },
  blue: { text: "text-blue-400", bg: "bg-blue-400", glow: "shadow-blue-400/20" },
  cyan: { text: "text-cyan-400", bg: "bg-cyan-400", glow: "shadow-cyan-400/20" },
};

/**
 * @interface StatusItemProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface StatusItemProps {
  /** Entidad de estado validada por contrato de Zod */
  item: SystemStatusItem;
}

/**
 * APARATO: StatusItem
 * @description Renderiza una cápsula de información en tiempo real.
 * @pilar X: Performance de Élite - Envuelto en memo() para mitigar re-renders 
 *         innecesarios dentro de carruseles de alta frecuencia.
 */
export const StatusItem = memo(({ item }: StatusItemProps) => {
  // Resolución de activos y atmósfera
  const Icon = ICON_MAP[item.iconKey] || Info;
  const theme = THEME_MAP[item.colorKey] || THEME_MAP.purple;

  return (
    <div 
      className="flex items-center gap-12 px-20 group cursor-default transition-opacity duration-700 hover:opacity-100 will-change-transform"
      role="listitem"
    >
      <div className="flex flex-col">
        {/* --- INDICADOR LIVE (Protocolo de Latido) --- */}
        <div className="flex items-center gap-3 mb-2.5">
          <div className="relative flex h-2 w-2">
            <div className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 transform-gpu",
              theme.bg
            )} />
            <div className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              theme.bg,
              theme.glow
            )} />
          </div>
          <span className={cn(
            "text-[9px] font-mono font-bold tracking-[0.5em] uppercase transition-all duration-700",
            "opacity-40 group-hover:opacity-100 group-hover:tracking-[0.6em]", 
            theme.text
          )}>
            {item.category}
          </span>
        </div>
        
        {/* --- CONTENIDO SENSORIAL --- */}
        <div className="flex items-center gap-6">
          <div className={cn(
            "p-3 rounded-2xl bg-surface/30 border border-white/5 backdrop-blur-md transition-all duration-700",
            "group-hover:bg-white/10 group-hover:border-white/10 group-hover:scale-110 group-hover:rotate-6 transform-gpu",
            theme.text
          )}>
            <Icon 
              size={22} 
              strokeWidth={1.5}
              className="transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) group-hover:rotate-360" 
              aria-hidden="true"
            />
          </div>
          <span className="text-sm font-display font-bold text-foreground/80 uppercase tracking-[0.15em] whitespace-nowrap transition-colors duration-500 group-hover:text-foreground">
            {item.message}
          </span>
        </div>
      </div>
      
      {/* --- SEPARADOR DE FLUJO (Estética Boutique) --- */}
      <div className="ml-10 h-12 w-px bg-linear-to-b from-transparent via-border/40 to-transparent transition-all duration-1000 group-hover:via-primary/40 group-hover:h-16 transform-gpu" />
    </div>
  );
});

StatusItem.displayName = 'StatusItem';
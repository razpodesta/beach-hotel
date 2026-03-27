/**
 * @file StatusItem.tsx
 * @description Unidad atómica de telemetría con micro-interacciones MEA/UX.
 * @version 2.0 - Pure Presentational Standard
 */

'use client';

import React from 'react';
import { 
  Ticket, ThermometerSun, ShieldCheck, 
  Music, Users, Waves, Sparkles, Info,
  type LucideIcon 
} from 'lucide-react';
import { cn } from '../../../../lib/utils/cn';
import type { SystemStatusItem, StatusIconType, StatusColorType } from '../../../../lib/schemas/system_status.schema';

/**
 * MAPAS SOBERANOS DE ESTILO (Alineados con global.css)
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

const COLOR_MAP: Record<StatusColorType, string> = {
  purple: "text-primary", // Sanctuary Purple
  yellow: "text-yellow-400",
  green: "text-green-400",
  pink: "text-accent", // Pride Pink
  blue: "text-blue-400",
  cyan: "text-cyan-400",
};

interface StatusItemProps {
  item: SystemStatusItem;
}

export function StatusItem({ item }: StatusItemProps) {
  const Icon = ICON_MAP[item.iconKey] || Info;
  const colorClass = COLOR_MAP[item.colorKey] || "text-zinc-400";
  const bgPulseClass = colorClass.replace('text-', 'bg-');

  return (
    <div className="flex items-center gap-10 px-16 group cursor-default">
      <div className="flex flex-col">
        {/* Indicador Live */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className={cn("h-1 w-1 rounded-full animate-pulse", bgPulseClass)} />
          <span className={cn(
            "text-[9px] font-mono font-bold tracking-[0.4em] uppercase opacity-40 transition-opacity duration-700 group-hover:opacity-100", 
            colorClass
          )}>
            {item.category}
          </span>
        </div>
        
        {/* Mensaje de Telemetría */}
        <div className="flex items-center gap-4">
          <Icon 
            size={18} 
            strokeWidth={1.5}
            className={cn("transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12", colorClass)} 
          />
          <span className="text-sm font-bold text-zinc-200 uppercase tracking-widest whitespace-nowrap font-sans transition-colors group-hover:text-white">
            {item.message}
          </span>
        </div>
      </div>
      
      {/* Separador de flujo */}
      <div className="ml-8 h-8 w-px bg-white/5 group-hover:bg-primary/20 transition-colors duration-700" />
    </div>
  );
}
/**
 * @file AmenitiesMarquee.tsx
 * @description Orquestador de rieles de amenidades con estética de lujo comprimida.
 *              Refactorizado: Alta velocidad de desplazamiento, tipografía técnica 
 *              estilo concierge y micro-cápsulas de alta densidad.
 * @version 11.1 - Tailwind Canonical Classes Sync
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useRef, useMemo, memo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { useInfiniteCarouselAnimation } from '../../../lib/hooks/use-infinite-carousel-animation';
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { Amenity, AmenityIconType } from '../../../lib/schemas/value_proposition.schema';

/**
 * MAPA MAESTRO DE ICONOGRAFÍA (SSoT)
 */
const ICON_MAP: Record<AmenityIconType, LucideIcons.LucideIcon> = {
  wifi: LucideIcons.Wifi,
  waves: LucideIcons.Waves,
  utensils: LucideIcons.Utensils,
  dumbbell: LucideIcons.Dumbbell,
  shield: LucideIcons.ShieldCheck,
  coffee: LucideIcons.Coffee,
  car: LucideIcons.Car,
  sparkles: LucideIcons.Sparkles,
  disc: LucideIcons.Disc3,
  martini: LucideIcons.Martini,
  ship: LucideIcons.Ship,
  ticket: LucideIcons.Ticket,
  music: LucideIcons.Music,
  pin: LucideIcons.MapPin,
  users: LucideIcons.Users,
  flame: LucideIcons.Flame,
};

/**
 * SUB-APARATO: AmenityItem
 * @description Cápsula comprimida con estética de lujo técnica.
 */
const AmenityItem = memo(({ item, isNeon }: { item: Amenity; isNeon?: boolean }) => {
  const Icon = ICON_MAP[item.iconKey as AmenityIconType] || Sparkles;

  return (
    <div 
      className={cn(
        "group flex shrink-0 items-center gap-3.5 rounded-2xl border border-white/5 bg-surface/40 px-5 py-3 transition-all duration-500",
        "hover:scale-105 hover:bg-surface/80 hover:border-primary/40 backdrop-blur-3xl cursor-default transform-gpu",
        "shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-primary/5"
      )}
      role="listitem"
    >
      <Icon 
        size={16} 
        strokeWidth={2}
        className={cn(
          "transition-transform duration-700 group-hover:rotate-12", // @fix: Tailwind Canonical Class
          isNeon ? 'text-accent' : 'text-primary'
        )} 
      />
      <span className="text-[9px] font-mono font-bold tracking-[0.35em] text-muted-foreground transition-colors duration-500 group-hover:text-foreground uppercase">
        {item.name}
      </span>
    </div>
  );
});

AmenityItem.displayName = 'AmenityItem';

/**
 * APARATO: AmenitiesMarquee
 * @description Orquesta rieles de alta velocidad con máscaras de atmósfera reducidas.
 */
export function AmenitiesMarquee({ dictionary }: { dictionary: Dictionary['value_proposition'] }) {
  const trackHotelRef = useRef<HTMLDivElement>(null);
  const trackFestivalRef = useRef<HTMLDivElement>(null);

  /**
   * MOTOR CINEMÁTICO (GSAP Accelerated)
   * @description Velocidad incrementada para una sección vibrante y flamorosa.
   */
  useInfiniteCarouselAnimation([
    { ref: trackHotelRef, duration: 45, direction: 1 },  // Hotel: Rápido y elegante
    { ref: trackFestivalRef, duration: 55, direction: -1 }, // Fest: Dinámico
  ]);

  const hotelList = useMemo(() => dictionary?.amenities_hotel ?? [], [dictionary]);
  const festivalList = useMemo(() => dictionary?.amenities_festival ?? [], [dictionary]);

  if (!dictionary || (hotelList.length === 0 && festivalList.length === 0)) return null;

  return (
    <section 
      className="relative w-full overflow-hidden bg-transparent py-8 select-none" 
      role="region"
      aria-label={dictionary.amenities_title}
    >
      <div className="space-y-4 relative">
        
        {/* 
            MÁSCARAS DE DIFUMINADO TIGHT (Pilar VII) 
            Concentradas para maximizar el glamour de las cápsulas en el centro.
        */}
        <div className="absolute left-0 top-0 z-20 h-full w-24 md:w-64 bg-linear-to-r from-background via-background/80 to-transparent pointer-events-none transition-colors duration-1000" />
        <div className="absolute right-0 top-0 z-20 h-full w-24 md:w-64 bg-linear-to-l from-background via-background/80 to-transparent pointer-events-none transition-colors duration-1000" />

        {/* --- RIEL ALPHA (Luz) --- */}
        <div 
          ref={trackHotelRef} 
          className="flex w-max gap-4 will-change-transform transform-gpu py-1"
          role="list"
        >
          {hotelList.map((item, index) => (
            <AmenityItem key={`hotel-${index}`} item={item} />
          ))}
        </div>

        {/* --- RIEL BETA (Takeover) --- */}
        <div 
          ref={trackFestivalRef} 
          className="flex w-max gap-4 will-change-transform transform-gpu py-1"
          role="list"
        >
          {festivalList.map((item, index) => (
            <AmenityItem key={`fest-${index}`} item={item} isNeon />
          ))}
        </div>
      </div>
      
      {/* Sello de Identidad Perimetral */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
         <span className="text-9xl font-display font-bold text-foreground whitespace-nowrap">
            PREMIUM AMENITIES
         </span>
      </div>
    </section>
  );
}
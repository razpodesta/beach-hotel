/**
 * @file AmenitiesMarquee.tsx
 * @description Aparato de visualización de amenidades con resiliencia atmosférica.
 *              Implementa bucles infinitos optimizados por GPU y sincronía Day/Night.
 * @version 9.0 - Atmosphere Aware & Performance Hardened
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useRef, useMemo, memo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { useInfiniteCarouselAnimation } from '../../../lib/hooks/use-infinite-carousel-animation';
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { Amenity, AmenityIconType } from '../../../lib/schemas/value_proposition.schema';

/**
 * MAPA DE ICONOS SOBERANO (SSoT)
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
 * SUB-APARATO ATÓMICO: AmenityItem
 * @pilar X: Performance - Envuelto en memo para optimizar el track de animación.
 */
const AmenityItem = memo(({ item, isNeon }: { item: Amenity; isNeon?: boolean }) => {
  const Icon = ICON_MAP[item.iconKey as AmenityIconType] || Sparkles;

  return (
    <div className={cn(
      "group flex shrink-0 items-center gap-5 rounded-full border border-border/40 bg-surface/50 px-8 py-5 transition-all duration-700",
      "hover:scale-105 hover:bg-surface hover:border-primary/20 backdrop-blur-2xl cursor-default transform-gpu"
    )}>
      <Icon 
        size={20} 
        strokeWidth={1.5}
        className={cn(
          "transition-all duration-700 group-hover:scale-125 group-hover:rotate-12", 
          isNeon ? 'text-accent' : 'text-primary'
        )} 
      />
      <span className="text-sm font-bold tracking-[0.2em] text-muted-foreground transition-colors duration-500 group-hover:text-foreground uppercase font-sans">
        {item.name}
      </span>
    </div>
  );
});

AmenityItem.displayName = 'AmenityItem';

/**
 * @interface AmenitiesMarqueeProps
 */
interface AmenitiesMarqueeProps {
  /** Fragmento del diccionario validado */
  dictionary: Dictionary['value_proposition'];
}

/**
 * APARATO: AmenitiesMarquee
 * @description Orquesta los rieles cinemáticos de validación visual adaptándose a la atmósfera.
 */
export function AmenitiesMarquee({ dictionary }: AmenitiesMarqueeProps) {
  const trackHotelRef = useRef<HTMLDivElement>(null);
  const trackFestivalRef = useRef<HTMLDivElement>(null);

  /**
   * MOTOR DE ANIMACIÓN INFINITA (GSAP Engine)
   */
  useInfiniteCarouselAnimation([
    { ref: trackHotelRef, duration: 100, direction: 1 },
    { ref: trackFestivalRef, duration: 120, direction: -1 },
  ]);

  const hotelList = useMemo(() => dictionary?.amenities_hotel ?? [], [dictionary]);
  const festivalList = useMemo(() => dictionary?.amenities_festival ?? [], [dictionary]);

  if (!dictionary || (hotelList.length === 0 && festivalList.length === 0)) {
    return null;
  }

  return (
    <div 
      className="relative w-full overflow-hidden bg-transparent py-10 select-none" 
      role="region"
      aria-label={dictionary.amenities_title}
    >
      <div className="space-y-10 relative">
        {/* 
            MÁSCARAS DE DIFUMINADO ADAPTATIVAS (Pilar VII) 
            Sustitución de color sólido por variable 'background'
        */}
        <div className="absolute left-0 top-0 z-20 h-full w-32 md:w-80 bg-linear-to-r from-background to-transparent pointer-events-none transition-colors duration-1000" />
        <div className="absolute right-0 top-0 z-20 h-full w-32 md:w-80 bg-linear-to-l from-background to-transparent pointer-events-none transition-colors duration-1000" />

        {/* Carrusel Hotel (Izquierda -> Derecha) */}
        <div ref={trackHotelRef} className="flex w-max gap-8 will-change-transform">
          {hotelList.map((item, index) => (
            <AmenityItem key={`hotel-${index}`} item={item} />
          ))}
        </div>

        {/* Carrusel Festival (Derecha -> Izquierda) */}
        <div ref={trackFestivalRef} className="flex w-max gap-8 will-change-transform">
          {festivalList.map((item, index) => (
            <AmenityItem key={`fest-${index}`} item={item} isNeon />
          ))}
        </div>
      </div>
    </div>
  );
}
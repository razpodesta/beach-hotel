/**
 * @file AmenitiesMarquee.tsx
 * @description Aparato de visualización de amenidades con bucles infinitos de alto rendimiento.
 *              Refactorizado: Sincronización absoluta con esquemas v8.0, Cero Regresiones.
 * @version 8.0 - GSAP Optimized & Type-Safe
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useRef, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { useInfiniteCarouselAnimation } from '../../../lib/hooks/use-infinite-carousel-animation';
import { cn } from '../../../lib/utils/cn';

/**
 * IMPORTACIONES DE CONTRATO SOBERANO
 */
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { Amenity, AmenityIconType } from '../../../lib/schemas/value_proposition.schema';

/**
 * MAPA DE ICONOS SOBERANO
 * @description Centraliza la resolución de glifos con tipado estricto.
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
 * @pilar IX: Componentización granular.
 */
const AmenityItem = ({ item, isNeon }: { item: Amenity; isNeon?: boolean }) => {
  // Pilar III: Fallback seguro si el iconKey no existe en el mapa
  const Icon = ICON_MAP[item.iconKey as AmenityIconType] || Sparkles;

  return (
    <div className={cn(
      "group flex shrink-0 items-center gap-5 rounded-full border border-white/5 bg-zinc-900/40 px-8 py-5 transition-all duration-700",
      "hover:scale-105 hover:bg-zinc-800/80 hover:border-primary/20 backdrop-blur-2xl cursor-default"
    )}>
      <Icon 
        size={20} 
        strokeWidth={1.5}
        className={cn(
          "transition-all duration-700 group-hover:scale-125 group-hover:rotate-12", 
          isNeon ? 'text-pink-500' : 'text-primary'
        )} 
      />
      <span className="text-sm font-bold tracking-[0.2em] text-zinc-300 transition-colors duration-500 group-hover:text-white uppercase font-sans">
        {item.name}
      </span>
    </div>
  );
};

interface AmenitiesMarqueeProps {
  /** Fragmento nivelado del diccionario aplanado */
  dictionary: Dictionary['value_proposition'];
}

/**
 * APARATO: AmenitiesMarquee
 * @description Orquesta los rieles cinemáticos de validación visual de servicios.
 */
export function AmenitiesMarquee({ dictionary }: AmenitiesMarqueeProps) {
  const trackHotelRef = useRef<HTMLDivElement>(null);
  const trackFestivalRef = useRef<HTMLDivElement>(null);

  /**
   * MOTOR DE ANIMACIÓN INFINITA (GSAP Engine)
   * @pilar X: Performance - Animación optimizada mediante GPU Compositing.
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
      aria-label="Hotel and Festival Amenities"
    >
      <div className="space-y-10 relative">
        {/* MÁSCARAS DE DIFUMINADO (Edge Fading) - Pilar XII */}
        <div className="absolute left-0 top-0 z-20 h-full w-32 md:w-80 bg-linear-to-r from-[#020202] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 z-20 h-full w-32 md:w-80 bg-linear-to-l from-[#020202] to-transparent pointer-events-none" />

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
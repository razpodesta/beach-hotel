/**
 * @file apps/portfolio-web/src/components/sections/homepage/AmenitiesMarquee.tsx
 * @description Aparato de visualización de amenidades mediante ticker infinito.
 *              Implementa tipado estricto basado en el esquema de Zod y optimización de renderizado.
 * @version 5.0 - Type-Safe Icon Engine
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useRef, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles } from 'lucide-react';

import { BlurText } from '../../razBits/BlurText';
import { useInfiniteCarouselAnimation } from '../../../lib/hooks/use-infinite-carousel-animation';
import { cn } from '../../../lib/utils/cn';

// IMPORTACIONES DE CONTRATO
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { Amenity, AmenityIconType } from '../../../lib/schemas/value_proposition.schema';

/**
 * MAPA DE ICONOS SOBERANO
 * Vincula claves del CMS con componentes de Lucide.
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
 * Renderiza una cápsula de amenidad con feedback visual boutique.
 */
const AmenityItem = ({ item, isNeon }: { item: Amenity; isNeon?: boolean }) => {
  // @pilar III: Acceso seguro al mapa de iconos mediante el tipo AmenityIconType
  const Icon = ICON_MAP[item.iconKey] || Sparkles;

  return (
    <div className={cn(
      "group flex shrink-0 items-center gap-4 rounded-full border border-white/5 bg-zinc-900/40 px-8 py-4 transition-all duration-500",
      "hover:scale-110 hover:bg-zinc-800/80 hover:shadow-2xl hover:shadow-purple-500/10 backdrop-blur-xl cursor-default"
    )}>
      <Icon 
        size={20} 
        className={cn(
          "transition-colors duration-500", 
          isNeon ? 'text-pink-500 group-hover:text-pink-400' : 'text-purple-500 group-hover:text-purple-400'
        )} 
      />
      <span className="text-sm font-bold tracking-widest text-zinc-300 transition-colors duration-500 group-hover:text-white uppercase font-sans">
        {item.name}
      </span>
    </div>
  );
};

/**
 * APARATO PRINCIPAL: AmenitiesMarquee
 */
export function AmenitiesMarquee({ dictionary }: { dictionary: Dictionary['homepage']['value_proposition_section'] }) {
  const trackHotelRef = useRef<HTMLDivElement>(null);
  const trackFestivalRef = useRef<HTMLDivElement>(null);

  /**
   * ORQUESTACIÓN DE ANIMACIÓN (GSAP Engine)
   */
  useInfiniteCarouselAnimation([
    { ref: trackHotelRef, duration: 100, direction: 1 },
    { ref: trackFestivalRef, duration: 120, direction: -1 },
  ]);

  // @pilar I: Memoización para evitar cálculos de reconciliación innecesarios
  const hotelList = useMemo(() => dictionary.amenities_hotel, [dictionary.amenities_hotel]);
  const festivalList = useMemo(() => dictionary.amenities_festival, [dictionary.amenities_festival]);

  return (
    <section className="relative w-full overflow-hidden bg-[#020202] py-24 border-y border-white/5 select-none" aria-label="Hotel & Festival Amenities">
      {/* Glow Atmosférico */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03),transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 space-y-20">
        <div className="container mx-auto px-6 text-center">
          <BlurText 
            text={dictionary.amenities_title.toUpperCase()} 
            className="font-display text-4xl md:text-6xl font-bold text-white justify-center tracking-tighter" 
          />
        </div>

        <div className="space-y-8 relative">
          {/* Máscaras de gradiente para suavizar bordes del carrusel */}
          <div className="absolute left-0 top-0 z-20 h-full w-24 md:w-64 bg-linear-to-r from-[#020202] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 z-20 h-full w-24 md:w-64 bg-linear-to-l from-[#020202] to-transparent pointer-events-none" />

          {/* Carrusel Hotel (Derecha) */}
          <div ref={trackHotelRef} className="flex w-max gap-8 will-change-transform">
            {hotelList.map((item, index) => (
              <AmenityItem key={`hotel-${index}`} item={item} />
            ))}
          </div>

          {/* Carrusel Festival (Izquierda) */}
          <div ref={trackFestivalRef} className="flex w-max gap-8 will-change-transform">
            {festivalList.map((item, index) => (
              <AmenityItem key={`fest-${index}`} item={item} isNeon />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-6 text-center pt-8">
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-600 animate-pulse">
               {dictionary.amenities_cta}
            </p>
        </div>
      </div>
    </section>
  );
}
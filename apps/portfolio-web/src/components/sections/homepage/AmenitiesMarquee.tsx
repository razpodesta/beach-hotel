/**
 * @file apps/portfolio-web/src/components/sections/homepage/AmenitiesMarquee.tsx
 * @description Aparato de visualización de amenidades con tipado estricto y bucles infinitos.
 *              Refactorizado: Cumplimiento del Manifiesto MACS v1.0 (Acceso Aplanado).
 *              Implementa orquestación de iconos Lucide y animación de alto rendimiento.
 * @version 7.0 - MACS Flattened Sync & Performance Hardening
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useRef, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica mediante fronteras Nx.
 */
import { BlurText } from '../../razBits/BlurText';
import { useInfiniteCarouselAnimation } from '../../../lib/hooks/use-infinite-carousel-animation';
import { cn } from '../../../lib/utils/cn';

// IMPORTACIONES DE CONTRATO SOBERANO
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { Amenity, AmenityIconType } from '../../../lib/schemas/value_proposition.schema';

/**
 * MAPA DE ICONOS SOBERANO
 * @description Centraliza la resolución de glifos para evitar inyecciones dinámicas inseguras.
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
 * @description Renderiza una cápsula individual con micro-interacciones.
 */
const AmenityItem = ({ item, isNeon }: { item: Amenity; isNeon?: boolean }) => {
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
 * @interface AmenitiesMarqueeProps
 * @description Contrato inmutable para la inyección de datos.
 */
interface AmenitiesMarqueeProps {
  /** 
   * @pilar III: Seguridad de Tipos. 
   * Mapeo directo al aparato 'value_proposition' tras el aplanamiento MACS.
   */
  dictionary: Dictionary['value_proposition'];
}

/**
 * APARATO PRINCIPAL: AmenitiesMarquee
 * @description Orquesta los rieles cinemáticos de amenidades del Hotel y Festival.
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

  /**
   * GUARDIÁN DE RESILIENCIA (Pilar VIII)
   * Previene el renderizado de contenedores vacíos si el diccionario falla.
   */
  if (!dictionary || (hotelList.length === 0 && festivalList.length === 0)) {
    return null;
  }

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#020202] py-24 border-y border-white/5 select-none" 
      aria-label="Hotel & Festival Amenities"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03),transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 space-y-20">
        <div className="container mx-auto px-6 text-center">
          <BlurText 
            text={dictionary.amenities_title.toUpperCase()} 
            className="font-display text-4xl md:text-6xl font-bold text-white justify-center tracking-tighter" 
          />
        </div>

        <div className="space-y-8 relative">
          {/* MÁSCARAS DE DIFUMINADO (Edge Fading) */}
          <div className="absolute left-0 top-0 z-20 h-full w-24 md:w-64 bg-linear-to-r from-[#020202] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 z-20 h-full w-24 md:w-64 bg-linear-to-l from-[#020202] to-transparent pointer-events-none" />

          {/* Carrusel Hotel (Dirección Horaria) */}
          <div ref={trackHotelRef} className="flex w-max gap-8 will-change-transform">
            {hotelList.map((item: Amenity, index: number) => (
              <AmenityItem key={`hotel-${index}`} item={item} />
            ))}
          </div>

          {/* Carrusel Festival (Dirección Anti-horaria) */}
          <div ref={trackFestivalRef} className="flex w-max gap-8 will-change-transform">
            {festivalList.map((item: Amenity, index: number) => (
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
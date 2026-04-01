/**
 * @file AmenitiesMarquee.tsx
 * @description Orquestador de rieles de amenidades con estética de lujo.
 *              Refactorizado: Tipado estricto de mapa de iconos, 
 *              erradicación de código muerto y cumplimiento Linter.
 * @version 13.0 - Build Resilience & Type Hardening
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
 * @description Tipado con AmenityIconType para asegurar consistencia con Zod.
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
 */
const AmenityItem = memo(({ item, isNeon }: { item: Amenity; isNeon?: boolean }) => {
  const Icon = ICON_MAP[item.iconKey] || Sparkles;

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
          "transition-transform duration-700 group-hover:rotate-12",
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
 */
export function AmenitiesMarquee({ dictionary }: { dictionary: Dictionary['value_proposition'] }) {
  const trackHotelRef = useRef<HTMLDivElement>(null);
  const trackFestivalRef = useRef<HTMLDivElement>(null);

  useInfiniteCarouselAnimation([
    { ref: trackHotelRef, duration: 45, direction: 1 },
    { ref: trackFestivalRef, duration: 55, direction: -1 },
  ]);

  const hotelList = useMemo(() => (dictionary?.amenities_hotel ?? []), [dictionary]);
  const festivalList = useMemo(() => (dictionary?.amenities_festival ?? []), [dictionary]);
  const ariaLabel = (dictionary?.amenities_title as string) ?? 'Amenities';

  if (!dictionary) return null;

  return (
    <section 
      className="relative w-full overflow-hidden bg-transparent py-8 select-none" 
      role="region"
      aria-label={ariaLabel}
    >
      <div className="space-y-4 relative">
        <div className="absolute left-0 top-0 z-20 h-full w-24 md:w-64 bg-linear-to-r from-background via-background/80 to-transparent pointer-events-none transition-colors duration-1000" />
        <div className="absolute right-0 top-0 z-20 h-full w-24 md:w-64 bg-linear-to-l from-background via-background/80 to-transparent pointer-events-none transition-colors duration-1000" />

        {hotelList.length > 0 && (
          <div ref={trackHotelRef} className="flex w-max gap-4 py-1" role="list">
            {hotelList.map((item, index) => (
              <AmenityItem key={`hotel-${index}`} item={item} />
            ))}
          </div>
        )}

        {festivalList.length > 0 && (
          <div ref={trackFestivalRef} className="flex w-max gap-4 py-1" role="list">
            {festivalList.map((item, index) => (
              <AmenityItem key={`fest-${index}`} item={item} isNeon />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
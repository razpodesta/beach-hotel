// RUTA: apps/portfolio-web/src/components/sections/homepage/AmenitiesMarquee.tsx

/**
 * @file Carrusel Dual de Amenities (Hospitality Edition)
 * @version 6.0 - Elite Architecture
 * @description Muestra los servicios del hotel y el festival en dos loops infinitos.
 *              Sustituye al antiguo TechStackSection con un diseño inmersivo y oscuro.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useRef } from 'react';
import {
  Wifi, Waves, Utensils, Dumbbell, ShieldCheck, Coffee, Car, Sparkles,
  Disc3, Martini, Ship, Ticket, Music, MapPin, Users, Flame
} from 'lucide-react';
import { BlurText } from '../../razBits/BlurText';
import { useInfiniteCarouselAnimation } from '../../../lib/hooks/use-infinite-carousel-animation';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

type AmenityInfo = {
  name: string;
  icon: React.ElementType;
};

// 1. Array Superior: El Hotel (The Sanctuary)
const hotelAmenities: AmenityInfo[] =[
  { name: 'Wi-Fi 6', icon: Wifi },
  { name: 'Piscina Infinita', icon: Waves },
  { name: 'Alta Gastronomía', icon: Utensils },
  { name: 'Gimnasio 24/7', icon: Dumbbell },
  { name: 'Seguridad Privada', icon: ShieldCheck },
  { name: 'Desayuno Gourmet', icon: Coffee },
  { name: 'Transfer Aeropuerto', icon: Car },
  { name: 'Room Service', icon: Sparkles },
];

// 2. Array Inferior: El Festival (The Takeover)
const festivalAmenities: AmenityInfo[] =[
  { name: 'DJs Residentes', icon: Disc3 },
  { name: 'Open Bar Premium', icon: Martini },
  { name: 'Boat Parties', icon: Ship },
  { name: 'Acceso Backstage', icon: Ticket },
  { name: 'Sound System 3D', icon: Music },
  { name: 'Ubicación Élite', icon: MapPin },
  { name: 'Comunidad Global', icon: Users },
  { name: 'Pool Parties', icon: Flame },
];

type AmenitiesMarqueeProps = {
  dictionary: Dictionary['homepage']['value_proposition_section'];
};

const AmenityItem = ({ item, isNeon }: { item: AmenityInfo, isNeon?: boolean }) => (
  <div className="group flex shrink-0 items-center gap-3 rounded-full border border-white/5 bg-zinc-900/40 px-6 py-3 transition-all duration-300 will-change-transform hover:scale-110 hover:bg-zinc-800/80 hover:shadow-lg hover:border-purple-500/30 backdrop-blur-md cursor-default">
    <item.icon className={`h-5 w-5 transition-colors duration-300 ${isNeon ? 'text-pink-500 group-hover:text-pink-400' : 'text-zinc-500 group-hover:text-purple-400'}`} />
    <span className="text-sm font-bold tracking-wide text-zinc-300 transition-colors duration-300 group-hover:text-white uppercase">{item.name}</span>
  </div>
);

export function AmenitiesMarquee({ dictionary }: AmenitiesMarqueeProps) {
  const trackHotelRef = useRef<HTMLDivElement>(null);
  const trackFestivalRef = useRef<HTMLDivElement>(null);

  useInfiniteCarouselAnimation([
    { ref: trackHotelRef, duration: 90, direction: 1 },
    { ref: trackFestivalRef, duration: 110, direction: -1 },
  ]);

  return (
    <section className="relative w-full overflow-hidden bg-[#050505] py-20 sm:py-32 border-y border-white/5 select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05),transparent_60%)] pointer-events-none" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 mb-16 text-center">
          <BlurText
            text={dictionary.amenities_title}
            className="font-display text-3xl font-bold text-white sm:text-5xl justify-center tracking-tight uppercase"
            animateBy="words"
          />
        </div>

        <div className="space-y-6 relative">
          {/* Vignetage lateral profundo para esconder la entrada/salida de los items */}
          <div className="absolute left-0 top-0 z-20 h-full w-16 md:w-48 bg-linear-to-r from-[#050505] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 z-20 h-full w-16 md:w-48 bg-linear-to-l from-[#050505] to-transparent pointer-events-none" />

          {/* Track 1: Hotel */}
          <div ref={trackHotelRef} className="flex w-max gap-6">
            {[...hotelAmenities, ...hotelAmenities, ...hotelAmenities].map((item, index) => (
              <AmenityItem key={`${item.name}-hotel-${index}`} item={item} />
            ))}
          </div>

          {/* Track 2: Festival */}
          <div ref={trackFestivalRef} className="flex w-max gap-6">
            {[...festivalAmenities, ...festivalAmenities, ...festivalAmenities].map((item, index) => (
              <AmenityItem key={`${item.name}-fest-${index}`} item={item} isNeon />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 mt-20 text-center">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-600">
                {dictionary.amenities_cta}
            </p>
        </div>
      </div>
    </section>
  );
}
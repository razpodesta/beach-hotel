import { Hotel, Sparkles, BedDouble, History, MessageSquare, MapPin } from 'lucide-react';

export const mainNavStructure = [
  { 
    labelKey: 'hotel', 
    children: [
      { labelKey: 'habitaciones', href: '/#rooms', Icon: BedDouble },
      { labelKey: 'historia', href: '/historia', Icon: History },
    ], 
    isNested: true, 
    Icon: Hotel 
  },
  { labelKey: 'festival', href: '/festival', Icon: Sparkles }, 
  { labelKey: 'ubicacion', href: '/#location', Icon: MapPin },
  { labelKey: 'contacto', href: '/contacto', Icon: MessageSquare },
];
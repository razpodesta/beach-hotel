/**
 * @file apps/portfolio-web/src/lib/nav-links.ts
 * @description Fuente única de verdad para la estructura de navegación del ecosistema.
 *              Define los enlaces del Header y las columnas del Footer.
 * @version 2.0
 * @author Raz Podestá - MetaShark Tech
 */

import { 
  Hotel, 
  Sparkles, 
  BedDouble, 
  History, 
  MessageSquare, 
  MapPin,
  ShieldCheck,
  FileText,
  LayoutGrid,
  Laptop
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

export interface NavLink {
  labelKey: string;
  href: string;
  Icon?: LucideIcon;
}

export interface FooterColumn {
  columnKey: string;
  links: NavLink[];
}

/**
 * Estructura de navegación principal (Header)
 */
export const mainNavStructure = [
  { 
    labelKey: 'hotel', 
    children: [
      { labelKey: 'habitaciones', href: '/#rooms', Icon: BedDouble },
      { labelKey: 'historia', href: '/quienes-somos', Icon: History },
    ], 
    isNested: true, 
    Icon: Hotel 
  },
  { labelKey: 'festival', href: '/festival', Icon: Sparkles }, 
  { labelKey: 'ubicacion', href: '/#location', Icon: MapPin },
  { labelKey: 'contacto', href: '/contacto', Icon: MessageSquare },
];

/**
 * Estructura de navegación del pie de página (Footer)
 * Las llaves 'columnKey' deben existir en dictionary.footer
 */
export const footerNavStructure: FooterColumn[] = [
  {
    columnKey: 'column_nav_title',
    links: [
      { labelKey: 'hotel', href: '/#hero' },
      { labelKey: 'festival', href: '/festival' },
      { labelKey: 'habitaciones', href: '/#suites' },
      { labelKey: 'historia', href: '/quienes-somos' },
    ]
  },
  {
    columnKey: 'column_services_title',
    links: [
      { labelKey: 'reservas', href: '/#reservas', Icon: Laptop },
      { labelKey: 'servicios', href: '/servicios/desarrollo-frontend', Icon: LayoutGrid },
    ]
  },
  {
    columnKey: 'column_legal_title',
    links: [
      { labelKey: 'politica_privacidad', href: '/legal/politica-de-privacidad', Icon: ShieldCheck },
      { labelKey: 'terminos_servicio', href: '/legal/terminos-de-servicio', Icon: FileText },
    ]
  }
];
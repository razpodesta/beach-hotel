/**
 * @file apps/portfolio-web/src/lib/nav-links.ts
 * @version 2.1 - Contrato de Navegación Recursiva
 * @description Fuente única de verdad tipada para la navegación del ecosistema.
 * @author Raz Podestá - MetaShark Tech
 */

import { 
  Hotel, Sparkles, BedDouble, History, MessageSquare, MapPin,
  ShieldCheck, FileText, LayoutGrid, Laptop
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

export interface NavLink {
  labelKey: string;
  href: string;
  Icon?: LucideIcon;
}

/**
 * Interfaz recursiva para soportar menús desplegables anidados.
 */
export interface NavItem extends NavLink {
  children?: NavLink[];
  isNested?: boolean;
}

export interface FooterColumn {
  columnKey: string;
  links: NavLink[];
}

/**
 * Estructura de navegación principal (Header)
 * Tipada explícitamente con NavItem para habilitar children.
 */
export const mainNavStructure: NavItem[] = [
  { 
    labelKey: 'hotel', 
    href: '#',
    Icon: Hotel,
    isNested: true,
    children: [
      { labelKey: 'habitaciones', href: '/#rooms', Icon: BedDouble },
      { labelKey: 'historia', href: '/quienes-somos', Icon: History },
    ], 
  },
  { labelKey: 'festival', href: '/festival', Icon: Sparkles }, 
  { labelKey: 'ubicacion', href: '/#location', Icon: MapPin },
  { labelKey: 'contacto', href: '/contacto', Icon: MessageSquare },
];

/**
 * Estructura de navegación del pie de página (Footer)
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
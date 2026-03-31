/**
 * @file apps/portfolio-web/src/lib/nav-links.ts
 * @description Fuente única de verdad tipada para la navegación del ecosistema.
 *              Refactorizado: Decomisado de Festival y activación del motor
 *              de Paquetes y Programas Boutique.
 * @version 3.0 - Offers & Programs Transformation
 * @author Raz Podestá - MetaShark Tech
 */

import { 
  Hotel, 
  BedDouble, 
  History, 
  MessageSquare, 
  MapPin,
  ShieldCheck, 
  FileText, 
  Gift, // Icono para Paquetes/Ofertas
  LayoutGrid, 
  Laptop
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
 * @description Orquesta el acceso a las suites y los nuevos programas del hotel.
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
  /**
   * @pilar II: Transformación de Producto.
   * Sustituimos el Festival por el catálogo de Programas y Paquetes.
   */
  { labelKey: 'paquetes', href: '/paquetes', Icon: Gift }, 
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
      { labelKey: 'paquetes', href: '/paquetes' }, // Sincronía con Header
      { labelKey: 'habitaciones', href: '/#suites' },
      { labelKey: 'historia', href: '/quienes-somos' },
    ]
  },
  {
    columnKey: 'column_services_title',
    links: [
      { labelKey: 'reservas', href: '/#reservas', Icon: Laptop },
      /** @fix: Re-orientación de servicios institucionales a hospitalidad */
      { labelKey: 'servicios', href: '/servicios', Icon: LayoutGrid },
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
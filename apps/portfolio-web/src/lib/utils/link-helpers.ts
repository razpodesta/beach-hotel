/**
 * @file apps/portfolio-web/src/lib/utils/link-helpers.ts
 * @description Utilidades de saneamiento y localización de hipervínculos. 
 *              Garantiza que la navegación interna respete el contexto de idioma activo.
 * @version 2.0
 * @author Raz Podestá - MetaShark Tech
 */

// CORRECCIÓN: Uso de ruta relativa para cumplir con @nx/enforce-module-boundaries
import { type Locale } from '../../config/i18n.config';

/**
 * Transforma una ruta lógica en una ruta física localizada para el ecosistema.
 * Maneja excepciones para enlaces externos, protocolos de comunicación y anclas de página.
 * 
 * @param href - La ruta de destino original (ej: '/reservas' o '#servicios').
 * @param currentLang - El idioma activo en la sesión del usuario.
 * @returns La URL final procesada y lista para el componente Link de Next.js.
 */
export function getLocalizedHref(href: string | undefined, currentLang: Locale): string {
  // 1. Guardia de Resiliencia: Si no hay destino, retornamos un ancla nula segura.
  if (!href || href === '') return '#';

  // 2. Bypass Técnico: Ignorar enlaces externos, protocolos mailto/tel o anclas puras.
  const isExternal = href.startsWith('http');
  const isProtocol = href.startsWith('mailto:') || href.startsWith('tel:');
  const isPureAnchor = href === '#';

  if (isExternal || isProtocol || isPureAnchor) {
    return href;
  }

  // 3. Verificación de Redundancia: Si la ruta ya incluye el locale, se retorna íntegra.
  if (href.startsWith(`/${currentLang}/`) || href === `/${currentLang}`) {
    return href;
  }

  // 4. Saneamiento de Segmentos: Asegurar que la ruta comience con '/'
  // Si es un ancla interna (ej: '#contact'), Next.js recomienda prefijar con '/' 
  // para forzar la navegación a la home si el usuario está en una subpágina.
  const cleanPath = href.startsWith('/') ? href : `/${href}`;

  /**
   * 5. Construcción Soberana:
   * Concatenamos el locale con la ruta limpia y eliminamos la barra final (trailing slash)
   * para mantener la consistencia SEO, excepto para la raíz del idioma.
   */
  const localizedPath = `/${currentLang}${cleanPath}`;
  
  return localizedPath.length > 6 
    ? localizedPath.replace(/\/$/, '') 
    : localizedPath;
}
/**
 * @file apps/portfolio-web/src/lib/utils/link-helpers.ts
 * @description Motor soberano de resolución y localización de hipervínculos. 
 *              Garantiza que toda la navegación interna sea SEO-Friendly y 
 *              respete el contexto de idioma inyectado por el middleware.
 * @version 3.0
 * @author Raz Podestá - MetaShark Tech
 */

// CUMPLIMIENTO @nx/enforce-module-boundaries: Uso de ruta relativa interna
import { type Locale } from '../../config/i18n.config';

/**
 * Transforma una ruta lógica en una URL física localizada.
 * 
 * MEJORAS DE ÉLITE:
 * 1. Soporte extendido para protocolos de comunicación (tel, mailto, wa.me).
 * 2. Normalización semántica de anclas (asegura navegación a home desde subpáginas).
 * 3. Control estricto de trailing slashes para evitar penalizaciones de contenido duplicado en SEO.
 * 
 * @param {string | undefined} href - Ruta de destino (ej: '/festival', '#suites', 'https://...').
 * @param {Locale} currentLang - Idioma activo de la sesión.
 * @returns {string} URL final saneada y localizada.
 */
export function getLocalizedHref(href: string | undefined, currentLang: Locale): string {
  // 1. Resiliencia: Si el destino es nulo o vacío, retornamos ancla segura.
  if (!href || href === '') return '#';

  /**
   * 2. Detección de Enlaces Externos y Protocolos.
   * Incluimos wa.me (WhatsApp) por ser crítico en el sector de hospitalidad.
   */
  const isExternal = href.startsWith('http') || href.startsWith('//');
  const isProtocol = href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('wa.me');
  const isPureAnchor = href === '#';

  if (isExternal || isProtocol || isPureAnchor) {
    return href;
  }

  // 3. Evitar redundancia: Si la ruta ya contiene el locale, no procesar.
  if (href.startsWith(`/${currentLang}/`) || href === `/${currentLang}`) {
    return href;
  }

  /**
   * 4. Saneamiento de anclas internas.
   * En Next.js, si estamos en /blog y clickeamos en '#reservas', no ocurrirá nada.
   * Normalizamos a '/#reservas' para forzar la vuelta a la landing page.
   */
  const cleanPath = href.startsWith('#') ? `/${href}` : href.startsWith('/') ? href : `/${href}`;

  /**
   * 5. Construcción y Normalización SEO.
   * Generamos la ruta y eliminamos la barra final solo si la ruta tiene profundidad,
   * manteniendo la integridad de la raíz de idioma (ej: '/pt-BR' se mantiene).
   */
  const localizedPath = `/${currentLang}${cleanPath}`;
  
  // Normalización final: Elimina '/' al final si existe, a menos que sea la raíz.
  return localizedPath.length > 6 
    ? localizedPath.replace(/\/$/, '') 
    : localizedPath;
}
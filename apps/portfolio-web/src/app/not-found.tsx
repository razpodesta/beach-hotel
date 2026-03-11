/**
 * @file apps/portfolio-web/src/app/not-found.tsx
 * @description Guardián de errores 404 a nivel raíz (fuera de segmentos de idioma).
 *              Implementa un protocolo de rescate redireccionando al usuario a la
 *              recepción (Home) del idioma soberano por defecto.
 * @version 10.0
 * @author Raz Podestá - MetaShark Tech
 */

import { redirect } from 'next/navigation';

/**
 * IMPORTACIONES NIVELADAS (Cumplimiento estricto @nx/enforce-module-boundaries)
 * Se utiliza la ruta relativa para mantener la integridad del grafo de Nx.
 */
import { i18n } from '../config/i18n.config';

/**
 * Aparato de Rescate: GlobalNotFound
 * Este componente actúa como la última línea de defensa cuando el middleware
 * no logra interceptar una ruta inexistente o mal formada en la raíz del dominio.
 */
export default function GlobalNotFound() {
  /**
   * PROTOCOLO DE REDIRECCIÓN:
   * Forzamos el regreso al ecosistema controlado mediante el locale por defecto.
   * En el Beach Hotel Canasvieiras, el flujo siempre debe ser localizado.
   */
  redirect(`/${i18n.defaultLocale}`);
}
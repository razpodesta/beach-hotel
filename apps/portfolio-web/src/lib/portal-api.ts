/**
 * @file apps/portfolio-web/src/lib/portal-api.ts
 * @description Fachada Pública Soberana del Portal del Santuario.
 *              Único punto de entrada para datos de Dashboard y RBAC.
 * @version 1.0 - Portal Domain Facade
 * @author Raz Podestá - MetaShark Tech
 */

/** 
 * EXPORTACIONES LÓGICAS 
 * @pilar IX: Encapsulamiento de la lógica de negocio.
 */
export { getPortalData } from './portal/actions';

/** 
 * EXPORTACIONES DE CONTRATO 
 * @pilar III: Seguridad de Tipos.
 */
export type { PortalData } from './schemas/portal_data.schema';
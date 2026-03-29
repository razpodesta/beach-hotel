/**
 * @file apps/portfolio-web/src/lib/portal/index.ts
 * @description Fachada Pública Soberana del Dominio del Portal.
 *              Orquesta la exposición de acciones de servidor (CRUD S3),
 *              y los contratos/shapers para la gestión de activos.
 * @version 2.0 - S3 CRUD Integrated Facade
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * EXPORTACIONES LÓGICAS (Server Actions)
 * @pilar IX: Encapsulamiento de lógica de negocio y operaciones atómicas.
 */
export { 
  uploadMediaAction,
  deleteMediaAction
} from './actions/media.actions';

/**
 * EXPORTACIONES DE CONTRATO Y TRANSFORMACIÓN (Shapers)
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export { shapeMediaEntity } from './shapers/media.shaper';
export type { SovereignMedia } from './shapers/media.shaper';
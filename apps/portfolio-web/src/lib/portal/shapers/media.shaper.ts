/**
 * @file media.shaper.ts
 * @description Transformador de entidades multimedia.
 *              Refactorizado: Erradicación de la violación de frontera Nx,
 *              uso de alias soberano y adopción del contrato estático PayloadMediaDoc
 *              para resolver la dependencia del archivo autogenerado.
 * @version 2.0 - Boundary Compliance & Static SSoT
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * IMPORTACIONES DE CONTRATO
 * @pilar V: Adherencia a las fronteras de Nx. 
 * Importación vía NPM Scope (@metashark) erradicando rutas relativas extremas.
 */
import type { PayloadMediaDoc } from '@metashark/cms-core';

export interface SovereignMedia {
  id: string;
  url: string;
  alt: string;
  mimeType: string;
  filesize: number;
  dimensions: { width: number; height: number };
}

/**
 * @description Transforma el documento crudo de Payload en un Activo Soberano.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export function shapeMediaEntity(doc: PayloadMediaDoc): SovereignMedia {
  // Aseguramos que la URL sea un string (PayloadMediaDoc lo permite por contrato)
  const url = typeof doc.url === 'string' ? doc.url : '';
  
  return {
    id: doc.id,
    url: url,
    alt: doc.alt || 'Unnamed Asset',
    mimeType: doc.mimeType || 'image/unknown',
    filesize: doc.filesize || 0,
    dimensions: {
      width: doc.width || 0,
      height: doc.height || 0,
    },
  };
}
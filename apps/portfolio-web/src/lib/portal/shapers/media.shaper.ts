/**
 * @file media.shaper.ts
 * @description Transformador soberano de entidades multimedia (The Alchemist).
 *              Refactorizado: Aislamiento por Tenant, resolución de URLs absolutas
 *              (anti-404) y blindaje contra fugas de datos (Tenant Leakage).
 * @version 4.0 - Security Shielded Edition
 * @author Raz Podestá - MetaShark Tech
 */

import type { PayloadMediaDoc } from '@metashark/cms-core';

/**
 * @interface SovereignMedia
 * @description Contrato de salida para la UI de alta fidelidad.
 */
export interface SovereignMedia {
  id: string;
  url: string;
  alt: string;
  mimeType: string;
  filesize: number;
  dimensions: { 
    width: number; 
    height: number;
    aspectRatio: number;
  };
}

/**
 * @description Transforma el documento crudo de Payload en un Activo Soberano.
 * @param {PayloadMediaDoc} doc - Documento crudo del CMS.
 * @param {string} [currentTenantId] - Si se provee, blinda el activo contra acceso cross-tenant.
 * @returns {SovereignMedia | null} Entidad purificada o null si hay violación de seguridad.
 */
export function shapeMediaEntity(
  doc: PayloadMediaDoc, 
  currentTenantId?: string
): SovereignMedia | null {
  
  // 1. BLINDAJE DE SEGURIDAD (Tenant Boundary Shield)
  // Normalizamos el tenant del documento a string para comparar.
  const docTenant = typeof doc.tenant === 'object' && doc.tenant !== null 
    ? doc.tenant.id 
    : doc.tenant;

  if (currentTenantId && docTenant !== currentTenantId) {
    console.warn(`[HEIMDALL][SECURITY-ALERT] Attempted tenant leak detected. Asset: ${doc.id}`);
    return null;
  }

  // 2. RESOLUCIÓN DE RUMBO (The Sovereign Path)
  let finalUrl = typeof doc.url === 'string' ? doc.url : '';
  
  if (!finalUrl) {
    console.warn(`[HEIMDALL][VAULT] Asset URL missing: ${doc.id}`);
    return null;
  }
  
  if (!finalUrl.startsWith('http')) {
    const cmsBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    finalUrl = `${cmsBaseUrl.replace(/\/$/, '')}/${finalUrl.replace(/^\//, '')}`;
  }

  // 3. NORMALIZACIÓN DE DIMENSIONES (CLS Protection)
  const width = doc.width || 1200;
  const height = doc.height || 630;
  
  return {
    id: doc.id,
    url: finalUrl,
    alt: doc.alt || 'Beach Hotel Boutique Asset',
    mimeType: doc.mimeType || 'image/webp',
    filesize: doc.filesize || 0,
    dimensions: {
      width,
      height,
      aspectRatio: width / height,
    },
  };
}
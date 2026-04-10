/**
 * @file packages/cms/core/src/collections/Access.ts
 * @description Orquestador Soberano de Seguridad Multi-Tenant (Security Core).
 *              Centraliza la lógica de RBAC, aislamiento de perímetros y 
 *              validación de jerarquías del Protocolo 33.
 *              Refactorizado: Sincronización con ROLES_CONFIG, extracción de tenant 
 *              hardened y telemetría forense Heimdall v2.5.
 *              Estándar: Multi-Tenant Shield & Forensic Auditing.
 * @version 10.0 - Sovereign Role Sync & Forensic Latency
 * @author Staff Engineer - MetaShark Tech
 */

import type { Access, Where } from 'payload';
/** 
 * IMPORTACIONES DE CONTRATO (SSoT)
 * @pilar V: Adherencia Arquitectónica. Extensiones .js para cumplimiento ESM.
 */
import { type SovereignRoleType } from './users/roles/config';

/**
 * @interface SovereignUser
 * @description Contrato de identidad inmutable para el clúster de seguridad.
 */
interface SovereignUser {
  id: string;
  email: string;
  role: SovereignRoleType;
  tenant?: string | { id: string } | null;
  level?: number;
}

/** CONSTANTES CROMÁTICAS HEIMDALL v2.5 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

// ============================================================================
// HELPERS ATÓMICOS DE AUTORIDAD (Zero-Drift Logic)
// ============================================================================

/**
 * @function isSovereignUser
 * @description Type guard para asegurar la integridad del nodo de identidad.
 */
const isSovereignUser = (user: unknown): user is SovereignUser => {
  return (
    user !== null &&
    typeof user === 'object' &&
    'id' in user &&
    'role' in user
  );
};

/**
 * @function getIdentityPerimeter
 * @description Extrae de forma segura el ID del Tenant y el nivel de autoridad.
 */
const getIdentityPerimeter = (user: SovereignUser) => {
  const tenantId = typeof user.tenant === 'object' ? user.tenant?.id : user.tenant;
  const isSuperUser = user.role === 'admin' || user.role === 'developer';
  return { tenantId, isSuperUser };
};

// ============================================================================
// REGLAS DE ACCESO SOBERANAS
// ============================================================================

/**
 * REGLA: multiTenantReadAccess
 * @description Orquesta la visibilidad: SuperUsers (Todo) | Otros (Su Tenant + Público).
 */
export const multiTenantReadAccess: Access = async ({ req: { user } }) => {
  const start = performance.now();
  const traceId = `acc_read_${Date.now().toString(36).toUpperCase()}`;
  
  if (!isSovereignUser(user)) {
    const publicFilter: Where = { status: { equals: 'published' } };
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${C.yellow}   ✓ [ACCESS][PUBLIC]${C.reset} Anonymous read | Trace: ${traceId} | Time: ${(performance.now() - start).toFixed(4)}ms`);
    }
    return publicFilter;
  }

  const { tenantId, isSuperUser } = getIdentityPerimeter(user);

  // 1. Root Bypass (S0/S1)
  if (isSuperUser) {
    return true;
  }

  // 2. Aislamiento por Perímetro (Tenant Guard) + Contenido Público
  const filter: Where = {
    or: [
      { status: { equals: 'published' } },
      ...(tenantId ? [{ tenant: { equals: tenantId } }] : [])
    ]
  };

  if (process.env.NODE_ENV !== 'test') {
    console.log(`${C.cyan}   ✓ [ACCESS][TENANT]${C.reset} Filtered for ${user.email} | Trace: ${traceId} | Time: ${(performance.now() - start).toFixed(4)}ms`);
  }
  return filter;
};

/**
 * REGLA: multiTenantWriteAccess
 * @description Blindaje de escritura: SuperUsers (Todo) | Otros (Solo su Tenant).
 */
export const multiTenantWriteAccess: Access = async ({ req: { user, url } }) => {
  // const start = performance.now();
  const traceId = `acc_write_${Date.now().toString(36).toUpperCase()}`;

  if (!isSovereignUser(user)) {
    console.error(`${C.red}   ✕ [ACCESS][DENIED]${C.reset} Unauthenticated write at ${url} | Trace: ${traceId}`);
    return false;
  }

  const { tenantId, isSuperUser } = getIdentityPerimeter(user);

  // 1. Root Bypass
  if (isSuperUser) {
    return true;
  }

  // 2. Aislamiento Estricto
  if (tenantId) {
    return { tenant: { equals: tenantId } };
  }

  /** ALERTA DE SEGURIDAD (Brecha detectada) */
  console.error(`${C.red}${C.bold}   [BREACH]${C.reset} Attempted write without Tenant | User: ${user.email} | Trace: ${traceId}`);
  return false;
};

/**
 * REGLA: adminOnly
 * @description Reserva el acceso estrictamente a la jerarquía de gestión (S0/S1).
 */
export const adminOnly: Access = async ({ req: { user } }) => {
  const isAuth = isSovereignUser(user) && (user.role === 'admin' || user.role === 'developer');
  
  if (!isAuth && process.env.NODE_ENV !== 'test') {
    console.warn(`${C.red}   ✕ [ACCESS][BLOCKED]${C.reset} Admin-only area attempt by: ${user?.email || 'Unknown'}`);
  }

  return isAuth;
};

/**
 * REGLA: eliteGating (Protocolo 33 Integrated)
 * @description Gating dinámico basado en el nivel de ascensión.
 */
export const eliteGating = (minLevel: number): Access => async ({ req: { user } }) => {
  if (!isSovereignUser(user)) return false;
  const { isSuperUser } = getIdentityPerimeter(user);
  
  // La jerarquía de ingeniería ignora el gating de experiencia
  if (isSuperUser) return true;
  
  const hasLevel = (user.level ?? 0) >= minLevel;
  
  if (!hasLevel && process.env.NODE_ENV !== 'test') {
    console.log(`${C.yellow}   ✕ [P33_GATING]${C.reset} Level too low for access: ${user.level}/${minLevel}`);
  }

  return hasLevel;
};
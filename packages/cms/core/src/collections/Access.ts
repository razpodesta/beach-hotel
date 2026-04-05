/**
 * @file packages/cms/core/src/collections/Access.ts
 * @description Orquestador Soberano de Seguridad Multi-Tenant (Security Core).
 *              Centraliza la lógica de RBAC, aislamiento de perímetros y 
 *              validación de jerarquías del Protocolo 33.
 *              Refactorizado: Atomización de helpers de autoridad y telemetría 
 *              Heimdall de ultra-performance.
 * @version 9.0 - Atomic Security & P33 Ready
 * @author Raz Podestá - MetaShark Tech
 */

import type { Access, Where } from 'payload';

/**
 * @interface SovereignUser
 * @description Contrato de identidad inmutable para el clúster de seguridad.
 */
interface SovereignUser {
  id: string;
  email: string;
  role: 'developer' | 'admin' | 'operator' | 'sponsor' | 'guest';
  tenant?: string | { id: string } | null;
  level?: number; // Hook para Protocolo 33
}

/**
 * CONSTANTES DE TELEMETRÍA (Protocolo Heimdall)
 */
const C = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

// ============================================================================
// HELPERS ATÓMICOS DE AUTORIDAD (Zero-Drift Logic)
// ============================================================================

/**
 * @function isSovereignUser
 * @description Type guard para asegurar la integridad del objeto user.
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
 * @function getIdentityDetails
 * @description Extrae de forma segura el ID del Tenant y el nivel de autoridad.
 */
const getIdentityDetails = (user: SovereignUser) => {
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
export const multiTenantReadAccess: Access = ({ req: { user } }) => {
  const start = performance.now();
  
  if (!isSovereignUser(user)) {
    const publicFilter: Where = { status: { equals: 'published' } };
    console.log(`${C.yellow}   ✓ [ACCESS][PUBLIC]${C.reset} Anonymous read access | Time: ${(performance.now() - start).toFixed(4)}ms`);
    return publicFilter;
  }

  const { tenantId, isSuperUser } = getIdentityDetails(user);

  // 1. Root Bypass
  if (isSuperUser) {
    console.log(`${C.green}   ✓ [ACCESS][ROOT]${C.reset} SuperUser ${user.email} granted total read | Time: ${(performance.now() - start).toFixed(4)}ms`);
    return true;
  }

  // 2. Aislamiento por Perímetro + Contenido Público
  const filter: Where = {
    or: [
      { status: { equals: 'published' } },
      ...(tenantId ? [{ tenant: { equals: tenantId } }] : [])
    ]
  };

  console.log(`${C.cyan}   ✓ [ACCESS][TENANT]${C.reset} Filtered read for ${user.email} | Tenant: ${tenantId} | Time: ${(performance.now() - start).toFixed(4)}ms`);
  return filter;
};

/**
 * REGLA: multiTenantWriteAccess
 * @description Blindaje de escritura: SuperUsers (Todo) | Otros (Solo su Tenant).
 */
export const multiTenantWriteAccess: Access = ({ req: { user, url } }) => {
  const start = performance.now();

  if (!isSovereignUser(user)) {
    console.log(`${C.red}   ✕ [ACCESS][DENIED]${C.reset} Unauthenticated write attempt at ${url}`);
    return false;
  }

  const { tenantId, isSuperUser } = getIdentityDetails(user);

  // 1. Root Bypass
  if (isSuperUser) {
    console.log(`${C.green}   ✓ [ACCESS][ROOT]${C.reset} SuperUser ${user.email} granted write | Time: ${(performance.now() - start).toFixed(4)}ms`);
    return true;
  }

  // 2. Aislamiento Estricto
  if (tenantId) {
    console.log(`${C.cyan}   ✓ [ACCESS][TENANT]${C.reset} Restricted write for ${user.email} | Tenant: ${tenantId} | Time: ${(performance.now() - start).toFixed(4)}ms`);
    return { tenant: { equals: tenantId } };
  }

  /** ALERTA DE SEGURIDAD (Heimdall Protocol) */
  console.error(`${C.red}${C.bold}   [HEIMDALL][SECURITY-BREACH] Attempted write without Tenant | User: ${user.email} | Target: ${url}${C.reset}`);
  return false;
};

/**
 * REGLA: adminOnly
 * @description Reserva el acceso estrictamente a la jerarquía de gestión.
 */
export const adminOnly: Access = ({ req: { user } }) => {
  const start = performance.now();
  
  const isAuth = isSovereignUser(user) && (user.role === 'admin' || user.role === 'developer');
  const duration = (performance.now() - start).toFixed(4);

  if (isAuth) {
    console.log(`${C.green}   ✓ [ACCESS][ADMIN]${C.reset} Access confirmed | Time: ${duration}ms`);
  } else {
    console.log(`${C.red}   ✕ [ACCESS][BLOCKED]${C.reset} Admin-only area | User: ${user?.email || 'Unknown'} | Time: ${duration}ms`);
  }

  return isAuth;
};

/**
 * REGLA: eliteGating (Protocolo 33 Ready)
 * @description Ejemplo de cómo el sistema está listo para el gating por nivel.
 */
export const eliteGating = (minLevel: number): Access => ({ req: { user } }) => {
  if (!isSovereignUser(user)) return false;
  const { isSuperUser } = getIdentityDetails(user);
  if (isSuperUser) return true;
  
  return (user.level ?? 0) >= minLevel;
};
/**
 * @file packages/cms/core/src/collections/users/roles/config.ts
 * @description Matriz de Roles Soberanos (Identity SSoT).
 *              Define la jerarquía de poder, niveles de autoridad (RBAC) y 
 *              branding técnico del ecosistema MetaShark Tech.
 *              Refactorizado: Normalización de telemetría Heimdall v2.5, 
 *              inyección de buscadores de rol y aislamiento de build.
 * @version 1.4 - DNA Core Registry & Performance Hardened
 * @author Staff Engineer - MetaShark Tech
 */

/** 
 * PROTOCOLO CROMÁTICO HEIMDALL v2.5 
 */
const C = {
  reset: '\x1b[0m',
  magenta: '\x1b[35m',
  green: '\x1b[32m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

const registryStart = performance.now();

/**
 * @interface RoleConfig
 * @description Contrato de definición de rango y autoridad digital.
 */
export interface RoleConfig {
  /** Glosa descriptiva para la interfaz administrativa */
  readonly label: string;
  /** Identificador técnico inmutable (SSoT) */
  readonly value: 'developer' | 'admin' | 'operator' | 'sponsor' | 'guest';
  /** Peso de autoridad para el motor de Gating RBAC (0-99) */
  readonly level: number;
}

/**
 * @description Jerarquía de Poder Inmutable.
 * @pilar III: Seguridad de Tipos Absoluta via 'as const'.
 * @pilar IX: Única Fuente de Verdad para todo el monorepo.
 */
export const ROLES_CONFIG = [
  { label: 'Root Developer (S0)', value: 'developer', level: 99 },
  { label: 'Hotel Manager (S1)', value: 'admin', level: 50 },
  { label: 'Wholesale Operator (S2)', value: 'operator', level: 30 },
  { label: 'Elite Sponsor (S3)', value: 'sponsor', level: 20 },
  { label: 'Boutique Guest (S4)', value: 'guest', level: 10 },
] as const;

/**
 * @type SovereignRoleType
 * @description Inferencia de tipo literal para el motor de autorización de Next.js y Payload.
 */
export type SovereignRoleType = typeof ROLES_CONFIG[number]['value'];

/**
 * @function getRoleConfig
 * @description Recupera la configuración completa de un rol mediante su identificador técnico.
 * @param {SovereignRoleType} value - El valor del rol a buscar.
 * @returns {RoleConfig} La configuración inmutable del rol.
 */
export function getRoleConfig(value: SovereignRoleType): RoleConfig {
  const config = ROLES_CONFIG.find(r => r.value === value);
  if (!config) {
    throw new Error(`[DNA][CRITICAL] Role definition for "${value}" not found in SSoT.`);
  }
  return config as RoleConfig;
}

/**
 * PROTOCOLO DE CARGA ATÓMICA
 * @description Reporta la síntesis del registro al log de infraestructura.
 * Silenciado en modo Build de Vercel para mayor higiene de logs.
 */
if (process.env.PAYLOAD_GENERATE !== 'true' && typeof window === 'undefined') {
  const registryDuration = (performance.now() - registryStart).toFixed(4);
  console.log(
    `${C.magenta}${C.bold}● [DNA][REGISTRY]${C.reset} ` +
    `Roles Matrix synthesized ${C.dim}| Time: ${registryDuration}ms${C.reset}`
  );
}
/**
 * @file packages/cms/core/src/collections/users/roles/config.ts
 * @description Matriz de Roles Soberanos con Instrumentación de Carga Atómica.
 *              SSoT para la jerarquía de poder del ecosistema MetaShark.
 * @version 1.3 - DNA Core Registry
 * @author Staff Engineer - MetaShark Tech
 */

const registryStart = performance.now();

/**
 * @interface RoleConfig
 * @description Contrato de definición de rango.
 */
export interface RoleConfig {
  label: string;
  value: 'developer' | 'admin' | 'operator' | 'sponsor' | 'guest';
  level: number;
}

/**
 * @description Jerarquía de Poder Inmutable.
 * @pilar III: Seguridad de Tipos Absoluta via 'as const'.
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
 * @description Inferencia de tipo literal para el motor RBAC.
 */
export type SovereignRoleType = typeof ROLES_CONFIG[number]['value'];

const registryDuration = performance.now() - registryStart;
console.log(`   ${'\x1b[35m'}● [DNA][REGISTRY]${'\x1b[0m'} Roles Matrix synthesized | Time: ${registryDuration.toFixed(4)}ms`);
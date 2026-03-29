/**
 * @file config.ts
 * @description Definición inmutable de la Matriz de Roles Soberanos.
 * @version 1.0
 */

export interface RoleConfig {
  label: string;
  value: 'developer' | 'admin' | 'operator' | 'sponsor' | 'guest';
  level: number;
}

/**
 * @description SSoT para la jerarquía de poder en el ecosistema.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export const ROLES_CONFIG: RoleConfig[] = [
  { label: 'Root Developer (S0)', value: 'developer', level: 99 },
  { label: 'Hotel Manager (S1)', value: 'admin', level: 50 },
  { label: 'Wholesale Operator (S2)', value: 'operator', level: 30 },
  { label: 'Elite Sponsor (S3)', value: 'sponsor', level: 20 },
  { label: 'Boutique Guest (S4)', value: 'guest', level: 10 },
];
/**
 * @file config.ts
 * @description Definición inmutable de la Matriz de Roles Soberanos.
 *              Refactorizado: Implementación de constantes literales para 
 *              inferencia de tipos de élite y protección de jerarquía.
 * @version 1.1 - Immutable Logic & Type Inference
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * @interface RoleConfig
 * @description Contrato para la definición de un rango dentro del ecosistema.
 */
export interface RoleConfig {
  label: string;
  value: 'developer' | 'admin' | 'operator' | 'sponsor' | 'guest';
  level: number;
}

/**
 * @description SSoT para la jerarquía de poder.
 *              Usa 'as const' para garantizar que los valores sean tratados
 *              como tipos literales inmutables.
 * @pilar III: Seguridad de Tipos Absoluta.
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
 * @description Tipo inferido directamente de la configuración para uso transversal.
 */
export type SovereignRoleType = typeof ROLES_CONFIG[number]['value'];
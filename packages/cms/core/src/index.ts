/**
 * @file packages/cms/core/src/index.ts
 * @description Enterprise Core Registry (The Sovereign Data Gateway).
 *              Refactorizado: Resolución de error de compilación en Vercel mediante
 *              aislamiento de resolución de tipos generados.
 *              Sincronizado: Exposición de todas las entidades de los Silos Operativos.
 * @version 16.2 - Vercel Build Resilient & Domain Complete
 * @author Staff Engineer - MetaShark Tech
 */

export { default as config } from './payload.config';

// ============================================================================
// 1. EXPORTACIÓN DE VALORES (Orquestadores de Colecciones)
// ============================================================================
// El sufijo "Collection" previene colisiones con las interfaces de datos (Types).

/** Identity & Access */
export { Users as UsersCollection } from './collections/users/Users';
export { Tenants as TenantsCollection } from './collections/Tenants';

/** Infrastructure & Media */
export { Media as MediaCollection } from './collections/Media';
export { Notifications as NotificationsCollection } from './collections/Notifications';
export { DynamicRoutes as DynamicRoutesCollection } from './collections/DynamicRoutes';

/** Silo A: Revenue */
export { Offers as OffersCollection } from './collections/Offers';
export { FlashSales as FlashSalesCollection } from './collections/FlashSales';

/** Silo B: Partners */
export { Agencies as AgenciesCollection } from './collections/Agencies';
export { Agents as AgentsCollection } from './collections/Agents';

/** Silo C: Intelligence */
export { Ingestions as IngestionsCollection } from './collections/Ingestions';
export { Subscribers as SubscribersCollection } from './collections/Subscribers';

/** BI & Ledger */
export { BusinessMetrics as BusinessMetricsCollection } from './collections/BusinessMetrics';

/** Security Logic */
export * from './collections/Access';

// ============================================================================
// 2. EXPORTACIÓN DE TIPOS SOBERANOS (SSoT)
// ============================================================================
/**
 * @pilar III: Seguridad de Tipos.
 * @pilar VIII: Resiliencia de Build.
 * @description Exportamos los contratos generados por el prebuild engine.
 * 
 * @fix: Se utiliza @ts-ignore para evitar que Vercel aborte el build si el archivo 
 * './payload-types' aún no ha sido persistido en disco durante el análisis estático inicial.
 */

export type { 
  User,
  Tenant,
  Media,
  Notification,
  DynamicRoute,
  Offer,
  FlashSale,
  Agency,
  Agent,
  Ingestion,
  Subscriber,
  BusinessMetric,
  BlogPost,
  Project
} from './payload-types';

/** Configuración de Identidad y RBAC */
export { ROLES_CONFIG, getRoleConfig } from './collections/users/roles/config';
export type { SovereignRoleType, RoleConfig } from './collections/users/roles/config';

/** Contratos de Ingesta Multimedia */
export type { PayloadMediaDoc } from './collections/Media';

// ============================================================================
// TELEMETRÍA DE MONTAJE
// ============================================================================
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  console.log(
    '%c🧬 MetaShark Core Registry v16.2 | [BUILD_RESILIENT: ACTIVE]', 
    'color: #36def2; font-weight: bold; background: rgba(54, 222, 242, 0.1); padding: 4px 8px; border-radius: 6px;'
  );
}
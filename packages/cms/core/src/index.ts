/**
 * @file packages/cms/core/src/index.ts
 * @description Enterprise Core Registry (The Sovereign Data Gateway).
 *              Refactorizado: Resolución de TS2305 mediante la exportación 
 *              exhaustiva de entidades de dominio (Notification, Agency, etc.) 
 *              hacia los Silos de la aplicación anfitriona.
 * @version 16.1 - Domain Entities Fully Exposed & Type-Safe
 * @author Staff Engineer - MetaShark Tech
 */

export { default as config } from './payload.config';

// 1. EXPORTACIÓN DE VALORES (Colecciones)
// Mantenemos el sufijo "Collection" para evitar colisión con las interfaces de datos.
export { Users as UsersCollection } from './collections/users/Users';
export { Tenants as TenantsCollection } from './collections/Tenants';
export { Media as MediaCollection } from './collections/Media';
export { BlogPosts as BlogPostsCollection } from './collections/BlogPosts';
export { Projects as ProjectsCollection } from './collections/Projects';
export { Notifications as NotificationsCollection } from './collections/Notifications';
export { Agencies as AgenciesCollection } from './collections/Agencies';
export { Agents as AgentsCollection } from './collections/Agents';
export { BusinessMetrics as BusinessMetricsCollection } from './collections/BusinessMetrics';
export { Ingestions as IngestionsCollection } from './collections/Ingestions';
export { Subscribers as SubscribersCollection } from './collections/Subscribers';
export { Offers as OffersCollection } from './collections/Offers';
export { FlashSales as FlashSalesCollection } from './collections/FlashSales';
export { DynamicRoutes as DynamicRoutesCollection } from './collections/DynamicRoutes';
export * from './collections/Access';

// 2. EXPORTACIÓN DE TIPOS SOBERANOS (SSoT)
/**
 * @pilar III: Seguridad de Tipos - Sincronía con payload-types.ts.
 * @pilar VIII: Resiliencia - Bypass de artefactos inexistentes durante el bootstrap.
 * @fix TS2305: Exposición absoluta de todos los contratos generados para los Silos.
 */
export type { 
  Media, 
  Tenant, 
  User, 
  BlogPost, 
  Project,
  Offer,
  FlashSale,
  Notification,
  Agency,
  Agent,
  BusinessMetric,
  Ingestion,
  Subscriber,
  DynamicRoute
} from './payload-types';

export { ROLES_CONFIG, getRoleConfig } from './collections/users/roles/config';
export type { SovereignRoleType, RoleConfig } from './collections/users/roles/config';

export type { PayloadMediaDoc } from './collections/Media';

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  console.log(
    '%c🧬 MetaShark Core Registry v16.1 | [TYPES: SYNCHRONIZED]', 
    'color: #36def2; font-weight: bold; background: rgba(54, 222, 242, 0.1); padding: 4px 8px; border-radius: 6px;'
  );
}
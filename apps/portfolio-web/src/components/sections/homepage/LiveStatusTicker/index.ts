/**
 * @file index.ts
 * @description Punto de entrada soberano para el clúster de telemetría sensorial.
 *              Refactorizado: Saneamiento de exportaciones circulares y 
 *              estandarización de la API pública del módulo.
 * @version 3.0 - Conflict Resolution & Clean API
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * EXPORTACIÓN DEL ORQUESTADOR (Aparato de Sección)
 * @description Consumido por page.tsx para inyectar la telemetría en el shell.
 */
export { LiveStatusTicker } from './LiveStatusTicker';

/**
 * EXPORTACIÓN DEL ÁTOMO (Unidad Funcional)
 * @description Disponible para composiciones personalizadas o testing aislado.
 */
export { StatusItem } from './StatusItem';

/**
 * @note Con esta estructura explícita, erradicamos el error "conflicting star exports"
 * detectado en el log de Vercel, garantizando un build determinista.
 */
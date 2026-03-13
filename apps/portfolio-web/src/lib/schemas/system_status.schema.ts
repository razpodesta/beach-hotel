/**
 * @file apps/portfolio-web/src/lib/schemas/system_status.schema.ts
 * @description Fuente de verdad para los estados en vivo del sistema.
 *              Implementa enums estrictos para garantizar la integridad visual.
 * @version 3.0 - Strict Status Contract
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * Catálogo de identificadores de iconos permitidos para el Ticker.
 */
export const StatusIconKey = z.enum([
  'Ticket', 'ThermometerSun', 'ShieldCheck', 'Music', 'Users', 'Waves', 'Sparkles'
]);

/**
 * Catálogo de variantes cromáticas permitidas.
 */
export const StatusColorKey = z.enum([
  'purple', 'yellow', 'green', 'pink', 'blue', 'cyan'
]);

/**
 * Esquema de ítem individual de estado.
 */
export const systemStatusItemSchema = z.object({
  category: z.string().min(1),
  message: z.string().min(1),
  iconKey: StatusIconKey,
  colorKey: StatusColorKey,
});

/**
 * Esquema maestro para el diccionario de System Status.
 */
export const systemStatusSchema = z.object({
  items: z.array(systemStatusItemSchema),
  aria_label: z.string(),
});

// Inferencia de tipos soberana
export type StatusIconType = z.infer<typeof StatusIconKey>;
export type StatusColorType = z.infer<typeof StatusColorKey>;
export type SystemStatusItem = z.infer<typeof systemStatusItemSchema>;
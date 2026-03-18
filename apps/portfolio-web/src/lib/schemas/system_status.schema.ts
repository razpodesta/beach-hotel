/**
 * @file system_status.schema.ts
 * @description Contrato Soberano para la telemetría en vivo del ecosistema.
 *              Define los límites de validación para iconos, colores y mensajes
 *              que se despliegan en el Ticker global.
 * @version 4.0 - Elite Contract Resilience
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * Catálogo de identificadores de iconos permitidos.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export const StatusIconKey = z.enum([
  'Ticket', 
  'ThermometerSun', 
  'ShieldCheck', 
  'Music', 
  'Users', 
  'Waves', 
  'Sparkles'
]);

/**
 * Catálogo de variantes cromáticas permitidas para el branding dinámico.
 * @pilar VII: Theming Soberano y Semántico.
 */
export const StatusColorKey = z.enum([
  'purple', 
  'yellow', 
  'green', 
  'pink', 
  'blue', 
  'cyan'
]);

/**
 * Esquema de ítem individual de telemetría.
 * @description Cada ítem representa un "latido" de información en tiempo real.
 */
export const systemStatusItemSchema = z.object({
  /** Categoría técnica o comercial del mensaje (ej: EVENT, WEATHER) */
  category: z.string().min(1, 'Category is mandatory for behavioral tracking'),
  /** El mensaje informativo que leerá el usuario */
  message: z.string().min(1, 'Message cannot be empty to prevent UI layout shift'),
  /** Identificador del icono de Lucide a renderizar */
  iconKey: StatusIconKey,
  /** Clave de color definida en el sistema de diseño */
  colorKey: StatusColorKey,
});

/**
 * Esquema maestro para el ensamble del diccionario.
 * @pilar VI: Internacionalización Nativa.
 */
export const systemStatusSchema = z.object({
  /** Colección de mensajes para el bucle infinito */
  items: z.array(systemStatusItemSchema).min(1, 'At least one status item is required'),
  /** Etiqueta de accesibilidad para lectores de pantalla */
  aria_label: z.string().min(1),
});

/**
 * TIPOS INFERIDOS SOBERANOS
 * @description Estos tipos se exportan para ser consumidos por los componentes React.
 */
export type StatusIconType = z.infer<typeof StatusIconKey>;
export type StatusColorType = z.infer<typeof StatusColorKey>;
export type SystemStatusItem = z.infer<typeof systemStatusItemSchema>;
export type SystemStatusDictionary = z.infer<typeof systemStatusSchema>;
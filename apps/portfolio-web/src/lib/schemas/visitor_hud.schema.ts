/**
 * @file visitor_hud.schema.ts
 * @description Contrato Soberano para el panel de telemetría Heimdall.
 *              Define la totalidad de la mensajería de interfaz, estados y 
 *              validación estructural para el HUD de usuario.
 * @version 2.1 - Sync Label Integration (SSoT)
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * ESQUEMA: visitorHudSchema
 * @pilar III: Seguridad de Tipos Absoluta.
 * @description Única fuente de verdad para el contenido i18n del aparato de telemetría.
 */
export const visitorHudSchema = z.object({
  // --- NAVEGACIÓN Y TABS ---
  tab_identity: z.string().min(1),
  tab_telemetry: z.string().min(1),
  
  // --- ESTADO: INVITADO (CONVERSIÓN) ---
  guest_title: z.string().min(1),
  guest_description: z.string().min(1),
  guest_cta: z.string().min(1),

  // --- TELEMETRÍA (HEIMDALL) ---
  label_visitor_info: z.string().min(1),
  label_ip_visitor: z.string().min(1),
  label_location: z.string().min(1),
  label_weather: z.string().min(1),
  label_time: z.string().min(1),
  status_calibrating: z.string().min(1),
  status_error: z.string().min(1),
  weather_sunny: z.string().min(1),
  weather_rainy: z.string().min(1),
  weather_cloudy: z.string().min(1),
  roaming_label: z.string().min(1),
  
  /** 
   * @property precision_sync_label
   * @description Etiqueta de validación del Protocolo Heimdall en tiempo real.
   * @pilar VI: Erradicación de Hardcoding.
   */
  precision_sync_label: z.string().min(1),

  // --- PROTOCOLO 33 & REPUTACIÓN ---
  stat_artifacts: z.string().min(1),
  stat_streak: z.string().min(1),
  xp_next_label: z.string().min(1),

  // --- FOOTER Y ACCIONES ---
  footer_credits: z.string().min(1),
  cta_explore: z.string().min(1),
});

/**
 * INFERENCIA SOBERANA
 * @pilar III: Inferencia obligatoria desde esquema.
 */
export type VisitorHudDictionary = z.infer<typeof visitorHudSchema>;
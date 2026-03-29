/**
 * @file portal.schema.ts
 * @description Contrato soberano para la interfaz del Dashboard.
 *              Nivelado para incluir etiquetas de telemetría y gestión de reservas.
 * @version 2.0 - UI Labels for Dynamic Data
 */

import { z } from 'zod';

export const portalSchema = z.object({
  // --- BIENVENIDA ---
  welcome_developer: z.string().min(1),
  welcome_admin: z.string().min(1),
  welcome_operator: z.string().min(1),
  welcome_guest: z.string().min(1),
  
  // --- NAVEGACIÓN ---
  nav_overview: z.string().min(1),
  nav_reservations: z.string().min(1),
  nav_inventory: z.string().min(1),
  nav_telemetry: z.string().min(1),
  nav_b2b_rates: z.string().min(1),
  
  // --- ETIQUETAS DE DATA DINÁMICA (Nuevas) ---
  label_server_health: z.string().min(1),
  label_active_connections: z.string().min(1),
  label_loyalty_points: z.string().min(1),
  label_upcoming_stays: z.string().min(1),
  label_metric_nominal: z.string().min(1),
  label_metric_warning: z.string().min(1),
  label_metric_critical: z.string().min(1),

  // --- ESTADOS Y ACCIONES ---
  status_active_session: z.string().min(1),
  last_sync_label: z.string().min(1),
  empty_data_label: z.string().min(1),
  cta_logout: z.string().min(1),
  cta_settings: z.string().min(1),
});

export type PortalDictionary = z.infer<typeof portalSchema>;
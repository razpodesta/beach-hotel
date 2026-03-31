/**
 * @file hub.schema.ts
 * @description Enterprise Communication Hub Contract (Silo D).
 *              Orquesta la validación de la interfaz de mensajería operativa,
 *              notificaciones de sistema y alertas de criticidad.
 *              Implementa lógica de Gating por prioridad y trazabilidad de nodos.
 * @version 1.0 - Enterprise Level 4.0 Standard
 * @author Staff Engineer - MetaShark Tech
 */

import { z } from 'zod';

export const commsHubSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  
  // Navigation & Categorization
  tab_notifications: z.string().min(1),
  tab_direct_messages: z.string().min(1),
  tab_system_logs: z.string().min(1),
  
  // Severity Matrix (Operational Priority)
  label_priority_low: z.string().min(1),
  label_priority_high: z.string().min(1),
  label_priority_critical: z.string().min(1),
  
  // Message Metadata
  label_sender_node: z.string().min(1),
  label_dispatch_time: z.string().min(1),
  label_trace_id: z.string().min(1),
  
  // Interface Actions
  btn_mark_read: z.string().min(1),
  btn_broadcast: z.string().min(1),
  
  // Empty & Error States
  status_online: z.string().min(1),
  empty_inbox: z.string().min(1),
});

export type CommsHubDictionary = z.infer<typeof commsHubSchema>;
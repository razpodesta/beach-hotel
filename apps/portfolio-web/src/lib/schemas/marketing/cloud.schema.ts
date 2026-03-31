/**
 * @file cloud.schema.ts
 * @description Enterprise Marketing Cloud Contract (Silo C).
 *              Define la validación para la consola de comunicación masiva,
 *              gestionando la segmentación de audiencia, orquestación de campañas
 *              y telemetría de conversión (Open Rate).
 * @version 1.1 - Enterprise Level 4.0 Standard
 * @author Staff Engineer - MetaShark Tech
 */

import { z } from 'zod';

export const marketingCloudSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  
  // Enterprise Audience Management
  tab_audience: z.string().min(1),
  tab_campaigns: z.string().min(1),
  tab_templates: z.string().min(1),
  
  // Campaign Metadata & Telemetry
  label_recipients: z.string().min(1),
  label_subject: z.string().min(1),
  label_status_sent: z.string().min(1),
  label_open_rate: z.string().min(1),
  
  // Operational Action Bar
  btn_new_campaign: z.string().min(1),
  btn_send_now: z.string().min(1),
  btn_import_vault: z.string().min(1),
  
  // Infrastructure Feedback System
  success_dispatch: z.string().min(1),
  error_quota: z.string().min(1),
});

export type MarketingCloudDictionary = z.infer<typeof marketingCloudSchema>;
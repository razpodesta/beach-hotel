/**
 * @file flash_sales.schema.ts
 * @description Enterprise Revenue Contract (Silo A).
 *              Define la validación para el motor de ofertas dinámicas,
 *              gestionando estados de inventario y urgencia comercial.
 * @version 1.0 - Enterprise Level 4.0 Standard
 * @author Staff Engineer - MetaShark Tech
 */

import { z } from 'zod';

export const flashSalesSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  cta_label: z.string().min(1),
  
  // Etiquetas de Inventario (Revenue Telemetry)
  label_stock_available: z.string().min(1),
  label_stock_total: z.string().min(1),
  label_expires_in: z.string().min(1),
  
  // Estados Dinámicos del Pipeline de Ventas
  status_active: z.string().min(1),
  status_sold_out: z.string().min(1),
  status_expired: z.string().min(1),
  
  // Micro-copy de Urgencia (MEA/UX)
  badge_limited: z.string().min(1),
});

export type FlashSalesDictionary = z.infer<typeof flashSalesSchema>;
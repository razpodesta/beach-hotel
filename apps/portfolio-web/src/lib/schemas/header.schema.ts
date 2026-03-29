/**
 * @file header.schema.ts
 * @description Contrato soberano para la cabecera (NavDesk).
 *              Nivelado para incluir el clúster de identidad (Login/Join/Portal).
 * @version 3.0 - Identity Cluster Integration
 */

import { z } from 'zod';

export const headerSchema = z.object({
  talk: z.string().min(1),
  tagline: z.string().min(1),
  personal_portfolio: z.string().min(1),
  job_title: z.string().min(1),
  mobile_title: z.string().min(1),
  mobile_subtitle: z.string().min(1),
  
  // --- CLÚSTER DE IDENTIDAD (Nuevas llaves) ---
  /** Etiqueta para usuarios recurrentes */
  login: z.string().min(1),
  /** Etiqueta para captación de nuevos Huéspedes Soberanos */
  join: z.string().min(1),
  /** Acceso al Dashboard personalizado */
  portal: z.string().min(1),
});

export type HeaderDictionary = z.infer<typeof headerSchema>;
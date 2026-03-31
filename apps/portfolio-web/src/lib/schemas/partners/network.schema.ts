/**
 * @file network.schema.ts
 * @description Enterprise Partner Network Contract (Silo B).
 *              Orquesta la validación de la interfaz para Agencias y Operadores,
 *              gestionando índices de credibilidad (Trust Score) y métricas
 *              de rendimiento corporativo.
 * @version 1.0 - Enterprise Level 4.0 Standard
 * @author Staff Engineer - MetaShark Tech
 */

import { z } from 'zod';

export const partnerNetworkSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  
  // Enterprise Credibility Labels
  label_trust_score: z.string().min(1),
  label_iata: z.string().min(1),
  btn_onboarding: z.string().min(1),
  
  // Intelligence Metrics (Performance Silo)
  metrics: z.object({
    label_bookings: z.string().min(1),
    label_conversion: z.string().min(1),
    label_commissions: z.string().min(1),
  }),

  // Resource Management
  agent_management: z.object({
    title: z.string().min(1),
    add_agent: z.string().min(1),
    history: z.string().min(1),
  }),
});

export type PartnerNetworkDictionary = z.infer<typeof partnerNetworkSchema>;
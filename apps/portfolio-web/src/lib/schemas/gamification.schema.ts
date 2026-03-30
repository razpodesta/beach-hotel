/**
 * @file gamification.schema.ts
 * @description Contrato de validación para el motor de reputación y artefactos.
 *              Sincronizado con el Manifiesto del Protocolo 33 v2.0.
 * @version 1.0 - Sovereign Reputation Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

export const gamificationSchema = z.object({
  artifacts_title: z.string().min(1),
  lore_label: z.string().min(1),
  rarity_labels: z.object({
    common: z.string().min(1),
    rare: z.string().min(1),
    legendary: z.string().min(1),
    mythic: z.string().min(1),
    unique: z.string().min(1),
  }),
  /** Diccionario de los 33 artefactos mapeados por ID */
  artifacts: z.record(z.string(), z.object({
    name: z.string().min(1),
    lore: z.string().min(1)
  })),
  /** Mapeo de rangos de nivel */
  ranks: z.object({
    initiates: z.string().min(1),
    advanced: z.string().min(1),
    masters: z.string().min(1),
    sovereigns: z.string().min(1),
    oracle: z.string().min(1),
  })
});

export type GamificationDictionary = z.infer<typeof gamificationSchema>;
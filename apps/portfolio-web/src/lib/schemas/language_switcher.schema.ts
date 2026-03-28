/**
 * @file language_switcher.schema.ts
 * @description Contrato Soberano para el Selector Global e Identidad Lumínica.
 *              Nivelado para el Códice Global e integración con Theme Cycle.
 * @version 9.0 - International Metadata Ready
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

export const languageSwitcherSchema = z.object({
  // --- CONTROL DE HUB (Microsoft-Style) ---
  label: z.string().min(1),             // Ej: "Language"
  label_regions: z.string().min(1),     // Ej: "Select your region"
  label_search: z.string().min(1),      // Ej: "Search language..."
  label_implemented: z.string().min(1), // Ej: "Current Sanctuary Support"
  label_future: z.string().min(1),      // Ej: "Global Expansion"

  // --- TOKENS DE ATMÓSFERA (Sincronía ThemeToggle) ---
  /** @pilar VII: Erradicación de Hardcoding. */
  label_toggle: z.string().min(1),
  mode_light: z.string().min(1),
  mode_dark: z.string().min(1),
  mode_system: z.string().min(1),

  // --- IDIOMAS ACTIVOS (SSoT) ---
  'en-US': z.string().min(1),
  'es-ES': z.string().min(1),
  'pt-BR': z.string().min(1),

  // --- INTERNACIONALIZACIÓN DE DICCIONARIO (Opcional para expansión) ---
  /** Permite validar el mapeo del Códice si se decidiera localizar los nombres de países */
  region_labels: z.record(z.string(), z.string()).optional()
});

export type LanguageSwitcherDictionary = z.infer<typeof languageSwitcherSchema>;
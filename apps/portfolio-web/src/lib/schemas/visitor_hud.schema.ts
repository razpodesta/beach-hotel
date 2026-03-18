/**
 * @file visitor_hud.schema.ts
 * @description Contrato Soberano para el panel de telemetría Heimdall.
 *              Valida la mensajería técnica, climática y geográfica.
 * @version 1.0 - Genesis Contract
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

export const visitorHudSchema = z.object({
  /** Etiqueta superior del panel */
  label_visitor_info: z.string().min(1),
  /** Etiqueta para la dirección IP */
  label_ip_visitor: z.string().min(1),
  /** Créditos de infraestructura */
  footer_credits: z.string().min(1),
  /** Mensaje durante la carga de datos */
  status_calibrating: z.string().min(1),
  /** Mensaje ante fallo de señal */
  status_error: z.string().min(1),
  /** Etiqueta de ciudad/ubicación */
  label_location: z.string().min(1),
  /** Etiqueta de clima regional */
  label_weather: z.string().min(1),
  /** Traducción: Soleado */
  weather_sunny: z.string().min(1),
  /** Traducción: Lluvioso */
  weather_rainy: z.string().min(1),
  /** Traducción: Nublado */
  weather_cloudy: z.string().min(1),
  /** Etiqueta de hora local */
  label_time: z.string().min(1),
  /** Formato de coordenadas geográficas */
  coords_format: z.string().min(1),
});

export type VisitorHudDictionary = z.infer<typeof visitorHudSchema>;
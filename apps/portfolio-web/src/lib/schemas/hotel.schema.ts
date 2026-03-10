/**
 * @file hotel.schema.ts
 * @version 1.0 - Pilot CMS 3.0
 * @description Contrato innegociable para los activos del hotel y el festival.
 */
import { z } from 'zod';

export const roomAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price_info: z.string(), // "Desde R$ 890"
  image: z.string(),
  features: z.array(z.string()), // ["Vista Mar", "Wi-Fi 6", "Minibar"]
  booking_url: z.string().url()
});

export const festivalExperienceSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  location: z.string(),
  description: z.string(),
  neon_color: z.string(),
  image: z.string()
});

export type RoomAsset = z.infer<typeof roomAssetSchema>;
export type FestivalExperience = z.infer<typeof festivalExperienceSchema>;
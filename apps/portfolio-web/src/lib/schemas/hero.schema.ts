import { z } from 'zod';

export const heroSchema = z.object({
  page_title: z.string().min(1),
  page_description: z.string().min(1),
  HOTEL_TITLE: z.string().min(1),
  HOTEL_SUBTITLE: z.string().min(1),
  HOTEL_FEATURES: z.string().min(1),
  FESTIVAL_TITLE: z.string().min(1),
  FESTIVAL_SUBTITLE: z.string().min(1),
  FESTIVAL_FEATURES: z.string().min(1),
  CTA_BUTTON: z.string().min(1),
});

export type HeroDictionary = z.infer<typeof heroSchema>;
import { z } from 'zod';

export const experienceEventSchema = z.object({
  id: z.string(),
  day: z.number(),
  title: z.string(),
  location: z.string(),
  startTime: z.string(),
  description: z.string(),
  vibe: z.enum(['Techno', 'House', 'Pop', 'Chill']),
  isVipOnly: z.boolean(),
  image: z.string().url(),
  neon_color: z.string(), // Hex para el glow de la tarjeta
});

export const festivalPageSchema = z.object({
  hero: z.object({
    title: z.string(),
    video_url: z.string(),
    countdown_target: z.string(),
  }),
  manifesto: z.string(),
  events: z.array(experienceEventSchema),
  packages: z.array(z.object({
    category: z.string(),
    price_5_nights: z.number(),
    price_7_nights: z.number(),
    hotel_name: z.string(),
  }))
});
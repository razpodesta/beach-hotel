import { z } from 'zod';

export const headerSchema = z.object({
  talk: z.string().min(1),
  tagline: z.string().min(1),
  personal_portfolio: z.string().min(1),
  job_title: z.string().min(1),
  mobile_title: z.string().min(1),
  mobile_subtitle: z.string().min(1),
});

export type HeaderDictionary = z.infer<typeof headerSchema>;
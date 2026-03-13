import { z } from 'zod';

export const headerSchema = z.object({
  talk: z.string(),
  tagline: z.string(),
  personal_portfolio: z.string(),
  job_title: z.string(),
  mobile_title: z.string(),
  mobile_subtitle: z.string(),
});
// RUTA: apps/portfolio-web/src/lib/schemas/suite_gallery.schema.ts
import { z } from 'zod';

export const suiteEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['Master', 'Deluxe', 'Standard']),
  imageUrl: z.string(),
  price: z.string(),
  description: z.string(),
});

export const suiteGallerySchema = z.object({
  title: z.string(),
  search_placeholder: z.string(),
  // Categorías traducidas
  cat_all: z.string(),
  cat_master: z.string(),
  cat_deluxe: z.string(),
  cat_standard: z.string(),
});
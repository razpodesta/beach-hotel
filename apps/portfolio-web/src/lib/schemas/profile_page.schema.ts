import { z } from 'zod';

export const profilePageSchema = z.object({
  page_title: z.string(),
  welcome_title: z.string(),
  level_label: z.string(),
  xp_label: z.string(),
  inventory_title: z.string(),
  empty_inventory_message: z.string(),
  // Eliminamos 'equipped_label' y 'rarity_labels' si no se usan actualmente para mantener el esquema limpio
  // O los mantenemos si planeas usarlos pronto. Por ahora, ajustamos a lo que vimos en el componente:
});

export type ProfilePageDictionary = z.infer<typeof profilePageSchema>;

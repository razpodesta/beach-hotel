import { z } from 'zod';

export const navLinksSchema = z.object({
  nav_links: z.object({
    hotel: z.string(),
    habitaciones: z.string(),
    festival: z.string(),
    historia: z.string(),
    ubicacion: z.string(),
    contacto: z.string(),
    reservas: z.string(),
    politica_privacidad: z.string(),
    terminos_servicio: z.string(),
  }),
});
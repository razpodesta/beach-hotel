/**
 * @file nav-links.schema.ts
 * @description Contrato de validación soberano para la arquitectura de navegación.
 *              Refactorizado: Nivelación tras la cancelación del festival y 
 *              activación del motor de Paquetes y Programas.
 * @version 2.0 - Offers & Programs Sync
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * ESQUEMA: navLinksSchema
 * @description Única fuente de verdad para las etiquetas de navegación internacionalizadas.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export const navLinksSchema = z.object({
  nav_links: z.object({
    hotel: z.string().min(1),
    habitaciones: z.string().min(1),
    /** 
     * @fix: Sustitución de 'festival' por 'paquetes'. 
     * Alineado con la nueva estrategia comercial de hospitalidad.
     */
    paquetes: z.string().min(1), 
    historia: z.string().min(1),
    ubicacion: z.string().min(1),
    contacto: z.string().min(1),
    reservas: z.string().min(1),
    politica_privacidad: z.string().min(1),
    terminos_servicio: z.string().min(1),
    /** Nueva etiqueta para el orquestador de servicios */
    servicios: z.string().min(1).optional(),
  }),
});

/** 
 * TIPO SOBERANO INFERIDO
 */
export type NavLinksDictionary = z.infer<typeof navLinksSchema>;
// RUTA: apps/portfolio-web/src/lib/schemas/contact.schema.ts
// VERSIÓN: 2.0 - Arquitectónicamente Completo y Corregido.
// DESCRIPCIÓN: Este archivo ha sido refactorizado para ser la fuente de verdad
//              completa para la sección de contacto. Ahora exporta dos esquemas distintos:
//              1. `contactMessagesSchema`: Para validar el contenido de i18n.
//              2. `contactFormSchema`: El esquema que faltaba, para validar los
//                 datos del formulario. Este es el que consume `react-hook-form`.

import { z } from 'zod';

// --- ESQUEMA PARA LA VALIDACIÓN DEL FORMULARIO ---
// Este es el esquema que `zodResolver` necesita. Define las reglas
// para los datos que el usuario introduce en el formulario.
export const contactFormSchema = z.object({
  name: z.string().min(1, 'name_required'),
  email: z.string().email('email_invalid').min(1, 'email_required'),
  message: z.string().min(10, 'message_too_short'),
});

// --- TIPO INFERIDO PARA LOS DATOS DEL FORMULARIO ---
// Cumpliendo con el manifiesto, inferimos el tipo de TypeScript desde el esquema.
// Este es el tipo que se usará en `useForm<ContactFormData>`.
export type ContactFormData = z.infer<typeof contactFormSchema>;


// --- ESQUEMA PARA EL CONTENIDO DE I18N (SIN CAMBIOS) ---
// Este esquema define la estructura de los textos en los archivos JSON.
const validationMessagesSchema = z.record(z.string(), z.string());

export const contactMessagesSchema = z.object({
  title: z.string(),
  form_cta: z.string(),
  form_placeholder_name: z.string(),
  form_placeholder_email: z.string(),
  form_placeholder_message: z.string(),
  form_button_submit: z.string(),
  validation: validationMessagesSchema,
});

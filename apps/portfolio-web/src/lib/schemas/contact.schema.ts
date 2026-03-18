import { z } from 'zod';

export const createContactFormSchema = (validationDict: Record<string, string>) => z.object({
  name: z.string().min(1, validationDict.name_required),
  email: z.string().email(validationDict.email_invalid).min(1, validationDict.email_required),
  message: z.string().min(10, validationDict.message_too_short),
});

export type ContactFormData = z.infer<ReturnType<typeof createContactFormSchema>>;

export const contactMessagesSchema = z.object({
  title: z.string(),
  form_cta: z.string(),
  form_placeholder_name: z.string(),
  form_placeholder_email: z.string(),
  form_placeholder_message: z.string(),
  form_button_submit: z.string(),
  validation: z.record(z.string(), z.string()),
});
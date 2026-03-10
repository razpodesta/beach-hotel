// RUTA: apps/portfolio-web/src/components/sections/homepage/ContactSection.tsx

/**
 * @file Sección de Contacto (Conversión)
 * @version 4.0 - Tipado de Élite
 * @description Refactorizado para acceso seguro a diccionarios y estados de UI resilientes.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils/cn';
import { contactFormSchema, type ContactFormData } from '../../../lib/schemas/contact.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

interface ContactSectionProps {
  dictionary: Dictionary['homepage']['contact'];
}

export function ContactSection({ dictionary }: ContactSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      // Simulación de transporte de datos
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Datos procesados:', data);
      setIsSuccess(true);
      reset();
    } catch (err) {
      console.error('Error en envío:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-background py-20 sm:py-32" id="contact">
      <motion.div
        className="container mx-auto px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-transparent sm:text-5xl bg-clip-text bg-linear-to-r from-purple-400 to-pink-600">
              {dictionary.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{dictionary.form_cta}</p>
        </div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto mt-12 w-full max-w-xl space-y-6 rounded-2xl bg-card p-8 border border-border shadow-2xl"
          noValidate
        >
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center text-primary"
            >
              <CheckCircle2 size={48} className="mb-4" />
              <p className="font-bold">¡Mensaje recibido con éxito!</p>
            </motion.div>
          ) : (
            <>
              {/* Refactorizado: Acceso tipado seguro a los diccionarios */}
              <div>
                <input
                  {...register('name')}
                  placeholder={dictionary.form_placeholder_name}
                  className={cn(
                    "w-full rounded-xl border bg-secondary p-4 outline-none transition-all",
                    errors.name ? "border-destructive focus:ring-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                  )}
                />
                {errors.name && <p className="mt-2 text-xs text-destructive">{dictionary.validation.name_required}</p>}
              </div>

              <div>
                <input
                  {...register('email')}
                  placeholder={dictionary.form_placeholder_email}
                  className={cn(
                    "w-full rounded-xl border bg-secondary p-4 outline-none transition-all",
                    errors.email ? "border-destructive focus:ring-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                  )}
                />
                {errors.email && <p className="mt-2 text-xs text-destructive">{dictionary.validation[errors.email.message as keyof typeof dictionary.validation]}</p>}
              </div>

              <div>
                <textarea
                  {...register('message')}
                  placeholder={dictionary.form_placeholder_message}
                  rows={4}
                  className={cn(
                    "w-full rounded-xl border bg-secondary p-4 outline-none transition-all",
                    errors.message ? "border-destructive focus:ring-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                  )}
                />
                {errors.message && <p className="mt-2 text-xs text-destructive">{dictionary.validation.message_too_short}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary py-4 font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : dictionary.form_button_submit}
              </button>
            </>
          )}
        </motion.form>
      </motion.div>
    </section>
  );
}
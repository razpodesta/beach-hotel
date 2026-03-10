// RUTA: apps/portfolio-web/src/components/sections/homepage/ContactSection.tsx
// VERSIÓN: 5.0 - Concierge Desk
// DESCRIPCIÓN: Formulario inmersivo con diseño de lujo. 
//              Integración visual con el branding del hotel.

'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
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
    // Simulación de transporte de datos
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Concierge Lead:', data);
    setIsSuccess(true);
    reset();
    setIsSubmitting(false);
  };

  return (
    <section className="relative w-full py-24 sm:py-32 bg-[#020202] overflow-hidden" id="contact">
      {/* Glow de fondo para efecto boutique */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        className="container mx-auto px-6 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto max-w-xl text-center mb-16">
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">
              {dictionary.title}
            </h2>
            <p className="text-zinc-400 font-sans">{dictionary.form_cta}</p>
        </div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto w-full max-w-lg space-y-6 rounded-[2rem] bg-zinc-900/40 p-10 border border-white/5 backdrop-blur-xl shadow-2xl"
          noValidate
        >
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center text-purple-400"
            >
              <CheckCircle2 size={64} className="mb-6 opacity-80" />
              <p className="font-display text-2xl text-white font-bold">¡Solicitud Recibida!</p>
              <p className="mt-2 text-zinc-500">Nuestro concierge responderá en breve.</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div>
                <input
                  {...register('name')}
                  placeholder={dictionary.form_placeholder_name}
                  className={cn(
                    "w-full bg-black/40 border border-white/10 rounded-full py-4 px-6 outline-none transition-all placeholder:text-zinc-600 focus:border-purple-500",
                    errors.name && "border-red-500"
                  )}
                />
              </div>

              <div>
                <input
                  {...register('email')}
                  placeholder={dictionary.form_placeholder_email}
                  className={cn(
                    "w-full bg-black/40 border border-white/10 rounded-full py-4 px-6 outline-none transition-all placeholder:text-zinc-600 focus:border-purple-500",
                    errors.email && "border-red-500"
                  )}
                />
              </div>

              <div>
                <textarea
                  {...register('message')}
                  placeholder={dictionary.form_placeholder_message}
                  rows={3}
                  className={cn(
                    "w-full bg-black/40 border border-white/10 rounded-3xl py-4 px-6 outline-none transition-all placeholder:text-zinc-600 focus:border-purple-500 resize-none",
                    errors.message && "border-red-500"
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-white py-4 font-bold text-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : (
                  <> {dictionary.form_button_submit} <Send size={14} /> </>
                )}
              </button>
            </div>
          )}
        </motion.form>
      </motion.div>
    </section>
  );
}
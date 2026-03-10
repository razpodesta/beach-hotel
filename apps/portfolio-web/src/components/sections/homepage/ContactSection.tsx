// RUTA: apps/portfolio-web/src/components/sections/homepage/ContactSection.tsx
// VERSIÓN: 2.1 - Sintaxis Canónica de Tailwind CSS v4.
// DESCRIPCIÓN: Se actualizan las clases de gradiente a su forma canónica
//              ('bg-linear-to-r') para cumplir con los estándares más recientes
//              de Tailwind CSS y resolver las advertencias del linter.

'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  contactFormSchema,
  type ContactFormData,
} from '../../../lib/schemas/contact.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

type ContactSectionProps = {
  dictionary: Dictionary['homepage']['contact'];
};

export function ContactSection({ dictionary }: ContactSectionProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit: SubmitHandler<ContactFormData> = (data) => {
    console.log('Mensaje enviado:', data);
    alert('¡Mensaje enviado con éxito! Revisa la consola para ver los datos.');
  };

  return (
    <section className="w-full bg-zinc-950 py-20 sm:py-24" id="contact">
      <motion.div
        className="container mx-auto px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="mx-auto max-w-2xl text-center">
            {/* --- MEJORA DE SINTAXIS (1/2) --- */}
            <h2 className="text-3xl font-bold tracking-tight text-transparent sm:text-4xl bg-clip-text bg-linear-to-r from-purple-400 to-pink-600">
              {dictionary.title}
            </h2>
            <p className="mt-2 text-lg text-zinc-400">{dictionary.form_cta}</p>
        </div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto mt-10 w-full max-w-2xl space-y-4 rounded-lg bg-zinc-900/50 p-8 border border-zinc-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          noValidate
        >
          <div>
            <input {...register('name')} placeholder={dictionary.form_placeholder_name} className={`w-full rounded-md border bg-transparent p-3 focus:ring-2 focus:ring-pink-500 ${errors.name ? 'border-red-500' : 'border-zinc-700'}`} />
            {errors.name?.message && <p className="mt-1 text-sm text-red-600">{dictionary.validation[errors.name.message as keyof typeof dictionary.validation]}</p>}
          </div>

          <div>
            <input {...register('email')} placeholder={dictionary.form_placeholder_email} className={`w-full rounded-md border bg-transparent p-3 focus:ring-2 focus:ring-pink-500 ${errors.email ? 'border-red-500' : 'border-zinc-700'}`} />
            {errors.email?.message && <p className="mt-1 text-sm text-red-600">{dictionary.validation[errors.email.message as keyof typeof dictionary.validation]}</p>}
          </div>

          <div>
            <textarea {...register('message')} placeholder={dictionary.form_placeholder_message} rows={5} className={`w-full rounded-md border bg-transparent p-3 focus:ring-2 focus:ring-pink-500 ${errors.message ? 'border-red-500' : 'border-zinc-700'}`} />
            {errors.message?.message && <p className="mt-1 text-sm text-red-600">{dictionary.validation[errors.message.message as keyof typeof dictionary.validation]}</p>}
          </div>

          {/* --- MEJORA DE SINTAXIS (2/2) --- */}
          <button type="submit" className="w-full rounded-md bg-linear-to-r from-purple-500 to-pink-600 p-4 font-bold text-white transition-transform hover:scale-105">{dictionary.form_button_submit}</button>
        </motion.form>
      </motion.div>
    </section>
  );
}

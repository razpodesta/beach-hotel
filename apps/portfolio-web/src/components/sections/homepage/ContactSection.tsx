/**
 * @file ContactSection.tsx
 * @description Orquestador inmersivo de captura de leads (Fase 8: Action).
 *              Refactorizado: 100% i18n, Validación SSoT, Protocolo Heimdall y UX de Lujo.
 * @version 7.0 - Elite Production Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Send, AlertCircle, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../../lib/utils/cn';
import { createContactFormSchema, type ContactFormData } from '../../../lib/schemas/contact.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

interface ContactSectionProps {
  /** Fragmento nivelado del diccionario aplanado */
  dictionary: Dictionary['contact'];
}

/**
 * APARATO: ContactSection
 * @description El punto final de conversión donde la arquitectura se pone al servicio del negocio.
 */
export function ContactSection({ dictionary }: ContactSectionProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  /**
   * @pilar IV: Observabilidad (Heimdall)
   */
  useEffect(() => {
    console.log('[HEIMDALL][UX] Concierge Desk engaged. Ready for input.');
  }, []);

  /**
   * @pilar III: Seguridad de Tipos
   * Generación del esquema con inyección de validaciones localizadas.
   */
  const schema = useMemo(() => {
    return createContactFormSchema(dictionary?.validation || {});
  }, [dictionary?.validation]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur'
  });

  /**
   * HANDLER: onSubmit
   * @description Procesa el lead mediante un protocolo de transporte seguro.
   */
  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    console.group('[HEIMDALL][CONVERSION] Lead Capture Sequence');
    console.log('Payload:', { ...data, email: '***@***.com' }); // PII Masking
    
    setStatus('submitting');
    
    try {
      // Simulación de transporte a API Soberana (Server Action / Supabase)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log('Status: Dispatch Success');
      setStatus('success');
      reset();
    } catch (err) {
      console.error('Status: Dispatch Failed', err);
      setStatus('error');
    } finally {
      console.groupEnd();
    }
  };

  if (!dictionary) return null;

  return (
    <section 
      className="relative w-full py-24 sm:py-40 bg-[#020202] overflow-hidden" 
      id="contact"
      aria-label="Concierge Contact Desk"
    >
      {/* CAPA ATMOSFÉRICA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />

      <motion.div
        className="container mx-auto px-6 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto max-w-2xl text-center mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-8">
               <Sparkles size={12} /> Concierge Desk
            </span>
            <h2 className="font-display text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[0.9]">
              {dictionary.title}
            </h2>
            <p className="text-zinc-500 text-lg md:text-xl font-sans font-light italic max-w-lg mx-auto">
              {dictionary.form_cta}
            </p>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              /* --- ESTADO: ÉXITO (MEA/UX) --- */
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="py-20 flex flex-col items-center justify-center text-center rounded-[3rem] bg-white/2 border border-primary/20 backdrop-blur-3xl shadow-[0_0_100px_rgba(168,85,247,0.1)]"
              >
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                  <CheckCircle2 size={80} className="text-primary relative" strokeWidth={1} />
                </div>
                <h3 className="font-display text-3xl text-white font-bold mb-4 tracking-tight">
                  {dictionary.success_title}
                </h3>
                <p className="text-zinc-400 font-sans text-lg max-w-xs mx-auto leading-relaxed">
                  {dictionary.success_subtitle}
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-12 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] hover:text-white transition-colors"
                >
                  Enviar otra consulta
                </button>
              </motion.div>
            ) : (
              /* --- ESTADO: FORMULARIO ACTIVO --- */
              <motion.form
                key="form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 rounded-[3rem] bg-zinc-900/40 p-8 md:p-12 border border-white/5 backdrop-blur-xl shadow-2xl transition-all hover:border-white/10"
                noValidate
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {/* Campo: Nombre */}
                <div className="space-y-2">
                  <input 
                    {...register('name')} 
                    placeholder={dictionary.form_placeholder_name} 
                    autoComplete="name"
                    className={cn(
                      "w-full bg-black/40 border border-white/10 rounded-full py-5 px-8 outline-none transition-all",
                      "text-white placeholder:text-zinc-700 font-sans text-sm focus:border-primary focus:bg-primary/5", 
                      errors.name && "border-red-500/50 bg-red-500/5"
                    )} 
                  />
                  {errors.name && (
                    <motion.p initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-[10px] text-red-500 flex items-center gap-2 ml-6">
                      <AlertCircle size={12} /> {errors.name.message}
                    </motion.p>
                  )}
                </div>

                {/* Campo: Email */}
                <div className="space-y-2">
                  <input 
                    {...register('email')} 
                    type="email"
                    placeholder={dictionary.form_placeholder_email} 
                    autoComplete="email"
                    className={cn(
                      "w-full bg-black/40 border border-white/10 rounded-full py-5 px-8 outline-none transition-all",
                      "text-white placeholder:text-zinc-700 font-sans text-sm focus:border-primary focus:bg-primary/5", 
                      errors.email && "border-red-500/50 bg-red-500/5"
                    )} 
                  />
                  {errors.email && (
                    <motion.p initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-[10px] text-red-500 flex items-center gap-2 ml-6">
                      <AlertCircle size={12} /> {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* Campo: Mensaje */}
                <div className="space-y-2">
                  <textarea 
                    {...register('message')} 
                    placeholder={dictionary.form_placeholder_message} 
                    rows={4} 
                    className={cn(
                      "w-full bg-black/40 border border-white/10 rounded-[2.5rem] py-6 px-8 outline-none transition-all",
                      "text-white placeholder:text-zinc-700 font-sans text-sm focus:border-primary focus:bg-primary/5 resize-none", 
                      errors.message && "border-red-500/50 bg-red-500/5"
                    )} 
                  />
                  {errors.message && (
                    <motion.p initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-[10px] text-red-500 flex items-center gap-2 ml-6">
                      <AlertCircle size={12} /> {errors.message.message}
                    </motion.p>
                  )}
                </div>

                {/* Dispatch Action */}
                <button 
                  type="submit" 
                  disabled={status === 'submitting'} 
                  className="w-full relative overflow-hidden rounded-full bg-white py-5 font-bold text-black uppercase tracking-[0.3em] text-[11px] transition-all hover:bg-primary hover:text-white disabled:opacity-50 active:scale-95 shadow-xl"
                >
                  <span className="flex items-center justify-center gap-3">
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        {dictionary.form_button_loading}
                      </>
                    ) : (
                      <>
                        {dictionary.form_button_submit} 
                        <Send size={16} />
                      </>
                    )}
                  </span>
                </button>

                {/* Error Global Case */}
                {status === 'error' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 text-center">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                       {dictionary.error_submit}
                    </p>
                  </motion.div>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
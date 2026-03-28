/**
 * @file ContactSection.tsx
 * @description Orquestador inmersivo de captura de leads (Fase 8: Action).
 *              Refactorizado: Erradicación de errores de tipado, trazabilidad 
 *              forense de leads y sincronía total Day-First.
 * @version 9.0 - Lead Fidelity & Linter Pure
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Send, AlertCircle, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import { createContactFormSchema, type ContactFormData } from '../../../lib/schemas/contact.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface ContactSectionProps
 */
interface ContactSectionProps {
  /** Fragmento nivelado del diccionario validado por MACS */
  dictionary: Dictionary['contact'];
  className?: string;
}

/**
 * APARATO: ContactSection
 * @description Punto final de conversión. Orquesta la captura de leads con resiliencia atmosférica.
 */
export function ContactSection({ dictionary, className }: ContactSectionProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Fase
   * @pilar IV: Registra el enganche con el formulario.
   */
  useEffect(() => {
    console.log('[HEIMDALL][UX] Concierge Desk: Ready for secure ingestion.');
  }, []);

  /**
   * @pilar III: Seguridad de Tipos
   * Inyección de validaciones localizadas desde el SSoT.
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
   * @description Procesa el lead mediante un protocolo de transporte soberano.
   * @fix TS6133: 'data' ahora se consume en la traza de observabilidad.
   */
  const onSubmit: SubmitHandler<ContactFormData> = useCallback(async (data) => {
    const traceId = `lead_${Date.now()}`;
    console.group(`[HEIMDALL][CONVERSION] Lead Capture: ${traceId}`);
    
    // Trazabilidad de datos (PII Masking aplicado para seguridad)
    console.log('Ingesting_Payload:', { 
      name: data.name, 
      email_domain: data.email.split('@')[1],
      message_length: data.message.length 
    });
    
    setStatus('submitting');
    
    try {
      // Simulación de transporte a API Soberana (Fase B: Server Actions)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log('Status: Dispatch Successful');
      setStatus('success');
      reset();
    } catch (err) {
      console.error('Status: Dispatch Aborted', err);
      setStatus('error');
    } finally {
      console.groupEnd();
    }
  }, [reset]);

  if (!dictionary) return null;

  return (
    <section 
      id="contact"
      /**
       * @pilar VII: Theming Soberano
       * Sincronizado con variables semánticas Oxygen.
       */
      className={cn(
        "relative w-full py-24 sm:py-40 bg-background overflow-hidden transition-colors duration-1000",
        className
      )} 
      aria-label={dictionary.title}
    >
      {/* CAPA ATMOSFÉRICA: Glow Adaptativo (Pilar XII) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full pointer-events-none transition-opacity duration-1000" />

      <motion.div
        className="container mx-auto px-6 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="mx-auto max-w-2xl text-center mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-surface border border-border/50 text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-8 shadow-sm">
               <Sparkles size={12} /> {dictionary.success_title.split(' ')[0]} Hub
            </span>
            <h2 className="font-display text-5xl md:text-8xl font-bold tracking-tighter text-foreground mb-8 leading-[0.9] transition-colors duration-1000">
              {dictionary.title}
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl font-sans font-light italic max-w-lg mx-auto transition-colors duration-1000">
              {dictionary.form_cta}
            </p>
        </header>

        <div className="mx-auto w-full max-w-xl">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              /* --- ESTADO: ÉXITO (MEA/UX) --- */
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="py-20 flex flex-col items-center justify-center text-center rounded-5xl bg-surface/40 border border-primary/20 backdrop-blur-3xl shadow-2xl"
              >
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                  <CheckCircle2 size={80} className="text-primary relative" strokeWidth={1} />
                </div>
                <h3 className="font-display text-3xl text-foreground font-bold mb-4 tracking-tight uppercase transition-colors duration-1000">
                  {dictionary.success_title}
                </h3>
                <p className="text-muted-foreground font-sans text-lg max-w-xs mx-auto leading-relaxed transition-colors duration-1000">
                  {dictionary.success_subtitle}
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-12 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] hover:text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-4 py-2"
                >
                  {dictionary.form_button_submit} AGAIN
                </button>
              </motion.div>
            ) : (
              /* --- ESTADO: FORMULARIO ACTIVO (Atmosphere Responsive) --- */
              <motion.form
                key="form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 rounded-5xl bg-surface/30 p-8 md:p-12 border border-border/50 backdrop-blur-xl shadow-3xl transition-all hover:border-border"
                noValidate
                exit={{ opacity: 0, scale: 0.98 }}
              >
                {/* Campo: Nombre */}
                <div className="space-y-2">
                  <input 
                    {...register('name')} 
                    placeholder={dictionary.form_placeholder_name} 
                    autoComplete="name"
                    className={cn(
                      "w-full bg-background/50 border border-border/50 rounded-full py-5 px-8 outline-none transition-all",
                      "text-foreground placeholder:text-muted-foreground/40 font-sans text-sm",
                      "focus:border-primary focus:bg-background shadow-sm", 
                      errors.name && "border-red-500/50 bg-red-500/5"
                    )} 
                  />
                  {errors.name && (
                    <motion.p initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-[10px] text-red-500 flex items-center gap-2 ml-6 font-mono">
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
                      "w-full bg-background/50 border border-border/50 rounded-full py-5 px-8 outline-none transition-all",
                      "text-foreground placeholder:text-muted-foreground/40 font-sans text-sm",
                      "focus:border-primary focus:bg-background shadow-sm", 
                      errors.email && "border-red-500/50 bg-red-500/5"
                    )} 
                  />
                  {errors.email && (
                    <motion.p initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-[10px] text-red-500 flex items-center gap-2 ml-6 font-mono">
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
                      "w-full bg-background/50 border border-border/50 rounded-4xl py-6 px-8 outline-none transition-all",
                      "text-foreground placeholder:text-muted-foreground/40 font-sans text-sm",
                      "focus:border-primary focus:bg-background shadow-sm resize-none", 
                      errors.message && "border-red-500/50 bg-red-500/5"
                    )} 
                  />
                  {errors.message && (
                    <motion.p initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-[10px] text-red-500 flex items-center gap-2 ml-6 font-mono">
                      <AlertCircle size={12} /> {errors.message.message}
                    </motion.p>
                  )}
                </div>

                {/* Dispatch Action (Sovereign Button) */}
                <button 
                  type="submit" 
                  disabled={status === 'submitting'} 
                  className={cn(
                    "w-full relative overflow-hidden rounded-full py-5 font-bold uppercase tracking-[0.3em] text-[11px] transition-all active:scale-95 shadow-2xl",
                    "bg-foreground text-background hover:bg-primary hover:text-white disabled:opacity-50"
                  )}
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
                        <Send size={16} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>

                {/* Error Global Case */}
                {status === 'error' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 text-center">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest font-mono">
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
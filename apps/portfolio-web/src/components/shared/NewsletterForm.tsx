/**
 * @file NewsletterForm.tsx
 * @description Aparato de Captura de Leads y Conversión Soberana. 
 *              Refactorizado: Resolución de errores TS2339 mediante vinculación 
 *              al contrato 'newsletter_form', erradicación de hardcoding y 
 *              sincronía con el motor de reputación P33.
 * @version 5.0 - Identity Sync & Linter Pure
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle2, AlertCircle, Zap, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../lib/utils/cn';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * FÁBRICA DE VALIDACIÓN SOBERANA
 * @description Inyecta mensajes de error localizados desde el SSoT.
 */
const createNewsletterSchema = (v: { required: string; invalid: string }) => z.object({
  email: z.string().min(1, v.required).email(v.invalid),
});

interface NewsletterFormProps {
  /** 
   * @pilar III: Seguridad de Tipos. 
   * Consumo del fragmento 'newsletter_form' definido en dictionary.schema.ts 
   */
  content: Dictionary['newsletter_form'];
  className?: string;
}

/**
 * APARATO: NewsletterForm
 * @description Gestiona la ingesta de identidades con feedback inmersivo.
 */
export function NewsletterForm({ content, className }: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  /**
   * SINCRONIZACIÓN DE CONTRATO (Pilar VI)
   * Memoizamos el esquema para evitar re-validaciones innecesarias.
   */
  const schema = useMemo(() => createNewsletterSchema({
    required: content.validation_email_required,
    invalid: content.validation_email_invalid
  }), [content]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  });

  /**
   * MANEJADOR DE INGESTA (Protocolo 33)
   * @description Procesa el lead y emite telemetría de conversión.
   */
  const onSubmit = useCallback(async (data: { email: string }) => {
    setStatus('submitting');
    console.group('[HEIMDALL][CONVERSION] Lead Ingestion Sequence');
    
    try {
      // 1. Simulación de transporte seguro (Fase B: Server Actions)
      await new Promise((resolve) => setTimeout(resolve, 1800));
      
      // 2. Registro de Reputación
      console.log(`[P33][REPUTATION] Event: NEWSLETTER_ENGAGEMENT | Identity: ${data.email}`);
      
      setStatus('success');
      reset();
    } catch (err) {
      console.error('[HEIMDALL][CRITICAL] Ingestion failure:', err);
      setStatus('error');
    } finally {
      console.groupEnd();
    }
  }, [reset]);

  return (
    <div className={cn("relative overflow-hidden w-full transition-colors duration-1000", className)}>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          /* --- ESTADO: ÉXITO (MEA/UX) --- */
          <motion.div
            key="success-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 px-6 text-center"
          >
            <div className="relative mb-8">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full" 
              />
              <CheckCircle2 size={64} className="text-primary relative drop-shadow-[0_0_15px_var(--color-primary)]" />
            </div>

            <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight uppercase">
                {content.success_title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-xs mx-auto mb-8 font-light italic">
                {content.success_subtitle}
              </p>
              
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-surface border border-primary/20 text-primary">
                <Zap size={16} className="fill-current animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono">
                  +50 XP {content.reward_label}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* --- ESTADO: FORMULARIO ACTIVO (Atmosphere Aware) --- */
          <motion.div
            key="active-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 md:p-12 text-center"
          >
            <header className="mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">
                <Sparkles size={12} className="text-primary" />
                Sovereign Access
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tighter leading-none transition-colors">
                {content.title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-sm mx-auto font-light transition-colors">
                {content.description}
              </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="relative group">
                <input
                  {...register('email')}
                  type="email"
                  placeholder={content.placeholder}
                  disabled={status === 'submitting'}
                  className={cn(
                    "w-full bg-background/40 border border-border rounded-full py-5 px-8 outline-none transition-all duration-500",
                    "text-foreground placeholder:text-muted-foreground/30 font-sans text-sm",
                    "focus:border-primary focus:bg-background shadow-inner",
                    errors.email && "border-red-500/50 bg-red-500/5 focus:border-red-500"
                  )}
                />
                
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-7 left-8 text-[10px] text-red-500 flex items-center gap-1.5 font-mono"
                    >
                      <AlertCircle size={10} /> {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className={cn(
                  "w-full relative overflow-hidden rounded-full py-5 font-bold uppercase tracking-[0.3em] text-[11px] transition-all duration-500 active:scale-95 shadow-2xl transform-gpu",
                  "bg-foreground text-background hover:bg-primary hover:text-white",
                  status === 'submitting' && "opacity-70 cursor-wait"
                )}
              >
                <span className="flex items-center justify-center gap-3">
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {content.loading}
                    </>
                  ) : (
                    <>
                      {content.button}
                      <Send size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <footer className="mt-12 pt-8 border-t border-border opacity-40">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.3em] transition-colors">
                {content.legal_notice}
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
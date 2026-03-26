/**
 * @file NewsletterForm.tsx
 * @description Aparato de Captura de Leads y Conversión Soberana. 
 *              Implementa validación Zod, integración con el motor de reputación
 *              Protocolo 33 (+50 XP) y feedback inmersivo de alta fidelidad.
 * @version 3.0 - Protocol 33 Integrated & i18n Compliant
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle2, AlertCircle, Zap, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../lib/utils/cn';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * ESQUEMA DE VALIDACIÓN SOBERANO
 * @pilar III: Seguridad de Tipos Absoluta.
 */
const newsletterSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
});

type NewsletterInputs = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
  /** Fragmento del diccionario inyectado (footer.json) */
  content: Dictionary['footer'];
  className?: string;
}

/**
 * APARATO: NewsletterForm
 */
export function NewsletterForm({ content, className }: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<NewsletterInputs>({
    resolver: zodResolver(newsletterSchema),
  });

  /**
   * MANEJADOR DE SUSCRIPCIÓN (Protocolo 33)
   * @pilar VIII: Resiliencia de Operación.
   * @description Procesa el lead y otorga recompensa de reputación en el ecosistema.
   */
  const onSubmit = useCallback(async (data: NewsletterInputs) => {
    setStatus('submitting');
    console.group('[HEIMDALL][CONVERSION] Newsletter Subscription Sequence');
    
    try {
      // 1. Simulación de transporte a API Soberana
      await new Promise((resolve) => setTimeout(resolve, 1800));
      
      // 2. Ejecución de Protocolo 33: "NEWSLETTER_ENGAGEMENT"
      // @note: En Fase B, aquí se llamará a setExperience(50) del authStore.
      console.log(`[P33][REPUTATION] Event: NEWSLETTER_ENGAGEMENT | User: ${data.email} | Reward: +50 XP`);
      
      setStatus('success');
      reset();
    } catch (err) {
      console.error('[HEIMDALL][CRITICAL] Lead capture failed:', err);
      setStatus('error');
    } finally {
      console.groupEnd();
    }
  }, [reset]);

  return (
    <div className={cn("relative overflow-hidden w-full", className)}>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          /* --- ESTADO: ÉXITO (MEA/UX) --- 
             Implementa Pilar XII con una coreografía adrenalínica.
          */
          <motion.div
            key="success-message"
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center py-12 px-6 text-center"
          >
            <div className="relative mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="absolute -inset-6 bg-purple-500/20 blur-3xl rounded-full" 
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border border-dashed border-purple-500/30 rounded-full"
              />
              <CheckCircle2 size={64} className="text-purple-400 relative drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight uppercase">
                {content.newsletter_success_title}
              </h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xs mx-auto mb-8 font-light italic">
                {content.newsletter_success_subtitle}
              </p>
              
              {/* Badge de Recompensa P33 */}
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-purple-500/30 text-purple-400">
                <Zap size={16} className="fill-purple-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] font-mono">
                  +50 XP {content.newsletter_reward_label}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* --- ESTADO: FORMULARIO ACTIVO --- */
          <motion.div
            key="form-active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            className="p-8 md:p-12 text-center"
          >
            <header className="mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">
                <Sparkles size={12} className="text-purple-500" />
                Sovereign Access
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter leading-none">
                {content.newsletter_title}
              </h3>
              <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-sm mx-auto font-light">
                Únete a la élite y recibe actualizaciones exclusivas del Hotel y el Festival.
              </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="relative group">
                <input
                  {...register('email')}
                  type="email"
                  placeholder={content.newsletter_placeholder}
                  disabled={status === 'submitting'}
                  className={cn(
                    "w-full bg-black/40 border rounded-full py-5 px-8 outline-none transition-all duration-500",
                    "text-white placeholder:text-zinc-700 font-sans text-sm",
                    "group-hover:border-white/20",
                    errors.email 
                      ? "border-red-500/50 bg-red-500/5 focus:border-red-500" 
                      : "border-white/10 focus:border-purple-500 focus:bg-purple-500/5"
                  )}
                />
                
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
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
                  "w-full relative overflow-hidden rounded-full py-5 font-bold uppercase tracking-[0.3em] text-[11px] transition-all duration-500 active:scale-95 shadow-2xl",
                  "bg-white text-black hover:bg-purple-600 hover:text-white hover:shadow-purple-500/20",
                  status === 'submitting' && "opacity-70 cursor-wait"
                )}
              >
                <span className="flex items-center justify-center gap-3">
                  {status === 'submitting' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      {content.newsletter_button}
                      <Send size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <footer className="mt-12 pt-8 border-t border-white/5 opacity-40">
              <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">
                Private Infrastructure • No Third-Party Trackers
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
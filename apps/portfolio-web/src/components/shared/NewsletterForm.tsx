/**
 * @file NewsletterForm.tsx
 * @description Aparato de Captura de Leads y Conversión Soberana. 
 *              Implementa validación Zod, estados resilientes y feedback MEA/UX.
 * @version 2.0 - Zod Validated & i18n Powered
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

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
  /** Fragmento del diccionario inyectado */
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
  } = useForm<NewsletterInputs>({
    resolver: zodResolver(newsletterSchema),
  });

  /**
   * MANEJADOR DE SUSCRIPCIÓN
   * @pilar VIII: Resiliencia de Operación.
   */
  const onSubmit = async (data: NewsletterInputs) => {
    setStatus('submitting');
    
    try {
      // Protocolo de transporte (Simulado - A conectar con Server Action en Fase 3)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log('[HEIMDALL][LEAD] Sovereign User Registered:', data.email);
      
      /**
       * @todo: Disparar evento de Protocolo 33: "NEWSLETTER_SUBSCRIPTION"
       * otorga +50 XP al usuario.
       */
      setStatus('success');
    } catch (err) {
      console.error('[HEIMDALL][CRITICAL] Newsletter delivery failed:', err);
      setStatus('error');
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          /* --- ESTADO: ÉXITO (MEA/UX) --- */
          <motion.div
            key="success-message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full animate-pulse" />
              <CheckCircle2 size={56} className="text-green-500 relative" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">
              ¡Bienvenido al Ecosistema!
            </h3>
            <p className="text-zinc-400 text-sm max-w-60]">
              Tu identidad ha sido vinculada. Has ganado <strong>+50 XP</strong>.
            </p>
          </motion.div>
        ) : (
          /* --- ESTADO: FORMULARIO ACTIVO --- */
          <motion.div
            key="form-active"
            exit={{ opacity: 0, y: -20 }}
            className="p-8 text-center"
          >
            <header className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-4">
                <Zap size={10} /> Recompensa: +50 XP
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2 tracking-tight">
                {content.newsletter_title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Únete a la élite y recibe actualizaciones exclusivas del Hotel y el Festival.
              </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  placeholder={content.newsletter_placeholder}
                  disabled={status === 'submitting'}
                  className={cn(
                    "w-full bg-black/40 border rounded-full py-4 px-6 outline-none transition-all",
                    "text-white placeholder:text-zinc-700 font-sans text-sm",
                    errors.email 
                      ? "border-red-500/50 focus:border-red-500" 
                      : "border-white/10 focus:border-purple-500 focus:bg-white/5"
                  )}
                />
                
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute -bottom-6 left-6 text-[10px] text-red-500 flex items-center gap-1"
                  >
                    <AlertCircle size={10} /> {errors.email.message}
                  </motion.p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className={cn(
                  "w-full relative overflow-hidden rounded-full py-4 font-bold uppercase tracking-[0.2em] text-xs transition-all active:scale-95",
                  "bg-white text-black hover:bg-purple-600 hover:text-white",
                  status === 'submitting' && "opacity-70 cursor-wait"
                )}
              >
                <span className="flex items-center justify-center gap-3">
                  {status === 'submitting' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      {content.newsletter_button}
                      <Send size={14} />
                    </>
                  )}
                </span>
              </button>
            </form>

            <footer className="mt-8 pt-6 border-t border-white/5">
              <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
                Protección de Datos Soberana • Sin Spam
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
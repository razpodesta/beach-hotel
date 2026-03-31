/**
 * @file NewsletterForm.tsx
 * @description Aparato de Captura de Leads y Conversión Soberana. 
 *              Refactorizado: Integración con Server Actions reales, blindaje
 *              Multi-Tenant y sincronía con el motor de reputación P33.
 * @version 6.0 - Production Ready & Multi-Tenant Sync
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
import { useUIStore } from '../../lib/store/ui.store';
import { subscribeAction } from '../../lib/portal/actions/newsletter.actions';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * FÁBRICA DE VALIDACIÓN SOBERANA
 */
const createNewsletterSchema = (v: { required: string; invalid: string }) => z.object({
  email: z.string().min(1, v.required).email(v.invalid),
});

interface NewsletterFormProps {
  /** Fragmento del diccionario 'newsletter_form' validado por MACS */
  content: Dictionary['newsletter_form'];
  className?: string;
}

/**
 * APARATO: NewsletterForm
 * @description Gestiona la ingesta de identidades con persistencia real en Supabase/CMS.
 */
export function NewsletterForm({ content, className }: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Obtención del perímetro de propiedad para el Lead
  const tenantId = useUIStore((s) => s.session?.tenantId);

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
   * MANEJADOR DE INGESTA REAL (Pilar III.IV & VIII)
   */
  const onSubmit = useCallback(async (data: { email: string }) => {
    const traceId = `newsletter_sync_${Date.now()}`;
    console.group(`[HEIMDALL][ACTION] Newsletter Ingestion: ${traceId}`);
    
    setStatus('submitting');
    setErrorMessage(null);

    try {
      // 1. Despacho a Server Action con contexto de Tenant
      const result = await subscribeAction({
        email: data.email,
        tenantId: tenantId ?? '00000000-0000-0000-0000-000000000001' // Fallback al Master Tenant
      });

      if (result.success) {
        console.log('[SUCCESS] Identity indexed and synchronized.');
        setStatus('success');
        reset();
      } else {
        // Manejo de errores de negocio (ej: Email duplicado)
        setErrorMessage(result.error ?? 'SYNC_FAILURE');
        setStatus('error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'UNEXPECTED_CORE_DRIFT';
      console.error(`[CRITICAL] Handshake aborted: ${msg}`);
      setStatus('error');
    } finally {
      console.groupEnd();
    }
  }, [reset, tenantId]);

  return (
    <div className={cn("relative overflow-hidden w-full transition-colors duration-1000", className)}>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          /* --- ESTADO: ÉXITO (MEA/UX) --- */
          <motion.div
            key="success-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 px-6 text-center"
          >
            <div className="relative mb-8">
              <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <CheckCircle2 size={64} className="text-primary relative drop-shadow-[0_0_15px_var(--color-primary)]" />
            </div>

            <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight uppercase">
                {content.success_title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-xs mx-auto mb-8 font-light italic">
                {content.success_subtitle}
              </p>
              
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-surface border border-primary/20 text-primary shadow-lg transform-gpu hover:scale-105 transition-transform">
                <Zap size={16} className="fill-current animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono">
                  +50 XP {content.reward_label}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* --- ESTADO: FORMULARIO --- */
          <motion.div
            key="active-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 md:p-12 text-center"
          >
            <header className="mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">
                <Sparkles size={12} className="text-primary" />
                Sovereign Gateway
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tighter leading-none">
                {content.title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-sm mx-auto font-light">
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
                    (errors.email || status === 'error') && "border-red-500/50 bg-red-500/5"
                  )}
                />
                
                <AnimatePresence>
                  {(errors.email || errorMessage) && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-7 left-8 text-[10px] text-red-500 flex items-center gap-1.5 font-mono"
                    >
                      <AlertCircle size={10} /> {errors.email?.message || errorMessage}
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
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.3em]">
                {content.legal_notice}
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
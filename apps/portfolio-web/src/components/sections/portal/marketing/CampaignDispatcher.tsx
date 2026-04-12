/**
 * @file apps/portfolio-web/src/components/sections/portal/marketing/CampaignDispatcher.tsx
 * @description Consola de despacho de señales masivas para el Silo C.
 *              Refactorizado: Resolución de TS2304 (Missing AnimatePresence),
 *              saneamiento de dependencias y sellado de contratos de respuesta.
 *              Estándar: Oxygen UI v4 & Heimdall v2.5 Metrics.
 * @version 2.1 - Animation Proxy Restored & Dependency Sync
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // @fix: Restaurada dependencia crítica
import { Mail, Send, Loader2, CheckCircle2, Terminal } from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../../lib/utils/cn';
import type { MarketingCloudDictionary } from '../../../../lib/schemas/marketing/cloud.schema';
import type { CampaignResponse } from '../../../../lib/portal/actions/campaign.actions';

/**
 * @interface DispatcherProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface DispatcherProps {
  /** Diccionario validado por el esquema de Marketing Cloud */
  dictionary: MarketingCloudDictionary;
  /** Handler de ejecución de misión hacia la Server Action */
  onDispatch: (subject: string) => Promise<void>;
  /** Estado de bloqueo del nodo durante el transporte de datos */
  isDispatching: boolean;
  /** Reporte forense generado tras el éxito del broadcast */
  report: CampaignResponse | null;
  className?: string;
}

/**
 * APARATO: CampaignDispatcher
 * @description Terminal operativa para el lanzamiento de campañas masivas con feedback en tiempo real.
 * @pilar XII: MEA/UX - Transiciones físicas fluidas entre estados de operación.
 */
export const CampaignDispatcher = memo(({ 
  dictionary, 
  onDispatch, 
  isDispatching, 
  report,
  className 
}: DispatcherProps) => {
  const [subject, setSubject] = useState('');

  /**
   * HANDLER: handleSubmission
   * @description Previene ejecuciones accidentales y valida la intención del operador.
   */
  const handleSubmission = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || isDispatching) return;
    
    // Protocolo Heimdall: Trazabilidad del disparo manual
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DNA][MARKETING] Dispatch command authorized for: ${subject}`);
    }
    
    await onDispatch(subject);
  }, [subject, isDispatching, onDispatch]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className={cn(
        "relative overflow-hidden rounded-[4rem] border border-border bg-surface/60 p-12 text-center shadow-3xl lg:p-20 transition-all duration-700",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {report ? (
          /* --- ESTADO: MISIÓN CUMPLIDA (Forensic Report) --- */
          <motion.div 
            key="success-report"
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} 
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-12 transform-gpu"
          >
             <div className="relative mx-auto w-max">
                <div className="absolute inset-0 animate-pulse rounded-full bg-success/20 blur-[80px]" />
                <CheckCircle2 size={84} className="text-success relative" strokeWidth={1} />
             </div>

             <div className="space-y-3">
                <h3 className="font-display text-4xl font-bold uppercase tracking-tighter text-foreground">
                  {dictionary.success_dispatch.split('.')[0]}
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-muted-foreground opacity-40">
                  Global Transmission Ledger Written
                </p>
             </div>

             <div className="mx-auto grid max-w-xl grid-cols-2 gap-8 rounded-3xl border border-success/20 bg-background/40 p-8 shadow-inner">
                <div className="text-left border-r border-border/40">
                  <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                    Nodes Reached
                  </span>
                  <p className="text-3xl font-display font-bold text-foreground">
                    {report.metrics?.totalTargeted || 0}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                    Transmission Delay
                  </span>
                  <p className="text-3xl font-mono font-bold text-primary">
                    {report.metrics?.latencyMs || '---'}
                  </p>
                </div>
             </div>
          </motion.div>
        ) : (
          /* --- ESTADO: LISTO PARA DESPACHO (Operational Interface) --- */
          <motion.div 
            key="input-form"
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            className="mx-auto max-w-2xl space-y-12 transform-gpu"
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary/10 border border-primary/20 text-primary shadow-2xl transition-transform hover:rotate-6">
               <Mail size={48} strokeWidth={1.2} />
            </div>

            <div className="space-y-4">
               <h3 className="font-display text-4xl font-bold uppercase tracking-tighter text-foreground leading-none">
                 Operational Broadcast
               </h3>
               <p className="text-muted-foreground text-sm font-light italic leading-relaxed">
                 Define the mission subject. The system will encapsulate the payload following the 
                 <b className="text-foreground ml-1">High-Fidelity</b> protocol.
               </p>
            </div>

            <form onSubmit={handleSubmission} className="space-y-8">
              <div className="group relative">
                <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 transition-colors group-focus-within:text-primary" size={20} />
                <input 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isDispatching}
                  className={cn(
                    "w-full rounded-3xl border border-border/60 bg-background/50 py-7 px-16 text-center text-lg outline-none transition-all",
                    "focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-inner font-sans text-foreground",
                    isDispatching && "opacity-50 cursor-not-allowed"
                  )}
                  placeholder={dictionary.label_subject}
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={!subject || isDispatching}
                className={cn(
                  "w-full py-6 rounded-full font-bold text-[12px] uppercase tracking-[0.5em] transition-all active:scale-95 shadow-3xl flex items-center justify-center gap-4 transform-gpu",
                  (!subject || isDispatching) 
                    ? "bg-surface border border-border text-muted-foreground/30 cursor-not-allowed" 
                    : "bg-foreground text-background hover:bg-primary hover:text-white"
                )}
              >
                {isDispatching ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <Send size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /> 
                    {dictionary.btn_send_now}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Artefacto de Fondo: Succión Digital (Pilar XII) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary-rgb),0.03),transparent_70%)]" />
    </motion.div>
  );
});

CampaignDispatcher.displayName = 'CampaignDispatcher';
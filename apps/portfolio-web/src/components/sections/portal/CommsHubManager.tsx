/**
 * @file apps/portfolio-web/src/components/sections/portal/CommsHubManager.tsx
 * @description Enterprise Communication Hub (Silo D Manager).
 *              Terminal operativa para la orquestación de señales de infraestructura,
 *              mensajería entre nodos y auditoría de eventos en tiempo real.
 *              Refactorizado: Erradicación total de 'any', limpieza de imports huérfanos,
 *              tipado estricto de estilos de prioridad y observabilidad Heimdall v2.5.
 * @version 3.1 - Linter Pure & Type-Safe Architecture
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, MessageSquare, Terminal, ShieldAlert, CheckCircle2, 
  Send, Trash2, Reply, Shield,
  ArrowRight, Zap, Wifi
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { CommsHubDictionary } from '../../../lib/schemas/comms/hub.schema';

/** 
 * CONTRATOS DE TRANSMISIÓN SOBERANA
 * @pilar III: Seguridad de Tipos Absoluta.
 */
type CommsView = 'notifications' | 'messages' | 'logs';
type SignalPriority = 'low' | 'high' | 'critical';

interface PriorityStyle {
  color: string;
  bg: string;
  label: string;
}

interface Transmission {
  id: string;
  priority: SignalPriority;
  sender: string;
  subject: string;
  body?: string;
  timestamp: string;
  traceId: string;
  nodeSource: string;
}

interface CommsHubManagerProps {
  /** Diccionario del Silo D validado por Master SSoT */
  dictionary: Dictionary['comms_hub'];
  className?: string;
}

// ============================================================================
// COMPONENTES ATÓMICOS (Silos de Responsabilidad)
// ============================================================================

/**
 * @component LogLine
 * @description Renderizador de alta densidad para eventos de infraestructura.
 * @fix: Eliminación de 'any' en la prop style.
 */
const LogLine = memo(({ tx, style }: { tx: Transmission; style: PriorityStyle }) => (
  <motion.article 
    initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-4 px-6 py-3 rounded-xl border border-border/20 bg-background/20 font-mono text-[10px] hover:bg-background/40 transition-colors group"
  >
    <span className="text-muted-foreground">[{tx.timestamp}]</span>
    <span className={cn("font-bold uppercase", style.color)}>{tx.priority}</span>
    <span className="text-primary/60">{tx.nodeSource}</span>
    <span className="text-foreground/80 truncate flex-1">» {tx.subject}</span>
    <span className="text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity">
      TRACE:{tx.traceId}
    </span>
  </motion.article>
));
LogLine.displayName = 'LogLine';

/**
 * @component SignalCard
 * @description Renderizador de detalle para notificaciones y mensajes.
 * @fix: Tipado estricto de 'dictionary' y 'style' para erradicar 'any'.
 */
const SignalCard = memo(({ 
  tx, 
  style, 
  activeView, 
  dictionary 
}: { 
  tx: Transmission; 
  style: PriorityStyle; 
  activeView: CommsView; 
  dictionary: CommsHubDictionary;
}) => {
  const Icon = tx.priority === 'critical' ? ShieldAlert : CheckCircle2;

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col md:flex-row items-center justify-between p-6 rounded-4xl border border-border bg-surface/30 hover:bg-surface/50 hover:border-primary/30 transition-all duration-700 shadow-xl overflow-hidden"
    >
      <div className="flex items-center gap-8 flex-1 w-full relative z-10">
        <div className={cn(
          "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-700 group-hover:scale-110", 
          style.bg, style.color, "border-current/10"
        )}>
           <Icon size={28} strokeWidth={1.5} />
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-4 flex-wrap">
             <span className={cn("px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-current/20 shadow-sm", style.bg, style.color)}>
               {style.label}
             </span>
             <h4 className="font-display text-base font-bold text-foreground leading-tight tracking-tight uppercase">
                {tx.subject}
             </h4>
          </div>
          {activeView === 'messages' && tx.body && (
             <p className="text-xs text-muted-foreground leading-relaxed italic max-w-2xl font-light">
                "{tx.body}"
             </p>
          )}
          <div className="flex items-center gap-4 text-[9px] font-mono text-muted-foreground uppercase tracking-widest opacity-60">
             <span>{dictionary.label_sender_node}: <b className="text-foreground/80">{tx.sender}</b></span>
             <div className="h-1 w-1 rounded-full bg-border" />
             <span>ID: {tx.traceId}</span>
          </div>
        </div>
      </div>

      {/* Operaciones de Nodo (Action Bar) */}
      <div className="flex items-center gap-3 mt-6 md:mt-0 md:ml-10 relative z-10">
         {activeView === 'messages' && (
           <button className="p-3.5 rounded-2xl bg-background border border-border text-primary hover:bg-primary hover:text-white transition-all active:scale-90 shadow-lg" title="Responder">
              <Reply size={20} />
           </button>
         )}
         <button className="p-3.5 rounded-2xl bg-background border border-border text-muted-foreground hover:text-success hover:border-success/40 transition-all active:scale-90 shadow-lg" title={dictionary.btn_mark_read}>
            <CheckCircle2 size={20} />
         </button>
         <button className="p-3.5 rounded-2xl bg-background border border-border text-muted-foreground hover:text-red-500 hover:border-red-500/40 transition-all active:scale-90 shadow-lg">
            <Trash2 size={20} />
         </button>
      </div>

      <div className={cn("absolute -right-20 -bottom-20 h-40 w-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-1000", style.bg)} />
    </motion.article>
  );
});
SignalCard.displayName = 'SignalCard';

// ============================================================================
// COMPONENTE PRINCIPAL: CommsHubManager
// ============================================================================

export function CommsHubManager({ dictionary, className }: CommsHubManagerProps) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<CommsView>('notifications');

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Montaje
   */
  useEffect(() => {
    const hubTraceId = `hub_link_${Date.now().toString(36)}`;
    console.log(`%c🛡️ [DNA][COMMS] Hub Synchronized | Trace: ${hubTraceId} | Node: ${session?.email}`, 'color: #a855f7; font-weight: bold');
  }, [session]);

  const handleViewChange = useCallback((view: CommsView) => {
    const start = performance.now();
    setActiveView(view);
    const duration = (performance.now() - start).toFixed(4);
    console.log(`   %c[METRIC] Hub Context Switch: ${view} | Lat: ${duration}ms`, 'color: #3b82f6');
  }, []);

  /** 
   * SIGNAL REPOSITORY (SSoT Mock Sync)
   */
  const transmissions: Transmission[] = useMemo(() => [
    { 
      id: 'TX-4401', priority: 'critical', sender: 'SYSTEM_AUTOSCALE', 
      subject: 'Infrastructure breach detected: Cluster B rejected 12 sockets.',
      body: 'Check instance health in AWS Region gru1 immediately.',
      timestamp: '14:20:05', traceId: 'sig_TR229X_9901', nodeSource: 'AWS_EDGE_01'
    },
    { 
      id: 'TX-4402', priority: 'high', sender: 'BOOKING_ENGINE', 
      subject: 'New B2B Allocation Request: Agency "Luxury Travel CL".',
      body: 'Pending net rate approval for 40 nights in Master Suite.',
      timestamp: '13:45:12', traceId: 'sig_TR110A_4452', nodeSource: 'REVENUE_CORE'
    },
    { 
      id: 'TX-4403', priority: 'low', sender: 'MARKETING_CLOUD', 
      subject: 'Audience Synchronization completed successfully.',
      timestamp: '12:00:00', traceId: 'sig_TR882J_0012', nodeSource: 'CRM_WORKER'
    }
  ], []);

  /**
   * RESOLVER CROMÁTICO (Oxygen v4 Standard)
   */
  const getPriorityStyle = useCallback((priority: SignalPriority): PriorityStyle => {
    const map: Record<SignalPriority, PriorityStyle> = {
      critical: { color: 'text-red-500', bg: 'bg-red-500/10', label: dictionary.label_priority_critical },
      high: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: dictionary.label_priority_high },
      low: { color: 'text-success', bg: 'bg-success/10', label: dictionary.label_priority_low }
    };
    return map[priority];
  }, [dictionary]);

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      
      {/* --- 1. HUD DE COMANDO OPERATIVO --- */}
      <header className="flex flex-col lg:flex-row justify-between items-center bg-surface/60 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-border/50 shadow-luxury gap-8">
        <div className="flex items-center gap-6 px-4">
           <div className="relative">
              <div className="absolute inset-0 bg-success/20 blur-2xl rounded-full animate-pulse" />
              <div className="h-14 w-14 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center text-success relative shadow-inner">
                <Wifi size={28} className="animate-pulse" />
              </div>
           </div>
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <div className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                 <span className="text-[10px] font-mono font-bold text-success uppercase tracking-[0.4em]">{dictionary.status_online}</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground tracking-tighter uppercase">{dictionary.title}</h2>
           </div>
        </div>

        <nav className="flex items-center gap-2 bg-background/20 p-2 rounded-2xl border border-border/40 overflow-x-auto no-scrollbar">
           {[
             { id: 'notifications' as CommsView, label: dictionary.tab_notifications, icon: Bell },
             { id: 'messages' as CommsView, label: dictionary.tab_direct_messages, icon: MessageSquare },
             { id: 'logs' as CommsView, label: dictionary.tab_system_logs, icon: Terminal }
           ].map((tab) => {
             const isTabActive = activeView === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => handleViewChange(tab.id)}
                 className={cn(
                   "flex items-center gap-4 px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all outline-none whitespace-nowrap",
                   isTabActive 
                    ? "bg-foreground text-background shadow-2xl scale-[1.02]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                 )}
               >
                 <tab.icon size={16} className={cn("transition-colors", isTabActive && "text-primary")} />
                 <span>{tab.label}</span>
               </button>
             );
           })}
        </nav>
      </header>

      {/* --- 2. SIGNAL STREAM VIEWPORT --- */}
      <section className="grid grid-cols-1 gap-6 min-h-[500px] relative transform-gpu">
        <AnimatePresence mode="wait">
          {transmissions.length > 0 ? (
            <motion.div 
              key={activeView} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {transmissions.map((tx) => {
                const style = getPriorityStyle(tx.priority);
                
                if (activeView === 'logs') {
                  return <LogLine key={tx.id} tx={tx} style={style} />;
                }

                return (
                  <SignalCard 
                    key={tx.id} 
                    tx={tx} 
                    style={style} 
                    activeView={activeView} 
                    dictionary={dictionary} 
                  />
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className="py-48 text-center space-y-8 rounded-[4rem] border-2 border-dashed border-border bg-surface/20 relative overflow-hidden"
            >
               <div className="relative w-max mx-auto">
                 <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full" />
                 <Shield size={64} className="text-muted-foreground/10 relative" strokeWidth={1} />
               </div>
               <p className="text-sm font-mono text-muted-foreground uppercase tracking-[0.4em] animate-pulse">
                  {dictionary.empty_inbox}
               </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* --- 3. BROADCAST CONTROL INTERFACE --- */}
      <footer className="p-10 rounded-[3.5rem] bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
         <div className="flex items-center gap-6 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
               <Zap size={32} strokeWidth={1.5} className="fill-current animate-pulse" />
            </div>
            <div>
               <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.4em] mb-1">
                  Sovereign Pulse Active
               </p>
               <p className="text-sm font-bold text-foreground uppercase tracking-tight">
                  Node Status: <span className="text-success">NOMINAL</span> • Zone: gru1-sanctuary
               </p>
            </div>
         </div>
         
         <button className="relative group/btn flex items-center gap-5 px-12 py-6 rounded-full bg-foreground text-background font-bold text-[11px] uppercase tracking-[0.4em] transition-all hover:bg-primary hover:text-white shadow-3xl active:scale-95 z-10">
            <Send size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            {dictionary.btn_broadcast}
            <ArrowRight size={18} className="opacity-40" />
         </button>

         {/* Background Decorator */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,var(--color-primary),transparent_40%)] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000" />
      </footer>
    </div>
  );
}
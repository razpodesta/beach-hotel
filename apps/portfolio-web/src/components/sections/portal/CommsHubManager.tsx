/**
 * @file CommsHubManager.tsx
 * @description Enterprise Communication Hub (Silo D Manager).
 *              Terminal operativa para la gestión de notificaciones de sistema,
 *              mensajería entre nodos y logs de infraestructura.
 *              Refactorizado: Renderizado polimórfico por tipo de vista, 
 *              telemetría de navegación y optimización de densidad de datos.
 * @version 2.0 - Enterprise Level 4.0 | Poly-View Architecture
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, MessageSquare, Terminal, ShieldAlert, CheckCircle2, 
  Send, Trash2, Cpu, Activity, Clock, Reply, Shield
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/** 
 * CONTRATOS TÁCTICOS 
 * @pilar_III: Seguridad de Tipos Absoluta.
 */
type CommsView = 'notifications' | 'messages' | 'logs';
type SignalPriority = 'low' | 'high' | 'critical';

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

/**
 * MODULE: CommsHubManager
 * @description Centro de mando para la orquestación de información y señales de infraestructura.
 */
export function CommsHubManager({ dictionary, className }: CommsHubManagerProps) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<CommsView>('notifications');

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Navegación Operativa
   * @pilar_IV: Registra el cambio de contexto para auditoría de carga.
   */
  const handleViewChange = useCallback((view: CommsView) => {
    console.log(`[HEIMDALL][COMMS] Context Switch: ${activeView.toUpperCase()} -> ${view.toUpperCase()}`);
    setActiveView(view);
  }, [activeView]);

  useEffect(() => {
    console.log(`[INFRA][COMMS] Sovereign link active. Node Identifier: ${session?.email}`);
  }, [session]);

  /** 
   * DATA REPOSITORY (Mock Industrial)
   * En Fase 5.0 se conectará al Ledger operativo del CMS.
   */
  const transmissions: Transmission[] = useMemo(() => [
    { 
      id: 'TX-4401', priority: 'critical', sender: 'SYSTEM_AUTOSCALE', 
      subject: 'Infrastructure breach detected: Cluster B rejected 12 sockets.',
      body: 'Check instance health in AWS Region gru1 immediately.',
      timestamp: '14:20:05', traceId: 'tr_229x_9901', nodeSource: 'AWS_EDGE_01'
    },
    { 
      id: 'TX-4402', priority: 'high', sender: 'BOOKING_ENGINE', 
      subject: 'New B2B Allocation Request: Agency "Luxury Travel CL".',
      body: 'Pending net rate approval for 40 nights in Master Suite.',
      timestamp: '13:45:12', traceId: 'tr_110a_4452', nodeSource: 'REVENUE_CORE'
    },
    { 
      id: 'TX-4403', priority: 'low', sender: 'MARKETING_CLOUD', 
      subject: 'Audience Synchronization completed successfully.',
      timestamp: '12:00:00', traceId: 'tr_882j_0012', nodeSource: 'CRM_WORKER'
    }
  ], []);

  /** RESOLVER CROMÁTICO (Oxygen Engine) */
  const getPriorityStyle = (priority: SignalPriority) => {
    const map: Record<SignalPriority, { color: string, bg: string, label: string }> = {
      critical: { color: 'text-red-500', bg: 'bg-red-500/10', label: dictionary.label_priority_critical },
      high: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: dictionary.label_priority_high },
      low: { color: 'text-success', bg: 'bg-success/10', label: dictionary.label_priority_low }
    };
    return map[priority];
  };

  return (
    <div className={cn("space-y-8 animate-in fade-in duration-1000", className)}>
      
      {/* --- 1. OPERATIONAL COMMAND BAR --- */}
      <header className="flex flex-col lg:flex-row justify-between items-center bg-surface/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-border shadow-luxury gap-6">
        <div className="flex items-center gap-5">
           <div className="h-12 w-12 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
              <Activity size={24} className="animate-pulse" />
           </div>
           <div>
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.4em]">{dictionary.status_online}</span>
              <h2 className="text-xl font-display font-bold text-foreground tracking-tight uppercase">{dictionary.title}</h2>
           </div>
        </div>

        <nav className="flex items-center gap-3 bg-background/20 p-1.5 rounded-2xl border border-border/40 overflow-x-auto no-scrollbar">
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
                   "flex items-center gap-3 px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all outline-none whitespace-nowrap",
                   isTabActive ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
                 )}
               >
                 <tab.icon size={14} />
                 <span>{tab.label}</span>
               </button>
             );
           })}
        </nav>
      </header>

      {/* --- 2. MULTI-TEMPLATE SIGNAL STREAM --- */}
      <div className="grid grid-cols-1 gap-4 min-h-[500px]">
        <AnimatePresence mode="wait">
          {transmissions.length > 0 ? (
            <motion.div 
              key={activeView} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {transmissions.map((tx) => {
                const style = getPriorityStyle(tx.priority);
                const Icon = tx.priority === 'critical' ? ShieldAlert : CheckCircle2;

                // --- VISTA: LOGS SISTEMA (Densa / Mono) ---
                if (activeView === 'logs') {
                  return (
                    <article key={tx.id} className="flex items-center gap-4 px-6 py-3 rounded-xl border border-border/40 bg-background/20 font-mono text-[10px] hover:bg-background/40 transition-colors">
                      <span className="text-muted-foreground">[{tx.timestamp}]</span>
                      <span className={cn("font-bold uppercase", style.color)}>{tx.priority}</span>
                      <span className="text-primary">{tx.nodeSource}</span>
                      <span className="text-foreground/80 truncate flex-1">» {tx.subject}</span>
                      <span className="text-muted-foreground/30 hidden md:block">ID:{tx.traceId}</span>
                    </article>
                  );
                }

                // --- VISTA: MENSAJES / NOTIFICACIONES (Card Detail) ---
                return (
                  <article 
                    key={tx.id}
                    className="group relative flex flex-col md:flex-row items-center justify-between p-6 rounded-4xl border border-border bg-surface/30 hover:bg-surface/50 hover:border-primary/30 transition-all duration-500"
                  >
                    <div className="flex items-center gap-6 flex-1 w-full">
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border border-current/10", style.bg, style.color)}>
                         <Icon size={24} />
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                           <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border border-current/10", style.bg, style.color)}>
                             {style.label}
                           </span>
                           <h4 className="font-sans text-sm font-bold text-foreground leading-tight">{tx.subject}</h4>
                        </div>
                        {activeView === 'messages' && tx.body && (
                           <p className="text-xs text-muted-foreground leading-relaxed italic max-w-2xl py-1">"{tx.body}"</p>
                        )}
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                          {dictionary.label_sender_node}: <span className="text-foreground/60">{tx.sender}</span>
                        </p>
                      </div>
                    </div>

                    {/* Metadata Silo (Hidden on Mobile) */}
                    <div className="hidden xl:flex items-center gap-10 px-8 border-l border-border/50">
                       <div className="text-right space-y-1">
                          <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{dictionary.label_dispatch_time}</span>
                          <div className="flex items-center gap-2 text-xs font-mono text-foreground">
                             <Clock size={12} className="text-primary" />
                             {tx.timestamp}
                          </div>
                       </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="flex items-center gap-3 mt-4 md:mt-0 md:ml-6">
                       {activeView === 'messages' && (
                         <button className="p-3 rounded-xl bg-background border border-border text-primary hover:bg-primary hover:text-white transition-all active:scale-90" title="Responder">
                            <Reply size={18} />
                         </button>
                       )}
                       <button className="p-3 rounded-xl bg-background border border-border hover:text-success transition-all active:scale-90" title={dictionary.btn_mark_read}>
                          <CheckCircle2 size={18} />
                       </button>
                       <button className="p-3 rounded-xl bg-background border border-border hover:text-red-500 transition-all active:scale-90">
                          <Trash2 size={18} />
                       </button>
                    </div>
                  </article>
                );
              })}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40 space-y-6">
               <Shield size={64} className="text-muted-foreground/10" strokeWidth={1} />
               <p className="text-sm font-mono text-muted-foreground uppercase tracking-[0.4em]">{dictionary.empty_inbox}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- 3. BROADCAST CONTROL ZONE --- */}
      <footer className="p-8 rounded-4xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
         <div className="flex items-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
               <Cpu size={24} />
            </div>
            <div>
               <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  Secure Communication Infrastructure
               </p>
               <p className="text-xs font-bold text-foreground uppercase tracking-tight">Node active: gru1-sanctuary-core</p>
            </div>
         </div>
         <button className="flex items-center gap-4 px-12 py-5 rounded-full bg-foreground text-background font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95">
            <Send size={16} />
            {dictionary.btn_broadcast}
         </button>
      </footer>
    </div>
  );
}
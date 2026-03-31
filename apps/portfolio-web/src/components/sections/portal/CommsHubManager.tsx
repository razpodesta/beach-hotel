/**
 * @file apps/portfolio-web/src/components/sections/portal/CommsHubManager.tsx
 * @description Enterprise Communication Hub (Silo D Manager).
 *              Terminal operativa para la gestión de notificaciones de sistema,
 *              mensajería entre nodos y logs de infraestructura.
 *              Implementa jerarquía de criticidad y trazabilidad forense.
 * @version 1.1 - Linter Pure & Tailwind Canonical Sync
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, MessageSquare, Terminal, ShieldAlert, CheckCircle2, 
  Send, Trash2, Cpu, Activity, Clock, Hash
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/** TIPOS DE VISTA OPERATIVA */
type CommsView = 'notifications' | 'messages' | 'logs';

/** INTERFAZ DE TRANSMISIÓN (Mock de datos industriales) */
interface Transmission {
  id: string;
  priority: 'low' | 'high' | 'critical';
  sender: string;
  subject: string;
  timestamp: string;
  traceId: string;
}

interface CommsHubManagerProps {
  /** Diccionario del Silo D validado por Master SSoT */
  dictionary: Dictionary['comms_hub'];
  className?: string;
}

/**
 * MODULE: CommsHubManager
 * @description Centro de mando para la orquestación de información en tiempo real.
 */
export function CommsHubManager({ dictionary, className }: CommsHubManagerProps) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<CommsView>('notifications');

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Enlace
   */
  useEffect(() => {
    console.log(`[INFRA][COMMS] Communication link active for Node: ${session?.role.toUpperCase()}`);
  }, [session]);

  /** INVENTARIO DE TRANSMISIONES (Silo D Data) */
  const transmissions: Transmission[] = useMemo(() => [
    { 
      id: 'TX-4401', priority: 'critical', sender: 'SYSTEM_AUTOSCALE', 
      subject: 'Infrastructure breach detected: Cluster B rejected 12 sockets.',
      timestamp: '14:20:05', traceId: 'tr_229x_9901' 
    },
    { 
      id: 'TX-4402', priority: 'high', sender: 'BOOKING_ENGINE', 
      subject: 'New B2B Allocation Request: Agency "Luxury Travel CL".',
      timestamp: '13:45:12', traceId: 'tr_110a_4452' 
    },
    { 
      id: 'TX-4403', priority: 'low', sender: 'MARKETING_CLOUD', 
      subject: 'Audience Synchronization completed successfully.',
      timestamp: '12:00:00', traceId: 'tr_882j_0012' 
    }
  ], []);

  /** RESOLVER DE CRITICIDAD (Oxygen Engine Colors) */
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical': return { color: 'text-red-500', bg: 'bg-red-500/10', label: dictionary.label_priority_critical };
      case 'high': return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: dictionary.label_priority_high };
      default: return { color: 'text-success', bg: 'bg-success/10', label: dictionary.label_priority_low };
    }
  };

  return (
    <div className={cn("space-y-8 animate-in fade-in duration-1000", className)}>
      
      {/* --- 1. OPERATIONAL STATUS BAR --- */}
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

        <div className="flex items-center gap-3 bg-background/20 p-1.5 rounded-2xl border border-border/40">
           {[
             { id: 'notifications' as CommsView, label: dictionary.tab_notifications, icon: Bell },
             { id: 'messages' as CommsView, label: dictionary.tab_direct_messages, icon: MessageSquare },
             { id: 'logs' as CommsView, label: dictionary.tab_system_logs, icon: Terminal }
           ].map((tab) => {
             const isTabActive = activeView === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveView(tab.id)}
                 className={cn(
                   "flex items-center gap-3 px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all outline-none",
                   isTabActive ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
                 )}
               >
                 <tab.icon size={14} />
                 <span>{tab.label}</span>
               </button>
             );
           })}
        </div>
      </header>

      {/* --- 2. TRANSMISSION STREAM --- */}
      <div className="grid grid-cols-1 gap-4 min-h-[500px]">
        <AnimatePresence mode="wait">
          {transmissions.length > 0 ? (
            <motion.div 
              key={activeView} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {/* @fix: Eliminación de la variable '_index' no utilizada. Iteración pura por entidad. */}
              {transmissions.map((tx) => {
                const config = getPriorityConfig(tx.priority);
                const Icon = tx.priority === 'critical' ? ShieldAlert : CheckCircle2;

                return (
                  <article 
                    key={tx.id}
                    // @fix: Actualizado 'rounded-[2rem]' a la clase canónica 'rounded-4xl' (Tailwind v4)
                    className="group relative flex flex-col md:flex-row items-center justify-between p-6 rounded-4xl border border-border bg-surface/30 hover:bg-surface/50 hover:border-primary/30 transition-all duration-500"
                  >
                    <div className="flex items-center gap-6 flex-1">
                      {/* Priority Hub */}
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border border-current/10", config.bg, config.color)}>
                         <Icon size={24} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border border-current/10", config.bg, config.color)}>
                             {config.label}
                           </span>
                           <h4 className="font-sans text-sm font-bold text-foreground leading-tight">{tx.subject}</h4>
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                          {dictionary.label_sender_node}: <span className="text-foreground/60">{tx.sender}</span>
                        </p>
                      </div>
                    </div>

                    {/* Metadata Silo */}
                    <div className="flex items-center gap-10 mt-6 md:mt-0 px-8 border-l border-border/50">
                       <div className="text-right space-y-1">
                          <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{dictionary.label_dispatch_time}</span>
                          <div className="flex items-center gap-2 text-xs font-mono text-foreground">
                             <Clock size={12} className="text-primary" />
                             {tx.timestamp}
                          </div>
                       </div>
                       <div className="text-right space-y-1">
                          <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{dictionary.label_trace_id}</span>
                          <div className="flex items-center gap-2 text-xs font-mono text-foreground">
                             <Hash size={12} className="text-primary" />
                             {tx.traceId}
                          </div>
                       </div>
                    </div>

                    {/* Node Actions */}
                    <div className="flex items-center gap-3 ml-6">
                       <button className="p-3 rounded-xl bg-background border border-border hover:text-primary transition-all active:scale-90" title={dictionary.btn_mark_read}>
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
               <ShieldAlert size={64} className="text-muted-foreground/10" />
               <p className="text-sm font-mono text-muted-foreground uppercase tracking-[0.4em]">{dictionary.empty_inbox}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- 3. BROADCAST ACTION BAR --- */}
      <footer className="p-8 rounded-4xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
               <Cpu size={20} />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest max-w-xs">
               Enterprise Communication Node active. Secure dispatching enabled for all verified agents.
            </p>
         </div>
         <button className="flex items-center gap-4 px-10 py-5 rounded-full bg-foreground text-background font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-2xl active:scale-95">
            <Send size={16} />
            {dictionary.btn_broadcast}
         </button>
      </footer>
    </div>
  );
}
/**
 * @file apps/portfolio-web/src/components/sections/portal/CommsHubManager.tsx
 * @description Enterprise Communication Hub (Silo D Manager).
 *              Terminal operativa para la orquestación de señales.
 *              Refactorizado: Resolución absoluta de fronteras Nx (Rutas relativas),
 *              inyección del token cromático faltante (TS2339) y sincronización
 *              real con el Ledger de Notificaciones (Payload 3.0).
 * @version 5.1 - Boundary Compliant & Linter Pure
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, CheckCircle2, Trash2, Reply, Wifi, 
  Loader2, Activity, Info
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTURA (Rutas Relativas - Nx Boundary Safe)
 * @pilar V: Adherencia Arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { CommsHubDictionary } from '../../../lib/schemas/comms/hub.schema';
import { getCommsLedger, type Transmission } from '../../../lib/portal/actions/comms.actions';

type CommsView = 'notifications' | 'messages' | 'logs';
type SignalPriority = 'low' | 'high' | 'critical';

interface PriorityStyle {
  color: string;
  bg: string;
  label: string;
}

interface CommsHubManagerProps {
  /** Fragmento validado del diccionario SSoT */
  dictionary: Dictionary['comms_hub'];
  className?: string;
}

/**
 * CONSTANTES DE TELEMETRÍA (Protocolo Heimdall)
 * @fix TS2339: Integración del token 'red' para logs de error.
 */
const C = {
  reset: '\x1b[0m', 
  cyan: '\x1b[36m', 
  green: '\x1b[32m', 
  yellow: '\x1b[33m', 
  red: '\x1b[31m', 
  magenta: '\x1b[35m', 
  bold: '\x1b[1m'
};

/**
 * SUB-APARATO: SignalCard
 * @description Representación visual de un nodo de transmisión con animaciones de layout.
 */
const SignalCard = memo(({ tx, style, activeView, dictionary }: { 
  tx: Transmission; 
  style: PriorityStyle; 
  activeView: CommsView; 
  dictionary: CommsHubDictionary;
}) => {
  const Icon = tx.priority === 'critical' ? ShieldAlert : (tx.priority === 'high' ? Activity : CheckCircle2);
  
  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
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
          
          {(activeView === 'messages' || activeView === 'logs') && tx.body && (
            <p className="text-xs text-muted-foreground leading-relaxed italic max-w-2xl font-light">
              "{tx.body}"
            </p>
          )}
          
          <div className="flex items-center gap-4 text-[9px] font-mono text-muted-foreground uppercase tracking-widest opacity-60">
             <span>{dictionary.label_sender_node}: <b className="text-foreground/80">{tx.sender}</b></span>
             <span className="h-1 w-1 rounded-full bg-border" />
             <span>ID: {tx.traceId}</span>
             <span className="h-1 w-1 rounded-full bg-border" />
             <span>{tx.timestamp}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-6 md:mt-0 md:ml-10 relative z-10">
         {activeView === 'messages' && (
           <button 
             className="p-3.5 rounded-2xl bg-background border border-border text-primary hover:bg-primary hover:text-white transition-all active:scale-90 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
             title="Reply"
           >
             <Reply size={20} />
           </button>
         )}
         {!tx.isRead && (
           <button 
             className="p-3.5 rounded-2xl bg-background border border-border text-muted-foreground hover:text-success hover:border-success/40 transition-all active:scale-90 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-success"
             title={dictionary.btn_mark_read}
           >
             <CheckCircle2 size={20} />
           </button>
         )}
         <button 
           className="p-3.5 rounded-2xl bg-background border border-border text-muted-foreground hover:text-red-500 hover:border-red-500/40 transition-all active:scale-90 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-red-500"
           title="Delete"
         >
           <Trash2 size={20} />
         </button>
      </div>

      {/* Resplandor Atmosférico (MEA) */}
      <div className={cn("absolute -right-20 -bottom-20 h-40 w-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-1000", style.bg)} />
    </motion.article>
  );
});
SignalCard.displayName = 'SignalCard';

/**
 * APARATO PRINCIPAL: CommsHubManager
 */
export function CommsHubManager({ dictionary, className }: CommsHubManagerProps) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<CommsView>('notifications');
  const [activeFilter, setActiveFilter] = useState<'ALL' | SignalPriority>('ALL');
  
  // ESTADOS DE SINCRONIZACIÓN SOBERANA
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncLatency, setSyncLatency] = useState<string | null>(null);

  /**
   * PROTOCOLO HEIMDALL: Sincronización del Ledger
   */
  const fetchLedger = useCallback(async () => {
    if (!session?.tenantId) return;
    
    setIsLoading(true);
    const traceId = `hub_sync_${Date.now().toString(36).toUpperCase()}`;
    console.log(`${C.magenta}${C.bold}[DNA][COMMS]${C.reset} Synchronizing Ledger | Trace: ${traceId}`);

    try {
      const response = await getCommsLedger(session.tenantId);
      
      if (response.success && response.data) {
        setTransmissions(response.data);
        setSyncLatency(response.latencyMs || null);
      } else {
        console.error(`${C.red}✕ [DNA][COMMS] Ledger sync failed: ${response.error}${C.reset}`);
      }
    } catch (error) {
      console.error(`${C.red}✕ [DNA][COMMS] Critical failure during sync.${C.reset}`, error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.tenantId]);

  // Sincronización inicial
  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  /**
   * MOTOR DE FILTRADO TÁCTICO
   */
  const filteredTransmissions = useMemo(() => {
    let filtered = transmissions;

    if (activeView === 'notifications') {
      filtered = filtered.filter(t => t.category !== 'comms' && t.category !== 'infra');
    } else if (activeView === 'messages') {
      filtered = filtered.filter(t => t.category === 'comms');
    } else if (activeView === 'logs') {
      filtered = filtered.filter(t => t.category === 'infra' || t.category === 'security');
    }

    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(t => t.priority === activeFilter);
    }

    return filtered;
  }, [transmissions, activeView, activeFilter]);

  const handleViewChange = useCallback((view: CommsView) => {
    setActiveView(view);
    setActiveFilter('ALL');
  }, []);

  const getPriorityStyle = useCallback((p: SignalPriority): PriorityStyle => ({
    critical: { color: 'text-red-500', bg: 'bg-red-500/10', label: dictionary.label_priority_critical },
    high: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: dictionary.label_priority_high },
    low: { color: 'text-success', bg: 'bg-success/10', label: dictionary.label_priority_low }
  }[p]), [dictionary]);

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      
      {/* --- 1. CABECERA OPERATIVA (Telemetry Dashboard) --- */}
      <header className="flex flex-col lg:flex-row justify-between items-center bg-surface/60 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-border/50 shadow-luxury gap-8">
        <div className="flex items-center gap-6 px-4 w-full lg:w-auto">
           <div className={cn(
             "h-14 w-14 rounded-2xl border flex items-center justify-center relative shadow-inner transition-colors",
             isLoading ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" : "bg-success/10 border-success/20 text-success"
           )}>
             {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Wifi size={28} className="animate-pulse" />}
           </div>
           <div>
              <span className={cn(
                "text-[10px] font-mono font-bold uppercase tracking-[0.4em]",
                isLoading ? "text-yellow-500" : "text-success"
              )}>
                {isLoading ? "SYNCHRONIZING..." : dictionary.status_online}
              </span>
              <h2 className="text-2xl font-display font-bold text-foreground tracking-tighter uppercase">
                {dictionary.title}
              </h2>
           </div>
        </div>

        <nav className="flex items-center gap-2 bg-background/20 p-2 rounded-2xl border border-border/40 w-full lg:w-auto">
           {['notifications', 'messages', 'logs'].map((v) => (
             <button 
               key={v} 
               onClick={() => handleViewChange(v as CommsView)} 
               className={cn(
                 "px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary", 
                 activeView === v 
                  ? "bg-foreground text-background shadow-lg scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
               )}
             >
               {dictionary[`tab_${v as CommsView}` as keyof CommsHubDictionary]}
             </button>
           ))}
        </nav>
      </header>

      {/* --- 2. RENDERIZADO DEL LEDGER (Viewport) --- */}
      <section className="min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            // SKELETONS DE CARGA
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 w-full bg-surface/30 border border-border rounded-4xl animate-pulse" />
              ))}
            </motion.div>
          ) : filteredTransmissions.length > 0 ? (
            // RESULTADOS
            <motion.div className="space-y-4" layout>
              {filteredTransmissions.map(tx => (
                <SignalCard 
                  key={tx.id} 
                  tx={tx} 
                  style={getPriorityStyle(tx.priority)} 
                  activeView={activeView} 
                  dictionary={dictionary} 
                />
              ))}
            </motion.div>
          ) : (
            // EMPTY STATE
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-32 rounded-[4rem] border-2 border-dashed border-border bg-surface/20 text-center"
            >
              <div className="h-20 w-20 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground/30 mb-6 shadow-inner">
                 <Info size={32} />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground tracking-tighter uppercase mb-2">
                Sector Silencioso
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em]">
                {dictionary.empty_inbox}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* --- 3. FOOTER TELEMÉTRICO (Heimdall Insights) --- */}
      <footer className="pt-8 border-t border-border/40 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity duration-700">
         <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
           <Activity size={14} className="text-primary" />
           Last Sync: {syncLatency ? `${syncLatency}ms` : 'Pending'}
         </div>
         <button 
           onClick={fetchLedger}
           className="text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors outline-none focus-visible:underline"
         >
           Force Refresh
         </button>
      </footer>
    </div>
  );
}
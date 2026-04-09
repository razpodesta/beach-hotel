/**
 * @file apps/portfolio-web/src/components/sections/portal/CommsHubManager.tsx
 * @description Enterprise Communication Hub Orchestrator (Silo D Manager).
 *              Refactorizado: Inteligencia de densidad de señales (Unread Tracking),
 *              normalización de atmósfera Oxygen v4 y telemetría Heimdall v2.5.
 *              Estándar: React 19 Pure & Forensic Signal Stream.
 * @version 6.3 - Unread Intelligence & Oxygen v4 Hardened
 * @author Raz Podestá -  MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, CheckCircle2, Trash2, Reply, Wifi, 
  Loader2, Activity, Zap, Terminal, ShieldCheck,
  RefreshCw, Radio
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { CommsHubDictionary } from '../../../lib/schemas/comms/hub.schema';
import { getCommsLedger, type Transmission } from '../../../lib/portal/actions/comms.actions';

// --- PROTOCOLO CROMÁTICO HEIMDALL v2.5 ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

// --- CONTRATOS LÓGICOS SOBERANOS ---
type CommsView = 'notifications' | 'messages' | 'logs';
type SignalPriority = 'low' | 'high' | 'critical';

interface PriorityStyle {
  color: string;
  bg: string;
  label: string;
  glow: string;
}

/**
 * @interface CommsHubManagerProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export interface CommsHubManagerProps {
  dictionary: Dictionary['comms_hub'];
  className?: string;
}

// ============================================================================
// 1. ÁTOMO: CommsSignalCard (Forensic Entity)
// ============================================================================
const CommsSignalCard = memo(({ tx, style, activeView, dictionary }: { 
  tx: Transmission; 
  style: PriorityStyle; 
  activeView: CommsView; 
  dictionary: CommsHubDictionary;
}) => {
  const Icon = tx.priority === 'critical' ? ShieldAlert : (tx.priority === 'high' ? Activity : CheckCircle2);
  
  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative flex flex-col md:flex-row items-center justify-between p-6 rounded-4xl border bg-surface/30",
        "hover:bg-surface/50 transition-all duration-700 shadow-xl overflow-hidden transform-gpu",
        tx.priority === 'critical' ? "border-red-500/20" : "border-border hover:border-primary/30",
        !tx.isRead && "border-l-4 border-l-primary"
      )}
    >
      <div className="flex items-center gap-8 flex-1 w-full relative z-10">
        <div className={cn(
          "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-700 group-hover:scale-110 shadow-inner", 
          style.bg, style.color, "border-current/10"
        )}>
           <Icon size={28} strokeWidth={1.5} className={cn(tx.priority === 'critical' && "animate-pulse")} />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-4 flex-wrap">
             <span className={cn(
               "px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-current/20 shadow-sm", 
               style.bg, style.color
             )}>
               {style.label}
             </span>
             <h4 className="font-display text-base font-bold text-foreground leading-tight tracking-tight uppercase truncate">
               {tx.subject}
             </h4>
             {!tx.isRead && (
               <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
             )}
          </div>
          
          {(activeView === 'messages' || activeView === 'logs') && tx.body && (
            <p className="text-xs text-muted-foreground leading-relaxed italic max-w-2xl font-light line-clamp-2">
              "{tx.body}"
            </p>
          )}
          
          <div className="flex items-center gap-4 text-[9px] font-mono text-muted-foreground uppercase tracking-widest opacity-60">
             <span>{dictionary.label_sender_node}: <b className="text-foreground/80">{tx.sender}</b></span>
             <div className="h-1 w-1 rounded-full bg-border" />
             <span>ID_TRACE: {tx.traceId}</span>
             <div className="h-1 w-1 rounded-full bg-border" />
             <span>{tx.timestamp}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-6 md:mt-0 md:ml-10 relative z-10 shrink-0">
         {activeView === 'messages' && (
           <button 
             className="p-3.5 rounded-2xl bg-background border border-border text-primary hover:bg-primary hover:text-white transition-all active:scale-90 shadow-lg"
             aria-label="Reply"
           >
             <Reply size={20} />
           </button>
         )}
         <button 
            className="p-3.5 rounded-2xl bg-background border border-border text-muted-foreground hover:text-red-500 transition-all active:scale-90 shadow-lg"
            aria-label="Delete"
         >
           <Trash2 size={20} />
         </button>
      </div>

      <div className={cn("absolute -right-20 -bottom-20 h-40 w-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-10 transition-opacity", style.glow)} />
    </motion.article>
  );
});
CommsSignalCard.displayName = 'CommsSignalCard';

// ============================================================================
// 2. APARATO: CommsHubHeader (Operational Nav)
// ============================================================================
const CommsHubHeader = memo(({ 
  dictionary, 
  activeView, 
  onViewChange, 
  isLoading, 
  hasError,
  unreadCount
}: { 
  dictionary: CommsHubDictionary;
  activeView: CommsView;
  onViewChange: (v: CommsView) => void;
  isLoading: boolean;
  hasError: boolean;
  unreadCount: number;
}) => (
  <header className="flex flex-col lg:flex-row justify-between items-center bg-surface/60 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-border/50 shadow-luxury gap-8 transition-all duration-700">
    <div className="flex items-center gap-6 px-4 w-full lg:w-auto">
       <div className={cn(
         "h-14 w-14 rounded-2xl border flex items-center justify-center relative shadow-inner transition-all duration-700",
         isLoading ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" : (hasError ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-success/10 border-success/20 text-success")
       )}>
         {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Wifi size={28} className="animate-pulse" />}
         
         {unreadCount > 0 && !isLoading && (
           <div className="absolute -top-2 -right-2">
             <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-lg animate-in zoom-in">
               {unreadCount}
             </span>
           </div>
         )}
       </div>
       <div className="space-y-1">
          <span className={cn("text-[10px] font-mono font-bold uppercase tracking-[0.4em]", isLoading ? "text-yellow-500" : (hasError ? "text-red-500" : "text-success"))}>
            {isLoading ? "CALIBRATING_STREAM..." : dictionary.status_online}
          </span>
          <h2 className="text-2xl font-display font-bold text-foreground tracking-tighter uppercase leading-none">
            {dictionary.title}
          </h2>
       </div>
    </div>

    <nav className="flex items-center gap-2 bg-background/20 p-2 rounded-2xl border border-border/40 w-full lg:w-auto overflow-x-auto no-scrollbar transform-gpu">
       {(['notifications', 'messages', 'logs'] as CommsView[]).map((v) => (
         <button 
           key={v} 
           onClick={() => onViewChange(v)} 
           className={cn(
             "px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all outline-none", 
             activeView === v ? "bg-foreground text-background shadow-lg scale-105" : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
           )}
         >
           {dictionary[`tab_${v}` as keyof CommsHubDictionary]}
         </button>
       ))}
    </nav>
  </header>
));
CommsHubHeader.displayName = 'CommsHubHeader';

// ============================================================================
// APARATO PRINCIPAL: CommsHubManager (Silo D Orchestrator)
// ============================================================================
export function CommsHubManager({ dictionary, className }: CommsHubManagerProps) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<CommsView>('notifications');
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncLatency, setSyncLatency] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  
  const lastCountRef = useRef<number>(0);

  /**
   * PROTOCOLO HEIMDALL: Sincronización del Ledger Forense
   * @pilar IV: Trazabilidad DNA-Level y medición de "Signal Drift".
   */
  const fetchLedger = useCallback(async () => {
    if (!session?.tenantId) return;
    
    setIsLoading(true);
    const traceId = `sig_recon_${Date.now().toString(36).toUpperCase()}`;
    const startTime = performance.now();

    console.log(`${C.magenta}${C.bold}[DNA][COMMS]${C.reset} Scanning Signal Stream | Trace: ${C.cyan}${traceId}${C.reset}`);

    try {
      const response = await getCommsLedger(session.tenantId);
      const duration = (performance.now() - startTime).toFixed(4);

      if (response.success && response.data) {
        const newData = response.data;
        const drift = newData.length - lastCountRef.current;
        
        setTransmissions(newData);
        setSyncLatency(duration);
        setErrorCount(0);
        lastCountRef.current = newData.length;

        console.log(
          `${C.green}   ✓ [GRANTED]${C.reset} Stream Synchronized | ` +
          `Nodes: ${newData.length} | Drift: ${drift > 0 ? '+' : ''}${drift} | Lat: ${duration}ms`
        );
      } else {
        throw new Error(response.error || 'GATEWAY_TIMEOUT');
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'SIGNAL_INTERRUPTED';
      setErrorCount(prev => prev + 1);
      console.error(`${C.red}   ✕ [BREACH] Signal recognition failed. Trace: ${traceId} | Reason: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [session?.tenantId]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  /** 
   * INTELIGENCIA DE SEÑAL (Data Aggregator)
   * @pilar X: Performance - Procesamiento en ciclo único para filtrado y conteo.
   */
  const { filteredData, unreadCount } = useMemo(() => {
    let unread = 0;
    const filtered = transmissions.filter(t => {
      if (!t.isRead) unread++;
      
      if (activeView === 'notifications') return t.category !== 'comms' && t.category !== 'infra';
      if (activeView === 'messages') return t.category === 'comms';
      return t.category === 'infra' || t.category === 'security';
    });

    return { filteredData: filtered, unreadCount: unread };
  }, [transmissions, activeView]);

  /** 
   * RESOLVER DE ESTILO (Oxygen Engine OKLCH) 
   */
  const getPriorityStyle = useCallback((p: SignalPriority): PriorityStyle => ({
    critical: { 
      color: 'text-red-500', 
      bg: 'bg-red-500/10', 
      glow: 'bg-red-500', 
      label: dictionary.label_priority_critical 
    },
    high: { 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-500/10', 
      glow: 'bg-yellow-500', 
      label: dictionary.label_priority_high 
    },
    low: { 
      color: 'text-success', 
      bg: 'bg-success/10', 
      glow: 'bg-success', 
      label: dictionary.label_priority_low 
    }
  }[p]), [dictionary]);

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      
      {/* 1. CABECERA TÁCTICA (Status & Nav) */}
      <CommsHubHeader 
        dictionary={dictionary} 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isLoading={isLoading} 
        hasError={errorCount > 0}
        unreadCount={unreadCount}
      />

      {/* 2. VIEWPORT DE SEÑALES (Aceleración GPU) */}
      <section className="min-h-[450px]">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div key="skeleton" className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 w-full bg-surface/30 border border-border/40 rounded-4xl animate-pulse" />
              ))}
            </motion.div>
          ) : filteredData.length > 0 ? (
            <motion.div key="list" className="space-y-4" layout>
              {filteredData.map(tx => (
                <CommsSignalCard 
                  key={tx.id} 
                  tx={tx} 
                  style={getPriorityStyle(tx.priority)} 
                  activeView={activeView} 
                  dictionary={dictionary} 
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty" 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="py-48 text-center space-y-8 rounded-[4rem] border-2 border-dashed border-border bg-surface/10 relative overflow-hidden"
            >
              <div className="relative mx-auto w-max">
                <div className="absolute inset-0 blur-3xl bg-primary/5 rounded-full animate-pulse" />
                <Terminal size={64} className="mx-auto text-muted-foreground/10 relative" />
              </div>
              <div className="space-y-2">
                 <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-muted-foreground">
                   {dictionary.empty_inbox}
                 </p>
                 <span className="text-[7px] font-mono uppercase text-muted-foreground/30">RECON_MODE: SCANNING...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 3. FOOTER TELEMÉTRICO (Pulse Logic) */}
      <footer className="pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-1000">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              <Zap size={14} className="text-primary animate-pulse" />
              Sync Latency: {syncLatency ? `${syncLatency}ms` : '---'}
            </div>
            <div className="h-4 w-px bg-border/40 hidden sm:block" />
            <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              <ShieldCheck size={14} className="text-success" />
              Perimeter Protection: v2.5 VALIDATED
            </div>
         </div>
         
         <div className="flex items-center gap-6">
            <button 
              onClick={fetchLedger}
              className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-primary transition-all outline-none active:scale-95"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-1000" />
              Re-Scan Ledger
            </button>
            <div className="h-4 w-px bg-border/40 hidden sm:block" />
            <div className="flex items-center gap-3 text-muted-foreground">
               <Radio size={14} />
               <span className="text-[9px] font-mono uppercase tracking-[0.5em]">
                 Node: {session?.tenantId?.substring(0, 8) || 'ROOT'}
               </span>
            </div>
         </div>
      </footer>
    </div>
  );
}
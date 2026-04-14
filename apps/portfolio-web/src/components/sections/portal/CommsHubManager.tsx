/**
 * @file apps/portfolio-web/src/components/sections/portal/CommsHubManager.tsx
 * @description Enterprise Communication Hub Orchestrator (Silo D Manager).
 *              Terminal industrial para la gestión de señales operativas.
 *              Refactorizado: Purificación de Linter (ESLint no-console fix),
 *              optimización concurrente e inyección de telemetría Heimdall v2.5.
 *              Estándar: Concurrent Dispatch & Forensic Sealed.
 * 
 * @version 9.0 - Linter Pure & Concurrent Logic Sealed
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { 
  useState, 
  useMemo, 
  useEffect, 
  useCallback, 
  memo, 
  useTransition,
  useDeferredValue
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Trash2, 
  Reply, 
  Wifi, 
  Loader2, 
  Activity, 
  Zap,  
  ShieldCheck,
  RefreshCw, 
  Radio,
  BellRing
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import type { CommsHubDictionary } from '../../../lib/schemas/comms/hub.schema';
import { 
  getCommsLedger, 
  markNotificationAsReadAction,
  type Transmission 
} from '../../../lib/portal/actions/comms.actions';

/** 
 * PROTOCOLO CROMÁTICO HEIMDALL v2.5 
 * @pilar IV: Observabilidad DNA-Level.
 */
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

type CommsView = 'notifications' | 'messages' | 'logs';
type SignalPriority = 'low' | 'high' | 'critical';

interface PriorityStyle {
  color: string;
  bg: string;
  label: string;
  glow: string;
  animate?: string;
}

export interface CommsHubManagerProps {
  /** Diccionario nivelado inyectado por el orquestador i18n */
  dictionary: CommsHubDictionary;
  className?: string;
}

// ============================================================================
// 1. ÁTOMO: CommsSignalCard (Forensic Entity)
// ============================================================================

/**
 * @description Representa una unidad de transmisión en el Ledger.
 * @pilar XII: MEA/UX - Animación suave y feedback táctico.
 */
const CommsSignalCard = memo(({ 
  tx, 
  style, 
  activeView, 
  dictionary,
  onRead,
  onAction
}: { 
  tx: Transmission; 
  style: PriorityStyle; 
  activeView: CommsView; 
  dictionary: CommsHubDictionary;
  onRead: (id: string) => void;
  onAction: (id: string, action: 'reply' | 'delete') => void;
}) => {
  const Icon = tx.priority === 'critical' ? ShieldAlert : (tx.priority === 'high' ? Activity : CheckCircle2);
  
  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => !tx.isRead && onRead(tx.id)}
      className={cn(
        "group relative flex flex-col md:flex-row items-center justify-between p-6 rounded-4xl border",
        "bg-surface/30 backdrop-blur-xl transition-all duration-700 shadow-xl overflow-hidden transform-gpu cursor-pointer",
        tx.priority === 'critical' ? "border-red-500/20" : "border-border hover:border-primary/30",
        !tx.isRead && "border-l-4 border-l-primary"
      )}
    >
      <div className="flex items-center gap-8 flex-1 w-full relative z-10">
        <div className={cn(
          "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-700 group-hover:scale-105 shadow-inner", 
          style.bg, style.color, "border-current/10",
          style.animate
        )}>
           <Icon size={28} strokeWidth={1.5} />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-4 flex-wrap">
             <span className={cn(
               "px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-current/20 shadow-sm transition-colors", 
               style.bg, style.color
             )}>
               {style.label}
             </span>
             <h4 className="font-display text-base font-bold text-foreground leading-tight tracking-tight uppercase truncate">
               {tx.subject}
             </h4>
             {!tx.isRead && (
               <motion.div 
                 initial={{ scale: 0 }} animate={{ scale: 1 }}
                 className="flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" 
               />
             )}
          </div>
          
          {(activeView === 'messages' || activeView === 'logs') && tx.body && (
            <p className="text-xs text-muted-foreground leading-relaxed italic max-w-2xl font-light line-clamp-2">
              "{tx.body}"
            </p>
          )}
          
          <div className="flex items-center gap-4 text-[9px] font-mono text-muted-foreground uppercase tracking-widest opacity-60">
             <span>{dictionary.label_sender_node}: <b className="text-foreground/80">{tx.sender}</b></span>
             <div className="h-px w-4 bg-border" />
             <span className="font-bold">TRACE: {tx.traceId}</span>
             <div className="h-px w-4 bg-border" />
             <span>{tx.timestamp}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-6 md:mt-0 md:ml-10 relative z-10 shrink-0">
         {activeView === 'messages' && (
           <button 
             onClick={(e) => { e.stopPropagation(); onAction(tx.id, 'reply'); }}
             className="p-3.5 rounded-2xl bg-background border border-border text-primary hover:bg-primary hover:text-white transition-all active:scale-90 shadow-lg"
             aria-label="Reply Signal"
           >
             <Reply size={20} />
           </button>
         )}
         <button 
            onClick={(e) => { e.stopPropagation(); onAction(tx.id, 'delete'); }}
            className="p-3.5 rounded-2xl bg-background border border-border text-muted-foreground hover:text-red-500 transition-all active:scale-90 shadow-lg"
            aria-label="Purge Signal"
         >
           <Trash2 size={20} />
         </button>
      </div>

      {/* Glow Atmosférico (Pilar VII) */}
      <div className={cn("absolute -right-20 -bottom-20 h-40 w-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-1000", style.glow)} />
    </motion.article>
  );
});
CommsSignalCard.displayName = 'CommsSignalCard';

// ============================================================================
// APARATO PRINCIPAL: CommsHubManager
// ============================================================================

/**
 * @description Orquestador soberano del Silo D.
 * @pilar X: Performance - Concurrencia mediante useTransition y useDeferredValue.
 */
export function CommsHubManager({ dictionary, className }: CommsHubManagerProps) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<CommsView>('notifications');
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncLatency, setSyncLatency] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const deferredTransmissions = useDeferredValue(transmissions);

  /**
   * HANDLER: fetchLedger
   * @description Sincroniza el Ledger operativo con el clúster central.
   * @fix ESLint: Uso de console.info con trazabilidad Heimdall.
   */
  const fetchLedger = useCallback(async () => {
    if (!session?.tenantId) return;
    
    setIsLoading(true);
    setErrorStatus(null);
    const startTime = performance.now();
    const syncTraceId = `hsk_ledger_${Date.now().toString(36).toUpperCase()}`;

    try {
      const response = await getCommsLedger(session.tenantId, session.userId);
      const duration = (performance.now() - startTime).toFixed(4);

      if (response.success && response.data) {
        setTransmissions(response.data);
        setSyncLatency(duration);
        
        // @fix: console.info para cumplimiento Linter v10.0
        console.info(`${C.green}   ✓ [DNA][COMMS]${C.reset} Ledger Handshake OK | Trace: ${C.cyan}${syncTraceId}${C.reset} | Nodes: ${response.data.length}`);
      } else {
        throw new Error(response.error || 'SIGNAL_CARRIER_LOST');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'SIGNAL_GATEWAY_DRIFT';
      setErrorStatus(msg);
      console.error(`${C.red}   ✕ [BREACH] Connection aborted:${C.reset} ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  /**
   * HANDLER: handleMarkRead (Optimistic Update)
   * @description Realiza el handshake de lectura con el Silo D.
   */
  const handleMarkRead = useCallback(async (id: string) => {
    if (!session?.tenantId) return;
    
    // UI Update Optimista (Pilar X)
    setTransmissions(prev => prev.map(t => t.id === id ? { ...t, isRead: true } : t));
    
    const result = await markNotificationAsReadAction(id, session.tenantId);
    if (!result.success) {
      console.warn(`${C.yellow}[HEIMDALL][SILO-D] Handshake failed. Reverting node ${id}...${C.reset}`);
      fetchLedger(); 
    }
  }, [session?.tenantId, fetchLedger]);

  /**
   * HANDLER: handleSignalAction
   * @description Gestiona comandos secundarios de transmisión.
   * @fix ESLint: Uso de console.info.
   */
  const handleSignalAction = useCallback((id: string, action: 'reply' | 'delete') => {
    // @fix: console.info para cumplimiento Linter v10.0
    console.info(`${C.magenta}[DNA][ACTION]${C.reset} Node ${id} command: ${action.toUpperCase()}`);
    if (action === 'delete') {
       setTransmissions(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  /** 
   * INTELIGENCIA DE SEÑAL (MACS Logic)
   * @description Segmenta el flujo de actividad basado en la vista activa.
   */
  const { filteredData, unreadCount } = useMemo(() => {
    let unread = 0;
    const filtered = deferredTransmissions.filter(t => {
      if (!t.isRead) unread++;
      if (activeView === 'notifications') return t.category !== 'comms' && t.category !== 'infra';
      if (activeView === 'messages') return t.category === 'comms';
      return t.category === 'infra' || t.category === 'security';
    });
    return { filteredData: filtered, unreadCount: unread };
  }, [deferredTransmissions, activeView]);

  const handleTabSwitch = (view: CommsView) => {
    startTransition(() => {
      setActiveView(view);
    });
  };

  /** 
   * RESOLVER DE ESTILO SOBERANO (Pilar VII)
   */
  const getPriorityStyle = useCallback((p: SignalPriority): PriorityStyle => ({
    critical: { 
        color: 'text-red-500', 
        bg: 'bg-red-500/10', 
        glow: 'bg-red-500', 
        label: dictionary.label_priority_critical,
        animate: 'animate-pulse' 
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

  if (!dictionary) return null;

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      
      {/* 1. CABECERA OPERATIVA (Oxygen Glass) */}
      <header className="flex flex-col lg:flex-row justify-between items-center bg-surface/60 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-border/50 shadow-luxury gap-8">
        <div className="flex items-center gap-6 px-4">
           <div className={cn(
             "h-14 w-14 rounded-2xl border flex items-center justify-center relative shadow-inner transition-all duration-700",
             isLoading ? "bg-primary/10 border-primary/20 text-primary" : "bg-success/10 border-success/20 text-success"
           )}>
             {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Wifi size={28} className="animate-pulse" />}
             {unreadCount > 0 && (
               <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-lg animate-bounce">
                 {unreadCount}
               </span>
             )}
           </div>
           <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-success">
                {dictionary.status_online}
              </span>
              <h2 className="text-2xl font-display font-bold text-foreground tracking-tighter uppercase leading-none">
                {dictionary.title}
              </h2>
           </div>
        </div>

        <nav className="flex items-center gap-2 bg-background/20 p-2 rounded-2xl border border-border/40" role="tablist">
           {(['notifications', 'messages', 'logs'] as CommsView[]).map((v) => (
             <button 
               key={v} 
               role="tab"
               aria-selected={activeView === v}
               onClick={() => handleTabSwitch(v)} 
               className={cn(
                 "px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all outline-none transform-gpu", 
                 activeView === v ? "bg-foreground text-background shadow-lg scale-105" : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
               )}
             >
               {dictionary[`tab_${v}` as keyof CommsHubDictionary]}
             </button>
           ))}
        </nav>
      </header>

      {/* 2. SIGNAL VIEWPORT (High Throughput) */}
      <section className={cn("min-h-[450px] transition-all duration-500", (isPending || isLoading) && "opacity-40 blur-xs")}>
        <AnimatePresence mode="popLayout">
          {errorStatus ? (
            <motion.div 
                key="error-state"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="py-32 text-center space-y-6 rounded-[4rem] border border-red-500/10 bg-red-500/3"
            >
              <ShieldAlert size={64} className="mx-auto text-red-500/40" />
              <div className="space-y-2">
                <p className="font-mono text-[10px] text-red-500 uppercase tracking-[0.4em]">Handshake_Failure</p>
                <p className="text-muted-foreground font-sans italic text-sm">{errorStatus}</p>
              </div>
              <button onClick={fetchLedger} className="group flex items-center gap-3 mx-auto px-8 py-3 rounded-full bg-foreground text-background font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                <RefreshCw size={14} className="group-active:rotate-180 transition-transform" />
                Retry Handshake
              </button>
            </motion.div>
          ) : filteredData.length > 0 ? (
            <motion.div key="signal-list" className="space-y-4" layout>
              {filteredData.map(tx => (
                <CommsSignalCard 
                  key={tx.id} 
                  tx={tx} 
                  style={getPriorityStyle(tx.priority)} 
                  activeView={activeView} 
                  dictionary={dictionary} 
                  onRead={handleMarkRead}
                  onAction={handleSignalAction}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
                key="empty-state"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="py-48 text-center space-y-8 rounded-[4rem] border-2 border-dashed border-border bg-surface/10"
            >
              <BellRing size={64} className="mx-auto text-muted-foreground/10" />
              <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-muted-foreground animate-pulse">
                {dictionary.empty_inbox}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 3. TELEMETRY FOOTER (Heimdall Pulse) */}
      <footer className="pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-1000">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              <Zap size={14} className="text-primary animate-pulse" />
              Sync Latency: {syncLatency ? `${syncLatency}ms` : '---'}
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              <ShieldCheck size={14} className="text-success" />
              Perimeter Protection: ACTIVE
            </div>
         </div>
         
         <div className="flex items-center gap-6">
            <button 
                onClick={fetchLedger} 
                disabled={isLoading}
                className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-primary transition-all outline-none disabled:opacity-30"
            >
              <RefreshCw size={14} className={cn("transition-transform duration-1000", !isLoading && "group-hover:rotate-180")} />
              Force Re-Scan
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
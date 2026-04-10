/**
 * @file apps/portfolio-web/src/components/sections/portal/CommsHubManager.tsx
 * @description Enterprise Communication Hub Orchestrator (Silo D Manager).
 *              Orquesta la visualización de señales operativas, gestión de lectura
 *              y telemetría de latencia del Ledger.
 *              Refactorizado: Resolución de TS2339 (Contrato de error), integración
 *              de mutaciones de lectura y optimización de atmósfera Oxygen v4.
 * @version 7.0 - Signal Read Logic & Type Contract Sealed
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { 
  useState, 
  useMemo, 
  useEffect, 
  useCallback, 
  memo, 
  useTransition 
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
  Terminal, 
  ShieldCheck,
  RefreshCw, 
  Radio
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { CommsHubDictionary } from '../../../lib/schemas/comms/hub.schema';
import { 
  getCommsLedger, 
  markNotificationAsReadAction,
  type Transmission 
} from '../../../lib/portal/actions/comms.actions';

// --- PROTOCOLO CROMÁTICO HEIMDALL v2.5 ---
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
}

export interface CommsHubManagerProps {
  dictionary: Dictionary['comms_hub'];
  className?: string;
}

// ============================================================================
// 1. ÁTOMO: CommsSignalCard (Forensic Entity)
// ============================================================================
const CommsSignalCard = memo(({ 
  tx, 
  style, 
  activeView, 
  dictionary,
  onInteraction 
}: { 
  tx: Transmission; 
  style: PriorityStyle; 
  activeView: CommsView; 
  dictionary: CommsHubDictionary;
  onInteraction: (id: string) => void;
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
               <motion.div 
                 initial={{ scale: 0 }} animate={{ scale: 1 }}
                 className="flex h-2 w-2 rounded-full bg-primary animate-pulse" 
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
             <div className="h-1 w-1 rounded-full bg-border" />
             <span>TRACE: {tx.traceId}</span>
             <div className="h-1 w-1 rounded-full bg-border" />
             <span>{tx.timestamp}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-6 md:mt-0 md:ml-10 relative z-10 shrink-0">
         {activeView === 'messages' && (
           <button 
             onClick={() => onInteraction(tx.id)}
             className="p-3.5 rounded-2xl bg-background border border-border text-primary hover:bg-primary hover:text-white transition-all active:scale-90 shadow-lg"
             aria-label="Reply"
           >
             <Reply size={20} />
           </button>
         )}
         <button 
            onClick={() => onInteraction(tx.id)}
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
// APARATO PRINCIPAL: CommsHubManager
// ============================================================================
export function CommsHubManager({ dictionary, className }: CommsHubManagerProps) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<CommsView>('notifications');
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncLatency, setSyncLatency] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /**
   * PROTOCOLO HEIMDALL: Sincronización del Ledger
   */
  const fetchLedger = useCallback(async () => {
    if (!session?.tenantId) return;
    
    setIsLoading(true);
    setErrorStatus(null);
    const startTime = performance.now();

    try {
      const response = await getCommsLedger(session.tenantId, session.userId);
      const duration = (performance.now() - startTime).toFixed(4);

      if (response.success && response.data) {
        setTransmissions(response.data);
        setSyncLatency(duration);
        console.log(`${C.green}   ✓ [DNA][COMMS]${C.reset} Ledger Synchronized | Nodes: ${response.data.length}`);
      } else {
        /** @fix TS2339: Ahora el tipo de respuesta incluye 'error' */
        throw new Error(response.error || 'SIGNAL_INTERRUPTED');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'SIGNAL_GATEWAY_DRIFT';
      setErrorStatus(msg);
      console.error(`${C.red}   ✕ [BREACH] Signal recognition failed: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  /**
   * MUTACIÓN: handleMarkRead
   * @description Realiza el handshake de lectura y actualiza la UI optimísticamente.
   */
  const handleMarkRead = useCallback(async (id: string) => {
    if (!session?.tenantId) return;
    
    // UI Update Optimista (Pilar X)
    setTransmissions(prev => prev.map(t => t.id === id ? { ...t, isRead: true } : t));
    
    const result = await markNotificationAsReadAction(id, session.tenantId);
    if (!result.success) {
      console.warn(`[HEIMDALL][SILO-D] MarkRead failed for node: ${id}. Reverting...`);
      fetchLedger(); // Re-sync en fallo
    }
  }, [session?.tenantId, fetchLedger]);

  /** 
   * INTELIGENCIA DE SEÑAL
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

  const handleTabSwitch = (view: CommsView) => {
    startTransition(() => {
      setActiveView(view);
    });
  };

  /** 
   * RESOLVER DE ESTILO 
   */
  const getPriorityStyle = useCallback((p: SignalPriority): PriorityStyle => ({
    critical: { color: 'text-red-500', bg: 'bg-red-500/10', glow: 'bg-red-500', label: dictionary.label_priority_critical },
    high: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', glow: 'bg-yellow-500', label: dictionary.label_priority_high },
    low: { color: 'text-success', bg: 'bg-success/10', glow: 'bg-success', label: dictionary.label_priority_low }
  }[p]), [dictionary]);

  if (!dictionary) return null;

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      
      {/* 1. CABECERA OPERATIVA */}
      <header className="flex flex-col lg:flex-row justify-between items-center bg-surface/60 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-border/50 shadow-luxury gap-8">
        <div className="flex items-center gap-6 px-4">
           <div className={cn(
             "h-14 w-14 rounded-2xl border flex items-center justify-center relative shadow-inner transition-all duration-700",
             isLoading ? "bg-primary/10 border-primary/20 text-primary" : "bg-success/10 border-success/20 text-success"
           )}>
             {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Wifi size={28} className="animate-pulse" />}
             {unreadCount > 0 && (
               <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-lg">
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

        <nav className="flex items-center gap-2 bg-background/20 p-2 rounded-2xl border border-border/40">
           {(['notifications', 'messages', 'logs'] as CommsView[]).map((v) => (
             <button 
               key={v} 
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

      {/* 2. SIGNAL VIEWPORT */}
      <section className={cn("min-h-[450px] transition-all duration-500", isPending && "opacity-40 blur-sm")}>
        <AnimatePresence mode="popLayout">
          {errorStatus ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center space-y-6">
              <ShieldAlert size={64} className="mx-auto text-red-500/40" />
              <p className="font-mono text-xs text-red-500 uppercase tracking-widest">{errorStatus}</p>
              <button onClick={fetchLedger} className="px-8 py-3 rounded-full bg-foreground text-background font-bold text-[10px] uppercase tracking-widest hover:bg-primary transition-all">
                Retry Handshake
              </button>
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
                  onInteraction={handleMarkRead}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-48 text-center space-y-8 rounded-[4rem] border-2 border-dashed border-border bg-surface/10">
              <Terminal size={64} className="mx-auto text-muted-foreground/10" />
              <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-muted-foreground animate-pulse">
                {dictionary.empty_inbox}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 3. TELEMETRY FOOTER */}
      <footer className="pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-1000">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              <Zap size={14} className="text-primary animate-pulse" />
              Latency: {syncLatency ? `${syncLatency}ms` : '---'}
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              <ShieldCheck size={14} className="text-success" />
              Perimeter Protection: ACTIVE
            </div>
         </div>
         
         <div className="flex items-center gap-6">
            <button onClick={fetchLedger} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-primary transition-all outline-none">
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-1000" />
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
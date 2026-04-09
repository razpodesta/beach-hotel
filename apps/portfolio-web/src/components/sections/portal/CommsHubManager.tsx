/**
 * @file apps/portfolio-web/src/components/sections/portal/CommsHubManager.tsx
 * @description Enterprise Communication Hub Orchestrator (Silo D).
 *              Refactorizado: Erradicación de variables no usadas y sellado de 
 *              contratos de tipos. Implementa el patrón de responsabilidad única.
 *              Estándar: Heimdall v2.5 Injected & React 19 Purity.
 * @version 6.1 - Linter Pure & Type Contract Sealed
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, CheckCircle2, Trash2, Reply, Wifi, 
  Loader2, Activity, Zap, Terminal, ShieldCheck
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { CommsHubDictionary } from '../../../lib/schemas/comms/hub.schema';
import { getCommsLedger, type Transmission } from '../../../lib/portal/actions/comms.actions';

// --- PROTOCOLO CROMÁTICO HEIMDALL ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

// --- CONTRATOS LÓGICOS ---
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
  /** Fragmento validado del diccionario SSoT */
  dictionary: Dictionary['comms_hub'];
  /** Clases de estilo inyectadas por el orquestador */
  className?: string;
}

// ============================================================================
// 1. ÁTOMO: CommsSignalCard
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
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative flex flex-col md:flex-row items-center justify-between p-6 rounded-4xl border bg-surface/30",
        "hover:bg-surface/50 transition-all duration-700 shadow-xl overflow-hidden transform-gpu",
        tx.priority === 'critical' ? "border-red-500/20" : "border-border hover:border-primary/30"
      )}
    >
      <div className="flex items-center gap-8 flex-1 w-full relative z-10">
        <div className={cn(
          "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-700 group-hover:scale-110 shadow-inner", 
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
          </div>
          
          {(activeView === 'messages' || activeView === 'logs') && tx.body && (
            <p className="text-xs text-muted-foreground leading-relaxed italic max-w-2xl font-light line-clamp-2">
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
// 2. APARATO: CommsHubHeader
// ============================================================================
const CommsHubHeader = memo(({ 
  dictionary, 
  activeView, 
  onViewChange, 
  isLoading, 
  hasError 
}: { 
  dictionary: CommsHubDictionary;
  activeView: CommsView;
  onViewChange: (v: CommsView) => void;
  isLoading: boolean;
  hasError: boolean;
}) => (
  <header className="flex flex-col lg:flex-row justify-between items-center bg-surface/60 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-border/50 shadow-luxury gap-8">
    <div className="flex items-center gap-6 px-4 w-full lg:w-auto">
       <div className={cn(
         "h-14 w-14 rounded-2xl border flex items-center justify-center relative shadow-inner transition-all duration-700",
         isLoading ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" : (hasError ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-success/10 border-success/20 text-success")
       )}>
         {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Wifi size={28} className="animate-pulse" />}
       </div>
       <div className="space-y-1">
          <span className={cn("text-[10px] font-mono font-bold uppercase tracking-[0.4em]", isLoading ? "text-yellow-500" : (hasError ? "text-red-500" : "text-success"))}>
            {isLoading ? "SYNCHRONIZING..." : dictionary.status_online}
          </span>
          <h2 className="text-2xl font-display font-bold text-foreground tracking-tighter uppercase leading-none">
            {dictionary.title}
          </h2>
       </div>
    </div>

    <nav className="flex items-center gap-2 bg-background/20 p-2 rounded-2xl border border-border/40 w-full lg:w-auto overflow-x-auto no-scrollbar">
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
// 3. APARATO: CommsHubFooter
// ============================================================================
const CommsHubFooter = memo(({ 
  syncLatency, 
  onRefresh, 
  tenantId 
}: { 
  syncLatency: string | null; 
  onRefresh: () => void;
  tenantId: string;
}) => (
  <footer className="pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-700">
     <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
          <Zap size={14} className="text-primary animate-pulse" />
          Sync Latency: {syncLatency ? `${syncLatency}ms` : '---'}
        </div>
        <div className="h-4 w-px bg-border/40 hidden sm:block" />
        <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
          <ShieldCheck size={14} className="text-success" />
          Silo D Security: VALIDATED
        </div>
     </div>
     
     <div className="flex items-center gap-6">
        <button 
          onClick={onRefresh}
          className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-primary transition-all outline-none"
        >
          <Activity size={14} className="group-hover:rotate-180 transition-transform duration-700" />
          Force Refresh
        </button>
        <span className="text-[9px] font-mono uppercase tracking-[0.5em] text-muted-foreground">
          v6.1 Forensic Hub • Perimeter: {tenantId.substring(0, 8)}
        </span>
     </div>
  </footer>
));
CommsHubFooter.displayName = 'CommsHubFooter';

// ============================================================================
// APARATO PRINCIPAL: CommsHubManager (The Orchestrator)
// ============================================================================
export function CommsHubManager({ dictionary, className }: CommsHubManagerProps) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<CommsView>('notifications');
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncLatency, setSyncLatency] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);

  /**
   * PROTOCOLO HEIMDALL: Sincronización del Ledger
   */
  const fetchLedger = useCallback(async () => {
    if (!session?.tenantId) return;
    
    setIsLoading(true);
    const traceId = `hub_sync_${Date.now().toString(36).toUpperCase()}`;
    const startTime = performance.now();

    console.log(`${C.magenta}${C.bold}[DNA][COMMS]${C.reset} Synchronizing Ledger | Trace: ${C.cyan}${traceId}${C.reset}`);

    try {
      const response = await getCommsLedger(session.tenantId);
      const duration = (performance.now() - startTime).toFixed(4);

      if (response.success && response.data) {
        setTransmissions(response.data);
        setSyncLatency(duration);
        setErrorCount(0);
        console.log(`${C.green}   ✓ [GRANTED]${C.reset} Ledger ready. Nodes: ${response.data.length} | Latency: ${duration}ms`);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      setErrorCount(prev => prev + 1);
      console.error(`${C.red}   ✕ [BREACH]${C.reset} Ledger sync failed. Trace: ${traceId}`, error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.tenantId]);

  useEffect(() => { fetchLedger(); }, [fetchLedger]);

  /** MOTOR DE FILTRADO TÁCTICO */
  const filteredData = useMemo(() => {
    return transmissions.filter(t => {
      if (activeView === 'notifications') return t.category !== 'comms' && t.category !== 'infra';
      if (activeView === 'messages') return t.category === 'comms';
      return t.category === 'infra' || t.category === 'security';
    });
  }, [transmissions, activeView]);

  /** RESOLVER DE ESTILO (Oxygen Engine) */
  const getPriorityStyle = useCallback((p: SignalPriority): PriorityStyle => ({
    critical: { color: 'text-red-500', bg: 'bg-red-500/10', glow: 'bg-red-500', label: dictionary.label_priority_critical },
    high: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', glow: 'bg-yellow-500', label: dictionary.label_priority_high },
    low: { color: 'text-success', bg: 'bg-success/10', glow: 'bg-success', label: dictionary.label_priority_low }
  }[p]), [dictionary]);

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      
      <CommsHubHeader 
        dictionary={dictionary} 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isLoading={isLoading} 
        hasError={errorCount > 0} 
      />

      <section className="min-h-[450px]">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div key="skeleton" className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-28 w-full bg-surface/30 border border-border rounded-4xl animate-pulse" />)}
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
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-48 text-center space-y-4">
              <Terminal size={48} className="mx-auto text-muted-foreground/20" />
              <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-muted-foreground">{dictionary.empty_inbox}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <CommsHubFooter 
        syncLatency={syncLatency} 
        onRefresh={fetchLedger} 
        tenantId={session?.tenantId || 'ROOT_NODE'} 
      />
    </div>
  );
}
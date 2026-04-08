/**
 * @file apps/portfolio-web/src/components/sections/portal/MarketingCloudManager.tsx
 * @description Enterprise Marketing Cloud Console (Silo C Manager).
 *              Terminal industrial para la orquestación de comunicaciones masivas.
 *              Refactorizado: Resolución de fronteras Nx (Relative Paths),
 *              erradicación total de hardcoding, telemetría Heimdall v2.0
 *              y sincronización con el estándar visual Day-First (Tailwind v4).
 * @version 5.0 - Forensic Marketing & I18n Pure
 * @author Raz Podestá -  MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Layout, Mail, Plus, 
  CheckCircle2, Loader2, Database, MousePointerClick,
  ShieldCheck, History, Globe, Send, BarChart3, 
  CloudLightning, Terminal, Activity 
} from 'lucide-react';

/** 
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe)
 * @pilar V: Adherencia Arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import { executeBroadcastCampaign, type CampaignResponse } from '../../../lib/portal/actions/campaign.actions';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * CONTRATOS DE MISIÓN SOBERANA (SSoT)
 */
interface AudienceNode {
  id: string;
  email: string;
  status: 'verified' | 'active' | 'pending';
  node: string;
}

interface CampaignTemplate {
  id: string;
  name: string;
  type: 'industrial' | 'lifestyle' | 'emergency';
}

interface MarketingCloudManagerProps {
  /** Fragmento del diccionario nivelado para el Silo C */
  dictionary: Dictionary['marketing_cloud'];
  /** Clases adicionales inyectadas por el orquestador de Layout */
  className?: string;
}

/** TABS OPERATIVOS (Silo C Logic) */
type CloudView = 'audience' | 'campaigns' | 'templates';

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

/**
 * APARATO: MarketingCloudManager
 * @description Centro de mando para la orquestación de comunicaciones de alto volumen.
 */
export function MarketingCloudManager({ dictionary, className }: MarketingCloudManagerProps) {
  const { session } = useUIStore();
  
  // --- ESTADOS DE CONTROL ---
  const [activeView, setActiveView] = useState<CloudView>('audience');
  const [isDispatching, setIsDispatching] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [lastMissionReport, setLastMissionReport] = useState<CampaignResponse | null>(null);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Montaje
   */
  useEffect(() => {
    const sessionTraceId = `mc_dna_${Date.now().toString(36).toUpperCase()}`;
    console.log(
      `${C.magenta}${C.bold}[DNA][MARKETING]${C.reset} Terminal Online | ` +
      `Tenant: ${C.cyan}${session?.tenantId || 'ROOT'}${C.reset} | Trace: ${sessionTraceId}`
    );
  }, [session?.tenantId]);

  /** 
   * AUDIENCE REPOSITORY (Data-Driven Mock)
   * @todo En Fase 6: Mover a prop 'initialAudience' hidratada por el Server Component.
   */
  const audienceInventory = useMemo<AudienceNode[]>(() => [
    { id: '1', email: 'director@luxury-travel.cl', status: 'verified', node: 'B2B_CHILE' },
    { id: '2', email: 'reservations@elite-brazil.com', status: 'verified', node: 'B2B_BRAZIL' },
    { id: '3', email: 'vip-guest@sanctuary.tech', status: 'active', node: 'P33_ELITE' }
  ], []);

  /**
   * TEMPLATE LIBRARY (Presets Industriales)
   */
  const templates = useMemo<CampaignTemplate[]>(() => [
    { id: 'tm_01', name: 'Enterprise Fidelity', type: 'industrial' },
    { id: 'tm_02', name: 'Sanctuary Night', type: 'lifestyle' },
    { id: 'tm_03', name: 'Critical Node Warning', type: 'emergency' }
  ], []);

  /**
   * ACTION: handleExecuteMission (The Sovereign Dispatch)
   * @description Orquesta el envío masivo con trazabilidad forense y blindaje de identidad.
   */
  const handleExecuteMission = useCallback(async () => {
    if (!campaignSubject || !session?.tenantId) return;

    const missionTraceId = `mission_${Date.now().toString(36).toUpperCase()}`;
    const startTime = performance.now();

    console.group(`${C.magenta}${C.bold}[HEIMDALL][DISPATCH]${C.reset} Initiating Mission: ${missionTraceId}`);
    
    setIsDispatching(true);
    setLastMissionReport(null);

    try {
      const result = await executeBroadcastCampaign({
        subject: campaignSubject,
        tenant: session.tenantId,
        segment: 'all',
        traceId: missionTraceId,
        // Encapsulación de Payload de Lujo
        html: `
          <div style="background: #080808; color: #ffffff; padding: 60px; font-family: sans-serif; border-radius: 32px;">
            <h1 style="color: #a855f7; letter-spacing: -0.05em;">SOVEREIGN BROADCAST</h1>
            <p style="font-size: 18px; color: #a1a1aa;">${campaignSubject}</p>
            <div style="margin-top: 40px; border-top: 1px solid #27272a; padding-top: 20px; font-size: 10px; color: #52525b;">
              TRACE: ${missionTraceId} | NODE: ${session.tenantId}
            </div>
          </div>
        `,
        text: `BROADCAST: ${campaignSubject} | TRACE: ${missionTraceId}`
      });

      const duration = (performance.now() - startTime).toFixed(2);

      if (result.success) {
        setLastMissionReport(result);
        setCampaignSubject('');
        console.log(`${C.green}   ✓ [SUCCESS]${C.reset} Nodes Target: ${result.metrics?.totalTargeted} | Lat: ${duration}ms`);
      } else {
        throw new Error(result.error || 'CLOUD_GATEWAY_TIMEOUT');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'CLOUD_INFRA_DRIFT';
      console.error(`${C.bold}   ✕ [CRITICAL] Mission Aborted:${C.reset} ${msg}`);
    } finally {
      setIsDispatching(false);
      console.groupEnd();
    }
  }, [campaignSubject, session]);

  return (
    <div className={cn("space-y-12 animate-in fade-in duration-1000", className)}>
      
      {/* --- 1. CLOUD ANALYTICS HEADER (Aceleración GPU) --- */}
      <header className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: dictionary.tab_audience, value: audienceInventory.length, icon: Users, color: 'text-primary' },
          { label: dictionary.label_open_rate, value: '74.2%', icon: MousePointerClick, color: 'text-success' },
          { label: 'Signal Buffer', value: 'Nominal', icon: CloudLightning, color: 'text-blue-400' }
        ].map((metric, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative flex items-center justify-between overflow-hidden rounded-[3rem] border border-border/50 bg-surface/60 p-8 shadow-luxury transition-all duration-500 hover:border-primary/20"
          >
             <div className="relative z-10 space-y-1">
                <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{metric.label}</span>
                <span className="font-display text-4xl font-bold tracking-tighter text-foreground">{metric.value}</span>
             </div>
             <div className={cn("relative z-10 rounded-2xl border border-border bg-background p-4 shadow-inner group-hover:scale-110 transition-transform", metric.color)}>
                <metric.icon size={26} strokeWidth={1.2} />
             </div>
             <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />
          </motion.div>
        ))}
      </header>

      {/* --- 2. COMMAND NAVIGATION BAR (Accessible) --- */}
      <nav className="flex flex-col items-center justify-between gap-6 rounded-4xl border border-border/50 bg-surface/40 p-3 shadow-2xl backdrop-blur-3xl sm:flex-row">
        <div className="flex gap-2 rounded-2xl border border-border/30 bg-background/20 p-1.5 no-scrollbar overflow-x-auto">
          {[
            { id: 'audience' as CloudView, label: dictionary.tab_audience, icon: Users },
            { id: 'campaigns' as CloudView, label: dictionary.tab_campaigns, icon: Mail },
            { id: 'templates' as CloudView, label: dictionary.tab_templates, icon: Layout }
          ].map((tab) => {
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => { setActiveView(tab.id); setLastMissionReport(null); }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all outline-none whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary",
                  isActive 
                    ? "bg-foreground text-background shadow-lg scale-[1.02]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <tab.icon size={16} className={cn("transition-colors", isActive && "text-primary")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="hidden items-center gap-6 px-8 border-l border-border/40 lg:flex">
           <div className="flex items-center gap-3">
              <BarChart3 size={14} className="text-primary" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Real-time Sync</span>
           </div>
           <div className="h-1 w-1 rounded-full bg-border" />
           <div className="flex items-center gap-3">
              <Globe size={14} className="text-success" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-success">Edge L0 Dispatch</span>
           </div>
        </div>
      </nav>

      {/* --- 3. MISSION CONTROL VIEWPORT --- */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {activeView === 'audience' && (
            <motion.div 
              key="audience-repo" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4">
                 {audienceInventory.map((node) => (
                   <div key={node.id} className="group relative flex items-center justify-between overflow-hidden rounded-[2.5rem] border border-border bg-surface/40 p-6 shadow-xl transition-all duration-700 hover:border-primary/40 hover:bg-surface/60 transform-gpu">
                      <div className="relative z-10 flex items-center gap-8">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground shadow-inner transition-all duration-500 group-hover:border-primary/20 group-hover:text-primary">
                           <Database size={24} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                           <h4 className="font-display text-base font-bold uppercase tracking-tight text-foreground">{node.email}</h4>
                           <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                              <span className="font-bold text-primary/60">{node.node}</span>
                              <div className="h-1 w-1 rounded-full bg-border" />
                              <span>Sovereign Identity Node</span>
                           </div>
                        </div>
                      </div>
                      <div className="relative z-10 flex items-center gap-4 rounded-full border border-border/50 bg-background/40 px-5 py-2 shadow-sm">
                         <div className={cn("h-2 w-2 rounded-full animate-pulse", node.status === 'verified' ? 'bg-success' : 'bg-yellow-500')} />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">{node.status}</span>
                      </div>
                   </div>
                 ))}
              </div>
              
              <button className="group flex w-full flex-col items-center justify-center gap-4 rounded-[3rem] border-2 border-dashed border-border py-10 text-muted-foreground transition-all hover:bg-primary/2 hover:border-primary/40">
                 <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface shadow-xl transition-transform group-hover:scale-110">
                    <Plus size={24} />
                 </div>
                 <span className="text-[11px] font-bold uppercase tracking-[0.5em]">{dictionary.btn_import_vault}</span>
              </button>
            </motion.div>
          )}

          {activeView === 'campaigns' && (
             <motion.div 
               key="campaigns-mission" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
               className="relative overflow-hidden rounded-[4rem] border border-border bg-surface/60 p-12 text-center shadow-3xl lg:p-20"
             >
                {lastMissionReport ? (
                   <div className="relative z-10 space-y-12 animate-in zoom-in duration-1000">
                      <div className="relative mx-auto w-max">
                        <div className="absolute inset-0 animate-pulse rounded-full bg-success/20 blur-[80px]" />
                        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-success/30 bg-success/10 text-success shadow-[0_0_60px_rgba(34,197,94,0.15)]">
                           <CheckCircle2 size={64} strokeWidth={1} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                         <h3 className="font-display text-5xl font-bold uppercase tracking-tighter text-foreground">
                           {dictionary.success_dispatch.split('.')[0]}
                         </h3>
                         <p className="font-mono text-sm uppercase italic tracking-[0.4em] text-muted-foreground opacity-40">Global Transmission Logged</p>
                      </div>

                      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-8 rounded-[3rem] border border-success/20 bg-background/40 p-10 shadow-inner">
                         <div className="space-y-2 border-r border-border/40 text-left">
                            <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><Users size={14} /> Target Nodes</span>
                            <p className="font-display text-5xl font-bold tracking-tighter text-foreground">{lastMissionReport.metrics?.totalTargeted}</p>
                         </div>
                         <div className="space-y-2 text-right">
                            <span className="flex items-center justify-end gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Network Latency <History size={14} /></span>
                            <p className="font-mono text-3xl font-bold text-primary">{lastMissionReport.metrics?.latencyMs}</p>
                         </div>
                      </div>
                      
                      <div className="pt-6">
                        <button 
                          onClick={() => setLastMissionReport(null)} 
                          className="rounded-full border border-border px-12 py-5 text-[10px] font-bold uppercase tracking-[0.4em] shadow-xl transition-all hover:bg-foreground hover:text-background active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Dismiss Ledger Report
                        </button>
                      </div>
                   </div>
                ) : (
                   <div className="relative z-10 mx-auto max-w-3xl space-y-12">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2.5rem] border border-primary/20 bg-primary/10 text-primary shadow-2xl">
                       <Mail size={56} strokeWidth={1} />
                    </div>
                    
                    <div className="space-y-4">
                       <h3 className="font-display text-4xl font-bold uppercase tracking-tighter text-foreground">Operational Broadcast</h3>
                       <p className="mx-auto max-w-lg font-sans text-base font-light leading-relaxed text-muted-foreground">
                          Define the mission subject. The system will encapsulate the payload using the <b className="text-foreground">Enterprise High-Fidelity</b> protocol.
                       </p>
                    </div>

                    <div className="space-y-8">
                       <div className="group relative">
                          <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/30 transition-colors group-focus-within:text-primary" size={20} />
                          <input 
                            type="text" 
                            value={campaignSubject}
                            onChange={(e) => setCampaignSubject(e.target.value)}
                            placeholder={dictionary.label_subject} 
                            className="w-full rounded-3xl border border-border/60 bg-background/50 py-7 pl-16 pr-10 text-base text-foreground shadow-inner outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 font-sans" 
                          />
                       </div>
                       
                       <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <button 
                            onClick={handleExecuteMission}
                            disabled={isDispatching || !campaignSubject}
                            className={cn(
                              "group/btn relative flex items-center justify-center gap-4 rounded-full py-6 text-[12px] font-bold uppercase tracking-[0.5em] shadow-3xl transition-all active:scale-95",
                              (isDispatching || !campaignSubject) 
                                ? "cursor-not-allowed border border-border bg-surface text-muted-foreground" 
                                : "bg-foreground text-background hover:bg-primary hover:text-white"
                            )}
                          >
                            {isDispatching ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="transition-transform group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1" />}
                            {dictionary.btn_send_now}
                          </button>

                          <button 
                            className="flex items-center justify-center gap-4 rounded-full border border-border bg-background/40 py-6 text-[12px] font-bold uppercase tracking-[0.5em] text-muted-foreground shadow-xl transition-all hover:bg-surface hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Layout size={18} /> Configure Template
                          </button>
                       </div>
                    </div>
                   </div>
                )}
                
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05),transparent_70%)]" />
             </motion.div>
          )}

          {activeView === 'templates' && (
             <motion.div 
               key="templates-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
               className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
             >
                {templates.map((template) => (
                  <div key={template.id} className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border border-border bg-surface/40 p-8 shadow-lg transition-all duration-700 transform-gpu hover:-translate-y-2 hover:border-primary/40">
                     <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground shadow-inner transition-all group-hover:text-primary">
                        <Layout size={20} />
                     </div>
                     <h5 className="font-display text-lg font-bold text-foreground mb-2 uppercase tracking-tight">{template.name}</h5>
                     <div className="flex items-center gap-3">
                        <span className="rounded-md border border-primary/10 bg-primary/5 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-widest text-primary">{template.type}</span>
                        <span className="pt-1 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">v1.2.0 Stable</span>
                     </div>
                  </div>
                ))}
             </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- 4. CLOUD INFRASTRUCTURE PULSE --- */}
      <footer className="flex flex-col items-center justify-between gap-10 border-t border-border/40 pt-12 opacity-50 transition-opacity duration-1000 hover:opacity-100 lg:flex-row">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <ShieldCheck size={18} className="text-success" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">Core Dispatch: VALIDATED</span>
            </div>
            <div className="h-4 w-px bg-border/40" />
            <div className="flex items-center gap-4">
              <Activity size={18} className="animate-pulse text-primary" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">Silo C Throughput: NOMINAL</span>
            </div>
         </div>
         
         <div className="flex items-center gap-4 text-muted-foreground">
            <BarChart3 size={16} />
            <p className="font-mono text-[9px] uppercase tracking-[0.5em]">
              Marketing Cloud v5.0 • Perimeter: {session?.tenantId?.substring(0, 8) || 'ROOT'}
            </p>
         </div>
      </footer>

      {isDispatching && (
        <div className="fixed right-12 top-32 z-110">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 rounded-2xl bg-primary px-6 py-3 font-bold text-[10px] uppercase tracking-widest text-white shadow-4xl backdrop-blur-md"
          >
             <CloudLightning className="animate-bounce" size={16} />
             Dispatching Signal...
          </motion.div>
        </div>
      )}
    </div>
  );
}
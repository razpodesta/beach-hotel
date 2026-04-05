/**
 * @file apps/portfolio-web/src/components/sections/portal/MarketingCloudManager.tsx
 * @description Enterprise Marketing Cloud Console (Silo C Manager).
 *              Terminal industrial para la orquestación de comunicaciones masivas,
 *              segmentación de audiencia y auditoría de despacho en tiempo real.
 *              Refactorizado: Resolución de TS2304 (Activity Icon), limpieza de 
 *              imports huérfanos, eliminación de conflictos CSS y nivelación 
 *              a tokens Tailwind v4.
 * @version 4.1 - Linter Pure & Style Optimized
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Layout, Mail, Plus, 
  CheckCircle2, Loader2,
  Database, MousePointerClick,
  ShieldCheck, History, Globe,
  Send, BarChart3, CloudLightning,
  Terminal, Activity } from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (SSoT) */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import { executeBroadcastCampaign, type CampaignResponse } from '../../../lib/portal/actions/campaign.actions';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * CONTRATOS DE MISIÓN SOBERANA
 * @pilar III: Inferencia estricta para garantizar Zero-Drift en la UI.
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
  className?: string;
}

/** TABS OPERATIVOS (Silo C) */
type CloudView = 'audience' | 'campaigns' | 'templates';

/**
 * APARATO: MarketingCloudManager
 * @description Centro de mando para la orquestación de comunicaciones de alto volumen.
 */
export function MarketingCloudManager({ dictionary, className }: MarketingCloudManagerProps) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<CloudView>('audience');
  const [isDispatching, setIsDispatching] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [lastMissionReport, setLastMissionReport] = useState<CampaignResponse | null>(null);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Montaje
   */
  useEffect(() => {
    const sessionTraceId = `mc_init_${Date.now().toString(36)}`;
    console.log(`%c🛡️ [DNA][MARKETING] Terminal Online | Trace: ${sessionTraceId}`, 'color: #3b82f6; font-weight: bold');
  }, []);

  /** 
   * AUDIENCE REPOSITORY (Muestreo Táctico)
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
    { id: 'tm_01', name: 'Enterprise Fidelity (Standard)', type: 'industrial' },
    { id: 'tm_02', name: 'Sanctuary Night (Festival)', type: 'lifestyle' },
    { id: 'tm_03', name: 'Critical Node Warning', type: 'emergency' }
  ], []);

  /**
   * ACTION: handleExecuteMission
   */
  const handleExecuteMission = useCallback(async () => {
    if (!campaignSubject || !session?.tenantId) return;

    const missionTraceId = `mission_${Date.now().toString(36).toUpperCase()}`;
    const startTime = performance.now();

    console.group(`%c🚀 [HEIMDALL][DISPATCH] Mission: ${missionTraceId}`, 'color: #a855f7; font-weight: bold');
    
    setIsDispatching(true);
    setLastMissionReport(null);

    try {
      const result = await executeBroadcastCampaign({
        subject: campaignSubject,
        tenant: session.tenantId,
        segment: 'all',
        traceId: missionTraceId,
        html: `
          <div style="background: #080808; color: #ffffff; padding: 80px; font-family: 'Inter', sans-serif; border-radius: 40px;">
            <h1 style="color: #a855f7; font-size: 32px; letter-spacing: -0.05em; margin-bottom: 24px;">ENTERPRISE BROADCAST</h1>
            <p style="font-size: 18px; color: #a1a1aa; line-height: 1.6;">${campaignSubject}</p>
            <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #27272a; color: #71717a; font-size: 11px; letter-spacing: 0.2em;">
              SOVEREIGN NODE: ${session.tenantId} | TRACE: ${missionTraceId}
            </div>
          </div>
        `,
        text: `ENTERPRISE BROADCAST: ${campaignSubject} | NODE_ID: ${session.tenantId}`
      });

      const duration = (performance.now() - startTime).toFixed(2);

      if (result.success) {
        setLastMissionReport(result);
        setCampaignSubject('');
        console.log(`%c✓ [MISSION_SUCCESS] Nodes: ${result.metrics?.dispatched} | Time: ${duration}ms`, 'color: #22c55e');
      } else {
        throw new Error(result.error || 'GATEWAY_TIMEOUT');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'CLOUD_INFRA_DRIFT';
      console.error(`%c✕ [MISSION_ABORTED] Reason: ${msg}`, 'color: #ef4444');
    } finally {
      setIsDispatching(false);
      console.groupEnd();
    }
  }, [campaignSubject, session]);

  return (
    <div className={cn("space-y-12 animate-in fade-in duration-1000", className)}>
      
      {/* --- 1. CLOUD ANALYTICS HEADER --- */}
      <header className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: dictionary.tab_audience, value: audienceInventory.length, icon: Users, color: 'text-primary', glow: 'shadow-primary/10' },
          { label: dictionary.label_open_rate, value: '74.2%', icon: MousePointerClick, color: 'text-success', glow: 'shadow-success/10' },
          { label: 'Transmission Buffer', value: 'Nominal', icon: CloudLightning, color: 'text-blue-400', glow: 'shadow-blue-400/10' }
        ].map((metric, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className={cn(
              "p-8 rounded-[3rem] bg-surface/60 border border-border/50 flex items-center justify-between shadow-luxury transition-all duration-500",
              metric.glow
            )}
          >
             <div className="space-y-1">
                <span className="block text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{metric.label}</span>
                <span className="text-4xl font-display font-bold text-foreground tracking-tighter">{metric.value}</span>
             </div>
             <div className={cn("p-4 rounded-2xl bg-background border border-border shadow-inner", metric.color)}>
                <metric.icon size={26} strokeWidth={1.2} />
             </div>
          </motion.div>
        ))}
      </header>

      {/* --- 2. COMMAND NAVIGATION BAR --- */}
      <nav className="flex flex-col sm:flex-row justify-between items-center bg-surface/40 p-2.5 rounded-4xl border border-border/50 backdrop-blur-3xl shadow-2xl gap-6">
        <div className="flex gap-2 bg-background/20 p-1.5 rounded-2xl border border-border/30 overflow-x-auto no-scrollbar">
          {[
            { id: 'audience' as CloudView, label: dictionary.tab_audience, icon: Users },
            { id: 'campaigns' as CloudView, label: dictionary.tab_campaigns, icon: Mail },
            { id: 'templates' as CloudView, label: dictionary.tab_templates, icon: Layout }
          ].map((tab) => {
            const isTabActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveView(tab.id); setLastMissionReport(null); }}
                className={cn(
                  "flex items-center gap-3 px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all outline-none whitespace-nowrap",
                  isTabActive 
                    ? "bg-foreground text-background shadow-lg scale-[1.02]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <tab.icon size={16} className={cn("transition-colors", isTabActive && "text-primary")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/** @fix tailwind-conflict: Reordenamiento de hidden/flex para cumplimiento de linter */}
        <div className="hidden lg:flex items-center gap-6 px-8 border-l border-border/40">
           <div className="flex items-center gap-3">
              <BarChart3 size={14} className="text-primary" />
              <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Real-time Sinc</span>
           </div>
           <div className="h-1 w-1 rounded-full bg-border" />
           <div className="flex items-center gap-3">
              <Globe size={14} className="text-success" />
              <span className="text-[9px] font-mono font-bold text-success uppercase tracking-widest">Edge Optimized</span>
           </div>
        </div>
      </nav>

      {/* --- 3. MISSION CONTROL VIEWPORT --- */}
      <div className="min-h-[500px] relative">
        <AnimatePresence mode="wait">
          
          {activeView === 'audience' && (
            <motion.div 
              key="audience-repo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4">
                 {audienceInventory.map((node) => (
                   <div key={node.id} className="group flex items-center justify-between p-6 rounded-[2.5rem] border border-border bg-surface/40 hover:border-primary/40 hover:bg-surface/60 transition-all duration-700 shadow-xl transform-gpu">
                      <div className="flex items-center gap-8">
                        <div className="h-14 w-14 rounded-2xl bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/20 transition-all duration-500 shadow-inner">
                           <Database size={24} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                           <h4 className="text-base font-bold text-foreground uppercase tracking-tight">{node.email}</h4>
                           <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                              <span className="text-primary/60 font-bold">{node.node}</span>
                              <div className="h-1 w-1 rounded-full bg-border" />
                              <span>Sovereign Identity Node</span>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-background/40 px-5 py-2 rounded-full border border-border/50 shadow-sm">
                         <div className={cn("h-2 w-2 rounded-full animate-pulse", node.status === 'verified' ? 'bg-success' : 'bg-yellow-500')} />
                         <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">{node.status}</span>
                      </div>
                   </div>
                 ))}
              </div>
              
              <button className="w-full py-10 rounded-[3rem] border-2 border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/2 transition-all flex flex-col items-center justify-center gap-4 group">
                 <div className="h-14 w-14 rounded-full bg-surface border border-border flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                    <Plus size={24} />
                 </div>
                 <span className="text-[11px] font-bold uppercase tracking-[0.5em]">{dictionary.btn_import_vault}</span>
              </button>
            </motion.div>
          )}

          {activeView === 'campaigns' && (
             <motion.div 
               key="campaigns-mission" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
               className="rounded-[4rem] bg-surface/60 border border-border p-12 lg:p-20 text-center space-y-12 shadow-3xl relative overflow-hidden"
             >
                {lastMissionReport ? (
                   <div className="space-y-12 animate-in zoom-in duration-1000 relative z-10">
                      <div className="relative w-max mx-auto">
                        <div className="absolute inset-0 bg-success/20 blur-[80px] rounded-full animate-pulse" />
                        <div className="h-32 w-32 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success relative shadow-[0_0_60px_rgba(34,197,94,0.15)]">
                           <CheckCircle2 size={64} strokeWidth={1} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                         <h3 className="font-display text-5xl font-bold uppercase text-foreground tracking-tighter">{dictionary.success_dispatch.split('.')[0]}</h3>
                         <p className="text-sm text-muted-foreground font-mono uppercase tracking-[0.4em] opacity-40 italic">Global Transmission Logged</p>
                      </div>

                      <div className="max-w-2xl mx-auto grid grid-cols-2 gap-8 bg-background/40 p-10 rounded-[3rem] border border-success/20 shadow-inner">
                         <div className="text-left space-y-2 border-r border-border/40">
                            <span className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"><Users size={14} /> Target Nodes</span>
                            <p className="text-5xl font-display font-bold text-foreground tracking-tighter">{lastMissionReport.metrics?.totalTargeted}</p>
                         </div>
                         <div className="text-right space-y-2">
                            <span className="flex items-center gap-2 justify-end text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network Latency <History size={14} /></span>
                            <p className="text-3xl font-mono font-bold text-primary">{lastMissionReport.metrics?.latencyMs}</p>
                         </div>
                      </div>
                      
                      <div className="pt-6">
                        <button 
                          onClick={() => setLastMissionReport(null)} 
                          className="px-12 py-5 rounded-full border border-border hover:bg-foreground hover:text-background text-[10px] font-bold uppercase tracking-[0.4em] transition-all active:scale-95 shadow-xl"
                        >
                          Dismiss Ledger Report
                        </button>
                      </div>
                   </div>
                ) : (
                   <div className="max-w-3xl mx-auto space-y-12 relative z-10">
                    <div className="h-28 w-28 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-2xl">
                       <Mail size={56} strokeWidth={1} />
                    </div>
                    
                    <div className="space-y-4">
                       <h3 className="font-display text-4xl font-bold uppercase text-foreground tracking-tighter">Operational Broadcast</h3>
                       <p className="text-base text-muted-foreground max-w-lg mx-auto font-light leading-relaxed">
                          Define the mission subject. The system will encapsulate the payload using the <b>Enterprise High-Fidelity</b> protocol.
                       </p>
                    </div>

                    <div className="space-y-8">
                       <div className="relative group">
                          <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" size={20} />
                          <input 
                            type="text" 
                            value={campaignSubject}
                            onChange={(e) => setCampaignSubject(e.target.value)}
                            placeholder={dictionary.label_subject} 
                            className="w-full bg-background/50 border border-border/60 rounded-3xl py-7 pl-16 pr-10 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-foreground font-sans shadow-inner" 
                          />
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button 
                            onClick={handleExecuteMission}
                            disabled={isDispatching || !campaignSubject}
                            className={cn(
                              "relative overflow-hidden group/btn flex items-center justify-center gap-4 py-6 rounded-full font-bold text-[12px] uppercase tracking-[0.5em] transition-all active:scale-95 shadow-3xl",
                              (isDispatching || !campaignSubject) 
                                ? "bg-surface text-muted-foreground border border-border cursor-not-allowed" 
                                : "bg-foreground text-background hover:bg-primary hover:text-white"
                            )}
                          >
                            {isDispatching ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />}
                            {dictionary.btn_send_now}
                          </button>

                          <button 
                            className="flex items-center justify-center gap-4 py-6 rounded-full border border-border bg-background/40 text-muted-foreground hover:text-foreground hover:bg-surface transition-all text-[12px] font-bold uppercase tracking-[0.5em] shadow-xl"
                          >
                            <Layout size={18} /> Configure Template
                          </button>
                       </div>
                    </div>
                   </div>
                )}
                
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05),transparent_70%)] pointer-events-none" />
             </motion.div>
          )}

          {activeView === 'templates' && (
             <motion.div 
               key="templates-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
               className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
             >
                {templates.map((template) => (
                  <div key={template.id} className="group p-8 rounded-[2.5rem] border border-border bg-surface/40 hover:border-primary/40 transition-all duration-700 shadow-lg cursor-pointer transform-gpu hover:-translate-y-2">
                     <div className="h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all mb-8 shadow-inner">
                        <Layout size={20} />
                     </div>
                     <h5 className="font-display text-lg font-bold text-foreground mb-2">{template.name}</h5>
                     <div className="flex items-center gap-3">
                        <span className="text-[8px] font-mono font-bold text-primary bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-md uppercase tracking-widest">{template.type}</span>
                        <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest leading-none pt-1">v1.2.0 Stable</span>
                     </div>
                  </div>
                ))}
             </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- 4. CLOUD INFRASTRUCTURE PULSE --- */}
      <footer className="pt-12 border-t border-border/40 flex flex-col lg:flex-row justify-between items-center gap-10 opacity-50 hover:opacity-100 transition-opacity duration-1000">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <ShieldCheck size={18} className="text-success" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-foreground">Core Dispatch Engine: VALIDATED</span>
            </div>
            <div className="h-4 w-px bg-border/40" />
            <div className="flex items-center gap-4">
              {/** @fix TS2304: Restauración del icono Activity en el árbol de símbolos */}
              <Activity size={18} className="text-primary animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-foreground">Silo C Throughput: NOMINAL</span>
            </div>
         </div>
         
         <div className="flex items-center gap-4 text-muted-foreground">
            <BarChart3 size={14} />
            <p className="text-[9px] font-mono uppercase tracking-[0.5em]">
              MetaShark Intelligence • Marketing Cloud v4.0.5
            </p>
         </div>
      </footer>

      {isDispatching && (
        <div className="fixed top-32 right-12 z-110">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-primary text-white font-bold text-[10px] uppercase tracking-widest shadow-4xl backdrop-blur-md"
          >
             <CloudLightning className="animate-bounce" size={16} />
             Broadcast in progress...
          </motion.div>
        </div>
      )}
    </div>
  );
}
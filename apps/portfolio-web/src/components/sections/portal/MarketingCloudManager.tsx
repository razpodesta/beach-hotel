/**
 * @file apps/portfolio-web/src/components/sections/portal/MarketingCloudManager.tsx
 * @description Enterprise Marketing Cloud Console (Silo C Manager).
 *              Terminal industrial para la gestión de audiencias y ejecución
 *              de campañas masivas. Implementa sincronización con el 
 *              Campaign Orchestration Engine y telemetría de despacho real.
 * @version 3.0 - Enterprise Level 4.0 | Linter Pure & Zero-Any
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Layout, Mail, Plus, 
  CheckCircle2, Loader2,
  Database, MousePointerClick,
  ShieldCheck, Zap, History, Globe
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (SSoT) */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import { executeBroadcastCampaign, type CampaignResponse } from '../../../lib/portal/actions/campaign.actions';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

interface MarketingCloudManagerProps {
  /** Fragmento del diccionario nivelado para el Silo C */
  dictionary: Dictionary['marketing_cloud'];
  className?: string;
}

/** TABS OPERATIVOS (Silo C) */
type CloudView = 'audience' | 'campaigns' | 'templates';

/**
 * MODULE: MarketingCloudManager
 * @description Centro de mando para la orquestación de comunicaciones industriales.
 */
export function MarketingCloudManager({ dictionary, className }: MarketingCloudManagerProps) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<CloudView>('audience');
  const [isDispatching, setIsDispatching] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState('');
  
  // Estado para el Reporte de Misión pos-despacho
  const [lastMissionReport, setLastMissionReport] = useState<CampaignResponse | null>(null);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Enlace
   */
  useEffect(() => {
    console.log(`[CORE][CLOUD] Terminal linked. Node: ${session?.email} | Status: NOMINAL`);
  }, [session]);

  /** 
   * AUDIENCE REPOSITORY (Muestreo Táctico)
   * En Fase 4.5 se conectará vía SWR al CRM Core.
   */
  const audienceInventory = useMemo(() => [
    { id: '1', email: 'director@luxury-travel.cl', status: 'verified', node: 'B2B_CHILE' },
    { id: '2', email: 'reservations@elite-brazil.com', status: 'verified', node: 'B2B_BRAZIL' },
    { id: '3', email: 'vip-guest@sanctuary.tech', status: 'active', node: 'P33_ELITE' }
  ], []);

  /**
   * ACTION: handleExecuteMission
   * @description Dispara el pipeline de despacho masivo real.
   * @pilar IV: Observabilidad - Trazabilidad de latencia y alcance.
   */
  const handleExecuteMission = useCallback(async () => {
    if (!campaignSubject || !session?.tenantId) return;

    const traceId = `dispatch_mission_${Date.now()}`;
    console.group(`[SYSTEM][DISPATCH] Mission Initiated: ${traceId}`);
    
    setIsDispatching(true);
    setLastMissionReport(null);

    try {
      /** 
       * EJECUCIÓN SOBERANA (Server Action)
       * Inyectamos el template industrial de MetaShark.
       */
      const result = await executeBroadcastCampaign({
        subject: campaignSubject,
        tenant: session.tenantId,
        segment: 'all',
        html: `
          <div style="background: #080808; color: #ffffff; padding: 60px; font-family: sans-serif;">
            <h1 style="color: #a855f7; letter-spacing: -0.05em;">ENTERPRISE UPDATE</h1>
            <p style="font-size: 18px; color: #a1a1aa;">${campaignSubject}</p>
            <hr style="border: 0; border-top: 1px solid #27272a; margin: 40px 0;" />
            <p style="font-size: 12px; color: #71717a;">Transmission ID: ${traceId}</p>
          </div>
        `,
        text: `ENTERPRISE UPDATE: ${campaignSubject} | Trace: ${traceId}`
      });

      if (result.success) {
        setLastMissionReport(result);
        setCampaignSubject('');
        console.log(`[SUCCESS] Mission result: ${result.metrics?.dispatched} nodes reached.`);
      } else {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      // @fix ESLint: Erradicación de 'any'. Inferencia estricta de Error.
      const msg = err instanceof Error ? err.message : 'UNEXPECTED_MISSION_DRIFT';
      console.error(`[CRITICAL] Mission Aborted: ${msg}`);
    } finally {
      setIsDispatching(false);
      console.groupEnd();
    }
  }, [campaignSubject, session]);

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      
      {/* --- 1. CLOUD ANALYTICS HEADER --- */}
      <header className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: dictionary.tab_audience, value: audienceInventory.length, icon: Users, color: 'text-primary' },
          { label: dictionary.label_open_rate, value: '72.4%', icon: MousePointerClick, color: 'text-success' },
          { label: 'Cloud Buffer', value: 'Verified', icon: Globe, color: 'text-blue-400' }
        ].map((metric, i) => (
          <div key={i} className="p-8 rounded-4xl bg-surface/60 border border-border flex items-center justify-between shadow-luxury transition-all hover:bg-surface/80">
             <div className="space-y-1">
                <span className="block text-[8px] font-mono text-muted-foreground uppercase tracking-widest">{metric.label}</span>
                <span className="text-3xl font-display font-bold text-foreground tracking-tighter">{metric.value}</span>
             </div>
             <div className={cn("p-4 rounded-2xl bg-background border border-border", metric.color)}>
                <metric.icon size={22} strokeWidth={1.5} />
             </div>
          </div>
        ))}
      </header>

      {/* --- 2. TACTICAL COMMAND BAR --- */}
      <nav className="flex justify-between items-center bg-surface/30 p-2 rounded-3xl border border-border/50 backdrop-blur-xl">
        <div className="flex gap-2">
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
                  "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all outline-none",
                  isTabActive ? "bg-foreground text-background shadow-lg scale-105" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* --- 3. MISSION CONTROL VIEWPORT --- */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          {activeView === 'audience' && (
            <motion.div 
              key="audience-repo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4">
                 {audienceInventory.map((node) => (
                   <div key={node.id} className="group flex items-center justify-between p-6 rounded-4xl border border-border bg-surface/40 hover:border-primary/40 transition-all duration-500">
                      <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all">
                           <Database size={20} />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">{node.email}</h4>
                           <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{node.node} • Verified Node</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_var(--color-success)]" />
                         <span className="text-[9px] font-bold text-success uppercase tracking-widest">{node.status}</span>
                      </div>
                   </div>
                 ))}
              </div>
              
              <button className="w-full py-6 rounded-4xl border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em]">
                 <Plus size={16} /> {dictionary.btn_import_vault}
              </button>
            </motion.div>
          )}

          {activeView === 'campaigns' && (
             <motion.div 
               key="campaigns-mission" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
               className="rounded-4xl bg-surface/60 border border-border p-12 text-center space-y-10"
             >
                {lastMissionReport ? (
                   /* MISSION REPORT UI (MEA/UX Success State) */
                   <div className="space-y-10 animate-in zoom-in duration-700">
                      <div className="h-24 w-24 rounded-full bg-success/20 flex items-center justify-center text-success mx-auto shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                         <CheckCircle2 size={48} />
                      </div>
                      <div className="space-y-3">
                         <h3 className="font-display text-3xl font-bold uppercase text-foreground">{dictionary.success_dispatch.split('.')[0]}</h3>
                         <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest opacity-60">Trace: {lastMissionReport.campaignId}</p>
                      </div>
                      <div className="max-w-md mx-auto grid grid-cols-2 gap-6 bg-background/40 p-8 rounded-4xl border border-success/20">
                         <div className="text-left space-y-1">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Nodes Targeted</span>
                            <p className="text-2xl font-display font-bold text-foreground">{lastMissionReport.metrics?.totalTargeted}</p>
                         </div>
                         <div className="text-right space-y-1">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Mission Latency</span>
                            <p className="text-xl font-mono font-bold text-primary">{lastMissionReport.metrics?.latencyMs}</p>
                         </div>
                      </div>
                      <button onClick={() => setLastMissionReport(null)} className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5em] hover:text-foreground transition-colors">
                        DISMISS REPORT
                      </button>
                   </div>
                ) : (
                   /* PRE-DISPATCH CONSOLE */
                   <>
                    <div className="h-24 w-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary mx-auto">
                       <Mail size={48} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-4">
                       <h3 className="font-display text-2xl font-bold uppercase text-foreground">Operational Broadcast</h3>
                       <p className="text-sm text-muted-foreground max-w-sm mx-auto font-light">Input the protocol subject. The transmission will use the default Enterprise High-Fidelity template.</p>
                    </div>
                    <div className="max-w-md mx-auto space-y-6">
                       <div className="relative">
                          <History className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={18} />
                          <input 
                            type="text" 
                            value={campaignSubject}
                            onChange={(e) => setCampaignSubject(e.target.value)}
                            placeholder={dictionary.label_subject} 
                            className="w-full bg-background/50 border border-border rounded-2xl py-5 pl-14 pr-8 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-foreground font-sans" 
                          />
                       </div>
                       <button 
                         onClick={handleExecuteMission}
                         disabled={isDispatching || !campaignSubject}
                         className={cn(
                           "w-full flex items-center justify-center gap-5 py-6 rounded-full font-bold text-[12px] uppercase tracking-[0.4em] transition-all shadow-3xl active:scale-95",
                           (isDispatching || !campaignSubject) ? "bg-surface text-muted-foreground border border-border" : "bg-foreground text-background hover:bg-primary hover:text-white"
                         )}
                       >
                         {isDispatching ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-current" />}
                         {dictionary.btn_send_now}
                       </button>
                    </div>
                   </>
                )}
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- 4. CLOUD INFRASTRUCTURE FOOTER --- */}
      <footer className="pt-10 border-t border-border/40 flex justify-between items-center opacity-40">
         <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className="text-success" />
            Core Delivery Engine: VERIFIED
         </div>
         <p className="text-[9px] font-mono uppercase tracking-[0.3em]">
            MetaShark Cloud Intelligence • Release v4.0
         </p>
      </footer>
    </div>
  );
}
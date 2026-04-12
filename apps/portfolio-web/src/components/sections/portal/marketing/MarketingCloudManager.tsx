/**
 * @file apps/portfolio-web/src/components/sections/portal/marketing/MarketingCloudManager.tsx
 * @description Orquestador de la Nube de Marketing (Silo C).
 *              Refactorizado: Resolución de TS2552 (Missing Radio Import),
 *              saneamiento de dependencias y sellado de tipos SSoT.
 *              Estándar: Oxygen UI v4 & Heimdall v2.5.
 * @version 6.2 - Dependency Graph Sealed & Linter Pure
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Mail, 
  Layout, 
  BarChart3, 
  Globe, 
  ShieldCheck,
  Radio 
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../../lib/utils/cn';
import { useUIStore } from '../../../../lib/store/ui.store';
import { executeBroadcastCampaign } from '../../../../lib/portal/actions/campaign.actions';
import type { CampaignResponse } from '../../../../lib/portal/actions/campaign.actions';
import type { Dictionary } from '../../../../lib/schemas/dictionary.schema';

/** SUB-APARATOS ATOMIZADOS (Responsabilidad Única) */
import { CloudMetrics } from './CloudMetrics';
import { AudienceInventory } from './AudienceInventory';
import { CampaignDispatcher } from './CampaignDispatcher';
import { TemplateLibrary } from './TemplateLibrary';

/** 
 * TIPOS DE VISTA OPERATIVA 
 * audience: Gestión de nodos de identidad.
 * campaigns: Consola de despacho de misiones.
 * templates: Biblioteca de presets industriales.
 */
type CloudView = 'audience' | 'campaigns' | 'templates';

// --- PROTOCOLO CROMÁTICO HEIMDALL v2.5 ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * APARATO: MarketingCloudManager
 * @description Centro de mando para la orquestación de comunicaciones de alto volumen.
 */
export function MarketingCloudManager({ 
  dictionary, 
  className 
}: { 
  dictionary: Dictionary['marketing_cloud'], 
  className?: string 
}) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<CloudView>('audience');
  const [isDispatching, setIsDispatching] = useState(false);
  const [lastMissionReport, setLastMissionReport] = useState<CampaignResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  /**
   * PROTOCOLO HEIMDALL: Handshake de Terminal
   * @pilar IV: Trazabilidad DNA-Level de la sesión operativa.
   */
  useEffect(() => {
    const traceId = `mc_hsk_${Date.now().toString(36).toUpperCase()}`;
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `${C.magenta}${C.bold}[DNA][MARKETING]${C.reset} Terminal Online | ` +
        `Perimeter: ${C.cyan}${session?.tenantId || 'ROOT'}${C.reset} | Trace: ${traceId}`
      );
    }
  }, [session?.tenantId]);

  /**
   * ACTION: handleExecuteMission
   * @description Puente entre la UI y la Server Action de despacho masivo.
   */
  const handleExecuteMission = useCallback(async (subject: string) => {
    if (!session?.tenantId) return;

    const missionTraceId = `mission_${Date.now().toString(36).toUpperCase()}`;
    setIsDispatching(true);
    setLastMissionReport(null);

    try {
      const result = await executeBroadcastCampaign({
        subject,
        tenant: session.tenantId,
        segment: 'all',
        traceId: missionTraceId,
        html: `<div style="background:#080808;color:#fff;padding:40px;border-radius:24px;"><h1>BROADCAST</h1><p>${subject}</p></div>`,
        text: `BROADCAST: ${subject}`
      });

      if (result.success) {
        setLastMissionReport(result);
        console.log(`${C.green}   ✓ [MISSION_SUCCESS]${C.reset} Trace: ${missionTraceId}`);
      } else {
        throw new Error(result.error || 'MISSION_FAILED');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'SIGNAL_DISPATCH_DRIFT';
      console.error(`${C.red}   ✕ [MISSION_ABORTED]${C.reset} ${msg}`);
    } finally {
      setIsDispatching(false);
    }
  }, [session]);

  /**
   * HANDLER: switchView
   * @description Gestión de transición de estado concurrente.
   */
  const switchView = useCallback((view: CloudView) => {
    startTransition(() => {
      setActiveView(view);
      setLastMissionReport(null);
    });
  }, []);

  if (!dictionary) return null;

  return (
    <div className={cn("space-y-12 animate-in fade-in duration-1000", className)}>
      
      {/* 1. ANALÍTICAS (Silo C KPIs) */}
      <CloudMetrics dictionary={dictionary} />

      {/* 2. NAVEGACIÓN DE COMANDO (Oxygen UI) */}
      <nav className="flex flex-col items-center justify-between gap-6 rounded-4xl border border-border/50 bg-surface/40 p-3 shadow-2xl backdrop-blur-3xl sm:flex-row">
        <div className="flex gap-2 rounded-2xl border border-border/30 bg-background/20 p-1.5 overflow-x-auto no-scrollbar">
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
                onClick={() => switchView(tab.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all outline-none transform-gpu",
                  isActive 
                    ? "bg-foreground text-background shadow-lg scale-[1.02]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <tab.icon size={16} className={cn(isActive && "text-primary")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="hidden items-center gap-6 px-8 border-l border-border/40 lg:flex">
           <div className="flex items-center gap-3">
              <BarChart3 size={14} className="text-primary" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Live Analysis</span>
           </div>
           <div className="h-1 w-1 rounded-full bg-border" />
           <div className="flex items-center gap-3">
              <Globe size={14} className="text-success" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-success">L0 Active</span>
           </div>
        </div>
      </nav>

      {/* 3. MISSION CONTROL VIEWPORT (Concurrent Visualization) */}
      <div className={cn(
        "relative min-h-[500px] transition-all duration-500", 
        isPending && "opacity-40 grayscale blur-xs"
      )}>
        <AnimatePresence mode="wait">
          {activeView === 'audience' && (
            <AudienceInventory key="audience" dictionary={dictionary} />
          )}
          {activeView === 'campaigns' && (
            <CampaignDispatcher 
              key="campaigns" 
              dictionary={dictionary} 
              onDispatch={handleExecuteMission}
              isDispatching={isDispatching}
              report={lastMissionReport}
            />
          )}
          {activeView === 'templates' && (
            <TemplateLibrary key="templates" />
          )}
        </AnimatePresence>
      </div>

      {/* 4. TELEMETRY FOOTER (Forensic Feedback) */}
      <footer className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center opacity-40 hover:opacity-100 transition-opacity gap-6">
         <div className="flex items-center gap-4">
            <ShieldCheck size={16} className="text-success" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-foreground">
              Sovereign Marketing Node v6.2 • DISPATCH_SEALED
            </span>
         </div>
         <div className="flex items-center gap-3">
            {/* @fix: Radio icon correctly imported from lucide-react */}
            <Radio size={14} className="text-primary animate-pulse" />
            <p className="font-mono text-[9px] uppercase tracking-[0.5em]">
              Perimeter: {session?.tenantId?.substring(0, 8) || 'MASTER'}
            </p>
         </div>
      </footer>
    </div>
  );
}
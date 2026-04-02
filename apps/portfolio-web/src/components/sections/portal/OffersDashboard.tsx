/**
 * @file apps/portfolio-web/src/components/sections/portal/OffersDashboard.tsx
 * @description Enterprise Revenue Orchestrator (Silo A Manager).
 *              Terminal industrial para la gestión de ofertas flash y acuerdos B2B.
 *              Refactorizado: Agregación de métricas de inventario en riesgo, 
 *              telemetría de valor "On-Air" y optimización MEA/UX.
 * @version 4.0 - Enterprise Revenue Intelligence
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Package, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  Timer, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../lib/utils/cn';
import { FlashAssetCard } from './media/FlashAssetCard';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface RevenueAsset
 * @description Contrato inmutable para activos financieros de hospitalidad.
 */
export interface RevenueAsset {
  id: string;
  title: string;
  basePrice: number;
  discount: number;
  stock: number;
  capacity: number;
  expiresAt: string;
  type: 'flash' | 'enterprise';
  vibe: 'day' | 'night';
}

/** TABS OPERATIVOS DEL SILO A */
type RevenueView = 'flash' | 'enterprise';

interface OffersDashboardProps {
  /** Diccionario maestro validado por Master SSoT */
  dictionary: Dictionary;
  className?: string;
}

/**
 * MODULE: OffersDashboard
 * @description Centro de mando para la optimización de ingresos y yield management.
 */
export function OffersDashboard({ dictionary, className }: OffersDashboardProps) {
  const [activeView, setActiveView] = useState<RevenueView>('flash');
  const t = dictionary.offers_flash;

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Ingresos
   */
  useEffect(() => {
    console.log(`[HEIMDALL][REVENUE] Silo A Terminal Synchronized. Mode: ${activeView.toUpperCase()}`);
  }, [activeView]);

  /** 
   * INVENTARIO DE ACTIVOS (Mock Industrial)
   * En Fase 5.0 se conectará a la Bóveda de Ofertas vía Server Action.
   */
  const assets = useMemo<RevenueAsset[]>(() => [
    { 
      id: 'OFF-01', title: 'Madrugada Explosiva - Suite Master', 
      basePrice: 1200, discount: 45, stock: 3, capacity: 10, 
      expiresAt: '2026-04-01T04:00:00Z', type: 'flash', vibe: 'night' 
    },
    { 
      id: 'OFF-02', title: 'Última Hora - Confort Standard', 
      basePrice: 650, discount: 20, stock: 2, capacity: 5, 
      expiresAt: '2026-04-02T12:00:00Z', type: 'flash', vibe: 'day' 
    },
    { 
      id: 'B2B-01', title: 'Pack Corporativo - MICE 2026', 
      basePrice: 15400, discount: 15, stock: 8, capacity: 20, 
      expiresAt: '2026-06-10T00:00:00Z', type: 'enterprise', vibe: 'day' 
    }
  ], []);

  /**
   * INTELIGENCIA DE REVENUE: Agregados de Clúster
   */
  const metrics = useMemo(() => {
    const activeAssets = assets.filter(a => a.type === activeView);
    const totalPotential = activeAssets.reduce((acc, curr) => acc + (curr.basePrice * (1 - curr.discount / 100)) * curr.stock, 0);
    const criticalStock = activeAssets.filter(a => a.stock <= 3).length;

    return {
      onAirValue: totalPotential,
      criticalNodes: criticalStock,
      totalCount: activeAssets.length
    };
  }, [assets, activeView]);

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      
      {/* --- 1. REVENUE TELEMETRY STRIP --- */}
      <header className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-4xl bg-surface/60 border border-border shadow-luxury group hover:border-primary/20 transition-all">
           <div className="flex items-center justify-between mb-2">
             <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">On-Air Value</span>
             <TrendingUp size={14} className="text-success" />
           </div>
           <p className="text-3xl font-display font-bold text-foreground tracking-tighter">
             R$ {metrics.onAirValue.toLocaleString()}
           </p>
        </div>
        
        <div className="p-8 rounded-4xl bg-surface/60 border border-border shadow-luxury">
           <div className="flex items-center justify-between mb-2">
             <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Inventory Pressure</span>
             <Timer size={14} className={cn(metrics.criticalNodes > 0 ? "text-red-500 animate-pulse" : "text-primary")} />
           </div>
           <p className={cn("text-3xl font-display font-bold tracking-tighter", metrics.criticalNodes > 0 ? "text-red-500" : "text-foreground")}>
             {metrics.criticalNodes} <span className="text-sm font-sans text-muted-foreground uppercase">Nodes at risk</span>
           </p>
        </div>

        <div className="p-8 rounded-4xl bg-primary/5 border border-primary/20 shadow-luxury flex items-center justify-between">
           <div className="space-y-1">
             <span className="block text-[8px] font-mono text-primary uppercase tracking-widest">Active Channels</span>
             <p className="text-3xl font-display font-bold text-primary tracking-tighter">{metrics.totalCount}</p>
           </div>
           <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <BarChart3 size={24} />
           </div>
        </div>
      </header>

      {/* --- 2. MODALITY CONTROL BAR --- */}
      <nav className="flex flex-col md:flex-row gap-6 items-center justify-between bg-surface/30 p-2 rounded-3xl border border-border/50 backdrop-blur-xl">
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveView('flash')} 
             className={cn(
               "flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all outline-none",
               activeView === 'flash' ? "bg-foreground text-background shadow-lg scale-105" : "text-muted-foreground hover:text-foreground"
             )}
            >
              <Zap size={14} className={cn(activeView === 'flash' && "fill-current")} /> {t.title}
           </button>
           <button 
             onClick={() => setActiveView('enterprise')} 
             className={cn(
               "flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all outline-none",
               activeView === 'enterprise' ? "bg-foreground text-background shadow-lg scale-105" : "text-muted-foreground hover:text-foreground"
             )}
            >
              <Package size={14} /> B2B/Wholesale
           </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 px-6 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest border-l border-border/50">
           <ShieldCheck size={14} className="text-success" />
           {t.status_active}
        </div>
      </nav>

      {/* --- 3. REVENUE ASSETS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px]">
        <AnimatePresence mode="popLayout">
            {assets.filter(a => a.type === activeView).map(asset => (
                <FlashAssetCard key={asset.id} asset={asset} labels={t} />
            ))}
            
            {/* ACTION CARD: NUEVA ESTRATEGIA */}
            <motion.button 
              layout
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-6 rounded-[3.5rem] border-2 border-dashed border-border text-muted-foreground min-h-80 transition-all hover:border-primary/40 hover:bg-primary/2 group"
            >
                <div className="h-16 w-16 rounded-full bg-surface border border-border flex items-center justify-center group-hover:scale-110 group-hover:text-primary transition-all shadow-xl">
                   <Plus size={32} strokeWidth={1.5} />
                </div>
                <div className="text-center space-y-2">
                   <span className="block text-[11px] font-bold uppercase tracking-[0.5em] group-hover:text-foreground transition-colors">
                      {activeView === 'flash' ? 'Deploy Flash' : 'Initialize B2B'}
                   </span>
                   <p className="text-[10px] font-mono italic opacity-40">Add new tactical node to Silo A</p>
                </div>
            </motion.button>
        </AnimatePresence>
      </div>

      {/* --- 4. SYSTEM STATUS FOOTER --- */}
      <footer className="pt-8 border-t border-border/40 flex justify-between items-center opacity-40">
          <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Revenue Engine: NOMINAL
          </div>
          <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors">
            View Analytics <ArrowRight size={14} />
          </button>
      </footer>
    </div>
  );
}
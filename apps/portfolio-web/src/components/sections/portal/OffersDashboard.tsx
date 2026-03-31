/**
 * @file apps/portfolio-web/src/components/sections/portal/OffersDashboard.tsx
 * @description Enterprise Revenue Dashboard (Silo A Manager).
 *              Terminal de gestión de ingresos que orquesta la visualización
 *              de ofertas relámpago, paquetes corporativos B2B y telemetría
 *              de inventario.
 * @version 1.1 - Hotfix: DOM tree reconciliation & Lint Clean
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Package, TrendingUp, AlertCircle, 
  BarChart3, ShieldCheck, ArrowUpRight, Timer 
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/** TIPOS DE VISTA (Silo A) */
type RevenueView = 'flash' | 'enterprise' | 'analytics';

/** INTERFAZ DE OFERTA */
interface RevenueAsset {
  id: string;
  title: string;
  basePrice: number;
  discount: number;
  stock: number;
  capacity: number;
  expiresAt: string;
  type: 'flash' | 'b2b';
}

interface OffersDashboardProps {
  dictionary: Dictionary;
  className?: string;
}

export function OffersDashboard({ dictionary, className }: OffersDashboardProps) {
  const { session } = useUIStore();
  const [activeView, setActiveView] = useState<RevenueView>('flash');

  const t = dictionary.offers_flash;
  const p = dictionary.portal;

  useEffect(() => {
    console.log(`[REVENUE][ENGINE] Analytics link established for Node: ${session?.tenantId}`);
  }, [session]);

  const assets: RevenueAsset[] = useMemo(() => [
    { 
      id: 'OFF-01', title: 'Madrugada Explosiva - Suite Master', 
      basePrice: 1200, discount: 45, stock: 3, capacity: 10, 
      expiresAt: '2026-04-01T04:00:00Z', type: 'flash' 
    },
    { 
      id: 'OFF-02', title: 'Pack Corporativo - Pride Week', 
      basePrice: 8500, discount: 15, stock: 12, capacity: 50, 
      expiresAt: '2026-06-10T00:00:00Z', type: 'b2b' 
    }
  ], []);

  const FlashAssetCard = ({ asset }: { asset: RevenueAsset }) => {
    const stockPercent = (asset.stock / asset.capacity) * 100;
    const isCritical = asset.stock <= 3;
    const netPrice = asset.basePrice * (1 - asset.discount / 100);

    return (
      <motion.div 
        layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="group relative overflow-hidden rounded-4xl border border-border bg-surface/40 p-8 hover:border-primary/40 transition-all duration-500 shadow-xl"
      >
        <div className={cn(
          "absolute -top-24 -right-24 h-48 w-48 blur-[80px] rounded-full transition-opacity",
          isCritical ? "bg-red-500/10 opacity-100" : "bg-primary/5 opacity-0 group-hover:opacity-100"
        )} />

        <header className="relative z-10 flex justify-between items-start mb-8">
           <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest">
                 <Zap size={10} className="fill-current" /> {t.badge_limited}
              </span>
              <h4 className="font-display text-lg font-bold text-foreground leading-tight">{asset.title}</h4>
           </div>
           <div className="text-right">
              <span className="block text-[8px] font-mono text-muted-foreground uppercase">{p.nav_b2b_rates.split(' ')[0]}</span>
              <span className="text-xl font-display font-bold text-foreground">R$ {netPrice.toLocaleString()}</span>
           </div>
        </header>

        <div className="relative z-10 space-y-6">
           <div className="space-y-3">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                 <span className="text-muted-foreground">{t.label_stock_available}: {asset.stock}</span>
                 <span className={cn(isCritical ? "text-red-500 animate-pulse" : "text-primary")}>
                   {Math.round(stockPercent)}% LEFT
                 </span>
              </div>
              <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} animate={{ width: `${stockPercent}%` }} 
                   className={cn("h-full transition-colors", isCritical ? "bg-red-500" : "bg-primary")} 
                 />
              </div>
           </div>

           <div className="flex items-center justify-between pt-6 border-t border-border/40">
              <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground uppercase">
                 <Timer size={14} className="text-primary" />
                 <span>{t.label_expires_in}: 04:22:15</span>
              </div>
              <button className="p-3 rounded-xl bg-background border border-border hover:bg-foreground hover:text-background transition-all active:scale-90">
                 <ArrowUpRight size={18} />
              </button>
           </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      <header className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Pipeline Value', value: 'R$ 142.5k', icon: TrendingUp, color: 'text-success' },
          { label: 'Yield Conversion', value: '14.2%', icon: BarChart3, color: 'text-primary' },
          { label: 'Inventory Pressure', value: 'HIGH', icon: AlertCircle, color: 'text-yellow-500' }
        ].map((metric, i) => (
          <div key={i} className="p-8 rounded-4xl bg-surface/60 border border-border flex items-center justify-between shadow-luxury">
             <div className="space-y-2">
                <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">{metric.label}</span>
                <span className="text-3xl font-display font-bold text-foreground tracking-tighter">{metric.value}</span>
             </div>
             <div className={cn("h-14 w-14 rounded-2xl bg-background border border-border flex items-center justify-center", metric.color)}>
                <metric.icon size={24} strokeWidth={1.5} />
             </div>
          </div>
        ))}
      </header>

      <nav className="flex items-center justify-between bg-surface/30 p-2 rounded-3xl border border-border/50 backdrop-blur-xl">
        <div className="flex gap-2">
          {[
            { id: 'flash' as RevenueView, label: t.title, icon: Zap },
            { id: 'enterprise' as RevenueView, label: 'B2B/Wholesale', icon: Package },
            { id: 'analytics' as RevenueView, label: 'Yield Management', icon: BarChart3 }
          ].map((tab) => {
            const isTabActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
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

      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeView === 'flash' && (
             <motion.div 
               key="flash-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
               className="grid grid-cols-1 md:grid-cols-2 gap-8"
             >
                {assets.filter(a => a.type === 'flash').map(asset => (
                  <FlashAssetCard key={asset.id} asset={asset} />
                ))}
                
                <button className="flex flex-col items-center justify-center gap-4 rounded-4xl border-2 border-dashed border-border bg-surface/20 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all duration-700 min-h-[280px]">
                   <div className="p-4 rounded-full bg-background border border-border">
                      <PlusIcon size={32} strokeWidth={1} />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Initialize Flash Campaign</span>
                </button>
             </motion.div>
          )}

          {activeView === 'analytics' && (
            <motion.div 
              key="yield-simulator" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-4xl bg-surface/60 border border-border p-12 text-center"
            >
               <div className="max-w-md mx-auto space-y-8">
                  <div className="h-20 w-20 rounded-3xl bg-success/10 flex items-center justify-center text-success mx-auto">
                     <TrendingUp size={40} />
                  </div>
                  <div className="space-y-4">
                     <h3 className="font-display text-2xl font-bold uppercase text-foreground">Yield Simulator v4.0</h3>
                     <p className="text-sm text-muted-foreground font-light leading-relaxed">
                        Calculate the economic impact of dynamic commissions and last-minute inventory release.
                     </p>
                  </div>
                  <div className="p-8 rounded-3xl bg-background/40 border border-border/50 text-left space-y-6">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Base Rate Yield</span>
                        <span className="text-lg font-bold text-foreground">R$ 442.00</span>
                     </div>
                     <div className="flex justify-between items-center text-primary">
                        <span className="text-[10px] font-bold uppercase tracking-widest">B2B Margin (10%)</span>
                        <span className="text-lg font-bold">- R$ 44.20</span>
                     </div>
                     <div className="pt-6 border-t border-border/40 flex justify-between items-center">
                        <span className="text-[11px] font-bold text-foreground uppercase tracking-widest">Expected Net Revenue</span>
                        <span className="text-2xl font-display font-bold text-success">R$ 397.80</span>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="pt-10 border-t border-border/40 flex justify-between items-center opacity-40">
         <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className="text-success" />
            Revenue Cluster: SYNCHRONIZED
         </div>
         <p className="text-[9px] font-mono uppercase tracking-[0.3em]">
            MetaShark Financial Intelligence • Core v4.0
         </p>
      </footer>
    </div>
  );
}

const PlusIcon = ({ size, strokeWidth }: { size: number, strokeWidth: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
/**
 * @file FlashAssetCard.tsx
 * @description Unidad atómica de visualización de activos de Revenue.
 *              Refactorizado: Tipado estricto (SSoT), resolución de rutas,
 *              y eliminación de 'any' para cumplimiento de estándares.
 * @version 2.0 - Type-Safe & Build-Ready
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Timer, ArrowUpRight } from 'lucide-react';
import { cn } from '../../../../lib/utils/cn';

// Importación corregida basada en la estructura del monorepo
import { calculateStockHealth, calculateNetPrice } from '../../../../lib/portal/revenue.engine';
import type { RevenueAsset } from '../OffersDashboard';

interface FlashAssetCardProps {
  asset: RevenueAsset;
  labels: { badge_limited: string; label_stock_available: string; label_expires_in: string };
}

export const FlashAssetCard = memo(({ asset, labels }: FlashAssetCardProps) => {
  const { percent, isCritical } = calculateStockHealth(asset.stock, asset.capacity);
  const netPrice = calculateNetPrice(asset.basePrice, asset.discount);

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="group relative overflow-hidden rounded-4xl border border-border bg-surface/40 p-8 hover:border-primary/40 transition-all duration-500 shadow-xl"
    >
        <div className={cn(
          "absolute -top-24 -right-24 h-48 w-48 blur-[80px] rounded-full transition-opacity",
          isCritical ? "bg-red-500/10 opacity-100" : "bg-primary/5 opacity-0 group-hover:opacity-100"
        )} />

        <header className="relative z-10 flex justify-between items-start mb-8">
           <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest">
                 <Zap size={10} className="fill-current" /> {labels.badge_limited}
              </span>
              <h4 className="font-display text-lg font-bold text-foreground leading-tight">{asset.title}</h4>
           </div>
           <div className="text-right">
              <span className="block text-[8px] font-mono text-muted-foreground uppercase">Net Rate</span>
              <span className="text-xl font-display font-bold text-foreground">R$ {netPrice.toLocaleString()}</span>
           </div>
        </header>

        <div className="relative z-10 space-y-6">
           <div className="space-y-3">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                 <span className="text-muted-foreground">{labels.label_stock_available}: {asset.stock}</span>
                 <span className={cn(isCritical ? "text-red-500 animate-pulse" : "text-primary")}>{Math.round(percent)}% LEFT</span>
              </div>
              <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: `${percent}%` }} 
                   className={cn("h-full transition-colors", isCritical ? "bg-red-500" : "bg-primary")} 
                 />
              </div>
           </div>

           <div className="flex items-center justify-between pt-6 border-t border-border/40">
              <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground uppercase">
                 <Timer size={14} className="text-primary" /> <span>{labels.label_expires_in}</span>
              </div>
              <button className="p-3 rounded-xl bg-background border border-border hover:bg-foreground hover:text-background transition-all active:scale-90">
                 <ArrowUpRight size={18} />
              </button>
           </div>
        </div>
    </motion.div>
  );
});

FlashAssetCard.displayName = 'FlashAssetCard';
/**
 * @file apps/portfolio-web/src/components/sections/portal/OffersDashboard.tsx
 * @description Enterprise Revenue Dashboard (Silo A Manager).
 *              Refactorizado: Purga de importaciones muertas, tipado estricto
 *              de activos y normalización de estado para compilación limpia.
 * @version 1.2 - Linter Pure & Type Safe
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Zap, Package,  Plus } from 'lucide-react';
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import { FlashAssetCard } from './media/FlashAssetCard';

/**
 * @interface RevenueAsset
 * @description Contrato inmutable para activos financieros.
 */
export interface RevenueAsset {
  id: string;
  title: string;
  basePrice: number;
  discount: number;
  stock: number;
  capacity: number;
  expiresAt: string;
  type: 'flash' | 'b2b';
}

type RevenueView = 'flash' | 'enterprise' | 'analytics';

export function OffersDashboard({ dictionary, className }: { dictionary: Dictionary, className?: string }) {
  const [activeView, setActiveView] = useState<RevenueView>('flash');
  const t = dictionary.offers_flash;

  // Tipado explícito para evitar el error 'never[]'
  const assets = useMemo<RevenueAsset[]>(() => [
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

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-1000", className)}>
      <nav className="flex items-center justify-between bg-surface/30 p-2 rounded-3xl border border-border/50 backdrop-blur-xl">
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveView('flash')} 
             className={cn(
               "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
               activeView === 'flash' ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:text-foreground"
             )}
            >
              <Zap size={14} /> {t.title}
           </button>
           <button 
             onClick={() => setActiveView('enterprise')} 
             className={cn(
               "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
               activeView === 'enterprise' ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:text-foreground"
             )}
            >
              <Package size={14} /> B2B/Wholesale
           </button>
        </div>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="wait">
            {assets.filter(a => a.type === activeView).map(asset => (
                <FlashAssetCard key={asset.id} asset={asset} labels={t} />
            ))}
            {activeView === 'flash' && (
                <button className="flex flex-col items-center justify-center gap-4 rounded-4xl border-2 border-dashed border-border text-muted-foreground min-h-[280px] hover:border-primary/40 transition-all">
                    <Plus size={32} strokeWidth={1} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Nueva Campaña</span>
                </button>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
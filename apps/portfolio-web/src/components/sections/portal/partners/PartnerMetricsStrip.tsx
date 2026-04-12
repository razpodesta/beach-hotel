/**
 * @file PartnerMetricsStrip.tsx
 * @description Capa de visualización de KPIs para la red de agencias.
 * @version 1.0 - Pure Analytic Display
 */

import React, { memo } from 'react';
import { TrendingUp, Target, Users } from 'lucide-react';
import { cn } from '../../../../lib/utils/cn';

interface MetricsProps {
  totalYield: number;
  avgYield: number;
  count: number;
  isPending: boolean;
  labels: { label_bookings: string; label_conversion: string; label_commissions: string; };
}

export const PartnerMetricsStrip = memo(({ totalYield, avgYield, count, isPending, labels }: MetricsProps) => (
  <header className={cn(
    "grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 transform-gpu",
    isPending ? "opacity-40 blur-sm scale-[0.99]" : "opacity-100 blur-0"
  )}>
    {/* KPI: TOTAL YIELD */}
    <div className="p-8 rounded-[3rem] bg-surface/60 border border-border/50 flex items-center justify-between shadow-luxury group hover:border-success/30 transition-all duration-500">
       <div className="space-y-1">
         <span className="block text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{labels.label_bookings}</span>
         <p className="text-4xl font-display font-bold text-foreground tracking-tighter">R$ {totalYield.toLocaleString()}</p>
       </div>
       <div className="p-4 rounded-2xl bg-background border border-border shadow-inner text-success group-hover:scale-110 transition-transform">
          <TrendingUp size={26} strokeWidth={1.2} />
       </div>
    </div>
    
    {/* KPI: AVG NODE VALUE */}
    <div className="p-8 rounded-[3rem] bg-surface/60 border border-border/50 flex items-center justify-between shadow-luxury group hover:border-primary/30 transition-all duration-500">
       <div className="space-y-1">
         <span className="block text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{labels.label_conversion}</span>
         <p className="text-4xl font-display font-bold text-foreground tracking-tighter">R$ {avgYield.toLocaleString()}</p>
       </div>
       <div className="p-4 rounded-2xl bg-background border border-border shadow-inner text-primary group-hover:rotate-12 transition-transform">
          <Target size={26} strokeWidth={1.2} />
       </div>
    </div>

    {/* KPI: ACTIVE NODES */}
    <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/20 flex items-center justify-between shadow-2xl transition-all hover:bg-primary/10 group">
       <div className="space-y-1">
         <span className="block text-[9px] font-mono font-bold text-primary uppercase tracking-widest mb-1">Authenticated</span>
         <p className="text-4xl font-display font-bold text-primary tracking-tighter">{count}</p>
       </div>
       <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
          <Users size={30} strokeWidth={1.2} />
       </div>
    </div>
  </header>
));

PartnerMetricsStrip.displayName = 'PartnerMetricsStrip';
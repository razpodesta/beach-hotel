/**
 * @file apps/portfolio-web/src/components/sections/portal/marketing/CloudMetrics.tsx
 * @description Capa de visualización de KPIs para el Silo C (Marketing Cloud).
 *              Refactorizado: Erradicación de 'any', sellado de tipos SSoT y
 *              preparación para hidratación dinámica de métricas.
 *              Estándar: Oxygen UI v4 & Linter Pure.
 * @version 2.0 - Type Safe & SSoT Synchronized
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Users, MousePointerClick, CloudLightning, type LucideIcon } from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../../lib/utils/cn';
import type { MarketingCloudDictionary } from '../../../../lib/schemas/marketing/cloud.schema';

/**
 * @interface MetricItem
 * @description Contrato interno para la definición de nodos métricos.
 */
interface MetricItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

/**
 * @interface CloudMetricsProps
 * @pilar III: Props explícitas y fuertemente tipadas.
 */
interface CloudMetricsProps {
  /** Fragmento del diccionario validado por el esquema de Marketing Cloud */
  dictionary: MarketingCloudDictionary;
  className?: string;
}

/**
 * APARATO: CloudMetrics
 * @description Renderiza el clúster de analíticas de la nube de marketing con aceleración GPU.
 * @pilar X: Performance - Envuelto en memo para mitigar re-renders en el dashboard.
 */
export const CloudMetrics = memo(({ dictionary, className }: CloudMetricsProps) => {
  
  /**
   * MATRIZ DE MÉTRICAS (MACS Mapping)
   * @description Mapea las etiquetas del diccionario hacia la visualización táctica.
   */
  const metrics: MetricItem[] = [
    { 
      label: dictionary.tab_audience, 
      value: '1,284', 
      icon: Users, 
      color: 'text-primary' 
    },
    { 
      label: dictionary.label_open_rate, 
      value: '74.2%', 
      icon: MousePointerClick, 
      color: 'text-success' 
    },
    { 
      label: 'Signal Buffer', // Label técnica de infraestructura
      value: 'Nominal', 
      icon: CloudLightning, 
      color: 'text-blue-400' 
    }
  ];

  return (
    <header className={cn("grid grid-cols-1 md:grid-cols-3 gap-8", className)}>
      {metrics.map((metric, i) => (
        <motion.div 
          key={metric.label} 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: i * 0.1, 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className={cn(
            "group relative flex items-center justify-between overflow-hidden rounded-[3rem] border",
            "border-border/50 bg-surface/60 p-8 shadow-luxury transition-all duration-500",
            "hover:border-primary/20 transform-gpu"
          )}
        >
           {/* 1. DATA LAYER (Text Content) */}
           <div className="relative z-10 space-y-1">
              <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                {metric.label}
              </span>
              <span className="font-display text-4xl font-bold tracking-tighter text-foreground transition-colors group-hover:text-primary">
                {metric.value}
              </span>
           </div>

           {/* 2. VISUAL LAYER (Iconography) */}
           <div className={cn(
             "relative z-10 rounded-2xl border border-border bg-background p-4 shadow-inner",
             "group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500",
             metric.color
           )}>
              <metric.icon size={26} strokeWidth={1.2} />
           </div>

           {/* 3. ATMOSPHERE LAYER (Luxury Glow) */}
           <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none" />
        </motion.div>
      ))}
    </header>
  );
});

CloudMetrics.displayName = 'CloudMetrics';
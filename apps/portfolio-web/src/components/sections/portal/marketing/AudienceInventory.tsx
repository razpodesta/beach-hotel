/**
 * @file apps/portfolio-web/src/components/sections/portal/marketing/AudienceInventory.tsx
 * @description Gestión de nodos de identidad y visualización de inventario de audiencia (Silo C).
 *              Refactorizado: Erradicación de 'any', sellado de contratos SSoT y
 *              normalización de identidad para el motor de Marketing Cloud.
 *              Estándar: Oxygen UI v4 & Linter Pure.
 * @version 2.0 - Type Safe & Identity Normalized
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Database, Plus, ShieldCheck, Fingerprint } from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../../lib/utils/cn';
import type { MarketingCloudDictionary } from '../../../../lib/schemas/marketing/cloud.schema';

/**
 * @interface LocalAudienceNode
 * @description Estructura de datos para un nodo de identidad en el inventario.
 */
interface LocalAudienceNode {
  id: string;
  email: string;
  node: string;
}

/**
 * @interface AudienceInventoryProps
 * @pilar III: Props explícitas y fuertemente tipadas.
 */
interface AudienceInventoryProps {
  /** Fragmento del diccionario validado por el esquema de Marketing Cloud */
  dictionary: MarketingCloudDictionary;
  className?: string;
}

/**
 * APARATO: AudienceInventory
 * @description Renderiza el listado de identidades capturadas por el pipeline.
 * @pilar X: Performance - Procesamiento inmutable mediante memo.
 */
export const AudienceInventory = memo(({ dictionary, className }: AudienceInventoryProps) => {
  
  /** 
   * AUDIENCE REPOSITORY (Data-Driven Mock)
   * @todo Fase 6: Mover a props inyectadas por el orquestador principal.
   */
  const audience: LocalAudienceNode[] = [
    { id: '1', email: 'director@luxury-travel.cl', node: 'B2B_CHILE' },
    { id: '2', email: 'reservations@elite-br.com', node: 'B2B_BRAZIL' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      className={cn("space-y-6", className)}
    >
      {/* 1. GRID DE NODOS DE IDENTIDAD (Forensic Grid) */}
      <div className="grid grid-cols-1 gap-4">
        {audience.map((node) => (
          <div 
            key={node.id} 
            className={cn(
              "group relative flex items-center justify-between overflow-hidden rounded-[2.5rem] border",
              "border-border bg-surface/40 p-6 shadow-xl transition-all duration-700",
              "hover:border-primary/40 hover:bg-surface/60 transform-gpu"
            )}
          >
            <div className="relative z-10 flex items-center gap-8">
              {/* Icono de Base de Datos con Acento */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground shadow-inner transition-all duration-500 group-hover:border-primary/20 group-hover:text-primary">
                <Database size={24} strokeWidth={1.5} />
              </div>
              
              <div className="space-y-1">
                <h4 className="font-display text-base font-bold uppercase tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {node.email}
                </h4>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                   <Fingerprint size={12} className="opacity-30" />
                   <span>{node.node}</span>
                   <span className="opacity-20">•</span>
                   <span className="font-bold text-success/70">SOVEREIGN NODE</span>
                </div>
              </div>
            </div>

            {/* Sello de Verificación (Pilar XII) */}
            <div className="relative z-10 flex items-center gap-3 rounded-full border border-success/20 bg-success/5 px-4 py-1.5 backdrop-blur-sm">
               <ShieldCheck size={14} className="text-success animate-pulse" />
               <span className="text-[9px] font-bold uppercase tracking-widest text-success">Verified</span>
            </div>

            {/* Efecto de fondo (Oxygen Engine) */}
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          </div>
        ))}
      </div>
      
      {/* 2. DISPARADOR DE INGESTA (Action Node) */}
      <button 
        className={cn(
          "group relative flex w-full flex-col items-center justify-center gap-5 rounded-[3rem] border-2 border-dashed",
          "border-border py-12 text-muted-foreground transition-all duration-700",
          "hover:bg-primary/5 hover:border-primary/40 hover:text-foreground active:scale-[0.99] transform-gpu shadow-inner"
        )}
        aria-label={dictionary.btn_import_vault}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:text-primary group-hover:border-primary/30 group-hover:rotate-12">
          <Plus size={28} strokeWidth={1.5} />
        </div>
        
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.5em]">
            {dictionary.btn_import_vault}
          </span>
          <p className="text-[9px] font-mono uppercase tracking-widest opacity-40">
            Silo C Pipeline Connection
          </p>
        </div>

        {/* Glow de interacción sutil */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      </button>
    </motion.div>
  );
});

AudienceInventory.displayName = 'AudienceInventory';
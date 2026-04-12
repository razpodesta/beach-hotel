/**
 * @file apps/portfolio-web/src/components/sections/suites/SuiteCard.tsx
 * @description Unidad atómica de exhibición de activos habitacionales (Suites).
 *              Responsabilidad: Renderizado de ficha técnica de suite con 
 *              inteligencia visual MEA/UX y profundidad física.
 *              Refactorizado: Integración del "Sovereign Asset Bridge" para 
 *              resolución de imágenes desde la Bóveda S3 de Supabase.
 * 
 * @version 2.0 - S3 Asset Bridge & Forensic Telemetry Injected
 * @author Raz Podestá - MetaShark Tech
 * 
 * @pilar III: Seguridad de Tipos - Contratos de SuiteEntry sellados por SSoT.
 * @pilar IV: Observabilidad - Logs Heimdall para trazabilidad de carga de activos.
 * @pilar IX: Desacoplamiento - Normaliza URLs de Supabase vs Sistema de archivos local.
 * @pilar XII: MEA/UX - Transiciones físicas fluidas con aceleración por GPU.
 */

'use client';

import React, { memo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, BedDouble, ArrowRight } from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { cn } from '../../../lib/utils/cn';
import type { SuiteEntry } from '../../../lib/schemas/suite_gallery.schema';

/**
 * @interface SuiteCardProps
 * @description Contrato de propiedades para la unidad de gestión de habitación.
 */
interface SuiteCardProps {
  /** Entidad de suite validada por el esquema SSoT */
  suite: SuiteEntry;
  /** Etiqueta localized "Desde" */
  labelFrom: string;
  /** Sufijo de tipo de unidad (ej: "Suite Boutique") */
  labelSuffix: string;
  className?: string;
}

/**
 * APARATO: SuiteCard
 * @description Renderiza una tarjeta de suite con inercia física y branding dinámico.
 *              Fase de Embudo: Deseo & Conversión (Revenue Silo).
 */
export const SuiteCard = memo(({ 
  suite, 
  labelFrom, 
  labelSuffix, 
  className 
}: SuiteCardProps) => {

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Impresión
   * @description Registra la presencia del activo en el viewport del huésped.
   */
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[HEIMDALL][ASSET] Suite Node Rendered: ${suite.id} | Category: ${suite.category}`);
    }
  }, [suite.id, suite.category]);

  /**
   * @function getAssetUrl
   * @description Puente de activos (Sovereign Bridge). Detecta y normaliza 
   *              rutas locales vs URLs absolutas de la Bóveda S3.
   * @pilar IX: Desacoplamiento de almacenamiento de infraestructura.
   */
  const getAssetUrl = useCallback((path: string) => {
    if (!path) return '';
    
    // Caso 1: La URL ya es absoluta (Inyectada desde Supabase S3)
    if (path.startsWith('http')) return path;
    
    // Caso 2: Ruta relativa detectada (Fallback o Local Asset)
    // Resolvemos contra el bucket de Supabase configurado en el entorno.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    if (supabaseUrl && !path.startsWith('/')) {
        return `${supabaseUrl}/storage/v1/object/public/sanctuary-vault/${path}`;
    }
    
    // Caso 3: Fallback a sistema de archivos local (/public/images/...)
    return path.startsWith('/') ? path : `/${path}`;
  }, []);

  const finalImageUrl = getAssetUrl(suite.imageUrl);

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[3.5rem] border",
        "bg-surface/40 backdrop-blur-xl border-border transition-all duration-1000",
        "hover:border-primary/40 hover:-translate-y-2 hover:shadow-luxury transform-gpu",
        className
      )}
    >
      {/* 1. VISUAL REPOSITORY LAYER (LCP Awareness) */}
      <div className="relative h-85 w-full overflow-hidden bg-background">
          <Image 
            src={finalImageUrl} 
            alt={suite.name} 
            fill 
            className="object-cover transition-transform duration-3000 group-hover:scale-110 brightness-100 [data-theme='dark']:brightness-90"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 500px"
            loading="lazy"
          />
          
          {/* Atmosphere Overlay (Alpha Channel Sync) */}
          <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/20 to-transparent opacity-90 transition-opacity duration-1000 group-hover:opacity-70" />
          
          {/* BADGE DE CATEGORÍA SOBERANA */}
          <div className="absolute top-8 left-8 z-20">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-background/60 backdrop-blur-2xl border border-border/40 px-5 py-2 text-[9px] font-bold uppercase tracking-[0.25em] text-primary shadow-2xl transition-all group-hover:bg-primary group-hover:text-white">
              <Sparkles size={12} className="animate-pulse" />
              {suite.category}
            </span>
          </div>
      </div>

      {/* 2. INFORMATION ARCHITECTURE LAYER (Editorial Design) */}
      <div className="p-10 md:p-14 relative z-10 flex flex-col grow">
          <header className="flex justify-between items-start mb-8 gap-6">
              <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tighter group-hover:text-primary transition-colors duration-500 leading-none">
                {suite.name}
              </h3>
              <div className="text-right shrink-0">
                <span className="block text-[8px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5 font-bold opacity-60">
                   {labelFrom}
                </span>
                <span className="text-2xl md:text-3xl font-display font-bold text-foreground bg-primary/5 border border-primary/10 px-5 py-2 rounded-2xl block shadow-inner transition-colors group-hover:bg-primary/10 group-hover:border-primary/30">
                   {suite.price}
                </span>
              </div>
          </header>
          
          <p className="text-muted-foreground text-sm md:text-base font-sans font-light leading-relaxed mb-12 italic line-clamp-3 transition-colors group-hover:text-foreground/80">
             {suite.description}
          </p>
          
          {/* 3. ACTION BAR (Conversion Hub) */}
          <footer className="mt-auto flex items-center justify-between border-t border-border/40 pt-10">
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground/60 transition-all group-hover:text-foreground">
                  <BedDouble size={20} className="text-primary opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  <span>{suite.category} {labelSuffix}</span>
              </div>
              
              <div className="h-14 w-14 rounded-2xl border border-border bg-background flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-xl active:scale-90 transform-gpu">
                 <ArrowRight size={26} className="transition-transform group-hover:translate-x-1" />
              </div>
          </footer>
      </div>

      {/* ACABADO DE LUJO: Reflejo Especular (MEA/UX) */}
      <div className="absolute inset-0 border border-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 rounded-[3.5rem] shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]" />
    </motion.article>
  );
});

SuiteCard.displayName = 'SuiteCard';
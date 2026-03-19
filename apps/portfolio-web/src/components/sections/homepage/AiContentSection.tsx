/**
 * @file apps/portfolio-web/src/components/sections/homepage/AiContentSection.tsx
 * @description Orquestador inmersivo para la exhibición de activos generados por IA (Visual Synth).
 *              Refactorizado: Cumplimiento del Manifiesto MACS v1.0 con acceso aplanado.
 *              Implementa integración de motor WebGL 2.0 y resiliencia de datos.
 * @version 9.0 - Flattened Schema Sync & Resilience
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica mediante fronteras Nx.
 */
import { BlurText } from '../../razBits/BlurText';
import { OrbitalGallery, type OrbitalGalleryItem } from '../../razBits/OrbitalGallery';
import { aiGalleryData, type AiGalleryAsset } from '../../../data/ai-gallery';
import { ColorWaveBar } from '../../ui/ColorWaveBar';
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface AiContentSectionProps
 * @description Contrato inmutable para la sección de síntesis visual.
 */
interface AiContentSectionProps {
  /** 
   * @pilar III: Seguridad de Tipos. 
   * Consume directamente la llave aplanada del esquema maestro.
   */
  dictionary: Dictionary['ai_gallery_section'];
}

/**
 * APARATO: AiContentSection
 * @description Realiza la síntesis entre datos técnicos e internacionalización dinámica.
 */
export function AiContentSection({ dictionary }: AiContentSectionProps) {
  
  /**
   * MAPEO DE ACTIVOS WEBGL SOBERANO
   * @pilar VI: i18n Nativa y Resiliencia.
   * Transforma el inventario de IA en elementos para el motor Orbital.
   */
  const galleryItems: OrbitalGalleryItem[] = useMemo(() => {
    // @pilar VIII: Guardia ante datos de diccionario nulos o corruptos
    if (!dictionary?.items) return [];

    return aiGalleryData.map((asset: AiGalleryAsset) => {
      const translation = dictionary.items[asset.id];
      
      return {
        image: asset.image,
        /** Fallback determinista si falta una traducción específica */
        title: translation?.title || `${dictionary.item_prefix} ${asset.id}`,
        description: translation?.description || dictionary.item_prefix,
      };
    });
  }, [dictionary]);

  /**
   * CONFIGURACIÓN DE ETIQUETAS DEL MOTOR GRÁFICO
   */
  const engineLabels = useMemo(() => ({
    drag_label: dictionary?.drag_label || 'Orbit',
    item_prefix: dictionary?.item_prefix || 'Asset',
    error_fallback: dictionary?.error_fallback || 'Graphics engine error'
  }), [dictionary]);

  // Guardia de seguridad para el Build (Prevención de renderizado de fragmentos nulos)
  if (!dictionary) return null;

  return (
    <section
      id="ai-visual-synth"
      className="relative w-full overflow-hidden bg-[#050505] py-24 sm:py-32"
      aria-label={dictionary.title}
    >
      {/* CAPA ATMOSFÉRICA DE PROFUNDIDAD */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.04),transparent_70%)] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
        {/* CABECERA NARRATIVA IA */}
        <div className="mb-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-purple-500/20 bg-purple-500/5 px-6 py-2 text-[10px] font-bold uppercase tracking-[0.4em] text-purple-400 backdrop-blur-xl"
          >
            <BrainCircuit size={14} className="animate-pulse" />
            <span>{dictionary.badge}</span>
          </motion.div>

          <BlurText
            text={dictionary.title.toUpperCase()}
            className="font-display text-5xl md:text-8xl font-bold tracking-tighter text-white justify-center mb-10"
            delay={50}
            animateBy="letters"
          />

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-lg md:text-2xl text-zinc-500 font-sans leading-relaxed font-light"
          >
            {dictionary.subtitle}
          </motion.p>
        </div>

        {/* CONTENEDOR WEBGL (Sovereign Engine) */}
        <div className="relative mx-auto w-full max-w-5xl">
           <div className="absolute -inset-10 rounded-[5rem] bg-purple-500/5 blur-[120px] pointer-events-none" />
           <div className={cn(
             "relative h-[600px] overflow-hidden rounded-[3rem] border border-white/5 bg-zinc-950/50 shadow-3xl backdrop-blur-sm",
             "transition-all duration-700 hover:border-purple-500/20"
           )}>
             {/* Integración del motor orbital */}
             <OrbitalGallery items={galleryItems} dictionary={engineLabels} />
             
             {/* INDICADOR DE TELEMETRÍA EN VIVO */}
             <div className="absolute top-8 left-8 flex items-center gap-3 rounded-full bg-black/60 border border-white/10 px-5 py-2.5 text-[9px] font-mono font-bold tracking-widest text-zinc-300 backdrop-blur-xl pointer-events-none z-20">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse" />
                {dictionary.overlay_indicator}
             </div>
           </div>
        </div>

        {/* FOOTER DE SECCIÓN: Proceso Técnico */}
        <div className="mt-24 flex flex-col items-center justify-center gap-10 text-center sm:flex-row">
           <motion.div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
              <Sparkles size={14} className="text-purple-500" />
              <span>{dictionary.footer_prompt}</span>
           </motion.div>
           <div className="hidden h-1 w-1 rounded-full bg-zinc-800 sm:block" />
           <motion.div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
              <Sparkles size={14} className="text-pink-500" />
              <span>{dictionary.footer_upscaling}</span>
           </motion.div>
        </div>
      </div>
      
      {/* SELLO CROMÁTICO DE MARCA (Hospitality Variant) */}
      <ColorWaveBar position="bottom" variant="hotel" className="h-0.5 opacity-40" />
    </section>
  );
}
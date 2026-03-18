/**
 * @file AiContentSection.tsx
 * @description Orquestador inmersivo para la exhibición de activos IA.
 *              Nivelado: Eliminada regresión TS2339 y mapeo soberano de tipos.
 * @version 7.2 - Sovereign Hierarchy & Build Resilience
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit } from 'lucide-react';

import { BlurText } from '../../razBits/BlurText';
import { OrbitalGallery, type OrbitalGalleryItem } from '../../razBits/OrbitalGallery';
import { aiGalleryData } from '../../../data/ai-gallery';
import { ColorWaveBar } from '../../ui/ColorWaveBar';
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

interface AiContentSectionProps {
  /** 
   * @pilar III: Seguridad de Tipos. 
   * Mapeo directo a la llave raíz del nuevo Dictionary Maestro.
   */
  dictionary: Dictionary['ai_gallery_section'];
}

export function AiContentSection({ dictionary }: AiContentSectionProps) {
  
  useEffect(() => {
    if (!dictionary) {
      console.error('[HEIMDALL][CRITICAL] AiContentSection: Sovereign Dictionary missing.');
    }
  }, [dictionary]);

  /**
   * MAPEO DE ACTIVOS WEBGL
   * Sincroniza el inventario estático con las traducciones del JSON soberano.
   */
  const galleryItems: OrbitalGalleryItem[] = useMemo(() => {
    if (!dictionary?.items) return [];

    return aiGalleryData.map((asset) => {
      const translation = dictionary.items[asset.id];
      return {
        image: asset.image,
        title: translation?.title || `Asset ${asset.id}`,
        description: translation?.description || dictionary.item_prefix,
      };
    });
  }, [dictionary]);

  const engineLabels = useMemo(() => ({
    drag_label: dictionary?.drag_label || 'Orbit',
    item_prefix: dictionary?.item_prefix || 'Asset',
    error_fallback: dictionary?.error_fallback || 'Graphics error'
  }), [dictionary]);

  // @pilar VIII: Resiliencia de Render
  if (!dictionary) return null;

  return (
    <section
      id="ai-visual-synth"
      className="relative w-full overflow-hidden bg-[#050505] py-24 sm:py-32"
      aria-label={dictionary.title}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.04),transparent_70%)] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
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

        <div className="relative mx-auto w-full max-w-5xl">
           <div className="absolute -inset-10 rounded-[5rem] bg-purple-500/5 blur-[120px] pointer-events-none" />
           <div className={cn(
             "relative overflow-hidden rounded-[3rem] border border-white/5 bg-zinc-950/50 shadow-3xl backdrop-blur-sm",
             "transition-all duration-700 hover:border-purple-500/20"
           )}>
             <OrbitalGallery items={galleryItems} dictionary={engineLabels} />
             <div className="absolute top-8 left-8 flex items-center gap-3 rounded-full bg-black/60 border border-white/10 px-5 py-2.5 text-[9px] font-mono font-bold tracking-widest text-zinc-300 backdrop-blur-xl pointer-events-none z-20">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse" />
                {dictionary.overlay_indicator}
             </div>
           </div>
        </div>

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
      <ColorWaveBar position="bottom" variant="festival" className="h-0.5 opacity-40" />
    </section>
  );
}
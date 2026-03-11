/**
 * @file apps/portfolio-web/src/components/sections/homepage/AiContentSection.tsx
 * @description Sección de exhibición de síntesis visual mediante IA. 
 *              Integra el motor OrbitalGallery (WebGL 2.0) con datos localizados 
 *              y cumplimiento estricto de fronteras de Nx.
 * @version 5.0
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit } from 'lucide-react';

/**
 * IMPORTACIONES NIVELADAS (Rutas relativas para cumplimiento @nx/enforce-module-boundaries)
 */
import { BlurText } from '../../razBits/BlurText';
import { OrbitalGallery, type OrbitalGalleryItem } from '../../razBits/OrbitalGallery';
import { aiGalleryData } from '../../../data/ai-gallery';
import { ColorWaveBar } from '../../ui/ColorWaveBar';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

interface AiContentSectionProps {
  /** Diccionario de traducciones para la sección de galería AI */
  dictionary?: Dictionary['homepage']['ai_gallery_section'];
}

/**
 * Aparato Visual: AiContentSection
 * Orquesta la presentación inmersiva de activos generados algorítmicamente.
 */
export function AiContentSection({ dictionary }: AiContentSectionProps) {

  /**
   * 1. PREPARACIÓN DE DATOS (Hooks soberanos)
   * Mapeamos los activos físicos con sus traducciones correspondientes.
   */
  const galleryItems: OrbitalGalleryItem[] = useMemo(() => {
    if (!dictionary?.items) return [];

    return aiGalleryData.map((asset) => {
      const translation = dictionary.items[asset.id] ?? {
        title: 'Visual Asset',
        description: 'Atmospheric generation.',
      };

      return {
        image: asset.image,
        title: translation.title,
        description: translation.description,
      };
    });
  }, [dictionary]);

  // 2. GUARDIA DE DATOS: Si no hay diccionario, el aparato permanece latente.
  if (!dictionary) {
    return null;
  }

  return (
    <section
      id="ai-visual-synth"
      className="relative w-full overflow-hidden bg-[#050505] py-24 sm:py-32"
      aria-label={dictionary.title}
    >
      {/* Fondo atmosférico profundo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.5),transparent_70%)] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
        
        {/* ENCABEZADO TÉCNICO */}
        <div className="mb-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 backdrop-blur-xl"
          >
            <BrainCircuit size={14} className="animate-pulse" />
            <span>{dictionary.badge}</span>
          </motion.div>

          <BlurText
            text={dictionary.title}
            className="font-display text-4xl md:text-7xl font-bold tracking-tighter text-white justify-center mb-8"
            delay={50}
            animateBy="letters"
          />

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl text-lg md:text-xl text-zinc-500 font-sans leading-relaxed"
          >
            {dictionary.subtitle}
          </motion.p>
        </div>

        {/* CONTENEDOR DEL MOTOR WEBGL */}
        <div className="relative mx-auto w-full max-w-5xl">
           <div className="absolute -inset-1 rounded-[3rem] bg-linear-to-b from-purple-500/20 to-transparent opacity-30 blur-xl" />

           <div className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-zinc-950/50 shadow-3xl backdrop-blur-sm">
             {galleryItems.length > 0 && <OrbitalGallery items={galleryItems} />}

             {/* Indicador de Renderizado en Vivo */}
             <div className="absolute top-8 left-8 flex items-center gap-3 rounded-full bg-black/60 border border-white/10 px-4 py-2 text-[9px] font-mono font-bold tracking-widest text-zinc-300 backdrop-blur-xl pointer-events-none">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse" />
                {dictionary.overlay_indicator}
             </div>
           </div>
        </div>

        {/* PIE DE SECCIÓN: Metadatos de Creación */}
        <div className="mt-20 flex flex-col items-center justify-center gap-8 text-center sm:flex-row">
           <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600"
           >
              <Sparkles size={14} className="text-purple-500" />
              <span>{dictionary.footer_prompt}</span>
           </motion.div>

           <div className="hidden h-1 w-1 rounded-full bg-zinc-800 sm:block" />

           <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600"
           >
              <Sparkles size={14} className="text-pink-500" />
              <span>{dictionary.footer_upscaling}</span>
           </motion.div>
        </div>
      </div>

      {/* 
         BARRA DE ACENTO: 
         CORRECCIÓN TS2322: Se elimina la propiedad 'direction' inexistente.
      */}
      <ColorWaveBar position="bottom" variant="festival" className="h-0.5 opacity-30" />
    </section>
  );
}
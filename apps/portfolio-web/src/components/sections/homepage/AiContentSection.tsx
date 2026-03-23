/**
 * @file AiContentSection.tsx
 * @description Orquestador inmersivo para la exhibición de activos generados por IA (Visual Synth).
 *              Fase 4 del Embudo: Diferenciación y validación tecnológica.
 *              Refactorizado: 100% Data-Driven, WebGL 2.0 Integrated, Zero Hardcoding.
 * @version 10.0 - Elite Production Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { BlurText } from '../../razBits/BlurText';
import { OrbitalGallery, type OrbitalGalleryItem } from '../../razBits/OrbitalGallery';
import { aiGalleryData, type AiGalleryAsset } from '../../../data/ai-gallery';
import { ColorWaveBar } from '../../ui/ColorWaveBar';
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface AiContentSectionProps
 * @description Contrato de propiedades basado en el esquema SSoT.
 */
interface AiContentSectionProps {
  /** Fragmento nivelado del diccionario aplanado */
  dictionary: Dictionary['ai_gallery_section'];
}

/**
 * APARATO: AiContentSection
 * @description Realiza la síntesis entre el motor gráfico de bajo nivel y la narrativa i18n.
 */
export function AiContentSection({ dictionary }: AiContentSectionProps) {
  
  /**
   * PROTOCOLO HEIMDALL: Telemetría Forense
   * @pilar IV: Registra el enganche visual del usuario con el motor gráfico.
   */
  useEffect(() => {
    console.log('[HEIMDALL][GPU] Visual Synth Engine Ready. Awaiting interaction.');
  }, []);

  /**
   * MAPEO SOBERANO DE ACTIVOS
   * @pilar VI: i18n Nativa y Resiliencia.
   * Cruza el inventario técnico con las traducciones del CMS.
   */
  const galleryItems: OrbitalGalleryItem[] = useMemo(() => {
    if (!dictionary?.items) {
      console.error('[HEIMDALL][DATA] Missing items in ai_gallery_section dictionary.');
      return [];
    }

    return aiGalleryData.map((asset: AiGalleryAsset) => {
      const translation = dictionary.items[asset.id];
      
      // Pilar VIII: Fallback inteligente si falta traducción específica
      if (!translation) {
        console.warn(`[HEIMDALL][I18N] Translation missing for asset: ${asset.id}`);
      }

      return {
        image: asset.image,
        title: translation?.title || `${dictionary.item_prefix} ${asset.id}`,
        description: translation?.description || dictionary.item_prefix,
      };
    });
  }, [dictionary]);

  /**
   * CONFIGURACIÓN DE ETIQUETAS DEL MOTOR (ENGINE LABELS)
   */
  const engineLabels = useMemo(() => ({
    drag_label: dictionary?.drag_label || 'DRAG TO ORBIT',
    item_prefix: dictionary?.item_prefix || 'ASSET',
    error_fallback: dictionary?.error_fallback || 'GRAPHICS ENGINE UNAVAILABLE'
  }), [dictionary]);

  // Guardia de seguridad para el Build (SSR Prevention)
  if (!dictionary) return null;

  return (
    <section
      id="ai-visual-synth"
      className="relative w-full overflow-hidden bg-[#050505] py-24 sm:py-40 selection:bg-primary/30"
      aria-label={dictionary.title}
    >
      {/* CAPA ATMOSFÉRICA DE PROFUNDIDAD (Glows) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-px h-full bg-linear-to-b from-transparent via-white/5 to-transparent pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
        
        {/* --- HEADER NARRATIVO: EL CEREBRO --- */}
        <header className="mb-24 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.5em] text-primary backdrop-blur-3xl shadow-[0_0_30px_rgba(168,85,247,0.15)]"
          >
            <BrainCircuit size={16} className="animate-pulse" />
            <span>{dictionary.badge}</span>
          </motion.div>

          <BlurText
            text={dictionary.title.toUpperCase()}
            className="font-display text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white justify-center mb-12 drop-shadow-2xl"
            delay={40}
            animateBy="letters"
          />

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl text-lg md:text-2xl text-zinc-500 font-sans leading-relaxed font-light italic"
          >
            {dictionary.subtitle}
          </motion.p>
        </header>

        {/* --- CORE: CONTENEDOR WEBGL (SOVEREIGN ENGINE) --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, amount: 0.2 }}
          className="relative mx-auto w-full max-w-6xl"
        >
           {/* Efecto de resplandor perimetral */}
           <div className="absolute -inset-16 rounded-[6rem] bg-primary/5 blur-[140px] pointer-events-none opacity-50" />
           
           <div className={cn(
             "relative h-[500px] md:h-[750px] overflow-hidden rounded-[4rem] border border-white/5 bg-zinc-950/60 shadow-3xl backdrop-blur-sm transform-gpu",
             "transition-all duration-1000 hover:border-primary/20 hover:bg-zinc-950/80"
           )}>
             {/* Integración del motor orbital soberano */}
             <OrbitalGallery items={galleryItems} dictionary={engineLabels} />
             
             {/* TELEMETRÍA DE INTERFAZ (Overlay) */}
             <div className="absolute top-10 left-10 flex items-center gap-4 rounded-full bg-black/80 border border-white/10 px-6 py-3 text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-300 backdrop-blur-2xl pointer-events-none z-20">
                <div className="relative h-2 w-2">
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                  <div className="relative h-2 w-2 rounded-full bg-green-500 shadow-[0_0_12px_#22c55e]" />
                </div>
                {dictionary.overlay_indicator}
             </div>
           </div>
        </motion.div>

        {/* --- FOOTER: ESPECIFICACIONES TÉCNICAS --- */}
        <footer className="mt-28 flex flex-col items-center justify-center gap-12 text-center sm:flex-row">
           <motion.div 
             whileHover={{ y: -2 }}
             className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600 transition-colors hover:text-zinc-400"
           >
              <Sparkles size={16} className="text-primary" />
              <span>{dictionary.footer_prompt}</span>
           </motion.div>
           
           <div className="hidden h-1 w-1 rounded-full bg-zinc-800 sm:block" />
           
           <motion.div 
             whileHover={{ y: -2 }}
             className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600 transition-colors hover:text-zinc-400"
           >
              <Sparkles size={16} className="text-pink-500" />
              <span>{dictionary.footer_upscaling}</span>
           </motion.div>
        </footer>
      </div>
      
      {/* SELLO DE MARCA (Hospitality Bar) */}
      <ColorWaveBar position="bottom" variant="hotel" className="h-0.5 opacity-30" />
    </section>
  );
}
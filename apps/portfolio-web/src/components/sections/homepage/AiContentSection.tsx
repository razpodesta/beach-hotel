/**
 * @file AiContentSection.tsx
 * @description Orquestador inmersivo para la exhibición de activos generados por IA (Visual Synth).
 *              Refactorizado: Sincronización total con el Manifiesto Day-First, 
 *              uso de tokens semánticos Oxygen y optimización de atmósfera WebGL.
 * @version 11.0 - Atmosphere Responsive & Canonical Standards
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, Cpu } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { BlurText } from '../../razBits/BlurText';
import { OrbitalGallery, type OrbitalGalleryItem } from '../../razBits/OrbitalGallery';
import { aiGalleryData, type AiGalleryAsset } from '../../../data/ai-gallery';
import { ColorWaveBar } from '../../ui/ColorWaveBar';
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface AiContentSectionProps
 */
interface AiContentSectionProps {
  /** Fragmento nivelado del diccionario validado por MACS */
  dictionary: Dictionary['ai_gallery_section'];
}

/**
 * APARATO: AiContentSection
 * @description Punto de diferenciación tecnológica. Reacciona dinámicamente a la atmósfera global.
 */
export function AiContentSection({ dictionary }: AiContentSectionProps) {
  
  /**
   * PROTOCOLO HEIMDALL: Telemetría Forense
   * @pilar IV: Agrupación lógica de la carga del motor gráfico.
   */
  useEffect(() => {
    const traceId = `webgl_init_${Date.now()}`;
    console.group(`[HEIMDALL][GPU] Visual Synth Cluster: ${traceId}`);
    console.log('Status: Syncing with Sovereign Atmosphere...');
    console.groupEnd();
  }, []);

  /**
   * MAPEO SOBERANO DE ACTIVOS
   * @description Cruza el inventario técnico con las traducciones del CMS.
   */
  const galleryItems: OrbitalGalleryItem[] = useMemo(() => {
    if (!dictionary?.items) return [];

    return aiGalleryData.map((asset: AiGalleryAsset) => {
      const translation = dictionary.items[asset.id];
      
      if (!translation) {
        console.warn(`[HEIMDALL][I18N] Asset metadata missing for ID: ${asset.id}`);
      }

      return {
        image: asset.image,
        title: translation?.title || `${dictionary.item_prefix} ${asset.id}`,
        description: translation?.description || dictionary.item_prefix,
      };
    });
  }, [dictionary]);

  const engineLabels = useMemo(() => ({
    drag_label: dictionary?.drag_label || 'DRAG TO ORBIT',
    item_prefix: dictionary?.item_prefix || 'ASSET',
    error_fallback: dictionary?.error_fallback || 'GRAPHICS ENGINE UNAVAILABLE'
  }), [dictionary]);

  if (!dictionary) return null;

  return (
    <section
      id="ai-visual-synth"
      /**
       * @pilar VII: Theming Soberano
       * Sustituimos el fondo fijo por 'bg-background' para habilitar el modo Día.
       */
      className="relative w-full overflow-hidden bg-background py-24 sm:py-40 transition-colors duration-1000 selection:bg-primary/30"
      aria-label={dictionary.title}
    >
      {/* CAPA ATMOSFÉRICA DE PROFUNDIDAD (Glows Adaptativos) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary-rgb),0.06),transparent_70%)] pointer-events-none opacity-50" />
      <div className="absolute top-0 left-1/4 w-px h-full bg-linear-to-b from-transparent via-border/20 to-transparent pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
        
        {/* --- HEADER NARRATIVO: EL CEREBRO --- */}
        <header className="mb-24 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.5em] text-primary backdrop-blur-3xl shadow-xl transition-all"
          >
            <BrainCircuit size={16} className="animate-pulse" />
            <span>{dictionary.badge}</span>
          </motion.div>

          <BlurText
            text={dictionary.title.toUpperCase()}
            className="font-display text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground justify-center mb-12 drop-shadow-2xl transition-colors duration-1000"
            delay={40}
            animateBy="letters"
          />

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl text-lg md:text-2xl text-muted-foreground font-sans leading-relaxed font-light italic transition-colors duration-1000"
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
           {/* Resplandor adaptativo según atmósfera (Pilar XII) */}
           <div className="absolute -inset-16 rounded-6xl bg-primary/5 blur-[140px] pointer-events-none opacity-40 transition-opacity" />
           
           <div className={cn(
             "relative h-[500px] md:h-[750px] overflow-hidden rounded-5xl border border-border/50 bg-surface/40 shadow-3xl backdrop-blur-sm transform-gpu",
             "transition-all duration-1000 hover:border-primary/20 hover:bg-surface/60"
           )}>
             {/* Integración del motor orbital soberano */}
             <OrbitalGallery items={galleryItems} dictionary={engineLabels} />
             
             {/* TELEMETRÍA DE INTERFAZ (Overlay Adaptativo) */}
             <div className="absolute top-10 left-10 flex items-center gap-4 rounded-full bg-surface/80 border border-border/40 px-6 py-3 text-[10px] font-mono font-bold tracking-[0.2em] text-foreground backdrop-blur-2xl pointer-events-none z-20 shadow-xl transition-all">
                <div className="relative h-2 w-2">
                  <div className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
                  <div className="relative h-2 w-2 rounded-full bg-success shadow-[0_0_12px_var(--color-success)]" />
                </div>
                {dictionary.overlay_indicator}
             </div>
           </div>
        </motion.div>

        {/* --- FOOTER: ESPECIFICACIONES TÉCNICAS (Higiene Atmosférica) --- */}
        <footer className="mt-28 flex flex-col items-center justify-center gap-12 text-center sm:flex-row">
           <motion.div 
             whileHover={{ y: -2, color: 'var(--color-foreground)' }}
             className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground transition-all"
           >
              <Sparkles size={16} className="text-primary" />
              <span>{dictionary.footer_prompt}</span>
           </motion.div>
           
           <div className="hidden h-1 w-1 rounded-full bg-border sm:block" />
           
           <motion.div 
             whileHover={{ y: -2, color: 'var(--color-foreground)' }}
             className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground transition-all"
           >
              <Cpu size={16} className="text-accent" />
              <span>{dictionary.footer_upscaling}</span>
           </motion.div>
        </footer>
      </div>
      
      {/* SELLO DE MARCA (Atmosphere-Aware Bar) */}
      <ColorWaveBar position="bottom" variant="hotel" className="h-0.5 opacity-20" />
    </section>
  );
}
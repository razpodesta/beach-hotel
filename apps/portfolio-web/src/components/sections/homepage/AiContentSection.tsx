// RUTA: apps/portfolio-web/src/components/sections/homepage/AiContentSection.tsx
// VERSIÓN: 4.0 - Hooks Compliance & SEO Anchor
// ESTADO: Producción (Zod Typed, ESLint Pass, Tailwind v4)

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit } from 'lucide-react';
import { BlurText } from '../../razBits/BlurText';
import { OrbitalGallery, type OrbitalGalleryItem } from '../../razBits/OrbitalGallery';
import { aiGalleryData } from '@/data/ai-gallery';
import { ColorWaveBar } from '../../ui/ColorWaveBar';
import type { Dictionary } from '@/lib/schemas/dictionary.schema';

type AiContentSectionProps = {
  // Permitimos undefined para manejar la carga inicial o errores de propagación
  dictionary?: Dictionary['homepage']['ai_gallery_section'];
};

export function AiContentSection({ dictionary }: AiContentSectionProps) {

  // 1. HOOKS PRIMERO (Siempre incondicionales para cumplir reglas de React)
  const galleryItems: OrbitalGalleryItem[] = useMemo(() => {
    // Si no hay diccionario, retornamos array vacío para mantener estabilidad
    if (!dictionary?.items) return [];

    return aiGalleryData.map((asset) => {
      // Acceso seguro con Optional Chaining y Fallback defensivo
      const translation = dictionary.items[asset.id] || {
        title: 'Unknown Asset',
        description: 'Description unavailable.',
      };

      return {
        image: asset.image,
        title: translation.title,
        description: translation.description,
      };
    });
  }, [dictionary]); // Dependencia estable

  // 2. RETORNO TEMPRANO (Solo después de llamar a todos los hooks)
  if (!dictionary) {
    return null;
  }

  // 3. RENDERIZADO
  return (
    <section
      id="ai-visual-synth"
      className="relative w-full overflow-hidden bg-black py-24 sm:py-32"
      aria-label={dictionary.title} // Mejora de Accesibilidad
    >
      {/* Fondo Atmosférico */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black opacity-50 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Encabezado */}
        <div className="mb-16 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-300 backdrop-blur-md"
          >
            <BrainCircuit size={16} />
            <span>{dictionary.badge}</span>
          </motion.div>

          <BlurText
            text={dictionary.title}
            className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl justify-center"
            delay={50}
          />

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 max-w-2xl text-lg text-zinc-400"
          >
            {dictionary.subtitle}
          </motion.p>
        </div>

        {/* Contenedor de la Galería */}
        <div className="relative mx-auto w-full max-w-5xl">
           {/* Marco con Gradiente Canónico */}
           <div className="absolute -inset-0.5 rounded-4xl bg-linear-to-b from-zinc-700 to-transparent opacity-40 blur-sm" />

           <div className="relative overflow-hidden rounded-4xl border border-zinc-800 bg-zinc-950/80 shadow-2xl backdrop-blur-sm">
             {/* Renderizado condicional seguro para la galería */}
             {galleryItems.length > 0 && <OrbitalGallery items={galleryItems} />}

             {/* Indicador UI */}
             <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-bold tracking-widest text-zinc-300 backdrop-blur-md pointer-events-none border border-white/5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.4)]" />
                {dictionary.overlay_indicator}
             </div>
           </div>
        </div>

        {/* Footer de Características */}
        <div className="mt-16 flex flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-8">
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="flex items-center gap-2 text-sm text-zinc-500"
           >
              <Sparkles size={14} className="text-purple-500" />
              <span className="font-medium">{dictionary.footer_prompt}</span>
           </motion.div>

           <div className="hidden h-1 w-1 rounded-full bg-zinc-800 sm:block" />

           <motion.div
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="flex items-center gap-2 text-sm text-zinc-500"
           >
              <Sparkles size={14} className="text-pink-500" />
              <span className="font-medium">{dictionary.footer_upscaling}</span>
           </motion.div>
        </div>
      </div>

      <ColorWaveBar position="bottom" direction="right-to-left" />
    </section>
  );
}

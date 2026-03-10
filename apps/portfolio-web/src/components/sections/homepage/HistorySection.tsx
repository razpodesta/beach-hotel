// RUTA: apps/portfolio-web/src/components/sections/homepage/HistorySection.tsx
// VERSIÓN: 1.0 - Sección Final de la Homepage con Efecto Glitch.
// DESCRIPCIÓN: Este nuevo aparato sirve como la sección de cierre de la página de
//              inicio. Utiliza el componente 'LetterGlitch' como fondo animado para
//              crear una atmósfera inmersiva y de alta tecnología. Sobre este fondo,
//              presenta un texto centrado que invita a explorar la historia y la
//              filosofía del proyecto, actuando como un poderoso "call to reflection".

'use client';

import { motion } from 'framer-motion';
import LetterGlitch from '@/components/razBits/LetterGlitch';
import type { Dictionary } from '@/lib/schemas/dictionary.schema';

type HistorySectionProps = {
  dictionary: Dictionary['homepage']['history_section'];
};

export function HistorySection({ dictionary }: HistorySectionProps) {
  return (
    <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <LetterGlitch
          glitchColors={['#4a044e', '#86198f', '#c026d3']}
          glitchSpeed={70}
          smooth={true}
          outerVignette={true}
        />
      </div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">
            {dictionary.title}
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            {dictionary.subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

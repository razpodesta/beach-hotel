// RUTA: apps/portfolio-web/src/components/sections/homepage/AboutSection.tsx

/**
 * @file AboutSection.tsx
 * @version 7.0 - Elite Architecture
 * @description Presentación narrativa del Beach Hotel Canasvieiras. 
 *              Elimina dangerouslySetInnerHTML por renderizado semántico.
 *              Optimizado con LetterGlitch como fondo de rendimiento controlado.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Landmark } from 'lucide-react';
import { cn } from '../../../lib/utils/cn';
import LetterGlitch from '../../razBits/LetterGlitch';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

type AboutSectionProps = {
  dictionary: Dictionary['homepage']['about_section'];
};

export function AboutSection({ dictionary }: AboutSectionProps) {
  return (
    <section id="nossa-historia" className="relative w-full overflow-hidden py-24 sm:py-32 bg-black">
      {/* Fondo de Glitch Tecnológico - Optimizado con opacidad semántica */}
      <div className="absolute inset-0 z-0 opacity-20">
        <LetterGlitch
          glitchColors={['#4a044e', '#86198f', '#2e1065']}
          glitchSpeed={100}
          smooth={true}
          outerVignette={true}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-5 lg:gap-16">
          
          {/* Lado Izquierdo: Visual Asset */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2"
          >
            <div className="relative h-full min-h-[400px] rounded-3xl border border-white/5 bg-zinc-950/30 p-2 backdrop-blur-md">
              <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/images/hotel/about-building-front.jpg"
                  alt="Beach Hotel Canasvieiras Architecture"
                  fill
                  className="object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority={false}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                      <Landmark size={20} className="text-purple-400" />
                   </div>
                   <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-zinc-300 uppercase">
                      Est. 2026 • Florianópolis
                   </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lado Derecho: Narrativa de Marca */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3 flex flex-col justify-center"
          >
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter text-white leading-none">
                  {dictionary.title}
                </h2>
                <div className="h-1 w-20 bg-linear-to-r from-purple-600 to-pink-600 rounded-full" />
              </div>

              <div className="grow space-y-6 text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl">
                <p className="first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:text-white first-letter:mr-3 first-letter:float-left">
                  {dictionary.bio_part_1}
                </p>
                <p>{dictionary.bio_part_2}</p>
              </div>

              <div className="pt-6">
                <Link
                  href="/historia"
                  className={cn(
                    "group relative inline-flex items-center gap-4 rounded-full bg-white px-10 py-5",
                    "text-sm font-bold text-black transition-all hover:bg-zinc-200"
                  )}
                >
                  {dictionary.cta_button}
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
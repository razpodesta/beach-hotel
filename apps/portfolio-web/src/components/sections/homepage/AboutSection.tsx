// RUTA: apps/portfolio-web/src/components/sections/homepage/AboutSection.tsx
// VERSIÓN: 5.1 - Sintaxis Canónica de Tailwind.
// DESCRIPCIÓN: Se reemplaza la clase 'flex-grow' por su forma canónica y más
//              concisa, 'grow', para alinear el código con las mejores prácticas
//              modernas de Tailwind CSS y resolver las advertencias del linter.

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Dictionary } from '@/lib/schemas/dictionary.schema';
import { socialLinks } from '@/lib/social-links';
import LetterGlitch from '@/components/razBits/LetterGlitch';

type AboutSectionProps = {
  dictionary: Dictionary['homepage']['about_section'];
};

export function AboutSection({ dictionary }: AboutSectionProps) {
  return (
    <section id="quien-soy" className="relative w-full overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0 z-0">
        <LetterGlitch
          glitchColors={['#4a044e', '#86198f', '#c026d3']}
          glitchSpeed={80}
          smooth={true}
          outerVignette={true}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5 lg:gap-8">
          {/* Columna de Imagen */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-sm">
              <div className="aspect-square w-full overflow-hidden rounded-xl relative">
                <Image
                  src="/images/raz-podesta-avatar.jpg"
                  alt="Foto de Raz Podestá"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 40vw, 33vw"
                  priority
                />
              </div>
              <div className="my-6 h-px w-full bg-zinc-800" />
              <div className="flex items-center justify-center gap-4">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visita mi perfil de ${label}`}
                    className="rounded-full p-3 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
                    <Icon size={22} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Columna de Texto como Tarjeta */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-3 h-full"
          >
            <div className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-950/70 p-8 backdrop-blur-sm">
              <h2 className="font-display text-4xl font-bold text-white">
                {dictionary.title}
              </h2>
              {/* --- INICIO DE LA MEJORA DE SINTAXIS --- */}
              <div className="mt-6 grow space-y-5 font-sans text-lg text-zinc-300">
              {/* --- FIN DE LA MEJORA DE SINTAXIS --- */}
                <p style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }} dangerouslySetInnerHTML={{ __html: dictionary.bio_part_1 }} />
                <p style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }} dangerouslySetInnerHTML={{ __html: dictionary.bio_part_2 }} />
              </div>
              <div className="mt-8">
                <Link
                  href="/quien-soy"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
                >
                  {dictionary.cta_button}
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

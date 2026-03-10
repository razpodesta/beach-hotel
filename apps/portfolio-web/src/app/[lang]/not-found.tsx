/**
 * @file apps/portfolio-web/src/app/[lang]/not-found.tsx
 * @description Interfaz de error 404 localizada. Transforma un fallo técnico en 
 *              una invitación del concierge para volver a la ruta segura.
 * @version 8.0
 * @author Raz Podestá - MetaShark Tech
 */

import Link from 'next/link';
import { Compass, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES NIVELADAS (Cumplimiento estricto @nx/enforce-module-boundaries)
 */
import { i18n } from '../../config/i18n.config';
import { getDictionary } from '../../lib/get-dictionary';
import { FadeIn } from '../../components/ui/FadeIn';

/**
 * Aparato Visual: LocalizedNotFound
 * Nota: Los archivos not-found en Next.js App Router no reciben props (params).
 * Utilizamos el locale por defecto como fallback seguro o lógica de detección previa.
 */
export default async function LocalizedNotFound() {
  // En el contexto de un 404, el locale puede ser ambiguo. 
  // Usamos el diccionario base para garantizar que el componente nunca falle.
  const lang = i18n.defaultLocale; 
  const dictionary = await getDictionary(lang);
  const t = dictionary.not_found;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#050505] text-white p-6 selection:bg-purple-500/30 overflow-hidden">
      
      {/* Fondo Atmosférico (Coherencia visual con la marca) */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03),transparent_70%)] pointer-events-none" />

      <FadeIn delay={0.2} yOffset={30} className="w-full max-w-md">
        <div className="text-center space-y-10">

          {/* Arte Visual: Concierge Badge con animación sutil */}
          <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow" />
              <div className="absolute inset-2 border border-purple-500/10 rounded-full" />
              <Sparkles size={40} className="text-purple-500 animate-pulse" />
          </div>

          <header className="space-y-6">
            <h1 className="font-display text-8xl font-bold tracking-tighter text-white opacity-20">
              404
            </h1>
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-600 uppercase block">
                Lost in the Sanctuary
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-zinc-100">
                {t.title}
              </h2>
            </div>
            <p className="text-zinc-500 leading-relaxed font-sans text-lg max-w-xs mx-auto">
              {t.description}
            </p>
          </header>

          <nav className="flex justify-center">
            <Link
              href={`/${lang}`}
              className="group flex items-center gap-3 rounded-full bg-white px-10 py-5 text-xs font-bold text-black uppercase tracking-[0.2em] hover:bg-purple-500 hover:text-white transition-all duration-500 hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] active:scale-95"
            >
              <Compass size={18} className="group-hover:rotate-45 transition-transform duration-500" />
              {t.cta_button}
            </Link>
          </nav>

          {/* Footer Técnico (Trazabilidad) */}
          <div className="pt-12 border-t border-white/5 flex flex-col items-center gap-4">
             <div className="flex items-center gap-3 text-[10px] text-zinc-800 font-mono tracking-[0.2em] uppercase">
                <span>{t.error_code}</span>
             </div>
             <p className="text-[9px] font-mono text-zinc-900 uppercase tracking-[0.3em]">
                Beach Hotel Canasvieiras • Private Infrastructure
             </p>
          </div>
        </div>
      </FadeIn>

      {/* Decoración Estructural */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-purple-500/10 to-transparent" />
    </main>
  );
}
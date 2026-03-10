// RUTA: apps/portfolio-web/src/app/[lang]/not-found.tsx
// VERSIÓN: 7.0 - Concierge 404 Experience
// DESCRIPCIÓN: Transformación de error técnico a mensaje de hospitalidad boutique.

import Link from 'next/link';
import { Compass, Sparkles } from 'lucide-react';
import { i18n } from '@/config/i18n.config';
import { getDictionary } from '@/lib/get-dictionary';

export default async function LocalizedNotFound() {
  const lang = i18n.defaultLocale; 
  const dictionary = await getDictionary(lang);
  const t = dictionary.not_found;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#020202] text-white p-6 selection:bg-purple-500/30">
      <div className="max-w-md text-center space-y-10">

        {/* Arte Visual: Concierge Badge */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow" />
            <Sparkles size={32} className="text-purple-500" />
        </div>

        <div className="space-y-6">
          <h1 className="font-display text-7xl font-bold tracking-tighter text-white">404</h1>
          <h2 className="text-2xl font-display font-bold tracking-tight text-zinc-100">
            {t.title}
          </h2>
          <p className="text-zinc-400 leading-relaxed font-sans text-lg">
            {t.description}
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href={`/${lang}`}
            className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 text-xs font-bold text-black uppercase tracking-widest hover:scale-105 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <Compass size={16} />
            {t.cta_button}
          </Link>
        </div>

        <div className="pt-12 border-t border-white/5 flex items-center justify-center gap-3 text-[10px] text-zinc-700 font-mono tracking-[0.2em] uppercase">
           <span>{t.error_code}</span>
        </div>
      </div>
    </div>
  );
}
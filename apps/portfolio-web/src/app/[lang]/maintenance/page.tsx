/**
 * @file apps/portfolio-web/src/app/[lang]/maintenance/page.tsx
 * @description Página de Mantenimiento Programado.
 *              Refactorizado: Forzado de generación estática para máxima resiliencia.
 * @version 6.2 - Build-Safe & Static Forced
 * @author Staff Engineer - MetaShark Tech
 */

import type { Metadata } from 'next';
import { AlertOctagon, RefreshCw } from 'lucide-react';

import { getDictionary } from '../../../lib/get-dictionary';
import { type Locale } from '../../../config/i18n.config';
import { FadeIn } from '../../../components/ui/FadeIn';

/**
 * @pilar VIII: Resiliencia de Infraestructura.
 * Forzamos que esta página sea estática para que no dependa de ningún worker de runtime.
 */
export const dynamic = 'force-static';
export const revalidate = false;

type MaintenancePageProps = {
  params: Promise<{ lang: Locale }>;
};

export async function generateMetadata(props: MaintenancePageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.maintenance;

  return { 
    title: `${t.title} | Beach Hotel Canasvieiras`,
    description: t.description,
    robots: { index: false, follow: false },
  };
}

export default async function MaintenancePage(props: MaintenancePageProps) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  const t = dict.maintenance;

  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center bg-[#050505] text-white px-6 text-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05),transparent_70%)] pointer-events-none" />
      
      <FadeIn delay={0.2} yOffset={0}>
        <div className="flex flex-col items-center">
          <div className="relative mb-10">
            <div className="absolute -inset-4 bg-yellow-500/20 blur-2xl rounded-full animate-pulse" />
            <AlertOctagon size={80} className="text-yellow-500 relative" strokeWidth={1.5} />
          </div>

          <header className="space-y-4 mb-12">
            <span className="text-[10px] font-bold tracking-[0.5em] text-zinc-600 uppercase block">
              System Update in Progress
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tighter max-w-2xl">
              {t.title}
            </h1>
          </header>

          <p className="font-sans text-zinc-400 max-w-md text-lg leading-relaxed mb-12">
            {t.description}
          </p>

          <div className="flex flex-col items-center gap-6">
            <div className="rounded-full bg-white/3 border border-white/10 px-8 py-3 text-xs text-zinc-500 font-mono tracking-widest uppercase flex items-center gap-3">
              <RefreshCw size={14} className="animate-spin" />
              {t.estimated_return}
            </div>

            <p className="text-[9px] font-mono text-zinc-800 uppercase tracking-[0.3em]">
              Sovereign Infrastructure • MetaShark Tech
            </p>
          </div>
        </div>
      </FadeIn>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-yellow-500/20 to-transparent" />
    </main>
  );
}
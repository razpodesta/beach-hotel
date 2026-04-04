/**
 * @file page.tsx (Terms of Service)
 * @description Orquestador de los Términos de Servicio del ecosistema.
 *              Refactorizado: Blindaje de renderizado estático y resiliencia 
 *              de build frente a variables de entorno inestables.
 * @version 7.0 - Static Build Hardened
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { i18n, type Locale } from '../../../../config/i18n.config';
import { getDictionary } from '../../../../lib/get-dictionary';
import { PrintButton } from '../../../../components/ui/PrintButton';
import { FadeIn } from '../../../../components/ui/FadeIn';

/**
 * @pilar VIII: Resiliencia de Infraestructura.
 * Forzamos renderizado estático para evitar llamadas a runtime en el build.
 */
export const dynamic = 'force-static';
export const revalidate = false;

type PageProps = {
  params: Promise<{ lang: Locale }>;
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang).catch(() => ({ 
    legal: { terms_of_service: { meta_title: 'Términos de Servicio', meta_description: '' } } 
  }));
  const t = dictionary.legal.terms_of_service;

  return { 
    title: t.meta_title,
    description: t.meta_description,
    alternates: {
      canonical: `/${lang}/legal/terminos-de-servicio`,
    }
  };
}

export default async function TermsOfServicePage(props: PageProps) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.legal.terms_of_service;

  return (
    <main className="min-h-screen bg-[#050505] selection:bg-purple-500/30">
      <div className="container mx-auto max-w-4xl px-6 py-32 sm:py-48">
        
        <FadeIn delay={0.1} yOffset={-10}>
          <Link 
            href={`/${lang}`}
            className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all mb-12"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            {t.back_button_label}
          </Link>
        </FadeIn>

        <header className="mb-16 border-b border-white/10 pb-12">
          <span className="text-[10px] font-bold tracking-[0.5em] text-pink-500 uppercase mb-6 block">
            {t.badge_label}
          </span>
          <h1 className="font-display text-4xl md:text-7xl font-bold text-white tracking-tighter leading-none mb-8">
            {t.title}
          </h1>
          <div className="flex items-center gap-4">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-500">
                <FileText size={20} />
             </div>
             <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
               {t.last_updated_prefix} <span className="text-zinc-300">{t.last_updated_date}</span>
             </p>
          </div>
        </header>

        <div className="prose prose-invert prose-lg max-w-none font-sans 
                        prose-headings:font-display prose-headings:font-bold prose-headings:text-zinc-100 prose-headings:tracking-tight
                        prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:font-light
                        prose-strong:text-white prose-strong:font-bold
                        prose-ol:text-zinc-400 prose-ul:text-zinc-400">
          {t.content.map((section, index) => (
            <FadeIn key={`section-${index}`} delay={0.2 + (index * 0.05)}>
              <article className="mb-16">
                <h2 className="text-2xl md:text-3xl mb-8 flex items-center gap-4">
                   <span className="text-zinc-800 font-display">0{index + 1}</span>
                   {section.heading}
                </h2>
                <div 
                  className="space-y-6"
                  dangerouslySetInnerHTML={{ __html: section.body }} 
                />
              </article>
            </FadeIn>
          ))}
        </div>

        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12">
            <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-[0.3em]">
                {t.infrastructure_label}
            </p>
            <PrintButton text={t.print_button_label} />
        </div>
      </div>

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.03),transparent_50%)] pointer-events-none" />
    </main>
  );
}
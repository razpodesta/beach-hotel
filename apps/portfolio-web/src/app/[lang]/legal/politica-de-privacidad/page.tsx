/**
 * @file page.tsx (Privacy Policy)
 * @description Orquestador de la Política de Privacidad del Santuario Digital.
 *              Implementa transparencia de datos, soporte para impresión física
 *              y cumplimiento estricto del contrato soberano v2.0.
 * @version 6.0 - Elite Compliance Standard
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica mediante fronteras Nx.
 */
import { i18n, type Locale } from '../../../../config/i18n.config';
import { getDictionary } from '../../../../lib/get-dictionary';
import { PrintButton } from '../../../../components/ui/PrintButton';
import { FadeIn } from '../../../../components/ui/FadeIn';

/**
 * @interface PageProps
 * @description Parámetros asíncronos nativos de Next.js 15.
 */
type PageProps = {
  params: Promise<{ lang: Locale }>;
};

/**
 * GENERACIÓN DE RUTAS ESTÁTICAS (SSG)
 */
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

/**
 * GENERACIÓN DE METADATOS SOBERANOS
 * @pilar I: Visión Holística - SEO E-E-A-T.
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.legal.privacy_policy;

  return { 
    title: t.meta_title,
    description: t.meta_description,
    alternates: {
      canonical: `/${lang}/legal/politica-de-privacidad`,
    }
  };
}

/**
 * APARATO: PrivacyPolicyPage
 * @description Renderiza el marco legal con tipografía editorial y herramientas de accesibilidad.
 */
export default async function PrivacyPolicyPage(props: PageProps) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.legal.privacy_policy;

  return (
    <main className="min-h-screen bg-[#050505] selection:bg-purple-500/30">
      <div className="container mx-auto max-w-4xl px-6 py-32 sm:py-48">
        
        {/* 1. NAVEGACIÓN DE RETORNO */}
        <FadeIn delay={0.1} yOffset={-10}>
          <Link 
            href={`/${lang}`}
            className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all mb-12"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            {t.back_button_label}
          </Link>
        </FadeIn>

        {/* 2. CABECERA NORMATIVA */}
        <header className="mb-16 border-b border-white/10 pb-12">
          <span className="text-[10px] font-bold tracking-[0.5em] text-primary uppercase mb-6 block">
            {t.badge_label}
          </span>
          <h1 className="font-display text-4xl md:text-7xl font-bold text-white tracking-tighter leading-none mb-8">
            {t.title}
          </h1>
          <div className="flex items-center gap-4">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <ShieldCheck size={20} />
             </div>
             <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
               {t.last_updated_prefix} <span className="text-zinc-300">{t.last_updated_date}</span>
             </p>
          </div>
        </header>

        {/* 3. CUERPO LEGAL (Typography Optimized) */}
        <div className="prose prose-invert prose-lg max-w-none font-sans 
                        prose-headings:font-display prose-headings:font-bold prose-headings:text-zinc-100 prose-headings:tracking-tight
                        prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:font-light
                        prose-strong:text-white prose-strong:font-bold
                        prose-li:text-zinc-400">
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

        {/* 4. ACCIONES DE ÉLITE (Paso Crítico .docs) */}
        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12">
            <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-[0.3em]">
                {t.infrastructure_label}
            </p>
            <PrintButton text={t.print_button_label} />
        </div>
      </div>

      {/* Artefacto de atmósfera */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.03),transparent_50%)] pointer-events-none" />
    </main>
  );
}
/**
 * @file apps/portfolio-web/src/app/[lang]/festival/page.tsx
 * @description Orquestador inmersivo para el Canasvieiras Fest 2026.
 *              Refactorizado: Envoltura de Suspense para componentes cliente con hooks,
 *              estabilidad de build en Vercel y blindaje de metadatos.
 * @version 3.3 - Suspense Boundary & Build Stable
 * @author Raz Podestá - MetaShark Tech
 */

import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ChevronRight, CheckCircle2, Ship } from 'lucide-react';
import Link from 'next/link';

/** IMPORTACIONES DE INFRAESTRUCTURA */
import { i18n } from '../../../config/i18n.config';
import { type Locale } from '../../../config/i18n.config';
import { getDictionary } from '../../../lib/get-dictionary';
import { BlurText } from '../../../components/razBits/BlurText';
import { ExperienceShowcase3D } from '../../../components/sections/homepage/ExperienceShowcase3D';
import { FadeIn } from '../../../components/ui/FadeIn';

type FestivalPageProps = {
  params: Promise<{ lang: Locale }>;
};

/**
 * GENERACIÓN DE RUTAS ESTÁTICAS
 */
export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

/**
 * METADATOS DINÁMICOS Y SEO (E-E-A-T)
 */
export async function generateMetadata(props: FestivalPageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  const f = dict.festival;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  return {
    title: `${f.hero.title} | ${f.hero.subtitle}`,
    description: f.manifesto,
    alternates: {
      canonical: `${baseUrl}/${lang}/festival`,
    },
    openGraph: {
      title: f.hero.title,
      description: f.manifesto,
      url: `${baseUrl}/${lang}/festival`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/festival/og-festival.jpg`,
          width: 1200,
          height: 630,
          alt: f.hero.title,
        },
      ],
    },
  };
}

/**
 * APARATO PRINCIPAL: FestivalPage
 */
export default async function FestivalPage(props: FestivalPageProps) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  const f = dict.festival;

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-pink-500/30 overflow-x-hidden">
      
      {/* SECCIÓN 1: IMPACTO CINEMÁTICO */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_70%)]" />
        
        <FadeIn delay={0.2}>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 mb-10 backdrop-blur-md">
            {f.hero.subtitle}
          </div>
        </FadeIn>

        <BlurText 
          text={f.hero.title}
          className="font-display text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-white to-purple-500 text-center leading-[0.85]"
        />
        
        <FadeIn delay={0.6}>
           <div className="mt-12 flex flex-col items-center gap-8">
              <Link 
                href="#booking"
                className="group relative flex items-center gap-6 rounded-full bg-white px-12 py-6 text-[11px] font-bold text-black uppercase tracking-[0.4em] transition-all hover:bg-purple-600 hover:text-white shadow-2xl active:scale-95"
              >
                {f.hero.cta_label}
                <ChevronRight size={18} className="transition-transform group-hover:translate-x-2" />
              </Link>
           </div>
        </FadeIn>
      </section>

      {/* SECCIÓN 2: MANIFIESTO */}
      <section className="container mx-auto max-w-4xl px-6 py-24 text-center">
        <FadeIn>
          <div className="relative p-12 md:p-20 rounded-[4rem] bg-zinc-900/30 border border-white/5 backdrop-blur-xl">
             <p className="text-xl md:text-3xl font-sans font-light leading-relaxed text-zinc-300 italic">
               "{f.manifesto}"
             </p>
          </div>
        </FadeIn>
      </section>

      {/* SECCIÓN 3: SHOWCASE 3D (WEBGL) */}
      <section id="lineup" className="py-24 border-y border-white/5 bg-zinc-950/20">
         {/* 
            @pilar VIII: Resiliencia de Build.
            Envolvemos en Suspense para evitar el error de Suspense Boundary al 
            usar hooks de cliente (useSearchParams, etc.) en componentes hijos.
         */}
         <Suspense fallback={<div className="h-[500px] w-full flex items-center justify-center text-zinc-700">Loading Experience...</div>}>
            <ExperienceShowcase3D dictionary={dict.festival} />
         </Suspense>
      </section>

      {/* SECCIÓN 4: UPSELL VIP */}
      <section className="container mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <FadeIn yOffset={40}>
              <div className="space-y-8">
                <span className="text-primary font-bold text-[10px] uppercase tracking-[0.6em]">{f.vip_upsell.title}</span>
                <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter leading-none">
                  THE DIAMOND UPGRADE
                </h2>
                <div className="text-4xl font-display font-bold text-white">
                   {f.vip_upsell.price_addon} <span className="text-sm font-mono text-zinc-600 uppercase tracking-widest">{f.vip_upsell.per_guest_label}</span>
                </div>
              </div>
           </FadeIn>

           <FadeIn yOffset={40}>
              <div className="rounded-[3.5rem] bg-linear-to-br from-zinc-900 to-black p-12 border border-white/10 shadow-3xl">
                 <ul className="space-y-6">
                    {f.vip_upsell.benefits.map((benefit: string, i: number) => (
                      <li key={i} className="flex items-start gap-4 text-zinc-400 font-sans group">
                        <CheckCircle2 size={20} className="text-primary shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-lg leading-tight group-hover:text-white transition-colors">{benefit}</span>
                      </li>
                    ))}
                 </ul>
                 <button className="w-full mt-12 py-5 rounded-3xl bg-primary text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-white hover:text-black transition-all active:scale-95 shadow-2xl">
                    {f.vip_upsell.cta_label}
                 </button>
              </div>
           </FadeIn>
        </div>
      </section>

      {/* SECCIÓN 5: MATRIZ DE PAQUETES */}
      <section id="booking" className="container mx-auto px-6 py-32 border-t border-white/5">
        <div className="text-center mb-20">
           <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter mb-6">{f.packages_section.title}</h2>
           <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em]">{f.packages_section.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           {f.packages.map((pkg, i: number) => (
             <FadeIn key={i} delay={i * 0.2}>
               <div className="group relative rounded-[4rem] bg-white/2 border border-white/5 p-12 hover:border-primary/40 transition-all duration-700">
                  <div className="flex justify-between items-start mb-12">
                     <div>
                        <span className="block text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-2">{pkg.availability_label}</span>
                        <h3 className="font-display text-3xl font-bold text-white uppercase">{pkg.category}</h3>
                     </div>
                     <Ship size={32} className="text-zinc-800 group-hover:text-primary transition-colors" />
                  </div>

                  <div className="space-y-6 mb-12">
                     <div className="flex justify-between border-b border-white/5 pb-4">
                        <span className="text-zinc-500">{f.packages_section.label_5_nights}</span>
                        <span className="text-xl font-bold text-white">{pkg.price_5_nights}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-zinc-500">{f.packages_section.label_7_nights}</span>
                        <span className="text-xl font-bold text-white">{pkg.price_7_nights}</span>
                     </div>
                  </div>

                  <Link 
                    href={`/${lang}/contacto`}
                    className="flex items-center justify-center w-full py-5 rounded-full border border-white/10 group-hover:bg-white group-hover:text-black font-bold uppercase tracking-[0.3em] text-[10px] transition-all"
                  >
                    {f.packages_section.cta}
                  </Link>
               </div>
             </FadeIn>
           ))}
        </div>
      </section>
    </main>
  );
}
/**
 * @file apps/portfolio-web/src/app/[lang]/legal/terminos-de-servicio/page.tsx
 * @description Página de Términos de Servicio del ecosistema. 
 *              Implementa SSG para optimización en el Edge y cumplimiento estricto de Nx.
 * @version 5.0
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';

/**
 * IMPORTACIONES NIVELADAS (Rutas relativas para cumplimiento @nx/enforce-module-boundaries)
 */
import { i18n, type Locale } from '../../../../config/i18n.config';
import { getDictionary } from '../../../../lib/get-dictionary';

/**
 * Propiedades de la página con soporte para parámetros asíncronos de Next.js 15.
 */
type TermsPageProps = {
  params: Promise<{ lang: Locale }>;
};

/**
 * Genera parámetros estáticos para despliegue optimizado (SSG).
 * Asegura que los términos legales no generen latencia de cómputo en cada visita.
 */
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

/**
 * Orquestador de Metadatos: Construye la identidad SEO legal del sitio.
 */
export async function generateMetadata(props: TermsPageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.legal.terms_of_service;

  return { 
    title: `${t.title} | Beach Hotel Canasvieiras`,
    description: `Términos y condiciones de uso de nuestra plataforma en ${lang}.`,
    alternates: {
      canonical: `/${lang}/legal/terminos-de-servicio`,
    }
  };
}

/**
 * Componente principal: TermsOfServicePage.
 * Renderiza el contrato de servicio con una jerarquía tipográfica editorial de alta gama.
 */
export default async function TermsOfServicePage(props: TermsPageProps) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.legal.terms_of_service;

  return (
    <main className="min-h-screen bg-[#050505] selection:bg-purple-500/30">
      <div className="container mx-auto max-w-4xl px-6 py-32 sm:py-48">
        
        {/* Cabecera Normativa */}
        <header className="mb-16 border-b border-white/10 pb-10">
          <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase mb-4 block">
            Legal Framework & Usage
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tighter">
            {t.title}
          </h1>
          <div className="mt-6 flex items-center gap-3">
             <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
             <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
               {`Última actualización: ${t.last_updated}`}
             </p>
          </div>
        </header>

        {/* Cuerpo del Contrato (Tailwind Typography Refined) */}
        <div className="prose prose-invert prose-lg max-w-none font-sans 
                        prose-headings:font-display prose-headings:font-bold prose-headings:text-zinc-100 prose-headings:tracking-tight
                        prose-p:text-zinc-400 prose-p:leading-relaxed
                        prose-strong:text-white
                        prose-ol:text-zinc-400 prose-ul:text-zinc-400">
          {t.content.map((section) => (
            <article key={section.heading} className="mb-12">
              <h2 className="text-2xl mb-6">{section.heading}</h2>
              <div 
                className="space-y-4"
                dangerouslySetInnerHTML={{ __html: section.body }} 
              />
            </article>
          ))}
        </div>

        {/* Footer Legal Específico */}
        <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-6">
            <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-[0.3em]">
                Sovereign Digital Infrastructure • MetaShark Tech
            </p>
        </footer>
      </div>
    </main>
  );
}
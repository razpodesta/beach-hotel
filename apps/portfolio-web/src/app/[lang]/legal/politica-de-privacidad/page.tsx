/**
 * @file apps/portfolio-web/src/app/[lang]/legal/politica-de-privacidad/page.tsx
 * @description Página de Política de Privacidad. Implementa el estándar de transparencia 
 *              del ecosistema y soporte total para Next.js 15 (SSG).
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
 * Propiedades de la página con parámetros asíncronos.
 */
type PrivacyPolicyPageProps = {
  params: Promise<{ lang: Locale }>;
};

/**
 * Genera parámetros estáticos para que el contenido legal esté siempre disponible
 * en el Edge sin depender de cómputo en tiempo de ejecución.
 */
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

/**
 * Orquestador de Metadatos: Asegura que el título y descripción legal 
 * sean coherentes con el idioma del usuario.
 */
export async function generateMetadata(props: PrivacyPolicyPageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.legal.privacy_policy;

  return { 
    title: `${t.title} | Beach Hotel Canasvieiras`,
    description: `Consulta nuestra política de privacidad en ${lang}.`,
    alternates: {
      canonical: `/${lang}/legal/politica-de-privacidad`,
    }
  };
}

/**
 * Componente principal: PrivacyPolicyPage.
 * Renderiza el contenido legal con tipografía refinada (prose-invert).
 */
export default async function PrivacyPolicyPage(props: PrivacyPolicyPageProps) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.legal.privacy_policy;

  return (
    <main className="min-h-screen bg-[#050505] selection:bg-purple-500/30">
      <div className="container mx-auto max-w-4xl px-6 py-32 sm:py-48">
        
        {/* Cabecera Normativa */}
        <header className="mb-16 border-b border-white/10 pb-10">
          <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase mb-4 block">
            Compliance & Transparency
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tighter">
            {t.title}
          </h1>
          <div className="mt-6 flex items-center gap-3">
             <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
             <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
               {`Última actualización: ${t.last_updated}`}
             </p>
          </div>
        </header>

        {/* Cuerpo Legal (Tailwind Typography Optimized) */}
        <div className="prose prose-invert prose-lg max-w-none font-sans 
                        prose-headings:font-display prose-headings:font-bold prose-headings:text-zinc-100 prose-headings:tracking-tight
                        prose-p:text-zinc-400 prose-p:leading-relaxed
                        prose-strong:text-white">
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

        {/* Footer Legal Section */}
        <footer className="mt-24 pt-12 border-t border-white/5">
            <p className="text-[10px] font-mono text-zinc-800 text-center uppercase tracking-[0.3em]">
                Sovereign Digital Infrastructure • MetaShark Tech
            </p>
        </footer>
      </div>
    </main>
  );
}
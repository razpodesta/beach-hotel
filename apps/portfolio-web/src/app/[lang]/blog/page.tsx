/**
 * @file apps/portfolio-web/src/app/[lang]/blog/page.tsx
 * @description Orquestador soberano del Hub Editorial (The Concierge Journal). 
 *              Implementa arquitectura Prerender-Safe, orquestación paralela de datos,
 *              SEO E-E-A-T avanzado y resiliencia ante fallos del CMS.
 * @version 14.0 - Parallel Resource Fetching & Semantic Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rutas Relativas)
 * @pilar V: Adherencia arquitectónica a las fronteras de Nx.
 */
import { getDictionary } from '../../../lib/get-dictionary';
import { getAllPosts } from '../../../lib/blog-api';
import type { PostWithSlug } from '../../../lib/blog-api';
import { BlogCard } from '../../../components/ui/BlogCard';
import { BlurText } from '../../../components/razBits/BlurText';
import { JsonLdScript } from '../../../components/ui/JsonLdScript';
import { type Locale, i18n } from '../../../config/i18n.config';

/**
 * Contrato de propiedades con parámetros asíncronos (Next.js 15 Standard).
 */
type BlogIndexProps = {
  params: Promise<{ lang: Locale }>;
};

/**
 * GENERACIÓN DE RUTAS ESTÁTICAS (SSG)
 */
export async function generateStaticParams() {
  return i18n.locales.map((lang: Locale) => ({ lang }));
}

/**
 * ORQUESTADOR DE METADATOS SOBERANO
 * @pilar I: Visión Holística - SEO E-E-A-T.
 */
export async function generateMetadata(props: BlogIndexProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.blog_page;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  return {
    title: t.page_title,
    description: t.page_description,
    alternates: { canonical: `${baseUrl}/${lang}/blog` },
    openGraph: {
      title: t.page_title,
      description: t.page_description,
      url: `${baseUrl}/${lang}/blog`,
      type: 'website',
      siteName: dictionary.header.personal_portfolio,
    }
  };
}

/**
 * APARATO PRINCIPAL: BlogIndexPage
 * @description Orquesta el Hub editorial garantizando carga paralela y tolerancia a fallos.
 */
export default async function BlogIndexPage(props: BlogIndexProps) {
  const { lang } = await props.params;

  /**
   * @pilar X: Rendimiento de Élite.
   * Ejecución paralela masiva para reducir el TTFB (Time to First Byte).
   */
  const [dictionary, posts] = await Promise.all([
    getDictionary(lang),
    getAllPosts(lang).catch((error) => {
      console.error('[HEIMDALL][CRITICAL] Fallo en sincronización editorial:', error);
      return [] as PostWithSlug[]; // Fallback resiliente (Pilar VIII)
    })
  ]);

  const t = dictionary.blog_page;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  /**
   * ESTRUCTURA DE DATOS PARA GOOGLE (JSON-LD)
   * @pilar I: SEO Técnico - Define el Hub como un Blog oficial.
   */
  const blogHubSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": t.hero_title,
    "description": t.page_description,
    "url": `${baseUrl}/${lang}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": dictionary.header.personal_portfolio,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/favicon.ico`
      }
    }
  };

  const hasPosts = posts.length > 0;
  const featuredPost = hasPosts ? posts[0] : null;
  const restPosts = hasPosts ? posts.slice(1) : [];

  return (
    <>
      <JsonLdScript data={blogHubSchema} />
      
      <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
        
        {/* --- SECCIÓN HERO (AWARENESS) --- */}
        <section className="relative overflow-hidden pt-40 pb-20 border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.08),transparent_60%)] pointer-events-none" />
          <div className="container relative z-10 mx-auto px-6 text-center">
            <span className="inline-flex items-center gap-2 py-2 px-6 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.4em] text-zinc-400 uppercase mb-10 backdrop-blur-xl animate-fade-in">
              {dictionary.header.personal_portfolio}
            </span>
            
            <Suspense fallback={<div className="h-20 w-full animate-pulse bg-white/5 rounded-3xl" />}>
              <BlurText
                text={t.hero_title.toUpperCase()}
                className="font-display text-5xl md:text-8xl font-bold justify-center mb-10 tracking-tighter text-white drop-shadow-2xl"
                delay={40}
                animateBy="letters"
              />
            </Suspense>
            
            <p className="max-w-2xl mx-auto text-zinc-500 text-lg md:text-2xl leading-relaxed font-sans font-light italic">
              {t.page_description}
            </p>
          </div>
        </section>

        {/* --- GRID EDITORIAL (CONSIDERATION) --- */}
        <div className="container mx-auto px-6 py-24 sm:py-32">
          {!hasPosts ? (
               /* ESTADO DE RESILIENCIA: Fallo de datos o CMS vacío */
               <div className="text-center py-48 border border-dashed border-white/10 rounded-[4rem] bg-zinc-900/10 backdrop-blur-sm animate-in fade-in zoom-in duration-1000">
                  <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">
                     {t.empty_state}
                  </p>
               </div>
          ) : (
            <>
              {/* Artículo Destacado (LCP Focused) */}
              {featuredPost && (
                <section className="mb-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <header className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-12 border-b border-white/5 pb-8">
                    <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse" />
                    {t.featured_title}
                  </header>
                  <BlogCard
                      post={featuredPost.metadata}
                      slug={featuredPost.slug}
                      lang={lang}
                      ctaText={t.read_more_cta}
                      priority={true} // Prioridad máxima para Core Web Vitals
                  />
                </section>
              )}

              {/* Listado Secundario Staggered */}
              <section className="animate-in fade-in duration-1000 delay-300">
                <header className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
                  <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
                    {t.all_posts_title}
                  </h2>
                </header>
                
                <div className="grid gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
                  {restPosts.map((post) => (
                    <BlogCard
                      key={post.slug}
                      post={post.metadata}
                      slug={post.slug}
                      lang={lang}
                      ctaText={t.read_more_cta}
                      customImage={post.metadata.ogImage}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Capa Atmosférica de Cierre */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.02),transparent_40%)] pointer-events-none" />
      </main>
    </>
  );
}
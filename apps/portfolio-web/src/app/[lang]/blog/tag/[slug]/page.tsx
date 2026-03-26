/**
 * @file apps/portfolio-web/src/app/[lang]/blog/tag/[slug]/page.tsx
 * @description Orquestador de archivo por etiquetas (taxonomía) del Concierge Journal.
 *              Implementa SSG de alta velocidad, integración con la Fachada Soberana
 *              y normalización de activos bajo estándares de Élite.
 * @version 7.0 - Domain Facade Sync & Syntax Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica mediante el uso de la Fachada de Dominio.
 */
import { i18n } from '../../../../../config/i18n.config.js';
import type { Locale } from '../../../../../config/i18n.config.js';
import { getDictionary } from '../../../../../lib/get-dictionary.js';
import { getPostsByTag, getAllPosts } from '../../../../../lib/blog-api.js';
import { BlogCard } from '../../../../../components/ui/BlogCard.js';
import { BlurText } from '../../../../../components/razBits/BlurText.js';
import type { PostWithSlug } from '../../../../../lib/schemas/blog.schema.js';

/**
 * Propiedades de la página con soporte para parámetros asíncronos (Next.js 15 Standard).
 */
type TagPageProps = {
  params: Promise<{ slug: string; lang: Locale }>;
};

/**
 * GENERACIÓN DE RUTAS ESTÁTICAS (SSG)
 * @pilar VIII: Resiliencia de Build.
 */
export async function generateStaticParams() {
  try {
    const posts = await getAllPosts();
    if (!posts || posts.length === 0) return [];

    const tags = new Set<string>();
    posts.forEach((post: PostWithSlug) => {
      post.metadata.tags.forEach((tag: string) => {
        // Normalización para URLs SEO-Friendly (kebab-case)
        tags.add(tag.toLowerCase().trim().replace(/\s+/g, '-'));
      });
    });

    return i18n.locales.flatMap((lang) =>
      Array.from(tags).map((tagSlug) => ({
        lang,
        slug: tagSlug,
      }))
    );
  } catch (error) {
    console.error('[HEIMDALL][STATIC-GEN] Error crítico en rutas de etiquetas:', error);
    return [];
  }
}

/**
 * Orquestador de Metadatos Soberano.
 * @pilar I: Visión Holística - SEO E-E-A-T.
 */
export async function generateMetadata(props: TagPageProps): Promise<Metadata> {
  const { lang, slug } = await props.params;
  const dictionary = await getDictionary(lang);
  
  const tagName = decodeURIComponent(slug).replace(/-/g, ' ');
  const blogName = dictionary.header.personal_portfolio;

  return {
    title: `${tagName.toUpperCase()} | ${blogName}`,
    description: `${dictionary.blog_page.page_description} - Curaduría: ${tagName}.`,
    alternates: {
      canonical: `/${lang}/blog/tag/${slug}`,
    },
  };
}

/**
 * APARATO PRINCIPAL: TagArchivePage
 */
export default async function TagArchivePage(props: TagPageProps) {
  const { lang, slug } = await props.params;

  /**
   * @pilar X: Rendimiento de Élite.
   * Ejecución paralela para minimizar el Time to First Byte (TTFB).
   */
  const [dictionary, posts] = await Promise.all([
    getDictionary(lang),
    getPostsByTag(slug, lang)
  ]);

  // @pilar VIII: Guardia de Resiliencia ante nulos o fallos del CMS
  if (!posts || posts.length === 0) {
    notFound();
  }

  const t = dictionary.blog_page;
  const tagName = slug.replace(/-/g, ' ');

  /**
   * @pilar VI: Lógica i18n Soberana.
   * Selección de plantilla basada en volumen de resultados.
   */
  const resultsCount = posts.length;
  const descriptionTemplate = resultsCount === 1 
    ? t.tag_results_singular 
    : t.tag_results_plural;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-24 selection:bg-purple-500/30">
      <div className="container mx-auto px-6">
        
        {/* ENCABEZADO EDITORIAL */}
        <header className="mx-auto max-w-4xl text-center mb-24">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-purple-500/5 border border-white/10 text-[10px] font-bold tracking-[0.4em] text-purple-400 uppercase mb-10 animate-fade-in">
            {t.all_posts_title}
          </div>
          
          <BlurText
            text={tagName.toUpperCase()}
            className="font-display text-5xl md:text-8xl font-bold tracking-tighter text-white justify-center mb-10"
            animateBy="letters"
            delay={50}
          />
          
          <p className="text-zinc-500 font-sans text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            {`${descriptionTemplate} ${tagName}.`}
          </p>
        </header>

        {/* GRID DINÁMICO SINCRO CON FACHADA */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: PostWithSlug) => (
            <BlogCard
              key={post.slug}
              post={post.metadata}
              slug={post.slug}
              lang={lang}
              ctaText={t.read_more_cta}
              // ogImage ya viene saneado como string | undefined desde la Fachada
              customImage={post.metadata.ogImage} 
            />
          ))}
        </div>

        {/* FOOTER DE MARCA INSTITUCIONAL */}
        <div className="mt-32 pt-12 border-t border-white/5 flex flex-col items-center">
            <p className="text-[10px] font-mono text-zinc-800 tracking-[0.3em] uppercase">
                Beach Hotel Canasvieiras • Editorial Sanctuary
            </p>
        </div>
      </div>

      {/* Artefacto de atmósfera decorativo */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03),transparent_70%)] pointer-events-none" />
    </main>
  );
}
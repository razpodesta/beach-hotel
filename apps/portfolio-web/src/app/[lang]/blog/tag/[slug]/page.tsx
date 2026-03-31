/**
 * @file apps/portfolio-web/src/app/[lang]/blog/tag/[slug]/page.tsx
 * @description Orquestador de archivo por etiquetas (taxonomía) del Concierge Journal.
 *              Refactorizado: Sincronización atmosférica Day-First, implementación
 *              de ADN Tipográfico v2.0 (Sora/Inter) y optimización SEO E-E-A-T.
 * @version 11.0 - Atmosphere Responsive & Hybrid Typography Sync
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica a las fronteras de Nx.
 */
import { i18n } from '../../../../../config/i18n.config';
import type { Locale } from '../../../../../config/i18n.config';
import { getDictionary } from '../../../../../lib/get-dictionary';
import { getPostsByTag, getAllPosts } from '../../../../../lib/blog-api';
import { BlogCard } from '../../../../../components/ui/BlogCard';
import { BlurText } from '../../../../../components/razBits/BlurText';
import { JsonLdScript } from '../../../../../components/ui/JsonLdScript';
import type { PostWithSlug } from '../../../../../lib/schemas/blog.schema';
//import { cn } from '../../../../../lib/utils/cn';

/**
 * Contrato de parámetros asíncronos (Next.js 15 Standard).
 * @pilar III: Seguridad de Tipos Absoluta.
 */
type TagPageProps = {
  params: Promise<{ slug: string; lang: Locale }>;
};

/**
 * GENERACIÓN DE RUTAS ESTÁTICAS (SSG)
 * @pilar VIII: Resiliencia de Build.
 * @description Descubre y normaliza las taxonomías para pre-renderizado total.
 */
export async function generateStaticParams() {
  console.group('[HEIMDALL][STATIC-GEN] Syncing Editorial Taxonomies');
  try {
    const posts = await getAllPosts();
    if (!posts || posts.length === 0) return [];

    const tags = new Set<string>();
    posts.forEach((post: PostWithSlug) => {
      post.metadata.tags.forEach((tag: string) => {
        /**
         * NORMALIZACIÓN DETERMINISTA: 
         * Sincronizada con el motor de búsqueda de la Fachada.
         */
        const normalized = tag.toLowerCase().trim().replace(/\s+/g, '-');
        tags.add(normalized);
      });
    });

    console.log(`[SUCCESS] ${tags.size} unique taxonomy nodes resolved.`);
    console.groupEnd();

    return i18n.locales.flatMap((lang) =>
      Array.from(tags).map((tagSlug) => ({
        lang,
        slug: tagSlug,
      }))
    );
  } catch (error) {
    console.error('[CRITICAL] Static generation failure in Tag Archive:', error);
    console.groupEnd();
    return [];
  }
}

/**
 * ORQUESTADOR DE METADATOS SOBERANO
 * @pilar I: Visión Holística - SEO E-E-A-T.
 */
export async function generateMetadata(props: TagPageProps): Promise<Metadata> {
  const { lang, slug } = await props.params;
  const dictionary = await getDictionary(lang);
  
  const tagName = decodeURIComponent(slug).replace(/-/g, ' ');
  const journalName = dictionary.blog_page.hero_title;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  return {
    title: `${tagName.toUpperCase()} | ${journalName}`,
    description: `${dictionary.blog_page.page_description} - Curadoria: ${tagName}.`,
    alternates: {
      canonical: `${baseUrl}/${lang}/blog/tag/${slug}`,
    },
    openGraph: {
      title: `${tagName.toUpperCase()} | ${journalName}`,
      description: dictionary.blog_page.page_description,
      type: 'website',
    }
  };
}

/**
 * APARATO PRINCIPAL: TagArchivePage
 * @description Renderiza el catálogo temático con inteligencia atmosférica.
 */
export default async function TagArchivePage(props: TagPageProps) {
  const { lang, slug } = await props.params;

  /**
   * ORQUESTACIÓN PARALELA DE RECURSOS (Pilar X)
   */
  const [dictionary, posts] = await Promise.all([
    getDictionary(lang),
    getPostsByTag(slug, lang)
  ]);

  if (!posts || posts.length === 0) {
    notFound();
  }

  const t = dictionary.blog_page;
  const tagName = decodeURIComponent(slug).replace(/-/g, ' ');

  /**
   * ESTRUCTURA DE DATOS PARA GOOGLE (JSON-LD)
   */
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    headline: `${tagName.toUpperCase()} - ${t.hero_title}`,
    description: `${t.page_description} | Curadoria: ${tagName}`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/blog/tag/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/blog/${post.slug}`
      }))
    }
  };

  const resultsLabel = posts.length === 1 ? t.tag_results_singular : t.tag_results_plural;

  return (
    <>
      <JsonLdScript data={collectionSchema} />
      
      {/* 
          MODO ATMOSFÉRICO:
          Cambiamos bg-[#050505] por bg-background (Oxygen Engine Sync).
      */}
      <main className="min-h-screen bg-background text-foreground pt-32 pb-24 selection:bg-primary/30 transition-colors duration-1000">
        <div className="container mx-auto px-6">
          
          {/* ENCABEZADO EDITORIAL (Voz Sora) */}
          <header className="mx-auto max-w-4xl text-center mb-32 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 border border-border text-[10px] font-bold tracking-[0.4em] text-primary uppercase mb-10 shadow-sm">
              {t.all_posts_title}
            </div>
            
            <BlurText
              text={tagName.toUpperCase()}
              className="font-display text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground justify-center mb-10 drop-shadow-2xl"
              animateBy="letters"
              delay={50}
            />
            
            <p className="text-muted-foreground font-sans text-lg md:text-2xl max-w-2xl mx-auto font-light leading-relaxed italic transition-colors">
              {`${resultsLabel} ${tagName}.`}
            </p>
          </header>

          {/* GRID DINÁMICO (LCP Optimized) */}
          <div className="grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: PostWithSlug, index: number) => (
              <BlogCard
                key={post.slug}
                post={post.metadata}
                slug={post.slug}
                lang={lang}
                ctaText={t.read_more_cta}
                priority={index < 2} // Los primeros 2 elementos cargan con fetchPriority='high'
                customImage={post.metadata.ogImage} 
              />
            ))}
          </div>

          {/* FOOTER DE MARCA (Higiene de Infraestructura) */}
          <div className="mt-40 pt-12 border-t border-border/50 flex flex-col items-center opacity-40">
              <p className="text-[10px] font-mono text-muted-foreground tracking-[0.4em] uppercase">
                  Beach Hotel Canasvieiras • Editorial Sanctuary Node
              </p>
          </div>
        </div>

        {/* Artefacto de atmósfera reactivo */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)] pointer-events-none opacity-[0.02]" />
      </main>
    </>
  );
}
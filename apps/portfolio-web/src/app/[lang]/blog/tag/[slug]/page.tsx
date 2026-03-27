/**
 * @file apps/portfolio-web/src/app/[lang]/blog/tag/[slug]/page.tsx
 * @description Orquestador de archivo por etiquetas (taxonomía) del Concierge Journal.
 *              Implementa SSG de alta velocidad, integración con la Fachada Soberana,
 *              esquemas SEO de colección y normalización de activos de Élite.
 * @version 10.0 - Holistic SEO & Symmetric Tag Normalization
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rutas Relativas Niveladas)
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

/**
 * Contrato de parámetros asíncronos (Next.js 15 Standard).
 */
type TagPageProps = {
  params: Promise<{ slug: string; lang: Locale }>;
};

/**
 * GENERACIÓN DE RUTAS ESTÁTICAS (SSG)
 * @pilar VIII: Resiliencia de Build.
 * @description Descubre y normaliza todas las etiquetas existentes en el CMS.
 */
export async function generateStaticParams() {
  console.group('[HEIMDALL][STATIC-GEN] Discovering Editorial Taxonomies');
  try {
    const posts = await getAllPosts();
    if (!posts || posts.length === 0) return [];

    const tags = new Set<string>();
    posts.forEach((post: PostWithSlug) => {
      post.metadata.tags.forEach((tag: string) => {
        /**
         * NORMALIZACIÓN SIMÉTRICA: 
         * Debe coincidir 1:1 con la lógica de búsqueda del componente.
         */
        const normalized = tag.toLowerCase().trim().replace(/\s+/g, '-');
        tags.add(normalized);
      });
    });

    console.log(`[SUCCESS] ${tags.size} unique tags discovered.`);
    console.groupEnd();

    return i18n.locales.flatMap((lang) =>
      Array.from(tags).map((tagSlug) => ({
        lang,
        slug: tagSlug,
      }))
    );
  } catch (error) {
    console.error('[CRITICAL] Static generation of tag routes failed:', error);
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
 * @description Renderiza el listado de artículos bajo una taxonomía específica.
 */
export default async function TagArchivePage(props: TagPageProps) {
  const { lang, slug } = await props.params;

  /**
   * @pilar X: Rendimiento de Élite.
   * Ejecución paralela para minimizar el TTFB.
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
  const tagName = decodeURIComponent(slug).replace(/-/g, ' ');

  /**
   * ESTRUCTURA DE DATOS PARA GOOGLE (JSON-LD)
   * @pilar I: SEO Técnico - Define la página como una colección temática.
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

  /**
   * @pilar VI: Lógica i18n Soberana.
   */
  const descriptionTemplate = posts.length === 1 
    ? t.tag_results_singular 
    : t.tag_results_plural;

  return (
    <>
      <JsonLdScript data={collectionSchema} />
      
      <main className="min-h-screen bg-[#050505] text-white pt-32 pb-24 selection:bg-purple-500/30">
        <div className="container mx-auto px-6">
          
          {/* ENCABEZADO EDITORIAL */}
          <header className="mx-auto max-w-4xl text-center mb-32 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-purple-500/5 border border-white/5 text-[10px] font-bold tracking-[0.4em] text-purple-400 uppercase mb-10">
              {t.all_posts_title}
            </div>
            
            <BlurText
              text={tagName.toUpperCase()}
              className="font-display text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white justify-center mb-10 drop-shadow-2xl"
              animateBy="letters"
              delay={50}
            />
            
            <p className="text-zinc-500 font-sans text-lg md:text-2xl max-w-2xl mx-auto font-light leading-relaxed italic">
              {`${descriptionTemplate} ${tagName}.`}
            </p>
          </header>

          {/* GRID DINÁMICO SINCRO CON FACHADA */}
          <div className="grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: PostWithSlug, index: number) => (
              <BlogCard
                key={post.slug}
                post={post.metadata}
                slug={post.slug}
                lang={lang}
                ctaText={t.read_more_cta}
                priority={index < 2} // Optimización LCP para los dos primeros elementos
                customImage={post.metadata.ogImage} 
              />
            ))}
          </div>

          {/* FOOTER DE MARCA INSTITUCIONAL */}
          <div className="mt-40 pt-12 border-t border-white/5 flex flex-col items-center opacity-40">
              <p className="text-[10px] font-mono text-zinc-600 tracking-[0.4em] uppercase">
                  Beach Hotel Canasvieiras • Editorial Sanctuary
              </p>
          </div>
        </div>

        {/* Artefacto de atmósfera decorativo */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.02),transparent_70%)] pointer-events-none" />
      </main>
    </>
  );
}
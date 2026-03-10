/**
 * @file apps/portfolio-web/src/app/[lang]/blog/tag/[slug]/page.tsx
 * @description Orquestador de archivo por etiquetas (taxonomía) del Concierge Journal.
 *              Implementa SSG, metadatos semánticos y cumplimiento estricto de arquitectura Nx.
 * @version 5.0
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/**
 * IMPORTACIONES NIVELADAS (Rutas relativas para cumplimiento @nx/enforce-module-boundaries)
 */
import { type Locale, i18n } from '../../../../../config/i18n.config';
import { getDictionary } from '../../../../../lib/get-dictionary';
import { getPostsByTag, getAllPosts } from '../../../../../lib/blog';
import { BlogCard } from '../../../../../components/ui/BlogCard';
import { BlurText } from '../../../../../components/razBits/BlurText';

/**
 * Propiedades de la página con soporte para parámetros asíncronos de Next.js 15.
 */
type TagPageProps = {
  params: Promise<{ slug: string; lang: Locale }>;
};

/**
 * Genera parámetros estáticos (SSG) para todas las combinaciones de idioma y etiqueta.
 * Garantiza que las páginas de archivo se sirvan instantáneamente desde la caché del Edge.
 */
export async function generateStaticParams() {
  const posts = await getAllPosts();
  const tags = new Set<string>();
  
  posts.forEach(post => {
    post.metadata.tags.forEach(tag => {
      // Normalización de slugs para URLs consistentes
      tags.add(tag.toLowerCase().trim().replace(/\s+/g, '-'));
    });
  });

  return i18n.locales.flatMap((lang) =>
    Array.from(tags).map((tagSlug) => ({
      lang,
      slug: tagSlug,
    }))
  );
}

/**
 * Orquestador de Metadatos: Genera títulos y descripciones SEO localizados.
 */
export async function generateMetadata(props: TagPageProps): Promise<Metadata> {
  const { lang, slug } = await props.params;
  const dictionary = await getDictionary(lang);
  const tagName = decodeURIComponent(slug).replace(/-/g, ' ');
  
  const blogName = dictionary.header.personal_portfolio;

  return {
    title: `${tagName.toUpperCase()} | Archivos | ${blogName}`,
    description: `${dictionary.blog_page.page_description} - Explorando artículos sobre ${tagName}.`,
    alternates: {
      canonical: `/${lang}/blog/tag/${slug}`,
    },
    openGraph: {
      title: `${tagName.toUpperCase()} | The Concierge Journal`,
      type: 'website',
    }
  };
}

/**
 * Componente principal: TagArchivePage.
 * Renderiza el listado de artículos filtrados con una estética editorial inmersiva.
 */
export default async function TagArchivePage(props: TagPageProps) {
  const { lang, slug } = await props.params;
  const dictionary = await getDictionary(lang);
  const posts = await getPostsByTag(slug);

  // Si no hay artículos para esta etiqueta, forzamos un 404 semántico.
  if (!posts || posts.length === 0) {
    notFound();
  }

  const tagName = slug.replace(/-/g, ' ');
  const t = dictionary.blog_page;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-24 selection:bg-purple-500/30">
      <div className="container mx-auto px-6">
        
        {/* ENCABEZADO DE SECCIÓN EDITORIAL */}
        <header className="mx-auto max-w-4xl text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/5 border border-purple-500/10 text-[10px] font-bold tracking-[0.4em] text-purple-400 uppercase mb-8 animate-fade-in">
            {t.all_posts_title}
          </div>
          
          <BlurText
            text={tagName.toUpperCase()}
            className="font-display text-5xl md:text-8xl font-bold tracking-tighter text-white justify-center mb-8"
            animateBy="letters"
            delay={50}
          />
          
          <p className="text-zinc-500 font-sans text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            {`Una curaduría exclusiva de ${posts.length} ${posts.length === 1 ? 'artículo' : 'artículos'} centrados en la sofisticación de ${tagName}.`}
          </p>
        </header>

        {/* GRID DINÁMICO DE TARJETAS */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              key={post.slug}
              post={post.metadata}
              slug={post.slug}
              lang={lang}
              ctaText={t.read_more_cta}
            />
          ))}
        </div>

        {/* FOOTER DE NAVEGACIÓN (Resiliencia) */}
        <div className="mt-32 pt-12 border-t border-white/5 flex justify-center">
            <p className="text-[10px] font-mono text-zinc-700 tracking-[0.3em] uppercase">
                Beach Hotel Canasvieiras • Editorial Department
            </p>
        </div>
      </div>

      {/* Decoración de fondo estructural (Glow sutil) */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03),transparent_70%)] pointer-events-none" />
    </main>
  );
}
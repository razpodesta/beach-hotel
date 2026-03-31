/**
 * @file apps/portfolio-web/src/app/[lang]/blog/[slug]/page.tsx
 * @description Orquestador soberano de detalle editorial (The Concierge Journal). 
 *              Refactorizado: Sincronización atmosférica Day-First, purga de 
 *              colores hardcoded y optimización de legibilidad mediante Oxygen Engine.
 * @version 16.0 - Atmosphere Synchronized & Prose Refined
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Sparkles, Clock } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { i18n } from '../../../../config/i18n.config';
import type { Locale } from '../../../../config/i18n.config';
import { getAllPosts, getPostBySlug } from '../../../../lib/blog-api';
import { getDictionary } from '../../../../lib/get-dictionary';
import { JsonLdScript } from '../../../../components/ui/JsonLdScript';
import { ShareButtons } from '../../../../components/ui/ShareButtons';
import { cn } from '../../../../lib/utils/cn';
import { getLocalizedHref } from '../../../../lib/utils/link-helpers';

/**
 * Contrato de propiedades con parámetros asíncronos (Next.js 15 Standard).
 * @pilar III: Seguridad de Tipos Absoluta.
 */
type PostPageProps = {
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

    return i18n.locales.flatMap((lang) =>
      posts.map((post) => ({
        lang,
        slug: post.slug,
      }))
    );
  } catch (error) {
    console.error('[HEIMDALL][CRITICAL] Static generation failure in Journal:', error);
    return [];
  }
}

/**
 * ORQUESTADOR DE METADATOS SOBERANO
 * @pilar I: Visión Holística - SEO E-E-A-T.
 */
export async function generateMetadata(props: PostPageProps): Promise<Metadata> {
  const { slug, lang } = await props.params;
  
  try {
    const [dictionary, post] = await Promise.all([
      getDictionary(lang),
      getPostBySlug(slug, lang)
    ]);

    const journalTitle = dictionary.blog_page.hero_title;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

    if (!post) {
      return { title: `${dictionary.not_found.title} | ${journalTitle}` };
    }

    const { title, description, published_date, ogImage } = post.metadata;
    const finalOgImage = ogImage || `${baseUrl}/images/blog/${slug}.jpg`;

    return {
      title: `${title} | ${journalTitle}`,
      description,
      alternates: { canonical: `${baseUrl}/${lang}/blog/${slug}` },
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: published_date,
        siteName: siteNameResolver(dictionary.header.personal_portfolio),
        images: [{ url: finalOgImage, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [finalOgImage],
      },
    };
  } catch {
    return { title: 'The Concierge Journal' };
  }
}

const siteNameResolver = (name: string) => name || 'Beach Hotel Canasvieiras';

/**
 * APARATO PRINCIPAL: PostPage
 * @description Orquesta la narrativa editorial con renderizado de alta fidelidad.
 */
export default async function PostPage(props: PostPageProps) {
  const { slug, lang } = await props.params;
  
  const [dictionary, post] = await Promise.all([
    getDictionary(lang),
    getPostBySlug(slug, lang)
  ]);

  if (!post) notFound();

  const t = dictionary.blog_page;
  const commonNav = dictionary['nav-links'].nav_links;
  const { title, author, published_date, tags, ogImage, readingTime } = post.metadata;

  const imageUrl = ogImage || `/images/blog/${slug}.jpg`;

  /**
   * ESTRUCTURA DE DATOS PARA GOOGLE (JSON-LD)
   */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: post.metadata.description,
    author: { '@type': 'Person', name: author },
    datePublished: published_date,
    image: imageUrl,
    publisher: {
      '@type': 'Organization',
      name: dictionary.header.personal_portfolio,
      logo: { '@type': 'ImageObject', url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/hotel/icon-192x192.png` }
    }
  };

  const formattedDate = new Date(published_date).toLocaleDateString(lang, { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <>
      <JsonLdScript data={articleSchema} />
      
      {/* 
          ATMOSPHERE SYNC:
          Sustituimos bg-[#050505] por bg-background y text-zinc-300 por text-foreground.
      */}
      <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 pb-24 transition-colors duration-1000">
        <article className="animate-in fade-in duration-1000">
          
          {/* HERO EDITORIAL */}
          <header className="relative w-full pt-32 pb-12 sm:pt-40">
            <div className="container mx-auto max-w-4xl px-6">
              
              <Link 
                href={getLocalizedHref('/blog', lang)}
                className="group inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-all mb-12 outline-none"
              >
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> 
                {t.hero_title}
              </Link>

              <div className="flex flex-wrap gap-2 mb-10">
                {tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-[9px] font-bold tracking-widest text-primary uppercase"
                  >
                    <Sparkles size={10} /> {tag}
                  </span>
                ))}
              </div>

              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] text-foreground tracking-tighter mb-12 drop-shadow-sm transition-colors">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-10 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-20 border-y border-border/50 py-8">
                <div className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-surface border border-border flex items-center justify-center transition-all group-hover:border-primary/40">
                    <User size={16} className="text-primary" />
                  </div>
                  <span className="group-hover:text-foreground transition-colors">{author}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Calendar size={16} className="text-primary" />
                  <time dateTime={published_date}>{formattedDate}</time>
                </div>
                {readingTime && (
                  <div className="flex items-center gap-4 text-primary">
                    <Clock size={16} />
                    <span>{readingTime} MIN</span>
                  </div>
                )}
              </div>
            </div>

            {/* IMAGEN PRINCIPAL (LCP Optimized) */}
            <div className="container mx-auto max-w-6xl px-0 md:px-6">
              <div className="relative h-[55vh] md:h-[75vh] w-full overflow-hidden md:rounded-[4rem] border border-border shadow-luxury transform-gpu bg-surface">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-10000 ease-out hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-80" />
              </div>
            </div>
          </header>

          {/* CUERPO EDITORIAL (Prose Refined) */}
          <div className="container mx-auto max-w-3xl px-6">
            <div className={cn(
              "prose prose-lg md:prose-xl max-w-none font-sans transition-colors duration-1000",
              "prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tighter",
              "prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:font-light",
              "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
              "prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-10 prose-blockquote:rounded-r-3xl prose-blockquote:italic",
              "prose-img:rounded-[2.5rem] prose-img:border prose-img:border-border prose-img:shadow-xl",
              "prose-strong:text-foreground prose-strong:font-bold",
              "dark:prose-invert" // Soporte nativo para modo noche
            )}>
              <MDXRemote source={post.content || ''} />
            </div>

            {/* FOOTER DE ARTÍCULO */}
            <footer className="mt-32 border-t border-border/50 pt-16 flex flex-col md:flex-row items-center justify-between gap-16">
              <ShareButtons title={title} />
              
              <Link 
                href={getLocalizedHref('/#reservas', lang)}
                className="group relative rounded-full bg-foreground px-12 py-6 text-xs font-bold uppercase tracking-[0.3em] text-background transition-all hover:bg-primary hover:text-white shadow-luxury active:scale-95"
              >
                {commonNav.reservas}
              </Link>
            </footer>
          </div>
        </article>
      </main>

      {/* Decoración ambiental adaptativa */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_70%)] pointer-events-none opacity-[0.02]" />
    </>
  );
}
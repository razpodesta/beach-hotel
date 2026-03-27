/**
 * @file apps/portfolio-web/src/app/[lang]/blog/[slug]/page.tsx
 * @description Orquestador soberano de detalle editorial (The Concierge Journal). 
 *              Implementa renderizado de alta fidelidad, integración con la Fachada 
 *              de Dominio, SEO E-E-A-T y navegación localizada resiliente.
 * @version 15.0 - Type-Safe Metadata Sync & Semantic Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rutas Relativas)
 * @pilar V: Adherencia arquitectónica a las fronteras de Nx.
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
    console.error('[HEIMDALL][CRITICAL] Fallo en generateStaticParams del Blog:', error);
    return [];
  }
}

/**
 * ORQUESTADOR DE METADATOS SOBERANO
 * @pilar I: Visión Holística - SEO E-E-A-T & i18n.
 */
export async function generateMetadata(props: PostPageProps): Promise<Metadata> {
  const { slug, lang } = await props.params;
  
  try {
    // Carga paralela para optimizar el análisis del head (Pilar X)
    const [dictionary, post] = await Promise.all([
      getDictionary(lang),
      getPostBySlug(slug, lang)
    ]);

    const journalTitle = dictionary.blog_page.hero_title;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

    // Manejo de metadatos para estado de error localizado
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
        siteName: dictionary.header.personal_portfolio,
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

/**
 * APARATO PRINCIPAL: PostPage
 * @description Orquesta la narrativa editorial con renderizado de alta fidelidad.
 */
export default async function PostPage(props: PostPageProps) {
  const { slug, lang } = await props.params;
  
  // Ejecución paralela de recursos para optimizar el TTFB (Pilar X)
  const [dictionary, post] = await Promise.all([
    getDictionary(lang),
    getPostBySlug(slug, lang)
  ]);

  // @pilar VIII: Guardia de Resiliencia ante datos nulos
  if (!post) {
    notFound();
  }

  const t = dictionary.blog_page;
  const commonNav = dictionary['nav-links'].nav_links;
  const { title, author, published_date, tags, ogImage } = post.metadata;

  /**
   * RESOLUCIÓN DE ACTIVO VISUAL
   * Prioridad: Imagen del CMS > Fallback local determinista.
   */
  const imageUrl = ogImage || `/images/blog/${slug}.jpg`;

  /**
   * ESTRUCTURA DE DATOS PARA GOOGLE (JSON-LD)
   * @pilar I: Autoría y transparencia técnica.
   * @fix TS2322: Sincronizado con JsonLdScript v4.0 (soporta undefined).
   */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: post.metadata.description,
    author: { 
      '@type': 'Person', 
      name: author,
      url: process.env.NEXT_PUBLIC_BASE_URL 
    },
    datePublished: published_date,
    image: imageUrl,
    publisher: {
      '@type': 'Organization',
      name: dictionary.header.personal_portfolio,
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/favicon.ico`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/blog/${slug}`
    }
  };

  const formattedDate = new Date(published_date).toLocaleDateString(lang, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <>
      <JsonLdScript data={articleSchema} />
      
      <main className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-purple-500/30 pb-24">
        <article className="animate-in fade-in duration-1000">
          {/* HERO EDITORIAL */}
          <header className="relative w-full pt-32 pb-12 sm:pt-40">
            <div className="container mx-auto max-w-4xl px-6">
              
              <Link 
                href={getLocalizedHref('/blog', lang)}
                className="group inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all mb-12 outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
              >
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> 
                {t.hero_title}
              </Link>

              <div className="flex flex-wrap gap-2 mb-10">
                {tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/5 border border-purple-500/10 px-4 py-1.5 text-[9px] font-bold tracking-widest text-purple-400 uppercase"
                  >
                    <Sparkles size={10} /> {tag}
                  </span>
                ))}
              </div>

              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] text-white tracking-tighter mb-12 drop-shadow-2xl">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-10 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-20 border-y border-white/5 py-8">
                <div className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center transition-colors group-hover:border-purple-500/30">
                    <User size={16} className="text-purple-500" />
                  </div>
                  <span className="group-hover:text-zinc-300 transition-colors">{author}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Calendar size={16} className="text-pink-500" />
                  <time dateTime={published_date}>{formattedDate}</time>
                </div>
              </div>
            </div>

            {/* IMAGEN PRINCIPAL (Optimized LCP) */}
            <div className="container mx-auto max-w-6xl px-0 md:px-6">
              <div className="relative h-[55vh] md:h-[75vh] w-full overflow-hidden md:rounded-[4rem] border border-white/5 shadow-3xl transform-gpu">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-10000 ease-out hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-transparent opacity-70" />
              </div>
            </div>
          </header>

          {/* CUERPO EDITORIAL */}
          <div className="container mx-auto max-w-3xl px-6">
            <div className={cn(
              "prose prose-invert prose-lg md:prose-xl max-w-none font-sans",
              "prose-headings:font-display prose-headings:font-bold prose-headings:text-zinc-100 prose-headings:tracking-tighter",
              "prose-p:leading-relaxed prose-p:text-zinc-400 prose-p:font-light",
              "prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline prose-a:transition-all",
              "prose-blockquote:border-l-purple-500 prose-blockquote:bg-white/2 prose-blockquote:py-4 prose-blockquote:px-10 prose-blockquote:rounded-r-3xl prose-blockquote:italic",
              "prose-img:rounded-[2.5rem] prose-img:border prose-img:border-white/10 prose-img:shadow-2xl",
              "prose-strong:text-zinc-100 prose-strong:font-bold"
            )}>
              <MDXRemote source={post.content || ''} />
            </div>

            {/* FOOTER DE ARTÍCULO (Conversion Focus) */}
            <footer className="mt-32 border-t border-white/5 pt-16 flex flex-col md:flex-row items-center justify-between gap-16">
              <ShareButtons title={title} />
              
              <Link 
                href={getLocalizedHref('/#reservas', lang)}
                className="group relative rounded-full bg-white px-12 py-6 text-xs font-bold uppercase tracking-[0.3em] text-black transition-all hover:bg-purple-600 hover:text-white shadow-3xl active:scale-95"
              >
                {commonNav.reservas}
              </Link>
            </footer>
          </div>
        </article>
      </main>

      {/* Decoración ambiental */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.02),transparent_70%)] pointer-events-none" />
    </>
  );
}
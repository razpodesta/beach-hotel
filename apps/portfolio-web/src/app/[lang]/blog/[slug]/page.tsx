/**
 * @file apps/portfolio-web/src/app/[lang]/blog/[slug]/page.tsx
 * @description Orquestador de detalle editorial (The Concierge Journal). 
 *              Implementa renderizado de alta fidelidad, integración con la Fachada 
 *              Soberana de Blog y navegación localizada resiliente.
 * @version 13.0 - Nx Module Boundary Compliance (Relative Path Restoration)
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
 * @pilar V: Adherencia arquitectónica. Uso de rutas relativas para cumplir con 
 * las fronteras de módulo de Nx dentro de la misma aplicación.
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
    console.error('[HEIMDALL][CRITICAL] Fallo en generateStaticParams:', error);
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
    const post = await getPostBySlug(slug, lang);
    if (!post) return { title: 'Post Not Found | The Concierge Journal' };

    const { title, description } = post.metadata;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

    return {
      title: `${title} | The Concierge Journal`,
      description,
      alternates: { canonical: `${baseUrl}/${lang}/blog/${slug}` },
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: post.metadata.published_date,
        siteName: 'Beach Hotel Canasvieiras',
      },
    };
  } catch {
    return { title: 'The Concierge Journal' };
  }
}

/**
 * APARATO PRINCIPAL: PostPage
 * @description Orquesta la narrativa editorial con renderizado de alta fidelidad.
 * @pilar XII: MEA/UX - Renderizado editorial optimizado.
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
   * El Shaper de la Fachada ya normalizó 'ogImage' a string | undefined.
   */
  const imageUrl = ogImage || `/images/blog/${slug}.jpg`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    author: { '@type': 'Person', name: author },
    datePublished: published_date,
    image: imageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Beach Hotel Canasvieiras'
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
        <article>
          {/* HERO EDITORIAL */}
          <header className="relative w-full pt-32 pb-12">
            <div className="container mx-auto max-w-4xl px-6">
              
              <Link 
                href={getLocalizedHref('/blog', lang)}
                className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all mb-12"
              >
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> 
                {t.hero_title}
              </Link>

              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/5 border border-purple-500/10 px-4 py-1.5 text-[10px] font-bold tracking-widest text-purple-400 uppercase"
                  >
                    <Sparkles size={10} /> {tag}
                  </span>
                ))}
              </div>

              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] text-white tracking-tighter mb-10">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-8 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-16 border-y border-white/5 py-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                    <User size={14} className="text-purple-500" />
                  </div>
                  <span>{author}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-pink-500" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* IMAGEN PRINCIPAL (Optimized LCP) */}
            <div className="container mx-auto max-w-6xl px-0 md:px-6">
              <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden md:rounded-[3rem] border border-white/5 shadow-2xl">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </header>

          {/* CUERPO EDITORIAL */}
          <div className="container mx-auto max-w-3xl px-6">
            <div className={cn(
              "prose prose-invert prose-lg md:prose-xl max-w-none font-sans",
              "prose-headings:font-display prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tighter",
              "prose-p:leading-relaxed prose-p:text-zinc-400",
              "prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline",
              "prose-blockquote:border-l-purple-500 prose-blockquote:bg-white/2 prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic",
              "prose-img:rounded-3xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl",
              "prose-strong:text-white"
            )}>
              <MDXRemote source={post.content || ''} />
            </div>

            {/* FOOTER DE ARTÍCULO */}
            <footer className="mt-24 border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-12">
              <ShareButtons title={title} />
              
              <Link 
                href={getLocalizedHref('/#reservas', lang)}
                className="group relative rounded-full bg-white px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-purple-600 hover:text-white transition-all shadow-2xl active:scale-95"
              >
                {commonNav.reservas}
              </Link>
            </footer>
          </div>
        </article>
      </main>
    </>
  );
}
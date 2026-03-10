/**
 * @file apps/portfolio-web/src/app/[lang]/blog/[slug]/page.tsx
 * @description Página de detalle editorial (The Concierge Journal). 
 *              Implementa tipografía de lujo, SEO E-E-A-T y cumplimiento estricto de Nx.
 * @version 9.0
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES NIVELADAS (Rutas relativas para cumplimiento @nx/enforce-module-boundaries)
 */
import { i18n, type Locale } from '../../../../config/i18n.config';
import { getAllPosts, getPostBySlug } from '../../../../lib/blog';
import { JsonLdScript } from '../../../../components/ui/JsonLdScript';
import { ShareButtons } from '../../../../components/ui/ShareButtons';

/**
 * Propiedades de la página con soporte para parámetros asíncronos de Next.js 15.
 */
type PostPageProps = {
  params: Promise<{ slug: string; lang: Locale }>;
};

/**
 * Genera parámetros estáticos para optimizar el rendimiento mediante SSG.
 * Pre-renderiza todas las combinaciones de idioma y slug en tiempo de build.
 */
export async function generateStaticParams() {
  const posts = await getAllPosts();

  return i18n.locales.flatMap((lang) =>
    posts.map((post) => ({
      lang,
      slug: post.slug,
    }))
  );
}

/**
 * Orquestador de Metadatos: Construye la identidad social y SEO del artículo.
 */
export async function generateMetadata(props: PostPageProps): Promise<Metadata> {
  const { slug, lang } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Artículo no encontrado | The Concierge Journal' };
  }

  const { title, description, published_date } = post.metadata;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';
  const canonicalUrl = `${baseUrl}/${lang}/blog/${slug}`;
  const imageUrl = `${baseUrl}/images/blog/${slug}.jpg`;

  return {
    title: `${title} | The Concierge Journal`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      type: 'article',
      publishedTime: published_date,
      siteName: 'Beach Hotel Canasvieiras',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Componente principal: PostPage.
 * Renderiza el contenido editorial con un enfoque inmersivo "The Sanctuary".
 */
export default async function PostPage(props: PostPageProps) {
  const { slug, lang } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { title, author, published_date, tags, description } = post.metadata;
  const imageUrl = `/images/blog/${slug}.jpg`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  /**
   * Datos Estructurados JSON-LD (Schema.org) para optimizar el E-E-A-T.
   */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    author: { '@type': 'Person', name: author },
    datePublished: published_date,
    image: `${baseUrl}${imageUrl}`,
    publisher: {
      '@type': 'Organization',
      name: 'Beach Hotel Canasvieiras',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/hotel/logo.png`
      }
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
              
              {/* Navegación Back */}
              <Link 
                href={`/${lang}/blog`}
                className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors mb-12"
              >
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> 
                Return to Journal
              </Link>

              {/* Categorías (Taxonomía) */}
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

              {/* Título de Impacto */}
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] text-white tracking-tighter mb-10">
                {title}
              </h1>

              {/* Metadatos (Autoría y Tiempo) */}
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

            {/* Imagen Principal (LCP Optimized) */}
            <div className="container mx-auto max-w-6xl px-0 md:px-6">
              <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden md:rounded-[3rem] border border-white/5 shadow-2xl">
                <Image
                  src={imageUrl}
                  alt={`Cover para ${title}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </header>

          {/* CUERPO DEL CONTENIDO (MDX Typography) */}
          <div className="container mx-auto max-w-3xl px-6">
            <div className="prose prose-invert prose-lg md:prose-xl max-w-none font-sans 
                            prose-headings:font-display prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tighter
                            prose-p:leading-relaxed prose-p:text-zinc-400
                            prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
                            prose-blockquote:border-l-purple-500 prose-blockquote:bg-white/[0.02] prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic
                            prose-img:rounded-3xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl
                            prose-strong:text-white">
              <MDXRemote source={post.content} />
            </div>

            {/* FOOTER DEL ARTÍCULO (Enganche y Compartición) */}
            <footer className="mt-24 border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-12">
              <ShareButtons title={title} />
              
              <Link 
                href={`/${lang}/#reservas`}
                className="group relative rounded-full bg-white px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95"
              >
                Vivir la Experiencia
              </Link>
            </footer>
          </div>
        </article>
      </main>
    </>
  );
}
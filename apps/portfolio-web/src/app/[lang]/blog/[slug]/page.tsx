// apps/portfolio-web/src/app/[lang]/blog/[slug]/page.tsx

/**
 * @file Página de Detalle Editorial (The Concierge Journal).
 * @version 7.0 - Hospitality Editorial Experience
 * @description Layout inmersivo de revista de lujo. Mejora semántica de SEO (BlogPosting)
 *              y tipografía avanzada mediante Tailwind Typography.
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Sparkles } from 'lucide-react';

// RUTAS RELATIVAS ESTRICTAS (Cumplimiento Nx)
import { i18n, type Locale } from '../../../../config/i18n.config';
import { getAllPosts, getPostBySlug } from '../../../../lib/blog';
import { JsonLdScript } from '../../../../components/ui/JsonLdScript';
import { ShareButtons } from '../../../../components/ui/ShareButtons';

type PostPageProps = {
  params: Promise<{ slug: string; lang: Locale }>;
};

export async function generateStaticParams() {
  const posts = await getAllPosts();

  return i18n.locales.flatMap((lang) =>
    posts.map((post) => ({
      lang,
      slug: post.slug,
    }))
  );
}

export async function generateMetadata(props: PostPageProps): Promise<Metadata> {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return { title: 'Artículo no encontrado | Beach Hotel' };
  }

  const { title, description, published_date } = post.metadata;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4200';
  const canonicalUrl = `${baseUrl}/${params.lang}/blog/${params.slug}`;
  const imageUrl = `${baseUrl}/images/blog/${params.slug}.jpg`;

  return {
    title: `${title} | The Concierge Journal`,
    description: description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: title,
      description: description,
      url: canonicalUrl,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      type: 'article',
      publishedTime: published_date,
      siteName: 'Beach Hotel Canasvieiras',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [imageUrl],
    },
  };
}

export default async function PostPage(props: PostPageProps) {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const { title, author, published_date, tags } = post.metadata;
  const imageUrl = `/images/blog/${params.slug}.jpg`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  // SEO Semántico Enriquecido para Hospitalidad
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    author: { '@type': 'Person', name: author },
    datePublished: published_date,
    image: imageUrl,
    description: post.metadata.description,
    publisher: {
      '@type': 'Organization',
      name: 'Beach Hotel Canasvieiras',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/hotel/logo.png`
      }
    }
  };

  // Formateo de fecha de élite
  const formattedDate = new Date(published_date).toLocaleDateString(params.lang, { 
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
          <header className="relative w-full pt-24 pb-12">
            <div className="container mx-auto max-w-4xl px-4">
              
              {/* Navegación Back */}
              <Link 
                href={`/${params.lang}/blog`}
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-8"
              >
                <ArrowLeft size={14} /> Return to Journal
              </Link>

              {/* Categorías */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                    <Sparkles size={10} /> {tag}
                  </span>
                ))}
              </div>

              {/* Título Principal */}
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-white tracking-tighter mb-8">
                {title}
              </h1>

              {/* Metadatos del Artículo */}
              <div className="flex flex-wrap items-center gap-6 text-xs font-mono uppercase tracking-widest text-zinc-500 mb-12 border-y border-white/10 py-4">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-purple-500" />
                  <span>{author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-pink-500" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Imagen Inmersiva Edge-to-Edge en móvil, redondeada en Desktop */}
            <div className="container mx-auto max-w-5xl px-0 md:px-4">
              <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden md:rounded-3xl border-y md:border border-white/10 shadow-2xl">
                <Image
                  src={imageUrl}
                  alt={`Cover para ${title}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-transparent opacity-80" />
              </div>
            </div>
          </header>

          {/* CONTENIDO MDX (Tipografía Refinada) */}
          <div className="container mx-auto max-w-3xl px-4">
            <div className="prose prose-invert prose-lg md:prose-xl max-w-none font-sans 
                            prose-headings:font-display prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tight
                            prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
                            prose-blockquote:border-l-purple-500 prose-blockquote:bg-white/5 prose-blockquote:py-1 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
                            prose-img:rounded-2xl prose-img:border prose-img:border-white/10
                            prose-strong:text-white">
              <MDXRemote source={post.content} />
            </div>

            {/* FOOTER DEL ARTÍCULO */}
            <footer className="mt-20 border-t border-white/10 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <ShareButtons title={title} />
              
              {/* Botón Call to Action para Reservar */}
              <Link 
                href={`/${params.lang}/#reservas`}
                className="rounded-full bg-white px-8 py-3 text-xs font-bold uppercase tracking-widest text-black hover:scale-105 transition-transform"
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
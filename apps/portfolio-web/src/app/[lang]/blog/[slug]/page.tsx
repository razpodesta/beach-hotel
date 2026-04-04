/**
 * @file apps/portfolio-web/src/app/[lang]/blog/[slug]/page.tsx
 * @description Orquestador soberano de detalle editorial.
 *              Refactorizado: Normalización de importaciones relativas (Nx Boundaries),
 *              corrección de contratos de tipo SSoT y blindaje estático.
 * @version 19.0 - Architectural Boundary Compliance
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Sparkles, Clock } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTURA (Fronteras Nx)
 */
import { i18n, type Locale } from '../../../../config/i18n.config';
import { getDictionary } from '../../../../lib/get-dictionary';
import { getAllPosts, getPostBySlug } from '../../../../lib/blog-api';
//import { BlogCard } from '../../../../components/ui/BlogCard';
import { JsonLdScript } from '../../../../components/ui/JsonLdScript';
import { ShareButtons } from '../../../../components/ui/ShareButtons';
import { cn } from '../../../../lib/utils/cn';
import { getLocalizedHref } from '../../../../lib/utils/link-helpers';
//import type { PostWithSlug } from '../../../../lib/schemas/blog.schema';

/**
 * @pilar VIII: Resiliencia de Infraestructura.
 * Forzamos renderizado estático.
 */
export const dynamic = 'force-static';
export const revalidate = false;

interface PostPageProps {
  params: Promise<{ slug: string; lang: Locale }>;
}

export async function generateStaticParams() {
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1') {
    return []; 
  }

  try {
    const posts = await getAllPosts().catch(() => []);
    return i18n.locales.flatMap((lang) => 
      posts.map((post) => ({ lang, slug: post.slug }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata(props: PostPageProps): Promise<Metadata> {
  const { slug, lang } = await props.params;
  
  try {
    const [dictionary, post] = await Promise.all([
      getDictionary(lang).catch(() => ({ blog_page: { hero_title: 'Journal' } })),
      getPostBySlug(slug, lang)
    ]);

    if (!post) return { title: 'Not Found' };

    return { title: `${post.metadata.title} | ${dictionary.blog_page.hero_title}`, description: post.metadata.description };
  } catch {
    return { title: 'Journal' };
  }
}

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
  const articleTags = Array.isArray(tags) ? tags : [];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    author: { '@type': 'Person', name: author },
    datePublished: published_date,
    image: imageUrl
  };

  const formattedDate = new Date(published_date).toLocaleDateString(lang, { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <>
      <JsonLdScript data={articleSchema} />
      
      <main className="min-h-screen bg-background text-foreground pb-24 transition-colors duration-1000">
        <article className="animate-in fade-in duration-1000">
          <header className="relative w-full pt-32 pb-12 sm:pt-40">
            <div className="container mx-auto max-w-4xl px-6">
              <Link 
                href={getLocalizedHref('/blog', lang)}
                className="group inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-all mb-12 outline-none"
              >
                <ArrowLeft size={14} /> {t.hero_title}
              </Link>

              {articleTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-10">
                  {articleTags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-[9px] font-bold tracking-widest text-primary uppercase">
                      <Sparkles size={10} /> {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tighter mb-12">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-10 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-20 border-y border-border/50 py-8">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-surface border border-border flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <span>{author}</span>
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

            <div className="container mx-auto max-w-6xl px-0 md:px-6">
              <div className="relative h-[55vh] md:h-[75vh] w-full overflow-hidden md:rounded-[4rem] border border-border bg-surface">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  priority
                />
              </div>
            </div>
          </header>

          <div className="container mx-auto max-w-3xl px-6">
            <div className={cn("prose prose-lg md:prose-xl max-w-none font-sans dark:prose-invert")}>
              <MDXRemote source={post.content || ''} />
            </div>

            <footer className="mt-32 border-t border-border/50 pt-16 flex flex-col md:flex-row items-center justify-between gap-16">
              <ShareButtons title={title} />
              <Link 
                href={getLocalizedHref('/#reservas', lang)}
                className="rounded-full bg-foreground px-12 py-6 text-xs font-bold uppercase tracking-[0.3em] text-background hover:bg-primary transition-all"
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
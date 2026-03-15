/**
 * @file apps/portfolio-web/src/app/[lang]/blog/page.tsx
 * @description Orquestador del Hub Editorial (The Concierge Journal). 
 *              Refactorizado para resiliencia absoluta en build estático.
 * @version 10.2 - Build-Safe Resilience
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import { getDictionary } from '../../../lib/get-dictionary';
import { getAllPosts } from '../../../lib/blog';
import { BlogCard } from '../../../components/ui/BlogCard';
import { BlurText } from '../../../components/razBits/BlurText';
import { type Locale, i18n } from '../../../config/i18n.config';
import type { PostWithSlug } from '../../../lib/schemas/blog.schema';

type BlogIndexProps = {
  params: Promise<{ lang: Locale }>;
};

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: BlogIndexProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.blog_page;

  return {
    title: t.page_title,
    description: t.page_description,
    openGraph: {
      title: t.page_title,
      description: t.page_description,
      type: 'website',
      siteName: 'The Concierge Journal',
    }
  };
}

export default async function BlogIndexPage(props: BlogIndexProps) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.blog_page;

  // @pilar VIII: Resiliencia de datos absoluta.
  let posts: PostWithSlug[] = [];
  let isCmsAvailable = true;

  try {
    posts = await getAllPosts();
  } catch (error) {
    isCmsAvailable = false;
    console.error('[HEIMDALL][CRITICAL] CMS Inaccesible durante el renderizado.', error);
  }
  
  const hasPosts = posts.length > 0;
  const featuredPost = hasPosts ? posts[0] : null;
  const restPosts = hasPosts ? posts.slice(1) : [];

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      
      {/* 1. HEADER EDITORIAL */}
      <section className="relative overflow-hidden pt-40 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.12),transparent_60%)] pointer-events-none" />
        <div className="container relative z-10 mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 py-2 px-6 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.4em] text-zinc-400 uppercase mb-10 backdrop-blur-xl animate-fade-in">
            {dictionary.header.personal_portfolio}
          </span>
          <BlurText
            text={t.hero_title.toUpperCase()}
            className="font-display text-5xl md:text-8xl font-bold justify-center mb-10 tracking-tighter text-white"
            delay={40}
            animateBy="letters"
          />
        </div>
      </section>

      <div className="container mx-auto px-6 pb-32">
        {/* 2. GESTIÓN DE ESTADOS: Sincronización con disponibilidad de CMS */}
        {!isCmsAvailable ? (
             <div className="text-center py-48 border border-white/5 rounded-[4rem] bg-zinc-900/20">
                <p className="text-zinc-400 font-mono text-sm uppercase tracking-[0.3em]">
                   {dictionary.not_found.description}
                </p>
             </div>
        ) : (
          <>
            {featuredPost && (
              <section className="mb-32">
                <header className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-12 border-b border-white/5 pb-8">
                  <div className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse" />
                  {t.featured_title}
                </header>
                <BlogCard
                    post={featuredPost.metadata}
                    slug={featuredPost.slug}
                    lang={lang}
                    ctaText={t.read_more_cta}
                    priority={true}
                />
              </section>
            )}

            <section>
              <header className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
                <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
                  {t.all_posts_title}
                </h2>
              </header>
              
              {hasPosts ? (
                <div className="grid gap-x-16 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
                  {restPosts.map((post) => (
                    <BlogCard
                      key={post.slug}
                      post={post.metadata}
                      slug={post.slug}
                      lang={lang}
                      ctaText={t.read_more_cta}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 border border-dashed border-white/5 rounded-[4rem] bg-white/1">
                  <p className="text-zinc-700 font-mono text-xs uppercase tracking-[0.5em] animate-pulse">
                    {t.empty_state}
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
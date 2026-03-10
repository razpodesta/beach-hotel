// RUTA: apps/portfolio-web/src/app/[lang]/blog/page.tsx

/**
 * @file The Concierge Journal (Hub de Contenidos).
 * @version 3.0 - Hospitality Rebranding & Full i18n
 * @description Diseño inmersivo de revista digital. Cero textos quemados.
 */

import type { Metadata } from 'next';
import { getDictionary } from '../../../lib/get-dictionary';
import { getAllPosts } from '../../../lib/blog';
import { BlogCard } from '../../../components/ui/BlogCard';
import { BlurText } from '../../../components/razBits/BlurText';
import { type Locale, i18n } from '../../../config/i18n.config';

type BlogIndexProps = {
  params: Promise<{ lang: Locale }>;
};

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: BlogIndexProps): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  return {
    title: dictionary.blog_page.page_title,
    description: dictionary.blog_page.page_description,
  };
}

export default async function BlogIndexPage(props: BlogIndexProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  const t = dictionary.blog_page;

  const posts = await getAllPosts();
  const [featuredPost, ...restPosts] = posts;

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      {/* HEADER INMERSIVO */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent_50%)]" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase mb-6 backdrop-blur-md">
            BEACH HOTEL CANASVIEIRAS
          </span>
          
          <BlurText
            text={t.hero_title}
            className="font-display text-5xl md:text-7xl font-bold justify-center mb-6 tracking-tighter"
            delay={50}
          />
          
          <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl leading-relaxed font-sans">
            {t.page_description}
          </p>
        </div>
      </section>

      {/* CONTENIDO DEL JOURNAL */}
      <div className="container mx-auto px-4 pb-24">
        {featuredPost && (
          <section className="mb-24">
            <h2 className="flex items-center gap-3 text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-8 border-b border-white/5 pb-4">
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              {t.featured_title}
            </h2>
            <div className="transform transition-all hover:scale-[1.01] duration-500 shadow-2xl">
                <BlogCard
                    post={featuredPost.metadata}
                    slug={featuredPost.slug}
                    lang={params.lang}
                    ctaText={t.read_more_cta}
                />
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-8 border-b border-white/5 pb-4">
            {t.all_posts_title}
          </h2>
          
          {restPosts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {restPosts.map((post) => (
                <BlogCard
                  key={post.slug}
                  post={post.metadata}
                  slug={post.slug}
                  lang={params.lang}
                  ctaText={t.read_more_cta}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
              <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
                {t.empty_state}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
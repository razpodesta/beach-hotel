// apps/portfolio-web/src/app/[lang]/blog/page.tsx

/**
 * @file Hub de Contenidos del Blog.
 * @version 2.1 - Lint Fixed
 * @description Corrección de rutas relativas (3 niveles).
 */

import type { Metadata } from 'next';

// CORRECCIÓN: 3 niveles hacia arriba
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
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-zinc-900/50 border border-zinc-800 text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-4 backdrop-blur-md">
            {t.page_title.split('|')[0]}
          </span>
          <BlurText
            text="Bitácora de Ingeniería"
            className="font-display text-4xl md:text-6xl font-bold justify-center mb-6"
            delay={50}
          />
          <p className="max-w-2xl mx-auto text-zinc-400 text-lg leading-relaxed font-sans">
            {t.page_description}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24">
        {featuredPost && (
          <section className="mb-20">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8 border-b border-zinc-800 pb-2">
              {t.featured_title}
            </h2>
            <div className="transform transition-all hover:scale-[1.01] duration-500">
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
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8 border-b border-zinc-800 pb-2">
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
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
              <p className="text-zinc-500">No hay más artículos disponibles en este momento.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

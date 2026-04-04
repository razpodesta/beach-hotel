/**
 * @file apps/portfolio-web/src/app/[lang]/blog/page.tsx
 * @description Orquestador soberano del Hub Editorial (The Concierge Journal). 
 *              Refactorizado: Blindaje de renderizado estático contra acceso a variables de entorno,
 *              optimización de Core Web Vitals (LCP) y blindaje de tipos Next.js 15.
 * @version 16.0 - Build Hardened & Atmosphere Responsive
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { getDictionary } from '../../../lib/get-dictionary';
import { getAllPosts } from '../../../lib/blog-api';
import type { PostWithSlug } from '../../../lib/blog-api';
import { BlogCard } from '../../../components/ui/BlogCard';
import { BlurText } from '../../../components/razBits/BlurText';
import { JsonLdScript } from '../../../components/ui/JsonLdScript';
import { type Locale, i18n } from '../../../config/i18n.config';

/**
 * @pilar VIII: Resiliencia de Infraestructura.
 * Forzamos la naturaleza estática para el Build de Vercel.
 */
export const dynamic = 'force-static';
export const revalidate = false;

type BlogIndexProps = {
  params: Promise<{ lang: Locale }>;
};

export async function generateStaticParams() {
  return i18n.locales.map((lang: Locale) => ({ lang }));
}

export async function generateMetadata(props: BlogIndexProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang).catch(() => ({ 
    blog_page: { page_title: 'Journal', page_description: '' },
    header: { personal_portfolio: 'Beach Hotel' }
  }));
  const t = dictionary.blog_page;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  return {
    title: t.page_title,
    description: t.page_description,
    alternates: { canonical: `${baseUrl}/${lang}/blog` },
    openGraph: {
      title: t.page_title,
      description: t.page_description,
      url: `${baseUrl}/${lang}/blog`,
      type: 'website',
      siteName: dictionary.header.personal_portfolio,
    }
  };
}

export default async function BlogIndexPage(props: BlogIndexProps) {
  const { lang } = await props.params;

  /**
   * ORQUESTACIÓN PARALELA DE RECURSOS
   * @pilar X: TTFB Minimization.
   */
  const [dictionary, posts] = await Promise.all([
    getDictionary(lang),
    /**
     * @pilar VIII: Guardia de Resiliencia.
     * getAllPosts ya contiene la lógica de fallback a Mocks si el clúster falla
     * o si estamos en entorno de build.
     */
    getAllPosts(lang).catch((error) => {
      console.error('[HEIMDALL][CRITICAL] Editorial link failed. Entering Local Sanctuary mode.', error);
      return [] as PostWithSlug[]; 
    })
  ]);

  const t = dictionary.blog_page;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  const blogHubSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": t.hero_title,
    "description": t.page_description,
    "url": `${baseUrl}/${lang}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": dictionary.header.personal_portfolio,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/hotel/icon-192x192.png`
      }
    }
  };

  const hasPosts = posts.length > 0;
  const featuredPost = hasPosts ? posts[0] : null;
  const restPosts = hasPosts ? posts.slice(1) : [];

  return (
    <>
      <JsonLdScript data={blogHubSchema} />
      
      <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 transition-colors duration-1000">
        
        <section className="relative overflow-hidden pt-40 pb-20 border-b border-border/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-primary),transparent_60%)] pointer-events-none opacity-[0.05]" />
          
          <div className="container relative z-10 mx-auto px-6 text-center">
            <span className="inline-flex items-center gap-3 py-2 px-6 rounded-full bg-surface border border-border text-[10px] font-bold tracking-[0.4em] text-primary uppercase mb-10 shadow-sm animate-fade-in">
              {dictionary.header.personal_portfolio}
            </span>
            
            <Suspense fallback={<div className="h-20 w-full animate-pulse bg-surface rounded-3xl" />}>
              <BlurText
                text={t.hero_title.toUpperCase()}
                className="font-display text-5xl md:text-8xl font-bold justify-center mb-10 tracking-tighter text-foreground drop-shadow-2xl"
                delay={40}
                animateBy="letters"
              />
            </Suspense>
            
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-2xl leading-relaxed font-sans font-light italic">
              {t.page_description}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-6 py-24 sm:py-32">
          {!hasPosts ? (
               <div className="text-center py-48 border border-dashed border-border rounded-[4rem] bg-surface/30 backdrop-blur-sm animate-in fade-in zoom-in duration-1000">
                  <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">
                     {t.empty_state}
                  </p>
               </div>
          ) : (
            <>
              {featuredPost && (
                <section className="mb-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <header className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-12 border-b border-border/50 pb-8">
                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)] animate-pulse" />
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

              <section className="animate-in fade-in duration-1000 delay-300">
                <header className="flex items-center justify-between mb-16 border-b border-border/50 pb-8">
                  <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                    {t.all_posts_title}
                  </h2>
                </header>
                
                <div className="grid gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
                  {restPosts.map((post) => (
                    <BlogCard
                      key={post.slug}
                      post={post.metadata}
                      slug={post.slug}
                      lang={lang}
                      ctaText={t.read_more_cta}
                      customImage={post.metadata.ogImage}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,var(--color-accent),transparent_40%)] pointer-events-none opacity-[0.02]" />
      </main>
    </>
  );
}
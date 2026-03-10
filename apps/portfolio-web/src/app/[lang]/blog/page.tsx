/**
 * @file apps/portfolio-web/src/app/[lang]/blog/page.tsx
 * @description Punto de entrada del Hub Editorial: The Concierge Journal. 
 *              Implementa jerarquía de lujo, SSG y cumplimiento estricto de Nx.
 * @version 9.0
 * @author Raz Podestá - MetaShark Tech
 */

import type { Metadata } from 'next';

/**
 * IMPORTACIONES NIVELADAS (Rutas relativas para cumplimiento @nx/enforce-module-boundaries)
 */
import { getDictionary } from '../../../lib/get-dictionary';
import { getAllPosts } from '../../../lib/blog';
import { BlogCard } from '../../../components/ui/BlogCard';
import { BlurText } from '../../../components/razBits/BlurText';
import { type Locale, i18n } from '../../../config/i18n.config';

/**
 * Propiedades del orquestador de blog con soporte para Next.js 15.
 */
type BlogIndexProps = {
  params: Promise<{ lang: Locale }>;
};

/**
 * Genera parámetros estáticos para optimizar el despliegue mediante SSG.
 */
export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

/**
 * Orquestador de Metadatos de Élite.
 * Construye la identidad SEO de la revista digital.
 */
export async function generateMetadata(props: BlogIndexProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);

  return {
    title: dictionary.blog_page.page_title,
    description: dictionary.blog_page.page_description,
    openGraph: {
      title: dictionary.blog_page.page_title,
      description: dictionary.blog_page.page_description,
      type: 'website',
      siteName: 'The Concierge Journal',
    }
  };
}

/**
 * Componente principal: BlogIndexPage.
 * Gestiona la lógica editorial dividiendo el contenido en destacados y archivo.
 */
export default async function BlogIndexPage(props: BlogIndexProps) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  const t = dictionary.blog_page;

  // Obtención de datos desde el adaptador soberano de CMS
  const posts = await getAllPosts();
  
  // Estrategia Editorial: El artículo más reciente es el "Featured"
  const [featuredPost, ...restPosts] = posts;

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      
      {/* 1. HEADER EDITORIAL INMERSIVO */}
      <section className="relative overflow-hidden pt-40 pb-20">
        {/* Glow atmosférico optimizado */}
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
          
          <p className="max-w-2xl mx-auto text-zinc-500 text-lg md:text-2xl leading-relaxed font-sans font-light">
            {t.page_description}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-32">
        
        {/* 2. SECCIÓN DESTACADA (FEATURED) */}
        {featuredPost && (
          <section className="mb-32">
            <header className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-12 border-b border-white/5 pb-8">
              <div className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              {t.featured_title}
            </header>
            
            <div className="group relative transition-all duration-1000 transform-gpu">
                <BlogCard
                    post={featuredPost.metadata}
                    slug={featuredPost.slug}
                    lang={lang}
                    ctaText={t.read_more_cta}
                />
            </div>
          </section>
        )}

        {/* 3. ARCHIVO DEL JOURNAL */}
        <section>
          <header className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
              {t.all_posts_title}
            </h2>
            <span className="text-[10px] font-mono text-zinc-700 tracking-widest uppercase">
               EST. 2026 • VOL. 01
            </span>
          </header>
          
          {restPosts.length > 0 ? (
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
          ) : !featuredPost && (
            <div className="text-center py-48 border border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
              <p className="text-zinc-700 font-mono text-xs uppercase tracking-[0.5em]">
                {t.empty_state}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Decoración de fondo estructural */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.03),transparent_40%)] pointer-events-none" />
    </main>
  );
}
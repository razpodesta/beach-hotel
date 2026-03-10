// apps/portfolio-web/src/app/[lang]/blog/tag/[slug]/page.tsx

/**
 * @file Página de Archivo de Etiquetas (Tags).
 * @version 3.1 - Lint Fixed
 * @description Corrección de rutas relativas (5 niveles).
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// CORRECCIÓN: 5 niveles hacia arriba
import { type Locale } from '../../../../../config/i18n.config';
import { getDictionary } from '../../../../../lib/get-dictionary';
import { getPostsByTag } from '../../../../../lib/blog';
import { BlogCard } from '../../../../../components/ui/BlogCard';
import { BlurText } from '../../../../../components/razBits/BlurText';

type TagPageProps = {
  params: Promise<{ slug: string; lang: Locale }>;
};

export async function generateMetadata(props: TagPageProps): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  const tagName = decodeURIComponent(params.slug).replace(/-/g, ' ');
  const blogTitle = dictionary.blog_page.page_title.split(' | ')[1] || 'Blog';

  return {
    title: `Artículos sobre "${tagName}" | ${blogTitle}`,
    description: `Explora todos los artículos, tutoriales y reflexiones sobre ${tagName}.`,
    alternates: {
      canonical: `/${params.lang}/blog/tag/${params.slug}`,
    },
  };
}

export default async function TagPage(props: TagPageProps) {
  const params = await props.params;
  const { lang, slug } = params;
  const dictionary = await getDictionary(lang);
  const posts = await getPostsByTag(slug);

  if (!posts || posts.length === 0) {
    notFound();
  }

  const tagName = slug.replace(/-/g, ' ');

  return (
    <main className="container mx-auto px-4 py-20 sm:py-24">
      <header className="mx-auto max-w-3xl text-center mb-16">
        <p className="font-semibold text-purple-400">ARCHIVO DE ETIQUETA</p>
        <BlurText
          text={tagName}
          className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl justify-center capitalize"
        />
        <p className="mt-4 text-zinc-400">
          {`Explorando ${posts.length} ${posts.length === 1 ? 'artículo' : 'artículos'} relacionados.`}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard
            key={post.slug}
            post={post.metadata}
            slug={post.slug}
            lang={lang}
            ctaText={dictionary.blog_page.read_more_cta}
          />
        ))}
      </div>
    </main>
  );
}

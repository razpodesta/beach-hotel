// RUTA: apps/portfolio-web/src/components/ui/BlogCard.tsx
// VERSIÓN: 1.1 - Sintaxis Canónica y Alineación con Tailwind Moderno.
// DESCRIPCIÓN: Se refactoriza el componente para reemplazar las clases 'flex-grow'
//              por su forma canónica y más concisa, 'grow'. Esta mejora alinea
//              el código con las mejores prácticas de Tailwind CSS v4+, resuelve
//              las advertencias del linter y mantiene la pureza sintáctica del proyecto.
//              La lógica de internacionalización y la estructura de datos permanecen intactas.

'use client'; // Necesario para el uso de Framer Motion

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { BlogPost } from '@/lib/schemas/blog.schema';

type BlogCardProps = {
  post: BlogPost;
  slug: string;
  lang: string;
  ctaText: string;
};

export function BlogCard({ post, slug, lang, ctaText }: BlogCardProps) {
  // Convención para la ruta de la imagen del post.
  const imageUrl = `/images/blog/${slug}.jpg`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10"
    >
      <Link href={`/${lang}/blog/${slug}`} className="relative block h-52 w-full" aria-label={`Leer más sobre ${post.title}`}>
        <Image
          src={imageUrl}
          alt={`Imagen del artículo ${post.title}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      {/* --- INICIO DE LA MEJORA DE SINTAXIS (1/2) --- */}
      <div className="flex grow flex-col p-6">
        <h3 className="font-display text-xl font-bold text-white transition-colors group-hover:text-purple-400">
          <Link href={`/${lang}/blog/${slug}`}>{post.title}</Link>
        </h3>

        {/* --- INICIO DE LA MEJORA DE SINTAXIS (2/2) --- */}
        <p className="mt-3 grow text-sm text-zinc-400">{post.description}</p>

        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
          <span>{post.author}</span>
          <span>{post.published_date}</span>
        </div>
      </div>

      <div className="border-t border-zinc-800 p-4">
        <Link href={`/${lang}/blog/${slug}`} className="text-sm font-bold text-purple-400 transition-colors hover:text-white">
          {ctaText}
        </Link>
      </div>
    </motion.div>
  );
}

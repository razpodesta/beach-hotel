// RUTA: apps/portfolio-web/src/components/ui/ProjectCard.tsx
// VERSIÓN: 2.1 - Sintaxis Canónica de Tailwind CSS.
// DESCRIPCIÓN: Se refactoriza el componente para reemplazar las clases 'flex-grow'
//              por su forma canónica y más concisa, 'grow'. Esto resuelve las
//              advertencias del linter y alinea el código con las mejores prácticas
//              modernas de Tailwind CSS, manteniendo la pureza sintáctica del proyecto.

'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github } from 'lucide-react';
import type { Project } from '../../lib/types';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800/50 transition-all duration-300 hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/10"
    >
      <div className="relative h-52 w-full">
        <Image
          src={project.imageUrl}
          alt={`Imagen del proyecto ${project.title}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* --- INICIO DE LA MEJORA DE SINTAXIS (1/2) --- */}
      <div className="flex grow flex-col p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-100">{project.title}</h3>
          {project.codeUrl && (
            <Link
              href={project.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver el código de ${project.title} en GitHub`}
              className="p-2 text-zinc-400 transition-colors hover:text-white"
            >
              <Github size={20} />
            </Link>
          )}
        </div>

        {/* --- INICIO DE LA MEJORA DE SINTAXIS (2/2) --- */}
        <p className="mt-2 grow text-sm text-zinc-400">{project.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {project.liveUrl && project.liveUrl !== '#' && (
        <div className="flex items-center justify-end gap-2 border-t border-zinc-700 p-4">
          <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white">
            <ExternalLink size={16} /> <span className="text-sm">Demo</span>
          </Link>
        </div>
      )}
    </motion.div>
  );
}

// RUTA: apps/portfolio-web/src/components/ui/ProjectCard.tsx

/**
 * @file Tarjeta de Proyecto (ProjectCard)
 * @version 3.0 - CMS-Ready & Semantic Design
 * @description Tarjeta altamente optimizada con soporte para integración Payload CMS.
 *              Utiliza tokens semánticos para adaptabilidad automática a temas.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import type { Project } from '../../lib/types';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300",
        "hover:border-primary hover:shadow-2xl hover:shadow-primary/10",
        className
      )}
    >
      {/* Imagen optimizada para LCP */}
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="flex grow flex-col p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-display font-bold text-card-foreground">{project.title}</h3>
          {project.codeUrl && (
            <Link
              href={project.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver código de ${project.title}`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Github size={18} />
            </Link>
          )}
        </div>

        <p className="grow text-sm text-muted-foreground leading-relaxed">{project.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span 
              key={tag} 
              className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {project.liveUrl && project.liveUrl !== '#' && (
        <div className="border-t border-border p-4 bg-muted/20">
          <Link 
            href={project.liveUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold text-primary hover:bg-muted transition-colors"
          >
            <ExternalLink size={16} /> <span>Demo</span>
          </Link>
        </div>
      )}
    </motion.article>
  );
}
/**
 * @file ProjectCard.tsx
 * @description Aparato visual de alta fidelidad para activos digitales.
 *              Refactorizado: Sincronización total con el Manifiesto Day-First,
 *              clases canónicas Tailwind v4 y trazabilidad forense Heimdall.
 * @version 5.0 - Atmosphere Master & Zero Hardcode
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github, Cpu, Star, ArrowUpRight } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../lib/utils/cn';
import type { 
  ProjectEntity, 
  ProjectDetailsDictionary 
} from '../../lib/schemas/project_details.schema';
import { ProjectTechModal } from '../projects/ProjectTechModal';

/**
 * @interface ProjectCardProps
 */
interface ProjectCardProps {
  /** Entidad del proyecto validada por SSoT */
  project: ProjectEntity;
  /** Diccionario de etiquetas técnicas */
  dictionary: ProjectDetailsDictionary;
  className?: string;
}

/**
 * APARATO: ProjectCard
 * @description Renderiza una tarjeta de activo digital adaptativa a la atmósfera global.
 */
export function ProjectCard({ project, dictionary, className }: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Inspección
   * @pilar IV: Registra el interés técnico del usuario en el activo.
   */
  const handleOpenSpecs = useCallback(() => {
    const traceId = `inspect_${project.slug}_${Date.now()}`;
    console.group(`[HEIMDALL][UX] Asset Inspection: ${traceId}`);
    console.log(`Target: ${project.title}`);
    console.log(`Reputation_Weight: ${project.reputationWeight} RZB`);
    console.groupEnd();
    setIsModalOpen(true);
  }, [project.slug, project.title, project.reputationWeight]);

  const handleCloseSpecs = useCallback(() => setIsModalOpen(false), []);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        /**
         * @pilar VII: Theming Soberano
         * Cambiamos zinc por 'bg-surface/40' y 'border-border'.
         */
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-4xl border border-border/50 bg-surface/40 backdrop-blur-md transition-all duration-1000",
          "hover:border-primary/30 hover:shadow-primary/5 shadow-2xl transform-gpu",
          className
        )}
      >
        {/* 1. MEDIA LAYER (Atmosphere Aware) */}
        <div className="relative h-64 w-full overflow-hidden bg-background transition-colors duration-1000">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-2000 ease-out group-hover:scale-105 brightness-100 [data-theme='dark']:brightness-[0.8]"
            sizes="(max-width: 768px) 100vw, 500px"
            priority={false}
          />
          
          {/* Atmosphere Overlay Adaptativo */}
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-90 transition-colors duration-1000" />
          
          {/* BADGES SUPERIORES */}
          <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-background/60 backdrop-blur-xl border border-border/40 px-4 py-1.5 text-[9px] font-bold text-yellow-500 uppercase tracking-widest shadow-xl">
            <Star size={12} className="fill-yellow-500" />
            {project.reputationWeight} RZB
          </div>

          <button 
            onClick={handleOpenSpecs}
            className="absolute top-6 right-6 p-3 rounded-full bg-surface/80 backdrop-blur-xl border border-border/60 text-foreground hover:bg-primary hover:text-white transition-all active:scale-90 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={dictionary.label_tech_stack}
          >
            <Cpu size={18} />
          </button>
        </div>

        {/* 2. NARRATIVE LAYER (Contrast Optimized) */}
        <div className="flex grow flex-col p-8 md:p-10 relative z-10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors duration-500">
              {project.title}
            </h3>
            {project.codeUrl && (
              <Link 
                href={project.codeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={dictionary.label_source_code}
                onClick={() => console.log(`[HEIMDALL][UX] Source Code Access: ${project.slug}`)}
              >
                <Github size={20} />
              </Link>
            )}
          </div>

          <p className="grow text-sm md:text-base text-muted-foreground font-sans font-light leading-relaxed line-clamp-3 mb-10 transition-colors duration-1000">
            {project.description}
          </p>

          {/* TECH STACK (Pilar VII) */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tech_stack.slice(0, 3).map((tech) => (
              <span 
                key={tech} 
                className="rounded-xl bg-foreground/5 border border-border/40 px-4 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest transition-all group-hover:border-primary/20 group-hover:text-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* 3. ACTION LAYER (Sovereign Buttons) */}
        <div className="mt-auto border-t border-border/40 p-8 bg-background/20 backdrop-blur-sm flex items-center justify-between">
           <button 
             onClick={handleOpenSpecs}
             className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all flex items-center gap-2 group/btn"
           >
              {dictionary.label_objective} 
              <ArrowUpRight size={14} className="transition-transform group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1" />
           </button>

           {project.liveUrl && project.liveUrl !== '#' && (
             <Link 
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              /**
               * @pilar VII: Sovereign Flip
               * El botón invierte colores según el tema para máximo contraste.
               */
              className="flex items-center gap-3 rounded-full bg-foreground px-8 py-3 text-[10px] font-bold text-background uppercase tracking-[0.2em] transition-all hover:bg-primary hover:text-white shadow-2xl active:scale-95"
             >
               <ExternalLink size={14} strokeWidth={2.5} />
               {dictionary.label_live_demo}
             </Link>
           )}
        </div>

        {/* Sello de Identidad Cromática del Proyecto */}
        <div 
          className="absolute bottom-0 left-0 h-1 w-full transition-all duration-700 opacity-20 group-hover:opacity-100"
          style={{ backgroundColor: project.branding.primary_color }} 
        />
      </motion.article>

      <AnimatePresence>
        {isModalOpen && (
          <ProjectTechModal 
            data={project} 
            onClose={handleCloseSpecs} 
            dictionary={dictionary} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
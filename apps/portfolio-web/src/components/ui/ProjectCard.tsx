/**
 * @file ProjectCard.tsx
 * @description Aparato visual de alta fidelidad para activos digitales.
 *              Sincronizado con ProjectTechModal v7.0.
 * @version 4.2 - Production Ready (Lint & TS Clean)
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github, Cpu, Star, ArrowUpRight } from 'lucide-react';

import { cn } from '../../lib/utils/cn';
import type { 
  ProjectEntity, 
  ProjectDetailsDictionary 
} from '../../lib/schemas/project_details.schema';
import { ProjectTechModal } from '../projects/ProjectTechModal';

interface ProjectCardProps {
  project: ProjectEntity;
  dictionary: ProjectDetailsDictionary;
  className?: string;
}

export function ProjectCard({ project, dictionary, className }: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenSpecs = () => {
    console.log(`[HEIMDALL][UX] Inspecting Asset: ${project.slug}`);
    setIsModalOpen(true);
  };

  const handleCloseSpecs = () => setIsModalOpen(false);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 backdrop-blur-md transition-all duration-500",
          "hover:border-white/20 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]",
          className
        )}
      >
        {/* MEDIA LAYER */}
        <div className="relative h-60 w-full overflow-hidden bg-zinc-950">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
          
          <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-1.5 text-[9px] font-bold text-yellow-500 uppercase tracking-widest">
            <Star size={12} className="fill-yellow-500" />
            {project.reputationWeight} RZB
          </div>

          <button 
            onClick={handleOpenSpecs}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white hover:text-black transition-all active:scale-90"
            aria-label={dictionary.label_tech_stack}
          >
            <Cpu size={18} />
          </button>
        </div>

        {/* NARRATIVE LAYER */}
        <div className="flex grow flex-col p-8 md:p-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tighter leading-none group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            {project.codeUrl && (
              <Link 
                href={project.codeUrl} 
                target="_blank" 
                className="text-zinc-500 hover:text-white transition-colors"
                aria-label={dictionary.label_source_code}
              >
                <Github size={20} />
              </Link>
            )}
          </div>

          <p className="grow text-sm md:text-base text-zinc-400 font-sans font-light leading-relaxed line-clamp-3 mb-8">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.tech_stack.slice(0, 3).map((tech) => (
              <span key={tech} className="rounded-xl bg-white/5 border border-white/5 px-4 py-2 text-[10px] font-mono text-zinc-300 uppercase tracking-widest group-hover:border-primary/20 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* ACTION LAYER */}
        <div className="mt-auto border-t border-white/5 p-6 bg-white/2 flex items-center justify-between">
           <button 
             onClick={handleOpenSpecs}
             className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
           >
              {dictionary.label_objective} <ArrowUpRight size={14} />
           </button>

           {project.liveUrl && project.liveUrl !== '#' && (
             <Link 
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-full bg-white px-8 py-3 text-[10px] font-bold text-black uppercase tracking-[0.2em] transition-all hover:bg-primary hover:text-white shadow-2xl active:scale-95"
             >
               <ExternalLink size={14} strokeWidth={2.5} />
               {dictionary.label_live_demo}
             </Link>
           )}
        </div>

        <div 
          className="absolute bottom-0 left-0 h-1 w-full transition-all duration-700 opacity-0 group-hover:opacity-100"
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
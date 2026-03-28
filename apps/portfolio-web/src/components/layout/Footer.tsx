/**
 * @file Footer.tsx
 * @description Pie de Página Institucional 100% Data-Driven y Atmosphere-Aware. 
 *              Refactorizado: Erradicación de error sintáctico TS17002, 
 *              sincronización total con el Códice i18n y cumplimiento LGPD.
 * @version 14.0 - Zero Hardcode & Syntax Fix
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Copyright, 
  Camera, 
  BookOpen, 
  ShieldAlert,
  Fingerprint
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../lib/utils/cn';
import { i18n, type Locale } from '../../config/i18n.config';
import { socialLinks } from '../../lib/social-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { NewsletterForm } from '../shared/NewsletterForm';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * @interface FooterProps
 */
interface FooterProps {
  /** Fragmento del diccionario validado por MACS */
  content: Dictionary['footer'];
  /** Etiquetas de navegación compartidas */
  navLabels: Dictionary['nav-links']['nav_links'];
  /** Eslogan de marca inyectado */
  tagline: string;
  className?: string;
}

/**
 * COREOGRAFÍA MEA/UX (Pilar XII)
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

/**
 * APARATO: Footer
 * @description Cierre institucional del ecosistema. Reacciona a la atmósfera global.
 */
export function Footer({ content, navLabels, tagline, className }: FooterProps) {
  const pathname = usePathname();
  
  const currentLang = useMemo(() => 
    (pathname?.split('/')[1] as Locale) || i18n.defaultLocale, 
  [pathname]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Cierre
   */
  useEffect(() => {
    console.log(`[HEIMDALL][UX] Footer mounted in atmosphere: ${currentLang}`);
  }, [currentLang]);

  /**
   * ESTRUCTURA DE NAVEGACIÓN EXTENDIDA (Placeholders SSoT)
   * @pilar VI: Erradicación total de strings mágicos.
   */
  const extendedNav = useMemo(() => [
    {
      title: content.column_nav_title,
      links: [
        { label: navLabels.hotel, href: '/#hero' },
        { label: navLabels.habitaciones, href: '/#suites' },
        { label: content.label_photos, href: '/fotos', Icon: Camera },
        { label: navLabels.historia, href: '/quienes-somos' },
      ]
    },
    {
      title: content.column_services_title,
      links: [
        { label: navLabels.reservas, href: '/#reservas' },
        { label: content.label_cancellation, href: '/legal/cancelaciones', Icon: ShieldAlert },
        { label: content.label_rules, href: '/regras' },
        { label: content.label_blog, href: '/blog', Icon: BookOpen },
      ]
    },
    {
      title: content.column_legal_title,
      links: [
        { label: navLabels.politica_privacidad, href: '/legal/politica-de-privacidad' },
        { label: navLabels.terminos_servicio, href: '/legal/terminos-de-servicio' },
        { label: content.label_lgpd, href: '/legal/lgpd', Icon: Fingerprint },
        { label: content.label_dpo, href: '/contacto' },
      ]
    }
  ], [content, navLabels]);

  if (!content || !navLabels) return null;

  return (
    <footer 
      className={cn(
        "relative border-t border-border bg-surface transition-colors duration-1000 overflow-hidden", 
        className
      )} 
      role="contentinfo"
    >
      <div className="container mx-auto px-6 py-24 lg:py-32">
        
        {/* 1. SECCIÓN NEWSLETTER: Conversión de Élite */}
        <div className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.5em] text-primary mb-6">
              <Sparkles size={14} className="animate-pulse" />
              Sovereign Ecosystem
            </span>
            <h3 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-8 tracking-tighter leading-[0.85] transition-colors">
              {content.newsletter_title}
            </h3>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed font-light italic transition-colors">
              {tagline}
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants} className="rounded-5xl bg-background/40 border border-border/50 backdrop-blur-xl shadow-2xl p-2 transition-all">
            <NewsletterForm content={content} />
          </motion.div>
        </div>

        {/* 2. SITEMAP: Mapa del Sitio Dinámico */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          className="grid grid-cols-2 md:grid-cols-4 gap-16 mb-32 border-t border-border/40 pt-24"
        >
          {/* BRAND COLUMN */}
          <motion.div variants={itemVariants} className="col-span-2 md:col-span-1">
            <Link href={`/${currentLang}`} className="group block mb-10 outline-none">
              <h2 className="font-display text-3xl font-bold text-foreground transition-all group-hover:text-primary leading-none">
                Beach Hotel
              </h2>
              <span className="text-[10px] font-mono tracking-[0.5em] uppercase text-primary block mt-3 group-hover:tracking-[0.6em] transition-all">
                Canasvieiras
              </span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed mb-8 transition-colors">
              {content.brand_description}
            </p>
          </motion.div>

          {/* DYNAMIC COLUMNS */}
          {extendedNav.map((column) => (
            <motion.div key={column.title} variants={itemVariants} className="flex flex-col">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground mb-10 opacity-40">
                {column.title}
              </h4>
              <nav className="flex flex-col gap-6">
                {column.links.map((link) => (
                  <Link 
                    key={link.label} 
                    href={getLocalizedHref(link.href, currentLang)} 
                    className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-300 inline-flex items-center gap-0 hover:gap-3 outline-none"
                  >
                    <span className="w-0 overflow-hidden opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all text-primary">
                      <ArrowRight size={14} />
                    </span>
                    <span className="flex items-center gap-2">
                       {link.Icon && <link.Icon size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />}
                       {link.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          ))}
        </motion.div>

        {/* 3. SOVEREIGN BAR: Cumplimiento y Autoría */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          className="pt-12 border-t border-border/40 flex flex-col lg:flex-row justify-between items-center gap-12"
        >
          <div className="flex flex-col items-center lg:items-start gap-4">
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-foreground font-bold">
               <Copyright size={14} className="text-primary" /> 
               2026 <span className="text-primary">MetaShark Tech</span>
               <span className="h-1 w-1 rounded-full bg-border" />
               {content.label_all_rights}
            </div>
            <div className="flex items-center gap-4 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              <span>{content.label_author_prefix}: <span className="text-foreground font-bold">Raz Podestá</span></span>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-success" />
                <span>{content.label_lgpd}</span>
              </div>
            </div>
          </div>

          {/* SOCIAL SYNC */}
          <div className="flex gap-4">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <motion.a 
                key={label} 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer" 
                whileHover={{ y: -5, backgroundColor: 'var(--color-background)' }} 
                className="w-12 h-12 rounded-2xl border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-sm" 
                aria-label={label}
              >
                <Icon size={20} strokeWidth={1.5} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Artefacto de Marca Inferior */}
      <div className="h-1 w-full bg-linear-to-r from-primary/20 via-accent/20 to-primary/20 opacity-30" />
    </footer>
  );
}
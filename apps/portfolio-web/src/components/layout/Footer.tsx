/**
 * @file apps/portfolio-web/src/components/layout/Footer.tsx
 * @description Pie de Página Institucional del Ecosistema (Oxygen Hub).
 *              Refactorizado: Sincronización total con el mapa de rutas reales,
 *              erradicación de links huérfanos, telemetría Heimdall v2.0 
 *              y cumplimiento estricto del estándar Day-First.
 * @version 16.0 - Route Synchronized & Forensic Enabled
 * @author Raz Podestá -  MetaShark Tech
 */

'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Copyright, 
  BookOpen, 
  Compass,
  Fingerprint,
  Activity,
  type LucideIcon
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe)
 * @pilar V: Adherencia Arquitectónica.
 */
import { cn } from '../../lib/utils/cn';
import { useUIStore } from '../../lib/store/ui.store';
import { i18n, type Locale, isValidLocale } from '../../config/i18n.config';
import { socialLinks } from '../../lib/social-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { NewsletterForm } from '../shared/NewsletterForm';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * @interface FooterProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface FooterProps {
  content: Dictionary['footer'];
  newsletterContent: Dictionary['newsletter_form'];
  navLabels: Dictionary['nav-links']['nav_links'];
  tagline: string;
  className?: string;
}

interface ExtendedNavLink {
  label: string;
  href: string;
  Icon?: LucideIcon;
}

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

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
 * @description Cierre institucional sincronizado con la atmósfera global y el Tenant.
 */
export function Footer({ 
  content, 
  newsletterContent, 
  navLabels, 
  tagline, 
  className 
}: FooterProps) {
  const pathname = usePathname();
  const mountTime = useRef<number>(0);
  
  // Selección quirúrgica del contexto de propiedad
  const tenantId = useUIStore((s) => s.session?.tenantId);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Cierre
   * @description Registra la integridad del montaje del layout.
   */
  useEffect(() => {
    mountTime.current = performance.now();
    const duration = (performance.now() - mountTime.current).toFixed(4);
    console.log(
      `${C.magenta}${C.bold}[DNA][LAYOUT]${C.reset} Footer synchronized | ` +
      `Atmosphere: ${C.cyan}${pathname}${C.reset} | Lat: ${duration}ms`
    );
  }, [pathname]);

  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    return isValidLocale(segments[1]) ? (segments[1] as Locale) : i18n.defaultLocale;
  }, [pathname]);

  /**
   * MAPA DE NAVEGACIÓN REAL (Sincronizado con App Router)
   * @description Solo incluimos rutas que existen físicamente en el proyecto.
   */
  const footerNavigation = useMemo(() => [
    {
      title: content.column_nav_title,
      links: [
        { label: navLabels.hotel, href: '/#hero' },
        { label: navLabels.paquetes, href: '/paquetes', Icon: Compass },
        { label: navLabels.historia, href: '/quienes-somos' },
        { label: 'Missão e Visão', href: '/mision-y-vision' }, // i18n label manual hasta sync de schema
      ]
    },
    {
      title: content.column_services_title,
      links: [
        { label: navLabels.reservas, href: '/#reservas' },
        { label: content.label_blog, href: '/blog', Icon: BookOpen },
        { label: navLabels.contacto, href: '/contacto' },
      ]
    },
    {
      title: content.column_legal_title,
      links: [
        { label: navLabels.politica_privacidad, href: '/legal/politica-de-privacidad' },
        { label: navLabels.terminos_servicio, href: '/legal/terminos-de-servicio' },
        { label: content.label_lgpd, href: '/legal/politica-de-privacidad', Icon: Fingerprint },
      ]
    }
  ], [content, navLabels]);

  if (!content || !newsletterContent || !navLabels) return null;

  return (
    <footer 
      className={cn(
        "relative border-t border-border bg-surface transition-colors duration-1000 overflow-hidden", 
        className
      )} 
      role="contentinfo"
    >
      <div className="container mx-auto px-6 py-24 lg:py-32">
        
        {/* --- 1. SECCIÓN DE CAPTACIÓN SOBERANA --- */}
        <div className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}>
            <span className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.5em] text-primary mb-6">
              <Sparkles size={14} className="animate-pulse" />
              Sovereign Ecosystem
            </span>
            <h3 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-8 tracking-tighter leading-[0.85] transition-colors">
              {newsletterContent.title}
            </h3>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed font-light italic transition-colors">
              {tagline}
            </p>
          </motion.div>

          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={itemVariants} 
            className="rounded-5xl bg-background/40 border border-border/50 backdrop-blur-xl shadow-2xl p-2 transition-all transform-gpu"
          >
            <NewsletterForm content={newsletterContent} />
          </motion.div>
        </div>

        {/* --- 2. SITEMAP REAL (Data-Driven) --- */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          className="grid grid-cols-2 md:grid-cols-4 gap-16 mb-32 border-t border-border/40 pt-24"
        >
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
            {/* Status Signal sutil */}
            <div className="flex items-center gap-3 text-[9px] font-mono font-bold text-success uppercase tracking-widest opacity-40">
               <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
               Node Online
            </div>
          </motion.div>

          {footerNavigation.map((column) => (
            <motion.div key={column.title} variants={itemVariants} className="flex flex-col">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground mb-10 opacity-40">
                {column.title}
              </h4>
              <nav className="flex flex-col gap-6" role="navigation">
                {column.links.map((link: ExtendedNavLink) => {
                  const localizedHref = getLocalizedHref(link.href, currentLang);
                  const isCurrent = pathname === localizedHref;
                  
                  return (
                    <Link 
                      key={link.label} 
                      href={localizedHref} 
                      aria-current={isCurrent ? 'page' : undefined}
                      className={cn(
                        "group text-sm text-muted-foreground hover:text-foreground transition-all duration-300 inline-flex items-center gap-0 hover:gap-3 outline-none",
                        isCurrent && "text-primary font-bold"
                      )}
                    >
                      <span className={cn(
                        "w-0 overflow-hidden opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all text-primary",
                        isCurrent && "w-4 opacity-100"
                      )}>
                        <ArrowRight size={14} />
                      </span>
                      <span className="flex items-center gap-2 transition-all">
                         {link.Icon && <link.Icon size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />}
                         {link.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          ))}
        </motion.div>

        {/* --- 3. BARRA DE CUMPLIMIENTO Y TELEMETRÍA --- */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          className="pt-12 border-t border-border/40 flex flex-col lg:flex-row justify-between items-center gap-12"
        >
          <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-foreground font-bold">
               <Copyright size={14} className="text-primary" /> 
               2026 <span className="text-primary">MetaShark Tech</span>
               <span className="h-1 w-1 rounded-full bg-border" />
               {content.label_all_rights}
            </div>
            <div className="flex items-center gap-5 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              <span>{content.label_author_prefix}: <span className="text-foreground font-bold">Raz Podestá</span></span>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-success" />
                <span>{content.label_lgpd}</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2 opacity-50">
                 <Activity size={12} />
                 <span>Tenant: {tenantId ? tenantId.substring(0, 8) : 'ROOT'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <motion.a 
                key={label} 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer" 
                whileHover={{ y: -5, backgroundColor: 'var(--color-surface)' }} 
                className="w-12 h-12 rounded-2xl border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-sm active:scale-95" 
                aria-label={label}
              >
                <Icon size={20} strokeWidth={1.5} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sello de Marca (Atmosphere Aware) */}
      <div className="h-1 w-full bg-linear-to-r from-primary/20 via-accent/20 to-primary/20 opacity-30" />
    </footer>
  );
}
// RUTA: apps/portfolio-web/src/components/layout/Footer.tsx

/**
 * @file Footer Institucional (Boutique Hospitality)
 * @version 6.0 - Semantic Theming & Branding Resilient
 * @description Pie de página optimizado para entornos de hospitalidad. 
 *              Utiliza composición para delegar formularios y emplea tokens semánticos.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils/cn';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';
import { socialLinks } from '../../lib/social-links';
import { footerNavStructure } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../config/i18n.config';

interface FooterProps {
  content: Dictionary['footer'];
  navLabels: Dictionary['nav-links']['nav_links'];
  tagline: string;
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function Footer({ content, navLabels, tagline, className }: FooterProps) {
  const pathname = usePathname();
  const currentLang = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className={cn("border-t border-border bg-background text-muted-foreground", className)}
    >
      <div className="container mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Branding Section */}
          <motion.div variants={itemVariants} className="md:col-span-4 space-y-4">
            <Link href={`/${currentLang}`} className="block">
              <h2 className="font-display text-4xl text-foreground">Beach Hotel</h2>
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-primary">Canasvieiras</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">{tagline}</p>
          </motion.div>

          {/* Dynamic Navigation Grid */}
          {footerNavStructure.map((column) => (
            <motion.div variants={itemVariants} key={column.columnKey} className="md:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-6">
                {content[column.columnKey as keyof typeof content]}
              </h3>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      href={getLocalizedHref(link.href, currentLang)}
                      className="text-sm hover:text-primary transition-colors flex items-center gap-2"
                    >
                      {link.Icon && <link.Icon size={14} />}
                      {navLabels[link.labelKey as keyof typeof navLabels]}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div variants={itemVariants} className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs text-muted-foreground">
            {content.rights_reserved} | {content.made_by}
          </div>
          <div className="flex gap-4">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all"
                aria-label={label}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}